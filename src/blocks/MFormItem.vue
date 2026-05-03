<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import {
  cloneSelectorBlock,
  normalizeSelectorBlock,
  type StoredBlock
} from '@/blocks/mEditorSelectorEditorTool';

export type MFormItemLayout = 'Vertical' | 'Horizontal';

export interface MFormItemProps {
  edit: boolean;
  labelName?: string;
  variableName?: string;
  editor?: StoredBlock;
  layout?: MFormItemLayout;
}

export function generateFormItemVariableName() {
  const suffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  return `field_${suffix}`;
}

export function getDefaultFormItemLabelName() {
  return i18n.t('formItem.defaultLabelName');
}

function normalizeLayout(value?: unknown): MFormItemLayout {
  return value === 'Horizontal' ? 'Horizontal' : 'Vertical';
}

function normalizeLabelName(value?: unknown) {
  return typeof value === 'string' && value.trim() ? value : getDefaultFormItemLabelName();
}

function normalizeVariableName(value?: unknown, fallback?: string) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallback || generateFormItemVariableName();
}

function cloneEditorBlock(block?: StoredBlock) {
  return block ? cloneSelectorBlock(block) : undefined;
}

export function normalizeFormItemProps(props: Partial<MFormItemProps>, fallbackVariableName?: string): MFormItemProps {
  return {
    edit: props.edit ?? false,
    labelName: normalizeLabelName(props.labelName),
    variableName: normalizeVariableName(props.variableName, fallbackVariableName),
    editor: normalizeSelectorBlock(props.editor),
    layout: normalizeLayout(props.layout)
  };
}

export function serializeFormItemProps(props: Partial<MFormItemProps>) {
  const normalized = normalizeFormItemProps(props);
  return {
    labelName: normalized.labelName,
    variableName: normalized.variableName,
    ...(normalized.editor ? { editor: cloneSelectorBlock(normalized.editor) } : {}),
    layout: normalized.layout
  };
}

export const mFormItemEditorTool = defineEditorTool<MFormItemProps>({
  toolbox: {
    get title() {
      return i18n.t('formItem.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="13" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('formItem.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'labelName',
          label: i18n.t('formItem.properties.labelName'),
          placeholder: i18n.t('formItem.placeholders.labelName')
        },
        {
          key: 'variableName',
          label: i18n.t('formItem.properties.variableName'),
          placeholder: i18n.t('formItem.placeholders.variableName')
        },
        {
          key: 'layout',
          label: i18n.t('formItem.properties.layout'),
          type: 'select' as const,
          options: [
            { label: i18n.t('formItem.layouts.vertical'), value: 'Vertical' },
            { label: i18n.t('formItem.layouts.horizontal'), value: 'Horizontal' }
          ]
        }
      ];
    }
  },
  createInitialProps: () => ({
    labelName: getDefaultFormItemLabelName(),
    variableName: generateFormItemVariableName(),
    editor: undefined,
    layout: 'Vertical'
  }),
  normalizeProps: (props) => normalizeFormItemProps(props),
  serialize: serializeFormItemProps
});
</script>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import MEditorSelector from '@/blocks/MEditorSelector.vue';
import EditorPreviewBlock from '@/blocks/components/EditorPreviewBlock.vue';
import { useI18n } from '@/i18n';
import type { MEditorSelectorProps } from '@/blocks/mEditorSelectorEditorTool';

const props = withDefaults(defineProps<MFormItemProps & {
  onChange?: (payload: MFormItemProps) => void;
  onToolChange?: (payload: MFormItemProps) => void;
}>(), {
  edit: false,
  editor: undefined,
  layout: 'Vertical'
});

const { t } = useI18n();
const selectorExcludeToolNames = ['MFormItem', 'MForm'];
const formItem = reactive(normalizeFormItemProps(props));

function emitChange() {
  const payload: MFormItemProps = {
    edit: props.edit,
    labelName: formItem.labelName,
    variableName: formItem.variableName,
    editor: cloneEditorBlock(formItem.editor),
    layout: normalizeLayout(formItem.layout)
  };

  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function updateFormItem(payload: Partial<MFormItemProps>) {
  if (payload.labelName !== undefined) {
    formItem.labelName = payload.labelName;
  }

  if (payload.variableName !== undefined) {
    formItem.variableName = payload.variableName;
  }

  if ('editor' in payload) {
    formItem.editor = normalizeSelectorBlock(payload.editor);
  }

  if (payload.layout !== undefined) {
    formItem.layout = normalizeLayout(payload.layout);
  }

  emitChange();
}

function handleEditorChange(payload: MEditorSelectorProps) {
  updateFormItem({
    editor: payload.value
  });
}

watch(
  () => ({
    labelName: props.labelName,
    variableName: props.variableName,
    editor: props.editor,
    layout: props.layout,
    edit: props.edit
  }),
  (value) => {
    Object.assign(formItem, normalizeFormItemProps(value, formItem.variableName));
  },
  { deep: true }
);
</script>

<template>
  <div
    class="ce-form-item-tool"
    :class="{
      'ce-form-item-tool--edit': edit,
      'ce-form-item-tool--horizontal': formItem.layout === 'Horizontal'
    }"
    data-testid="editor-form-item-tool"
  >
    <template v-if="edit">
      <div class="ce-form-item-tool__edit-shell" data-testid="form-item-edit-shell">
        <div class="ce-form-item-tool__body">
          <div class="ce-form-item-tool__label" data-testid="form-item-label-preview">{{ formItem.labelName }}</div>
          <div class="ce-form-item-tool__editor" data-testid="form-item-editor-field">
            <MEditorSelector
              :edit="true"
              :value="formItem.editor"
              :exclude-tool-names="selectorExcludeToolNames"
              :on-change="handleEditorChange"
            />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="ce-form-item-tool__body">
        <div class="ce-form-item-tool__label" data-testid="preview-form-item-label">{{ formItem.labelName }}</div>
        <div class="ce-form-item-tool__editor" data-testid="preview-form-item-editor">
          <EditorPreviewBlock v-if="formItem.editor" :block="formItem.editor" />
          <span v-else class="ce-form-item-tool__empty">{{ t('formItem.emptyEditor') }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ce-form-item-tool {
  width: 100%;
  color: rgb(15 23 42);
}

.ce-form-item-tool__edit-shell {
  width: 100%;
  border: 1px dashed rgb(148 163 184 / 0.7);
  border-radius: 8px;
  padding: 8px;
}

.ce-form-item-tool__label {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.ce-form-item-tool__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-form-item-tool--horizontal .ce-form-item-tool__body {
  display: grid;
  grid-template-columns: minmax(96px, max-content) minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.ce-form-item-tool__label {
  padding-top: 9px;
  word-break: break-word;
}

.ce-form-item-tool__editor {
  min-width: 0;
}

.ce-form-item-tool__empty {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  color: rgb(100 116 139);
  font-size: 14px;
  line-height: 20px;
}

@media (max-width: 640px) {
  .ce-form-item-tool--horizontal .ce-form-item-tool__body {
    display: flex;
    flex-direction: column;
  }
}

:global(.dark) .ce-form-item-tool {
  color: rgb(226 232 240);
}

:global(.dark) .ce-form-item-tool__edit-shell {
  border-color: rgb(71 85 105 / 0.9);
}

:global(.dark) .ce-form-item-tool__label {
  color: rgb(203 213 225);
}

:global(.dark) .ce-form-item-tool__empty {
  color: rgb(148 163 184);
}
</style>
