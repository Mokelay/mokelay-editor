import type { OutputData } from '@editorjs/editorjs';
import { apiClient } from '@/composables/useApi';

export type MokelayPage = {
  uuid: string;
  name: string;
  blocks: OutputData['blocks'];
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePagePayload = {
  name: string;
  blocks: OutputData['blocks'];
};

export type UpdatePagePayload = {
  blocks: OutputData['blocks'];
};

export type ListPagesParams = {
  page: number;
  pageSize: number;
};

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

type PageResponse = {
  page?: unknown;
};

type PagesResponse = {
  pages?: unknown;
  pagination?: unknown;
};

export async function createPage(payload: CreatePagePayload) {
  const response = await apiClient.post<PageResponse>('/api/mokelay/create_page', payload);
  return normalizePageResponse(response.data);
}

export async function getPage(uuid: string) {
  const response = await apiClient.get<PageResponse>('/api/mokelay/read_page_by_uuid', {
    params: {
      uuid
    }
  });
  return normalizePageResponse(response.data);
}

export async function updatePage(uuid: string, payload: UpdatePagePayload) {
  const response = await apiClient.post<PageResponse>('/api/mokelay/update_page_blocks_by_uuid', payload, {
    params: {
      uuid
    }
  });
  return normalizePageResponse(response.data);
}

export async function listPages(params: ListPagesParams) {
  const response = await apiClient.get<PagesResponse>('/api/mokelay/list_pages', {
    params
  });
  return normalizePagesResponse(response.data);
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
