<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MAdvanceInputProps {
  edit: boolean;
  value?: StoredBlock[];
}

type StoredBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

function generateBlockId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

function createParagraphBlock(text: string, id = generateBlockId()): StoredBlock {
  return {
    id,
    type: 'paragraph',
    data: {
      text
    }
  };
}

function getParagraphText(block: StoredBlock) {
  return typeof block.data.text === 'string' ? block.data.text : '';
}

function getEmptyValue() {
  return [createParagraphBlock('')];
}

function mergeParagraphBlocks(blocks: StoredBlock[]) {
  const merged: StoredBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'paragraph') {
      const previous = merged[merged.length - 1];
      if (previous?.type === 'paragraph') {
        previous.data.text = getParagraphText(previous) + getParagraphText(block);
      } else {
        merged.push(createParagraphBlock(getParagraphText(block), block.id));
      }
      continue;
    }

    merged.push(cloneStoredBlock(block));
  }

  if (!merged.length) {
    return getEmptyValue();
  }

  return merged;
}

function normalizeStoredBlocks(value?: StoredBlock[]): StoredBlock[] {
  if (!Array.isArray(value)) {
    return getEmptyValue();
  }

  const normalizedBlocks: StoredBlock[] = [];

  value.forEach((item) => {
    if (typeof item !== 'object' || item === null) {
      return;
    }

    const record = item as Record<string, unknown>;
    if (
      typeof record.id !== 'string' ||
      typeof record.type !== 'string' ||
      typeof record.data !== 'object' ||
      record.data === null ||
      Array.isArray(record.data)
    ) {
      return;
    }

    const block = {
      id: record.id,
      type: record.type,
      data: toPlainRecord(record.data)
    };

    normalizedBlocks.push(block.type === 'paragraph' ? createParagraphBlock(getParagraphText(block), block.id) : block);
  });

  return mergeParagraphBlocks(normalizedBlocks);
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toPlainRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return cloneJsonValue(value) as Record<string, unknown>;
}

function cloneStoredBlock(block: StoredBlock): StoredBlock {
  return {
    id: block.id,
    type: block.type,
    data: toPlainRecord(block.data)
  };
}

export const mAdvanceInputEditorTool = defineEditorTool<MAdvanceInputProps>({
  toolbox: {
    get title() {
      return i18n.t('advanceInput.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10h5M7 14h3M14 10h3M14 14h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  createInitialProps: () => ({
    value: getEmptyValue()
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeStoredBlocks(props.value)
  }),
  serialize: (props) => ({
    value: normalizeStoredBlocks(props.value)
  })
});
</script>

<script setup lang="ts">
import { createApp, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { App } from 'vue';
import type { EditorToolPropertyField } from '@/editors/editorToolDefinition';
import { getInlineCustomComponentDefinition, getInlineCustomComponentEntries } from '@/editors/inlineCustomComponents';
import { useI18n } from '@/i18n';

type EmbeddedRecord = {
  app: App<Element>;
  block: StoredBlock;
  mountPoint: HTMLElement;
  wrapper: HTMLElement;
};

type ActiveEmbeddedComponent = {
  blockId: string;
  title: string;
  type: string;
  fields: EditorToolPropertyField[];
  values: Record<string, string | boolean>;
};

const props = defineProps<MAdvanceInputProps & {
  onChange?: (payload: MAdvanceInputProps) => void;
  onToolChange?: (payload: MAdvanceInputProps) => void;
}>();

const { t } = useI18n();
const editableRef = ref<HTMLElement | null>(null);
const embeddedDialogRef = ref<HTMLDialogElement | null>(null);
const menuVisible = ref(false);
const menuPosition = ref({ left: 0, top: 0 });
const activeEmbeddedComponent = ref<ActiveEmbeddedComponent | null>(null);

const embeddedRecords = new Map<string, EmbeddedRecord>();
let suppressDomSync = false;
let lastValueSignature = '';

function serializeBlocks(blocks: StoredBlock[]) {
  return mergeParagraphBlocks(blocks);
}

function getValueSignature(blocks: StoredBlock[]) {
  return JSON.stringify(serializeBlocks(blocks));
}

function createComponentBlock(type: string): StoredBlock {
  const definition = getInlineCustomComponentDefinition(type);
  if (!definition) {
    throw new Error(`Unknown inline component "${type}".`);
  }

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    edit: false
  });

  return {
    id: generateBlockId(),
    type,
    data: toPlainRecord(definition.serialize(normalized))
  };
}

function unmountEmbeddedRecords() {
  embeddedRecords.forEach((record) => {
    record.app.unmount();
  });
  embeddedRecords.clear();
}

function createComponentWrapper(block: StoredBlock) {
  const plainBlock = cloneStoredBlock(block);
  const definition = getInlineCustomComponentDefinition(plainBlock.type);
  if (!definition) {
    const fallback = document.createElement('span');
    fallback.className = 'ce-advance-input-tool__token ce-advance-input-tool__token--unknown';
    fallback.dataset.segmentType = 'component';
    fallback.dataset.blockId = plainBlock.id;
    fallback.dataset.block = JSON.stringify(plainBlock);
    fallback.textContent = plainBlock.type;
    return fallback;
  }

  const wrapper = document.createElement('span');
  wrapper.className = 'ce-advance-input-tool__token';
  wrapper.dataset.segmentType = 'component';
  wrapper.dataset.blockId = plainBlock.id;
  wrapper.dataset.block = JSON.stringify(plainBlock);
  wrapper.contentEditable = 'false';
  wrapper.setAttribute('data-testid', `editor-advance-input-token-${plainBlock.type}`);

  const mountPoint = document.createElement('span');
  mountPoint.className = 'ce-advance-input-tool__token-mount';
  wrapper.appendChild(mountPoint);

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...plainBlock.data,
    edit: false
  });

  const app = createApp(definition.component, normalized as unknown as Record<string, unknown>);
  app.mount(mountPoint);

  wrapper.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openEmbeddedComponentDialog(plainBlock.id);
  });

  embeddedRecords.set(plainBlock.id, {
    app,
    block: cloneStoredBlock(plainBlock),
    mountPoint,
    wrapper
  });

  return wrapper;
}

function renderEditableContent(value?: StoredBlock[], focusAtEnd = false) {
  const root = editableRef.value;
  if (!root) return;

  suppressDomSync = true;
  unmountEmbeddedRecords();
  root.innerHTML = '';

  const blocks = normalizeStoredBlocks(value);
  for (const block of blocks) {
    if (block.type === 'paragraph') {
      root.appendChild(document.createTextNode(getParagraphText(block)));
      continue;
    }

    root.appendChild(createComponentWrapper(block));
    root.appendChild(document.createTextNode('\u200B'));
  }

  if (!root.childNodes.length) {
    root.appendChild(document.createTextNode(''));
  }

  lastValueSignature = getValueSignature(blocks);
  suppressDomSync = false;

  if (focusAtEnd) {
    nextTick(() => {
      placeCaretAtEnd(root);
    });
  }
}

function getBlocksFromDom() {
  const root = editableRef.value;
  if (!root) {
    return getEmptyValue();
  }

  const blocks: StoredBlock[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').replace(/\u200B/g, '');
      blocks.push(createParagraphBlock(text));
      return;
    }

    if (!(node instanceof HTMLElement)) {
      return;
    }

    if (node.dataset.segmentType === 'component') {
      const blockId = node.dataset.blockId ?? '';
      const record = embeddedRecords.get(blockId);
      const fallbackBlock = node.dataset.block ? JSON.parse(node.dataset.block) as StoredBlock : null;
      const block = record?.block ?? fallbackBlock;
      if (block) {
        blocks.push(cloneStoredBlock(block));
      }
      return;
    }

    blocks.push(createParagraphBlock((node.textContent ?? '').replace(/\u200B/g, '')));
  });

  return mergeParagraphBlocks(blocks);
}

function emitValueChange(value: StoredBlock[]) {
  lastValueSignature = getValueSignature(value);
  const payload = {
    edit: props.edit,
    value
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function syncValueFromDom() {
  if (suppressDomSync) return;
  const value = serializeBlocks(getBlocksFromDom());
  if (getValueSignature(value) === lastValueSignature) return;
  emitValueChange(value);
}

function placeCaretAtEnd(root: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function focusEditor() {
  const root = editableRef.value;
  if (!root) return;
  root.focus();
}

function getCurrentSelection() {
  const root = editableRef.value;
  const selection = window.getSelection();
  if (!root || !selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  return { root, selection, range };
}

function updateSlashMenu() {
  const selectionState = getCurrentSelection();
  if (!selectionState || !selectionState.selection.isCollapsed) {
    menuVisible.value = false;
    return;
  }

  const { range, root } = selectionState;
  let previousChar = '';

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const text = range.startContainer.textContent ?? '';
    if (range.startOffset > 0) {
      previousChar = text[range.startOffset - 1] ?? '';
    }
  } else if (range.startContainer instanceof HTMLElement && range.startOffset > 0) {
    const previousNode = range.startContainer.childNodes[range.startOffset - 1];
    if (previousNode?.nodeType === Node.TEXT_NODE) {
      const text = previousNode.textContent ?? '';
      previousChar = text[text.length - 1] ?? '';
    }
  }

  if (previousChar !== '/') {
    menuVisible.value = false;
    return;
  }

  const caretRect = range.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  menuPosition.value = {
    left: Math.max(0, caretRect.left - rootRect.left),
    top: Math.max(rootRect.height + 8, caretRect.bottom - rootRect.top + 8)
  };
  menuVisible.value = true;
}

function handleEditableInput() {
  syncValueFromDom();
  updateSlashMenu();
}

function handleEditableClick() {
  updateSlashMenu();
}

function handleEditableBlur() {
  window.setTimeout(() => {
    menuVisible.value = false;
  }, 120);
}

function handleEditableKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    return;
  }

  if (event.key !== 'Backspace') {
    return;
  }

  const selectionState = getCurrentSelection();
  if (!selectionState || !selectionState.selection.isCollapsed) return;

  const { range } = selectionState;

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = range.startContainer as Text;
    if (range.startOffset <= 0) return;

    if (textNode.data[range.startOffset - 1] !== '\u200B') return;
    const previousSibling = textNode.previousSibling;
    if (!(previousSibling instanceof HTMLElement) || previousSibling.dataset.segmentType !== 'component') return;

    event.preventDefault();
    const blockId = previousSibling.dataset.blockId ?? '';
    embeddedRecords.get(blockId)?.app.unmount();
    embeddedRecords.delete(blockId);
    previousSibling.remove();
    textNode.deleteData(range.startOffset - 1, 1);
    syncValueFromDom();
    return;
  }

  if (range.startContainer instanceof HTMLElement && range.startOffset > 0) {
    const previousNode = range.startContainer.childNodes[range.startOffset - 1];
    if (!(previousNode instanceof HTMLElement) || previousNode.dataset.segmentType !== 'component') return;

    event.preventDefault();
    const blockId = previousNode.dataset.blockId ?? '';
    embeddedRecords.get(blockId)?.app.unmount();
    embeddedRecords.delete(blockId);
    previousNode.remove();
    syncValueFromDom();
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData('text/plain') ?? '';
  document.execCommand('insertText', false, text.replace(/\n/g, ' '));
}

function insertInlineComponent(type: string) {
  const selectionState = getCurrentSelection();
  if (!selectionState) return;

  const { selection, range } = selectionState;
  const block = createComponentBlock(type);

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = range.startContainer as Text;
    if (range.startOffset > 0 && textNode.data[range.startOffset - 1] === '/') {
      textNode.deleteData(range.startOffset - 1, 1);
      range.setStart(textNode, range.startOffset - 1);
      range.collapse(true);
    }
  }

  const componentNode = createComponentWrapper(block);
  const spacer = document.createTextNode('\u200B');

  range.insertNode(spacer);
  range.insertNode(componentNode);

  const nextRange = document.createRange();
  nextRange.setStart(spacer, 1);
  nextRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(nextRange);

  menuVisible.value = false;
  syncValueFromDom();
  focusEditor();
}

function openEmbeddedComponentDialog(blockId: string) {
  const record = embeddedRecords.get(blockId);
  if (!record) return;

  const definition = getInlineCustomComponentDefinition(record.block.type);
  const fields = definition?.propertyPanel?.fields ?? [];
  if (!definition || !fields.length) return;

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...record.block.data,
    edit: false
  }) as unknown as Record<string, string | boolean>;

  activeEmbeddedComponent.value = {
    blockId,
    title: definition.propertyPanel?.title || t('editor.propertyDialogTitle'),
    type: record.block.type,
    fields,
    values: Object.fromEntries(fields.map((field) => [field.key, normalized[field.key] ?? '']))
  };

  embeddedDialogRef.value?.showModal();
}

function closeEmbeddedDialog() {
  embeddedDialogRef.value?.close();
  activeEmbeddedComponent.value = null;
}

function updateEmbeddedComponentField(key: string, value: string | boolean) {
  const active = activeEmbeddedComponent.value;
  if (!active) return;

  active.values[key] = value;
  activeEmbeddedComponent.value = {
    ...active,
    values: {
      ...active.values
    }
  };

  const record = embeddedRecords.get(active.blockId);
  const definition = getInlineCustomComponentDefinition(active.type);
  if (!record || !definition) return;

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...active.values,
    edit: false
  });

  record.block = {
    ...record.block,
    data: toPlainRecord(definition.serialize(normalized))
  };
  record.wrapper.dataset.block = JSON.stringify(record.block);

  record.app.unmount();
  const app = createApp(definition.component, normalized as unknown as Record<string, unknown>);
  app.mount(record.mountPoint);
  record.app = app;

  syncValueFromDom();
}

function getPreviewSegments() {
  return normalizeStoredBlocks(props.value);
}

function getPreviewComponent(type: string) {
  return getInlineCustomComponentDefinition(type)?.component ?? null;
}

function getBlockText(block: StoredBlock) {
  return getParagraphText(block);
}

function getPreviewProps(block: StoredBlock) {
  const definition = getInlineCustomComponentDefinition(block.type);
  if (!definition) return { edit: false };
  return definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...block.data,
    edit: false
  });
}

onMounted(() => {
  if (props.edit) {
    renderEditableContent(props.value);
  }
});

onBeforeUnmount(() => {
  unmountEmbeddedRecords();
});

watch(
  () => props.edit,
  (edit) => {
    if (!edit) {
      menuVisible.value = false;
      return;
    }
    nextTick(() => {
      renderEditableContent(props.value);
    });
  }
);

watch(
  () => props.value,
  (value) => {
    if (!props.edit) return;
    const nextBlocks = normalizeStoredBlocks(value);
    if (getValueSignature(nextBlocks) === lastValueSignature) return;
    renderEditableContent(nextBlocks);
  }
);
</script>

<template>
  <div class="ce-advance-input-tool" data-testid="editor-advance-input-tool">
    <div v-if="edit" class="ce-advance-input-tool__editor-shell">
      <div
        ref="editableRef"
        class="ce-advance-input-tool__editor"
        data-testid="editor-advance-input-content"
        contenteditable="true"
        spellcheck="false"
        @input="handleEditableInput"
        @click="handleEditableClick"
        @keyup="updateSlashMenu"
        @keydown="handleEditableKeydown"
        @paste="handlePaste"
        @blur="handleEditableBlur"
      ></div>

      <div
        v-if="menuVisible"
        class="ce-advance-input-tool__menu"
        data-testid="editor-advance-input-menu"
        :style="{ left: `${menuPosition.left}px`, top: `${menuPosition.top}px` }"
      >
        <button
          v-for="[type, definition] in getInlineCustomComponentEntries()"
          :key="type"
          type="button"
          class="ce-advance-input-tool__menu-item"
          :data-testid="`editor-advance-input-menu-item-${type}`"
          @mousedown.prevent="insertInlineComponent(type)"
        >
          {{ definition.toolbox.title }}
        </button>
      </div>
    </div>

    <div v-else class="ce-advance-input-tool__preview" data-testid="preview-advance-input-value">
      <template v-for="(block, index) in getPreviewSegments()" :key="`${block.id}-${block.type}-${index}`">
        <span v-if="block.type === 'paragraph'" class="ce-advance-input-tool__preview-text">{{ getBlockText(block) }}</span>
        <span v-else class="ce-advance-input-tool__preview-token">
          <component :is="getPreviewComponent(block.type)" v-bind="getPreviewProps(block)" />
        </span>
      </template>
    </div>

    <dialog
      ref="embeddedDialogRef"
      class="ce-advance-input-tool__dialog"
      data-testid="advance-input-embedded-property-dialog"
      @close="activeEmbeddedComponent = null"
    >
      <form method="dialog" class="ce-advance-input-tool__dialog-panel" @submit.prevent="closeEmbeddedDialog">
        <div class="ce-advance-input-tool__dialog-header">
          <h3 class="ce-advance-input-tool__dialog-title" data-testid="advance-input-embedded-property-title">
            {{ activeEmbeddedComponent?.title }}
          </h3>
          <button
            type="submit"
            class="ce-advance-input-tool__dialog-close"
            data-testid="advance-input-embedded-property-close"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div v-if="activeEmbeddedComponent" class="ce-advance-input-tool__dialog-body">
          <label
            v-for="field in activeEmbeddedComponent.fields"
            :key="field.key"
            class="ce-advance-input-tool__dialog-field"
            :class="{ 'ce-advance-input-tool__dialog-field--checkbox': field.type === 'checkbox' }"
          >
            <template v-if="field.type === 'checkbox'">
              <input
                class="ce-advance-input-tool__dialog-checkbox"
                type="checkbox"
                :checked="activeEmbeddedComponent.values[field.key] === true"
                :data-testid="`advance-input-embedded-property-input-${field.key}`"
                @change="updateEmbeddedComponentField(field.key, ($event.target as HTMLInputElement).checked)"
              />
              <span class="ce-advance-input-tool__dialog-label">{{ field.label }}</span>
            </template>

            <template v-else-if="field.type === 'select'">
              <span class="ce-advance-input-tool__dialog-label">{{ field.label }}</span>
              <select
                class="ce-advance-input-tool__dialog-input"
                :value="String(activeEmbeddedComponent.values[field.key] ?? '')"
                :data-testid="`advance-input-embedded-property-input-${field.key}`"
                @change="updateEmbeddedComponentField(field.key, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="option in field.options ?? []" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </template>

            <template v-else>
              <span class="ce-advance-input-tool__dialog-label">{{ field.label }}</span>
              <input
                class="ce-advance-input-tool__dialog-input"
                type="text"
                :value="String(activeEmbeddedComponent.values[field.key] ?? '')"
                :placeholder="field.placeholder"
                :data-testid="`advance-input-embedded-property-input-${field.key}`"
                @input="updateEmbeddedComponentField(field.key, ($event.target as HTMLInputElement).value)"
              />
            </template>
          </label>
        </div>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.ce-advance-input-tool {
  position: relative;
}

.ce-advance-input-tool__editor-shell,
.ce-advance-input-tool__preview {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 42px;
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 10px;
  background: rgb(255 255 255);
}

.ce-advance-input-tool__editor {
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  white-space: pre;
  overflow-x: auto;
  overflow-y: hidden;
  line-height: 22px;
  outline: none;
  cursor: text;
}

.ce-advance-input-tool__preview {
  padding: 9px 12px;
  white-space: pre;
  overflow-x: auto;
  overflow-y: hidden;
}

.ce-advance-input-tool__editor-shell:focus-within {
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

.ce-advance-input-tool__menu {
  position: absolute;
  z-index: 20;
  min-width: 168px;
  padding: 6px;
  border: 1px solid rgb(226 232 240);
  border-radius: 12px;
  background: rgb(255 255 255);
  box-shadow: 0 16px 40px rgb(15 23 42 / 0.18);
}

.ce-advance-input-tool__menu-item {
  display: flex;
  width: 100%;
  border: 0;
  border-radius: 8px;
  padding: 8px 10px;
  background: transparent;
  color: rgb(15 23 42);
  cursor: pointer;
  text-align: left;
}

.ce-advance-input-tool__menu-item:hover {
  background: rgb(241 245 249);
}

.ce-advance-input-tool__preview-token,
.ce-advance-input-tool__token {
  display: inline-flex;
  align-items: center;
  margin: 0 2px;
  vertical-align: middle;
}

.ce-advance-input-tool__token {
  border-radius: 10px;
  cursor: pointer;
}

.ce-advance-input-tool__token:hover {
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.18);
}

.ce-advance-input-tool__token--unknown {
  padding: 2px 8px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 12px;
}

.ce-advance-input-tool__dialog {
  width: min(100%, 480px);
  border: 0;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
}

.ce-advance-input-tool__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-advance-input-tool__dialog-panel {
  margin: 0;
  padding: 20px;
  background: rgb(255 255 255);
}

.ce-advance-input-tool__dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.ce-advance-input-tool__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 18px;
  font-weight: 600;
}

.ce-advance-input-tool__dialog-close {
  border: 0;
  border-radius: 10px;
  padding: 8px 12px;
  background: rgb(226 232 240);
  color: rgb(51 65 85);
  cursor: pointer;
}

.ce-advance-input-tool__dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ce-advance-input-tool__dialog-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ce-advance-input-tool__dialog-field--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.ce-advance-input-tool__dialog-label {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 600;
}

.ce-advance-input-tool__dialog-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
}

.ce-advance-input-tool__dialog-input {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-advance-input-tool__dialog-input:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

:global(.dark) .ce-advance-input-tool__editor-shell,
:global(.dark) .ce-advance-input-tool__preview {
  background: rgb(15 23 42);
  border-color: rgb(71 85 105 / 0.9);
}

:global(.dark) .ce-advance-input-tool__editor,
:global(.dark) .ce-advance-input-tool__preview {
  color: rgb(226 232 240);
}

:global(.dark) .ce-advance-input-tool__menu {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .ce-advance-input-tool__menu-item {
  color: rgb(226 232 240);
}

:global(.dark) .ce-advance-input-tool__menu-item:hover {
  background: rgb(30 41 59);
}

:global(.dark) .ce-advance-input-tool__dialog-panel {
  background: rgb(15 23 42);
}

:global(.dark) .ce-advance-input-tool__dialog-title {
  color: rgb(241 245 249);
}

:global(.dark) .ce-advance-input-tool__dialog-close {
  background: rgb(51 65 85);
  color: rgb(241 245 249);
}

:global(.dark) .ce-advance-input-tool__dialog-label {
  color: rgb(203 213 225);
}

:global(.dark) .ce-advance-input-tool__dialog-input {
  background: rgb(15 23 42);
  color: rgb(226 232 240);
  border-color: rgb(71 85 105 / 0.9);
}
</style>
