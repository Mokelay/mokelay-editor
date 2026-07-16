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
const apiPageUuids = [
  'apis',
  'mokelay_apis_user_tabs_page',
  'mokelay_apis_user_page',
  'mokelay_apis_user_fragment_page',
  'mokelay_fragment_create_page',
  'mokelay_apis_system_tabs_page',
  'mokelay_apis_system_page',
  'mokelay_apis_system_fragment_page'
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

function mockApi(
  uuid: string,
  name: string,
  options: { fragment?: boolean; source?: 'user' | 'system' } = {}
): MockMokelayApi {
  const fragment = options.fragment === true;
  const source = options.source ?? 'user';
  const apiJson = {
    uuid,
    alias: name,
    name,
    fragment,
    ...(fragment ? { params: [] } : { method: 'POST' }),
    blocks: [],
    outputs: []
  };

  return {
    uuid,
    name,
    method: fragment ? 'FRAGMENT' : 'POST',
    fragment,
    status: 'published',
    source,
    apiJson
  };
}

function hasListRequest(
  requests: string[],
  pathname: string,
  fragment: boolean
) {
  return requests.some((requestUrl) => {
    const url = new URL(requestUrl);
    return url.pathname === pathname
      && url.searchParams.get('fragment') === String(fragment);
  });
}

test('renders user API and Fragment lists without the relocated system tab', async ({ page }) => {
  const userApi = mockApi('user_api_record', '用户 API 记录');
  const userFragment = mockApi('user_fragment_record', '用户 Fragment 记录', { fragment: true });
  const systemApi = mockApi('system_api_record', '系统 API 记录', { source: 'system' });
  const systemFragment = mockApi('system_fragment_record', '系统 Fragment 记录', {
    fragment: true,
    source: 'system'
  });
  const apiState = await resetEditor(page, {
    initialRoute: '/#/apis',
    systemPages: apiPageUuids.map(readSystemPage),
    systemLayouts: [readSystemLayout('mokelay_layout')],
    apis: [userApi, userFragment],
    systemApis: [systemApi],
    systemFragments: [systemFragment],
    seedDefaultPage: false
  });

  const userSourceTab = page.getByTestId('editor-tabs-tab-user-create');
  await expect(page.getByTestId('editor-tabs-tab-system-built-in')).toHaveCount(0);
  await expect(userSourceTab).toBeHidden();
  await expect(page.getByTestId('editor-tabs-tab-user-api')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('cell', { name: '用户 API 记录' })).toBeVisible();
  await expect(page.getByText('用户 Fragment 记录', { exact: true })).toHaveCount(0);
  await expect(page.getByText('系统 API 记录', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '新建 API' })).toBeVisible();
  await expect(page.getByRole('button', { name: '新建 Fragment' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '删除', exact: true })).toBeVisible();
  const createApiButton = page.getByRole('button', { name: '新建 API' });
  const batchDeleteApiButton = page.getByRole('button', { name: '批量删除' });
  await expect.poll(async () => {
    const [createBox, deleteBox] = await Promise.all([
      createApiButton.boundingBox(),
      batchDeleteApiButton.boundingBox()
    ]);
    return createBox && deleteBox
      ? Math.abs((createBox.y + createBox.height / 2) - (deleteBox.y + deleteBox.height / 2))
      : Number.POSITIVE_INFINITY;
  }).toBeLessThan(2);
  await expect.poll(async () => {
    const [buttonBox, tableBox] = await Promise.all([
      createApiButton.boundingBox(),
      page.getByRole('table').boundingBox()
    ]);
    return buttonBox && tableBox
      ? tableBox.y - (buttonBox.y + buttonBox.height)
      : Number.POSITIVE_INFINITY;
  }).toBeLessThan(12);
  await expect.poll(() => hasListRequest(
    apiState.apiListRequests,
    '/api/mokelay/list_apis',
    false
  )).toBe(true);

  await page.getByTestId('editor-tabs-tab-user-fragment').click();
  await expect(page.getByTestId('editor-tabs-tab-user-fragment')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('cell', { name: '用户 Fragment 记录' })).toBeVisible();
  await expect(page.getByText('用户 API 记录', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '新建 Fragment' })).toBeVisible();
  await expect(page.getByRole('button', { name: '新建 API' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '删除', exact: true })).toBeVisible();
  const createFragmentButton = page.getByRole('button', { name: '新建 Fragment' });
  const batchDeleteFragmentButton = page.getByRole('button', { name: '批量删除' });
  await expect.poll(async () => {
    const [createBox, deleteBox] = await Promise.all([
      createFragmentButton.boundingBox(),
      batchDeleteFragmentButton.boundingBox()
    ]);
    return createBox && deleteBox
      ? Math.abs((createBox.y + createBox.height / 2) - (deleteBox.y + deleteBox.height / 2))
      : Number.POSITIVE_INFINITY;
  }).toBeLessThan(2);
  await expect.poll(() => hasListRequest(
    apiState.apiListRequests,
    '/api/mokelay/list_apis',
    true
  )).toBe(true);

});

test('selects user Page DSL tabs from fragment query combinations', async ({ page }) => {
  const userApi = mockApi('user_api_record', '用户 API 记录');
  const userFragment = mockApi('user_fragment_record', '用户 Fragment 记录', { fragment: true });
  const systemApi = mockApi('system_api_record', '系统 API 记录', { source: 'system' });
  const systemFragment = mockApi('system_fragment_record', '系统 Fragment 记录', {
    fragment: true,
    source: 'system'
  });
  await resetEditor(page, {
    initialRoute: '/#/apis',
    systemPages: apiPageUuids.map(readSystemPage),
    systemLayouts: [readSystemLayout('mokelay_layout')],
    apis: [userApi, userFragment],
    systemApis: [systemApi],
    systemFragments: [systemFragment],
    seedDefaultPage: false
  });

  const cases = [
    {
      url: '/#/apis',
      sourceTab: 'user-create',
      typeTab: 'user-api',
      rowName: '用户 API 记录'
    },
    {
      url: '/#/apis?fragment=true',
      sourceTab: 'user-create',
      typeTab: 'user-fragment',
      rowName: '用户 Fragment 记录'
    }
  ];

  for (const routeCase of cases) {
    await page.goto(routeCase.url);
    await expect(page.getByTestId(`editor-tabs-tab-${routeCase.sourceTab}`)).toBeHidden();
    await expect(page.getByTestId(`editor-tabs-tab-${routeCase.typeTab}`)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('cell', { name: routeCase.rowName })).toBeVisible();
  }
});

test('reuses one trimmed UUID when creating a Fragment from the Page DSL dialog', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/#/apis',
    systemPages: apiPageUuids.map(readSystemPage),
    systemLayouts: [readSystemLayout('mokelay_layout')],
    seedDefaultPage: false
  });

  await page.getByTestId('editor-tabs-tab-user-fragment').click();
  await page.getByRole('button', { name: '新建 Fragment' }).click();

  await page.getByPlaceholder('请输入 Fragment 名称').fill('规范 UUID Fragment');
  await page.getByPlaceholder('例如 fragment_prepare_customer').fill('  fragment_trimmed_uuid  ');
  await page.getByRole('button', { name: '保存并打开' }).click();

  await expect.poll(() => apiState.apiSavePayloads.length).toBe(1);
  const payload = apiState.apiSavePayloads[0];
  expect(payload.uuid).toBe('fragment_trimmed_uuid');
  expect(payload.apiJson).toMatchObject({
    uuid: 'fragment_trimmed_uuid',
    fragment: true
  });
  await expect(page).toHaveURL(/#\/apis\/fragment_trimmed_uuid\?fragment=true$/);
});
