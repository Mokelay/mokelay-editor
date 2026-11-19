<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import AiDslRequestContextProcessorEditor from '@/processors/components/AiDslRequestContextProcessorEditor.vue';
import DateTimeFormatProcessorEditor from '@/processors/components/DateTimeFormatProcessorEditor.vue';
import FilterProcessorEditor from '@/processors/components/FilterProcessorEditor.vue';
import MergeDataProcessorEditor from '@/processors/components/MergeDataProcessorEditor.vue';
import RandomIdProcessorEditor from '@/processors/components/RandomIdProcessorEditor.vue';
import TrimProcessorEditor from '@/processors/components/TrimProcessorEditor.vue';
import {
  getProcessorDefinition,
  getProcessorsForType,
  normalizeProcessors,
  processorName
} from 'mokelay-components/processors';
import type { ProcessorConfig } from 'mokelay-components/processors/types';
import type { DatasourceSchemaSelection } from 'mokelay-components/datasource';

type DraftProcessor = {
  id: number;
  config: ProcessorConfig;
};

const props = defineProps<{
  open: boolean;
  field?: DatasourceSchemaSelection;
  readonly?: boolean;
  teleportDisabled?: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'apply', processors: ProcessorConfig[]): void;
}>();

const { t } = useI18n();
const draftProcessors = ref<DraftProcessor[]>([]);
const selectedProcessorName = ref('');
const editorValidity = ref<Record<number, boolean>>({});
let processorId = 0;

const availableProcessors = computed(() => props.field ? getProcessorsForType(props.field.type) : []);
const canApply = computed(() => draftProcessors.value.every((item) => {
  if (editorValidity.value[item.id] === false) return false;
  const definition = getProcessorDefinition(processorName(item.config));
  if (!definition?.validateParam || typeof item.config === 'string') return true;
  try {
    definition.validateParam(item.config.param);
    return true;
  } catch {
    return false;
  }
}));

function resetDraft() {
  draftProcessors.value = normalizeProcessors(props.field?.processors).map((config) => ({
    id: processorId++,
    config
  }));
  editorValidity.value = {};
  selectedProcessorName.value = availableProcessors.value[0]?.name ?? '';
}

function addProcessor() {
  const definition = getProcessorDefinition(selectedProcessorName.value);
  if (!definition || props.readonly) return;
  draftProcessors.value.push({ id: processorId++, config: definition.createDefault() });
}

function removeProcessor(index: number) {
  const [removed] = draftProcessors.value.splice(index, 1);
  if (!removed) return;
  const nextValidity = { ...editorValidity.value };
  delete nextValidity[removed.id];
  editorValidity.value = nextValidity;
}

function moveProcessor(index: number, offset: number) {
  const targetIndex = index + offset;
  if (targetIndex < 0 || targetIndex >= draftProcessors.value.length) return;
  const next = [...draftProcessors.value];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  draftProcessors.value = next;
}

function editorComponent(config: ProcessorConfig) {
  const name = processorName(config);
  if (name === 'ai_dsl_request_context') return AiDslRequestContextProcessorEditor;
  if (name === 'trim') return TrimProcessorEditor;
  if (name === 'merge_data') return MergeDataProcessorEditor;
  if (name === 'filter') return FilterProcessorEditor;
  if (name === 'date_time_format') return DateTimeFormatProcessorEditor;
  if (name === 'random_id') return RandomIdProcessorEditor;
  return undefined;
}

function processorTitle(config: ProcessorConfig) {
  const name = processorName(config);
  const definition = getProcessorDefinition(name);
  return definition ? t(definition.titleKey) : name;
}

function processorWarning(config: ProcessorConfig) {
  const name = processorName(config);
  const definition = getProcessorDefinition(name);
  if (!definition) return t('datasource.processors.unsupported');
  if (props.field && !definition.supportedTypes.includes(props.field.type)) {
    return t('datasource.processors.incompatible');
  }
  return '';
}

function updateProcessor(index: number, config: ProcessorConfig) {
  const item = draftProcessors.value[index];
  if (!item) return;
  item.config = config;
}

function updateValidity(id: number, valid: boolean) {
  editorValidity.value = { ...editorValidity.value, [id]: valid };
}

function applyChanges() {
  if (!canApply.value || props.readonly) return;
  emit('apply', draftProcessors.value.map((item) => item.config));
}

watch(() => [props.open, props.field?.path], () => {
  if (props.open) resetDraft();
}, { immediate: true });
</script>

<template>
  <Teleport to="body" :disabled="teleportDisabled">
    <div
      v-if="open && field"
      class="processor-dialog-backdrop"
      data-testid="datasource-processor-dialog"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
      @keydown.stop
    >
      <section class="processor-dialog-panel mk-form-dialog-panel mk-form-dialog mk-form-dialog--wide">
        <header class="processor-dialog-header mk-form-dialog-header">
          <div>
            <h2 data-testid="datasource-processor-dialog-title">{{ t('datasource.processors.dialogTitle') }}</h2>
            <p>{{ field.label }} · {{ field.path }}</p>
          </div>
          <button class="mk-form-button" type="button" data-testid="datasource-processor-dialog-close" @click="emit('close')">
            {{ t('datasource.actions.cancel') }}
          </button>
        </header>

        <div class="processor-dialog-body mk-form-dialog-body mk-form-scope">
          <div v-if="!readonly" class="processor-dialog-add-row">
            <select class="mk-form-control" v-model="selectedProcessorName" data-testid="datasource-processor-select">
              <option v-for="definition in availableProcessors" :key="definition.name" :value="definition.name">
                {{ t(definition.titleKey) }}
              </option>
            </select>
            <button class="mk-form-button"
              type="button"
              data-testid="datasource-processor-add"
              :disabled="!selectedProcessorName"
              @click="addProcessor"
            >
              {{ t('datasource.processors.add') }}
            </button>
          </div>

          <p v-if="!draftProcessors.length" class="processor-dialog-empty" data-testid="datasource-processor-empty">
            {{ t('datasource.processors.empty') }}
          </p>

          <div v-else class="processor-dialog-list">
            <article
              v-for="(item, index) in draftProcessors"
              :key="item.id"
              class="processor-dialog-item mk-form-scope"
              :data-testid="`datasource-processor-item-${index}`"
            >
              <div class="processor-dialog-item-header">
                <div>
                  <strong>{{ processorTitle(item.config) }}</strong>
                  <span>{{ processorName(item.config) }}</span>
                </div>
                <div v-if="!readonly" class="processor-dialog-item-actions">
                  <button class="mk-form-button"
                    type="button"
                    :data-testid="`datasource-processor-up-${index}`"
                    :disabled="index === 0"
                    @click="moveProcessor(index, -1)"
                  >{{ t('datasource.processors.up') }}</button>
                  <button class="mk-form-button"
                    type="button"
                    :data-testid="`datasource-processor-down-${index}`"
                    :disabled="index === draftProcessors.length - 1"
                    @click="moveProcessor(index, 1)"
                  >{{ t('datasource.processors.down') }}</button>
                  <button
                    type="button"
                    class="processor-dialog-remove mk-form-button mk-form-button--danger"
                    :data-testid="`datasource-processor-remove-${index}`"
                    @click="removeProcessor(index)"
                  >{{ t('datasource.actions.remove') }}</button>
                </div>
              </div>

              <p v-if="processorWarning(item.config)" class="processor-dialog-warning">
                {{ processorWarning(item.config) }}
              </p>

              <component
                :is="editorComponent(item.config)"
                v-if="editorComponent(item.config)"
                :model-value="item.config"
                :readonly="readonly"
                @update:model-value="updateProcessor(index, $event)"
                @validity-change="updateValidity(item.id, $event)"
              />
            </article>
          </div>
        </div>

        <footer class="processor-dialog-footer mk-form-dialog-footer">
          <button class="mk-form-button" type="button" data-testid="datasource-processor-cancel" @click="emit('close')">
            {{ readonly ? t('editor.close') : t('datasource.actions.cancel') }}
          </button>
          <button
            v-if="!readonly"
            type="button"
            class="processor-dialog-apply mk-form-button mk-form-button--primary"
            data-testid="datasource-processor-apply"
            :disabled="!canApply"
            @click="applyChanges"
          >
            {{ t('datasource.processors.apply') }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.processor-dialog-backdrop {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(15 23 42 / 0.5);
}

.processor-dialog-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.processor-dialog-header,
.processor-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.processor-dialog-header h2,
.processor-dialog-header p {
  margin: 0;
}

.processor-dialog-header h2 {
  font-size: 17px;
}

.processor-dialog-header p {
  margin-top: 3px;
  color: rgb(100 116 139);
  font-size: 13px;
}

.processor-dialog-body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--mk-form-field-gap);
  overflow-y: auto;
}

.processor-dialog-add-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.processor-dialog-list {
  display: flex;
  flex-direction: column;
  gap: var(--mk-form-field-gap);
}

.processor-dialog-item {
  display: flex;
  flex-direction: column;
  gap: var(--mk-form-field-gap);
  border: 1px solid rgb(203 213 225);
  border-radius: 9px;
  padding: 12px;
}

.processor-dialog-item-header,
.processor-dialog-item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.processor-dialog-item-header strong,
.processor-dialog-item-header span {
  display: block;
}

.processor-dialog-item-header span {
  color: rgb(100 116 139);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.processor-dialog-header button,
.processor-dialog-footer button,
.processor-dialog-item-actions button,
.processor-dialog-add-row button {
  cursor: pointer;
}

.processor-dialog-item-actions button:disabled,
.processor-dialog-footer button:disabled,
.processor-dialog-add-row button:disabled {
  cursor: default;
  opacity: 0.5;
}

.processor-dialog-footer {
  justify-content: flex-end;
}

.processor-dialog-empty,
.processor-dialog-warning {
  margin: 0;
  border: 1px dashed rgb(203 213 225);
  border-radius: 8px;
  padding: 10px;
  color: rgb(100 116 139);
  font-size: 13px;
}

.processor-dialog-warning {
  border-color: rgb(253 230 138);
  background: rgb(254 252 232);
  color: rgb(161 98 7);
}

.dark .processor-dialog-header,
.dark .processor-dialog-footer,
.dark .processor-dialog-item {
  border-color: rgb(51 65 85);
}

.dark .processor-dialog-add-row select,
.dark .processor-dialog-header button,
.dark .processor-dialog-footer button,
.dark .processor-dialog-item-actions button,
.dark .processor-dialog-add-row button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(191 219 254);
}

@media (max-width: 640px) {
  .processor-dialog-item-header {
    align-items: stretch;
    flex-direction: column;
  }

  .processor-dialog-item-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
