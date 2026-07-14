import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  resetEditor,
  type MockMokelayLayout,
  type MockMokelayPage
} from './helpers/editor';

const serverRoot = resolve(process.cwd(), '../mokelay-server/server/assets');
const pageUuids = [
  'pages',
  'mokelay_list_page',
  'mokelay_create_page',
  'mokelay_system_page'
];

function readJsonAsset<T>(assetPath: string): T {
  return JSON.parse(readFileSync(resolve(serverRoot, assetPath), 'utf8')) as T;
}

function readSystemPage(uuid: string): MockMokelayPage {
  return readJsonAsset<MockMokelayPage>(`mokelay-pages/${uuid}.json`);
}

function readSystemLayout(uuid: string): MockMokelayLayout {
  const layoutJson = readJsonAsset<Record<string, unknown>>(`mokelay-layouts/${uuid}.json`);
  return {
    uuid,
    name: typeof layoutJson.name === 'string' ? layoutJson.name : uuid,
    layoutJson,
    createdAt: typeof layoutJson.createdAt === 'string' ? layoutJson.createdAt : undefined,
    updatedAt: typeof layoutJson.updatedAt === 'string' ? layoutJson.updatedAt : undefined
  };
}

function pageSystemOptions() {
  return {
    systemPages: pageUuids.map(readSystemPage),
    systemLayouts: [readSystemLayout('mokelay_layout')],
    seedDefaultPage: false
  };
}

test('creates a page with an editable generated slug and requires a page name', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/#/pages',
    ...pageSystemOptions()
  });
  let createRequestCount = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_page') {
      createRequestCount += 1;
    }
  });

  await page.getByRole('button', { name: '创建页面' }).click();
  const createDialog = page.getByTestId('action-dialog');
  await expect(createDialog).toContainText('创建页面');
  const generatedUuid = await createDialog.getByTestId('mokelay-create-page-uuid-input').inputValue();
  expect(generatedUuid).toMatch(/^page_[a-z0-9]{6}$/);
  await expect(createDialog.getByTestId('mokelay-create-page-uuid-input')).toHaveAttribute('maxlength', '128');
  await expect(createDialog).toContainText('页面标识');
  await expect(createDialog.getByTestId('mokelay-create-page-name-input')).toHaveAttribute('required', '');

  await createDialog.getByRole('button', { name: '保存页面' }).click();
  await page.waitForTimeout(250);
  expect(createRequestCount).toBe(0);
  await expect(page.getByTestId('global-call-confirm')).toHaveCount(0);
  await expect(createDialog).toBeVisible();

  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_page'
  );
  await createDialog.getByTestId('mokelay-create-page-uuid-input').fill('customer_orders');
  await createDialog.getByTestId('mokelay-create-page-name-input').fill('  Landing Page  ');
  await createDialog.getByRole('button', { name: '保存页面' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await page.getByTestId('global-call-ok').click();

  const createRequest = await createRequestPromise;
  expect(createRequest.postDataJSON()).toEqual({
    uuid: 'customer_orders',
    name: 'Landing Page',
    blocks: []
  });
  await expect(createDialog).toHaveCount(0);
  await expect(page.getByRole('row', { name: /Landing Page/ })).toBeVisible();
  expect(apiState.pages.get('customer_orders')).toMatchObject({
    name: 'Landing Page',
    blocks: []
  });
});

test('regenerates a page slug when the standard create input is cleared', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/pages',
    ...pageSystemOptions()
  });

  await page.getByRole('button', { name: '创建页面' }).click();
  const createDialog = page.getByTestId('action-dialog');
  const slugInput = createDialog.getByTestId('mokelay-create-page-uuid-input');
  const initialSlug = await slugInput.inputValue();
  await slugInput.fill('');
  await createDialog.getByTestId('mokelay-create-page-name-input').fill('Regenerated slug');

  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_page'
  );
  await createDialog.getByRole('button', { name: '保存页面' }).click();
  await page.getByTestId('global-call-ok').click();

  const requestSlug = (await createRequestPromise).postDataJSON().uuid as string;
  expect(requestSlug).toMatch(/^page_[a-z0-9]{6}$/);
  expect(requestSlug).not.toBe(initialSlug);
  await expect(page.getByRole('row', { name: /Regenerated slug/ })).toBeVisible();
});

test('keeps the standard create dialog open after a canonical duplicate slug', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/pages',
    ...pageSystemOptions(),
    pages: [{
      uuid: 'customer_orders',
      name: 'Existing orders',
      blocks: []
    }]
  });

  await page.getByRole('button', { name: '创建页面' }).click();
  const createDialog = page.getByTestId('action-dialog');
  const slugInput = createDialog.getByTestId('mokelay-create-page-uuid-input');
  await slugInput.fill('  CUSTOMER_ORDERS  ');
  await createDialog.getByTestId('mokelay-create-page-name-input').fill('Duplicate orders');
  await createDialog.getByRole('button', { name: '保存页面' }).click();
  await page.getByTestId('global-call-ok').click();

  await expect(createDialog).toBeVisible();
  await expect(slugInput).toHaveValue('  CUSTOMER_ORDERS  ');
  await expect(page.getByText('页面标识已存在。')).toBeVisible();
});
