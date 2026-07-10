<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { createPageDslFieldId, normalizeOptions, normalizeValue, stringValue, type PageDslOption } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MSelectFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  options?: PageDslOption[];
}

const selectFieldDefaults = {
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
    value: normalizeValue(merged.value, selectFieldDefaults.value),
    options: normalizeOptions(merged.options, selectFieldDefaults.options)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MSelectField",
 *   "displayName": "下拉选择",
 *   "category": "form",
 *   "description": "下拉选择表单字段，支持选项、占位符、默认值和必填校验。",
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
 *     "value": "",
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
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue",
 *       "line": 18,
 *       "declaredInProps": true,
 *       "configurable": false
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "{ value: string }",
 *       "description": "返回当前选择值，供 MForm 与页面动作读取。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MSelectField.vue"
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
      value: normalized.value,
      options: normalized.options
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
    value: props.value,
    options: props.options,
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
        @change="emitChange({ value: ($event.target as HTMLSelectElement).value })"
      >
        <option v-if="!hasEmptyOption" value="">请选择</option>
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
