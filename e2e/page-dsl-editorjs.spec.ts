import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { expectToolToolbarBeside, getSavedBlocks, resetEditor } from './helpers/editor';

const pageDslTools = [
  ['页面标题', 'MHeading'],
  ['富文本', 'MRichText'],
  ['图片', 'MImage'],
  ['嵌入', 'MEmbed'],
  ['单行文本', 'MTextField'],
  ['邮箱字段', 'MEmailField'],
  ['电话字段', 'MPhoneField'],
  ['网址字段', 'MLinkField'],
  ['多行文本', 'MTextareaField'],
  ['文件上传', 'MFileUploadField'],
  ['下拉选择', 'MSelectField'],
  ['单选题', 'MRadioGroupField'],
  ['多选题', 'MCheckboxGroupField'],
  ['图片选择', 'MImageChoiceField'],
  ['评分', 'MRatingField'],
  ['线性量表', 'MLinearScaleField'],
  ['矩阵题', 'MMatrixField'],
  ['分页', 'MPageBreak'],
  ['感谢页', 'MThankYouPage'],
  ['结果页', 'MResultPage'],
  ['按钮', 'MButton']
] as const;

const formBlockTypes = [
  'MTextField',
  'MEmailField',
  'MPhoneField',
  'MLinkField',
  'MTextareaField',
  'MFileUploadField',
  'MSelectField',
  'MRadioGroupField',
  'MCheckboxGroupField',
  'MImageChoiceField',
  'MRatingField',
  'MLinearScaleField',
  'MMatrixField'
] as const;

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('adds Page DSL v2 UI blocks through the EditorJS toolbox and previews them', async ({ page }) => {
  for (const [title, type] of pageDslTools) {
    await addTool(page, title);
    await expect(page.getByTestId(`editor-tool-${type}`)).toBeVisible();
  }

  await expectToolToolbarBeside(page, 'page-dsl-block-MRadioGroupField');
  await page.getByTestId('editor-tool-MTextField').locator('input.page-dsl-control').fill('Ada Lovelace');
  await page.getByTestId('preview-button').click();

  for (const [, type] of pageDslTools) {
    await expect(page.getByTestId(`preview-block-${type}`)).toBeVisible();
  }

  await expect(page.getByTestId('preview-block-MButton').getByRole('button', { name: '提交' })).toBeVisible();

  const savedBlocks = await getSavedBlocks(page);
  for (const type of formBlockTypes) {
    const block = savedBlocks.find((item) => item.type === type);
    expect(block?.data).toHaveProperty('value');
    expect(block?.data).not.toHaveProperty('label');
    expect(block?.data).not.toHaveProperty('name');
    expect(block?.data).not.toHaveProperty('defaultValue');
    expect(block?.data).not.toHaveProperty('required');
  }

  expect(savedBlocks.find((item) => item.type === 'MTextField')?.data).toMatchObject({
    placeholder: '请输入文本',
    value: 'Ada Lovelace'
  });
});

async function addTool(page: Page, title: string) {
  const blocks = page.locator('.ce-block');
  await expect(blocks.first()).toBeVisible();
  await blocks.last().click();
  await page.locator('.ce-toolbar__plus').click();
  const menuItem = page.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: title }).first();
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}
