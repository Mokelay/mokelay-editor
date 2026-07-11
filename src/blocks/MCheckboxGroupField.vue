<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { createPageDslFieldId, normalizeOptions, normalizeValue, stringValue, type PageDslOption } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MCheckboxGroupFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  options?: PageDslOption[];
}

const checkboxGroupFieldDefaults = {
  value: [] as unknown[],
  options: [
    { label: '产品演示', value: 'demo' },
    { label: '价格咨询', value: 'pricing' },
    { label: '技术支持', value: 'support' }
  ] as PageDslOption[]
};

function normalizeCheckboxGroupFieldProps(props: Partial<MCheckboxGroupFieldProps>): MCheckboxGroupFieldProps {
  const merged = {
    ...checkboxGroupFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    value: normalizeValue(merged.value, checkboxGroupFieldDefaults.value),
    options: normalizeOptions(merged.options, checkboxGroupFieldDefaults.options)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MCheckboxGroupField",
 *   "displayName": "多选题",
 *   "category": "form",
 *   "description": "多选题表单字段，支持选项、必填校验、帮助信息和多值结果。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MCheckboxGroupField",
 *     "toolSymbol": "mCheckboxGroupFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 350
 *   },
 *   "toolbox": {
 *     "title": "多选题",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": [],
 *     "options": [
 *       {
 *         "label": "产品演示",
 *         "value": "demo"
 *       },
 *       {
 *         "label": "价格咨询",
 *         "value": "pricing"
 *       },
 *       {
 *         "label": "技术支持",
 *         "value": "support"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MCheckboxGroupField.vue",
 *       "line": 19,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MCheckboxGroupField.vue",
 *       "line": 20,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项 JSON",
 *       "validationMessage": "请输入有效选项 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MCheckboxGroupField.vue",
 *       "line": 18,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-editor/src/blocks/MCheckboxGroupField.vue"
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
 *       "id": "MCheckboxGroupField-example",
 *       "type": "MCheckboxGroupField",
 *       "data": {
 *         "value": [],
 *         "options": [
 *           {
 *             "label": "产品演示",
 *             "value": "demo"
 *           },
 *           {
 *             "label": "价格咨询",
 *             "value": "pricing"
 *           },
 *           {
 *             "label": "技术支持",
 *             "value": "support"
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MCheckboxGroupField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MCheckboxGroupField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mCheckboxGroupFieldEditorTool = defineEditorTool<MCheckboxGroupFieldProps>({
  getDataFields: () => valueBlockDataField('array'),
  normalizeProps: normalizeCheckboxGroupFieldProps,
  serialize: (props) => {
    const normalized = normalizeCheckboxGroupFieldProps(props);
    return {
      value: normalized.value,
      options: normalized.options
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MCheckboxGroupFieldProps & PageDslCallbacks<MCheckboxGroupFieldProps>>();

const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || localFieldId);
const options = computed(() => Array.isArray(props.options) ? props.options : []);
const selectedValues = computed(() => Array.isArray(props.value) ? props.value.map(String) : []);

function optionValue(index: number) {
  return options.value[index]?.value || `option_${index + 1}`;
}

function isSelected(value: string) {
  return selectedValues.value.includes(value);
}

function emitChange(payload: Partial<MCheckboxGroupFieldProps>) {
  const nextPayload = normalizeCheckboxGroupFieldProps({
    edit: props.edit,
    id: props.id,
    value: props.value,
    options: props.options,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function toggleArrayValue(value: string, checked: boolean) {
  const nextValues = new Set(selectedValues.value);
  if (checked) {
    nextValues.add(value);
  } else {
    nextValues.delete(value);
  }
  emitChange({ value: Array.from(nextValues) });
}
</script>

<template>
  <PageDslBlock block-type="MCheckboxGroupField">
    <div class="page-dsl-field">
      <div class="page-dsl-options">
        <label v-for="(option, index) in options" :key="optionValue(index)" class="page-dsl-option">
          <input
            type="checkbox"
            :name="fieldId"
            :value="optionValue(index)"
            :checked="isSelected(optionValue(index))"
            @change="toggleArrayValue(optionValue(index), ($event.target as HTMLInputElement).checked)"
          />
          <span>
            <strong>{{ option.label }}</strong>
            <small v-if="option.description">{{ option.description }}</small>
          </span>
        </label>
      </div>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-field,
.page-dsl-options {
  display: grid;
  gap: 8px;
}

.page-dsl-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 9px 11px;
  font-size: 14px;
}

.page-dsl-option input {
  margin-top: 3px;
}

.page-dsl-option strong,
.page-dsl-option small {
  display: block;
}

.page-dsl-option small {
  margin-top: 2px;
  color: rgb(100 116 139);
  font-size: 12px;
}

.dark .page-dsl-option {
  border-color: rgb(51 65 85);
}
</style>
