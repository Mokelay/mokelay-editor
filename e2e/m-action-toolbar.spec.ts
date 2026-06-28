import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  addEditorTool,
  expectToolToolbarBeside,
  getSavedBlocks,
  openToolPropertyPanel,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('adds an action toolbar, saves structured toolbar config, and renders in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '动作工具栏');

  const toolbar = page.getByTestId('m-action-toolbar');
  await expect(toolbar).toBeVisible();
  await expect(toolbar.getByTestId('m-action-toolbar-action-search')).toContainText('搜索');
  await expect(toolbar.getByTestId('m-action-toolbar-action-reset')).toContainText('重置');
  await expectToolToolbarBeside(page, 'm-action-toolbar');

  const propertyDialog = await openToolPropertyPanel(page, 'm-action-toolbar');
  await expect(propertyDialog.getByTestId('tool-property-component-toolbar')).toBeVisible();
  await propertyDialog.getByTestId('form-action-bar-settings-open').click();
  const toolbarDialog = page.locator('[data-testid="form-action-bar-dialog"][open]').last();
  await expect(toolbarDialog).toBeVisible();
  await toolbarDialog.getByTestId('form-action-bar-align').selectOption('right');
  await toolbarDialog.getByTestId('form-action-bar-size').selectOption('small');
  await toolbarDialog.getByTestId('form-action-bar-mode').selectOption('inline');
  await expect(propertyDialog.getByTestId('tool-property-input-contextBlocks')).toHaveCount(0);
  await expect(propertyDialog.getByTestId('tool-property-input-actions')).toHaveCount(0);
  await expect(propertyDialog.getByTestId('tool-property-input-buttons')).toHaveCount(0);
  await toolbarDialog.getByTestId('form-action-bar-button-id-0').fill('create');
  await toolbarDialog.getByTestId('form-action-bar-button-label-0').fill('新增');
  await toolbarDialog.getByTestId('form-action-bar-button-variant-0').selectOption('primary');
  await toolbarDialog.getByTestId('form-action-bar-button-id-1').fill('reject');
  await toolbarDialog.getByTestId('form-action-bar-button-label-1').fill('拒绝');
  await toolbarDialog.getByTestId('form-action-bar-button-variant-1').selectOption('danger');
  await toolbarDialog.getByTestId('form-action-bar-save').click();
  await expect(toolbarDialog).not.toBeVisible();
  await propertyDialog.getByTestId('tool-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const toolbarBlock = blocks.find((block) => block.type === 'MActionToolbar');

  expect(toolbarBlock?.data).toEqual({
    align: 'right',
    size: 'small',
    mode: 'inline',
    buttons: [
      {
        id: 'create',
        label: '新增',
        variant: 'primary',
        align: 'left',
        events: []
      },
      {
        id: 'reject',
        label: '拒绝',
        variant: 'danger',
        align: 'left',
        events: []
      }
    ]
  });
  expect(toolbarBlock?.data).not.toHaveProperty('contextBlocks');
  expect(toolbarBlock?.data).not.toHaveProperty('actions');
  expect((toolbarBlock?.data?.buttons as Array<Record<string, unknown>>)[1]).not.toHaveProperty('action');
  expect(toolbarBlock?.data).not.toHaveProperty('loadingState');
  expect(toolbarBlock?.data).not.toHaveProperty('disabledState');

  await openPreview(page);
  await expect(page.getByTestId('preview-block-MActionToolbar')).toBeVisible();
  await expect(page.getByTestId('m-action-toolbar-action-create')).toContainText('新增');
});

test('executes toolbar button events with call_block_method blockId inputs', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    actionToolbarBlock('toolbar', [
      toolbarButton('focus_block_id', 'Focus blockId', {
        events: clickEvents([callBlockMethodAction('focus_by_block_id', { blockId: 'target-input', method: 'focus' })])
      })
    ]),
    inputBlock('target-input', 'Target input')
  ]));

  await openPreview(page);
  const targetInput = page.getByTestId('preview-block-MInput').getByTestId('editor-input-control');

  await page.getByTestId('m-action-toolbar-action-focus_block_id').click();
  await expect(targetInput).toBeFocused();
});

test('confirms dangerous actions and cancels without executing', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    actionToolbarBlock('toolbar', [
      toolbarButton('reject', 'Reject', {
        variant: 'danger',
        events: clickEvents([
          confirmAction('reject_confirm', 'Reject item', 'Reject this item?', 'reject_confirm_route'),
          ifControllerAction(
            'reject_confirm_route',
            "{{actions['reject_confirm'].outputs.result}}",
            'focus_target'
          ),
          callBlockMethodAction('focus_target', { blockId: 'target-input', method: 'focus' })
        ])
      })
    ]),
    inputBlock('target-input', 'Target input')
  ]));

  await openPreview(page);
  const targetInput = page.getByTestId('preview-block-MInput').getByTestId('editor-input-control');

  await page.getByTestId('m-action-toolbar-action-reject').click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await page.getByTestId('global-call-cancel').click();
  await expect(targetInput).not.toBeFocused();
});

test('executes toolbar button events through external trigger', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    {
      id: 'external-trigger',
      type: 'MButton',
      data: {
        label: 'External high trigger',
        variant: 'primary',
        align: 'left',
        action: { type: 'submit' }
      },
      events: [
        {
          event: 'click',
          actions: [
            callBlockMethodAction('external_trigger', {
              blockId: 'toolbar',
              method: 'trigger',
              buttonId: 'focus_target'
            })
          ]
        }
      ]
    },
    actionToolbarBlock('toolbar', [
      toolbarButton('focus_target', 'Focus target', {
        events: clickEvents([callBlockMethodAction('focus_target_input', { blockId: 'target-input', method: 'focus' })])
      })
    ]),
    inputBlock('target-input', 'Target input')
  ]));

  await openPreview(page);
  const targetInput = page.getByTestId('preview-block-MInput').getByTestId('editor-input-control');

  await page.getByRole('button', { name: 'External high trigger' }).click();
  await expect(targetInput).toBeFocused();
});

test('updates toolbar disabled state from table selection events in preview', async ({ page }) => {
  await page.route('**/toolbar-table-data', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { name: 'Ada' },
          { name: 'Lin' }
        ],
        page: 1,
        pageSize: 10,
        total: 2
      })
    });
  });

  await seedSavedConfig(page, createSeededOutput([
    actionToolbarBlock('toolbar', [
      toolbarButton('batch', 'Batch edit', {
        disabled: true,
        events: clickEvents([callBlockMethodAction('focus_target', { blockId: 'target-input', method: 'focus' })])
      })
    ]),
    advanceTableBlock('risk-table', toolbarSelectionEvents('toolbar', 'batch')),
    inputBlock('target-input', 'Target input')
  ]));

  await openPreview(page);
  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Ada');

  const batchButton = page.getByTestId('m-action-toolbar-action-batch');
  await expect(batchButton).toBeDisabled();

  await page.getByTestId('advance-table-selection-cell-0').locator('input').check();
  await expect(batchButton).toBeEnabled();
  await page.getByTestId('advance-table-selection-cell-0').locator('input').uncheck();
  await expect(batchButton).toBeDisabled();
  await page.getByTestId('advance-table-selection-cell-0').locator('input').check();
  await expect(batchButton).toBeEnabled();

  await batchButton.click();
  await expect(page.getByTestId('preview-block-MInput').getByTestId('editor-input-control')).toBeFocused();
});

test('updates toolbar disabled state from table selection events in the editor canvas', async ({ page }) => {
  await page.route('**/toolbar-table-data', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { name: 'Ada' },
          { name: 'Lin' }
        ],
        page: 1,
        pageSize: 10,
        total: 2
      })
    });
  });

  await seedSavedConfig(page, createSeededOutput([
    actionToolbarBlock('toolbar', [
      toolbarButton('batch', 'Batch edit', {
        disabled: true
      })
    ]),
    advanceTableBlock('risk-table', toolbarSelectionEvents('toolbar', 'batch'))
  ]));

  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Ada');

  const batchButton = page.getByTestId('m-action-toolbar-action-batch');
  await expect(batchButton).toBeDisabled();

  await page.getByTestId('advance-table-selection-cell-0').locator('input').check();
  await expect(batchButton).toBeEnabled();
  await page.getByTestId('advance-table-selection-cell-0').locator('input').uncheck();
  await expect(batchButton).toBeDisabled();
});

test('does not refetch a self-referencing table when selection events toggle toolbar state', async ({ page }) => {
  let requestCount = 0;
  await page.route('**/toolbar-self-table-data**', async (route) => {
    requestCount += 1;
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { name: `Page ${url.searchParams.get('page') || '1'}` }
        ],
        page: Number(url.searchParams.get('page') || '1'),
        pageSize: Number(url.searchParams.get('pageSize') || '10'),
        total: 1
      })
    });
  });

  await seedSavedConfig(page, createSeededOutput([
    actionToolbarBlock('toolbar', [
      toolbarButton('batch', 'Batch edit', {
        disabled: true
      })
    ]),
    selfReferencingAdvanceTableBlock('self-table', toolbarSelectionEvents('toolbar', 'batch'))
  ]));

  await openPreview(page);
  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Page 1');
  await page.waitForTimeout(500);
  expect(requestCount).toBe(1);

  await page.getByTestId('advance-table-selection-cell-0').locator('input').check();
  await page.waitForTimeout(300);
  expect(requestCount).toBe(1);
});

test('renders dropdown and grouped action menus', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    actionToolbarBlock('dropdown-toolbar', [
      toolbarButton('import', 'Import'),
      {
        ...toolbarButton('exports', 'Exports'),
        children: [
          toolbarButton('export_csv', 'Export CSV'),
          toolbarButton('export_xlsx', 'Export XLSX')
        ]
      }
    ], 'dropdown'),
    actionToolbarBlock('grouped-toolbar', [
      {
        ...toolbarButton('audit', 'Audit'),
        children: [
          toolbarButton('approve', 'Approve'),
          toolbarButton('reject', 'Reject', { variant: 'danger' })
        ]
      }
    ], 'grouped')
  ]));

  await openPreview(page);
  await page.getByTestId('m-action-toolbar-more').click();
  await expect(page.getByTestId('m-action-toolbar-menu-more')).toBeVisible();
  await expect(page.getByTestId('m-action-toolbar-action-export_csv')).toBeVisible();
  await page.getByTestId('m-action-toolbar-more').click();
  await expect(page.getByTestId('m-action-toolbar-menu-more')).toHaveCount(0);

  await page.getByTestId('m-action-toolbar-action-audit').click();
  await expect(page.getByTestId('m-action-toolbar-menu-audit')).toBeVisible();
  await expect(page.getByTestId('m-action-toolbar-action-approve')).toBeVisible();
  await expect(page.getByTestId('m-action-toolbar-action-reject')).toBeVisible();
});

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

function toolbarButton(id: string, label: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    label,
    variant: 'secondary',
    align: 'left',
    events: [],
    ...overrides
  };
}

function actionToolbarBlock(
  id: string,
  buttons: Array<Record<string, unknown>>,
  mode = 'inline'
) {
  return {
    id,
    type: 'MActionToolbar',
    data: {
      align: 'left',
      size: 'medium',
      mode,
      buttons
    }
  };
}

function inputBlock(id: string, placeholder: string) {
  return {
    id,
    type: 'MInput',
    data: {
      placeholder,
      value: ''
    }
  };
}

function callBlockMethodAction(uuid: string, inputs: Record<string, unknown>) {
  return {
    uuid,
    action: 'call_block_method',
    inputs,
    outputs: ['returnData'],
    nextAction: null
  };
}

function clickEvents(actions: Array<Record<string, unknown>>) {
  return [
    {
      event: 'click',
      actions
    }
  ];
}

function toolbarSelectionEvents(toolbarId: string, buttonId: string) {
  return [
    {
      event: 'havingSelectedRows',
      actions: [
        callBlockMethodAction(`enable_${buttonId}`, {
          blockId: toolbarId,
          method: 'enable',
          buttonId
        })
      ]
    },
    {
      event: 'emptySelectedRow',
      actions: [
        callBlockMethodAction(`disable_${buttonId}`, {
          blockId: toolbarId,
          method: 'disable',
          buttonId
        })
      ]
    }
  ];
}

function confirmAction(uuid: string, title: string, content: string, nextAction: string | null) {
  return {
    uuid,
    action: 'confirm',
    inputs: {
      title,
      content
    },
    outputs: ['result'],
    nextAction
  };
}

function ifControllerAction(uuid: string, valueTemplate: string, trueNextAction: string) {
  return {
    uuid,
    action: 'if_controller',
    type: 'controller',
    inputs: {
      value: {
        template: valueTemplate
      }
    },
    nodes: [
      {
        uuid: `${uuid}_true`,
        value: true,
        nextAction: trueNextAction
      },
      {
        uuid: `${uuid}_false`,
        value: false,
        nextAction: null
      }
    ]
  };
}

function advanceTableBlock(id: string, events: Array<Record<string, unknown>> = []) {
  return {
    id,
    type: 'MAdvanceTable',
    data: {
      index: false,
      selection: true,
      columns: [
        {
          columnName: 'Name',
          columnContent: [
            {
              id: 'name-cell',
              type: 'paragraph',
              data: {
                text: '{{name}}'
              }
            }
          ],
          width: 160,
          fixed: null
        }
      ],
      ds: {
        type: 'API',
        domain: 'mokelay',
        path: '/toolbar-table-data',
        method: 'GET',
        headerData: [],
        bodyData: [],
        queryData: [],
        schemaSelections: [
          {
            label: 'Rows',
            path: 'items[]',
            type: 'array'
          }
        ],
        matchingExternalFields: [
          {
            label: 'Rows',
            variable: 'data',
            matchFieldPath: 'items[]'
          },
          {
            label: 'Page',
            variable: 'page',
            matchFieldPath: 'page'
          },
          {
            label: 'Page size',
            variable: 'pageSize',
            matchFieldPath: 'pageSize'
          },
          {
            label: 'Total',
            variable: 'total',
            matchFieldPath: 'total'
          }
        ]
      }
    },
    ...(events.length ? { events } : {})
  };
}

function selfReferencingAdvanceTableBlock(id: string, events: Array<Record<string, unknown>> = []) {
  return {
    id,
    type: 'MAdvanceTable',
    data: {
      index: false,
      selection: true,
      showPageBreak: true,
      columns: [
        {
          columnName: 'Name',
          columnContent: [
            {
              id: 'self-name-cell',
              type: 'paragraph',
              data: {
                text: '{{name}}'
              }
            }
          ],
          width: 160,
          fixed: null
        }
      ],
      ds: {
        type: 'API',
        domain: 'mokelay',
        path: '/toolbar-self-table-data',
        method: 'GET',
        headerData: [],
        bodyData: [],
        queryData: [
          {
            key: 'page',
            value: {
              mode: 'variable',
              blockId: id,
              blockType: 'MAdvanceTable',
              variable: 'page'
            }
          },
          {
            key: 'pageSize',
            value: {
              mode: 'variable',
              blockId: id,
              blockType: 'MAdvanceTable',
              variable: 'pageSize'
            }
          }
        ],
        schemaSelections: [
          {
            label: 'Rows',
            path: 'items[]',
            type: 'array'
          },
          {
            label: 'Page',
            path: 'page',
            type: 'number'
          },
          {
            label: 'Page size',
            path: 'pageSize',
            type: 'number'
          },
          {
            label: 'Total',
            path: 'total',
            type: 'number'
          }
        ],
        matchingExternalFields: [
          {
            label: 'Rows',
            variable: 'data',
            matchFieldPath: 'items[]'
          },
          {
            label: 'Page',
            variable: 'page',
            matchFieldPath: 'page'
          },
          {
            label: 'Page size',
            variable: 'pageSize',
            matchFieldPath: 'pageSize'
          },
          {
            label: 'Total',
            variable: 'total',
            matchFieldPath: 'total'
          }
        ]
      }
    },
    ...(events.length ? { events } : {})
  };
}
