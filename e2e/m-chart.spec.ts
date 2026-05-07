import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';
import {
  addEditorTool,
  getSavedBlocks,
  openToolPropertyPanel,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

async function expectChartCanvasNonEmpty(chartRoot: Locator) {
  const canvas = chartRoot.locator('canvas').first();
  await expect(canvas).toBeVisible();

  await expect.poll(async () => canvas.evaluate((node) => {
    if (!(node instanceof HTMLCanvasElement) || node.width === 0 || node.height === 0) {
      return false;
    }

    const context = node.getContext('2d');
    if (!context) return false;

    const pixels = context.getImageData(0, 0, node.width, node.height).data;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] !== 0) {
        return true;
      }
    }

    return false;
  })).toBeTruthy();
}

test('adds chart, edits json properties, saves and renders preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^图表$/);

  const chartTool = page.getByTestId('editor-chart-tool');
  await expect(chartTool).toBeVisible();
  await expect(page.locator('.ce-block').filter({ has: chartTool })).toHaveCount(1);
  await expectChartCanvasNonEmpty(page.getByTestId('editor-chart-canvas'));

  await openToolPropertyPanel(page, 'editor-chart-tool');
  await expect(page.getByTestId('tool-property-title')).toContainText('图表属性');
  await expect(page.getByTestId('tool-property-input-type')).toHaveValue('line');
  await expect(page.getByTestId('tool-property-input-xAxis')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-series')).toBeVisible();

  await page.getByTestId('tool-property-input-xAxis').fill('{');
  await expect(page.getByTestId('tool-property-input-xAxis')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('tool-property-error-xAxis')).toContainText('请输入有效 JSON。');

  await page.getByTestId('tool-property-input-type').selectOption('bar');
  await page.getByTestId('tool-property-input-xAxis').fill(JSON.stringify(['一月', '二月', '三月'], null, 2));
  await expect(page.getByTestId('tool-property-input-xAxis')).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByTestId('tool-property-input-series').fill(JSON.stringify([
    {
      name: '收入',
      data: [120, 240, 180]
    },
    {
      name: '成本',
      data: [80, 130, 100]
    }
  ], null, 2));
  await page.getByTestId('tool-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const chartBlock = blocks.find((block) => block.type === 'MChart');

  expect(chartBlock?.data).toEqual({
    type: 'bar',
    xAxis: ['一月', '二月', '三月'],
    series: [
      {
        name: '收入',
        data: [120, 240, 180]
      },
      {
        name: '成本',
        data: [80, 130, 100]
      }
    ]
  });
  await page.getByTestId('preview-button').click();

  const previewChart = page.getByTestId('preview-block-MChart');
  await expect(previewChart).toBeVisible();
  await expectChartCanvasNonEmpty(previewChart.getByTestId('editor-chart-canvas'));
});

test('loads saved pie chart blocks in editor and preview', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'chart-seeded',
        type: 'MChart',
        data: {
          type: 'pie',
          xAxis: ['直接访问', '搜索', '广告'],
          series: [
            {
              name: '来源',
              data: [335, 310, 234]
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('editor-chart-tool')).toBeVisible();
  await expectChartCanvasNonEmpty(page.getByTestId('editor-chart-canvas'));
  await page.getByTestId('preview-button').click();

  const previewChart = page.getByTestId('preview-block-MChart');
  await expect(previewChart).toBeVisible();
  await expectChartCanvasNonEmpty(previewChart.getByTestId('editor-chart-canvas'));
  expect(pageErrors).toEqual([]);
});
