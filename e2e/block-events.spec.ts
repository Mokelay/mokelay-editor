import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  addEditorTool,
  defaultPageUuid,
  expectToolToolbarBeside,
  fillEventRow,
  getSavedBlocks,
  openToolEventsPanel,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('registers MActionEditor as an editor block and saves configured actions', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, 'Action配置');

  const actionTool = page.getByTestId('editor-tool-MActionEditor');
  await expect(actionTool).toBeVisible();
  await actionTool.getByTestId('m-action-editor-open').click();

  await expect(page.getByTestId('m-action-editor-dialog')).toBeVisible();
  await page.getByTestId('m-action-add-confirm').click();

  const uuidInput = page.getByTestId('m-action-uuid');
  await uuidInput.fill('confirm_in_block');
  await uuidInput.blur();

  await page.getByTestId('m-action-editor-close').click();
  await expect(page.getByTestId('m-action-editor-dialog')).toHaveCount(0);

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const actionBlock = blocks.find((block) => block.type === 'MActionEditor');

  expect(actionBlock?.data?.value).toEqual([
    {
      uuid: 'confirm_in_block',
      action: 'confirm',
      alias: '确认操作',
      inputs: {
        title: '提示',
        content: '是否确认操作？'
      },
      outputs: ['result'],
      nextAction: null
    }
  ]);
});

test('adds events to a block with properties and saves them at block level', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^链接$/);

  const { settingsButton } = await expectToolToolbarBeside(page, 'editor-link-tool');
  await settingsButton.click();

  const menuItems = page.locator('.ce-popover--opened .ce-popover-item');
  const menuOrder = await menuItems.evaluateAll((items) => items.map((item) => item.textContent ?? ''));
  expect(menuOrder.findIndex((text) => text.includes('属性'))).toBeLessThan(menuOrder.findIndex((text) => text.includes('事件')));

  await menuItems.filter({ hasText: '事件' }).click();
  const eventsDialog = page.locator('[data-testid="tool-events-dialog"][open]');
  await expect(eventsDialog).toBeVisible();
  await expect(eventsDialog.getByTestId('tool-events-empty')).toBeVisible();

  await eventsDialog.getByTestId('tool-events-add').click();
  await fillEventRow(eventsDialog, 0, { event: 'click' });
  await addCallBlockMethodAction(page, eventsDialog, 0, {
    uuid: 'refresh_first',
    blockId: 'xxxxx',
    method: 'refresh'
  });
  await eventsDialog.getByTestId('tool-events-add').click();
  await fillEventRow(eventsDialog, 1, { event: 'save' });
  await addCallBlockMethodAction(page, eventsDialog, 1, {
    uuid: 'close_second',
    blockId: 'yyyyy',
    method: 'close'
  });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const linkBlock = blocks.find((block) => block.type === 'MLink');

  expect(linkBlock?.events).toEqual([
    { event: 'click', actions: [callBlockMethodAction('refresh_first', 'xxxxx', 'refresh')] },
    { event: 'save', actions: [callBlockMethodAction('close_second', 'yyyyy', 'close')] }
  ]);
  expect(linkBlock?.events?.[0]).not.toHaveProperty('block');
  expect(linkBlock?.events?.[0]).not.toHaveProperty('method');
  expect(linkBlock?.data).not.toHaveProperty('__mokelayBlockEvents');
});

test('shows events for a block without properties and saves an empty event list', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^分割线$/);

  const { settingsButton } = await expectToolToolbarBeside(page, 'editor-divider-line-tool');
  await settingsButton.click();

  const openedMenu = page.locator('.ce-popover--opened');
  await expect(openedMenu.locator('.ce-popover-item').filter({ hasText: '属性' })).toHaveCount(0);
  await expect(openedMenu.locator('.ce-popover-item').filter({ hasText: '事件' })).toBeVisible();
  await openedMenu.locator('.ce-popover-item').filter({ hasText: '事件' }).click();

  const eventsDialog = page.locator('[data-testid="tool-events-dialog"][open]');
  await expect(eventsDialog.getByTestId('tool-events-empty')).toBeVisible();
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const dividerBlock = blocks.find((block) => block.type === 'MDividerLine');

  expect(dividerBlock?.events).toEqual([]);
  expect(dividerBlock?.data).toEqual({});
});

test('preserves events for blocks inside MPage', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^页面$/);

  const pageTool = page.getByTestId('editor-tool-MPage');
  await expect(pageTool).toBeVisible();
  await addScopedTool(pageTool, /^链接$/);

  const nestedLink = pageTool.getByTestId('editor-link-tool');
  const eventsDialog = await openScopedEventsPanel(page, pageTool, nestedLink);
  await eventsDialog.getByTestId('tool-events-add').click();
  await fillEventRow(eventsDialog, 0, { event: 'click' });
  await addCallBlockMethodAction(page, eventsDialog, 0, {
    uuid: 'inner_refresh',
    blockId: 'innerLink',
    method: 'refresh'
  });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const pageBlock = blocks.find((block) => block.type === 'MPage');
  const nestedBlocks = pageBlock?.data?.value as Array<{ type?: string; events?: unknown }> | undefined;
  const linkBlock = nestedBlocks?.find((block) => block.type === 'MLink');

  expect(linkBlock?.events).toEqual([
    { event: 'click', actions: [callBlockMethodAction('inner_refresh', 'innerLink', 'refresh')] }
  ]);
});

test('preserves events for the selected block inside MEditorSelector', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'selector-source',
      type: 'MEditorSelector',
      data: {
        value: {
          id: 'selector-link',
          type: 'MLink',
          data: {
            text: 'Selector link',
            url: 'https://mokelay.com',
            open: false
          },
          events: [
            { event: 'click', actions: [callBlockMethodAction('selector_refresh', 'selector-link', 'refresh')] }
          ]
        }
      }
    }
  ]));

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const selectorBlock = blocks.find((block) => block.type === 'MEditorSelector');
  const selectedBlock = selectorBlock?.data?.value as { events?: unknown } | undefined;

  expect(selectedBlock?.events).toEqual([
    { event: 'click', actions: [callBlockMethodAction('selector_refresh', 'selector-link', 'refresh')] }
  ]);
});

test('preserves events for blocks inside MAdvanceTable column content', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'columns-table',
      type: 'MAdvanceTable',
      data: {
        columns: [
          {
            columnName: '操作',
            fieldVariable: 'action',
            fieldDataType: 'string',
            columnContent: [
              {
                id: 'column-link',
                type: 'MLink',
                data: {
                  text: 'Open',
                  url: 'https://mokelay.com',
                  open: false
                },
                events: [
                  { event: 'click', actions: [callBlockMethodAction('column_refresh', 'columns-table', 'refresh')] }
                ]
              }
            ]
          }
        ]
      }
    }
  ]));

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const tableBlock = blocks.find((block) => block.type === 'MAdvanceTable');
  const columns = tableBlock?.data?.columns as Array<{ columnContent?: Array<{ events?: unknown }> }> | undefined;

  expect(columns?.[0]?.columnContent?.[0]?.events).toEqual([
    { event: 'click', actions: [callBlockMethodAction('column_refresh', 'columns-table', 'refresh')] }
  ]);
});

test('saves MForm internal item events on the item data', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^表单$/);
  await selectFormEditorTool(page, 'MInput');

  const eventsDialog = await openNestedFormItemEventsPanel(page);
  await eventsDialog.getByTestId('tool-events-add').click();
  await fillEventRow(eventsDialog, 0, { event: 'save' });
  await addCallBlockMethodAction(page, eventsDialog, 0, {
    uuid: 'form_item_close',
    blockId: 'formItem',
    method: 'close'
  });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const formBlock = blocks.find((block) => block.type === 'MForm');
  const items = formBlock?.data?.items as Array<{ events?: unknown }> | undefined;

  expect(items?.[0]?.events).toEqual([
    { event: 'save', actions: [callBlockMethodAction('form_item_close', 'formItem', 'close')] }
  ]);
});

test('loads existing events in the event dialog and saves edits', async ({ page }) => {
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'seeded-link',
        type: 'MLink',
        events: [
          { event: 'click', actions: [callBlockMethodAction('seeded_action', 'seeded', 'refresh')] }
        ],
        data: {
          text: '链接',
          url: 'https://mokelay.com',
          open: false
        }
      }
    ]
  });
  await switchLocaleToChinese(page);

  const eventsDialog = await openToolEventsPanel(page, 'editor-link-tool');
  await expect(eventsDialog.getByTestId('tool-event-input-0-event')).toHaveValue('click');
  await expect(eventsDialog.getByTestId('tool-event-input-0-block')).toHaveCount(0);
  await expect(eventsDialog.getByTestId('tool-event-input-0-method')).toHaveCount(0);

  await editFirstActionInputs(page, eventsDialog, 0, { blockId: 'seeded', method: 'close' });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const linkBlock = blocks.find((block) => block.type === 'MLink');

  expect(linkBlock?.events).toEqual([
    { event: 'click', actions: [callBlockMethodAction('seeded_action', 'seeded', 'close')] }
  ]);
});

test('runs preview events by calling exposed target block methods', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'source-button',
      type: 'MButton',
      data: {
        label: 'Focus input',
        variant: 'primary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        { event: 'click', actions: [callBlockMethodAction('focus_target', 'target-input', 'focus')] }
      ]
    },
    {
      id: 'target-input',
      type: 'MInput',
      data: {
        placeholder: 'Target input',
        value: ''
      }
    }
  ]));

  await openPreview(page);
  await page.getByRole('button', { name: 'Focus input' }).click();

  await expect(page.getByTestId('preview-block-MInput').getByTestId('editor-input-control')).toBeFocused();
});

test('runs preview events across nested MPage preview trees', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'outer-target-input',
      type: 'MInput',
      data: {
        placeholder: 'Outer target',
        value: ''
      }
    },
    {
      id: 'nested-page',
      type: 'MPage',
      data: {
        value: [
          {
            id: 'nested-source-button',
            type: 'MButton',
            data: {
              label: 'Focus outer',
              variant: 'secondary',
              align: 'left',
              action: { type: 'submit' }
            },
            events: [
              { event: 'click', actions: [callBlockMethodAction('focus_outer', 'outer-target-input', 'focus')] }
            ]
          }
        ]
      }
    }
  ]));

  await openPreview(page);
  await page.getByTestId('preview-block-MPage').getByRole('button', { name: 'Focus outer' }).click();

  await expect(page.getByTestId('preview-block-MInput').getByTestId('editor-input-control')).toBeFocused();
});

test('runs MForm item preview events against internal editor block ids', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'form-source',
      type: 'MForm',
      data: {
        items: [
          {
            labelName: '用户名',
            variableName: 'userName',
            layout: 'Vertical',
            events: [
              { event: 'click', actions: [callBlockMethodAction('focus_form_input', 'form-input', 'focus')] }
            ],
            editor: {
              id: 'form-input',
              type: 'MInput',
              data: {
                placeholder: 'Form target',
                value: ''
              }
            }
          }
        ]
      }
    }
  ]));

  await openPreview(page);
  const previewForm = page.getByTestId('preview-block-MForm');
  await previewForm.getByTestId('preview-form-item-label').click();

  await expect(previewForm.getByTestId('editor-input-control')).toBeFocused();
});

test('runs confirm true branch through datasource and block method actions', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'source-button',
      type: 'MButton',
      data: {
        label: 'Confirm and focus',
        variant: 'primary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [
            confirmAction('confirm_opt', 'check_confirm'),
            ifControllerAction('check_confirm', 'ds_update', null),
            executeJsonDatasourceAction('ds_update', { ok: true }, 'focus_target'),
            callBlockMethodAction('focus_target', 'target-input', 'focus')
          ]
        }
      ]
    },
    {
      id: 'target-input',
      type: 'MInput',
      data: {
        placeholder: 'Target input',
        value: ''
      }
    }
  ]));

  await openPreview(page);
  await page.getByRole('button', { name: 'Confirm and focus' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await page.getByTestId('global-call-ok').click();

  await expect(page.getByTestId('preview-block-MInput').getByTestId('editor-input-control')).toBeFocused();
});

test('stops confirm false branch at null nextAction', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'source-button',
      type: 'MButton',
      data: {
        label: 'Cancel focus',
        variant: 'primary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [
            confirmAction('confirm_opt', 'check_confirm'),
            ifControllerAction('check_confirm', 'focus_target', null),
            callBlockMethodAction('focus_target', 'target-input', 'focus')
          ]
        }
      ]
    },
    {
      id: 'target-input',
      type: 'MInput',
      data: {
        placeholder: 'Target input',
        value: ''
      }
    }
  ]));

  await openPreview(page);
  await page.getByRole('button', { name: 'Cancel focus' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await page.getByTestId('global-call-cancel').click();

  await expect(page.getByTestId('preview-block-MInput').getByTestId('editor-input-control')).not.toBeFocused();
});

test('routes switch controller case and default branches', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'published-button',
      type: 'MButton',
      data: {
        label: 'Published',
        variant: 'primary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [
            executeJsonDatasourceAction('read_status', { status: 'published' }, 'switch_status'),
            switchControllerAction('switch_status', 'focus_published', 'focus_default'),
            callBlockMethodAction('focus_published', 'published-input', 'focus'),
            callBlockMethodAction('focus_default', 'default-input', 'focus')
          ]
        }
      ]
    },
    {
      id: 'draft-button',
      type: 'MButton',
      data: {
        label: 'Draft',
        variant: 'secondary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [
            executeJsonDatasourceAction('read_status', { status: 'draft' }, 'switch_status'),
            switchControllerAction('switch_status', 'focus_published', 'focus_default'),
            callBlockMethodAction('focus_published', 'published-input', 'focus'),
            callBlockMethodAction('focus_default', 'default-input', 'focus')
          ]
        }
      ]
    },
    {
      id: 'published-input',
      type: 'MInput',
      data: {
        placeholder: 'Published input',
        value: ''
      }
    },
    {
      id: 'default-input',
      type: 'MInput',
      data: {
        placeholder: 'Default input',
        value: ''
      }
    }
  ]));

  await openPreview(page);
  await page.getByRole('button', { name: 'Published' }).click();
  await expect(page.getByPlaceholder('Published input')).toBeFocused();

  await page.getByRole('button', { name: 'Draft' }).click();
  await expect(page.getByPlaceholder('Default input')).toBeFocused();
});

test('runs jump_url with window.open for new windows', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'source-button',
      type: 'MButton',
      data: {
        label: 'Open docs',
        variant: 'ghost',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [jumpUrlAction('open_docs', 'https://mokelay.com/docs')]
        }
      ]
    }
  ]));

  await openPreview(page);
  await page.evaluate(() => {
    (window as Window & { __openedUrls?: string[] }).__openedUrls = [];
    window.open = (url?: string | URL) => {
      (window as Window & { __openedUrls: string[] }).__openedUrls.push(String(url ?? ''));
      return null;
    };
  });
  await page.getByRole('button', { name: 'Open docs' }).click();

  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __openedUrls?: string[] }).__openedUrls ?? []
  ))).toEqual(['https://mokelay.com/docs']);
});

test('runs open_dialog and renders the configured page', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'source-button',
      type: 'MButton',
      data: {
        label: 'Open dialog',
        variant: 'primary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [openDialogAction('open_page_dialog', defaultPageUuid)]
        }
      ]
    }
  ]));

  await openPreview(page);
  await page.getByRole('button', { name: 'Open dialog' }).click();

  await expect(page.getByTestId('action-dialog')).toBeVisible();
  await expect(page.getByTestId('action-dialog-title')).toHaveText('页面弹窗');
  await expect(page.getByTestId('action-dialog-body').getByRole('button', { name: 'Open dialog' })).toBeVisible();
  await page.getByTestId('action-dialog-close').click();
  await expect(page.getByTestId('action-dialog')).toHaveCount(0);
});

test('resolves action templates with editor processors', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'source-button',
      type: 'MButton',
      data: {
        label: 'Template focus',
        variant: 'primary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [
            executeJsonDatasourceAction('read_target', { target: ' target-input ' }, 'template_focus'),
            {
              uuid: 'template_focus',
              action: 'call_block_method',
              alias: 'Template focus',
              inputs: {
                blockId: {
                  template: "{{actions['read_target'].outputs.rawResponse.target}}",
                  processors: ['trim']
                },
                method: 'focus'
              },
              outputs: ['returnData'],
              nextAction: null
            }
          ]
        }
      ]
    },
    {
      id: 'target-input',
      type: 'MInput',
      data: {
        placeholder: 'Template target',
        value: ''
      }
    }
  ]));

  await openPreview(page);
  await page.getByRole('button', { name: 'Template focus' }).click();

  await expect(page.getByPlaceholder('Template target')).toBeFocused();
});

test('skips missing preview event targets and methods without breaking interaction', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'source-button',
      type: 'MButton',
      data: {
        label: 'No-op event',
        variant: 'ghost',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        { event: 'click', actions: [callBlockMethodAction('missing_target', 'missing-input', 'focus')] },
        { event: 'click', actions: [callBlockMethodAction('missing_method', 'target-input', 'missingMethod')] },
        { event: 'click', actions: [callBlockMethodAction('incomplete_method', '', 'focus')] }
      ]
    },
    {
      id: 'target-input',
      type: 'MInput',
      data: {
        placeholder: 'Target input',
        value: ''
      }
    }
  ]));

  await openPreview(page);
  await page.getByRole('button', { name: 'No-op event' }).click();

  await expect(page.getByTestId('preview-panel')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

async function addScopedTool(scope: Locator, toolTitle: string | RegExp) {
  const blocks = scope.locator('.ce-block');
  await expect(blocks.first()).toBeVisible();
  await blocks.last().click();
  await scope.locator('.ce-toolbar__plus').filter({ visible: true }).first().click();

  const menuItem = scope.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: toolTitle }).first();
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

async function openScopedEventsPanel(page: Page, scope: Locator, tool: Locator) {
  await expect(tool).toBeVisible();
  await tool.hover();

  const settingsButton = await getSettingsButtonBeside(scope, tool);
  await settingsButton.click();

  const eventButton = scope.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '事件' });
  await expect(eventButton).toBeVisible();
  await eventButton.click();

  const eventsDialog = page.locator('[data-testid="tool-events-dialog"][open]');
  await expect(eventsDialog).toBeVisible();
  return eventsDialog;
}

async function addCallBlockMethodAction(
  page: Page,
  eventsDialog: Locator,
  eventIndex: number,
  action: { uuid: string; blockId: string; method: string }
) {
  await eventsDialog.getByTestId(`tool-event-actions-${eventIndex}`).getByTestId('m-action-editor-open').click();
  await expect(page.getByTestId('m-action-editor-dialog')).toBeVisible();
  await page.getByTestId('m-action-add-call_block_method').click();

  const uuidInput = page.getByTestId('m-action-uuid');
  await uuidInput.fill(action.uuid);
  await uuidInput.blur();

  const inputs = page.getByTestId('m-action-inputs');
  await inputs.fill(JSON.stringify({
    blockId: action.blockId,
    method: action.method
  }, null, 2));
  await inputs.blur();

  await page.getByTestId('m-action-editor-close').click();
  await expect(page.getByTestId('m-action-editor-dialog')).toHaveCount(0);
}

async function editFirstActionInputs(
  page: Page,
  eventsDialog: Locator,
  eventIndex: number,
  inputsValue: Record<string, unknown>
) {
  await eventsDialog.getByTestId(`tool-event-actions-${eventIndex}`).getByTestId('m-action-editor-open').click();
  await expect(page.getByTestId('m-action-editor-dialog')).toBeVisible();

  const inputs = page.getByTestId('m-action-inputs');
  await inputs.fill(JSON.stringify(inputsValue, null, 2));
  await inputs.blur();

  await page.getByTestId('m-action-editor-close').click();
  await expect(page.getByTestId('m-action-editor-dialog')).toHaveCount(0);
}

function callBlockMethodAction(uuid: string, blockId: string, method: string, nextAction: string | null = null) {
  return {
    uuid,
    action: 'call_block_method',
    alias: '调用方法',
    inputs: {
      blockId,
      method
    },
    outputs: ['returnData'],
    nextAction
  };
}

function confirmAction(uuid: string, nextAction: string | null) {
  return {
    uuid,
    action: 'confirm',
    alias: '确认操作',
    inputs: {
      title: '提示',
      content: '是否确认操作？'
    },
    outputs: ['result'],
    nextAction
  };
}

function ifControllerAction(uuid: string, trueNextAction: string | null, falseNextAction: string | null) {
  return {
    uuid,
    alias: '检查 Confirm 结果',
    action: 'if_controller',
    type: 'controller',
    inputs: {
      value: {
        template: "{{actions['confirm_opt'].outputs.result}}"
      }
    },
    nodes: [
      {
        uuid: `${uuid}_true`,
        alias: '确认操作',
        value: true,
        nextAction: trueNextAction
      },
      {
        uuid: `${uuid}_false`,
        alias: '取消操作',
        value: false,
        nextAction: falseNextAction
      }
    ]
  };
}

function executeJsonDatasourceAction(uuid: string, rawData: Record<string, unknown>, nextAction: string | null) {
  return {
    uuid,
    action: 'execute_ds',
    alias: '调用数据源',
    inputs: {
      dsConfig: {
        type: 'JSON',
        rawData
      }
    },
    outputs: ['rawResponse', 'responses'],
    nextAction
  };
}

function switchControllerAction(uuid: string, publishedNextAction: string | null, defaultNextAction: string | null) {
  return {
    uuid,
    action: 'switch_controller',
    alias: '状态分支',
    type: 'controller',
    inputs: {
      value: {
        template: "{{actions['read_status'].outputs.rawResponse.status}}"
      },
      dataType: 'string'
    },
    nodes: [
      {
        uuid: `${uuid}_published`,
        alias: '已发布状态',
        value: 'published',
        nextAction: publishedNextAction
      },
      {
        uuid: `${uuid}_default`,
        alias: '默认状态',
        type: 'DEFAULT',
        nextAction: defaultNextAction
      }
    ]
  };
}

function jumpUrlAction(uuid: string, url: string) {
  return {
    uuid,
    action: 'jump_url',
    alias: '跳转链接',
    inputs: {
      openNew: true,
      url
    },
    nextAction: null
  };
}

function openDialogAction(uuid: string, pageUUID: string) {
  return {
    uuid,
    action: 'open_dialog',
    alias: '页面弹窗',
    inputs: {
      title: '页面弹窗',
      pageUUID
    },
    outputs: ['close_result'],
    nextAction: null
  };
}

function createSeededOutput(blocks: Array<Record<string, unknown>>) {
  return {
    time: 1777614863777,
    version: '2.31.6',
    blocks
  };
}

async function openPreview(page: Page) {
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-pc-canvas')).toBeVisible();
}

async function getSettingsButtonBeside(scope: Locator, tool: Locator) {
  const toolBox = await tool.boundingBox();
  expect(toolBox).not.toBeNull();

  const settingsButtons = await scope.locator('.ce-toolbar__settings-btn').filter({ visible: true }).all();
  let bestButton: Locator | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  const toolCenterY = toolBox!.y + toolBox!.height / 2;

  for (const button of settingsButtons) {
    const buttonBox = await button.boundingBox();
    if (!buttonBox) continue;
    const distance = Math.abs((buttonBox.y + buttonBox.height / 2) - toolCenterY);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestButton = button;
    }
  }

  expect(bestButton).toBeDefined();
  return bestButton!;
}

async function openFormAddMenu(page: Page) {
  const form = page.getByTestId('editor-form-tool');
  await expect(form).toBeVisible();

  const firstBlock = form.locator('.ce-block').first();
  await expect(firstBlock).toBeVisible();
  await firstBlock.click();
  await form.locator('.ce-toolbar__plus').filter({ visible: true }).first().click();
  await expect(form.locator('.ce-popover--opened .ce-popover-item')).not.toHaveCount(0);

  return form;
}

async function selectFormEditorTool(page: Page, toolName: string) {
  const form = await openFormAddMenu(page);
  const menuItem = form.locator(`.ce-popover--opened .ce-popover-item[data-item-name="${toolName}"]`);
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

async function openNestedFormItemEventsPanel(page: Page) {
  const form = page.getByTestId('editor-form-tool');
  const editShell = form.getByTestId('form-item-edit-shell');
  await expect(editShell).toBeVisible();
  await page.keyboard.press('Escape');
  await editShell.hover({ position: { x: 4, y: 4 } });

  const settingsButton = form.locator('.ce-toolbar__settings-btn').filter({ visible: true }).first();
  await expect(settingsButton).toBeVisible();
  await settingsButton.click();

  const eventButton = form.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '事件' });
  await expect(eventButton).toBeVisible();
  await eventButton.click();

  const eventsDialog = page.locator('[data-testid="tool-events-dialog"][open]');
  await expect(eventsDialog).toBeVisible();
  return eventsDialog;
}
