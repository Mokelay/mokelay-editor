import { expect, test, type Page } from '@playwright/test';
import {
  addEditorTool,
  getSavedBlocks,
  resetEditor,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

const localApiDomain = {
  uuid: 'local',
  alias: 'Local API',
  host: 'http://127.0.0.1:4173'
};

function getFieldsValue(blocks: Awaited<ReturnType<typeof getSavedBlocks>>) {
  return blocks.find((block) => block.type === 'MFieldsEditor')?.data?.value;
}

async function openFieldsSettings(page: Page) {
  await page.getByTestId('fields-settings-open').click();
  const dialog = page.locator('[data-testid="fields-settings-dialog"][open]').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function openMokelayApiImport(page: Page) {
  await page.getByTestId('fields-import-open-mokelay').click();
  const dialog = page.getByTestId('datasource-api-import-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('datasource-api-import-dialog-title')).toContainText('Mokelay');
  return dialog;
}

async function openApifoxApiImport(page: Page) {
  await page.getByTestId('fields-import-open-apifox').click();
  const dialog = page.getByTestId('datasource-api-import-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('datasource-api-import-dialog-title')).toContainText('APIFox');
  return dialog;
}

async function mockApifoxApi(page: Page, openapi: Record<string, unknown>) {
  await page.route('**/api/mokelay/list-apifox-projects**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          projects: [{ id: 42, name: '字段项目' }],
          count: 1
        }
      })
    });
  });
  await page.route('**/api/mokelay/list-apifox-apis**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          apis: [],
          count: 0,
          openapi
        }
      })
    });
  });
}

test('adds a fields editor with default value and opens read-only preview dialog', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '字段编辑器');

  await expect(page.getByTestId('editor-fields-tool')).toBeVisible();
  await expect(page.getByTestId('fields-settings-open')).toHaveText('设置字段');
  await expect(page.getByTestId('fields-summary')).toContainText('已设置 0 个字段');

  const dialog = await openFieldsSettings(page);
  await expect(dialog.getByTestId('fields-settings-dialog-title')).toHaveText('字段设置');
  await expect(dialog.getByTestId('fields-empty')).toContainText('暂无字段');
  await dialog.getByTestId('fields-save').click();

  await page.getByTestId('save-button').click();
  expect(getFieldsValue(await getSavedBlocks(page))).toEqual([]);

  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MFieldsEditor')).toBeVisible();
  await page.getByTestId('preview-block-MFieldsEditor').getByTestId('fields-settings-open').click();
  const previewDialog = page.locator('[data-testid="fields-settings-dialog"][open]').last();
  await expect(previewDialog).toBeVisible();
  await expect(previewDialog.getByTestId('fields-import-section')).toHaveCount(0);
  await expect(previewDialog.getByTestId('fields-save')).toHaveCount(0);
});

test('manually adds edits removes and saves only selected fields', async ({ page }) => {
  let translationRequest: Record<string, unknown> | undefined;
  await page.route('**/api/mokelay/ai-translate', async (route) => {
    translationRequest = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          translations: {
            name: '姓名',
            age: '年龄'
          }
        }
      })
    });
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '字段编辑器');
  const dialog = await openFieldsSettings(page);

  await dialog.getByTestId('fields-add').click();
  await dialog.getByTestId('fields-label-0').fill('name');
  await dialog.getByTestId('fields-variable-0').fill('profile.name');
  await dialog.getByTestId('fields-data-type-0').selectOption('string');

  await dialog.getByTestId('fields-add').click();
  await dialog.getByTestId('fields-label-1').fill('age');
  await dialog.getByTestId('fields-variable-1').fill('data.users[].age');
  await dialog.getByTestId('fields-data-type-1').selectOption('number');

  await dialog.getByTestId('fields-add').click();
  await dialog.getByTestId('fields-label-2').fill('临时字段');
  await dialog.getByTestId('fields-variable-2').fill('temporary');
  await dialog.getByTestId('fields-remove-2').click();

  const dialogBox = await dialog.boundingBox();
  const panelBox = await dialog.locator('.ce-fields-editor__dialog-panel').boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  expect(Math.abs(dialogBox!.height - panelBox!.height)).toBeLessThanOrEqual(2);

  await dialog.getByTestId('fields-translate-labels').click();
  await expect.poll(() => translationRequest).toEqual({
    texts: ['name', 'age'],
    sourceLanguage: 'English',
    targetLanguage: '中文'
  });
  await expect(dialog.getByTestId('fields-label-0')).toHaveValue('姓名');
  await expect(dialog.getByTestId('fields-label-1')).toHaveValue('年龄');

  await dialog.getByTestId('fields-truncate-variables').click();
  await expect(dialog.getByTestId('fields-variable-0')).toHaveValue('name');
  await expect(dialog.getByTestId('fields-variable-1')).toHaveValue('age');

  await dialog.getByTestId('fields-save').click();
  await expect(page.getByTestId('fields-summary')).toContainText('已设置 2 个字段');
  await page.getByTestId('save-button').click();

  expect(getFieldsValue(await getSavedBlocks(page))).toEqual([
    { label: '姓名', variable: 'name', dataType: 'string' },
    { label: '年龄', variable: 'age', dataType: 'number' }
  ]);
});

test('imports request fields from a Mokelay orchestration API', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'field_import_api',
        name: '字段导入接口',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'field_import_api',
          alias: '字段导入接口',
          method: 'POST',
          request: {
            header: ['Authorization'],
            query: ['page'],
            body: ['keyword']
          },
          response: {
            ok: true
          }
        }
      }
    ]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '字段编辑器');
  const dialog = await openFieldsSettings(page);

  const importDialog = await openMokelayApiImport(page);
  await importDialog.getByTestId('datasource-import-mokelay-api').selectOption('field_import_api');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await expect(dialog.getByTestId('fields-empty')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-section')).toBeVisible();
  await dialog.getByTestId('fields-available-search').fill('page');
  await expect(dialog.getByTestId('fields-available-field-page')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-field-keyword')).toHaveCount(0);
  await dialog.getByTestId('fields-available-add-page').click();
  await expect(dialog.getByTestId('fields-label-0')).toHaveValue('page');
  await expect(dialog.getByTestId('fields-available-add-page')).toHaveText('已添加');

  await dialog.getByTestId('fields-available-search').fill('');
  await dialog.getByTestId('fields-available-add-Authorization').click();
  await dialog.getByTestId('fields-available-add-keyword').click();
  await dialog.getByTestId('fields-save').click();
  await page.getByTestId('save-button').click();

  expect(getFieldsValue(await getSavedBlocks(page))).toEqual([
    { label: 'page', variable: 'page', dataType: 'string' },
    { label: 'Authorization', variable: 'Authorization', dataType: 'string' },
    { label: 'keyword', variable: 'keyword', dataType: 'string' }
  ]);
});

test('imports request fields from an APIFox API', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [
      {
        uuid: 'apifox',
        alias: 'APIFox API',
        host: 'https://api.example.com'
      }
    ]
  });
  await mockApifoxApi(page, {
    openapi: '3.0.0',
    servers: [{ url: 'https://api.example.com/v1' }],
    paths: {
      '/users/search': {
        post: {
          operationId: 'apifox-fields-api',
          parameters: [
            { name: 'token', in: 'query', schema: { type: 'string' } },
            { name: 'X-Trace', in: 'header', schema: { type: 'string' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    keyword: { type: 'string' },
                    limit: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      total: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '字段编辑器');
  const dialog = await openFieldsSettings(page);

  const importDialog = await openApifoxApiImport(page);
  await importDialog.getByTestId('datasource-import-apifox-project').selectOption('42');
  await importDialog.getByTestId('datasource-import-apifox-api-id').fill('apifox-fields-api');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await expect(dialog.getByTestId('fields-empty')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-add-X-Trace')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-add-token')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-add-limit')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-add-ok')).toBeVisible();
  await dialog.getByTestId('fields-available-add-X-Trace').click();
  await dialog.getByTestId('fields-available-add-limit').click();
  await dialog.getByTestId('fields-available-add-ok').click();
  await expect(dialog.getByTestId('fields-variable-0')).toHaveValue('X-Trace');
  await expect(dialog.getByTestId('fields-variable-1')).toHaveValue('limit');
  await expect(dialog.getByTestId('fields-data-type-1')).toHaveValue('number');
  await expect(dialog.getByTestId('fields-variable-2')).toHaveValue('ok');
  await expect(dialog.getByTestId('fields-data-type-2')).toHaveValue('boolean');
  await dialog.getByTestId('fields-save').click();
  await page.getByTestId('save-button').click();

  expect(getFieldsValue(await getSavedBlocks(page))).toEqual([
    { label: 'X-Trace', variable: 'X-Trace', dataType: 'string' },
    { label: 'limit', variable: 'limit', dataType: 'number' },
    { label: 'ok', variable: 'ok', dataType: 'boolean' }
  ]);
});

test('captures response fields with full variable paths after importing an API', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [
      {
        uuid: 'remote',
        alias: 'Remote API',
        host: 'https://api.example.com'
      },
      localApiDomain
    ]
  });
  await mockApifoxApi(page, {
    openapi: '3.0.0',
    servers: [{ url: 'https://api.example.com' }],
    paths: {
      '/fields-response': {
        post: {
          operationId: 'capture-fields-api',
          parameters: [
            { name: 'token', in: 'query', schema: { type: 'string' } },
            { name: 'X-Trace', in: 'header', schema: { type: 'string' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    keyword: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  await page.route('**/fields-response**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          users: [
            {
              id: 1,
              name: 'Ada'
            }
          ]
        }
      })
    });
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '字段编辑器');
  const dialog = await openFieldsSettings(page);

  const importDialog = await openApifoxApiImport(page);
  await importDialog.getByTestId('datasource-import-apifox-project').selectOption('42');
  await importDialog.getByTestId('datasource-import-apifox-api-id').fill('capture-fields-api');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await dialog.getByTestId('fields-capture-response-fields').click();
  const responseMockDialog = page.getByTestId('datasource-response-mock-dialog');
  await expect(responseMockDialog).toBeVisible();
  await expect(responseMockDialog.getByTestId('datasource-response-mock-domain')).toHaveValue('remote');
  await responseMockDialog.getByTestId('datasource-response-mock-domain').selectOption('local');
  await responseMockDialog.getByTestId('datasource-response-mock-header-0').fill('trace-1');
  await responseMockDialog.getByTestId('datasource-response-mock-query-0').fill('abc');
  await responseMockDialog.getByTestId('datasource-response-mock-body-0').fill('Ada');
  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/fields-response') && request.method() === 'POST'
  );
  await responseMockDialog.getByTestId('datasource-response-mock-submit').click();
  const request = await requestPromise;
  expect(request.url()).toContain(`${localApiDomain.host}/fields-response`);
  await expect(responseMockDialog).not.toBeVisible();

  await expect(dialog.getByTestId('fields-empty')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-add-data.users[]')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-add-data.users[].id')).toBeVisible();
  await expect(dialog.getByTestId('fields-available-add-data.users[].name')).toBeVisible();
  await dialog.getByTestId('fields-available-search').fill('users');
  await expect(dialog.getByTestId('fields-available-field-ok')).toHaveCount(0);
  await dialog.getByTestId('fields-available-add-data.users[]').click();
  await dialog.getByTestId('fields-available-add-data.users[].id').click();
  await dialog.getByTestId('fields-available-add-data.users[].name').click();
  await expect(dialog.getByTestId('fields-variable-0')).toHaveValue('data.users[]');
  await expect(dialog.getByTestId('fields-variable-1')).toHaveValue('data.users[].id');
  await expect(dialog.getByTestId('fields-variable-2')).toHaveValue('data.users[].name');

  await dialog.getByTestId('fields-save').click();
  await page.getByTestId('save-button').click();
  expect(getFieldsValue(await getSavedBlocks(page))).toEqual([
    { label: 'users', variable: 'data.users[]', dataType: 'array' },
    { label: 'id', variable: 'data.users[].id', dataType: 'number' },
    { label: 'name', variable: 'data.users[].name', dataType: 'string' }
  ]);
});

test('keeps the field list scrollable and footer actions visible with many fields', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '字段编辑器');
  const dialog = await openFieldsSettings(page);

  for (let index = 0; index < 24; index += 1) {
    await dialog.getByTestId('fields-add').click();
    await dialog.getByTestId(`fields-label-${index}`).fill(`字段${index + 1}`);
    await dialog.getByTestId(`fields-variable-${index}`).fill(`field_${index + 1}`);
  }

  const listBody = dialog.locator('.ce-fields-editor__section-body--fields');
  await expect(listBody).toBeVisible();
  await expect(dialog.getByTestId('fields-save')).toBeVisible();

  const scrollMetrics = await listBody.evaluate((element) => ({
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);

  await dialog.getByTestId('fields-save').click();
  await expect(page.getByTestId('fields-summary')).toContainText('已设置 24 个字段');
});

test('keeps selected field list visible when many imported fields are available', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'many_available_fields_api',
        name: '大量字段接口',
        method: 'POST',
        status: 'draft',
        apiJson: {
          uuid: 'many_available_fields_api',
          alias: '大量字段接口',
          method: 'POST',
          request: {
            header: Array.from({ length: 8 }, (_, index) => `Header-${index + 1}`),
            query: Array.from({ length: 12 }, (_, index) => `query_${index + 1}`),
            body: Array.from({ length: 16 }, (_, index) => `body_${index + 1}`)
          },
          response: {
            ok: true
          }
        }
      }
    ]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '字段编辑器');
  const dialog = await openFieldsSettings(page);

  const importDialog = await openMokelayApiImport(page);
  await importDialog.getByTestId('datasource-import-mokelay-api').selectOption('many_available_fields_api');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  const availableBody = dialog.locator('.ce-fields-editor__section-body--available');
  await expect(availableBody).toBeVisible();
  await expect(dialog.getByTestId('fields-list-section')).toBeVisible();
  await expect(dialog.getByTestId('fields-add')).toBeVisible();
  await expect(dialog.getByTestId('fields-save')).toBeVisible();

  const availableScrollMetrics = await availableBody.evaluate((element) => ({
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight
  }));
  expect(availableScrollMetrics.scrollHeight).toBeGreaterThan(availableScrollMetrics.clientHeight);

  await dialog.getByTestId('fields-available-add-Header-1').click();
  await expect(dialog.getByTestId('fields-label-0')).toHaveValue('Header-1');
});
