import { Buffer } from 'node:buffer';
import { expect, test } from '@playwright/test';
import {
  addEditorTool,
  getSavedBlocks,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

function getDatasourceValue(blocks: Awaited<ReturnType<typeof getSavedBlocks>>) {
  return blocks.find((block) => block.type === 'MDatasourceEditor')?.data?.value;
}

const userSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    age: {
      type: 'number'
    },
    isStudent: {
      type: 'boolean'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

const userSchemaSelections = {
  list: {
    recordPath: 'tags',
    fields: [
      {
        path: 'tags[]',
        label: 'tags',
        type: 'string',
        required: false,
        enabled: true,
        componentHint: 'text'
      }
    ]
  },
  form: {
    fields: [
      {
        path: 'name',
        label: 'name',
        type: 'string',
        required: false,
        enabled: true,
        componentHint: 'text'
      },
      {
        path: 'age',
        label: 'age',
        type: 'number',
        required: false,
        enabled: true,
        componentHint: 'number'
      },
      {
        path: 'isStudent',
        label: 'isStudent',
        type: 'boolean',
        required: false,
        enabled: true,
        componentHint: 'switch'
      }
    ]
  }
};

test('adds a datasource editor with default JSON value and renders in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  await expect(page.getByTestId('editor-datasource-tool')).toBeVisible();
  await expect(page.getByTestId('datasource-json-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-raw-data')).toHaveValue('{}');
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData: {}
  });
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('datasource-raw-data')).toHaveValue('{}');
});

test('validates JSON input and only saves the last valid JSON value', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  await page.getByTestId('datasource-raw-data').fill('{ bad');
  await expect(page.getByTestId('datasource-json-error')).toBeVisible();

  await page.getByTestId('save-button').click();
  let datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData: {}
  });

  await page.getByTestId('datasource-raw-data').fill('{"users":[{"id":1,"active":true}],"empty":null}');
  await expect(page.getByTestId('datasource-json-error')).toHaveCount(0);

  await page.getByTestId('save-button').click();
  datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData: {
      users: [
        {
          id: 1,
          active: true
        }
      ],
      empty: null
    }
  });
});

test('parses JSON datasource data into JSON Schema and saves it', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const rawData = {
    name: 'Tom',
    age: 18,
    isStudent: true,
    tags: ['a', 'b']
  };

  await page.getByTestId('datasource-raw-data').fill(JSON.stringify(rawData));
  await page.getByTestId('datasource-json-schema-parse-button').click();

  await expect(page.getByTestId('datasource-schema-summary')).toContainText('字段数: 6');
  await expect(page.getByTestId('datasource-list-field-tags[]')).toBeVisible();
  await page.getByTestId('datasource-schema-tab-form').click();
  await expect(page.getByTestId('datasource-form-field-name')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-age')).toBeVisible();
  await page.getByTestId('datasource-schema-tab-advanced').click();
  await expect(page.getByTestId('datasource-json-schema')).toHaveValue(JSON.stringify(userSchema, null, 2));

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData,
    jsonSchema: userSchema,
    schemaSelections: userSchemaSelections
  });
});

test('edits JSON Schema manually and keeps the last valid saved value', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const manualSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'User name'
      }
    },
    required: ['name']
  };

  await page.getByTestId('datasource-schema-tab-advanced').click();
  await page.getByTestId('datasource-json-schema').fill(JSON.stringify(manualSchema));
  await expect(page.getByTestId('datasource-json-schema-error')).toHaveCount(0);

  await page.getByTestId('save-button').click();
  let datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData: {},
    jsonSchema: manualSchema,
    schemaSelections: {
      form: {
        fields: [
          {
            path: 'name',
            label: 'name',
            type: 'string',
            required: true,
            enabled: true,
            componentHint: 'text'
          }
        ]
      }
    }
  });

  await page.getByTestId('datasource-json-schema').fill('{ bad');
  await expect(page.getByTestId('datasource-json-schema-error')).toBeVisible();

  await page.getByTestId('save-button').click();
  datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData: {},
    jsonSchema: manualSchema,
    schemaSelections: {
      form: {
        fields: [
          {
            path: 'name',
            label: 'name',
            type: 'string',
            required: true,
            enabled: true,
            componentHint: 'text'
          }
        ]
      }
    }
  });

  await page.getByTestId('datasource-json-schema').fill('');
  await expect(page.getByTestId('datasource-json-schema-error')).toHaveCount(0);

  await page.getByTestId('save-button').click();
  datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData: {}
  });
});

test('selects list and form fields from generated Schema and saves friendly labels', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const rawData = {
    title: '用户列表',
    users: [
      {
        id: 1,
        name: 'Ada',
        active: true
      }
    ]
  };
  const schema = {
    type: 'object',
    properties: {
      title: {
        type: 'string'
      },
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
            },
            active: {
              type: 'boolean'
            }
          }
        }
      }
    }
  };

  await page.getByTestId('datasource-raw-data').fill(JSON.stringify(rawData));
  await page.getByTestId('datasource-json-schema-parse-button').click();

  await expect(page.getByTestId('datasource-list-record-path')).toHaveValue('users');
  await page.getByTestId('datasource-list-field-label-users[].name').fill('用户名');
  await page.getByTestId('datasource-list-field-enabled-users[].active').uncheck();

  await page.getByTestId('datasource-schema-tab-form').click();
  await page.getByTestId('datasource-form-field-label-title').fill('标题');

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'JSON',
    rawData,
    jsonSchema: schema,
    schemaSelections: {
      list: {
        recordPath: 'users',
        fields: [
          {
            path: 'users[].id',
            label: 'id',
            type: 'number',
            required: false,
            enabled: true,
            componentHint: 'number'
          },
          {
            path: 'users[].name',
            label: '用户名',
            type: 'string',
            required: false,
            enabled: true,
            componentHint: 'text'
          },
          {
            path: 'users[].active',
            label: 'active',
            type: 'boolean',
            required: false,
            enabled: false,
            componentHint: 'switch'
          }
        ]
      },
      form: {
        fields: [
          {
            path: 'title',
            label: '标题',
            type: 'string',
            required: false,
            enabled: true,
            componentHint: 'text'
          }
        ]
      }
    }
  });
});

test('edits API datasource lists and saves typed body mock values', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  await page.getByTestId('datasource-type-api').click();
  await expect(page.getByTestId('datasource-api-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-test-button')).toHaveCount(0);

  await page.getByTestId('datasource-domain').fill('https://api.mokelay.com');
  await page.getByTestId('datasource-path').fill('/v1/users');
  await page.getByTestId('datasource-method').selectOption('POST');

  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-0').fill('Authorization');
  await page.getByTestId('datasource-header-mock-0').fill('Bearer token');

  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-0').fill('search');
  await page.getByTestId('datasource-query-mock-0').fill('mokelay');
  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-1').fill('page');
  await page.getByTestId('datasource-query-mock-1').fill('1');
  await page.getByTestId('datasource-query-remove-0').click();

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('count');
  await page.getByTestId('datasource-body-type-0').selectOption('number');
  await page.getByTestId('datasource-body-mock-0').fill('42');

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-1').fill('filter');
  await page.getByTestId('datasource-body-type-1').selectOption('object');
  await page.getByTestId('datasource-body-mock-1').fill('{ bad');
  await expect(page.getByTestId('datasource-body-error-1')).toBeVisible();
  await page.getByTestId('datasource-body-mock-1').fill('{"active":true,"roles":["admin"]}');
  await expect(page.getByTestId('datasource-body-error-1')).toHaveCount(0);

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: 'https://api.mokelay.com',
    path: '/v1/users',
    method: 'POST',
    headerData: [
      {
        key: 'Authorization',
        mock: 'Bearer token'
      }
    ],
    bodyData: [
      {
        key: 'count',
        dataType: 'number',
        mock: 42
      },
      {
        key: 'filter',
        dataType: 'object',
        mock: {
          active: true,
          roles: ['admin']
        }
      }
    ],
    queryData: [
      {
        key: 'page',
        mock: '1'
      }
    ]
  });
});

test('imports API datasource from a Mokelay orchestration API', async ({ page }) => {
  await resetEditor(page, {
    apis: [
      {
        uuid: 'import_users',
        name: '用户导入 API',
        method: 'POST',
        status: 'published',
        apiJson: {
          uuid: 'import_users',
          alias: '用户导入 API',
          method: 'POST',
          request: {
            header: ['Authorization', { key: 'X-Tenant' }],
            query: ['page', { key: 'pageSize' }],
            body: [{ key: 'keyword' }, 'limit']
          },
          blocks: [],
          response: null
        }
      }
    ]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  await page.getByTestId('datasource-type-api').click();
  await expect(page.getByTestId('datasource-api-import-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-import-mokelay-api')).toContainText('用户导入 API');
  await page.getByTestId('datasource-import-mokelay-api').selectOption('import_users');
  await page.getByTestId('datasource-import-apply').click();

  await expect(page.getByTestId('datasource-domain')).toHaveValue('http://127.0.0.1:8787');
  await expect(page.getByTestId('datasource-path')).toHaveValue('/api/mokelay/import_users');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-header-key-0')).toHaveValue('Authorization');
  await expect(page.getByTestId('datasource-header-key-1')).toHaveValue('X-Tenant');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('page');
  await expect(page.getByTestId('datasource-query-key-1')).toHaveValue('pageSize');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('keyword');
  await expect(page.getByTestId('datasource-body-key-1')).toHaveValue('limit');

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: 'http://127.0.0.1:8787',
    path: '/api/mokelay/import_users',
    method: 'POST',
    headerData: [
      { key: 'Authorization', mock: '' },
      { key: 'X-Tenant', mock: '' }
    ],
    bodyData: [
      { key: 'keyword', dataType: 'string', mock: '' },
      { key: 'limit', dataType: 'string', mock: '' }
    ],
    queryData: [
      { key: 'page', mock: '' },
      { key: 'pageSize', mock: '' }
    ]
  });
});

test('imports API datasource from APIFox project and API ID', async ({ page }) => {
  await page.route('**/api/mokelay/list-apifox-projects**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          projects: [
            { id: 42, name: 'CRM 项目' }
          ],
          count: 1
        }
      })
    });
  });
  await page.route('**/api/mokelay/list-apifox-apis**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('projectId')).toBe('42');
    expect(url.searchParams.get('apiId')).toBe('91011');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          apis: [],
          count: 0,
          openapi: {
            openapi: '3.0.0',
            servers: [
              { url: 'https://api.example.com/v1' }
            ],
            paths: {
              '/users/search': {
                post: {
                  operationId: '91011',
                  summary: '搜索用户',
                  parameters: [
                    { name: 'token', in: 'query', schema: { type: 'string' }, example: 'abc' },
                    { name: 'X-Trace', in: 'header', schema: { type: 'string' }, example: 'trace-1' }
                  ],
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            keyword: { type: 'string', example: 'Ada' },
                            limit: { type: 'integer', default: 20 },
                            filters: {
                              type: 'object',
                              properties: {
                                active: { type: 'boolean' }
                              },
                              example: { active: true }
                            }
                          }
                        }
                      }
                    }
                  },
                  responses: {
                    200: {
                      description: 'OK',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              data: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    id: { type: 'string' },
                                    age: { type: 'integer' }
                                  },
                                  required: ['id']
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    });
  });

  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await page.getByTestId('datasource-type-api').click();
  await page.getByTestId('datasource-import-source').selectOption('apifox');
  await expect(page.getByTestId('datasource-import-apifox-project')).toContainText('CRM 项目');
  await page.getByTestId('datasource-import-apifox-project').selectOption('42');
  await page.getByTestId('datasource-import-apifox-api-id').fill('91011');
  await page.getByTestId('datasource-import-apply').click();

  await expect(page.getByTestId('datasource-domain')).toHaveValue('https://api.example.com');
  await expect(page.getByTestId('datasource-path')).toHaveValue('/v1/users/search');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-header-key-0')).toHaveValue('X-Trace');
  await expect(page.getByTestId('datasource-header-mock-0')).toHaveValue('trace-1');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('token');
  await expect(page.getByTestId('datasource-query-mock-0')).toHaveValue('abc');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('keyword');
  await expect(page.getByTestId('datasource-body-mock-0')).toHaveValue('Ada');
  await expect(page.getByTestId('datasource-body-key-1')).toHaveValue('limit');
  await expect(page.getByTestId('datasource-body-type-1')).toHaveValue('number');
  await expect(page.getByTestId('datasource-body-mock-1')).toHaveValue('20');
  await expect(page.getByTestId('datasource-body-key-2')).toHaveValue('filters');
  await expect(page.getByTestId('datasource-list-record-path')).toHaveValue('data');

  await page.getByTestId('datasource-schema-tab-advanced').click();
  const importedSchema = JSON.parse(await page.getByTestId('datasource-json-schema').inputValue()) as any;
  expect(importedSchema.properties.data.items.properties.age.type).toBe('number');

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: 'https://api.example.com',
    path: '/v1/users/search',
    method: 'POST',
    headerData: [
      { key: 'X-Trace', mock: 'trace-1' }
    ],
    bodyData: [
      { key: 'keyword', dataType: 'string', mock: 'Ada' },
      { key: 'limit', dataType: 'number', mock: 20 },
      { key: 'filters', dataType: 'object', mock: { active: true } }
    ],
    queryData: [
      { key: 'token', mock: 'abc' }
    ]
  });
  expect(datasourceValue.jsonSchema.properties.data.type).toBe('array');
});

test('imports APIFox grouped query parameters and request body parameters', async ({ page }) => {
  await page.route('**/api/mokelay/list-apifox-projects**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          projects: [
            { id: 'mokelay-project', name: 'Mokelay Project' }
          ],
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
          apis: [
            {
              path: '/config/load-page-data/{id}_{name}',
              method: 'POST',
              summary: '加载页面数据',
              operationId: null,
              parameters: {
                cookie: [
                  { name: 'v', in: 'cookie', required: false }
                ],
                header: [],
                path: [
                  { name: 'id', in: 'path', required: true }
                ],
                query: [
                  'alias',
                  'aaaa',
                  'nnnnn'
                ]
              },
              requestBodyParameters: [
                { contentType: 'multipart/form-data', name: 'ggggg', path: 'ggggg' },
                { contentType: 'multipart/form-data', name: 'bbbbbb', path: 'bbbbbb' }
              ],
              responses: {}
            }
          ],
          count: 1,
          openapi: null
        }
      })
    });
  });

  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await page.getByTestId('datasource-type-api').click();
  await page.getByTestId('datasource-import-source').selectOption('apifox');
  await page.getByTestId('datasource-import-apifox-project').selectOption('mokelay-project');
  await page.getByTestId('datasource-import-apifox-api-id').fill('217306455');
  await page.getByTestId('datasource-import-apply').click();

  await expect(page.getByTestId('datasource-path')).toHaveValue('/config/load-page-data/{id}_{name}');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('alias');
  await expect(page.getByTestId('datasource-query-key-1')).toHaveValue('aaaa');
  await expect(page.getByTestId('datasource-query-key-2')).toHaveValue('nnnnn');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('ggggg');
  await expect(page.getByTestId('datasource-body-key-1')).toHaveValue('bbbbbb');

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: '',
    path: '/config/load-page-data/{id}_{name}',
    method: 'POST',
    headerData: [],
    bodyData: [
      { key: 'ggggg', dataType: 'string', mock: '' },
      { key: 'bbbbbb', dataType: 'string', mock: '' }
    ],
    queryData: [
      { key: 'alias', mock: '' },
      { key: 'aaaa', mock: '' },
      { key: 'nnnnn', mock: '' }
    ]
  });
});

test('does not overwrite API datasource when APIFox method is unsupported', async ({ page }) => {
  await page.route('**/api/mokelay/list-apifox-projects**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          projects: [
            { id: 'project-delete', name: '删除接口项目' }
          ],
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
          openapi: {
            openapi: '3.0.0',
            servers: [
              { url: 'https://api.example.com' }
            ],
            paths: {
              '/users/{id}': {
                delete: {
                  operationId: 'delete-user',
                  responses: {
                    204: {
                      description: 'No content'
                    }
                  }
                }
              }
            }
          }
        }
      })
    });
  });

  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await page.getByTestId('datasource-type-api').click();
  await page.getByTestId('datasource-domain').fill('https://existing.example.com');
  await page.getByTestId('datasource-path').fill('/keep');
  await page.getByTestId('datasource-import-source').selectOption('apifox');
  await expect(page.getByTestId('datasource-import-apifox-project')).toContainText('删除接口项目');
  await page.getByTestId('datasource-import-apifox-api-id').fill('delete-user');
  await page.getByTestId('datasource-import-apply').click();

  await expect(page.getByTestId('datasource-import-error')).toContainText('GET/POST');
  await expect(page.getByTestId('datasource-domain')).toHaveValue('https://existing.example.com');
  await expect(page.getByTestId('datasource-path')).toHaveValue('/keep');
});

test('saves API datasource file body metadata without file content', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const fileBuffer = Buffer.from('hello file');

  await page.getByTestId('datasource-type-api').click();
  await page.getByTestId('datasource-method').selectOption('POST');
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('avatar');
  await page.getByTestId('datasource-body-type-0').selectOption('file');
  await page.getByTestId('datasource-body-mock-0').setInputFiles({
    name: 'avatar.txt',
    mimeType: 'text/plain',
    buffer: fileBuffer
  });

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: '',
    path: '',
    method: 'POST',
    headerData: [],
    bodyData: [
      {
        key: 'avatar',
        dataType: 'file',
        mock: {
          name: 'avatar.txt',
          size: fileBuffer.length,
          type: 'text/plain'
        }
      }
    ],
    queryData: []
  });

  await page.getByTestId('preview-button').click();
  await expect(
    page.getByTestId('preview-block-MDatasourceEditor').getByTestId('datasource-body-mock-0')
  ).toHaveValue('avatar.txt');
});

test('parses API datasource response into JSON Schema and saves it', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const apiSchema = {
    type: 'object',
    properties: {
      ok: {
        type: 'boolean'
      },
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
            },
            active: {
              type: 'boolean'
            }
          }
        }
      }
    }
  };

  await page.route('**/datasource-schema**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        users: [
          {
            id: 1,
            name: 'Ada',
            active: true
          }
        ]
      })
    });
  });

  await page.getByTestId('datasource-type-api').click();
  const origin = await page.evaluate(() => window.location.origin);
  await page.getByTestId('datasource-domain').fill(origin);
  await page.getByTestId('datasource-path').fill('/datasource-schema');
  await page.getByTestId('datasource-method').selectOption('POST');

  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-0').fill('X-Schema');
  await page.getByTestId('datasource-header-mock-0').fill('demo-schema');

  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-0').fill('token');
  await page.getByTestId('datasource-query-mock-0').fill('abc');

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('name');
  await page.getByTestId('datasource-body-mock-0').fill('Ada');
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-1').fill('count');
  await page.getByTestId('datasource-body-type-1').selectOption('number');
  await page.getByTestId('datasource-body-mock-1').fill('2');

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/datasource-schema') && request.method() === 'POST'
  );
  await page.getByTestId('datasource-json-schema-parse-button').click();
  const request = await requestPromise;

  expect(request.url()).toContain('token=abc');
  expect(request.headers()['x-schema']).toBe('demo-schema');
  expect(request.headers()['content-type']).toContain('application/json');
  expect(request.postDataJSON()).toEqual({
    name: 'Ada',
    count: 2
  });
  await expect(page.getByTestId('datasource-list-record-path')).toHaveValue('users');
  await expect(page.getByTestId('datasource-list-field-users[].id')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-users[].name')).toBeVisible();
  await page.getByTestId('datasource-schema-tab-form').click();
  await expect(page.getByTestId('datasource-form-field-ok')).toBeVisible();
  await page.getByTestId('datasource-schema-tab-advanced').click();
  await expect(page.getByTestId('datasource-json-schema')).toHaveValue(JSON.stringify(apiSchema, null, 2));

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: origin,
    path: '/datasource-schema',
    method: 'POST',
    headerData: [
      {
        key: 'X-Schema',
        mock: 'demo-schema'
      }
    ],
    bodyData: [
      {
        key: 'name',
        dataType: 'string',
        mock: 'Ada'
      },
      {
        key: 'count',
        dataType: 'number',
        mock: 2
      }
    ],
    queryData: [
      {
        key: 'token',
        mock: 'abc'
      }
    ],
    jsonSchema: apiSchema,
    schemaSelections: {
      list: {
        recordPath: 'users',
        fields: [
          {
            path: 'users[].id',
            label: 'id',
            type: 'number',
            required: false,
            enabled: true,
            componentHint: 'number'
          },
          {
            path: 'users[].name',
            label: 'name',
            type: 'string',
            required: false,
            enabled: true,
            componentHint: 'text'
          },
          {
            path: 'users[].active',
            label: 'active',
            type: 'boolean',
            required: false,
            enabled: true,
            componentHint: 'switch'
          }
        ]
      },
      form: {
        fields: [
          {
            path: 'ok',
            label: 'ok',
            type: 'boolean',
            required: false,
            enabled: true,
            componentHint: 'switch'
          }
        ]
      }
    }
  });
});

test('uploads API datasource file body params as multipart form data', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const fileBuffer = Buffer.from('hello multipart');
  const apiSchema = {
    type: 'object',
    properties: {
      ok: {
        type: 'boolean'
      }
    }
  };

  await page.route('**/datasource-upload**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true
      })
    });
  });

  await page.getByTestId('datasource-type-api').click();
  const origin = await page.evaluate(() => window.location.origin);
  await page.getByTestId('datasource-domain').fill(origin);
  await page.getByTestId('datasource-path').fill('/datasource-upload');
  await page.getByTestId('datasource-method').selectOption('POST');

  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-0').fill('Content-Type');
  await page.getByTestId('datasource-header-mock-0').fill('application/json');
  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-1').fill('X-Demo');
  await page.getByTestId('datasource-header-mock-1').fill('multipart-demo');

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('avatar');
  await page.getByTestId('datasource-body-type-0').selectOption('file');
  await page.getByTestId('datasource-body-mock-0').setInputFiles({
    name: 'avatar.txt',
    mimeType: 'text/plain',
    buffer: fileBuffer
  });
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-1').fill('count');
  await page.getByTestId('datasource-body-type-1').selectOption('number');
  await page.getByTestId('datasource-body-mock-1').fill('2');

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/datasource-upload') && request.method() === 'POST'
  );
  await page.getByTestId('datasource-json-schema-parse-button').click();
  const request = await requestPromise;

  const contentType = request.headers()['content-type'] ?? '';
  const postData = request.postData() ?? '';
  expect(contentType).toContain('multipart/form-data');
  expect(contentType).not.toContain('application/json');
  expect(request.headers()['x-demo']).toBe('multipart-demo');
  expect(postData).toContain('name="avatar"');
  expect(postData).toContain('filename="avatar.txt"');
  expect(postData).toContain('hello multipart');
  expect(postData).toContain('name="count"');
  expect(postData).toContain('2');
  await page.getByTestId('datasource-schema-tab-advanced').click();
  await expect(page.getByTestId('datasource-json-schema')).toHaveValue(JSON.stringify(apiSchema, null, 2));
});

test('requires selecting a file before generating API datasource schema', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  let requestCount = 0;
  await page.route('**/datasource-missing-file**', async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true
      })
    });
  });

  await page.getByTestId('datasource-type-api').click();
  const origin = await page.evaluate(() => window.location.origin);
  await page.getByTestId('datasource-domain').fill(origin);
  await page.getByTestId('datasource-path').fill('/datasource-missing-file');
  await page.getByTestId('datasource-method').selectOption('POST');
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('avatar');
  await page.getByTestId('datasource-body-type-0').selectOption('file');

  await page.getByTestId('datasource-json-schema-parse-button').click();

  await expect(page.getByTestId('datasource-body-error-0')).toContainText('请选择 Body 中的文件。');
  await expect(page.getByTestId('datasource-json-schema-error')).toContainText('请先修正 Body 中的 Mock 数据。');
  expect(requestCount).toBe(0);
});

test('parses API datasource response with mixed array item fields into anyOf JSON Schema', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const responseData = {
    pages: [
      {
        uuid: 'dd25d0d0-fd35-4c0b-aa03-ae1616a4cace',
        name: '2026-05-06 21:41:45',
        blocks: [
          {
            id: 'KmK-h6kFOc',
            data: {
              value: '这是MInput',
              placeholder: '请输入.....'
            },
            type: 'MInput'
          },
          {
            id: 'mJWSCo2398',
            data: {
              value: [
                {
                  id: 'ada07f6c-5',
                  data: {
                    text: '这是MAdvanceInput '
                  },
                  type: 'paragraph'
                },
                {
                  id: '57cac635-d',
                  data: {
                    size: '',
                    type: 'warning',
                    color: '',
                    tagName: '警告',
                    closable: false
                  },
                  type: 'MTag'
                }
              ]
            },
            type: 'MAdvanceInput'
          },
          {
            id: '3SJpF3qjCu',
            data: {
              data: [
                {
                  tag: '设计',
                  name: 'Mokelay 页面'
                }
              ],
              columns: [
                {
                  fixed: 'left',
                  width: 180,
                  columnName: '名称',
                  columnContent: [
                    {
                      id: 'advance-table-default-name',
                      data: {
                        text: '{{name}}'
                      },
                      type: 'paragraph'
                    }
                  ]
                },
                {
                  fixed: null,
                  width: 140,
                  columnName: '状态',
                  columnContent: [
                    {
                      id: 'advance-table-default-status',
                      data: {
                        text: '{{status}}'
                      },
                      type: 'paragraph'
                    }
                  ]
                }
              ],
              index: false,
              selection: false
            },
            type: 'MAdvanceTable'
          },
          {
            id: 'lJ6KJk0kmD',
            data: {
              value: {
                id: 'ISSX3dI71S',
                data: {
                  value: '',
                  placeholder: '这是MEditorSelect组件'
                },
                type: 'MInput'
              }
            },
            type: 'MEditorSelector'
          }
        ],
        created_at: '2026-05-06T13:41:48.823Z',
        updated_at: '2026-05-06T13:41:48.823Z'
      },
      {
        uuid: '98c51555-00c4-47f3-bcf1-981face6dfaa',
        name: '2026-05-06 21:02:59',
        blocks: [
          {
            id: 'p6HEXcEOc9',
            data: {
              value: '这是MInput',
              placeholder: '请输入.....'
            },
            type: 'MInput'
          }
        ],
        created_at: '2026-05-06T13:03:03.961Z',
        updated_at: '2026-05-06T13:03:03.961Z'
      }
    ],
    pagination: {
      page: 2,
      pageSize: 2,
      total: 4,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false
    }
  };

  await page.route('**/api/mokelay/list_pages**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });

  await page.getByTestId('datasource-type-api').click();
  const origin = await page.evaluate(() => window.location.origin);
  await page.getByTestId('datasource-domain').fill(origin);
  await page.getByTestId('datasource-path').fill('/api/mokelay/list_pages');

  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-0').fill('pageSize');
  await page.getByTestId('datasource-query-mock-0').fill('2');
  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-1').fill('page');
  await page.getByTestId('datasource-query-mock-1').fill('2');

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/api/mokelay/list_pages') && request.method() === 'GET'
  );
  await page.getByTestId('datasource-json-schema-parse-button').click();
  const request = await requestPromise;

  expect(request.url()).toContain('pageSize=2');
  expect(request.url()).toContain('page=2');
  await expect(page.getByTestId('datasource-json-schema-error')).toHaveCount(0);
  await expect(page.getByTestId('datasource-list-record-path')).toHaveValue('pages');
  await expect(page.getByTestId('datasource-list-field-pages[].uuid')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-pages[].name')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-pages[].created_at')).toBeVisible();

  await page.getByTestId('datasource-schema-tab-advanced').click();
  const generatedSchema = JSON.parse(await page.getByTestId('datasource-json-schema').inputValue()) as any;
  const valueAnyOf = generatedSchema.properties.pages.items.properties.blocks.items.properties.data.properties.value.anyOf;
  const fixedAnyOf = generatedSchema.properties.pages.items.properties.blocks.items.properties.data.properties.columns.items.properties.fixed.anyOf;

  expect(valueAnyOf.map((item: { type: string }) => item.type)).toEqual(['string', 'array', 'object']);
  expect(fixedAnyOf.map((item: { type: string }) => item.type)).toEqual(['string', 'null']);
});

test('parses API datasource response with empty arrays into JSON Schema', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const responseData = {
    type: 'API',
    domain: 'https://api.mokelay.com',
    path: '/api/me',
    method: 'GET',
    headerData: [],
    bodyData: [],
    queryData: [
      {
        key: 'debug',
        mock: 'true'
      }
    ]
  };
  const expectedSchema = {
    type: 'object',
    properties: {
      type: {
        type: 'string'
      },
      domain: {
        type: 'string'
      },
      path: {
        type: 'string'
      },
      method: {
        type: 'string'
      },
      headerData: {
        type: 'array',
        items: {
          type: 'object',
          properties: {}
        }
      },
      bodyData: {
        type: 'array',
        items: {
          type: 'object',
          properties: {}
        }
      },
      queryData: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string'
            },
            mock: {
              type: 'string'
            }
          }
        }
      }
    }
  };

  await page.route('**/datasource-api-config**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });

  await page.getByTestId('datasource-type-api').click();
  const origin = await page.evaluate(() => window.location.origin);
  await page.getByTestId('datasource-domain').fill(origin);
  await page.getByTestId('datasource-path').fill('/datasource-api-config');

  await page.getByTestId('datasource-json-schema-parse-button').click();

  await expect(page.getByTestId('datasource-json-schema-error')).toHaveCount(0);
  await expect(page.getByTestId('datasource-list-record-path')).toHaveValue('queryData');
  await expect(page.getByTestId('datasource-list-field-queryData[].key')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-queryData[].mock')).toBeVisible();

  await page.getByTestId('datasource-schema-tab-advanced').click();
  await expect(page.getByTestId('datasource-json-schema')).toHaveValue(JSON.stringify(expectedSchema, null, 2));
});

test('loads saved JSON datasource in editor and preview', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-json-seeded',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'JSON',
            rawData: {
              users: [
                {
                  id: 1,
                  active: true
                }
              ]
            }
          }
        }
      }
    ]
  });

  await expect(page.getByTestId('editor-datasource-tool')).toBeVisible();
  await expect(page.getByTestId('datasource-raw-data')).toHaveValue(JSON.stringify({
    users: [
      {
        id: 1,
        active: true
      }
    ]
  }, null, 2));

  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('datasource-raw-data')).toHaveAttribute('readonly', '');
  expect(pageErrors).toEqual([]);
});

test('loads saved API datasource in editor and preview', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-api-seeded',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'https://api.mokelay.com',
            path: '/v1/users',
            method: 'GET',
            headerData: [
              {
                key: 'Authorization',
                mock: 'Bearer token'
              }
            ],
            bodyData: [
              {
                key: 'limit',
                dataType: 'number',
                mock: 20
              },
              {
                key: 'ids',
                dataType: 'array',
                mock: [1, 2, 3]
              }
            ],
            queryData: [
              {
                key: 'page',
                mock: '1'
              }
            ]
          }
        }
      }
    ]
  });

  await expect(page.getByTestId('editor-datasource-tool')).toBeVisible();
  await expect(page.getByTestId('datasource-api-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-domain')).toHaveValue('https://api.mokelay.com');
  await expect(page.getByTestId('datasource-header-key-0')).toHaveValue('Authorization');
  await expect(page.getByTestId('datasource-body-mock-0')).toHaveValue('20');
  await expect(page.getByTestId('datasource-body-mock-1')).toHaveValue(JSON.stringify([1, 2, 3], null, 2));

  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('datasource-header-add')).toHaveCount(0);
  await expect(page.getByTestId('datasource-body-remove-0')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
