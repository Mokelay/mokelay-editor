import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

export const storageKey = 'mokelay-editor-config';

export type SavedBlock = {
  type?: string;
  data?: Record<string, unknown>;
};

type BoundingBox = Awaited<ReturnType<Locator['boundingBox']>>;

export async function resetEditor(page: Page) {
  await page.goto('/');
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    window.location.hash = '/';
  }, storageKey);
  await page.reload();
}

export async function seedSavedConfig(page: Page, config: Record<string, unknown>) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
    window.location.hash = '/';
  }, {
    key: storageKey,
    value: config
  });
  await page.reload();
}

export async function getSavedBlocks(page: Page) {
  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();

  const parsed = JSON.parse(storedConfig ?? '{}') as {
    blocks?: SavedBlock[];
  };

  return Array.isArray(parsed.blocks) ? parsed.blocks : [];
}

export async function switchLocaleToChinese(page: Page) {
  await page.getByTestId('locale-select').selectOption('zh');
}

export async function openAddMenu(page: Page) {
  const blocks = page.locator('.ce-block');
  await expect(blocks).toHaveCount(1);
  await blocks.nth(0).click();
  await page.locator('.ce-toolbar__plus').click();
}

export async function addEditorTool(page: Page, toolTitle: string | RegExp) {
  await openAddMenu(page);
  const menuItem = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: toolTitle });
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

export async function expectToolToolbarBeside(page: Page, toolTestId: string) {
  const tool = page.getByTestId(toolTestId);
  await tool.hover();

  const plusButton = page.locator('.ce-toolbar__plus');
  const settingsButton = page.locator('.ce-toolbar__settings-btn');

  await expect(plusButton).toBeVisible();
  await expect(settingsButton).toBeVisible();

  expectToolbarBesideTool(
    await tool.boundingBox(),
    await plusButton.boundingBox(),
    await settingsButton.boundingBox()
  );

  return {
    plusButton,
    settingsButton
  };
}

export async function openToolPropertyPanel(page: Page, toolTestId: string) {
  const { settingsButton } = await expectToolToolbarBeside(page, toolTestId);
  await settingsButton.click();

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  await expect(page.getByTestId('tool-property-panel')).toBeVisible();

  return propertyDialog;
}

function expectToolbarBesideTool(
  toolBox: BoundingBox,
  plusBox: BoundingBox,
  settingsBox: BoundingBox
) {
  expect(toolBox).not.toBeNull();
  expect(plusBox).not.toBeNull();
  expect(settingsBox).not.toBeNull();

  const toolCenterY = toolBox!.y + toolBox!.height / 2;
  const plusCenterY = plusBox!.y + plusBox!.height / 2;
  const settingsCenterY = settingsBox!.y + settingsBox!.height / 2;
  const allowedVerticalOffset = Math.max(toolBox!.height / 2, 18);

  expect(plusBox!.x).toBeLessThan(toolBox!.x);
  expect(settingsBox!.x).toBeLessThan(toolBox!.x);
  expect(Math.abs(plusCenterY - toolCenterY)).toBeLessThanOrEqual(allowedVerticalOffset);
  expect(Math.abs(settingsCenterY - toolCenterY)).toBeLessThanOrEqual(allowedVerticalOffset);
}
