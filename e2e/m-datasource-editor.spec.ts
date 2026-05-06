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
