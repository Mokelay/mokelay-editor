import { expect, test } from '@playwright/test';
import { mockPagesApi, type MockMokelayPage } from './helpers/editor';

function runtimePage(uuid: string, text: string): MockMokelayPage {
  return {
    uuid,
    name: text,
    blocks: [
      {
        id: `${uuid}-heading`,
        type: 'MHeading',
        data: {
          text,
          level: '1'
        }
      }
    ],
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z'
  };
}

test('renders a built-in page DSL from an unmatched hash route', async ({ page }) => {
  const uuid = 'runtime_hash_page';
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: [runtimePage(uuid, 'Runtime hash DSL page')]
  });

  const bundleRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/render_page_bundle' &&
      url.searchParams.get('uuid') === uuid &&
      url.searchParams.get('source') === 'system';
  });

  await page.goto(`/#/${uuid}`);
  await bundleRequest;

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('preview-mode-switcher')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toContainText('Runtime hash DSL page');
});

test('renders a built-in page DSL from a bare path', async ({ page }) => {
  const uuid = 'runtime_bare_page';
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: [runtimePage(uuid, 'Runtime bare DSL page')]
  });

  const bundleRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/render_page_bundle' &&
      url.searchParams.get('uuid') === uuid &&
      url.searchParams.get('source') === 'system';
  });

  await page.goto(`/${uuid}`);
  await bundleRequest;

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('preview-mode-switcher')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toContainText('Runtime bare DSL page');
});

test('shows a 404 page when an unmatched route has no built-in page DSL', async ({ page }) => {
  const uuid = 'missing_runtime_page';
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: []
  });

  const bundleRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/render_page_bundle' &&
      url.searchParams.get('uuid') === uuid &&
      url.searchParams.get('source') === 'system';
  });

  await page.goto(`/#/${uuid}`);
  await bundleRequest;

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toHaveCount(0);
  await expect(page.getByTestId('not-found-page')).toBeVisible();
});
