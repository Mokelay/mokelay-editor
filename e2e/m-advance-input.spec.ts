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

test('adds an advanced input, inserts a tag, and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '高级输入框');

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

test('loads saved advanced input blocks in editor', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
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
      }
    ]
  });

  await expect(page.getByTestId('editor-advance-input-tool')).toBeVisible();
  await expect(page.getByTestId('editor-advance-input-token-MTag')).toHaveCount(2);
  expect(pageErrors).toEqual([]);
});
