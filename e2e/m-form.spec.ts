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

async function openFormAddMenu(page: Page) {
  const form = page.getByTestId('editor-form-tool');
  await expect(form).toBeVisible();

  const firstBlock = form.locator('.ce-block').first();
  await expect(firstBlock).toBeVisible();
  await firstBlock.click();
  await form.locator('.ce-toolbar__plus').click();
  await expect(form.locator('.ce-popover--opened .ce-popover-item')).not.toHaveCount(0);

  return form;
}

async function selectFormEditorTool(page: Page, toolName: string) {
  const form = await openFormAddMenu(page);
  const openedMenu = form.locator('.ce-popover--opened');

  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MForm"]')).toHaveCount(0);
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MFormItem"]')).toHaveCount(0);
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MEditorSelector"]')).toHaveCount(0);
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="MPage"]')).toHaveCount(0);
  await expect(openedMenu.locator('.ce-popover-item[data-item-name="paragraph"]')).toBeHidden();

  const menuItem = openedMenu.locator(`.ce-popover-item[data-item-name="${toolName}"]`);
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

async function openNestedFormItemPropertyPanel(page: Page) {
  const form = page.getByTestId('editor-form-tool');
  const editShell = form.getByTestId('form-item-edit-shell');
  await expect(editShell).toBeVisible();
  await page.keyboard.press('Escape');
  await editShell.hover({ position: { x: 4, y: 4 } });

  const settingsButton = form.locator('.ce-toolbar__settings-btn').filter({ visible: true }).first();
  await expect(settingsButton).toBeVisible();
  await settingsButton.click();

  const propertyButton = form.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  return propertyDialog;
}

test('adds form item through form menu, saves items, and previews', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^表单$/);

  const form = page.getByTestId('editor-form-tool');
  await expect(form).toBeVisible();
  await expect(page.getByTestId('form-editor-shell')).toBeVisible();

  await openFormAddMenu(page);
  await expect(form.locator('.ce-popover--opened .ce-popover-item[data-item-name="MInput"]')).toBeVisible();
  await page.keyboard.press('Escape');

  await selectFormEditorTool(page, 'MInput');
  await expect(form.getByTestId('editor-form-item-tool')).toBeVisible();
  await expect(form.getByTestId('form-item-label-preview')).toHaveText('字段');
  await expect(form.getByTestId('editor-input-tool')).toBeVisible();

  const propertyDialog = await openNestedFormItemPropertyPanel(page);
  await expect(propertyDialog.getByTestId('tool-property-title')).toContainText('表单项属性');
  await expect(propertyDialog.getByTestId('tool-property-input-labelName')).toHaveValue('字段');
  await propertyDialog.getByTestId('tool-property-input-labelName').fill('用户名');
  await propertyDialog.getByTestId('tool-property-input-variableName').fill('userName');
  await propertyDialog.getByTestId('tool-property-input-layout').selectOption('Horizontal');
  await propertyDialog.getByTestId('tool-property-close').click();

  await expect(form.getByTestId('form-item-label-preview')).toHaveText('用户名');
  await expect(form.getByTestId('editor-form-item-tool')).toHaveClass(/ce-form-item-tool--horizontal/);

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const formBlock = blocks.find((block) => block.type === 'MForm');
  const items = formBlock?.data?.items as Array<Record<string, unknown>> | undefined;
  const editor = items?.[0]?.editor as { id?: string; type?: string; data?: Record<string, unknown> } | undefined;

  expect(items).toHaveLength(1);
  expect(items?.[0]).toEqual(expect.objectContaining({
    labelName: '用户名',
    variableName: 'userName',
    layout: 'Horizontal'
  }));
  expect(editor?.type).toBe('MInput');
  expect(Array.isArray(formBlock?.data?.items)).toBeTruthy();
  expect(Array.isArray(editor)).toBeFalsy();
  expect(typeof editor?.id).toBe('string');
  expect(typeof editor?.data).toBe('object');

  await page.getByTestId('config-dialog-close').click();
  await page.getByTestId('preview-button').click();

  const previewBlock = page.getByTestId('preview-block-MForm');
  await expect(previewBlock).toBeVisible();
  await expect(previewBlock.getByTestId('preview-form-item-label')).toHaveText('用户名');
  await expect(previewBlock.getByTestId('editor-input-tool')).toBeVisible();
  await expect(previewBlock).not.toContainText('userName');
});

test('loads saved form item values in editor and preview', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'form-seeded',
        type: 'MForm',
        data: {
          items: [
            {
              labelName: '状态',
              variableName: 'status',
              layout: 'Horizontal',
              editor: {
                id: 'form-tag',
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
          ]
        }
      }
    ]
  });

  const form = page.getByTestId('editor-form-tool');
  await expect(form).toBeVisible();
  await expect(form.getByTestId('form-item-label-preview')).toHaveText('状态');
  await expect(form.getByTestId('editor-tag-tool')).toBeVisible();

  await page.getByTestId('preview-button').click();
  const previewBlock = page.getByTestId('preview-block-MForm');
  await expect(previewBlock).toBeVisible();
  await expect(previewBlock.getByTestId('preview-form-item-label')).toHaveText('状态');
  await expect(previewBlock.getByTestId('editor-tag-tool')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('switches nested selector toolbar to the hovered form item', async ({ page }) => {
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'form-seeded',
        type: 'MForm',
        data: {
          items: [
            {
              labelName: '字段',
              variableName: 'first',
              layout: 'Vertical',
              editor: {
                id: 'first-input',
                type: 'MInput',
                data: {
                  placeholder: '请输入.....',
                  value: ''
                }
              }
            },
            {
              labelName: '字段',
              variableName: 'second',
              layout: 'Vertical',
              editor: {
                id: 'second-input',
                type: 'MInput',
                data: {
                  placeholder: '请输入.....',
                  value: ''
                }
              }
            }
          ]
        }
      }
    ]
  });

  const form = page.getByTestId('editor-form-tool');
  const selectors = form.getByTestId('editor-selector-tool');
  await expect(selectors).toHaveCount(2);

  await selectors.nth(0).hover();
  await expect(selectors.nth(0).locator('.ce-toolbar--opened')).toHaveCount(1);
  await expect(selectors.nth(1).locator('.ce-toolbar--opened')).toHaveCount(0);

  await selectors.nth(1).hover();
  await expect(selectors.nth(0).locator('.ce-toolbar--opened')).toHaveCount(0);
  await expect(selectors.nth(1).locator('.ce-toolbar--opened')).toHaveCount(1);
});
