import { expect, test, type Route } from '@playwright/test';
import {
  openToolPropertyPanel,
  resetEditor,
  seedSavedConfig,
  storageKey,
  type MockMokelayPage
} from './helpers/editor';

const childPage: MockMokelayPage = {
  uuid: 'shared-child-page',
  name: 'Shared child',
  blocks: [{ type: 'paragraph', data: { text: 'Child page content' } }]
};

const systemChildPage: MockMokelayPage = {
  uuid: 'system-child-page',
  name: 'System child',
  layoutUuid: 'mokelay_layout',
  blocks: [{ id: 'system-child-paragraph', type: 'paragraph', data: { text: 'System child content' } }]
};

const systemTabsPage: MockMokelayPage = {
  uuid: 'system-tabs-page',
  name: 'System tabs parent',
  layoutUuid: 'mokelay_layout',
  blocks: [{
    id: 'system-tabs-block',
    type: 'MTabs',
    data: {
      tabs: [{
        id: 'user-child',
        name: 'User child',
        pageUUID: childPage.uuid,
        pageSource: 'user'
      }],
      activeTabId: 'user-child'
    }
  }]
};

const systemActionPage: MockMokelayPage = {
  uuid: 'system-action-page',
  name: 'System action parent',
  layoutUuid: 'mokelay_layout',
  blocks: [{
    id: 'system-actions-block',
    type: 'MActionEditor',
    data: {
      value: [{
        uuid: 'open-system-child',
        action: 'open_dialog',
        inputs: {
          title: 'System child',
          pageUUID: systemChildPage.uuid,
          pageSource: 'system',
          context: {}
        }
      }]
    }
  }]
};

const grandchildPage: MockMokelayPage = {
  uuid: 'shared-grandchild-page',
  name: 'Shared grandchild',
  blocks: [{ type: 'paragraph', data: { text: 'Grandchild page content' } }]
};

const recursiveChildPage: MockMokelayPage = {
  uuid: 'recursive-child-page',
  name: 'Recursive child',
  blocks: [{
    id: 'recursive-child-tabs',
    type: 'MTabs',
    data: {
      tabs: [{
        id: 'grandchild',
        name: 'Grandchild',
        pageUUID: grandchildPage.uuid,
        pageSource: 'user'
      }],
      activeTabId: 'grandchild'
    }
  }]
};

const tabsDoc = {
  uuid: 'doc-MTabs',
  blockType: 'MTabs',
  displayName: '页签',
  status: 'active',
  editorEnabled: true,
  toolboxVisible: true,
  toolbox: { title: { zh: '页签', en: 'Tabs' }, icon: '' },
  defaultData: { tabs: [], activeTabId: '' },
  properties: [{
    key: 'tabs',
    label: '页签配置',
    type: 'component',
    component: 'MTabsConfigEditor',
    configurable: true
  }]
};

const actionEditorDoc = {
  uuid: 'doc-MActionEditor',
  blockType: 'MActionEditor',
  displayName: 'Action配置',
  status: 'active',
  editorEnabled: true,
  toolboxVisible: true,
  editorBlock: false,
  toolbox: { title: 'Action配置', icon: '' },
  defaultData: { value: [] },
  properties: []
};

const pageApiHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json'
};

test('edits an existing user subpage from MTabs without leaving the parent editor', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [childPage],
    systemPages: [systemChildPage],
    clientBlockDocs: [tabsDoc]
  });
  await seedTabs(page, 'user', childPage.uuid);

  const propertyDialog = await openToolPropertyPanel(page, 'editor-tabs-tool');
  await propertyDialog.getByTestId('tabs-config-settings-open').click();
  const tabsDialog = page.getByTestId('tabs-config-dialog');
  await expect(tabsDialog).toBeVisible();
  await tabsDialog.getByTestId('tabs-config-edit-page-0').click();

  const host = page.getByTestId('page-editor-host');
  await expect(host).toBeVisible();
  await expect(host.getByTestId('page-layout-select')).toHaveCount(0);
  await expect(host.getByTestId('page-name-input')).toHaveValue('Shared child');
  await host.getByTestId('page-name-input').fill('Renamed shared child');
  await host.getByTestId('page-editor-save').click();

  await expect(host).not.toBeVisible();
  await expect(tabsDialog).toBeVisible();
  await expect(tabsDialog.getByTestId('tabs-config-edit-page-0')).toBeFocused();
  expect(api.pageUpdatePayloads).toContainEqual(expect.objectContaining({
    uuid: childPage.uuid,
    name: 'Renamed shared child'
  }));
  await expect(page).toHaveURL(/#\/pages\//);
});

test('creates a child page from MTabs and only writes the returned UUID into the parent draft', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [childPage],
    clientBlockDocs: [tabsDoc]
  });
  await seedTabs(page, 'user', childPage.uuid);

  const propertyDialog = await openToolPropertyPanel(page, 'editor-tabs-tool');
  await propertyDialog.getByTestId('tabs-config-settings-open').click();
  const tabsDialog = page.getByTestId('tabs-config-dialog');
  await tabsDialog.getByTestId('tabs-config-create-page-0').click();

  const host = page.getByTestId('page-editor-host');
  await expect(host).toBeVisible();
  const slugInput = host.getByTestId('page-editor-slug-input');
  await expect(slugInput).toHaveValue(/^page_[a-z0-9]{6}$/);
  await slugInput.fill('customer_orders');
  await host.getByTestId('page-name-input').fill('Created child');
  await host.getByTestId('page-editor-save').click();

  await expect(host).not.toBeVisible();
  await expect(tabsDialog.getByTestId('tabs-config-page-uuid-0')).toHaveValue('customer_orders');
  await expect(tabsDialog.getByTestId('tabs-config-relation-notice')).toContainText('待当前页面保存后建立引用关系');
  expect(api.pageCreatePayloads).toHaveLength(1);
  expect(api.pageCreatePayloads[0]).toEqual(expect.objectContaining({
    uuid: 'customer_orders',
    name: 'Created child'
  }));
  expect(api.pageCreatePayloads[0]).not.toHaveProperty('subPage');
  expect(api.pageCreatePayloads[0]).not.toHaveProperty('quotes');
  expect(api.pageCreatePayloads[0]).not.toHaveProperty('dependencies');

  await tabsDialog.getByTestId('tabs-config-save').click();
  await propertyDialog.getByTestId('tool-property-close').click();
  const parentUpdateCount = api.pageUpdatePayloads.length;
  await page.getByTestId('save-button').click();
  await expect.poll(() => api.pageUpdatePayloads.length).toBe(parentUpdateCount + 1);
  const parentBlocks = api.pageUpdatePayloads.at(-1)?.blocks as Array<{
    type?: string;
    data?: { tabs?: Array<Record<string, unknown>> };
  }>;
  expect(parentBlocks.find((block) => block.type === 'MTabs')?.data?.tabs?.[0]).toMatchObject({
    pageUUID: 'customer_orders',
    pageSource: 'user'
  });
});

test('creates an open_dialog child with an editable generated page slug', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [childPage],
    clientBlockDocs: [actionEditorDoc]
  });
  await seedUserDialogAction(page, childPage.uuid);

  await page.getByTestId('m-action-editor-open').click();
  await page.getByTestId('m-action-create-subpage').click();

  const host = page.getByTestId('page-editor-host');
  const slugInput = host.getByTestId('page-editor-slug-input');
  await expect(slugInput).toHaveValue(/^page_[a-z0-9]{6}$/);
  await expect(slugInput).toHaveAttribute('maxlength', '128');
  await slugInput.fill('dialog_customer');
  await host.getByTestId('page-name-input').fill('Dialog customer');
  await host.getByTestId('page-editor-save').click();

  await expect(host).not.toBeVisible();
  await expect(page.getByTestId('m-action-dialog-page')).toHaveValue('user:dialog_customer');
  await expect(page.getByTestId('m-action-relation-notice')).toContainText('待当前页面保存后建立引用关系');
  expect(api.pageCreatePayloads).toContainEqual(expect.objectContaining({
    uuid: 'dialog_customer',
    name: 'Dialog customer'
  }));
});

test('keeps the create frame and slug after a duplicate page slug error', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [childPage],
    clientBlockDocs: [tabsDoc]
  });
  await seedTabs(page, 'user', childPage.uuid);

  const propertyDialog = await openToolPropertyPanel(page, 'editor-tabs-tool');
  await propertyDialog.getByTestId('tabs-config-settings-open').click();
  const tabsDialog = page.getByTestId('tabs-config-dialog');
  await tabsDialog.getByTestId('tabs-config-create-page-0').click();

  const host = page.getByTestId('page-editor-host');
  const slugInput = host.getByTestId('page-editor-slug-input');
  await slugInput.fill('  SHARED-CHILD-PAGE  ');
  await host.getByTestId('page-name-input').fill('Duplicate child');
  await host.getByTestId('page-editor-save').click();

  await expect(host).toBeVisible();
  await expect(host.getByTestId('page-editor-save-error')).toContainText('页面标识已存在');
  await expect(slugInput).toHaveValue('shared-child-page');
  expect(api.pageCreatePayloads).toContainEqual(expect.objectContaining({
    uuid: 'shared-child-page',
    name: 'Duplicate child'
  }));
});

test('keeps a dirty embedded page open when Escape cancellation is dismissed', async ({ page }) => {
  await resetEditor(page, {
    pages: [childPage],
    clientBlockDocs: [actionEditorDoc]
  });
  await seedUserDialogAction(page, childPage.uuid);
  await openActionSubpageEditor(page);

  const host = page.getByTestId('page-editor-host');
  const nameInput = host.getByTestId('page-name-input');
  await expect(nameInput).toHaveValue(childPage.name);
  await nameInput.fill('Dirty child title');

  let cancelMessage = '';
  const dismissed = new Promise<void>((resolve, reject) => {
    page.once('dialog', (dialog) => {
      cancelMessage = dialog.message();
      void dialog.dismiss().then(() => resolve(), reject);
    });
  });
  await page.keyboard.press('Escape');
  await dismissed;
  expect(cancelMessage).toContain('未保存');
  await expect(host).toBeVisible();
  await expect(nameInput).toHaveValue('Dirty child title');

  const accepted = new Promise<void>((resolve, reject) => {
    page.once('dialog', (dialog) => {
      void dialog.accept().then(() => resolve(), reject);
    });
  });
  await page.keyboard.press('Escape');
  await accepted;
  await expect(host).not.toBeVisible();
});

test('retries an embedded subpage load after a structured API failure', async ({ page }) => {
  await resetEditor(page, {
    pages: [childPage],
    clientBlockDocs: [actionEditorDoc]
  });
  await seedUserDialogAction(page, childPage.uuid);

  let shouldFail = true;
  await page.route('**/api/mokelay/read_page_by_uuid**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('uuid') === childPage.uuid && shouldFail) {
      shouldFail = false;
      await fulfillPageApiFailure(route, 'PAGE_READ_FAILED', 'Cannot load embedded page.', {
        pageUuid: childPage.uuid,
        path: 'blocks[0].data.tabs[0]'
      });
      return;
    }
    await route.fallback();
  });

  await openActionSubpageEditor(page);
  const host = page.getByTestId('page-editor-host');
  const error = host.getByTestId('page-editor-load-error');
  await expect(error).toContainText('Cannot load embedded page.');
  await expect(error).toContainText(`页面 UUID: ${childPage.uuid}`);
  await expect(error).toContainText('路径: blocks[0].data.tabs[0]');

  await host.getByTestId('page-editor-retry').click();
  await expect(host.getByTestId('page-name-input')).toHaveValue(childPage.name);
  await expect(host.getByTestId('page-editor-save')).toBeEnabled();
});

test('keeps the embedded draft and retries after a structured save failure', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [childPage],
    clientBlockDocs: [actionEditorDoc]
  });
  await seedUserDialogAction(page, childPage.uuid);

  let shouldFail = true;
  await page.route('**/api/mokelay/update_page_blocks_by_uuid**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('uuid') === childPage.uuid && shouldFail) {
      shouldFail = false;
      await fulfillPageApiFailure(route, 'PAGE_REFERENCE_CYCLE', 'Cannot save embedded page.', {
        pageUuid: childPage.uuid,
        cycle: ['root-page', childPage.uuid, 'root-page']
      });
      return;
    }
    await route.fallback();
  });

  await openActionSubpageEditor(page);
  const host = page.getByTestId('page-editor-host');
  const nameInput = host.getByTestId('page-name-input');
  await nameInput.fill('Retry child title');
  await host.getByTestId('page-editor-save').click();

  const error = host.getByTestId('page-editor-save-error');
  await expect(error).toContainText('Cannot save embedded page.');
  await expect(error).toContainText('root-page → shared-child-page → root-page');
  await expect(nameInput).toHaveValue('Retry child title');

  await host.getByTestId('page-editor-save').click();
  await expect(host).not.toBeVisible();
  expect(api.pageUpdatePayloads).toContainEqual(expect.objectContaining({
    uuid: childPage.uuid,
    name: 'Retry child title'
  }));
});

test('suspends native property dialogs for a recursive frame and restores their draft and focus', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [recursiveChildPage, grandchildPage],
    clientBlockDocs: [tabsDoc]
  });
  await seedTabs(page, 'user', recursiveChildPage.uuid);

  const rootEditor = page.getByTestId('editor-panel');
  const rootTool = rootEditor.locator('.ce-block[data-id="tabs-block"]').getByTestId('editor-tabs-tool').first();
  const rootProperty = await openScopedToolPropertyPanel(rootEditor, rootTool);
  await rootProperty.getByTestId('tabs-config-settings-open').click();
  await rootProperty.getByTestId('tabs-config-edit-page-0').click();

  const host = page.getByTestId('page-editor-host');
  await expect(host).toBeVisible();
  let activeFrame = host.locator('[data-page-editor-frame-active="true"]');
  await expect(activeFrame.getByTestId('page-name-input')).toHaveValue('Recursive child');

  const childProperty = await openFrameToolPropertyPanel(activeFrame, 'editor-tabs-tool');
  await childProperty.getByTestId('tabs-config-settings-open').click();
  const childTabsDialog = childProperty.getByTestId('tabs-config-dialog');
  await expect(childTabsDialog).toBeVisible();
  await childTabsDialog.getByTestId('tabs-config-name-0').fill('Unsaved grandchild tab');
  const nestedTrigger = childTabsDialog.getByTestId('tabs-config-edit-page-0');
  await nestedTrigger.click();

  activeFrame = host.locator('[data-page-editor-frame-active="true"]');
  await expect(host).toContainText('第 2 层');
  await expect(activeFrame.getByTestId('page-name-input')).toHaveValue('Shared grandchild');
  await expect(childProperty).not.toBeVisible();
  await expect(childTabsDialog).not.toBeVisible();

  await activeFrame.getByTestId('page-name-input').fill('Renamed grandchild');
  await host.getByTestId('page-editor-save').click();

  await expect(host).not.toContainText('第 2 层');
  await expect(childProperty).toBeVisible();
  await expect(childTabsDialog).toBeVisible();
  await expect(childTabsDialog.getByTestId('tabs-config-name-0')).toHaveValue('Unsaved grandchild tab');
  await expect(nestedTrigger).toBeFocused();
  expect(api.pageUpdatePayloads).toContainEqual(expect.objectContaining({
    uuid: grandchildPage.uuid,
    name: 'Renamed grandchild'
  }));
});

test('keeps a saved grandchild as an orphan when its dirty parent frame is cancelled', async ({ page }) => {
  const orphanUuid = 'orphan-grandchild-page';
  const api = await resetEditor(page, {
    pages: [recursiveChildPage, grandchildPage],
    clientBlockDocs: [tabsDoc]
  });
  await seedTabs(page, 'user', recursiveChildPage.uuid);

  const rootEditor = page.getByTestId('editor-panel');
  const rootTool = rootEditor.locator('.ce-block[data-id="tabs-block"]').getByTestId('editor-tabs-tool').first();
  const rootProperty = await openScopedToolPropertyPanel(rootEditor, rootTool);
  await rootProperty.getByTestId('tabs-config-settings-open').click();
  await rootProperty.getByTestId('tabs-config-edit-page-0').click();

  const host = page.getByTestId('page-editor-host');
  let activeFrame = host.locator('[data-page-editor-frame-active="true"]');
  const parentProperty = await openFrameToolPropertyPanel(activeFrame, 'editor-tabs-tool');
  await parentProperty.getByTestId('tabs-config-settings-open').click();
  const parentTabsDialog = parentProperty.getByTestId('tabs-config-dialog');
  await parentTabsDialog.getByTestId('tabs-config-create-page-0').click();

  activeFrame = host.locator('[data-page-editor-frame-active="true"]');
  await expect(host).toContainText('第 2 层');
  await activeFrame.getByTestId('page-editor-slug-input').fill(orphanUuid);
  await activeFrame.getByTestId('page-name-input').fill('Saved orphan grandchild');
  await host.getByTestId('page-editor-save').click();

  await expect(host).not.toContainText('第 2 层');
  await expect(parentTabsDialog.getByTestId('tabs-config-page-uuid-0')).toHaveValue(orphanUuid);
  await parentTabsDialog.getByTestId('tabs-config-save').click();
  await parentProperty.getByTestId('tool-property-close').click();

  page.once('dialog', async (dialog) => dialog.accept());
  await host.getByTestId('page-editor-cancel').click();
  await expect(host).not.toBeVisible();

  expect(api.pages.get(orphanUuid)).toMatchObject({
    uuid: orphanUuid,
    name: 'Saved orphan grandchild'
  });
  expect(api.pageUpdatePayloads.some((payload) => payload.uuid === recursiveChildPage.uuid)).toBe(false);
});

test('loads a legacy MTabs pageUuid target and saves it as canonical pageUUID', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [childPage],
    clientBlockDocs: [tabsDoc]
  });
  await seedSavedConfig(page, {
    blocks: [{
      id: 'legacy-tabs-block',
      type: 'MTabs',
      data: {
        tabs: [{ id: 'legacy', name: 'Legacy', pageUuid: childPage.uuid, pageSource: 'user' }],
        activeTabId: 'legacy'
      }
    }]
  });

  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('Child page content');
  const updateCountBeforeSave = api.pageUpdatePayloads.length;
  await page.getByTestId('save-button').click();
  await expect.poll(() => api.pageUpdatePayloads.length).toBe(updateCountBeforeSave + 1);
  const blocks = api.pageUpdatePayloads.at(-1)?.blocks as Array<{ data?: { tabs?: Array<Record<string, unknown>> } }>;
  expect(blocks[0]?.data?.tabs?.[0]).toMatchObject({ pageUUID: childPage.uuid });
  expect(blocks[0]?.data?.tabs?.[0]).not.toHaveProperty('pageUuid');
});

test('blocks parent save when an MTabs target contains both UUID aliases', async ({ page }) => {
  const api = await resetEditor(page, {
    pages: [childPage, grandchildPage],
    clientBlockDocs: [tabsDoc]
  });
  await seedSavedConfig(page, {
    blocks: [{
      id: 'ambiguous-tabs-block',
      type: 'MTabs',
      data: {
        tabs: [{
          id: 'ambiguous',
          name: 'Ambiguous',
          pageUUID: childPage.uuid,
          pageUuid: grandchildPage.uuid,
          pageSource: 'user'
        }],
        activeTabId: 'ambiguous'
      }
    }]
  });

  const updateCountBeforeSave = api.pageUpdatePayloads.length;
  await page.getByTestId('save-button').click();
  await expect(page.getByTestId('editor-error-state')).toContainText('不能同时配置 pageUUID 和 pageUuid');
  await expect(page.getByTestId('editor-error-state')).toContainText('Block: ambiguous-tabs-block');
  await expect(page.getByTestId('editor-error-state')).toContainText('blocks[0].data.tabs[0]');
  expect(api.pageUpdatePayloads).toHaveLength(updateCountBeforeSave);
});

test('opens a system open_dialog target as an editable ephemeral frame', async ({ page }) => {
  const api = await resetEditor(page, {
    systemPages: [systemChildPage],
    clientBlockDocs: [actionEditorDoc]
  });
  await seedSavedConfig(page, {
    blocks: [{
      id: 'actions-block',
      type: 'MActionEditor',
      data: {
        value: [{
          uuid: 'open-system-page',
          action: 'open_dialog',
          inputs: {
            title: 'System',
            pageUUID: systemChildPage.uuid,
            pageSource: 'system',
            context: {}
          }
        }]
      }
    }]
  });

  await page.getByTestId('m-action-editor-open').click();
  await page.getByTestId('m-action-edit-subpage').click();
  const host = page.getByTestId('page-editor-host');
  await expect(host).toBeVisible();
  await expect(host).toContainText('临时编排页面');
  await expect(host.getByTestId('page-editor-ephemeral-notice')).toContainText('不会保存');
  await expect(host.getByTestId('page-editor-save')).toHaveCount(0);
  await expect(host.getByTestId('editor-panel')).toBeVisible();
  await expect(host.getByTestId('page-name-input')).not.toHaveAttribute('readonly', '');
  await host.getByTestId('page-name-input').fill('Temporary system child');
  await host.getByTestId('page-editor-preview-toggle').click();
  await expect(host.getByTestId('embedded-page-preview')).toContainText('System child content');
  await host.getByTestId('page-editor-preview-toggle').click();
  page.once('dialog', async (dialog) => dialog.accept());
  await host.getByTestId('page-editor-cancel').click();
  await expect(host).not.toBeVisible();
  expect(api.pageUpdatePayloads.some((payload) => payload.uuid === systemChildPage.uuid)).toBe(false);
  expect(api.pageCreatePayloads).toHaveLength(0);
});

test('disables child creation throughout a system-page editing session', async ({ page }) => {
  const api = await resetEditor(page, {
    initialRoute: `/#/pages/${systemTabsPage.uuid}?source=system`,
    pages: [childPage],
    systemPages: [systemTabsPage],
    clientBlockDocs: [tabsDoc]
  });

  const propertyDialog = await openToolPropertyPanel(page, 'editor-tabs-tool');
  await propertyDialog.getByTestId('tabs-config-settings-open').click();
  const tabsDialog = page.getByTestId('tabs-config-dialog');
  await expect(tabsDialog.getByTestId('tabs-config-create-page-0')).toBeDisabled();
  await tabsDialog.getByTestId('tabs-config-edit-page-0').click();

  const host = page.getByTestId('page-editor-host');
  await expect(host.getByTestId('page-editor-ephemeral-notice')).toBeVisible();
  await expect(host.getByTestId('page-editor-save')).toHaveCount(0);
  await host.getByTestId('page-name-input').fill('Temporary user child');
  page.once('dialog', async (dialog) => dialog.accept());
  await host.getByTestId('page-editor-cancel').click();

  expect(api.pageCreatePayloads).toHaveLength(0);
  expect(api.pageUpdatePayloads.some((payload) => payload.uuid === childPage.uuid)).toBe(false);
});

test('disables open_dialog child creation on a system page while existing targets remain editable', async ({ page }) => {
  const api = await resetEditor(page, {
    initialRoute: `/#/pages/${systemActionPage.uuid}?source=system`,
    systemPages: [systemActionPage, systemChildPage],
    clientBlockDocs: [actionEditorDoc]
  });

  await page.getByTestId('m-action-editor-open').click();
  await expect(page.getByTestId('m-action-create-subpage')).toBeDisabled();
  await page.getByTestId('m-action-edit-subpage').click();

  const host = page.getByTestId('page-editor-host');
  await expect(host.getByTestId('page-editor-save')).toHaveCount(0);
  await expect(host.getByTestId('page-name-input')).not.toHaveAttribute('readonly', '');
  await host.getByTestId('page-editor-cancel').click();
  await expect(host).not.toBeVisible();
  expect(api.pageCreatePayloads).toHaveLength(0);
  expect(api.pageUpdatePayloads).toHaveLength(0);
});

test('renders a persistent runtime error dialog for an ancestor open_dialog target without loading it', async ({ page }) => {
  await resetEditor(page);
  let targetReadCount = 0;
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/api/mokelay/read_page_by_uuid' && url.searchParams.get('uuid') === 'root-page') {
      targetReadCount += 1;
    }
  });

  await page.evaluate(() => {
    void import('/@id/mokelay-components/actions').then(({ showActionPageDialog }) => showActionPageDialog({
      title: '循环页面',
      pageUUID: 'root-page',
      pageSource: 'user',
      ancestry: ['root-page', 'child-page']
    }));
  });

  const errorDialog = page.getByTestId('action-dialog');
  await expect(errorDialog).toBeVisible();
  await expect(page.getByTestId('action-dialog-reference-error')).toHaveText(
    '检测到循环页面引用：root-page → child-page → root-page'
  );
  expect(targetReadCount).toBe(0);
  await errorDialog.getByTestId('action-dialog-close').click();
  await expect(errorDialog).toHaveCount(0);
});

test('uses the shared page editor block as a temporary editable standalone system page', async ({ page }) => {
  const api = await resetEditor(page, {
    initialRoute: `/#/pages/${systemChildPage.uuid}?source=system`,
    systemPages: [systemChildPage]
  });

  await expect(page.getByTestId('editor-panel')).toBeVisible();
  await expect(page.getByTestId('editor-surface')).toBeVisible();
  await expect(page.getByTestId('system-page-ephemeral-notice')).toContainText('修改不会保存');
  await expect(page.getByTestId('page-name-input')).toHaveValue(systemChildPage.name);
  await expect(page.getByTestId('page-name-input')).not.toHaveAttribute('readonly', '');
  const layoutSelect = page.getByTestId('page-layout-select');
  await expect(layoutSelect).toBeDisabled();
  await expect(layoutSelect).toHaveValue('mokelay_layout');
  await expect(layoutSelect.locator('option:checked')).toHaveText('Mokelay编辑器布局');
  await expect(page.getByTestId('save-button')).toBeDisabled();
  await page.getByTestId('page-name-input').fill('Temporary system title');
  await page.getByTestId('editor-panel').locator('.ce-paragraph[contenteditable="true"]').fill('Temporary system content');
  await page.getByTestId('preview-button').click();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${systemChildPage.uuid}\\/preview\\?source=system$`));
  await expect(page.getByTestId('preview-block-paragraph')).toContainText('Temporary system content');
  await page.getByTestId('back-to-editor-button').click();
  await expect(page.getByTestId('page-name-input')).toHaveValue('Temporary system title');
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
  expect(api.pageUpdatePayloads).toHaveLength(0);
  expect(api.pageLayoutUpdatePayloads).toHaveLength(0);
});

test('confirms before discarding a dirty standalone system-page draft', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: `/#/pages/${systemChildPage.uuid}?source=system`,
    systemPages: [systemChildPage]
  });
  await page.getByTestId('page-name-input').fill('Dirty temporary title');

  const dismissed = new Promise<void>((resolve, reject) => {
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('临时修改');
      void dialog.dismiss().then(resolve, reject);
    });
  });
  await page.getByTestId('back-to-page-list-button').click();
  await dismissed;
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${systemChildPage.uuid}\\?source=system$`));
  await expect(page.getByTestId('page-name-input')).toHaveValue('Dirty temporary title');

  const accepted = new Promise<void>((resolve, reject) => {
    page.once('dialog', (dialog) => {
      void dialog.accept().then(resolve, reject);
    });
  });
  await page.getByTestId('back-to-page-list-button').click();
  await accepted;
  await expect(page).toHaveURL(/#\/pages$/);
});

test('confirms a browser reload and restores the system asset instead of a local draft', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: `/#/pages/${systemChildPage.uuid}?source=system`,
    systemPages: [systemChildPage]
  });
  await page.getByTestId('page-name-input').fill('Discarded on reload');

  const beforeUnloadDialog = new Promise<void>((resolve, reject) => {
    page.once('dialog', (dialog) => {
      expect(dialog.type()).toBe('beforeunload');
      void dialog.accept().then(resolve, reject);
    });
  });
  await page.reload();
  await beforeUnloadDialog;
  await expect(page.getByTestId('page-name-input')).toHaveValue(systemChildPage.name);
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
});

test('shows a UUID fallback when a system page layout is absent from the layout list', async ({ page }) => {
  const missingLayoutPage: MockMokelayPage = {
    ...systemChildPage,
    uuid: 'system-missing-layout-page',
    layoutUuid: 'missing_system_layout'
  };
  await resetEditor(page, {
    initialRoute: `/#/pages/${missingLayoutPage.uuid}?source=system`,
    systemPages: [missingLayoutPage]
  });

  const layoutSelect = page.getByTestId('page-layout-select');
  await expect(layoutSelect).toBeDisabled();
  await expect(layoutSelect).toHaveValue('missing_system_layout');
  await expect(layoutSelect.locator('option:checked')).toHaveText('missing_system_layout');
});

test('keeps the system layout UUID visible when the system layout list fails', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: `/#/pages/${systemChildPage.uuid}?source=system`,
    systemPages: [systemChildPage]
  });
  await page.route('**/api/mokelay/list_mokelay_layout_jsons**', async (route) => {
    await fulfillPageApiFailure(route, 'SYSTEM_LAYOUT_LIST_FAILED', 'System layout list failed.');
  });
  await page.reload();

  const layoutSelect = page.getByTestId('page-layout-select');
  await expect(layoutSelect).toBeDisabled();
  await expect(layoutSelect).toHaveValue('mokelay_layout');
  await expect(layoutSelect.locator('option:checked')).toHaveText('mokelay_layout');
  await expect(page.getByTestId('page-layout-error')).toContainText('System layout list failed.');
});

test('accepts the legacy pageUuid alias but rejects ambiguous and dynamic dialog targets', async ({ page }) => {
  await resetEditor(page);
  const result = await page.evaluate(async () => {
    const { validatePageReferences } = await import('/src/editors/pageReferenceValidator.ts');
    const validate = (inputs: Record<string, unknown>) => validatePageReferences([{
      id: 'button',
      type: 'MButton',
      data: {},
      events: [{
        event: 'click',
        actions: [{ uuid: 'open', action: 'open_dialog', inputs }]
      }]
    }]);
    return {
      legacy: validate({ pageUuid: 'legacy-page', pageSource: 'user' }),
      ambiguous: validate({ pageUUID: 'one', pageUuid: 'two' }),
      dynamic: validate({ pageUuid: '{{event.pageUuid}}' }),
      ambiguousTab: validatePageReferences([{
        id: 'tabs',
        type: 'MTabs',
        data: {
          tabs: [{ id: 'one', name: 'One', pageUUID: 'one', pageUuid: 'two' }]
        }
      }])
    };
  });

  expect(result.legacy.valid).toBe(true);
  expect(result.legacy.references[0]?.uuid).toBe('legacy-page');
  expect(result.ambiguous.issues[0]?.code).toBe('AMBIGUOUS_PAGE_TARGET');
  expect(result.ambiguous.issues[0]).toMatchObject({
    blockId: 'button',
    actionUuid: 'open',
    path: expect.stringContaining('inputs')
  });
  expect(result.dynamic.issues[0]?.code).toBe('DYNAMIC_PAGE_TARGET');
  expect(result.ambiguousTab.issues[0]).toMatchObject({
    code: 'AMBIGUOUS_PAGE_TARGET',
    path: expect.stringContaining('tabs[0]')
  });
});

async function seedTabs(page: Parameters<typeof seedSavedConfig>[0], source: 'user' | 'system', pageUUID: string) {
  await seedSavedConfig(page, {
    blocks: [{
      id: 'tabs-block',
      type: 'MTabs',
      data: {
        tabs: [{
          id: 'child',
          name: 'Child',
          pageUUID,
          pageSource: source
        }],
        activeTabId: 'child'
      }
    }]
  });
}

async function seedUserDialogAction(page: Parameters<typeof seedSavedConfig>[0], pageUUID: string) {
  await seedSavedConfig(page, {
    blocks: [{
      id: 'actions-block',
      type: 'MActionEditor',
      data: {
        value: [{
          uuid: 'open-user-page',
          action: 'open_dialog',
          inputs: {
            title: 'Child',
            pageUUID,
            pageSource: 'user',
            context: {}
          }
        }]
      }
    }]
  });
}

async function openActionSubpageEditor(page: Parameters<typeof seedSavedConfig>[0]) {
  await page.getByTestId('m-action-editor-open').click();
  await page.getByTestId('m-action-edit-subpage').click();
  await expect(page.getByTestId('page-editor-host')).toBeVisible();
}

async function fulfillPageApiFailure(route: Route, code: string, message: string, details?: unknown) {
  await route.fulfill({
    status: 200,
    headers: pageApiHeaders,
    body: JSON.stringify({
      ok: false,
      error: { code, message, details }
    })
  });
}

async function openFrameToolPropertyPanel(frame: import('@playwright/test').Locator, toolTestId: string) {
  return await openScopedToolPropertyPanel(frame, frame.getByTestId(toolTestId));
}

async function openScopedToolPropertyPanel(
  scope: import('@playwright/test').Locator,
  tool: import('@playwright/test').Locator
) {
  await tool.hover();
  const settingsButton = scope.locator('.ce-toolbar__settings-btn');
  await expect(settingsButton).toBeVisible();
  await settingsButton.click();
  const propertyButton = scope.locator('.ce-popover--opened .ce-popover-item').filter({ hasText: /属性|Properties/ });
  await expect(propertyButton).toBeVisible();
  await propertyButton.click();
  const propertyDialog = scope.locator('[data-testid="tool-property-dialog"][open]');
  await expect(propertyDialog).toBeVisible();
  return propertyDialog;
}
