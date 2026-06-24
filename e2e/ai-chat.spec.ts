import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

const generatedPageUuid = '550e8400-e29b-41d4-a716-446655440000';
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
    actions: [
      {
        action: 'export_file',
        reason: '现有 Action 没有文件导出语义。',
        inputsSchema: {},
        outputs: ['fileUrl'],
        behavior: '触发文件导出。',
        dslExample: { uuid: 'export_customers', action: 'export_file' }
      }
    ],
    controls: [],
    components: []
  },
  traceability: [
    {
      requirement: '客户列表',
      status: 'generated',
      pageUuids: ['customer_list_page'],
      apiUuids: ['list_customers'],
      upgradeRefs: []
    }
  ],
  assumptions: ['使用 Mokelay 数据源。'],
  warnings: ['导出能力需要后续升级。']
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

test('opens Chat AI from the top navigation', async ({ page }) => {
  await resetEditor(page, { initialRoute: '/' });

  await page.getByRole('link', { name: 'AI Chat' }).click();

  await expect(page).toHaveURL(/#\/ai-chat$/);
  await expect(page.getByTestId('ai-chat-panel')).toBeVisible();
  await expect(page.getByTestId('ai-chat-empty')).toBeVisible();
});

test('submits AI DSL fields, renders output, and sends conversation history on follow-up', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/#/ai-chat',
    aiGenerateDslResponses: [
      { data: firstResponse },
      { data: secondResponse }
    ]
  });

  await page.getByTestId('ai-chat-requirement').fill('客户管理：需要客户列表、创建客户、删除客户。');
  await page.getByTestId('ai-chat-project-context').fill(JSON.stringify({ app: 'crm', datasource: 'Mokelay' }, null, 2));
  await page.getByTestId('ai-chat-dsl-context').fill(JSON.stringify({ availableBlocks: ['MAdvanceTable', 'MForm'] }, null, 2));
  await page.getByTestId('ai-chat-generation-preferences').fill(JSON.stringify({ language: 'zh-CN', naming: 'snake_case' }, null, 2));
  await page.getByTestId('ai-chat-submit').click();

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(1);
  expect(apiState.aiGenerateDslRequests[0]).toEqual({
    requirementDocument: '客户管理：需要客户列表、创建客户、删除客户。',
    projectContext: { app: 'crm', datasource: 'Mokelay' },
    dslContext: { availableBlocks: ['MAdvanceTable', 'MForm'] },
    generationPreferences: { language: 'zh-CN', naming: 'snake_case' }
  });

  await expect(page.getByTestId('ai-chat-summary').first()).toContainText('生成客户列表页');
  await expect(page.getByTestId('ai-chat-pages').first()).toContainText('客户列表');
  await expect(page.getByTestId('ai-chat-apis').first()).toContainText('list_customers');
  await expect(page.getByTestId('ai-chat-upgrade-plan').first()).toContainText('export_file');
  await expect(page.getByTestId('ai-chat-result-json').first()).toContainText(`"${generatedPageUuid}"`);
  await expect.poll(() => apiState.apiSavePayloads.length).toBe(1);
  await expect.poll(() => apiState.pageCreatePayloads.length).toBe(1);
  expect(apiState.apiSavePayloads[0]).toMatchObject({
    uuid: 'list_customers',
    method: 'GET',
    status: 'draft'
  });
  expect(apiState.pageCreatePayloads[0]).toMatchObject({
    uuid: generatedPageUuid,
    name: '客户列表',
    blocks: firstPageBlocks
  });
  await expect(page.getByTestId('ai-chat-page-link').first()).toHaveAttribute('href', `#/pages/${generatedPageUuid}`);
  await expect(page.getByTestId('ai-chat-api-link').first()).toHaveAttribute('href', '#/apis/list_customers');

  await page.getByTestId('ai-chat-requirement').fill('在刚才基础上增加批量导出。');
  await page.getByTestId('ai-chat-submit').click();

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(2);
  expect(apiState.aiGenerateDslRequests[1]).toMatchObject({
    projectContext: { app: 'crm', datasource: 'Mokelay' },
    generationPreferences: { language: 'zh-CN', naming: 'snake_case' }
  });
  expect(apiState.aiGenerateDslRequests[1].requirementDocument).toEqual(expect.stringContaining('这是一次连续对话'));
  expect(apiState.aiGenerateDslRequests[1].requirementDocument).toEqual(expect.stringContaining('客户管理：需要客户列表、创建客户、删除客户。'));
  expect(apiState.aiGenerateDslRequests[1].requirementDocument).toEqual(expect.stringContaining('在刚才基础上增加批量导出。'));
  expect(apiState.aiGenerateDslRequests[1].dslContext).toMatchObject({
    availableBlocks: ['MAdvanceTable', 'MForm'],
    conversationHistory: [
      {
        requirementDocument: '客户管理：需要客户列表、创建客户、删除客户。',
        response: {
          version: 1,
          status: 'complete',
          summary: '生成客户列表页、创建客户页及对应接口 DSL。'
        }
      }
    ]
  });
  await expect.poll(() => apiState.apiSavePayloads.length).toBe(2);
  await expect.poll(() => apiState.pageUpdatePayloads.length).toBe(1);
  expect(apiState.apiSavePayloads[1]).toMatchObject({
    uuid: 'list_customers',
    originalUuid: 'list_customers',
    status: 'draft'
  });
  expect(apiState.pageUpdatePayloads[0]).toMatchObject({
    uuid: generatedPageUuid,
    name: '客户管理',
    blocks: secondPageBlocks
  });
  await expect(page.getByTestId('ai-chat-summary').first()).toContainText('增加批量导出');
});

test('blocks submit when optional JSON fields are invalid', async ({ page }) => {
  const apiState = await resetEditor(page, { initialRoute: '/#/ai-chat' });

  await page.getByTestId('ai-chat-requirement').fill('客户管理：需要客户列表。');
  await page.getByTestId('ai-chat-dsl-context').fill('{ invalid json');
  await page.getByTestId('ai-chat-submit').click();

  await expect(page.getByTestId('ai-chat-dsl-context-error')).toContainText(/JSON/);
  expect(apiState.aiGenerateDslRequests).toHaveLength(0);
  expect(apiState.apiSavePayloads).toHaveLength(0);
  expect(apiState.pageCreatePayloads).toHaveLength(0);
});

test('shows API errors in the current conversation turn', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/#/ai-chat',
    aiGenerateDslResponses: [
      { type: 'error', code: 'BLOCK_AI_PROVIDER_FAILED', message: 'AI 服务调用失败。' }
    ]
  });

  await page.getByTestId('ai-chat-requirement').fill('客户管理：需要客户列表。');
  await page.getByTestId('ai-chat-submit').click();

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(1);
  await expect(page.getByTestId('ai-chat-error')).toContainText('AI 服务调用失败。');
  expect(apiState.apiSavePayloads).toHaveLength(0);
  expect(apiState.pageCreatePayloads).toHaveLength(0);
});

test('shows generated JSON when saving a generated page fails', async ({ page }) => {
  const apiState = await resetEditor(page, {
    initialRoute: '/#/ai-chat',
    pages: [
      {
        uuid: generatedPageUuid,
        name: 'Existing Page',
        blocks: []
      }
    ],
    aiGenerateDslResponses: [
      { data: firstResponse }
    ]
  });

  await page.getByTestId('ai-chat-requirement').fill('客户管理：需要客户列表。');
  await page.getByTestId('ai-chat-submit').click();

  await expect.poll(() => apiState.aiGenerateDslRequests.length).toBe(1);
  await expect.poll(() => apiState.apiSavePayloads.length).toBe(1);
  await expect.poll(() => apiState.pageCreatePayloads.length).toBe(1);
  await expect(page.getByTestId('ai-chat-save-error')).toContainText('页面标识已存在。');
  await expect(page.getByTestId('ai-chat-result-json').first()).toContainText(`"${generatedPageUuid}"`);
  await expect(page.getByTestId('ai-chat-api-link').first()).toHaveAttribute('href', '#/apis/list_customers');
});
