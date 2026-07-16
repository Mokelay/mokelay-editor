<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import { isRecord, processorParam } from 'mokelay-components/processors/shared';
import type { FilterConditionType, FilterParam, ProcessorConfig } from 'mokelay-components/processors/types';

type EditableCondition = {
  id: number;
  variable: string;
  condition: FilterConditionType;
  valueText: string;
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
const filterType = ref<FilterParam['type']>('and');
const conditions = ref<EditableCondition[]>([]);
let conditionId = 0;
let lastEmittedConfig = '';

const conditionTypes: FilterConditionType[] = ['eq', 'gt', 'lt', 'is_empty', 'is_not_empty'];

function formatConditionValue(value: unknown) {
  if (value === undefined) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function parseConditionValue(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function syncFromProps() {
  const param = processorParam(props.modelValue);
  filterType.value = isRecord(param) && param.type === 'or' ? 'or' : 'and';
  conditions.value = isRecord(param) && Array.isArray(param.conditions)
    ? param.conditions.flatMap((condition) => {
        if (!isRecord(condition)) return [];
        const conditionType = conditionTypes.includes(condition.condition as FilterConditionType)
          ? condition.condition as FilterConditionType
          : 'eq';
        return [{
          id: conditionId++,
          variable: typeof condition.variable === 'string' ? condition.variable : '',
          condition: conditionType,
          valueText: formatConditionValue(condition.value)
        }];
      })
    : [];
  emitValidity();
}

function emitValidity() {
  emit('validity-change', conditions.value.every((condition) => Boolean(condition.variable.trim())));
}

function emitValue() {
  emitValidity();
  const config: ProcessorConfig = {
    processor: 'filter',
    param: {
      type: filterType.value,
      conditions: conditions.value.map((condition) => ({
        variable: condition.variable.trim(),
        condition: condition.condition,
        ...(condition.condition === 'is_empty' || condition.condition === 'is_not_empty'
          ? {}
          : { value: parseConditionValue(condition.valueText) })
      }))
    }
  };
  lastEmittedConfig = JSON.stringify(config);
  emit('update:modelValue', config);
}

function addCondition() {
  conditions.value.push({
    id: conditionId++,
    variable: '',
    condition: 'eq',
    valueText: '""'
  });
  emitValue();
}

function removeCondition(index: number) {
  conditions.value.splice(index, 1);
  emitValue();
}

function updateFilterType(event: Event) {
  filterType.value = (event.target as HTMLSelectElement).value === 'or' ? 'or' : 'and';
  emitValue();
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
  <div class="processor-filter-header">
    <label class="processor-filter-field">
      <span>{{ t('datasource.processors.filter.fields.type') }}</span>
      <select
        class="processor-filter-input"
        data-testid="processor-filter-type"
        :disabled="readonly"
        :value="filterType"
        @change="updateFilterType"
      >
        <option value="and">AND</option>
        <option value="or">OR</option>
      </select>
    </label>
    <button
      v-if="!readonly"
      type="button"
      class="processor-filter-add"
      data-testid="processor-filter-condition-add"
      @click="addCondition"
    >
      {{ t('datasource.processors.filter.addCondition') }}
    </button>
  </div>

  <p v-if="!conditions.length" class="processor-filter-empty" data-testid="processor-filter-empty">
    {{ t('datasource.processors.filter.empty') }}
  </p>

  <div v-else class="processor-filter-list">
    <div
      v-for="(condition, index) in conditions"
      :key="condition.id"
      class="processor-filter-condition"
      :data-testid="`processor-filter-condition-${index}`"
    >
      <label class="processor-filter-field">
        <span>{{ t('datasource.processors.filter.fields.variable') }}</span>
        <input
          v-model="condition.variable"
          class="processor-filter-input"
          :data-testid="`processor-filter-variable-${index}`"
          :readonly="readonly"
          @input="emitValue"
          @keydown.stop
        >
      </label>
      <label class="processor-filter-field">
        <span>{{ t('datasource.processors.filter.fields.condition') }}</span>
        <select
          v-model="condition.condition"
          class="processor-filter-input"
          :data-testid="`processor-filter-condition-type-${index}`"
          :disabled="readonly"
          @change="emitValue"
        >
          <option v-for="conditionType in conditionTypes" :key="conditionType" :value="conditionType">
            {{ t(`datasource.processors.filter.conditions.${conditionType}`) }}
          </option>
        </select>
      </label>
      <label
        v-if="condition.condition !== 'is_empty' && condition.condition !== 'is_not_empty'"
        class="processor-filter-field"
      >
        <span>{{ t('datasource.processors.filter.fields.value') }}</span>
        <input
          v-model="condition.valueText"
          class="processor-filter-input"
          :data-testid="`processor-filter-value-${index}`"
          :readonly="readonly"
          @input="emitValue"
          @keydown.stop
        >
      </label>
      <button
        v-if="!readonly"
        type="button"
        class="processor-filter-remove"
        :data-testid="`processor-filter-condition-remove-${index}`"
        @click="removeCondition(index)"
      >
        {{ t('datasource.actions.remove') }}
      </button>
      <p v-if="!condition.variable.trim()" class="processor-filter-error">
        {{ t('datasource.processors.validation.required') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.processor-filter-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
}

.processor-filter-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.processor-filter-condition {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(135px, 0.75fr) minmax(130px, 1fr) auto;
  gap: 8px;
  align-items: end;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 10px;
}

.processor-filter-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
}

.processor-filter-input {
  height: 34px;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 7px;
  padding: 6px 8px;
  background: white;
  color: rgb(15 23 42);
  font: inherit;
}

.processor-filter-add,
.processor-filter-remove {
  min-height: 34px;
  border: 1px solid rgb(191 219 254);
  border-radius: 7px;
  padding: 5px 10px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.processor-filter-remove {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(220 38 38);
}

.processor-filter-empty,
.processor-filter-error {
  margin: 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.processor-filter-error {
  grid-column: 1 / -1;
  color: rgb(185 28 28);
}

.dark .processor-filter-condition {
  border-color: rgb(51 65 85);
}

.dark .processor-filter-field {
  color: rgb(203 213 225);
}

.dark .processor-filter-input {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

@media (max-width: 760px) {
  .processor-filter-condition {
    grid-template-columns: 1fr;
  }
}
</style>
