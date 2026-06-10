import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

test('renders the app list on the editor home route', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/',
    apps: [
      {
        id: 1,
        uuid: 'a1b2c3d4',
        alias: 'Console',
        description: 'Internal tools'
      }
    ]
  });

  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByTestId('app-list-panel')).toBeVisible();
  await expect(page.getByRole('row', { name: /Console/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Internal tools/ })).toBeVisible();
  await expect(page.getByTestId('page-list-panel')).toHaveCount(0);
});

test('creates an app from the app list', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/'
  });

  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_app'
  );

  await page.getByTestId('create-app-button').click();
  await page.getByTestId('create-app-alias').fill('  Mobile Console  ');
  await page.getByTestId('create-app-description').fill('  App for mobile operations  ');
  await page.getByTestId('create-app-submit').click();

  const createRequest = await createRequestPromise;
  expect(createRequest.postDataJSON()).toEqual({
    alias: 'Mobile Console',
    description: 'App for mobile operations'
  });

  await expect(page.getByRole('row', { name: /Mobile Console/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /App for mobile operations/ })).toBeVisible();
  expect(apiState.apps.get('00000001')).toMatchObject({
    id: 1,
    alias: 'Mobile Console',
    description: 'App for mobile operations'
  });
});

test('opens the page list from the top navigation', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/',
    pages: [
      {
        uuid: 'page-list-nav',
        name: 'Page from nav',
        blocks: []
      }
    ]
  });

  await page.getByRole('link', { name: /页面列表|Pages/ }).click();

  await expect(page).toHaveURL(/#\/pages$/);
  await expect(page.getByTestId('page-list-panel')).toBeVisible();
  await expect(page.getByRole('row', { name: /Page from nav/ })).toBeVisible();
});
