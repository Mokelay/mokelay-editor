import { expect, test } from '@playwright/test';

const storageKey = 'mokelay-editor-config';

async function switchLocaleToChinese(page: Parameters<typeof test.beforeEach>[0]['page']) {
  await page.getByTestId('locale-select').selectOption('zh');
}

async function addInputTool(page: Parameters<typeof test.beforeEach>[0]['page']) {
  const blocks = page.locator('.ce-block');
  await expect(blocks).toHaveCount(1);

  await blocks.nth(0).click();
  await page.locator('.ce-toolbar__plus').click();
  await page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '输入框' }).click();
}

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

test('adds an input component and opens its property panel', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addInputTool(page);

  const editorInputTool = page.getByTestId('editor-input-tool');
  await expect(editorInputTool).toBeVisible();
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await editorInputTool.hover();

  const plusButton = page.locator('.ce-toolbar__plus');
  const settingsButton = page.locator('.ce-toolbar__settings-btn');

  await expect(plusButton).toBeVisible();
  await expect(settingsButton).toBeVisible();

  const inputBox = await editorInputTool.boundingBox();
  const plusBox = await plusButton.boundingBox();
  const settingsBox = await settingsButton.boundingBox();

  expect(inputBox).not.toBeNull();
  expect(plusBox).not.toBeNull();
  expect(settingsBox).not.toBeNull();
  expect(plusBox!.x).toBeLessThan(inputBox!.x);
  expect(settingsBox!.x).toBeLessThan(inputBox!.x);

  await settingsButton.click();

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  await expect(page.getByTestId('tool-property-panel')).toBeVisible();
  await expect(page.getByTestId('tool-property-title')).toContainText('输入框属性');
  await expect(page.getByTestId('tool-property-input-label')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-placeholder')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-value')).toBeVisible();
});
