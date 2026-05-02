import { expect, test } from '@playwright/test';
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

test('adds an advanced table and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '高级表格');

  const advanceTable = page.getByTestId('editor-advance-table-tool');
  await expect(advanceTable).toBeVisible();
  await expect(page.locator('.ce-block').filter({ has: advanceTable })).toHaveCount(1);
  await expect(page.getByTestId('advance-table-header-0')).toContainText('名称');
  await expect(page.getByTestId('advance-table-header-2')).toContainText('标签');
  await expect(page.getByTestId('advance-table-header-4')).toContainText('链接');
  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Mokelay 页面');
  await expect(page.getByTestId('advance-table-cell-1-1')).toContainText('可预览');
  await expect(page.getByTestId('advance-table-cell-0-2')).toContainText('设计');
  await expect(page.getByTestId('advance-table-cell-0-4')).toContainText('官网');

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
  expect(savedColumnContentBlocks.some((block) => block.type === 'text')).toBeFalsy();

  await expect(page.getByTestId('config-json')).toContainText('MAdvanceTable');
  await expect(page.getByTestId('config-json')).toContainText('MTag');
  await expect(page.getByTestId('config-json')).toContainText('MLink');
  await expect(page.getByTestId('config-json')).toContainText('columns');
  await expect(page.getByTestId('config-json')).toContainText('data');
  await page.getByTestId('config-dialog-close').click();
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-MAdvanceTable')).toBeVisible();
  await expect(page.getByTestId('advance-table')).toBeVisible();
  await expect(page.getByTestId('advance-table-header-0')).toContainText('名称');
  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Mokelay 页面');
  await expect(page.getByTestId('advance-table-cell-0-2')).toContainText('设计');
  await expect(page.getByTestId('advance-table-cell-0-4')).toContainText('官网');
});

test('loads saved advanced table blocks in editor', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
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
      }
    ]
  });

  await expect(page.getByTestId('editor-advance-table-tool')).toBeVisible();
  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Mokelay 页面');
  await expect(page.getByTestId('advance-table-cell-0-1')).toContainText('设计');
  expect(pageErrors).toEqual([]);
});
