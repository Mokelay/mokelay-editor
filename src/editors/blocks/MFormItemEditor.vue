<script lang="ts">
export {
  generateFormItemVariableName,
  getDefaultFormItemLabelName,
  normalizeFormItemProps,
  serializeFormItemProps
} from 'mokelay-components/blocks';
export type {
  MFormItemLayout,
  MFormItemProps,
  NormalizedMFormItemProps
} from 'mokelay-components/blocks';
export { mFormItemEditorTool } from '@/editors/tools/mFormItemEditorTool';
</script>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import MFormItemRenderer from 'mokelay-components/blocks/MFormItem.vue';
import {
  cloneEditorBlock,
  normalizeFormItemProps,
  normalizeLayout,
  type MFormItemProps
} from 'mokelay-components/blocks';
import MEditorSelector from '@/editors/blocks/MEditorSelector.vue';
import {
  normalizeSelectorBlock,
  type MEditorSelectorProps
} from '@/editors/blocks/mEditorSelectorEditorTool';

const props = withDefaults(defineProps<MFormItemProps & {
  onChange?: (payload: MFormItemProps) => void;
  onToolChange?: (payload: MFormItemProps) => void;
}>(), {
  edit: true,
  editor: undefined,
  layout: 'Vertical'
});

const selectorExcludeToolNames = ['MFormItem', 'MForm'];
const formItem = reactive(normalizeFormItemProps({ ...props, edit: true }));

function emitChange() {
  const payload: MFormItemProps = {
    edit: true,
    labelName: formItem.labelName,
    variableName: formItem.variableName,
    editor: cloneEditorBlock(formItem.editor),
    layout: normalizeLayout(formItem.layout)
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function updateFormItem(payload: Partial<MFormItemProps>) {
  if (payload.labelName !== undefined) formItem.labelName = payload.labelName;
  if (payload.variableName !== undefined) formItem.variableName = payload.variableName;
  if ('editor' in payload) formItem.editor = normalizeSelectorBlock(payload.editor);
  if (payload.layout !== undefined) formItem.layout = normalizeLayout(payload.layout);
  emitChange();
}

function handleEditorChange(payload: MEditorSelectorProps) {
  updateFormItem({ editor: payload.value });
}

watch(
  () => ({
    labelName: props.labelName,
    variableName: props.variableName,
    editor: props.editor,
    layout: props.layout
  }),
  (value) => Object.assign(formItem, normalizeFormItemProps({ ...value, edit: true }, formItem.variableName)),
  { deep: true }
);
</script>

<template>
  <div class="m-form-item-editor" data-testid="form-item-edit-shell">
    <MFormItemRenderer
      :edit="true"
      :label-name="formItem.labelName"
      :variable-name="formItem.variableName"
      :editor="formItem.editor"
      :layout="formItem.layout"
    >
      <template #control>
        <MEditorSelector
          :edit="true"
          :value="formItem.editor"
          :exclude-tool-names="selectorExcludeToolNames"
          :on-change="handleEditorChange"
        />
      </template>
    </MFormItemRenderer>
  </div>
</template>

<style scoped>
.m-form-item-editor {
  width: 100%;
  border: 1px dashed rgb(148 163 184 / 0.7);
  border-radius: 8px;
  padding: 8px;
}
.dark .m-form-item-editor { border-color: rgb(71 85 105 / 0.9); }
</style>
