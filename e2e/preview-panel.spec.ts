import { expect, test } from '@playwright/test';
import { defaultPageUuid, resetEditor } from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('opens preview panel and renders saved content', async ({ page }) => {
  await page.getByTestId('save-button').click();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}$`));
  await page.getByTestId('preview-button').click();

  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}\\/preview$`));
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-blocks')).toBeVisible();
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Mokelay');
  await expect(page.getByTestId('back-to-editor-button')).toBeVisible();
});

test('loads and previews an existing UUID route directly', async ({ page }) => {
  const uuid = '22222222-2222-4222-8222-222222222222';
  await resetEditor(page, {
    pages: [
      {
        uuid,
        name: 'Preview page',
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Preview route content'
            }
          }
        ]
      }
    ]
  });

  const readRequestPromise = page.waitForRequest((request) =>
    request.method() === 'GET' && new URL(request.url()).pathname === `/api/pages/${uuid}`
  );
  await page.goto(`/#/pages/${uuid}/preview`);
  await readRequestPromise;

  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Preview route content');
  await page.getByTestId('back-to-editor-button').click();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${uuid}$`));
});
