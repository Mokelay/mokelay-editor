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

  await expect(page).toHaveURL(/#\/apis$/);
  await expect(page.getByRole('dialog', { name: '新建 API' })).toBeVisible();
  await page.getByTestId('api-info-name').fill('空白 API');
  await page.getByTestId('api-info-uuid').fill('blank_api');
  await page.getByTestId('api-info-submit').click();

  await expect(page).toHaveURL(/#\/apis\/blank_api/);
  await expect(page.getByText('编排步骤')).toBeVisible();
  await expect(page.getByText('接口入口')).toBeVisible();
  await expect(page.getByText('JSON 预览')).toBeVisible();
});

test('loads API list from the server and opens API details', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'login_users',
        name: 'users 登录接口',
        method: 'POST',
        status: 'published',
        apiJson: {
          uuid: 'login_users',
          alias: 'users 登录接口',
          method: 'POST',
          request: { body: ['email', 'password'] },
          blocks: [
            {
              uuid: 'read_user',
              alias: '按邮箱读取用户',
              functionName: 'read',
              inputs: {
                datasource: 'Mokelay',
                table: 'users',
                fields: ['id', 'email'],
                conditions: []
              },
              outputs: ['data']
            }
          ],
          response: {
            user: { template: "{{blocks['read_user'].outputs.data}}" }
          }
        }
      }
    ]
  });

  await page.goto('/#/apis');

  await expect(page.getByRole('row', { name: /login_users/ })).toBeVisible();
  await expect(page.getByText('已发布')).toBeVisible();

  await page.getByRole('row', { name: /login_users/ }).getByRole('button', { name: '打开' }).click();

  await expect(page).toHaveURL(/#\/apis\/login_users/);
  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();
  await expect(page.locator('[data-testid="api-builder-json"]')).toContainText('"uuid": "login_users"');
});

test('keeps API detail blocks when the list response finishes after detail refresh', async ({ page }) => {
  await resetEditor(page, {
    apiDelays: {
      listApis: 150
    },
    apis: [
      {
        uuid: 'login_users',
        name: 'users 登录接口',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'login_users',
          alias: 'users 登录接口',
          method: 'POST',
          request: { body: ['email', 'password'] },
          blocks: [
            {
              uuid: 'read_user',
              alias: '按邮箱读取用户',
              functionName: 'read',
              inputs: {
                datasource: 'Mokelay',
                table: 'users',
                fields: ['id', 'name', 'email'],
                conditions: []
              },
              outputs: ['data']
            },
            {
              uuid: 'set_user_session',
              alias: '校验密码并写入 Session',
              functionName: 'addSession',
              inputs: {
                key: 'user',
                value: { template: "{{blocks['read_user'].outputs.data}}" }
              },
              outputs: []
            }
          ],
          response: {
            user: { template: "{{blocks['read_user'].outputs.data}}" }
          }
        }
      }
    ]
  });
  const listResponse = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/api/mokelay/list_apis'
  );

  await page.goto('/#/apis/login_users');
  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '校验密码并写入 Session' })).toBeVisible();

  await listResponse;

  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '校验密码并写入 Session' })).toBeVisible();
});

test('duplicates an API through the basic info dialog before opening the copy URL', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apis: [
      {
        uuid: 'login_users',
        name: 'users 登录接口',
        method: 'POST',
        status: 'published',
        apiJson: {
          uuid: 'login_users',
          alias: 'users 登录接口',
          method: 'POST',
          request: { body: ['email', 'password'] },
          blocks: [
            {
              uuid: 'read_user',
              alias: '按邮箱读取用户',
              functionName: 'read',
              inputs: {
                datasource: 'Mokelay',
                table: 'users',
                fields: ['id', 'email'],
                conditions: []
              },
              outputs: ['data']
            }
          ],
          response: {
            user: { template: "{{blocks['read_user'].outputs.data}}" }
          }
        }
      }
    ]
  });

  await page.goto('/#/apis/login_users');
  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();

  await page.getByRole('button', { name: '复制 API' }).click();

  await expect(page).toHaveURL(/#\/apis\/login_users$/);
  await expect(page.getByRole('dialog', { name: '复制 API' })).toBeVisible();
  await expect(page.getByTestId('api-info-name')).toHaveValue('users 登录接口 copy');
  await expect(page.getByTestId('api-info-uuid')).toHaveValue(/login_users_copy_/);

  const copiedUuid = await page.getByTestId('api-info-uuid').inputValue();
  await page.getByTestId('api-info-submit').click();

  await expect(page).toHaveURL(new RegExp(`#\\/apis\\/${copiedUuid}$`));
  await expect.poll(() => apiState.apis.has('login_users')).toBe(true);
  await expect.poll(() => apiState.apis.get(copiedUuid)?.name).toBe('users 登录接口 copy');
  await expect.poll(() => Array.isArray(apiState.apis.get(copiedUuid)?.apiJson.blocks)
    ? apiState.apis.get(copiedUuid)?.apiJson.blocks.length
    : 0).toBe(1);
});

test('creates an API from a sample, configures response, and dry-runs it', async ({ page }) => {
  await page.goto('/#/apis');

  await page.getByRole('button', { name: /登录接口/ }).click();
  await expect(page.getByRole('dialog', { name: '新建 API' })).toBeVisible();
  await page.getByTestId('api-info-submit').click();
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

test('hides manual snapshot controls while keeping save actions available', async ({ page }) => {
  await page.goto('/#/apis');
  await page.getByTestId('api-builder-new').click();
  await page.getByTestId('api-info-name').fill('快照测试 API');
  await page.getByTestId('api-info-uuid').fill('snapshot_api');
  await page.getByTestId('api-info-submit').click();

  await expect(page.getByRole('button', { name: '编辑基本信息' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '保存快照' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /版本/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '复制 API' })).toBeVisible();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '发布', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '入口' }).click();
  await page.locator('label').filter({ hasText: '接口名称' }).locator('input').fill('改名后的 API');
  await expect(page.getByRole('heading', { name: '改名后的 API' })).toBeVisible();
  await expect(page.getByRole('button', { name: '保存基本信息' })).toBeVisible();
});

test('saves, publishes, and deletes APIs through server endpoints', async ({ page }) => {
  const apiState = await resetEditor(page);

  await page.goto('/#/apis');
  await page.getByTestId('api-builder-new').click();
  await page.getByTestId('api-info-name').fill('服务端保存 API');
  await page.getByTestId('api-info-uuid').fill('server_saved_api');
  await page.getByTestId('api-info-submit').click();

  await expect(page).toHaveURL(/#\/apis\/server_saved_api/);
  await expect.poll(() => apiState.apis.get('server_saved_api')?.status).toBe('draft');
  await expect.poll(() => apiState.apiSavePayloads.length).toBe(1);
  expect(apiState.apiSavePayloads[0]).not.toHaveProperty('originalUuid');
  await expect.poll(() => apiState.apiSnapshots.length).toBe(1);

  await page.getByRole('button', { name: '入口' }).click();
  await page.locator('label').filter({ hasText: '接口名称' }).locator('input').fill('服务端保存 API v2');
  await page.locator('label').filter({ hasText: 'API 标识' }).locator('input').fill('server_saved_api_v2');
  await page.getByRole('button', { name: '保存基本信息' }).click();

  await expect(page).toHaveURL(/#\/apis\/server_saved_api_v2/);
  await expect.poll(() => apiState.apis.has('server_saved_api')).toBe(false);
  await expect.poll(() => apiState.apis.get('server_saved_api_v2')?.name).toBe('服务端保存 API v2');
  await expect.poll(() => apiState.apiSavePayloads[apiState.apiSavePayloads.length - 1]?.originalUuid).toBe('server_saved_api');
  await expect.poll(() => apiState.apiSnapshots.length).toBe(2);

  await page.getByRole('button', { name: '发布', exact: true }).click();
  await expect.poll(() => apiState.apis.get('server_saved_api_v2')?.status).toBe('published');
  await expect.poll(() => apiState.apiSavePayloads[apiState.apiSavePayloads.length - 1]?.originalUuid).toBe('server_saved_api_v2');
  await expect.poll(() => apiState.apiSnapshots[apiState.apiSnapshots.length - 1]?.status).toBe('published');

  await page.getByRole('button', { name: '返回 API 列表' }).click();
  await expect(page.getByRole('row', { name: /server_saved_api_v2/ })).toBeVisible();

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('row', { name: /server_saved_api_v2/ }).getByRole('button', { name: '删除' }).click();

  await expect.poll(() => apiState.apis.has('server_saved_api_v2')).toBe(false);
  await expect(page.getByRole('row', { name: /server_saved_api_v2/ })).toHaveCount(0);
});

test('shows server UUID uniqueness errors without opening an unsaved API URL', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apis: [
      {
        uuid: 'login_users',
        name: 'users 登录接口',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'login_users',
          alias: 'users 登录接口',
          method: 'POST',
          blocks: [],
          response: null
        }
      }
    ]
  });

  await page.goto('/#/apis');
  await page.getByTestId('api-builder-new').click();
  await page.getByTestId('api-info-name').fill('重复登录接口');
  await page.getByTestId('api-info-uuid').fill('login_users');
  await page.getByTestId('api-info-submit').click();

  await expect(page).toHaveURL(/#\/apis$/);
  await expect(page.getByRole('dialog', { name: '新建 API' })).toBeVisible();
  await expect(page.getByText('API 标识已存在。')).toBeVisible();
  await expect.poll(() => apiState.apis.get('login_users')?.name).toBe('users 登录接口');
});
