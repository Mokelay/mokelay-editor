import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { resetEditor, type MockMokelayPage } from './helpers/editor';

function readSystemPageAsset(uuid: string): MockMokelayPage {
  const filePath = resolve(process.cwd(), '../mokelay-server/server/assets/mokelay-pages', `${uuid}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8')) as MockMokelayPage;
}

test('renders the page list and opens a page editor', async ({ page }) => {
  const uuid = '11111111-2222-4333-8444-555555555555';
  await resetEditor(page, {
    initialRoute: '/#/pages',
    pages: [
      {
        uuid,
        name: 'Landing page',
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Loaded from page list'
            }
          }
        ],
        createdAt: '2026-05-05T00:00:00.000Z',
        updatedAt: '2026-05-06T00:00:00.000Z'
      }
    ]
  });

  await expect(page.getByTestId('page-list-panel')).toBeVisible();
  await expect(page.getByRole('row', { name: /Landing page/ })).toBeVisible();
  await expect(page.getByTestId('save-button')).toHaveCount(0);
  await expect(page.getByTestId('preview-button')).toHaveCount(0);

  await page.getByRole('row', { name: /Landing page/ }).getByRole('button', { name: /打开|Open/ }).click();

  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${uuid}$`));
  await expect(page.getByTestId('page-name-input')).toHaveValue('Landing page');
  await expect(page.getByTestId('editor-panel')).toContainText('Loaded from page list');

  await page.getByTestId('back-to-page-list-button').click();

  await expect(page).toHaveURL(/#\/pages$/);
  await expect(page.getByTestId('page-list-panel')).toBeVisible();
});

test('shows the empty state when there are no pages', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/pages'
  });

  await expect(page.getByTestId('page-list-panel')).toBeVisible();
  await expect(page.getByText(/暂无页面|No pages yet/)).toBeVisible();
});

test('supports going to the next page in the page list', async ({ page }) => {
  const pages = Array.from({ length: 11 }, (_, index) => ({
    uuid: `paginated-page-${String(index + 1).padStart(3, '0')}`,
    name: `Paginated page ${index + 1}`,
    blocks: [],
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z'
  }));

  await resetEditor(page, {
    initialRoute: '/#/pages',
    pages
  });

  await expect(page.getByRole('cell', { name: 'Paginated page 1', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Paginated page 11', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('page-list-pagination-info')).toContainText(/1 \/ 2|Page 1 \/ 2/);

  const nextPageRequestPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/list_pages' &&
      url.searchParams.get('page') === '2' &&
      url.searchParams.get('pageSize') === '10';
  });

  await page.getByTestId('page-list-next-button').click();
  await nextPageRequestPromise;

  await expect(page.getByRole('cell', { name: 'Paginated page 11', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Paginated page 1', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('page-list-prev-button')).toBeEnabled();
  await expect(page.getByTestId('page-list-next-button')).toBeDisabled();
});

test('switches to built-in pages and opens a system page DSL', async ({ page }) => {
  const systemUuid = 'mokelay_list_page';
  await resetEditor(page, {
    initialRoute: '/#/pages',
    pages: [{
      uuid: 'user-page-001',
      name: 'User page',
      blocks: [],
      createdAt: '2026-05-05T00:00:00.000Z',
      updatedAt: '2026-05-06T00:00:00.000Z'
    }],
    systemPages: [{
      uuid: systemUuid,
      name: '页面列表',
      blocks: [{
        id: 'system-page-title',
        type: 'paragraph',
        data: {
          text: 'Built-in page DSL'
        }
      }],
      createdAt: '2026-06-20T00:00:00.000Z',
      updatedAt: '2026-06-20T00:00:00.000Z'
    }]
  });

  const listSystemPagesRequest = page.waitForRequest((request) =>
    request.method() === 'GET' &&
    new URL(request.url()).pathname === '/api/mokelay/list_mokelay_page_jsons'
  );

  await page.getByTestId('page-source-system').click();
  await listSystemPagesRequest;

  await expect(page).toHaveURL(/#\/pages\?source=system$/);
  await expect(page.getByRole('row', { name: /页面列表/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /User page/ })).toHaveCount(0);
  await expect(page.getByTestId('create-page-button')).toHaveCount(0);
  await expect(page.getByTestId(`delete-page-button-${systemUuid}`)).toHaveCount(0);

  const readSystemPageRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/read_mokelay_page_json' &&
      url.searchParams.get('uuid') === systemUuid;
  });

  await page.getByRole('row', { name: /页面列表/ }).getByRole('button', { name: /打开|Open/ }).click();
  await readSystemPageRequest;

  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${systemUuid}\\?source=system$`));
  await expect(page.getByTestId('page-name-input')).toHaveValue('页面列表');
  await expect(page.getByTestId('editor-panel')).toContainText('Built-in page DSL');
  await expect(page.getByTestId('save-button')).toBeDisabled();
});

test('built-in page list opens the create page dialog and submits the form value', async ({ page }) => {
  const listPage = readSystemPageAsset('mokelay_list_page');
  const createPage = readSystemPageAsset('mokelay_create_page');

  await resetEditor(page, {
    initialRoute: '/#/pages/mokelay_list_page?source=system',
    systemPages: [listPage, createPage]
  });

  await expect(page.getByTestId('page-name-input')).toHaveValue('页面列表');
  await page.getByTestId('preview-button').click();

  const readCreateDialogPage = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/read_mokelay_page_json' &&
      url.searchParams.get('uuid') === 'mokelay_create_page';
  });

  await page.getByTestId('preview-panel').getByRole('button', { name: '创建页面' }).click();
  await readCreateDialogPage;

  const dialog = page.getByTestId('action-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('action-dialog-title')).toHaveText('创建页面');
  await dialog.getByTestId('editor-input-control').fill('测试页面');

  const createPageRequests: unknown[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_page') {
      createPageRequests.push(request.postDataJSON());
    }
  });

  await dialog.getByRole('button', { name: '保存页面' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await expect(page.getByTestId('global-call-dialog-content')).toContainText('确定要创建该页面吗？');
  await page.getByTestId('global-call-cancel').click();
  await expect(page.getByTestId('global-call-confirm')).toHaveCount(0);
  await page.waitForTimeout(100);
  expect(createPageRequests).toHaveLength(0);

  const createPageRequest = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_page'
  );
  const refreshListRequest = page.waitForRequest((listRequest) => {
    const url = new URL(listRequest.url());
    return listRequest.method() === 'GET' &&
      url.pathname === '/api/mokelay/list_pages' &&
      url.searchParams.get('page') === '1' &&
      url.searchParams.get('pageSize') === '10';
  });
  await dialog.getByRole('button', { name: '保存页面' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await expect(page.getByTestId('global-call-dialog-content')).toContainText('确定要创建该页面吗？');
  await page.getByTestId('global-call-ok').click();

  const request = await createPageRequest;
  expect(request.postDataJSON()).toEqual({
    name: '测试页面',
    blocks: []
  });
  expect(createPageRequests).toHaveLength(1);

  await refreshListRequest;
  await expect(page.getByTestId('action-dialog')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toContainText('测试页面');
});

test('built-in page list only applies search form values after search is submitted', async ({ page }) => {
  const listPage = readSystemPageAsset('mokelay_list_page');
  const targetPages = Array.from({ length: 11 }, (_, index) => ({
    uuid: `target-page-${String(index + 1).padStart(3, '0')}`,
    name: 'Target Page',
    blocks: [],
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: `2026-05-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`
  }));
  const otherPages = Array.from({ length: 11 }, (_, index) => ({
    uuid: `other-page-${String(index + 1).padStart(3, '0')}`,
    name: 'Other Page',
    blocks: [],
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: `2026-04-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`
  }));

  await resetEditor(page, {
    initialRoute: '/#/pages/mokelay_list_page?source=system',
    systemPages: [listPage],
    pages: [...targetPages, ...otherPages]
  });

  await page.getByTestId('preview-button').click();
  const preview = page.getByTestId('preview-panel');
  const nextButton = preview.getByRole('button', { name: /下一页|Next/ });
  await expect(preview.getByPlaceholder('请输入页面名称')).toBeVisible();
  await expect(nextButton).toBeEnabled();

  await preview.getByPlaceholder('请输入页面名称').fill('Target Page');
  const nextWithoutSearchRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/list_pages' &&
      url.searchParams.get('page') === '2';
  });
  await nextButton.click();
  const nextWithoutSearch = await nextWithoutSearchRequest;
  expect(new URL(nextWithoutSearch.url()).searchParams.get('name')).toBe('');

  const searchRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/list_pages' &&
      url.searchParams.get('page') === '1' &&
      url.searchParams.get('name') === 'Target Page';
  });
  await preview.getByRole('button', { name: '搜索' }).click();
  await searchRequest;

  await preview.getByPlaceholder('请输入页面名称').fill('Draft Value');
  await expect(nextButton).toBeEnabled();
  const nextSubmittedSearchRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/list_pages' &&
      url.searchParams.get('page') === '2';
  });
  await nextButton.click();
  const nextSubmittedSearch = await nextSubmittedSearchRequest;
  const nextSubmittedSearchParams = new URL(nextSubmittedSearch.url()).searchParams;

  expect(nextSubmittedSearchParams.get('name')).toBe('Target Page');
  expect(nextSubmittedSearchParams.get('name')).not.toBe('Draft Value');
});

test('built-in page list operation column opens and deletes pages from DSL actions', async ({ page }) => {
  const listPage = readSystemPageAsset('mokelay_list_page');
  const openUuid = 'open-page-1111';
  const deleteUuid = 'delete-page-2222';
  const apiState = await resetEditor(page, {
    initialRoute: '/#/pages/mokelay_list_page?source=system',
    systemPages: [listPage],
    pages: [
      {
        uuid: openUuid,
        name: 'Open target',
        blocks: [],
        createdAt: '2026-05-05T00:00:00.000Z',
        updatedAt: '2026-05-07T00:00:00.000Z'
      },
      {
        uuid: deleteUuid,
        name: 'Delete target',
        blocks: [],
        createdAt: '2026-05-05T00:00:00.000Z',
        updatedAt: '2026-05-06T00:00:00.000Z'
      }
    ]
  });

  await expect(page.getByTestId('page-name-input')).toHaveValue('页面列表');
  await page.getByTestId('preview-button').click();

  const preview = page.getByTestId('preview-panel');
  await expect(preview.getByRole('columnheader', { name: '操作' })).toBeVisible();
  await expect(preview.getByRole('row', { name: /Open target/ }).getByRole('button', { name: '打开' })).toBeVisible();
  await expect(preview.getByRole('row', { name: /Delete target/ }).getByRole('button', { name: '删除' })).toBeVisible();

  const deleteRequests: unknown[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/delete_page_by_uuid') {
      deleteRequests.push(request.postDataJSON());
    }
  });

  await preview.getByRole('row', { name: /Delete target/ }).getByRole('button', { name: '删除' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await expect(page.getByTestId('global-call-dialog-content')).toContainText('Delete target');
  await page.getByTestId('global-call-cancel').click();
  await expect(page.getByTestId('global-call-confirm')).toHaveCount(0);
  await page.waitForTimeout(100);
  expect(deleteRequests).toHaveLength(0);
  await expect(preview.getByRole('row', { name: /Delete target/ })).toBeVisible();

  const deleteRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/delete_page_by_uuid'
  );
  const refreshListRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/list_pages' &&
      url.searchParams.get('page') === '1' &&
      url.searchParams.get('pageSize') === '10';
  });

  await preview.getByRole('row', { name: /Delete target/ }).getByRole('button', { name: '删除' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await page.getByTestId('global-call-ok').click();

  const deleteRequest = await deleteRequestPromise;
  expect(deleteRequest.postDataJSON()).toEqual({ uuid: deleteUuid });
  await refreshListRequest;
  await expect(preview.getByRole('row', { name: /Delete target/ })).toHaveCount(0);
  expect(apiState.pages.has(deleteUuid)).toBe(false);

  const openPageRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/read_page_by_uuid' &&
      url.searchParams.get('uuid') === openUuid;
  });
  await preview.getByRole('row', { name: /Open target/ }).getByRole('button', { name: '打开' }).click();
  await openPageRequest;

  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${openUuid}$`));
  await expect(page.getByTestId('page-name-input')).toHaveValue('Open target');
});

test('deletes a page from the page list after confirmation', async ({ page }) => {
  const uuid = 'delete-page-1111';
  const apiState = await resetEditor(page, {
    initialRoute: '/#/pages',
    pages: [
      {
        uuid,
        name: 'Delete me',
        blocks: [],
        createdAt: '2026-05-05T00:00:00.000Z',
        updatedAt: '2026-05-06T00:00:00.000Z'
      }
    ]
  });

  const deleteRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/delete_page_by_uuid'
  );

  await page.getByTestId(`delete-page-button-${uuid}`).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await expect(page.getByTestId('global-call-dialog-content')).toContainText('Delete me');
  await page.getByTestId('global-call-ok').click();

  const deleteRequest = await deleteRequestPromise;
  expect(deleteRequest.postDataJSON()).toEqual({ uuid });
  await expect(page.getByRole('row', { name: /Delete me/ })).toHaveCount(0);
  expect(apiState.pages.has(uuid)).toBe(false);
});
