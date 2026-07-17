import { normalizeApiBuilderLayout } from '@/api-builder/store';
import type { ApiBuilderLayout, ApiBuilderStatus, ApiJson } from '@/api-builder/types';
import { apiClient } from '@/composables/useApi';

export type MokelayApiSource = 'user' | 'system';

export type MokelayApiRecord = {
  uuid: string;
  name: string;
  method: string;
  fragment: boolean;
  status: ApiBuilderStatus;
  source: MokelayApiSource;
  apiJson?: ApiJson;
  layout?: ApiBuilderLayout;
  createdAt: string;
  updatedAt: string;
  enterpriseUuid?: string;
  appUuid?: string;
};

export type ListApisParams = {
  page: number;
  pageSize: number;
  source?: MokelayApiSource;
  fragment?: boolean;
  appUuid?: string;
};

export type MokelayApisPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ListApisResult = {
  apis: MokelayApiRecord[];
  pagination: MokelayApisPagination;
};

export type ApiBuilderSampleRecord = {
  uuid: string;
  title: string;
  description: string;
  method: string;
  apiJson: ApiJson;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ListApiBuilderSamplesResult = {
  samples: ApiBuilderSampleRecord[];
  pagination: MokelayApisPagination;
};

export type ApifoxProjectRecord = {
  id: string;
  name: string;
  raw: Record<string, unknown>;
};

export type ListApifoxProjectsResult = {
  projects: ApifoxProjectRecord[];
  count: number;
  raw?: unknown;
};

export type GetApifoxApiDetailParams = {
  projectId: string;
  apiId: string;
};

export type ApifoxApisResult = {
  apis: unknown[];
  count: number;
  openapi?: unknown;
};

export type SaveApiPayload = {
  apiJson: ApiJson;
  layout?: ApiBuilderLayout;
  status: ApiBuilderStatus;
  originalUuid?: string;
  appUuid?: string;
};

export type DeleteApiResult = {
  affected: number;
  message: string;
};

type ApiResponse = {
  api?: unknown;
};

type ApisResponse = {
  apis?: unknown;
  pagination?: unknown;
};

type BuiltInApisResponse = {
  apis?: unknown;
  count?: unknown;
};

type ApiBuilderSamplesResponse = {
  samples?: unknown;
  pagination?: unknown;
};

type ApifoxProjectsResponse = {
  projects?: unknown;
  count?: unknown;
  raw?: unknown;
};

type ApifoxApisResponse = {
  apis?: unknown;
  count?: unknown;
  openapi?: unknown;
};

type DeleteResponse = {
  affected?: unknown;
  message?: unknown;
};

type MokelaySuccessResponse<T> = {
  ok: true;
  data: T;
};

type MokelayErrorResponse = {
  ok: false;
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

type MokelayApiResponse<T> = MokelaySuccessResponse<T> | MokelayErrorResponse;

export async function listApis(params: ListApisParams) {
  if (params.source === 'system') {
    const response = await apiClient.get<MokelayApiResponse<BuiltInApisResponse>>(
      '/api/mokelay/list_mokelay_api_jsons',
      {
        params: params.fragment === undefined
          ? undefined
          : { fragment: params.fragment }
      }
    );
    return normalizeBuiltInApisResponse(unwrapApiResponse(response.data), params);
  }

  const { source: _source, ...userParams } = params;
  const response = await apiClient.get<MokelayApiResponse<ApisResponse>>('/api/mokelay/list_apis', {
    params: { ...userParams, appUuid: userParams.appUuid || currentAppUuid() }
  });
  return normalizeApisResponse(unwrapApiResponse(response.data));
}

export async function listApiBuilderSamples(params = { page: 1, pageSize: 100 }) {
  const response = await apiClient.get<MokelayApiResponse<ApiBuilderSamplesResponse>>(
    '/api/mokelay/list_api_builder_samples',
    { params }
  );
  return normalizeApiBuilderSamplesResponse(unwrapApiResponse(response.data));
}

export async function getApi(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<ApiResponse>>('/api/mokelay/read_api_by_uuid', {
    params: {
      uuid
    }
  });
  return normalizeApiResponse(unwrapApiResponse(response.data));
}

export async function getBuiltInApi(uuid: string, options: { fragment?: boolean } = {}) {
  const response = await apiClient.get<MokelayApiResponse<ApiResponse>>(
    '/api/mokelay/read_mokelay_api_json',
    {
      params: {
        uuid,
        ...(options.fragment === undefined ? {} : { fragment: options.fragment })
      }
    }
  );
  const data = unwrapApiResponse(response.data);

  if (data.api === null || data.api === undefined) {
    throw new Error('API not found.');
  }

  return normalizeBuiltInApiRecord(data.api);
}

export async function getApiBySource(
  uuid: string,
  source: MokelayApiSource,
  options: { fragment?: boolean } = {}
) {
  return source === 'system' ? await getBuiltInApi(uuid, options) : await getApi(uuid);
}

export async function listApifoxProjects() {
  const response = await apiClient.get<MokelayApiResponse<ApifoxProjectsResponse>>('/api/mokelay/list-apifox-projects');
  return normalizeApifoxProjectsResponse(unwrapApiResponse(response.data));
}

export async function getApifoxApiDetail(params: GetApifoxApiDetailParams) {
  const response = await apiClient.get<MokelayApiResponse<ApifoxApisResponse>>('/api/mokelay/list-apifox-apis', {
    params
  });
  return normalizeApifoxApisResponse(unwrapApiResponse(response.data));
}

export function getMokelayApiBaseUrl() {
  return typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
}

export async function saveApi(payload: SaveApiPayload) {
  const apiJson = payload.apiJson;
  const fragment = apiJson.fragment === true;
  const response = await apiClient.post<MokelayApiResponse<ApiResponse>>('/api/mokelay/save_api', {
    uuid: apiJson.uuid,
    ...(payload.originalUuid ? { originalUuid: payload.originalUuid } : {}),
    name: apiJson.alias || '未命名 API',
    method: fragment ? 'FRAGMENT' : String(apiJson.method || 'GET').toUpperCase(),
    fragment,
    status: payload.status,
    apiJson,
    layout: payload.layout ?? normalizeApiBuilderLayout(undefined)
    ,appUuid: payload.appUuid || currentAppUuid()
  });

  return normalizeApiResponse(unwrapApiResponse(response.data));
}

function currentAppUuid() {
  if (typeof window === 'undefined') return '';
  const rawQuery = (window.location.hash.split('?', 2)[1] ?? '');
  return new URLSearchParams(rawQuery).get('appUuid')
    || new URLSearchParams(rawQuery).get('uuid')
    || '';
}

export async function deleteApi(uuid: string) {
  const response = await apiClient.post<MokelayApiResponse<DeleteResponse>>('/api/mokelay/delete_api_by_uuid', {
    uuid
  });
  const data = unwrapApiResponse(response.data);

  return {
    affected: typeof data.affected === 'number' ? data.affected : Number(data.affected ?? 0),
    message: typeof data.message === 'string' ? data.message : ''
  } satisfies DeleteApiResult;
}

function unwrapApiResponse<T>(value: MokelayApiResponse<T>): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid API response.');
  }

  if (value.ok === true) {
    return value.data;
  }

  if (value.ok === false) {
    const code = typeof value.error?.code === 'string' ? value.error.code : '';
    const message = typeof value.error?.message === 'string' ? value.error.message : '';
    throw new Error(message || code || 'API request failed.');
  }

  throw new Error('Invalid API response.');
}

function normalizeApiResponse(value: ApiResponse): MokelayApiRecord {
  if (value.api === null || value.api === undefined) {
    throw new Error('API not found.');
  }

  return normalizeApiRecord(value.api);
}

function normalizeApisResponse(value: ApisResponse): ListApisResult {
  const apis = Array.isArray(value.apis) ? value.apis.map((api) => normalizeApiRecord(api)) : [];

  return {
    apis,
    pagination: normalizePagination(value.pagination)
  };
}

function normalizeBuiltInApisResponse(value: BuiltInApisResponse, params: ListApisParams): ListApisResult {
  const allApis = (Array.isArray(value.apis) ? value.apis.map((api) => normalizeBuiltInApiRecord(api)) : [])
    .filter((api) => params.fragment === undefined || api.fragment === params.fragment);
  const page = Math.max(1, Math.trunc(params.page) || 1);
  const pageSize = Math.max(1, Math.trunc(params.pageSize) || 20);
  // Built-in assets are returned as one complete collection. Use the locally
  // filtered length as well so this client remains safe with older servers
  // that ignore the fragment query parameter.
  const total = allApis.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;

  return {
    apis: allApis.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasPreviousPage: page > 1 && total > 0,
      hasNextPage: page < totalPages
    }
  };
}

function normalizeApiBuilderSamplesResponse(value: ApiBuilderSamplesResponse): ListApiBuilderSamplesResult {
  const samples = Array.isArray(value.samples)
    ? value.samples.map((sample) => normalizeApiBuilderSampleRecord(sample))
    : [];

  return {
    samples,
    pagination: normalizePagination(value.pagination)
  };
}

function normalizeApifoxProjectsResponse(value: ApifoxProjectsResponse): ListApifoxProjectsResult {
  const projects = Array.isArray(value.projects)
    ? value.projects
        .map((project) => normalizeApifoxProjectRecord(project))
        .filter((project): project is ApifoxProjectRecord => Boolean(project))
    : [];

  return {
    projects,
    count: readNumber(value.count, projects.length),
    raw: value.raw
  };
}

function normalizeApifoxApisResponse(value: ApifoxApisResponse): ApifoxApisResult {
  return {
    apis: Array.isArray(value.apis) ? [...value.apis] : [],
    count: readNumber(value.count, Array.isArray(value.apis) ? value.apis.length : 0),
    ...(value.openapi !== undefined ? { openapi: value.openapi } : {})
  };
}

function normalizeApiRecord(value: unknown): MokelayApiRecord {
  if (!isRecord(value)) {
    throw new Error('Invalid API record.');
  }

  const uuid = readString(value.uuid);
  const name = readString(value.name) || '未命名 API';
  const rawMethod = readString(value.method).toUpperCase();
  const status = value.status === 'published' ? 'published' : 'draft';
  const source = value.source === 'system' ? 'system' : 'user';
  const apiJsonValue = isRecord(value.apiJson)
    ? value.apiJson
    : isRecord(value.api_json)
      ? value.api_json
      : undefined;
  const fragment = value.fragment === true || apiJsonValue?.fragment === true || rawMethod === 'FRAGMENT';
  const method = fragment ? 'FRAGMENT' : rawMethod || 'GET';
  const layout = Object.prototype.hasOwnProperty.call(value, 'layout')
    ? normalizeApiBuilderLayout(value.layout)
    : undefined;

  if (!uuid) {
    throw new Error('Invalid API record.');
  }

  return {
    uuid,
    name,
    method,
    fragment,
    status,
    source,
    apiJson: apiJsonValue as ApiJson | undefined,
    ...(layout ? { layout } : {}),
    createdAt: readString(value.createdAt) || readString(value.created_at),
    updatedAt: readString(value.updatedAt) || readString(value.updated_at),
    enterpriseUuid: readString(value.enterpriseUuid) || readString(value.enterprise_uuid),
    appUuid: readString(value.appUuid) || readString(value.app_uuid)
  };
}

function normalizeBuiltInApiRecord(value: unknown): MokelayApiRecord {
  if (!isRecord(value)) {
    throw new Error('Invalid API record.');
  }

  return normalizeApiRecord({
    uuid: value.uuid,
    name: value.alias,
    method: value.method,
    fragment: value.fragment === true,
    status: 'published',
    source: 'system',
    apiJson: value
  });
}

function normalizeApiBuilderSampleRecord(value: unknown): ApiBuilderSampleRecord {
  if (!isRecord(value)) {
    throw new Error('Invalid API Builder sample record.');
  }

  const uuid = readString(value.uuid);
  const apiJsonValue = isRecord(value.apiJson)
    ? value.apiJson
    : isRecord(value.api_json)
      ? value.api_json
      : undefined;

  if (!uuid || !apiJsonValue) {
    throw new Error('Invalid API Builder sample record.');
  }

  return {
    uuid,
    title: readString(value.title) || uuid,
    description: readString(value.description),
    method: readString(value.method).toUpperCase() || readString(apiJsonValue.method).toUpperCase() || 'GET',
    apiJson: apiJsonValue as ApiJson,
    sortOrder: readNumber(value.sortOrder ?? value.sort_order, 0),
    createdAt: readString(value.createdAt) || readString(value.created_at),
    updatedAt: readString(value.updatedAt) || readString(value.updated_at)
  };
}

function normalizeApifoxProjectRecord(value: unknown): ApifoxProjectRecord | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = readLooseString(value.id) ||
    readLooseString(value.projectId) ||
    readLooseString(value.project_id);

  if (!id) {
    return undefined;
  }

  return {
    id,
    name: readString(value.name) || readString(value.title) || id,
    raw: value
  };
}

function normalizePagination(value: unknown): MokelayApisPagination {
  const record = isRecord(value) ? value : {};

  return {
    page: readNumber(record.page, 1),
    pageSize: readNumber(record.pageSize, 20),
    total: readNumber(record.total, 0),
    totalPages: readNumber(record.totalPages, 0),
    hasPreviousPage: Boolean(record.hasPreviousPage),
    hasNextPage: Boolean(record.hasNextPage)
  };
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readLooseString(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function readNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
