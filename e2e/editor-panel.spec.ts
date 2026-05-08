import { expect, test } from '@playwright/test';
import type { Route } from '@playwright/test';
import { defaultPageUuid, resetEditor, storageKey } from './helpers/editor';

const pageApiHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json'
};

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('renders editor panel with expected controls', async ({ page }) => {
  await expect(page.getByTestId('app-title')).toHaveText('Mokelay Editor');
  await expect(page.getByTestId('editor-panel')).toBeVisible();
  await expect(page.getByTestId('editor-surface')).toBeVisible();
  await expect(page.getByTestId('theme-select')).toBeVisible();
  await expect(page.getByTestId('locale-select')).toBeVisible();
  await expect(page.getByTestId('save-button')).toBeVisible();
  await expect(page.getByTestId('preview-button')).toBeVisible();
});

test('creates a new page through the pages API without showing the JSON dialog', async ({ page }) => {
  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_page'
  );

  await page.getByTestId('save-button').click();
  const createRequest = await createRequestPromise;
  const payload = createRequest.postDataJSON() as {
    name?: string;
    blocks?: Array<{ type?: string; data?: { text?: string } }>;
  };

  expect(payload.name).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  expect(Array.isArray(payload.blocks)).toBeTruthy();
  expect(payload.blocks?.[0]?.type).toBe('paragraph');
  await expect(page.getByTestId('config-dialog')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}$`));

  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();

  const parsed = JSON.parse(storedConfig ?? '{}') as {
    blocks?: Array<{ type?: string; data?: { text?: string } }>;
  };

  expect(Array.isArray(parsed.blocks)).toBeTruthy();
  expect(parsed.blocks?.[0]?.type).toBe('paragraph');
});

test('restores API-backed content after reload', async ({ page }) => {
  await page.getByTestId('save-button').click();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}$`));

  await page.reload();
  await expect(page.getByTestId('editor-panel')).toContainText('Mokelay');
  await page.getByTestId('preview-button').click();

  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}\\/preview$`));
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Mokelay');
  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();
});

test('loads an existing page from the UUID route and updates only blocks', async ({ page }) => {
  const uuid = '11111111-1111-4111-8111-111111111111';
  await resetEditor(page, {
    pages: [
      {
        uuid,
        name: 'Existing page',
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Loaded page content'
            }
          }
        ]
      }
    ]
  });

  const readRequestPromise = page.waitForRequest((request) =>
    request.method() === 'GET' &&
    new URL(request.url()).pathname === '/api/mokelay/read_page_by_uuid' &&
    new URL(request.url()).searchParams.get('uuid') === uuid
  );
  await page.goto(`/#/pages/${uuid}`);
  await readRequestPromise;
  await expect(page.getByTestId('editor-panel')).toContainText('Loaded page content');

  const updateRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' &&
    new URL(request.url()).pathname === '/api/mokelay/update_page_blocks_by_uuid' &&
    new URL(request.url()).searchParams.get('uuid') === uuid
  );
  await page.getByTestId('save-button').click();
  const updateRequest = await updateRequestPromise;
  const payload = updateRequest.postDataJSON() as {
    name?: string;
    blocks?: Array<{ type?: string; data?: { text?: string } }>;
  };

  expect(payload.name).toBeUndefined();
  expect(Array.isArray(payload.blocks)).toBeTruthy();
  expect(payload.blocks?.[0]?.data?.text).toBe('Loaded page content');
});

test('shows backend error message when creating a page fails through the API envelope', async ({ page }) => {
  await page.route('**/api/mokelay/create_page', async (route) => {
    await fulfillPageApiFailure(route, 'PAGE_CREATE_FAILED', 'Cannot create page.');
  });

  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('editor-error-state')).toContainText('Cannot create page.');
  await expect(page).not.toHaveURL(new RegExp('#\\/pages\\/'));
});

test('shows backend error message when loading a page fails through the API envelope', async ({ page }) => {
  const uuid = '33333333-3333-4333-8333-333333333333';
  await page.route('**/api/mokelay/read_page_by_uuid**', async (route) => {
    await fulfillPageApiFailure(route, 'PAGE_READ_FAILED', 'Cannot read page.');
  });

  await page.goto(`/#/pages/${uuid}`);

  await expect(page.getByTestId('editor-error-state')).toContainText('Cannot read page.');
});

async function fulfillPageApiFailure(route: Route, code: string, message: string) {
  await route.fulfill({
    status: 200,
    headers: pageApiHeaders,
    body: JSON.stringify({
      ok: false,
      error: {
        code,
        message
      }
    })
  });
}
