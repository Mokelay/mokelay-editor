<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import {
  getProcessorDefinition,
  processorName
} from '@/processors';
import { processorParam } from '@/processors/shared';
import type { ProcessorConfig } from '@/processors/types';

const props = defineProps<{
  modelValue: ProcessorConfig;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: ProcessorConfig): void;
  (event: 'validity-change', valid: boolean): void;
}>();

const { t } = useI18n();
const text = ref('');
const error = ref('');
let lastEmittedConfig = '';

function getEditableParam(config: ProcessorConfig) {
  const param = processorParam(config);
  if (param !== undefined) return param;
  return getProcessorDefinition(processorName(config))?.paramExample ?? null;
}

function formatParam(value: unknown) {
  const textValue = JSON.stringify(value, null, 2);
  return textValue === undefined ? 'null' : textValue;
}

function validateParam(value: unknown) {
  const definition = getProcessorDefinition(processorName(props.modelValue));
  definition?.validateParam?.(value);
}

function syncFromProps() {
  text.value = formatParam(getEditableParam(props.modelValue));
  error.value = '';
  emit('validity-change', true);
}

function updateValue(event: Event) {
  text.value = (event.target as HTMLTextAreaElement).value;
  try {
    const parsed = JSON.parse(text.value) as unknown;
    validateParam(parsed);
    const config: ProcessorConfig = {
      processor: processorName(props.modelValue),
      param: parsed
    };
    lastEmittedConfig = JSON.stringify(config);
    error.value = '';
    emit('validity-change', true);
    emit('update:modelValue', config);
  } catch {
    error.value = t('datasource.processors.validation.jsonValue');
    emit('validity-change', false);
  }
}

watch(() => props.modelValue, (value) => {
  if (lastEmittedConfig && JSON.stringify(value) === lastEmittedConfig) {
    lastEmittedConfig = '';
    return;
  }
  syncFromProps();
}, { immediate: true, deep: true });
</script>

<template>
  <label class="processor-json-field">
    <span>{{ t('datasource.processors.generic.fields.param') }}</span>
    <textarea
      class="processor-json-textarea"
      data-testid="processor-json-param"
      :readonly="readonly"
      :value="text"
      @input="updateValue"
      @keydown.stop
    ></textarea>
  </label>
  <p class="processor-json-help">{{ t('datasource.processors.generic.help') }}</p>
  <p v-if="error" class="processor-json-error" data-testid="processor-json-error">{{ error }}</p>
</template>

<style scoped>
.processor-json-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.processor-json-textarea {
  min-height: 110px;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 8px 10px;
  background: white;
  color: rgb(15 23 42);
  font: 13px/19px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  resize: vertical;
}

.processor-json-textarea:read-only {
  background: rgb(248 250 252);
}

.processor-json-help,
.processor-json-error {
  margin: 0;
  font-size: 13px;
}

.processor-json-help {
  color: rgb(100 116 139);
}

.processor-json-error {
  color: rgb(185 28 28);
}

:global(.dark) .processor-json-field {
  color: rgb(203 213 225);
}

:global(.dark) .processor-json-textarea {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
