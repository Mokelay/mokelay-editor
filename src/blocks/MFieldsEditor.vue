<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import { bodyDataTypes } from '@/utils/datasource';
import { isRecord } from '@/utils/datasourceSchema';

export interface MFieldsEditorField {
  label: string;
  variable: string;
  dataType: string;
}

export interface MFieldsEditorProps {
  edit: boolean;
  value?: MFieldsEditorField[];
}

const fieldDataTypeOptions = bodyDataTypes;

function normalizeFieldsEditorDataType(value: unknown) {
  return fieldDataTypeOptions.includes(value as typeof fieldDataTypeOptions[number])
    ? value as string
    : 'string';
}

function normalizeFieldsEditorField(value: unknown): MFieldsEditorField | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = typeof value.label === 'string' ? value.label.trim() : '';
  const variable = typeof value.variable === 'string' ? value.variable.trim() : '';
  if (!label || !variable) {
    return undefined;
  }

  return {
    label,
    variable,
    dataType: normalizeFieldsEditorDataType(value.dataType)
  };
}

export function normalizeFieldsEditorValue(value: unknown): MFieldsEditorField[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const fieldsByVariable = new Map<string, MFieldsEditorField>();
  value.forEach((item) => {
    const field = normalizeFieldsEditorField(item);
    if (field && !fieldsByVariable.has(field.variable)) {
      fieldsByVariable.set(field.variable, field);
    }
  });

  return [...fieldsByVariable.values()];
}

export const mFieldsEditorTool = defineEditorTool<MFieldsEditorProps>({
  toolbox: {
    get title() {
      return i18n.t('fieldsEditor.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  createInitialProps: () => ({
    value: []
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeFieldsEditorValue(props.value)
  }),
  serialize: (props) => ({
    value: normalizeFieldsEditorValue(props.value)
  })
});
</script>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import DatasourceApiImportDialog, {
  type DatasourceApiImportSource
} from '@/blocks/components/DatasourceApiImportDialog.vue';
import DatasourceResponseMockDialog, {
  type DatasourceResponseMockCapturePayload
} from '@/blocks/components/DatasourceResponseMockDialog.vue';
import { useEditorBlockToolbarAlignment } from '@/composables/useEditorBlockToolbarAlignment';
import { useI18n } from '@/i18n';
import {
  $remote as resolveDatasourceRemote,
  DatasourceError,
  bodyDataTypes as setupBodyDataTypes,
  getDefaultApiDatasource,
  normalizeBodyValue,
  normalizeDatasource,
  type DatasourceRequestOptions,
  type MDatasourceApiObject,
  type MDatasourceBodyItem,
  type JsonValue
} from '@/utils/datasource';
import {
  getSchemaSelectionFields,
  inferJSONSchema,
  type SchemaSelectionField
} from '@/utils/datasourceSchema';
import { translateTextsToChinese } from '@/utils/translationsApi';
import type { ImportedApiDatasource } from '@/utils/datasourceApiImport';
import {
  getDefaultApiDomainUuid,
  listApiDomains,
  normalizeApiDomainUuid,
  type ApiDomainRecord
} from '@/utils/apiDomains';

type FieldsEditorCandidateSource = 'saved' | 'manual' | 'api' | 'response';

type FieldsEditorCandidate = MFieldsEditorField & {
  id: string;
  selected: boolean;
  source: FieldsEditorCandidateSource;
};

const props = defineProps<MFieldsEditorProps & {
  onChange?: (payload: MFieldsEditorProps) => void;
  onToolChange?: (payload: MFieldsEditorProps) => void;
}>();

const { t } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const fieldsDraft = ref<FieldsEditorCandidate[]>([]);
const availableFieldsDraft = ref<FieldsEditorCandidate[]>([]);
const availableFieldSearch = ref('');
const validationError = ref('');
const fieldTranslationLoading = ref(false);
const fieldTranslationError = ref('');
const apiImportSource = ref<DatasourceApiImportSource>('mokelay');
const isApiImportDialogOpen = ref(false);
const importedDatasource = shallowRef<MDatasourceApiObject | null>(null);
const apiDomainOptions = ref<ApiDomainRecord[]>([]);
const apiDomainLoading = ref(false);
const apiDomainError = ref('');
const hasLoadedApiDomains = ref(false);
const isResponseMockDialogOpen = ref(false);
const responseMockDomain = ref('');
const responseCaptureLoading = ref(false);
const responseCaptureError = ref('');
const committedFields = ref<MFieldsEditorField[]>(normalizeFieldsEditorValue(props.value));
const fieldOptions = setupBodyDataTypes;
let fieldCandidateId = 0;

const savedFields = computed(() => committedFields.value);
const savedFieldCount = computed(() => savedFields.value.length);
const selectedDraftCount = computed(() => fieldsDraft.value.length);
const isReadOnly = computed(() => !props.edit);
const visibleAvailableFields = computed(() => {
  const selectedVariables = new Set(fieldsDraft.value.map((field) => field.variable.trim()).filter(Boolean));
  const search = availableFieldSearch.value.trim().toLowerCase();

  return availableFieldsDraft.value
    .map((field) => ({
      ...field,
      selected: selectedVariables.has(field.variable.trim())
    }))
    .filter((field) => {
      if (!search) return true;
      return field.label.toLowerCase().includes(search) ||
        field.variable.toLowerCase().includes(search) ||
        field.dataType.toLowerCase().includes(search);
    });
});
const responseMockBodyEntries = computed(() => (importedDatasource.value?.bodyData ?? [])
  .map((item, index) => ({ item, index }))
  .filter(({ item }) => item.key.trim()));
const responseMockHeaderData = computed(() => (importedDatasource.value?.headerData ?? [])
  .filter((item) => item.key.trim())
  .map((item) => ({ ...item })));
const responseMockQueryData = computed(() => (importedDatasource.value?.queryData ?? [])
  .filter((item) => item.key.trim())
  .map((item) => ({ ...item })));
const responseMockBodyData = computed<MDatasourceBodyItem[]>(() => responseMockBodyEntries.value.map(({ item }) => ({
  key: item.key,
  dataType: item.dataType,
  value: normalizeBodyValue(item.dataType, item.value)
})));
const responseMockBodyFiles = computed(() => responseMockBodyEntries.value.map(() => undefined));

useEditorBlockToolbarAlignment(rootRef);

function normalizeApiDatasource(value: unknown): MDatasourceApiObject {
  const normalized = normalizeDatasource(value);
  return normalized.type === 'API' ? normalized : getDefaultApiDatasource();
}

function createCandidate(
  field: MFieldsEditorField,
  selected: boolean,
  source: FieldsEditorCandidateSource
): FieldsEditorCandidate {
  return {
    id: `fields-editor-field-${fieldCandidateId++}`,
    label: field.label,
    variable: field.variable,
    dataType: normalizeFieldsEditorDataType(field.dataType),
    selected,
    source
  };
}

function createDraftFromSavedValue() {
  fieldsDraft.value = savedFields.value.map((field) => createCandidate(field, true, 'saved'));
  availableFieldsDraft.value = [];
  availableFieldSearch.value = '';
  validationError.value = '';
  fieldTranslationError.value = '';
  responseCaptureError.value = '';
  responseMockDomain.value = '';
  apiDomainError.value = '';
  importedDatasource.value = null;
}

function getCandidateField(candidate: FieldsEditorCandidate): MFieldsEditorField {
  return {
    label: candidate.label.trim(),
    variable: candidate.variable.trim(),
    dataType: normalizeFieldsEditorDataType(candidate.dataType)
  };
}

function emitFields(value: MFieldsEditorField[]) {
  if (!props.edit) return;

  const payload: MFieldsEditorProps = {
    edit: props.edit,
    value: normalizeFieldsEditorValue(value)
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function openSettingsDialog() {
  createDraftFromSavedValue();
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

function addField() {
  if (isReadOnly.value) return;

  fieldsDraft.value.push(createCandidate({
    label: '',
    variable: '',
    dataType: 'string'
  }, true, 'manual'));
}

function addAvailableField(field: FieldsEditorCandidate) {
  if (isReadOnly.value || field.selected) return;

  const normalized = normalizeFieldsEditorValue([field])[0];
  if (!normalized) return;

  fieldsDraft.value.push(createCandidate(normalized, true, field.source));
  validationError.value = '';
}

function updateField(index: number, field: keyof MFieldsEditorField, value: string) {
  if (isReadOnly.value) return;

  const item = fieldsDraft.value[index];
  if (!item) return;

  item[field] = field === 'dataType' ? normalizeFieldsEditorDataType(value) : value;
  validationError.value = '';
}

function removeField(index: number) {
  if (isReadOnly.value) return;

  fieldsDraft.value.splice(index, 1);
  validationError.value = '';
}

function mergeFieldCandidates(fields: MFieldsEditorField[], source: FieldsEditorCandidateSource) {
  if (isReadOnly.value) return;

  const existingVariables = new Set(
    availableFieldsDraft.value
      .map((field) => field.variable.trim())
      .filter(Boolean)
  );
  const nextFields = [...availableFieldsDraft.value];

  fields.forEach((field) => {
    const normalized = normalizeFieldsEditorValue([field])[0];
    if (!normalized || existingVariables.has(normalized.variable)) {
      return;
    }

    nextFields.push(createCandidate(normalized, true, source));
    existingVariables.add(normalized.variable);
  });

  availableFieldsDraft.value = nextFields;
  availableFieldSearch.value = '';
  validationError.value = '';
}

function getRequestFieldsFromDatasource(datasource: MDatasourceApiObject): MFieldsEditorField[] {
  const headerFields = datasource.headerData
    .filter((item) => item.key.trim())
    .map((item) => ({
      label: item.key.trim(),
      variable: item.key.trim(),
      dataType: 'string'
    }));
  const queryFields = datasource.queryData
    .filter((item) => item.key.trim())
    .map((item) => ({
      label: item.key.trim(),
      variable: item.key.trim(),
      dataType: 'string'
    }));
  const bodyFields = datasource.bodyData
    .filter((item) => item.key.trim())
    .map((item) => ({
      label: item.key.trim(),
      variable: item.key.trim(),
      dataType: normalizeFieldsEditorDataType(item.dataType)
    }));

  return [...headerFields, ...queryFields, ...bodyFields];
}

function getNormalizedImportedDatasourceDomain() {
  const datasourceDomain = importedDatasource.value?.domain ?? '';
  if (!apiDomainOptions.value.length) {
    return responseMockDomain.value || datasourceDomain;
  }

  return normalizeApiDomainUuid(responseMockDomain.value, apiDomainOptions.value) ||
    normalizeApiDomainUuid(datasourceDomain, apiDomainOptions.value) ||
    getDefaultApiDomainUuid(apiDomainOptions.value);
}

function updateImportedDatasourceDomain(domain: string) {
  const datasource = importedDatasource.value;
  if (!datasource || !domain || datasource.domain === domain) {
    return;
  }

  importedDatasource.value = normalizeApiDatasource({
    ...datasource,
    domain
  });
}

function normalizeImportedDatasourceDomain() {
  const domain = getNormalizedImportedDatasourceDomain();
  if (!domain) {
    return;
  }

  responseMockDomain.value = domain;
  updateImportedDatasourceDomain(domain);
}

async function ensureApiDomainOptions(force = false) {
  if (!force && hasLoadedApiDomains.value) {
    normalizeImportedDatasourceDomain();
    return;
  }

  apiDomainLoading.value = true;
  apiDomainError.value = '';

  try {
    apiDomainOptions.value = await listApiDomains(force);
    hasLoadedApiDomains.value = true;
    normalizeImportedDatasourceDomain();
  } catch (error) {
    apiDomainError.value = error instanceof Error ? error.message : String(error);
  } finally {
    apiDomainLoading.value = false;
  }
}

function applyImportedApiDatasource(imported: ImportedApiDatasource) {
  importedDatasource.value = normalizeApiDatasource(imported.datasource);
  responseMockDomain.value = importedDatasource.value.domain;
  mergeFieldCandidates(getRequestFieldsFromDatasource(importedDatasource.value), 'api');
  responseCaptureError.value = '';
  void ensureApiDomainOptions();
  mergeImportedResponseFields(imported);
}

function openApiImportDialog(source: DatasourceApiImportSource) {
  if (isReadOnly.value) return;

  apiImportSource.value = source;
  isApiImportDialogOpen.value = true;
}

function closeApiImportDialog() {
  isApiImportDialogOpen.value = false;
}

function hasConfiguredRequestKeys(datasource: MDatasourceApiObject) {
  return datasource.headerData.some((item) => item.key.trim()) ||
    datasource.queryData.some((item) => item.key.trim()) ||
    datasource.bodyData.some((item) => item.key.trim());
}

function getDatasourceErrorMessage(error: unknown) {
  if (error instanceof DatasourceError) {
    if (error.code === 'apiRequestFailed') {
      return `${t('datasource.validation.apiRequestFailed')} ${error.status ?? ''} ${error.statusText ?? ''}`.trim();
    }

    return t(`datasource.validation.${error.code}`);
  }

  return error instanceof Error ? error.message : String(error);
}

function inferResponseFieldsFromData(data: JsonValue): MFieldsEditorField[] {
  const inferredSchema = inferJSONSchema(data);
  if (!inferredSchema.ok) {
    if (inferredSchema.reason === 'emptyArray') {
      throw new DatasourceError('emptyArraySchema', 'Cannot infer JSON Schema from an empty array.');
    }

    throw new DatasourceError('mixedArraySchema', 'The array contains incompatible types, so JSON Schema cannot be inferred.');
  }

  return getSchemaSelectionFields(inferredSchema.schema).map((field: SchemaSelectionField) => ({
    label: field.label,
    variable: field.path,
    dataType: normalizeFieldsEditorDataType(field.type)
  }));
}

function getImportedResponseFields(imported: ImportedApiDatasource) {
  if (apiImportSource.value !== 'apifox') {
    return [];
  }

  return (imported.responseExamples ?? []).flatMap((example) => inferResponseFieldsFromData(example));
}

function mergeImportedResponseFields(imported: ImportedApiDatasource) {
  if (!imported.responseExamples?.length) {
    return;
  }

  try {
    mergeFieldCandidates(getImportedResponseFields(imported), 'response');
  } catch (error) {
    responseCaptureError.value = getDatasourceErrorMessage(error);
  }
}

async function runResponseCapture(datasource: MDatasourceApiObject, options?: DatasourceRequestOptions) {
  if (responseCaptureLoading.value) return;

  responseCaptureLoading.value = true;
  responseCaptureError.value = '';

  try {
    const responseData = await resolveDatasourceRemote(datasource, options);
    mergeFieldCandidates(inferResponseFieldsFromData(responseData), 'response');
    closeResponseMockDialog();
  } catch (error) {
    responseCaptureError.value = getDatasourceErrorMessage(error);
  } finally {
    responseCaptureLoading.value = false;
  }
}

async function captureResponseFields() {
  if (isReadOnly.value || responseCaptureLoading.value) return;

  const datasource = importedDatasource.value;
  if (!datasource) {
    responseCaptureError.value = t('fieldsEditor.validation.missingImportedApi');
    return;
  }

  await ensureApiDomainOptions();
  if (apiDomainError.value) {
    responseCaptureError.value = apiDomainError.value;
    return;
  }

  const domain = getNormalizedImportedDatasourceDomain();
  if (!domain) {
    responseCaptureError.value = t('datasource.validation.missingApiDomain');
    return;
  }

  responseMockDomain.value = domain;
  const datasourceWithDomain = normalizeApiDatasource({
    ...datasource,
    domain
  });
  updateImportedDatasourceDomain(domain);

  if (hasConfiguredRequestKeys(datasourceWithDomain)) {
    responseCaptureError.value = '';
    isResponseMockDialogOpen.value = true;
    return;
  }

  void runResponseCapture(datasourceWithDomain);
}

function closeResponseMockDialog() {
  isResponseMockDialogOpen.value = false;
}

function captureResponseFieldsWithMock(payload: DatasourceResponseMockCapturePayload) {
  const datasource = importedDatasource.value;
  if (!datasource || responseCaptureLoading.value) return;

  const domain = payload.domain?.trim() || getNormalizedImportedDatasourceDomain();
  if (!domain) {
    responseCaptureError.value = t('datasource.validation.missingApiDomain');
    return;
  }

  responseMockDomain.value = domain;
  updateImportedDatasourceDomain(domain);
  void runResponseCapture(normalizeApiDatasource({
    ...datasource,
    domain,
    headerData: payload.headerData,
    queryData: payload.queryData,
    bodyData: payload.bodyData
  }), payload.options);
}

function validateSelectedFields() {
  const selectedFields = fieldsDraft.value.map((field) => getCandidateField(field));

  for (const field of selectedFields) {
    if (!field.label || !field.variable) {
      return {
        ok: false as const,
        error: t('fieldsEditor.validation.required')
      };
    }
  }

  const variables = new Set<string>();
  for (const field of selectedFields) {
    if (variables.has(field.variable)) {
      return {
        ok: false as const,
        error: t('fieldsEditor.validation.duplicateVariable')
      };
    }

    variables.add(field.variable);
  }

  return {
    ok: true as const,
    value: selectedFields
  };
}

async function translateSelectedFieldLabels() {
  if (isReadOnly.value || fieldTranslationLoading.value || !fieldsDraft.value.length) return;

  fieldTranslationLoading.value = true;
  fieldTranslationError.value = '';
  try {
    const translations = await translateTextsToChinese(fieldsDraft.value.map((field) => field.label));
    fieldsDraft.value = fieldsDraft.value.map((field) => ({
      ...field,
      label: translations[field.label] ?? field.label
    }));
  } catch {
    fieldTranslationError.value = t('fieldsEditor.validation.translateFieldsFailed');
  } finally {
    fieldTranslationLoading.value = false;
  }
}

function getVariableTail(variable: string) {
  const normalized = variable.trim();
  if (!normalized) return '';

  const tail = normalized.split('.').filter(Boolean).pop() ?? normalized;
  return tail.replace(/\[\]$/g, '') || normalized;
}

function truncateSelectedFieldVariablesToTail() {
  if (isReadOnly.value || !fieldsDraft.value.length) return;

  fieldsDraft.value = fieldsDraft.value.map((field) => ({
    ...field,
    variable: getVariableTail(field.variable)
  }));
  validationError.value = '';
}

function saveFields() {
  if (isReadOnly.value) return;

  const validation = validateSelectedFields();
  if (!validation.ok) {
    validationError.value = validation.error;
    return;
  }

  const normalizedValue = normalizeFieldsEditorValue(validation.value);
  committedFields.value = normalizedValue;
  emitFields(normalizedValue);
  closeSettingsDialog();
}

watch(
  () => props.value,
  (value) => {
    committedFields.value = normalizeFieldsEditorValue(value);
    if (!isSettingsDialogOpen.value) {
      createDraftFromSavedValue();
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div ref="rootRef" class="ce-fields-editor" data-testid="editor-fields-tool">
    <div class="ce-fields-editor__trigger-row">
      <button
        class="ce-fields-editor__settings-button"
        type="button"
        data-testid="fields-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('fieldsEditor.actions.settings') }}
      </button>
      <div class="ce-fields-editor__summary" data-testid="fields-summary">
        {{ t('fieldsEditor.summary.savedCount').replace('{count}', String(savedFieldCount)) }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-fields-editor__dialog"
      data-testid="fields-settings-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="fields-settings-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-fields-editor__dialog-panel">
        <div class="ce-fields-editor__dialog-header">
          <h3
            id="fields-settings-dialog-title"
            class="ce-fields-editor__dialog-title"
            data-testid="fields-settings-dialog-title"
          >
            {{ t('fieldsEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-fields-editor__secondary-button"
            type="button"
            data-testid="fields-settings-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-fields-editor__dialog-body">
          <section v-if="edit" class="ce-fields-editor__section" data-testid="fields-import-section">
            <div class="ce-fields-editor__section-header">
              <div>
                <div class="ce-fields-editor__section-title">{{ t('fieldsEditor.sections.importApi') }}</div>
                <p class="ce-fields-editor__section-copy">{{ t('fieldsEditor.help.importApi') }}</p>
              </div>
            </div>
            <div class="ce-fields-editor__section-body">
              <div class="ce-fields-editor__import-actions">
                <button
                  class="ce-fields-editor__import-button"
                  type="button"
                  data-testid="fields-import-open-mokelay"
                  @click="openApiImportDialog('mokelay')"
                >
                  {{ t('datasource.import.sources.mokelay') }}
                </button>
                <button
                  class="ce-fields-editor__import-button"
                  type="button"
                  data-testid="fields-import-open-apifox"
                  @click="openApiImportDialog('apifox')"
                >
                  {{ t('datasource.import.sources.apifox') }}
                </button>
                <button
                  class="ce-fields-editor__primary-button"
                  type="button"
                  data-testid="fields-capture-response-fields"
                  :disabled="!importedDatasource || responseCaptureLoading || apiDomainLoading"
                  @click="captureResponseFields"
                >
                  {{ responseCaptureLoading
                    ? t('fieldsEditor.actions.capturingResponseFields')
                    : t('fieldsEditor.actions.captureResponseFields') }}
                </button>
              </div>
              <p v-if="responseCaptureError" class="ce-fields-editor__error" data-testid="fields-response-capture-error">
                {{ responseCaptureError }}
              </p>
            </div>
          </section>

          <section
            v-if="edit && availableFieldsDraft.length"
            class="ce-fields-editor__section ce-fields-editor__section--available"
            data-testid="fields-available-section"
          >
            <div class="ce-fields-editor__section-header">
              <div>
                <div class="ce-fields-editor__section-title">{{ t('fieldsEditor.sections.availableFields') }}</div>
                <p class="ce-fields-editor__section-copy">{{ t('fieldsEditor.help.availableFields') }}</p>
              </div>
            </div>
            <div class="ce-fields-editor__section-body ce-fields-editor__section-body--available">
              <label class="ce-fields-editor__field">
                <span class="ce-fields-editor__label">{{ t('fieldsEditor.columns.variable') }}</span>
                <input
                  class="ce-fields-editor__input"
                  data-testid="fields-available-search"
                  type="search"
                  :placeholder="t('fieldsEditor.placeholders.searchFields')"
                  :value="availableFieldSearch"
                  @input="availableFieldSearch = ($event.target as HTMLInputElement).value"
                  @keydown.stop
                />
              </label>

              <div
                v-if="visibleAvailableFields.length"
                class="ce-fields-editor__available-list"
                data-testid="fields-available-list"
              >
                <div
                  v-for="field in visibleAvailableFields"
                  :key="field.id"
                  class="ce-fields-editor__available-field"
                  :data-testid="`fields-available-field-${field.variable}`"
                >
                  <span class="ce-fields-editor__available-main">
                    <span class="ce-fields-editor__available-label">{{ field.label }}</span>
                    <span class="ce-fields-editor__available-variable">{{ field.variable }}</span>
                  </span>
                  <span class="ce-fields-editor__available-actions">
                    <span class="ce-fields-editor__badge">{{ field.dataType }}</span>
                    <button
                      class="ce-fields-editor__field-action"
                      type="button"
                      :disabled="isReadOnly || field.selected"
                      :data-testid="`fields-available-add-${field.variable}`"
                      @click="addAvailableField(field)"
                    >
                      {{ field.selected ? t('fieldsEditor.actions.added') : t('fieldsEditor.actions.addCandidate') }}
                    </button>
                  </span>
                </div>
              </div>
              <p
                v-else
                class="ce-fields-editor__empty"
                data-testid="fields-available-empty"
              >
                {{ t('fieldsEditor.emptySearch') }}
              </p>
            </div>
          </section>

          <section
            class="ce-fields-editor__section ce-fields-editor__section--fields"
            data-testid="fields-list-section"
          >
            <div class="ce-fields-editor__section-header">
              <div>
                <div class="ce-fields-editor__section-title">{{ t('fieldsEditor.sections.fields') }}</div>
                <p class="ce-fields-editor__section-copy">
                  {{ t('fieldsEditor.summary.selectedCount').replace('{count}', String(selectedDraftCount)) }}
                </p>
              </div>
              <div v-if="edit" class="ce-fields-editor__section-actions">
                <button
                  class="ce-fields-editor__secondary-button"
                  type="button"
                  data-testid="fields-add"
                  @click="addField"
                >
                  {{ t('fieldsEditor.actions.add') }}
                </button>
                <button
                  class="ce-fields-editor__secondary-button"
                  type="button"
                  data-testid="fields-translate-labels"
                  :disabled="fieldTranslationLoading || !fieldsDraft.length"
                  @click="translateSelectedFieldLabels"
                >
                  {{ fieldTranslationLoading
                    ? t('fieldsEditor.actions.translatingLabels')
                    : t('fieldsEditor.actions.translateLabels') }}
                </button>
                <button
                  class="ce-fields-editor__secondary-button"
                  type="button"
                  data-testid="fields-truncate-variables"
                  :disabled="!fieldsDraft.length"
                  @click="truncateSelectedFieldVariablesToTail"
                >
                  {{ t('fieldsEditor.actions.truncateVariables') }}
                </button>
              </div>
            </div>

            <div class="ce-fields-editor__section-body ce-fields-editor__section-body--fields">
              <p v-if="!fieldsDraft.length" class="ce-fields-editor__empty" data-testid="fields-empty">
                {{ t('fieldsEditor.empty') }}
              </p>

              <div v-else class="ce-fields-editor__table" data-testid="fields-list">
                <div class="ce-fields-editor__table-head" aria-hidden="true">
                  <span>{{ t('fieldsEditor.columns.label') }}</span>
                  <span>{{ t('fieldsEditor.columns.variable') }}</span>
                  <span>{{ t('fieldsEditor.columns.dataType') }}</span>
                  <span>{{ t('fieldsEditor.columns.actions') }}</span>
                </div>

                <div
                  v-for="(field, index) in fieldsDraft"
                  :key="field.id"
                  class="ce-fields-editor__row"
                  :data-testid="`fields-row-${index}`"
                >
                  <input
                    class="ce-fields-editor__input"
                    :data-testid="`fields-label-${index}`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('fieldsEditor.placeholders.label')"
                    :value="field.label"
                    @input="updateField(index, 'label', ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-fields-editor__input"
                    :data-testid="`fields-variable-${index}`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('fieldsEditor.placeholders.variable')"
                    :value="field.variable"
                    @input="updateField(index, 'variable', ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <select
                    class="ce-fields-editor__input"
                    :data-testid="`fields-data-type-${index}`"
                    :disabled="isReadOnly"
                    :value="field.dataType"
                    @change="updateField(index, 'dataType', ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="dataType in fieldOptions" :key="dataType" :value="dataType">
                      {{ dataType }}
                    </option>
                  </select>
                  <button
                    v-if="edit"
                    class="ce-fields-editor__danger-button"
                    type="button"
                    :data-testid="`fields-remove-${index}`"
                    @click="removeField(index)"
                  >
                    {{ t('fieldsEditor.actions.remove') }}
                  </button>
                </div>
              </div>

              <p v-if="validationError" class="ce-fields-editor__error" data-testid="fields-validation-error">
                {{ validationError }}
              </p>
              <p v-if="fieldTranslationError" class="ce-fields-editor__error" data-testid="fields-translation-error">
                {{ fieldTranslationError }}
              </p>
            </div>
          </section>
        </div>

        <div class="ce-fields-editor__dialog-actions">
          <button
            class="ce-fields-editor__secondary-button"
            type="button"
            data-testid="fields-cancel"
            @click="closeSettingsDialog"
          >
            {{ edit ? t('fieldsEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-fields-editor__primary-button"
            type="button"
            data-testid="fields-save"
            @click="saveFields"
          >
            {{ t('fieldsEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>

    <Teleport to="body">
      <DatasourceApiImportDialog
        v-if="edit"
        :open="isApiImportDialogOpen"
        :source="apiImportSource"
        :current-domain="responseMockDomain || importedDatasource?.domain"
        :readonly="isReadOnly"
        @close="closeApiImportDialog"
        @imported="applyImportedApiDatasource"
      />
    </Teleport>

    <Teleport to="body">
      <DatasourceResponseMockDialog
        v-if="edit"
        :open="isResponseMockDialogOpen"
        :domain="responseMockDomain || importedDatasource?.domain"
        :api-domains="apiDomainOptions"
        :domain-loading="apiDomainLoading"
        :domain-error="apiDomainError"
        :method="importedDatasource?.method"
        :header-data="responseMockHeaderData"
        :query-data="responseMockQueryData"
        :body-data="responseMockBodyData"
        :body-files="responseMockBodyFiles"
        :loading="responseCaptureLoading"
        :error="responseCaptureError"
        @close="closeResponseMockDialog"
        @capture="captureResponseFieldsWithMock"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.ce-fields-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-fields-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-fields-editor__settings-button,
.ce-fields-editor__primary-button {
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

.ce-fields-editor__settings-button:hover,
.ce-fields-editor__primary-button:hover {
  background: rgb(13 148 136);
}

.ce-fields-editor__primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ce-fields-editor__summary {
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

.ce-fields-editor__dialog {
  width: min(calc(100vw - 32px), 1040px);
  max-height: min(calc(100vh - 32px), 860px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-fields-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-fields-editor__dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__dialog-header,
.ce-fields-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
}

.ce-fields-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-fields-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 700;
}

.ce-fields-editor__dialog-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  padding: 12px;
}

.ce-fields-editor__section {
  display: flex;
  min-height: 0;
  flex: 0 0 auto;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__section--fields {
  flex: 0 1 auto;
}

.ce-fields-editor__section--available {
  flex: 0 1 auto;
}

.ce-fields-editor__section-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
  background: rgb(248 250 252);
}

.ce-fields-editor__section-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.ce-fields-editor__section-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.ce-fields-editor__section-body--fields {
  flex: 0 1 auto;
  max-height: min(48vh, 520px);
  overflow: auto;
}

.ce-fields-editor__section-body--available {
  flex: 0 1 auto;
  max-height: min(34vh, 360px);
  overflow: auto;
}

.ce-fields-editor__section-title {
  color: rgb(15 23 42);
  font-size: 15px;
  font-weight: 700;
}

.ce-fields-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-fields-editor__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.ce-fields-editor__label {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-fields-editor__import-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ce-fields-editor__available-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  align-items: start;
}

.ce-fields-editor__available-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 7px 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__available-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.ce-fields-editor__available-label {
  overflow: hidden;
  color: rgb(15 23 42);
  font-weight: 650;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-fields-editor__available-variable {
  overflow: hidden;
  color: rgb(100 116 139);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-fields-editor__available-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ce-fields-editor__badge {
  border-radius: 999px;
  padding: 4px 8px;
  background: rgb(239 246 255);
  color: rgb(30 64 175);
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
}

.ce-fields-editor__import-button,
.ce-fields-editor__secondary-button,
.ce-fields-editor__danger-button,
.ce-fields-editor__field-action {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 6px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-fields-editor__import-button {
  color: rgb(30 64 175);
}

.ce-fields-editor__danger-button {
  color: rgb(185 28 28);
}

.ce-fields-editor__field-action {
  border-color: rgb(147 197 253);
  color: rgb(30 64 175);
}

.ce-fields-editor__import-button:hover,
.ce-fields-editor__secondary-button:hover,
.ce-fields-editor__danger-button:hover,
.ce-fields-editor__field-action:hover {
  background: rgb(248 250 252);
}

.ce-fields-editor__field-action:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ce-fields-editor__table {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 8px;
}

.ce-fields-editor__table-head,
.ce-fields-editor__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 0.35fr) auto;
  gap: 8px;
  align-items: center;
}

.ce-fields-editor__table-head {
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.ce-fields-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
}

.ce-fields-editor__input:focus {
  outline: none;
  border-color: rgb(20 184 166);
  box-shadow: 0 0 0 2px rgb(20 184 166 / 0.15);
}

.ce-fields-editor__input:read-only,
.ce-fields-editor__input:disabled {
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-fields-editor__empty,
.ce-fields-editor__error {
  margin: 0;
  font-size: 13px;
}

.ce-fields-editor__empty {
  color: rgb(100 116 139);
}

.ce-fields-editor__error {
  color: rgb(185 28 28);
  font-size: 12px;
  font-weight: 650;
}

@media (max-width: 760px) {
  .ce-fields-editor__trigger-row,
  .ce-fields-editor__section-header,
  .ce-fields-editor__dialog-header,
  .ce-fields-editor__dialog-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-fields-editor__table-head {
    display: none;
  }

  .ce-fields-editor__row {
    grid-template-columns: 1fr;
  }
}

:global(.dark) .ce-fields-editor {
  color: rgb(226 232 240);
}

:global(.dark) .ce-fields-editor__summary,
:global(.dark) .ce-fields-editor__section-header {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
  color: rgb(203 213 225);
}

:global(.dark) .ce-fields-editor__dialog-panel,
:global(.dark) .ce-fields-editor__section,
:global(.dark) .ce-fields-editor__available-field,
:global(.dark) .ce-fields-editor__row {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .ce-fields-editor__dialog-header,
:global(.dark) .ce-fields-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

:global(.dark) .ce-fields-editor__dialog-title,
:global(.dark) .ce-fields-editor__section-title {
  color: rgb(226 232 240);
}

:global(.dark) .ce-fields-editor__section-copy,
:global(.dark) .ce-fields-editor__label,
:global(.dark) .ce-fields-editor__available-variable,
:global(.dark) .ce-fields-editor__table-head,
:global(.dark) .ce-fields-editor__empty {
  color: rgb(148 163 184);
}

:global(.dark) .ce-fields-editor__available-label {
  color: rgb(226 232 240);
}

:global(.dark) .ce-fields-editor__badge {
  background: rgb(30 58 138 / 0.45);
  color: rgb(191 219 254);
}

:global(.dark) .ce-fields-editor__input {
  border-color: rgb(71 85 105);
  background: rgb(2 6 23);
  color: rgb(226 232 240);
}

:global(.dark) .ce-fields-editor__input:read-only,
:global(.dark) .ce-fields-editor__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}

:global(.dark) .ce-fields-editor__import-button,
:global(.dark) .ce-fields-editor__secondary-button,
:global(.dark) .ce-fields-editor__danger-button,
:global(.dark) .ce-fields-editor__field-action {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
  color: rgb(226 232 240);
}

:global(.dark) .ce-fields-editor__danger-button {
  color: rgb(252 165 165);
}

:global(.dark) .ce-fields-editor__import-button:hover,
:global(.dark) .ce-fields-editor__secondary-button:hover,
:global(.dark) .ce-fields-editor__danger-button:hover,
:global(.dark) .ce-fields-editor__field-action:hover {
  background: rgb(51 65 85);
}
</style>
