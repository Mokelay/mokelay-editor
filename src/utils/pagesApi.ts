import type { OutputData } from '@editorjs/editorjs';
import { apiClient } from '@/composables/useApi';
import {
  normalizePageDataSources,
  type PageDataSourceConfig
} from '@/utils/pageRuntimeContext';

export type MokelayPage = {
  uuid: string;
  name: string;
  blocks: OutputData['blocks'];
  dataSources?: PageDataSourceConfig[];
  appUuid?: string | null;
  layoutUuid?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePagePayload = {
  uuid?: string;
  name: string;
  blocks: OutputData['blocks'];
  dataSources?: PageDataSourceConfig[];
};

export type UpdatePagePayload = {
  name: string;
  blocks: OutputData['blocks'];
  dataSources?: PageDataSourceConfig[];
};

export type UpdatePageLayoutPayload = {
  appUuid?: string | null;
  layoutUuid?: string | null;
};

export type PageSource = 'user' | 'system';

export type PageListItem = {
  uuid: string;
  name: string;
  source: PageSource;
};

type PageResponse = {
  page?: unknown;
};

type PagesResponse = {
  pages?: unknown;
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

export async function createPage(payload: CreatePagePayload) {
  const response = await apiClient.post<MokelayApiResponse<PageResponse>>('/api/mokelay/create_page', payload);
  return normalizePageResponse(unwrapApiResponse(response.data));
}

export async function getPage(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<PageResponse>>('/api/mokelay/read_page_by_uuid', {
    params: {
      uuid
    }
  });
  return normalizePageResponse(unwrapApiResponse(response.data));
}

export async function getSystemPage(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<PageResponse>>('/api/mokelay/read_mokelay_page_json', {
    params: {
      uuid
    }
  });
  return normalizePageResponse(unwrapApiResponse(response.data));
}

export async function listPages(params: { page?: number; pageSize?: number } = {}) {
  const response = await apiClient.get<MokelayApiResponse<PagesResponse>>('/api/mokelay/list_pages', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100
    }
  });
  return normalizePageList(unwrapApiResponse(response.data), 'user');
}

export async function listSystemPages() {
  const response = await apiClient.get<MokelayApiResponse<PagesResponse>>('/api/mokelay/list_mokelay_page_jsons');
  return normalizePageList(unwrapApiResponse(response.data), 'system');
}

export async function updatePage(uuid: string, payload: UpdatePagePayload) {
  const response = await apiClient.post<MokelayApiResponse<PageResponse>>('/api/mokelay/update_page_blocks_by_uuid', payload, {
    params: {
      uuid
    }
  });
  return normalizePageResponse(unwrapApiResponse(response.data));
}

export async function updatePageLayout(uuid: string, payload: UpdatePageLayoutPayload) {
  const response = await apiClient.post<MokelayApiResponse<PageResponse>>('/api/mokelay/update_page_layout_by_uuid', payload, {
    params: {
      uuid
    }
  });
  return normalizePageResponse(unwrapApiResponse(response.data));
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

function normalizePageResponse(value: PageResponse): MokelayPage {
  const page = value.page;

  if (page === null) {
    throw new Error('Page not found.');
  }

  return normalizePage(page);
}

function normalizePageList(value: PagesResponse, source: PageSource): PageListItem[] {
  if (!Array.isArray(value.pages)) return [];

  return value.pages.flatMap((item): PageListItem[] => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const uuid = readString(record.uuid)?.trim() ?? '';
    if (!uuid) return [];
    return [{
      uuid,
      name: readString(record.name)?.trim() ?? uuid,
      source
    }];
  });
}

function normalizePage(page: unknown): MokelayPage {
  if (typeof page !== 'object' || page === null || Array.isArray(page)) {
    throw new Error('Invalid page response.');
  }

  const record = page as Record<string, unknown>;
  const uuid = typeof record.uuid === 'string' ? record.uuid : '';

  if (!uuid) {
    throw new Error('Invalid page response.');
  }

  return {
    uuid,
    name: typeof record.name === 'string' ? record.name : '',
    blocks: Array.isArray(record.blocks) ? record.blocks as OutputData['blocks'] : [],
    dataSources: normalizePageDataSources(record.dataSources ?? record.data_sources),
    appUuid: readString(record.appUuid) ?? readString(record.app_uuid) ?? null,
    layoutUuid: readString(record.layoutUuid) ?? readString(record.layout_uuid) ?? null,
    createdAt: readString(record.createdAt) ?? readString(record.created_at),
    updatedAt: readString(record.updatedAt) ?? readString(record.updated_at)
  };
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}
