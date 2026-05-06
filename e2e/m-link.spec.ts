import { expect, test } from '@playwright/test';
import {
  addEditorTool,
  expectToolToolbarBeside,
  getSavedBlocks,
  resetEditor,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('adds a link component and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^链接$/);

  const editorLinkTool = page.getByTestId('editor-link-tool');
  const editorLinkValue = page.getByTestId('editor-link-value');
  await expect(editorLinkTool).toBeVisible();
  await expect(editorLinkValue).toHaveText('链接');
  await expect(editorLinkValue).toHaveAttribute('href', 'https://mokelay.com');
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await expectToolToolbarBeside(page, 'editor-link-tool');

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const linkBlock = blocks.find((block) => block.type === 'MLink');

  expect(linkBlock?.data).toEqual(expect.objectContaining({
    text: '链接',
    url: 'https://mokelay.com',
    open: false
  }));
  await page.getByTestId('preview-button').click();

  const previewLink = page.getByTestId('preview-block-MLink').getByTestId('editor-link-value');
  await expect(page.getByTestId('preview-block-MLink')).toBeVisible();
  await expect(previewLink).toHaveText('链接');
  await expect(previewLink).toHaveAttribute('href', 'https://mokelay.com');
});
