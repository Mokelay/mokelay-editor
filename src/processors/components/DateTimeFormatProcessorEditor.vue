<script setup lang="ts">
import { computed } from 'vue';
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
const presets = ['yyyy-MM-dd HH:mm:SS', 'yyyy-MM-dd', 'HH:mm:SS'];
const format = computed(() => {
  const value = processorParam(props.modelValue);
  return typeof value === 'string' ? value : '';
});
const selectedPreset = computed(() => presets.includes(format.value) ? format.value : 'custom');

function updateFormat(value: string) {
  emit('validity-change', Boolean(value.trim()));
  emit('update:modelValue', { processor: 'date_time_format', param: value });
}

function updatePreset(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value !== 'custom') updateFormat(value);
}
</script>

<template>
  <div class="processor-date-fields mk-form-grid">
    <label class="processor-date-field mk-form-field">
      <span>{{ t('datasource.processors.dateTimeFormat.fields.preset') }}</span>
      <select
        class="processor-date-input mk-form-control"
        data-testid="processor-date-time-preset"
        :disabled="readonly"
        :value="selectedPreset"
        @change="updatePreset"
      >
        <option v-for="preset in presets" :key="preset" :value="preset">{{ preset }}</option>
        <option value="custom">{{ t('datasource.processors.dateTimeFormat.custom') }}</option>
      </select>
    </label>
    <label class="processor-date-field mk-form-field">
      <span>{{ t('datasource.processors.dateTimeFormat.fields.format') }}</span>
      <input
        class="processor-date-input mk-form-control"
        data-testid="processor-date-time-format"
        :readonly="readonly"
        :value="format"
        @input="updateFormat(($event.target as HTMLInputElement).value)"
        @keydown.stop
      >
    </label>
  </div>
  <p v-if="!format.trim()" class="processor-date-error" data-testid="processor-date-time-error">
    {{ t('datasource.processors.validation.required') }}
  </p>
</template>

<style scoped>
.processor-date-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 13px;
}

</style>
