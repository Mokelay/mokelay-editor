import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  openToolPropertyPanel,
  resetEditor,
  switchLocaleToChinese,
  type MockMokelayApi,
  type MockMokelayLayout,
  type MockMokelayPage
} from './helpers/editor';

const serverRoot = resolve(process.cwd(), '../mokelay-server/server/assets');
const pageUuids = [
  'setting',
  'setting_enterprise_page',
  'setting_employees_page',
  'setting_employee_auth_identities_page',
  'mokelay_apis_system_tabs_page',
  'mokelay_apis_system_page',
  'mokelay_apis_system_fragment_page',
  'mokelay_system_page',
  'mokelay_layouts_system_page',
  'mokelay_layout_system_editor_page'
];

function readJsonAsset<T>(assetPath: string): T {
  return JSON.parse(readFileSync(resolve(serverRoot, assetPath), 'utf8')) as T;
}

function readSystemPage(uuid: string): MockMokelayPage {
  return readJsonAsset<MockMokelayPage>(`mokelay/pages/${uuid}.json`);
}

function readSystemLayout(uuid: string): MockMokelayLayout {
  const layoutJson = readJsonAsset<Record<string, unknown>>(`mokelay/layouts/${uuid}.json`);
  return { uuid, name: String(layoutJson.name || uuid), layoutJson };
}

function systemApi(uuid: string, name: string, options: { assetApp?: string; fragment?: boolean } = {}): MockMokelayApi {
  const fragment = options.fragment ?? false;
  return {
    uuid,
    name,
    method: fragment ? 'FRAGMENT' : 'GET',
    fragment,
    assetApp: options.assetApp ?? 'mokelay',
    status: 'published',
    source: 'system',
    apiJson: {
      uuid,
      alias: name,
      ...(fragment ? { fragment: true, params: [] } : { method: 'GET' }),
      blocks: [{ uuid: 'starter', nextBlock: null }],
      response: {}
    }
  };
}

test('hosts built-in APIs, pages, and layouts under setting tabs', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/setting?section=system-apis',
    systemPages: pageUuids.map(readSystemPage),
    systemLayouts: [readSystemLayout('mokelay_layout'), readSystemLayout('web_layout')],
    systemApis: [systemApi('system_health', '系统健康检查')],
    seedDefaultPage: false
  });

  await expect(page.getByTestId('editor-tabs-tab-system-apis')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('cell', { name: '系统健康检查' })).toBeVisible();
  await expect(page.getByRole('button', { name: '新建 API' })).toHaveCount(0);

  await page.getByTestId('editor-tabs-tab-system-pages').click();
  await expect(page).toHaveURL(/#\/setting\?section=system-pages$/);
  await expect(page.getByTestId('editor-tabs-tab-system-pages')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('系统内置页面', { exact: true })).toBeVisible();

  await page.getByTestId('editor-tabs-tab-system-layouts').click();
  await expect(page).toHaveURL(/#\/setting\?section=system-layouts$/);
  await expect(page.getByTestId('editor-tabs-tab-system-layouts')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('cell', { name: 'Mokelay编辑器布局' })).toBeVisible();
});

for (const assetApp of ['mokelay', 'lark']) {
  for (const fragment of [false, true]) {
    test(`opens ${assetApp} system ${fragment ? 'Fragment' : 'API'} from its DSL list`, async ({ page }) => {
      const apis = ['mokelay', 'lark'].map((app) => systemApi(`${app}_health`, `${app} 健康检查`, { assetApp: app }));
      const fragments = ['mokelay', 'lark'].map((app) => systemApi(`${app}_prepare`, `${app} 初始化片段`, { assetApp: app, fragment: true }));
      const record = (fragment ? fragments : apis).find((api) => api.assetApp === assetApp)!;
      const listHash = `/setting?section=system-apis${fragment ? '&fragment=true' : ''}`;
      const apiState = await resetEditor(page, {
        initialRoute: `/#${listHash}`,
        systemPages: pageUuids.map(readSystemPage),
        systemLayouts: [readSystemLayout('mokelay_layout')],
        systemApis: apis,
        systemFragments: fragments,
        seedDefaultPage: false
      });

      await page.getByTestId(`open-system-${fragment ? 'fragment' : 'api'}-${record.uuid}`).click();

      await expect(page).toHaveURL(`http://127.0.0.1:4173/#/apis/${record.uuid}?source=system&assetApp=${assetApp}${fragment ? '&fragment=true' : ''}`);
      await expect.poll(() => apiState.systemApiReadRequests.some((request) => {
        const query = new URL(request).searchParams;
        return query.get('uuid') === record.uuid && query.get('assetApp') === assetApp
          && query.get('fragment') === String(fragment);
      })).toBe(true);
      await expect(page.getByRole('heading', { name: record.name, exact: true })).toBeVisible();
      await expect(page.getByText('系统内置接口为只读', { exact: false })).toBeVisible();
      await expect(page.getByRole('button', { name: '保存', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: '发布', exact: true })).toHaveCount(0);
      await expect(page.getByText('Action template variable was not found:', { exact: false })).toHaveCount(0);

      await page.getByRole('button', { name: '返回 API 列表', exact: true }).click();
      await expect(page).toHaveURL(`http://127.0.0.1:4173/#${listHash}`);
      await expect(page.getByTestId(`editor-tabs-tab-system-${fragment ? 'fragment' : 'api'}`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('cell', { name: record.name, exact: true })).toBeVisible();
    });
  }
}

test('preserves system API navigation through visual editing, saving, and reloading', async ({ page }) => {
  const editablePage = { ...readSystemPage('mokelay_apis_system_page'), uuid: 'system_api_roundtrip' };
  const record = systemApi('lark_roundtrip', '保存后打开 Lark 接口', { assetApp: 'lark' });
  const apiState = await resetEditor(page, {
    initialRoute: `/#/pages/${editablePage.uuid}`,
    pages: [editablePage],
    systemLayouts: [readSystemLayout('mokelay_layout')],
    systemApis: [record],
    seedDefaultPage: false
  });
  await switchLocaleToChinese(page);

  const properties = await openToolPropertyPanel(page, 'editor-advance-table-tool');
  await properties.getByTestId('tool-property-input-index').check();
  await properties.getByTestId('tool-property-close').click();
  await page.getByTestId('save-button').click();
  await expect.poll(() => apiState.pageUpdatePayloads.length).toBe(1);

  const savedTable = apiState.pages.get(editablePage.uuid)?.blocks.find((block) => block.type === 'MAdvanceTable');
  expect(savedTable?.data).toMatchObject({
    index: true,
    columns: expect.arrayContaining([
      expect.objectContaining({
        columnContent: expect.arrayContaining([
          expect.objectContaining({
            type: 'MButton',
            data: expect.objectContaining({ action: { uuid: '{{uuid}}', assetApp: '{{assetApp}}' } })
          })
        ])
      })
    ])
  });

  await page.reload();
  const reloadedProperties = await openToolPropertyPanel(page, 'editor-advance-table-tool');
  await expect(reloadedProperties.getByTestId('tool-property-input-index')).toBeChecked();
  await reloadedProperties.getByTestId('tool-property-close').click();
  await page.getByTestId('preview-button').click();
  await page.getByTestId(`open-system-api-${record.uuid}`).click();
  await expect(page).toHaveURL(`http://127.0.0.1:4173/#/apis/${record.uuid}?source=system&assetApp=lark`);
  await expect(page.getByRole('heading', { name: record.name, exact: true })).toBeVisible();
});

test('removes built-in source tabs from APIs, pages, and layouts', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/app?uuid=console',
    apps: [{ id: 1, uuid: 'console', alias: 'Console', description: 'Internal tools' }],
    systemPages: [
      readSystemPage('app'),
      readSystemPage('mokelay_apis_user_tabs_page'),
      readSystemPage('mokelay_apis_user_page'),
      readSystemPage('mokelay_apis_user_fragment_page'),
      readSystemPage('mokelay_list_page'),
      readSystemPage('layouts')
    ],
    systemLayouts: [readSystemLayout('mokelay_layout')],
    seedDefaultPage: false
  });

  for (const tab of ['apis', 'pages']) {
    await page.getByTestId(`editor-tabs-tab-${tab}`).click();
    await expect(page.getByTestId(`editor-tabs-tab-${tab}`)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('editor-tabs-tab-system-built-in')).toHaveCount(0);
    await expect(page.getByTestId('editor-tabs-tab-user-create')).toHaveCount(0);
  }

  await page.goto('/#/layouts');
  await expect(page.getByTestId('not-found-page')).toHaveCount(0);
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByTestId('editor-tabs-tab-system-built-in')).toHaveCount(0);
  await expect(page.getByTestId('editor-tabs-tab-user-create')).toHaveCount(0);
});
