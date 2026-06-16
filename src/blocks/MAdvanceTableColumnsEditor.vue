<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MFieldsEditor, {
  normalizeFieldsEditorValue,
  type MFieldsEditorField
} from '@/blocks/MFieldsEditor.vue';
import { useI18n } from '@/i18n';
import {
  createAdvanceTableColumnFromField,
  getAdvanceTableFieldsFromColumns,
  getDefaultAdvanceTableFieldTemplate,
  getSingleParagraphColumnTemplate,
  inferAdvanceTableColumnVariable,
  normalizeAdvanceTableColumns,
  normalizeAdvanceTableFixed,
  normalizeAdvanceTableWidth,
  setSingleParagraphColumnTemplate,
  type AdvanceTableColumnField,
  type MAdvanceTableColumnConfig,
  type MAdvanceTableFixed
} from '@/utils/advanceTableColumns';

type ColumnsEditorPayload = {
  value: MAdvanceTableColumnConfig[];
};

const props = defineProps<{
  edit: boolean;
  value?: MAdvanceTableColumnConfig[];
  onChange?: (payload: ColumnsEditorPayload) => void;
  onToolChange?: (payload: ColumnsEditorPayload) => void;
}>();

const { t } = useI18n();
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const committedColumns = ref<MAdvanceTableColumnConfig[]>(normalizeAdvanceTableColumns(props.value));
const columnsDraft = ref<MAdvanceTableColumnConfig[]>(normalizeAdvanceTableColumns(props.value));

const savedColumnCount = computed(() => committedColumns.value.length);
const selectedFieldValue = computed(() => getAdvanceTableFieldsFromColumns(columnsDraft.value));
const isReadOnly = computed(() => !props.edit);

function cloneColumns(value?: MAdvanceTableColumnConfig[]) {
  return normalizeAdvanceTableColumns(value).map((column) => ({
    ...column,
    columnContent: column.columnContent?.map((block) => ({
      ...block,
      data: { ...block.data },
      ...(block.events ? { events: block.events.map((event) => ({ ...event })) } : {})
    }))
  }));
}

function getColumnVariable(column: MAdvanceTableColumnConfig) {
  return column.fieldVariable?.trim() || inferAdvanceTableColumnVariable(column.columnContent);
}

function getColumnWidthInputValue(column: MAdvanceTableColumnConfig) {
  return column.width ? String(column.width) : '';
}

function getColumnTemplate(column: MAdvanceTableColumnConfig) {
  return getSingleParagraphColumnTemplate(column);
}

function hasCustomColumnContent(column: MAdvanceTableColumnConfig) {
  return getColumnTemplate(column) === undefined;
}

function createDraftFromCommittedValue() {
  columnsDraft.value = cloneColumns(committedColumns.value);
}

function openSettingsDialog() {
  createDraftFromCommittedValue();
  isSettingsDialogOpen.value = true;
  if (!settingsDialogRef.value?.open) {
    settingsDialogRef.value?.showModal();
  }
}

function closeSettingsDialog() {
  isSettingsDialogOpen.value = false;
  if (settingsDialogRef.value?.open) {
    settingsDialogRef.value.close();
  }
}

function normalizeField(field: MFieldsEditorField): AdvanceTableColumnField | undefined {
  const normalized = normalizeFieldsEditorValue([field])[0];
  if (!normalized) return undefined;

  return {
    label: normalized.label,
    variable: normalized.variable,
    dataType: normalized.dataType
  };
}

function mergeFieldsIntoColumns(fields: MFieldsEditorField[]) {
  if (isReadOnly.value) return;

  const normalizedFields = fields
    .map((field) => normalizeField(field))
    .filter((field): field is AdvanceTableColumnField => Boolean(field));
  const selectedVariables = new Set(normalizedFields.map((field) => field.variable));
  const columnsByVariable = new Map<string, MAdvanceTableColumnConfig>();
  const customColumns: MAdvanceTableColumnConfig[] = [];

  columnsDraft.value.forEach((column) => {
    const variable = getColumnVariable(column);
    if (variable) {
      if (!columnsByVariable.has(variable)) {
        columnsByVariable.set(variable, column);
      }
      return;
    }

    customColumns.push(column);
  });

  const mergedColumns = normalizedFields.map((field) => {
    const existingColumn = columnsByVariable.get(field.variable);
    if (!existingColumn) {
      return createAdvanceTableColumnFromField(field);
    }

    return {
      ...existingColumn,
      fieldVariable: field.variable,
      fieldDataType: field.dataType
    };
  });

  columnsDraft.value = [
    ...mergedColumns,
    ...customColumns.filter((column) => {
      const variable = getColumnVariable(column);
      return !variable || selectedVariables.has(variable);
    })
  ];
}

function handleFieldsChange(payload: { value?: MFieldsEditorField[] }) {
  mergeFieldsIntoColumns(payload.value ?? []);
}

function updateColumnName(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = {
    ...column,
    columnName: value
  };
}

function updateColumnVariable(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  const previousVariable = getColumnVariable(column);
  const previousTemplate = getColumnTemplate(column);
  const nextVariable = value.trim();
  let nextColumn: MAdvanceTableColumnConfig = {
    ...column,
    fieldVariable: nextVariable || undefined
  };

  if (
    previousTemplate !== undefined &&
    (!previousTemplate.trim() || previousTemplate === getDefaultAdvanceTableFieldTemplate(previousVariable))
  ) {
    nextColumn = setSingleParagraphColumnTemplate(nextColumn, getDefaultAdvanceTableFieldTemplate(nextVariable));
  }

  columnsDraft.value[index] = nextColumn;
}

function updateColumnWidth(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = {
    ...column,
    width: value.trim() ? normalizeAdvanceTableWidth(Number(value)) : null
  };
}

function updateColumnFixed(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = {
    ...column,
    fixed: normalizeAdvanceTableFixed(value as MAdvanceTableFixed)
  };
}

function updateColumnTemplate(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = setSingleParagraphColumnTemplate(column, value);
}

function resetColumnTemplate(index: number) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = setSingleParagraphColumnTemplate(
    column,
    getDefaultAdvanceTableFieldTemplate(getColumnVariable(column))
  );
}

function removeColumn(index: number) {
  if (isReadOnly.value) return;
  columnsDraft.value.splice(index, 1);
}

function moveColumn(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= columnsDraft.value.length) return;

  const nextColumns = [...columnsDraft.value];
  const [column] = nextColumns.splice(index, 1);
  if (!column) return;
  nextColumns.splice(nextIndex, 0, column);
  columnsDraft.value = nextColumns;
}

function saveColumns() {
  if (isReadOnly.value) return;

  const normalizedColumns = normalizeAdvanceTableColumns(columnsDraft.value);
  committedColumns.value = normalizedColumns;
  props.onToolChange?.({ value: normalizedColumns });
  props.onChange?.({ value: normalizedColumns });
  closeSettingsDialog();
}

watch(
  () => props.value,
  (value) => {
    committedColumns.value = cloneColumns(value);
    if (!isSettingsDialogOpen.value) {
      createDraftFromCommittedValue();
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="ce-advance-table-columns-editor" data-testid="advance-table-columns-editor">
    <div class="ce-advance-table-columns-editor__trigger-row">
      <button
        class="ce-advance-table-columns-editor__primary-button"
        type="button"
        data-testid="advance-table-columns-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('advanceTable.columnsEditor.actions.settings') }}
      </button>
      <div class="ce-advance-table-columns-editor__summary" data-testid="advance-table-columns-summary">
        {{ t('advanceTable.columnsEditor.summary.savedCount').replace('{count}', String(savedColumnCount)) }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-advance-table-columns-editor__dialog"
      data-testid="advance-table-columns-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="advance-table-columns-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-advance-table-columns-editor__dialog-panel">
        <div class="ce-advance-table-columns-editor__dialog-header">
          <h3
            id="advance-table-columns-dialog-title"
            class="ce-advance-table-columns-editor__dialog-title"
            data-testid="advance-table-columns-dialog-title"
          >
            {{ t('advanceTable.columnsEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-advance-table-columns-editor__secondary-button"
            type="button"
            data-testid="advance-table-columns-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-advance-table-columns-editor__dialog-body">
          <section class="ce-advance-table-columns-editor__section" data-testid="advance-table-columns-fields-section">
            <div class="ce-advance-table-columns-editor__section-header">
              <div>
                <div class="ce-advance-table-columns-editor__section-title">
                  {{ t('advanceTable.columnsEditor.sections.fields') }}
                </div>
                <p class="ce-advance-table-columns-editor__section-copy">
                  {{ t('advanceTable.columnsEditor.help.fields') }}
                </p>
              </div>
            </div>
            <div class="ce-advance-table-columns-editor__section-body">
              <MFieldsEditor
                :edit="edit"
                :value="selectedFieldValue"
                :on-change="handleFieldsChange"
              />
            </div>
          </section>

          <section class="ce-advance-table-columns-editor__section" data-testid="advance-table-columns-list-section">
            <div class="ce-advance-table-columns-editor__section-header">
              <div>
                <div class="ce-advance-table-columns-editor__section-title">
                  {{ t('advanceTable.columnsEditor.sections.columns') }}
                </div>
                <p class="ce-advance-table-columns-editor__section-copy">
                  {{ t('advanceTable.columnsEditor.summary.draftCount').replace('{count}', String(columnsDraft.length)) }}
                </p>
              </div>
            </div>

            <div class="ce-advance-table-columns-editor__section-body ce-advance-table-columns-editor__section-body--columns">
              <p
                v-if="!columnsDraft.length"
                class="ce-advance-table-columns-editor__empty"
                data-testid="advance-table-columns-empty"
              >
                {{ t('advanceTable.columnsEditor.empty') }}
              </p>

              <div v-else class="ce-advance-table-columns-editor__table" data-testid="advance-table-columns-list">
                <div class="ce-advance-table-columns-editor__table-head" aria-hidden="true">
                  <span>{{ t('advanceTable.columnsEditor.columns.name') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.variable') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.width') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.fixed') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.template') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.actions') }}</span>
                </div>

                <div
                  v-for="(column, index) in columnsDraft"
                  :key="`${getColumnVariable(column)}-${index}`"
                  class="ce-advance-table-columns-editor__row"
                  :data-testid="`advance-table-column-row-${index}`"
                >
                  <input
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="`advance-table-column-name-${index}`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('advanceTable.columnsEditor.placeholders.name')"
                    :value="column.columnName ?? ''"
                    @input="updateColumnName(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="`advance-table-column-variable-${index}`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('advanceTable.columnsEditor.placeholders.variable')"
                    :value="getColumnVariable(column)"
                    @input="updateColumnVariable(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="`advance-table-column-width-${index}`"
                    type="number"
                    min="1"
                    step="1"
                    :readonly="isReadOnly"
                    :placeholder="t('advanceTable.columnsEditor.placeholders.width')"
                    :value="getColumnWidthInputValue(column)"
                    @input="updateColumnWidth(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <select
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="`advance-table-column-fixed-${index}`"
                    :disabled="isReadOnly"
                    :value="column.fixed ?? ''"
                    @change="updateColumnFixed(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">{{ t('advanceTable.columnsEditor.fixed.none') }}</option>
                    <option value="left">{{ t('advanceTable.columnsEditor.fixed.left') }}</option>
                    <option value="right">{{ t('advanceTable.columnsEditor.fixed.right') }}</option>
                  </select>

                  <div class="ce-advance-table-columns-editor__template-cell">
                    <textarea
                      v-if="!hasCustomColumnContent(column)"
                      class="ce-advance-table-columns-editor__input ce-advance-table-columns-editor__template"
                      :data-testid="`advance-table-column-template-${index}`"
                      :readonly="isReadOnly"
                      rows="2"
                      :placeholder="t('advanceTable.columnsEditor.placeholders.template')"
                      :value="getColumnTemplate(column)"
                      @input="updateColumnTemplate(index, ($event.target as HTMLTextAreaElement).value)"
                      @keydown.stop
                    ></textarea>
                    <div
                      v-else
                      class="ce-advance-table-columns-editor__custom-content"
                      :data-testid="`advance-table-column-custom-content-${index}`"
                    >
                      {{ t('advanceTable.columnsEditor.customContent') }}
                    </div>
                  </div>

                  <div class="ce-advance-table-columns-editor__actions">
                    <button
                      class="ce-advance-table-columns-editor__icon-button"
                      type="button"
                      :data-testid="`advance-table-column-move-up-${index}`"
                      :disabled="isReadOnly || index === 0"
                      @click="moveColumn(index, -1)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.moveUp') }}
                    </button>
                    <button
                      class="ce-advance-table-columns-editor__icon-button"
                      type="button"
                      :data-testid="`advance-table-column-move-down-${index}`"
                      :disabled="isReadOnly || index === columnsDraft.length - 1"
                      @click="moveColumn(index, 1)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.moveDown') }}
                    </button>
                    <button
                      class="ce-advance-table-columns-editor__icon-button"
                      type="button"
                      :data-testid="`advance-table-column-reset-template-${index}`"
                      :disabled="isReadOnly"
                      @click="resetColumnTemplate(index)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.resetTemplate') }}
                    </button>
                    <button
                      class="ce-advance-table-columns-editor__danger-button"
                      type="button"
                      :data-testid="`advance-table-column-remove-${index}`"
                      :disabled="isReadOnly"
                      @click="removeColumn(index)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.remove') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="ce-advance-table-columns-editor__dialog-actions">
          <button
            class="ce-advance-table-columns-editor__secondary-button"
            type="button"
            data-testid="advance-table-columns-cancel"
            @click="closeSettingsDialog"
          >
            {{ edit ? t('advanceTable.columnsEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-advance-table-columns-editor__primary-button"
            type="button"
            data-testid="advance-table-columns-save"
            @click="saveColumns"
          >
            {{ t('advanceTable.columnsEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.ce-advance-table-columns-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-advance-table-columns-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-advance-table-columns-editor__primary-button {
  flex: 0 0 auto;
  min-height: 34px;
  border: 1px solid rgb(20 184 166 / 0.55);
  border-radius: 8px;
  padding: 6px 14px;
  background: rgb(20 184 166);
  color: rgb(255 255 255);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.ce-advance-table-columns-editor__primary-button:hover {
  background: rgb(13 148 136);
}

.ce-advance-table-columns-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-advance-table-columns-editor__dialog {
  width: min(calc(100vw - 32px), 1180px);
  max-height: min(calc(100vh - 32px), 880px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-advance-table-columns-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-advance-table-columns-editor__dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-advance-table-columns-editor__dialog-header,
.ce-advance-table-columns-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
}

.ce-advance-table-columns-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-advance-table-columns-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 700;
}

.ce-advance-table-columns-editor__dialog-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  padding: 12px;
}

.ce-advance-table-columns-editor__section {
  display: flex;
  min-height: 0;
  flex: 0 0 auto;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-advance-table-columns-editor__section-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
  background: rgb(248 250 252);
}

.ce-advance-table-columns-editor__section-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.ce-advance-table-columns-editor__section-body--columns {
  max-height: min(48vh, 520px);
  overflow: auto;
}

.ce-advance-table-columns-editor__section-title {
  color: rgb(15 23 42);
  font-size: 15px;
  font-weight: 700;
}

.ce-advance-table-columns-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-advance-table-columns-editor__empty {
  margin: 0;
  color: rgb(100 116 139);
}

.ce-advance-table-columns-editor__table {
  display: flex;
  min-width: 980px;
  flex-direction: column;
  gap: 8px;
}

.ce-advance-table-columns-editor__table-head,
.ce-advance-table-columns-editor__row {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(140px, 0.8fr) 90px 120px minmax(220px, 1fr) minmax(260px, 1fr);
  gap: 8px;
  align-items: center;
}

.ce-advance-table-columns-editor__table-head {
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.ce-advance-table-columns-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(255 255 255);
}

.ce-advance-table-columns-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
}

.ce-advance-table-columns-editor__template {
  min-height: 58px;
  resize: vertical;
}

.ce-advance-table-columns-editor__input:focus {
  outline: none;
  border-color: rgb(20 184 166);
  box-shadow: 0 0 0 2px rgb(20 184 166 / 0.15);
}

.ce-advance-table-columns-editor__input:read-only,
.ce-advance-table-columns-editor__input:disabled {
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-advance-table-columns-editor__template-cell {
  min-width: 0;
}

.ce-advance-table-columns-editor__custom-content {
  min-height: 58px;
  border: 1px dashed rgb(148 163 184 / 0.75);
  border-radius: 8px;
  padding: 8px 9px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 13px;
  line-height: 20px;
}

.ce-advance-table-columns-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-advance-table-columns-editor__secondary-button,
.ce-advance-table-columns-editor__icon-button,
.ce-advance-table-columns-editor__danger-button {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 6px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-advance-table-columns-editor__icon-button {
  min-height: 32px;
  padding: 5px 8px;
  font-size: 12px;
}

.ce-advance-table-columns-editor__danger-button {
  min-height: 32px;
  padding: 5px 8px;
  color: rgb(185 28 28);
  font-size: 12px;
}

.ce-advance-table-columns-editor__secondary-button:hover,
.ce-advance-table-columns-editor__icon-button:hover,
.ce-advance-table-columns-editor__danger-button:hover {
  background: rgb(248 250 252);
}

.ce-advance-table-columns-editor__primary-button:disabled,
.ce-advance-table-columns-editor__secondary-button:disabled,
.ce-advance-table-columns-editor__icon-button:disabled,
.ce-advance-table-columns-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

:global(.dark) .ce-advance-table-columns-editor {
  color: rgb(226 232 240);
}

:global(.dark) .ce-advance-table-columns-editor__summary,
:global(.dark) .ce-advance-table-columns-editor__section-header,
:global(.dark) .ce-advance-table-columns-editor__custom-content {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
  color: rgb(203 213 225);
}

:global(.dark) .ce-advance-table-columns-editor__dialog-panel,
:global(.dark) .ce-advance-table-columns-editor__section,
:global(.dark) .ce-advance-table-columns-editor__row {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .ce-advance-table-columns-editor__dialog-header,
:global(.dark) .ce-advance-table-columns-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

:global(.dark) .ce-advance-table-columns-editor__dialog-title,
:global(.dark) .ce-advance-table-columns-editor__section-title {
  color: rgb(241 245 249);
}

:global(.dark) .ce-advance-table-columns-editor__section-copy,
:global(.dark) .ce-advance-table-columns-editor__empty,
:global(.dark) .ce-advance-table-columns-editor__table-head {
  color: rgb(148 163 184);
}

:global(.dark) .ce-advance-table-columns-editor__input,
:global(.dark) .ce-advance-table-columns-editor__secondary-button,
:global(.dark) .ce-advance-table-columns-editor__icon-button,
:global(.dark) .ce-advance-table-columns-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.dark) .ce-advance-table-columns-editor__input:read-only,
:global(.dark) .ce-advance-table-columns-editor__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}
</style>
