import { expect } from '@playwright/test';
import type { Locator, Page, Route } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PageDataSourceConfig } from '../../src/utils/pageRuntimeContext';

export const storageKey = 'mokelay-editor-config';
export const defaultPageUuid = '00000000-0000-4000-8000-000000000000';
export const defaultEditorHash = `/pages/${defaultPageUuid}`;
export const defaultEditorUrl = `/#${defaultEditorHash}`;

export type SavedBlock = {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
  events?: Array<{
    event: string;
    actions: Array<Record<string, unknown>>;
  }>;
};

export type MockMokelayPage = {
  uuid: string;
  name: string;
  blocks: SavedBlock[];
  dataSources?: PageDataSourceConfig[];
  appUuid?: string | null;
  layoutUuid?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MockMokelayApp = {
  id: number;
  uuid: string;
  alias: string;
  description: string;
  defaultLayoutUuid?: string | null;
};

export type MockMokelayLayout = {
  uuid: string;
  name: string;
  layoutJson: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type MockDatasourceTableSchema = {
  name: string;
  columns: Array<{ name: string; type: string; dataType: string }>;
};

export type MockMokelayDatasource = {
  id: number;
  uuid: string;
  alias: string;
  description: string;
  schema_data: MockDatasourceTableSchema[];
};

export type MockMokelayApi = {
  uuid: string;
  name: string;
  method: string;
  status: 'draft' | 'published';
  apiJson: Record<string, unknown>;
  layout?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  source?: 'user' | 'system';
};

export type MockApiDomain = {
  uuid: string;
  alias: string;
  host: string;
};

export type MockApiSnapshot = {
  apiUuid: string;
  name: string;
  method: string;
  status: 'draft' | 'published';
  apiJson: Record<string, unknown>;
  createdAt: string;
};

export type MockApiBuilderSample = {
  uuid: string;
  title: string;
  description: string;
  method: string;
  apiJson: Record<string, unknown>;
  status?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MockAiGenerateDslResponse =
  | {
      type?: 'success';
      data: Record<string, unknown>;
    }
  | {
      type: 'error';
      code: string;
      message: string;
    };

type MockPagesApiOptions = {
  createUuid?: string;
  initialRoute?: string;
  pages?: MockMokelayPage[];
  systemPages?: MockMokelayPage[];
  apps?: MockMokelayApp[];
  layouts?: MockMokelayLayout[];
  systemLayouts?: MockMokelayLayout[];
  loggedInUser?: Record<string, unknown> | null;
  datasources?: MockMokelayDatasource[];
  syncedDatasourceSchemas?: Record<string, MockDatasourceTableSchema[]>;
  datasourceSyncErrors?: string[];
  apis?: MockMokelayApi[];
  systemApis?: MockMokelayApi[];
  apiDomains?: MockApiDomain[];
  apiBuilderSamples?: MockApiBuilderSample[];
  aiGenerateDslResponses?: MockAiGenerateDslResponse[];
  seedDefaultPage?: boolean;
  apiDelays?: {
    listApis?: number;
    readApi?: number;
  };
};

type BoundingBox = Awaited<ReturnType<Locator['boundingBox']>>;

export async function resetEditor(page: Page, apiOptions: MockPagesApiOptions = {}) {
  const initialRoute = apiOptions.initialRoute ?? defaultEditorUrl;
  const apiState = await mockPagesApi(page, apiOptions);
  await page.goto(initialRoute);
  await page.evaluate(({ key, initialHash }) => {
    localStorage.removeItem(key);
    window.location.hash = initialHash;
  }, {
    key: storageKey,
    initialHash: routeToHash(initialRoute)
  });
  await page.reload();
  return apiState;
}

export async function mockPagesApi(page: Page, options: MockPagesApiOptions = {}) {
  await page.unroute('**/api/mokelay/**').catch(() => undefined);

  const now = '2026-05-06T00:00:00.000Z';
  const pages = new Map<string, MockMokelayPage>();
  const systemPages = new Map<string, MockMokelayPage>();
  const apps = new Map<string, MockMokelayApp>();
  const layouts = new Map<string, MockMokelayLayout>();
  const systemLayouts = new Map<string, MockMokelayLayout>();
  const datasources = new Map<string, MockMokelayDatasource>();
  const apis = new Map<string, MockMokelayApi>();
  const systemApis = new Map<string, MockMokelayApi>();
  const apiDomains = new Map<string, MockApiDomain>();
  const apiBuilderSamples = new Map<string, MockApiBuilderSample>();
  const apiSnapshots: MockApiSnapshot[] = [];
  const pageCreatePayloads: Record<string, unknown>[] = [];
  const pageUpdatePayloads: Record<string, unknown>[] = [];
  const pageLayoutUpdatePayloads: Record<string, unknown>[] = [];
  const layoutDeletePayloads: Record<string, unknown>[] = [];
  const apiSavePayloads: Record<string, unknown>[] = [];
  const apiDomainRequests: string[] = [];
  const apiListRequests: string[] = [];
  const apiBuilderSampleRequests: string[] = [];
  const systemApiReadRequests: string[] = [];
  const aiGenerateDslRequests: Record<string, unknown>[] = [];
  let aiGenerateDslResponseIndex = 0;
  const corsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-type': 'application/json'
  };

  for (const pageRecord of options.pages ?? []) {
    pages.set(pageRecord.uuid, {
      createdAt: now,
      updatedAt: now,
      ...pageRecord
    });
  }

  for (const pageRecord of getSeedSystemPages(options.systemPages)) {
    systemPages.set(pageRecord.uuid, {
      createdAt: now,
      updatedAt: now,
      ...pageRecord
    });
  }

  if (shouldSeedDefaultPage(options) && !pages.has(defaultPageUuid)) {
    pages.set(defaultPageUuid, {
      uuid: defaultPageUuid,
      name: 'Default DSL page',
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'Welcome to the Mokelay editor starter template.'
          }
        }
      ],
      createdAt: now,
      updatedAt: now
    });
  }

  for (const appRecord of options.apps ?? []) {
    apps.set(appRecord.uuid, appRecord);
  }

  for (const layoutRecord of options.layouts ?? []) {
    layouts.set(layoutRecord.uuid, {
      createdAt: now,
      updatedAt: now,
      ...layoutRecord
    });
  }

  for (const layoutRecord of getSeedSystemLayouts(options.systemLayouts)) {
    systemLayouts.set(layoutRecord.uuid, {
      createdAt: now,
      updatedAt: now,
      ...layoutRecord
    });
  }

  for (const datasourceRecord of options.datasources ?? []) {
    datasources.set(datasourceRecord.uuid, datasourceRecord);
  }

  for (const domainRecord of options.apiDomains ?? [defaultApiDomain()]) {
    apiDomains.set(domainRecord.uuid, domainRecord);
  }

  for (const apiRecord of options.apis ?? []) {
    apis.set(apiRecord.uuid, {
      createdAt: now,
      updatedAt: now,
      layout: defaultApiLayout(),
      ...apiRecord
    });
  }

  for (const apiRecord of options.systemApis ?? []) {
    systemApis.set(apiRecord.uuid, {
      ...apiRecord,
      source: 'system'
    });
  }

  for (const sampleRecord of options.apiBuilderSamples ?? []) {
    apiBuilderSamples.set(sampleRecord.uuid, {
      status: 'active',
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
      ...sampleRecord
    });
  }

  await page.route('**/api/mokelay/**', async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders
      });
      return;
    }

    const url = new URL(request.url());

    if (method === 'GET' && url.pathname === '/api/mokelay/me') {
      const user = options.loggedInUser ?? null;
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          data: {
            loggedIn: Boolean(user),
            user
          }
        })
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/ai-generate-dsl') {
      const payload = readJsonPayload(request.postDataJSON());
      aiGenerateDslRequests.push(payload);
      const responseConfig = options.aiGenerateDslResponses?.[aiGenerateDslResponseIndex++] ?? {
        data: defaultAiGenerateDslResponse()
      };

      if (responseConfig.type === 'error') {
        await fulfillApiError(route, responseConfig.code, responseConfig.message, corsHeaders);
        return;
      }

      await fulfillAiGenerateDsl(route, responseConfig.data, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/create_page') {
      const payload = readJsonPayload(request.postDataJSON());
      pageCreatePayloads.push(payload);
      const requestedUuid = readString(payload.uuid);

      if (requestedUuid && pages.has(requestedUuid)) {
        await fulfillApiError(route, 'BLOCK_DUPLICATE_RECORD', '页面标识已存在。', corsHeaders);
        return;
      }

      const pageRecord: MockMokelayPage = {
        uuid: requestedUuid || options.createUuid || defaultPageUuid,
        name: typeof payload.name === 'string' ? payload.name : '',
        blocks: Array.isArray(payload.blocks) ? payload.blocks as SavedBlock[] : [],
        createdAt: now,
        updatedAt: now
      };
      pages.set(pageRecord.uuid, pageRecord);
      await fulfillPage(route, pageRecord, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/create_app') {
      const payload = readJsonPayload(request.postDataJSON());
      const nextId = nextAppId(apps);
      const appRecord: MockMokelayApp = {
        id: nextId,
        uuid: readString(payload.uuid).trim(),
        alias: readString(payload.alias).trim(),
        description: readString(payload.description).trim()
      };
      apps.set(appRecord.uuid, appRecord);
      await fulfillApp(route, appRecord, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/create_layout') {
      const payload = readJsonPayload(request.postDataJSON());
      const uuid = readString(payload.uuid).trim();
      const layoutRecord: MockMokelayLayout = {
        uuid,
        name: readString(payload.name).trim(),
        layoutJson: isRecord(payload.layoutJson) ? payload.layoutJson : {},
        createdAt: now,
        updatedAt: now
      };
      layouts.set(uuid, layoutRecord);
      await fulfillLayout(route, layoutRecord, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/update_layout_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const existing = layouts.get(uuid);
      if (!existing) {
        await fulfillLayout(route, null, corsHeaders);
        return;
      }
      const payload = readJsonPayload(request.postDataJSON());
      const updated: MockMokelayLayout = {
        ...existing,
        name: readString(payload.name).trim(),
        layoutJson: isRecord(payload.layoutJson) ? payload.layoutJson : existing.layoutJson,
        updatedAt: now
      };
      layouts.set(uuid, updated);
      await fulfillLayout(route, updated, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/delete_layout_by_uuid') {
      const payload = readJsonPayload(request.postDataJSON());
      layoutDeletePayloads.push(payload);
      const uuid = readString(payload.uuid);
      const affected = layouts.delete(uuid) ? 1 : 0;
      await fulfillDeleteLayout(route, affected, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/update_app_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const existing = apps.get(uuid);
      if (!existing) {
        await fulfillApp(route, null, corsHeaders);
        return;
      }
      const payload = readJsonPayload(request.postDataJSON());
      const updated: MockMokelayApp = {
        ...existing,
        alias: readString(payload.alias).trim(),
        description: readString(payload.description).trim()
      };
      apps.set(uuid, updated);
      await fulfillApp(route, updated, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/create_datasource') {
      const payload = readJsonPayload(request.postDataJSON());
      const nextId = nextDatasourceId(datasources);
      const datasourceRecord: MockMokelayDatasource = {
        id: nextId,
        uuid: readString(payload.uuid).trim(),
        alias: readString(payload.alias).trim(),
        description: readString(payload.description).trim(),
        schema_data: []
      };
      datasources.set(datasourceRecord.uuid, datasourceRecord);
      await fulfillDatasource(route, datasourceRecord, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/update_datasource_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const existing = datasources.get(uuid);
      if (!existing) {
        await fulfillDatasource(route, null, corsHeaders);
        return;
      }
      const payload = readJsonPayload(request.postDataJSON());
      const updated: MockMokelayDatasource = {
        ...existing,
        alias: readString(payload.alias).trim(),
        description: readString(payload.description).trim()
      };
      datasources.set(uuid, updated);
      await fulfillDatasource(route, updated, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/sync_datasource_schema') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const existing = datasources.get(uuid);
      if (!existing) {
        await fulfillDatasource(route, null, corsHeaders);
        return;
      }
      if (options.datasourceSyncErrors?.includes(uuid)) {
        await fulfillApiError(route, 'BLOCK_DATASOURCE_URL_MISSING', `${uuid}_DATABASE_URL is not configured.`, corsHeaders);
        return;
      }
      const updated: MockMokelayDatasource = {
        ...existing,
        schema_data: options.syncedDatasourceSchemas?.[uuid] ?? []
      };
      datasources.set(uuid, updated);
      await fulfillDatasource(route, updated, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_datasources') {
      const pageNumber = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const records = Array.from(datasources.values()).sort((a, b) => b.id - a.id);
      const start = Math.max(pageNumber - 1, 0) * pageSize;
      await fulfillDatasources(route, records.slice(start, start + pageSize), {
        page: pageNumber,
        pageSize,
        total: records.length
      }, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_apps') {
      const pageNumber = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const appRecords = Array.from(apps.values())
        .sort((a, b) => b.id - a.id);
      const start = Math.max(pageNumber - 1, 0) * pageSize;
      const pageItems = appRecords.slice(start, start + pageSize);
      await fulfillApps(route, pageItems, {
        page: pageNumber,
        pageSize,
        total: appRecords.length
      }, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/read_layout_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      await fulfillLayout(route, layouts.get(uuid) ?? null, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_layouts') {
      const pageNumber = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const layoutRecords = Array.from(layouts.values())
        .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
      const start = Math.max(pageNumber - 1, 0) * pageSize;
      const pageItems = layoutRecords.slice(start, start + pageSize);
      await fulfillLayouts(route, pageItems, {
        page: pageNumber,
        pageSize,
        total: layoutRecords.length
      }, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/render_page_bundle') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const source = url.searchParams.get('source') ?? 'user';
      const pageRecord = source === 'system' ? systemPages.get(uuid) ?? null : pages.get(uuid) ?? null;
      const availableLayouts = source === 'system'
        ? new Map([...layouts.entries(), ...systemLayouts.entries()])
        : layouts;
      const layoutRecord = pageRecord ? resolveMockLayout(pageRecord, apps, availableLayouts) : null;
      await fulfillPageBundle(route, pageRecord, layoutRecord, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/read_page_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const pageRecord = pages.get(uuid);
      if (!pageRecord) {
        await fulfillPage(route, null, corsHeaders);
        return;
      }
      await fulfillPage(route, pageRecord, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_pages') {
      const pageNumber = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const uuid = (url.searchParams.get('uuid') ?? '').trim();
      const name = (url.searchParams.get('name') ?? '').trim();
      const createdAtBegin = (url.searchParams.get('created_at_begin') ?? '').trim();
      const createdAtEnd = (url.searchParams.get('created_at_end') ?? '').trim();
      const pageRecords = Array.from(pages.values())
        .filter((pageRecord) => !uuid || pageRecord.uuid === uuid)
        .filter((pageRecord) => !name || pageRecord.name === name)
        .filter((pageRecord) => !createdAtBegin || (pageRecord.createdAt ?? '') >= createdAtBegin)
        .filter((pageRecord) => !createdAtEnd || (pageRecord.createdAt ?? '') <= createdAtEnd)
        .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
      const start = Math.max(pageNumber - 1, 0) * pageSize;
      const pageItems = pageRecords.slice(start, start + pageSize);
      await fulfillPages(route, pageItems, {
        page: pageNumber,
        pageSize,
        total: pageRecords.length
      }, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_mokelay_page_jsons') {
      const pageRecords = Array.from(systemPages.values())
        .sort((a, b) => a.uuid.localeCompare(b.uuid));
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          data: {
            pages: pageRecords.map((pageRecord) => ({
              uuid: pageRecord.uuid,
              name: pageRecord.name,
              blocks: pageRecord.blocks,
              appUuid: pageRecord.appUuid ?? null,
              layoutUuid: pageRecord.layoutUuid ?? null,
              createdAt: pageRecord.createdAt,
              updatedAt: pageRecord.updatedAt
            })),
            count: pageRecords.length
          }
        })
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_mokelay_layout_jsons') {
      const layoutRecords = Array.from(systemLayouts.values())
        .sort((a, b) => a.uuid.localeCompare(b.uuid));
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          data: {
            layouts: layoutRecords.map(serializeLayout),
            count: layoutRecords.length
          }
        })
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_api_domains') {
      apiDomainRequests.push(request.url());
      await fulfillApiDomains(route, Array.from(apiDomains.values()), corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_api_builder_samples') {
      apiBuilderSampleRequests.push(request.url());
      const pageNumber = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 100);
      const sampleRecords = Array.from(apiBuilderSamples.values())
        .filter((sampleRecord) => (sampleRecord.status ?? 'active') === 'active')
        .sort((a, b) => (
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
          || (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
          || a.uuid.localeCompare(b.uuid)
        ));
      const start = Math.max(pageNumber - 1, 0) * pageSize;
      const pageItems = sampleRecords.slice(start, start + pageSize);
      await fulfillApiBuilderSamples(route, pageItems, {
        page: pageNumber,
        pageSize,
        total: sampleRecords.length
      }, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_apis') {
      apiListRequests.push(request.url());
      const pageNumber = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const apiRecords = Array.from(apis.values())
        .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
      const start = Math.max(pageNumber - 1, 0) * pageSize;
      const pageItems = apiRecords.slice(start, start + pageSize);
      await delay(options.apiDelays?.listApis);
      await fulfillApis(route, pageItems, {
        page: pageNumber,
        pageSize,
        total: apiRecords.length
      }, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/list_mokelay_api_jsons') {
      apiListRequests.push(request.url());
      const apiRecords = Array.from(systemApis.values());
      await delay(options.apiDelays?.listApis);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: {
            apis: apiRecords.map((apiRecord) => apiRecord.apiJson),
            count: apiRecords.length
          }
        })
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/read_api_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      await delay(options.apiDelays?.readApi);
      await fulfillApi(route, apis.get(uuid) ?? null, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/read_mokelay_api_json') {
      systemApiReadRequests.push(request.url());
      const uuid = url.searchParams.get('uuid') ?? '';
      await delay(options.apiDelays?.readApi);
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          data: {
            api: systemApis.get(uuid)?.apiJson ?? null
          }
        })
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/read_mokelay_page_json') {
      const uuid = url.searchParams.get('uuid') ?? '';
      await fulfillPage(route, systemPages.get(uuid) ?? null, corsHeaders);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mokelay/read_mokelay_layout_json') {
      const uuid = url.searchParams.get('uuid') ?? '';
      await fulfillLayout(route, systemLayouts.get(uuid) ?? null, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/update_page_blocks_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const existingPage = pages.get(uuid);
      if (!existingPage) {
        await fulfillPage(route, null, corsHeaders);
        return;
      }
      const payload = readJsonPayload(request.postDataJSON());
      pageUpdatePayloads.push({
        uuid,
        ...payload
      });
      const pageRecord = {
        ...existingPage,
        name: typeof payload.name === 'string' ? payload.name : existingPage.name,
        blocks: Array.isArray(payload.blocks) ? payload.blocks as SavedBlock[] : existingPage.blocks,
        updatedAt: now
      };
      pages.set(uuid, pageRecord);
      await fulfillPage(route, pageRecord, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/update_page_layout_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      const existingPage = pages.get(uuid);
      if (!existingPage) {
        await fulfillPage(route, null, corsHeaders);
        return;
      }
      const payload = readJsonPayload(request.postDataJSON());
      pageLayoutUpdatePayloads.push({
        uuid,
        ...payload
      });
      const pageRecord = {
        ...existingPage,
        appUuid: readNullableString(payload.appUuid),
        layoutUuid: readNullableString(payload.layoutUuid),
        updatedAt: now
      };
      pages.set(uuid, pageRecord);
      await fulfillPage(route, pageRecord, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/delete_page_by_uuid') {
      const payload = readJsonPayload(request.postDataJSON());
      const uuid = readString(payload.uuid);
      const affected = pages.delete(uuid) ? 1 : 0;
      await fulfillDeletePage(route, affected, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/save_api') {
      const payload = readJsonPayload(request.postDataJSON());
      apiSavePayloads.push(payload);
      const apiJson = readJsonPayload(payload.apiJson);
      const uuid = readString(payload.uuid) || readString(apiJson.uuid);
      const existingApi = apis.get(uuid);
      const originalUuid = readString(payload.originalUuid);

      if (existingApi && originalUuid !== uuid) {
        await fulfillApiError(route, 'BLOCK_UNIQUE_CONFLICT', 'API 标识已存在。', corsHeaders);
        return;
      }

      const methodName = (readString(payload.method) || readString(apiJson.method) || 'GET').toUpperCase();
      const status = payload.status === 'published' ? 'published' : 'draft';
      const layout = normalizeMockApiLayout(payload.layout);
      const apiRecord: MockMokelayApi = {
        uuid,
        name: readString(payload.name) || readString(apiJson.alias) || '未命名 API',
        method: methodName,
        status,
        apiJson: {
          ...apiJson,
          uuid,
          method: methodName
        },
        layout,
        createdAt: existingApi?.createdAt ?? now,
        updatedAt: now
      };
      apis.set(uuid, apiRecord);
      apiSnapshots.push({
        apiUuid: uuid,
        name: apiRecord.name,
        method: apiRecord.method,
        status,
        apiJson: apiRecord.apiJson,
        createdAt: now
      });
      await fulfillApi(route, apiRecord, corsHeaders);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mokelay/delete_api_by_uuid') {
      const payload = readJsonPayload(request.postDataJSON());
      const uuid = readString(payload.uuid);
      const affected = apis.delete(uuid) ? 1 : 0;
      await fulfillDeleteApi(route, affected, corsHeaders);
      return;
    }

    await route.fulfill({
      status: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' })
    });
  });

  return { pages, systemPages, apps, layouts, systemLayouts, datasources, apis, systemApis, apiDomains, apiBuilderSamples, apiSnapshots, pageCreatePayloads, pageUpdatePayloads, pageLayoutUpdatePayloads, layoutDeletePayloads, apiSavePayloads, apiDomainRequests, apiListRequests, apiBuilderSampleRequests, systemApiReadRequests, aiGenerateDslRequests };
}

export async function seedSavedConfig(page: Page, config: Record<string, unknown>) {
  await page.evaluate(async ({ key, value, uuid }) => {
    localStorage.setItem(key, JSON.stringify(value));
    await fetch(`/api/mokelay/update_page_blocks_by_uuid?uuid=${encodeURIComponent(uuid)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Seeded DSL page',
        blocks: Array.isArray(value.blocks) ? value.blocks : []
      })
    });
    window.location.hash = `/pages/${uuid}`;
  }, {
    key: storageKey,
    value: config,
    uuid: defaultPageUuid
  });
  await page.reload();
}

export async function getSavedBlocks(page: Page) {
  const saveButton = page.getByTestId('save-button');
  if (await saveButton.count()) {
    await expect(saveButton).toBeEnabled();
  }

  let storedConfig = '';
  await expect.poll(async () => {
    const value = await page.evaluate((key) => localStorage.getItem(key), storageKey);
    storedConfig = value ?? '';
    return value;
  }).not.toBeNull();

  const parsed = JSON.parse(storedConfig ?? '{}') as {
    blocks?: SavedBlock[];
  };

  return Array.isArray(parsed.blocks) ? parsed.blocks : [];
}

export async function waitForSaveToFinish(page: Page) {
  await expect(page.getByTestId('save-button')).toBeEnabled();
}

export async function switchLocaleToChinese(page: Page) {
  const languageSelect = page.getByTestId('layout-top-nav-control-language');
  await expect(languageSelect).toBeVisible();
  await languageSelect.selectOption('zh');
}

export async function openAddMenu(page: Page) {
  const blocks = page.locator('.ce-block');
  await expect(blocks).toHaveCount(1);
  await blocks.nth(0).click();
  await page.locator('.ce-toolbar__plus').click();
}

export async function addEditorTool(page: Page, toolTitle: string | RegExp) {
  await openAddMenu(page);
  const menuItem = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: toolTitle });
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

export async function expectToolToolbarBeside(page: Page, toolTestId: string) {
  const tool = page.getByTestId(toolTestId);
  await tool.hover();

  const plusButton = page.locator('.ce-toolbar__plus');
  const settingsButton = page.locator('.ce-toolbar__settings-btn');

  await expect(plusButton).toBeVisible();
  await expect(settingsButton).toBeVisible();

  expectToolbarBesideTool(
    await tool.boundingBox(),
    await plusButton.boundingBox(),
    await settingsButton.boundingBox()
  );

  return {
    plusButton,
    settingsButton
  };
}

export async function openToolPropertyPanel(page: Page, toolTestId: string) {
  const { settingsButton } = await expectToolToolbarBeside(page, toolTestId);
  await settingsButton.click();

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: /属性|Properties/ });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-panel')).toBeVisible();

  return propertyDialog;
}

export async function openToolEventsPanel(page: Page, toolTestId: string) {
  const { settingsButton } = await expectToolToolbarBeside(page, toolTestId);
  await settingsButton.click();

  const eventButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: /事件|Events/ });
  await expect(eventButton).toBeVisible();
  await eventButton.click();

  const eventsDialog = page.locator('[data-testid="tool-events-dialog"][open]');
  await expect(eventsDialog).toBeVisible();
  await expect(eventsDialog.getByTestId('tool-events-panel')).toBeVisible();

  return eventsDialog;
}

export async function fillEventRow(
  eventsDialog: Locator,
  index: number,
  values: { event?: string }
) {
  if (values.event !== undefined) {
    await eventsDialog.getByTestId(`tool-event-input-${index}-event`).fill(values.event);
  }
}

function expectToolbarBesideTool(
  toolBox: BoundingBox,
  plusBox: BoundingBox,
  settingsBox: BoundingBox
) {
  expect(toolBox).not.toBeNull();
  expect(plusBox).not.toBeNull();
  expect(settingsBox).not.toBeNull();

  const toolCenterY = toolBox!.y + toolBox!.height / 2;
  const plusCenterY = plusBox!.y + plusBox!.height / 2;
  const settingsCenterY = settingsBox!.y + settingsBox!.height / 2;
  const allowedVerticalOffset = Math.max(toolBox!.height / 2, 18);

  expect(plusBox!.x).toBeLessThan(toolBox!.x);
  expect(settingsBox!.x).toBeLessThan(toolBox!.x);
  expect(Math.abs(plusCenterY - toolCenterY)).toBeLessThanOrEqual(allowedVerticalOffset);
  expect(Math.abs(settingsCenterY - toolCenterY)).toBeLessThanOrEqual(allowedVerticalOffset);
}

function readJsonPayload(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function defaultApiLayout() {
  return {
    version: 1,
    nodes: {}
  };
}

function defaultApiDomain(): MockApiDomain {
  return {
    uuid: 'mokelay',
    alias: 'Mokelay 域名',
    host: 'https://api.mokelay.com'
  };
}

function getSeedSystemPages(overrides: MockMokelayPage[] = []) {
  return mergeByUuid(
    [
      readSystemPageAsset('home'),
      readSystemPageAsset('mokelay_app_create_page'),
      readSystemPageAsset('mokelay_app_edit_page')
    ],
    overrides
  );
}

function getSeedSystemLayouts(overrides: MockMokelayLayout[] = []) {
  return mergeByUuid(
    [
      readSystemLayoutAsset('mokelay_layout')
    ],
    overrides
  );
}

function mergeByUuid<TRecord extends { uuid: string }>(defaults: TRecord[], overrides: TRecord[]) {
  const records = new Map<string, TRecord>();
  defaults.forEach((record) => records.set(record.uuid, record));
  overrides.forEach((record) => records.set(record.uuid, record));
  return [...records.values()];
}

function readSystemPageAsset(uuid: string): MockMokelayPage {
  const value = readServerAssetJson('mokelay-pages', `${uuid}.json`);
  return {
    uuid: readString(value.uuid),
    name: readString(value.name),
    blocks: Array.isArray(value.blocks) ? value.blocks as SavedBlock[] : [],
    appUuid: readNullableString(value.appUuid ?? value.app_uuid),
    layoutUuid: readNullableString(value.layoutUuid ?? value.layout_uuid),
    createdAt: readString(value.createdAt ?? value.created_at),
    updatedAt: readString(value.updatedAt ?? value.updated_at)
  };
}

function readSystemLayoutAsset(uuid: string): MockMokelayLayout {
  const value = readServerAssetJson('mokelay-layouts', `${uuid}.json`);
  return {
    uuid: readString(value.uuid),
    name: readString(value.name),
    layoutJson: value,
    createdAt: readString(value.createdAt ?? value.created_at),
    updatedAt: readString(value.updatedAt ?? value.updated_at)
  };
}

function readServerAssetJson(assetDir: 'mokelay-pages' | 'mokelay-layouts', fileName: string) {
  const candidates = [
    resolve(process.cwd(), '../mokelay-server/server/assets', assetDir, fileName),
    resolve(process.cwd(), 'submodule/mokelay-server/server/assets', assetDir, fileName)
  ];
  const assetPath = candidates.find((candidate) => existsSync(candidate));

  if (!assetPath) {
    throw new Error(`Missing Mokelay server asset: ${assetDir}/${fileName}`);
  }

  return readJsonPayload(JSON.parse(readFileSync(assetPath, 'utf8')));
}

function defaultAiGenerateDslResponse() {
  return {
    version: 1,
    status: 'complete',
    summary: 'Generated DSL.',
    pages: [],
    apis: [],
    upgradePlan: {
      processors: [],
      blocks: [],
      actions: [],
      controls: [],
      components: []
    },
    traceability: [],
    assumptions: [],
    warnings: []
  };
}

function normalizeMockApiLayout(value: unknown): Record<string, unknown> {
  const layout = readJsonPayload(value);

  if (layout.version !== 1 || typeof layout.nodes !== 'object' || layout.nodes === null || Array.isArray(layout.nodes)) {
    return defaultApiLayout();
  }

  return layout;
}

function routeToHash(route: string) {
  const hashIndex = route.indexOf('#');

  if (hashIndex === -1) {
    return '/';
  }

  const hash = route.slice(hashIndex + 1);
  return hash.startsWith('/') ? hash || '/' : `/${hash}`;
}

function shouldSeedDefaultPage(options: MockPagesApiOptions) {
  if (typeof options.seedDefaultPage === 'boolean') {
    return options.seedDefaultPage;
  }

  const initialRoute = options.initialRoute ?? defaultEditorUrl;
  return routeToHash(initialRoute) === defaultEditorHash;
}

function nextAppId(apps: Map<string, MockMokelayApp>) {
  return Math.max(0, ...Array.from(apps.values()).map((app) => app.id)) + 1;
}

function nextDatasourceId(datasources: Map<string, MockMokelayDatasource>) {
  return Math.max(0, ...Array.from(datasources.values()).map((datasource) => datasource.id)) + 1;
}

function resolveMockLayout(
  pageRecord: MockMokelayPage,
  apps: Map<string, MockMokelayApp>,
  layouts: Map<string, MockMokelayLayout>
) {
  if (pageRecord.layoutUuid && layouts.has(pageRecord.layoutUuid)) {
    return layouts.get(pageRecord.layoutUuid) ?? null;
  }

  const app = pageRecord.appUuid ? apps.get(pageRecord.appUuid) : undefined;
  if (app?.defaultLayoutUuid && layouts.has(app.defaultLayoutUuid)) {
    return layouts.get(app.defaultLayoutUuid) ?? null;
  }

  return null;
}

async function delay(ms = 0) {
  if (ms <= 0) return;
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fulfillApp(
  route: Route,
  appRecord: MockMokelayApp | null,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        app: appRecord
      }
    })
  });
}

async function fulfillApps(
  route: Route,
  appRecords: MockMokelayApp[],
  paginationInput: { page: number; pageSize: number; total: number },
  headers: Record<string, string>
) {
  const totalPages = paginationInput.total > 0 ? Math.ceil(paginationInput.total / paginationInput.pageSize) : 0;

  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        apps: appRecords,
        pagination: {
          page: paginationInput.page,
          pageSize: paginationInput.pageSize,
          total: paginationInput.total,
          totalPages,
          hasPreviousPage: paginationInput.page > 1,
          hasNextPage: paginationInput.page < totalPages
        }
      }
    })
  });
}

async function fulfillLayout(
  route: Route,
  layoutRecord: MockMokelayLayout | null,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        layout: layoutRecord ? serializeLayout(layoutRecord) : null
      }
    })
  });
}

async function fulfillLayouts(
  route: Route,
  layoutRecords: MockMokelayLayout[],
  paginationInput: { page: number; pageSize: number; total: number },
  headers: Record<string, string>
) {
  const totalPages = paginationInput.total > 0 ? Math.ceil(paginationInput.total / paginationInput.pageSize) : 0;

  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        layouts: layoutRecords.map(serializeLayout),
        pagination: {
          page: paginationInput.page,
          pageSize: paginationInput.pageSize,
          total: paginationInput.total,
          totalPages,
          hasPreviousPage: paginationInput.page > 1,
          hasNextPage: paginationInput.page < totalPages
        }
      }
    })
  });
}

async function fulfillDatasource(
  route: Route,
  datasourceRecord: MockMokelayDatasource | null,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        datasource: datasourceRecord
      }
    })
  });
}

async function fulfillDatasources(
  route: Route,
  datasourceRecords: MockMokelayDatasource[],
  paginationInput: { page: number; pageSize: number; total: number },
  headers: Record<string, string>
) {
  const totalPages = paginationInput.total > 0 ? Math.ceil(paginationInput.total / paginationInput.pageSize) : 0;
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        datasources: datasourceRecords,
        pagination: {
          page: paginationInput.page,
          pageSize: paginationInput.pageSize,
          total: paginationInput.total,
          totalPages,
          hasPreviousPage: paginationInput.page > 1,
          hasNextPage: paginationInput.page < totalPages
        }
      }
    })
  });
}

async function fulfillPage(
  route: Route,
  pageRecord: MockMokelayPage | null,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        page: pageRecord
      }
    })
  });
}

async function fulfillPages(
  route: Route,
  pageRecords: MockMokelayPage[],
  paginationInput: { page: number; pageSize: number; total: number },
  headers: Record<string, string>
) {
  const totalPages = paginationInput.total > 0 ? Math.ceil(paginationInput.total / paginationInput.pageSize) : 0;

  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        pages: pageRecords.map((pageRecord) => ({
          uuid: pageRecord.uuid,
          name: pageRecord.name,
          blocks: pageRecord.blocks,
          appUuid: pageRecord.appUuid ?? null,
          layoutUuid: pageRecord.layoutUuid ?? null,
          created_at: pageRecord.createdAt,
          updated_at: pageRecord.updatedAt
        })),
        pagination: {
          page: paginationInput.page,
          pageSize: paginationInput.pageSize,
          total: paginationInput.total,
          totalPages,
          hasPreviousPage: paginationInput.page > 1,
          hasNextPage: paginationInput.page < totalPages
        }
      }
    })
  });
}

async function fulfillPageBundle(
  route: Route,
  pageRecord: MockMokelayPage | null,
  layoutRecord: MockMokelayLayout | null,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        page: pageRecord ? {
          uuid: pageRecord.uuid,
          name: pageRecord.name,
          blocks: pageRecord.blocks,
          dataSources: pageRecord.dataSources ?? [],
          appUuid: pageRecord.appUuid ?? null,
          layoutUuid: pageRecord.layoutUuid ?? null,
          createdAt: pageRecord.createdAt,
          updatedAt: pageRecord.updatedAt
        } : null,
        layout: layoutRecord ? {
          ...layoutRecord.layoutJson,
          uuid: layoutRecord.uuid,
          name: layoutRecord.name,
          createdAt: layoutRecord.createdAt,
          updatedAt: layoutRecord.updatedAt
        } : null
      }
    })
  });
}

function serializeLayout(layoutRecord: MockMokelayLayout) {
  return {
    uuid: layoutRecord.uuid,
    name: layoutRecord.name,
    layoutJson: {
      ...layoutRecord.layoutJson,
      uuid: layoutRecord.uuid,
      name: layoutRecord.name
    },
    layout_json: {
      ...layoutRecord.layoutJson,
      uuid: layoutRecord.uuid,
      name: layoutRecord.name
    },
    createdAt: layoutRecord.createdAt,
    updatedAt: layoutRecord.updatedAt,
    created_at: layoutRecord.createdAt,
    updated_at: layoutRecord.updatedAt
  };
}

async function fulfillApi(
  route: Route,
  apiRecord: MockMokelayApi | null,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        api: apiRecord ? serializeApi(apiRecord, true) : null
      }
    })
  });
}

async function fulfillApis(
  route: Route,
  apiRecords: MockMokelayApi[],
  paginationInput: { page: number; pageSize: number; total: number },
  headers: Record<string, string>
) {
  const totalPages = paginationInput.total > 0 ? Math.ceil(paginationInput.total / paginationInput.pageSize) : 0;

  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        apis: apiRecords.map((apiRecord) => serializeApi(apiRecord, false)),
        pagination: {
          page: paginationInput.page,
          pageSize: paginationInput.pageSize,
          total: paginationInput.total,
          totalPages,
          hasPreviousPage: paginationInput.page > 1,
          hasNextPage: paginationInput.page < totalPages
        }
      }
    })
  });
}

async function fulfillApiBuilderSamples(
  route: Route,
  sampleRecords: MockApiBuilderSample[],
  paginationInput: { page: number; pageSize: number; total: number },
  headers: Record<string, string>
) {
  const totalPages = paginationInput.total > 0 ? Math.ceil(paginationInput.total / paginationInput.pageSize) : 0;

  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        samples: sampleRecords.map(serializeApiBuilderSample),
        pagination: {
          page: paginationInput.page,
          pageSize: paginationInput.pageSize,
          total: paginationInput.total,
          totalPages,
          hasPreviousPage: paginationInput.page > 1,
          hasNextPage: paginationInput.page < totalPages
        }
      }
    })
  });
}

async function fulfillApiDomains(
  route: Route,
  domainRecords: MockApiDomain[],
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        domains: domainRecords.map((domainRecord) => ({
          uuid: domainRecord.uuid,
          alias: domainRecord.alias,
          host: domainRecord.host
        }))
      }
    })
  });
}

async function fulfillAiGenerateDsl(
  route: Route,
  data: Record<string, unknown>,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data
    })
  });
}

async function fulfillDeleteApi(
  route: Route,
  affected: number,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        affected,
        message: affected > 0 ? 'API deleted.' : 'API not found.'
      }
    })
  });
}

async function fulfillDeleteLayout(
  route: Route,
  affected: number,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        affected,
        message: affected > 0 ? 'Layout deleted.' : 'Layout not found.'
      }
    })
  });
}

async function fulfillDeletePage(
  route: Route,
  affected: number,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      data: {
        affected,
        message: affected > 0 ? 'Page deleted.' : 'Page not found.'
      }
    })
  });
}

async function fulfillApiError(
  route: Route,
  code: string,
  message: string,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      ok: false,
      error: {
        code,
        message
      }
    })
  });
}

function serializeApi(apiRecord: MockMokelayApi, includeApiJson: boolean) {
  const source = apiRecord.source === 'system' ? 'system' : 'user';

  return {
    uuid: apiRecord.uuid,
    name: apiRecord.name,
    method: apiRecord.method,
    ...(source === 'system' ? { source } : {}),
    ...(source === 'user' ? { status: apiRecord.status } : {}),
    ...(includeApiJson || source === 'system' ? { apiJson: apiRecord.apiJson } : {}),
    ...(includeApiJson && source === 'user' ? { layout: normalizeMockApiLayout(apiRecord.layout) } : {}),
    ...(source === 'user' ? { createdAt: apiRecord.createdAt, updatedAt: apiRecord.updatedAt } : {})
  };
}

function serializeApiBuilderSample(sampleRecord: MockApiBuilderSample) {
  return {
    uuid: sampleRecord.uuid,
    title: sampleRecord.title,
    description: sampleRecord.description,
    method: sampleRecord.method,
    api_json: sampleRecord.apiJson,
    status: sampleRecord.status ?? 'active',
    sort_order: sampleRecord.sortOrder ?? 0,
    created_at: sampleRecord.createdAt,
    updated_at: sampleRecord.updatedAt
  };
}
