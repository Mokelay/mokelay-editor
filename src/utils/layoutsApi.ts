import type { OutputData } from '@editorjs/editorjs';
import { apiClient } from '@/composables/useApi';
import type { PageSource } from '@/utils/pagesApi';
import {
  normalizePageDataSources,
  type PageDataSourceConfig
} from '@/utils/pageRuntimeContext';

export type LayoutMenuItem = {
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  caret?: boolean;
  highlight?: boolean;
  tone?: string;
  children?: LayoutMenuItem[];
  [key: string]: unknown;
};

export type StaticMenuResource = {
  type: 'static';
  items: LayoutMenuItem[];
};

export type ApiDatasourceMenuResource = {
  type: 'api';
  ds?: Record<string, unknown>;
  itemsPath?: string;
};

export type LayoutResource = StaticMenuResource | ApiDatasourceMenuResource;

export type LayoutBlock = {
  id?: string;
  type: string;
  data?: Record<string, unknown>;
  events?: unknown[];
  slots?: Record<string, LayoutBlock[]>;
};

export type MokelayLayout = {
  schemaVersion: 1;
  uuid: string;
  name: string;
  resources?: {
    mainMenu?: LayoutResource;
    [key: string]: LayoutResource | undefined;
  };
  auth?: {
    enabled: boolean;
    endpoint?: string;
  };
  blocks: LayoutBlock[];
  createdAt?: string;
  updatedAt?: string;
};

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

export type RenderBundlePage = {
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

export type PageRenderBundle = {
  page: RenderBundlePage | null;
  layout: MokelayLayout | null;
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
  { label: '首页', href: '/' },
  { label: '价格', href: '/pricing' }
];

export function createDefaultLayoutJson(uuid: string, name: string): MokelayLayout {
  return {
    schemaVersion: 1,
    uuid,
    name,
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
          brand: { text: 'Mokelay', href: '/' },
          items: { template: '{{resources.mainMenu.items}}' },
          guestActions: [
            { id: 'login', type: 'MLink', data: { text: '登录', url: '/login' } },
            {
              id: 'register',
              type: 'MButton',
              data: {
                label: '注册',
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
  };
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
  const data = unwrapApiResponse(response.data);

  return {
    page: normalizeBundlePage(data.page),
    layout: data.layout === null || data.layout === undefined ? null : normalizeLayoutJson(data.layout)
  };
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

function normalizeLayoutResponse(value: LayoutResponse): MokelayLayoutRecord {
  return normalizeLayoutRecord(value.layout);
}

function normalizeSystemLayout(value: unknown): MokelayLayout {
  if (isRecord(value) && (isRecord(value.layoutJson) || isRecord(value.layout_json))) {
    return normalizeLayoutRecord(value).layoutJson;
  }

  return normalizeLayoutJson(value);
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

export function normalizeLayoutJson(value: unknown, fallbackUuid = '', fallbackName = ''): MokelayLayout {
  const source = isRecord(value) ? value : {};
  const uuid = readString(source.uuid) || fallbackUuid;
  const name = readString(source.name) || fallbackName;

  return {
    schemaVersion: 1,
    ...cloneRecord(source),
    uuid,
    name,
    resources: normalizeResources(source.resources),
    auth: normalizeAuth(source.auth),
    blocks: normalizeLayoutBlocks(source.blocks)
  };
}

function normalizeResources(value: unknown): MokelayLayout['resources'] | undefined {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value)
    .map(([key, resource]) => [key, normalizeResource(resource)] as const)
    .filter((entry): entry is readonly [string, LayoutResource] => Boolean(entry[1]));

  return entries.length ? Object.fromEntries(entries) : undefined;
}

function normalizeResource(value: unknown): LayoutResource | undefined {
  if (!isRecord(value)) return undefined;

  if (value.type === 'static') {
    return {
      type: 'static',
      items: normalizeMenuItems(value.items)
    };
  }

  if (value.type === 'api') {
    return {
      type: 'api',
      ds: isRecord(value.ds) ? cloneRecord(value.ds) : undefined,
      itemsPath: readString(value.itemsPath)
    };
  }

  return undefined;
}

function normalizeAuth(value: unknown): MokelayLayout['auth'] | undefined {
  if (!isRecord(value)) return undefined;

  return {
    enabled: value.enabled === true,
    endpoint: readString(value.endpoint) || '/api/mokelay/me'
  };
}

export function normalizeMenuItems(value: unknown): LayoutMenuItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => {
      const normalized: LayoutMenuItem = {
        ...cloneRecord(item),
        label: readString(item.label) || readString(item.name) || '',
        href: readString(item.href) || readString(item.url) || '#',
        active: item.active === true,
        children: normalizeMenuItems(item.children)
      };
      const badge = readString(item.badge);
      const tone = readString(item.tone);

      if (badge) normalized.badge = badge;
      if (typeof item.caret === 'boolean') normalized.caret = item.caret;
      if (item.highlight === true) normalized.highlight = true;
      if (tone) normalized.tone = tone;

      return normalized;
    })
    .filter((item) => item.label);
}

function normalizeLayoutBlocks(value: unknown): LayoutBlock[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((block): block is Record<string, unknown> => isRecord(block))
    .map((block) => ({
      id: readString(block.id),
      type: readString(block.type) || 'unknown',
      data: isRecord(block.data) ? cloneRecord(block.data) : {},
      events: Array.isArray(block.events) ? cloneValue(block.events) : undefined,
      slots: normalizeLayoutBlockSlots(block.slots)
    }));
}

function normalizeLayoutBlockSlots(value: unknown): Record<string, LayoutBlock[]> | undefined {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value)
    .map(([slotName, blocks]) => [slotName, normalizeLayoutBlocks(blocks)] as const)
    .filter((entry): entry is readonly [string, LayoutBlock[]] => entry[1].length > 0);

  return entries.length ? Object.fromEntries(entries) : undefined;
}

function normalizeBundlePage(value: unknown): RenderBundlePage | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) {
    throw new Error('Invalid page bundle response.');
  }

  const uuid = readString(value.uuid);
  if (!uuid) {
    throw new Error('Invalid page bundle response.');
  }

  return {
    uuid,
    name: readString(value.name) || '',
    blocks: Array.isArray(value.blocks) ? value.blocks as OutputData['blocks'] : [],
    dataSources: normalizePageDataSources(value.dataSources ?? value.data_sources),
    appUuid: readString(value.appUuid) ?? readString(value.app_uuid) ?? null,
    layoutUuid: readString(value.layoutUuid) ?? readString(value.layout_uuid) ?? null,
    subPage: readBoolean(value.subPage ?? value.sub_page),
    quotes: normalizeStringArray(value.quotes),
    dependencies: normalizeStringArray(value.dependencies),
    createdAt: readString(value.createdAt) ?? readString(value.created_at),
    updatedAt: readString(value.updatedAt) ?? readString(value.updated_at)
  };
}

function normalizeStringArray(value: unknown): string[] {
  let source = value;
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source) as unknown;
    } catch {
      source = [];
    }
  }
  if (!Array.isArray(source)) return [];
  return [...new Set(source
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean))];
}

function readBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return typeof value === 'string' && ['1', 'true', 'yes'].includes(value.trim().toLowerCase());
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

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneRecord(value: Record<string, unknown>) {
  return cloneValue(value);
}
