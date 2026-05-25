import type { ApiBuilderStatus, ApiJson } from '@/api-builder/types';
import { apiClient } from '@/composables/useApi';

export type MokelayApiRecord = {
  uuid: string;
  name: string;
  method: string;
  status: ApiBuilderStatus;
  apiJson?: ApiJson;
  createdAt: string;
  updatedAt: string;
};

export type ListApisParams = {
  page: number;
  pageSize: number;
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

export type SaveApiPayload = {
  apiJson: ApiJson;
  status: ApiBuilderStatus;
  originalUuid?: string;
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
  const response = await apiClient.get<MokelayApiResponse<ApisResponse>>('/api/mokelay/list_apis', {
    params
  });
  return normalizeApisResponse(unwrapApiResponse(response.data));
}

export async function getApi(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<ApiResponse>>('/api/mokelay/read_api_by_uuid', {
    params: {
      uuid
    }
  });
  return normalizeApiResponse(unwrapApiResponse(response.data));
}

export async function saveApi(payload: SaveApiPayload) {
  const apiJson = payload.apiJson;
  const response = await apiClient.post<MokelayApiResponse<ApiResponse>>('/api/mokelay/save_api', {
    uuid: apiJson.uuid,
    ...(payload.originalUuid ? { originalUuid: payload.originalUuid } : {}),
    name: apiJson.alias || '未命名 API',
    method: String(apiJson.method || 'GET').toUpperCase(),
    status: payload.status,
    apiJson
  });

  return normalizeApiResponse(unwrapApiResponse(response.data));
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

function normalizeApiRecord(value: unknown): MokelayApiRecord {
  if (!isRecord(value)) {
    throw new Error('Invalid API record.');
  }

  const uuid = readString(value.uuid);
  const name = readString(value.name) || '未命名 API';
  const method = readString(value.method).toUpperCase() || 'GET';
  const status = value.status === 'published' ? 'published' : 'draft';
  const apiJsonValue = isRecord(value.apiJson)
    ? value.apiJson
    : isRecord(value.api_json)
      ? value.api_json
      : undefined;

  if (!uuid) {
    throw new Error('Invalid API record.');
  }

  return {
    uuid,
    name,
    method,
    status,
    apiJson: apiJsonValue as ApiJson | undefined,
    createdAt: readString(value.createdAt) || readString(value.created_at),
    updatedAt: readString(value.updatedAt) || readString(value.updated_at)
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

function readNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
