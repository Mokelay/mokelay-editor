<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { createPageDslFieldId, normalizeMatrixRows, normalizeOptions, normalizeValue, stringValue, type PageDslMatrixRow, type PageDslOption } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MMatrixFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  rows?: PageDslMatrixRow[];
  options?: PageDslOption[];
}

const matrixFieldDefaults = {
  value: {},
  rows: [
    { label: '产品体验', value: 'product' },
    { label: '服务响应', value: 'service' }
  ] as PageDslMatrixRow[],
  options: [
    { label: '不满意', value: 'bad' },
    { label: '一般', value: 'neutral' },
    { label: '满意', value: 'good' }
  ] as PageDslOption[]
};

function normalizeMatrixFieldProps(props: Partial<MMatrixFieldProps>): MMatrixFieldProps {
  const merged = {
    ...matrixFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    value: normalizeValue(merged.value, matrixFieldDefaults.value),
    rows: normalizeMatrixRows(merged.rows, matrixFieldDefaults.rows),
    options: normalizeOptions(merged.options, matrixFieldDefaults.options)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MMatrixField",
 *   "displayName": "矩阵题",
 *   "category": "form",
 *   "description": "矩阵题表单字段，支持行列选项与二维答案收集。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MMatrixField",
 *     "toolSymbol": "mMatrixFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 390
 *   },
 *   "toolbox": {
 *     "title": "矩阵题",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": {},
 *     "rows": [
 *       {
 *         "label": "产品体验",
 *         "value": "product"
 *       },
 *       {
 *         "label": "服务响应",
 *         "value": "service"
 *       }
 *     ],
 *     "options": [
 *       {
 *         "label": "不满意",
 *         "value": "bad"
 *       },
 *       {
 *         "label": "一般",
 *         "value": "neutral"
 *       },
 *       {
 *         "label": "满意",
 *         "value": "good"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MMatrixField.vue",
 *       "line": 21,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "PageDslMatrixRow[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MMatrixField.vue",
 *       "line": 64,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行 JSON",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MMatrixField.vue",
 *       "line": 23,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MMatrixField.vue",
 *       "line": 20,
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
 *       "dataType": "object",
 *       "source": "submodule/mokelay-editor/src/blocks/MMatrixField.vue"
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
 *       "id": "MMatrixField-example",
 *       "type": "MMatrixField",
 *       "data": {
 *         "value": {},
 *         "rows": [
 *           {
 *             "label": "产品体验",
 *             "value": "product"
 *           },
 *           {
 *             "label": "服务响应",
 *             "value": "service"
 *           }
 *         ],
 *         "options": [
 *           {
 *             "label": "不满意",
 *             "value": "bad"
 *           },
 *           {
 *             "label": "一般",
 *             "value": "neutral"
 *           },
 *           {
 *             "label": "满意",
 *             "value": "good"
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MMatrixField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MMatrixField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mMatrixFieldEditorTool = defineEditorTool<MMatrixFieldProps>({
  getDataFields: () => valueBlockDataField('object'),
  normalizeProps: normalizeMatrixFieldProps,
  serialize: (props) => {
    const normalized = normalizeMatrixFieldProps(props);
    return {
      value: normalized.value,
      rows: normalized.rows,
      options: normalized.options
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MMatrixFieldProps & PageDslCallbacks<MMatrixFieldProps>>();

const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || localFieldId);
const options = computed(() => Array.isArray(props.options) ? props.options : []);
const matrixRows = computed(() => Array.isArray(props.rows) ? props.rows : []);
const matrixValue = computed<Record<string, unknown>>(() => (
  typeof props.value === 'object' && props.value !== null && !Array.isArray(props.value)
    ? props.value as Record<string, unknown>
    : {}
));

function optionValue(index: number) {
  return options.value[index]?.value || `option_${index + 1}`;
}

function emitChange(payload: Partial<MMatrixFieldProps>) {
  const nextPayload = normalizeMatrixFieldProps({
    edit: props.edit,
    id: props.id,
    value: props.value,
    rows: props.rows,
    options: props.options,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function updateMatrixValue(rowValue: string, optionValue: string) {
  emitChange({
    value: {
      ...matrixValue.value,
      [rowValue]: optionValue
    }
  });
}

function isMatrixSelected(rowValue: string, optionValue: string) {
  return String(matrixValue.value[rowValue] ?? '') === optionValue;
}
</script>

<template>
  <PageDslBlock block-type="MMatrixField">
    <div class="page-dsl-field">
      <div class="page-dsl-matrix-wrap">
        <table class="page-dsl-matrix">
          <thead>
            <tr>
              <th></th>
              <th v-for="(option, index) in options" :key="optionValue(index)">{{ option.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in matrixRows" :key="row.value">
              <th>{{ row.label }}</th>
              <td v-for="(option, index) in options" :key="`${row.value}-${optionValue(index)}`">
                <input
                  type="radio"
                  :name="`${fieldId}-${row.value}`"
                  :value="optionValue(index)"
                  :checked="isMatrixSelected(row.value, optionValue(index))"
                  @change="updateMatrixValue(row.value, optionValue(index))"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-field {
  display: grid;
  gap: 8px;
}

.page-dsl-matrix-wrap {
  overflow-x: auto;
}

.page-dsl-matrix {
  min-width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.page-dsl-matrix th,
.page-dsl-matrix td {
  border-bottom: 1px solid rgb(226 232 240);
  padding: 8px;
  text-align: center;
}

.page-dsl-matrix th:first-child {
  text-align: left;
}

.dark .page-dsl-matrix th,
.dark .page-dsl-matrix td {
  border-color: rgb(51 65 85);
}
</style>
