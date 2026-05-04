<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type MDatasourceType = 'JSON' | 'API';
export type MDatasourceApiMethod = 'GET' | 'POST';
export type MDatasourceBodyDataType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface MDatasourceKeyMockItem {
  key: string;
  mock: string;
}

export interface MDatasourceBodyItem {
  key: string;
  dataType: MDatasourceBodyDataType;
  mock: JsonValue;
}

export interface MDatasourceJsonObject {
  type: 'JSON';
  rawData: JsonValue;
}

export interface MDatasourceApiObject {
  type: 'API';
  domain: string;
  path: string;
  method: MDatasourceApiMethod;
  headerData: MDatasourceKeyMockItem[];
  bodyData: MDatasourceBodyItem[];
  queryData: MDatasourceKeyMockItem[];
}

export type MDatasourceObject = MDatasourceJsonObject | MDatasourceApiObject;

export interface MDatasourceEditorProps {
  edit: boolean;
  value?: MDatasourceObject;
}

const bodyDataTypes = ['string', 'number', 'boolean', 'null', 'object', 'array'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item));
  }

  if (isRecord(value)) {
    return Object.values(value).every((item) => isJsonValue(item));
  }

  return false;
}

function isJsonObjectValue(value: unknown): value is { [key: string]: JsonValue } {
  return isRecord(value) && isJsonValue(value);
}

function cloneJsonValue<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeMethod(value: unknown): MDatasourceApiMethod {
  return value === 'POST' ? 'POST' : 'GET';
}

function normalizeBodyDataType(value: unknown): MDatasourceBodyDataType {
  return bodyDataTypes.includes(value as MDatasourceBodyDataType)
    ? value as MDatasourceBodyDataType
    : 'string';
}

function normalizeJsonValue(value: unknown, fallback: JsonValue = {}) {
  return isJsonValue(value) ? cloneJsonValue(value) : fallback;
}

function getDefaultBodyMock(dataType: MDatasourceBodyDataType): JsonValue {
  if (dataType === 'number') return 0;
  if (dataType === 'boolean') return false;
  if (dataType === 'null') return null;
  if (dataType === 'object') return {};
  if (dataType === 'array') return [];
  return '';
}

function normalizeBodyMock(dataType: MDatasourceBodyDataType, mock: unknown): JsonValue {
  if (dataType === 'string') {
    return typeof mock === 'string' ? mock : normalizeString(mock);
  }

  if (dataType === 'number') {
    return typeof mock === 'number' && Number.isFinite(mock) ? mock : 0;
  }

  if (dataType === 'boolean') {
    return typeof mock === 'boolean' ? mock : false;
  }

  if (dataType === 'null') {
    return null;
  }

  if (dataType === 'object') {
    return isJsonObjectValue(mock) ? cloneJsonValue(mock) : {};
  }

  if (Array.isArray(mock) && isJsonValue(mock)) {
    return cloneJsonValue(mock);
  }

  return [];
}

function normalizeKeyMockList(value: unknown): MDatasourceKeyMockItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      key: normalizeString(item.key),
      mock: normalizeString(item.mock)
    }));
}

function normalizeBodyList(value: unknown): MDatasourceBodyItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => {
      const dataType = normalizeBodyDataType(item.dataType);
      return {
        key: normalizeString(item.key),
        dataType,
        mock: normalizeBodyMock(dataType, item.mock)
      };
    });
}

function getDefaultApiDatasource(): MDatasourceApiObject {
  return {
    type: 'API',
    domain: '',
    path: '',
    method: 'GET',
    headerData: [],
    bodyData: [],
    queryData: []
  };
}

function getDefaultDatasource(): MDatasourceObject {
  return {
    type: 'JSON',
    rawData: {}
  };
}

export function normalizeDatasource(value: unknown): MDatasourceObject {
  if (!isRecord(value)) {
    return getDefaultDatasource();
  }

  if (value.type === 'API') {
    return {
      type: 'API',
      domain: normalizeString(value.domain),
      path: normalizeString(value.path),
      method: normalizeMethod(value.method),
      headerData: normalizeKeyMockList(value.headerData),
      bodyData: normalizeBodyList(value.bodyData),
      queryData: normalizeKeyMockList(value.queryData)
    };
  }

  return {
    type: 'JSON',
    rawData: normalizeJsonValue(value.rawData, {})
  };
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
type ApiState = Omit<MDatasourceApiObject, 'bodyData'> & {
  bodyData: ApiStateBodyItem[];
};

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
const apiState = reactive<ApiState>(
  normalizedInitialValue.type === 'API' ? normalizedInitialValue : getDefaultApiDatasource()
);
const bodyMockInputs = ref<string[]>(apiState.bodyData.map((item) => getBodyMockInputValue(item)));
const bodyMockErrors = ref<string[]>(apiState.bodyData.map(() => ''));
const isReadOnly = computed(() => !props.edit);

function formatJsonValue(value: JsonValue) {
  return JSON.stringify(value, null, 2);
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

function buildApiDatasource(): MDatasourceApiObject {
  return normalizeDatasource({
    type: 'API',
    domain: apiState.domain,
    path: apiState.path,
    method: apiState.method,
    headerData: apiState.headerData,
    bodyData: apiState.bodyData,
    queryData: apiState.queryData
  }) as MDatasourceApiObject;
}

function emitApiChange() {
  emitDatasource(buildApiDatasource());
}

function syncBodyMockInputs() {
  bodyMockInputs.value = apiState.bodyData.map((item) => getBodyMockInputValue(item));
  bodyMockErrors.value = apiState.bodyData.map(() => '');
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
    emitDatasource({
      type: 'JSON',
      rawData: normalizeJsonValue(jsonValue.value, {})
    });
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
    emitDatasource({
      type: 'JSON',
      rawData: jsonValue.value
    });
  } catch {
    jsonError.value = t('datasource.validation.invalidJson');
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

      <section class="ce-datasource-tool__list" data-testid="datasource-header-list">
        <div class="ce-datasource-tool__list-header">
          <h4 class="ce-datasource-tool__list-title">{{ t('datasource.sections.headers') }}</h4>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-header-add"
            @click="addKeyMockItem('headerData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </div>
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
      </section>

      <section class="ce-datasource-tool__list" data-testid="datasource-query-list">
        <div class="ce-datasource-tool__list-header">
          <h4 class="ce-datasource-tool__list-title">{{ t('datasource.sections.queries') }}</h4>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-query-add"
            @click="addKeyMockItem('queryData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </div>
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
      </section>

      <section class="ce-datasource-tool__list" data-testid="datasource-body-list">
        <div class="ce-datasource-tool__list-header">
          <h4 class="ce-datasource-tool__list-title">{{ t('datasource.sections.body') }}</h4>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-body-add"
            @click="addBodyItem"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </div>
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
      </section>
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

.ce-datasource-tool__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ce-datasource-tool__action,
.ce-datasource-tool__remove {
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

.ce-datasource-tool__remove {
  padding: 5px 10px;
  color: rgb(185 28 28);
}

.ce-datasource-tool__action:hover,
.ce-datasource-tool__remove:hover {
  background: rgb(248 250 252);
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

  .ce-datasource-tool__grid,
  .ce-datasource-tool__row,
  .ce-datasource-tool__body-row {
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

:global(.dark) .ce-datasource-tool__title {
  color: rgb(241 245 249);
}

:global(.dark) .ce-datasource-tool__label,
:global(.dark) .ce-datasource-tool__list-title {
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
:global(.dark) .ce-datasource-tool__remove {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

:global(.dark) .ce-datasource-tool__action:hover,
:global(.dark) .ce-datasource-tool__remove:hover {
  background: rgb(30 41 59);
}

:global(.dark) .ce-datasource-tool__empty {
  border-color: rgb(71 85 105);
  color: rgb(148 163 184);
}

:global(.dark) .ce-datasource-tool__error,
:global(.dark) .ce-datasource-tool__body-error {
  color: rgb(248 113 113);
}
</style>
