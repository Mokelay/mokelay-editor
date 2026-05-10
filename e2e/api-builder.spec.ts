import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('renders API builder list and creates a blank API draft', async ({ page }) => {
  await page.goto('/#/apis');

  await expect(page.getByTestId('api-builder-shell')).toBeVisible();
  await expect(page.getByText('可视化搭建内部数据 API')).toBeVisible();
  await expect(page.getByText('从模板创建')).toBeVisible();

  await page.getByTestId('api-builder-new').click();

  await expect(page).toHaveURL(/#\/apis\/api_/);
  await expect(page.getByText('编排步骤')).toBeVisible();
  await expect(page.getByText('接口入口')).toBeVisible();
  await expect(page.getByText('JSON 预览')).toBeVisible();
});

test('creates an API from a sample, configures response, and dry-runs it', async ({ page }) => {
  await page.goto('/#/apis');

  await page.getByRole('button', { name: /登录接口/ }).click();
  await expect(page).toHaveURL(/#\/apis\/login_users/);
  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '校验密码并写入 Session' })).toBeVisible();

  await page.getByRole('button', { name: '响应' }).click();
  await expect(page.getByText('响应组装')).toBeVisible();
  await expect(page.locator('[data-testid="api-builder-json"]')).toContainText('"uuid": "login_users"');

  await page.getByRole('button', { name: /测试/ }).click();
  await page.getByRole('button', { name: '运行 Dry-run' }).click();

  await expect(page.getByText('Dry-run 通过')).toBeVisible();
  await expect(page.getByText('校验密码并写入 Session').first()).toBeVisible();
});

test('saves local versions and restores a snapshot', async ({ page }) => {
  await page.goto('/#/apis');
  await page.getByTestId('api-builder-new').click();

  await page.getByRole('button', { name: '保存快照' }).click();
  await expect(page.getByText('手动快照')).toBeVisible();

  await page.getByRole('button', { name: '入口' }).click();
  const aliasInput = page.locator('label').filter({ hasText: '接口名称' }).locator('input');
  await aliasInput.fill('改名后的 API');
  await expect(page.getByText('改名后的 API')).toBeVisible();

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: '回滚' }).click();

  await expect(page.getByText('未命名 API')).toBeVisible();
});
