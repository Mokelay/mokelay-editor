import type { OutputData } from '@editorjs/editorjs';
import { apiClient } from '@/composables/useApi';

export type MokelayPage = {
  uuid: string;
  name: string;
  blocks: OutputData['blocks'];
  appUuid?: string | null;
  layoutUuid?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePagePayload = {
  uuid?: string;
  name: string;
  blocks: OutputData['blocks'];
};

export type UpdatePagePayload = {
  name: string;
  blocks: OutputData['blocks'];
};

export type UpdatePageLayoutPayload = {
  appUuid?: string | null;
  layoutUuid?: string | null;
};

export type ListPagesParams = {
  page: number;
  pageSize: number;
};

export type PageSource = 'user' | 'system';

export type MokelayPagesPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ListPagesResult = {
  pages: MokelayPage[];
  pagination: MokelayPagesPagination;
};

export type DeletePageResult = {
  affected: number;
  message: string;
};

type PageResponse = {
  page?: unknown;
};

type PagesResponse = {
  pages?: unknown;
  pagination?: unknown;
  count?: unknown;
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

export async function listPages(params: ListPagesParams) {
  const response = await apiClient.get<MokelayApiResponse<PagesResponse>>('/api/mokelay/list_pages', {
    params
  });
  return normalizePagesResponse(unwrapApiResponse(response.data));
}

export async function listSystemPages(params: ListPagesParams) {
  const response = await apiClient.get<MokelayApiResponse<PagesResponse>>('/api/mokelay/list_mokelay_page_jsons');
  const normalized = normalizePagesResponse(unwrapApiResponse(response.data));
  const page = Math.max(1, Math.floor(params.page));
  const pageSize = Math.max(1, Math.floor(params.pageSize));
  const total = normalized.pages.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const start = (page - 1) * pageSize;

  return {
    pages: normalized.pages.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: totalPages > 0 && page < totalPages
    }
  };
}

export async function deletePage(uuid: string) {
  const response = await apiClient.post<MokelayApiResponse<DeleteResponse>>('/api/mokelay/delete_page_by_uuid', {
    uuid
  });
  return normalizeDeleteResponse(unwrapApiResponse(response.data));
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

function normalizePagesResponse(value: PagesResponse): ListPagesResult {
  const pages = Array.isArray(value.pages) ? value.pages.map((page) => normalizePage(page)) : [];

  return {
    pages,
    pagination: normalizePagination(value.pagination)
  };
}

function normalizeDeleteResponse(value: DeleteResponse): DeletePageResult {
  return {
    affected: readAffected(value.affected),
    message: typeof value.message === 'string' ? value.message : ''
  };
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
    appUuid: readString(record.appUuid) ?? readString(record.app_uuid) ?? null,
    layoutUuid: readString(record.layoutUuid) ?? readString(record.layout_uuid) ?? null,
    createdAt: readString(record.createdAt) ?? readString(record.created_at),
    updatedAt: readString(record.updatedAt) ?? readString(record.updated_at)
  };
}

function normalizePagination(value: unknown): MokelayPagesPagination {
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

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function readAffected(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  return 0;
}
