<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { createPageDslFieldId, normalizeValue, numberValue, stringValue } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MTextareaFieldProps {
  edit: boolean;
  currentBlockId?: string;
  id?: string;
  placeholder?: string;
  value?: unknown;
  rows?: number;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

const textareaFieldDefaults = {
  placeholder: '请输入详细说明',
  value: '',
  rows: 4
} as const;

function normalizeTextareaFieldProps(props: Partial<MTextareaFieldProps>): MTextareaFieldProps {
  const merged = {
    ...textareaFieldDefaults,
    ...props
  };
  const maxLength = numberValue(merged.maxLength, 0);

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(merged.currentBlockId),
    id: stringValue(merged.id),
    placeholder: stringValue(merged.placeholder),
    value: normalizeValue(merged.value, textareaFieldDefaults.value),
    rows: numberValue(merged.rows, textareaFieldDefaults.rows),
    required: merged.required === true,
    maxLength: maxLength > 0 ? maxLength : undefined,
    disabled: merged.disabled === true
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTextareaField",
 *   "displayName": "多行文本",
 *   "category": "form",
 *   "description": "多行文本表单字段，支持行数、占位符、默认值和校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MTextareaField",
 *     "toolSymbol": "mTextareaFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 290
 *   },
 *   "toolbox": {
 *     "title": "多行文本",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "请输入详细说明",
 *     "value": "",
 *     "rows": 4
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 18,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 19,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 62,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 17,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 21,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "必填"
 *     },
 *     {
 *       "key": "maxLength",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 22,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "最大长度"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 23,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "禁用"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "focus",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 134,
 *       "label": "聚焦"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "line": 135,
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MTextareaField.vue"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MTextareaField-example",
 *       "type": "MTextareaField",
 *       "data": {
 *         "placeholder": "请输入详细说明",
 *         "value": "",
 *         "rows": 4
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MTextareaField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTextareaFieldEditorTool = defineEditorTool<MTextareaFieldProps>({
  getDataFields: () => valueBlockDataField('string'),
  normalizeProps: normalizeTextareaFieldProps,
  serialize: (props) => {
    const normalized = normalizeTextareaFieldProps(props);
    return {
      ...(normalized.id ? { id: normalized.id } : {}),
      placeholder: normalized.placeholder,
      value: normalized.value,
      rows: normalized.rows,
      ...(normalized.required ? { required: true } : {}),
      ...(normalized.maxLength ? { maxLength: normalized.maxLength } : {}),
      ...(normalized.disabled ? { disabled: true } : {})
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MTextareaFieldProps & PageDslCallbacks<MTextareaFieldProps>>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || props.currentBlockId || localFieldId);
const fieldPlaceholder = computed(() => props.placeholder || '');
const textareaRows = computed(() => {
  const rows = Number(props.rows);
  return Number.isFinite(rows) && rows > 0 ? rows : 4;
});
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});

function emitChange(payload: Partial<MTextareaFieldProps>) {
  const nextPayload = normalizeTextareaFieldProps({
    edit: props.edit,
    currentBlockId: props.currentBlockId,
    id: props.id,
    placeholder: props.placeholder,
    value: props.value,
    rows: props.rows,
    required: props.required,
    maxLength: props.maxLength,
    disabled: props.disabled,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function focus() {
  textareaRef.value?.focus();
}

function getData() {
  return {
    value: textareaRef.value?.value ?? stringInputValue.value
  };
}

defineExpose({
  focus,
  getData
});
</script>

<template>
  <PageDslBlock block-type="MTextareaField">
    <div class="page-dsl-field">
      <textarea
        ref="textareaRef"
        :id="fieldId"
        :data-testid="fieldId"
        class="page-dsl-control"
        :rows="textareaRows"
        :placeholder="fieldPlaceholder"
        :value="stringInputValue"
        :required="required"
        :maxlength="maxLength"
        :disabled="disabled"
        @input="emitChange({ value: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-field {
  display: grid;
  gap: 8px;
}

.page-dsl-control {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 9px 11px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.page-dsl-control:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.14);
}

.page-dsl-control:disabled {
  cursor: not-allowed;
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.dark .page-dsl-control {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .page-dsl-control:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}
</style>
