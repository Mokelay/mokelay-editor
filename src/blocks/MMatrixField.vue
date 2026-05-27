<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  choiceIcon,
  createPageDslFieldId,
  jsonValueField,
  normalizeMatrixRows,
  normalizeOptions,
  normalizeValue,
  optionField,
  pageDslPropertyTitle,
  stringValue,
  type PageDslMatrixRow,
  type PageDslOption
} from '@/blocks/pageDslEditorTools';

export interface MMatrixFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  rows?: PageDslMatrixRow[];
  options?: PageDslOption[];
}

const matrixFieldTitle = '矩阵题';
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

export const mMatrixFieldEditorTool = defineEditorTool<MMatrixFieldProps>({
  toolbox: {
    title: matrixFieldTitle,
    icon: choiceIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(matrixFieldTitle);
    },
    fields: [jsonValueField, { key: 'rows', label: '行 JSON', type: 'textarea', valueType: 'json' }, optionField]
  },
  createInitialProps: () => ({
    value: {},
    rows: [...matrixFieldDefaults.rows],
    options: [...matrixFieldDefaults.options]
  }),
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

:global(.dark) .page-dsl-matrix th,
:global(.dark) .page-dsl-matrix td {
  border-color: rgb(51 65 85);
}
</style>
