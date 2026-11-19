<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import JsonTreeView from '@/editors/components/JsonTreeView.vue';
import { useI18n } from '@/i18n';
import {
  getProcessorDefinition,
  previewSchemaSelection,
  ProcessorError,
  processorName,
  SchemaSelectionPreviewError
} from 'mokelay-components/processors';
import type { ProcessorConfig } from 'mokelay-components/processors/types';
import type { DatasourceSchemaSelection, JsonValue } from 'mokelay-components/datasource';

export type ProcessorPreviewExample = {
  id: number;
  value?: JsonValue;
  error?: string;
};

const props = defineProps<{
  open: boolean;
  field?: DatasourceSchemaSelection;
  examples: ProcessorPreviewExample[];
}>();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const { t } = useI18n();
const selectedExampleIndex = ref<number | null>(null);
const validExampleIndexes = computed(() => props.examples.flatMap((example, index) => (
  example.value !== undefined && !example.error ? [index] : []
)));
const selectedExample = computed(() => (
  selectedExampleIndex.value === null ? undefined : props.examples[selectedExampleIndex.value]
));
const previewState = computed(() => {
  if (!props.field || selectedExample.value?.value === undefined) {
    return { result: undefined, error: '' };
  }

  try {
    return {
      result: previewSchemaSelection(selectedExample.value.value, props.field),
      error: ''
    };
  } catch (error) {
    return { result: undefined, error: getPreviewErrorMessage(error) };
  }
});

function getPreviewErrorMessage(error: unknown) {
  if (error instanceof SchemaSelectionPreviewError) {
    if (error.code === 'FIELD_PREVIEW_PATH_NOT_FOUND') {
      return t('datasource.processors.preview.pathNotFound');
    }
    if (error.code === 'FIELD_PREVIEW_INVALID_PATH') {
      return t('datasource.processors.preview.invalidPath');
    }
    return t('datasource.processors.preview.invalidResult');
  }

  if (error instanceof ProcessorError) {
    return error.code === 'PROCESSOR_UNSUPPORTED'
      ? t('datasource.processors.preview.unsupportedProcessor')
      : t('datasource.processors.preview.invalidProcessor');
  }

  return t('datasource.processors.preview.failed');
}

function processorLabel(config: ProcessorConfig) {
  const definition = getProcessorDefinition(processorName(config));
  return definition ? t(definition.titleKey) : processorName(config);
}

function selectFirstValidExample() {
  selectedExampleIndex.value = validExampleIndexes.value[0] ?? null;
}

watch(() => props.open, (open) => {
  if (open) selectFirstValidExample();
}, { immediate: true });

watch(() => props.field?.path, () => {
  if (props.open) selectFirstValidExample();
});

watch(() => validExampleIndexes.value.join(','), () => {
  if (props.open && (selectedExampleIndex.value === null ||
    !validExampleIndexes.value.includes(selectedExampleIndex.value))) {
    selectFirstValidExample();
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && field"
      class="processor-preview-backdrop"
      data-testid="datasource-processor-preview-dialog"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
      @keydown.stop
    >
      <section class="processor-preview-panel mk-form-dialog-panel mk-form-dialog mk-form-dialog--wide">
        <header class="processor-preview-header mk-form-dialog-header">
          <div class="processor-preview-heading">
            <h2 data-testid="datasource-processor-preview-title">
              {{ t('datasource.processors.preview.title') }}
            </h2>
            <p>{{ field.label }} · {{ field.path }}</p>
            <div v-if="field.processors?.length" class="processor-preview-tags">
              <span v-for="(processor, index) in field.processors" :key="`${processorName(processor)}-${index}`">
                {{ processorLabel(processor) }}
              </span>
            </div>
          </div>
          <button class="mk-form-button" type="button" data-testid="datasource-processor-preview-close" @click="emit('close')">
            {{ t('editor.close') }}
          </button>
        </header>

        <div class="processor-preview-body mk-form-dialog-body mk-form-scope">
          <label class="processor-preview-example-field mk-form-field">
            <span>{{ t('datasource.processors.preview.example') }}</span>
            <select class="mk-form-control"
              v-model.number="selectedExampleIndex"
              data-testid="datasource-processor-preview-example-select"
              :disabled="!validExampleIndexes.length"
            >
              <option
                v-for="(example, index) in examples"
                :key="example.id"
                :value="index"
                :disabled="example.value === undefined || Boolean(example.error)"
              >
                {{ t('datasource.fields.responseExample') }} {{ index + 1 }}{{ example.value === undefined || example.error ? ` · ${t('datasource.processors.preview.unavailable')}` : '' }}
              </option>
            </select>
          </label>

          <p
            v-if="!validExampleIndexes.length"
            class="processor-preview-state"
            data-testid="datasource-processor-preview-empty"
          >
            {{ t('datasource.processors.preview.noExamples') }}
          </p>
          <p
            v-else-if="previewState.error"
            class="processor-preview-state processor-preview-state--error"
            data-testid="datasource-processor-preview-error"
          >
            {{ previewState.error }}
          </p>
          <div v-else-if="previewState.result" class="processor-preview-results">
            <section class="processor-preview-result processor-preview-result--final">
              <div>
                <strong>{{ t('datasource.processors.preview.finalValue') }}</strong>
                <p>{{ t('datasource.processors.preview.finalValueHelp') }}</p>
              </div>
              <div class="processor-preview-tree" data-testid="datasource-processor-preview-final">
                <JsonTreeView :value="previewState.result.finalValue" />
              </div>
            </section>
            <section class="processor-preview-result">
              <div>
                <strong>{{ t('datasource.processors.preview.extractedValue') }}</strong>
                <p>{{ t('datasource.processors.preview.extractedValueHelp') }}</p>
              </div>
              <div class="processor-preview-tree" data-testid="datasource-processor-preview-extracted">
                <JsonTreeView :value="previewState.result.extractedValue" />
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.processor-preview-backdrop {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(15 23 42 / 0.5);
}

.processor-preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.processor-preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.processor-preview-heading {
  min-width: 0;
}

.processor-preview-heading h2,
.processor-preview-heading p,
.processor-preview-result p {
  margin: 0;
}

.processor-preview-heading h2 {
  font-size: 17px;
}

.processor-preview-heading p,
.processor-preview-result p {
  margin-top: 3px;
  color: rgb(100 116 139);
  font-size: 13px;
}

.processor-preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.processor-preview-tags span {
  border-radius: 999px;
  padding: 2px 7px;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  font-size: 12px;
}

.processor-preview-header button {
  flex: 0 0 auto;
  cursor: pointer;
}

.processor-preview-body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.processor-preview-results {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 12px;
}

.processor-preview-result {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 9px;
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  padding: 12px;
}

.processor-preview-result--final {
  border-color: rgb(147 197 253);
  background: rgb(239 246 255 / 0.45);
}

.processor-preview-tree {
  min-height: 260px;
  max-height: 470px;
  overflow: auto;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 10px;
  background: white;
}

.processor-preview-state {
  margin: 0;
  border: 1px dashed rgb(203 213 225);
  border-radius: 8px;
  padding: 14px;
  color: rgb(100 116 139);
  font-size: 13px;
}

.processor-preview-state--error {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

.dark .processor-preview-panel,
.dark .processor-preview-header button,
.dark .processor-preview-example-field select,
.dark .processor-preview-tree {
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .processor-preview-header,
.dark .processor-preview-result,
.dark .processor-preview-tree,
.dark .processor-preview-header button,
.dark .processor-preview-example-field select {
  border-color: rgb(51 65 85);
}

.dark .processor-preview-result--final {
  background: rgb(30 58 138 / 0.15);
}

@media (max-width: 720px) {
  .processor-preview-results {
    grid-template-columns: 1fr;
  }

  .processor-preview-tree {
    min-height: 220px;
  }
}
</style>
