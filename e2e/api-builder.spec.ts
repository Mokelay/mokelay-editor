import { expect, test } from '@playwright/test';
import { resetEditor, type MockApiBuilderSample } from './helpers/editor';

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

function loginApiBuilderSample(): MockApiBuilderSample {
  return {
    uuid: 'login-sample',
    title: '登录接口',
    description: '读取用户、校验密码、写入 Session。',
    method: 'POST',
    sortOrder: 1,
    apiJson: {
      uuid: 'login_users',
      alias: 'users 登录接口',
      method: 'POST',
      request: { body: ['email', 'password'] },
      blocks: [
        {
          uuid: 'starter',
          nextBlock: 'read_user'
        },
        {
          uuid: 'read_user',
          alias: '按邮箱读取用户',
          functionName: 'read',
          inputs: {
            datasource: 'Mokelay',
            table: 'users',
            fields: ['id', 'email', 'password_hash'],
            conditions: [
              {
                group: false,
                fieldName: 'email',
                fieldValue: { template: '{{request.body.email}}' },
                conditionType: 'EQ'
              }
            ]
          },
          outputs: ['data'],
          nextBlock: 'check_user_password'
        },
        {
          uuid: 'check_user_password',
          alias: '校验密码',
          functionName: 'if_controller',
          type: 'controller',
          inputs: {
            value: true
          },
          nodes: [
            {
              uuid: 'password_true_node',
              alias: '校验通过',
              value: true,
              nextBlock: 'set_user_session'
            },
            {
              uuid: 'password_false_node',
              alias: '校验失败',
              value: false,
              nextBlock: null
            }
          ]
        },
        {
          uuid: 'set_user_session',
          alias: '写入用户 Session',
          functionName: 'addSession',
          inputs: {
            key: 'user',
            value: {
              id: { template: "{{blocks['read_user'].outputs.data.id}}" },
              email: { template: "{{blocks['read_user'].outputs.data.email}}" }
            }
          },
          outputs: [],
          nextBlock: null
        }
      ],
      responses: {
        set_user_session: {
          user: {
            id: { template: "{{blocks['read_user'].outputs.data.id}}" },
            email: { template: "{{blocks['read_user'].outputs.data.email}}" }
          }
        },
        password_false_node: {
          user: null
        }
      }
    }
  };
}

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('renders API builder list and creates a blank API draft', async ({ page }) => {
  await page.goto('/#/apis');

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('layout-top-nav')).toContainText('Mokelay Editor');
  await expect(page.getByTestId('layout-top-nav').locator('a[href="#/apis"]')).toHaveClass(/layout-top-nav__link--active/);
  await expect(page.getByTestId('api-builder-shell')).toBeVisible();
  await expect(page.getByText('可视化搭建内部数据 API')).toBeVisible();
  await expect(page.getByText('从模板创建')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '内置样例' })).toBeVisible();

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
  await page.getByTestId('api-source-system').click();

  await expect(page).toHaveURL(/#\/apis\?source=system$/);
  await expect.poll(() => apiState.apiListRequests.some((requestUrl) => new URL(requestUrl).pathname === '/api/mokelay/list_mokelay_api_jsons')).toBe(true);
  await expect(page.getByTestId('api-builder-new')).toHaveCount(0);
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
});

test('loads a system Fragment from a direct fragment-aware URL and returns to its list tab', async ({ page }) => {
  const apiState = await resetEditor(page, {
    systemApis: [
      {
        uuid: 'shared_system_uuid',
        name: '同 UUID 内置 API',
        method: 'GET',
        status: 'published',
        apiJson: {
          uuid: 'shared_system_uuid',
          alias: '同 UUID 内置 API',
          method: 'GET',
          blocks: [{ uuid: 'starter', nextBlock: null }]
        }
      }
    ],
    systemFragments: [
      {
        uuid: 'shared_system_uuid',
        name: '同 UUID 内置 Fragment',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'shared_system_uuid',
          alias: '同 UUID 内置 Fragment',
          fragment: true,
          params: ['email'],
          blocks: [{ uuid: 'starter', nextBlock: null }],
          response: { email: { template: '{{params.email}}' } }
        }
      }
    ]
  });

  const expectSystemFragmentList = async () => {
    await expect(page.getByTestId('editor-tabs-tab-system-built-in')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('editor-tabs-tab-system-fragment')).toHaveAttribute('aria-selected', 'true');
    const fragmentRow = page.getByRole('row', { name: /shared_system_uuid/ });
    await expect(fragmentRow).toContainText('同 UUID 内置 Fragment');
    await expect(fragmentRow).not.toContainText('同 UUID 内置 API');
  };

  await page.goto('/#/apis?source=system&fragment=true');
  await expectSystemFragmentList();

  await page.goto('/#/apis/shared_system_uuid?source=system&fragment=true');

  await expect.poll(() => apiState.systemApiReadRequests.some((requestUrl) => {
    const url = new URL(requestUrl);
    return url.searchParams.get('uuid') === 'shared_system_uuid'
      && url.searchParams.get('fragment') === 'true';
  })).toBe(true);
  await expect(page.getByRole('heading', { name: '同 UUID 内置 Fragment' })).toBeVisible();
  await expect(page.getByText('Fragment', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '返回 API 列表' }).click();
  await expect(page).toHaveURL(/#\/apis\?source=system&fragment=true$/);
  await expectSystemFragmentList();
});

test('isolates user and built-in Fragment references and blocks copying a built-in caller', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apis: [
      {
        uuid: 'user_registration_fragment',
        name: '用户注册 Fragment',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'user_registration_fragment',
          alias: '用户注册 Fragment',
          fragment: true,
          params: ['user_email'],
          blocks: [{ uuid: 'starter', nextBlock: null }],
          response: { email: { template: '{{params.user_email}}' } }
        }
      },
      {
        uuid: 'user_fragment_caller',
        name: '用户 Fragment 调用方',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'user_fragment_caller',
          alias: '用户 Fragment 调用方',
          method: 'POST',
          request: { header: [], query: [], body: ['email'] },
          blocks: linearBlocks([
            {
              uuid: 'run_user_fragment',
              functionName: 'executeFragment',
              inputs: {
                fragmentUuid: 'user_registration_fragment',
                params: { user_email: { template: '{{request.body.email}}' } }
              },
              outputs: ['result']
            }
          ]),
          response: { result: { template: "{{blocks['run_user_fragment'].outputs.result}}" } }
        }
      },
      {
        uuid: 'invalid_cross_source_caller',
        name: '错误跨来源调用方',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'invalid_cross_source_caller',
          alias: '错误跨来源调用方',
          method: 'POST',
          request: { header: [], query: [], body: [] },
          blocks: linearBlocks([
            {
              uuid: 'run_cross_source_fragment',
              functionName: 'executeFragment',
              inputs: { fragmentUuid: 'system_registration_fragment', params: {} },
              outputs: ['result']
            }
          ]),
          response: { result: { template: "{{blocks['run_cross_source_fragment'].outputs.result}}" } }
        }
      }
    ],
    systemApis: [
      {
        uuid: 'system_registration_fragment',
        name: '同 UUID 根 API',
        method: 'GET',
        status: 'published',
        apiJson: {
          uuid: 'system_registration_fragment',
          alias: '同 UUID 根 API',
          method: 'GET',
          blocks: [{ uuid: 'starter', nextBlock: null }],
          response: { root: true }
        }
      },
      {
        uuid: 'system_fragment_caller',
        name: '内置 Fragment 调用方',
        method: 'POST',
        status: 'published',
        apiJson: {
          uuid: 'system_fragment_caller',
          alias: '内置 Fragment 调用方',
          method: 'POST',
          request: { header: [], query: [], body: ['token'] },
          blocks: linearBlocks([
            {
              uuid: 'run_system_fragment',
              functionName: 'executeFragment',
              inputs: {
                fragmentUuid: 'system_registration_fragment',
                params: { system_token: { template: '{{request.body.token}}' } }
              },
              outputs: ['result']
            }
          ]),
          response: { result: { template: "{{blocks['run_system_fragment'].outputs.result}}" } }
        }
      }
    ],
    systemFragments: [
      {
        uuid: 'system_registration_fragment',
        name: '内置注册 Fragment',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'system_registration_fragment',
          alias: '内置注册 Fragment',
          fragment: true,
          params: ['system_token'],
          blocks: [{ uuid: 'starter', nextBlock: null }],
          response: { token: { template: '{{params.system_token}}' } }
        }
      }
    ]
  });

  await page.goto('/#/apis/user_fragment_caller');
  await page.locator('[data-block-uuid="run_user_fragment"]').click();
  const userPicker = page.getByTestId('execute-fragment-picker');
  await expect(userPicker.locator('option[value="user_registration_fragment"]')).toHaveCount(1);
  await expect(userPicker.locator('option[value="system_registration_fragment"]')).toHaveCount(0);
  await expect(page.getByTestId('execute-fragment-param-user_email')).toBeVisible();
  await expect(page.getByTestId('execute-fragment-param-system_token')).toHaveCount(0);

  await page.goto('/#/apis/invalid_cross_source_caller');
  await page.locator('[data-block-uuid="run_cross_source_fragment"]').click();
  await expect(page.getByTestId('execute-fragment-picker').locator('option[value="system_registration_fragment"]')).toHaveCount(0);
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText(/用户 API 只能引用同来源 Fragment：system_registration_fragment/)).toBeVisible();
  expect(apiState.apiSavePayloads).toHaveLength(0);

  await page.goto('/#/apis/system_fragment_caller?source=system');
  await page.locator('[data-block-uuid="run_system_fragment"]').click();
  const systemPicker = page.getByTestId('execute-fragment-picker');
  await expect(systemPicker).toBeDisabled();
  await expect(systemPicker.locator('option[value="system_registration_fragment"]')).toHaveCount(1);
  await expect(systemPicker.locator('option[value="user_registration_fragment"]')).toHaveCount(0);
  await expect(page.getByTestId('execute-fragment-param-system_token')).toBeDisabled();
  await expect(page.getByRole('button', { name: '新建 Fragment' })).toHaveCount(0);
  await expect.poll(() => apiState.apiListRequests.some((requestUrl) => {
    const url = new URL(requestUrl);
    return url.pathname === '/api/mokelay/list_mokelay_api_jsons'
      && url.searchParams.get('fragment') === 'true';
  })).toBe(true);

  await page.getByTestId('view-system-fragment').click();
  const dialog = page.getByRole('dialog', { name: '内置注册 Fragment' });
  await expect(dialog).toContainText('内置 Fragment · 只读');
  await expect(dialog.getByRole('button', { name: '保存草稿' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: '发布' })).toHaveCount(0);
  await expect(dialog.getByTestId('fragment-editor-param-system_token')).toBeDisabled();
  await expect.poll(() => apiState.systemApiReadRequests.some((requestUrl) => (
    new URL(requestUrl).searchParams.get('uuid') === 'system_registration_fragment'
      && new URL(requestUrl).searchParams.get('fragment') === 'true'
  ))).toBe(true);
  await dialog.getByRole('button', { name: '取消' }).click();

  await page.getByRole('button', { name: '复制 API' }).click();
  await expect(page.getByText('该内置 API 引用了内置 Fragment，不能复制为用户 API。请先在用户空间重建对应 Fragment 和调用关系。')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(apiState.apiSavePayloads).toHaveLength(0);
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
  const apiState = await resetEditor(page, {
    apiBuilderSamples: [
      loginApiBuilderSample(),
      {
        ...loginApiBuilderSample(),
        uuid: 'hidden-login-sample',
        title: '隐藏样例',
        status: 'inactive',
        sortOrder: 2
      }
    ]
  });

  await page.goto('/#/apis');

  await expect.poll(() => apiState.apiBuilderSampleRequests.some((requestUrl) => (
    new URL(requestUrl).pathname === '/api/mokelay/list_api_builder_samples'
  ))).toBe(true);
  await expect(page.getByRole('button', { name: /隐藏样例/ })).toHaveCount(0);
  await page.getByRole('button', { name: /登录接口/ }).click();
  await expect(page.getByRole('dialog', { name: '新建 API' })).toBeVisible();
  await page.getByTestId('api-info-submit').click();
  await expect(page).toHaveURL(/#\/apis\/login_users/);
  await expect(page.getByRole('heading', { name: '按邮箱读取用户' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '校验密码' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '写入用户 Session' })).toBeVisible();

  await page.getByRole('button', { name: '响应' }).click();
  await expect(page.getByText('响应组装')).toBeVisible();
  await expect(page.getByTestId('api-response-terminal-password_false_node')).toBeVisible();
  await expect(page.getByTestId('api-response-terminal-set_user_session')).toBeVisible();
  await expect(page.locator('[data-testid="api-builder-json"]')).toContainText('"uuid": "login_users"');
  await expect(page.locator('[data-testid="api-builder-json"]')).toContainText('"responses"');
  await page.getByTestId('api-response-terminal-password_false_node').click();
  await expect(page.locator('[data-testid="api-builder-json"]')).toContainText('"user": null');
  const responseFieldKey = page.getByTestId('api-response-field-key');
  await expect(responseFieldKey).toHaveCount(1);
  await responseFieldKey.click();
  await responseFieldKey.press('ControlOrMeta+A');
  await page.keyboard.type('message');
  await expect(responseFieldKey).toBeFocused();
  await expect(responseFieldKey).toHaveValue('message');
  await responseFieldKey.press('Backspace');
  await expect(responseFieldKey).toBeFocused();
  await expect(responseFieldKey).toHaveValue('messag');
  await responseFieldKey.press('ControlOrMeta+A');
  await page.keyboard.type('m');
  await responseFieldKey.press('Backspace');
  await expect(responseFieldKey).toBeFocused();
  await expect(responseFieldKey).toHaveValue('');
  await page.getByRole('button', { name: '添加响应字段' }).click();
  await page.getByRole('button', { name: '添加响应字段' }).click();
  await expect(responseFieldKey).toHaveCount(3);
  await expect(responseFieldKey.nth(1)).toHaveValue('data');
  await expect(responseFieldKey.nth(2)).toHaveValue('data_1');

  await page.getByRole('button', { name: /测试/ }).click();
  await page.getByRole('button', { name: '运行 Dry-run' }).click();

  await expect(page.getByText('Dry-run 通过')).toBeVisible();
  await expect(page.getByText('命中分支：password_true_node')).toBeVisible();
});

test('edits Fragment params without emitting HTTP request fields', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apis: [
      {
        uuid: 'shared_registration',
        name: '共享注册逻辑',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'shared_registration',
          alias: '共享注册逻辑',
          fragment: true,
          params: ['email'],
          blocks: linearBlocks([
            {
              uuid: 'make_schema_id',
              functionName: 'randomId',
              inputs: { prefix: 'e_', length: 5, alphabet: 'abc123', lowerCase: true },
              outputs: ['value']
            },
            {
              uuid: 'assert_schema_id',
              functionName: 'assertUnique',
              inputs: {
                datasource: 'Mokelay',
                table: 'datasources',
                fieldName: 'uuid',
                value: { template: "{{blocks['make_schema_id'].outputs.value}}" }
              },
              outputs: []
            },
            {
              uuid: 'create_schema',
              functionName: 'createSchema',
              inputs: {
                datasource: 'MokelayFree',
                schema: { template: "{{blocks['make_schema_id'].outputs.value}}" }
              },
              outputs: ['schema', 'created', 'exists']
            }
          ]),
          response: { schema: { template: "{{blocks['create_schema'].outputs.schema}}" } }
        }
      }
    ]
  });

  await page.goto('/#/apis/shared_registration');
  await expect(page.getByText('Fragment 配置')).toBeVisible();
  await expect(page.getByTestId('api-add-execute-fragment')).toHaveCount(0);
  await expect(page.getByText('0 错误')).toBeVisible();
  await page.getByRole('button', { name: '测试' }).click();
  await page.getByRole('button', { name: '运行 Dry-run' }).click();
  await expect(page.getByText('Dry-run 通过')).toBeVisible();
  await page.getByRole('button', { name: 'Params' }).click();
  await page.getByTestId('fragment-add-param').click();
  await expect(page.getByTestId('fragment-param-key')).toHaveCount(2);
  await page.getByRole('button', { name: /读取单条/ }).click();
  await page.getByRole('button', { name: 'JSON 预览' }).click();

  const apiJsonText = await page.getByTestId('api-builder-json').innerText();
  const apiJson = JSON.parse(apiJsonText) as Record<string, unknown>;
  expect(apiJson.fragment).toBe(true);
  expect(apiJson).not.toHaveProperty('method');
  expect(apiJson).not.toHaveProperty('request');
  expect(apiJsonText).not.toContain('{{request.');

  await page.getByRole('button', { name: '发布', exact: true }).click();
  await expect.poll(() => apiState.apiSavePayloads.length).toBeGreaterThan(0);
  expect(apiState.apiSavePayloads.at(-1)).toMatchObject({
    fragment: true,
    method: 'FRAGMENT',
    apiJson: expect.objectContaining({ fragment: true })
  });
  expect(apiState.apiSavePayloads.at(-1)?.apiJson).not.toHaveProperty('method');
});

test('configures ExecuteFragment and opens the reusable Fragment editor modal', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'shared_registration',
        name: '共享注册逻辑',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'shared_registration',
          alias: '共享注册逻辑',
          fragment: true,
          params: ['email'],
          blocks: [{ uuid: 'starter', nextBlock: null }],
          response: { user: { template: '{{params.email}}' } }
        }
      },
      {
        uuid: 'shared_registration_v2',
        name: '共享注册逻辑 V2',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'shared_registration_v2',
          alias: '共享注册逻辑 V2',
          fragment: true,
          params: ['email', 'name'],
          blocks: [{ uuid: 'starter', nextBlock: null }],
          response: { user: { template: '{{params.email}}' } }
        }
      },
      {
        uuid: 'register_entry',
        name: '注册入口',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'register_entry',
          alias: '注册入口',
          method: 'POST',
          request: { body: ['email'] },
          blocks: linearBlocks([
            {
              uuid: 'run_registration',
              alias: '执行共享注册',
              functionName: 'executeFragment',
              inputs: {
                fragmentUuid: 'shared_registration',
                params: {
                  email: { template: '{{request.body.email}}' },
                  legacy: 'must be pruned'
                }
              },
              outputs: ['result']
            }
          ]),
          response: { user: { template: "{{blocks['run_registration'].outputs.result.user}}" } }
        }
      }
    ]
  });

  await page.goto('/#/apis/register_entry');
  await page.locator('[data-block-uuid="run_registration"]').click();
  await expect(page.getByTestId('execute-fragment-picker')).toHaveValue('shared_registration');
  await expect(page.getByTestId('execute-fragment-param-email')).toBeVisible();
  await expect.poll(async () => (await page.getByTestId('api-builder-json').innerText()).includes('legacy')).toBe(false);
  await page.getByTestId('execute-fragment-picker').selectOption('shared_registration_v2');
  await expect(page.getByTestId('execute-fragment-param-name')).toBeVisible();
  await expect(page.getByTestId('execute-fragment-param-email')).toHaveValue('{{request.body.email}}');
  await page.getByTestId('execute-fragment-picker').selectOption('shared_registration');
  await page.getByRole('button', { name: '编排 Fragment' }).click();

  const dialog = page.getByRole('dialog', { name: '共享注册逻辑' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('orchestration-editor-block')).toBeVisible();
  await expect(dialog.getByText('Fragment 编排')).toBeVisible();
  await expect(dialog.getByRole('button', { name: '执行 Fragment' })).toHaveCount(0);
  const flowRoots = page.locator('[data-flow-id]');
  await expect(flowRoots).toHaveCount(2);
  const flowInstanceIds = await flowRoots.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-flow-id') || ''));
  expect(new Set(flowInstanceIds).size).toBe(2);
  await dialog.getByRole('button', { name: '取消' }).click();

  await page.getByTestId('api-add-execute-fragment').click();
  await expect(page.getByTestId('execute-fragment-picker')).toHaveValue('');
  await expect(page.getByTestId('execute-fragment-picker').locator('option')).toHaveCount(3);
});

test('preserves errorNextBlock and dry-runs target, terminal, and uncaught error modes', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'invalid_email_fragment',
        name: '邮箱校验 Fragment',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'invalid_email_fragment',
          alias: '邮箱校验 Fragment',
          fragment: true,
          params: [{ key: 'email', processors: ['email_check'] }],
          blocks: [{ uuid: 'starter', nextBlock: null }],
          response: { accepted: true }
        }
      },
      {
        uuid: 'error_routing_api',
        name: '错误路由接口',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'error_routing_api',
          alias: '错误路由接口',
          method: 'POST',
          request: { header: [], query: [], body: [] },
          blocks: [
            { uuid: 'starter', nextBlock: 'run_invalid_fragment' },
            {
              uuid: 'run_invalid_fragment',
              alias: '执行失败 Fragment',
              functionName: 'executeFragment',
              inputs: {
                fragmentUuid: 'invalid_email_fragment',
                params: { email: 'not-an-email' }
              },
              outputs: ['result'],
              nextBlock: 'success_marker',
              errorNextBlock: 'handled_error'
            },
            {
              uuid: 'success_marker',
              functionName: 'randomId',
              inputs: { prefix: 'ok_', length: 4 },
              outputs: ['value'],
              nextBlock: 'handled_error'
            },
            {
              uuid: 'handled_error',
              functionName: 'randomId',
              inputs: { prefix: 'handled_', length: 4 },
              outputs: ['value'],
              nextBlock: null
            }
          ],
          response: { branch: 'terminal' },
          responses: {
            handled_error: { branch: 'handled' }
          }
        }
      }
    ]
  });

  await page.goto('/#/apis/error_routing_api');
  await expect(page.getByText('0 错误')).toBeVisible();
  await expect(page.locator('.vue-flow__edge').filter({ hasText: '错误' })).toBeVisible();
  await page.locator('[data-block-uuid="run_invalid_fragment"]').click();
  const errorTarget = page.getByTestId('block-error-next-block');
  await expect(errorTarget).toHaveValue('handled_error');

  await page.getByRole('button', { name: '测试' }).click();
  await page.getByRole('button', { name: '运行 Dry-run' }).click();
  await expect(page.getByText('Dry-run 通过')).toBeVisible();
  await expect(page.getByText(/已进入错误分支 handled_error/)).toBeVisible();
  await expect(page.locator('pre').filter({ hasText: '"branch": "handled"' })).toBeVisible();

  await errorTarget.selectOption('__terminal__');
  await page.getByRole('button', { name: '测试' }).click();
  await page.getByRole('button', { name: '运行 Dry-run' }).click();
  await expect(page.getByText('Dry-run 通过')).toBeVisible();
  await expect(page.getByText(/已进入错误终点/)).toBeVisible();
  await expect(page.locator('pre').filter({ hasText: '"branch": "terminal"' })).toBeVisible();

  await errorTarget.selectOption('__unhandled__');
  await page.getByRole('button', { name: 'JSON 预览' }).click();
  await expect(page.getByTestId('api-builder-json')).not.toContainText('errorNextBlock');
  await page.getByRole('button', { name: '测试' }).click();
  await page.getByRole('button', { name: '运行 Dry-run' }).click();
  await expect(page.getByText(/Fragment invalid_email_fragment 执行失败/).first()).toBeVisible();
});

test('migrates terminal responses when the Fragment popup appends and removes a block', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'terminal_fragment',
        name: '终点迁移 Fragment',
        method: 'FRAGMENT',
        fragment: true,
        status: 'published',
        apiJson: {
          uuid: 'terminal_fragment',
          alias: '终点迁移 Fragment',
          fragment: true,
          params: [],
          blocks: [{ uuid: 'starter', nextBlock: null }],
          responses: { starter: { result: 'kept' } }
        }
      },
      {
        uuid: 'terminal_fragment_host',
        name: '终点迁移宿主',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'terminal_fragment_host',
          alias: '终点迁移宿主',
          method: 'POST',
          request: { header: [], query: [], body: [] },
          blocks: linearBlocks([{
            uuid: 'execute_terminal_fragment',
            functionName: 'executeFragment',
            inputs: { fragmentUuid: 'terminal_fragment', params: {} },
            outputs: ['result']
          }]),
          response: { result: { template: "{{blocks['execute_terminal_fragment'].outputs.result}}" } }
        }
      }
    ]
  });

  await page.goto('/#/apis/terminal_fragment_host');
  await page.locator('[data-block-uuid="execute_terminal_fragment"]').click();
  await page.getByRole('button', { name: '编排 Fragment' }).click();
  const dialog = page.getByRole('dialog', { name: '终点迁移 Fragment' });
  await dialog.getByRole('button', { name: '读取单条' }).click();
  await dialog.getByRole('button', { name: 'JSON', exact: true }).click();
  let popupJson = JSON.parse(await dialog.locator('textarea').inputValue()) as {
    blocks: Array<Record<string, unknown>>;
    responses: Record<string, unknown>;
  };
  const addedUuid = String(popupJson.blocks.find((block) => block.uuid !== 'starter')?.uuid);
  expect(popupJson.responses).toHaveProperty(addedUuid);
  expect(popupJson.responses).not.toHaveProperty('starter');

  await dialog.locator(`[data-block-uuid="${addedUuid}"]`).click();
  await dialog.getByRole('button', { name: '删除步骤' }).click();
  await dialog.getByRole('button', { name: 'JSON', exact: true }).click();
  popupJson = JSON.parse(await dialog.locator('textarea').inputValue());
  expect(popupJson.blocks).toEqual([{ uuid: 'starter', nextBlock: null }]);
  expect(popupJson.responses).toEqual({ starter: { result: 'kept' } });
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
