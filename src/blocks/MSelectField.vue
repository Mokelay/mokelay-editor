<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { createPageDslFieldId, normalizeOptions, normalizeValue, stringValue, type PageDslOption } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';
import { isVariableValueConfig } from '@/utils/variableValue';

export interface MSelectFieldProps {
  edit: boolean;
  id?: string;
  placeholder?: string;
  value?: unknown;
  options?: unknown;
  optionLabelField?: string;
  optionValueField?: string;
  required?: boolean;
  disabled?: boolean;
}

const selectFieldDefaults = {
  placeholder: '请选择',
  value: '',
  options: [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' }
  ] as PageDslOption[]
};

function normalizeSelectFieldProps(props: Partial<MSelectFieldProps>): MSelectFieldProps {
  const merged = {
    ...selectFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    placeholder: stringValue(merged.placeholder, selectFieldDefaults.placeholder),
    value: normalizeValue(merged.value, selectFieldDefaults.value),
    options: isVariableValueConfig(merged.options)
      ? JSON.parse(JSON.stringify(merged.options)) as unknown
      : normalizeOptions(merged.options, selectFieldDefaults.options, {
          labelField: stringValue(merged.optionLabelField, 'label'),
          valueField: stringValue(merged.optionValueField, 'value')
        }),
    optionLabelField: stringValue(merged.optionLabelField, 'label'),
    optionValueField: stringValue(merged.optionValueField, 'value'),
    required: merged.required === true,
    disabled: merged.disabled === true
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MSelectField",
 *   "displayName": "下拉选择",
 *   "category": "form",
 *   "description": "下拉选择表单字段，支持静态 PageDslOption[] 或 VariableValueConfig 动态选项。预览运行时会先解析变量，再通过 optionLabelField/optionValueField 点路径把任意对象数组映射为标准选项；选择值可被 MForm、getData 和 blocks[blockId].value 读取。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MSelectField",
 *     "toolSymbol": "mSelectFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 320
 *   },
 *   "toolbox": {
 *     "title": "下拉选择",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "请选择",
 *     "value": "",
 *     "optionLabelField": "label",
 *     "optionValueField": "value",
 *     "required": false,
 *     "disabled": false,
 *     "options": [
 *       {
 *         "label": "选项 A",
 *         "value": "a"
 *       },
 *       {
 *         "label": "选项 B",
 *         "value": "b"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text",
 *       "defaultValue": "请选择",
 *       "description": "当选项中没有 value='' 时自动插入的空选项文案。"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text",
 *       "defaultValue": "",
 *       "description": "当前选择值；string 或 number 会转换为 select 使用的 string，其他类型显示为空值。"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[] | VariableValueConfig",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项",
 *       "type": "component",
 *       "component": "MVariableValueEditor",
 *       "description": "静态选项数组，或由 MVariableValueEditor 生成的变量配置。变量必须在渲染前解析为数组；非数组结果显示为空选项集。"
 *     },
 *     {
 *       "key": "optionLabelField",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项标签字段",
 *       "type": "text",
 *       "defaultValue": "label",
 *       "description": "动态对象项中用作显示文本的点路径，例如 app.profile.name。缺失时回退到 value 字段或选项序号。"
 *     },
 *     {
 *       "key": "optionValueField",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项值字段",
 *       "type": "text",
 *       "defaultValue": "value",
 *       "description": "动态对象项中用作提交值的点路径；number 会转为 string，无法映射时使用 option_N。"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "必填",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "设置原生 select.required；表单提交时由 MForm/浏览器校验空值。"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "禁用原生 select，阻止用户修改。"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID",
 *       "description": "作为 MForm 字段 key 和 DOM id；为空时仅生成组件本地 DOM id。"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string }",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "description": "优先读取原生 select 当前值；组件尚未挂载时返回 props.value 的 string 形式。供 MForm 与 call_block_method 读取。",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "description": "当前选择值；动态选项也只暴露映射后的 string value。"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存 id、placeholder、value、options；optionLabelField/optionValueField 仅偏离默认值时保存，required/disabled 仅为 true 时保存。VariableValueConfig 保持原结构，不保存解析结果。"
 *     },
 *     {
 *       "key": "optionFieldMapping",
 *       "type": "behavior",
 *       "description": "静态或动态对象数组通过 optionLabelField 与 optionValueField 映射显示文本和提交值，两个字段均支持点路径。标准 { label, value } 数组无需额外配置。"
 *     },
 *     {
 *       "key": "dynamicResolution",
 *       "type": "behavior",
 *       "description": "VariableValueConfig 由 EditorPreviewBlock/页面变量运行时解析；MSelectField 组件最终只消费 PageDslOption[]，解析失败或结果非数组时安全降级为空数组。"
 *     },
 *     {
 *       "key": "placeholderOption",
 *       "type": "behavior",
 *       "description": "映射后的 options 不含空 string value 时自动补充 placeholder 空选项；已有空值选项时不重复添加。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MSelectField-example",
 *       "type": "MSelectField",
 *       "data": {
 *         "value": "",
 *         "options": [
 *           {
 *             "label": "选项 A",
 *             "value": "a"
 *           },
 *           {
 *             "label": "选项 B",
 *             "value": "b"
 *           }
 *         ]
 *       }
 *     },
 *     {
 *       "id": "MSelectField-dynamic-options",
 *       "type": "MSelectField",
 *       "data": {
 *         "placeholder": "请选择 APP",
 *         "options": {
 *           "mode": "variable",
 *           "source": "MPage",
 *           "pageId": "page_uuid",
 *           "variable": "dataSources.apps.apps"
 *         },
 *         "optionLabelField": "alias",
 *         "optionValueField": "uuid",
 *         "required": true
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mSelectFieldEditorTool = defineEditorTool<MSelectFieldProps>({
  getDataFields: () => valueBlockDataField('string'),
  normalizeProps: normalizeSelectFieldProps,
  serialize: (props) => {
    const normalized = normalizeSelectFieldProps(props);
    return {
      ...(normalized.id ? { id: normalized.id } : {}),
      placeholder: normalized.placeholder,
      value: normalized.value,
      options: normalized.options,
      ...(normalized.optionLabelField !== 'label' ? { optionLabelField: normalized.optionLabelField } : {}),
      ...(normalized.optionValueField !== 'value' ? { optionValueField: normalized.optionValueField } : {}),
      ...(normalized.required ? { required: true } : {}),
      ...(normalized.disabled ? { disabled: true } : {})
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MSelectFieldProps & PageDslCallbacks<MSelectFieldProps>>();

const localFieldId = createPageDslFieldId();
const selectRef = ref<HTMLSelectElement | null>(null);
const fieldId = computed(() => props.id || localFieldId);
const options = computed(() => Array.isArray(props.options) ? props.options : []);
const hasEmptyOption = computed(() => options.value.some((option) => option.value === ''));
const fieldPlaceholder = computed(() => props.placeholder || selectFieldDefaults.placeholder);
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});

function optionValue(index: number) {
  const value = options.value[index]?.value;
  return typeof value === 'string' ? value : `option_${index + 1}`;
}

function emitChange(payload: Partial<MSelectFieldProps>) {
  const nextPayload = normalizeSelectFieldProps({
    edit: props.edit,
    id: props.id,
    placeholder: props.placeholder,
    value: props.value,
    options: props.options,
    optionLabelField: props.optionLabelField,
    optionValueField: props.optionValueField,
    required: props.required,
    disabled: props.disabled,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function getData() {
  return {
    value: selectRef.value?.value ?? stringInputValue.value
  };
}

defineExpose({
  getData
});
</script>

<template>
  <PageDslBlock block-type="MSelectField">
    <div class="page-dsl-field">
      <select
        ref="selectRef"
        :id="fieldId"
        class="page-dsl-control"
        :value="stringInputValue"
        :required="required"
        :disabled="disabled"
        @change="emitChange({ value: ($event.target as HTMLSelectElement).value })"
      >
        <option v-if="!hasEmptyOption" value="">{{ fieldPlaceholder }}</option>
        <option v-for="(option, index) in options" :key="optionValue(index)" :value="optionValue(index)">
          {{ option.label }}
        </option>
      </select>
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

.dark .page-dsl-control {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
