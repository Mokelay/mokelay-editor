import { Buffer } from 'node:buffer';
import { expect, test, type Page } from '@playwright/test';
import {
  addEditorTool,
  expectToolToolbarBeside,
  getSavedBlocks,
  resetEditor,
  seedSavedConfig,
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

function getDatasourceValue(blocks: Awaited<ReturnType<typeof getSavedBlocks>>) {
  return blocks.find((block) => block.type === 'MDatasourceEditor')?.data?.value;
}

async function openDatasourceSettings(page: Page, index = 0) {
  await page.getByTestId('datasource-settings-open').nth(index).click();
  const dialog = page.locator('[data-testid="datasource-settings-dialog"][open]').last();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('datasource-api-panel')).toBeVisible();
  return dialog;
}

async function closeDatasourceSettings(page: Page) {
  const dialog = page.locator('[data-testid="datasource-settings-dialog"][open]');
  if (await dialog.count()) {
    await dialog.last().getByTestId('datasource-settings-close').click();
    await expect(dialog).toHaveCount(0);
  }
}

async function openMokelayApiImport(page: Page) {
  if (!await page.getByTestId('datasource-import-open-mokelay').isVisible()) {
    await openDatasourceSettings(page);
  }
  await page.getByTestId('datasource-import-open-mokelay').click();
  const dialog = page.getByTestId('datasource-api-import-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('datasource-api-import-dialog-title')).toContainText('Mokelay');
  return dialog;
}

async function openApifoxApiImport(page: Page) {
  if (!await page.getByTestId('datasource-import-open-apifox').isVisible()) {
    await openDatasourceSettings(page);
  }
  await page.getByTestId('datasource-import-open-apifox').click();
  const dialog = page.getByTestId('datasource-api-import-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('datasource-api-import-dialog-title')).toContainText('APIFox');
  return dialog;
}

async function openFullSchema(page: Page, index = 0) {
  const testId = index === 0 ? 'datasource-full-schema-open' : `datasource-full-schema-open-${index}`;
  if (!await page.getByTestId(testId).isVisible()) {
    await openDatasourceSettings(page);
  }
  await page.getByTestId(testId).click();
  const dialog = page.getByTestId('datasource-full-schema-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('datasource-full-schema-dialog-title')).toHaveText('完整 Schema');
  return dialog;
}

async function closeFullSchema(dialog: ReturnType<Page['getByTestId']>) {
  await dialog.getByTestId('datasource-full-schema-close').click();
  await expect(dialog).not.toBeVisible();
}

async function setSchemaPathDepth(page: Page, depth: number) {
  await page.getByTestId('datasource-schema-path-depth').fill(String(depth));
}

async function addResponseExampleCard(page: Page) {
  if (!await page.getByTestId('datasource-response-example-add').isVisible()) {
    await openDatasourceSettings(page);
  }
  await page.getByTestId('datasource-response-example-add').click();
  await expect(page.getByTestId('datasource-response-example')).toBeVisible();
}

async function openFieldPreview(page: Page, path: string) {
  if (!await page.getByTestId(`datasource-selected-field-preview-${path}`).isVisible()) {
    await openDatasourceSettings(page);
  }
  await page.getByTestId(`datasource-selected-field-preview-${path}`).click();
  const dialog = page.getByTestId('datasource-processor-preview-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('datasource-processor-preview-title')).toHaveText('字段数据预览');
  return dialog;
}

async function closeFieldPreview(dialog: ReturnType<Page['getByTestId']>) {
  await dialog.getByTestId('datasource-processor-preview-close').click();
  await expect(dialog).not.toBeVisible();
}

test('adds a datasource editor with default API value and renders in preview', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  await expect(page.getByTestId('editor-datasource-tool')).toBeVisible();
  await expect(page.getByTestId('datasource-settings-open')).toHaveText('数据源设置');
  await expect(page.getByTestId('datasource-summary')).toContainText('API');
  await expect(page.getByTestId('datasource-summary')).toContainText('mokelay');
  await expect(page.getByTestId('datasource-summary')).toContainText('未设置 Path');
  await expect(page.getByTestId('datasource-summary')).toContainText('GET');
  await expect(page.getByTestId('datasource-api-panel')).not.toBeVisible();
  await expectToolToolbarBeside(page, 'editor-datasource-tool');

  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-api-panel')).toBeVisible();
  await expect(page.locator('.ce-datasource-tool__type-button')).toHaveCount(0);
  await expect(page.getByTestId('datasource-type-api')).toHaveCount(0);
  await expect(page.getByTestId('datasource-type-json')).toHaveCount(0);
  await expect(page.getByTestId('datasource-json-panel')).toHaveCount(0);
  await expect(page.getByTestId('datasource-raw-data')).toHaveCount(0);
  await expect(page.getByTestId('datasource-import-config')).toContainText('导入 API 信息');
  await expect(page.getByTestId('datasource-request-config')).toContainText('请求配置');
  await expect(page.getByTestId('datasource-response-config')).toContainText('响应配置');
  await expect(page.getByTestId('datasource-response-example-add')).toHaveText('添加响应数据');
  await expect(page.getByTestId('datasource-json-schema-parse-button')).toHaveCount(0);
  await expect(page.getByTestId('datasource-response-schema-select-button')).toHaveCount(0);
  await expect(page.getByTestId('datasource-full-schema-open')).toHaveCount(0);
  await expect(page.getByTestId('datasource-response-example-item-0')).toHaveCount(0);
  await expect(page.getByTestId('datasource-selected-fields-empty')).toHaveText('暂无已选择字段。');
  await expect(page.getByTestId('datasource-response-example')).toHaveCount(0);
  const importConfigBox = await page.getByTestId('datasource-import-config').boundingBox();
  const requestConfigBox = await page.getByTestId('datasource-request-config').boundingBox();
  const responseConfigBox = await page.getByTestId('datasource-response-config').boundingBox();
  expect(importConfigBox).not.toBeNull();
  expect(requestConfigBox).not.toBeNull();
  expect(responseConfigBox).not.toBeNull();
  expect(importConfigBox!.y).toBeLessThan(requestConfigBox!.y);
  expect(requestConfigBox!.y).toBeLessThan(responseConfigBox!.y);
  const availableFieldsBox = await page.getByTestId('datasource-fields-schema-panel').boundingBox();
  const selectedFieldsBox = await page.getByTestId('datasource-selected-fields').boundingBox();
  expect(availableFieldsBox).not.toBeNull();
  expect(selectedFieldsBox).not.toBeNull();
  expect(availableFieldsBox!.y).toBeLessThan(selectedFieldsBox!.y);
  await expect(page.getByTestId('datasource-path')).toHaveValue('');
  await expect(page.getByTestId('datasource-method')).toHaveValue('GET');
  await expect(page.locator('.ce-block')).toHaveCount(2);

  await closeDatasourceSettings(page);
  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: 'mokelay',
    path: '',
    method: 'GET',
    headerData: [],
    bodyData: [],
    queryData: []
  });
  await closeDatasourceSettings(page);
  await page.getByTestId('preview-button').click();

  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('datasource-settings-open')).toHaveCount(0);
});

test('derives a read-only Schema without saving response examples or Schema', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await addResponseExampleCard(page);

  await page.getByTestId('datasource-response-example').fill('{"name":"Ada"}');
  await page.getByTestId('datasource-response-schema-select-button').click();

  const fullSchemaDialog = await openFullSchema(page);
  const schemaInput = fullSchemaDialog.getByTestId('datasource-json-schema');
  await expect(schemaInput).toHaveAttribute('readonly', '');
  const schema = JSON.parse(await schemaInput.inputValue()) as any;
  expect(schema.properties.name.type).toBe('string');
  await closeFullSchema(fullSchemaDialog);

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  expect(getDatasourceValue(await getSavedBlocks(page))).toEqual({
    type: 'API',
    domain: 'mokelay',
    path: '',
    method: 'GET',
    headerData: [],
    bodyData: [],
    queryData: []
  });
});

test('keeps only selected paths that exist when switching response Schema', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await addResponseExampleCard(page);

  const firstResponseExample = {
    profile: {
      name: 'Ada'
    },
    shared: 'first'
  };
  const responseExampleInput = page.getByTestId('datasource-response-example');

  await responseExampleInput.fill(JSON.stringify(firstResponseExample));
  await expect(page.getByTestId('datasource-response-example-error')).toHaveCount(0);
  await expect(page.getByTestId('datasource-response-example-preview')).toContainText('profile');
  await expect(page.getByTestId('datasource-response-example-preview')).toContainText('"Ada"');
  await expect(page.getByTestId('datasource-form-field-profile.name')).toHaveCount(0);

  await page.getByTestId('datasource-response-schema-select-button').click();
  await expect(page.getByTestId('datasource-form-field-profile')).toBeVisible();
  await setSchemaPathDepth(page, 2);
  await expect(page.getByTestId('datasource-form-field-profile.name')).toBeVisible();
  await page.getByTestId('datasource-form-field-add-profile.name').click();
  await expect(page.getByTestId('datasource-form-field-add-profile.name')).toBeDisabled();
  await page.getByTestId('datasource-form-field-add-shared').click();
  await expect(page.getByTestId('datasource-selected-field-profile.name')).toBeVisible();
  await expect(page.getByTestId('datasource-selected-field-shared')).toBeVisible();

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  let datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.responseExamples).toBeUndefined();
  expect(datasourceValue.jsonSchema).toBeUndefined();
  expect(datasourceValue.schemaSelections).toEqual([
    { label: 'name', path: 'profile.name', type: 'string' },
    { label: 'shared', path: 'shared', type: 'string' }
  ]);

  await addResponseExampleCard(page);
  await page.getByTestId('datasource-response-example-1').fill('{"profile":{"name":"Grace"},"count":2}');

  let fullSchemaDialog = await openFullSchema(page);
  let fullSchema = JSON.parse(await fullSchemaDialog.getByTestId('datasource-json-schema').inputValue()) as any;
  expect(fullSchema.properties.shared.type).toBe('string');
  expect(fullSchema.properties.count).toBeUndefined();
  await closeFullSchema(fullSchemaDialog);

  fullSchemaDialog = await openFullSchema(page, 1);
  fullSchema = JSON.parse(await fullSchemaDialog.getByTestId('datasource-json-schema').inputValue()) as any;
  expect(fullSchema.properties.count.type).toBe('number');
  expect(fullSchema.properties.shared).toBeUndefined();
  await closeFullSchema(fullSchemaDialog);

  await page.getByTestId('datasource-response-schema-select-button-1').click();
  await setSchemaPathDepth(page, 2);
  await expect(page.getByTestId('datasource-form-field-add-profile.name')).toBeDisabled();
  await expect(page.getByTestId('datasource-form-field-shared')).toHaveCount(0);
  await setSchemaPathDepth(page, 1);
  await expect(page.getByTestId('datasource-form-field-add-count')).toBeEnabled();
  await expect(page.getByTestId('datasource-selected-field-shared')).toHaveCount(0);

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.schemaSelections).toEqual([
    { label: 'name', path: 'profile.name', type: 'string' }
  ]);
  expect(datasourceValue.responseExamples).toBeUndefined();
  expect(datasourceValue.jsonSchema).toBeUndefined();

  await openDatasourceSettings(page);
  await page.getByTestId('datasource-response-example-remove-0').click();
  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.schemaSelections).toEqual([
    { label: 'name', path: 'profile.name', type: 'string' }
  ]);
});

test('selects list and form fields from generated Schema with read-only field names', async ({ page }) => {
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
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await addResponseExampleCard(page);
  await page.getByTestId('datasource-path').fill('/users');
  await page.getByTestId('datasource-response-example').fill(JSON.stringify(rawData));
  await page.getByTestId('datasource-response-schema-select-button').click();

  await expect(page.getByTestId('datasource-list-record-path')).toHaveCount(0);
  await expect(page.getByTestId('datasource-list-field-add-users[]')).toBeEnabled();
  await expect(page.getByTestId('datasource-list-field-users[]').locator('.ce-datasource-tool__schema-badge'))
    .toHaveText(['列表']);
  await setSchemaPathDepth(page, 2);
  await expect(page.getByTestId('datasource-list-field-add-users[].id')).toBeEnabled();
  await expect(page.getByTestId('datasource-list-field-add-users[].name')).toBeEnabled();
  await expect(page.getByTestId('datasource-list-field-add-users[].active')).toBeEnabled();
  await expect(page.getByTestId('datasource-list-field-users[].name').locator('.ce-datasource-tool__schema-badge'))
    .toHaveText(['文本']);
  await expect(page.getByTestId('datasource-list-field-label-users[].name')).toHaveText('name');
  expect(await page.getByTestId('datasource-list-field-label-users[].name').evaluate((element) => element.tagName)).toBe('SPAN');
  await page.getByTestId('datasource-list-field-add-users[].id').click();
  await page.getByTestId('datasource-list-field-add-users[].name').click();

  await setSchemaPathDepth(page, 1);
  await expect(page.getByTestId('datasource-form-field-add-title')).toBeEnabled();
  await expect(page.getByTestId('datasource-form-field-label-title')).toHaveText('title');
  expect(await page.getByTestId('datasource-form-field-label-title').evaluate((element) => element.tagName)).toBe('SPAN');
  await page.getByTestId('datasource-form-field-add-title').click();

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: 'mokelay',
    path: '/users',
    method: 'GET',
    headerData: [],
    bodyData: [],
    queryData: [],
    schemaSelections: [
      { label: 'id', path: 'users[].id', type: 'number' },
      { label: 'name', path: 'users[].name', type: 'string' },
      { label: 'title', path: 'title', type: 'string' }
    ]
  });
});

test('filters merged fields up to path depth by localized data type and fuzzy path', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const rawData = {
    data: {
      page: { alias: 'first' },
      users: [{
        profile: { name: 'Ada', age: 20 },
        profileCode: 'admin',
        active: true
      }]
    },
    summary: {
      title: 'Users',
      titleCode: 'users'
    }
  };

  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await addResponseExampleCard(page);
  await page.getByTestId('datasource-response-example').fill(JSON.stringify(rawData));
  await page.getByTestId('datasource-response-schema-select-button').click();

  const pathDepthFilter = page.getByTestId('datasource-schema-path-depth');
  const dataTypeFilter = page.getByTestId('datasource-schema-data-type-filter');
  const schemaSearch = page.getByTestId('datasource-schema-search');
  await expect(page.getByTestId('datasource-schema-tabs')).toHaveCount(0);
  await expect(page.getByTestId('datasource-schema-field-source-filter')).toHaveCount(0);
  await expect(page.getByTestId('datasource-full-schema-open')).toContainText('完整 Schema');
  await expect(pathDepthFilter).toHaveValue('1');
  await expect(pathDepthFilter).toHaveAttribute('min', '1');
  await expect(pathDepthFilter).toHaveAttribute('max', '10');
  await expect(pathDepthFilter).toHaveAttribute('step', '1');
  await expect(dataTypeFilter).toHaveValue('all');
  await expect(dataTypeFilter.locator('option')).toHaveText(['全部数据类型', '文本', '数字', '开关', '对象', '列表']);
  await expect(schemaSearch).toHaveAttribute('placeholder', '按字段路径搜索');
  const depthBox = await pathDepthFilter.boundingBox();
  const dataTypeBox = await dataTypeFilter.boundingBox();
  const searchBox = await schemaSearch.boundingBox();
  expect(depthBox).not.toBeNull();
  expect(dataTypeBox).not.toBeNull();
  expect(searchBox).not.toBeNull();
  expect(Math.abs(depthBox!.y - dataTypeBox!.y)).toBeLessThan(2);
  expect(Math.abs(dataTypeBox!.y - searchBox!.y)).toBeLessThan(2);

  await expect(page.getByTestId('datasource-form-field-data')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-summary')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[]')).toHaveCount(0);

  await pathDepthFilter.press('ArrowUp');
  await expect(pathDepthFilter).toHaveValue('2');
  await expect(page.getByTestId('datasource-form-field-data')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-summary')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[]')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-data.page')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-summary.title')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[]')).not.toContainText('列表字段');
  await expect(page.getByTestId('datasource-form-field-data.page')).not.toContainText('表单字段');
  const firstFieldBox = await page.getByTestId('datasource-list-field-data.users[]').boundingBox();
  const secondFieldBox = await page.getByTestId('datasource-form-field-data.page').boundingBox();
  expect(firstFieldBox).not.toBeNull();
  expect(secondFieldBox).not.toBeNull();
  expect(Math.abs(firstFieldBox!.y - secondFieldBox!.y)).toBeLessThan(2);

  await expect(page.getByTestId('datasource-form-field-data.page').locator('.ce-datasource-tool__schema-badge'))
    .toHaveText(['对象']);
  await expect(page.getByTestId('datasource-form-field-summary.title')).toBeVisible();

  await dataTypeFilter.selectOption('array');
  await expect(page.getByTestId('datasource-list-field-data.users[]')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.name')).toHaveCount(0);
  await expect(page.getByTestId('datasource-form-field-data.page')).toHaveCount(0);

  await dataTypeFilter.selectOption('object');
  await expect(page.getByTestId('datasource-list-field-data.users[]')).toHaveCount(0);
  await expect(page.getByTestId('datasource-form-field-data.page')).toBeVisible();

  await setSchemaPathDepth(page, 4);
  await dataTypeFilter.selectOption('number');
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.age')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.name')).toHaveCount(0);

  await setSchemaPathDepth(page, 3);
  await dataTypeFilter.selectOption('boolean');
  await expect(page.getByTestId('datasource-list-field-data.users[].active')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.age')).toHaveCount(0);

  await setSchemaPathDepth(page, 4);
  await dataTypeFilter.selectOption('string');
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.name')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[].active')).toHaveCount(0);

  await setSchemaPathDepth(page, 3);
  await expect(page.getByTestId('datasource-form-field-data.page.alias')).toBeVisible();

  await dataTypeFilter.selectOption('all');
  await schemaSearch.fill(' DA ');
  await expect(page.getByTestId('datasource-list-field-data.users[].profileCode')).toBeVisible();

  await setSchemaPathDepth(page, 4);
  await schemaSearch.fill('profile');
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.name')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.age')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-data.users[].profileCode')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-summary.title')).toHaveCount(0);

  await setSchemaPathDepth(page, 2);
  await schemaSearch.fill('title');
  await expect(page.getByTestId('datasource-list-field-data.users[].profile.name')).toHaveCount(0);
  await expect(page.getByTestId('datasource-form-field-summary.title')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-summary.titleCode')).toBeVisible();

  await setSchemaPathDepth(page, 4);
  await schemaSearch.fill('data.users[].profile.missing');
  await expect(page.getByTestId('datasource-fields-search-empty')).toHaveText('没有匹配该路径的字段。');

  await schemaSearch.fill('');
  await pathDepthFilter.fill('0');
  await expect(pathDepthFilter).toHaveValue('1');
  await pathDepthFilter.fill('11');
  await expect(pathDepthFilter).toHaveValue('10');
  await pathDepthFilter.press('ArrowDown');
  await expect(pathDepthFilter).toHaveValue('9');
  expect(pageErrors).toEqual([]);
});

test('shows saved selections without a response Schema and supports removing them', async ({ page }) => {
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-api-selections',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'mokelay',
            path: '/users',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: [],
            schemaSelections: [
              {
                path: 'users[].id',
                label: '用户 ID',
                type: 'number',
                processors: [{ processor: 'date_time_format', param: 'yyyy-MM-dd' }]
              },
              { path: 'title', label: '页面标题', type: 'string' }
            ]
          }
        }
      }
    ]
  });

  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-schema-empty')).toBeVisible();
  await expect(page.getByTestId('datasource-selected-field-users[].id')).toBeVisible();
  await expect(page.getByTestId('datasource-selected-field-label-users[].id')).toHaveText('用户 ID');
  await expect(page.getByTestId('datasource-selected-field-title')).toBeVisible();
  await expect(page.getByTestId('datasource-selected-field-label-title')).toHaveText('页面标题');

  await addResponseExampleCard(page);
  await page.getByTestId('datasource-response-example').fill(JSON.stringify({
    title: '用户列表',
    users: [{ id: 1, name: 'Ada' }]
  }));
  await page.getByTestId('datasource-response-schema-select-button').click();
  await setSchemaPathDepth(page, 2);
  await expect(page.getByTestId('datasource-list-field-add-users[].id')).toBeDisabled();
  await expect(page.getByTestId('datasource-list-field-add-users[].name')).toBeEnabled();
  await expect(page.getByTestId('datasource-list-field-label-users[].id')).toHaveText('id');
  await setSchemaPathDepth(page, 1);
  await expect(page.getByTestId('datasource-form-field-add-title')).toBeDisabled();
  await expect(page.getByTestId('datasource-form-field-label-title')).toHaveText('title');

  await page.getByTestId('datasource-selected-field-remove-title').click();
  await expect(page.getByTestId('datasource-selected-field-title')).toHaveCount(0);
  await expect(page.getByTestId('datasource-form-field-add-title')).toBeEnabled();

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.schemaSelections).toEqual([
    {
      path: 'users[].id',
      label: '用户 ID',
      type: 'number',
      processors: [{ processor: 'date_time_format', param: 'yyyy-MM-dd' }]
    }
  ]);
});

test('configures, validates, orders, persists, and views string processors', async ({ page }) => {
  await switchLocaleToChinese(page);
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [{
      id: 'datasource-processors-string',
      type: 'MDatasourceEditor',
      data: {
        value: {
          type: 'API',
          domain: 'mokelay',
          path: '/users',
          method: 'GET',
          headerData: [],
          bodyData: [],
          queryData: [],
          schemaSelections: [{ path: 'createdAt', label: '创建时间', type: 'string' }]
        }
      }
    }]
  });

  await openDatasourceSettings(page);
  await page.getByTestId('datasource-selected-field-processors-config-createdAt').click();
  const dialog = page.getByTestId('datasource-processor-dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByTestId('datasource-processor-select').selectOption('trim');
  await dialog.getByTestId('datasource-processor-add').click();
  await dialog.getByTestId('datasource-processor-select').selectOption('date_time_format');
  await dialog.getByTestId('datasource-processor-add').click();
  await expect(dialog.getByTestId('datasource-processor-item-0')).toContainText('trim');
  await expect(dialog.getByTestId('datasource-processor-item-1')).toContainText('date_time_format');

  const formatInput = dialog.getByTestId('processor-date-time-format');
  await formatInput.fill('');
  await expect(dialog.getByTestId('datasource-processor-apply')).toBeDisabled();
  await formatInput.fill('yyyy/MM/dd');
  await dialog.getByTestId('datasource-processor-up-1').click();
  await expect(dialog.getByTestId('datasource-processor-item-0')).toContainText('date_time_format');
  await dialog.getByTestId('datasource-processor-remove-1').click();
  await dialog.getByTestId('datasource-processor-select').selectOption('trim');
  await dialog.getByTestId('datasource-processor-add').click();
  await dialog.getByTestId('datasource-processor-apply').click();

  await expect(page.getByTestId('datasource-selected-field-processors-createdAt')).toContainText('日期时间格式化');
  await expect(page.getByTestId('datasource-selected-field-processors-createdAt')).toContainText('去除首尾空格');
  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();

  let datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.schemaSelections[0].processors).toEqual([
    { processor: 'date_time_format', param: 'yyyy/MM/dd' },
    'trim'
  ]);

  await page.reload();
  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-selected-field-processors-createdAt')).toBeVisible();
  await closeDatasourceSettings(page);
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('datasource-settings-open')).toHaveCount(0);
});

test('previews final field data for all supported processors', async ({ page }) => {
  await switchLocaleToChinese(page);
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [{
      id: 'datasource-processor-preview-all',
      type: 'MDatasourceEditor',
      data: {
        value: {
          type: 'API',
          domain: 'mokelay',
          path: '/users',
          method: 'GET',
          headerData: [],
          bodyData: [],
          queryData: [],
          schemaSelections: [
            { path: 'user.name', label: '姓名', type: 'string', processors: ['trim'] },
            {
              path: 'createdAt',
              label: '创建年份',
              type: 'string',
              processors: [{ processor: 'date_time_format', param: 'yyyy' }]
            },
            {
              path: 'profile',
              label: '用户资料',
              type: 'object',
              processors: [{ processor: 'merge_data', param: [{ active: true }] }]
            },
            {
              path: 'users[]',
              label: '成年用户',
              type: 'array',
              processors: [{
                processor: 'filter',
                param: {
                  type: 'and',
                  conditions: [{ variable: 'age', condition: 'gt', value: 18 }]
                }
              }]
            }
          ]
        }
      }
    }]
  });
  await addResponseExampleCard(page);
  await page.getByTestId('datasource-response-example').fill(JSON.stringify({
    user: { name: ' Ada ' },
    createdAt: '2026-06-15T04:05:06.000Z',
    profile: { role: 'admin' },
    users: [{ name: 'Ada', age: 20 }, { name: 'Bob', age: 15 }]
  }));

  let dialog = await openFieldPreview(page, 'user.name');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('"Ada"');
  await expect(dialog.getByTestId('datasource-processor-preview-extracted')).toContainText('" Ada "');
  await closeFieldPreview(dialog);

  dialog = await openFieldPreview(page, 'createdAt');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('"2026"');
  await expect(dialog.getByTestId('datasource-processor-preview-extracted')).toContainText('2026-06-15T04:05:06.000Z');
  await closeFieldPreview(dialog);

  dialog = await openFieldPreview(page, 'profile');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('active');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('true');
  await expect(dialog.getByTestId('datasource-processor-preview-extracted')).not.toContainText('active');
  await closeFieldPreview(dialog);

  dialog = await openFieldPreview(page, 'users[]');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('Ada');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).not.toContainText('Bob');
  await expect(dialog.getByTestId('datasource-processor-preview-extracted')).toContainText('Bob');
  await closeFieldPreview(dialog);
});

test('switches field preview response examples and disables invalid examples', async ({ page }) => {
  await switchLocaleToChinese(page);
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [{
      id: 'datasource-processor-preview-examples',
      type: 'MDatasourceEditor',
      data: {
        value: {
          type: 'API',
          domain: 'mokelay',
          path: '/users',
          method: 'GET',
          headerData: [],
          bodyData: [],
          queryData: [],
          schemaSelections: [{
            path: 'users[].name',
            label: '用户名称',
            type: 'string',
            processors: ['trim']
          }]
        }
      }
    }]
  });

  await addResponseExampleCard(page);
  await page.getByTestId('datasource-response-example').fill('{"users":[{"name":" Ada "},{"id":2}]}');
  await page.getByTestId('datasource-response-example-add').click();
  await page.getByTestId('datasource-response-example-1').fill('{"users":[{"name":" Grace "}]}');
  await page.getByTestId('datasource-response-example-add').click();
  await page.getByTestId('datasource-response-example-2').fill('{');

  const dialog = await openFieldPreview(page, 'users[].name');
  const exampleSelect = dialog.getByTestId('datasource-processor-preview-example-select');
  await expect(exampleSelect.locator('option')).toHaveCount(3);
  await expect(exampleSelect.locator('option[value="2"]')).toHaveAttribute('disabled', '');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('"Ada"');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('null');
  await expect(dialog.getByTestId('datasource-processor-preview-extracted')).toContainText('" Ada "');

  await exampleSelect.selectOption('1');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('"Grace"');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).not.toContainText('Ada');
  await closeFieldPreview(dialog);
});

test('shows unprocessed values and field preview errors without changing datasource data', async ({ page }) => {
  await switchLocaleToChinese(page);
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [{
      id: 'datasource-processor-preview-errors',
      type: 'MDatasourceEditor',
      data: {
        value: {
          type: 'API',
          domain: 'mokelay',
          path: '/users',
          method: 'GET',
          headerData: [],
          bodyData: [],
          queryData: [],
          schemaSelections: [
            { path: 'name', label: '姓名', type: 'string' },
            { path: 'missing', label: '缺失字段', type: 'string' },
            { path: 'future', label: '未知处理器字段', type: 'string', processors: ['future_processor'] }
          ]
        }
      }
    }]
  });
  await addResponseExampleCard(page);
  await page.getByTestId('datasource-response-example').fill('{"name":"Ada","future":"value"}');

  let dialog = await openFieldPreview(page, 'name');
  await expect(dialog.getByTestId('datasource-processor-preview-final')).toContainText('"Ada"');
  await expect(dialog.getByTestId('datasource-processor-preview-extracted')).toContainText('"Ada"');
  await closeFieldPreview(dialog);

  dialog = await openFieldPreview(page, 'missing');
  await expect(dialog.getByTestId('datasource-processor-preview-error'))
    .toHaveText('当前响应示例中不存在该字段路径。');
  await closeFieldPreview(dialog);

  dialog = await openFieldPreview(page, 'future');
  await expect(dialog.getByTestId('datasource-processor-preview-error'))
    .toHaveText('字段包含无法识别的 Processor，暂时无法生成预览。');
  await closeFieldPreview(dialog);

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.schemaSelections).toEqual([
    { path: 'name', label: '姓名', type: 'string' },
    { path: 'missing', label: '缺失字段', type: 'string' },
    { path: 'future', label: '未知处理器字段', type: 'string', processors: ['future_processor'] }
  ]);
});

test('configures merge and filter processors while preserving unknown and incompatible configs', async ({ page }) => {
  await switchLocaleToChinese(page);
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [{
      id: 'datasource-processors-array',
      type: 'MDatasourceEditor',
      data: {
        value: {
          type: 'API',
          domain: 'mokelay',
          path: '/users',
          method: 'GET',
          headerData: [],
          bodyData: [],
          queryData: [],
          schemaSelections: [{
            path: 'users[]',
            label: '用户列表',
            type: 'array',
            processors: ['trim', { processor: 'future_processor', param: { keep: true } }]
          }]
        }
      }
    }]
  });

  await openDatasourceSettings(page);
  const fieldCard = page.getByTestId('datasource-selected-field-users[]');
  const processorTags = page.getByTestId('datasource-selected-field-processors-users[]');
  const previewButton = page.getByTestId('datasource-selected-field-preview-users[]');
  const configureButton = page.getByTestId('datasource-selected-field-processors-config-users[]');
  const removeButton = page.getByTestId('datasource-selected-field-remove-users[]');
  await expect(fieldCard).toBeVisible();
  await expect(processorTags).toBeVisible();
  const fieldCardBox = await fieldCard.boundingBox();
  const processorTagsBox = await processorTags.boundingBox();
  const previewButtonBox = await previewButton.boundingBox();
  const configureButtonBox = await configureButton.boundingBox();
  const removeButtonBox = await removeButton.boundingBox();
  expect(fieldCardBox).not.toBeNull();
  expect(processorTagsBox).not.toBeNull();
  expect(previewButtonBox).not.toBeNull();
  expect(configureButtonBox).not.toBeNull();
  expect(removeButtonBox).not.toBeNull();
  expect(fieldCardBox!.width).toBeGreaterThan(350);
  expect(fieldCardBox!.height).toBeLessThan(150);
  expect(processorTagsBox!.height).toBeLessThan(28);
  expect(Math.abs(previewButtonBox!.y - configureButtonBox!.y)).toBeLessThan(2);
  expect(Math.abs(configureButtonBox!.y - removeButtonBox!.y)).toBeLessThan(2);

  await configureButton.click();
  const dialog = page.getByTestId('datasource-processor-dialog');
  await expect(dialog.getByText('该处理器与当前字段类型不兼容')).toBeVisible();
  await expect(dialog.getByText('该处理器当前无法识别')).toBeVisible();

  await dialog.getByTestId('datasource-processor-select').selectOption('merge_data');
  await dialog.getByTestId('datasource-processor-add').click();
  const mergeInput = dialog.getByTestId('processor-merge-data-param');
  await mergeInput.fill('{');
  await expect(dialog.getByTestId('datasource-processor-apply')).toBeDisabled();
  await mergeInput.fill('{"source":"api"}');

  await dialog.getByTestId('datasource-processor-select').selectOption('filter');
  await dialog.getByTestId('datasource-processor-add').click();
  await dialog.getByTestId('processor-filter-condition-add').click();
  await dialog.getByTestId('processor-filter-variable-0').fill('age');
  await dialog.getByTestId('processor-filter-condition-type-0').selectOption('gt');
  await dialog.getByTestId('processor-filter-value-0').fill('18');
  await dialog.getByTestId('datasource-processor-apply').click();
  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();

  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.schemaSelections[0].processors).toEqual([
    'trim',
    { processor: 'future_processor', param: { keep: true } },
    { processor: 'merge_data', param: [{ source: 'api' }] },
    {
      processor: 'filter',
      param: {
        type: 'and',
        conditions: [{ variable: 'age', condition: 'gt', value: 18 }]
      }
    }
  ]);
});

test('translates selected field labels to Chinese by original label', async ({ page }) => {
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
            hello: '你好',
            functionName: '函数名称'
          }
        }
      })
    });
  });
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-api-translation',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'mokelay',
            path: '/users',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: [],
            schemaSelections: [
              { path: 'hello', label: 'hello', type: 'string', processors: ['trim'] },
              { path: 'nested.hello', label: 'hello', type: 'string' },
              { path: 'functionName', label: 'functionName', type: 'string' }
            ]
          }
        }
      }
    ]
  });
  await switchLocaleToChinese(page);
  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-selected-fields-translate')).toHaveText('翻译为中文');
  await page.getByTestId('datasource-selected-fields-translate').click();

  await expect.poll(() => translationRequest).toEqual({
    texts: ['hello', 'functionName'],
    sourceLanguage: 'English',
    targetLanguage: '中文'
  });
  await expect(page.getByTestId('datasource-selected-field-label-hello')).toHaveText('你好');
  await expect(page.getByTestId('datasource-selected-field-label-nested.hello')).toHaveText('你好');
  await expect(page.getByTestId('datasource-selected-field-label-functionName')).toHaveText('函数名称');

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.schemaSelections).toEqual([
    { path: 'hello', label: '你好', type: 'string', processors: ['trim'] },
    { path: 'nested.hello', label: '你好', type: 'string' },
    { path: 'functionName', label: '函数名称', type: 'string' }
  ]);
});

test('edits API datasource lists and saves typed body values', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

  await expect(page.getByTestId('datasource-api-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-test-button')).toHaveCount(0);

  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');
  await page.getByTestId('datasource-path').fill('/v1/users');
  await page.getByTestId('datasource-method').selectOption('POST');

  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-0').fill('Authorization');
  await page.getByTestId('datasource-header-value-0').fill('Bearer token');

  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-0').fill('search');
  await page.getByTestId('datasource-query-value-0').fill('mokelay');
  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-1').fill('page');
  await page.getByTestId('datasource-query-value-1').fill('1');
  await page.getByTestId('datasource-query-remove-0').click();

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('count');
  await page.getByTestId('datasource-body-type-0').selectOption('number');
  await page.getByTestId('datasource-body-value-0').fill('42');

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-1').fill('filter');
  await page.getByTestId('datasource-body-type-1').selectOption('object');
  await page.getByTestId('datasource-body-value-1').fill('{ bad');
  await expect(page.getByTestId('datasource-body-value-1-error')).toBeVisible();
  await page.getByTestId('datasource-body-value-1').fill('{"active":true,"roles":["admin"]}');
  await expect(page.getByTestId('datasource-body-value-1-error')).toHaveCount(0);

  await closeDatasourceSettings(page);
  await expect(page.getByTestId('datasource-summary')).toContainText('/v1/users');
  await expect(page.getByTestId('datasource-summary')).toContainText('POST');
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: 'mokelay',
    path: '/v1/users',
    method: 'POST',
    headerData: [
      {
        key: 'Authorization',
        value: 'Bearer token'
      }
    ],
    bodyData: [
      {
        key: 'count',
        dataType: 'number',
        value: 42
      },
      {
        key: 'filter',
        dataType: 'object',
        value: {
          active: true,
          roles: ['admin']
        }
      }
    ],
    queryData: [
      {
        key: 'page',
        value: '1'
      }
    ]
  });
});

test('edits datasource parameter values with input, single variable, and advanced flow modes', async ({ page }) => {
  await switchLocaleToChinese(page);
  await seedSavedConfig(page, {
    blocks: [
      {
        id: 'input-source',
        type: 'MInput',
        data: {
          placeholder: 'name',
          value: 'mokelay'
        }
      },
      {
        id: 'advance-table-source',
        type: 'MAdvanceTable',
        data: {
          index: false,
          selection: false,
          showPageBreak: true
        }
      },
      {
        id: 'datasource-variable-values',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'mokelay',
            path: '/users',
            method: 'POST',
            headerData: [],
            bodyData: [],
            queryData: []
          }
        }
      }
    ]
  });

  await openDatasourceSettings(page);
  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-0').fill('Authorization');
  await page.getByTestId('datasource-header-value-0').fill('Bearer ');

  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-0').fill('token');
  const queryEditor = page.getByTestId('datasource-query-value-0-editor');
  await queryEditor.getByTestId('variable-mode-variable').click();
  await expect(queryEditor.getByTestId('variable-block-select')).not.toContainText('legacy');
  await expect(queryEditor.getByTestId('variable-block-select')).toContainText('MInput / input-source');
  await expect(queryEditor.getByTestId('variable-block-select')).toContainText('MAdvanceTable / advance-table-source');
  await queryEditor.getByTestId('variable-block-select').selectOption('advance-table-source');
  await queryEditor.getByTestId('variable-single-select').selectOption('page');
  await queryEditor.getByTestId('variable-single-processors').click();
  const processorDialog = page.getByTestId('datasource-processor-dialog');
  await expect(processorDialog).toBeVisible();
  await processorDialog.getByTestId('datasource-processor-select').selectOption('date_time_format');
  await processorDialog.getByTestId('datasource-processor-add').click();
  await processorDialog.getByTestId('datasource-processor-apply').click();

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('payload');
  const bodyEditor = page.getByTestId('datasource-body-value-0-editor');
  await bodyEditor.getByTestId('variable-mode-flow').click();
  const flowDialog = page.getByTestId('variable-flow-dialog');
  await expect(flowDialog).toBeVisible();
  await flowDialog.getByTestId('variable-flow-add-variable').click();
  await flowDialog.getByTestId('variable-flow-add-variable').click();
  await flowDialog.getByTestId('variable-flow-add-if').click();
  await flowDialog.getByTestId('variable-flow-apply').click();
  await expect(flowDialog).toHaveCount(0);

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();

  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.headerData).toEqual([{
    key: 'Authorization',
    value: 'Bearer '
  }]);
  expect(datasourceValue.queryData).toEqual([{
    key: 'token',
    value: {
      mode: 'variable',
      source: 'Block',
      blockId: 'advance-table-source',
      blockType: 'MAdvanceTable',
      variable: 'page',
      processors: [{
        processor: 'date_time_format',
        param: 'yyyy-MM-dd HH:mm:SS'
      }]
    }
  }]);
  expect(datasourceValue.bodyData[0].value.mode).toBe('flow');
  expect(datasourceValue.bodyData[0].value.flow.nodes.map((node: any) => node.type)).toEqual(
    expect.arrayContaining(['constant', 'output', 'variable', 'if'])
  );

  await page.reload();
  await openDatasourceSettings(page);
  await page.getByTestId('datasource-body-value-0-editor').getByTestId('variable-flow-open').click();
  await expect(page.getByTestId('variable-flow-dialog')).toBeVisible();
  await expect(page.getByTestId('variable-flow-node-output_1')).toBeVisible();
});

test('loads API domain options and saves the selected domain uuid', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apiDomains: [
      {
        uuid: 'mokelay',
        alias: 'Mokelay 域名',
        host: 'https://api.mokelay.com'
      },
      {
        uuid: 'manager',
        alias: '管理台',
        host: 'https://manager.example.com'
      }
    ]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

  await expect(page.getByTestId('datasource-domain')).toContainText('管理台');
  await page.getByTestId('datasource-domain').selectOption('manager');
  await page.getByTestId('datasource-path').fill('/v1/users');

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: 'manager',
    path: '/v1/users'
  });
  expect(apiState.apiDomainRequests).toHaveLength(1);
});

test('shares one API domain request across multiple datasource editors', async ({ page }) => {
  const apiState = await resetEditor(page, {
    apiDomains: [
      {
        uuid: 'mokelay',
        alias: 'Mokelay 域名',
        host: 'https://api.mokelay.com'
      }
    ]
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-api-one',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'mokelay',
            path: '/one',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: []
          }
        }
      },
      {
        id: 'datasource-api-two',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'mokelay',
            path: '/two',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: []
          }
        }
      }
    ]
  });

  await expect(page.getByTestId('datasource-settings-open')).toHaveCount(2);
  let settingsDialog = await openDatasourceSettings(page, 0);
  await expect(settingsDialog.getByTestId('datasource-domain')).toHaveValue('mokelay');
  await closeDatasourceSettings(page);
  settingsDialog = await openDatasourceSettings(page, 1);
  await expect(settingsDialog.getByTestId('datasource-domain')).toHaveValue('mokelay');
  await closeDatasourceSettings(page);
  await expect.poll(() => apiState.apiDomainRequests.length).toBe(1);
});

test('imports API datasource from a Mokelay orchestration API', async ({ page }) => {
  const responseData = {
    users: [
      {
        id: 1,
        name: 'Ada',
        active: true
      }
    ],
    total: 1
  };
  const responseExample = {
    ok: true,
    data: responseData
  };

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
          response: responseData
        }
      }
    ]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

  await expect(page.getByTestId('datasource-api-import-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-import-open-mokelay')).toBeVisible();
  await expect(page.getByTestId('datasource-import-open-apifox')).toBeVisible();
  await expect(page.getByTestId('datasource-import-source')).toHaveCount(0);

  const importDialog = await openMokelayApiImport(page);
  await expect(importDialog.getByTestId('datasource-import-mokelay-source')).toHaveValue('user');
  await expect(importDialog.getByTestId('datasource-import-mokelay-source')).toContainText('用户创建接口');
  await expect(importDialog.getByTestId('datasource-import-mokelay-source')).toContainText('系统接口');
  await expect(importDialog.getByTestId('datasource-import-mokelay-api')).toContainText('用户导入 API');
  await importDialog.getByTestId('datasource-import-mokelay-api').selectOption('import_users');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');
  await expect(page.getByTestId('datasource-path')).toHaveValue('/api/mokelay/import_users');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-header-key-0')).toHaveValue('Authorization');
  await expect(page.getByTestId('datasource-header-key-1')).toHaveValue('X-Tenant');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('page');
  await expect(page.getByTestId('datasource-query-key-1')).toHaveValue('pageSize');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('keyword');
  await expect(page.getByTestId('datasource-body-key-1')).toHaveValue('limit');
  await expect(page.getByTestId('datasource-response-example')).toHaveValue(JSON.stringify(responseExample, null, 2));
  await expect(page.getByTestId('datasource-schema-empty')).toBeVisible();
  await page.getByTestId('datasource-response-schema-select-button').click();
  await expect(page.getByTestId('datasource-form-field-ok')).toBeVisible();

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: 'mokelay',
    path: '/api/mokelay/import_users',
    method: 'POST',
    headerData: [
      { key: 'Authorization', value: '' },
      { key: 'X-Tenant', value: '' }
    ],
    bodyData: [
      { key: 'keyword', dataType: 'string', value: '' },
      { key: 'limit', dataType: 'string', value: '' }
    ],
    queryData: [
      { key: 'page', value: '' },
      { key: 'pageSize', value: '' }
    ]
  });
  expect(datasourceValue.responseExamples).toBeUndefined();
  expect(datasourceValue.jsonSchema).toBeUndefined();
  expect(datasourceValue.schemaSelections).toBeUndefined();
});

test('imports API datasource from a system Mokelay orchestration API', async ({ page }) => {
  const responseData = {
    items: [{ id: 1, name: '系统数据' }],
    total: 1
  };
  const apiState = await resetEditor(page, {
    apis: [
      {
        uuid: 'user_only_api',
        name: '用户接口',
        method: 'GET',
        status: 'draft',
        apiJson: {
          uuid: 'user_only_api',
          alias: '用户接口',
          method: 'GET',
          blocks: []
        }
      }
    ],
    systemApis: [
      {
        uuid: 'system_search_api',
        name: '系统查询接口',
        method: 'POST',
        status: 'published',
        apiJson: {
          uuid: 'system_search_api',
          alias: '系统查询接口',
          method: 'POST',
          request: {
            header: ['Authorization'],
            query: ['page'],
            body: ['keyword']
          },
          blocks: [],
          response: responseData
        }
      }
    ]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');

  const importDialog = await openMokelayApiImport(page);
  await importDialog.getByTestId('datasource-import-mokelay-source').selectOption('system');
  await expect.poll(() => apiState.apiListRequests.some((requestUrl) => (
    new URL(requestUrl).pathname === '/api/mokelay/list_mokelay_api_jsons'
  ))).toBe(true);
  await expect(importDialog.getByTestId('datasource-import-mokelay-api')).toContainText('系统查询接口');
  await expect(importDialog.getByTestId('datasource-import-mokelay-api')).not.toContainText('用户接口');
  await importDialog.getByTestId('datasource-import-mokelay-api').selectOption('system_search_api');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await expect.poll(() => apiState.systemApiReadRequests.some((requestUrl) => (
    new URL(requestUrl).searchParams.get('uuid') === 'system_search_api'
  ))).toBe(true);
  await expect(page.getByTestId('datasource-path')).toHaveValue('/api/mokelay/system_search_api');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-header-key-0')).toHaveValue('Authorization');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('page');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('keyword');
  await expect(page.getByTestId('datasource-response-example')).toHaveValue(JSON.stringify({
    ok: true,
    data: responseData
  }, null, 2));
});

test('imports API datasource from APIFox project and API ID', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [
      {
        uuid: 'apifox',
        alias: 'APIFox API',
        host: 'https://api.example.com'
      }
    ]
  });

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
                          },
                          example: {
                            data: [
                              {
                                id: 'u_1',
                                age: 18
                              }
                            ]
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
  const importDialog = await openApifoxApiImport(page);
  await expect(importDialog.getByTestId('datasource-import-apifox-project')).toContainText('CRM 项目');
  await importDialog.getByTestId('datasource-import-apifox-project').selectOption('42');
  await importDialog.getByTestId('datasource-import-apifox-api-id').fill('91011');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await expect(page.getByTestId('datasource-domain')).toHaveValue('apifox');
  await expect(page.getByTestId('datasource-path')).toHaveValue('/v1/users/search');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-header-key-0')).toHaveValue('X-Trace');
  await expect(page.getByTestId('datasource-header-value-0')).toHaveValue('trace-1');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('token');
  await expect(page.getByTestId('datasource-query-value-0')).toHaveValue('abc');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('keyword');
  await expect(page.getByTestId('datasource-body-value-0')).toHaveValue('Ada');
  await expect(page.getByTestId('datasource-body-key-1')).toHaveValue('limit');
  await expect(page.getByTestId('datasource-body-type-1')).toHaveValue('number');
  await expect(page.getByTestId('datasource-body-value-1')).toHaveValue('20');
  await expect(page.getByTestId('datasource-body-key-2')).toHaveValue('filters');
  await expect(page.getByTestId('datasource-response-example')).toHaveValue(JSON.stringify({
    data: [
      {
        id: 'u_1',
        age: 18
      }
    ]
  }, null, 2));

  await expect(page.getByTestId('datasource-schema-empty')).toBeVisible();
  await page.getByTestId('datasource-response-schema-select-button').click();
  const fullSchemaDialog = await openFullSchema(page);
  const importedSchema = JSON.parse(await fullSchemaDialog.getByTestId('datasource-json-schema').inputValue()) as any;
  expect(importedSchema.properties.data.items.properties.age.type).toBe('number');
  await closeFullSchema(fullSchemaDialog);

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: 'apifox',
    path: '/v1/users/search',
    method: 'POST',
    headerData: [
      { key: 'X-Trace', value: 'trace-1' }
    ],
    bodyData: [
      { key: 'keyword', dataType: 'string', value: 'Ada' },
      { key: 'limit', dataType: 'number', value: 20 },
      { key: 'filters', dataType: 'object', value: { active: true } }
    ],
    queryData: [
      { key: 'token', value: 'abc' }
    ]
  });
  expect(datasourceValue.responseExamples).toBeUndefined();
  expect(datasourceValue.jsonSchema).toBeUndefined();
});

test('imports APIFox relative API path with the selected API domain', async ({ page }) => {
  await resetEditor(page);

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
    const url = new URL(route.request().url());
    expect(url.searchParams.get('projectId')).toBe('mokelay-project');
    expect(url.searchParams.get('apiId')).toBe('258626714');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          apis: [
            {
              path: '/api/mokelay/login_users',
              method: 'POST',
              summary: '用户登录',
              operationId: '258626714',
              parameters: {
                query: ['debug']
              },
              requestBodyParameters: [
                { contentType: 'application/json', name: 'email', path: 'email' }
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
  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');
  const importDialog = await openApifoxApiImport(page);
  await importDialog.getByTestId('datasource-import-apifox-project').selectOption('mokelay-project');
  await importDialog.getByTestId('datasource-import-apifox-api-id').fill('258626714');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await expect(page.getByTestId('datasource-import-error')).toHaveCount(0);
  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');
  await expect(page.getByTestId('datasource-path')).toHaveValue('/api/mokelay/login_users');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('debug');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('email');

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: 'mokelay',
    path: '/api/mokelay/login_users',
    method: 'POST',
    bodyData: [
      { key: 'email', dataType: 'string', value: '' }
    ],
    queryData: [
      { key: 'debug', value: '' }
    ]
  });
});

test('does not import APIFox datasource when the API host is missing from the domain list', async ({ page }) => {
  await page.route('**/api/mokelay/list-apifox-projects**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          projects: [
            { id: 'project-unknown-host', name: '未知域名项目' }
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
              { url: 'https://unknown.example.com' }
            ],
            paths: {
              '/users': {
                get: {
                  operationId: 'unknown-host-api',
                  responses: {
                    200: {
                      description: 'OK'
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
  const importDialog = await openApifoxApiImport(page);
  await importDialog.getByTestId('datasource-import-apifox-project').selectOption('project-unknown-host');
  await importDialog.getByTestId('datasource-import-apifox-api-id').fill('unknown-host-api');
  await importDialog.getByTestId('datasource-import-apply').click();

  await expect(importDialog).toBeVisible();
  await expect(importDialog.getByTestId('datasource-import-error')).toContainText('域名列表');
  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');
  await expect(page.getByTestId('datasource-path')).toHaveValue('');
});

test('imports APIFox grouped query parameters and request body parameters', async ({ page }) => {
  const responseExample = {
    data: [
      {
        id: 'page-1',
        title: 'Home'
      }
    ]
  };

  await resetEditor(page, {
    apiDomains: [
      {
        uuid: 'apifox',
        alias: 'APIFox API',
        host: 'https://api.example.com'
      }
    ]
  });

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
              serverUrl: 'https://api.example.com',
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
              responses: {},
              responseDetails: [
                {
                  statusCode: '200',
                  description: 'OK',
                  contentTypes: ['application/json'],
                  contents: [
                    {
                      contentType: 'application/json',
                      schemaDescription: null,
                      example: responseExample,
                      examples: null
                    }
                  ]
                }
              ],
              responseBodyParameters: [
                {
                  statusCode: '200',
                  contentType: 'application/json',
                  name: 'data',
                  path: 'data',
                  description: null,
                  required: true,
                  deprecated: false,
                  example: null,
                  examples: null
                },
                {
                  statusCode: '200',
                  contentType: 'application/json',
                  name: 'id',
                  path: 'data[].id',
                  description: null,
                  required: true,
                  deprecated: false,
                  example: 'page-1',
                  examples: null
                },
                {
                  statusCode: '200',
                  contentType: 'application/json',
                  name: 'title',
                  path: 'data[].title',
                  description: null,
                  required: false,
                  deprecated: false,
                  example: 'Home',
                  examples: null
                }
              ]
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
  const importDialog = await openApifoxApiImport(page);
  await importDialog.getByTestId('datasource-import-apifox-project').selectOption('mokelay-project');
  await importDialog.getByTestId('datasource-import-apifox-api-id').fill('217306455');
  await importDialog.getByTestId('datasource-import-apply').click();
  await expect(importDialog).not.toBeVisible();

  await expect(page.getByTestId('datasource-path')).toHaveValue('/config/load-page-data/{id}_{name}');
  await expect(page.getByTestId('datasource-method')).toHaveValue('POST');
  await expect(page.getByTestId('datasource-query-key-0')).toHaveValue('alias');
  await expect(page.getByTestId('datasource-query-key-1')).toHaveValue('aaaa');
  await expect(page.getByTestId('datasource-query-key-2')).toHaveValue('nnnnn');
  await expect(page.getByTestId('datasource-body-key-0')).toHaveValue('ggggg');
  await expect(page.getByTestId('datasource-body-key-1')).toHaveValue('bbbbbb');
  await expect(page.getByTestId('datasource-response-example')).toHaveValue(JSON.stringify(responseExample, null, 2));

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: 'apifox',
    path: '/config/load-page-data/{id}_{name}',
    method: 'POST',
    headerData: [],
    bodyData: [
      { key: 'ggggg', dataType: 'string', value: '' },
      { key: 'bbbbbb', dataType: 'string', value: '' }
    ],
    queryData: [
      { key: 'alias', value: '' },
      { key: 'aaaa', value: '' },
      { key: 'nnnnn', value: '' }
    ]
  });
  expect(datasourceValue.responseExamples).toBeUndefined();
  expect(datasourceValue.jsonSchema).toBeUndefined();
});

test('does not overwrite API datasource when APIFox method is unsupported', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [
      {
        uuid: 'existing',
        alias: 'Existing API',
        host: 'https://existing.example.com'
      }
    ]
  });

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
  await openDatasourceSettings(page);
  await page.getByTestId('datasource-domain').selectOption('existing');
  await page.getByTestId('datasource-path').fill('/keep');
  const importDialog = await openApifoxApiImport(page);
  await expect(importDialog.getByTestId('datasource-import-apifox-project')).toContainText('删除接口项目');
  await importDialog.getByTestId('datasource-import-apifox-api-id').fill('delete-user');
  await importDialog.getByTestId('datasource-import-apply').click();

  await expect(importDialog).toBeVisible();
  await expect(importDialog.getByTestId('datasource-import-error')).toContainText('GET/POST');
  await expect(page.getByTestId('datasource-domain')).toHaveValue('existing');
  await expect(page.getByTestId('datasource-path')).toHaveValue('/keep');
});

test('saves API datasource file body metadata without file content', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

  const fileBuffer = Buffer.from('hello file');

  await page.getByTestId('datasource-method').selectOption('POST');
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('avatar');
  await page.getByTestId('datasource-body-type-0').selectOption('file');
  await page.getByTestId('datasource-body-value-0').setInputFiles({
    name: 'avatar.txt',
    mimeType: 'text/plain',
    buffer: fileBuffer
  });

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: 'mokelay',
    path: '',
    method: 'POST',
    headerData: [],
    bodyData: [
      {
        key: 'avatar',
        dataType: 'file',
        value: {
          name: 'avatar.txt',
          size: fileBuffer.length,
          type: 'text/plain'
        }
      }
    ],
    queryData: []
  });

  await closeDatasourceSettings(page);
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('datasource-settings-open')).toHaveCount(0);
});

test('parses an API response and saves only selected Schema fields', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [localApiDomain]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

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
  const responseData = {
    ok: true,
    users: [
      {
        id: 1,
        name: 'Ada',
        active: true
      }
    ]
  };

  await page.route('**/datasource-schema**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });

  await expect(page.getByTestId('datasource-domain')).toHaveValue('local');
  await page.getByTestId('datasource-path').fill('/datasource-schema');
  await page.getByTestId('datasource-method').selectOption('POST');

  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-0').fill('X-Schema');
  await page.getByTestId('datasource-header-value-0').fill('demo-schema');

  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-0').fill('token');
  await page.getByTestId('datasource-query-value-0').fill('abc');

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('name');
  await page.getByTestId('datasource-body-value-0').fill('Ada');
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-1').fill('count');
  await page.getByTestId('datasource-body-type-1').selectOption('number');
  await page.getByTestId('datasource-body-value-1').fill('2');
  await addResponseExampleCard(page);

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/datasource-schema') && request.method() === 'POST'
  );
  await page.getByTestId('datasource-json-schema-parse-button').click();
  const responseMockDialog = page.getByTestId('datasource-response-mock-dialog');
  await expect(responseMockDialog).toBeVisible();
  await expect(responseMockDialog).toContainText('Header');
  await expect(responseMockDialog).toContainText('Query');
  await expect(responseMockDialog).toContainText('Body');
  await responseMockDialog.getByTestId('datasource-response-mock-header-0').fill('mock-schema');
  await responseMockDialog.getByTestId('datasource-response-mock-query-0').fill('mock-token');
  await responseMockDialog.getByTestId('datasource-response-mock-body-0').fill('Mock Ada');
  await responseMockDialog.getByTestId('datasource-response-mock-body-1').fill('3');
  await responseMockDialog.getByTestId('datasource-response-mock-submit').click();
  const request = await requestPromise;

  expect(request.url()).toContain('token=mock-token');
  expect(request.headers()['x-schema']).toBe('mock-schema');
  expect(request.headers()['content-type']).toContain('application/json');
  expect(request.postDataJSON()).toEqual({
    name: 'Mock Ada',
    count: 3
  });
  await expect(page.getByTestId('datasource-response-example')).toHaveValue(JSON.stringify(responseData, null, 2));
  await expect(page.getByTestId('datasource-list-field-users[].id')).toHaveCount(0);
  await page.getByTestId('datasource-response-schema-select-button').click();
  await expect(page.getByTestId('datasource-list-field-users[]')).toBeVisible();
  await expect(page.getByTestId('datasource-form-field-ok')).toBeVisible();
  await page.getByTestId('datasource-form-field-add-ok').click();
  await setSchemaPathDepth(page, 2);
  await expect(page.getByTestId('datasource-list-field-users[].id')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-users[].name')).toBeVisible();
  await page.getByTestId('datasource-list-field-add-users[].id').click();
  const fullSchemaDialog = await openFullSchema(page);
  await expect(fullSchemaDialog.getByTestId('datasource-json-schema')).toHaveValue(JSON.stringify(apiSchema, null, 2));
  await closeFullSchema(fullSchemaDialog);

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toEqual({
    type: 'API',
    domain: 'local',
    path: '/datasource-schema',
    method: 'POST',
    headerData: [
      {
        key: 'X-Schema',
        value: 'demo-schema'
      }
    ],
    bodyData: [
      {
        key: 'name',
        dataType: 'string',
        value: 'Ada'
      },
      {
        key: 'count',
        dataType: 'number',
        value: 2
      }
    ],
    queryData: [
      {
        key: 'token',
        value: 'abc'
      }
    ],
    schemaSelections: [
      { label: 'ok', path: 'ok', type: 'boolean' },
      { label: 'id', path: 'users[].id', type: 'number' }
    ]
  });
});

test('uploads API datasource file body params as multipart form data', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [localApiDomain]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

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

  await expect(page.getByTestId('datasource-domain')).toHaveValue('local');
  await page.getByTestId('datasource-path').fill('/datasource-upload');
  await page.getByTestId('datasource-method').selectOption('POST');

  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-0').fill('Content-Type');
  await page.getByTestId('datasource-header-value-0').fill('application/json');
  await page.getByTestId('datasource-header-add').click();
  await page.getByTestId('datasource-header-key-1').fill('X-Demo');
  await page.getByTestId('datasource-header-value-1').fill('multipart-demo');

  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('avatar');
  await page.getByTestId('datasource-body-type-0').selectOption('file');
  await page.getByTestId('datasource-body-value-0').setInputFiles({
    name: 'avatar.txt',
    mimeType: 'text/plain',
    buffer: fileBuffer
  });
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-1').fill('count');
  await page.getByTestId('datasource-body-type-1').selectOption('number');
  await page.getByTestId('datasource-body-value-1').fill('2');
  await addResponseExampleCard(page);

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/datasource-upload') && request.method() === 'POST'
  );
  await page.getByTestId('datasource-json-schema-parse-button').click();
  const responseMockDialog = page.getByTestId('datasource-response-mock-dialog');
  await expect(responseMockDialog).toBeVisible();
  await responseMockDialog.getByTestId('datasource-response-mock-header-1').fill('mock-multipart');
  await responseMockDialog.getByTestId('datasource-response-mock-body-0').setInputFiles({
    name: 'mock-avatar.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('hello mock multipart')
  });
  await responseMockDialog.getByTestId('datasource-response-mock-body-1').fill('3');
  await responseMockDialog.getByTestId('datasource-response-mock-submit').click();
  const request = await requestPromise;

  const contentType = request.headers()['content-type'] ?? '';
  const postData = request.postData() ?? '';
  expect(contentType).toContain('multipart/form-data');
  expect(contentType).not.toContain('application/json');
  expect(request.headers()['x-demo']).toBe('mock-multipart');
  expect(postData).toContain('name="avatar"');
  expect(postData).toContain('filename="mock-avatar.txt"');
  expect(postData).toContain('hello mock multipart');
  expect(postData).toContain('name="count"');
  expect(postData).toContain('3');
  await page.getByTestId('datasource-response-schema-select-button').click();
  const fullSchemaDialog = await openFullSchema(page);
  await expect(fullSchemaDialog.getByTestId('datasource-json-schema')).toHaveValue(JSON.stringify(apiSchema, null, 2));
  await closeFullSchema(fullSchemaDialog);
});

test('requires selecting a file before generating API datasource schema', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [localApiDomain]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

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

  await expect(page.getByTestId('datasource-domain')).toHaveValue('local');
  await page.getByTestId('datasource-path').fill('/datasource-missing-file');
  await page.getByTestId('datasource-method').selectOption('POST');
  await page.getByTestId('datasource-body-add').click();
  await page.getByTestId('datasource-body-key-0').fill('avatar');
  await page.getByTestId('datasource-body-type-0').selectOption('file');
  await addResponseExampleCard(page);

  await page.getByTestId('datasource-json-schema-parse-button').click();
  const responseMockDialog = page.getByTestId('datasource-response-mock-dialog');
  await expect(responseMockDialog).toBeVisible();
  await responseMockDialog.getByTestId('datasource-response-mock-submit').click();

  await expect(responseMockDialog).toContainText('请选择 Body 中的文件。');
  await expect(responseMockDialog.getByTestId('datasource-response-mock-error')).toContainText('请先修正请求 Mock 数据。');
  expect(requestCount).toBe(0);
});

test('parses API datasource response with mixed array item fields into anyOf JSON Schema', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [localApiDomain]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

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
              value: {
                data: [
                  {
                    tag: '设计',
                    name: 'Mokelay 页面'
                  }
                ]
              },
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

  await expect(page.getByTestId('datasource-domain')).toHaveValue('local');
  await page.getByTestId('datasource-path').fill('/api/mokelay/list_pages');

  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-0').fill('pageSize');
  await page.getByTestId('datasource-query-value-0').fill('2');
  await page.getByTestId('datasource-query-add').click();
  await page.getByTestId('datasource-query-key-1').fill('page');
  await page.getByTestId('datasource-query-value-1').fill('2');
  await addResponseExampleCard(page);

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/api/mokelay/list_pages') && request.method() === 'GET'
  );
  await page.getByTestId('datasource-json-schema-parse-button').click();
  const responseMockDialog = page.getByTestId('datasource-response-mock-dialog');
  await expect(responseMockDialog).toBeVisible();
  await responseMockDialog.getByTestId('datasource-response-mock-submit').click();
  const request = await requestPromise;

  expect(request.url()).toContain('pageSize=2');
  expect(request.url()).toContain('page=2');
  await expect(page.getByTestId('datasource-json-schema-error')).toHaveCount(0);
  await page.getByTestId('datasource-response-schema-select-button').click();
  await setSchemaPathDepth(page, 2);
  await expect(page.getByTestId('datasource-list-field-pages[].uuid')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-pages[].name')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-pages[].blocks[]')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-pages[].blocks[]').locator('.ce-datasource-tool__schema-badge'))
    .toHaveText(['列表']);
  await expect(page.getByTestId('datasource-list-field-pages[].created_at')).toBeVisible();

  const fullSchemaDialog = await openFullSchema(page);
  const generatedSchema = JSON.parse(await fullSchemaDialog.getByTestId('datasource-json-schema').inputValue()) as any;
  const valueAnyOf = generatedSchema.properties.pages.items.properties.blocks.items.properties.data.properties.value.anyOf;
  const fixedAnyOf = generatedSchema.properties.pages.items.properties.blocks.items.properties.data.properties.columns.items.properties.fixed.anyOf;

  expect(valueAnyOf.map((item: { type: string }) => item.type)).toEqual(['string', 'array', 'object']);
  expect(fixedAnyOf.map((item: { type: string }) => item.type)).toEqual(['string', 'null']);
  await closeFullSchema(fullSchemaDialog);
});

test('parses API datasource response with empty arrays into JSON Schema', async ({ page }) => {
  await resetEditor(page, {
    apiDomains: [localApiDomain]
  });
  await switchLocaleToChinese(page);
  await addEditorTool(page, '数据源编辑器');
  await openDatasourceSettings(page);

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
        value: 'true'
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
            value: {
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

  await expect(page.getByTestId('datasource-domain')).toHaveValue('local');
  await page.getByTestId('datasource-path').fill('/datasource-api-config');
  await addResponseExampleCard(page);

  await page.getByTestId('datasource-json-schema-parse-button').click();

  await expect(page.getByTestId('datasource-json-schema-error')).toHaveCount(0);
  await page.getByTestId('datasource-response-schema-select-button').click();
  await setSchemaPathDepth(page, 2);
  await expect(page.getByTestId('datasource-list-field-queryData[].key')).toBeVisible();
  await expect(page.getByTestId('datasource-list-field-queryData[].value')).toBeVisible();

  const fullSchemaDialog = await openFullSchema(page);
  await expect(fullSchemaDialog.getByTestId('datasource-json-schema')).toHaveValue(JSON.stringify(expectedSchema, null, 2));
  await closeFullSchema(fullSchemaDialog);
});

test('normalizes a saved JSON datasource to the default API config', async ({ page }) => {
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
  await expect(page.getByTestId('datasource-settings-open')).toBeVisible();
  await expect(page.getByTestId('datasource-summary')).toContainText('API');
  await expect(page.getByTestId('datasource-api-panel')).not.toBeVisible();
  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-api-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-raw-data')).toHaveCount(0);
  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  expect(getDatasourceValue(await getSavedBlocks(page))).toEqual({
    type: 'API',
    domain: 'mokelay',
    path: '',
    method: 'GET',
    headerData: [],
    bodyData: [],
    queryData: []
  });

  await closeDatasourceSettings(page);
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('datasource-settings-open')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('migrates a saved API datasource host to a matching domain uuid', async ({ page }) => {
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-api-legacy-host',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'https://api.mokelay.com/',
            path: '/v1/users',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: []
          }
        }
      }
    ]
  });

  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page));
  expect(datasourceValue).toMatchObject({
    type: 'API',
    domain: 'mokelay',
    path: '/v1/users'
  });
});

test('clears an unmatched saved API datasource host and blocks execution', async ({ page }) => {
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'datasource-api-unknown-host',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'https://unknown.example.com',
            path: '/v1/users',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: []
          }
        }
      }
    ]
  });
  await switchLocaleToChinese(page);

  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-domain')).toHaveValue('');
  await addResponseExampleCard(page);
  await page.getByTestId('datasource-json-schema-parse-button').click();

  await expect(page.getByTestId('datasource-json-schema-error')).toContainText('请选择 API 域名');
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
                value: 'Bearer token'
              }
            ],
            bodyData: [
              {
                key: 'limit',
                dataType: 'number',
                value: 20
              },
              {
                key: 'ids',
                dataType: 'array',
                value: [1, 2, 3]
              }
            ],
            queryData: [
              {
                key: 'page',
                value: '1'
              }
            ]
          }
        }
      }
    ]
  });

  await expect(page.getByTestId('editor-datasource-tool')).toBeVisible();
  await expect(page.getByTestId('datasource-summary')).toContainText('/v1/users');
  await openDatasourceSettings(page);
  await expect(page.getByTestId('datasource-api-panel')).toBeVisible();
  await expect(page.getByTestId('datasource-domain')).toHaveValue('mokelay');
  await expect(page.getByTestId('datasource-header-key-0')).toHaveValue('Authorization');
  await expect(page.getByTestId('datasource-body-value-0')).toHaveValue('20');
  await expect(page.getByTestId('datasource-body-value-1')).toHaveValue(JSON.stringify([1, 2, 3], null, 2));

  await closeDatasourceSettings(page);
  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue.headerData).toEqual([{ key: 'Authorization', value: 'Bearer token' }]);
  expect(datasourceValue.bodyData).toEqual([
    { key: 'limit', dataType: 'number', value: 20 },
    { key: 'ids', dataType: 'array', value: [1, 2, 3] }
  ]);
  expect(datasourceValue.queryData).toEqual([{ key: 'page', value: '1' }]);

  await closeDatasourceSettings(page);
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('datasource-header-add')).toHaveCount(0);
  await expect(page.getByTestId('datasource-body-remove-0')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('keeps the datasource editor out of the runtime registry without saving runtime fields', async ({ page }) => {
  const responseData = {
    items: [
      {
        name: 'Ada Lovelace'
      }
    ],
    page: 2,
    pageSize: 1,
    total: 3
  };

  await page.route('**/datasource-runtime-data', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'runtime-datasource',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'mokelay',
            path: '/datasource-runtime-data',
            method: 'GET',
            headerData: [],
            bodyData: [],
            queryData: [],
            schemaSelections: [
              {
                label: '列表数据',
                path: 'items[]',
                type: 'array'
              },
              {
                label: '当前页',
                path: 'page',
                type: 'number'
              },
              {
                label: '每页条数',
                path: 'pageSize',
                type: 'number'
              },
              {
                label: '总数',
                path: 'total',
                type: 'number'
              }
            ],
            matchingExternalFields: [
              {
                label: '列表数据',
                variable: 'data',
                matchFieldPath: 'items[]'
              },
              {
                label: '当前页',
                variable: 'page',
                matchFieldPath: 'page'
              },
              {
                label: '每页条数',
                variable: 'pageSize',
                matchFieldPath: 'pageSize'
              },
              {
                label: '总数',
                variable: 'total',
                matchFieldPath: 'total'
              }
            ]
          }
        }
      },
      {
        id: 'runtime-button',
        type: 'MButton',
        data: {
          label: 'Load data',
          variant: 'primary',
          align: 'left',
          action: { type: 'submit' }
        },
        events: [
          {
            event: 'click',
            actions: [
              {
                uuid: 'load_runtime_datasource',
                action: 'call_block_method',
                inputs: {
                  blockId: 'runtime-datasource',
                  method: 'getData'
                },
                nextAction: null
              }
            ]
          }
        ]
      }
    ]
  });

  await page.getByTestId('save-button').click();
  const datasourceValue = getDatasourceValue(await getSavedBlocks(page)) as any;
  expect(datasourceValue).not.toHaveProperty('data');
  expect(datasourceValue).not.toHaveProperty('page');
  expect(datasourceValue).not.toHaveProperty('pageSize');
  expect(datasourceValue).not.toHaveProperty('total');

  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('editor-datasource-tool')).toHaveCount(0);
});

test('resolves MAdvanceTable self scoped page variables in its datasource request', async ({ page }) => {
  const responseData = {
    rows: [
      {
        name: 'Ada'
      }
    ],
    page: 1,
    pageSize: 10,
    total: 1
  };

  await page.route('**/advance-table-self-runtime**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/advance-table-self-runtime') && request.method() === 'GET'
  );
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [{
      id: 'self-advance-table',
      type: 'MAdvanceTable',
      data: {
        columns: [{
          columnName: '名称',
          columnContent: [{
            id: 'self-table-name',
            type: 'paragraph',
            data: {
              text: '{{name}}'
            }
          }]
        }],
        ds: {
          type: 'API',
          domain: 'mokelay',
          path: '/advance-table-self-runtime',
          method: 'GET',
          headerData: [],
          bodyData: [],
          queryData: [
            {
              key: 'page',
              value: {
                mode: 'variable',
                blockId: 'self-advance-table',
                blockType: 'MAdvanceTable',
                variable: 'page'
              }
            },
            {
              key: 'pageSize',
              value: {
                mode: 'variable',
                blockId: 'self-advance-table',
                blockType: 'MAdvanceTable',
                variable: 'pageSize'
              }
            }
          ],
          schemaSelections: [
            { label: '列表数据', path: 'rows[]', type: 'array' },
            { label: '当前页', path: 'page', type: 'number' },
            { label: '每页条数', path: 'pageSize', type: 'number' },
            { label: '总数', path: 'total', type: 'number' }
          ],
          matchingExternalFields: [
            { label: '列表数据', variable: 'data', matchFieldPath: 'rows[]' },
            { label: '当前页', variable: 'page', matchFieldPath: 'page' },
            { label: '每页条数', variable: 'pageSize', matchFieldPath: 'pageSize' },
            { label: '总数', variable: 'total', matchFieldPath: 'total' }
          ]
        }
      }
    }]
  });

  const request = await requestPromise;

  expect(request.url()).toContain('page=1');
  expect(request.url()).toContain('pageSize=10');
  await expect(page.getByTestId('advance-table')).toContainText('Ada');
});

test('does not execute editor-only datasource blocks in runtime preview', async ({ page }) => {
  const responseData = { ok: true };

  await page.route('**/datasource-variable-runtime**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'source-input',
        type: 'MInput',
        data: {
          placeholder: 'token',
          value: 'mokelay-token'
        }
      },
      {
        id: 'variable-runtime-datasource',
        type: 'MDatasourceEditor',
        data: {
          value: {
            type: 'API',
            domain: 'mokelay',
            path: '/datasource-variable-runtime',
            method: 'POST',
            headerData: [{
              key: 'X-Token',
              value: {
                mode: 'variable',
                blockId: 'source-input',
                blockType: 'MInput',
                variable: 'value'
              }
            }],
            queryData: [{
              key: 'token',
              value: {
                mode: 'variable',
                blockId: 'source-input',
                blockType: 'MInput',
                variable: 'value'
              }
            }],
            bodyData: [{
              key: 'token',
              dataType: 'string',
              value: {
                mode: 'variable',
                blockId: 'source-input',
                blockType: 'MInput',
                variable: 'value'
              }
            }]
          }
        }
      }
    ]
  });

  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-block-MInput')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor')).toBeVisible();
  await expect(page.getByTestId('preview-block-MDatasourceEditor').getByTestId('editor-datasource-tool')).toHaveCount(0);
});
