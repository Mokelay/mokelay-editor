import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  addEditorTool,
  getSavedBlocks,
  openToolPropertyPanel,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese,
  type SavedBlock
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('adds a layout grid block and exposes its property fields', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '布局网格');

  await expect(page.getByTestId('m-layout-grid')).toBeVisible();
  await expect(page.getByTestId('m-layout-grid-area-main')).toBeVisible();

  const propertyDialog = await openToolPropertyPanel(page, 'm-layout-grid');
  await expect(propertyDialog.getByTestId('tool-property-title')).toContainText('布局网格属性');
  await expect(propertyDialog.getByTestId('tool-property-input-columns')).toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-input-gap')).toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-input-responsive')).toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-input-areas')).toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-input-hideEmptyAreas')).toBeVisible();
  await propertyDialog.getByTestId('tool-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const gridBlock = blocks.find((block) => block.type === 'MLayoutGrid');

  expect(gridBlock?.data).toMatchObject({
    columns: 1,
    gap: 16,
    alignItems: 'stretch',
    justifyItems: 'stretch',
    areas: [
      {
        id: 'main',
        name: '主区域',
        blocks: []
      }
    ]
  });
});

test('renders nested blocks, responsive order, hidden empty areas, and child events', async ({ page }) => {
  await seedSavedConfig(page, createSeededOutput([
    layoutGridBlock()
  ]));

  await openPreview(page);
  const canvas = page.getByTestId('preview-pc-canvas');
  const grid = canvas.getByTestId('m-layout-grid');
  const mainArea = canvas.getByTestId('m-layout-grid-area-main');
  const samplesArea = canvas.getByTestId('m-layout-grid-area-samples');

  await expect(grid).toBeVisible();
  await expect(mainArea).toContainText('主表格区域');
  await expect(samplesArea).toContainText('内置样例区域');
  await expect(canvas.getByTestId('m-layout-grid-area-empty')).toHaveCount(0);

  const desktopGridColumns = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(desktopGridColumns.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
  expect((await box(mainArea)).x).toBeLessThan((await box(samplesArea)).x);

  await page.setViewportSize({ width: 520, height: 900 });
  await expect(samplesArea).toBeVisible();
  await expect(mainArea).toBeVisible();
  await expect.poll(async () => (await box(samplesArea)).y < (await box(mainArea)).y).toBe(true);

  await page.evaluate(() => {
    (window as Window & { __layoutGridOpenedUrls?: string[] }).__layoutGridOpenedUrls = [];
    window.open = (url?: string | URL) => {
      (window as Window & { __layoutGridOpenedUrls: string[] }).__layoutGridOpenedUrls.push(String(url ?? ''));
      return null;
    };
  });
  await canvas.getByTestId('grid-sample-button').click();
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __layoutGridOpenedUrls?: string[] }).__layoutGridOpenedUrls ?? []
  ))).toEqual(['https://mokelay.com/grid-sample']);
});

function createSeededOutput(blocks: SavedBlock[]) {
  return {
    time: 1777614863777,
    version: '2.31.6',
    blocks
  };
}

function layoutGridBlock(): SavedBlock {
  return {
    id: 'api-list-layout-grid',
    type: 'MLayoutGrid',
    data: {
      columns: ['minmax(0, 1fr)', '280px'],
      gap: 18,
      rowGap: 12,
      minColumnWidth: 160,
      responsive: {
        mobile: {
          columns: 1,
          gap: 10,
          areaOrder: ['samples', 'main']
        }
      },
      hideEmptyAreas: true,
      areas: [
        {
          id: 'main',
          name: '接口列表',
          blocks: [
            {
              id: 'grid-main-copy',
              type: 'paragraph',
              data: {
                text: '主表格区域'
              }
            }
          ]
        },
        {
          id: 'samples',
          name: '内置样例',
          blocks: [
            {
              id: 'grid-samples-copy',
              type: 'paragraph',
              data: {
                text: '内置样例区域'
              }
            },
            {
              id: 'grid-sample-button',
              type: 'MButton',
              data: {
                label: '打开样例',
                variant: 'primary',
                align: 'left'
              },
              events: [
                {
                  event: 'click',
                  actions: [
                    {
                      uuid: 'grid_sample_open',
                      action: 'jump_url',
                      alias: '打开样例',
                      inputs: {
                        openNew: true,
                        url: 'https://mokelay.com/grid-sample'
                      },
                      outputs: [],
                      nextAction: null
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'empty',
          name: '空区域',
          blocks: []
        }
      ]
    }
  };
}

async function openPreview(page: Page) {
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-pc-canvas')).toBeVisible();
}

async function box(locator: Locator) {
  const boundingBox = await locator.boundingBox();
  expect(boundingBox).not.toBeNull();
  return boundingBox!;
}
