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

export interface MRadioGroupFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  options?: PageDslOption[];
}

const radioGroupFieldTitle = '单选题';
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

export const mRadioGroupFieldEditorTool = defineEditorTool<MRadioGroupFieldProps>({
  toolbox: {
    title: radioGroupFieldTitle,
    icon: choiceIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(radioGroupFieldTitle);
    },
    fields: [valueField, optionField]
  },
  createInitialProps: () => ({
    value: radioGroupFieldDefaults.value,
    options: [...radioGroupFieldDefaults.options]
  }),
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

:global(.dark) .page-dsl-option {
  border-color: rgb(51 65 85);
}
</style>
