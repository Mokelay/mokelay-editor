import { expect, test } from '@playwright/test';
import { mockPagesApi, resetEditor } from './helpers/editor';

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
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('layout-page-slot-panel')).toBeVisible();
  await expect(page.getByRole('row', { name: /Console/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Internal tools/ })).toBeVisible();
});

test('renders the app list from the deployed editor html entrypoint', async ({ page }) => {
  await mockPagesApi(page, {
    apps: [
      {
        id: 1,
        uuid: 'console',
        alias: 'Console',
        description: 'Internal tools'
      }
    ]
  });

  await page.goto('/static/editor.html');

  await expect(page.getByTestId('not-found-page')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('layout-page-slot-panel')).toBeVisible();
  await expect(page.getByRole('row', { name: /Console/ })).toBeVisible();
});

test('creates an app from the app list', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/'
  });

  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_app'
  );

  await page.getByTestId('create-app-button').click();
  const generatedUuid = await page.getByTestId('app-uuid').inputValue();
  expect(generatedUuid).toMatch(/^app_[a-z0-9]{4}$/);
  await page.getByTestId('create-app-alias').fill('  Mobile Console  ');
  await page.getByTestId('create-app-description').fill('  App for mobile operations  ');
  await page.getByTestId('create-app-submit').click();

  const createRequest = await createRequestPromise;
  expect(createRequest.postDataJSON()).toEqual({
    uuid: generatedUuid,
    alias: 'Mobile Console',
    description: 'App for mobile operations'
  });

  await expect(page.getByRole('row', { name: /Mobile Console/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /App for mobile operations/ })).toBeVisible();
  expect(apiState.apps.get(generatedUuid)).toMatchObject({
    id: 1,
    alias: 'Mobile Console',
    description: 'App for mobile operations'
  });
});

test('requires an app name when creating an app', async ({ page }) => {
  await resetEditor(page, { initialRoute: '/' });
  let createRequestCount = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_app') {
      createRequestCount += 1;
    }
  });

  await page.getByTestId('create-app-button').click();
  await expect(page.getByTestId('create-app-alias')).toHaveAttribute('required', '');
  await page.getByTestId('create-app-description').fill('Description without name');
  await page.getByTestId('create-app-submit').click();

  await page.waitForTimeout(250);
  expect(createRequestCount).toBe(0);
  await expect(page.getByTestId('create-app-alias')).toBeVisible();
});

test('edits an app while keeping its UUID read-only', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/',
    apps: [
      {
        id: 1,
        uuid: 'console',
        alias: 'Console',
        description: 'Internal tools'
      }
    ]
  });

  const updateRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/update_app_by_uuid'
  );
  await page.getByTestId('edit-app-button-console').click();
  await expect(page.getByTestId('app-uuid')).toHaveValue('console');
  await expect(page.getByTestId('app-uuid')).toBeDisabled();
  await page.getByTestId('create-app-alias').fill('Console Updated');
  await page.getByTestId('create-app-description').fill('Updated internal tools');
  await page.getByTestId('create-app-submit').click();

  const updateRequest = await updateRequestPromise;
  expect(new URL(updateRequest.url()).searchParams.get('uuid')).toBe('console');
  expect(updateRequest.postDataJSON()).toEqual({
    alias: 'Console Updated',
    description: 'Updated internal tools'
  });
  await expect(page.getByRole('row', { name: /Console Updated/ })).toContainText('Updated internal tools');
  expect(apiState.apps.get('console')).toMatchObject({ alias: 'Console Updated' });
});

test('requires an app UUID with at most eight characters', async ({ page }) => {
  await resetEditor(page, { initialRoute: '/' });
  await page.getByTestId('create-app-button').click();

  const uuidInput = page.getByTestId('app-uuid');
  await expect(uuidInput).toHaveAttribute('required', '');
  await expect(uuidInput).toHaveAttribute('maxlength', '8');
  await expect(uuidInput).toHaveCSS('border-top-width', '1px');
});

test('opens the pages DSL runtime from the top navigation', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/',
    systemPages: [
      {
        uuid: 'pages',
        name: 'Pages DSL',
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Pages DSL route'
            }
          }
        ]
      }
    ]
  });

  await page.getByRole('link', { name: /页面列表|页面|Pages/ }).click();

  await expect(page).toHaveURL(/#\/pages$/);
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Pages DSL route');
});
