<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { booleanValue, createPageDslFieldId, normalizeOptions, normalizeValue, stringValue, type PageDslOption } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MImageChoiceFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  multiple?: boolean;
  options?: PageDslOption[];
}

const imageChoiceFieldDefaults = {
  value: [] as unknown[],
  multiple: false,
  options: [
    { label: '简洁', value: 'clean', imageUrl: '' },
    { label: '活泼', value: 'playful', imageUrl: '' }
  ] as PageDslOption[]
};

function normalizeImageChoiceFieldProps(props: Partial<MImageChoiceFieldProps>): MImageChoiceFieldProps {
  const merged = {
    ...imageChoiceFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    value: normalizeValue(merged.value, imageChoiceFieldDefaults.value),
    multiple: booleanValue(merged.multiple),
    options: normalizeOptions(merged.options, imageChoiceFieldDefaults.options)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MImageChoiceField",
 *   "displayName": "图片选择",
 *   "category": "form",
 *   "description": "图片选择表单字段，使用图片选项收集单选或多选结果。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MImageChoiceField",
 *     "toolSymbol": "mImageChoiceFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 360
 *   },
 *   "toolbox": {
 *     "title": "图片选择",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": [],
 *     "multiple": false,
 *     "options": [
 *       {
 *         "label": "简洁",
 *         "value": "clean",
 *         "imageUrl": ""
 *       },
 *       {
 *         "label": "活泼",
 *         "value": "playful",
 *         "imageUrl": ""
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MImageChoiceField.vue",
 *       "line": 20,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "multiple",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MImageChoiceField.vue",
 *       "line": 59,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许多选",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MImageChoiceField.vue",
 *       "line": 22,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MImageChoiceField.vue",
 *       "line": 19,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MImageChoiceField-example",
 *       "type": "MImageChoiceField",
 *       "data": {
 *         "value": [],
 *         "multiple": false,
 *         "options": [
 *           {
 *             "label": "简洁",
 *             "value": "clean",
 *             "imageUrl": ""
 *           },
 *           {
 *             "label": "活泼",
 *             "value": "playful",
 *             "imageUrl": ""
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MImageChoiceField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MImageChoiceField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mImageChoiceFieldEditorTool = defineEditorTool<MImageChoiceFieldProps>({
  getDataFields: (context) => valueBlockDataField(context.data.multiple === true ? 'array' : 'string'),
  normalizeProps: normalizeImageChoiceFieldProps,
  serialize: (props) => {
    const normalized = normalizeImageChoiceFieldProps(props);
    return {
      value: normalized.value,
      multiple: normalized.multiple,
      options: normalized.options
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MImageChoiceFieldProps & PageDslCallbacks<MImageChoiceFieldProps>>();

const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || localFieldId);
const options = computed(() => Array.isArray(props.options) ? props.options : []);
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});
const selectedValues = computed(() => Array.isArray(props.value) ? props.value.map(String) : []);

function optionValue(index: number) {
  return options.value[index]?.value || `option_${index + 1}`;
}

function isSelected(value: string) {
  if (Array.isArray(props.value)) {
    return selectedValues.value.includes(value);
  }
  return stringInputValue.value === value;
}

function emitChange(payload: Partial<MImageChoiceFieldProps>) {
  const nextPayload = normalizeImageChoiceFieldProps({
    edit: props.edit,
    id: props.id,
    value: props.value,
    multiple: props.multiple,
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
  <PageDslBlock block-type="MImageChoiceField">
    <div class="page-dsl-field">
      <div class="page-dsl-image-options">
        <label v-for="(option, index) in options" :key="optionValue(index)" class="page-dsl-image-option">
          <input
            :type="multiple ? 'checkbox' : 'radio'"
            :name="fieldId"
            :value="optionValue(index)"
            :checked="isSelected(optionValue(index))"
            @change="multiple ? toggleArrayValue(optionValue(index), ($event.target as HTMLInputElement).checked) : emitChange({ value: optionValue(index) })"
          />
          <img v-if="option.imageUrl" :src="option.imageUrl" :alt="option.label" />
          <span v-else class="page-dsl-image-option__placeholder">图片</span>
          <strong>{{ option.label }}</strong>
        </label>
      </div>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-field {
  display: grid;
  gap: 8px;
}

.page-dsl-image-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.page-dsl-image-option {
  display: grid;
  gap: 8px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
}

.page-dsl-image-option input {
  justify-self: start;
}

.page-dsl-image-option img {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  object-fit: cover;
}

.page-dsl-image-option__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 1px dashed rgb(148 163 184);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(100 116 139);
  font-size: 13px;
}

.dark .page-dsl-image-option {
  border-color: rgb(51 65 85);
}

.dark .page-dsl-image-option__placeholder {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}
</style>
