import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  resetEditor,
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
  return readJsonAsset<MockMokelayPage>(`mokelay-pages/${uuid}.json`);
}

function readSystemLayout(uuid: string): MockMokelayLayout {
  const layoutJson = readJsonAsset<Record<string, unknown>>(`mokelay-layouts/${uuid}.json`);
  return { uuid, name: String(layoutJson.name || uuid), layoutJson };
}

function systemApi(uuid: string, name: string): MockMokelayApi {
  return {
    uuid,
    name,
    method: 'GET',
    fragment: false,
    status: 'published',
    source: 'system',
    apiJson: { uuid, alias: name, method: 'GET', blocks: [], outputs: [] }
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

test('removes built-in source tabs from APIs, pages, and layouts', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: '/#/apis',
    systemPages: [
      readSystemPage('apis'),
      readSystemPage('mokelay_apis_user_tabs_page'),
      readSystemPage('mokelay_apis_user_page'),
      readSystemPage('mokelay_apis_user_fragment_page'),
      readSystemPage('pages'),
      readSystemPage('mokelay_list_page'),
      readSystemPage('layouts'),
      readSystemPage('mokelay_layouts_user_page')
    ],
    systemLayouts: [readSystemLayout('mokelay_layout')],
    seedDefaultPage: false
  });

  for (const route of ['apis', 'pages', 'layouts']) {
    await page.goto(`/#/${route}`);
    await expect(page.getByTestId('editor-tabs-tab-system-built-in')).toHaveCount(0);
    await expect(page.getByTestId('editor-tabs-tab-user-create')).toBeHidden();
  }
});
