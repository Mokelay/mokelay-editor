<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import {
  cloneJsonSchema,
  cloneJsonValue,
  flattenSchemaTree,
  getArrayRecordOptions,
  getSchemaTreeNodes,
  isJsonObjectValue,
  isJsonValue,
  normalizeJSONSchema,
  normalizeSchemaSelections,
  reconcileSchemaSelections,
  type DatasourceSchemaSelections,
  type JSONSchema,
  type JsonValue,
  type SchemaSelectionField,
  type SchemaTreeNode
} from '@/utils/datasourceSchema';
import {
  $schema as resolveDatasourceSchema,
  DatasourceError,
  bodyDataTypes,
  getDefaultApiDatasource,
  getDefaultBodyMock,
  getDefaultDatasource,
  normalizeBodyDataType,
  normalizeBodyMock,
  normalizeDatasource,
  normalizeJsonValue,
  normalizeMethod,
  type MDatasourceApiObject,
  type MDatasourceBodyDataType,
  type MDatasourceBodyItem,
  type MDatasourceJsonObject,
  type MDatasourceKeyMockItem,
  type MDatasourceObject,
  type MDatasourceType
} from '@/utils/datasource';

export type {
  DatasourceSchemaSelections,
  JSONSchema,
  JsonValue,
  MDatasourceApiMethod,
  MDatasourceApiObject,
  MDatasourceBodyDataType,
  MDatasourceBodyItem,
  MDatasourceJsonObject,
  MDatasourceKeyMockItem,
  MDatasourceObject,
  MDatasourceType
} from '@/utils/datasource';
export { normalizeDatasource } from '@/utils/datasource';
export type { SchemaSelectionField } from '@/utils/datasourceSchema';

export interface MDatasourceEditorProps {
  edit: boolean;
  value?: MDatasourceObject;
}

export const mDatasourceEditorTool = defineEditorTool<MDatasourceEditorProps>({
  toolbox: {
    get title() {
      return i18n.t('datasource.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="6" rx="7" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12c1.1.5 2.5.8 4 .8s2.9-.3 4-.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  createInitialProps: () => ({
    value: getDefaultDatasource()
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeDatasource(props.value)
  }),
  serialize: (props) => ({
    value: normalizeDatasource(props.value)
  })
});
</script>

<script setup lang="ts">
import { computed, reactive, ref, shallowRef, watch } from 'vue';
import { useI18n } from '@/i18n';

type KeyMockListName = 'headerData' | 'queryData';
type BodyMockParseResult = {
  ok: true;
  value: JsonValue;
} | {
  ok: false;
  error: string;
};
type ApiStateBodyItem = Omit<MDatasourceBodyItem, 'mock'> & {
  mock: unknown;
};
type ApiState = Omit<MDatasourceApiObject, 'bodyData' | 'jsonSchema' | 'schemaSelections'> & {
  bodyData: ApiStateBodyItem[];
};
type SchemaTab = 'list' | 'form' | 'advanced';

const props = defineProps<MDatasourceEditorProps & {
  onChange?: (payload: MDatasourceEditorProps) => void;
  onToolChange?: (payload: MDatasourceEditorProps) => void;
}>();

const { t } = useI18n();
const normalizedInitialValue = normalizeDatasource(props.value);
const bodyDataTypeOptions = bodyDataTypes;
const currentType = ref<MDatasourceType>(normalizedInitialValue.type);
const jsonValue = shallowRef<JsonValue>(normalizedInitialValue.type === 'JSON' ? normalizedInitialValue.rawData : {});
const jsonText = ref(formatJsonValue(jsonValue.value));
const jsonError = ref('');
const jsonSchemaValue = shallowRef<JSONSchema | undefined>(normalizedInitialValue.jsonSchema);
const jsonSchemaText = ref(formatJsonSchema(jsonSchemaValue.value));
const jsonSchemaError = ref('');
const jsonSchemaLoading = ref(false);
const schemaSelectionsValue = shallowRef<DatasourceSchemaSelections | undefined>(normalizedInitialValue.schemaSelections);
const schemaTab = ref<SchemaTab>('list');
const schemaSearch = ref('');
const apiState = reactive<ApiState>(
  normalizedInitialValue.type === 'API' ? normalizedInitialValue : getDefaultApiDatasource()
);
const bodyMockInputs = ref<string[]>(apiState.bodyData.map((item) => getBodyMockInputValue(item)));
const bodyMockErrors = ref<string[]>(apiState.bodyData.map(() => ''));
const isReadOnly = computed(() => !props.edit);
const schemaTree = computed(() => getSchemaTreeNodes(jsonSchemaValue.value));
const flattenedSchemaNodes = computed(() => flattenSchemaTree(schemaTree.value));
const listRecordOptions = computed(() => getArrayRecordOptions(jsonSchemaValue.value));
const listSelectionFields = computed(() => schemaSelectionsValue.value?.list?.fields ?? []);
const formSelectionFields = computed(() => schemaSelectionsValue.value?.form?.fields ?? []);
const visibleSchemaNodes = computed(() => filterSchemaNodes(flattenedSchemaNodes.value, schemaSearch.value));
const visibleListSelectionFields = computed(() => filterSelectionFields(listSelectionFields.value, schemaSearch.value));
const visibleFormSelectionFields = computed(() => filterSelectionFields(formSelectionFields.value, schemaSearch.value));
const selectedListRecordPath = computed(() => schemaSelectionsValue.value?.list?.recordPath ?? '');
const enabledListFieldCount = computed(() => listSelectionFields.value.filter((field) => field.enabled).length);
const enabledFormFieldCount = computed(() => formSelectionFields.value.filter((field) => field.enabled).length);

function formatJsonValue(value: JsonValue) {
  return JSON.stringify(value, null, 2);
}

function formatJsonSchema(value?: JSONSchema) {
  return value ? JSON.stringify(value, null, 2) : '';
}

function getSchemaTypeLabel(type: SchemaTreeNode['type'] | SchemaSelectionField['type']) {
  return t(`datasource.schemaTypes.${type}`);
}

function getComponentHintLabel(hint: SchemaSelectionField['componentHint']) {
  return t(`datasource.componentHints.${hint}`);
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function filterSchemaNodes(nodes: SchemaTreeNode[], searchValue: string) {
  const normalizedSearchValue = normalizeSearchValue(searchValue);
  if (!normalizedSearchValue) {
    return nodes;
  }

  return nodes.filter((node) =>
    node.name.toLowerCase().includes(normalizedSearchValue) ||
    node.displayPath.toLowerCase().includes(normalizedSearchValue)
  );
}

function filterSelectionFields(fields: SchemaSelectionField[], searchValue: string) {
  const normalizedSearchValue = normalizeSearchValue(searchValue);
  if (!normalizedSearchValue) {
    return fields;
  }

  return fields.filter((field) =>
    field.label.toLowerCase().includes(normalizedSearchValue) ||
    field.path.toLowerCase().includes(normalizedSearchValue)
  );
}

function getSchemaNodeTestIdPath(path: string) {
  return path || 'root';
}

function getRecordPathLabel(path: string) {
  if (!path) {
    return t('datasource.fields.rootRecordPath');
  }

  return `${path}[]`;
}

function getDatasourcePayload(value: MDatasourceObject): MDatasourceEditorProps {
  return {
    edit: props.edit,
    value: normalizeDatasource(value)
  };
}

function emitDatasource(value: MDatasourceObject) {
  if (!props.edit) return;

  const payload = getDatasourcePayload(value);
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function buildJsonDatasource(): MDatasourceJsonObject {
  return normalizeDatasource({
    type: 'JSON',
    rawData: normalizeJsonValue(jsonValue.value, {}),
    jsonSchema: jsonSchemaValue.value,
    schemaSelections: schemaSelectionsValue.value
  }) as MDatasourceJsonObject;
}

function buildApiDatasource(): MDatasourceApiObject {
  return normalizeDatasource({
    type: 'API',
    domain: apiState.domain,
    path: apiState.path,
    method: apiState.method,
    headerData: apiState.headerData,
    bodyData: apiState.bodyData,
    queryData: apiState.queryData,
    jsonSchema: jsonSchemaValue.value,
    schemaSelections: schemaSelectionsValue.value
  }) as MDatasourceApiObject;
}

function emitCurrentDatasource() {
  emitDatasource(currentType.value === 'JSON' ? buildJsonDatasource() : buildApiDatasource());
}

function emitApiChange() {
  emitDatasource(buildApiDatasource());
}

function syncBodyMockInputs() {
  bodyMockInputs.value = apiState.bodyData.map((item) => getBodyMockInputValue(item));
  bodyMockErrors.value = apiState.bodyData.map(() => '');
}

function syncJsonSchemaState(value?: JSONSchema, selections?: DatasourceSchemaSelections) {
  jsonSchemaValue.value = value ? cloneJsonSchema(value) : undefined;
  jsonSchemaText.value = formatJsonSchema(jsonSchemaValue.value);
  schemaSelectionsValue.value = normalizeSchemaSelections(selections, jsonSchemaValue.value);
  jsonSchemaError.value = '';
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
      mock: normalizeBodyMock(item.dataType, item.mock)
    })),
    queryData: value.queryData.map((item) => ({ ...item }))
  });
  syncBodyMockInputs();
}

function syncLocalState(value: unknown) {
  const normalized = normalizeDatasource(value);
  currentType.value = normalized.type;
  syncJsonSchemaState(normalized.jsonSchema, normalized.schemaSelections);

  if (normalized.type === 'JSON') {
    jsonValue.value = normalized.rawData;
    jsonText.value = formatJsonValue(normalized.rawData);
    jsonError.value = '';
    return;
  }

  syncApiState(normalized);
}

function setDatasourceType(type: MDatasourceType) {
  if (!props.edit || currentType.value === type) return;

  currentType.value = type;
  if (type === 'JSON') {
    emitDatasource(buildJsonDatasource());
    return;
  }

  emitApiChange();
}

function handleJsonInput(event: Event) {
  if (!props.edit) return;

  const nextText = (event.target as HTMLTextAreaElement).value;
  jsonText.value = nextText;

  try {
    const parsed = JSON.parse(nextText) as unknown;
    if (!isJsonValue(parsed)) {
      throw new Error('Invalid JSON value.');
    }

    jsonValue.value = cloneJsonValue(parsed);
    jsonError.value = '';
    emitDatasource(buildJsonDatasource());
  } catch {
    jsonError.value = t('datasource.validation.invalidJson');
  }
}

function handleJsonSchemaInput(event: Event) {
  if (!props.edit) return;

  const nextText = (event.target as HTMLTextAreaElement).value;
  jsonSchemaText.value = nextText;

  if (!nextText.trim()) {
    jsonSchemaValue.value = undefined;
    schemaSelectionsValue.value = undefined;
    jsonSchemaError.value = '';
    emitCurrentDatasource();
    return;
  }

  try {
    const parsed = JSON.parse(nextText) as unknown;
    const normalizedSchema = normalizeJSONSchema(parsed);
    if (!normalizedSchema) {
      throw new Error('Invalid JSON Schema.');
    }

    jsonSchemaValue.value = normalizedSchema;
    schemaSelectionsValue.value = reconcileSchemaSelections(normalizedSchema, schemaSelectionsValue.value);
    jsonSchemaError.value = '';
    emitCurrentDatasource();
  } catch {
    jsonSchemaError.value = t('datasource.validation.invalidJsonSchema');
  }
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

function getKeyMockList(listName: KeyMockListName) {
  return apiState[listName];
}

function addKeyMockItem(listName: KeyMockListName) {
  if (!props.edit) return;

  apiState[listName].push({
    key: '',
    mock: ''
  });
  emitApiChange();
}

function updateKeyMockItem(
  listName: KeyMockListName,
  index: number,
  field: keyof MDatasourceKeyMockItem,
  value: string
) {
  if (!props.edit) return;

  const item = apiState[listName][index];
  if (!item) return;

  item[field] = value;
  emitApiChange();
}

function removeKeyMockItem(listName: KeyMockListName, index: number) {
  if (!props.edit) return;

  apiState[listName].splice(index, 1);
  emitApiChange();
}

function addBodyItem() {
  if (!props.edit) return;

  const item: ApiStateBodyItem = {
    key: '',
    dataType: 'string',
    mock: ''
  };
  apiState.bodyData.push(item);
  bodyMockInputs.value.push(getBodyMockInputValue(item));
  bodyMockErrors.value.push('');
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
  item.mock = getDefaultBodyMock(item.dataType);
  bodyMockInputs.value[index] = getBodyMockInputValue(item);
  bodyMockErrors.value[index] = '';
  emitApiChange();
}

function updateBodyMock(index: number, inputValue: string) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  bodyMockInputs.value[index] = inputValue;
  const parsed = parseBodyMock(item.dataType, inputValue);
  if (!parsed.ok) {
    bodyMockErrors.value[index] = parsed.error;
    return;
  }

  item.mock = parsed.value;
  bodyMockErrors.value[index] = '';
  emitApiChange();
}

function removeBodyItem(index: number) {
  if (!props.edit) return;

  apiState.bodyData.splice(index, 1);
  bodyMockInputs.value.splice(index, 1);
  bodyMockErrors.value.splice(index, 1);
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

function applyGeneratedJsonSchema(schema: JSONSchema) {
  jsonSchemaValue.value = cloneJsonSchema(schema);
  jsonSchemaText.value = formatJsonSchema(jsonSchemaValue.value);
  schemaSelectionsValue.value = reconcileSchemaSelections(jsonSchemaValue.value, schemaSelectionsValue.value);
  jsonSchemaError.value = '';
  emitCurrentDatasource();
}

function updateListRecordPath(recordPath: string) {
  if (!props.edit || !jsonSchemaValue.value) return;

  schemaSelectionsValue.value = reconcileSchemaSelections(jsonSchemaValue.value, {
    ...schemaSelectionsValue.value,
    list: {
      recordPath,
      fields: schemaSelectionsValue.value?.list?.fields ?? []
    }
  });
  emitCurrentDatasource();
}

function updateSelectionField(
  selectionType: 'list' | 'form',
  path: string,
  changes: Partial<Pick<SchemaSelectionField, 'enabled' | 'label'>>
) {
  if (!props.edit) return;

  const currentSelections = normalizeSchemaSelections(schemaSelectionsValue.value, jsonSchemaValue.value);
  const fields = selectionType === 'list'
    ? currentSelections?.list?.fields
    : currentSelections?.form?.fields;

  if (!fields) return;

  const nextFields = fields.map((field) =>
    field.path === path
      ? {
          ...field,
          ...changes,
          label: changes.label !== undefined ? changes.label : field.label
        }
      : field
  );

  schemaSelectionsValue.value = {
    ...currentSelections,
    ...(selectionType === 'list' && currentSelections?.list
      ? {
          list: {
            ...currentSelections.list,
            fields: nextFields
          }
        }
      : {}),
    ...(selectionType === 'form'
      ? {
          form: {
            fields: nextFields
          }
        }
      : {})
  };
  emitCurrentDatasource();
}

function updateSelectionLabel(selectionType: 'list' | 'form', path: string, value: string) {
  updateSelectionField(selectionType, path, {
    label: value.trim() || path
  });
}

function updateSelectionEnabled(selectionType: 'list' | 'form', path: string, enabled: boolean) {
  updateSelectionField(selectionType, path, {
    enabled
  });
}

async function parseJsonSchema() {
  if (!props.edit || jsonSchemaLoading.value) return;

  jsonSchemaError.value = '';

  if (currentType.value === 'JSON') {
    if (jsonError.value) {
      jsonSchemaError.value = t('datasource.validation.fixJsonBeforeSchema');
      return;
    }

  } else {
    const invalidBodyIndex = bodyMockErrors.value.findIndex((error) => Boolean(error));
    if (invalidBodyIndex >= 0) {
      jsonSchemaError.value = t('datasource.validation.fixBodyBeforeSchema');
      return;
    }
  }

  jsonSchemaLoading.value = true;

  try {
    const schema = await resolveDatasourceSchema(currentType.value === 'JSON' ? buildJsonDatasource() : buildApiDatasource());
    applyGeneratedJsonSchema(schema);
  } catch (error) {
    jsonSchemaError.value = getDatasourceErrorMessage(error);
  } finally {
    jsonSchemaLoading.value = false;
  }
}

function parseBodyMock(dataType: MDatasourceBodyDataType, inputValue: string): BodyMockParseResult {
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

function getBodyMockInputValue(item: ApiStateBodyItem) {
  const normalizedMock = normalizeBodyMock(item.dataType, item.mock);
  if (item.dataType === 'object' || item.dataType === 'array') {
    return formatJsonValue(normalizedMock);
  }

  if (item.dataType === 'null') {
    return 'null';
  }

  return String(normalizedMock);
}

watch(
  () => props.value,
  (value) => {
    syncLocalState(value);
  },
  { deep: true }
);
</script>

<template>
  <div class="ce-datasource-tool" data-testid="editor-datasource-tool">
    <div class="ce-datasource-tool__header">
      <div class="ce-datasource-tool__title">{{ t('datasource.title') }}</div>
      <div class="ce-datasource-tool__type-switch" :aria-label="t('datasource.fields.type')">
        <button
          type="button"
          class="ce-datasource-tool__type-button"
          :class="{ 'ce-datasource-tool__type-button--active': currentType === 'JSON' }"
          :disabled="isReadOnly"
          data-testid="datasource-type-json"
          @click="setDatasourceType('JSON')"
        >
          JSON
        </button>
        <button
          type="button"
          class="ce-datasource-tool__type-button"
          :class="{ 'ce-datasource-tool__type-button--active': currentType === 'API' }"
          :disabled="isReadOnly"
          data-testid="datasource-type-api"
          @click="setDatasourceType('API')"
        >
          API
        </button>
      </div>
    </div>

    <div v-if="currentType === 'JSON'" class="ce-datasource-tool__panel" data-testid="datasource-json-panel">
      <label class="ce-datasource-tool__field">
        <span class="ce-datasource-tool__label">{{ t('datasource.fields.rawData') }}</span>
        <textarea
          class="ce-datasource-tool__textarea ce-datasource-tool__textarea--json"
          data-testid="datasource-raw-data"
          spellcheck="false"
          :readonly="isReadOnly"
          :value="jsonText"
          @input="handleJsonInput"
          @keydown.stop
        ></textarea>
      </label>
      <p v-if="jsonError" class="ce-datasource-tool__error" data-testid="datasource-json-error">
        {{ jsonError }}
      </p>
    </div>

    <div v-else class="ce-datasource-tool__panel" data-testid="datasource-api-panel">
      <div class="ce-datasource-tool__grid">
        <label class="ce-datasource-tool__field">
          <span class="ce-datasource-tool__label">{{ t('datasource.fields.domain') }}</span>
          <input
            class="ce-datasource-tool__input"
            data-testid="datasource-domain"
            type="text"
            :readonly="isReadOnly"
            :value="apiState.domain"
            @input="updateApiField('domain', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
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
            @click.stop.prevent="addKeyMockItem('headerData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!getKeyMockList('headerData').length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(item, index) in getKeyMockList('headerData')"
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
            @input="updateKeyMockItem('headerData', index, 'key', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <input
            class="ce-datasource-tool__input"
            :data-testid="`datasource-header-mock-${index}`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.mock')"
            :value="item.mock"
            @input="updateKeyMockItem('headerData', index, 'mock', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="`datasource-header-remove-${index}`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeKeyMockItem('headerData', index)"
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
            @click.stop.prevent="addKeyMockItem('queryData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!getKeyMockList('queryData').length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(item, index) in getKeyMockList('queryData')"
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
            @input="updateKeyMockItem('queryData', index, 'key', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <input
            class="ce-datasource-tool__input"
            :data-testid="`datasource-query-mock-${index}`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.mock')"
            :value="item.mock"
            @input="updateKeyMockItem('queryData', index, 'mock', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="`datasource-query-remove-${index}`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeKeyMockItem('queryData', index)"
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
            :data-testid="`datasource-body-mock-${index}`"
            :disabled="isReadOnly"
            :value="String(body.mock === true)"
            @change="updateBodyMock(index, ($event.target as HTMLSelectElement).value)"
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
          <input
            v-else-if="body.dataType === 'null'"
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-mock-${index}`"
            type="text"
            readonly
            value="null"
          />
          <textarea
            v-else-if="body.dataType === 'object' || body.dataType === 'array'"
            class="ce-datasource-tool__textarea ce-datasource-tool__textarea--mock"
            :data-testid="`datasource-body-mock-${index}`"
            spellcheck="false"
            :readonly="isReadOnly"
            :value="bodyMockInputs[index] ?? getBodyMockInputValue(body)"
            @input="updateBodyMock(index, ($event.target as HTMLTextAreaElement).value)"
            @keydown.stop
          ></textarea>
          <input
            v-else
            class="ce-datasource-tool__input"
            :data-testid="`datasource-body-mock-${index}`"
            :type="body.dataType === 'number' ? 'number' : 'text'"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.mock')"
            :value="bodyMockInputs[index] ?? getBodyMockInputValue(body)"
            @input="updateBodyMock(index, ($event.target as HTMLInputElement).value)"
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
          <p v-if="bodyMockErrors[index]" class="ce-datasource-tool__body-error" :data-testid="`datasource-body-error-${index}`">
            {{ bodyMockErrors[index] }}
          </p>
        </div>
      </details>

    </div>

    <div class="ce-datasource-tool__generate-panel" data-testid="datasource-schema-generate-panel">
      <div>
        <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.generateFields') }}</div>
        <p class="ce-datasource-tool__section-copy">{{ t('datasource.help.generateFields') }}</p>
      </div>
      <div class="ce-datasource-tool__generate-actions">
        <button
          v-if="edit"
          class="ce-datasource-tool__schema-button"
          type="button"
          data-testid="datasource-json-schema-parse-button"
          :disabled="jsonSchemaLoading"
          @click="parseJsonSchema"
        >
          {{ jsonSchemaLoading ? t('datasource.actions.generatingFields') : t('datasource.actions.generateFields') }}
        </button>
        <span v-if="jsonSchemaValue" class="ce-datasource-tool__schema-summary" data-testid="datasource-schema-summary">
          {{ t('datasource.fields.generatedFields') }}: {{ flattenedSchemaNodes.length }}
        </span>
      </div>
      <p v-if="jsonSchemaError" class="ce-datasource-tool__error" data-testid="datasource-json-schema-error">
        {{ jsonSchemaError }}
      </p>
    </div>

    <div class="ce-datasource-tool__schema-panel" data-testid="datasource-json-schema-panel">
      <div class="ce-datasource-tool__schema-header">
        <div>
          <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.fieldSelection') }}</div>
          <p class="ce-datasource-tool__section-copy">{{ t('datasource.help.fieldSelection') }}</p>
        </div>
        <input
          v-if="jsonSchemaValue"
          class="ce-datasource-tool__input ce-datasource-tool__schema-search"
          data-testid="datasource-schema-search"
          type="search"
          :placeholder="t('datasource.fields.searchFields')"
          :value="schemaSearch"
          @input="schemaSearch = ($event.target as HTMLInputElement).value"
          @keydown.stop
        />
      </div>

      <div class="ce-datasource-tool__tabs" data-testid="datasource-schema-tabs">
        <button
          type="button"
          class="ce-datasource-tool__tab"
          :class="{ 'ce-datasource-tool__tab--active': schemaTab === 'list' }"
          data-testid="datasource-schema-tab-list"
          @click="schemaTab = 'list'"
        >
          {{ t('datasource.tabs.list') }}
        </button>
        <button
          type="button"
          class="ce-datasource-tool__tab"
          :class="{ 'ce-datasource-tool__tab--active': schemaTab === 'form' }"
          data-testid="datasource-schema-tab-form"
          @click="schemaTab = 'form'"
        >
          {{ t('datasource.tabs.form') }}
        </button>
        <button
          type="button"
          class="ce-datasource-tool__tab"
          :class="{ 'ce-datasource-tool__tab--active': schemaTab === 'advanced' }"
          data-testid="datasource-schema-tab-advanced"
          @click="schemaTab = 'advanced'"
        >
          {{ t('datasource.tabs.advanced') }}
        </button>
      </div>

        <div v-if="schemaTab === 'list'" class="ce-datasource-tool__schema-tab-panel" data-testid="datasource-list-schema-panel">
          <p v-if="!jsonSchemaValue" class="ce-datasource-tool__empty" data-testid="datasource-schema-empty">
            {{ t('datasource.emptySchema') }}
          </p>
          <label v-else-if="listRecordOptions.length" class="ce-datasource-tool__field">
            <span class="ce-datasource-tool__label">{{ t('datasource.fields.recordPath') }}</span>
            <select
              class="ce-datasource-tool__input"
              data-testid="datasource-list-record-path"
              :disabled="isReadOnly"
              :value="selectedListRecordPath"
              @change="updateListRecordPath(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="option in listRecordOptions" :key="option.path || 'root'" :value="option.path">
                {{ getRecordPathLabel(option.path) }}
              </option>
            </select>
          </label>
          <p v-else class="ce-datasource-tool__empty" data-testid="datasource-list-schema-empty">
            {{ t('datasource.noListRecord') }}
          </p>

          <div v-if="visibleListSelectionFields.length" class="ce-datasource-tool__field-list" data-testid="datasource-list-fields">
            <div class="ce-datasource-tool__field-list-summary">
              {{ t('datasource.fields.selectedFields') }}: {{ enabledListFieldCount }}
            </div>
            <label
              v-for="field in visibleListSelectionFields"
              :key="field.path"
              class="ce-datasource-tool__schema-field"
              :data-testid="`datasource-list-field-${field.path}`"
            >
              <input
                class="ce-datasource-tool__checkbox"
                type="checkbox"
                :disabled="isReadOnly"
                :checked="field.enabled"
                :data-testid="`datasource-list-field-enabled-${field.path}`"
                @change="updateSelectionEnabled('list', field.path, ($event.target as HTMLInputElement).checked)"
              />
              <span class="ce-datasource-tool__schema-field-main">
                <input
                  class="ce-datasource-tool__input ce-datasource-tool__field-label-input"
                  type="text"
                  :readonly="isReadOnly"
                  :value="field.label"
                  :data-testid="`datasource-list-field-label-${field.path}`"
                  @input="updateSelectionLabel('list', field.path, ($event.target as HTMLInputElement).value)"
                  @keydown.stop
                />
                <span class="ce-datasource-tool__schema-path">{{ field.path }}</span>
              </span>
              <span class="ce-datasource-tool__schema-badges">
                <span class="ce-datasource-tool__schema-badge">{{ getSchemaTypeLabel(field.type) }}</span>
                <span class="ce-datasource-tool__schema-badge">{{ getComponentHintLabel(field.componentHint) }}</span>
                <span v-if="field.required" class="ce-datasource-tool__schema-badge ce-datasource-tool__schema-badge--required">
                  {{ t('datasource.fields.required') }}
                </span>
              </span>
            </label>
          </div>
        </div>

        <div v-else-if="schemaTab === 'form'" class="ce-datasource-tool__schema-tab-panel" data-testid="datasource-form-schema-panel">
          <div v-if="visibleFormSelectionFields.length" class="ce-datasource-tool__field-list" data-testid="datasource-form-fields">
            <div class="ce-datasource-tool__field-list-summary">
              {{ t('datasource.fields.selectedFields') }}: {{ enabledFormFieldCount }}
            </div>
            <label
              v-for="field in visibleFormSelectionFields"
              :key="field.path"
              class="ce-datasource-tool__schema-field"
              :data-testid="`datasource-form-field-${field.path}`"
            >
              <input
                class="ce-datasource-tool__checkbox"
                type="checkbox"
                :disabled="isReadOnly"
                :checked="field.enabled"
                :data-testid="`datasource-form-field-enabled-${field.path}`"
                @change="updateSelectionEnabled('form', field.path, ($event.target as HTMLInputElement).checked)"
              />
              <span class="ce-datasource-tool__schema-field-main">
                <input
                  class="ce-datasource-tool__input ce-datasource-tool__field-label-input"
                  type="text"
                  :readonly="isReadOnly"
                  :value="field.label"
                  :data-testid="`datasource-form-field-label-${field.path}`"
                  @input="updateSelectionLabel('form', field.path, ($event.target as HTMLInputElement).value)"
                  @keydown.stop
                />
                <span class="ce-datasource-tool__schema-path">{{ field.path }}</span>
              </span>
              <span class="ce-datasource-tool__schema-badges">
                <span class="ce-datasource-tool__schema-badge">{{ getSchemaTypeLabel(field.type) }}</span>
                <span class="ce-datasource-tool__schema-badge">{{ getComponentHintLabel(field.componentHint) }}</span>
                <span v-if="field.required" class="ce-datasource-tool__schema-badge ce-datasource-tool__schema-badge--required">
                  {{ t('datasource.fields.required') }}
                </span>
              </span>
            </label>
          </div>
          <p v-else class="ce-datasource-tool__empty" data-testid="datasource-form-schema-empty">
            {{ t('datasource.noFormFields') }}
          </p>
        </div>

        <div v-else class="ce-datasource-tool__schema-tab-panel" data-testid="datasource-advanced-schema-panel">
          <div v-if="jsonSchemaValue" class="ce-datasource-tool__schema-tree" data-testid="datasource-schema-tree">
            <div
              v-for="node in visibleSchemaNodes"
              :key="node.path || 'root'"
              class="ce-datasource-tool__schema-node"
              :style="{ paddingLeft: `${node.depth * 18}px` }"
              :data-testid="`datasource-schema-node-${getSchemaNodeTestIdPath(node.path)}`"
            >
              <span class="ce-datasource-tool__schema-node-name">{{ node.name }}</span>
              <span class="ce-datasource-tool__schema-path">{{ node.displayPath }}</span>
              <span class="ce-datasource-tool__schema-badge">{{ getSchemaTypeLabel(node.type) }}</span>
              <span v-if="node.required" class="ce-datasource-tool__schema-badge ce-datasource-tool__schema-badge--required">
                {{ t('datasource.fields.required') }}
              </span>
            </div>
          </div>
          <label class="ce-datasource-tool__field">
            <span class="ce-datasource-tool__label">{{ t('datasource.fields.jsonSchema') }}</span>
            <textarea
              class="ce-datasource-tool__textarea ce-datasource-tool__textarea--schema"
              data-testid="datasource-json-schema"
              spellcheck="false"
              :readonly="isReadOnly"
              :value="jsonSchemaText"
              @input="handleJsonSchemaInput"
              @keydown.stop
            ></textarea>
          </label>
        </div>
    </div>
  </div>
</template>

<style scoped>
.ce-datasource-tool {
  width: 100%;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-datasource-tool__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid rgb(226 232 240);
}

.ce-datasource-tool__title {
  font-size: 15px;
  font-weight: 650;
  color: rgb(15 23 42);
}

.ce-datasource-tool__type-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(64px, 1fr));
  overflow: hidden;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__type-button {
  min-height: 32px;
  border: 0;
  border-right: 1px solid rgb(203 213 225);
  padding: 6px 12px;
  background: transparent;
  color: rgb(71 85 105);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.ce-datasource-tool__type-button:last-child {
  border-right: 0;
}

.ce-datasource-tool__type-button--active {
  background: rgb(37 99 235);
  color: rgb(255 255 255);
}

.ce-datasource-tool__type-button:disabled {
  cursor: default;
}

.ce-datasource-tool__panel {
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
  padding: 12px;
}

.ce-datasource-tool__generate-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid rgb(226 232 240);
  padding: 12px;
  background: rgb(248 250 252);
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

.ce-datasource-tool__schema-search {
  max-width: 260px;
}

.ce-datasource-tool__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 0.4fr);
  gap: 10px;
}

.ce-datasource-tool__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
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

.ce-datasource-tool__textarea--json {
  min-height: 150px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 19px;
}

.ce-datasource-tool__textarea--schema {
  min-height: 130px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 19px;
}

.ce-datasource-tool__textarea--mock {
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
.ce-datasource-tool__schema-button {
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(30 64 175);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
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
.ce-datasource-tool__schema-button:hover {
  background: rgb(248 250 252);
}

.ce-datasource-tool__schema-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.ce-datasource-tool__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__tab {
  min-height: 34px;
  border: 0;
  border-right: 1px solid rgb(203 213 225);
  padding: 6px 10px;
  background: transparent;
  color: rgb(71 85 105);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-datasource-tool__tab:last-child {
  border-right: 0;
}

.ce-datasource-tool__tab--active {
  background: rgb(37 99 235);
  color: rgb(255 255 255);
}

.ce-datasource-tool__schema-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ce-datasource-tool__field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-datasource-tool__field-list-summary {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-datasource-tool__schema-field {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: rgb(37 99 235);
}

.ce-datasource-tool__schema-field-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.ce-datasource-tool__field-label-input {
  height: 32px;
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

.ce-datasource-tool__schema-badges {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-datasource-tool__schema-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 999px;
  padding: 3px 8px;
  background: rgb(239 246 255);
  color: rgb(30 64 175);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.ce-datasource-tool__schema-badge--required {
  background: rgb(254 242 242);
  color: rgb(185 28 28);
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
  .ce-datasource-tool__header {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__schema-header {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__schema-search {
    max-width: none;
  }

  .ce-datasource-tool__grid,
  .ce-datasource-tool__row,
  .ce-datasource-tool__body-row,
  .ce-datasource-tool__schema-field,
  .ce-datasource-tool__schema-node {
    grid-template-columns: 1fr;
  }

  .ce-datasource-tool__body-error {
    grid-column: 1;
  }
}

:global(.dark) .ce-datasource-tool {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.dark) .ce-datasource-tool__header {
  border-bottom-color: rgb(51 65 85);
}

:global(.dark) .ce-datasource-tool__schema-panel {
  border-top-color: rgb(51 65 85);
}

:global(.dark) .ce-datasource-tool__generate-panel {
  border-top-color: rgb(51 65 85);
  background: rgb(30 41 59 / 0.45);
}

:global(.dark) .ce-datasource-tool__title {
  color: rgb(241 245 249);
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

:global(.dark) .ce-datasource-tool__type-switch {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__type-button {
  border-right-color: rgb(71 85 105);
  color: rgb(203 213 225);
}

:global(.dark) .ce-datasource-tool__type-button--active {
  background: rgb(59 130 246);
  color: rgb(255 255 255);
}

:global(.dark) .ce-datasource-tool__tabs {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__tab {
  border-right-color: rgb(71 85 105);
  color: rgb(203 213 225);
}

:global(.dark) .ce-datasource-tool__tab--active {
  background: rgb(59 130 246);
  color: rgb(255 255 255);
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
:global(.dark) .ce-datasource-tool__schema-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

:global(.dark) .ce-datasource-tool__action:hover,
:global(.dark) .ce-datasource-tool__remove:hover,
:global(.dark) .ce-datasource-tool__schema-button:hover {
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

:global(.dark) .ce-datasource-tool__schema-badge {
  background: rgb(30 64 175 / 0.34);
  color: rgb(191 219 254);
}

:global(.dark) .ce-datasource-tool__schema-badge--required {
  background: rgb(127 29 29 / 0.35);
  color: rgb(254 202 202);
}

:global(.dark) .ce-datasource-tool__error,
:global(.dark) .ce-datasource-tool__body-error {
  color: rgb(248 113 113);
}
</style>
