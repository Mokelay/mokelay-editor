import { apiClient } from '@/composables/useApi';

export type MokelayApp = {
  id: number;
  uuid: string;
  alias: string;
  description: string;
  defaultLayoutUuid?: string | null;
  enterpriseUuid?: string;
};

export type CreateAppPayload = {
  uuid: string;
  alias: string;
  description: string;
};

export type UpdateAppPayload = {
  alias: string;
  description: string;
};

export type ListAppsParams = {
  page: number;
  pageSize: number;
};

export type MokelayAppsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ListAppsResult = {
  apps: MokelayApp[];
  pagination: MokelayAppsPagination;
};

type AppResponse = {
  app?: unknown;
};

type AppsResponse = {
  apps?: unknown;
  pagination?: unknown;
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

export async function createApp(payload: CreateAppPayload) {
  const response = await apiClient.post<MokelayApiResponse<AppResponse>>('/api/mokelay/create_app', payload);
  return normalizeAppResponse(unwrapApiResponse(response.data));
}

export async function updateApp(uuid: string, payload: UpdateAppPayload) {
  const response = await apiClient.post<MokelayApiResponse<AppResponse>>('/api/mokelay/update_app_by_uuid', payload, {
    params: { uuid }
  });
  return normalizeAppResponse(unwrapApiResponse(response.data));
}

export async function listApps(params: ListAppsParams) {
  const response = await apiClient.get<MokelayApiResponse<AppsResponse>>('/api/mokelay/list_apps', {
    params
  });
  return normalizeAppsResponse(unwrapApiResponse(response.data));
}

export async function getApp(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<AppResponse>>('/api/mokelay/read_app_by_uuid', {
    params: { uuid }
  });
  return normalizeAppResponse(unwrapApiResponse(response.data));
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

function normalizeAppResponse(value: AppResponse): MokelayApp {
  const app = value.app;

  if (app === null) {
    throw new Error('App not found.');
  }

  return normalizeApp(app);
}

function normalizeAppsResponse(value: AppsResponse): ListAppsResult {
  const apps = Array.isArray(value.apps) ? value.apps.map((app) => normalizeApp(app)) : [];

  return {
    apps,
    pagination: normalizePagination(value.pagination)
  };
}

function normalizeApp(app: unknown): MokelayApp {
  if (typeof app !== 'object' || app === null || Array.isArray(app)) {
    throw new Error('Invalid app response.');
  }

  const record = app as Record<string, unknown>;
  const id = readNumber(record.id);
  const uuid = typeof record.uuid === 'string' ? record.uuid : '';

  if (!id || !uuid) {
    throw new Error('Invalid app response.');
  }

  return {
    id,
    uuid,
    alias: typeof record.alias === 'string' ? record.alias : '',
    description: typeof record.description === 'string' ? record.description : '',
    defaultLayoutUuid: typeof record.defaultLayoutUuid === 'string' ? record.defaultLayoutUuid : null,
    enterpriseUuid: typeof record.enterpriseUuid === 'string' ? record.enterpriseUuid : ''
  };
}

function normalizePagination(value: unknown): MokelayAppsPagination {
  const record = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  return {
    page: readNumber(record.page),
    pageSize: readNumber(record.pageSize),
    total: readNumber(record.total),
    totalPages: readNumber(record.totalPages),
    hasPreviousPage: record.hasPreviousPage === true,
    hasNextPage: record.hasNextPage === true
  };
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  return 0;
}
