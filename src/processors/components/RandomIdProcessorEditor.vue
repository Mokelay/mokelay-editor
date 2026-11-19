<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/i18n';
import { isRecord, processorParam } from 'mokelay-components/processors/shared';
import type { ProcessorConfig, RandomIdParam } from 'mokelay-components/processors/types';

const defaultParam: Required<RandomIdParam> = {
  prefix: '',
  length: 6,
  alphabet: 'abcdefghijklmnopqrstuvwxyz0123456789',
  lowerCase: true,
  when: 'empty'
};

const props = defineProps<{
  modelValue: ProcessorConfig;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: ProcessorConfig): void;
  (event: 'validity-change', valid: boolean): void;
}>();

const { t } = useI18n();

const param = computed<Required<RandomIdParam>>(() => {
  const value = processorParam(props.modelValue);
  if (typeof value === 'string') {
    return { ...defaultParam, prefix: value };
  }
  if (typeof value === 'number') {
    return { ...defaultParam, length: normalizeLength(value) };
  }
  if (!isRecord(value)) {
    return defaultParam;
  }

  return {
    prefix: typeof value.prefix === 'string' ? value.prefix : defaultParam.prefix,
    length: normalizeLength(value.length),
    alphabet: typeof value.alphabet === 'string' && value.alphabet ? value.alphabet : defaultParam.alphabet,
    lowerCase: typeof value.lowerCase === 'boolean' ? value.lowerCase : defaultParam.lowerCase,
    when: value.when === 'always' ? 'always' : 'empty'
  };
});

function normalizeLength(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return defaultParam.length;
  }
  return Math.min(32, Math.trunc(value));
}

function emitParam(patch: Partial<RandomIdParam>) {
  emit('validity-change', true);
  emit('update:modelValue', {
    processor: 'random_id',
    param: {
      ...param.value,
      ...patch
    }
  });
}

function updateLength(event: Event) {
  const rawValue = (event.target as HTMLInputElement).valueAsNumber;
  emitParam({ length: normalizeLength(rawValue) });
}

function updateWhen(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emitParam({ when: value === 'always' ? 'always' : 'empty' });
}
</script>

<template>
  <div class="processor-random-grid mk-form-grid">
    <label class="processor-random-field mk-form-field">
      <span>{{ t('datasource.processors.randomId.fields.prefix') }}</span>
      <input
        class="processor-random-input mk-form-control"
        data-testid="processor-random-id-prefix"
        :readonly="readonly"
        :value="param.prefix"
        @input="emitParam({ prefix: ($event.target as HTMLInputElement).value })"
        @keydown.stop
      >
    </label>
    <label class="processor-random-field mk-form-field">
      <span>{{ t('datasource.processors.randomId.fields.length') }}</span>
      <input
        class="processor-random-input mk-form-control"
        data-testid="processor-random-id-length"
        type="number"
        min="1"
        max="32"
        step="1"
        :readonly="readonly"
        :value="param.length"
        @input="updateLength"
        @keydown.stop
      >
    </label>
    <label class="processor-random-field mk-form-field">
      <span>{{ t('datasource.processors.randomId.fields.when') }}</span>
      <select
        class="processor-random-input mk-form-control"
        data-testid="processor-random-id-when"
        :disabled="readonly"
        :value="param.when"
        @change="updateWhen"
      >
        <option value="empty">{{ t('datasource.processors.randomId.when.empty') }}</option>
        <option value="always">{{ t('datasource.processors.randomId.when.always') }}</option>
      </select>
    </label>
    <label class="processor-random-checkbox mk-form-check-row">
      <input class="mk-form-check"
        data-testid="processor-random-id-lower-case"
        type="checkbox"
        :disabled="readonly"
        :checked="param.lowerCase"
        @change="emitParam({ lowerCase: ($event.target as HTMLInputElement).checked })"
      >
      <span>{{ t('datasource.processors.randomId.fields.lowerCase') }}</span>
    </label>
  </div>
  <label class="processor-random-field mk-form-field">
    <span>{{ t('datasource.processors.randomId.fields.alphabet') }}</span>
    <input
      class="processor-random-input mk-form-control"
      data-testid="processor-random-id-alphabet"
      :readonly="readonly"
      :value="param.alphabet"
      @input="emitParam({ alphabet: ($event.target as HTMLInputElement).value })"
      @keydown.stop
    >
  </label>
</template>

<style scoped>
.processor-random-grid {
  align-items: end;
}

.processor-random-field,
.processor-random-checkbox {
  display: flex;
  min-width: 0;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.dark .processor-random-field,
.dark .processor-random-checkbox {
  color: rgb(203 213 225);
}

</style>
