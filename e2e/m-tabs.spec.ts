import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  addEditorTool,
  defaultPageUuid,
  openToolPropertyPanel,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese,
  type MockMokelayPage,
  type SavedBlock
} from './helpers/editor';

const userPageUuid = 'tabs-user-page';
const systemPageUuid = 'tabs-system-page';

test('adds a tabs component and opens its property panel', async ({ page }) => {
  await resetEditor(page);
  await switchLocaleToChinese(page);
  await addEditorTool(page, '页签');

  const tabsTool = page.getByTestId('editor-tabs-tool');
  await expect(tabsTool).toBeVisible();
  await expect(tabsTool.getByTestId('editor-tabs-empty-state')).toContainText('请先配置页签');
  await expect(page.locator('.ce-block')).toHaveCount(2);

  const propertyDialog = await openToolPropertyPanel(page, 'editor-tabs-tool');

  await expect(propertyDialog.getByTestId('tool-property-title')).toContainText('页签属性');
  await expect(propertyDialog.getByTestId('tool-property-input-tabs')).toBeVisible();
  await expect(propertyDialog.getByTestId('tool-property-input-activeTabId')).toBeVisible();
});

test('renders the configured active tab and switches by click', async ({ page }) => {
  await seedTabsPreview(page, {
    tabs: tabsConfig(),
    activeTabId: 'system'
  });

  await openPreview(page);
  await expect(page.getByTestId('editor-tabs-tab-system')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('System builtin page');
  await expect(page.getByTestId('editor-tabs-active-panel')).not.toContainText('User create page');

  const userRequest = page.waitForRequest((request) =>
    request.method() === 'GET' &&
    new URL(request.url()).pathname === '/api/mokelay/read_page_by_uuid' &&
    new URL(request.url()).searchParams.get('uuid') === userPageUuid
  );
  await page.getByTestId('editor-tabs-tab-user').click();
  await userRequest;

  await expect(page.getByTestId('editor-tabs-tab-user')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('User create page');
});

test('selects tabs from route query aliases and keeps the URL in sync', async ({ page }) => {
  await seedTabsPreview(page, {
    tabs: [
      {
        id: 'api',
        name: 'API',
        pageUUID: userPageUuid,
        query: { fragment: [null, 'false'] }
      },
      {
        id: 'fragment',
        name: 'Fragment',
        pageUUID: systemPageUuid,
        query: { fragment: 'true' }
      }
    ],
    activeTabId: 'api'
  });

  await openPreview(page);
  await page.evaluate(() => {
    window.location.hash = `${window.location.hash}?fragment=true`;
  });

  await expect(page.getByTestId('editor-tabs-tab-fragment')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('System builtin page');

  await page.getByTestId('editor-tabs-tab-api').click();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}\\/preview$`));
  await expect(page.getByTestId('editor-tabs-tab-api')).toHaveAttribute('aria-selected', 'true');

  await page.evaluate(() => {
    window.location.hash = `${window.location.hash}?fragment=false`;
  });
  await expect(page.getByTestId('editor-tabs-tab-api')).toHaveAttribute('aria-selected', 'true');
});

test('falls back to the first tab when activeTabId is invalid', async ({ page }) => {
  await seedTabsPreview(page, {
    tabs: tabsConfig(),
    activeTabId: 'missing'
  });

  await openPreview(page);

  await expect(page.getByTestId('editor-tabs-tab-user')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('User create page');
});

test('loads system page tabs through pageSource', async ({ page }) => {
  await resetEditor(page, {
    pages: childPages(),
    systemPages: [
      {
        uuid: 'system-tabs-child-page',
        name: 'System tabs child',
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'System source tab page'
            }
          }
        ]
      }
    ]
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'tabs-block',
        type: 'MTabs',
        data: {
          activeTabId: 'system-source',
          tabs: [
            {
              id: 'system-source',
              name: '系统来源',
              pageUUID: 'system-tabs-child-page',
              pageSource: 'system'
            }
          ]
        }
      }
    ]
  });

  await openPreview(page);

  await expect(page.getByTestId('editor-tabs-list')).toBeVisible();
  await expect(page.getByTestId('editor-tabs-tab-system-source')).toBeVisible();
  await expect(page.getByTestId('editor-tabs-tab-system-source')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('System source tab page');
});

test('switches tabs through setActiviTabId called by call_block_method', async ({ page }) => {
  await seedTabsPreview(page, {
    tabs: tabsConfig(),
    activeTabId: 'user',
    extraBlocks: [
      {
        id: 'switch-button',
        type: 'MButton',
        data: {
          label: 'Switch tab',
          variant: 'primary',
          align: 'left',
          testId: 'switch-tab-button'
        },
        events: [
          {
            event: 'click',
            actions: [
              {
                uuid: 'switch_to_system_tab',
                action: 'call_block_method',
                inputs: {
                  blockId: 'tabs-block',
                  method: 'setActiviTabId',
                  args: 'system'
                },
                outputs: ['returnData'],
                nextAction: null
              }
            ]
          }
        ]
      }
    ]
  });

  await openPreview(page);
  await expect(page.getByTestId('editor-tabs-tab-user')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('User create page');

  await page.getByTestId('switch-tab-button').click();

  await expect(page.getByTestId('editor-tabs-tab-system')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('editor-tabs-active-panel')).toContainText('System builtin page');
});

test('shows an error state when the active tab page fails to load', async ({ page }) => {
  await seedTabsPreview(page, {
    tabs: [
      {
        id: 'missing',
        name: 'Missing page',
        pageUUID: 'missing-tabs-page'
      }
    ],
    activeTabId: 'missing'
  });

  await openPreview(page);

  await expect(page.getByTestId('editor-tabs-error-state')).toBeVisible();
  await expect(page.getByTestId('editor-tabs-error-state')).toContainText('Page not found');
});

async function seedTabsPreview(
  page: Page,
  options: {
    tabs: Array<{
      id: string;
      name: string;
      pageUUID: string;
      pageSource?: 'user' | 'system';
      query?: Record<string, string | null | Array<string | null>>;
    }>;
    activeTabId?: string;
    extraBlocks?: SavedBlock[];
  }
) {
  await resetEditor(page, {
    pages: childPages()
  });

  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'tabs-block',
        type: 'MTabs',
        data: {
          tabs: options.tabs,
          activeTabId: options.activeTabId ?? ''
        }
      },
      ...(options.extraBlocks ?? [])
    ]
  });
}

async function openPreview(page: Page) {
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page.getByTestId('preview-pc-canvas')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}\\/preview$`));
}

function tabsConfig() {
  return [
    {
      id: 'user',
      name: '用户创建',
      pageUUID: userPageUuid
    },
    {
      id: 'system',
      name: '系统内置',
      pageUUID: systemPageUuid
    }
  ];
}

function childPages(): MockMokelayPage[] {
  return [
    {
      uuid: userPageUuid,
      name: 'User page',
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'User create page'
          }
        }
      ]
    },
    {
      uuid: systemPageUuid,
      name: 'System page',
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'System builtin page'
          }
        }
      ]
    }
  ];
}
