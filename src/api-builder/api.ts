import { apiClient } from '@/composables/useApi';
import type { ApiDetail, ApiJson, ApiSummary, DatabaseTableSchema, TestRequestDraft } from './types';

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

function unwrapApiResponse<T>(value: MokelayApiResponse<T>): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid API response.');
  }

  if (value.ok === true) {
    return value.data;
  }

  const code = typeof value.error?.code === 'string' ? value.error.code : '';
  const message = typeof value.error?.message === 'string' ? value.error.message : '';
  throw new Error(message || code || 'API request failed.');
}

export async function listOrchestrationApis() {
  const response = await apiClient.get<MokelayApiResponse<{ apis: ApiSummary[] }>>('/api/orchestration/apis');
  return unwrapApiResponse(response.data).apis;
}

export async function createOrchestrationApi(payload: {
  uuid: string;
  alias?: string;
  method?: string;
  sourceUuid?: string;
  apiJson?: ApiJson;
}) {
  const response = await apiClient.post<MokelayApiResponse<{ api: ApiDetail }>>('/api/orchestration/apis', payload);
  return unwrapApiResponse(response.data).api;
}

export async function getOrchestrationApi(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<{ api: ApiDetail }>>(`/api/orchestration/apis/${encodeURIComponent(uuid)}`);
  return unwrapApiResponse(response.data).api;
}

export async function saveOrchestrationApiDraft(uuid: string, apiJson: ApiJson, builderState: Record<string, unknown>) {
  const response = await apiClient.post<MokelayApiResponse<{ api: ApiDetail }>>(`/api/orchestration/apis/${encodeURIComponent(uuid)}/draft`, {
    apiJson,
    builderState
  });
  return unwrapApiResponse(response.data).api;
}

export async function publishOrchestrationApi(uuid: string, apiJson: ApiJson, builderState: Record<string, unknown>, options: {
  changeNote?: string;
  dangerAccepted?: boolean;
}) {
  const response = await apiClient.post<MokelayApiResponse<{ api: ApiDetail }>>(`/api/orchestration/apis/${encodeURIComponent(uuid)}/publish`, {
    apiJson,
    builderState,
    changeNote: options.changeNote ?? '',
    dangerAccepted: options.dangerAccepted === true
  });
  return unwrapApiResponse(response.data).api;
}

export async function rollbackOrchestrationApi(uuid: string, version: number) {
  const response = await apiClient.post<MokelayApiResponse<{ api: ApiDetail }>>(`/api/orchestration/apis/${encodeURIComponent(uuid)}/rollback`, {
    version
  });
  return unwrapApiResponse(response.data).api;
}

export async function testOrchestrationApi(uuid: string, apiJson: ApiJson, request: TestRequestDraft, dangerAccepted: boolean) {
  const response = await apiClient.post<MokelayApiResponse<unknown>>(`/api/orchestration/apis/${encodeURIComponent(uuid)}/test`, {
    apiJson,
    request,
    dangerAccepted
  });
  return unwrapApiResponse(response.data);
}

export async function listDatasources() {
  const response = await apiClient.get<{ datasources?: unknown }>('/api/database/datasources');
  return Array.isArray(response.data.datasources)
    ? response.data.datasources.filter((item): item is string => typeof item === 'string')
    : [];
}

export async function getDatabaseSchema(datasource?: string) {
  const response = await apiClient.get<{ tables?: unknown }>('/api/database/schema', {
    params: datasource ? { datasource } : undefined
  });
  return Array.isArray(response.data.tables) ? response.data.tables as DatabaseTableSchema[] : [];
}
