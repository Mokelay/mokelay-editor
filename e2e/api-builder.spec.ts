import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

type TestApiBlock = Record<string, unknown> & { uuid: string; nextBlock?: string | null };

function linearBlocks(blocks: TestApiBlock[]) {
  return [
    {
      uuid: 'starter',
      nextBlock: blocks[0]?.uuid ?? null
    },
    ...blocks.map((block, index) => ({
      ...block,
      nextBlock: Object.prototype.hasOwnProperty.call(block, 'nextBlock')
        ? block.nextBlock
        : blocks[index + 1]?.uuid ?? null
    }))
  ];
}

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
  await expect(page.getByText('编排画布')).toBeVisible();
  await expect(page.getByTestId('api-flow-starter')).toBeVisible();
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
          blocks: linearBlocks([
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
          ]),
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

test('switches to system APIs and opens them as read-only before copying', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apis: [
      {
        uuid: 'user_api',
        name: '用户接口',
        method: 'GET',
        status: 'draft',
        apiJson: {
          uuid: 'user_api',
          alias: '用户接口',
          method: 'GET',
          blocks: []
        }
      }
    ],
    systemApis: [
      {
        uuid: 'zeta_system',
        name: 'Zeta 系统接口',
        method: 'POST',
        status: 'published',
        apiJson: {
          uuid: 'zeta_system',
          alias: 'Zeta 系统接口',
          method: 'POST',
          blocks: linearBlocks([
            {
              uuid: 'read_system_data',
              alias: '读取系统数据',
              functionName: 'read',
              inputs: { datasource: 'Mokelay', table: 'users', fields: ['id'] },
              outputs: ['data']
            }
          ]),
          response: { data: { template: "{{blocks['read_system_data'].outputs.data}}" } }
        }
      },
      {
        uuid: 'alpha_system',
        name: 'Alpha 系统接口',
        method: 'GET',
        status: 'published',
        apiJson: {
          uuid: 'alpha_system',
          alias: 'Alpha 系统接口',
          method: 'GET',
          blocks: []
        }
      }
    ]
  });

  await page.goto('/#/apis');
  await page.getByTestId('api-source-select').selectOption('system');

  await expect(page).toHaveURL(/#\/apis\?source=system$/);
  await expect.poll(() => apiState.apiListRequests.some((requestUrl) => new URL(requestUrl).pathname === '/api/mokelay/list_mokelay_api_jsons')).toBe(true);
  await expect(page.getByRole('columnheader', { name: '状态' })).toHaveCount(0);
  await expect(page.getByRole('columnheader', { name: '最近编辑' })).toHaveCount(0);
  const systemRow = page.getByRole('row', { name: /zeta_system/ });
  await expect(systemRow).toBeVisible();
  await expect(systemRow.getByRole('button', { name: '删除' })).toHaveCount(0);

  await systemRow.getByRole('button', { name: '打开' }).click();

  await expect(page).toHaveURL(/#\/apis\/zeta_system\?source=system$/);
  await expect.poll(() => apiState.systemApiReadRequests.some((requestUrl) => new URL(requestUrl).searchParams.get('uuid') === 'zeta_system')).toBe(true);
  await expect(page.getByText('系统内置', { exact: true })).toBeVisible();
  await expect(page.getByText('系统内置接口为只读')).toBeVisible();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '发布', exact: true })).toHaveCount(0);
  await expect(page.locator('label').filter({ hasText: '接口名称' }).locator('input')).toBeDisabled();
  await expect(page.getByRole('heading', { name: '读取系统数据' })).toBeVisible();

  const systemNode = page.locator('[data-block-uuid="read_system_data"]');
  const beforeBox = await systemNode.boundingBox();
  expect(beforeBox).not.toBeNull();

  await page.mouse.move(beforeBox!.x + beforeBox!.width / 2, beforeBox!.y + beforeBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(beforeBox!.x + beforeBox!.width / 2 + 140, beforeBox!.y + beforeBox!.height / 2 + 70, { steps: 12 });
  await page.mouse.up();

  await expect.poll(async () => {
    const box = await systemNode.boundingBox();
    return box ? Math.round(box.x - beforeBox!.x) : 0;
  }).toBeGreaterThan(20);

  await page.getByTestId('api-flow-auto-layout').click();
  await expect.poll(async () => {
    return await systemNode.evaluate((element) => {
      const node = element.closest('.vue-flow__node') as HTMLElement | null;
      const match = node?.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      return match ? Math.round(Number(match[1])) : null;
    });
  }).toBe(320);
  expect(apiState.apiSavePayloads).toHaveLength(0);

  await page.getByRole('button', { name: '复制 API' }).click();
  await page.getByTestId('api-info-name').fill('复制的系统接口');
  await page.getByTestId('api-info-uuid').fill('copied_system_api');
  await page.getByTestId('api-info-submit').click();

  await expect(page).toHaveURL(/#\/apis\/copied_system_api$/);
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeVisible();
  await expect.poll(() => apiState.apis.get('copied_system_api')?.name).toBe('复制的系统接口');
});

test('loads a system API from a direct source-aware URL', async ({ page }) => {
  const apiState = await resetEditor(page, {
    systemApis: [
      {
        uuid: 'direct_system_api',
        name: '系统直达接口',
        method: 'GET',
        status: 'published',
        apiJson: {
          uuid: 'direct_system_api',
          alias: '系统直达接口',
          method: 'GET',
          blocks: linearBlocks([
            {
              uuid: 'direct_read',
              alias: '直达读取步骤',
              functionName: 'read',
              inputs: { datasource: 'Mokelay', table: 'users', fields: ['id'] },
              outputs: ['data']
            }
          ])
        }
      }
    ]
  });

  await page.goto('/#/apis/direct_system_api?source=system');

  await expect.poll(() => apiState.systemApiReadRequests.some((requestUrl) => new URL(requestUrl).searchParams.get('uuid') === 'direct_system_api')).toBe(true);
  await expect(page.getByRole('heading', { name: '直达读取步骤' })).toBeVisible();
  await expect(page.getByText('系统内置', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回 API 列表' }).click();
  await expect(page).toHaveURL(/#\/apis\?source=system$/);
  await expect(page.getByTestId('api-source-select')).toHaveValue('system');
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
          blocks: linearBlocks([
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
              alias: '写入用户 Session',
              functionName: 'addSession',
              inputs: {
                key: 'user',
                value: { template: "{{blocks['read_user'].outputs.data}}" }
              },
              outputs: []
            }
          ]),
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
  await expect(page.getByRole('heading', { name: '写入用户 Session' })).toBeVisible();

  await listResponse;

  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '写入用户 Session' })).toBeVisible();
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
          blocks: linearBlocks([
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
          ]),
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
    : 0).toBe(2);
});

test('creates an API from a sample, configures response, and dry-runs it', async ({ page }) => {
  await page.goto('/#/apis');

  await page.getByRole('button', { name: /登录接口/ }).click();
  await expect(page.getByRole('dialog', { name: '新建 API' })).toBeVisible();
  await page.getByTestId('api-info-submit').click();
  await expect(page).toHaveURL(/#\/apis\/login_users/);
  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '校验密码' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '写入用户 Session' })).toBeVisible();

  await page.getByRole('button', { name: '响应' }).click();
  await expect(page.getByText('响应组装')).toBeVisible();
  await expect(page.locator('[data-testid="api-builder-json"]')).toContainText('"uuid": "login_users"');

  await page.getByRole('button', { name: /测试/ }).click();
  await page.getByRole('button', { name: '运行 Dry-run' }).click();

  await expect(page.getByText('Dry-run 通过')).toBeVisible();
  await expect(page.getByText('命中分支：password_true_node')).toBeVisible();
});

test('adds graph blocks and controllers with starter nextBlock JSON', async ({ page }) => {
  await page.goto('/#/apis');
  await page.getByTestId('api-builder-new').click();
  await page.getByTestId('api-info-name').fill('图式 API');
  await page.getByTestId('api-info-uuid').fill('graph_api');
  await page.getByTestId('api-info-submit').click();

  await page.getByRole('button', { name: /读取单条/ }).click();
  let apiJson = JSON.parse(await page.getByTestId('api-builder-json').innerText()) as { blocks: Array<Record<string, unknown>> };
  expect(apiJson.blocks[0]).toMatchObject({
    uuid: 'starter',
    nextBlock: expect.stringMatching(/^read_/)
  });
  expect(apiJson.blocks[1]).toMatchObject({
    functionName: 'read',
    nextBlock: null
  });

  await page.getByRole('button', { name: /IF 控制器/ }).click();
  apiJson = JSON.parse(await page.getByTestId('api-builder-json').innerText()) as { blocks: Array<Record<string, unknown>> };
  const ifController = apiJson.blocks.find((block) => block.functionName === 'if_controller') as Record<string, unknown>;
  expect(ifController).toMatchObject({
    type: 'controller',
    functionName: 'if_controller'
  });
  expect(ifController).not.toHaveProperty('nextBlock');
  expect(ifController.nodes).toEqual(expect.arrayContaining([
    expect.objectContaining({ value: true, nextBlock: null }),
    expect.objectContaining({ value: false, nextBlock: null })
  ]));
});

test('persists graph node layout after saving and reopening an API', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apis: [
      {
        uuid: 'layout_api',
        name: '布局 API',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'layout_api',
          alias: '布局 API',
          method: 'POST',
          request: { body: ['id'] },
          blocks: linearBlocks([
            {
              uuid: 'read_user',
              alias: '读取用户',
              functionName: 'read',
              inputs: {
                datasource: 'Mokelay',
                table: 'users',
                fields: ['id', 'name'],
                conditions: []
              },
              outputs: ['data']
            }
          ]),
          response: {
            user: { template: "{{blocks['read_user'].outputs.data}}" }
          }
        }
      }
    ]
  });

  await page.goto('/#/apis/layout_api');
  const readNode = page.locator('[data-block-uuid="read_user"]');
  await expect(readNode).toBeVisible();

  const beforeBox = await readNode.boundingBox();
  expect(beforeBox).not.toBeNull();

  await page.mouse.move(beforeBox!.x + beforeBox!.width / 2, beforeBox!.y + beforeBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(beforeBox!.x + beforeBox!.width / 2 + 160, beforeBox!.y + beforeBox!.height / 2 + 80, { steps: 12 });
  await page.mouse.up();

  await expect.poll(async () => {
    const box = await readNode.boundingBox();
    return box ? Math.round(box.x - beforeBox!.x) : 0;
  }).toBeGreaterThan(20);

  const draggedBox = await readNode.boundingBox();
  expect(draggedBox).not.toBeNull();

  await page.getByRole('button', { name: '保存', exact: true }).click();

  await expect.poll(() => {
    const layout = apiState.apiSavePayloads.at(-1)?.layout as { nodes?: Record<string, { x?: number; y?: number }> } | undefined;
    return layout?.nodes?.read_user?.x;
  }).toBeGreaterThan(190);
  await expect.poll(() => apiState.apis.get('layout_api')?.layout).toMatchObject({
    version: 1,
    nodes: {
      read_user: expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number)
      })
    }
  });

  await page.reload();
  await expect(readNode).toBeVisible();

  const reopenedBox = await readNode.boundingBox();
  expect(reopenedBox).not.toBeNull();
  expect(Math.abs(reopenedBox!.x - draggedBox!.x)).toBeLessThan(8);
  expect(Math.abs(reopenedBox!.y - draggedBox!.y)).toBeLessThan(8);
});

test('adds a real starter when editing legacy ordered block DSL', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'legacy_login',
        name: '旧登录接口',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'legacy_login',
          alias: '旧登录接口',
          method: 'POST',
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
          response: null
        }
      }
    ]
  });

  await page.goto('/#/apis/legacy_login');
  await expect(page.getByTestId('api-flow-starter')).toBeVisible();

  let apiJson = JSON.parse(await page.getByTestId('api-builder-json').innerText()) as { blocks: Array<Record<string, unknown>> };
  expect(apiJson.blocks[0]).toEqual({
    uuid: 'starter',
    nextBlock: null
  });

  await page.getByRole('button', { name: /分页查询/ }).click();
  apiJson = JSON.parse(await page.getByTestId('api-builder-json').innerText()) as { blocks: Array<Record<string, unknown>> };
  expect(apiJson.blocks[0]).toMatchObject({
    uuid: 'starter',
    nextBlock: expect.stringMatching(/^page_/)
  });

  await page.getByRole('button', { name: /校验/ }).click();

  await expect(page.getByText('read_user.nextBlock 缺失。')).toBeVisible();
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
