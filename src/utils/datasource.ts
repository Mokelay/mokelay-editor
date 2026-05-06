import {
  cloneJsonValue,
  inferJSONSchema,
  isJsonObjectValue,
  isJsonValue,
  isRecord,
  normalizeJSONSchema,
  normalizeSchemaSelections,
  type DatasourceSchemaSelections,
  type JSONSchema,
  type JsonValue
} from '@/utils/datasourceSchema';

export type MDatasourceType = 'JSON' | 'API';
export type MDatasourceApiMethod = 'GET' | 'POST';
export type MDatasourceBodyDataType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

export type {
  DatasourceSchemaSelections,
  JSONSchema,
  JsonValue
};

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
  jsonSchema?: JSONSchema;
  schemaSelections?: DatasourceSchemaSelections;
}

export interface MDatasourceApiObject {
  type: 'API';
  domain: string;
  path: string;
  method: MDatasourceApiMethod;
  headerData: MDatasourceKeyMockItem[];
  bodyData: MDatasourceBodyItem[];
  queryData: MDatasourceKeyMockItem[];
  jsonSchema?: JSONSchema;
  schemaSelections?: DatasourceSchemaSelections;
}

export type MDatasourceObject = MDatasourceJsonObject | MDatasourceApiObject;

export type RemoteFunction = (value: MDatasourceObject) => Promise<JsonValue>;
export type SchemaFunction = (value: MDatasourceObject) => Promise<JSONSchema>;

export type DatasourceErrorCode =
  | 'apiRequestFailed'
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

export const bodyDataTypes = ['string', 'number', 'boolean', 'null', 'object', 'array'] as const;

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

export function getDefaultBodyMock(dataType: MDatasourceBodyDataType): JsonValue {
  if (dataType === 'number') return 0;
  if (dataType === 'boolean') return false;
  if (dataType === 'null') return null;
  if (dataType === 'object') return {};
  if (dataType === 'array') return [];
  return '';
}

export function normalizeBodyMock(dataType: MDatasourceBodyDataType, mock: unknown): JsonValue {
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

export function getDefaultApiDatasource(): MDatasourceApiObject {
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

export function getDefaultDatasource(): MDatasourceObject {
  return {
    type: 'JSON',
    rawData: {}
  };
}

export function normalizeDatasource(value: unknown): MDatasourceObject {
  if (!isRecord(value)) {
    return getDefaultDatasource();
  }

  const jsonSchema = normalizeJSONSchema(value.jsonSchema);
  const schemaSelections = normalizeSchemaSelections(value.schemaSelections, jsonSchema);

  if (value.type === 'API') {
    const datasource: MDatasourceApiObject = {
      type: 'API',
      domain: normalizeString(value.domain),
      path: normalizeString(value.path),
      method: normalizeMethod(value.method),
      headerData: normalizeKeyMockList(value.headerData),
      bodyData: normalizeBodyList(value.bodyData),
      queryData: normalizeKeyMockList(value.queryData)
    };

    if (jsonSchema) {
      datasource.jsonSchema = jsonSchema;
    }

    if (schemaSelections) {
      datasource.schemaSelections = schemaSelections;
    }

    return datasource;
  }

  const datasource: MDatasourceJsonObject = {
    type: 'JSON',
    rawData: normalizeJsonValue(value.rawData, {})
  };

  if (jsonSchema) {
    datasource.jsonSchema = jsonSchema;
  }

  if (schemaSelections) {
    datasource.schemaSelections = schemaSelections;
  }

  return datasource;
}

export function getDatasourceRequestUrl(datasource: MDatasourceApiObject) {
  const domain = datasource.domain.trim();
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
    url.searchParams.append(key, item.mock);
  });

  return url.toString();
}

export function getDatasourceRequestHeaders(datasource: MDatasourceApiObject) {
  const headers = new Headers();
  datasource.headerData.forEach((item) => {
    const key = item.key.trim();
    if (!key) return;
    headers.set(key, item.mock);
  });

  if (datasource.method === 'POST' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

export function getDatasourceRequestBody(datasource: MDatasourceApiObject) {
  if (datasource.method !== 'POST') {
    return undefined;
  }

  const body = datasource.bodyData.reduce<Record<string, JsonValue>>((result, item) => {
    const key = item.key.trim();
    if (!key) return result;
    result[key] = normalizeBodyMock(item.dataType, item.mock);
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

export const $remote: RemoteFunction = async (value) => {
  const datasource = normalizeDatasource(value);
  if (datasource.type === 'JSON') {
    return cloneJsonValue(datasource.rawData);
  }

  const response = await fetch(getDatasourceRequestUrl(datasource), {
    method: datasource.method,
    headers: getDatasourceRequestHeaders(datasource),
    body: getDatasourceRequestBody(datasource)
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

export const $schema: SchemaFunction = async (value) => {
  const data = await $remote(value);
  const inferredSchema = inferJSONSchema(data);
  if (inferredSchema.ok) {
    return inferredSchema.schema;
  }

  if (inferredSchema.reason === 'emptyArray') {
    throw new DatasourceError('emptyArraySchema', 'Cannot infer JSON Schema from an empty array.');
  }

  throw new DatasourceError('mixedArraySchema', 'The array contains incompatible types, so JSON Schema cannot be inferred.');
};
