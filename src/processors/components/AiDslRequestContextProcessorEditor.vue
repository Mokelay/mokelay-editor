<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import { isRecord, processorParam } from 'mokelay-components/processors/shared';
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
const historyText = ref('[]');
const historyValue = ref<unknown>([]);
const historyOrder = ref<'newest_first' | 'oldest_first'>('newest_first');
const historyLimit = ref('5');
const includeHistoryInRequirement = ref(true);
const includeHistoryInDslContext = ref(true);
const historyError = ref('');
const limitError = ref('');

function syncValidity() {
  const valid = !historyError.value && !limitError.value;
  emit('validity-change', valid);
  return valid;
}

function buildConfig(): ProcessorConfig {
  return {
    processor: 'ai_dsl_request_context',
    param: {
      history: historyValue.value,
      historyOrder: historyOrder.value,
      historyLimit: Math.floor(Number(historyLimit.value)),
      includeHistoryInRequirement: includeHistoryInRequirement.value,
      includeHistoryInDslContext: includeHistoryInDslContext.value
    }
  };
}

function emitConfig() {
  if (!syncValidity()) return;
  emit('update:modelValue', buildConfig());
}

function validateLimit() {
  const value = Number(historyLimit.value);
  limitError.value = historyLimit.value.trim() && Number.isFinite(value) && value >= 0
    ? ''
    : t('datasource.processors.aiDslRequestContext.errors.invalidLimit');
}

function updateHistory(event: Event) {
  historyText.value = (event.target as HTMLTextAreaElement).value;
  try {
    historyValue.value = JSON.parse(historyText.value) as unknown;
    historyError.value = '';
  } catch {
    historyError.value = t('datasource.processors.aiDslRequestContext.errors.invalidHistory');
  }
  emitConfig();
}

function updateLimit(event: Event) {
  historyLimit.value = (event.target as HTMLInputElement).value;
  validateLimit();
  emitConfig();
}

function updateHistoryOrder(event: Event) {
  historyOrder.value = (event.target as HTMLSelectElement).value === 'oldest_first'
    ? 'oldest_first'
    : 'newest_first';
  emitConfig();
}

function updateIncludeRequirement(event: Event) {
  includeHistoryInRequirement.value = (event.target as HTMLInputElement).checked;
  emitConfig();
}

function updateIncludeDslContext(event: Event) {
  includeHistoryInDslContext.value = (event.target as HTMLInputElement).checked;
  emitConfig();
}

function syncFromProps() {
  const param = processorParam(props.modelValue);
  const config = isRecord(param) ? param : {};
  const history = Object.prototype.hasOwnProperty.call(config, 'history') ? config.history : [];

  historyValue.value = history;
  historyText.value = JSON.stringify(history, null, 2) ?? '[]';
  historyOrder.value = config.historyOrder === 'oldest_first' ? 'oldest_first' : 'newest_first';
  historyLimit.value = String(config.historyLimit ?? 5);
  includeHistoryInRequirement.value = config.includeHistoryInRequirement !== false;
  includeHistoryInDslContext.value = config.includeHistoryInDslContext !== false;
  historyError.value = '';
  validateLimit();
  emit('validity-change', param === undefined || isRecord(param) ? !limitError.value : false);
}

watch(() => props.modelValue, syncFromProps, { immediate: true, deep: true });
</script>

<template>
  <div class="processor-ai-context-fields mk-form-grid">
    <label class="processor-ai-context-field mk-form-field">
      <span>{{ t('datasource.processors.aiDslRequestContext.fields.history') }}</span>
      <textarea
        class="processor-ai-context-textarea mk-form-control"
        data-testid="processor-ai-dsl-history"
        :readonly="readonly"
        :value="historyText"
        @input="updateHistory"
        @keydown.stop
      ></textarea>
    </label>
    <p v-if="historyError" class="processor-ai-context-error" data-testid="processor-ai-dsl-history-error">
      {{ historyError }}
    </p>

    <label class="processor-ai-context-field mk-form-field">
      <span>{{ t('datasource.processors.aiDslRequestContext.fields.historyOrder') }}</span>
      <select
        class="processor-ai-context-input mk-form-control"
        data-testid="processor-ai-dsl-history-order"
        :disabled="readonly"
        :value="historyOrder"
        @change="updateHistoryOrder"
      >
        <option value="newest_first">{{ t('datasource.processors.aiDslRequestContext.historyOrders.newestFirst') }}</option>
        <option value="oldest_first">{{ t('datasource.processors.aiDslRequestContext.historyOrders.oldestFirst') }}</option>
      </select>
    </label>

    <label class="processor-ai-context-field processor-ai-context-limit mk-form-field">
      <span>{{ t('datasource.processors.aiDslRequestContext.fields.historyLimit') }}</span>
      <input
        class="processor-ai-context-input mk-form-control"
        data-testid="processor-ai-dsl-history-limit"
        type="number"
        min="0"
        step="1"
        :readonly="readonly"
        :value="historyLimit"
        @input="updateLimit"
        @keydown.stop
      >
    </label>
    <p v-if="limitError" class="processor-ai-context-error" data-testid="processor-ai-dsl-history-limit-error">
      {{ limitError }}
    </p>

    <label class="processor-ai-context-toggle mk-form-check-row">
      <input class="mk-form-check"
        type="checkbox"
        data-testid="processor-ai-dsl-include-requirement"
        :checked="includeHistoryInRequirement"
        :disabled="readonly"
        @change="updateIncludeRequirement"
      >
      <span>{{ t('datasource.processors.aiDslRequestContext.fields.includeHistoryInRequirement') }}</span>
    </label>
    <label class="processor-ai-context-toggle mk-form-check-row">
      <input class="mk-form-check"
        type="checkbox"
        data-testid="processor-ai-dsl-include-context"
        :checked="includeHistoryInDslContext"
        :disabled="readonly"
        @change="updateIncludeDslContext"
      >
      <span>{{ t('datasource.processors.aiDslRequestContext.fields.includeHistoryInDslContext') }}</span>
    </label>
  </div>
</template>

<style scoped>
.processor-ai-context-fields {
  flex-direction: column;
}

.processor-ai-context-textarea {
  resize: vertical;
}

.processor-ai-context-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 13px;
}

.dark .processor-ai-context-field,
.dark .processor-ai-context-toggle {
  color: rgb(203 213 225);
}
</style>
