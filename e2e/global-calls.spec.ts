import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';
import type { GlobalCallContent, MessageType } from '../src/utils/globalCalls';
import type { JSONSchema, JsonValue, MDatasourceObject } from '../src/utils/datasource';

type GlobalCallTestWindow = Window & {
  $alert: (title: string, content: GlobalCallContent) => Promise<void>;
  $confirm: (title: string, content: GlobalCallContent) => Promise<boolean>;
  $message: (type: MessageType, content: GlobalCallContent) => Promise<void>;
  $remote: (value: MDatasourceObject) => Promise<JsonValue>;
  $schema: (value: MDatasourceObject) => Promise<JSONSchema>;
};

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('registers global call functions on window and Vue global properties', async ({ page }) => {
  const registration = await page.evaluate(() => {
    const appRoot = document.querySelector('#app') as (HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: Record<string, unknown>;
        };
      };
    }) | null;
    const globalProperties = appRoot?.__vue_app__?.config.globalProperties ?? {};

    return {
      windowAlert: typeof (window as unknown as GlobalCallTestWindow).$alert,
      windowConfirm: typeof (window as unknown as GlobalCallTestWindow).$confirm,
      windowMessage: typeof (window as unknown as GlobalCallTestWindow).$message,
      windowRemote: typeof (window as unknown as GlobalCallTestWindow).$remote,
      windowSchema: typeof (window as unknown as GlobalCallTestWindow).$schema,
      vueAlert: globalProperties.$alert === (window as unknown as GlobalCallTestWindow).$alert,
      vueConfirm: globalProperties.$confirm === (window as unknown as GlobalCallTestWindow).$confirm,
      vueMessage: globalProperties.$message === (window as unknown as GlobalCallTestWindow).$message,
      vueRemote: globalProperties.$remote === (window as unknown as GlobalCallTestWindow).$remote,
      vueSchema: globalProperties.$schema === (window as unknown as GlobalCallTestWindow).$schema
    };
  });

  expect(registration).toEqual({
    windowAlert: 'function',
    windowConfirm: 'function',
    windowMessage: 'function',
    windowRemote: 'function',
    windowSchema: 'function',
    vueAlert: true,
    vueConfirm: true,
    vueMessage: true,
    vueRemote: true,
    vueSchema: true
  });
});

test('resolves datasource remote data and schema from window globals', async ({ page }) => {
  await page.route('**/global-remote**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        users: [
          {
            id: 1,
            name: 'Ada'
          }
        ]
      })
    });
  });

  const jsonResult = await page.evaluate(async () => {
    const datasource = {
      type: 'JSON',
      rawData: {
        users: [
          {
            id: 1,
            name: 'Ada'
          }
        ]
      }
    } satisfies MDatasourceObject;

    return {
      data: await (window as unknown as GlobalCallTestWindow).$remote(datasource),
      schema: await (window as unknown as GlobalCallTestWindow).$schema(datasource)
    };
  });

  expect(jsonResult).toEqual({
    data: {
      users: [
        {
          id: 1,
          name: 'Ada'
        }
      ]
    },
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              },
              name: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  });

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/global-remote') && request.method() === 'POST'
  );
  const apiResult = await page.evaluate(async () => (
    await (window as unknown as GlobalCallTestWindow).$remote({
      type: 'API',
      domain: window.location.origin,
      path: '/global-remote',
      method: 'POST',
      headerData: [
        {
          key: 'X-Remote',
          mock: 'demo'
        }
      ],
      bodyData: [
        {
          key: 'name',
          dataType: 'string',
          mock: 'Ada'
        }
      ],
      queryData: [
        {
          key: 'token',
          mock: 'abc'
        }
      ]
    })
  ));
  const request = await requestPromise;

  expect(request.url()).toContain('token=abc');
  expect(request.headers()['x-remote']).toBe('demo');
  expect(request.postDataJSON()).toEqual({
    name: 'Ada'
  });
  expect(apiResult).toEqual({
    ok: true,
    users: [
      {
        id: 1,
        name: 'Ada'
      }
    ]
  });
});

test('rejects datasource globals for API failures and non-JSON responses', async ({ page }) => {
  await page.route('**/global-remote-error**', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: true
      })
    });
  });
  await page.route('**/global-remote-text**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'ok'
    });
  });

  const failures = await page.evaluate(async () => {
    const collectError = async (path: string) => {
      try {
        await (window as unknown as GlobalCallTestWindow).$remote({
          type: 'API',
          domain: window.location.origin,
          path,
          method: 'GET',
          headerData: [],
          bodyData: [],
          queryData: []
        });
        return '';
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    };

    return {
      apiFailure: await collectError('/global-remote-error'),
      nonJson: await collectError('/global-remote-text')
    };
  });

  expect(failures.apiFailure).toContain('API request failed: 500');
  expect(failures.nonJson).toContain('not JSON');
});

test('shows alert and resolves after confirmation', async ({ page }) => {
  const alertResult = page.evaluate(() => (
    (window as unknown as GlobalCallTestWindow).$alert('提示标题', '提示内容').then(() => 'resolved')
  ));

  await expect(page.getByTestId('global-call-alert')).toBeVisible();
  await expect(page.getByTestId('global-call-dialog-title')).toHaveText('提示标题');
  await expect(page.getByTestId('global-call-dialog-content')).toContainText('提示内容');
  await page.getByTestId('global-call-ok').click();

  await expect(alertResult).resolves.toBe('resolved');
  await expect(page.getByTestId('global-call-alert')).toHaveCount(0);
});

test('shows confirm and resolves true or false', async ({ page }) => {
  const confirmResult = page.evaluate(() => (
    (window as unknown as GlobalCallTestWindow).$confirm('确认标题', '继续执行？')
  ));

  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await expect(page.getByTestId('global-call-cancel')).toBeVisible();
  await page.getByTestId('global-call-ok').click();
  await expect(confirmResult).resolves.toBe(true);

  const cancelResult = page.evaluate(() => (
    (window as unknown as GlobalCallTestWindow).$confirm('取消标题', '是否取消？')
  ));

  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await page.getByTestId('global-call-cancel').click();
  await expect(cancelResult).resolves.toBe(false);
});

test('shows message from top and resolves after it disappears', async ({ page }) => {
  const messageResult = page.evaluate(() => (
    (window as unknown as GlobalCallTestWindow).$message('success', '保存成功').then(() => 'closed')
  ));

  const message = page.getByTestId('global-call-message');
  await expect(message).toBeVisible();
  await expect(message).toHaveAttribute('data-type', 'success');
  await expect(message).toContainText('保存成功');
  await expect(message).toBeHidden({ timeout: 4000 });
  await expect(messageResult).resolves.toBe('closed');
});

test('renders stored block content in dialogs and messages', async ({ page }) => {
  const content: GlobalCallContent = [
    {
      id: 'global-call-text',
      type: 'paragraph',
      data: {
        text: 'hello '
      }
    },
    {
      id: 'global-call-tag',
      type: 'MTag',
      data: {
        tagName: '状态',
        closable: false,
        size: '',
        color: '',
        type: 'success'
      }
    }
  ];

  const alertResult = page.evaluate((blocks) => (
    (window as unknown as GlobalCallTestWindow).$alert('富文本', blocks).then(() => 'resolved')
  ), content);

  await expect(page.getByTestId('global-call-dialog-content')).toContainText('hello');
  await expect(page.getByTestId('global-call-dialog-content')).toContainText('状态');
  await page.getByTestId('global-call-ok').click();
  await expect(alertResult).resolves.toBe('resolved');

  const messageResult = page.evaluate((blocks) => (
    (window as unknown as GlobalCallTestWindow).$message('info', blocks).then(() => 'closed')
  ), content);

  await expect(page.getByTestId('global-call-message')).toContainText('hello');
  await expect(page.getByTestId('global-call-message')).toContainText('状态');
  await expect(messageResult).resolves.toBe('closed');
});
