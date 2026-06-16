import { expect, test } from '@playwright/test';
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

test('adds an advanced table and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '高级表格');

  const advanceTable = page.getByTestId('editor-advance-table-tool');
  await expect(advanceTable).toBeVisible();
  await expect(page.locator('.ce-block').filter({ has: advanceTable })).toHaveCount(1);
  await expectToolToolbarBeside(page, 'editor-advance-table-tool');
  await expect(page.getByTestId('advance-table-header-0')).toHaveCount(0);
  await expect(page.getByTestId('advance-table')).toContainText('请先设置表格列');

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const tableBlock = blocks.find((block) => block.type === 'MAdvanceTable');
  expect(tableBlock?.data?.columns).toBeUndefined();
  expect(tableBlock?.data?.data).toBeUndefined();
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-MAdvanceTable')).toBeVisible();
  await expect(page.getByTestId('advance-table')).toBeVisible();
  await expect(page.getByTestId('advance-table-header-0')).toHaveCount(0);
  await expect(page.getByTestId('advance-table')).toContainText('请先设置表格列');
});

test('loads saved advanced table datasource blocks in editor', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  await switchLocaleToChinese(page);

  await page.route('**/advance-table-data', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            name: 'Mokelay 页面',
            tag: '设计',
            tagType: 'warning',
            linkText: '官网',
            linkUrl: 'https://mokelay.com'
          }
        ]
      })
    });
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: '04UrzC68Vp',
        type: 'MAdvanceTable',
        data: {
          index: false,
          selection: false,
          columns: [
            {
              columnName: '名称',
              columnContent: [
                {
                  id: 'advance-table-name-content',
                  type: 'paragraph',
                  data: {
                    text: '{{name}}'
                  }
                }
              ],
              width: 180,
              fixed: 'left'
            },
            {
              columnName: '标签',
              columnContent: [
                {
                  id: 'advance-table-default-tag',
                  type: 'MTag',
                  data: {
                    tagName: '{{tag}}',
                    type: '{{tagType}}',
                    size: 'small',
                    color: '',
                    closable: false
                  }
                }
              ],
              width: 120,
              fixed: null
            }
          ],
          data: [
            {
              name: 'Mokelay 页面',
              tag: '设计',
              tagType: 'warning'
            }
          ]
        }
      },
      {
        id: 'datasource-table',
        type: 'MAdvanceTable',
        data: {
          index: false,
          selection: false,
          columns: [
            {
              columnName: '名称',
              columnContent: [
                {
                  id: 'advance-table-name-content',
                  type: 'paragraph',
                  data: {
                    text: '{{name}}'
                  }
                }
              ],
              width: 180,
              fixed: 'left'
            },
            {
              columnName: '标签',
              columnContent: [
                {
                  id: 'advance-table-default-tag',
                  type: 'MTag',
                  data: {
                    tagName: '{{tag}}',
                    type: '{{tagType}}',
                    size: 'small',
                    color: '',
                    closable: false
                  }
                }
              ],
              width: 120,
              fixed: null
            },
            {
              columnName: '链接',
              columnContent: [
                {
                  id: 'advance-table-link-content',
                  type: 'MLink',
                  data: {
                    text: '{{linkText}}',
                    url: '{{linkUrl}}',
                    open: false
                  }
                }
              ],
              width: 180,
              fixed: null
            }
          ],
          data: {
            type: 'API',
            domain: 'mokelay',
            path: '/advance-table-data',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: [],
            schemaSelections: [
              {
                label: '列表数据',
                path: 'items[]',
                type: 'array'
              }
            ],
            matchingExternalFields: [
              {
                label: '列表数据',
                variable: 'data',
                matchFieldPath: 'items[]'
              }
            ]
          }
        }
      }
    ]
  });

  const tables = page.getByTestId('editor-advance-table-tool');
  await expect(tables).toHaveCount(2);
  await expect(tables.nth(0).getByTestId('advance-table')).toContainText('没有数据源');
  await expect(tables.nth(1).getByTestId('advance-table-cell-0-0')).toContainText('Mokelay 页面');
  await expect(tables.nth(1).getByTestId('advance-table-cell-0-1')).toContainText('设计');
  await expect(tables.nth(1).getByTestId('advance-table-cell-0-2')).toContainText('官网');
  expect(pageErrors).toEqual([]);
});

test('matches external datasource fields from advanced table property panel', async ({ page }) => {
  await switchLocaleToChinese(page);
  await page.route('**/advance-table-data', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] })
    });
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-table',
        type: 'MAdvanceTable',
        data: {
          index: false,
          selection: false,
          columns: [
            {
              columnName: '名称',
              columnContent: [
                {
                  id: 'advance-table-name-content',
                  type: 'paragraph',
                  data: {
                    text: '{{name}}'
                  }
                }
              ],
              width: 180,
              fixed: 'left'
            }
          ],
          data: {
            type: 'API',
            domain: 'mokelay',
            path: '/advance-table-data',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: [],
            schemaSelections: [
              {
                label: '列表数据',
                path: 'items[]',
                type: 'array'
              }
            ]
          }
        }
      }
    ]
  });

  await page.getByTestId('editor-advance-table-tool').hover();
  await page.locator('.ce-toolbar__settings-btn').click();
  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();
  await expect(page.locator('[data-testid="tool-property-dialog"][open]')).toBeVisible();
  await expect(page.getByTestId('tool-property-component-data')).toBeVisible();
  await page.getByTestId('datasource-settings-open').click();
  const datasourceDialog = page.locator('[data-testid="datasource-settings-dialog"][open]').last();
  await expect(datasourceDialog.getByTestId('datasource-external-field-matching')).toBeVisible();
  await expect(datasourceDialog.getByTestId('datasource-external-field-data')).toContainText('列表数据');
  await datasourceDialog.getByTestId('datasource-external-field-match-data').selectOption('items[]');
  await datasourceDialog.getByTestId('datasource-settings-close').click();
  await page.getByTestId('tool-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const tableBlock = blocks.find((block) => block.type === 'MAdvanceTable');
  expect((tableBlock?.data?.data as any)?.matchingExternalFields).toEqual([
    {
      label: '列表数据',
      variable: 'data',
      matchFieldPath: 'items[]'
    }
  ]);
});

test('configures advanced table columns from property panel fields editor', async ({ page }) => {
  await switchLocaleToChinese(page);
  await page.route('**/advance-table-data', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            name: 'Mokelay 页面',
            priority: 'High'
          }
        ]
      })
    });
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'columns-table',
        type: 'MAdvanceTable',
        data: {
          index: false,
          selection: false,
          columns: [
            {
              columnName: '名称',
              fieldVariable: 'name',
              fieldDataType: 'string',
              columnContent: [
                {
                  id: 'advance-table-name-content',
                  type: 'paragraph',
                  data: {
                    text: '{{name}}'
                  }
                }
              ],
              width: 180,
              fixed: 'left'
            }
          ],
          data: {
            type: 'API',
            domain: 'mokelay',
            path: '/advance-table-data',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: [],
            schemaSelections: [
              {
                label: '列表数据',
                path: 'items[]',
                type: 'array'
              }
            ],
            matchingExternalFields: [
              {
                label: '列表数据',
                variable: 'data',
                matchFieldPath: 'items[]'
              }
            ]
          }
        }
      }
    ]
  });

  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Mokelay 页面');

  const propertyDialog = await openToolPropertyPanel(page, 'editor-advance-table-tool');
  await expect(propertyDialog.getByTestId('tool-property-component-columns')).toBeVisible();
  await propertyDialog.getByTestId('advance-table-columns-settings-open').click();

  const columnsDialog = page.locator('[data-testid="advance-table-columns-dialog"][open]').last();
  await expect(columnsDialog).toBeVisible();
  await expect(columnsDialog.getByTestId('advance-table-column-row-0')).toBeVisible();

  await columnsDialog.getByTestId('fields-settings-open').click();
  const fieldsDialog = page.locator('[data-testid="fields-settings-dialog"][open]').last();
  await expect(fieldsDialog).toBeVisible();
  await fieldsDialog.getByTestId('fields-add').click();
  await fieldsDialog.getByTestId('fields-label-1').fill('优先级');
  await fieldsDialog.getByTestId('fields-variable-1').fill('priority');
  await fieldsDialog.getByTestId('fields-data-type-1').selectOption('number');
  await fieldsDialog.getByTestId('fields-save').click();
  await expect(fieldsDialog).not.toBeVisible();

  await expect(columnsDialog.getByTestId('advance-table-column-row-1')).toBeVisible();
  await columnsDialog.getByTestId('advance-table-column-name-1').fill('优先级列');
  await columnsDialog.getByTestId('advance-table-column-width-1').fill('160');
  await columnsDialog.getByTestId('advance-table-column-fixed-1').selectOption('right');
  await columnsDialog.getByTestId('advance-table-column-template-1').fill('P-{{priority}}');
  await columnsDialog.getByTestId('advance-table-columns-save').click();
  await expect(columnsDialog).not.toBeVisible();
  await propertyDialog.getByTestId('tool-property-close').click();

  await expect(page.getByTestId('advance-table-header-1')).toContainText('优先级列');
  await expect(page.getByTestId('advance-table-cell-0-1')).toContainText('P-High');

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const tableBlock = blocks.find((block) => block.type === 'MAdvanceTable');
  const columns = tableBlock?.data?.columns as Array<{
    columnName?: string;
    fieldVariable?: string;
    fieldDataType?: string;
    width?: number | null;
    fixed?: string | null;
    columnContent?: Array<{ type?: string; data?: { text?: string } }>;
  }> | undefined;
  const priorityColumn = columns?.find((column) => column.fieldVariable === 'priority');

  expect(priorityColumn).toEqual(expect.objectContaining({
    columnName: '优先级列',
    fieldVariable: 'priority',
    fieldDataType: 'number',
    width: 160,
    fixed: 'right'
  }));
  expect(priorityColumn?.columnContent?.[0]).toEqual(expect.objectContaining({
    type: 'paragraph',
    data: expect.objectContaining({
      text: 'P-{{priority}}'
    })
  }));
});

test('keeps custom advanced table column content after saving columns editor', async ({ page }) => {
  await switchLocaleToChinese(page);
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'custom-columns-table',
        type: 'MAdvanceTable',
        data: {
          index: false,
          selection: false,
          columns: [
            {
              columnName: '名称',
              columnContent: [
                {
                  id: 'advance-table-default-name',
                  type: 'paragraph',
                  data: {
                    text: '{{name}}'
                  }
                }
              ],
              width: 180,
              fixed: 'left'
            },
            {
              columnName: '状态',
              columnContent: [
                {
                  id: 'advance-table-default-status',
                  type: 'paragraph',
                  data: {
                    text: '{{status}}'
                  }
                }
              ],
              width: 140,
              fixed: null
            },
            {
              columnName: '标签',
              columnContent: [
                {
                  id: 'advance-table-default-tag',
                  type: 'MTag',
                  data: {
                    tagName: '{{tag}}',
                    type: '{{tagType}}',
                    size: 'small',
                    color: '',
                    closable: false
                  }
                }
              ],
              width: 120,
              fixed: null
            },
            {
              columnName: '负责人',
              columnContent: [
                {
                  id: 'advance-table-default-owner',
                  type: 'paragraph',
                  data: {
                    text: '{{owner}}'
                  }
                }
              ],
              width: 160,
              fixed: null
            },
            {
              columnName: '链接',
              columnContent: [
                {
                  id: 'advance-table-default-link',
                  type: 'MLink',
                  data: {
                    text: '{{linkText}}',
                    url: '{{linkUrl}}',
                    open: false
                  }
                }
              ],
              width: 180,
              fixed: null
            }
          ]
        }
      }
    ]
  });

  const propertyDialog = await openToolPropertyPanel(page, 'editor-advance-table-tool');
  await propertyDialog.getByTestId('advance-table-columns-settings-open').click();
  const columnsDialog = page.locator('[data-testid="advance-table-columns-dialog"][open]').last();
  await expect(columnsDialog.getByTestId('advance-table-column-custom-content-2')).toBeVisible();
  await expect(columnsDialog.getByTestId('advance-table-column-custom-content-4')).toBeVisible();
  await columnsDialog.getByTestId('advance-table-columns-save').click();
  await propertyDialog.getByTestId('tool-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const tableBlock = blocks.find((block) => block.type === 'MAdvanceTable');
  const columns = tableBlock?.data?.columns as Array<{
    columnName?: string;
    columnContent?: Array<{
      type?: string;
      data?: Record<string, unknown>;
    }>;
  }> | undefined;
  const tagColumn = columns?.find((column) => column.columnName === '标签');
  const linkColumn = columns?.find((column) => column.columnName === '链接');

  expect(tagColumn?.columnContent?.[0]).toEqual(expect.objectContaining({
    type: 'MTag',
    data: expect.objectContaining({
      tagName: '{{tag}}',
      type: '{{tagType}}'
    })
  }));
  expect(linkColumn?.columnContent?.[0]).toEqual(expect.objectContaining({
    type: 'MLink',
    data: expect.objectContaining({
      text: '{{linkText}}',
      url: '{{linkUrl}}'
    })
  }));
});
