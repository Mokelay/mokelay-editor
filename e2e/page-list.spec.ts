import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

test('renders the home page list and opens a page editor', async ({ page }) => {
  const uuid = '11111111-2222-4333-8444-555555555555';
  await resetEditor(page, {
    initialRoute: '/',
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

  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByTestId('page-list-panel')).toBeVisible();
});

test('shows the empty state when there are no pages', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/'
  });

  await expect(page.getByTestId('page-list-panel')).toBeVisible();
  await expect(page.getByText(/暂无页面|No pages yet/)).toBeVisible();
});

test('loads all pages from paginated list responses', async ({ page }) => {
  const pages = Array.from({ length: 101 }, (_, index) => ({
    uuid: `paginated-page-${String(index + 1).padStart(3, '0')}`,
    name: `Paginated page ${index + 1}`,
    blocks: [],
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z'
  }));

  await resetEditor(page, {
    initialRoute: '/',
    pages
  });

  await expect(page.getByRole('cell', { name: 'Paginated page 1', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Paginated page 101', exact: true })).toBeVisible();
});
