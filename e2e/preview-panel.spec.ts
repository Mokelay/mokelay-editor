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
  await expect(page.getByTestId('preview-mode-pc')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preview-pc-canvas')).toBeVisible();
  await expect(page.getByTestId('preview-blocks')).toBeVisible();
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Mokelay');
  await expect(page.getByTestId('back-to-editor-button')).toBeVisible();
});

test('switches between PC, H5, IOS, and Android preview modes', async ({ page }) => {
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-mode-pc')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preview-pc-canvas').getByTestId('preview-block-paragraph')).toContainText('Mokelay');

  await page.getByTestId('preview-mode-h5').click();
  await expect(page.getByTestId('preview-mode-h5')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preview-phone-shell')).toBeVisible();
  await expect(page.getByTestId('preview-phone-screen').getByTestId('preview-block-paragraph')).toContainText('Mokelay');

  await page.getByTestId('preview-mode-ios').click();
  await expect(page.getByTestId('preview-mode-ios')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preview-app-qrcode')).toBeVisible();
  const previewPageUrl = await page.evaluate(() => window.location.href);
  await expect(page.getByTestId('preview-qrcode-image')).toHaveAttribute('src', /^data:image\/png/);
  await expect(page.getByTestId('preview-qrcode-image')).toHaveAttribute('data-qr-value', previewPageUrl);
  await expect(page.getByTestId('preview-qrcode-platform')).toContainText('IOS');
  await expect(page.getByTestId('preview-pc-canvas')).toHaveCount(0);

  await page.getByTestId('preview-mode-android').click();
  await expect(page.getByTestId('preview-mode-android')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preview-qrcode-image')).toHaveAttribute('src', /^data:image\/png/);
  await expect(page.getByTestId('preview-qrcode-image')).toHaveAttribute('data-qr-value', /^mokelay:\/\/preview\/android\?ticket=/);
  await expect(page.getByTestId('preview-qrcode-platform')).toContainText('Android');
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
    request.method() === 'GET' &&
    new URL(request.url()).pathname === '/api/mokelay/read_page_by_uuid' &&
    new URL(request.url()).searchParams.get('uuid') === uuid
  );
  await page.goto(`/#/pages/${uuid}/preview`);
  await readRequestPromise;

  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Preview route content');
  await page.getByTestId('back-to-editor-button').click();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${uuid}$`));
});
