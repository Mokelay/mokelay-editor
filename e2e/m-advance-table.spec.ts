import { expect, test } from '@playwright/test';
import {
  addEditorTool,
  expectToolToolbarBeside,
  getSavedBlocks,
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
  await expect(page.getByTestId('advance-table-header-0')).toContainText('名称');
  await expect(page.getByTestId('advance-table-header-2')).toContainText('标签');
  await expect(page.getByTestId('advance-table-header-4')).toContainText('链接');
  await expect(page.getByTestId('advance-table')).toContainText('没有数据源');

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const tableBlock = blocks.find((block) => block.type === 'MAdvanceTable');
  const columns = tableBlock?.data?.columns as Array<{
    columnName?: string;
    columnContent?: unknown;
  }> | undefined;
  const tagColumn = columns?.find((column) => column.columnName === '标签');
  const linkColumn = columns?.find((column) => column.columnName === '链接');
  const tagColumnContent = tagColumn?.columnContent as Array<{
    id?: string;
    type?: string;
    data?: { text?: string };
  }> | undefined;
  const linkColumnContent = linkColumn?.columnContent as Array<{
    id?: string;
    type?: string;
    data?: Record<string, unknown>;
  }> | undefined;
  const nameColumnContent = columns?.[0]?.columnContent as Array<{
    id?: string;
    type?: string;
    data?: { text?: string };
  }> | undefined;
  const savedColumnContentBlocks = [
    ...(nameColumnContent ?? []),
    ...(tagColumnContent ?? []),
    ...(linkColumnContent ?? [])
  ];

  expect(Array.isArray(columns?.[0]?.columnContent)).toBeTruthy();
  expect(typeof columns?.[0]?.columnContent).not.toBe('string');
  expect(nameColumnContent?.[0]?.type).toBe('paragraph');
  expect(nameColumnContent?.[0]?.data?.text).toBe('{{name}}');
  expect(Array.isArray(tagColumnContent)).toBeTruthy();
  expect(tagColumnContent?.[0]?.type).toBe('MTag');
  expect(tagColumnContent?.[0]?.data).toEqual(expect.objectContaining({ tagName: '{{tag}}' }));
  expect(Array.isArray(linkColumnContent)).toBeTruthy();
  expect(linkColumnContent?.[0]?.type).toBe('MLink');
  expect(linkColumnContent?.[0]?.data).toEqual(expect.objectContaining({
    text: '{{linkText}}',
    url: '{{linkUrl}}',
    open: false
  }));
  expect(tableBlock?.data?.data).toBeUndefined();
  expect(savedColumnContentBlocks.some((block) => block.type === 'text')).toBeFalsy();
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-MAdvanceTable')).toBeVisible();
  await expect(page.getByTestId('advance-table')).toBeVisible();
  await expect(page.getByTestId('advance-table-header-0')).toContainText('名称');
  await expect(page.getByTestId('advance-table')).toContainText('没有数据源');
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
