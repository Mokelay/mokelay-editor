<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';

import { valueBlockDataField } from '@/blocks/blockDataFields';

// 输入框组件在编辑器中的属性定义。
export interface MInputProps {
  edit: boolean;
  currentBlockId?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

function normalizeMaxLength(value: unknown) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : 0;
  const normalized = Math.trunc(parsed);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : undefined;
}

function normalizeInputProps(props: Partial<MInputProps>): MInputProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: normalizeString(props.currentBlockId),
    id: normalizeString(props.id),
    placeholder: normalizeString(props.placeholder),
    value: normalizeString(props.value),
    required: normalizeBoolean(props.required),
    maxLength: normalizeMaxLength(props.maxLength),
    disabled: normalizeBoolean(props.disabled)
  };
}

// 输入框工具定义：提供工具箱信息、属性面板、默认值和保存规则。
/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MInput",
 *   "displayName": "输入框",
 *   "category": "form",
 *   "description": "输入框，支持标签、占位符、输入类型、禁用状态和受控值。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MInput",
 *     "toolSymbol": "mInputEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 70
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "输入框",
 *       "en": "Input"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" ry=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": {
 *       "zh": "请输入.....",
 *       "en": "Please enter..."
 *     },
 *     "value": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 63,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "请输入.....",
 *         "en": "Please enter..."
 *       }
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 68,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "默认值",
 *       "type": "component",
 *       "placeholder": {
 *         "zh": "请输入默认值",
 *         "en": "Please enter a default value"
 *       },
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 10,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 13,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "必填"
 *     },
 *     {
 *       "key": "maxLength",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 14,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "最大长度"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 15,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 135,
 *       "label": "聚焦"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "line": 136,
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MInput.vue"
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
 *       "id": "MInput-example",
 *       "type": "MInput",
 *       "data": {
 *         "placeholder": {
 *           "zh": "请输入.....",
 *           "en": "Please enter..."
 *         },
 *         "value": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MInput.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mInputEditorTool = defineEditorTool<MInputProps>({
  getDataFields: () => valueBlockDataField('string'),
  normalizeProps: normalizeInputProps,
  serialize: (props) => {
    const normalized = normalizeInputProps(props);
    return {
      ...(normalized.id ? { id: normalized.id } : {}),
      placeholder: normalized.placeholder,
      value: normalized.value,
      ...(normalized.required ? { required: true } : {}),
      ...(normalized.maxLength ? { maxLength: normalized.maxLength } : {}),
      ...(normalized.disabled ? { disabled: true } : {})
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<MInputProps & {
  onChange?: (payload: MInputProps) => void;
  onToolChange?: (payload: MInputProps) => void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const inputDomId = computed(() => props.id || props.currentBlockId || '');

// 组件内任意字段变更后，向外抛出完整 payload，保持工具状态一致。
function emitChange(payload: Partial<MInputProps>) {
  const nextPayload = normalizeInputProps({
    edit: props.edit,
    currentBlockId: props.currentBlockId,
    id: props.id,
    placeholder: props.placeholder,
    value: props.value,
    required: props.required,
    maxLength: props.maxLength,
    disabled: props.disabled,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function focus() {
  inputRef.value?.focus();
}

function getData() {
  return {
    value: inputRef.value?.value ?? props.value ?? ''
  };
}

defineExpose({
  focus,
  getData
});
</script>

<template>
  <div class="ce-input-tool" data-testid="editor-input-tool">
    <input
      ref="inputRef"
      :id="inputDomId || undefined"
      :data-testid="inputDomId || 'editor-input-control'"
      class="ce-input-tool__control"
      type="text"
      :placeholder="placeholder"
      :value="value"
      :required="required"
      :maxlength="maxLength"
      :disabled="disabled"
      @input="emitChange({ value: ($event.target as HTMLInputElement).value })"
    />
  </div>
</template>

<style scoped>
.ce-input-tool {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-input-tool__control {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 8px;
  padding: 8px 10px;
  background-color: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-input-tool__control:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

.ce-input-tool__control:disabled {
  cursor: not-allowed;
  background-color: rgb(241 245 249);
  color: rgb(100 116 139);
}

.dark .ce-input-tool__control {
  background-color: rgb(15 23 42);
  color: rgb(226 232 240);
  border-color: rgb(71 85 105 / 0.9);
}

.dark .ce-input-tool__control:disabled {
  background-color: rgb(30 41 59);
  color: rgb(148 163 184);
}
</style>
