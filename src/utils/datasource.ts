import {
  cloneJsonValue,
  inferJSONSchema,
  isJsonObjectValue,
  isJsonValue,
  isRecord,
  normalizeSchemaSelections,
  type DatasourceSchemaSelections,
  type JSONSchema,
  type JsonValue
} from '@/utils/datasourceSchema';
import {
  ApiDomainError,
  DEFAULT_API_DOMAIN_UUID,
  resolveApiDomainHost,
  type ApiDomainErrorCode
} from '@/utils/apiDomains';

export type MDatasourceType = 'JSON' | 'API';
export type MDatasourceApiMethod = 'GET' | 'POST';
export type MDatasourceBodyDataType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array' | 'file';
export type MDatasourceBodyFileValue = {
  [key: string]: JsonValue;
  name: string;
  size: number;
  type: string;
};

export type {
  DatasourceSchemaSelections,
  JSONSchema,
  JsonValue
};

export interface MDatasourceKeyValueItem {
  key: string;
  value: string;
}

export interface MDatasourceBodyItem {
  key: string;
  dataType: MDatasourceBodyDataType;
  value: JsonValue;
}

export interface MDatasourceExternalField {
  label: string;
  variable: string;
}

export interface MDatasourceMatchingExternalField extends MDatasourceExternalField {
  matchFieldPath: string;
}

export interface MDatasourceJsonObject {
  type: 'JSON';
  rawData: JsonValue;
  schemaSelections?: DatasourceSchemaSelections;
}

export interface MDatasourceApiObject {
  type: 'API';
  domain: string;
  path: string;
  method: MDatasourceApiMethod;
  headerData: MDatasourceKeyValueItem[];
  bodyData: MDatasourceBodyItem[];
  queryData: MDatasourceKeyValueItem[];
  schemaSelections?: DatasourceSchemaSelections;
  matchingExternalFields?: MDatasourceMatchingExternalField[];
}

export type MDatasourceObject = MDatasourceJsonObject | MDatasourceApiObject;

export type DatasourceRequestOptions = {
  bodyFiles?: Record<number, File>;
};
export type RemoteFunction = (value: MDatasourceObject, options?: DatasourceRequestOptions) => Promise<JsonValue>;
export type SchemaFunction = (value: MDatasourceObject, options?: DatasourceRequestOptions) => Promise<JSONSchema>;

export type DatasourceErrorCode =
  | ApiDomainErrorCode
  | 'apiRequestFailed'
  | 'missingFile'
  | 'nonJsonResponse'
  | 'invalidJsonResponse'
  | 'emptyArraySchema'
  | 'mixedArraySchema';

export class DatasourceError extends Error {
  readonly code: DatasourceErrorCode;
  readonly status?: number;
  readonly statusText?: string;

  constructor(code: DatasourceErrorCode, message: string, options?: {
    status?: number;
    statusText?: string;
  }) {
    super(message);
    this.name = 'DatasourceError';
    this.code = code;
    this.status = options?.status;
    this.statusText = options?.statusText;
  }
}

export const bodyDataTypes = ['string', 'number', 'boolean', 'null', 'object', 'array', 'file'] as const;

export function normalizeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export function normalizeMethod(value: unknown): MDatasourceApiMethod {
  return value === 'POST' ? 'POST' : 'GET';
}

export function normalizeBodyDataType(value: unknown): MDatasourceBodyDataType {
  return bodyDataTypes.includes(value as MDatasourceBodyDataType)
    ? value as MDatasourceBodyDataType
    : 'string';
}

export function normalizeJsonValue(value: unknown, fallback: JsonValue = {}) {
  return isJsonValue(value) ? cloneJsonValue(value) : fallback;
}

export function getDefaultBodyFileValue(): MDatasourceBodyFileValue {
  return {
    name: '',
    size: 0,
    type: ''
  };
}

export function normalizeBodyFileValue(value: unknown): MDatasourceBodyFileValue {
  if (!isRecord(value)) {
    return getDefaultBodyFileValue();
  }

  return {
    name: normalizeString(value.name),
    size: typeof value.size === 'number' && Number.isFinite(value.size) ? value.size : 0,
    type: normalizeString(value.type)
  };
}

export function getDefaultBodyValue(dataType: MDatasourceBodyDataType): JsonValue {
  if (dataType === 'number') return 0;
  if (dataType === 'boolean') return false;
  if (dataType === 'null') return null;
  if (dataType === 'object') return {};
  if (dataType === 'array') return [];
  if (dataType === 'file') return getDefaultBodyFileValue();
  return '';
}

export function normalizeBodyValue(dataType: MDatasourceBodyDataType, value: unknown): JsonValue {
  if (dataType === 'string') {
    return typeof value === 'string' ? value : normalizeString(value);
  }

  if (dataType === 'number') {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  if (dataType === 'boolean') {
    return typeof value === 'boolean' ? value : false;
  }

  if (dataType === 'null') {
    return null;
  }

  if (dataType === 'object') {
    return isJsonObjectValue(value) ? cloneJsonValue(value) : {};
  }

  if (dataType === 'file') {
    return normalizeBodyFileValue(value);
  }

  if (Array.isArray(value) && isJsonValue(value)) {
    return cloneJsonValue(value);
  }

  return [];
}

function normalizeKeyValueList(value: unknown): MDatasourceKeyValueItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      key: normalizeString(item.key),
      value: normalizeString(item.value)
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
        value: normalizeBodyValue(dataType, item.value)
      };
    });
}

function normalizeExternalField(value: unknown): MDatasourceExternalField | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = normalizeString(value.label).trim();
  const variable = normalizeString(value.variable).trim();
  if (!label || !variable) {
    return undefined;
  }

  return {
    label,
    variable
  };
}

export function normalizeDatasourceExternalFields(value: unknown): MDatasourceExternalField[] {
  if (!Array.isArray(value)) return [];

  const fieldsByVariable = new Map<string, MDatasourceExternalField>();
  value.forEach((item) => {
    const field = normalizeExternalField(item);
    if (field && !fieldsByVariable.has(field.variable)) {
      fieldsByVariable.set(field.variable, field);
    }
  });

  return [...fieldsByVariable.values()];
}

function normalizeMatchingExternalField(value: unknown): MDatasourceMatchingExternalField | undefined {
  const field = normalizeExternalField(value);
  if (!field || !isRecord(value)) {
    return undefined;
  }

  return {
    ...field,
    matchFieldPath: normalizeString(value.matchFieldPath).trim()
  };
}

export function normalizeDatasourceMatchingExternalFields(value: unknown): MDatasourceMatchingExternalField[] {
  if (!Array.isArray(value)) return [];

  const fieldsByVariable = new Map<string, MDatasourceMatchingExternalField>();
  value.forEach((item) => {
    const field = normalizeMatchingExternalField(item);
    if (field && !fieldsByVariable.has(field.variable)) {
      fieldsByVariable.set(field.variable, field);
    }
  });

  return [...fieldsByVariable.values()];
}

export function getDefaultApiDatasource(): MDatasourceApiObject {
  return {
    type: 'API',
    domain: DEFAULT_API_DOMAIN_UUID,
    path: '',
    method: 'GET',
    headerData: [],
    bodyData: [],
    queryData: []
  };
}

export function getDefaultDatasource(): MDatasourceObject {
  return getDefaultApiDatasource();
}

export function normalizeDatasource(value: unknown): MDatasourceObject {
  if (!isRecord(value)) {
    return getDefaultDatasource();
  }

  const schemaSelections = normalizeSchemaSelections(value.schemaSelections);
  const matchingExternalFields = normalizeDatasourceMatchingExternalFields(value.matchingExternalFields);

  if (value.type === 'API') {
    const datasource: MDatasourceApiObject = {
      type: 'API',
      domain: normalizeString(value.domain),
      path: normalizeString(value.path),
      method: normalizeMethod(value.method),
      headerData: normalizeKeyValueList(value.headerData),
      bodyData: normalizeBodyList(value.bodyData),
      queryData: normalizeKeyValueList(value.queryData)
    };

    if (schemaSelections.length) {
      datasource.schemaSelections = schemaSelections;
    }

    if (matchingExternalFields.length) {
      datasource.matchingExternalFields = matchingExternalFields;
    }

    return datasource;
  }

  const datasource: MDatasourceJsonObject = {
    type: 'JSON',
    rawData: normalizeJsonValue(value.rawData, {})
  };

  if (schemaSelections.length) {
    datasource.schemaSelections = schemaSelections;
  }

  return datasource;
}

export function getDatasourceRequestUrl(datasource: MDatasourceApiObject, domainHost = datasource.domain) {
  const domain = domainHost.trim();
  const path = datasource.path.trim();
  const absolutePath = /^[a-z][a-z\d+\-.]*:/i.test(path);
  const baseUrl = domain || (typeof window !== 'undefined' ? window.location.origin : '');

  if (!baseUrl && !absolutePath) {
    throw new TypeError('API domain is required when calling a relative datasource path outside the browser.');
  }

  const url = baseUrl
    ? new URL(path || '/', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
    : new URL(path || '/');

  datasource.queryData.forEach((item) => {
    const key = item.key.trim();
    if (!key) return;
    url.searchParams.append(key, item.value);
  });

  return url.toString();
}

async function getResolvedDatasourceRequestUrl(datasource: MDatasourceApiObject) {
  try {
    const domainHost = await resolveApiDomainHost(datasource.domain);
    return getDatasourceRequestUrl(datasource, domainHost);
  } catch (error) {
    if (error instanceof ApiDomainError) {
      throw new DatasourceError(error.code, error.message);
    }

    throw error;
  }
}

export function getDatasourceRequestHeaders(datasource: MDatasourceApiObject) {
  const headers = new Headers();
  const hasFileBody = hasDatasourceFileBody(datasource);
  datasource.headerData.forEach((item) => {
    const key = item.key.trim();
    if (!key) return;
    if (hasFileBody && key.toLowerCase() === 'content-type') return;
    headers.set(key, item.value);
  });

  if (datasource.method === 'POST' && !hasFileBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

function hasDatasourceFileBody(datasource: MDatasourceApiObject) {
  return datasource.method === 'POST' && datasource.bodyData.some((item) => item.dataType === 'file');
}

function getFormDataValue(item: MDatasourceBodyItem) {
  const normalizedValue = normalizeBodyValue(item.dataType, item.value);
  if (item.dataType === 'object' || item.dataType === 'array') {
    return JSON.stringify(normalizedValue);
  }

  if (item.dataType === 'null') {
    return '';
  }

  return String(normalizedValue);
}

export function getDatasourceRequestBody(datasource: MDatasourceApiObject, options?: DatasourceRequestOptions) {
  if (datasource.method !== 'POST') {
    return undefined;
  }

  if (hasDatasourceFileBody(datasource)) {
    const formData = new FormData();

    datasource.bodyData.forEach((item, index) => {
      const key = item.key.trim();
      if (!key) return;

      if (item.dataType === 'file') {
        const file = options?.bodyFiles?.[index];
        if (!file) {
          throw new DatasourceError('missingFile', 'A file is required for the datasource body.');
        }

        formData.append(key, file);
        return;
      }

      formData.append(key, getFormDataValue(item));
    });

    return formData;
  }

  const body = datasource.bodyData.reduce<Record<string, JsonValue>>((result, item) => {
    const key = item.key.trim();
    if (!key) return result;
    result[key] = normalizeBodyValue(item.dataType, item.value);
    return result;
  }, {});

  return JSON.stringify(body);
}

async function readDatasourceJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('json')) {
    throw new DatasourceError('nonJsonResponse', 'The API response is not JSON.');
  }

  try {
    const data = await response.json() as unknown;
    if (!isJsonValue(data)) {
      throw new DatasourceError('invalidJsonResponse', 'The API response is not valid JSON.');
    }

    return data;
  } catch (error) {
    if (error instanceof DatasourceError) {
      throw error;
    }

    throw new DatasourceError('invalidJsonResponse', 'The API response is not valid JSON.');
  }
}

export const $remote: RemoteFunction = async (value, options) => {
  const datasource = normalizeDatasource(value);
  if (datasource.type === 'JSON') {
    return cloneJsonValue(datasource.rawData);
  }

  const response = await fetch(await getResolvedDatasourceRequestUrl(datasource), {
    method: datasource.method,
    headers: getDatasourceRequestHeaders(datasource),
    body: getDatasourceRequestBody(datasource, options)
  });

  if (!response.ok) {
    throw new DatasourceError(
      'apiRequestFailed',
      `API request failed: ${response.status} ${response.statusText}`.trim(),
      {
        status: response.status,
        statusText: response.statusText
      }
    );
  }

  return await readDatasourceJsonResponse(response);
};

export const $schema: SchemaFunction = async (value, options) => {
  const data = await $remote(value, options);
  const inferredSchema = inferJSONSchema(data);
  if (inferredSchema.ok) {
    return inferredSchema.schema;
  }

  if (inferredSchema.reason === 'emptyArray') {
    throw new DatasourceError('emptyArraySchema', 'Cannot infer JSON Schema from an empty array.');
  }

  throw new DatasourceError('mixedArraySchema', 'The array contains incompatible types, so JSON Schema cannot be inferred.');
};
