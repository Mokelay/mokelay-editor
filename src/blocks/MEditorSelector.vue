<script lang="ts">
export { mEditorSelectorEditorTool } from '@/blocks/mEditorSelectorEditorTool';
export type { MEditorSelectorProps, StoredBlock } from '@/blocks/mEditorSelectorEditorTool';
</script>

<script setup lang="ts">
import EditorJS, { type OutputData, type ToolSettings } from '@editorjs/editorjs';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { getEditorComponentDefinition } from '@/editors/editorComponentRegistry';
import EditorPreviewBlock from '@/blocks/components/EditorPreviewBlock.vue';
import {
  cloneSelectorBlock,
  normalizeSelectorBlock,
  type MEditorSelectorProps,
  type StoredBlock
} from '@/blocks/mEditorSelectorEditorTool';

const SELECTOR_TOOL_NAME = 'MEditorSelector';
const INTERNAL_BLOCK_TYPES = new Set(['paragraph', 'table', 'columns']);

const props = withDefaults(defineProps<MEditorSelectorProps & {
  onChange?: (payload: MEditorSelectorProps) => void;
  onToolChange?: (payload: MEditorSelectorProps) => void;
}>(), {
  edit: false,
  value: undefined
});

const { t, localeValue } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const holderRef = ref<HTMLElement | null>(null);
const selectedBlock = ref<StoredBlock | undefined>(normalizeSelectorBlock(props.value));
const hasSelectedBlock = computed(() => selectedBlock.value !== undefined);

let editor: EditorJS | null = null;
let isRenderingCanonicalValue = false;
let editorMutationObserver: MutationObserver | null = null;
let scheduledEditorSync: number | null = null;
let scheduledToolbarSync: number | null = null;
let editorDataCache: OutputData = buildOutput(selectedBlock.value);

function buildOutput(block?: StoredBlock): OutputData {
  return {
    blocks: block ? [cloneSelectorBlock(block)] : []
  };
}

function getBlockSignature(block?: StoredBlock) {
  return block ? JSON.stringify(block) : '';
}

function getExcludedToolNames() {
  const excludedToolNames = new Set([SELECTOR_TOOL_NAME]);
  (props.excludeToolNames ?? []).forEach((toolName) => {
    excludedToolNames.add(toolName);
  });
  return excludedToolNames;
}

function isAllowedSelectorType(type: string) {
  return !getExcludedToolNames().has(type) && !INTERNAL_BLOCK_TYPES.has(type) && Boolean(getEditorComponentDefinition(type));
}

function toStoredBlock(block: OutputData['blocks'][number]): StoredBlock | undefined {
  if (!isAllowedSelectorType(block.type)) return undefined;
  return normalizeSelectorBlock(block);
}

function getSelectedBlockFromOutput(output: OutputData) {
  const blocks = Array.isArray(output.blocks) ? output.blocks : [];
  const selectorBlocks = blocks
    .map((block) => toStoredBlock(block))
    .filter((block): block is StoredBlock => block !== undefined);

  return selectorBlocks[selectorBlocks.length - 1];
}

function shouldRenderCanonicalOutput(output: OutputData, block?: StoredBlock) {
  const blocks = Array.isArray(output.blocks) ? output.blocks : [];
  if (!block) {
    return blocks.some((item) => isAllowedSelectorType(item.type));
  }

  if (blocks.length !== 1) return true;
  return getBlockSignature(toStoredBlock(blocks[0])) !== getBlockSignature(block);
}

function emitValueChange(block?: StoredBlock) {
  const payload = {
    edit: props.edit,
    value: block ? cloneSelectorBlock(block) : undefined
  };

  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

async function renderCanonicalValue(block?: StoredBlock) {
  const currentEditor = editor;
  if (!currentEditor) return;

  isRenderingCanonicalValue = true;
  editorDataCache = buildOutput(block);

  try {
    await currentEditor.blocks.render(editorDataCache);
  } finally {
    await nextTick();
    isRenderingCanonicalValue = false;
  }
}

async function syncFromEditorOutput(output: OutputData) {
  if (isRenderingCanonicalValue) return;

  const nextBlock = getSelectedBlockFromOutput(output);
  const previousSignature = getBlockSignature(selectedBlock.value);
  const nextSignature = getBlockSignature(nextBlock);

  selectedBlock.value = nextBlock ? cloneSelectorBlock(nextBlock) : undefined;
  editorDataCache = buildOutput(selectedBlock.value);

  if (previousSignature !== nextSignature) {
    emitValueChange(selectedBlock.value);
  }

  if (shouldRenderCanonicalOutput(output, selectedBlock.value)) {
    await renderCanonicalValue(selectedBlock.value);
  }
}

function clearScheduledEditorSync() {
  if (scheduledEditorSync === null) return;
  window.clearTimeout(scheduledEditorSync);
  scheduledEditorSync = null;
}

function scheduleEditorSync() {
  if (!editor || isRenderingCanonicalValue) return;

  clearScheduledEditorSync();
  scheduledEditorSync = window.setTimeout(async () => {
    scheduledEditorSync = null;
    if (!editor || isRenderingCanonicalValue) return;

    try {
      const output = await editor.save();
      await syncFromEditorOutput(output);
    } catch {
      // EditorJS can reject while a block is still being mounted; the next DOM/input event will sync again.
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

function getSelectorToolbar(root: HTMLElement) {
  return root.querySelector<HTMLElement>('.codex-editor > .ce-toolbar');
}

function getToolbarScope(root: HTMLElement) {
  return root.closest<HTMLElement>('[data-testid="editor-form-tool"]')
    ?? root.closest<HTMLElement>('[data-testid="editor-panel"]')
    ?? document;
}

function closePeerSelectorToolbars() {
  const root = rootRef.value;
  if (!root) return;

  getToolbarScope(root).querySelectorAll<HTMLElement>('.ce-editor-selector-tool').forEach((selectorRoot) => {
    if (selectorRoot === root) return;
    const toolbar = getSelectorToolbar(selectorRoot);
    toolbar?.classList.remove('ce-toolbar--opened');
  });
}

function syncSelectorToolbarState() {
  const root = rootRef.value;
  if (!root) return;

  closePeerSelectorToolbars();
}

function clearScheduledToolbarSync() {
  if (scheduledToolbarSync === null) return;
  window.clearTimeout(scheduledToolbarSync);
  scheduledToolbarSync = null;
}

function scheduleSelectorToolbarSync() {
  clearScheduledToolbarSync();
  scheduledToolbarSync = window.setTimeout(() => {
    scheduledToolbarSync = null;
    syncSelectorToolbarState();
  }, 0);
}

async function mountEditor() {
  if (!props.edit || !holderRef.value || editor) return;

  editorDataCache = buildOutput(selectedBlock.value);
  const tools = createEditorTools(
    { edit: true },
    { exclude: getExcludedToolNames() }
  ) as Record<string, ToolSettings>;

  editor = new EditorJS({
    holder: holderRef.value,
    placeholder: t('editorSelector.placeholder'),
    tools,
    data: editorDataCache,
    minHeight: 0,
    i18n: {
      messages: getEditorJsI18nMessages(localeValue.value)
    },
    onChange: async () => {
      if (!editor) return;
      const output = await editor.save();
      await syncFromEditorOutput(output);
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
    const output = await currentEditor.save();
    selectedBlock.value = getSelectedBlockFromOutput(output);
    editorDataCache = buildOutput(selectedBlock.value);
  } catch {
    editorDataCache = buildOutput(selectedBlock.value);
  }

  currentEditor.destroy();
}

async function rebuildEditor() {
  await unmountEditor();
  await nextTick();
  await mountEditor();
}

onMounted(async () => {
  await mountEditor();
});

watch(
  () => props.value,
  async (value) => {
    const nextBlock = normalizeSelectorBlock(value);
    if (getBlockSignature(nextBlock) === getBlockSignature(selectedBlock.value)) return;

    selectedBlock.value = nextBlock;
    editorDataCache = buildOutput(nextBlock);

    if (editor) {
      await renderCanonicalValue(nextBlock);
    }
  },
  { deep: true }
);

watch(
  () => props.edit,
  async (edit) => {
    if (edit) {
      await nextTick();
      await mountEditor();
      return;
    }

    await unmountEditor();
  }
);

watch(localeValue, async () => {
  if (!editor) return;
  await rebuildEditor();
});

watch(
  () => props.excludeToolNames,
  async () => {
    if (!editor) return;
    await rebuildEditor();
  },
  { deep: true }
);

onBeforeUnmount(async () => {
  clearScheduledToolbarSync();
  await unmountEditor();
});
</script>

<template>
  <div
    ref="rootRef"
    class="ce-editor-selector-tool"
    :class="{ 'ce-editor-selector-tool--filled': hasSelectedBlock }"
    data-testid="editor-selector-tool"
    @mouseenter="scheduleSelectorToolbarSync"
    @mousemove="scheduleSelectorToolbarSync"
  >
    <div
      v-if="edit"
      class="ce-editor-selector-tool__editor-shell"
      :class="{ 'ce-editor-selector-tool__editor-shell--filled': hasSelectedBlock }"
      data-testid="editor-selector-shell"
    >
      <div ref="holderRef" class="ce-editor-selector-tool__editor" data-testid="editor-selector-surface"></div>
    </div>

    <div v-else class="ce-editor-selector-tool__preview" data-testid="preview-editor-selector-value">
      <EditorPreviewBlock v-if="selectedBlock" :block="selectedBlock" />
    </div>
  </div>
</template>

<style scoped>
.ce-editor-selector-tool {
  position: relative;
  width: 100%;
}

.ce-editor-selector-tool__editor-shell,
.ce-editor-selector-tool__preview {
  position: relative;
  width: 100%;
  min-height: 38px;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-editor-selector-tool__editor-shell {
  height: 38px;
  padding: 0 10px 0 38px;
  overflow: visible;
}

.ce-editor-selector-tool__editor-shell--filled {
  height: auto;
  padding-top: 4px;
  padding-bottom: 4px;
}

.ce-editor-selector-tool__editor,
.ce-editor-selector-tool__preview {
  min-height: 0;
}

.ce-editor-selector-tool__preview {
  display: flex;
  align-items: center;
  padding: 7px 10px;
}

.ce-editor-selector-tool__preview:empty {
  padding: 0 10px;
}

.ce-editor-selector-tool :deep(.codex-editor) {
  min-height: 0;
}

.ce-editor-selector-tool :deep(.codex-editor__redactor) {
  min-height: 0;
  padding-bottom: 0 !important;
}

.ce-editor-selector-tool :deep(.ce-block) {
  padding: 0;
}

.ce-editor-selector-tool :deep(.ce-block__content),
.ce-editor-selector-tool :deep(.ce-toolbar__content) {
  max-width: none;
  margin: 0;
}

.ce-editor-selector-tool :deep(.ce-toolbar__actions) {
  right: calc(100% + 8px);
  padding-right: 0;
}

.ce-editor-selector-tool :deep(.ce-paragraph) {
  min-height: 36px;
  padding: 8px 0;
  line-height: 20px;
  font-size: 14px;
}

.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-block),
.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-block__content),
.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-paragraph) {
  min-height: 0;
  height: 36px;
}

.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-paragraph) {
  padding: 8px 0;
}

.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='paragraph']),
.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='table']),
.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='columns']),
.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='MEditorSelector']) {
  display: none;
}

:global(.dark) .ce-editor-selector-tool__editor-shell,
:global(.dark) .ce-editor-selector-tool__preview {
  border-color: rgb(71 85 105 / 0.9);
  background: rgb(15 23 42);
}
</style>
