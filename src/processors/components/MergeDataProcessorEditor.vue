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
  <label class="processor-editor-field mk-form-field">
    <span>{{ t('datasource.processors.mergeData.fields.data') }}</span>
    <textarea
      class="processor-editor-textarea mk-form-control"
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
.processor-editor-textarea {
  resize: vertical;
}

.processor-editor-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 13px;
}
</style>
