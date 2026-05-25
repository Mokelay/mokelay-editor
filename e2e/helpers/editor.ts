import { expect } from '@playwright/test';
import type { Locator, Page, Route } from '@playwright/test';

export const storageKey = 'mokelay-editor-config';
export const defaultPageUuid = '00000000-0000-4000-8000-000000000000';
export const defaultEditorHash = `/pages/${defaultPageUuid}`;
export const defaultEditorUrl = `/#${defaultEditorHash}`;

export type SavedBlock = {
  type?: string;
  data?: Record<string, unknown>;
};

export type MockMokelayPage = {
  uuid: string;
  name: string;
  blocks: SavedBlock[];
  createdAt?: string;
  updatedAt?: string;
};

export type MockMokelayApi = {
  uuid: string;
  name: string;
  method: string;
  status: 'draft' | 'published';
  apiJson: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type MockApiSnapshot = {
  apiUuid: string;
  name: string;
  method: string;
  status: 'draft' | 'published';
  apiJson: Record<string, unknown>;
  createdAt: string;
};

type MockPagesApiOptions = {
  createUuid?: string;
  initialRoute?: string;
  pages?: MockMokelayPage[];
  apis?: MockMokelayApi[];
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
  const apis = new Map<string, MockMokelayApi>();
  const apiSnapshots: MockApiSnapshot[] = [];
  const apiSavePayloads: Record<string, unknown>[] = [];
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

  for (const apiRecord of options.apis ?? []) {
    apis.set(apiRecord.uuid, {
      createdAt: now,
      updatedAt: now,
      ...apiRecord
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

    if (method === 'POST' && url.pathname === '/api/mokelay/create_page') {
      const payload = readJsonPayload(request.postDataJSON());
      const pageRecord: MockMokelayPage = {
        uuid: options.createUuid ?? defaultPageUuid,
        name: typeof payload.name === 'string' ? payload.name : '',
        blocks: Array.isArray(payload.blocks) ? payload.blocks as SavedBlock[] : [],
        createdAt: now,
        updatedAt: now
      };
      pages.set(pageRecord.uuid, pageRecord);
      await fulfillPage(route, pageRecord, corsHeaders);
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
      const pageRecords = Array.from(pages.values())
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

    if (method === 'GET' && url.pathname === '/api/mokelay/list_apis') {
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

    if (method === 'GET' && url.pathname === '/api/mokelay/read_api_by_uuid') {
      const uuid = url.searchParams.get('uuid') ?? '';
      await delay(options.apiDelays?.readApi);
      await fulfillApi(route, apis.get(uuid) ?? null, corsHeaders);
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

  return { pages, apis, apiSnapshots, apiSavePayloads };
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
  await page.getByTestId('locale-select').selectOption('zh');
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

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  await expect(page.getByTestId('tool-property-panel')).toBeVisible();

  return propertyDialog;
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

async function delay(ms = 0) {
  if (ms <= 0) return;
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
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
  return {
    uuid: apiRecord.uuid,
    name: apiRecord.name,
    method: apiRecord.method,
    status: apiRecord.status,
    ...(includeApiJson ? { apiJson: apiRecord.apiJson } : {}),
    createdAt: apiRecord.createdAt,
    updatedAt: apiRecord.updatedAt
  };
}
