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

  const propertyButton = form.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: /属性|Properties/ });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  return propertyDialog;
}

async function openOuterFormPropertyPanel(page: Page) {
  const form = page.getByTestId('editor-form-tool');
  await expect(form).toBeVisible();
  const formBlock = form.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ce-block ")][1]');
  await expect(formBlock).toBeVisible();
  const formBlockBox = await formBlock.boundingBox();
  if (formBlockBox) {
    const x = formBlockBox.x + Math.min(24, Math.max(4, formBlockBox.width / 2));
    const y = formBlockBox.y + Math.min(Math.max(24, formBlockBox.height / 2), Math.max(4, formBlockBox.height - 4));
    await page.mouse.move(x, y);
    await page.mouse.click(x, y);
  }
  await form.hover({ position: { x: 8, y: 8 } });
  await page.waitForTimeout(50);

  const settingsButton = page
    .getByTestId('editor-surface')
    .locator(':scope > .codex-editor > .ce-toolbar .ce-toolbar__settings-btn')
    .first();
  await expect(settingsButton).toBeVisible();
  await settingsButton.click({ force: true });

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: /属性|Properties/ });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-panel')).toBeVisible();
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
  await page.getByTestId('preview-button').click();

  const previewBlock = page.getByTestId('preview-block-MForm');
  await expect(previewBlock).toBeVisible({ timeout: 15000 });
  await expect(previewBlock.getByTestId('preview-form-item-label')).toHaveText('用户名');
  await expect(previewBlock.getByTestId('editor-input-tool')).toBeVisible();
  await expect(previewBlock).not.toContainText('userName');
});

test('keeps nested form item property input focused while typing', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^表单$/);
  await selectFormEditorTool(page, 'MInput');

  const form = page.getByTestId('editor-form-tool');
  const propertyDialog = await openNestedFormItemPropertyPanel(page);
  const labelInput = propertyDialog.getByTestId('tool-property-input-labelName');

  await labelInput.click();
  await labelInput.press('ControlOrMeta+A');
  await expect(labelInput).toBeFocused();

  await page.keyboard.type('用户名');

  await expect(labelInput).toBeFocused();
  await expect(labelInput).toHaveValue('用户名');
  await expect(form.getByTestId('form-item-label-preview')).toHaveText('用户名');
});

test('configures form items from the form property panel', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^表单$/);

  const propertyDialog = await openOuterFormPropertyPanel(page);
  await expect(propertyDialog.getByTestId('tool-property-input-layout')).toHaveValue('Vertical');
  await propertyDialog.getByTestId('tool-property-input-layout').selectOption('Horizontal');
  await expect(propertyDialog.getByTestId('tool-property-component-items')).toBeVisible();
  await propertyDialog.getByTestId('form-items-settings-open').click();

  const itemsDialog = page.locator('[data-testid="form-items-dialog"][open]').last();
  await expect(itemsDialog).toBeVisible();
  await expect(itemsDialog.getByTestId('form-items-empty')).toBeVisible();

  await itemsDialog.getByTestId('fields-settings-open').click();
  const fieldsDialog = page.locator('[data-testid="fields-settings-dialog"][open]').last();
  await expect(fieldsDialog).toBeVisible();
  await fieldsDialog.getByTestId('fields-add').click();
  await fieldsDialog.getByTestId('fields-label-0').fill('用户名');
  await fieldsDialog.getByTestId('fields-variable-0').fill('userName');
  await fieldsDialog.getByTestId('fields-add').click();
  await fieldsDialog.getByTestId('fields-label-1').fill('邮箱');
  await fieldsDialog.getByTestId('fields-variable-1').fill('email');
  await fieldsDialog.getByTestId('fields-save').click();
  await expect(fieldsDialog).not.toBeVisible();

  await expect(itemsDialog.getByTestId('form-item-row-0')).toBeVisible();
  await expect(itemsDialog.getByTestId('form-item-row-1')).toBeVisible();
  await expect(itemsDialog.getByTestId('form-item-label-0')).toHaveValue('用户名');
  await expect(itemsDialog.getByTestId('form-item-variable-0')).toHaveValue('userName');
  await expect(itemsDialog.getByTestId('form-item-editor-type-0')).toHaveValue('MInput');
  await expect(itemsDialog.getByTestId('form-item-editor-type-1')).toHaveValue('MInput');

  await itemsDialog.getByTestId('form-item-label-1').fill('联系邮箱');
  await itemsDialog.getByTestId('form-item-layout-1').selectOption('Horizontal');
  await itemsDialog.getByTestId('form-item-editor-type-1').selectOption('MEmailField');
  await itemsDialog.getByTestId('form-items-save').click();
  await expect(itemsDialog).not.toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-component-actionBar')).toBeVisible();
  await propertyDialog.getByTestId('form-action-bar-settings-open').click();
  const actionBarDialog = page.locator('[data-testid="form-action-bar-dialog"][open]').last();
  await expect(actionBarDialog).toBeVisible();
  await actionBarDialog.getByTestId('form-action-bar-align').selectOption('right');
  await actionBarDialog.getByTestId('form-action-bar-size').selectOption('small');
  await actionBarDialog.getByTestId('form-action-bar-add-button').click();
  await actionBarDialog.getByTestId('form-action-bar-button-id-0').fill('submit');
  await actionBarDialog.getByTestId('form-action-bar-button-label-0').fill('提交');
  await actionBarDialog.getByTestId('form-action-bar-button-variant-0').selectOption('primary');
  await actionBarDialog.getByTestId('form-action-bar-save').click();
  await expect(actionBarDialog).not.toBeVisible();
  await propertyDialog.getByTestId('tool-property-close').click();

  const form = page.getByTestId('editor-form-tool');
  await expect(form.getByTestId('form-item-label-preview')).toHaveCount(2);
  await expect(form.getByTestId('form-item-label-preview').nth(0)).toHaveText('用户名');
  await expect(form.getByTestId('form-item-label-preview').nth(1)).toHaveText('联系邮箱');
  await expect(form.getByTestId('editor-input-tool')).toBeVisible();
  await expect(form.getByTestId('page-dsl-block-MEmailField')).toBeVisible();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const formBlock = blocks.find((block) => block.type === 'MForm');
  const items = formBlock?.data?.items as Array<{
    labelName?: string;
    variableName?: string;
    fieldDataType?: string;
    layout?: string;
    editor?: { type?: string };
  }> | undefined;

  expect(formBlock?.data?.layout).toBe('Horizontal');
  expect(formBlock?.data?.actionBar).toEqual({
    align: 'right',
    size: 'small',
    mode: 'inline',
    buttons: [
      {
        id: 'submit',
        label: '提交',
        variant: 'primary',
        align: 'left',
        events: []
      }
    ]
  });
  expect(formBlock?.data).not.toHaveProperty('toolbar');
  expect(items).toHaveLength(2);
  expect(items?.[0]).toEqual(expect.objectContaining({
    labelName: '用户名',
    variableName: 'userName',
    fieldDataType: 'string',
    layout: 'Vertical'
  }));
  expect(items?.[0]?.editor?.type).toBe('MInput');
  expect(items?.[1]).toEqual(expect.objectContaining({
    labelName: '联系邮箱',
    variableName: 'email',
    fieldDataType: 'string',
    layout: 'Horizontal'
  }));
  expect(items?.[1]?.editor?.type).toBe('MEmailField');

  await page.getByTestId('preview-button').click();
  const previewBlock = page.getByTestId('preview-block-MForm');
  await expect(previewBlock).toBeVisible({ timeout: 15000 });
  await expect(previewBlock.getByTestId('editor-form-tool')).toHaveClass(/ce-form-tool--horizontal/);
  await expect(previewBlock.getByTestId('form-action-bar')).toBeVisible();
  await expect(previewBlock.getByTestId('m-action-toolbar-action-submit')).toContainText('提交');
  await expect(previewBlock.getByTestId('preview-form-item-label').nth(0)).toHaveText('用户名');
  await expect(previewBlock.getByTestId('preview-form-item-label').nth(1)).toHaveText('联系邮箱');
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
  await expect(previewBlock).toBeVisible({ timeout: 15000 });
  await expect(previewBlock.getByTestId('preview-form-item-label')).toHaveText('状态');
  await expect(previewBlock.getByTestId('editor-tag-tool')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('supports runtime values, reset, and submit options', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'runtime-form',
        type: 'MForm',
        data: {
          values: {
            alias: 'Initial alias'
          },
          defaultValues: {
            alias: 'Default alias',
            description: 'Default description',
            token: 'persisted'
          },
          submit: {
            filterEmpty: true,
            includeDisabled: false,
            includeHidden: false
          },
          processors: {
            beforeSetValues: [
              { processor: 'merge_data', param: [{ source: 'setValues' }] }
            ],
            beforeSubmit: [
              { processor: 'merge_data', param: [{ submitted: true }] }
            ]
          },
          items: [
            {
              labelName: 'UUID',
              variableName: 'uuid',
              layout: 'Horizontal',
              editor: {
                id: 'runtime-uuid',
                type: 'MInput',
                data: {
                  value: 'locked',
                  disabled: true
                }
              }
            },
            {
              labelName: 'Alias',
              variableName: 'alias',
              layout: 'Horizontal',
              editor: {
                id: 'runtime-alias',
                type: 'MInput',
                data: {
                  value: ''
                }
              }
            },
            {
              labelName: 'Description',
              variableName: 'description',
              layout: 'Horizontal',
              editor: {
                id: 'runtime-description',
                type: 'MInput',
                data: {
                  value: ''
                }
              }
            },
            {
              labelName: 'Secret',
              variableName: 'secret',
              layout: 'Horizontal',
              hidden: true,
              editor: {
                id: 'runtime-secret',
                type: 'MInput',
                data: {
                  value: 'secret'
                }
              }
            }
          ]
        }
      },
      {
        id: 'set-values-button',
        type: 'MButton',
        data: {
          label: 'Set Values',
          variant: 'primary',
          align: 'left',
          action: { type: 'submit' }
        },
        events: [
          {
            event: 'click',
            actions: [
              {
                uuid: 'set_form_values',
                action: 'call_block_method',
                inputs: {
                  blockId: 'runtime-form',
                  method: 'setValues',
                  args: {
                    alias: 'Bob',
                    description: ''
                  }
                },
                outputs: ['returnData'],
                nextAction: null
              }
            ]
          }
        ]
      },
      {
        id: 'reset-values-button',
        type: 'MButton',
        data: {
          label: 'Reset Values',
          variant: 'secondary',
          align: 'left',
          action: { type: 'submit' }
        },
        events: [
          {
            event: 'click',
            actions: [
              {
                uuid: 'reset_form_values',
                action: 'call_block_method',
                inputs: {
                  blockId: 'runtime-form',
                  method: 'reset'
                },
                outputs: ['returnData'],
                nextAction: null
              }
            ]
          }
        ]
      },
      {
        id: 'submit-values-button',
        type: 'MButton',
        data: {
          label: 'Submit Values',
          variant: 'primary',
          align: 'left',
          action: { type: 'submit' }
        },
        events: [
          {
            event: 'click',
            actions: [
              {
                uuid: 'submit_form_values',
                action: 'call_block_method',
                inputs: {
                  blockId: 'runtime-form',
                  method: 'submit'
                },
                outputs: ['returnData'],
                nextAction: 'post_form_values'
              },
              {
                uuid: 'post_form_values',
                action: 'execute_ds',
                inputs: {
                  dsConfig: {
                    type: 'API',
                    domain: 'mokelay',
                    path: '/api/mokelay/create_app',
                    method: 'POST',
                    headerData: [],
                    queryData: [],
                    bodyData: [
                      {
                        key: 'values',
                        dataType: 'object',
                        value: {
                          template: "{{actions['submit_form_values'].outputs.returnData.values}}"
                        }
                      }
                    ],
                    schemaSelections: [],
                    matchingExternalFields: []
                  }
                },
                outputs: ['rawResponse'],
                nextAction: null
              }
            ]
          }
        ]
      }
    ]
  });
  await page.getByTestId('preview-button').click();
  const previewBlock = page.getByTestId('preview-block-MForm');
  await expect(previewBlock).toBeVisible({ timeout: 15000 });
  await expect(previewBlock.getByTestId('runtime-alias')).toHaveValue('Initial alias');
  await expect(previewBlock.getByTestId('runtime-description')).toHaveValue('Default description');
  await expect(previewBlock.getByTestId('runtime-uuid')).toHaveValue('locked');
  await expect(previewBlock.getByTestId('runtime-secret')).toHaveCount(0);

  await page.getByTestId('set-values-button').click();
  await expect(previewBlock.getByTestId('runtime-alias')).toHaveValue('Bob');
  await expect(previewBlock.getByTestId('runtime-description')).toHaveValue('');

  await page.getByTestId('reset-values-button').click();
  await expect(previewBlock.getByTestId('runtime-alias')).toHaveValue('Default alias');
  await expect(previewBlock.getByTestId('runtime-description')).toHaveValue('Default description');

  await page.getByTestId('set-values-button').click();
  await expect(previewBlock.getByTestId('runtime-alias')).toHaveValue('Bob');

  const requestPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'POST' && url.pathname === '/api/mokelay/create_app';
  });
  await page.getByTestId('submit-values-button').click();
  const request = await requestPromise;
  expect(request.postDataJSON()).toEqual({
    values: {
      alias: 'Bob',
      token: 'persisted',
      source: 'setValues',
      submitted: true
    }
  });
  expect(pageErrors).toEqual([]);
});

test('keeps existing form item editor and events when saving form items editor', async ({ page }) => {
  await switchLocaleToChinese(page);
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
              labelName: '官网',
              variableName: 'siteUrl',
              fieldDataType: 'string',
              layout: 'Horizontal',
              editor: {
                id: 'custom-link-editor',
                type: 'MLink',
                data: {
                  text: 'Mokelay',
                  url: 'https://mokelay.com',
                  open: true
                }
              },
              events: [
                {
                  event: 'click',
                  actions: [
                    {
                      uuid: 'focus_link',
                      action: 'call_block_method',
                      inputs: {
                        blockId: 'target-block',
                        method: 'focus'
                      },
                      nextAction: null
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  });

  const propertyDialog = await openOuterFormPropertyPanel(page);
  await propertyDialog.getByTestId('form-items-settings-open').click();
  const itemsDialog = page.locator('[data-testid="form-items-dialog"][open]').last();
  await expect(itemsDialog.getByTestId('form-item-row-0')).toBeVisible();
  await expect(itemsDialog.getByTestId('form-item-editor-type-0')).toHaveValue('MLink');
  await itemsDialog.getByTestId('form-items-save').click();
  await expect(itemsDialog).not.toBeVisible();
  await propertyDialog.getByTestId('tool-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const formBlock = blocks.find((block) => block.type === 'MForm');
  const items = formBlock?.data?.items as Array<{
    editor?: { id?: string; type?: string; data?: Record<string, unknown> };
    events?: Array<{ event?: string; actions?: Array<Record<string, unknown>> }>;
  }> | undefined;

  expect(items).toHaveLength(1);
  expect(items?.[0]?.editor).toEqual(expect.objectContaining({
    id: 'custom-link-editor',
    type: 'MLink',
    data: expect.objectContaining({
      text: 'Mokelay',
      url: 'https://mokelay.com',
      open: true
    })
  }));
  expect(items?.[0]?.events).toEqual([
    {
      event: 'click',
      actions: [
        {
          uuid: 'focus_link',
          action: 'call_block_method',
          inputs: {
            blockId: 'target-block',
            method: 'focus'
          },
          nextAction: null
        }
      ]
    }
  ]);
  expect(items?.[0]?.events?.[0]).not.toHaveProperty('block');
  expect(items?.[0]?.events?.[0]).not.toHaveProperty('method');
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

test('keeps form item toolbar beside the hovered item', async ({ page }) => {
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
                id: 'second-link',
                type: 'MLink',
                data: {
                  text: '链接',
                  url: 'https://mokelay.com',
                  open: false
                }
              }
            },
            {
              labelName: '字段',
              variableName: 'third',
              layout: 'Vertical',
              editor: {
                id: 'third-input',
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
  const secondItemShell = form.getByTestId('form-item-edit-shell').nth(1);
  const formToolbarPlus = form
    .locator('[data-testid="form-editor-surface"] > .codex-editor > .ce-toolbar .ce-toolbar__plus');

  await secondItemShell.hover({ position: { x: 4, y: 4 } });
  await expect(formToolbarPlus).toBeVisible();

  await expect.poll(async () => {
    const itemBox = await secondItemShell.boundingBox();
    const toolbarBox = await formToolbarPlus.boundingBox();

    if (!itemBox || !toolbarBox) {
      return false;
    }

    return toolbarBox.x < itemBox.x
      && toolbarBox.y > itemBox.y - 12
      && toolbarBox.y < itemBox.y + itemBox.height;
  }).toBe(true);
});
