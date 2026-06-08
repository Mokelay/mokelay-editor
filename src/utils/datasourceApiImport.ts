import type { ApiJson } from '@/api-builder/types';
import type { ApifoxApisResult, MokelayApiRecord } from '@/utils/apisApi';
import {
  getDefaultBodyMock,
  normalizeBodyMock,
  normalizeDatasource,
  type MDatasourceApiMethod,
  type MDatasourceApiObject,
  type MDatasourceBodyDataType,
  type MDatasourceBodyItem,
  type MDatasourceKeyMockItem
} from '@/utils/datasource';
import {
  isJsonValue,
  normalizeJSONSchema,
  type JSONSchema,
  type JsonValue
} from '@/utils/datasourceSchema';

export type ImportedApiDatasource = {
  datasource: MDatasourceApiObject;
  jsonSchema?: JSONSchema;
};

export type DatasourceApiImportErrorCode =
  | 'missingApiJson'
  | 'unsupportedMethod'
  | 'apifoxApiNotFound';

export class DatasourceApiImportError extends Error {
  readonly code: DatasourceApiImportErrorCode;
  readonly method?: string;

  constructor(code: DatasourceApiImportErrorCode, message: string, options: { method?: string } = {}) {
    super(message);
    this.name = 'DatasourceApiImportError';
    this.code = code;
    this.method = options.method;
  }
}

type ApiCandidate = {
  id: string;
  name: string;
  method: string;
  path: string;
  serverUrl: string;
  parameters: unknown[];
  requestBody?: unknown;
  responses?: unknown;
  openapiRoot?: unknown;
};

const supportedMethods = ['GET', 'POST'] as const;
const requestBodyContentTypes = [
  'application/json',
  'multipart/form-data',
  'application/x-www-form-urlencoded'
];

export function buildDatasourceFromMokelayApi(
  api: MokelayApiRecord,
  domain: string
): ImportedApiDatasource {
  const apiJson = api.apiJson;
  if (!apiJson) {
    throw new DatasourceApiImportError('missingApiJson', 'Mokelay API detail is missing apiJson.');
  }

  const method = normalizeImportedMethod(apiJson.method || api.method);

  return {
    datasource: normalizeDatasource({
      type: 'API',
      domain,
      path: `/api/mokelay/${encodeURIComponent(api.uuid)}`,
      method,
      headerData: requestDeclarationsToKeyMockItems(apiJson, 'header'),
      queryData: requestDeclarationsToKeyMockItems(apiJson, 'query'),
      bodyData: requestDeclarationsToBodyItems(apiJson)
    }) as MDatasourceApiObject
  };
}

export function buildDatasourceFromApifoxApi(
  result: ApifoxApisResult,
  apiId: string
): ImportedApiDatasource {
  const candidate = findApifoxApiCandidate(result, apiId.trim());
  if (!candidate) {
    throw new DatasourceApiImportError('apifoxApiNotFound', 'APIFox API not found.');
  }

  const method = normalizeImportedMethod(candidate.method);
  const endpoint = splitEndpoint(candidate.path, candidate.serverUrl);
  const jsonSchema = getResponseJsonSchema(candidate.responses, candidate.openapiRoot);

  return {
    datasource: normalizeDatasource({
      type: 'API',
      domain: endpoint.domain,
      path: endpoint.path,
      method,
      headerData: parametersToKeyMockItems(candidate.parameters, 'header', candidate.openapiRoot),
      queryData: parametersToKeyMockItems(candidate.parameters, 'query', candidate.openapiRoot),
      bodyData: requestBodyToBodyItems(candidate.requestBody, candidate.openapiRoot)
    }) as MDatasourceApiObject,
    ...(jsonSchema ? { jsonSchema } : {})
  };
}

function normalizeImportedMethod(value: unknown): MDatasourceApiMethod {
  const method = readLooseString(value).toUpperCase();
  if (supportedMethods.includes(method as MDatasourceApiMethod)) {
    return method as MDatasourceApiMethod;
  }

  throw new DatasourceApiImportError(
    'unsupportedMethod',
    `Unsupported API method: ${method || 'UNKNOWN'}.`,
    { method }
  );
}

function requestDeclarationsToKeyMockItems(apiJson: ApiJson, location: 'header' | 'query'): MDatasourceKeyMockItem[] {
  const declarations = Array.isArray(apiJson.request?.[location]) ? apiJson.request[location] : [];

  return declarations
    .map((declaration) => readProcessableKey(declaration))
    .filter((key) => Boolean(key))
    .map((key) => ({
      key,
      mock: ''
    }));
}

function requestDeclarationsToBodyItems(apiJson: ApiJson): MDatasourceBodyItem[] {
  const declarations = Array.isArray(apiJson.request?.body) ? apiJson.request.body : [];

  return declarations
    .map((declaration) => readProcessableKey(declaration))
    .filter((key) => Boolean(key))
    .map((key) => ({
      key,
      dataType: 'string' as const,
      mock: ''
    }));
}

function readProcessableKey(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (!isRecord(value)) {
    return '';
  }

  return readString(value.key);
}

function findApifoxApiCandidate(result: ApifoxApisResult, apiId: string) {
  const listCandidates = result.apis
    .map((item) => normalizeApifoxApiCandidate(item, result.openapi))
    .filter((item): item is ApiCandidate => Boolean(item));
  const openapiCandidates = collectOpenapiCandidates(result.openapi);
  const candidates = [...listCandidates, ...openapiCandidates];

  return candidates.find((candidate) => candidate.id && String(candidate.id) === apiId) ||
    listCandidates[0] ||
    (openapiCandidates.length === 1 ? openapiCandidates[0] : undefined);
}

function normalizeApifoxApiCandidate(value: unknown, openapiRoot: unknown): ApiCandidate | undefined {
  const record = unwrapApiRecord(value);
  if (!record) {
    return undefined;
  }

  const method = readFirstString(record, ['method', 'httpMethod', 'requestMethod']).toUpperCase();
  const path = readFirstString(record, ['path', 'url', 'endpoint', 'requestPath']);
  if (!method || !path) {
    return undefined;
  }

  return {
    id: readFirstLooseString(record, ['id', 'apiId', '_id', 'operationId']),
    name: readFirstString(record, ['name', 'title', 'summary']),
    method,
    path,
    serverUrl: readFirstString(record, ['serverUrl', 'serverURL', 'baseUrl', 'baseURL', 'host']),
    parameters: readParameters(record),
    requestBody: readFirstValue(record, ['requestBody', 'body', 'requestBodyParameters']),
    responses: readFirstValue(record, ['responses', 'response']),
    openapiRoot
  };
}

function unwrapApiRecord(value: unknown): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of ['api', 'detail', 'data', 'item']) {
    const nestedValue = value[key];
    if (isRecord(nestedValue)) {
      return nestedValue;
    }
  }

  return value;
}

function collectOpenapiCandidates(openapiRoot: unknown) {
  if (!isRecord(openapiRoot) || !isRecord(openapiRoot.paths)) {
    return [];
  }

  const serverUrl = getFirstServerUrl(openapiRoot);
  const candidates: ApiCandidate[] = [];
  Object.entries(openapiRoot.paths).forEach(([path, pathItem]) => {
    if (!isRecord(pathItem)) {
      return;
    }

    const pathParameters = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (!isHttpMethodKey(method) || !isRecord(operation)) {
        return;
      }

      candidates.push({
        id: readFirstLooseString(operation, ['operationId', 'x-apifox-api-id', 'x-apifox-id', 'id']),
        name: readFirstString(operation, ['summary', 'name', 'title']),
        method: method.toUpperCase(),
        path,
        serverUrl: getFirstServerUrl(operation) || serverUrl,
        parameters: [
          ...pathParameters,
          ...(Array.isArray(operation.parameters) ? operation.parameters : [])
        ],
        requestBody: operation.requestBody,
        responses: operation.responses,
        openapiRoot
      });
    });
  });

  return candidates;
}

function isHttpMethodKey(value: string) {
  return ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(value.toLowerCase());
}

function getFirstServerUrl(value: Record<string, unknown>) {
  if (!Array.isArray(value.servers)) {
    return '';
  }

  const firstServer = value.servers.find((item) => isRecord(item) && typeof item.url === 'string');
  return isRecord(firstServer) ? readString(firstServer.url) : '';
}

function readParameters(record: Record<string, unknown>) {
  const parameters = readFirstValue(record, ['parameters', 'params']);
  if (Array.isArray(parameters)) {
    return parameters;
  }

  if (isRecord(parameters)) {
    return flattenParameterGroups(parameters);
  }

  const request = record.request;
  if (isRecord(request) && Array.isArray(request.parameters)) {
    return request.parameters;
  }

  if (isRecord(request) && isRecord(request.parameters)) {
    return flattenParameterGroups(request.parameters);
  }

  return [];
}

function flattenParameterGroups(parameters: Record<string, unknown>) {
  return Object.entries(parameters).flatMap(([location, items]) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => {
      const normalizedLocation = normalizeParameterLocation(location);
      const parameterName = readLooseString(item);
      if (parameterName) {
        return {
          name: parameterName,
          in: normalizedLocation
        };
      }

      if (!isRecord(item)) {
        return item;
      }

      return {
        ...item,
        in: readString(item.in) || normalizedLocation
      };
    });
  });
}

function normalizeParameterLocation(location: string) {
  const normalizedLocation = location.toLowerCase();
  if (normalizedLocation === 'headers') return 'header';
  if (normalizedLocation === 'queries') return 'query';
  if (normalizedLocation === 'cookies') return 'cookie';
  return normalizedLocation;
}

function parametersToKeyMockItems(
  parameters: unknown[],
  location: 'header' | 'query',
  openapiRoot: unknown
): MDatasourceKeyMockItem[] {
  return parameters
    .map((parameter) => resolveOpenapiSchema(parameter, openapiRoot))
    .filter((parameter): parameter is Record<string, unknown> => isRecord(parameter))
    .filter((parameter) => readString(parameter.in).toLowerCase() === location)
    .map((parameter) => ({
      key: readString(parameter.name),
      mock: stringifyMockValue(readExampleValue(parameter, openapiRoot) ?? readExampleValue(parameter.schema, openapiRoot))
    }))
    .filter((item) => Boolean(item.key));
}

function requestBodyToBodyItems(requestBody: unknown, openapiRoot: unknown): MDatasourceBodyItem[] {
  if (Array.isArray(requestBody)) {
    return bodyParameterListToBodyItems(requestBody, openapiRoot);
  }

  const requestBodyRecord = resolveOpenapiSchema(requestBody, openapiRoot);
  if (!isRecord(requestBodyRecord)) {
    return [];
  }

  const parameterItems = bodyParametersToBodyItems(requestBodyRecord, openapiRoot);
  if (parameterItems.length) {
    return parameterItems;
  }

  const contentEntry = selectRequestBodyContent(requestBodyRecord.content);
  if (!contentEntry) {
    return [];
  }

  return schemaPropertiesToBodyItems(contentEntry.schema, openapiRoot);
}

function bodyParametersToBodyItems(
  requestBodyRecord: Record<string, unknown>,
  openapiRoot: unknown
): MDatasourceBodyItem[] {
  const parameters = Array.isArray(requestBodyRecord.parameters)
    ? requestBodyRecord.parameters
    : Array.isArray(requestBodyRecord.fields)
      ? requestBodyRecord.fields
      : Array.isArray(requestBodyRecord.requestBodyParameters)
        ? requestBodyRecord.requestBodyParameters
      : [];

  return bodyParameterListToBodyItems(parameters, openapiRoot);
}

function bodyParameterListToBodyItems(
  parameters: unknown[],
  openapiRoot: unknown
): MDatasourceBodyItem[] {
  return parameters
    .map((parameter) => resolveOpenapiSchema(parameter, openapiRoot))
    .filter((parameter): parameter is Record<string, unknown> => isRecord(parameter))
    .map((parameter) => {
      const key = readString(parameter.name) || readString(parameter.key) || readString(parameter.path);
      if (!key) {
        return undefined;
      }

      const schema = parameter.schema ?? parameter;
      const dataType = getBodyDataTypeFromSchema(schema, openapiRoot);
      return {
        key,
        dataType,
        mock: createBodyMock(schema, dataType, openapiRoot)
      };
    })
    .filter((item): item is MDatasourceBodyItem => Boolean(item));
}

function schemaPropertiesToBodyItems(schema: unknown, openapiRoot: unknown): MDatasourceBodyItem[] {
  const schemaRecord = resolveOpenapiSchema(schema, openapiRoot);
  if (!isRecord(schemaRecord) || !isRecord(schemaRecord.properties)) {
    return [];
  }

  return Object.entries(schemaRecord.properties).map(([key, property]) => {
    const dataType = getBodyDataTypeFromSchema(property, openapiRoot);
    return {
      key,
      dataType,
      mock: createBodyMock(property, dataType, openapiRoot)
    };
  });
}

function selectRequestBodyContent(content: unknown) {
  if (!isRecord(content)) {
    return undefined;
  }

  const entries = Object.entries(content);
  const entry = requestBodyContentTypes
    .map((contentType) => entries.find(([key]) => key.toLowerCase().includes(contentType)))
    .find((item): item is [string, unknown] => Boolean(item)) ||
    entries.find(([key]) => key.toLowerCase().includes('json'));

  if (!entry || !isRecord(entry[1])) {
    return undefined;
  }

  return {
    contentType: entry[0],
    schema: entry[1].schema
  };
}

function getBodyDataTypeFromSchema(schema: unknown, openapiRoot: unknown): MDatasourceBodyDataType {
  const schemaRecord = resolveOpenapiSchema(schema, openapiRoot);
  if (!isRecord(schemaRecord)) {
    return 'string';
  }

  const schemaType = readSchemaType(schemaRecord);
  if (schemaType === 'string' && readString(schemaRecord.format).toLowerCase() === 'binary') {
    return 'file';
  }

  if (schemaType === 'integer' || schemaType === 'number') {
    return 'number';
  }

  if (schemaType === 'boolean') {
    return 'boolean';
  }

  if (schemaType === 'null') {
    return 'null';
  }

  if (schemaType === 'array') {
    return 'array';
  }

  if (schemaType === 'object' || isRecord(schemaRecord.properties)) {
    return 'object';
  }

  return 'string';
}

function createBodyMock(
  schema: unknown,
  dataType: MDatasourceBodyDataType,
  openapiRoot: unknown
): JsonValue {
  const example = readExampleValue(schema, openapiRoot);
  return normalizeBodyMock(dataType, example === undefined ? getDefaultBodyMock(dataType) : example);
}

function getResponseJsonSchema(responses: unknown, openapiRoot: unknown): JSONSchema | undefined {
  const responseRecord = resolveOpenapiSchema(responses, openapiRoot);
  if (!isRecord(responseRecord)) {
    return undefined;
  }

  const responseEntry = Object.entries(responseRecord)
    .filter(([status]) => /^2\d\d$/.test(status))
    .sort(([left], [right]) => left.localeCompare(right))
    .find(([, response]) => isRecord(resolveOpenapiSchema(response, openapiRoot)));

  if (!responseEntry) {
    return undefined;
  }

  const response = resolveOpenapiSchema(responseEntry[1], openapiRoot);
  if (!isRecord(response)) {
    return undefined;
  }

  const content = selectJsonContent(response.content);
  if (!content) {
    return undefined;
  }

  return convertOpenapiSchema(content.schema, openapiRoot);
}

function selectJsonContent(content: unknown) {
  if (!isRecord(content)) {
    return undefined;
  }

  const entry = Object.entries(content).find(([contentType, value]) =>
    contentType.toLowerCase().includes('json') && isRecord(value)
  );

  if (!entry || !isRecord(entry[1])) {
    return undefined;
  }

  return {
    schema: entry[1].schema
  };
}

function convertOpenapiSchema(
  schema: unknown,
  openapiRoot: unknown,
  seenRefs = new Set<string>()
): JSONSchema | undefined {
  const schemaRecord = resolveOpenapiSchema(schema, openapiRoot, seenRefs);
  if (!isRecord(schemaRecord)) {
    return undefined;
  }

  const union = convertSchemaUnion(schemaRecord, openapiRoot, seenRefs);
  if (union) {
    return withNullable(schemaRecord, union);
  }

  const schemaType = readSchemaType(schemaRecord);
  const converted = convertSchemaByType(schemaRecord, schemaType, openapiRoot, seenRefs);
  if (!converted) {
    return undefined;
  }

  return withNullable(schemaRecord, converted);
}

function convertSchemaUnion(
  schemaRecord: Record<string, unknown>,
  openapiRoot: unknown,
  seenRefs: Set<string>
): JSONSchema | undefined {
  const variants = Array.isArray(schemaRecord.anyOf)
    ? schemaRecord.anyOf
    : Array.isArray(schemaRecord.oneOf)
      ? schemaRecord.oneOf
      : Array.isArray(schemaRecord.type)
        ? schemaRecord.type.map((type) => ({ ...schemaRecord, type }))
        : [];

  if (!variants.length) {
    return undefined;
  }

  const anyOf = variants
    .map((variant) => convertOpenapiSchema(variant, openapiRoot, new Set(seenRefs)))
    .filter((variant): variant is JSONSchema => Boolean(variant));

  return anyOf.length ? normalizeJSONSchema({ anyOf }) : undefined;
}

function convertSchemaByType(
  schemaRecord: Record<string, unknown>,
  schemaType: string,
  openapiRoot: unknown,
  seenRefs: Set<string>
): JSONSchema | undefined {
  if (schemaType === 'object' || isRecord(schemaRecord.properties)) {
    const properties: Record<string, JSONSchema> = {};
    const sourceProperties = isRecord(schemaRecord.properties) ? schemaRecord.properties : {};

    for (const [key, property] of Object.entries(sourceProperties)) {
      const convertedProperty = convertOpenapiSchema(property, openapiRoot, new Set(seenRefs));
      if (!convertedProperty) {
        return undefined;
      }

      properties[key] = convertedProperty;
    }

    return normalizeJSONSchema({
      type: 'object',
      properties,
      ...(Array.isArray(schemaRecord.required) && schemaRecord.required.every((item) => typeof item === 'string')
        ? { required: [...schemaRecord.required] }
        : {}),
      ...readDescription(schemaRecord)
    });
  }

  if (schemaType === 'array') {
    const items = convertOpenapiSchema(schemaRecord.items, openapiRoot, new Set(seenRefs));
    if (!items) {
      return undefined;
    }

    return normalizeJSONSchema({
      type: 'array',
      items,
      ...readDescription(schemaRecord)
    });
  }

  if (schemaType === 'integer' || schemaType === 'number') {
    return normalizeJSONSchema({
      type: 'number',
      ...readFiniteNumber(schemaRecord, 'minimum'),
      ...readFiniteNumber(schemaRecord, 'maximum'),
      ...readDescription(schemaRecord)
    });
  }

  if (schemaType === 'string') {
    return normalizeJSONSchema({
      type: 'string',
      ...(Array.isArray(schemaRecord.enum) && schemaRecord.enum.every((item) => typeof item === 'string')
        ? { enum: [...schemaRecord.enum] }
        : {}),
      ...readDescription(schemaRecord)
    });
  }

  if (schemaType === 'boolean') {
    return normalizeJSONSchema({
      type: 'boolean',
      ...readDescription(schemaRecord)
    });
  }

  if (schemaType === 'null') {
    return normalizeJSONSchema({
      type: 'null'
    });
  }

  return undefined;
}

function withNullable(schemaRecord: Record<string, unknown>, schema: JSONSchema | undefined): JSONSchema | undefined {
  if (!schema || schemaRecord.nullable !== true) {
    return schema;
  }

  return normalizeJSONSchema({
    anyOf: [
      schema,
      { type: 'null' }
    ],
    ...readDescription(schemaRecord)
  });
}

function readSchemaType(schemaRecord: Record<string, unknown>) {
  const typeValue = Array.isArray(schemaRecord.type)
    ? schemaRecord.type.find((item) => item !== 'null')
    : schemaRecord.type;

  if (typeof typeValue === 'string') {
    return typeValue.toLowerCase();
  }

  if (isRecord(schemaRecord.properties)) {
    return 'object';
  }

  if (schemaRecord.items !== undefined) {
    return 'array';
  }

  return '';
}

function resolveOpenapiSchema(
  value: unknown,
  openapiRoot: unknown,
  seenRefs = new Set<string>()
): unknown {
  if (!isRecord(value) || typeof value.$ref !== 'string') {
    return value;
  }

  if (seenRefs.has(value.$ref)) {
    return undefined;
  }

  seenRefs.add(value.$ref);
  const resolved = resolveOpenapiRef(value.$ref, openapiRoot);
  return resolveOpenapiSchema(resolved, openapiRoot, seenRefs);
}

function resolveOpenapiRef(ref: string, openapiRoot: unknown): unknown {
  if (!ref.startsWith('#/') || !isRecord(openapiRoot)) {
    return undefined;
  }

  return ref
    .slice(2)
    .split('/')
    .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce<unknown>((current, part) => {
      if (!isRecord(current)) {
        return undefined;
      }

      return current[part];
    }, openapiRoot);
}

function readExampleValue(value: unknown, openapiRoot: unknown): JsonValue | undefined {
  const record = resolveOpenapiSchema(value, openapiRoot);
  if (!isRecord(record)) {
    return undefined;
  }

  for (const key of ['example', 'default']) {
    const example = record[key];
    if (isJsonValue(example)) {
      return example;
    }
  }

  if (isRecord(record.examples)) {
    const firstExample = Object.values(record.examples)[0];
    if (isJsonValue(firstExample)) {
      return firstExample;
    }

    if (isRecord(firstExample) && isJsonValue(firstExample.value)) {
      return firstExample.value;
    }
  }

  return undefined;
}

function stringifyMockValue(value: JsonValue | undefined) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function splitEndpoint(path: string, serverUrl: string) {
  try {
    const url = new URL(path);
    return {
      domain: url.origin,
      path: `${url.pathname}${url.search}`
    };
  } catch {
    // Continue with server URL parsing below.
  }

  try {
    const server = new URL(serverUrl);
    return {
      domain: server.origin,
      path: joinUrlPaths(server.pathname, path)
    };
  } catch {
    return {
      domain: serverUrl,
      path: path || '/'
    };
  }
}

function joinUrlPaths(prefix: string, path: string) {
  const trimmedPrefix = prefix.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!trimmedPrefix || trimmedPrefix === '/') {
    return normalizedPath;
  }

  return `${trimmedPrefix}${normalizedPath}`;
}

function readDescription(record: Record<string, unknown>) {
  return typeof record.description === 'string' ? { description: record.description } : {};
}

function readFiniteNumber(record: Record<string, unknown>, key: 'minimum' | 'maximum') {
  return typeof record[key] === 'number' && Number.isFinite(record[key])
    ? { [key]: record[key] }
    : {};
}

function readFirstValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }

  return undefined;
}

function readFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) {
      return value;
    }
  }

  return '';
}

function readFirstLooseString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = readLooseString(record[key]);
    if (value) {
      return value;
    }
  }

  return '';
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readLooseString(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
