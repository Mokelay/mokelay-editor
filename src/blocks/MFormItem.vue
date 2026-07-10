<script lang="ts">
import {
  cloneEditorBlock,
  normalizeFormItemProps,
  normalizeLayout,
  type MFormItemProps
} from '@/blocks/mFormItemProps';

export {
  generateFormItemVariableName,
  getDefaultFormItemLabelName,
  normalizeFormItemProps,
  serializeFormItemProps
} from '@/blocks/mFormItemProps';
export type {
  MFormItemLayout,
  MFormItemProps,
  NormalizedMFormItemProps
} from '@/blocks/mFormItemProps';

export { mFormItemEditorTool } from '@/blocks/mFormItemEditorTool';
</script>

<script setup lang="ts">
import { defineAsyncComponent, reactive, watch } from 'vue';
import EditorPreviewBlock from '@/blocks/components/EditorPreviewBlock.vue';
import { useI18n } from '@/i18n';
import {
  normalizeSelectorBlock,
  type MEditorSelectorProps
} from '@/blocks/mEditorSelectorEditorTool';

const MEditorSelector = defineAsyncComponent(() => import('@/blocks/MEditorSelector.vue'));

const props = withDefaults(defineProps<MFormItemProps & {
  onChange?: (payload: MFormItemProps) => void;
  onToolChange?: (payload: MFormItemProps) => void;
}>(), {
  edit: false,
  editor: undefined,
  layout: 'Vertical'
});
const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

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

function handlePreviewClick(event: MouseEvent) {
  if (!props.edit) {
    emit('click', event);
  }
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
    @click="handlePreviewClick"
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

.dark .ce-form-item-tool {
  color: rgb(226 232 240);
}

.dark .ce-form-item-tool__edit-shell {
  border-color: rgb(71 85 105 / 0.9);
}

.dark .ce-form-item-tool__label {
  color: rgb(203 213 225);
}

.dark .ce-form-item-tool__empty {
  color: rgb(148 163 184);
}
</style>
