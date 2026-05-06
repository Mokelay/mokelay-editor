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

async function selectFormItemEditor(page: Page, toolName: string) {
  const selector = page.getByTestId('form-item-editor-field').getByTestId('editor-selector-tool');
  await expect(selector).toBeVisible();
  await selector.locator('.ce-block').first().click();
  await selector.locator('.ce-toolbar__plus').click();

  const openedMenu = selector.locator('.ce-popover--opened');
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MFormItem"]')).toHaveCount(0);
  const menuItem = openedMenu.locator(`.ce-popover-item[data-item-name="${toolName}"]`);
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

async function openFormItemPropertyPanel(page: Page) {
  const editShell = page.getByTestId('form-item-edit-shell');
  await expect(editShell).toBeVisible();
  await page.keyboard.press('Escape');
  await editShell.hover({ position: { x: 4, y: 4 } });
  const settingsButton = page.locator('.ce-toolbar__settings-btn').filter({ visible: true }).first();
  await expect(settingsButton).toBeVisible();
  await settingsButton.click();

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  return propertyDialog;
}

test('adds form item, edits fields, selects editor, saves and previews', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '表单项');
  await page.getByTestId('app-title').click();
  await expect(page.locator('.ce-popover--opened')).toHaveCount(0);

  const formItem = page.getByTestId('editor-form-item-tool');
  await expect(formItem).toBeVisible();
  await expect(page.getByTestId('form-item-label-name-field')).toHaveCount(0);
  await expect(page.getByTestId('form-item-variable-name-field')).toHaveCount(0);
  await expect(page.getByTestId('form-item-label-preview')).toHaveText('字段');
  await expect(page.getByTestId('form-item-editor-field').getByTestId('editor-selector-tool')).toBeVisible();

  await openFormItemPropertyPanel(page);
  await expect(page.getByTestId('tool-property-title')).toContainText('表单项属性');
  await expect(page.getByTestId('tool-property-input-labelName')).toHaveValue('字段');
  expect(await page.getByTestId('tool-property-input-variableName').inputValue()).toMatch(/^field_[a-z0-9-]+/i);
  await expect(page.getByTestId('tool-property-input-layout')).toHaveValue('Vertical');
  await page.getByTestId('tool-property-input-labelName').fill('用户名');
  await page.getByTestId('tool-property-input-variableName').fill('userName');
  await page.getByTestId('tool-property-input-layout').selectOption('Horizontal');
  await page.getByTestId('tool-property-close').click();
  await expect(page.getByTestId('form-item-label-preview')).toHaveText('用户名');
  await expect(formItem).toHaveClass(/ce-form-item-tool--horizontal/);

  await selectFormItemEditor(page, 'MInput');
  await expect(page.getByTestId('form-item-editor-field').getByTestId('editor-input-tool')).toBeVisible();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const formItemBlock = blocks.find((block) => block.type === 'MFormItem');
  const editor = formItemBlock?.data?.editor as { id?: string; type?: string; data?: Record<string, unknown> } | undefined;

  expect(formItemBlock?.data).toEqual(expect.objectContaining({
    labelName: '用户名',
    variableName: 'userName',
    layout: 'Horizontal'
  }));
  expect(editor?.type).toBe('MInput');
  expect(Array.isArray(formItemBlock?.data?.editor)).toBeFalsy();
  expect(typeof editor?.id).toBe('string');
  expect(typeof editor?.data).toBe('object');
  await page.getByTestId('preview-button').click();

  const previewBlock = page.getByTestId('preview-block-MFormItem');
  await expect(previewBlock).toBeVisible();
  await expect(previewBlock.getByTestId('preview-form-item-label')).toHaveText('用户名');
  await expect(previewBlock.getByTestId('editor-input-tool')).toBeVisible();
  await expect(previewBlock).not.toContainText('userName');
});

test('loads saved form item editor value', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'form-item-seeded',
        type: 'MFormItem',
        data: {
          labelName: '状态',
          variableName: 'status',
          layout: 'Horizontal',
          editor: {
            id: 'form-item-tag',
            type: 'MTag',
            data: {
              tagName: '启用',
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

  const formItem = page.getByTestId('editor-form-item-tool');
  await expect(formItem).toBeVisible();
  await expect(page.getByTestId('form-item-label-preview')).toHaveText('状态');
  await expect(page.getByTestId('form-item-editor-field').getByTestId('editor-tag-tool')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
