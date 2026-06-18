<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  choiceIcon,
  createPageDslFieldId,
  normalizeOptions,
  normalizeValue,
  optionField,
  pageDslPropertyTitle,
  stringValue,
  valueField,
  type PageDslOption
} from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MSelectFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  options?: PageDslOption[];
}

const selectFieldTitle = '下拉选择';
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

export const mSelectFieldEditorTool = defineEditorTool<MSelectFieldProps>({
  toolbox: {
    title: selectFieldTitle,
    icon: choiceIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(selectFieldTitle);
    },
    fields: [valueField, optionField]
  },
  createInitialProps: () => ({
    value: selectFieldDefaults.value,
    options: [...selectFieldDefaults.options]
  }),
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
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MSelectFieldProps & PageDslCallbacks<MSelectFieldProps>>();

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
</script>

<template>
  <PageDslBlock block-type="MSelectField">
    <div class="page-dsl-field">
      <select
        :id="fieldId"
        class="page-dsl-control"
        :value="stringInputValue"
        @change="emitChange({ value: ($event.target as HTMLSelectElement).value })"
      >
        <option value="">请选择</option>
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

:global(.dark) .page-dsl-control {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
