<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/i18n';
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
  <div class="processor-date-fields">
    <label class="processor-date-field">
      <span>{{ t('datasource.processors.dateTimeFormat.fields.preset') }}</span>
      <select
        class="processor-date-input"
        data-testid="processor-date-time-preset"
        :disabled="readonly"
        :value="selectedPreset"
        @change="updatePreset"
      >
        <option v-for="preset in presets" :key="preset" :value="preset">{{ preset }}</option>
        <option value="custom">{{ t('datasource.processors.dateTimeFormat.custom') }}</option>
      </select>
    </label>
    <label class="processor-date-field">
      <span>{{ t('datasource.processors.dateTimeFormat.fields.format') }}</span>
      <input
        class="processor-date-input"
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
.processor-date-fields {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 10px;
}

.processor-date-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.processor-date-input {
  height: 36px;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 7px 10px;
  background: white;
  color: rgb(15 23 42);
  font: inherit;
}

.processor-date-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 13px;
}

:global(.dark) .processor-date-field {
  color: rgb(203 213 225);
}

:global(.dark) .processor-date-input {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

@media (max-width: 640px) {
  .processor-date-fields {
    grid-template-columns: 1fr;
  }
}
</style>
