<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs';
import type { OutputData, ToolSettings } from '@editorjs/editorjs';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createPreviewBlockRuntime, PreviewBlockRuntimeKey } from 'mokelay-components/runtime';
import type { PageDataSourceConfig } from 'mokelay-components/pages';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { getEditorComponentDefinition } from '@/editors/editorComponentRuntimeRegistry';
import type { PageEditorBridge } from '@/editors/pageEditor';
import {
  finalizeEditorBlocksWithEvents,
  finalizeEditorOutputWithEvents,
  prepareEditorOutputWithEvents
} from 'mokelay-components/blocks';
import {
  type BlockDataField,
  type BlockDataSource,
  type PageVariableSource,
  type VariableValueDataType
} from 'mokelay-components/runtime';
import {
  getClientBlockDocsSnapshot,
  loadClientBlockDocs,
  type NormalizedClientBlockDoc
} from '@/utils/clientBlockDocs';
import {
  appendPageReferenceAncestry,
  PageReferenceAncestryKey
} from 'mokelay-components/pages';

export interface MPageEditorProps {
  edit?: boolean;
  value?: OutputData['blocks'];
  pageId?: string;
  dataSources?: PageDataSourceConfig[];
  pageEditor?: PageEditorBridge;
  onToolChange?: (payload: { edit: true; value: OutputData['blocks'] }) => void;
}

const props = withDefaults(defineProps<MPageEditorProps>(), {
  edit: true,
  value: () => [],
  dataSources: () => []
});

const emit = defineEmits<{
  (event: 'change', blocks: OutputData['blocks']): void;
  (event: 'close', result?: unknown): void;
}>();

const { t, localeValue } = useI18n();
const holderRef = ref<HTMLElement | null>(null);
const parentPreviewRuntime = inject(PreviewBlockRuntimeKey, null);
const previewRuntime = parentPreviewRuntime ?? createPreviewBlockRuntime();
const parentPageReferenceAncestry = inject(PageReferenceAncestryKey, computed<readonly string[]>(() => []));
const pageReferenceAncestry = computed(() => appendPageReferenceAncestry(
  parentPageReferenceAncestry.value,
  props.pageId
));

let editor: EditorJS | null = null;
let isSyncingFromProps = false;
let skipNextPropSync = false;
let editorMutationObserver: MutationObserver | null = null;
let scheduledEditorSync: number | null = null;
let editorDataCache: OutputData = buildOutput(props.value);
let clientBlockDocsCache: NormalizedClientBlockDoc[] = getClientBlockDocsSnapshot();

function buildOutput(blocks: OutputData['blocks']): OutputData {
  return { blocks: finalizeEditorBlocksWithEvents(blocks) };
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
    .map(([key, value]) => ({ label: key, variable: key, dataType: inferDataType(value) }));
}

function getAvailableBlockDataSources(excludeBlockId?: string): BlockDataSource[] {
  return editorDataCache.blocks.flatMap((block): BlockDataSource[] => {
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
  const sources = new Map<string, PageVariableSource>();
  const currentPageId = props.pageId?.trim();
  if (currentPageId) {
    addPageVariableSource(sources, currentPageId, `${t('variableValue.variable.currentPage')} / ${currentPageId}`);
  }
  collectPageVariableSources(editorDataCache.blocks, sources);
  return [...sources.values()];
}

function addPageVariableSource(
  sources: Map<string, PageVariableSource>,
  pageId: string,
  pageLabel?: string
) {
  const normalizedPageId = pageId.trim();
  if (!normalizedPageId || sources.has(normalizedPageId)) return;
  sources.set(normalizedPageId, {
    pageId: normalizedPageId,
    pageLabel: pageLabel?.trim() || normalizedPageId
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStringProp(value: Record<string, unknown>, key: string) {
  const raw = value[key];
  return typeof raw === 'string' ? raw.trim() : '';
}

function readPageIdReference(value: Record<string, unknown>) {
  return readStringProp(value, 'pageId') ||
    readStringProp(value, 'pageUUID') ||
    readStringProp(value, 'pageUuid') ||
    readStringProp(value, 'uuid');
}

function collectPageVariableSources(value: unknown, sources: Map<string, PageVariableSource>) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectPageVariableSources(item, sources));
    return;
  }
  if (!isRecord(value)) return;

  if (value.type === 'MPage') {
    const pageId = readPageIdReference(isRecord(value.data) ? value.data : value);
    if (pageId) addPageVariableSource(sources, pageId, `MPage / ${pageId}`);
  }
  if (value.action === 'open_dialog' || value.type === 'open_dialog') {
    const pageId = readPageIdReference(isRecord(value.inputs) ? value.inputs : value);
    if (pageId) addPageVariableSource(sources, pageId, `${t('variableValue.variable.dialogPage')} / ${pageId}`);
  }
  if (value.source === 'MPage') {
    const pageId = readPageIdReference(value);
    if (pageId) addPageVariableSource(sources, pageId, `MPage / ${pageId}`);
  }
  Object.values(value).forEach((item) => collectPageVariableSources(item, sources));
}

async function saveEditorJsInstance(instance: EditorJS): Promise<OutputData | undefined> {
  await instance.isReady?.catch(() => undefined);
  const api = instance as EditorJS & {
    save?: () => Promise<OutputData>;
    saver?: { save?: () => Promise<OutputData> };
  };
  if (typeof api.save === 'function') return api.save();
  if (typeof api.saver?.save === 'function') return api.saver.save();
  return undefined;
}

function isSameBlocks(left: OutputData['blocks'], right: OutputData['blocks']) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function notifyChanges(blocks: OutputData['blocks']) {
  props.onToolChange?.({ edit: true, value: blocks });
  skipNextPropSync = true;
  emit('change', blocks);
}

async function syncFromEditorOutput(output: OutputData) {
  const previousBlocks = editorDataCache.blocks;
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
      if (output) await syncFromEditorOutput(output);
    } catch {
      // Nested tools can still be mounting; a later DOM event retries the sync.
    }
  }, 0);
}

function startEditorSyncListeners() {
  const holder = holderRef.value;
  if (!holder) return;
  stopEditorSyncListeners();
  editorMutationObserver = new MutationObserver(scheduleEditorSync);
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
  if (!holderRef.value || editor) return;
  const [{ default: EditorJSConstructor }, { default: EditorJsColumns }, { default: Table }] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@calumk/editorjs-columns'),
    import('@editorjs/table')
  ]);
  if (!holderRef.value || editor) return;
  clientBlockDocsCache = await loadClientBlockDocs();
  const columnTools: Record<string, ToolSettings> = {
    ...(createEditorTools({
      edit: true,
      getAvailableBlockDataSources,
      getAvailablePageVariableSources,
      previewRuntime,
      pageEditor: props.pageEditor,
      pageReferenceAncestry: pageReferenceAncestry.value
    }, { docs: clientBlockDocsCache }) as Record<string, ToolSettings>),
    table: {
      class: Table as unknown as ToolSettings['class'],
      inlineToolbar: true
    }
  };
  editor = new EditorJSConstructor({
    holder: holderRef.value,
    placeholder: t('editor.placeholder'),
    tools: {
      ...columnTools,
      columns: {
        class: EditorJsColumns as unknown as ToolSettings['class'],
        config: { EditorJsLibrary: EditorJSConstructor, tools: columnTools }
      }
    },
    data: prepareEditorOutputWithEvents(editorDataCache),
    i18n: { messages: getEditorJsI18nMessages(localeValue.value) },
    onChange: async () => {
      if (!editor) return;
      const output = await saveEditorJsInstance(editor);
      if (output) await syncFromEditorOutput(output);
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
    if (output) editorDataCache = finalizeEditorOutputWithEvents(output);
  } catch {
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
  if (!editor) return editorDataCache;
  editorDataCache = finalizeEditorOutputWithEvents((await saveEditorJsInstance(editor)) ?? editorDataCache);
  return editorDataCache;
}

function getData() {
  return { blocks: editorDataCache.blocks };
}

function close(result?: unknown) {
  emit('close', result);
  return { closed: true, ...(result !== undefined ? { closeResult: result } : {}) };
}

defineExpose({ saveEditor, getData, close });

onMounted(mountEditor);

watch(
  () => props.value,
  async (blocks) => {
    if (skipNextPropSync) {
      skipNextPropSync = false;
      return;
    }
    const nextBlocks = Array.isArray(blocks) ? blocks : [];
    if (isSameBlocks(nextBlocks, editorDataCache.blocks)) return;
    isSyncingFromProps = true;
    editorDataCache = buildOutput(nextBlocks);
    if (editor) await rebuildEditor();
    isSyncingFromProps = false;
  },
  { deep: true }
);

watch(localeValue, () => {
  if (!editor) return;
  holderRef.value?.replaceChildren();
  void rebuildEditor();
});

onBeforeUnmount(unmountEditor);
</script>

<template>
  <div
    ref="holderRef"
    data-testid="editor-surface"
    class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 py-3 pr-3 pl-11 dark:border-slate-700 dark:bg-slate-950"
  ></div>
</template>
