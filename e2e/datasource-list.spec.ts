import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  resetEditor,
  type MockMokelayLayout,
  type MockMokelayPage
} from './helpers/editor';

const serverRoot = resolve(process.cwd(), '../mokelay-server/server/assets');
const datasourcePageUuids = [
  'datasources',
  'mokelay_datasource_create_page',
  'mokelay_datasource_edit_page',
  'mokelay_datasource_schema_details_page'
];

function readJsonAsset<T>(assetPath: string): T {
  return JSON.parse(readFileSync(resolve(serverRoot, assetPath), 'utf8')) as T;
}

function readSystemPage(uuid: string): MockMokelayPage {
  return readJsonAsset<MockMokelayPage>(`mokelay-pages/${uuid}.json`);
}

function readSystemLayout(uuid: string): MockMokelayLayout {
  const layoutJson = readJsonAsset<Record<string, unknown>>(`mokelay-layouts/${uuid}.json`);
  return {
    uuid,
    name: typeof layoutJson.name === 'string' ? layoutJson.name : uuid,
    layoutJson,
    createdAt: typeof layoutJson.createdAt === 'string' ? layoutJson.createdAt : undefined,
    updatedAt: typeof layoutJson.updatedAt === 'string' ? layoutJson.updatedAt : undefined
  };
}

function datasourceSystemOptions() {
  return {
    systemPages: datasourcePageUuids.map(readSystemPage),
    systemLayouts: [readSystemLayout('mokelay_layout')],
    seedDefaultPage: false
  };
}

test('opens datasource management as a Page DSL route from navigation', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/',
    ...datasourceSystemOptions(),
    datasources: [
      {
        id: 1,
        uuid: 'a1b2c3d4',
        alias: 'Analytics',
        description: 'Reporting database',
        schema_data: [
          { name: 'orders', columns: [{ name: 'id', type: 'integer', dataType: 'integer' }] },
          { name: 'users', columns: [{ name: 'uuid', type: 'uuid', dataType: 'uuid' }] }
        ]
      }
    ]
  });

  await page.getByRole('link', { name: /数据源|Datasources/ }).click();

  await expect(page).toHaveURL(/#\/datasources$/);
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByRole('heading', { name: '数据源管理' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Analytics/ })).toContainText('2 张表');
});

test('creates and edits a datasource through DSL actions', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/#/datasources',
    ...datasourceSystemOptions()
  });

  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_datasource'
  );
  await page.getByTestId('m-action-toolbar-action-create').click();
  const createDialog = page.getByTestId('action-dialog');
  await expect(createDialog).toContainText('创建数据源');
  const generatedUuid = await createDialog.getByTestId('mokelay-datasource-create-uuid-input').inputValue();
  expect(generatedUuid).toMatch(/^ds_[a-z0-9]{5}$/);
  await createDialog.getByTestId('mokelay-datasource-create-alias-input').fill('  Analytics  ');
  await createDialog.getByTestId('mokelay-datasource-create-description-input').fill('  Reporting database  ');
  await createDialog.getByRole('button', { name: '保存数据源' }).click();

  expect((await createRequestPromise).postDataJSON()).toEqual({
    uuid: generatedUuid,
    alias: 'Analytics',
    description: 'Reporting database'
  });
  await expect(createDialog).toHaveCount(0);
  await expect(page.getByRole('row', { name: /Analytics/ })).toBeVisible();

  const updateRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST'
      && new URL(request.url()).pathname === '/api/mokelay/update_datasource_by_uuid'
  );
  await page.getByRole('row', { name: /Analytics/ }).getByRole('button', { name: '编辑' }).click();
  const editDialog = page.getByTestId('action-dialog');
  await expect(editDialog).toContainText('编辑数据源');
  await expect(editDialog.getByTestId('mokelay-datasource-edit-alias-input')).toHaveValue('Analytics');
  await editDialog.getByTestId('mokelay-datasource-edit-alias-input').fill('Analytics Primary');
  await editDialog.getByTestId('mokelay-datasource-edit-description-input').fill('Primary reporting database');
  await editDialog.getByRole('button', { name: '保存数据源' }).click();

  const updateRequest = await updateRequestPromise;
  expect(new URL(updateRequest.url()).searchParams.get('uuid')).toBe(generatedUuid);
  expect(updateRequest.postDataJSON()).toEqual({
    alias: 'Analytics Primary',
    description: 'Primary reporting database'
  });
  await expect(editDialog).toHaveCount(0);
  await expect(page.getByRole('row', { name: /Analytics Primary/ })).toContainText('Primary reporting database');
  expect(apiState.datasources.get(generatedUuid)).toMatchObject({ alias: 'Analytics Primary' });
});

test('requires a datasource name when creating a datasource', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/datasources',
    ...datasourceSystemOptions()
  });
  let createRequestCount = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_datasource') {
      createRequestCount += 1;
    }
  });

  await page.getByTestId('m-action-toolbar-action-create').click();
  const createDialog = page.getByTestId('action-dialog');
  await expect(createDialog.getByTestId('mokelay-datasource-create-alias-input')).toHaveAttribute('required', '');
  await createDialog.getByTestId('mokelay-datasource-create-description-input').fill('Description without name');
  await createDialog.getByRole('button', { name: '保存数据源' }).click();

  await page.waitForTimeout(250);
  expect(createRequestCount).toBe(0);
  await expect(createDialog).toBeVisible();
});

test('syncs datasource schema and opens schema details through DSL actions', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/datasources',
    ...datasourceSystemOptions(),
    datasources: [
      {
        id: 1,
        uuid: 'b1c2d3e4',
        alias: 'Operations',
        description: '',
        schema_data: []
      }
    ],
    syncedDatasourceSchemas: {
      b1c2d3e4: [
        { name: 'jobs', columns: [{ name: 'id', type: 'bigint', dataType: 'bigint' }] }
      ]
    }
  });

  const syncRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/sync_datasource_schema'
  );
  await page.getByRole('row', { name: /Operations/ }).getByRole('button', { name: '同步' }).click();

  const syncRequest = await syncRequestPromise;
  expect(new URL(syncRequest.url()).searchParams.get('uuid')).toBe('b1c2d3e4');
  await page.getByRole('row', { name: /Operations/ }).getByRole('button', { name: '详情' }).click();

  const schemaDialog = page.getByTestId('action-dialog');
  await expect(schemaDialog).toContainText('Schema 详情');
  await expect(schemaDialog.getByTestId('record-list')).toContainText('Operations / b1c2d3e4');
  await expect(schemaDialog.getByTestId('record-list')).toContainText('共 1 项');
  await expect(schemaDialog.getByTestId('record-list')).toContainText('jobs');
  await expect(schemaDialog.getByTestId('record-list')).toContainText('字段');
  await expect(schemaDialog.getByTestId('record-list')).toContainText('id');
  await expect(schemaDialog.getByTestId('record-list')).toContainText('bigint');
  await expect(schemaDialog.getByTestId('record-list')).not.toContainText('[{"name"');
  await expect(schemaDialog.getByTestId('record-list')).not.toContainText('"columns"');
});

test('paginates datasource records in the DSL table', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/datasources',
    ...datasourceSystemOptions(),
    datasources: Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      uuid: `c${String(index + 1).padStart(7, '0')}`,
      alias: `Datasource ${index + 1}`,
      description: '',
      schema_data: []
    }))
  });

  await expect(page.getByRole('row', { name: /Datasource 11/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('row', { name: /Datasource 1/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
});
