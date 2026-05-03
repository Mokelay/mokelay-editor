<script lang="ts">
export { mFormEditorTool } from '@/blocks/mFormEditorTool';
export type { MFormItemData, MFormProps } from '@/blocks/mFormEditorTool';
</script>

<script setup lang="ts">
import EditorJS, { type OutputData, type ToolSettings } from '@editorjs/editorjs';
import type { MenuConfig } from '@editorjs/editorjs/types/tools';
import { createApp, type App, computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import MFormItem, {
  mFormItemEditorTool,
  normalizeFormItemProps,
  serializeFormItemProps,
  type NormalizedMFormItemProps,
  type MFormItemProps
} from '@/blocks/MFormItem.vue';
import {
  cloneSelectorBlock,
  normalizeSelectorBlock,
  type StoredBlock
} from '@/blocks/mEditorSelectorEditorTool';
import {
  cloneFormItemData,
  normalizeMFormItem,
  normalizeMFormItems,
  type MFormItemData,
  type MFormProps
} from '@/blocks/mFormEditorTool';
import {
  getEditorComponentDefinition,
  getEditorComponentRegistry
} from '@/editors/editorComponentRegistry';
import type { EditorToolComponentProps, EditorToolPropertyField } from '@/editors/editorToolDefinition';
import { getEditorJsI18nMessages, i18n, useI18n } from '@/i18n';

type FormItemToolOptions = {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

type FormItemToolClass = new (options: FormItemToolOptions) => {
  render: () => HTMLElement;
  save: () => Record<string, unknown>;
  destroy: () => void;
  renderSettings: () => MenuConfig;
};

const INTERNAL_FORM_TOOL_NAMES = new Set(['MPage', 'MForm', 'MFormItem', 'MEditorSelector']);
const formItemToolClassCache = new Map<string, FormItemToolClass>();

const props = withDefaults(defineProps<MFormProps & {
  onChange?: (payload: MFormProps) => void;
  onToolChange?: (payload: MFormProps) => void;
}>(), {
  edit: false,
  items: () => []
});

const emit = defineEmits<{
  (event: 'change', items: MFormItemData[]): void;
}>();

const { t, localeValue } = useI18n();
const holderRef = ref<HTMLElement | null>(null);
const previewItems = computed(() => normalizeMFormItems(props.items));

let editor: EditorJS | null = null;
let isSyncingFromProps = false;
let skipNextPropSync = false;
let editorMutationObserver: MutationObserver | null = null;
let scheduledEditorSync: number | null = null;
let editorDataCache: OutputData = buildOutput(previewItems.value);

function generateBlockId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 10);
  }

  return Math.random().toString(36).slice(2, 12);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getFormItemToolNames() {
  return Object.keys(getEditorComponentRegistry()).filter((toolName) =>
    !INTERNAL_FORM_TOOL_NAMES.has(toolName) && Boolean(getEditorComponentDefinition(toolName))
  );
}

function isAllowedFormItemToolName(toolName: string) {
  return getFormItemToolNames().includes(toolName);
}

function getDefaultFormItemToolName() {
  const preferredToolName = 'MInput';
  return isAllowedFormItemToolName(preferredToolName) ? preferredToolName : getFormItemToolNames()[0];
}

function createInitialEditorBlock(toolName: string): StoredBlock {
  const definition = getEditorComponentDefinition(toolName);
  if (!definition) {
    throw new Error(`MForm could not find a registered component for "${toolName}".`);
  }

  const normalizedProps = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    edit: true
  } as Partial<EditorToolComponentProps>);

  return {
    id: generateBlockId(),
    type: toolName,
    data: definition.serialize(normalizedProps)
  };
}

function createFormItemTool(toolName: string): FormItemToolClass {
  const cachedTool = formItemToolClassCache.get(toolName);
  if (cachedTool) return cachedTool;

  const definition = getEditorComponentDefinition(toolName);
  if (!definition) {
    throw new Error(`MForm could not create a form item tool for "${toolName}".`);
  }

  class FormItemTool {
    static get toolbox() {
      return definition.toolbox;
    }

    private state: NormalizedMFormItemProps;
    private wrapper: HTMLElement | null = null;
    private contentRoot: HTMLElement | null = null;
    private vueApp: App<Element> | null = null;
    private propertyDialog: HTMLDialogElement | null = null;
    private toolbarAlignTimer: number | null = null;
    private readonly handleToolbarPointer = () => {
      this.scheduleToolbarAlignment();
    };

    constructor({ data, config }: FormItemToolOptions) {
      const edit = typeof config?.edit === 'boolean' ? config.edit : true;
      const existingEditor = normalizeSelectorBlock(data?.editor);

      this.state = normalizeFormItemProps({
        ...(data ?? {}),
        edit,
        editor: existingEditor ?? createInitialEditorBlock(toolName)
      });
    }

    render() {
      const wrapper = document.createElement('div');
      wrapper.className = 'mokelay-form-item-tool';
      wrapper.dataset.toolName = toolName;
      wrapper.dataset.testid = `form-item-tool-${toolName}`;

      const contentRoot = document.createElement('div');
      contentRoot.className = 'mokelay-form-item-tool__content';
      wrapper.appendChild(contentRoot);

      this.wrapper = wrapper;
      this.contentRoot = contentRoot;
      wrapper.addEventListener('mouseenter', this.handleToolbarPointer);
      wrapper.addEventListener('mousemove', this.handleToolbarPointer);
      this.createPropertyDialog();
      this.mountVueApp();
      return wrapper;
    }

    destroy() {
      this.clearToolbarAlignTimer();
      this.wrapper?.removeEventListener('mouseenter', this.handleToolbarPointer);
      this.wrapper?.removeEventListener('mousemove', this.handleToolbarPointer);
      this.unmountVueApp();
      this.propertyDialog?.remove();
      this.propertyDialog = null;
      this.contentRoot = null;
      this.wrapper = null;
    }

    save() {
      return serializeFormItemProps(this.state);
    }

    renderSettings(): MenuConfig {
      if (!this.getPropertyFields().length) {
        return [];
      }

      return {
        icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.11 9.51C21.29 9.37 21.34 9.11 21.23 8.9L19.35 5.64C19.24 5.43 18.99 5.35 18.77 5.42L16.44 6.17C15.96 5.8 15.44 5.48 14.87 5.23L14.51 2.75C14.48 2.52 14.28 2.35 14.04 2.35H10.28C10.04 2.35 9.84 2.52 9.81 2.75L9.45 5.23C8.88 5.48 8.36 5.81 7.88 6.17L5.55 5.42C5.33 5.35 5.08 5.43 4.97 5.64L3.09 8.9C2.98 9.11 3.03 9.37 3.21 9.51L5.19 11.06C5.14 11.36 5.12 11.68 5.12 12C5.12 12.32 5.14 12.64 5.19 12.94L3.21 14.49C3.03 14.63 2.98 14.89 3.09 15.1L4.97 18.36C5.08 18.57 5.33 18.65 5.55 18.58L7.88 17.83C8.36 18.2 8.88 18.52 9.45 18.77L9.81 21.25C9.84 21.48 10.04 21.65 10.28 21.65H14.04C14.28 21.65 14.48 21.48 14.51 21.25L14.87 18.77C15.44 18.52 15.96 18.19 16.44 17.83L18.77 18.58C18.99 18.65 19.24 18.57 19.35 18.36L21.23 15.1C21.34 14.89 21.29 14.63 21.11 14.49L19.14 12.94ZM12.16 15.6C10.17 15.6 8.56 13.99 8.56 12C8.56 10.01 10.17 8.4 12.16 8.4C14.15 8.4 15.76 10.01 15.76 12C15.76 13.99 14.15 15.6 12.16 15.6Z" fill="currentColor"/></svg>',
        title: i18n.t('editor.properties'),
        onActivate: () => {
          this.openPropertyDialog();
        },
        closeOnActivate: true
      };
    }

    private mountVueApp() {
      if (!this.contentRoot) return;

      const updateState = (payload: MFormItemProps) => {
        this.state = normalizeFormItemProps(payload, this.state.variableName);
      };

      this.unmountVueApp();
      this.vueApp = createApp(MFormItem, {
        ...this.state,
        edit: true,
        onToolChange: updateState,
        onChange: updateState
      });
      this.vueApp.mount(this.contentRoot);
    }

    private unmountVueApp() {
      this.vueApp?.unmount();
      this.vueApp = null;
    }

    private clearToolbarAlignTimer() {
      if (this.toolbarAlignTimer === null) return;
      window.clearTimeout(this.toolbarAlignTimer);
      this.toolbarAlignTimer = null;
    }

    private scheduleToolbarAlignment() {
      this.clearToolbarAlignTimer();
      this.toolbarAlignTimer = window.setTimeout(() => {
        this.alignToolbarToFormItem();
      }, 0);
    }

    private alignToolbarToFormItem() {
      this.toolbarAlignTimer = null;

      const root = this.wrapper;
      if (!root) return;

      const block = root.closest('.ce-block') as HTMLElement | null;
      const editorRoot = root.closest('.codex-editor') as HTMLElement | null;
      const toolbar = editorRoot?.querySelector<HTMLElement>(':scope > .ce-toolbar');
      const plusButton = toolbar?.querySelector('.ce-toolbar__plus') as HTMLElement | null;

      if (!block || !toolbar || !plusButton) return;

      const blockRect = block.getBoundingClientRect();
      const itemRect = root.getBoundingClientRect();
      const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
      const top = block.offsetTop + (itemRect.top - blockRect.top) + (itemRect.height - toolbarButtonHeight) / 2;

      toolbar.style.top = `${Math.max(0, Math.round(top))}px`;
    }

    private getPropertyFields() {
      return mFormItemEditorTool.propertyPanel?.fields ?? [];
    }

    private createPropertyDialog() {
      if (!this.wrapper || !this.getPropertyFields().length) return;

      const dialog = document.createElement('dialog');
      dialog.className = 'mokelay-editor-tool__property-dialog';
      dialog.dataset.testid = 'tool-property-dialog';
      dialog.dataset.toolName = 'MFormItem';

      const title = mFormItemEditorTool.propertyPanel?.title || i18n.t('editor.propertyDialogTitle');
      const fields = this.getPropertyFields().map((field) => this.renderPropertyField(field)).join('');

      dialog.innerHTML = `
        <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-property-panel">
          <div class="mokelay-editor-tool__property-header">
            <h3 class="mokelay-editor-tool__property-title" data-testid="tool-property-title">${escapeHtml(title)}</h3>
            <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-property-close">${escapeHtml(i18n.t('editor.close'))}</button>
          </div>
          <div class="mokelay-editor-tool__property-body" data-testid="tool-property-body">
            ${fields}
          </div>
        </form>
      `;

      this.wrapper.appendChild(dialog);
      this.propertyDialog = dialog;
      this.bindPropertyInputs();
    }

    private openPropertyDialog() {
      if (!this.propertyDialog) return;
      this.syncPropertyDialogValues();
      if (!this.propertyDialog.open) {
        this.propertyDialog.showModal();
      }
    }

    private syncPropertyDialogValues() {
      if (!this.propertyDialog) return;
      this.propertyDialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-property-key]').forEach((input) => {
        const propertyKey = input.dataset.propertyKey;
        if (!propertyKey) return;
        const value = this.getPropertyFieldValue(propertyKey);
        if (input instanceof HTMLInputElement && input.type === 'checkbox') {
          input.checked = value === true;
          return;
        }
        input.value = typeof value === 'string' ? value : '';
      });
    }

    private updateProperty(key: string, value: string | boolean) {
      this.state = normalizeFormItemProps({
        ...this.state,
        [key]: value,
        edit: true
      }, this.state.variableName);
      this.mountVueApp();
    }

    private getPropertyFieldValue(key: string): unknown {
      return this.state[key as keyof NormalizedMFormItemProps];
    }

    private renderPropertyField(field: EditorToolPropertyField) {
      if (field.type === 'checkbox') {
        return `
          <label class="mokelay-editor-tool__property-field mokelay-editor-tool__property-field--checkbox">
            <input
              class="mokelay-editor-tool__property-checkbox"
              data-testid="tool-property-input-${field.key}"
              data-property-key="${field.key}"
              data-property-type="checkbox"
              type="checkbox"
              ${this.getPropertyFieldValue(field.key) === true ? 'checked' : ''}
            />
            <span class="mokelay-editor-tool__property-label">${escapeHtml(field.label)}</span>
          </label>
        `;
      }

      if (field.type === 'select') {
        const value = this.getPropertyFieldValue(field.key);
        const options = (field.options ?? []).map((option) => `
          <option value="${escapeHtml(option.value)}" ${value === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>
        `).join('');

        return `
          <label class="mokelay-editor-tool__property-field">
            <span class="mokelay-editor-tool__property-label">${escapeHtml(field.label)}</span>
            <select
              class="mokelay-editor-tool__property-input"
              data-testid="tool-property-input-${field.key}"
              data-property-key="${field.key}"
              data-property-type="select"
            >
              ${options}
            </select>
          </label>
        `;
      }

      const value = this.getPropertyFieldValue(field.key);
      return `
        <label class="mokelay-editor-tool__property-field">
          <span class="mokelay-editor-tool__property-label">${escapeHtml(field.label)}</span>
          <input
            class="mokelay-editor-tool__property-input"
            data-testid="tool-property-input-${field.key}"
            data-property-key="${field.key}"
            data-property-type="text"
            type="text"
            value="${escapeHtml(typeof value === 'string' ? value : '')}"
            placeholder="${escapeHtml(field.placeholder ?? '')}"
          />
        </label>
      `;
    }

    private bindPropertyInputs() {
      if (!this.propertyDialog) return;

      this.propertyDialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-property-key]').forEach((input) => {
        const eventName = input instanceof HTMLInputElement
          ? (input.type === 'checkbox' ? 'change' : 'input')
          : 'change';
        input.addEventListener(eventName, () => {
          const propertyKey = input.dataset.propertyKey;
          if (!propertyKey) return;
          this.updateProperty(propertyKey, this.readPropertyInputValue(input));
        });
      });
    }

    private readPropertyInputValue(input: HTMLInputElement | HTMLSelectElement) {
      if (input instanceof HTMLInputElement && input.type === 'checkbox') {
        return input.checked;
      }
      return input.value;
    }
  }

  const createdTool = FormItemTool as unknown as FormItemToolClass;
  formItemToolClassCache.set(toolName, createdTool);
  return createdTool;
}

function createFormItemEditorTools() {
  return Object.fromEntries(
    getFormItemToolNames().map((toolName) => [
      toolName,
      {
        class: createFormItemTool(toolName),
        config: {
          edit: true
        }
      }
    ])
  ) as Record<string, ToolSettings>;
}

function getBlockToolName(item: MFormItemData) {
  const editorType = item.editor?.type;
  if (editorType && isAllowedFormItemToolName(editorType)) {
    return editorType;
  }

  return getDefaultFormItemToolName();
}

function formItemToBlock(item: MFormItemData, index: number): OutputData['blocks'][number] | undefined {
  const toolName = getBlockToolName(item);
  if (!toolName) return undefined;

  return {
    id: `form-item-${item.variableName || index}`,
    type: toolName,
    data: cloneFormItemData(item)
  };
}

function buildOutput(items: MFormItemData[]): OutputData {
  return {
    blocks: items
      .map((item, index) => formItemToBlock(item, index))
      .filter((block): block is OutputData['blocks'][number] => block !== undefined)
  };
}

function getItemsFromOutput(output: OutputData) {
  const blocks = Array.isArray(output.blocks) ? output.blocks : [];

  return blocks
    .filter((block) => isAllowedFormItemToolName(block.type))
    .map((block) => normalizeMFormItem(block.data))
    .filter((item): item is MFormItemData => item !== undefined);
}

function isSameItems(left: MFormItemData[], right: MFormItemData[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function notifyChanges(items: MFormItemData[]) {
  const normalizedItems = normalizeMFormItems(items);
  const payload = {
    edit: props.edit,
    items: normalizedItems.map((item) => cloneFormItemData(item))
  };

  skipNextPropSync = true;
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  emit('change', payload.items);
}

async function syncFromEditorOutput(output: OutputData) {
  const previousItems = getItemsFromOutput(editorDataCache);
  const nextItems = getItemsFromOutput(output);
  editorDataCache = buildOutput(nextItems);

  if (!isSyncingFromProps && !isSameItems(previousItems, nextItems)) {
    notifyChanges(nextItems);
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
      const output = await editor.save();
      await syncFromEditorOutput(output);
    } catch {
      // EditorJS can reject during nested block mounting; the next DOM event will sync again.
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
  if (!props.edit || !holderRef.value || editor) return;

  editorDataCache = buildOutput(previewItems.value);
  editor = new EditorJS({
    holder: holderRef.value,
    placeholder: t('form.placeholder'),
    tools: createFormItemEditorTools(),
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
    editorDataCache = buildOutput(getItemsFromOutput(output));
  } catch {
    editorDataCache = buildOutput(previewItems.value);
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

  const output = await editor.save();
  await syncFromEditorOutput(output);
  return editorDataCache;
}

defineExpose({
  saveEditor
});

onMounted(async () => {
  await mountEditor();
});

watch(
  () => props.items,
  async (items) => {
    if (skipNextPropSync) {
      skipNextPropSync = false;
      return;
    }

    const nextItems = normalizeMFormItems(items);
    const cachedItems = getItemsFromOutput(editorDataCache);
    if (isSameItems(nextItems, cachedItems)) {
      return;
    }

    isSyncingFromProps = true;
    editorDataCache = buildOutput(nextItems);
    if (editor) {
      await rebuildEditor();
    }
    isSyncingFromProps = false;
  },
  { deep: true }
);

watch(localeValue, async () => {
  if (!editor) return;
  await rebuildEditor();
});

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

onBeforeUnmount(async () => {
  await unmountEditor();
});
</script>

<template>
  <div
    class="ce-form-tool"
    :class="{ 'ce-form-tool--edit': edit }"
    data-testid="editor-form-tool"
  >
    <div
      v-if="edit"
      class="ce-form-tool__editor-shell"
      data-testid="form-editor-shell"
    >
      <div ref="holderRef" class="ce-form-tool__editor" data-testid="form-editor-surface"></div>
    </div>

    <div v-else class="ce-form-tool__preview" data-testid="preview-form-items">
      <MFormItem
        v-for="(item, index) in previewItems"
        :key="`${item.variableName}-${index}`"
        :edit="false"
        :label-name="item.labelName"
        :variable-name="item.variableName"
        :editor="item.editor ? cloneSelectorBlock(item.editor) : undefined"
        :layout="item.layout"
      />
    </div>
  </div>
</template>

<style scoped>
.ce-form-tool {
  width: 100%;
  color: rgb(15 23 42);
}

.ce-form-tool__editor-shell {
  width: 100%;
  min-height: 54px;
  border: 1px dashed rgb(148 163 184 / 0.72);
  border-radius: 8px;
  background: rgb(248 250 252);
  padding: 8px 10px 8px 38px;
}

.ce-form-tool__editor,
.ce-form-tool__preview {
  width: 100%;
}

.ce-form-tool__preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ce-form-tool :deep(.codex-editor) {
  min-height: 0;
}

.ce-form-tool :deep(.codex-editor__redactor) {
  min-height: 0;
  padding-bottom: 0 !important;
}

.ce-form-tool :deep(.ce-block) {
  padding: 0;
}

.ce-form-tool :deep(.ce-block + .ce-block) {
  margin-top: 10px;
}

.ce-form-tool :deep(.ce-block__content),
.ce-form-tool :deep(.ce-toolbar__content) {
  max-width: none;
  margin: 0;
}

.ce-form-tool :deep(.ce-toolbar__actions) {
  right: calc(100% + 8px);
  padding-right: 0;
}

.ce-form-tool :deep(.ce-popover-item[data-item-name='paragraph']) {
  display: none;
}

.ce-form-tool :deep(.ce-paragraph) {
  min-height: 36px;
  padding: 8px 0;
  color: rgb(100 116 139);
  font-size: 14px;
  line-height: 20px;
}

:global(.dark) .ce-form-tool {
  color: rgb(226 232 240);
}

:global(.dark) .ce-form-tool__editor-shell {
  border-color: rgb(71 85 105 / 0.9);
  background: rgb(15 23 42);
}

:global(.dark) .ce-form-tool :deep(.ce-paragraph) {
  color: rgb(148 163 184);
}
</style>
