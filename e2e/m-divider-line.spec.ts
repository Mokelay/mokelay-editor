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

test('adds a divider line component and renders it in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^分割线$/);

  const editorDividerLineTool = page.getByTestId('editor-divider-line-tool');
  await expect(editorDividerLineTool).toBeVisible();
  await expect(page.locator('.ce-block').filter({ has: editorDividerLineTool })).toHaveCount(1);

  await expectToolToolbarBeside(page, 'editor-divider-line-tool');

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const dividerLineBlock = blocks.find((block) => block.type === 'MDividerLine');

  expect(dividerLineBlock?.data).toEqual({});

  await page.getByTestId('preview-button').click();

  const previewDividerLine = page.getByTestId('preview-block-MDividerLine').getByTestId('editor-divider-line-tool');
  await expect(page.getByTestId('preview-block-MDividerLine')).toBeVisible();
  await expect(previewDividerLine).toBeVisible();
});
