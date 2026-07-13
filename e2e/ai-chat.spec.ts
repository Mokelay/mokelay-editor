import { expect, test, type Page } from '@playwright/test';
import { resetEditor } from './helpers/editor';

const generatedPageUuid = '550e8400-e29b-41d4-a716-446655440000';
const aiChatApp = {
  id: 1,
  uuid: '10000000-0000-4000-8000-000000000001',
  alias: 'CRM',
  description: '客户关系管理'
};
const aiChatDatasource = {
  id: 1,
  uuid: '20000000-0000-4000-8000-000000000001',
  alias: 'Mokelay',
  description: 'Mokelay 主数据源',
  schema_data: []
};
const firstPageBlocks = [
  {
    id: 'customer-list-title',
    type: 'MHeading',
    data: { text: '客户列表', level: '1', align: 'left' }
  }
];
const secondPageBlocks = [
  {
    id: 'customer-detail-title',
    type: 'MHeading',
    data: { text: '客户管理', level: '1', align: 'left' }
  }
];

const firstResponse = {
  version: 1,
  status: 'complete',
  summary: '生成客户列表页、创建客户页及对应接口 DSL。',
  pages: [
    {
      uuid: generatedPageUuid,
      name: '客户列表',
      blocks: firstPageBlocks,
      apiDependencies: ['list_customers'],
      notes: []
    }
  ],
  apis: [
    {
      uuid: 'list_customers',
      alias: '客户列表接口',
      method: 'GET',
      request: { header: [], query: ['page', 'pageSize'], body: [] },
      blocks: [
        { uuid: 'starter', nextBlock: 'page_customers' },
        { uuid: 'page_customers', functionName: 'page', inputs: {}, outputs: ['datas'], nextBlock: null }
      ],
      response: {
        datas: { template: "{{blocks['page_customers'].outputs.datas}}" }
      }
    }
  ],
  upgradePlan: {
    processors: [],
    blocks: [],
    actions: [],
    controls: [],
    components: []
  },
  traceability: [
    {
      requirement: '客户列表',
      status: 'generated',
      pageUuids: [generatedPageUuid],
      apiUuids: ['list_customers'],
      upgradeRefs: []
    }
  ],
  assumptions: ['使用 Mokelay 数据源。'],
  warnings: []
};

const secondResponse = {
  ...firstResponse,
  status: 'partial',
  summary: '在上一版基础上增加批量导出升级计划。',
  pages: [
    {
      uuid: generatedPageUuid,
      name: '客户管理',
      blocks: secondPageBlocks,
      apiDependencies: ['list_customers'],
      notes: []
    }
  ],
  apis: [
    {
      ...firstResponse.apis[0],
      alias: '客户列表接口 v2'
    }
  ],
  upgradePlan: {
    ...firstResponse.upgradePlan,
    actions: [
      {
        action: 'batch_export',
        reason: '需要批量导出选中客户。',
        inputsSchema: {},
        outputs: ['fileUrl'],
        behavior: '导出选中行。',
        dslExample: { uuid: 'batch_export_customers', action: 'batch_export' }
      }
    ]
  }
};

const firstRequest = {
  requirementDocument: '客户管理：需要客户列表、创建客户、删除客户。',
  projectContext: { app: 'CRM', datasource: 'Mokelay' }
};
const aiChatClientBlockDocs = [
  clientBlockDoc('MPageState', 'mPageStateTool'),
  clientBlockDoc('MLayoutGrid', 'mLayoutGridEditorTool'),
  clientBlockDoc('MForm', 'mFormEditorTool'),
  clientBlockDoc('MTextareaField', 'mTextareaFieldEditorTool'),
  clientBlockDoc('MSelectField', 'mSelectFieldEditorTool'),
  clientBlockDoc('MActionToolbar', 'mActionToolbarEditorTool'),
  clientBlockDoc('MHeading', 'mHeadingEditorTool'),
  clientBlockDoc('MJson', 'mJsonTool'),
  clientBlockDoc('MActionCardList', 'mActionCardListEditorTool')
];

function clientBlockDoc(blockType: string, toolSymbol: string) {
  return {
    uuid: `ai-chat-${blockType}`,
    block_type: blockType,
    display_name: blockType,
    category: 'ai-chat',
    status: 'active',
    editor_enabled: true,
    toolbox_visible: true,
    sort_order: 0,
    registration: {
      componentName: blockType,
      toolSymbol,
      editorEnabled: true,
      toolboxVisible: true,
      sortOrder: 0
    },
    toolbox: { title: blockType },
    default_data: {},
    property_schema: []
  };
}

type ResetEditorOptions = NonNullable<Parameters<typeof resetEditor>[1]>;

async function resetAiChat(page: Page, options: ResetEditorOptions = {}) {
  return await resetEditor(page, {
    apps: [aiChatApp],
    datasources: [aiChatDatasource],
    clientBlockDocs: aiChatClientBlockDocs,
    ...options
  });
}

function requestForm(page: Page) {
  return page.getByTestId('editor-form-tool');
}

function requirementInput(page: Page) {
  return requestForm(page).locator('textarea');
}

function appSelect(page: Page) {
  return requestForm(page)
    .getByTestId('editor-form-item-tool')
    .filter({ hasText: 'APP' })
    .locator('select');
}

function datasourceSelect(page: Page) {
  return requestForm(page)
    .getByTestId('editor-form-item-tool')
    .filter({ hasText: '数据源' })
    .locator('select');
}

async function fillRequest(page: Page, requirementDocument = firstRequest.requirementDocument) {
  await requirementInput(page).fill(requirementDocument);
  await expect(appSelect(page)).toContainText(aiChatApp.alias);
  await expect(datasourceSelect(page)).toContainText(aiChatDatasource.alias);
  await appSelect(page).selectOption(aiChatApp.alias);
  await datasourceSelect(page).selectOption(aiChatDatasource.alias);
}

function responseViewer(page: Page) {
  return page.getByTestId('m-json-viewer').filter({ hasText: '响应 JSON' });
}

function saveViewer(page: Page) {
  return page.getByTestId('m-json-viewer').filter({ hasText: '保存摘要' });
}

function savedAssetList(page: Page, blockId: 'ai-chat-saved-pages' | 'ai-chat-saved-apis') {
  return page.locator(`[data-testid="m-action-card-list"][data-block-id="${blockId}"]`);
}

async function triggerToolbarButton(page: Page, buttonId: string) {
  await page.getByTestId(`m-action-toolbar-action-${buttonId}`).evaluate((element) => {
    window.setTimeout(() => (element as HTMLButtonElement).click(), 0);
  });
}

async function expandJsonViewer(viewer: ReturnType<typeof responseViewer>) {
  await viewer.getByRole('button', { name: '展开', exact: true }).click();
}

test('opens the AI Chat system page DSL from the top navigation', async ({ page }) => {
  await resetAiChat(page, { initialRoute: '/' });

  await page.getByRole('link', { name: 'AI Chat' }).click();

  await expect(page).toHaveURL(/#\/ai-chat$/);
  await expect(page.getByTestId('layout-top-nav').getByRole('link', { name: 'AI Chat' })).toHaveClass(/layout-top-nav__link--active/);
  await expect(page.getByText('DSL JSON', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'AI DSL 生成' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '生成请求' })).toHaveCount(0);
  await expect(requirementInput(page)).toBeVisible();
  await expect(appSelect(page)).toContainText('CRM');
  await expect(datasourceSelect(page)).toContainText('Mokelay');
  await expect(page.getByTestId('m-json-editor-control')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'AI生成' })).toBeVisible();
  await expect(responseViewer(page)).toBeVisible();
});

test('mounts each AI Chat layout area once in the system page editor', async ({ page }) => {
  await resetAiChat(page, { initialRoute: '/#/pages/ai-chat?source=system' });

  const requestArea = page.getByTestId('m-layout-grid-area-request');
  const resultArea = page.getByTestId('m-layout-grid-area-result');

  await expect(page.getByTestId('m-layout-grid')).toHaveCount(1);
  await expect(requestArea.locator(':scope > .m-layout-grid__editor > .codex-editor')).toHaveCount(1);
  await expect(resultArea.locator(':scope > .m-layout-grid__editor > .codex-editor')).toHaveCount(1);
  await expect(requestForm(page)).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '生成结果', exact: true })).toHaveCount(1);
});

test('generates, saves, renders JSON, and carries history into a follow-up request', async ({ page }) => {
  const apiState = await resetAiChat(page, {
    initialRoute: '/#/ai-chat',
    aiGenerateDslResponses: [
      { data: firstResponse },
      { data: secondResponse }
    ]
  });
  await fillRequest(page);
  await triggerToolbarButton(page, 'generate');

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(1);
  await expect.poll(() => apiState.saveAiDslAssetsRequests.length).toBe(1);
  expect(apiState.aiGenerateDslRequests[0]).toEqual(firstRequest);
  expect(apiState.saveAiDslAssetsRequests[0]).toMatchObject({
    generationResult: firstResponse,
    knownPageUuids: [],
    knownApiUuids: [],
    apiStatus: 'draft'
  });
  await expandJsonViewer(responseViewer(page));
  await expandJsonViewer(saveViewer(page));
  await expect(responseViewer(page)).toContainText(generatedPageUuid);
  await expect(responseViewer(page)).toContainText('生成客户列表页');
  await expect(saveViewer(page)).toContainText('complete');
  await expect(saveViewer(page)).toContainText('savedCount');
  await expect(saveViewer(page)).toContainText('failedCount');
  await expect(saveViewer(page)).not.toContainText('knownPageUuids');
  await expect(saveViewer(page)).not.toContainText(generatedPageUuid);
  await expect(savedAssetList(page, 'ai-chat-saved-pages').getByTestId('m-action-card-list-item')).toContainText('客户列表');
  await expect(savedAssetList(page, 'ai-chat-saved-apis').getByTestId('m-action-card-list-item')).toContainText('客户列表接口');
  expect(apiState.pages.get(generatedPageUuid)).toMatchObject({
    name: '客户列表',
    blocks: firstPageBlocks
  });
  expect(apiState.apis.get('list_customers')).toMatchObject({
    name: '客户列表接口',
    method: 'GET',
    status: 'draft'
  });

  await requirementInput(page).fill('在刚才基础上增加批量导出。');
  await triggerToolbarButton(page, 'generate');

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(2);
  await expect.poll(() => apiState.saveAiDslAssetsRequests.length).toBe(2);
  expect(apiState.aiGenerateDslRequests[1].requirementDocument).toEqual(expect.stringContaining('这是一次连续对话'));
  expect(apiState.aiGenerateDslRequests[1].requirementDocument).toEqual(expect.stringContaining(firstRequest.requirementDocument));
  expect(apiState.aiGenerateDslRequests[1].requirementDocument).toEqual(expect.stringContaining('在刚才基础上增加批量导出。'));
  expect(apiState.aiGenerateDslRequests[1].projectContext).toEqual(firstRequest.projectContext);
  expect(apiState.aiGenerateDslRequests[1]).not.toHaveProperty('dslContext');
  expect(apiState.aiGenerateDslRequests[1]).not.toHaveProperty('generationPreferences');
  expect(apiState.saveAiDslAssetsRequests[1]).toMatchObject({
    knownPageUuids: [generatedPageUuid],
    knownApiUuids: ['list_customers']
  });
  await expect(responseViewer(page)).toContainText('增加批量导出升级计划');
  expect(apiState.pages.get(generatedPageUuid)).toMatchObject({
    name: '客户管理',
    blocks: secondPageBlocks
  });
  expect(apiState.apis.get('list_customers')).toMatchObject({ name: '客户列表接口 v2' });
  await savedAssetList(page, 'ai-chat-saved-pages').getByTestId('m-action-card-list-item').click();
  await expect(page).toHaveURL(new RegExp(`#\/pages\/${generatedPageUuid}$`));
});

test('blocks generation when required request fields are missing', async ({ page }) => {
  const apiState = await resetAiChat(page, { initialRoute: '/#/ai-chat' });

  await requirementInput(page).fill('');
  await triggerToolbarButton(page, 'generate');

  expect(await requirementInput(page).evaluate((element) => (element as HTMLTextAreaElement).checkValidity())).toBe(false);
  expect(await appSelect(page).evaluate((element) => (element as HTMLSelectElement).checkValidity())).toBe(false);
  expect(await datasourceSelect(page).evaluate((element) => (element as HTMLSelectElement).checkValidity())).toBe(false);
  expect(apiState.aiGenerateDslRequests).toHaveLength(0);
  expect(apiState.saveAiDslAssetsRequests).toHaveLength(0);
});

test('only sends requirementDocument and the selected projectContext', async ({ page }) => {
  const apiState = await resetAiChat(page, { initialRoute: '/#/ai-chat' });
  const requirementDocument = '生成一个包含客户列表的 CRM 页面。';

  await fillRequest(page, requirementDocument);
  await triggerToolbarButton(page, 'generate');

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(1);
  expect(apiState.aiGenerateDslRequests[0]).toEqual({
    requirementDocument,
    projectContext: firstRequest.projectContext
  });
});

test('renders generation errors and restores toolbar actions', async ({ page }) => {
  const apiState = await resetAiChat(page, {
    initialRoute: '/#/ai-chat',
    aiGenerateDslResponses: [
      { type: 'error', code: 'BLOCK_AI_PROVIDER_FAILED', message: 'AI 服务调用失败。' }
    ]
  });

  await fillRequest(page);
  await triggerToolbarButton(page, 'generate');

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(1);
  await expect(saveViewer(page)).toContainText('AI 服务调用失败。');
  await expect(page.getByRole('button', { name: 'AI生成' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '清空会话' })).toBeEnabled();
  expect(apiState.saveAiDslAssetsRequests).toHaveLength(0);
});

test('keeps generated JSON visible when the aggregate save is partial', async ({ page }) => {
  const apiState = await resetAiChat(page, {
    initialRoute: '/#/ai-chat',
    pages: [
      {
        uuid: generatedPageUuid,
        name: 'Existing Page',
        blocks: []
      }
    ],
    aiGenerateDslResponses: [{ data: firstResponse }]
  });

  await fillRequest(page);
  await triggerToolbarButton(page, 'generate');

  await expect.poll(() => apiState.saveAiDslAssetsRequests.length).toBe(1);
  await expect(responseViewer(page)).toContainText(firstResponse.summary);
  await expect(saveViewer(page)).toContainText('partial');
  await expect(saveViewer(page)).toContainText('AI_DSL_ASSET_UUID_EXISTS');
  await expect(saveViewer(page)).not.toContainText('#/apis/list_customers');
  await expect(savedAssetList(page, 'ai-chat-saved-pages').getByTestId('m-action-card-list-item')).toHaveCount(0);
  await expect(savedAssetList(page, 'ai-chat-saved-apis').getByTestId('m-action-card-list-item')).toContainText('客户列表接口');
});

test('clears response and save state while preserving the request form', async ({ page }) => {
  await resetAiChat(page, {
    initialRoute: '/#/ai-chat',
    aiGenerateDslResponses: [{ data: firstResponse }]
  });
  await fillRequest(page);
  await triggerToolbarButton(page, 'generate');
  await expect.poll(() => responseViewer(page).getByTestId('m-json-viewer-empty').count()).toBe(0);
  await expandJsonViewer(responseViewer(page));
  await expect(responseViewer(page)).toContainText(generatedPageUuid);
  await triggerToolbarButton(page, 'clear');

  await expect(responseViewer(page).getByTestId('m-json-viewer-empty')).toBeVisible();
  await expect(saveViewer(page).getByTestId('m-json-viewer-empty')).toBeVisible();
  await expect(savedAssetList(page, 'ai-chat-saved-pages').getByTestId('m-action-card-list-item')).toHaveCount(0);
  await expect(savedAssetList(page, 'ai-chat-saved-apis').getByTestId('m-action-card-list-item')).toHaveCount(0);
  await expect(requirementInput(page)).toHaveValue(firstRequest.requirementDocument);
  await expect(appSelect(page)).toHaveValue(aiChatApp.alias);
  await expect(datasourceSelect(page)).toHaveValue(aiChatDatasource.alias);
});

test('keeps the JSON workspace ordered without overlap on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetAiChat(page, { initialRoute: '/#/ai-chat' });
  const requestArea = page.getByTestId('m-layout-grid-area-request');
  const resultArea = page.getByTestId('m-layout-grid-area-result');
  const desktopRequestBox = await requestArea.boundingBox();
  const desktopResultBox = await resultArea.boundingBox();

  expect(desktopRequestBox).not.toBeNull();
  expect(desktopResultBox).not.toBeNull();
  expect(desktopRequestBox!.x + desktopRequestBox!.width).toBeLessThanOrEqual(desktopResultBox!.x);
  await page.screenshot({ path: 'test-results/ai-chat-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileRequestBox = await requestArea.boundingBox();
  const mobileResultBox = await resultArea.boundingBox();

  expect(mobileRequestBox).not.toBeNull();
  expect(mobileResultBox).not.toBeNull();
  expect(mobileRequestBox!.y + mobileRequestBox!.height).toBeLessThanOrEqual(mobileResultBox!.y);
  expect(mobileRequestBox!.width).toBeLessThanOrEqual(390);
  expect(mobileResultBox!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/ai-chat-mobile.png', fullPage: true });
});
