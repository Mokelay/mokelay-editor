<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import MVariableFlowDialog from '@/blocks/MVariableFlowDialog.vue';
import ProcessorConfigDialog from '@/processors/components/ProcessorConfigDialog.vue';
import { getProcessorDefinition, processorName } from '@/processors';
import type { ProcessorConfig } from '@/processors';
import type { DatasourceSchemaSelection } from '@/utils/datasourceSchema';
import {
  createFlowFromInput,
  createFlowFromVariable,
  normalizeVariableOptions,
  normalizeBlockDataSources,
  normalizePageVariableSources,
  normalizeVariableValueConfig,
  serializeVariableValueConfig,
  stringifyVariableValue,
  type BlockDataSource,
  type PageVariableSource,
  type VariableFlowConfig,
  type VariableOption,
  type VariableValueConfig,
  type VariableValueDataType,
  type VariableValueSource
} from '@/utils/variableValue';

const props = defineProps<{
  modelValue?: unknown;
  variables?: VariableOption[];
  blockDataSources?: BlockDataSource[];
  pageVariableSources?: PageVariableSource[];
  currentBlockId?: string;
  valueType?: VariableValueDataType;
  readonly?: boolean;
  multiline?: boolean;
  placeholder?: string;
  testid?: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void;
}>();

const { t } = useI18n();
const mode = ref<VariableValueConfig['mode']>('input');
const inputValue = ref('');
const variableSource = ref<VariableValueSource>('Block');
const blockId = ref('');
const blockType = ref('');
const pageId = ref('');
const variableName = ref('');
const variableProcessors = ref<ProcessorConfig[]>([]);
const flowValue = ref<VariableFlowConfig>(createFlowFromInput(''));
const processorOpen = ref(false);
const flowOpen = ref(false);
const previousSummary = ref('');
const pageIdListId = `variable-page-id-options-${Math.random().toString(36).slice(2)}`;
let lastEmittedValue = '';
const legacySourceBlockId = '__legacy_variables__';
const variableSourceOptions: Array<{ value: VariableValueSource; label: string }> = [
  { value: 'Block', label: 'Block' },
  { value: 'MPage', label: 'MPage' },
  { value: 'Cookie', label: 'Cookie' },
  { value: 'localStorage', label: 'localStorage' },
  { value: 'sessionStorage', label: 'sessionStorage' }
];

const normalizedVariables = computed(() => normalizeVariableOptions(props.variables));
const availablePageVariableSources = computed(() => {
  const sources = normalizePageVariableSources(props.pageVariableSources);
  if (!pageId.value || sources.some((source) => source.pageId === pageId.value)) return sources;

  return [{
    pageId: pageId.value,
    pageLabel: t('variableValue.variable.missingPage').replace('{pageId}', pageId.value)
  }, ...sources];
});
const availableBlockDataSources = computed(() => {
  const sources = normalizeBlockDataSources(props.blockDataSources);
  const hasSelectedSource = blockId.value && sources.some((source) => source.blockId === blockId.value);
  const shouldShowLegacySource = normalizedVariables.value.length && !sources.length;
  const legacySource = shouldShowLegacySource
    ? [{
        blockId: legacySourceBlockId,
        blockType: 'legacy',
        blockLabel: t('variableValue.variable.legacySource'),
        fields: normalizedVariables.value.map((variable) => ({
          label: variable.label,
          variable: variable.name,
          dataType: variable.type
        }))
      }]
    : [];
  const missingSource = blockId.value && variableName.value && !hasSelectedSource
    ? [{
        blockId: blockId.value,
        blockType: blockType.value || 'missing',
        blockLabel: t('variableValue.variable.missingBlock').replace('{blockId}', blockId.value),
        fields: [{
          label: variableName.value,
          variable: variableName.value,
          dataType: 'string' as VariableValueDataType
        }]
      }]
    : [];
  return [...missingSource, ...sources, ...legacySource];
});
const selectedBlock = computed(() => {
  if (variableSource.value !== 'Block') return undefined;
  if (!blockId.value) {
    return availableBlockDataSources.value.find((source) => source.blockId === legacySourceBlockId);
  }
  return availableBlockDataSources.value.find((source) => source.blockId === blockId.value);
});
const selectedField = computed(() => selectedBlock.value?.fields.find((field) => field.variable === variableName.value));
const processorField = computed<DatasourceSchemaSelection | undefined>(() => {
  if (variableSource.value !== 'Block') {
    const variable = variableName.value.trim();
    if (!variable) return undefined;
    return {
      path: variable,
      label: variable,
      type: props.valueType ?? 'string',
      processors: variableProcessors.value
    };
  }

  const field = selectedField.value;
  if (!field) return undefined;
  return {
    path: field.variable,
    label: field.label,
    type: field.dataType,
    processors: variableProcessors.value
  };
});

function syncFromModelValue() {
  const config = normalizeVariableValueConfig(props.modelValue);
  mode.value = config.mode;
  previousSummary.value = stringifyVariableValue(config);
  if (config.mode === 'input') {
    inputValue.value = config.value;
    variableSource.value = 'Block';
    blockId.value = '';
    blockType.value = '';
    pageId.value = '';
    variableName.value = '';
    variableProcessors.value = [];
    flowValue.value = createFlowFromInput(config.value);
    return;
  }
  if (config.mode === 'variable') {
    inputValue.value = '';
    variableSource.value = config.source ?? 'Block';
    blockId.value = config.blockId ?? '';
    blockType.value = config.blockType ?? '';
    pageId.value = config.pageId ?? '';
    variableName.value = config.variable;
    variableProcessors.value = [...(config.processors ?? [])];
    flowValue.value = createFlowFromVariable(config.variable, variableProcessors.value, {
      source: config.source ?? 'Block',
      blockId: config.blockId,
      blockType: config.blockType,
      pageId: config.pageId
    });
    return;
  }
  inputValue.value = '';
  variableSource.value = 'Block';
  blockId.value = '';
  blockType.value = '';
  pageId.value = '';
  variableName.value = '';
  variableProcessors.value = [];
  flowValue.value = config.flow;
}

function emitValue(value: unknown) {
  lastEmittedValue = JSON.stringify(value);
  emit('update:modelValue', value);
}

function buildVariableConfig(): VariableValueConfig {
  const base = {
    mode: 'variable' as const,
    source: variableSource.value,
    variable: variableName.value,
    ...(variableProcessors.value.length ? { processors: variableProcessors.value } : {})
  };

  if (variableSource.value === 'MPage') {
    return {
      ...base,
      ...(pageId.value ? { pageId: pageId.value } : {})
    };
  }

  if (variableSource.value === 'Cookie' || variableSource.value === 'localStorage' || variableSource.value === 'sessionStorage') {
    return base;
  }

  return {
    ...base,
    ...(blockId.value ? { blockId: blockId.value } : {}),
    ...(blockId.value && blockType.value ? { blockType: blockType.value } : {})
  };
}

function emitCurrentMode() {
  if (props.readonly) return;
  if (mode.value === 'input') {
    emitValue(serializeVariableValueConfig({ mode: 'input', value: inputValue.value }));
    return;
  }
  if (mode.value === 'variable') {
    emitValue(buildVariableConfig());
    return;
  }
  emitValue({ mode: 'flow', flow: flowValue.value });
}

function switchMode(nextMode: VariableValueConfig['mode']) {
  if (props.readonly || nextMode === mode.value) return;
  previousSummary.value = stringifyVariableValue(normalizeVariableValueConfig(currentConfig()));
  if (nextMode === 'input') {
    mode.value = 'input';
    inputValue.value = '';
    emitCurrentMode();
    return;
  }
  if (nextMode === 'variable') {
    mode.value = 'variable';
    variableSource.value = 'Block';
    blockId.value = '';
    blockType.value = '';
    pageId.value = '';
    variableName.value = '';
    variableProcessors.value = [];
    emitCurrentMode();
    return;
  }
  flowValue.value = mode.value === 'variable' && variableName.value
    ? createFlowFromVariable(variableName.value, variableProcessors.value, {
        source: variableSource.value,
        ...(blockId.value ? { blockId: blockId.value } : {}),
        ...(blockId.value && blockType.value ? { blockType: blockType.value } : {}),
        ...(pageId.value ? { pageId: pageId.value } : {})
      })
    : createFlowFromInput(inputValue.value || previousSummary.value);
  mode.value = 'flow';
  flowOpen.value = true;
  emitCurrentMode();
}

function currentConfig(): VariableValueConfig {
  if (mode.value === 'input') return { mode: 'input', value: inputValue.value };
  if (mode.value === 'variable') {
    return buildVariableConfig();
  }
  return { mode: 'flow', flow: flowValue.value };
}

function updateInput(value: string) {
  if (props.readonly) return;
  inputValue.value = value;
  if (mode.value !== 'input') mode.value = 'input';
  emitCurrentMode();
}

function updateVariableSource(value: string) {
  if (props.readonly) return;
  const nextSource = variableSourceOptions.some((option) => option.value === value)
    ? value as VariableValueSource
    : 'Block';
  if (nextSource === variableSource.value) return;

  variableSource.value = nextSource;
  blockId.value = '';
  blockType.value = '';
  pageId.value = '';
  variableName.value = '';
  variableProcessors.value = [];
  emitCurrentMode();
}

function updateBlock(value: string) {
  if (props.readonly) return;
  if (variableSource.value !== 'Block') return;
  const next = availableBlockDataSources.value.find((source) => source.blockId === value);
  blockId.value = next && next.blockId !== legacySourceBlockId ? next.blockId : '';
  blockType.value = next && next.blockId !== legacySourceBlockId ? next.blockType : '';
  variableName.value = next?.fields[0]?.variable ?? '';
  variableProcessors.value = [];
  emitCurrentMode();
}

function updatePageId(value: string) {
  if (props.readonly) return;
  pageId.value = value.trim();
  emitCurrentMode();
}

function updateVariable(value: string) {
  if (props.readonly) return;
  const previous = selectedField.value;
  const next = selectedBlock.value?.fields.find((field) => field.variable === value);
  variableName.value = value;
  if (previous && next && previous.dataType !== next.dataType) {
    variableProcessors.value = [];
  }
  emitCurrentMode();
}

function applyProcessors(processors: ProcessorConfig[]) {
  if (props.readonly) return;
  variableProcessors.value = processors;
  processorOpen.value = false;
  emitCurrentMode();
}

function applyFlow(flow: VariableFlowConfig) {
  flowValue.value = flow;
  flowOpen.value = false;
  mode.value = 'flow';
  emitCurrentMode();
}

function processorLabel(processor: ProcessorConfig) {
  const name = processorName(processor);
  const definition = getProcessorDefinition(name);
  return definition ? t(definition.titleKey) : name;
}

watch(() => props.modelValue, (value) => {
  if (lastEmittedValue && JSON.stringify(value) === lastEmittedValue) {
    lastEmittedValue = '';
    return;
  }
  syncFromModelValue();
}, { immediate: true, deep: true });
</script>

<template>
  <div
    class="variable-value-editor"
    :class="{ 'variable-value-editor--multiline': multiline }"
    :data-testid="testid ? `${testid}-editor` : undefined"
    :title="previousSummary && mode === 'input' ? `${t('variableValue.previous')}: ${previousSummary}` : undefined"
    @keydown.stop
  >
    <div class="variable-value-editor__modes" role="tablist" :aria-label="t('variableValue.modeLabel')">
      <button
        type="button"
        :class="{ 'variable-value-editor__mode--active': mode === 'input' }"
        data-testid="variable-mode-input"
        @click="switchMode('input')"
      >
        {{ t('variableValue.modes.input') }}
      </button>
      <button
        type="button"
        :class="{ 'variable-value-editor__mode--active': mode === 'variable' }"
        data-testid="variable-mode-variable"
        @click="switchMode('variable')"
      >
        {{ t('variableValue.modes.variable') }}
      </button>
      <button
        type="button"
        :class="{ 'variable-value-editor__mode--active': mode === 'flow' }"
        data-testid="variable-mode-flow"
        @click="switchMode('flow')"
      >
        {{ t('variableValue.modes.flow') }}
      </button>
    </div>

    <textarea
      v-if="mode === 'input' && multiline"
      class="variable-value-editor__input variable-value-editor__input--multiline"
      :data-testid="testid"
      :readonly="readonly"
      :placeholder="placeholder"
      :value="inputValue"
      @input="updateInput(($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <input
      v-else-if="mode === 'input'"
      class="variable-value-editor__input"
      :data-testid="testid"
      type="text"
      :readonly="readonly"
      :placeholder="placeholder"
      :value="inputValue"
      @input="updateInput(($event.target as HTMLInputElement).value)"
    >

    <div v-else-if="mode === 'variable'" class="variable-value-editor__variable" :data-testid="testid">
      <select
        class="variable-value-editor__input variable-value-editor__source"
        data-testid="variable-source-select"
        :disabled="readonly"
        :value="variableSource"
        @change="updateVariableSource(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="sourceOption in variableSourceOptions" :key="sourceOption.value" :value="sourceOption.value">
          {{ sourceOption.label }}
        </option>
      </select>
      <span v-if="variableSource === 'Block' && !availableBlockDataSources.length" class="variable-value-editor__empty">
        {{ t('variableValue.variable.emptySources') }}
      </span>
      <select
        v-else-if="variableSource === 'Block'"
        class="variable-value-editor__input"
        data-testid="variable-block-select"
        :disabled="readonly"
        :value="selectedBlock?.blockId ?? blockId"
        @change="updateBlock(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('variableValue.variable.blockPlaceholder') }}</option>
        <option v-for="source in availableBlockDataSources" :key="`${source.blockId}-${source.blockType}`" :value="source.blockId">
          {{ source.blockType }} / {{ source.blockId === legacySourceBlockId ? 'legacy' : source.blockId }}
        </option>
      </select>
      <select
        v-if="variableSource === 'Block' && availableBlockDataSources.length"
        class="variable-value-editor__input"
        data-testid="variable-single-select"
        :disabled="readonly || !selectedBlock"
        :value="variableName"
        @change="updateVariable(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('variableValue.variable.fieldPlaceholder') }}</option>
        <option v-for="field in selectedBlock?.fields ?? []" :key="field.variable" :value="field.variable">
          {{ field.label }} {{ field.variable }} · {{ field.dataType }}
        </option>
      </select>
      <input
        v-if="variableSource === 'MPage'"
        class="variable-value-editor__input"
        data-testid="variable-page-id"
        type="text"
        :list="availablePageVariableSources.length ? pageIdListId : undefined"
        :readonly="readonly"
        placeholder="pageId"
        :value="pageId"
        @input="updatePageId(($event.target as HTMLInputElement).value)"
      >
      <datalist v-if="variableSource === 'MPage' && availablePageVariableSources.length" :id="pageIdListId">
        <option
          v-for="source in availablePageVariableSources"
          :key="source.pageId"
          :value="source.pageId"
          :label="source.pageLabel"
        ></option>
      </datalist>
      <input
        v-if="variableSource !== 'Block'"
        class="variable-value-editor__input"
        data-testid="variable-path-input"
        type="text"
        :readonly="readonly"
        :placeholder="variableSource === 'MPage' ? 'context.items / dataSources.detail.items' : 'key'"
        :value="variableName"
        @input="updateVariable(($event.target as HTMLInputElement).value)"
      >
      <button
        type="button"
        class="variable-value-editor__processor-button"
        data-testid="variable-single-processors"
        :disabled="readonly || (variableSource === 'Block' ? !selectedField : !variableName.trim())"
        @click="processorOpen = true"
      >
        {{ variableProcessors.length ? t('datasource.processors.count').replace('{count}', String(variableProcessors.length)) : t('datasource.processors.configure') }}
      </button>
      <span v-for="(processor, index) in variableProcessors" :key="`${processorName(processor)}-${index}`" class="variable-value-editor__processor">
        {{ processorLabel(processor) }}
      </span>
    </div>

    <div v-else class="variable-value-editor__flow" :data-testid="testid">
      <span>{{ t('variableValue.flow.summary') }}: {{ flowValue.nodes.length }} nodes / {{ flowValue.edges.length }} edges</span>
      <button type="button" data-testid="variable-flow-open" :disabled="readonly" @click="flowOpen = true">
        {{ t('variableValue.flow.open') }}
      </button>
    </div>

    <ProcessorConfigDialog
      :open="processorOpen"
      :field="processorField"
      :readonly="readonly"
      :teleport-disabled="true"
      @close="processorOpen = false"
      @apply="applyProcessors"
    />

    <MVariableFlowDialog
      :open="flowOpen"
      :flow="flowValue"
      :variables="normalizedVariables"
      :block-data-sources="availableBlockDataSources"
      :readonly="readonly"
      :teleport-disabled="true"
      @close="flowOpen = false"
      @apply="applyFlow"
    />
  </div>
</template>

<style scoped>
.variable-value-editor {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
}

.variable-value-editor--multiline {
  align-items: flex-start;
}

.variable-value-editor__modes {
  display: inline-flex;
  width: fit-content;
  flex: 0 0 auto;
  align-self: flex-start;
  overflow: hidden;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
}

.variable-value-editor__modes button {
  min-height: 36px;
  border: 0;
  border-right: 1px solid rgb(203 213 225);
  background: transparent;
  color: rgb(71 85 105);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  padding: 4px 8px;
  cursor: pointer;
}

.variable-value-editor__modes button:last-child {
  border-right: 0;
}

.variable-value-editor__modes .variable-value-editor__mode--active {
  background: rgb(37 99 235);
  color: white;
}

.variable-value-editor__input {
  flex: 1 1 auto;
  min-height: 36px;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  background: white;
  color: rgb(15 23 42);
  font: inherit;
  padding: 7px 9px;
}

.variable-value-editor__input--multiline {
  min-height: 86px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
}

.variable-value-editor__variable,
.variable-value-editor__flow {
  flex: 1 1 auto;
  display: flex;
  min-width: 0;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
}

.variable-value-editor__variable .variable-value-editor__input {
  flex: 1 1 112px;
  min-width: 72px;
}

.variable-value-editor__variable .variable-value-editor__source {
  flex: 0 0 96px;
}

.variable-value-editor__empty {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 650;
}

.variable-value-editor__processor-button,
.variable-value-editor__flow button {
  flex: 0 0 auto;
  min-height: 36px;
  border: 1px solid rgb(191 219 254);
  border-radius: 8px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  padding: 6px 10px;
  cursor: pointer;
}

.variable-value-editor__processor-button {
  min-width: 88px;
  white-space: nowrap;
}

.variable-value-editor__processor-button:disabled,
.variable-value-editor__flow button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.variable-value-editor__processor {
  flex: 0 0 auto;
  max-width: 160px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.variable-value-editor__flow {
  min-height: 36px;
  justify-content: space-between;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  background: white;
  padding: 5px 6px 5px 10px;
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
}

:global(.dark) .variable-value-editor__input,
:global(.dark) .variable-value-editor__flow {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
