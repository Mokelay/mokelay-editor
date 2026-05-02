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

test('adds an input component and opens its property panel', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, /^输入框$/);

  const editorInputTool = page.getByTestId('editor-input-tool');
  await expect(editorInputTool).toBeVisible();
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await openToolPropertyPanel(page, 'editor-input-tool');

  await expect(page.getByTestId('tool-property-title')).toContainText('输入框属性');
  await expect(page.getByTestId('editor-input-label')).toHaveCount(0);
  await expect(page.getByTestId('tool-property-input-label')).toHaveCount(0);
  await expect(page.getByTestId('tool-property-input-placeholder')).toBeVisible();
  await expect(page.getByTestId('tool-property-input-value')).toBeVisible();
});
