<script setup lang="ts">
import { computed, nextTick, ref, shallowReactive, type Ref } from 'vue';
import MPageEditorBlock, {
  type PageEditorDraft
} from '@/editors/page/MPageEditorBlock.vue';
import {
  createPageEditorBridge,
  normalizePageEditorCapabilities,
  pageReferenceKey,
  type PageEditorBridge,
  type PageEditorOpenRequest,
  type PageEditorResult,
  type PageReference
} from '@/editors/pageEditor';
import { formatPageReferenceIssue, validatePageReferences } from '@/editors/pageReferenceValidator';
import {
  PageEditorCoordinator,
  type SuspendedPageDialogChain
} from '@/editors/pageDialogCoordinator';
import {
  createPage,
  formatMokelayApiError,
  getPage,
  getSystemPage,
  updatePage,
  type MokelayPage
} from '@/services/pagesApi';
import {
  generatePageSlug,
  PAGE_SLUG_HINT,
  PAGE_SLUG_MAX_LENGTH,
  validatePageSlug
} from 'mokelay-components/pages';

type PageEditorFrame = {
  id: string;
  intent: 'create' | 'edit' | 'ephemeral';
  target?: PageReference;
  request: PageEditorOpenRequest;
  phase: 'loading' | 'ready' | 'saving' | 'load-error' | 'save-error';
  mode: 'edit' | 'preview';
  canPersist: boolean;
  canCreateSubPage: boolean;
  appUuid?: string;
  pageSlug: string;
  baseline: PageEditorDraft | null;
  draft: PageEditorDraft;
  dirty: boolean;
  error: string;
  restoreFocus?: HTMLElement;
  suspendedDialogs: SuspendedPageDialogChain;
};

type PageEditorBlockHandle = {
  flush: () => Promise<PageEditorDraft>;
};

const dialogRef = ref<HTMLDialogElement | null>(null);
const frames = ref([]) as Ref<PageEditorFrame[]>;
const blockRefs = new Map<string, PageEditorBlockHandle>();
const bridges = new Map<string, PageEditorBridge>();
const coordinator = new PageEditorCoordinator<PageEditorFrame, PageEditorResult>(() => frames.value);
let frameSequence = 0;

const activeFrame = computed(() => coordinator.activeFrame);

function createFrameId() {
  frameSequence += 1;
  return `page-editor-frame-${frameSequence}`;
}

function emptyDraft(name = '未命名子页面'): PageEditorDraft {
  return {
    name,
    blocks: [{
      type: 'paragraph',
      data: { text: '开始编排子页面内容。' }
    }],
    dataSources: []
  };
}

function cloneDraft(draft: PageEditorDraft): PageEditorDraft {
  return JSON.parse(JSON.stringify(draft)) as PageEditorDraft;
}

function pageToDraft(page: MokelayPage): PageEditorDraft {
  return {
    name: page.name,
    blocks: page.blocks,
    dataSources: page.dataSources ?? []
  };
}

function isSameDraft(left: PageEditorDraft, right: PageEditorDraft | null) {
  if (!right) return false;
  return JSON.stringify(left) === JSON.stringify(right);
}

function getFrameAncestry(frame: PageEditorFrame) {
  const ancestry = [...frame.request.ancestors];
  if (frame.target) ancestry.push(frame.target);
  return ancestry;
}

function getFrameBridge(frame: PageEditorFrame) {
  const existing = bridges.get(frame.id);
  if (existing) return existing;
  const bridge = createPageEditorBridge(
    open,
    () => getFrameAncestry(frame),
    () => ({
      canPersist: frame.canPersist,
      canCreateSubPage: frame.canCreateSubPage,
      ...(frame.appUuid ? { appUuid: frame.appUuid } : {})
    })
  );
  bridges.set(frame.id, bridge);
  return bridge;
}

function setBlockRef(frameId: string, value: unknown) {
  if (value && typeof value === 'object' && 'flush' in value) {
    blockRefs.set(frameId, value as PageEditorBlockHandle);
  } else {
    blockRefs.delete(frameId);
  }
}

function setFrameRoot(frameId: string, value: unknown) {
  coordinator.registerFrameRoot(frameId, value instanceof HTMLElement ? value : null);
}

async function ensureDialogOpen() {
  await nextTick();
  if (dialogRef.value && !dialogRef.value.open) {
    dialogRef.value.showModal();
  }
}

async function open(request: PageEditorOpenRequest): Promise<PageEditorResult> {
  const parentFrame = activeFrame.value;
  if (parentFrame?.phase === 'saving') {
    throw new Error('当前页面正在保存，请保存完成后再编排子页面。');
  }

  if (request.intent === 'open') {
    const targetKey = pageReferenceKey(request.target);
    if (!request.target.uuid || request.ancestors.some((item) => pageReferenceKey(item) === targetKey)) {
      throw new Error(`页面 ${request.target.uuid || '未知页面'} 已在当前编排路径中，不能形成循环引用。`);
    }
  }

  const id = createFrameId();
  const createIntent = request.intent === 'create';
  const requestedCapabilities = normalizePageEditorCapabilities(request.capabilities);
  const systemTarget = request.intent === 'open' && request.target.source === 'system';
  const canPersist = requestedCapabilities.canPersist
    && (parentFrame?.canPersist ?? true)
    && !systemTarget;
  const canCreateSubPage = canPersist
    && requestedCapabilities.canCreateSubPage
    && (parentFrame?.canCreateSubPage ?? true);
  if (createIntent && !canCreateSubPage) {
    throw new Error('当前为临时编排会话，不能创建子页面。');
  }
  const ephemeral = !createIntent && !canPersist;
  const overlayState = coordinator.captureOverlayState(parentFrame?.id);
  const frame = shallowReactive<PageEditorFrame>({
    id,
    intent: createIntent ? 'create' : ephemeral ? 'ephemeral' : 'edit',
    ...(request.intent === 'open' ? { target: request.target } : {}),
    request,
    phase: createIntent ? 'ready' : 'loading',
    mode: 'edit',
    canPersist,
    canCreateSubPage,
    ...(requestedCapabilities.appUuid ? { appUuid: requestedCapabilities.appUuid } : {}),
    pageSlug: createIntent ? generatePageSlug() : '',
    baseline: null,
    draft: emptyDraft(createIntent ? request.suggestedName || '未命名子页面' : ''),
    dirty: createIntent,
    error: '',
    ...overlayState
  });
  const result = coordinator.push(frame);
  await ensureDialogOpen();

  if (!createIntent) {
    void loadFrame(frame);
  }

  return await result;
}

async function loadFrame(frame: PageEditorFrame) {
  if (!frame.target) return;
  frame.phase = 'loading';
  frame.error = '';
  try {
    const page = frame.target.source === 'system'
      ? await getSystemPage(frame.target.uuid)
      : await getPage(frame.target.uuid);
    if (!frames.value.includes(frame)) return;
    const draft = pageToDraft(page);
    frame.baseline = cloneDraft(draft);
    frame.draft = draft;
    frame.dirty = false;
    frame.phase = 'ready';
  } catch (error) {
    if (!frames.value.includes(frame)) return;
    frame.phase = 'load-error';
    frame.error = formatMokelayApiError(error, '页面加载失败。');
  }
}

function updateDraft(frame: PageEditorFrame, draft: PageEditorDraft) {
  frame.draft = cloneDraft(draft);
  frame.dirty = frame.intent === 'create' || !isSameDraft(frame.draft, frame.baseline);
  if (frame.phase === 'save-error') {
    frame.phase = 'ready';
    frame.error = '';
  }
}

function updatePageSlug(frame: PageEditorFrame, value: string) {
  frame.pageSlug = value;
  frame.dirty = true;
  if (frame.phase === 'save-error') {
    frame.phase = 'ready';
    frame.error = '';
  }
}

async function flushFrame(frame: PageEditorFrame) {
  const block = blockRefs.get(frame.id);
  if (!block || frame.mode !== 'edit') return frame.draft;
  const draft = await block.flush();
  updateDraft(frame, draft);
  return frame.draft;
}

async function togglePreview(frame: PageEditorFrame) {
  if (frame.phase !== 'ready' && frame.phase !== 'save-error') return;
  if (frame.mode === 'edit') {
    await flushFrame(frame);
    frame.mode = 'preview';
  } else {
    frame.mode = 'edit';
  }
}

async function saveFrame(frame: PageEditorFrame) {
  if (!frame.canPersist || frame.phase === 'saving') return;
  frame.error = '';
  // Disable the current frame before EditorJS flushes so a slow flush cannot
  // race a nested editor push and later remove a non-top frame.
  frame.phase = 'saving';
  try {
    await flushFrame(frame);
    const name = frame.draft.name.trim();
    if (!name) {
      throw new Error('请输入页面标题。');
    }

    const slug = frame.intent === 'create'
      ? validatePageSlug(frame.pageSlug)
      : null;
    if (slug && !slug.valid) {
      throw new Error(slug.message);
    }
    if (slug?.valid) {
      frame.pageSlug = slug.value;
    }

    const validation = validatePageReferences(frame.draft.blocks, getFrameAncestry(frame));
    if (!validation.valid) {
      throw new Error(validation.issues[0]
        ? formatPageReferenceIssue(validation.issues[0])
        : '页面引用配置无效。');
    }

    const payload = {
      name,
      blocks: frame.draft.blocks,
      dataSources: frame.draft.dataSources
    };
    const page = frame.intent === 'create'
      ? await createPage({
          ...payload,
          uuid: slug!.value,
          ...(frame.appUuid ? { appUuid: frame.appUuid } : {})
        })
      : await updatePage(frame.target!.uuid, payload);
    await finishFrame(frame, {
      status: 'saved',
      created: frame.intent === 'create',
      page
    });
  } catch (error) {
    if (!frames.value.includes(frame)) return;
    frame.phase = 'save-error';
    frame.error = formatMokelayApiError(error, '页面保存失败。');
  }
}

async function cancelFrame(frame: PageEditorFrame) {
  if (frame.phase === 'saving') return;
  if (
    frame.mode === 'edit' &&
    (frame.phase === 'ready' || frame.phase === 'save-error')
  ) {
    try {
      await flushFrame(frame);
    } catch (error) {
      frame.phase = 'save-error';
      frame.error = error instanceof Error && error.message
        ? error.message
        : '无法读取当前编辑内容，页面未关闭。';
      return;
    }
  }
  if (frame.dirty) {
    const confirmed = window.confirm('放弃当前页面未保存的修改？');
    if (!confirmed) return;
  }
  await finishFrame(frame, frame.intent === 'ephemeral'
    ? { status: 'closed' }
    : { status: 'cancelled' });
}

async function finishFrame(frame: PageEditorFrame, result: PageEditorResult) {
  if (!coordinator.isTop(frame)) {
    frame.phase = 'save-error';
    frame.error = '页面编排栈状态已变化，请先关闭当前子页面后重试。';
    return;
  }
  blockRefs.delete(frame.id);
  bridges.delete(frame.id);
  await coordinator.pop(frame, result, async () => {
    if (!frames.value.length && dialogRef.value?.open) {
      dialogRef.value.close();
    }
    await nextTick();
  });
}

function handleDialogCancel(event: Event) {
  event.preventDefault();
  if (activeFrame.value) void cancelFrame(activeFrame.value);
}

defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialogRef"
    class="page-editor-host"
    data-testid="page-editor-host"
    @cancel="handleDialogCancel"
  >
    <section v-if="activeFrame" class="page-editor-host__panel">
      <header class="page-editor-host__header">
        <div class="page-editor-host__title">
          <span>{{ activeFrame.intent === 'create' ? '新建子页面' : activeFrame.intent === 'ephemeral' ? '临时编排页面' : '编排子页面' }}</span>
          <strong>{{ activeFrame.draft.name || activeFrame.target?.uuid }}</strong>
          <small v-if="frames.length > 1">第 {{ frames.length }} 层</small>
          <small v-if="activeFrame.intent === 'ephemeral'" data-testid="page-editor-ephemeral-notice">临时编排，不会保存</small>
          <small v-if="activeFrame.dirty">未保存</small>
        </div>

        <div class="page-editor-host__actions">
          <button
            type="button"
            data-testid="page-editor-preview-toggle"
            :disabled="activeFrame.phase !== 'ready' && activeFrame.phase !== 'save-error'"
            @click="togglePreview(activeFrame)"
          >
            {{ activeFrame.mode === 'preview' ? '返回编辑' : '预览草稿' }}
          </button>
          <button
            v-if="activeFrame.canPersist"
            type="button"
            class="page-editor-host__save"
            data-testid="page-editor-save"
            :disabled="activeFrame.phase !== 'ready' && activeFrame.phase !== 'save-error'"
            @click="saveFrame(activeFrame)"
          >
            {{ activeFrame.phase === 'saving' ? '保存中…' : '保存' }}
          </button>
          <button
            type="button"
            data-testid="page-editor-cancel"
            :disabled="activeFrame.phase === 'saving'"
            @click="cancelFrame(activeFrame)"
          >
            {{ activeFrame.intent === 'ephemeral' ? '关闭' : '取消' }}
          </button>
        </div>
      </header>

      <main class="page-editor-host__body">
        <div v-if="activeFrame.phase === 'loading'" class="page-editor-host__state" data-testid="page-editor-loading">
          页面加载中…
        </div>
        <div v-else-if="activeFrame.phase === 'load-error'" class="page-editor-host__state page-editor-host__state--error" data-testid="page-editor-load-error">
          <p>{{ activeFrame.error }}</p>
          <button type="button" data-testid="page-editor-retry" @click="loadFrame(activeFrame)">重试</button>
        </div>
        <p v-else-if="activeFrame.error" class="page-editor-host__error" data-testid="page-editor-save-error">
          {{ activeFrame.error }}
        </p>
        <div
          v-for="frame in frames"
          :key="frame.id"
          :ref="(value) => setFrameRoot(frame.id, value)"
          v-show="frame === activeFrame && frame.phase !== 'loading' && frame.phase !== 'load-error'"
          class="page-editor-host__frame"
          :data-page-editor-frame-id="frame.id"
          :data-page-editor-frame-active="frame === activeFrame ? 'true' : 'false'"
          :inert="frame === activeFrame ? undefined : true"
        >
          <label
            v-if="frame.intent === 'create'"
            class="page-editor-host__slug-field"
          >
            <span>页面标识</span>
            <input
              :value="frame.pageSlug"
              :maxlength="PAGE_SLUG_MAX_LENGTH"
              :disabled="frame.phase === 'saving' || frame.mode !== 'edit'"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="例如：customer_orders"
              data-testid="page-editor-slug-input"
              @input="updatePageSlug(frame, ($event.target as HTMLInputElement).value)"
            />
            <small>{{ PAGE_SLUG_HINT }}</small>
          </label>
          <MPageEditorBlock
            v-if="frame.phase !== 'loading' && frame.phase !== 'load-error'"
            :ref="(value) => setBlockRef(frame.id, value)"
            :page-uuid="frame.target?.uuid"
            :draft="frame.draft"
            :mode="frame.mode"
            :page-editor="getFrameBridge(frame)"
            @update:draft="updateDraft(frame, $event)"
          />
        </div>
      </main>
    </section>
  </dialog>
</template>

<style scoped>
.page-editor-host {
  width: 100vw;
  max-width: none;
  height: 100vh;
  max-height: none;
  margin: 0;
  border: 0;
  padding: 0;
  background: rgb(241 245 249);
}

.page-editor-host::backdrop {
  background: rgb(15 23 42 / 0.55);
}

.page-editor-host__panel {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.page-editor-host__header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgb(203 213 225);
  background: white;
  padding: 14px 20px;
}

.page-editor-host__title,
.page-editor-host__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-editor-host__title span,
.page-editor-host__title small {
  color: rgb(100 116 139);
  font-size: 13px;
}

.page-editor-host__actions button,
.page-editor-host__state button {
  border: 1px solid rgb(203 213 225);
  border-radius: 9px;
  background: white;
  padding: 8px 12px;
  color: rgb(30 41 59);
  cursor: pointer;
}

.page-editor-host__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.page-editor-host__actions .page-editor-host__save {
  border-color: rgb(13 148 136);
  background: rgb(13 148 136);
  color: white;
}

.page-editor-host__body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  padding: 18px;
}

.page-editor-host__frame {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}

.page-editor-host__slug-field {
  display: grid;
  grid-template-columns: minmax(90px, auto) minmax(220px, 1fr);
  align-items: center;
  gap: 6px 12px;
  border: 1px solid rgb(203 213 225);
  border-radius: 10px;
  background: white;
  padding: 12px 14px;
  color: rgb(51 65 85);
  font-size: 13px;
}

.page-editor-host__slug-field input {
  min-width: 0;
  border: 1px solid rgb(148 163 184);
  border-radius: 8px;
  padding: 8px 10px;
  color: rgb(15 23 42);
}

.page-editor-host__slug-field input:disabled {
  background: rgb(241 245 249);
  cursor: not-allowed;
}

.page-editor-host__slug-field small {
  grid-column: 2;
  color: rgb(100 116 139);
}

.page-editor-host__state {
  margin: auto;
  color: rgb(71 85 105);
  text-align: center;
}

.page-editor-host__state--error,
.page-editor-host__error {
  color: rgb(190 18 60);
}

.page-editor-host__error {
  margin: 0 0 12px;
  border: 1px solid rgb(253 164 175);
  border-radius: 9px;
  background: rgb(255 241 242);
  padding: 10px 12px;
}
</style>
