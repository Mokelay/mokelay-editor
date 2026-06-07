import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  addEditorTool,
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
  await fillEventRow(eventsDialog, 0, { event: 'click', block: 'xxxxx', method: 'refresh' });
  await eventsDialog.getByTestId('tool-events-add').click();
  await fillEventRow(eventsDialog, 1, { event: 'save', block: 'yyyyy', method: 'close' });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const linkBlock = blocks.find((block) => block.type === 'MLink');

  expect(linkBlock?.events).toEqual([
    { event: 'click', block: 'xxxxx', method: 'refresh' },
    { event: 'save', block: 'yyyyy', method: 'close' }
  ]);
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
  await fillEventRow(eventsDialog, 0, { event: 'click', block: 'innerLink', method: 'refresh' });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const pageBlock = blocks.find((block) => block.type === 'MPage');
  const nestedBlocks = pageBlock?.data?.value as Array<{ type?: string; events?: unknown }> | undefined;
  const linkBlock = nestedBlocks?.find((block) => block.type === 'MLink');

  expect(linkBlock?.events).toEqual([
    { event: 'click', block: 'innerLink', method: 'refresh' }
  ]);
});

test('saves MForm internal item events on the item data', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^表单$/);
  await selectFormEditorTool(page, 'MInput');

  const eventsDialog = await openNestedFormItemEventsPanel(page);
  await eventsDialog.getByTestId('tool-events-add').click();
  await fillEventRow(eventsDialog, 0, { event: 'save', block: 'formItem', method: 'close' });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const formBlock = blocks.find((block) => block.type === 'MForm');
  const items = formBlock?.data?.items as Array<{ events?: unknown }> | undefined;

  expect(items?.[0]?.events).toEqual([
    { event: 'save', block: 'formItem', method: 'close' }
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
          { event: 'click', block: 'seeded', method: 'refresh' }
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
  await expect(eventsDialog.getByTestId('tool-event-input-0-block')).toHaveValue('seeded');
  await expect(eventsDialog.getByTestId('tool-event-input-0-method')).toHaveValue('refresh');

  await fillEventRow(eventsDialog, 0, { method: 'close' });
  await eventsDialog.getByTestId('tool-events-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const linkBlock = blocks.find((block) => block.type === 'MLink');

  expect(linkBlock?.events).toEqual([
    { event: 'click', block: 'seeded', method: 'close' }
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
        { event: 'click', block: 'target-input', method: 'focus' }
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
              { event: 'click', block: 'outer-target-input', method: 'focus' }
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
              { event: 'click', block: 'form-input', method: 'focus' }
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
        { event: 'click', block: 'missing-input', method: 'focus' },
        { event: 'click', block: 'target-input', method: 'missingMethod' },
        { event: 'click', block: '', method: 'focus' }
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
