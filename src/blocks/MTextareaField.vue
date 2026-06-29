<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  createPageDslFieldId,
  fieldIcon,
  inputFields,
  normalizeValue,
  numberValue,
  pageDslPropertyTitle,
  stringValue
} from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MTextareaFieldProps {
  edit: boolean;
  id?: string;
  placeholder?: string;
  value?: unknown;
  rows?: number;
}

const textareaFieldTitle = '多行文本';
const textareaFieldDefaults = {
  placeholder: '请输入详细说明',
  value: '',
  rows: 4
} as const;

function normalizeTextareaFieldProps(props: Partial<MTextareaFieldProps>): MTextareaFieldProps {
  const merged = {
    ...textareaFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    placeholder: stringValue(merged.placeholder),
    value: normalizeValue(merged.value, textareaFieldDefaults.value),
    rows: numberValue(merged.rows, textareaFieldDefaults.rows)
  };
}

export const mTextareaFieldEditorTool = defineEditorTool<MTextareaFieldProps>({
  toolbox: {
    title: textareaFieldTitle,
    icon: fieldIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(textareaFieldTitle);
    },
    fields: [...inputFields, { key: 'rows', label: '行数' }]
  },
  createInitialProps: () => ({
    ...textareaFieldDefaults
  }),
  getDataFields: () => valueBlockDataField('string'),
  normalizeProps: normalizeTextareaFieldProps,
  serialize: (props) => {
    const normalized = normalizeTextareaFieldProps(props);
    return {
      placeholder: normalized.placeholder,
      value: normalized.value,
      rows: normalized.rows
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MTextareaFieldProps & PageDslCallbacks<MTextareaFieldProps>>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || localFieldId);
const fieldPlaceholder = computed(() => props.placeholder || '');
const textareaRows = computed(() => {
  const rows = Number(props.rows);
  return Number.isFinite(rows) && rows > 0 ? rows : 4;
});
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});

function emitChange(payload: Partial<MTextareaFieldProps>) {
  const nextPayload = normalizeTextareaFieldProps({
    edit: props.edit,
    id: props.id,
    placeholder: props.placeholder,
    value: props.value,
    rows: props.rows,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function focus() {
  textareaRef.value?.focus();
}

function getData() {
  return {
    value: textareaRef.value?.value ?? stringInputValue.value
  };
}

defineExpose({
  focus,
  getData
});
</script>

<template>
  <PageDslBlock block-type="MTextareaField">
    <div class="page-dsl-field">
      <textarea
        ref="textareaRef"
        :id="fieldId"
        data-testid="editor-textarea-control"
        class="page-dsl-control"
        :rows="textareaRows"
        :placeholder="fieldPlaceholder"
        :value="stringInputValue"
        @input="emitChange({ value: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
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
