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

type PageResponse = {
  page?: unknown;
};

export async function createPage(payload: CreatePagePayload) {
  const response = await apiClient.post<PageResponse>('/api/pages', payload);
  return normalizePageResponse(response.data);
}

export async function getPage(uuid: string) {
  const response = await apiClient.get<PageResponse>(`/api/pages/${encodeURIComponent(uuid)}`);
  return normalizePageResponse(response.data);
}

export async function updatePage(uuid: string, payload: UpdatePagePayload) {
  const response = await apiClient.patch<PageResponse>(`/api/pages/${encodeURIComponent(uuid)}`, payload);
  return normalizePageResponse(response.data);
}

function normalizePageResponse(value: PageResponse): MokelayPage {
  const page = value.page;

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
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined
  };
}
