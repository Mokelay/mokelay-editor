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
import type { BlockDataField, BlockDataSource, VariableValueDataType } from '@/utils/variableValue';

// MPage 作为容器块，既支持 EditorJS 编辑态，也支持组件化预览态。
export interface MPageProps {
  edit?: boolean;
  value?: OutputData['blocks'];
  pageId?: string;
  onToolChange?: (payload: { edit: boolean; value: OutputData['blocks'] }) => void;
}

const props = withDefaults(defineProps<MPageProps>(), {
  edit: false,
  value: () => []
});

const emit = defineEmits<{
  (event: 'change', blocks: OutputData['blocks']): void;
  (event: 'close'): void;
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
const parentPreviewRuntime = inject(PreviewBlockRuntimeKey, null);
const previewRuntime = parentPreviewRuntime ?? createPreviewBlockRuntime();

provide(PreviewBlockRuntimeKey, previewRuntime);

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
    ...(createEditorTools({ edit: true, getAvailableBlockDataSources, previewRuntime }) as Record<string, ToolSettings>),
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

function close() {
  emit('close');
}

const pageRuntimeInstance = {
  saveEditor,
  getData,
  close
};
let registeredPageRuntimeId = '';

function getPageRuntimeId() {
  return typeof props.pageId === 'string' ? props.pageId.trim() : '';
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

onBeforeUnmount(async () => {
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
  </div>
</template>
