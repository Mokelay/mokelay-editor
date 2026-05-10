import { expect, test } from '@playwright/test';
import type { Route } from '@playwright/test';

const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json'
};

test.beforeEach(async ({ page }) => {
  await mockApiBuilder(page);
});

test('lists orchestration APIs and creates a visual API draft', async ({ page }) => {
  await page.goto('/#/apis');

  await expect(page.getByTestId('api-list-page')).toBeVisible();
  await expect(page.getByText('登录接口')).toBeVisible();

  await page.getByTestId('api-new-button').click();
  await expect(page).toHaveURL(/#\/apis\/new$/);
  await expect(page.getByTestId('api-builder-page')).toBeVisible();

  await page.getByTestId('api-builder-uuid').fill('visual_test_api');

  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/orchestration/apis'
  );
  await page.getByTestId('api-builder-save').click();
  const createRequest = await createRequestPromise;
  const payload = createRequest.postDataJSON() as {
    uuid?: string;
    apiJson?: { uuid?: string; method?: string };
  };

  expect(payload.uuid).toBe('visual_test_api');
  expect(payload.apiJson?.uuid).toBe('visual_test_api');
  expect(payload.apiJson?.method).toBe('GET');
  await expect(page).toHaveURL(/#\/apis\/visual_test_api$/);
});

async function mockApiBuilder(page: import('@playwright/test').Page) {
  const apiDetails = new Map<string, Record<string, unknown>>();
  const loginApi = {
    uuid: 'login',
    alias: '登录接口',
    method: 'POST',
    request: { body: ['email', 'password'] },
    blocks: [],
    response: null
  };

  apiDetails.set('login', {
    ...summary(loginApi, 'asset'),
    draftState: { apiJson: loginApi },
    draftJson: loginApi,
    publishedJson: loginApi,
    versions: []
  });

  await page.route('**/api/database/datasources', async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: JSON.stringify({ datasources: ['Mokelay'] })
    });
  });

  await page.route('**/api/database/schema**', async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: JSON.stringify({
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'uuid', dataType: 'uuid' },
              { name: 'email', type: 'varchar', dataType: 'varchar' }
            ]
          }
        ]
      })
    });
  });

  await page.route('**/api/orchestration/apis**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
      return;
    }

    if (request.method() === 'GET' && url.pathname === '/api/orchestration/apis') {
      await fulfill(route, { apis: Array.from(apiDetails.values()).map((detail) => pickSummary(detail)) });
      return;
    }

    if (request.method() === 'POST' && url.pathname === '/api/orchestration/apis') {
      const payload = request.postDataJSON() as {
        uuid?: string;
        apiJson?: Record<string, unknown>;
      };
      const apiJson = {
        ...(payload.apiJson ?? {}),
        uuid: payload.uuid ?? payload.apiJson?.uuid ?? 'visual_test_api'
      };
      const detail = {
        ...summary(apiJson, 'database'),
        draftState: { apiJson },
        draftJson: apiJson,
        publishedJson: null,
        versions: []
      };
      apiDetails.set(String(apiJson.uuid), detail);
      await fulfill(route, { api: detail });
      return;
    }

    const detailMatch = url.pathname.match(/^\/api\/orchestration\/apis\/([^/]+)$/);
    if (request.method() === 'GET' && detailMatch) {
      await fulfill(route, { api: apiDetails.get(decodeURIComponent(detailMatch[1])) });
      return;
    }

    await route.fulfill({ status: 404, headers, body: JSON.stringify({ ok: false }) });
  });
}

function summary(apiJson: Record<string, unknown>, source: 'asset' | 'database') {
  return {
    uuid: String(apiJson.uuid),
    alias: typeof apiJson.alias === 'string' ? apiJson.alias : '',
    method: typeof apiJson.method === 'string' ? apiJson.method : 'GET',
    source,
    status: source === 'asset' ? 'asset' : 'draft',
    latestVersion: null,
    updatedAt: '2026-05-10T00:00:00.000Z'
  };
}

function pickSummary(detail: Record<string, unknown>) {
  const { uuid, alias, method, source, status, latestVersion, updatedAt } = detail;
  return { uuid, alias, method, source, status, latestVersion, updatedAt };
}

async function fulfill(route: Route, data: unknown) {
  await route.fulfill({
    status: 200,
    headers,
    body: JSON.stringify({ ok: true, data })
  });
}
