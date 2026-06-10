import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

test('opens the datasource list from navigation and shows schema status', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/',
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
  await expect(page.getByTestId('datasource-list-panel')).toBeVisible();
  await expect(page.getByRole('row', { name: /Analytics/ })).toContainText(/2 张表|2 tables/);
});

test('creates and edits a datasource', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/#/datasources'
  });

  const createRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/create_datasource'
  );
  await page.getByTestId('create-datasource-button').click();
  await page.getByTestId('datasource-uuid').fill('analytic');
  await page.getByTestId('datasource-alias').fill('  Analytics  ');
  await page.getByTestId('datasource-description').fill('  Reporting database  ');
  await page.getByTestId('datasource-submit').click();

  expect((await createRequestPromise).postDataJSON()).toEqual({
    uuid: 'analytic',
    alias: 'Analytics',
    description: 'Reporting database'
  });
  await expect(page.getByRole('row', { name: /Analytics/ })).toContainText(/未同步|Not synced/);

  const updateRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST'
      && new URL(request.url()).pathname === '/api/mokelay/update_datasource_by_uuid'
  );
  await page.getByTestId('edit-datasource-button-analytic').click();
  await expect(page.getByTestId('datasource-uuid')).toHaveValue('analytic');
  await expect(page.getByTestId('datasource-uuid')).toBeDisabled();
  await expect(page.getByTestId('datasource-alias')).toHaveValue('Analytics');
  await page.getByTestId('datasource-alias').fill('Analytics Primary');
  await page.getByTestId('datasource-description').fill('Primary reporting database');
  await page.getByTestId('datasource-submit').click();

  const updateRequest = await updateRequestPromise;
  expect(new URL(updateRequest.url()).searchParams.get('uuid')).toBe('analytic');
  expect(updateRequest.postDataJSON()).toEqual({
    alias: 'Analytics Primary',
    description: 'Primary reporting database'
  });
  await expect(page.getByRole('row', { name: /Analytics Primary/ })).toContainText('Primary reporting database');
  expect(apiState.datasources.get('analytic')).toMatchObject({ alias: 'Analytics Primary' });
});

test('requires a datasource UUID with at most eight characters', async ({ page }) => {
  await resetEditor(page, { initialRoute: '/#/datasources' });
  await page.getByTestId('create-datasource-button').click();

  const uuidInput = page.getByTestId('datasource-uuid');
  await expect(uuidInput).toHaveCSS('border-top-width', '1px');
  await expect(page.getByTestId('datasource-alias')).toHaveCSS('border-top-color', 'rgb(203, 213, 225)');
  await expect(page.getByTestId('datasource-description')).toHaveCSS('border-top-width', '1px');
  await expect(uuidInput).toHaveAttribute('required', '');
  await expect(uuidInput).toHaveAttribute('maxlength', '8');

  await uuidInput.fill('1invalid');
  await page.getByTestId('datasource-alias').fill('Invalid UUID');
  await page.getByTestId('datasource-submit').click();
  await expect(page.getByTestId('datasource-form-error')).toContainText(/字母或下划线|letter or underscore/);
});

test('syncs datasource schema and keeps the old status on failure', async ({ page }) => {
  const datasource = {
    id: 1,
    uuid: 'b1c2d3e4',
    alias: 'Operations',
    description: '',
    schema_data: []
  };
  await resetEditor(page, {
    initialRoute: '/#/datasources',
    datasources: [datasource],
    syncedDatasourceSchemas: {
      b1c2d3e4: [
        { name: 'jobs', columns: [{ name: 'id', type: 'bigint', dataType: 'bigint' }] }
      ]
    }
  });

  const syncRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/mokelay/sync_datasource_schema'
  );
  await page.getByTestId('sync-datasource-button-b1c2d3e4').click();

  const syncRequest = await syncRequestPromise;
  expect(new URL(syncRequest.url()).searchParams.get('uuid')).toBe('b1c2d3e4');
  await expect(page.getByRole('row', { name: /Operations/ })).toContainText(/1 张表|1 table/);

  await resetEditor(page, {
    initialRoute: '/#/datasources',
    datasources: [datasource],
    datasourceSyncErrors: ['b1c2d3e4']
  });
  await page.getByTestId('sync-datasource-button-b1c2d3e4').click();
  await expect(page.getByTestId('datasource-list-error')).toContainText('b1c2d3e4_DATABASE_URL');
  await expect(page.getByRole('row', { name: /Operations/ })).toContainText(/未同步|Not synced/);
});

test('paginates datasource records', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/datasources',
    datasources: Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      uuid: `c${String(index + 1).padStart(7, '0')}`,
      alias: `Datasource ${index + 1}`,
      description: '',
      schema_data: []
    }))
  });

  await expect(page.getByRole('row', { name: /Datasource 11/ })).toBeVisible();
  await expect(page.getByTestId('datasource-list-next-button')).toBeEnabled();
  await page.getByTestId('datasource-list-next-button').click();
  await expect(page.getByRole('row', { name: /Datasource 1/ })).toBeVisible();
  await expect(page.getByTestId('datasource-list-prev-button')).toBeEnabled();
  await expect(page.getByTestId('datasource-list-next-button')).toBeDisabled();
});
