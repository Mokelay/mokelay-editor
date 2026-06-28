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

async function dateOnlyBounds(page: import('@playwright/test').Page, dateValue: string) {
  return await page.evaluate((value) => {
    const [year, month, day] = value.split('-').map(Number);
    return {
      start: new Date(year, month - 1, day, 0, 0, 0, 0).toISOString(),
      end: new Date(year, month - 1, day, 23, 59, 59, 999).toISOString()
    };
  }, dateValue);
}

async function localDateTimeIso(page: import('@playwright/test').Page, dateTimeValue: string) {
  return await page.evaluate((value) => {
    const [datePart, timePart] = value.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second, 0).toISOString();
  }, dateTimeValue);
}

async function fillDateTimeRange(
  page: import('@playwright/test').Page,
  dateRangeBlock: ReturnType<import('@playwright/test').Page['getByTestId']>,
  start: string,
  end: string
) {
  const picker = dateRangeBlock.getByTestId('date-range-picker');
  await expect(picker).toBeVisible();

  const inputs = picker.locator('input.el-range-input');
  await expect(inputs).toHaveCount(2);
  await inputs.nth(0).fill(start);
  await inputs.nth(1).fill(end);
  await inputs.nth(1).press('Enter');
  await page.keyboard.press('Tab');
}

test('adds and serializes date time range field values as ISO timestamps', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^日期范围$/);

  const dateRangeBlock = page.getByTestId('page-dsl-block-MDateRangeField');
  await expect(dateRangeBlock).toBeVisible();

  const picker = dateRangeBlock.getByTestId('date-range-picker');
  await picker.click();
  const popper = page.locator('.page-dsl-date-range-popper').filter({ visible: true });
  await expect(popper).toBeVisible();
  await expect(popper.locator('.el-date-range-picker__content')).toHaveCount(1);
  await page.keyboard.press('Escape');

  await fillDateTimeRange(page, dateRangeBlock, '2026-06-20 08:15:30', '2026-06-25 17:45:55');
  await page.getByTestId('save-button').click();

  const blocks = await getSavedBlocks(page);
  const savedDateRange = blocks.find((block) => block.type === 'MDateRangeField');
  const expectedStart = await localDateTimeIso(page, '2026-06-20 08:15:30');
  const expectedEnd = await localDateTimeIso(page, '2026-06-25 17:45:55');

  expect(savedDateRange?.data?.value).toEqual({
    start: expectedStart,
    end: expectedEnd
  });
});

test('clears date time range field values', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^日期范围$/);

  const dateRangeBlock = page.getByTestId('page-dsl-block-MDateRangeField');
  await expect(dateRangeBlock).toBeVisible();
  await fillDateTimeRange(page, dateRangeBlock, '2026-06-20 08:15:30', '2026-06-25 17:45:55');

  const picker = dateRangeBlock.getByTestId('date-range-picker');
  await picker.hover();
  await picker.locator('.el-range__close-icon').click({ force: true });
  await page.getByTestId('save-button').click();

  const blocks = await getSavedBlocks(page);
  const savedDateRange = blocks.find((block) => block.type === 'MDateRangeField');

  expect(savedDateRange?.data?.value).toEqual({
    start: '',
    end: ''
  });
});

test('exposes date range getData values to datasource variables', async ({ page }) => {
  await page.route('**/date-range-runtime**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rows: [{ name: 'Range result' }],
        page: 1,
        pageSize: 10,
        total: 1
      })
    });
  });

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/date-range-runtime') && request.method() === 'GET'
  );
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'created-at-range',
        type: 'MDateRangeField',
        data: {
          value: {
            start: '2026-06-01',
            end: '2026-06-03'
          }
        }
      },
      {
        id: 'date-range-table',
        type: 'MAdvanceTable',
        data: {
          columns: [
            {
              columnName: '名称',
              columnContent: [
                {
                  id: 'date-range-table-name',
                  type: 'paragraph',
                  data: {
                    text: '{{name}}'
                  }
                }
              ]
            }
          ],
          ds: {
            type: 'API',
            domain: 'mokelay',
            path: '/date-range-runtime',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: [
              {
                key: 'created_at_begin',
                value: {
                  mode: 'variable',
                  blockId: 'created-at-range',
                  blockType: 'MDateRangeField',
                  variable: 'value.start'
                }
              },
              {
                key: 'created_at_end',
                value: {
                  mode: 'variable',
                  blockId: 'created-at-range',
                  blockType: 'MDateRangeField',
                  variable: 'value.end'
                }
              }
            ],
            schemaSelections: [
              { label: '列表数据', path: 'rows[]', type: 'array' },
              { label: '当前页', path: 'page', type: 'number' },
              { label: '每页条数', path: 'pageSize', type: 'number' },
              { label: '总数', path: 'total', type: 'number' }
            ],
            matchingExternalFields: [
              { label: '列表数据', variable: 'data', matchFieldPath: 'rows[]' },
              { label: '当前页', variable: 'page', matchFieldPath: 'page' },
              { label: '每页条数', variable: 'pageSize', matchFieldPath: 'pageSize' },
              { label: '总数', variable: 'total', matchFieldPath: 'total' }
            ]
          }
        }
      }
    ]
  });

  const request = await requestPromise;
  const url = new URL(request.url());
  const expectedStart = await dateOnlyBounds(page, '2026-06-01');
  const expectedEnd = await dateOnlyBounds(page, '2026-06-03');

  expect(url.searchParams.get('created_at_begin')).toBe(expectedStart.start);
  expect(url.searchParams.get('created_at_end')).toBe(expectedEnd.end);
  await expect(page.getByTestId('advance-table')).toContainText('Range result');
});
