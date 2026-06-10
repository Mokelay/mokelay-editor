import { apiClient } from '@/composables/useApi';

export type DatasourceColumnSchema = {
  name: string;
  type: string;
  dataType: string;
};

export type DatasourceTableSchema = {
  name: string;
  columns: DatasourceColumnSchema[];
};

export type MokelayDatasource = {
  id: number;
  uuid: string;
  alias: string;
  description: string;
  schema: DatasourceTableSchema[];
};

export type CreateDatasourcePayload = {
  uuid: string;
  alias: string;
  description: string;
};

export type UpdateDatasourcePayload = {
  alias: string;
  description: string;
};

export type ListDatasourcesParams = {
  page: number;
  pageSize: number;
};

export type MokelayDatasourcesPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ListDatasourcesResult = {
  datasources: MokelayDatasource[];
  pagination: MokelayDatasourcesPagination;
};

type DatasourceResponse = {
  datasource?: unknown;
};

type DatasourcesResponse = {
  datasources?: unknown;
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

export async function createDatasource(payload: CreateDatasourcePayload) {
  const response = await apiClient.post<MokelayApiResponse<DatasourceResponse>>('/api/mokelay/create_datasource', payload);
  return normalizeDatasourceResponse(unwrapApiResponse(response.data));
}

export async function updateDatasource(uuid: string, payload: UpdateDatasourcePayload) {
  const response = await apiClient.post<MokelayApiResponse<DatasourceResponse>>('/api/mokelay/update_datasource_by_uuid', payload, {
    params: { uuid }
  });
  return normalizeDatasourceResponse(unwrapApiResponse(response.data));
}

export async function syncDatasourceSchema(uuid: string) {
  const response = await apiClient.post<MokelayApiResponse<DatasourceResponse>>('/api/mokelay/sync_datasource_schema', undefined, {
    params: { uuid }
  });
  return normalizeDatasourceResponse(unwrapApiResponse(response.data));
}

export async function listDatasources(params: ListDatasourcesParams) {
  const response = await apiClient.get<MokelayApiResponse<DatasourcesResponse>>('/api/mokelay/list_datasources', {
    params
  });
  return normalizeDatasourcesResponse(unwrapApiResponse(response.data));
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

function normalizeDatasourceResponse(value: DatasourceResponse): MokelayDatasource {
  if (value.datasource === null || value.datasource === undefined) {
    throw new Error('Datasource not found.');
  }

  return normalizeDatasource(value.datasource);
}

function normalizeDatasourcesResponse(value: DatasourcesResponse): ListDatasourcesResult {
  return {
    datasources: Array.isArray(value.datasources)
      ? value.datasources.map((datasource) => normalizeDatasource(datasource))
      : [],
    pagination: normalizePagination(value.pagination)
  };
}

function normalizeDatasource(value: unknown): MokelayDatasource {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid datasource response.');
  }

  const record = value as Record<string, unknown>;
  const id = readNumber(record.id);
  const uuid = typeof record.uuid === 'string' ? record.uuid : '';

  if (!id || !uuid) {
    throw new Error('Invalid datasource response.');
  }

  return {
    id,
    uuid,
    alias: typeof record.alias === 'string' ? record.alias : '',
    description: typeof record.description === 'string' ? record.description : '',
    schema: normalizeSchema(record.schema)
  };
}

function normalizeSchema(value: unknown): DatasourceTableSchema[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((table) => {
    if (typeof table !== 'object' || table === null || Array.isArray(table)) {
      throw new Error('Invalid datasource schema response.');
    }

    const tableRecord = table as Record<string, unknown>;
    const name = typeof tableRecord.name === 'string' ? tableRecord.name : '';

    if (!name || !Array.isArray(tableRecord.columns)) {
      throw new Error('Invalid datasource schema response.');
    }

    return {
      name,
      columns: tableRecord.columns.map((column) => normalizeColumn(column))
    };
  });
}

function normalizeColumn(value: unknown): DatasourceColumnSchema {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid datasource schema response.');
  }

  const record = value as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name : '';
  const type = typeof record.type === 'string' ? record.type : '';
  const dataType = typeof record.dataType === 'string' ? record.dataType : type;

  if (!name || !type) {
    throw new Error('Invalid datasource schema response.');
  }

  return { name, type, dataType };
}

function normalizePagination(value: unknown): MokelayDatasourcesPagination {
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
