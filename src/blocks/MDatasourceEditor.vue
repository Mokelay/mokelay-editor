<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import {
  cloneJsonSchema,
  cloneJsonValue,
  flattenSchemaTree,
  getSchemaSelectionFields,
  getSchemaTreeNodes,
  inferJSONSchema,
  isJsonObjectValue,
  isJsonValue,
  normalizeSchemaSelections,
  reconcileSchemaSelections,
  type DatasourceSchemaSelections,
  type JSONSchema,
  type JsonValue,
  type SchemaSelectionField,
  type SchemaTreeNode
} from '@/utils/datasourceSchema';
import {
  $remote as resolveDatasourceRemote,
  DatasourceError,
  bodyDataTypes,
  getDefaultApiDatasource,
  getDefaultBodyValue,
  normalizeBodyDataType,
  normalizeBodyFileValue,
  normalizeBodyValue,
  normalizeDatasource,
  normalizeMethod,
  type DatasourceRequestOptions,
  type MDatasourceApiObject,
  type MDatasourceBodyDataType,
  type MDatasourceBodyFileValue,
  type MDatasourceBodyItem,
  type MDatasourceKeyValueItem
} from '@/utils/datasource';

export type {
  DatasourceSchemaSelections,
  JSONSchema,
  JsonValue,
  MDatasourceApiMethod,
  MDatasourceApiObject,
  MDatasourceBodyDataType,
  MDatasourceBodyFileValue,
  MDatasourceBodyItem,
  MDatasourceKeyValueItem
} from '@/utils/datasource';
export { normalizeDatasource } from '@/utils/datasource';
export type { SchemaSelectionField } from '@/utils/datasourceSchema';

export interface MDatasourceEditorProps {
  edit: boolean;
  value?: MDatasourceApiObject;
}

function normalizeApiDatasource(value: unknown): MDatasourceApiObject {
  const normalized = normalizeDatasource(value);
  return normalized.type === 'API' ? normalized : getDefaultApiDatasource();
}

export const mDatasourceEditorTool = defineEditorTool<MDatasourceEditorProps>({
  toolbox: {
    get title() {
      return i18n.t('datasource.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="6" rx="7" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12c1.1.5 2.5.8 4 .8s2.9-.3 4-.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  createInitialProps: () => ({
    value: getDefaultApiDatasource()
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeApiDatasource(props.value)
  }),
  serialize: (props) => ({
    value: normalizeApiDatasource(props.value)
  })
});
</script>

<script setup lang="ts">
import { computed, reactive, ref, shallowRef, triggerRef, watch } from 'vue';
import { useI18n } from '@/i18n';
import JsonTreeView from '@/blocks/components/JsonTreeView.vue';
import { useEditorBlockToolbarAlignment } from '@/composables/useEditorBlockToolbarAlignment';
import {
  getApi,
  getBuiltInApi,
  getApifoxApiDetail,
  listApis,
  listApifoxProjects,
  type ApifoxProjectRecord,
  type MokelayApiRecord,
  type MokelayApiSource
} from '@/utils/apisApi';
import {
  DEFAULT_API_DOMAIN_UUID,
  type ApiDomainRecord,
  getDefaultApiDomainUuid,
  listApiDomains,
  normalizeApiDomainUuid
} from '@/utils/apiDomains';
import {
  buildDatasourceFromApifoxApi,
  buildDatasourceFromMokelayApi,
  DatasourceApiImportError,
  type ImportedApiDatasource
} from '@/utils/datasourceApiImport';
import { translateTextsToChinese } from '@/utils/translationsApi';
import ProcessorConfigDialog from '@/processors/components/ProcessorConfigDialog.vue';
import ProcessorPreviewDialog from '@/processors/components/ProcessorPreviewDialog.vue';
import {
  getProcessorDefinition,
  normalizeProcessors,
  processorName,
  type ProcessorConfig
} from '@/processors';

type KeyValueListName = 'headerData' | 'queryData';
type BodyValueParseResult = {
  ok: true;
  value: JsonValue;
} | {
  ok: false;
  error: string;
};
type ApiStateBodyItem = Omit<MDatasourceBodyItem, 'value'> & {
  value: unknown;
};
type ApiState = Omit<MDatasourceApiObject, 'bodyData' | 'schemaSelections'> & {
  bodyData: ApiStateBodyItem[];
};
type ResponseExampleState = {
  id: number;
  value?: JsonValue;
  text: string;
  error: string;
  loading: boolean;
};
type ResponseMockBodyItem = {
  key: string;
  dataType: MDatasourceBodyDataType;
  value: JsonValue;
  input: string;
  error: string;
  file?: File;
};
type SchemaFieldSource = 'list' | 'form';
type SchemaDataTypeFilter = 'all' | Extract<SchemaSelectionField['type'], 'string' | 'number' | 'boolean' | 'object' | 'array'>;
type CombinedSchemaSelectionField = SchemaSelectionField & {
  source: SchemaFieldSource;
  selected: boolean;
};
type ApiImportSource = 'mokelay' | 'apifox';

const props = defineProps<MDatasourceEditorProps & {
  onChange?: (payload: MDatasourceEditorProps) => void;
  onToolChange?: (payload: MDatasourceEditorProps) => void;
}>();

const { t } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const normalizedInitialValue = normalizeApiDatasource(props.value);
const bodyDataTypeOptions = bodyDataTypes;
const jsonSchemaValue = shallowRef<JSONSchema | undefined>();
const jsonSchemaError = ref('');
const schemaSelectionsValue = shallowRef<DatasourceSchemaSelections>(normalizeSchemaSelections(normalizedInitialValue.schemaSelections));
const schemaTranslationLoading = ref(false);
const schemaTranslationError = ref('');
const processorFieldPath = ref<string | null>(null);
const processorPreviewFieldPath = ref<string | null>(null);
const shouldRestoreSettingsAfterProcessorDialog = ref(false);
const shouldRestoreSettingsAfterProcessorPreviewDialog = ref(false);
let responseExampleId = 0;
const responseExamples = shallowRef<ResponseExampleState[]>(createResponseExampleStates());
const schemaDataTypeFilter = ref<SchemaDataTypeFilter>('all');
const schemaPathDepth = ref(1);
const schemaSearch = ref('');
const apiState = reactive<ApiState>(normalizedInitialValue);
const bodyValueInputs = ref<string[]>(apiState.bodyData.map((item) => getBodyValueInput(item)));
const bodyValueErrors = ref<string[]>(apiState.bodyData.map(() => ''));
const bodyFileInputs = ref<Array<File | undefined>>(apiState.bodyData.map(() => undefined));
const apiDomainOptions = ref<ApiDomainRecord[]>([]);
const apiDomainLoading = ref(false);
const apiDomainError = ref('');
const hasLoadedApiDomains = ref(false);
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const apiImportSource = ref<ApiImportSource>('mokelay');
const apiImportDialogRef = ref<HTMLDialogElement | null>(null);
const isApiImportDialogOpen = ref(false);
const fullSchemaDialogRef = ref<HTMLDialogElement | null>(null);
const isFullSchemaDialogOpen = ref(false);
const fullSchemaText = ref('');
const fullSchemaError = ref('');
const responseMockDialogRef = ref<HTMLDialogElement | null>(null);
const isResponseMockDialogOpen = ref(false);
const responseMockTargetIndex = ref<number | null>(null);
const responseMockHeaderData = ref<MDatasourceKeyValueItem[]>([]);
const responseMockQueryData = ref<MDatasourceKeyValueItem[]>([]);
const responseMockBodyData = shallowRef<ResponseMockBodyItem[]>([]);
const responseMockError = ref('');
const mokelayApiSource = ref<MokelayApiSource>('user');
const mokelayApiOptionsBySource = ref<Record<MokelayApiSource, MokelayApiRecord[]>>({
  user: [],
  system: []
});
const selectedMokelayApiUuid = ref('');
const apifoxProjectOptions = ref<ApifoxProjectRecord[]>([]);
const selectedApifoxProjectId = ref('');
const apifoxApiId = ref('');
const apiImportOptionsLoading = ref(false);
const apiImportLoading = ref(false);
const apiImportError = ref('');
const loadedMokelayApiSources = ref<Record<MokelayApiSource, boolean>>({
  user: false,
  system: false
});
const hasLoadedApifoxProjects = ref(false);
const isReadOnly = computed(() => !props.edit);
const schemaTree = computed(() => getSchemaTreeNodes(jsonSchemaValue.value));
const flattenedSchemaNodes = computed(() => flattenSchemaTree(schemaTree.value));
const generatedSelectionFields = computed(() => getSchemaSelectionFields(jsonSchemaValue.value));
const combinedSelectionFields = computed<CombinedSchemaSelectionField[]>(() => {
  const selectedPaths = new Set(schemaSelectionsValue.value.map((field) => field.path));
  return generatedSelectionFields.value.map((field) => {
    const source: SchemaFieldSource = field.path.includes('[]') ? 'list' : 'form';
    return {
      ...field,
      selected: selectedPaths.has(field.path),
      source
    };
  });
});
const visibleSelectionFields = computed(() => filterSelectionFields(
  combinedSelectionFields.value,
  schemaSearch.value,
  schemaDataTypeFilter.value,
  schemaPathDepth.value
));
const enabledFieldCount = computed(() => schemaSelectionsValue.value.length);
const processorField = computed(() => schemaSelectionsValue.value.find((field) => field.path === processorFieldPath.value));
const processorPreviewField = computed(() => schemaSelectionsValue.value.find((field) => field.path === processorPreviewFieldPath.value));
const processorPreviewExamples = computed(() => responseExamples.value.map((example) => ({
  id: example.id,
  value: example.value,
  error: example.error
})));
const isApiImportBusy = computed(() => apiImportOptionsLoading.value || apiImportLoading.value || apiDomainLoading.value);
const isResponseCaptureBusy = computed(() => responseExamples.value.some((item) => item.loading));
const mokelayApiOptions = computed(() => mokelayApiOptionsBySource.value[mokelayApiSource.value]);
const isApiDomainSelectDisabled = computed(() => isReadOnly.value || apiDomainLoading.value || !apiDomainOptions.value.length);
const apiImportDialogTitle = computed(() => t(`datasource.import.sources.${apiImportSource.value}`));
const datasourceSummaryDomain = computed(() => {
  const rawDomain = apiState.domain.trim();
  if (!rawDomain) {
    return t('datasource.summary.emptyDomain');
  }

  const matchedDomain = apiDomainOptions.value.find((domain) => domain.uuid === rawDomain);
  return matchedDomain ? `${matchedDomain.alias} (${matchedDomain.host})` : rawDomain;
});
const datasourceSummaryPath = computed(() => apiState.path.trim() || t('datasource.summary.emptyPath'));
const datasourceSummaryMethod = computed(() => apiState.method || t('datasource.summary.emptyMethod'));
const apiDomainEmptyOptionText = computed(() => {
  if (apiDomainLoading.value) {
    return t('datasource.import.loadingApiDomains');
  }

  return apiDomainError.value || t('datasource.import.emptyApiDomains');
});
const canImportApi = computed(() => {
  if (isReadOnly.value || isApiImportBusy.value) {
    return false;
  }

  if (apiImportSource.value === 'mokelay') {
    return Boolean(selectedMokelayApiUuid.value);
  }

  return Boolean(selectedApifoxProjectId.value && apifoxApiId.value.trim());
});

useEditorBlockToolbarAlignment(rootRef);

function formatJsonValue(value: JsonValue) {
  return JSON.stringify(value, null, 2);
}

function formatOptionalJsonValue(value?: JsonValue) {
  return value === undefined ? '' : formatJsonValue(value);
}

function createResponseExampleState(value?: JsonValue): ResponseExampleState {
  const clonedValue = value === undefined ? undefined : cloneJsonValue(value);
  return {
    id: responseExampleId++,
    value: clonedValue,
    text: formatOptionalJsonValue(clonedValue),
    error: '',
    loading: false
  };
}

function createResponseExampleStates(values?: JsonValue[]) {
  return values?.length
    ? values.map((value) => createResponseExampleState(value))
    : [];
}

function formatJsonSchema(value?: JSONSchema) {
  return value ? JSON.stringify(value, null, 2) : '';
}

function getSchemaTypeLabel(type: SchemaTreeNode['type'] | SchemaSelectionField['type']) {
  return t(`datasource.schemaTypes.${type}`);
}

function getProcessorLabel(processor: ProcessorConfig) {
  const name = processorName(processor);
  const definition = getProcessorDefinition(name);
  return definition ? t(definition.titleKey) : name;
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getSchemaPathDepth(path: string) {
  return path.split('.').filter(Boolean).length || 1;
}

function updateSchemaPathDepth(event: Event) {
  // Editor.js treats non-InputEvent input events as mutation arrays. Number
  // steppers can emit a plain Event, so keep it away from that listener.
  event.stopImmediatePropagation();
  const numericValue = Number((event.target as HTMLInputElement).value);
  if (!Number.isFinite(numericValue)) {
    schemaPathDepth.value = 1;
    return;
  }

  schemaPathDepth.value = Math.min(10, Math.max(1, Math.round(numericValue)));
}

function filterSelectionFields(
  fields: CombinedSchemaSelectionField[],
  searchValue: string,
  dataTypeFilter: SchemaDataTypeFilter,
  pathDepth: number
) {
  const normalizedSearchValue = normalizeSearchValue(searchValue);
  return fields.filter((field) =>
    (dataTypeFilter === 'all' || field.type === dataTypeFilter) &&
    getSchemaPathDepth(field.path) <= pathDepth &&
    (!normalizedSearchValue || field.path.toLowerCase().includes(normalizedSearchValue))
  );
}

function getDatasourcePayload(value: MDatasourceApiObject): MDatasourceEditorProps {
  return {
    edit: props.edit,
    value: normalizeApiDatasource(value)
  };
}

function emitDatasource(value: MDatasourceApiObject) {
  if (!props.edit) return;

  const payload = getDatasourcePayload(value);
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function buildApiDatasource(): MDatasourceApiObject {
  return normalizeApiDatasource({
    type: 'API',
    domain: apiState.domain,
    path: apiState.path,
    method: apiState.method,
    headerData: apiState.headerData,
    bodyData: apiState.bodyData,
    queryData: apiState.queryData,
    schemaSelections: schemaSelectionsValue.value
  });
}

function emitCurrentDatasource() {
  emitApiChange();
}

function emitApiChange() {
  emitDatasource(buildApiDatasource());
}

function getBodyFileValue(file: File): MDatasourceBodyFileValue {
  return {
    name: file.name,
    size: file.size,
    type: file.type
  };
}

function isSameBodyFileValue(file: File, value: unknown) {
  const normalizedValue = normalizeBodyFileValue(value);
  return normalizedValue.name === file.name &&
    normalizedValue.size === file.size &&
    normalizedValue.type === file.type;
}

function syncBodyValueInputs() {
  const previousBodyFileInputs = bodyFileInputs.value;
  bodyValueInputs.value = apiState.bodyData.map((item) => getBodyValueInput(item));
  bodyValueErrors.value = apiState.bodyData.map(() => '');
  bodyFileInputs.value = apiState.bodyData.map((item, index) => {
    const previousFile = previousBodyFileInputs[index];
    return item.dataType === 'file' && previousFile && isSameBodyFileValue(previousFile, item.value)
      ? previousFile
      : undefined;
  });
}

function syncTransientSchemaState(selections?: DatasourceSchemaSelections, examples?: JsonValue[]) {
  jsonSchemaValue.value = undefined;
  schemaSelectionsValue.value = normalizeSchemaSelections(selections);
  responseExamples.value = createResponseExampleStates(examples);
  jsonSchemaError.value = '';
  schemaTranslationError.value = '';
  processorFieldPath.value = null;
  processorPreviewFieldPath.value = null;
}

function syncApiState(value: MDatasourceApiObject) {
  Object.assign(apiState, {
    type: 'API' as const,
    domain: value.domain,
    path: value.path,
    method: value.method,
    headerData: value.headerData.map((item) => ({ ...item })),
    bodyData: value.bodyData.map((item) => ({
      key: item.key,
      dataType: item.dataType,
      value: normalizeBodyValue(item.dataType, item.value)
    })),
    queryData: value.queryData.map((item) => ({ ...item }))
  });
  syncBodyValueInputs();
}

function normalizeApiDomainState(shouldEmit = props.edit) {
  if (!apiDomainOptions.value.length) {
    return;
  }

  const currentDomain = apiState.domain;
  const normalizedDomain = normalizeApiDomainUuid(currentDomain, apiDomainOptions.value);
  const nextDomain = normalizedDomain ||
    (currentDomain.trim() && !isDefaultBlankApiState() ? '' : getDefaultApiDomainUuid(apiDomainOptions.value));

  if (nextDomain === currentDomain) {
    return;
  }

  apiState.domain = nextDomain;

  if (shouldEmit) {
    emitApiChange();
  }
}

async function ensureApiDomainOptions(force = false) {
  if (!force && hasLoadedApiDomains.value) {
    return;
  }

  apiDomainLoading.value = true;
  apiDomainError.value = '';

  try {
    apiDomainOptions.value = await listApiDomains(force);
    hasLoadedApiDomains.value = true;
    normalizeApiDomainState();
  } catch (error) {
    apiDomainError.value = error instanceof Error ? error.message : String(error);
  } finally {
    apiDomainLoading.value = false;
  }
}

function getImportApiDomainUuid(hostOrUuid: string) {
  const matchedValue = normalizeApiDomainUuid(hostOrUuid, apiDomainOptions.value);
  if (matchedValue) {
    return matchedValue;
  }

  const trimmedValue = hostOrUuid.trim();
  if (!trimmedValue || /^[a-z][a-z\d+\-.]*:/i.test(trimmedValue) || trimmedValue.startsWith('/')) {
    return '';
  }

  return normalizeApiDomainUuid(`https://${trimmedValue}`, apiDomainOptions.value) ||
    normalizeApiDomainUuid(`http://${trimmedValue}`, apiDomainOptions.value);
}

function getFallbackApifoxApiDomainUuid(importedDomain: string) {
  if (importedDomain.trim()) {
    return '';
  }

  return normalizeApiDomainUuid(apiState.domain, apiDomainOptions.value) ||
    getDefaultApiDomainUuid(apiDomainOptions.value);
}

function isDefaultBlankApiState() {
  return apiState.domain === DEFAULT_API_DOMAIN_UUID &&
    !apiState.path.trim() &&
    !apiState.headerData.length &&
    !apiState.bodyData.length &&
    !apiState.queryData.length;
}

function applyImportedApiDatasource(imported: ImportedApiDatasource) {
  syncApiState(imported.datasource);
  syncTransientSchemaState(imported.datasource.schemaSelections, imported.responseExamples);
  apiImportError.value = '';
  emitApiChange();
}

function openSettingsDialog() {
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

function captureSettingsDialogRestoreState() {
  const shouldRestore = isSettingsDialogOpen.value;
  if (shouldRestore) {
    closeSettingsDialog();
  }
  return shouldRestore;
}

function restoreSettingsDialog(shouldRestore: boolean) {
  if (shouldRestore) {
    openSettingsDialog();
  }
}

function setApiImportSource(value: ApiImportSource) {
  if (!props.edit) return;

  apiImportSource.value = value;
  apiImportError.value = '';
}

function openApiImportDialog(source: ApiImportSource) {
  if (!props.edit) return;

  setApiImportSource(source);
  isApiImportDialogOpen.value = true;
  if (!apiImportDialogRef.value?.open) {
    apiImportDialogRef.value?.showModal();
  }
  void ensureApiImportOptions();
}

function closeApiImportDialog() {
  isApiImportDialogOpen.value = false;
  if (apiImportDialogRef.value?.open) {
    apiImportDialogRef.value.close();
  }
}

function openFullSchemaDialog(index: number) {
  const item = responseExamples.value[index];
  fullSchemaText.value = '';
  fullSchemaError.value = '';

  if (!item || item.value === undefined) {
    fullSchemaError.value = item?.error || t('datasource.validation.missingResponseExample');
  } else if (item.error) {
    fullSchemaError.value = item.error;
  } else {
    try {
      fullSchemaText.value = formatJsonSchema(inferDatasourceSchemaFromData(item.value));
    } catch (error) {
      fullSchemaError.value = getDatasourceErrorMessage(error);
    }
  }

  isFullSchemaDialogOpen.value = true;
  if (!fullSchemaDialogRef.value?.open) {
    fullSchemaDialogRef.value?.showModal();
  }
}

function closeFullSchemaDialog() {
  isFullSchemaDialogOpen.value = false;
  fullSchemaText.value = '';
  fullSchemaError.value = '';
  if (fullSchemaDialogRef.value?.open) {
    fullSchemaDialogRef.value.close();
  }
}

function selectDefaultMokelayApi() {
  if (mokelayApiOptions.value.some((api) => api.uuid === selectedMokelayApiUuid.value)) {
    return;
  }

  selectedMokelayApiUuid.value = mokelayApiOptions.value[0]?.uuid ?? '';
}

function changeMokelayApiSource(event: Event) {
  if (!props.edit || isApiImportBusy.value) return;

  mokelayApiSource.value = (event.target as HTMLSelectElement).value === 'system' ? 'system' : 'user';
  selectedMokelayApiUuid.value = '';
  apiImportError.value = '';
  void loadMokelayApiOptions();
}

function selectDefaultApifoxProject() {
  if (apifoxProjectOptions.value.some((project) => project.id === selectedApifoxProjectId.value)) {
    return;
  }

  selectedApifoxProjectId.value = apifoxProjectOptions.value[0]?.id ?? '';
}

function getApiImportErrorMessage(error: unknown) {
  if (error instanceof DatasourceApiImportError) {
    if (error.code === 'unsupportedMethod') {
      return `${t('datasource.import.errors.unsupportedMethod')} ${error.method || ''}`.trim();
    }

    return t(`datasource.import.errors.${error.code}`);
  }

  return error instanceof Error ? error.message : String(error);
}

async function loadMokelayApiOptions(force = false) {
  const source = mokelayApiSource.value;
  if (apiImportOptionsLoading.value || (!force && loadedMokelayApiSources.value[source])) {
    selectDefaultMokelayApi();
    return;
  }

  apiImportOptionsLoading.value = true;
  apiImportError.value = '';

  try {
    const result = await listApis({ page: 1, pageSize: 100, source });
    mokelayApiOptionsBySource.value = {
      ...mokelayApiOptionsBySource.value,
      [source]: result.apis
    };
    loadedMokelayApiSources.value = {
      ...loadedMokelayApiSources.value,
      [source]: true
    };
    if (mokelayApiSource.value === source) {
      selectDefaultMokelayApi();
    }
  } catch (error) {
    apiImportError.value = error instanceof Error ? error.message : t('datasource.import.errors.loadOptions');
  } finally {
    apiImportOptionsLoading.value = false;
  }
}

async function loadApifoxProjectOptions(force = false) {
  if (apiImportOptionsLoading.value || (!force && hasLoadedApifoxProjects.value)) {
    return;
  }

  apiImportOptionsLoading.value = true;
  apiImportError.value = '';

  try {
    const result = await listApifoxProjects();
    apifoxProjectOptions.value = result.projects;
    hasLoadedApifoxProjects.value = true;
    selectDefaultApifoxProject();
  } catch (error) {
    apiImportError.value = error instanceof Error ? error.message : t('datasource.import.errors.loadOptions');
  } finally {
    apiImportOptionsLoading.value = false;
  }
}

async function ensureApiImportOptions(force = false) {
  if (!props.edit) {
    return;
  }

  if (apiImportSource.value === 'mokelay') {
    await loadMokelayApiOptions(force);
    return;
  }

  await loadApifoxProjectOptions(force);
}

function refreshApiImportOptions() {
  void ensureApiImportOptions(true);
}

async function importSelectedApi() {
  if (!props.edit || !canImportApi.value) return;

  apiImportLoading.value = true;
  apiImportError.value = '';

  try {
    await ensureApiDomainOptions();

    if (apiImportSource.value === 'mokelay') {
      const api = mokelayApiSource.value === 'system'
        ? await getBuiltInApi(selectedMokelayApiUuid.value)
        : await getApi(selectedMokelayApiUuid.value);
      const domainUuid = getImportApiDomainUuid(DEFAULT_API_DOMAIN_UUID) || getDefaultApiDomainUuid(apiDomainOptions.value);
      if (!domainUuid) {
        throw new Error(t('datasource.import.errors.apiDomainNotFound'));
      }

      applyImportedApiDatasource(buildDatasourceFromMokelayApi(api, domainUuid));
      closeApiImportDialog();
      return;
    }

    const result = await getApifoxApiDetail({
      projectId: selectedApifoxProjectId.value,
      apiId: apifoxApiId.value.trim()
    });
    const imported = buildDatasourceFromApifoxApi(result, apifoxApiId.value.trim());
    const domainUuid = getImportApiDomainUuid(imported.datasource.domain) ||
      getFallbackApifoxApiDomainUuid(imported.datasource.domain);
    if (!domainUuid) {
      throw new Error(t('datasource.import.errors.apiDomainNotFound'));
    }

    applyImportedApiDatasource({
      ...imported,
      datasource: {
        ...imported.datasource,
        domain: domainUuid
      }
    });
    closeApiImportDialog();
  } catch (error) {
    apiImportError.value = getApiImportErrorMessage(error);
  } finally {
    apiImportLoading.value = false;
  }
}

function syncLocalState(value: unknown) {
  const normalized = normalizeApiDatasource(value);
  syncTransientSchemaState(normalized.schemaSelections);
  syncApiState(normalized);
  normalizeApiDomainState();
}

function updateApiField(field: 'domain' | 'path', value: string) {
  if (!props.edit) return;

  apiState[field] = value;
  emitApiChange();
}

function updateApiMethod(value: string) {
  if (!props.edit) return;

  apiState.method = normalizeMethod(value);
  emitApiChange();
}

function getKeyValueList(listName: KeyValueListName) {
  return apiState[listName];
}

function addKeyValueItem(listName: KeyValueListName) {
  if (!props.edit) return;

  apiState[listName].push({
    key: '',
    value: ''
  });
  emitApiChange();
}

function updateKeyValueItem(
  listName: KeyValueListName,
  index: number,
  field: keyof MDatasourceKeyValueItem,
  value: string
) {
  if (!props.edit) return;

  const item = apiState[listName][index];
  if (!item) return;

  item[field] = value;
  emitApiChange();
}

function removeKeyValueItem(listName: KeyValueListName, index: number) {
  if (!props.edit) return;

  apiState[listName].splice(index, 1);
  emitApiChange();
}

function addBodyItem() {
  if (!props.edit) return;

  const item: ApiStateBodyItem = {
    key: '',
    dataType: 'string',
    value: ''
  };
  apiState.bodyData.push(item);
  bodyValueInputs.value.push(getBodyValueInput(item));
  bodyValueErrors.value.push('');
  bodyFileInputs.value.push(undefined);
  emitApiChange();
}

function updateBodyKey(index: number, value: string) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  item.key = value;
  emitApiChange();
}

function updateBodyDataType(index: number, value: string) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  item.dataType = normalizeBodyDataType(value);
  item.value = getDefaultBodyValue(item.dataType);
  bodyValueInputs.value[index] = getBodyValueInput(item);
  bodyValueErrors.value[index] = '';
  bodyFileInputs.value[index] = undefined;
  emitApiChange();
}

function updateBodyValue(index: number, inputValue: string) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  bodyValueInputs.value[index] = inputValue;
  const parsed = parseBodyValue(item.dataType, inputValue);
  if (!parsed.ok) {
    bodyValueErrors.value[index] = parsed.error;
    return;
  }

  item.value = parsed.value;
  bodyValueErrors.value[index] = '';
  emitApiChange();
}

function updateBodyFile(index: number, file?: File) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item || item.dataType !== 'file') return;

  bodyFileInputs.value[index] = file;
  item.value = file ? getBodyFileValue(file) : getDefaultBodyValue('file');
  bodyValueInputs.value[index] = getBodyValueInput(item);
  bodyValueErrors.value[index] = '';
  emitApiChange();
}

function removeBodyItem(index: number) {
  if (!props.edit) return;

  apiState.bodyData.splice(index, 1);
  bodyValueInputs.value.splice(index, 1);
  bodyValueErrors.value.splice(index, 1);
  bodyFileInputs.value.splice(index, 1);
  emitApiChange();
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

function applySelectedResponseSchema(schema: JSONSchema) {
  jsonSchemaValue.value = cloneJsonSchema(schema);
  schemaSelectionsValue.value = reconcileSchemaSelections(jsonSchemaValue.value, schemaSelectionsValue.value);
  jsonSchemaError.value = '';
  emitCurrentDatasource();
}

function addResponseExample() {
  if (!props.edit) return;
  responseExamples.value.push(createResponseExampleState());
  triggerRef(responseExamples);
}

function removeResponseExample(index: number) {
  if (!props.edit) return;
  responseExamples.value.splice(index, 1);
  triggerRef(responseExamples);
}

function applyResponseExample(index: number, value: JsonValue) {
  const item = responseExamples.value[index];
  if (!item) return;

  item.value = cloneJsonValue(value);
  item.text = formatJsonValue(item.value);
  item.error = '';
  triggerRef(responseExamples);
}

function handleResponseExampleInput(index: number, event: Event) {
  if (!props.edit) return;

  const item = responseExamples.value[index];
  if (!item) return;

  const nextText = (event.target as HTMLTextAreaElement).value;
  item.text = nextText;

  if (!nextText.trim()) {
    item.value = undefined;
    item.error = '';
    triggerRef(responseExamples);
    return;
  }

  try {
    const parsed = JSON.parse(nextText) as unknown;
    if (!isJsonValue(parsed)) {
      throw new Error('Invalid JSON response example.');
    }

    item.value = cloneJsonValue(parsed);
    item.error = '';
    triggerRef(responseExamples);
  } catch {
    item.error = t('datasource.validation.invalidResponseExample');
    triggerRef(responseExamples);
  }
}

function inferDatasourceSchemaFromData(data: JsonValue) {
  const inferredSchema = inferJSONSchema(data);
  if (inferredSchema.ok) {
    return inferredSchema.schema;
  }

  if (inferredSchema.reason === 'emptyArray') {
    throw new DatasourceError('emptyArraySchema', 'Cannot infer JSON Schema from an empty array.');
  }

  throw new DatasourceError('mixedArraySchema', 'The array contains incompatible types, so JSON Schema cannot be inferred.');
}

function addSchemaSelection(path: string) {
  if (!props.edit) return;

  const currentSelections = normalizeSchemaSelections(schemaSelectionsValue.value);
  const field = generatedSelectionFields.value.find((item) => item.path === path);
  if (!field || currentSelections.some((item) => item.path === path)) return;

  schemaSelectionsValue.value = [
    ...currentSelections,
    {
      label: field.label,
      path: field.path,
      type: field.type
    }
  ];
  schemaTranslationError.value = '';
  emitCurrentDatasource();
}

function removeSchemaSelection(path: string) {
  if (!props.edit) return;

  const nextSelections = normalizeSchemaSelections(schemaSelectionsValue.value)
    .filter((field) => field.path !== path);
  if (nextSelections.length === schemaSelectionsValue.value.length) return;

  schemaSelectionsValue.value = nextSelections;
  if (processorFieldPath.value === path) {
    processorFieldPath.value = null;
  }
  if (processorPreviewFieldPath.value === path) {
    processorPreviewFieldPath.value = null;
  }
  schemaTranslationError.value = '';
  emitCurrentDatasource();
}

function openProcessorDialog(path: string) {
  shouldRestoreSettingsAfterProcessorDialog.value = captureSettingsDialogRestoreState();
  processorFieldPath.value = path;
}

function closeProcessorDialog() {
  const shouldRestore = shouldRestoreSettingsAfterProcessorDialog.value;
  processorFieldPath.value = null;
  shouldRestoreSettingsAfterProcessorDialog.value = false;
  restoreSettingsDialog(shouldRestore);
}

function openProcessorPreviewDialog(path: string) {
  shouldRestoreSettingsAfterProcessorPreviewDialog.value = captureSettingsDialogRestoreState();
  processorPreviewFieldPath.value = path;
}

function closeProcessorPreviewDialog() {
  const shouldRestore = shouldRestoreSettingsAfterProcessorPreviewDialog.value;
  processorPreviewFieldPath.value = null;
  shouldRestoreSettingsAfterProcessorPreviewDialog.value = false;
  restoreSettingsDialog(shouldRestore);
}

function applyFieldProcessors(processors: ProcessorConfig[]) {
  const path = processorFieldPath.value;
  if (!path || !props.edit) return;

  const normalizedProcessors = normalizeProcessors(processors);
  schemaSelectionsValue.value = schemaSelectionsValue.value.map((field) => (
    field.path === path
      ? {
          ...field,
          ...(normalizedProcessors.length ? { processors: normalizedProcessors } : { processors: undefined })
        }
      : field
  ));
  const shouldRestore = shouldRestoreSettingsAfterProcessorDialog.value;
  processorFieldPath.value = null;
  shouldRestoreSettingsAfterProcessorDialog.value = false;
  emitCurrentDatasource();
  restoreSettingsDialog(shouldRestore);
}

async function translateSchemaSelectionLabels() {
  if (!props.edit || schemaTranslationLoading.value || !schemaSelectionsValue.value.length) return;

  schemaTranslationLoading.value = true;
  schemaTranslationError.value = '';
  try {
    const translations = await translateTextsToChinese(
      schemaSelectionsValue.value.map((field) => field.label)
    );
    schemaSelectionsValue.value = schemaSelectionsValue.value.map((field) => ({
      ...field,
      label: translations[field.label] ?? field.label
    }));
    emitCurrentDatasource();
  } catch {
    schemaTranslationError.value = t('datasource.validation.translateFieldsFailed');
  } finally {
    schemaTranslationLoading.value = false;
  }
}

function getResponseMockRequestOptions(): DatasourceRequestOptions {
  const bodyFiles: Record<number, File> = {};
  responseMockBodyData.value.forEach((item, index) => {
    const file = item.file;
    if (!file) return;
    bodyFiles[index] = file;
  });

  return {
    bodyFiles
  };
}

function hasConfiguredRequestKeys() {
  return apiState.headerData.some((item) => item.key.trim()) ||
    apiState.queryData.some((item) => item.key.trim()) ||
    apiState.bodyData.some((item) => item.key.trim());
}

function openResponseMockDialog(index: number) {
  responseMockTargetIndex.value = index;
  responseMockHeaderData.value = apiState.headerData
    .filter((item) => item.key.trim())
    .map((item) => ({ ...item }));
  responseMockQueryData.value = apiState.queryData
    .filter((item) => item.key.trim())
    .map((item) => ({ ...item }));
  const mockBodyData: ResponseMockBodyItem[] = [];
  apiState.bodyData.forEach((item, sourceIndex) => {
    if (!item.key.trim()) return;

    const normalizedValue = normalizeBodyValue(item.dataType, item.value);
    mockBodyData.push({
      key: item.key,
      dataType: item.dataType,
      value: normalizedValue,
      input: getBodyValueInput({ ...item, value: normalizedValue }),
      error: '',
      file: bodyFileInputs.value[sourceIndex]
    });
  });
  responseMockBodyData.value = mockBodyData;
  responseMockError.value = '';
  isResponseMockDialogOpen.value = true;
  if (!responseMockDialogRef.value?.open) {
    responseMockDialogRef.value?.showModal();
  }
}

function closeResponseMockDialog() {
  isResponseMockDialogOpen.value = false;
  responseMockTargetIndex.value = null;
  if (responseMockDialogRef.value?.open) {
    responseMockDialogRef.value.close();
  }
}

function updateResponseMockBodyValue(index: number, inputValue: string) {
  const item = responseMockBodyData.value[index];
  if (!item) return;

  item.input = inputValue;
  const parsed = parseBodyValue(item.dataType, inputValue);
  if (!parsed.ok) {
    item.error = parsed.error;
    triggerRef(responseMockBodyData);
    return;
  }

  item.value = parsed.value;
  item.error = '';
  triggerRef(responseMockBodyData);
}

function updateResponseMockBodyFile(index: number, file?: File) {
  const item = responseMockBodyData.value[index];
  if (!item || item.dataType !== 'file') return;

  item.file = file;
  item.value = file ? getBodyFileValue(file) : getDefaultBodyValue('file');
  item.input = getBodyValueInput(item);
  item.error = '';
  triggerRef(responseMockBodyData);
}

async function runResponseCapture(
  index: number,
  datasource: MDatasourceApiObject,
  options?: DatasourceRequestOptions,
  fromDialog = false
) {
  const item = responseExamples.value[index];
  if (!item || item.loading) return;

  jsonSchemaError.value = '';
  responseMockError.value = '';
  item.loading = true;
  triggerRef(responseExamples);

  try {
    const responseData = await resolveDatasourceRemote(datasource, options);
    applyResponseExample(index, responseData);
    if (fromDialog) {
      closeResponseMockDialog();
    }
  } catch (error) {
    const message = getDatasourceErrorMessage(error);
    if (fromDialog) {
      responseMockError.value = message;
    } else {
      jsonSchemaError.value = message;
    }
  } finally {
    item.loading = false;
    triggerRef(responseExamples);
  }
}

function captureResponseExample(index: number) {
  if (!props.edit || isResponseCaptureBusy.value) return;

  if (hasConfiguredRequestKeys()) {
    openResponseMockDialog(index);
    return;
  }

  void runResponseCapture(index, buildApiDatasource());
}

function captureResponseExampleWithMock() {
  const targetIndex = responseMockTargetIndex.value;
  if (targetIndex === null || isResponseCaptureBusy.value) return;

  const invalidBodyItem = responseMockBodyData.value.find((item) => Boolean(item.error));
  if (invalidBodyItem) {
    responseMockError.value = t('datasource.validation.fixMockBeforeCapture');
    return;
  }

  if (apiState.method === 'POST') {
    const missingFileItem = responseMockBodyData.value.find((item) => item.dataType === 'file' && !item.file);
    if (missingFileItem) {
      missingFileItem.error = t('datasource.validation.missingFile');
      triggerRef(responseMockBodyData);
      responseMockError.value = t('datasource.validation.fixMockBeforeCapture');
      return;
    }
  }

  const datasource = normalizeApiDatasource({
    ...buildApiDatasource(),
    headerData: responseMockHeaderData.value,
    queryData: responseMockQueryData.value,
    bodyData: responseMockBodyData.value.map((item) => ({
      key: item.key,
      dataType: item.dataType,
      value: item.value
    }))
  });
  void runResponseCapture(targetIndex, datasource, getResponseMockRequestOptions(), true);
}

function selectResponseSchema(index: number) {
  if (!props.edit) return;

  const item = responseExamples.value[index];
  if (!item) return;

  jsonSchemaError.value = '';
  if (item.error) {
    return;
  }

  if (item.value === undefined) {
    item.error = t('datasource.validation.missingResponseExample');
    triggerRef(responseExamples);
    return;
  }

  try {
    applySelectedResponseSchema(inferDatasourceSchemaFromData(item.value));
  } catch (error) {
    jsonSchemaError.value = getDatasourceErrorMessage(error);
  }
}

function parseBodyValue(dataType: MDatasourceBodyDataType, inputValue: string): BodyValueParseResult {
  if (dataType === 'string') {
    return {
      ok: true,
      value: inputValue
    };
  }

  if (dataType === 'number') {
    const trimmedValue = inputValue.trim();
    const numberValue = Number(trimmedValue);
    if (!trimmedValue || !Number.isFinite(numberValue)) {
      return {
        ok: false,
        error: t('datasource.validation.invalidNumber')
      };
    }

    return {
      ok: true,
      value: numberValue
    };
  }

  if (dataType === 'boolean') {
    return {
      ok: true,
      value: inputValue === 'true'
    };
  }

  if (dataType === 'null') {
    return {
      ok: true,
      value: null
    };
  }

  if (dataType === 'file') {
    return {
      ok: true,
      value: normalizeBodyFileValue({
        name: inputValue,
        size: 0,
        type: ''
      })
    };
  }

  try {
    const parsed = JSON.parse(inputValue) as unknown;
    if (dataType === 'object') {
      if (!isJsonObjectValue(parsed)) {
        return {
          ok: false,
          error: t('datasource.validation.invalidObject')
        };
      }

      return {
        ok: true,
        value: cloneJsonValue(parsed)
      };
    }

    if (!Array.isArray(parsed) || !isJsonValue(parsed)) {
      return {
        ok: false,
        error: t('datasource.validation.invalidArray')
      };
    }

    return {
      ok: true,
      value: cloneJsonValue(parsed)
    };
  } catch {
    return {
      ok: false,
      error: dataType === 'object'
        ? t('datasource.validation.invalidObject')
        : t('datasource.validation.invalidArray')
    };
  }
}

function getBodyValueInput(item: Pick<ApiStateBodyItem, 'dataType' | 'value'>) {
  const normalizedValue = normalizeBodyValue(item.dataType, item.value);
  if (item.dataType === 'file') {
    return normalizeBodyFileValue(normalizedValue).name;
  }

  if (item.dataType === 'object' || item.dataType === 'array') {
    return formatJsonValue(normalizedValue);
  }

  if (item.dataType === 'null') {
    return 'null';
  }

  return String(normalizedValue);
}

void ensureApiDomainOptions();

watch(
  () => props.value,
  (value) => {
    syncLocalState(value);
  },
  { deep: true }
);
</script>

<template>
  <div ref="rootRef" class="ce-datasource-tool" data-testid="editor-datasource-tool">
    <div class="ce-datasource-tool__trigger-row">
      <button
        class="ce-datasource-tool__settings-button"
        type="button"
        data-testid="datasource-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('datasource.actions.settings') }}
      </button>
      <div class="ce-datasource-tool__summary" data-testid="datasource-summary">
        <span class="ce-datasource-tool__summary-item ce-datasource-tool__summary-item--type">API</span>
        <span class="ce-datasource-tool__summary-item">
          <span class="ce-datasource-tool__summary-label">{{ t('datasource.summary.domain') }}</span>
          <span class="ce-datasource-tool__summary-value">{{ datasourceSummaryDomain }}</span>
        </span>
        <span class="ce-datasource-tool__summary-item">
          <span class="ce-datasource-tool__summary-label">{{ t('datasource.summary.path') }}</span>
          <span class="ce-datasource-tool__summary-value">{{ datasourceSummaryPath }}</span>
        </span>
        <span class="ce-datasource-tool__summary-item">
          <span class="ce-datasource-tool__summary-label">{{ t('datasource.summary.method') }}</span>
          <span class="ce-datasource-tool__summary-value">{{ datasourceSummaryMethod }}</span>
        </span>
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-datasource-tool__settings-dialog"
      data-testid="datasource-settings-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="datasource-settings-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-datasource-tool__settings-dialog-panel">
        <div class="ce-datasource-tool__import-dialog-header">
          <h3
            id="datasource-settings-dialog-title"
            class="ce-datasource-tool__import-dialog-title"
            data-testid="datasource-settings-dialog-title"
          >
            {{ t('datasource.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-datasource-tool__import-dialog-close"
            type="button"
            data-testid="datasource-settings-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>
        <div class="ce-datasource-tool__settings-dialog-body">
          <div class="ce-datasource-tool__panel" data-testid="datasource-api-panel">
      <section v-if="edit" class="ce-datasource-tool__config-section" data-testid="datasource-import-config">
        <div class="ce-datasource-tool__config-section-header">
          <div class="ce-datasource-tool__config-section-title">{{ t('datasource.sections.importApi') }}</div>
        </div>
        <div class="ce-datasource-tool__config-section-body" data-testid="datasource-api-import-panel">
          <div class="ce-datasource-tool__import-sources">
            <button
              class="ce-datasource-tool__import-source-button"
              type="button"
              data-testid="datasource-import-open-mokelay"
              :disabled="apiImportOptionsLoading || apiImportLoading"
              @click="openApiImportDialog('mokelay')"
            >
              <span class="ce-datasource-tool__import-source-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <ellipse cx="12" cy="6" rx="7" ry="3" fill="none" stroke="currentColor" stroke-width="2" />
                  <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" fill="none" stroke="currentColor" stroke-width="2" />
                </svg>
              </span>
              <span class="ce-datasource-tool__import-source-label">{{ t('datasource.import.sources.mokelay') }}</span>
            </button>
            <button
              class="ce-datasource-tool__import-source-button"
              type="button"
              data-testid="datasource-import-open-apifox"
              :disabled="apiImportOptionsLoading || apiImportLoading"
              @click="openApiImportDialog('apifox')"
            >
              <span class="ce-datasource-tool__import-source-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                  <path d="M12 8v8M8.5 10.2l7 3.6M15.5 10.2l-7 3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              <span class="ce-datasource-tool__import-source-label">{{ t('datasource.import.sources.apifox') }}</span>
            </button>
          </div>
        </div>
      </section>

      <Teleport to="body">
        <dialog
          v-if="edit"
          ref="apiImportDialogRef"
          class="ce-datasource-tool__import-dialog"
          data-testid="datasource-api-import-dialog"
          :aria-hidden="!isApiImportDialogOpen"
          aria-labelledby="datasource-api-import-dialog-title"
          @close="isApiImportDialogOpen = false"
        >
          <div class="ce-datasource-tool__import-dialog-panel">
          <div class="ce-datasource-tool__import-dialog-header">
            <h3
              id="datasource-api-import-dialog-title"
              class="ce-datasource-tool__import-dialog-title"
              data-testid="datasource-api-import-dialog-title"
            >
              {{ apiImportDialogTitle }}
            </h3>
            <button
              class="ce-datasource-tool__import-dialog-close"
              type="button"
              data-testid="datasource-api-import-dialog-close"
              @click="closeApiImportDialog"
            >
              {{ t('editor.close') }}
            </button>
          </div>

          <div class="ce-datasource-tool__import-dialog-body">
            <template v-if="apiImportSource === 'mokelay'">
              <label class="ce-datasource-tool__field">
                <span class="ce-datasource-tool__label">{{ t('datasource.fields.apiSource') }}</span>
                <select
                  class="ce-datasource-tool__input"
                  data-testid="datasource-import-mokelay-source"
                  :disabled="isApiImportBusy"
                  :value="mokelayApiSource"
                  @change="changeMokelayApiSource"
                >
                  <option value="user">{{ t('datasource.import.apiSources.user') }}</option>
                  <option value="system">{{ t('datasource.import.apiSources.system') }}</option>
                </select>
              </label>
              <label class="ce-datasource-tool__field">
                <span class="ce-datasource-tool__label">{{ t('datasource.fields.mokelayApi') }}</span>
                <select
                  class="ce-datasource-tool__input"
                  data-testid="datasource-import-mokelay-api"
                  :disabled="isApiImportBusy || !mokelayApiOptions.length"
                  :value="selectedMokelayApiUuid"
                  @change="selectedMokelayApiUuid = ($event.target as HTMLSelectElement).value"
                >
                  <option v-if="!mokelayApiOptions.length" value="">
                    {{ t('datasource.import.emptyMokelayApis') }}
                  </option>
                  <option v-for="api in mokelayApiOptions" :key="api.uuid" :value="api.uuid">
                    {{ api.name }} ({{ api.method }})
                  </option>
                </select>
              </label>
            </template>
            <template v-else>
              <label class="ce-datasource-tool__field">
                <span class="ce-datasource-tool__label">{{ t('datasource.fields.apifoxProject') }}</span>
                <select
                  class="ce-datasource-tool__input"
                  data-testid="datasource-import-apifox-project"
                  :disabled="isApiImportBusy || !apifoxProjectOptions.length"
                  :value="selectedApifoxProjectId"
                  @change="selectedApifoxProjectId = ($event.target as HTMLSelectElement).value"
                >
                  <option v-if="!apifoxProjectOptions.length" value="">
                    {{ t('datasource.import.emptyApifoxProjects') }}
                  </option>
                  <option v-for="project in apifoxProjectOptions" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </label>
              <label class="ce-datasource-tool__field">
                <span class="ce-datasource-tool__label">{{ t('datasource.fields.apifoxApiId') }}</span>
                <input
                  class="ce-datasource-tool__input"
                  data-testid="datasource-import-apifox-api-id"
                  type="text"
                  :readonly="isApiImportBusy"
                  :placeholder="t('datasource.import.placeholders.apifoxApiId')"
                  :value="apifoxApiId"
                  @input="apifoxApiId = ($event.target as HTMLInputElement).value"
                  @keydown.stop
                />
              </label>
            </template>
            <p v-if="apiImportError" class="ce-datasource-tool__error" data-testid="datasource-import-error">
              {{ apiImportError }}
            </p>
          </div>

          <div class="ce-datasource-tool__import-dialog-actions">
            <button
              class="ce-datasource-tool__action"
              type="button"
              data-testid="datasource-import-refresh"
              :disabled="isApiImportBusy"
              @click="refreshApiImportOptions"
            >
              {{ apiImportOptionsLoading ? t('datasource.actions.refreshing') : t('datasource.actions.refresh') }}
            </button>
            <button
              class="ce-datasource-tool__schema-button"
              type="button"
              data-testid="datasource-import-apply"
              :disabled="!canImportApi"
              @click="importSelectedApi"
            >
              {{ apiImportLoading ? t('datasource.actions.importingApi') : t('datasource.actions.importApi') }}
            </button>
          </div>
          </div>
        </dialog>
      </Teleport>

      <section class="ce-datasource-tool__config-section" data-testid="datasource-request-config">
        <div class="ce-datasource-tool__config-section-header">
          <div class="ce-datasource-tool__config-section-title">{{ t('datasource.sections.requestConfig') }}</div>
        </div>
        <div class="ce-datasource-tool__config-section-body">
      <div class="ce-datasource-tool__grid">
        <label class="ce-datasource-tool__field">
          <span class="ce-datasource-tool__label">{{ t('datasource.fields.domain') }}</span>
          <select
            class="ce-datasource-tool__input"
            data-testid="datasource-domain"
            :disabled="isApiDomainSelectDisabled"
            :value="apiState.domain"
            @change="updateApiField('domain', ($event.target as HTMLSelectElement).value)"
          >
            <option v-if="!apiDomainOptions.length" value="">
              {{ apiDomainEmptyOptionText }}
            </option>
            <option v-else-if="!apiState.domain" value="">
              {{ t('datasource.import.selectApiDomain') }}
            </option>
            <option v-for="domain in apiDomainOptions" :key="domain.uuid" :value="domain.uuid">
              {{ domain.alias }} ({{ domain.host }})
            </option>
          </select>
          <p v-if="apiDomainError" class="ce-datasource-tool__error" data-testid="datasource-domain-error">
            {{ apiDomainError }}
          </p>
        </label>
        <label class="ce-datasource-tool__field">
          <span class="ce-datasource-tool__label">{{ t('datasource.fields.path') }}</span>
          <input
            class="ce-datasource-tool__input"
            data-testid="datasource-path"
            type="text"
            :readonly="isReadOnly"
            :value="apiState.path"
            @input="updateApiField('path', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
        </label>
        <label class="ce-datasource-tool__field">
          <span class="ce-datasource-tool__label">{{ t('datasource.fields.method') }}</span>
          <select
            class="ce-datasource-tool__input"
            data-testid="datasource-method"
            :disabled="isReadOnly"
            :value="apiState.method"
            @change="updateApiMethod(($event.target as HTMLSelectElement).value)"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </label>
      </div>

      <details open class="ce-datasource-tool__list" data-testid="datasource-header-list">
        <summary class="ce-datasource-tool__list-header">
          <span class="ce-datasource-tool__list-title">{{ t('datasource.sections.headers') }}</span>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-header-add"
            @click.stop.prevent="addKeyValueItem('headerData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!getKeyValueList('headerData').length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(item, index) in getKeyValueList('headerData')"
          :key="`header-${index}`"
          class="ce-datasource-tool__row"
        >
          <input
            class="ce-datasource-tool__input"
            :data-testid="`datasource-header-key-${index}`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.key')"
            :value="item.key"
            @input="updateKeyValueItem('headerData', index, 'key', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <input
            class="ce-datasource-tool__input"
            :data-testid="`datasource-header-value-${index}`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.value')"
            :value="item.value"
            @input="updateKeyValueItem('headerData', index, 'value', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="`datasource-header-remove-${index}`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeKeyValueItem('headerData', index)"
          >
            {{ t('datasource.actions.remove') }}
          </button>
        </div>
      </details>

      <details open class="ce-datasource-tool__list" data-testid="datasource-query-list">
        <summary class="ce-datasource-tool__list-header">
          <span class="ce-datasource-tool__list-title">{{ t('datasource.sections.queries') }}</span>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-query-add"
            @click.stop.prevent="addKeyValueItem('queryData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!getKeyValueList('queryData').length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(item, index) in getKeyValueList('queryData')"
          :key="`query-${index}`"
          class="ce-datasource-tool__row"
        >
          <input
            class="ce-datasource-tool__input"
            :data-testid="`datasource-query-key-${index}`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.key')"
            :value="item.key"
            @input="updateKeyValueItem('queryData', index, 'key', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <input
            class="ce-datasource-tool__input"
            :data-testid="`datasource-query-value-${index}`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.value')"
            :value="item.value"
            @input="updateKeyValueItem('queryData', index, 'value', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="`datasource-query-remove-${index}`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeKeyValueItem('queryData', index)"
          >
            {{ t('datasource.actions.remove') }}
          </button>
        </div>
      </details>

      <details open class="ce-datasource-tool__list" data-testid="datasource-body-list">
        <summary class="ce-datasource-tool__list-header">
          <span class="ce-datasource-tool__list-title">{{ t('datasource.sections.body') }}</span>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-body-add"
            @click.stop.prevent="addBodyItem"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!apiState.bodyData.length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(body, index) in apiState.bodyData"
          :key="`body-${index}`"
          class="ce-datasource-tool__body-row"
        >
          <input
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-key-${index}`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.key')"
            :value="body.key"
            @input="updateBodyKey(index, ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <select
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-type-${index}`"
            :disabled="isReadOnly"
            :value="body.dataType"
            @change="updateBodyDataType(index, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="dataType in bodyDataTypeOptions" :key="dataType" :value="dataType">
              {{ dataType }}
            </option>
          </select>
          <select
            v-if="body.dataType === 'boolean'"
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-value-${index}`"
            :disabled="isReadOnly"
            :value="String(body.value === true)"
            @change="updateBodyValue(index, ($event.target as HTMLSelectElement).value)"
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
          <input
            v-else-if="body.dataType === 'null'"
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-value-${index}`"
            type="text"
            readonly
            value="null"
          />
          <input
            v-else-if="body.dataType === 'file' && edit"
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-value-${index}`"
            type="file"
            :disabled="isReadOnly"
            @change="updateBodyFile(index, ($event.target as HTMLInputElement).files?.[0])"
            @keydown.stop
          />
          <input
            v-else-if="body.dataType === 'file'"
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-value-${index}`"
            type="text"
            readonly
            :value="getBodyValueInput(body)"
          />
          <textarea
            v-else-if="body.dataType === 'object' || body.dataType === 'array'"
            class="ce-datasource-tool__textarea ce-datasource-tool__textarea--value"
            :data-testid="`datasource-body-value-${index}`"
            spellcheck="false"
            :readonly="isReadOnly"
            :value="bodyValueInputs[index] ?? getBodyValueInput(body)"
            @input="updateBodyValue(index, ($event.target as HTMLTextAreaElement).value)"
            @keydown.stop
          ></textarea>
          <input
            v-else
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-value-${index}`"
            :type="body.dataType === 'number' ? 'number' : 'text'"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.value')"
            :value="bodyValueInputs[index] ?? getBodyValueInput(body)"
            @input="updateBodyValue(index, ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="`datasource-body-remove-${index}`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeBodyItem(index)"
          >
            {{ t('datasource.actions.remove') }}
          </button>
          <p v-if="bodyValueErrors[index]" class="ce-datasource-tool__body-error" :data-testid="`datasource-body-error-${index}`">
            {{ bodyValueErrors[index] }}
          </p>
        </div>
      </details>
        </div>
      </section>

      <Teleport to="body">
        <dialog
          v-if="edit"
          ref="responseMockDialogRef"
          class="ce-datasource-tool__import-dialog ce-datasource-tool__response-mock-dialog"
          data-testid="datasource-response-mock-dialog"
          :aria-hidden="!isResponseMockDialogOpen"
          aria-labelledby="datasource-response-mock-dialog-title"
          @close="isResponseMockDialogOpen = false; responseMockTargetIndex = null"
        >
          <div class="ce-datasource-tool__import-dialog-panel">
          <div class="ce-datasource-tool__import-dialog-header">
            <h3 id="datasource-response-mock-dialog-title" class="ce-datasource-tool__import-dialog-title">
              {{ t('datasource.responseMock.title') }}
            </h3>
            <button
              class="ce-datasource-tool__import-dialog-close"
              type="button"
              data-testid="datasource-response-mock-close"
              :disabled="isResponseCaptureBusy"
              @click="closeResponseMockDialog"
            >
              {{ t('editor.close') }}
            </button>
          </div>

          <div class="ce-datasource-tool__import-dialog-body ce-datasource-tool__response-mock-body">
            <p class="ce-datasource-tool__section-copy">{{ t('datasource.responseMock.help') }}</p>

            <section v-if="responseMockHeaderData.length" class="ce-datasource-tool__response-mock-section">
              <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.headers') }}</div>
              <div
                v-for="(item, index) in responseMockHeaderData"
                :key="`response-mock-header-${index}`"
                class="ce-datasource-tool__response-mock-row"
              >
                <input class="ce-datasource-tool__input" type="text" readonly :value="item.key" />
                <input
                  class="ce-datasource-tool__input"
                  :data-testid="`datasource-response-mock-header-${index}`"
                  type="text"
                  :placeholder="t('datasource.fields.mock')"
                  :value="item.value"
                  @input="item.value = ($event.target as HTMLInputElement).value"
                  @keydown.stop
                />
              </div>
            </section>

            <section v-if="responseMockQueryData.length" class="ce-datasource-tool__response-mock-section">
              <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.queries') }}</div>
              <div
                v-for="(item, index) in responseMockQueryData"
                :key="`response-mock-query-${index}`"
                class="ce-datasource-tool__response-mock-row"
              >
                <input class="ce-datasource-tool__input" type="text" readonly :value="item.key" />
                <input
                  class="ce-datasource-tool__input"
                  :data-testid="`datasource-response-mock-query-${index}`"
                  type="text"
                  :placeholder="t('datasource.fields.mock')"
                  :value="item.value"
                  @input="item.value = ($event.target as HTMLInputElement).value"
                  @keydown.stop
                />
              </div>
            </section>

            <section v-if="responseMockBodyData.length" class="ce-datasource-tool__response-mock-section">
              <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.body') }}</div>
              <div
                v-for="(item, index) in responseMockBodyData"
                :key="`response-mock-body-${index}`"
                class="ce-datasource-tool__response-mock-body-row"
              >
                <input class="ce-datasource-tool__input" type="text" readonly :value="item.key" />
                <input class="ce-datasource-tool__input" type="text" readonly :value="item.dataType" />
                <select
                  v-if="item.dataType === 'boolean'"
                  class="ce-datasource-tool__input"
                  :data-testid="`datasource-response-mock-body-${index}`"
                  :value="String(item.value === true)"
                  @change="updateResponseMockBodyValue(index, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
                <input
                  v-else-if="item.dataType === 'null'"
                  class="ce-datasource-tool__input"
                  :data-testid="`datasource-response-mock-body-${index}`"
                  type="text"
                  readonly
                  value="null"
                />
                <input
                  v-else-if="item.dataType === 'file'"
                  class="ce-datasource-tool__input"
                  :data-testid="`datasource-response-mock-body-${index}`"
                  type="file"
                  @change="updateResponseMockBodyFile(index, ($event.target as HTMLInputElement).files?.[0])"
                  @keydown.stop
                />
                <textarea
                  v-else-if="item.dataType === 'object' || item.dataType === 'array'"
                  class="ce-datasource-tool__textarea ce-datasource-tool__textarea--value"
                  :data-testid="`datasource-response-mock-body-${index}`"
                  spellcheck="false"
                  :value="item.input"
                  @input="updateResponseMockBodyValue(index, ($event.target as HTMLTextAreaElement).value)"
                  @keydown.stop
                ></textarea>
                <input
                  v-else
                  class="ce-datasource-tool__input"
                  :data-testid="`datasource-response-mock-body-${index}`"
                  :type="item.dataType === 'number' ? 'number' : 'text'"
                  :placeholder="t('datasource.fields.mock')"
                  :value="item.input"
                  @input="updateResponseMockBodyValue(index, ($event.target as HTMLInputElement).value)"
                  @keydown.stop
                />
                <p v-if="item.error" class="ce-datasource-tool__body-error ce-datasource-tool__response-mock-body-error">
                  {{ item.error }}
                </p>
              </div>
            </section>

            <p v-if="responseMockError" class="ce-datasource-tool__error" data-testid="datasource-response-mock-error">
              {{ responseMockError }}
            </p>
          </div>

          <div class="ce-datasource-tool__import-dialog-actions">
            <button
              class="ce-datasource-tool__action"
              type="button"
              :disabled="isResponseCaptureBusy"
              @click="closeResponseMockDialog"
            >
              {{ t('datasource.actions.cancel') }}
            </button>
            <button
              class="ce-datasource-tool__schema-button"
              type="button"
              data-testid="datasource-response-mock-submit"
              :disabled="isResponseCaptureBusy"
              @click="captureResponseExampleWithMock"
            >
              {{ isResponseCaptureBusy ? t('datasource.actions.capturingResponseExample') : t('datasource.actions.capture') }}
            </button>
          </div>
          </div>
        </dialog>
      </Teleport>

      <section class="ce-datasource-tool__config-section" data-testid="datasource-response-config">
        <div class="ce-datasource-tool__config-section-header">
          <div>
            <div class="ce-datasource-tool__config-section-title">{{ t('datasource.sections.responseConfig') }}</div>
            <p class="ce-datasource-tool__section-copy">{{ t('datasource.help.responseConfig') }}</p>
          </div>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-response-example-add"
            @click="addResponseExample"
          >
            {{ t('datasource.actions.addResponseExample') }}
          </button>
        </div>
        <div class="ce-datasource-tool__config-section-body ce-datasource-tool__config-section-body--response">
          <div class="ce-datasource-tool__response-example-list" data-testid="datasource-schema-generate-panel">
            <article
              v-for="(responseExample, index) in responseExamples"
              :key="responseExample.id"
              class="ce-datasource-tool__generate-panel ce-datasource-tool__response-example-card"
              :data-testid="`datasource-response-example-item-${index}`"
            >
              <div class="ce-datasource-tool__response-example-header">
                <div class="ce-datasource-tool__section-title">
                  {{ t('datasource.fields.responseExample') }} {{ index + 1 }}
                </div>
                <div class="ce-datasource-tool__response-example-header-actions">
                  <button
                    type="button"
                    class="ce-datasource-tool__full-schema-button"
                    :data-testid="index === 0 ? 'datasource-full-schema-open' : `datasource-full-schema-open-${index}`"
                    @click="openFullSchemaDialog(index)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2M10 8l-2 4 2 4M14 8l2 4-2 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>{{ t('datasource.actions.fullSchema') }}</span>
                  </button>
                  <button
                    v-if="edit"
                    class="ce-datasource-tool__schema-button"
                    type="button"
                    :data-testid="index === 0 ? 'datasource-response-schema-select-button' : `datasource-response-schema-select-button-${index}`"
                    @click="selectResponseSchema(index)"
                  >
                    {{ t('datasource.actions.selectSchema') }}
                  </button>
                  <button
                    v-if="edit"
                    class="ce-datasource-tool__remove"
                    type="button"
                    :data-testid="`datasource-response-example-remove-${index}`"
                    @click="removeResponseExample(index)"
                  >
                    {{ t('datasource.actions.remove') }}
                  </button>
                </div>
              </div>
              <div class="ce-datasource-tool__generate-actions">
                <button
                  v-if="edit"
                  class="ce-datasource-tool__schema-button"
                  type="button"
                  :data-testid="index === 0 ? 'datasource-json-schema-parse-button' : `datasource-json-schema-parse-button-${index}`"
                  :disabled="isResponseCaptureBusy"
                  @click="captureResponseExample(index)"
                >
                  {{ responseExample.loading ? t('datasource.actions.capturingResponseExample') : t('datasource.actions.captureResponseExample') }}
                </button>
                <span v-if="jsonSchemaValue" class="ce-datasource-tool__schema-summary" data-testid="datasource-schema-summary">
                  {{ t('datasource.fields.generatedFields') }}: {{ flattenedSchemaNodes.length }}
                </span>
              </div>
              <div class="ce-datasource-tool__response-example-grid">
                <label class="ce-datasource-tool__field">
                  <span class="ce-datasource-tool__label">{{ t('datasource.fields.responseExampleInput') }}</span>
                  <textarea
                    class="ce-datasource-tool__textarea ce-datasource-tool__textarea--response-example"
                    :data-testid="index === 0 ? 'datasource-response-example' : `datasource-response-example-${index}`"
                    spellcheck="false"
                    :readonly="isReadOnly"
                    :placeholder="t('datasource.fields.responseExamplePlaceholder')"
                    :value="responseExample.text"
                    @input="handleResponseExampleInput(index, $event)"
                    @keydown.stop
                  ></textarea>
                </label>
                <div class="ce-datasource-tool__field">
                  <span class="ce-datasource-tool__label">{{ t('datasource.fields.responseExamplePreview') }}</span>
                  <div
                    class="ce-datasource-tool__response-example-preview"
                    :data-testid="index === 0 ? 'datasource-response-example-preview' : `datasource-response-example-preview-${index}`"
                  >
                    <p
                      v-if="responseExample.error"
                      class="ce-datasource-tool__response-example-preview-state ce-datasource-tool__response-example-preview-state--error"
                      :data-testid="index === 0 ? 'datasource-response-example-preview-error' : `datasource-response-example-preview-error-${index}`"
                    >
                      {{ responseExample.error }}
                    </p>
                    <JsonTreeView v-else-if="responseExample.value !== undefined" :value="responseExample.value" />
                    <p v-else class="ce-datasource-tool__response-example-preview-state">
                      {{ t('datasource.fields.responseExamplePreviewEmpty') }}
                    </p>
                  </div>
                </div>
              </div>
              <p
                v-if="responseExample.error"
                class="ce-datasource-tool__error"
                :data-testid="index === 0 ? 'datasource-response-example-error' : `datasource-response-example-error-${index}`"
              >
                {{ responseExample.error }}
              </p>
            </article>
          </div>
          <p v-if="jsonSchemaError" class="ce-datasource-tool__error" data-testid="datasource-json-schema-error">
            {{ jsonSchemaError }}
          </p>

    <div class="ce-datasource-tool__schema-panel" data-testid="datasource-json-schema-panel">
      <div class="ce-datasource-tool__schema-header">
        <div>
          <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.fieldSelection') }}</div>
          <p class="ce-datasource-tool__section-copy">{{ t('datasource.help.fieldSelection') }}</p>
        </div>
      </div>

        <div class="ce-datasource-tool__schema-tab-panel" data-testid="datasource-fields-schema-panel">
          <div class="ce-datasource-tool__field-list-summary">
            {{ t('datasource.fields.availableFields') }}
          </div>
          <p v-if="!jsonSchemaValue" class="ce-datasource-tool__empty" data-testid="datasource-schema-empty">
            {{ t('datasource.emptySchema') }}
          </p>
          <p v-else-if="!combinedSelectionFields.length" class="ce-datasource-tool__empty" data-testid="datasource-fields-schema-empty">
            {{ t('datasource.noSelectableFields') }}
          </p>

          <div v-if="combinedSelectionFields.length" class="ce-datasource-tool__schema-filters">
            <label class="ce-datasource-tool__field">
              <span class="ce-datasource-tool__label">{{ t('datasource.fields.pathDepth') }}</span>
              <input
                class="ce-datasource-tool__input"
                data-testid="datasource-schema-path-depth"
                type="number"
                min="1"
                max="10"
                step="1"
                :value="schemaPathDepth"
                @input="updateSchemaPathDepth"
                @keydown.stop
              />
            </label>

            <label class="ce-datasource-tool__field">
              <span class="ce-datasource-tool__label">{{ t('datasource.fields.dataType') }}</span>
              <select
                class="ce-datasource-tool__input"
                data-testid="datasource-schema-data-type-filter"
                :value="schemaDataTypeFilter"
                @change="schemaDataTypeFilter = ($event.target as HTMLSelectElement).value as SchemaDataTypeFilter"
              >
                <option value="all">{{ t('datasource.fields.allDataTypes') }}</option>
                <option value="string">{{ getSchemaTypeLabel('string') }}</option>
                <option value="number">{{ getSchemaTypeLabel('number') }}</option>
                <option value="boolean">{{ getSchemaTypeLabel('boolean') }}</option>
                <option value="object">{{ getSchemaTypeLabel('object') }}</option>
                <option value="array">{{ getSchemaTypeLabel('array') }}</option>
              </select>
            </label>

            <label class="ce-datasource-tool__field">
              <span class="ce-datasource-tool__label">{{ t('datasource.fields.fieldPath') }}</span>
              <input
                class="ce-datasource-tool__input"
                data-testid="datasource-schema-search"
                type="search"
                :placeholder="t('datasource.fields.searchFieldsByPath')"
                :value="schemaSearch"
                @input="schemaSearch = ($event.target as HTMLInputElement).value"
                @keydown.stop
              />
            </label>
          </div>

          <div v-if="visibleSelectionFields.length" class="ce-datasource-tool__field-list" data-testid="datasource-fields">
            <div
              v-for="field in visibleSelectionFields"
              :key="`${field.source}:${field.path}`"
              class="ce-datasource-tool__schema-field"
              :data-testid="`datasource-${field.source}-field-${field.path}`"
            >
              <span class="ce-datasource-tool__schema-field-main">
                <span class="ce-datasource-tool__schema-field-label" :data-testid="`datasource-${field.source}-field-label-${field.path}`">
                  {{ field.label }}
                </span>
                <span class="ce-datasource-tool__schema-path">{{ field.path }}</span>
              </span>
              <span class="ce-datasource-tool__schema-badges">
                <span class="ce-datasource-tool__schema-badge">{{ getSchemaTypeLabel(field.type) }}</span>
                <button
                  type="button"
                  class="ce-datasource-tool__field-action"
                  :disabled="isReadOnly || field.selected"
                  :data-testid="`datasource-${field.source}-field-add-${field.path}`"
                  @click="addSchemaSelection(field.path)"
                >
                  {{ field.selected ? t('datasource.actions.added') : t('datasource.actions.add') }}
                </button>
              </span>
            </div>
          </div>
          <p
            v-else-if="combinedSelectionFields.length"
            class="ce-datasource-tool__empty"
            data-testid="datasource-fields-search-empty"
          >
            {{ t('datasource.noFieldsMatchingPath') }}
          </p>
        </div>

        <div class="ce-datasource-tool__selected-fields" data-testid="datasource-selected-fields">
          <div class="ce-datasource-tool__selected-fields-header">
            <div class="ce-datasource-tool__field-list-summary">
              {{ t('datasource.fields.selectedFields') }}: {{ enabledFieldCount }}
            </div>
            <button
              type="button"
              class="ce-datasource-tool__schema-button"
              :disabled="isReadOnly || schemaTranslationLoading || !schemaSelectionsValue.length"
              data-testid="datasource-selected-fields-translate"
              @click="translateSchemaSelectionLabels"
            >
              {{ schemaTranslationLoading
                ? t('datasource.actions.translatingFields')
                : t('datasource.actions.translateFields') }}
            </button>
          </div>
          <div v-if="schemaSelectionsValue.length" class="ce-datasource-tool__field-list">
            <div
              v-for="field in schemaSelectionsValue"
              :key="field.path"
              class="ce-datasource-tool__schema-field"
              :data-testid="`datasource-selected-field-${field.path}`"
            >
              <span class="ce-datasource-tool__schema-field-main">
                <span class="ce-datasource-tool__schema-field-label" :data-testid="`datasource-selected-field-label-${field.path}`">
                  {{ field.label }}
                </span>
                <span class="ce-datasource-tool__schema-path">{{ field.path }}</span>
                <span
                  v-if="field.processors?.length"
                  class="ce-datasource-tool__processor-tags"
                  :data-testid="`datasource-selected-field-processors-${field.path}`"
                >
                  <span
                    v-for="(processor, processorIndex) in field.processors"
                    :key="`${processorName(processor)}-${processorIndex}`"
                    class="ce-datasource-tool__processor-tag"
                  >
                    {{ getProcessorLabel(processor) }}
                  </span>
                </span>
              </span>
              <span class="ce-datasource-tool__schema-badges">
                <span class="ce-datasource-tool__selected-field-meta">
                  <span class="ce-datasource-tool__schema-badge">{{ getSchemaTypeLabel(field.type) }}</span>
                  <span
                    v-if="field.processors?.length"
                    class="ce-datasource-tool__schema-badge ce-datasource-tool__schema-badge--processor"
                  >
                    {{ t('datasource.processors.count').replace('{count}', String(field.processors.length)) }}
                  </span>
                </span>
                <span class="ce-datasource-tool__selected-field-actions">
                  <button
                    type="button"
                    class="ce-datasource-tool__field-action"
                    :data-testid="`datasource-selected-field-preview-${field.path}`"
                    @click="openProcessorPreviewDialog(field.path)"
                  >
                    {{ t('datasource.actions.previewField') }}
                  </button>
                  <button
                    type="button"
                    class="ce-datasource-tool__field-action"
                    :data-testid="`datasource-selected-field-processors-config-${field.path}`"
                    @click="openProcessorDialog(field.path)"
                  >
                    {{ isReadOnly ? t('datasource.processors.view') : t('datasource.processors.configure') }}
                  </button>
                  <button
                    type="button"
                    class="ce-datasource-tool__field-action ce-datasource-tool__field-action--remove"
                    :disabled="isReadOnly"
                    :data-testid="`datasource-selected-field-remove-${field.path}`"
                    @click="removeSchemaSelection(field.path)"
                  >
                    {{ t('datasource.actions.remove') }}
                  </button>
                </span>
              </span>
            </div>
          </div>
          <p v-else class="ce-datasource-tool__empty" data-testid="datasource-selected-fields-empty">
            {{ t('datasource.emptySelectedFields') }}
          </p>
          <p v-if="schemaTranslationError" class="ce-datasource-tool__error" data-testid="datasource-selected-fields-translate-error">
            {{ schemaTranslationError }}
          </p>
        </div>

      <Teleport to="body">
        <dialog
          ref="fullSchemaDialogRef"
          class="ce-datasource-tool__import-dialog ce-datasource-tool__schema-dialog"
          data-testid="datasource-full-schema-dialog"
          :aria-hidden="!isFullSchemaDialogOpen"
          aria-labelledby="datasource-full-schema-dialog-title"
          @close="isFullSchemaDialogOpen = false"
        >
          <div class="ce-datasource-tool__import-dialog-panel">
          <div class="ce-datasource-tool__import-dialog-header">
            <h3
              id="datasource-full-schema-dialog-title"
              class="ce-datasource-tool__import-dialog-title"
              data-testid="datasource-full-schema-dialog-title"
            >
              {{ t('datasource.actions.fullSchema') }}
            </h3>
            <button
              class="ce-datasource-tool__import-dialog-close"
              type="button"
              data-testid="datasource-full-schema-close"
              @click="closeFullSchemaDialog"
            >
              {{ t('editor.close') }}
            </button>
          </div>
          <div class="ce-datasource-tool__import-dialog-body">
            <textarea
              class="ce-datasource-tool__textarea ce-datasource-tool__textarea--schema ce-datasource-tool__textarea--full-schema"
              data-testid="datasource-json-schema"
              spellcheck="false"
              readonly
              :value="fullSchemaText"
              @keydown.stop
            ></textarea>
            <p v-if="fullSchemaError" class="ce-datasource-tool__error" data-testid="datasource-full-schema-error">
              {{ fullSchemaError }}
            </p>
          </div>
          </div>
        </dialog>
      </Teleport>
    </div>
        </div>
      </section>
    </div>
        </div>
      </div>
    </dialog>
    <ProcessorConfigDialog
      :open="Boolean(processorFieldPath)"
      :field="processorField"
      :readonly="isReadOnly"
      @close="closeProcessorDialog"
      @apply="applyFieldProcessors"
    />
    <ProcessorPreviewDialog
      :open="Boolean(processorPreviewFieldPath)"
      :field="processorPreviewField"
      :examples="processorPreviewExamples"
      @close="closeProcessorPreviewDialog"
    />
  </div>
</template>

<style scoped>
.ce-datasource-tool {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-datasource-tool__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-datasource-tool__settings-button {
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

.ce-datasource-tool__settings-button:hover {
  background: rgb(13 148 136);
}

.ce-datasource-tool__summary {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-datasource-tool__summary-item {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  gap: 5px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-datasource-tool__summary-item--type {
  border-color: rgb(191 219 254);
  background: rgb(239 246 255);
  color: rgb(29 78 216);
}

.ce-datasource-tool__summary-label {
  flex: 0 0 auto;
  color: rgb(100 116 139);
}

.ce-datasource-tool__summary-value {
  min-width: 0;
  overflow: hidden;
  color: rgb(15 23 42);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__settings-dialog {
  width: min(calc(100vw - 32px), 1120px);
  max-height: min(calc(100vh - 32px), 900px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-datasource-tool__settings-dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-datasource-tool__settings-dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__settings-dialog-body {
  overflow-y: auto;
}

.ce-datasource-tool__panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
}

.ce-datasource-tool__config-section {
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__config-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__config-section-title {
  color: rgb(15 23 42);
  font-size: 15px;
  font-weight: 700;
}

.ce-datasource-tool__config-section-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
}

.ce-datasource-tool__schema-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid rgb(226 232 240);
  padding: 14px 0 0;
}

.ce-datasource-tool__generate-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ce-datasource-tool__response-example-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ce-datasource-tool__response-example-card {
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  padding: 12px;
}

.ce-datasource-tool__response-example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.ce-datasource-tool__response-example-header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.ce-datasource-tool__response-example-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ce-datasource-tool__response-example-preview {
  min-height: 260px;
  max-height: 420px;
  overflow: auto;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 9px 10px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__response-example-preview-state {
  margin: 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-datasource-tool__response-example-preview-state--error {
  color: rgb(185 28 28);
}

.ce-datasource-tool__schema-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ce-datasource-tool__section-title {
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 700;
}

.ce-datasource-tool__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-datasource-tool__generate-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.ce-datasource-tool__schema-summary {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 600;
}

.ce-datasource-tool__schema-filters {
  display: grid;
  grid-template-columns: minmax(110px, 0.2fr) minmax(180px, 0.35fr) minmax(260px, 1fr);
  gap: 10px;
  align-items: end;
}

.ce-datasource-tool__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 0.4fr);
  gap: 10px;
}

.ce-datasource-tool__import-sources {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ce-datasource-tool__import-source-button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 9px 10px;
  background: rgb(255 255 255);
  color: rgb(30 64 175);
  font: inherit;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
}

.ce-datasource-tool__import-source-button:hover {
  border-color: rgb(37 99 235 / 0.55);
  background: rgb(239 246 255);
}

.ce-datasource-tool__import-source-button:disabled {
  cursor: default;
  opacity: 0.65;
}

.ce-datasource-tool__import-source-icon {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 8px;
  background: rgb(219 234 254);
}

.ce-datasource-tool__import-source-icon svg {
  width: 21px;
  height: 21px;
}

.ce-datasource-tool__import-source-label {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.35;
}

.ce-datasource-tool__import-dialog {
  width: min(100%, 520px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-datasource-tool__schema-dialog {
  width: min(100%, 760px);
}

.ce-datasource-tool__response-mock-dialog {
  width: min(100%, 760px);
}

.ce-datasource-tool__response-mock-body {
  max-height: min(620px, 70vh);
  overflow-y: auto;
}

.ce-datasource-tool__response-mock-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-datasource-tool__response-mock-row,
.ce-datasource-tool__response-mock-body-row {
  display: grid;
  grid-template-columns: minmax(160px, 0.45fr) minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__response-mock-body-row {
  grid-template-columns: minmax(140px, 0.35fr) minmax(90px, 0.2fr) minmax(0, 1fr);
}

.ce-datasource-tool__response-mock-body-error {
  grid-column: 3;
}

.ce-datasource-tool__import-dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-datasource-tool__import-dialog-panel {
  margin: 0;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__import-dialog-header,
.ce-datasource-tool__import-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
}

.ce-datasource-tool__import-dialog-header {
  border-bottom: 1px solid rgb(226 232 240);
}

.ce-datasource-tool__import-dialog-actions {
  border-top: 1px solid rgb(226 232 240);
  justify-content: flex-end;
}

.ce-datasource-tool__import-dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 650;
  line-height: 1.4;
}

.ce-datasource-tool__import-dialog-close {
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 5px 10px;
  background: rgb(255 255 255);
  color: rgb(71 85 105);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-datasource-tool__import-dialog-close:hover {
  background: rgb(248 250 252);
}

.ce-datasource-tool__import-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.ce-datasource-tool__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.ce-datasource-tool__field--wide {
  grid-column: span 2;
}

.ce-datasource-tool__label,
.ce-datasource-tool__list-title {
  margin: 0;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-datasource-tool__input,
.ce-datasource-tool__textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
}

.ce-datasource-tool__input {
  height: 36px;
  padding: 7px 10px;
}

.ce-datasource-tool__textarea {
  resize: vertical;
  padding: 9px 10px;
}

.ce-datasource-tool__textarea--schema {
  min-height: 130px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 19px;
}

.ce-datasource-tool__textarea--full-schema {
  min-height: min(520px, 65vh);
}

.ce-datasource-tool__textarea--response-example {
  min-height: 260px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 19px;
}

.ce-datasource-tool__textarea--value {
  min-height: 70px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 18px;
}

.ce-datasource-tool__input:focus,
.ce-datasource-tool__textarea:focus {
  outline: none;
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 2px rgb(37 99 235 / 0.15);
}

.ce-datasource-tool__input:read-only,
.ce-datasource-tool__textarea:read-only,
.ce-datasource-tool__input:disabled {
  background: rgb(248 250 252);
}

.ce-datasource-tool__error,
.ce-datasource-tool__body-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 13px;
}

.ce-datasource-tool__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-datasource-tool__list[open] {
  gap: 8px;
}

.ce-datasource-tool__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  list-style: none;
}

.ce-datasource-tool__list-header::-webkit-details-marker {
  display: none;
}

.ce-datasource-tool__action,
.ce-datasource-tool__remove,
.ce-datasource-tool__schema-button,
.ce-datasource-tool__full-schema-button {
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(30 64 175);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-datasource-tool__full-schema-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  padding: 5px 10px;
}

.ce-datasource-tool__full-schema-button svg {
  width: 18px;
  height: 18px;
}

.ce-datasource-tool__action {
  padding: 5px 12px;
}

.ce-datasource-tool__schema-button {
  padding: 5px 12px;
  white-space: nowrap;
}

.ce-datasource-tool__remove {
  padding: 5px 10px;
  color: rgb(185 28 28);
}

.ce-datasource-tool__action:hover,
.ce-datasource-tool__remove:hover,
.ce-datasource-tool__schema-button:hover,
.ce-datasource-tool__full-schema-button:hover {
  background: rgb(248 250 252);
}

.ce-datasource-tool__schema-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.ce-datasource-tool__full-schema-button:disabled {
  cursor: default;
  opacity: 0.55;
}

.ce-datasource-tool__action:disabled,
.ce-datasource-tool__remove:disabled {
  cursor: default;
  opacity: 0.65;
}

.ce-datasource-tool__schema-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ce-datasource-tool__selected-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid rgb(226 232 240);
}

.ce-datasource-tool__selected-fields-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ce-datasource-tool__field-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__selected-fields .ce-datasource-tool__field-list {
  grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
}

.ce-datasource-tool__field-list-summary {
  grid-column: 1 / -1;
  min-width: 0;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-datasource-tool__schema-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 7px 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__schema-field-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.ce-datasource-tool__schema-field-label {
  overflow: hidden;
  color: rgb(15 23 42);
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__schema-path {
  overflow: hidden;
  color: rgb(100 116 139);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__processor-tags {
  display: flex;
  min-width: 0;
  flex-wrap: nowrap;
  gap: 4px;
  margin-top: 3px;
  overflow: hidden;
}

.ce-datasource-tool__processor-tag {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  padding: 1px 6px;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__schema-badges {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-datasource-tool__selected-fields .ce-datasource-tool__schema-field {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}

.ce-datasource-tool__selected-fields .ce-datasource-tool__schema-badges {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid rgb(241 245 249);
}

.ce-datasource-tool__selected-field-meta,
.ce-datasource-tool__selected-field-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.ce-datasource-tool__selected-field-meta {
  overflow: hidden;
}

.ce-datasource-tool__selected-field-actions {
  display: grid;
  grid-template-columns: minmax(52px, 0.75fr) minmax(88px, 1.25fr) minmax(52px, 0.75fr);
}

.ce-datasource-tool__selected-field-actions .ce-datasource-tool__field-action {
  min-width: 0;
  padding-inline: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__schema-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 999px;
  padding: 2px 7px;
  background: rgb(239 246 255);
  color: rgb(30 64 175);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.ce-datasource-tool__schema-badge--processor {
  background: rgb(240 253 250);
  color: rgb(15 118 110);
}

.ce-datasource-tool__field-action {
  min-width: 52px;
  border: 1px solid rgb(191 219 254);
  border-radius: 6px;
  padding: 4px 9px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-datasource-tool__field-action--remove {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(220 38 38);
}

.ce-datasource-tool__field-action:disabled {
  cursor: default;
  opacity: 0.55;
}

.ce-datasource-tool__schema-tree {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__schema-node {
  display: grid;
  grid-template-columns: minmax(90px, 0.5fr) minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  min-height: 30px;
}

.ce-datasource-tool__schema-node-name {
  min-width: 0;
  color: rgb(15 23 42);
  font-size: 13px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__empty {
  margin: 0;
  border: 1px dashed rgb(203 213 225);
  border-radius: 8px;
  padding: 9px 10px;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-datasource-tool__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__body-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(110px, 0.4fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__body-error {
  grid-column: 3 / 5;
}

@media (max-width: 720px) {
  .ce-datasource-tool__trigger-row {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__summary {
    flex-direction: column;
  }

  .ce-datasource-tool__summary-item {
    width: 100%;
  }

  .ce-datasource-tool__schema-header {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__grid,
  .ce-datasource-tool__response-example-grid,
  .ce-datasource-tool__schema-filters,
  .ce-datasource-tool__import-sources,
  .ce-datasource-tool__row,
  .ce-datasource-tool__body-row,
  .ce-datasource-tool__response-mock-row,
  .ce-datasource-tool__response-mock-body-row,
  .ce-datasource-tool__schema-node {
    grid-template-columns: 1fr;
  }

  .ce-datasource-tool__field-list {
    grid-template-columns: 1fr;
  }

  .ce-datasource-tool__import-dialog-header,
  .ce-datasource-tool__import-dialog-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__field--wide {
    grid-column: auto;
  }

  .ce-datasource-tool__body-error {
    grid-column: 1;
  }
}

@media (max-width: 420px) {
  .ce-datasource-tool__selected-fields .ce-datasource-tool__schema-badges {
    grid-template-columns: minmax(0, 1fr);
  }
}

:global(.dark) .ce-datasource-tool {
  color: rgb(226 232 240);
}

:global(.dark) .ce-datasource-tool__schema-panel {
  border-top-color: rgb(51 65 85);
}

:global(.dark) .ce-datasource-tool__response-example-card {
  border-color: rgb(51 65 85);
}

:global(.dark) .ce-datasource-tool__response-example-preview {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__response-example-preview-state {
  color: rgb(148 163 184);
}

:global(.dark) .ce-datasource-tool__response-example-preview-state--error {
  color: rgb(248 113 113);
}

:global(.dark) .ce-datasource-tool__config-section {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .ce-datasource-tool__config-section-header {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__config-section-title {
  color: rgb(241 245 249);
}

:global(.dark) .ce-datasource-tool__settings-button {
  border-color: rgb(45 212 191 / 0.55);
  background: rgb(15 118 110);
  color: rgb(240 253 250);
}

:global(.dark) .ce-datasource-tool__settings-button:hover {
  background: rgb(13 148 136);
}

:global(.dark) .ce-datasource-tool__summary-item {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
  color: rgb(203 213 225);
}

:global(.dark) .ce-datasource-tool__summary-item--type {
  border-color: rgb(96 165 250 / 0.55);
  background: rgb(30 64 175 / 0.32);
  color: rgb(191 219 254);
}

:global(.dark) .ce-datasource-tool__summary-label {
  color: rgb(148 163 184);
}

:global(.dark) .ce-datasource-tool__summary-value {
  color: rgb(241 245 249);
}

:global(.dark) .ce-datasource-tool__settings-dialog-panel {
  background: rgb(15 23 42);
}

:global(.dark) .ce-datasource-tool__section-title,
:global(.dark) .ce-datasource-tool__schema-node-name {
  color: rgb(241 245 249);
}

:global(.dark) .ce-datasource-tool__section-copy,
:global(.dark) .ce-datasource-tool__schema-summary,
:global(.dark) .ce-datasource-tool__schema-path {
  color: rgb(148 163 184);
}

:global(.dark) .ce-datasource-tool__label,
:global(.dark) .ce-datasource-tool__list-title,
:global(.dark) .ce-datasource-tool__field-list-summary {
  color: rgb(203 213 225);
}

:global(.dark) .ce-datasource-tool__import-source-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(191 219 254);
}

:global(.dark) .ce-datasource-tool__import-source-button:hover {
  border-color: rgb(96 165 250 / 0.7);
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__import-source-icon {
  background: rgb(30 64 175 / 0.45);
}

:global(.dark) .ce-datasource-tool__import-dialog-panel {
  background: rgb(15 23 42);
}

:global(.dark) .ce-datasource-tool__import-dialog-header,
:global(.dark) .ce-datasource-tool__import-dialog-actions {
  border-color: rgb(51 65 85);
}

:global(.dark) .ce-datasource-tool__import-dialog-title {
  color: rgb(241 245 249);
}

:global(.dark) .ce-datasource-tool__import-dialog-close {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(203 213 225);
}

:global(.dark) .ce-datasource-tool__import-dialog-close:hover {
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__input,
:global(.dark) .ce-datasource-tool__textarea {
  border-color: rgb(71 85 105 / 0.9);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.dark) .ce-datasource-tool__input:read-only,
:global(.dark) .ce-datasource-tool__textarea:read-only,
:global(.dark) .ce-datasource-tool__input:disabled {
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__action,
:global(.dark) .ce-datasource-tool__remove,
:global(.dark) .ce-datasource-tool__schema-button,
:global(.dark) .ce-datasource-tool__full-schema-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

:global(.dark) .ce-datasource-tool__action:hover,
:global(.dark) .ce-datasource-tool__remove:hover,
:global(.dark) .ce-datasource-tool__schema-button:hover,
:global(.dark) .ce-datasource-tool__full-schema-button:hover {
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__empty {
  border-color: rgb(71 85 105);
  color: rgb(148 163 184);
}

:global(.dark) .ce-datasource-tool__schema-field,
:global(.dark) .ce-datasource-tool__schema-tree {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .ce-datasource-tool__selected-fields {
  border-color: rgb(51 65 85);
}

:global(.dark) .ce-datasource-tool__selected-fields .ce-datasource-tool__schema-badges {
  border-top-color: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__field-action {
  border-color: rgb(30 64 175);
  background: rgb(30 64 175 / 0.25);
  color: rgb(191 219 254);
}

:global(.dark) .ce-datasource-tool__field-action--remove {
  border-color: rgb(153 27 27);
  background: rgb(127 29 29 / 0.25);
  color: rgb(254 202 202);
}

:global(.dark) .ce-datasource-tool__schema-field-label {
  color: rgb(226 232 240);
}

:global(.dark) .ce-datasource-tool__schema-badge {
  background: rgb(30 64 175 / 0.34);
  color: rgb(191 219 254);
}

:global(.dark) .ce-datasource-tool__processor-tag,
:global(.dark) .ce-datasource-tool__schema-badge--processor {
  background: rgb(13 148 136 / 0.25);
  color: rgb(153 246 228);
}

:global(.dark) .ce-datasource-tool__error,
:global(.dark) .ce-datasource-tool__body-error {
  color: rgb(248 113 113);
}
</style>
