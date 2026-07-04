import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  resetEditor,
  type MockMokelayLayout,
  type MockMokelayPage
} from './helpers/editor';

const serverRoot = resolve(process.cwd(), '../mokelay-server/server/assets');
const layoutPageUuids = [
  'layouts',
  'mokelay_layouts_user_page',
  'mokelay_layouts_system_page',
  'mokelay_layout_create_page',
  'mokelay_layout_user_editor_page',
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
  return {
    uuid,
    name: typeof layoutJson.name === 'string' ? layoutJson.name : uuid,
    layoutJson,
    createdAt: typeof layoutJson.createdAt === 'string' ? layoutJson.createdAt : undefined,
    updatedAt: typeof layoutJson.updatedAt === 'string' ? layoutJson.updatedAt : undefined
  };
}

function mockLayout(uuid: string, name: string): MockMokelayLayout {
  return {
    uuid,
    name,
    layoutJson: {
      schemaVersion: 1,
      uuid,
      name,
      blocks: [
        {
          id: 'page-slot',
          type: 'MPageSlot',
          data: {
            name: 'default'
          }
        }
      ]
    },
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z'
  };
}

test('renders layouts as Page DSL and manages user/system layout tabs', async ({ page }) => {
  const userLayout = mockLayout('user_layout', '用户布局');
  const apiState = await resetEditor(page, {
    initialRoute: '/#/layouts',
    systemPages: layoutPageUuids.map(readSystemPage),
    layouts: [userLayout],
    systemLayouts: [
      readSystemLayout('mokelay_layout'),
      readSystemLayout('web_layout'),
      readSystemLayout('internal_admin_layout')
    ],
    seedDefaultPage: false
  });

  await expect(page).toHaveURL(/#\/layouts$/);
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('editor-tabs-tab-user-create')).toContainText('用户创建');
  await expect(page.getByTestId('editor-tabs-tab-system-built-in')).toContainText('系统内置');
  await expect(page.getByRole('cell', { name: '用户布局' })).toBeVisible();

  await page.getByTestId('m-action-toolbar-action-create').click();
  const createDialog = page.getByTestId('action-dialog');
  await expect(createDialog).toContainText('创建布局');
  await createDialog.getByTestId('mokelay-layout-create-uuid-input').fill('created_layout');
  await createDialog.getByTestId('mokelay-layout-create-name-input').fill('创建布局');
  await createDialog.getByRole('button', { name: '保存布局' }).click();
  await expect(createDialog).toHaveCount(0);
  await expect(page.getByRole('cell', { name: '创建布局' })).toBeVisible();
  expect(apiState.layouts.get('created_layout')).toMatchObject({ name: '创建布局' });

  await page.getByRole('row', { name: /用户布局/ }).getByRole('button', { name: '打开' }).click();
  const editDialog = page.getByTestId('action-dialog');
  await expect(editDialog).toContainText('编辑布局');
  await editDialog.getByTestId('mokelay-layout-edit-name-input').fill('用户布局已更新');
  await editDialog.getByRole('button', { name: '保存布局' }).click();
  await expect(editDialog).toHaveCount(0);
  await expect(page.getByRole('cell', { name: '用户布局已更新' })).toBeVisible();
  expect(apiState.layouts.get('user_layout')).toMatchObject({ name: '用户布局已更新' });

  await page.getByRole('row', { name: /用户布局已更新/ }).getByRole('button', { name: '删除' }).click();
  await expect(page.getByTestId('global-call-confirm')).toBeVisible();
  await expect(page.getByTestId('global-call-dialog-content')).toContainText('用户布局已更新');
  await page.getByTestId('global-call-ok').click();
  await expect(page.getByRole('cell', { name: '用户布局已更新' })).toHaveCount(0);
  expect(apiState.layouts.has('user_layout')).toBe(false);
  expect(apiState.layoutDeletePayloads).toContainEqual({ uuid: 'user_layout' });

  await page.getByTestId('editor-tabs-tab-system-built-in').click();
  await expect(page.getByRole('cell', { name: 'Mokelay编辑器布局' })).toBeVisible();
  await page.getByRole('row', { name: /Mokelay编辑器布局/ }).getByRole('button', { name: '打开' }).click();
  const systemDialog = page.getByTestId('action-dialog');
  await expect(systemDialog).toContainText('查看内置布局');
  await expect(systemDialog.getByRole('button', { name: '保存布局' })).toHaveCount(0);
  await systemDialog.getByTestId('m-json-editor-control').fill('{\\n  \"schemaVersion\": 1,\\n  \"uuid\": \"local_only\",\\n  \"name\": \"本地编辑\",\\n  \"blocks\": []\\n}');
  expect(apiState.systemLayouts.get('mokelay_layout')).toMatchObject({ name: 'Mokelay编辑器布局' });
});
