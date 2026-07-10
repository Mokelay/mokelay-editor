<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MFieldsEditor, {
  normalizeFieldsEditorValue,
  type MFieldsEditorField
} from '@/blocks/MFieldsEditor.vue';
import {
  cloneFormItemData,
  normalizeMFormItems,
  type MFormItemData
} from '@/blocks/mFormEditorTool';
import {
  createInitialFormItemEditorBlock,
  getDefaultFormItemToolName,
  getFormItemToolNames,
  isAllowedFormItemToolName
} from '@/blocks/mFormItemTools';
import { getEditorComponentDefinition } from '@/editors/editorComponentRuntimeRegistry';
import { useI18n } from '@/i18n';
import { getClientBlockDocSnapshot } from '@/utils/clientBlockDocs';

type FormItemsEditorPayload = {
  value: MFormItemData[];
};

const props = defineProps<{
  edit: boolean;
  value?: MFormItemData[];
  onChange?: (payload: FormItemsEditorPayload) => void;
  onToolChange?: (payload: FormItemsEditorPayload) => void;
}>();

const { t } = useI18n();
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const committedItems = ref<MFormItemData[]>(cloneItems(props.value));
const itemsDraft = ref<MFormItemData[]>(cloneItems(props.value));

const savedItemCount = computed(() => committedItems.value.length);
const selectedFieldValue = computed(() => getFieldsFromItems(itemsDraft.value));
const isReadOnly = computed(() => !props.edit);
const formItemToolOptions = computed(() => getFormItemToolNames().map((toolName) => ({
  label: getToolTitle(toolName),
  value: toolName
})));

function cloneItems(value?: MFormItemData[]) {
  return normalizeMFormItems(value).map((item) => cloneFormItemData(item));
}

function getToolTitle(toolName: string) {
  const doc = getClientBlockDocSnapshot(toolName);
  if (doc?.displayName) return doc.displayName;
  return getEditorComponentDefinition(toolName)?.toolbox.title ?? toolName;
}

function createDraftFromCommittedValue() {
  itemsDraft.value = cloneItems(committedItems.value);
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

function normalizeField(field: MFieldsEditorField): MFieldsEditorField | undefined {
  return normalizeFieldsEditorValue([field])[0];
}

function getFieldsFromItems(items?: MFormItemData[]): MFieldsEditorField[] {
  const fieldsByVariable = new Map<string, MFieldsEditorField>();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const variable = item.variableName.trim();
    if (!variable || fieldsByVariable.has(variable)) return;

    fieldsByVariable.set(variable, {
      label: item.labelName,
      variable,
      dataType: item.fieldDataType || 'string'
    });
  });

  return [...fieldsByVariable.values()];
}

function createFormItemFromField(field: MFieldsEditorField): MFormItemData {
  const toolName = getDefaultFormItemToolName();
  return cloneFormItemData({
    labelName: field.label,
    variableName: field.variable,
    fieldDataType: field.dataType,
    layout: 'Vertical',
    ...(toolName ? { editor: createInitialFormItemEditorBlock(toolName) } : {})
  });
}

function mergeFieldsIntoItems(fields: MFieldsEditorField[]) {
  if (isReadOnly.value) return;

  const normalizedFields = fields
    .map((field) => normalizeField(field))
    .filter((field): field is MFieldsEditorField => Boolean(field));
  const itemsByVariable = new Map<string, MFormItemData>();

  itemsDraft.value.forEach((item) => {
    const variable = item.variableName.trim();
    if (variable && !itemsByVariable.has(variable)) {
      itemsByVariable.set(variable, item);
    }
  });

  itemsDraft.value = normalizedFields.map((field) => {
    const existingItem = itemsByVariable.get(field.variable);
    if (!existingItem) {
      return createFormItemFromField(field);
    }

    return cloneFormItemData({
      ...existingItem,
      labelName: field.label,
      variableName: field.variable,
      fieldDataType: field.dataType
    });
  });
}

function handleFieldsChange(payload: { value?: MFieldsEditorField[] }) {
  mergeFieldsIntoItems(payload.value ?? []);
}

function updateItemLabelName(index: number, value: string) {
  if (isReadOnly.value) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    labelName: value
  };
}

function updateItemVariableName(index: number, value: string) {
  if (isReadOnly.value) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    variableName: value
  };
}

function updateItemLayout(index: number, value: string) {
  if (isReadOnly.value) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    layout: value === 'Horizontal' ? 'Horizontal' : 'Vertical'
  };
}

function getItemEditorToolName(item: MFormItemData) {
  const toolName = item.editor?.type;
  if (toolName && isAllowedFormItemToolName(toolName)) {
    return toolName;
  }

  return getDefaultFormItemToolName() ?? '';
}

function updateItemEditorToolName(index: number, value: string) {
  if (isReadOnly.value || !isAllowedFormItemToolName(value)) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    editor: createInitialFormItemEditorBlock(value)
  };
}

function removeItem(index: number) {
  if (isReadOnly.value) return;
  itemsDraft.value.splice(index, 1);
}

function moveItem(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= itemsDraft.value.length) return;

  const nextItems = [...itemsDraft.value];
  const [item] = nextItems.splice(index, 1);
  if (!item) return;
  nextItems.splice(nextIndex, 0, item);
  itemsDraft.value = nextItems;
}

function saveItems() {
  if (isReadOnly.value) return;

  const normalizedItems = cloneItems(itemsDraft.value);
  committedItems.value = normalizedItems;
  props.onToolChange?.({ value: normalizedItems });
  props.onChange?.({ value: normalizedItems });
  closeSettingsDialog();
}

watch(
  () => props.value,
  (value) => {
    committedItems.value = cloneItems(value);
    if (!isSettingsDialogOpen.value) {
      createDraftFromCommittedValue();
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="ce-form-items-editor" data-testid="form-items-editor">
    <div class="ce-form-items-editor__trigger-row">
      <button
        class="ce-form-items-editor__primary-button"
        type="button"
        data-testid="form-items-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('form.itemsEditor.actions.settings') }}
      </button>
      <div class="ce-form-items-editor__summary" data-testid="form-items-summary">
        {{ t('form.itemsEditor.summary.savedCount').replace('{count}', String(savedItemCount)) }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-form-items-editor__dialog"
      data-testid="form-items-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="form-items-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-form-items-editor__dialog-panel">
        <div class="ce-form-items-editor__dialog-header">
          <h3
            id="form-items-dialog-title"
            class="ce-form-items-editor__dialog-title"
            data-testid="form-items-dialog-title"
          >
            {{ t('form.itemsEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-form-items-editor__secondary-button"
            type="button"
            data-testid="form-items-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-form-items-editor__dialog-body">
          <section class="ce-form-items-editor__section" data-testid="form-items-fields-section">
            <div class="ce-form-items-editor__section-header">
              <div>
                <div class="ce-form-items-editor__section-title">
                  {{ t('form.itemsEditor.sections.fields') }}
                </div>
                <p class="ce-form-items-editor__section-copy">
                  {{ t('form.itemsEditor.help.fields') }}
                </p>
              </div>
            </div>
            <div class="ce-form-items-editor__section-body">
              <MFieldsEditor
                :edit="edit"
                :value="selectedFieldValue"
                :on-change="handleFieldsChange"
              />
            </div>
          </section>

          <section class="ce-form-items-editor__section" data-testid="form-items-list-section">
            <div class="ce-form-items-editor__section-header">
              <div>
                <div class="ce-form-items-editor__section-title">
                  {{ t('form.itemsEditor.sections.items') }}
                </div>
                <p class="ce-form-items-editor__section-copy">
                  {{ t('form.itemsEditor.summary.draftCount').replace('{count}', String(itemsDraft.length)) }}
                </p>
              </div>
            </div>

            <div class="ce-form-items-editor__section-body ce-form-items-editor__section-body--items">
              <p
                v-if="!itemsDraft.length"
                class="ce-form-items-editor__empty"
                data-testid="form-items-empty"
              >
                {{ t('form.itemsEditor.empty') }}
              </p>

              <div v-else class="ce-form-items-editor__table" data-testid="form-items-list">
                <div class="ce-form-items-editor__table-head" aria-hidden="true">
                  <span>{{ t('form.itemsEditor.columns.label') }}</span>
                  <span>{{ t('form.itemsEditor.columns.variable') }}</span>
                  <span>{{ t('form.itemsEditor.columns.layout') }}</span>
                  <span>{{ t('form.itemsEditor.columns.editor') }}</span>
                  <span>{{ t('form.itemsEditor.columns.actions') }}</span>
                </div>

                <div
                  v-for="(item, index) in itemsDraft"
                  :key="`${item.variableName}-${index}`"
                  class="ce-form-items-editor__row"
                  :data-testid="`form-item-row-${index}`"
                >
                  <input
                    class="ce-form-items-editor__input"
                    :data-testid="`form-item-label-${index}`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('form.itemsEditor.placeholders.label')"
                    :value="item.labelName"
                    @input="updateItemLabelName(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-form-items-editor__input"
                    :data-testid="`form-item-variable-${index}`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('form.itemsEditor.placeholders.variable')"
                    :value="item.variableName"
                    @input="updateItemVariableName(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <select
                    class="ce-form-items-editor__input"
                    :data-testid="`form-item-layout-${index}`"
                    :disabled="isReadOnly"
                    :value="item.layout"
                    @change="updateItemLayout(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="Vertical">{{ t('formItem.layouts.vertical') }}</option>
                    <option value="Horizontal">{{ t('formItem.layouts.horizontal') }}</option>
                  </select>
                  <select
                    class="ce-form-items-editor__input"
                    :data-testid="`form-item-editor-type-${index}`"
                    :disabled="isReadOnly"
                    :value="getItemEditorToolName(item)"
                    @change="updateItemEditorToolName(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option
                      v-for="option in formItemToolOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <div class="ce-form-items-editor__actions">
                    <button
                      class="ce-form-items-editor__icon-button"
                      type="button"
                      :data-testid="`form-item-move-up-${index}`"
                      :disabled="isReadOnly || index === 0"
                      @click="moveItem(index, -1)"
                    >
                      {{ t('form.itemsEditor.actions.moveUp') }}
                    </button>
                    <button
                      class="ce-form-items-editor__icon-button"
                      type="button"
                      :data-testid="`form-item-move-down-${index}`"
                      :disabled="isReadOnly || index === itemsDraft.length - 1"
                      @click="moveItem(index, 1)"
                    >
                      {{ t('form.itemsEditor.actions.moveDown') }}
                    </button>
                    <button
                      class="ce-form-items-editor__danger-button"
                      type="button"
                      :data-testid="`form-item-remove-${index}`"
                      :disabled="isReadOnly"
                      @click="removeItem(index)"
                    >
                      {{ t('form.itemsEditor.actions.remove') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="ce-form-items-editor__dialog-actions">
          <button
            class="ce-form-items-editor__secondary-button"
            type="button"
            data-testid="form-items-cancel"
            @click="closeSettingsDialog"
          >
            {{ edit ? t('form.itemsEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-form-items-editor__primary-button"
            type="button"
            data-testid="form-items-save"
            @click="saveItems"
          >
            {{ t('form.itemsEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.ce-form-items-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-form-items-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-form-items-editor__primary-button {
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

.ce-form-items-editor__primary-button:hover {
  background: rgb(13 148 136);
}

.ce-form-items-editor__summary {
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

.ce-form-items-editor__dialog {
  width: min(calc(100vw - 32px), 1100px);
  max-height: min(calc(100vh - 32px), 860px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-form-items-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-form-items-editor__dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-form-items-editor__dialog-header,
.ce-form-items-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.ce-form-items-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-form-items-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 750;
  line-height: 24px;
}

.ce-form-items-editor__dialog-body {
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.25fr);
  gap: 14px;
  overflow: auto;
  padding: 14px 16px;
}

.ce-form-items-editor__section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-form-items-editor__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px;
  background: rgb(248 250 252);
}

.ce-form-items-editor__section-body {
  padding: 12px;
}

.ce-form-items-editor__section-body--items {
  overflow: auto;
}

.ce-form-items-editor__section-title {
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 750;
  line-height: 20px;
}

.ce-form-items-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 12px;
  line-height: 18px;
}

.ce-form-items-editor__empty {
  margin: 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-form-items-editor__table {
  min-width: 720px;
}

.ce-form-items-editor__table-head,
.ce-form-items-editor__row {
  display: grid;
  grid-template-columns: minmax(130px, 0.9fr) minmax(130px, 0.9fr) 120px 160px minmax(220px, 1fr);
  align-items: center;
  gap: 8px;
}

.ce-form-items-editor__table-head {
  padding: 0 0 8px;
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.ce-form-items-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(255 255 255);
}

.ce-form-items-editor__row + .ce-form-items-editor__row {
  margin-top: 8px;
}

.ce-form-items-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
  font-size: 13px;
  line-height: 18px;
}

.ce-form-items-editor__input:focus {
  border-color: rgb(20 184 166);
  outline: 2px solid rgb(20 184 166 / 0.18);
}

.ce-form-items-editor__input:read-only,
.ce-form-items-editor__input:disabled {
  cursor: not-allowed;
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-form-items-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-form-items-editor__secondary-button,
.ce-form-items-editor__icon-button,
.ce-form-items-editor__danger-button {
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 5px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.ce-form-items-editor__icon-button {
  min-height: 28px;
  padding: 4px 8px;
  font-size: 12px;
}

.ce-form-items-editor__danger-button {
  border-color: rgb(254 202 202);
  color: rgb(185 28 28);
}

.ce-form-items-editor__secondary-button:hover,
.ce-form-items-editor__icon-button:hover,
.ce-form-items-editor__danger-button:hover {
  background: rgb(248 250 252);
}

.ce-form-items-editor__primary-button:disabled,
.ce-form-items-editor__secondary-button:disabled,
.ce-form-items-editor__icon-button:disabled,
.ce-form-items-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dark .ce-form-items-editor {
  color: rgb(226 232 240);
}

.dark .ce-form-items-editor__summary,
.dark .ce-form-items-editor__section-header {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(203 213 225);
}

.dark .ce-form-items-editor__dialog-panel,
.dark .ce-form-items-editor__section,
.dark .ce-form-items-editor__row {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
}

.dark .ce-form-items-editor__dialog-header,
.dark .ce-form-items-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .ce-form-items-editor__dialog-title,
.dark .ce-form-items-editor__section-title {
  color: rgb(248 250 252);
}

.dark .ce-form-items-editor__section-copy,
.dark .ce-form-items-editor__empty,
.dark .ce-form-items-editor__table-head {
  color: rgb(148 163 184);
}

.dark .ce-form-items-editor__input,
.dark .ce-form-items-editor__secondary-button,
.dark .ce-form-items-editor__icon-button,
.dark .ce-form-items-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .ce-form-items-editor__input:read-only,
.dark .ce-form-items-editor__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}

@media (max-width: 920px) {
  .ce-form-items-editor__dialog-body {
    grid-template-columns: 1fr;
  }
}
</style>
