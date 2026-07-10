import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
  mockPagesApi,
  type MockMokelayLayout,
  type MockMokelayPage
} from './helpers/editor';

const jsonHeaders = {
  'access-control-allow-origin': '*',
  'content-type': 'application/json'
};

type ClientBlockDocFixture = {
  uuid: string;
  block_type: string;
  display_name: string;
  category: string;
  status: 'active';
  editor_enabled: boolean;
  toolbox_visible: boolean;
  sort_order: number;
  registration: {
    componentName: string;
    toolSymbol: string;
    editorEnabled: boolean;
    toolboxVisible: boolean;
    sortOrder: number;
  };
  toolbox: { title: string };
  default_data: Record<string, unknown>;
  property_schema: unknown[];
};

type ClientBlockDocDetailFixture = ClientBlockDocFixture & {
  description: string;
  source_kind: string;
  source_package: string;
  source_file: string;
  component_name: string;
  tool_symbol: string;
  initial_props: Record<string, unknown>;
  event_schema: unknown[];
  method_schema: unknown[];
  data_fields_schema: unknown[];
  save_schema: unknown[];
  examples: unknown[];
  source_refs: unknown[];
  raw_meta: Record<string, unknown>;
};

function resolveServerAsset(...segments: string[]) {
  const candidates = [
    resolve(process.cwd(), '../mokelay-server/server/assets', ...segments),
    resolve(process.cwd(), 'submodule/mokelay-server/server/assets', ...segments)
  ];
  const assetPath = candidates.find((candidate) => existsSync(candidate));
  if (!assetPath) {
    throw new Error(`Missing Mokelay server asset: ${segments.join('/')}`);
  }
  return assetPath;
}

function readSystemPageAsset(uuid: string): MockMokelayPage {
  return JSON.parse(readFileSync(resolveServerAsset('mokelay-pages', `${uuid}.json`), 'utf8')) as MockMokelayPage;
}

function readSystemLayoutAsset(uuid: string): MockMokelayLayout {
  const layoutJson = JSON.parse(readFileSync(resolveServerAsset('mokelay-layouts', `${uuid}.json`), 'utf8')) as Record<string, unknown>;
  return {
    uuid,
    name: typeof layoutJson.name === 'string' ? layoutJson.name : uuid,
    layoutJson
  };
}

function createClientBlockDoc(
  uuid: string,
  blockType: string,
  toolSymbol: string,
  category: string,
  options: Partial<Pick<ClientBlockDocFixture, 'editor_enabled' | 'toolbox_visible' | 'sort_order'>> = {}
): ClientBlockDocFixture {
  const editorEnabled = options.editor_enabled ?? true;
  const toolboxVisible = options.toolbox_visible ?? true;
  const sortOrder = options.sort_order ?? 0;

  return {
    uuid,
    block_type: blockType,
    display_name: blockType,
    category,
    status: 'active',
    editor_enabled: editorEnabled,
    toolbox_visible: toolboxVisible,
    sort_order: sortOrder,
    registration: {
      componentName: blockType,
      toolSymbol,
      editorEnabled,
      toolboxVisible,
      sortOrder
    },
    toolbox: { title: blockType },
    default_data: {},
    property_schema: []
  };
}

async function mockClientBlockDocsApi(page: Page, docs: unknown[]) {
  await page.route('**/api/mokelay/list_client_block_docs**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ data: { docs } })
    });
  });
}

async function mockClientBlockDocsPage(page: Page) {
  const docs = [
    createClientBlockDoc('test-button', 'MButton', 'mButtonEditorTool', 'action', { sort_order: 10 }),
    createClientBlockDoc('test-input', 'MInput', 'mInputEditorTool', 'form', {
      editor_enabled: false,
      toolbox_visible: false,
      sort_order: 20
    }),
    createClientBlockDoc('test-form', 'MForm', 'mFormEditorTool', 'container', { sort_order: 30 }),
    createClientBlockDoc('test-advance-table', 'MAdvanceTable', 'mAdvanceTableEditorTool', 'data', { sort_order: 40 }),
    createClientBlockDoc('test-tabs', 'MTabs', 'mTabsEditorTool', 'container', { sort_order: 50 })
  ];
  const listRequests: URL[] = [];
  const settingsRequests: Record<string, unknown>[] = [];

  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: [
      readSystemPageAsset('docs'),
      readSystemPageAsset('client_docs'),
      readSystemPageAsset('block_component_docs'),
      readSystemPageAsset('block_component_doc_detail')
    ],
    systemLayouts: [readSystemLayoutAsset('mokelay_layout')]
  });

  await page.route('**/api/mokelay/list_client_block_docs**', async (route) => {
    const url = new URL(route.request().url());
    listRequests.push(url);
    const editorEnabled = url.searchParams.get('editorEnabled');
    const toolboxVisible = url.searchParams.get('toolboxVisible');
    const category = url.searchParams.get('category');
    const filteredDocs = docs
      .filter((doc) => !editorEnabled || doc.editor_enabled === (editorEnabled === '1'))
      .filter((doc) => !toolboxVisible || doc.toolbox_visible === (toolboxVisible === '1'))
      .filter((doc) => !category || doc.category === category)
      .sort((left, right) => left.sort_order - right.sort_order);

    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: true,
        data: {
          docs: filteredDocs,
          pagination: {
            page: Number(url.searchParams.get('page') ?? 1),
            pageSize: Number(url.searchParams.get('pageSize') ?? filteredDocs.length),
            total: filteredDocs.length,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      })
    });
  });

  await page.route('**/api/mokelay/update_client_block_doc_settings', async (route) => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    settingsRequests.push(payload);
    if (payload.sort_order === 'invalid') {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          ok: false,
          error: { message: '排序必须是非负整数' }
        })
      });
      return;
    }

    const doc = docs.find((item) => item.uuid === payload.uuid);
    if (!doc) {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ ok: true, data: { affected: 0, doc: null } })
      });
      return;
    }

    doc.editor_enabled = payload.editor_enabled === true;
    doc.toolbox_visible = payload.toolbox_visible === true;
    doc.sort_order = Number(payload.sort_order);
    doc.registration = {
      ...doc.registration,
      editorEnabled: doc.editor_enabled,
      toolboxVisible: doc.toolbox_visible,
      sortOrder: doc.sort_order
    };

    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true, data: { affected: 1, doc } })
    });
  });

  const detailRequests: URL[] = [];
  await page.route('**/api/mokelay/read_block_component_doc**', async (route) => {
    const url = new URL(route.request().url());
    detailRequests.push(url);
    const summary = docs.find((item) => item.uuid === url.searchParams.get('uuid'));
    const doc: ClientBlockDocDetailFixture | null = summary
      ? {
          ...summary,
          display_name: 'Test Button',
          description: '用于验证客户端 Block 文档详情页的完整字段。',
          source_kind: 'mokelay-editor',
          source_package: 'mokelay-editor',
          source_file: 'src/blocks/MButton.vue',
          component_name: 'MButton',
          tool_symbol: 'mButtonEditorTool',
          initial_props: { label: '初始按钮' },
          default_data: { label: '默认按钮', variant: 'primary' },
          property_schema: [{ key: 'label', label: '文案', type: 'text' }],
          event_schema: [{ event: 'click', label: '点击' }],
          method_schema: [{ name: 'focus', label: '聚焦' }],
          data_fields_schema: [{ variable: 'value', label: '值', dataType: 'string' }],
          save_schema: [{ key: 'serialize', description: '保存按钮配置' }],
          examples: [{ id: 'button-example', type: 'MButton', data: { label: '示例按钮' } }],
          source_refs: [{ file: 'src/blocks/MButton.vue', reason: '组件实现' }],
          raw_meta: { counts: { properties: 1, events: 1, methods: 1, dataFields: 1, saveRules: 1 } }
        }
      : null;

    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true, data: { doc } })
    });
  });

  return { listRequests, settingsRequests, detailRequests };
}

test('registers only the active block documents returned by the API', async ({ page }) => {
  let requestedPage = '';
  let requestedEditorEnabled: string | null = null;
  await page.route('**/api/mokelay/list_client_block_docs**', async (route) => {
    const url = new URL(route.request().url());
    requestedPage = url.searchParams.get('page') ?? '';
    requestedEditorEnabled = url.searchParams.get('editorEnabled');
    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        data: {
          docs: [
            {
              uuid: 'test-button',
              block_type: 'MButton',
              display_name: 'API Button',
              category: 'action',
              status: 'active',
              editor_enabled: true,
              toolbox_visible: true,
              sort_order: 10,
              registration: {
                componentName: 'MButton',
                toolSymbol: 'mButtonEditorTool',
                editorEnabled: true,
                toolboxVisible: true,
                sortOrder: 10
              },
              toolbox: {
                title: 'API Button',
                icon: '<svg></svg>'
              },
              default_data: {
                label: 'From API',
                variant: 'danger',
                align: 'right',
                action: { type: 'submit' },
                disabled: false
              },
              property_schema: [
                { key: 'label', label: 'Label', type: 'text', configurable: true }
              ]
            }
          ]
        }
      })
    });
  });

  await page.goto('/');
  const result = await page.evaluate(async () => {
    const docs = await import('/src/utils/clientBlockDocs.ts');
    const editor = await import('/src/editors/EditorToolFactory.ts');
    const loadedDocs = await docs.loadClientBlockDocs();
    const tools = editor.createEditorTools({ edit: true }, { docs: loadedDocs });
    const button = tools.MButton as { class: { toolbox: { title: string } }; config: Record<string, unknown> };

    return {
      blockTypes: Object.keys(tools),
      toolboxTitle: button.class.toolbox.title,
      config: button.config
    };
  });

  expect(result.blockTypes).toEqual(['MButton']);
  expect(requestedPage).toBe('1');
  expect(requestedEditorEnabled).toBeNull();
  expect(result.toolboxTitle).toBe('API Button');
  expect(result.config).toMatchObject({
    label: 'From API',
    variant: 'danger',
    align: 'right',
    action: { type: 'submit' },
    disabled: false,
    edit: true
  });
});

test('keeps disabled and hidden blocks registered while removing them from the toolbox', async ({ page }) => {
  await page.route('**/api/mokelay/list_client_block_docs**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        data: {
          docs: [
            {
              uuid: 'disabled-button',
              block_type: 'MButton',
              display_name: 'Disabled Button',
              category: 'action',
              status: 'active',
              editor_enabled: false,
              toolbox_visible: true,
              sort_order: 10,
              registration: { componentName: 'MButton', toolSymbol: 'mButtonEditorTool' },
              toolbox: { title: 'Disabled Button' },
              default_data: { label: 'Existing button' },
              property_schema: [],
            },
            {
              uuid: 'hidden-input',
              block_type: 'MInput',
              display_name: 'Hidden Input',
              category: 'form',
              status: 'active',
              editor_enabled: true,
              toolbox_visible: false,
              sort_order: 20,
              registration: { componentName: 'MInput', toolSymbol: 'mInputEditorTool' },
              toolbox: { title: 'Hidden Input' },
              default_data: { value: 'Existing input' },
              property_schema: [],
            },
          ],
        },
      }),
    });
  });

  await page.goto('/');
  const result = await page.evaluate(async () => {
    const docs = await import('/src/utils/clientBlockDocs.ts');
    const editor = await import('/src/editors/EditorToolFactory.ts');
    const loadedDocs = await docs.loadClientBlockDocs();
    const tools = editor.createEditorTools({ edit: true }, { docs: loadedDocs });

    return {
      blockTypes: Object.keys(tools),
      buttonToolbox: (tools.MButton as { class: { toolbox: unknown } }).class.toolbox,
      inputToolbox: (tools.MInput as { class: { toolbox: unknown } }).class.toolbox,
    };
  });

  expect(result.blockTypes).toEqual(['MButton', 'MInput']);
  expect(result.buttonToolbox).toBe(false);
  expect(result.inputToolbox).toBe(false);
});

test('does not use local block docs when the API is unavailable', async ({ page }) => {
  await page.route('**/api/mokelay/list_client_block_docs**', async (route) => {
    await route.fulfill({
      status: 503,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: { message: 'unavailable' } })
    });
  });

  await page.goto('/');
  const result = await page.evaluate(async () => {
    const docs = await import('/src/utils/clientBlockDocs.ts');
    const editor = await import('/src/editors/EditorToolFactory.ts');
    const loadedDocs = await docs.loadClientBlockDocs();
    const tools = editor.createEditorTools({ edit: true }, { docs: loadedDocs });

    return {
      count: loadedDocs.length,
      blockTypes: Object.keys(tools)
    };
  });

  expect(result).toEqual({ count: 0, blockTypes: [] });
});

test('rebuilds documented toolbox metadata for the active locale', async ({ page }) => {
  await mockClientBlockDocsApi(page, [{
    ...createClientBlockDoc('test-form', 'MForm', 'mFormEditorTool', 'container'),
    display_name: '表单',
    toolbox: { title: { zh: '表单', en: 'Form' } }
  }]);
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { i18n } = await import('/src/i18n.ts');
    const docs = await import('/src/utils/clientBlockDocs.ts');
    const editor = await import('/src/editors/EditorToolFactory.ts');

    await docs.loadClientBlockDocs();
    i18n.setLocale('en');
    const englishTools = editor.createEditorTools({ edit: true });
    i18n.setLocale('zh');
    const chineseTools = editor.createEditorTools({ edit: true });

    return {
      english: (englishTools.MForm as { class: { toolbox: { title: string } } }).class.toolbox.title,
      chinese: (chineseTools.MForm as { class: { toolbox: { title: string } } }).class.toolbox.title
    };
  });

  expect(result).toEqual({
    english: 'Form',
    chinese: '表单'
  });
});

test('resolves documented defaults before creating an MForm child block', async ({ page }) => {
  await mockClientBlockDocsApi(page, [{
    ...createClientBlockDoc('test-link', 'MLink', 'mLinkEditorTool', 'content'),
    default_data: { url: 'https://mokelay.com', open: false, text: '' }
  }]);
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const docs = await import('/src/utils/clientBlockDocs.ts');
    const formItemTools = await import('/src/blocks/mFormItemTools.ts');

    await docs.loadClientBlockDocs();
    const block = formItemTools.createInitialFormItemEditorBlock('MLink');

    return {
      type: block.type,
      data: block.data
    };
  });

  expect(result.type).toBe('MLink');
  expect(result.data).toMatchObject({
    url: 'https://mokelay.com',
    open: false
  });
  expect(typeof (result.data as { text?: unknown }).text).toBe('string');
});

test('keeps documented MButton save rules while runtime serialization stays behavioral', async ({ page }) => {
  await mockClientBlockDocsApi(page, [{
    ...createClientBlockDoc('test-button', 'MButton', 'mButtonEditorTool', 'action'),
    save_schema: [
      { key: 'disabled', type: 'boolean', description: '保存禁用状态。' },
      { key: 'action', type: 'object', description: '保存动作。' }
    ]
  }]);
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const button = await import('/src/blocks/MButton.vue');
    const docs = await import('/src/utils/clientBlockDocs.ts');
    await docs.loadClientBlockDocs();
    const saved = button.mButtonEditorTool.serialize(button.normalizeButtonProps({
      edit: true,
      label: 'Save rule',
      disabled: false,
      action: { type: 'navigate', url: '/next' }
    }));
    const saveRules = docs.getClientBlockDocSnapshot('MButton')?.saveRules ?? [];

    return { saved, saveRuleKeys: saveRules.map((rule) => rule.key) };
  });

  expect(result.saved).toMatchObject({
    label: 'Save rule',
    action: { type: 'navigate', url: '/next' }
  });
  expect(result.saved).not.toHaveProperty('disabled');
  expect(result.saveRuleKeys).toEqual(expect.arrayContaining(['disabled', 'action']));
});

test('normalizes row-driven MButton visibility conditions and persists non-default conditions', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const button = await import('/src/blocks/MButton.vue');
    const visible = button.normalizeButtonProps({ edit: false, visible: '1' as unknown as boolean, hidden: '0' as unknown as boolean });
    const hidden = button.normalizeButtonProps({ edit: false, visible: '0' as unknown as boolean, hidden: '1' as unknown as boolean });
    const saved = button.mButtonEditorTool.serialize(hidden);

    return { visible, hidden, saved };
  });

  expect(result.visible).toMatchObject({ visible: true, hidden: false });
  expect(result.hidden).toMatchObject({ visible: false, hidden: true });
  expect(result.saved).toMatchObject({ visible: false, hidden: true });
});

test('filters and manages client block toolbox settings from the docs page', async ({ page }) => {
  const { listRequests, settingsRequests } = await mockClientBlockDocsPage(page);

  await page.goto('/#/docs');
  await expect(page.getByText('客户端 Block 文档管理', { exact: true })).toBeVisible();

  const filters = page.locator('[data-testid="preview-form-items"] select');
  await expect(filters.nth(0).locator('option').first()).toHaveText('全部');
  await expect(filters.nth(0)).toHaveValue('');
  await filters.nth(0).selectOption('1');
  await filters.nth(2).selectOption('action');
  await page.getByRole('button', { name: '查询', exact: true }).click();

  await expect.poll(() => listRequests.at(-1)?.searchParams.get('editorEnabled')).toBe('1');
  expect(listRequests.at(-1)?.searchParams.get('category')).toBe('action');
  await expect(page.getByTestId('block-docs-disable-test-button')).toBeVisible();
  await expect(page.getByTestId('block-docs-enable-test-input')).toHaveCount(0);

  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect.poll(() => listRequests.at(-1)?.searchParams.get('editorEnabled')).toBe('');
  await expect(page.getByTestId('block-docs-enable-test-input')).toBeVisible();

  await filters.nth(1).selectOption('0');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect.poll(() => listRequests.at(-1)?.searchParams.get('toolboxVisible')).toBe('0');
  await expect(page.getByTestId('block-docs-enable-test-input')).toBeVisible();

  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect.poll(() => listRequests.at(-1)?.searchParams.get('toolboxVisible')).toBe('');

  await page.getByTestId('block-docs-disable-test-button').click();
  await expect.poll(() => settingsRequests.length).toBe(1);
  expect(settingsRequests[0]).toEqual({
    uuid: 'test-button',
    editor_enabled: false,
    toolbox_visible: true,
    sort_order: '10'
  });
  await expect(page.getByTestId('block-docs-enable-test-button')).toBeVisible();

  await page.getByTestId('block-docs-hide-test-button').click();
  await expect.poll(() => settingsRequests.length).toBe(2);
  expect(settingsRequests[1]).toEqual({
    uuid: 'test-button',
    editor_enabled: false,
    toolbox_visible: false,
    sort_order: '10'
  });
  await expect(page.getByTestId('block-docs-show-test-button')).toBeVisible();

  const sortInput = page.getByTestId('block-docs-sort-order-test-button');
  await sortInput.fill('70');
  const listRequestCountBeforeSortSave = listRequests.length;
  await page.getByTestId('block-docs-save-sort-order-test-button').click();
  await expect.poll(() => settingsRequests.length).toBe(3);
  await expect.poll(() => listRequests.length).toBe(listRequestCountBeforeSortSave + 1);
  expect(settingsRequests[2]).toEqual({
    uuid: 'test-button',
    editor_enabled: false,
    toolbox_visible: false,
    sort_order: '70'
  });
  await expect(page.getByTestId('block-docs-sort-order-test-button')).toHaveValue('70');

  const failedSortInput = page.getByTestId('block-docs-sort-order-test-button');
  await failedSortInput.fill('invalid');
  await page.getByTestId('block-docs-save-sort-order-test-button').click();
  await expect.poll(() => settingsRequests.length).toBe(4);
  await expect.poll(() => settingsRequests[3]?.sort_order).toBe('invalid');
  await expect(page.getByText('排序必须是非负整数', { exact: true })).toBeVisible();
  await expect(failedSortInput).toHaveValue('invalid');
});

test('opens a shareable Block detail page with structured fields and visual JSON', async ({ page }) => {
  const { detailRequests } = await mockClientBlockDocsPage(page);

  await page.goto('/#/docs');
  await page.getByTestId('block-docs-open-detail-test-button').click();

  await expect(page).toHaveURL(/#\/block_component_doc_detail\?uuid=test-button$/);
  await expect.poll(() => detailRequests.at(-1)?.searchParams.get('uuid')).toBe('test-button');
  await expect(page.getByText('客户端 Block 文档详情', { exact: true })).toBeVisible();
  await expect(page.getByTestId('record-list')).toContainText('用于验证客户端 Block 文档详情页的完整字段。');
  await expect(page.getByTestId('record-list')).not.toContainText('文案');
  await expect(page.getByTestId('record-list')).not.toContainText('保存规则');

  const detailTables = page.getByTestId('advance-table');
  await expect(detailTables).toHaveCount(3);
  await expect(detailTables.nth(0)).toContainText('文案');
  await expect(detailTables.nth(1)).toContainText('click');
  await expect(detailTables.nth(2)).toContainText('focus');
  await expect.poll(() => detailRequests.length).toBe(1);

  const jsonViewers = page.getByTestId('m-json-viewer');
  await expect(jsonViewers).toHaveCount(10);
  await expect(jsonViewers.nth(0)).toContainText('注册信息');

  const fullJsonViewer = jsonViewers.last();
  await expect(fullJsonViewer).toContainText('只读文档数据');
  await expect(fullJsonViewer).toContainText('uuid');
  await expect(fullJsonViewer).toContainText('test-button');
  await expect(page.getByTestId('m-json-editor-control')).toHaveCount(0);

  await fullJsonViewer.getByTestId('m-json-search').fill('test-button');
  await expect(fullJsonViewer.getByTestId('m-json-search-count')).toContainText(/1 \/ \d+/);
  await fullJsonViewer.getByRole('button', { name: '下一个匹配项', exact: true }).click();
  await fullJsonViewer.getByRole('button', { name: '展开', exact: true }).click();
  await fullJsonViewer.getByRole('button', { name: '收起', exact: true }).click();
  await fullJsonViewer.getByRole('button', { name: '复制', exact: true }).click();
  await expect(fullJsonViewer.getByText('JSON 已复制。', { exact: true })).toBeVisible();

  await page.evaluate(() => {
    const settings = (window as Window & {
      $mokelaySettings?: { setTheme: (theme: 'light' | 'dark') => void };
    }).$mokelaySettings;
    settings?.setTheme('dark');
  });
  await expect(fullJsonViewer).toHaveClass(/jse-theme-dark/);

  await page.getByRole('button', { name: '返回 Block 文档', exact: true }).click();
  await expect(page).toHaveURL(/#\/docs$/);

  await page.goto('/#/block_component_doc_detail?uuid=unknown');
  await expect.poll(() => detailRequests.at(-1)?.searchParams.get('uuid')).toBe('unknown');
  await expect(page.getByTestId('record-list-empty')).toHaveText('未找到对应的 Block 文档。');

  await page.goto('/#/block_component_doc_detail');
  await expect.poll(() => detailRequests.at(-1)?.searchParams.get('uuid')).toBe('');
  await expect(page.getByTestId('record-list-empty')).toHaveText('未找到对应的 Block 文档。');
});
