import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  addEditorTool,
  getSavedBlocks,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

async function openSelectorAddMenu(page: Page) {
  const selector = page.getByTestId('editor-selector-tool');
  await expect(selector).toBeVisible();
  await selector.locator('.ce-block').first().click();
  await selector.locator('.ce-toolbar__plus').click();
  await expect(selector.locator('.ce-popover--opened .ce-popover-item')).not.toHaveCount(0);
  return selector;
}

async function selectSelectorTool(page: Page, toolName: string) {
  const selector = await openSelectorAddMenu(page);
  const menuItem = selector.locator(`.ce-popover--opened .ce-popover-item[data-item-name="${toolName}"]`);
  await expect(menuItem).toBeVisible();
  await menuItem.click();
  return selector;
}

test('adds selector, filters menu items, replaces selected component, and previews value', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '组件选择器');

  const selector = page.getByTestId('editor-selector-tool');
  const selectorShell = page.getByTestId('editor-selector-shell');
  await expect(selector).toBeVisible();

  const initialBox = await selectorShell.boundingBox();
  expect(initialBox).not.toBeNull();
  expect(initialBox!.height).toBeGreaterThanOrEqual(36);
  expect(initialBox!.height).toBeLessThanOrEqual(48);

  await openSelectorAddMenu(page);
  const openedMenu = selector.locator('.ce-popover--opened');
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MInput"]')).toBeVisible();
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MTag"]')).toBeVisible();
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="paragraph"]')).toBeHidden();
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MEditorSelector"]')).toHaveCount(0);

  await openedMenu.locator('.ce-popover-item[data-item-name="MTag"]').click();
  await expect(selector.getByTestId('editor-tag-tool')).toBeVisible();

  await page.getByTestId('save-button').click();
  let blocks = await getSavedBlocks(page);
  let selectorBlock = blocks.find((block) => block.type === 'MEditorSelector');
  let selectorValue = selectorBlock?.data?.value as { id?: string; type?: string; data?: Record<string, unknown> } | undefined;

  expect(selectorValue?.type).toBe('MTag');
  expect(Array.isArray(selectorBlock?.data?.value)).toBeFalsy();
  expect(typeof selectorValue?.id).toBe('string');
  expect(typeof selectorValue?.data).toBe('object');

  await page.getByTestId('config-dialog-close').click();
  await selectSelectorTool(page, 'MInput');
  await expect(selector.getByTestId('editor-input-tool')).toBeVisible();
  await expect(selector.getByTestId('editor-tag-tool')).toHaveCount(0);

  await page.getByTestId('save-button').click();
  blocks = await getSavedBlocks(page);
  selectorBlock = blocks.find((block) => block.type === 'MEditorSelector');
  selectorValue = selectorBlock?.data?.value as { type?: string } | undefined;
  expect(selectorValue?.type).toBe('MInput');

  await page.getByTestId('config-dialog-close').click();
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-MEditorSelector')).toBeVisible();
  await expect(page.getByTestId('preview-editor-selector-value')).toBeVisible();
  await expect(page.getByTestId('preview-editor-selector-value').getByTestId('editor-input-tool')).toBeVisible();
});

test('adapts height to the selected component', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '组件选择器');

  const selectorShell = page.getByTestId('editor-selector-shell');
  const initialBox = await selectorShell.boundingBox();
  expect(initialBox).not.toBeNull();

  const selector = await selectSelectorTool(page, 'MAdvanceTable');
  await expect(selector.getByTestId('editor-advance-table-tool')).toBeVisible();

  const filledBox = await selectorShell.boundingBox();
  expect(filledBox).not.toBeNull();
  expect(filledBox!.height).toBeGreaterThan(initialBox!.height + 40);
});

test('loads saved selector value in editor', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'selector-seeded',
        type: 'MEditorSelector',
        data: {
          value: {
            id: 'selector-tag',
            type: 'MTag',
            data: {
              tagName: '标签',
              closable: false,
              size: '',
              color: '',
              type: 'success'
            }
          }
        }
      }
    ]
  });

  const selector = page.getByTestId('editor-selector-tool');
  await expect(selector).toBeVisible();
  await expect(selector.getByTestId('editor-tag-tool')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
