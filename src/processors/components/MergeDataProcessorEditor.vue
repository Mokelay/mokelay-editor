<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import { processorParam } from 'mokelay-components/processors/shared';
import type { ProcessorConfig } from 'mokelay-components/processors/types';

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

function readObjectParam(config: ProcessorConfig) {
  const param = processorParam(config);
  const value = Array.isArray(param) && param.length === 1 ? param[0] : param;
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
}

function syncFromProps() {
  text.value = JSON.stringify(readObjectParam(props.modelValue), null, 2);
  error.value = '';
  emit('validity-change', true);
}

function updateValue(event: Event) {
  text.value = (event.target as HTMLTextAreaElement).value;
  try {
    const parsed = JSON.parse(text.value) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new TypeError('Expected object.');
    }
    error.value = '';
    emit('validity-change', true);
    emit('update:modelValue', { processor: 'merge_data', param: [parsed] });
  } catch {
    error.value = t('datasource.processors.validation.jsonObject');
    emit('validity-change', false);
  }
}

watch(() => props.modelValue, syncFromProps, { immediate: true, deep: true });
</script>

<template>
  <label class="processor-editor-field">
    <span>{{ t('datasource.processors.mergeData.fields.data') }}</span>
    <textarea
      class="processor-editor-textarea"
      data-testid="processor-merge-data-param"
      :readonly="readonly"
      :value="text"
      @input="updateValue"
      @keydown.stop
    ></textarea>
  </label>
  <p v-if="error" class="processor-editor-error" data-testid="processor-merge-data-error">{{ error }}</p>
</template>

<style scoped>
.processor-editor-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.processor-editor-textarea {
  min-height: 110px;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 8px 10px;
  background: white;
  color: rgb(15 23 42);
  font: 13px/19px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  resize: vertical;
}

.processor-editor-textarea:read-only {
  background: rgb(248 250 252);
}

.processor-editor-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 13px;
}

.dark .processor-editor-field {
  color: rgb(203 213 225);
}

.dark .processor-editor-textarea {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
