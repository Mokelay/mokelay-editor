<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { createPageDslFieldId, normalizeOptions, normalizeValue, stringValue, type PageDslOption } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MRadioGroupFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  options?: PageDslOption[];
}

const radioGroupFieldDefaults = {
  value: '',
  options: [
    { label: '非常符合', value: 'high' },
    { label: '一般', value: 'medium' },
    { label: '不符合', value: 'low' }
  ] as PageDslOption[]
};

function normalizeRadioGroupFieldProps(props: Partial<MRadioGroupFieldProps>): MRadioGroupFieldProps {
  const merged = {
    ...radioGroupFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    value: normalizeValue(merged.value, radioGroupFieldDefaults.value),
    options: normalizeOptions(merged.options, radioGroupFieldDefaults.options)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MRadioGroupField",
 *   "displayName": "单选题",
 *   "category": "form",
 *   "description": "单选题表单字段，支持选项、默认值和必填校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MRadioGroupField",
 *     "toolSymbol": "mRadioGroupFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 330
 *   },
 *   "toolbox": {
 *     "title": "单选题",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": "",
 *     "options": [
 *       {
 *         "label": "非常符合",
 *         "value": "high"
 *       },
 *       {
 *         "label": "一般",
 *         "value": "medium"
 *       },
 *       {
 *         "label": "不符合",
 *         "value": "low"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MRadioGroupField.vue",
 *       "line": 19,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MRadioGroupField.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MRadioGroupField.vue",
 *       "line": 18,
 *       "declaredInProps": true,
 *       "configurable": false
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MRadioGroupField.vue"
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
 *       "id": "MRadioGroupField-example",
 *       "type": "MRadioGroupField",
 *       "data": {
 *         "value": "",
 *         "options": [
 *           {
 *             "label": "非常符合",
 *             "value": "high"
 *           },
 *           {
 *             "label": "一般",
 *             "value": "medium"
 *           },
 *           {
 *             "label": "不符合",
 *             "value": "low"
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MRadioGroupField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MRadioGroupField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRadioGroupFieldEditorTool = defineEditorTool<MRadioGroupFieldProps>({
  getDataFields: () => valueBlockDataField('string'),
  normalizeProps: normalizeRadioGroupFieldProps,
  serialize: (props) => {
    const normalized = normalizeRadioGroupFieldProps(props);
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

const props = defineProps<MRadioGroupFieldProps & PageDslCallbacks<MRadioGroupFieldProps>>();

const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || localFieldId);
const options = computed(() => Array.isArray(props.options) ? props.options : []);
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});

function optionValue(index: number) {
  return options.value[index]?.value || `option_${index + 1}`;
}

function isSelected(value: string) {
  return stringInputValue.value === value;
}

function emitChange(payload: Partial<MRadioGroupFieldProps>) {
  const nextPayload = normalizeRadioGroupFieldProps({
    edit: props.edit,
    id: props.id,
    value: props.value,
    options: props.options,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}
</script>

<template>
  <PageDslBlock block-type="MRadioGroupField">
    <div class="page-dsl-field">
      <div class="page-dsl-options">
        <label v-for="(option, index) in options" :key="optionValue(index)" class="page-dsl-option">
          <input
            type="radio"
            :name="fieldId"
            :value="optionValue(index)"
            :checked="isSelected(optionValue(index))"
            @change="emitChange({ value: optionValue(index) })"
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
