import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

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
