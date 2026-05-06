import { expect } from '@playwright/test';
import type { Locator, Page, Route } from '@playwright/test';

export const storageKey = 'mokelay-editor-config';
export const defaultPageUuid = '00000000-0000-4000-8000-000000000000';

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

type MockPagesApiOptions = {
  createUuid?: string;
  pages?: MockMokelayPage[];
};

type BoundingBox = Awaited<ReturnType<Locator['boundingBox']>>;

export async function resetEditor(page: Page, apiOptions: MockPagesApiOptions = {}) {
  await mockPagesApi(page, apiOptions);
  await page.goto('/');
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    window.location.hash = '/';
  }, storageKey);
  await page.reload();
}

export async function mockPagesApi(page: Page, options: MockPagesApiOptions = {}) {
  await page.unroute('**/api/pages**').catch(() => undefined);

  const now = '2026-05-06T00:00:00.000Z';
  const pages = new Map<string, MockMokelayPage>();
  const corsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
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

  await page.route('**/api/pages**', async (route) => {
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
    const pathParts = url.pathname.split('/').filter(Boolean);
    const uuid = pathParts[0] === 'api' && pathParts[1] === 'pages' ? pathParts[2] : undefined;

    if (method === 'POST' && url.pathname === '/api/pages') {
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

    if (uuid && method === 'GET') {
      const pageRecord = pages.get(uuid);
      if (!pageRecord) {
        await route.fulfill({
          status: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not found' })
        });
        return;
      }
      await fulfillPage(route, pageRecord, corsHeaders);
      return;
    }

    if (uuid && method === 'PATCH') {
      const existingPage = pages.get(uuid) ?? {
        uuid,
        name: '',
        blocks: [],
        createdAt: now,
        updatedAt: now
      };
      const payload = readJsonPayload(request.postDataJSON());
      const pageRecord = {
        ...existingPage,
        blocks: Array.isArray(payload.blocks) ? payload.blocks as SavedBlock[] : existingPage.blocks,
        updatedAt: now
      };
      pages.set(uuid, pageRecord);
      await fulfillPage(route, pageRecord, corsHeaders);
      return;
    }

    await route.fulfill({
      status: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' })
    });
  });

  return { pages };
}

export async function seedSavedConfig(page: Page, config: Record<string, unknown>) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
    window.location.hash = '/';
  }, {
    key: storageKey,
    value: config
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

async function fulfillPage(
  route: Route,
  pageRecord: MockMokelayPage,
  headers: Record<string, string>
) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({
      page: pageRecord
    })
  });
}
