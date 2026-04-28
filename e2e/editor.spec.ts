import { expect, test } from '@playwright/test';

const storageKey = 'mokelay-editor-config';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    window.location.hash = '/';
  }, storageKey);
  await page.reload();
});

test('renders editor shell with expected controls', async ({ page }) => {
  await expect(page.getByTestId('app-title')).toHaveText('Mokelay Editor');
  await expect(page.getByTestId('editor-panel')).toBeVisible();
  await expect(page.getByTestId('editor-surface')).toBeVisible();
  await expect(page.getByTestId('theme-select')).toBeVisible();
  await expect(page.getByTestId('locale-select')).toBeVisible();
  await expect(page.getByTestId('save-button')).toBeVisible();
  await expect(page.getByTestId('preview-button')).toBeVisible();
});

test('saves current editor content into localStorage and shows config dialog', async ({ page }) => {
  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('config-dialog')).toBeVisible();
  await expect(page.getByTestId('config-dialog-title')).toBeVisible();

  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();

  const parsed = JSON.parse(storedConfig ?? '{}') as {
    blocks?: Array<{ type?: string; data?: { text?: string } }>;
  };

  expect(Array.isArray(parsed.blocks)).toBeTruthy();
  expect(parsed.blocks?.[0]?.type).toBe('paragraph');

  await expect(page.getByTestId('config-json')).toContainText('paragraph');
});

test('opens preview page and renders saved content', async ({ page }) => {
  await page.getByTestId('save-button').click();
  await page.getByTestId('config-dialog-close').click();
  await page.getByTestId('preview-button').click();

  await expect(page).toHaveURL(/#\/preview$/);
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-blocks')).toBeVisible();
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Mokelay');
  await expect(page.getByTestId('back-to-editor-button')).toBeVisible();
});

test('restores saved content after reload', async ({ page }) => {
  await page.getByTestId('save-button').click();
  await page.getByTestId('config-dialog-close').click();

  await page.reload();
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Mokelay');
  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();
});
