<script setup lang="ts">
import EditorJS, { type OutputData, type ToolSettings } from '@editorjs/editorjs';
import EditorJsColumns from '@calumk/editorjs-columns';
import Table from '@editorjs/table';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { getEditorComponentDefinition } from '@/editors/editorComponentRegistry';
import EditorPreviewBlock from '@/blocks/components/EditorPreviewBlock.vue';
import {
  finalizeEditorBlocksWithEvents,
  finalizeEditorOutputWithEvents,
  prepareEditorOutputWithEvents
} from '@/utils/blockEvents';
import {
  createPreviewBlockRuntime,
  PreviewBlockRuntimeKey,
  type BlockRuntimeHandle
} from '@/utils/previewBlockRuntime';
import {
  normalizePageDataSources,
  PageRuntimeContextKey,
  PageRuntimeDataKey,
  PageRuntimeVariableContextKey,
  resolvePageDataSources,
  type PageDataSourceConfig,
  type PageRuntimeContext,
  type PageRuntimeData
} from '@/utils/pageRuntimeContext';
import {
  getRegisteredPageVariableRuntimes,
  registerPageVariableRuntime,
  unregisterPageVariableRuntime,
  type BlockDataField,
  type BlockDataSource,
  type PageVariableSource,
  type VariableValueDataType,
  type VariableValueResolveContext
} from '@/utils/variableValue';

// MPage 作为容器块，既支持 EditorJS 编辑态，也支持组件化预览态。
export interface MPageProps {
  edit?: boolean;
  value?: OutputData['blocks'];
  pageId?: string;
  dataSources?: PageDataSourceConfig[];
  runtimeContext?: PageRuntimeContext;
  context?: PageRuntimeContext;
  onToolChange?: (payload: { edit: boolean; value: OutputData['blocks'] }) => void;
}

const props = withDefaults(defineProps<MPageProps>(), {
  edit: false,
  value: () => []
});

const emit = defineEmits<{
  (event: 'change', blocks: OutputData['blocks']): void;
  (event: 'close', result?: unknown): void;
}>();

const shouldRenderEditor = computed(() => props.edit);
let editor: EditorJS | null = null;
let isSyncingFromProps = false;
let skipNextPropSync = false;
let editorMutationObserver: MutationObserver | null = null;
let scheduledEditorSync: number | null = null;
// 缓存最近一次编辑器输出，用于编辑态与预览态切换时保留数据。
let editorDataCache: OutputData = buildOutput(props.value);

const { t, localeValue } = useI18n();
const holderRef = ref<HTMLElement | null>(null);
const previewBlocks = computed(() => (Array.isArray(props.value) ? props.value : []));
const pageRuntimeContext = computed<PageRuntimeContext>(() => props.runtimeContext ?? props.context ?? {});
const normalizedDataSources = computed(() => normalizePageDataSources(props.dataSources));
const pageRuntimeData = ref<PageRuntimeData>({});
const pageDataLoading = ref(false);
const pageDataError = ref('');
const parentPreviewRuntime = inject(PreviewBlockRuntimeKey, null);
const previewRuntime = parentPreviewRuntime ?? createPreviewBlockRuntime();
const pageVariableRuntimeContext = computed<VariableValueResolveContext>(() => {
  const pageId = getPageRuntimeId();
  const currentPage = {
    context: pageRuntimeContext.value,
    dataSources: pageRuntimeData.value,
    pageData: pageRuntimeData.value
  };
  return {
    pageId,
    context: pageRuntimeContext.value,
    dataSources: pageRuntimeData.value,
    pageData: pageRuntimeData.value,
    pages: {
      ...getRegisteredPageVariableRuntimes(),
      ...(pageId ? { [pageId]: currentPage } : {})
    },
    ...pageRuntimeData.value
  };
});
let pageDataLoadId = 0;

provide(PreviewBlockRuntimeKey, previewRuntime);
provide(PageRuntimeContextKey, pageRuntimeContext);
provide(PageRuntimeDataKey, computed(() => pageRuntimeData.value));
provide(PageRuntimeVariableContextKey, pageVariableRuntimeContext);

type EditorBlock = OutputData['blocks'][number];
type EditorColumnData = { blocks?: OutputData['blocks'] };

function getColumns(block: EditorBlock): EditorColumnData[] {
  const cols = (block.data as { cols?: unknown }).cols;
  if (!Array.isArray(cols)) return [];
  return cols.filter((col): col is EditorColumnData => typeof col === 'object' && col !== null);
}

function getColumnBlocks(column: EditorColumnData): OutputData['blocks'] {
  return Array.isArray(column.blocks) ? column.blocks : [];
}

function buildOutput(blocks: OutputData['blocks']): OutputData {
  return {
    blocks: finalizeEditorBlocksWithEvents(blocks)
  };
}

function inferDataType(value: unknown): VariableValueDataType {
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'object' && value !== null) return 'object';
  return 'string';
}

function inferBlockDataFields(data: Record<string, unknown>): BlockDataField[] {
  return Object.entries(data)
    .filter(([key, value]) => !key.startsWith('_') && value !== undefined)
    .map(([key, value]) => ({
      label: key,
      variable: key,
      dataType: inferDataType(value)
    }));
}

function getAvailableBlockDataSources(excludeBlockId?: string): BlockDataSource[] {
  const blocks = Array.isArray(editorDataCache.blocks) ? editorDataCache.blocks : [];
  return blocks.flatMap((block): BlockDataSource[] => {
    if (!block.id || block.id === excludeBlockId) return [];
    const definition = getEditorComponentDefinition(block.type);
    const data = typeof block.data === 'object' && block.data !== null
      ? block.data as Record<string, unknown>
      : {};
    const fields = definition?.getDataFields?.({ data, blockId: block.id }) ?? inferBlockDataFields(data);
    return [{
      blockId: block.id,
      blockType: block.type,
      blockLabel: `${block.type} / ${block.id}`,
      fields
    }];
  });
}

function getAvailablePageVariableSources(): PageVariableSource[] {
  const sourcesByPageId = new Map<string, PageVariableSource>();
  const currentPageId = getPageRuntimeId();

  if (currentPageId) {
    addPageVariableSource(sourcesByPageId, currentPageId, `${t('variableValue.variable.currentPage')} / ${currentPageId}`);
  }

  collectPageVariableSources(editorDataCache.blocks, sourcesByPageId);
  return [...sourcesByPageId.values()];
}

function addPageVariableSource(
  sourcesByPageId: Map<string, PageVariableSource>,
  pageId: string,
  pageLabel?: string
) {
  const normalizedPageId = pageId.trim();
  if (!normalizedPageId || sourcesByPageId.has(normalizedPageId)) return;

  sourcesByPageId.set(normalizedPageId, {
    pageId: normalizedPageId,
    pageLabel: pageLabel?.trim() || normalizedPageId
  });
}

function readPageIdReference(value: Record<string, unknown>) {
  return readStringProp(value, 'pageId') ||
    readStringProp(value, 'pageUUID') ||
    readStringProp(value, 'pageUuid') ||
    readStringProp(value, 'uuid');
}

function readStringProp(value: Record<string, unknown>, key: string) {
  const raw = value[key];
  return typeof raw === 'string' ? raw.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectPageVariableSources(value: unknown, sourcesByPageId: Map<string, PageVariableSource>) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectPageVariableSources(item, sourcesByPageId));
    return;
  }

  if (!isRecord(value)) return;

  if (value.type === 'MPage') {
    const data = isRecord(value.data) ? value.data : value;
    const pageId = readPageIdReference(data);
    if (pageId) {
      addPageVariableSource(sourcesByPageId, pageId, `MPage / ${pageId}`);
    }
  }

  if (value.action === 'open_dialog' || value.type === 'open_dialog') {
    const inputs = isRecord(value.inputs) ? value.inputs : value;
    const pageId = readPageIdReference(inputs);
    if (pageId) {
      addPageVariableSource(sourcesByPageId, pageId, `${t('variableValue.variable.dialogPage')} / ${pageId}`);
    }
  }

  if (value.source === 'MPage') {
    const pageId = readPageIdReference(value);
    if (pageId) {
      addPageVariableSource(sourcesByPageId, pageId, `MPage / ${pageId}`);
    }
  }

  Object.values(value).forEach((item) => collectPageVariableSources(item, sourcesByPageId));
}

async function saveEditorJsInstance(instance: EditorJS): Promise<OutputData | undefined> {
  await instance.isReady?.catch(() => undefined);

  const editorApi = instance as EditorJS & {
    save?: () => Promise<OutputData>;
    saver?: {
      save?: () => Promise<OutputData>;
    };
  };

  if (typeof editorApi.save === 'function') {
    return editorApi.save();
  }

  if (typeof editorApi.saver?.save === 'function') {
    return editorApi.saver.save();
  }

  if (import.meta.env.DEV) {
    console.warn('[Mokelay editor] EditorJS save API is not ready; using cached page data.');
  }

  return undefined;
}

// 当前通过 JSON 深比较 blocks，保证外部同步时能正确判断是否需要重建编辑器。
function isSameBlocks(left: OutputData['blocks'], right: OutputData['blocks']) {
  return JSON.stringify(left) === JSON.stringify(right);
}

// 将内部变更通知给外部，并标记下一次 props 同步跳过，避免循环更新。
function notifyChanges(blocks: OutputData['blocks']) {
  const payload = {
    edit: props.edit,
    value: blocks
  };
  props.onToolChange?.(payload);
  skipNextPropSync = true;
  emit('change', blocks);
}

async function syncFromEditorOutput(output: OutputData) {
  const previousBlocks = Array.isArray(editorDataCache.blocks) ? editorDataCache.blocks : ([] as OutputData['blocks']);
  const finalizedOutput = finalizeEditorOutputWithEvents(output);
  editorDataCache = finalizedOutput;

  if (!isSyncingFromProps && !isSameBlocks(previousBlocks, finalizedOutput.blocks)) {
    notifyChanges(finalizedOutput.blocks);
  }
}

function clearScheduledEditorSync() {
  if (scheduledEditorSync === null) return;
  window.clearTimeout(scheduledEditorSync);
  scheduledEditorSync = null;
}

function scheduleEditorSync() {
  if (!editor) return;

  clearScheduledEditorSync();
  scheduledEditorSync = window.setTimeout(async () => {
    scheduledEditorSync = null;
    if (!editor) return;

    try {
      const output = await saveEditorJsInstance(editor);
      if (output) {
        await syncFromEditorOutput(output);
      }
    } catch {
      // EditorJS can reject while a nested block is still mounting; the next DOM event will sync again.
    }
  }, 0);
}

function startEditorSyncListeners() {
  const holder = holderRef.value;
  if (!holder) return;

  stopEditorSyncListeners();
  editorMutationObserver = new MutationObserver(() => {
    scheduleEditorSync();
  });
  editorMutationObserver.observe(holder, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  });

  holder.addEventListener('input', scheduleEditorSync);
  holder.addEventListener('change', scheduleEditorSync);
  holder.addEventListener('click', scheduleEditorSync);
}

function stopEditorSyncListeners() {
  const holder = holderRef.value;
  editorMutationObserver?.disconnect();
  editorMutationObserver = null;
  clearScheduledEditorSync();

  holder?.removeEventListener('input', scheduleEditorSync);
  holder?.removeEventListener('change', scheduleEditorSync);
  holder?.removeEventListener('click', scheduleEditorSync);
}

async function mountEditor() {
  if (!holderRef.value || !shouldRenderEditor.value || editor) return;
  const columnTools: Record<string, ToolSettings> = {
    ...(createEditorTools({
      edit: true,
      getAvailableBlockDataSources,
      getAvailablePageVariableSources,
      previewRuntime
    }) as Record<string, ToolSettings>),
    table: {
      class: Table as unknown as ToolSettings['class'],
      inlineToolbar: true
    }
  };
  editor = new EditorJS({
    holder: holderRef.value,
    placeholder: t('editor.placeholder'),
    tools: {
      ...columnTools,
      columns: {
        class: EditorJsColumns as unknown as ToolSettings['class'],
        config: {
          EditorJsLibrary: EditorJS,
          tools: columnTools
        }
      }
    },
    data: prepareEditorOutputWithEvents(editorDataCache),
    i18n: {
      messages: getEditorJsI18nMessages(localeValue.value)
    },
    onChange: async () => {
      const currentEditor = editor;
      if (!currentEditor) return;
      const output = await saveEditorJsInstance(currentEditor);
      if (output) {
        await syncFromEditorOutput(output);
      }
    }
  });

  startEditorSyncListeners();
}

async function unmountEditor() {
  const currentEditor = editor;
  if (!currentEditor) return;
  editor = null;
  stopEditorSyncListeners();

  try {
    const output = await saveEditorJsInstance(currentEditor);
    editorDataCache = output ? finalizeEditorOutputWithEvents(output) : editorDataCache;
  } catch {
    // 销毁阶段若保存失败，回退到当前 props，避免丢失可用数据。
    editorDataCache = buildOutput(props.value);
  }

  currentEditor.destroy();
}

async function rebuildEditor() {
  await unmountEditor();
  await nextTick();
  await mountEditor();
}

async function saveEditor() {
  if (!editor) {
    return editorDataCache;
  }
  const output = finalizeEditorOutputWithEvents((await saveEditorJsInstance(editor)) ?? editorDataCache);
  editorDataCache = output;
  return output;
}

function getData() {
  return {
    blocks: previewBlocks.value
  };
}

function getCloseResult(value: unknown) {
  if (!isRecord(value)) return undefined;

  if (Object.prototype.hasOwnProperty.call(value, 'args')) {
    return value.args;
  }

  const inputs = isRecord(value.inputs) ? value.inputs : {};
  if (Object.prototype.hasOwnProperty.call(inputs, 'closeResult')) {
    return inputs.closeResult;
  }

  if (
    Object.prototype.hasOwnProperty.call(inputs, 'reason') ||
    Object.prototype.hasOwnProperty.call(inputs, 'result')
  ) {
    return {
      reason: typeof inputs.reason === 'string' && inputs.reason.trim() ? inputs.reason.trim() : 'success',
      ...(Object.prototype.hasOwnProperty.call(inputs, 'result') ? { result: inputs.result } : {})
    };
  }

  return undefined;
}

function close(invocation?: unknown) {
  const closeResult = getCloseResult(invocation);
  emit('close', closeResult);

  return {
    closed: true,
    ...(closeResult !== undefined ? { closeResult } : {})
  };
}

async function loadPageDataSources() {
  const requestId = pageDataLoadId + 1;
  pageDataLoadId = requestId;

  if (shouldRenderEditor.value || !normalizedDataSources.value.length) {
    pageRuntimeData.value = {};
    pageDataLoading.value = false;
    pageDataError.value = '';
    return;
  }

  pageDataLoading.value = true;
  pageDataError.value = '';

  try {
    const blocks = await previewRuntime.getBlockDataContext();
    const nextPageData = await resolvePageDataSources(normalizedDataSources.value, pageRuntimeContext.value, {
      variableContext: {
        ...pageVariableRuntimeContext.value,
        blocks,
        context: pageRuntimeContext.value,
        pageData: pageRuntimeData.value,
        dataSources: pageRuntimeData.value,
        ...pageRuntimeData.value
      }
    });
    if (requestId !== pageDataLoadId) return;
    pageRuntimeData.value = nextPageData;
  } catch (error) {
    if (requestId !== pageDataLoadId) return;
    pageRuntimeData.value = {};
    pageDataError.value = error instanceof Error && error.message
      ? error.message
      : '页面数据加载失败。';
  } finally {
    if (requestId === pageDataLoadId) {
      pageDataLoading.value = false;
    }
  }
}

const pageRuntimeInstance = {
  saveEditor,
  getData,
  close
};
let registeredPageVariableRuntimeId = '';
let registeredPageRuntimeId = '';

function getPageRuntimeId() {
  return typeof props.pageId === 'string' ? props.pageId.trim() : '';
}

function unregisterPageVariableRuntimeRegistration() {
  if (!registeredPageVariableRuntimeId) return;
  unregisterPageVariableRuntime(registeredPageVariableRuntimeId);
  registeredPageVariableRuntimeId = '';
}

function syncPageVariableRuntimeRegistration() {
  const nextId = getPageRuntimeId();
  if (registeredPageVariableRuntimeId && registeredPageVariableRuntimeId !== nextId) {
    unregisterPageVariableRuntimeRegistration();
  }

  if (!nextId) return;

  registeredPageVariableRuntimeId = nextId;
  registerPageVariableRuntime(nextId, {
    context: pageRuntimeContext.value,
    dataSources: pageRuntimeData.value,
    pageData: pageRuntimeData.value
  });
}

function createPageRuntimeHandle(id: string): BlockRuntimeHandle {
  return {
    id,
    type: 'MPage',
    instance: pageRuntimeInstance
  };
}

function unregisterPageRuntime() {
  if (!registeredPageRuntimeId) return;
  previewRuntime.unregisterBlock(registeredPageRuntimeId, pageRuntimeInstance);
  registeredPageRuntimeId = '';
}

function syncPageRuntimeRegistration() {
  const nextId = getPageRuntimeId();
  if (registeredPageRuntimeId === nextId) return;

  unregisterPageRuntime();
  if (!nextId) return;

  registeredPageRuntimeId = nextId;
  previewRuntime.registerBlock(nextId, createPageRuntimeHandle(nextId));
}

defineExpose({
  saveEditor,
  getData,
  close
});

onMounted(async () => {
  await mountEditor();
});

watch(
  () => props.pageId,
  () => {
    syncPageRuntimeRegistration();
  },
  { immediate: true }
);

watch(
  () => ({
    pageId: props.pageId,
    context: pageRuntimeContext.value,
    data: pageRuntimeData.value
  }),
  () => {
    syncPageVariableRuntimeRegistration();
  },
  { deep: true, immediate: true }
);

watch(
  () => props.value,
  async (blocks) => {
    // 本次更新由内部触发时，跳过反向同步，避免重复重建。
    if (skipNextPropSync) {
      skipNextPropSync = false;
      return;
    }

    const nextBlocks = Array.isArray(blocks) ? blocks : ([] as OutputData['blocks']);
    const cachedBlocks = Array.isArray(editorDataCache.blocks) ? editorDataCache.blocks : ([] as OutputData['blocks']);
    if (isSameBlocks(nextBlocks, cachedBlocks)) {
      return;
    }
    isSyncingFromProps = true;
    editorDataCache = buildOutput(nextBlocks);
    if (editor) {
      await rebuildEditor();
    }
    isSyncingFromProps = false;
  },
  { deep: true }
);

watch(localeValue, async () => {
  // 切换语言后重建 EditorJS，以刷新工具名称与界面文案。
  if (!editor) return;
  await rebuildEditor();
});

watch(shouldRenderEditor, async (enabled) => {
  if (enabled) {
    await nextTick();
    await mountEditor();
    return;
  }
  await unmountEditor();
});

watch(
  () => ({
    edit: props.edit,
    dataSources: normalizedDataSources.value,
    context: pageRuntimeContext.value
  }),
  () => {
    void loadPageDataSources();
  },
  { deep: true, immediate: true }
);

onBeforeUnmount(async () => {
  pageDataLoadId += 1;
  unregisterPageVariableRuntimeRegistration();
  unregisterPageRuntime();
  await unmountEditor();
});
</script>

<template>
  <div
    v-if="shouldRenderEditor"
    ref="holderRef"
    data-testid="editor-surface"
    class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 py-3 pr-3 pl-11 dark:border-slate-700 dark:bg-slate-950"
  ></div>
  <div v-else data-testid="preview-blocks" class="space-y-1">
    <p v-if="pageDataLoading" data-testid="page-data-loading-state" class="rounded border border-sky-300 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-500/60 dark:bg-sky-900/30 dark:text-sky-100">
      页面数据加载中...
    </p>
    <p v-else-if="pageDataError" data-testid="page-data-error-state" class="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/60 dark:bg-red-900/30 dark:text-red-100">
      {{ pageDataError }}
    </p>

    <template v-else>
      <div v-for="(block, index) in previewBlocks" :key="index" :data-testid="`preview-block-${block.type}`" class="p-0">
        <EditorPreviewBlock v-if="block.type !== 'columns'" :block="block" />

        <div v-else-if="block.type === 'columns'" data-testid="preview-columns" class="grid gap-3 md:grid-cols-2">
          <div
            v-for="(column, columnIndex) in getColumns(block)"
            :key="`columns-${index}-${columnIndex}`"
            :data-testid="`preview-column-${columnIndex}`"
            class="space-y-2 p-2"
          >
            <div
              v-for="(columnBlock, columnBlockIndex) in getColumnBlocks(column)"
              :key="`columns-${index}-${columnIndex}-${columnBlockIndex}`"
              :data-testid="`preview-column-block-${columnBlock.type}`"
              class="p-2"
            >
              <EditorPreviewBlock :block="columnBlock" compact-table />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
