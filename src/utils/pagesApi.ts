import type { OutputData } from '@editorjs/editorjs';
import { apiClient } from '@/composables/useApi';
import {
  normalizePageDataSources,
  type PageDataSourceConfig
} from '@/utils/pageRuntimeContext';
import { validatePageSlug } from '@/utils/pageSlug';

export type MokelayPage = {
  uuid: string;
  name: string;
  blocks: OutputData['blocks'];
  dataSources?: PageDataSourceConfig[];
  appUuid?: string | null;
  layoutUuid?: string | null;
  subPage: boolean;
  quotes: string[];
  dependencies: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePagePayload = {
  uuid: string;
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
  subPage: boolean;
  quotes: string[];
  dependencies: string[];
};

export type PageListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  uuid?: string;
  name?: string;
  subPage?: boolean;
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
    details?: unknown;
  };
};

type MokelayApiResponse<T> = MokelaySuccessResponse<T> | MokelayErrorResponse;

export class MokelayApiError extends Error {
  readonly code: string;
  readonly details: unknown;

  constructor(message: string, code = '', details?: unknown) {
    super(message);
    this.name = 'MokelayApiError';
    this.code = code;
    this.details = details;
  }
}

export function formatMokelayApiError(error: unknown, fallback = '') {
  if (!(error instanceof Error)) return fallback;
  if (!(error instanceof MokelayApiError)) return error.message || fallback;
  const details = describeApiErrorDetails(error.details);
  return details ? `${error.message || error.code || fallback}（${details}）` : error.message || error.code || fallback;
}

export async function createPage(payload: CreatePagePayload) {
  const slug = validatePageSlug(payload.uuid);
  if (!slug.valid) {
    throw new Error(slug.message);
  }
  const response = await apiClient.post<MokelayApiResponse<PageResponse>>('/api/mokelay/create_page', {
    ...payload,
    uuid: slug.value
  });
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

export async function listPages(params: PageListParams = {}) {
  const response = await apiClient.get<MokelayApiResponse<PagesResponse>>('/api/mokelay/list_pages', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
      ...(typeof params.uuid === 'string' && params.uuid.trim()
        ? { uuid: params.uuid.trim() }
        : {}),
      ...(typeof (params.name ?? params.query) === 'string' && (params.name ?? params.query)?.trim()
        ? { name: (params.name ?? params.query)?.trim() }
        : {}),
      ...(typeof params.subPage === 'boolean' ? { subPage: params.subPage ? '1' : '0' } : {})
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
    throw new MokelayApiError(message || code || 'API request failed.', code, value.error?.details);
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
      source,
      subPage: readBoolean(record.subPage ?? record.sub_page),
      quotes: normalizeUuidList(record.quotes),
      dependencies: normalizeUuidList(record.dependencies)
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
    subPage: readBoolean(record.subPage ?? record.sub_page),
    quotes: normalizeUuidList(record.quotes),
    dependencies: normalizeUuidList(record.dependencies),
    createdAt: readString(record.createdAt) ?? readString(record.created_at),
    updatedAt: readString(record.updatedAt) ?? readString(record.updated_at)
  };
}

function normalizeUuidList(value: unknown): string[] {
  const parsed = typeof value === 'string'
    ? parseJsonArray(value)
    : value;
  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean))];
}

function parseJsonArray(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function readBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.trim().toLowerCase());
  }
  return false;
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function describeApiErrorDetails(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value === undefined ? '' : stringifyDetail(value);
  }

  const details = value as Record<string, unknown>;
  const parts: string[] = [];
  addDetail(parts, '路径', details.path ?? details.referencePath);
  addDetail(parts, '页面 UUID', details.pageUuid ?? details.pageUUID ?? details.targetUuid ?? details.uuid);
  addDetail(parts, '环路径', details.cyclePath ?? details.cycle ?? details.pathUuids);
  addDetail(parts, '引用方', details.referencedBy ?? details.parents ?? details.quotes);
  addDetail(parts, '页面 UUID', details.pageUuids);
  if (Array.isArray(details.pages)) {
    const referencedPages = details.pages.map((item) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) return stringifyDetail(item);
      const record = item as Record<string, unknown>;
      const uuid = stringifyDetail(record.pageUuid ?? record.uuid);
      const quotes = stringifyDetail(record.quotes ?? record.referencedBy);
      return quotes ? `${uuid} ← ${quotes}` : uuid;
    }).filter(Boolean);
    addDetail(parts, '引用关系', referencedPages);
  }

  if (!parts.length) {
    try {
      return JSON.stringify(details);
    } catch {
      return String(details);
    }
  }
  return parts.join('；');
}

function addDetail(parts: string[], label: string, value: unknown) {
  const text = stringifyDetail(value);
  if (text) parts.push(`${label}: ${text}`);
}

function stringifyDetail(value: unknown): string {
  if (Array.isArray(value)) return value.map(stringifyDetail).filter(Boolean).join(' → ');
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
