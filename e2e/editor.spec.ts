import { expect, test } from '@playwright/test';

const storageKey = 'mokelay-editor-config';

type TestPage = Parameters<typeof test.beforeEach>[0]['page'];
type SavedBlock = {
  type?: string;
  data?: Record<string, unknown>;
};

async function getSavedBlocks(page: TestPage) {
  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();

  const parsed = JSON.parse(storedConfig ?? '{}') as {
    blocks?: SavedBlock[];
  };

  return Array.isArray(parsed.blocks) ? parsed.blocks : [];
}

async function switchLocaleToChinese(page: Parameters<typeof test.beforeEach>[0]['page']) {
  await page.getByTestId('locale-select').selectOption('zh');
}

async function addInputTool(page: Parameters<typeof test.beforeEach>[0]['page']) {
  const blocks = page.locator('.ce-block');
  await expect(blocks).toHaveCount(1);

  await blocks.nth(0).click();
  await page.locator('.ce-toolbar__plus').click();
  await page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: /^输入框$/ }).click();
}

async function openAddMenu(page: Parameters<typeof test.beforeEach>[0]['page']) {
  const blocks = page.locator('.ce-block');
  await expect(blocks).toHaveCount(1);
  await blocks.nth(0).click();
  await page.locator('.ce-toolbar__plus').click();
}

async function addAdvanceInputTool(page: Parameters<typeof test.beforeEach>[0]['page']) {
  await openAddMenu(page);
  await page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '高级输入框' }).click();
}

async function addAdvanceTableTool(page: Parameters<typeof test.beforeEach>[0]['page']) {
  await openAddMenu(page);
  await page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '高级表格' }).click();
}

async function addLinkTool(page: Parameters<typeof test.beforeEach>[0]['page']) {
  await openAddMenu(page);
  const linkMenuItem = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: /^链接$/ });
  await expect(linkMenuItem).toBeVisible();
  await linkMenuItem.click();
}

function expectToolbarBesideTool(
  toolBox: { x: number; y: number; width: number; height: number } | null,
  plusBox: { x: number; y: number; width: number; height: number } | null,
  settingsBox: { x: number; y: number; width: number; height: number } | null
) {
  expect(toolBox).not.toBeNull();
  expect(plusBox).not.toBeNull();
  expect(settingsBox).not.toBeNull();

  const toolCenterY = toolBox!.y + toolBox!.height / 2;
  const plusCenterY = plusBox!.y + plusBox!.height / 2;
  const settingsCenterY = settingsBox!.y + settingsBox!.height / 2;
  const allowedVerticalOffset = Math.max(toolBox!.height / 2, 18);

  expect(plusBox!.x).toBeLessThan(toolBox!.x);
  expect(settingsBox!.x).toBeLessThan(toolBox!.x);
  expect(Math.abs(plusCenterY - toolCenterY)).toBeLessThanOrEqual(allowedVerticalOffset);
  expect(Math.abs(settingsCenterY - toolCenterY)).toBeLessThanOrEqual(allowedVerticalOffset);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    window.location.hash = '/';
  }, storageKey);
  await page.reload();
});

test('renders editor shell with expected controls', async ({ page }) => {
  await expect(page.getByTestId('app-title')).toHaveText('Mokelay Editor');
  await expect(page.getByTestId('editor-panel')).toBeVisible();
  await expect(page.getByTestId('editor-surface')).toBeVisible();
  await expect(page.getByTestId('theme-select')).toBeVisible();
  await expect(page.getByTestId('locale-select')).toBeVisible();
  await expect(page.getByTestId('save-button')).toBeVisible();
  await expect(page.getByTestId('preview-button')).toBeVisible();
});

test('saves current editor content into localStorage and shows config dialog', async ({ page }) => {
  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('config-dialog')).toBeVisible();
  await expect(page.getByTestId('config-dialog-title')).toBeVisible();

  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();

  const parsed = JSON.parse(storedConfig ?? '{}') as {
    blocks?: Array<{ type?: string; data?: { text?: string } }>;
  };

  expect(Array.isArray(parsed.blocks)).toBeTruthy();
  expect(parsed.blocks?.[0]?.type).toBe('paragraph');

  await expect(page.getByTestId('config-json')).toContainText('paragraph');
});

test('opens preview page and renders saved content', async ({ page }) => {
  await page.getByTestId('save-button').click();
  await page.getByTestId('config-dialog-close').click();
  await page.getByTestId('preview-button').click();

  await expect(page).toHaveURL(/#\/preview$/);
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-blocks')).toBeVisible();
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Mokelay');
  await expect(page.getByTestId('back-to-editor-button')).toBeVisible();
});

test('restores saved content after reload', async ({ page }) => {
  await page.getByTestId('save-button').click();
  await page.getByTestId('config-dialog-close').click();

  await page.reload();
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Mokelay');
  const storedConfig = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  expect(storedConfig).not.toBeNull();
});

test('adds an input component and opens its property panel', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addInputTool(page);

  const editorInputTool = page.getByTestId('editor-input-tool');
  await expect(editorInputTool).toBeVisible();
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await editorInputTool.hover();

  const plusButton = page.locator('.ce-toolbar__plus');
  const settingsButton = page.locator('.ce-toolbar__settings-btn');

  await expect(plusButton).toBeVisible();
  await expect(settingsButton).toBeVisible();

  const inputBox = await editorInputTool.boundingBox();
  const plusBox = await plusButton.boundingBox();
  const settingsBox = await settingsButton.boundingBox();

  expectToolbarBesideTool(inputBox, plusBox, settingsBox);

  await settingsButton.click();

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  await expect(page.getByTestId('tool-property-panel')).toBeVisible();
  await expect(page.getByTestId('tool-property-title')).toContainText('输入框属性');
  await expect(page.getByTestId('editor-input-label')).toHaveCount(0);
  await expect(page.getByTestId('tool-property-input-label')).toHaveCount(0);
  await expect(page.getByTestId('tool-property-input-placeholder')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-value')).toBeVisible();
});

test('adds a tag component and opens its property panel', async ({ page }) => {
  await switchLocaleToChinese(page);
  await openAddMenu(page);

  const tagMenuItem = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '标签' });
  await expect(tagMenuItem).toBeVisible();
  await tagMenuItem.click();

  const editorTagTool = page.getByTestId('editor-tag-tool');
  await expect(editorTagTool).toBeVisible();
  await expect(page.getByTestId('editor-tag-value')).toContainText('标签');
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await editorTagTool.hover();

  const plusButton = page.locator('.ce-toolbar__plus');
  const settingsButton = page.locator('.ce-toolbar__settings-btn');

  await expect(plusButton).toBeVisible();
  await expect(settingsButton).toBeVisible();

  const tagBox = await editorTagTool.boundingBox();
  const plusBox = await plusButton.boundingBox();
  const settingsBox = await settingsButton.boundingBox();

  expectToolbarBesideTool(tagBox, plusBox, settingsBox);

  await settingsButton.click();

  const propertyButton = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: '属性' });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();

  const propertyDialog = page.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  await expect(page.getByTestId('tool-property-panel')).toBeVisible();
  await expect(page.getByTestId('tool-property-title')).toContainText('标签属性');
  await expect(page.getByTestId('tool-property-input-tagName')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-type')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-size')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-color')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-closable')).toBeVisible();
});

test('adds a link component and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addLinkTool(page);

  const editorLinkTool = page.getByTestId('editor-link-tool');
  const editorLinkValue = page.getByTestId('editor-link-value');
  await expect(editorLinkTool).toBeVisible();
  await expect(editorLinkValue).toHaveText('链接');
  await expect(editorLinkValue).toHaveAttribute('href', 'https://mokelay.com');
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await editorLinkTool.hover();

  const plusButton = page.locator('.ce-toolbar__plus');
  const settingsButton = page.locator('.ce-toolbar__settings-btn');

  await expect(plusButton).toBeVisible();
  await expect(settingsButton).toBeVisible();

  const linkBox = await editorLinkTool.boundingBox();
  const plusBox = await plusButton.boundingBox();
  const settingsBox = await settingsButton.boundingBox();

  expectToolbarBesideTool(linkBox, plusBox, settingsBox);

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const linkBlock = blocks.find((block) => block.type === 'MLink');

  expect(linkBlock?.data).toEqual(expect.objectContaining({
    text: '链接',
    url: 'https://mokelay.com',
    open: false
  }));

  await page.getByTestId('config-dialog-close').click();
  await page.getByTestId('preview-button').click();

  const previewLink = page.getByTestId('preview-block-MLink').getByTestId('editor-link-value');
  await expect(page.getByTestId('preview-block-MLink')).toBeVisible();
  await expect(previewLink).toHaveText('链接');
  await expect(previewLink).toHaveAttribute('href', 'https://mokelay.com');
});

test('adds an advanced input, inserts a tag, and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addAdvanceInputTool(page);

  const advanceInput = page.getByTestId('editor-advance-input-tool');
  const editable = page.getByTestId('editor-advance-input-content');
  await expect(advanceInput).toBeVisible();
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await editable.click();
  await page.keyboard.type('hello /');
  await expect(page.getByTestId('editor-advance-input-menu')).toBeVisible();
  await expect(page.getByTestId('editor-advance-input-menu-item-MLink')).toBeVisible();
  await page.getByTestId('editor-advance-input-menu-item-MTag').click();

  const embeddedTag = page.getByTestId('editor-advance-input-token-MTag');
  await expect(embeddedTag).toBeVisible();
  await embeddedTag.click();

  const embeddedDialog = page.getByTestId('advance-input-embedded-property-dialog');
  await expect(embeddedDialog).toBeVisible();
  await expect(page.getByTestId('advance-input-embedded-property-title')).toContainText('标签属性');
  await expect(page.getByTestId('advance-input-embedded-property-input-tagName')).toBeVisible();
  await page.getByTestId('advance-input-embedded-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const advanceInputBlock = blocks.find((block) => block.type === 'MAdvanceInput');
  const advanceInputValue = advanceInputBlock?.data?.value as Array<{
    id?: string;
    type?: string;
    data?: { text?: string };
  }> | undefined;
  const advanceInputParagraphText = advanceInputValue
    ?.filter((block) => block.type === 'paragraph')
    .map((block) => block.data?.text ?? '')
    .join('');

  expect(Array.isArray(advanceInputValue)).toBeTruthy();
  expect(typeof advanceInputBlock?.data?.value).not.toBe('string');
  expect(advanceInputParagraphText).toBe('hello ');
  expect(advanceInputValue?.some((block) => block.type === 'MTag')).toBeTruthy();
  expect(advanceInputValue?.some((block) => block.type === 'text')).toBeFalsy();
  expect(advanceInputValue?.every((block) => typeof block.id === 'string' && typeof block.data === 'object')).toBeTruthy();

  await page.getByTestId('config-dialog-close').click();
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-MAdvanceInput')).toBeVisible();
  await expect(page.getByTestId('preview-advance-input-value')).toContainText('hello');
  await expect(page.getByTestId('preview-advance-input-value')).toContainText('标签');
});

test('adds an advanced table and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addAdvanceTableTool(page);

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

test('loads saved JSON content blocks in editor', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      time: 1777614863777,
      version: '2.31.6',
      blocks: [
        {
          id: 'z-gUomnOqj',
          type: 'MAdvanceInput',
          data: {
            value: [
              {
                id: 'advance-input-text-a',
                type: 'paragraph',
                data: {
                  text: 'aaa'
                }
              },
              {
                id: '930a9df2-a',
                type: 'MTag',
                data: {
                  tagName: '标签',
                  closable: false,
                  size: '',
                  color: '',
                  type: 'success'
                }
              },
              {
                id: 'advance-input-text-b',
                type: 'paragraph',
                data: {
                  text: 'bbbbb'
                }
              },
              {
                id: '639955f1-3',
                type: 'MTag',
                data: {
                  tagName: '标签',
                  closable: false,
                  size: '',
                  color: '',
                  type: 'success'
                }
              },
              {
                id: 'advance-input-text-c',
                type: 'paragraph',
                data: {
                  text: 'c'
                }
              }
            ]
          }
        },
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
    }));
    window.location.hash = '/';
  }, storageKey);
  await page.reload();

  await expect(page.getByTestId('editor-advance-input-tool')).toBeVisible();
  await expect(page.getByTestId('editor-advance-input-token-MTag')).toHaveCount(2);
  await expect(page.getByTestId('editor-advance-table-tool')).toBeVisible();
  await expect(page.getByTestId('advance-table-cell-0-0')).toContainText('Mokelay 页面');
  await expect(page.getByTestId('advance-table-cell-0-1')).toContainText('设计');
  expect(pageErrors).toEqual([]);
});
