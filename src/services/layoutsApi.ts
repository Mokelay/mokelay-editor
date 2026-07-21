import { apiClient } from '@/composables/useApi';
import {
  normalizeLayoutJson,
  normalizePageRenderBundle,
  normalizeSystemLayout,
  type LayoutBlock,
  type LayoutMenuItem,
  type MokelayLayout,
  type PageRenderBundle
} from 'mokelay-components/layouts';
import type { PageSource } from 'mokelay-components/pages';

export type {
  LayoutBlock,
  LayoutMenuItem,
  MokelayLayout,
  PageRenderBundle,
  RenderBundlePage
} from 'mokelay-components/layouts';

export type MokelayLayoutRecord = {
  uuid: string;
  name: string;
  layoutJson: MokelayLayout;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateLayoutPayload = {
  uuid: string;
  name: string;
  layoutJson: MokelayLayout;
};

export type UpdateLayoutPayload = {
  name: string;
  layoutJson: MokelayLayout;
};

export type ListLayoutsParams = {
  page: number;
  pageSize: number;
};

export type LayoutsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ListLayoutsResult = {
  layouts: MokelayLayoutRecord[];
  pagination: LayoutsPagination;
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

type LayoutResponse = {
  layout?: unknown;
  affected?: unknown;
};

type LayoutsResponse = {
  layouts?: unknown;
  pagination?: unknown;
};

type BundleResponse = {
  page?: unknown;
  layout?: unknown;
};

const defaultMainMenu: LayoutMenuItem[] = [
  { label: { $i18n: { 'zh-CN': '首页', 'en-US': 'Home' } }, href: '/' } as unknown as LayoutMenuItem,
  { label: { $i18n: { 'zh-CN': '价格', 'en-US': 'Pricing' } }, href: '/pricing' } as unknown as LayoutMenuItem
];

export function createDefaultLayoutJson(uuid: string, name: string): MokelayLayout {
  return {
    schemaVersion: 1,
    uuid,
    name,
    localeConfig: {
      defaultLocale: 'zh-CN',
      supportedLocales: ['zh-CN', 'en-US']
    },
    resources: {
      mainMenu: {
        type: 'static',
        items: defaultMainMenu
      }
    },
    auth: {
      enabled: true,
      endpoint: '/api/mokelay/me'
    },
    blocks: [
      {
        id: 'top-nav',
        type: 'MSiteTopNav',
        data: {
          brand: { text: { $i18n: { 'zh-CN': 'Mokelay', 'en-US': 'Mokelay' } }, href: '/' },
          items: { template: '{{resources.mainMenu.items}}' },
          guestActions: [
            { id: 'login', type: 'MLink', data: { text: { $i18n: { 'zh-CN': '登录', 'en-US': 'Log in' } }, url: '/login' } },
            {
              id: 'register',
              type: 'MButton',
              data: {
                label: { $i18n: { 'zh-CN': '注册', 'en-US': 'Sign up' } },
                variant: 'primary',
                action: { type: 'link', url: '/register' }
              }
            }
          ],
          userActions: [
            {
              id: 'dashboard',
              type: 'MLink',
              data: { text: '{{auth.user.name}}', url: '/dashboard' }
            }
          ]
        }
      },
      {
        id: 'page-content',
        type: 'MPageSlot',
        data: { name: 'default' }
      }
    ]
  } as unknown as MokelayLayout;
}

export async function createLayout(payload: CreateLayoutPayload) {
  const response = await apiClient.post<MokelayApiResponse<LayoutResponse>>('/api/mokelay/create_layout', payload);
  return normalizeLayoutResponse(unwrapApiResponse(response.data));
}

export async function updateLayout(uuid: string, payload: UpdateLayoutPayload) {
  const response = await apiClient.post<MokelayApiResponse<LayoutResponse>>('/api/mokelay/update_layout_by_uuid', payload, {
    params: { uuid }
  });
  return normalizeLayoutResponse(unwrapApiResponse(response.data));
}

export async function getLayout(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<LayoutResponse>>('/api/mokelay/read_layout_by_uuid', {
    params: { uuid }
  });
  return normalizeLayoutResponse(unwrapApiResponse(response.data));
}

export async function getSystemLayout(uuid: string) {
  const response = await apiClient.get<MokelayApiResponse<LayoutResponse>>('/api/mokelay/read_mokelay_layout_json', {
    params: { uuid }
  });
  const data = unwrapApiResponse(response.data);

  if (data.layout === null || data.layout === undefined) {
    throw new Error('Layout not found.');
  }

  return normalizeSystemLayout(data.layout);
}

export async function listLayouts(params: ListLayoutsParams) {
  const response = await apiClient.get<MokelayApiResponse<LayoutsResponse>>('/api/mokelay/list_layouts', {
    params
  });
  return normalizeLayoutsResponse(unwrapApiResponse(response.data));
}

export async function listSystemLayouts(): Promise<MokelayLayoutRecord[]> {
  const response = await apiClient.get<MokelayApiResponse<LayoutsResponse>>('/api/mokelay/list_mokelay_layout_jsons');
  const data = unwrapApiResponse(response.data);

  return Array.isArray(data.layouts)
    ? data.layouts.map((layout) => normalizeLayoutRecord(layout))
    : [];
}

export async function deleteLayout(uuid: string) {
  const response = await apiClient.post<MokelayApiResponse<{ affected?: unknown; message?: unknown }>>('/api/mokelay/delete_layout_by_uuid', {
    uuid
  });
  return unwrapApiResponse(response.data);
}

export async function getPageRenderBundle(uuid: string, source: PageSource = 'user'): Promise<PageRenderBundle> {
  const response = await apiClient.get<MokelayApiResponse<BundleResponse>>('/api/mokelay/render_page_bundle', {
    params: { uuid, source }
  });
  return normalizePageRenderBundle(unwrapApiResponse(response.data));
}

function unwrapApiResponse<T>(value: MokelayApiResponse<T>): T {
  if (!isRecord(value)) {
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

function normalizeLayoutResponse(value: LayoutResponse): MokelayLayoutRecord {
  return normalizeLayoutRecord(value.layout);
}

function normalizeLayoutsResponse(value: LayoutsResponse): ListLayoutsResult {
  const layouts = Array.isArray(value.layouts) ? value.layouts.map((layout) => normalizeLayoutRecord(layout)) : [];

  return {
    layouts,
    pagination: normalizePagination(value.pagination)
  };
}

function normalizeLayoutRecord(value: unknown): MokelayLayoutRecord {
  if (!isRecord(value)) {
    throw new Error('Invalid layout response.');
  }

  const uuid = readString(value.uuid);
  const name = readString(value.name) || '';
  if (!uuid) {
    throw new Error('Invalid layout response.');
  }

  const createdAt = readString(value.createdAt) ?? readString(value.created_at);
  const updatedAt = readString(value.updatedAt) ?? readString(value.updated_at);
  const layoutJson = normalizeLayoutJson(value.layoutJson ?? value.layout_json, uuid, name);

  return {
    uuid,
    name,
    layoutJson: {
      ...layoutJson,
      createdAt,
      updatedAt
    },
    createdAt,
    updatedAt
  };
}

function normalizePagination(value: unknown): LayoutsPagination {
  const record = isRecord(value) ? value : {};

  return {
    page: readNumber(record.page),
    pageSize: readNumber(record.pageSize),
    total: readNumber(record.total),
    totalPages: readNumber(record.totalPages),
    hasPreviousPage: record.hasPreviousPage === true,
    hasNextPage: record.hasNextPage === true
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  return 0;
}
