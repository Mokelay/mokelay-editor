import { expect, test } from '@playwright/test';
import {
  addEditorTool,
  openToolPropertyPanel,
  resetEditor,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('adds a tag component and opens its property panel', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '标签');

  const editorTagTool = page.getByTestId('editor-tag-tool');
  await expect(editorTagTool).toBeVisible();
  await expect(page.getByTestId('editor-tag-value')).toContainText('标签');
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await openToolPropertyPanel(page, 'editor-tag-tool');

  await expect(page.getByTestId('tool-property-title')).toContainText('标签属性');
  await expect(page.getByTestId('tool-property-input-tagName')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-type')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-size')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-color')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-closable')).toBeVisible();
});
