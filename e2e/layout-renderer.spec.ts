import { expect, test, type Locator } from '@playwright/test';
import { resetEditor } from './helpers/editor';

async function expectBackgroundColor(locator: Locator, color: string) {
  await expect.poll(() => locator.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(color);
}

test('renders an app default layout around a page preview', async ({ page }) => {
  const pageUuid = '11111111-1111-4111-8111-111111111111';

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    loggedInUser: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      enterprise_name: 'Analytical Engines'
    },
    apps: [
      {
        id: 1,
        uuid: 'console',
        alias: 'Console',
        description: 'Internal console',
        defaultLayoutUuid: 'main_layout'
      }
    ],
    pages: [
      {
        uuid: pageUuid,
        name: 'Preview Page',
        appUuid: 'console',
        blocks: [
          {
            id: 'body-copy',
            type: 'paragraph',
            data: {
              text: 'Rendered inside the page slot.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'main_layout',
        name: 'Main Layout',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'main_layout',
          name: 'Main Layout',
          resources: {
            mainMenu: {
              type: 'static',
              items: [
                { label: 'Home', href: '/' },
                { label: 'Docs', href: '/docs' }
              ]
            }
          },
          auth: {
            enabled: true,
            endpoint: '/api/mokelay/me'
          },
          blocks: [
            {
              id: 'top-nav',
              type: 'MSiteTopNav',
              data: {
                brand: { text: 'Mokelay', href: '/' },
                items: { template: '{{resources.mainMenu.items}}' },
                guestActions: [
                  { id: 'login', type: 'MLink', data: { text: 'Login', url: '/login' } }
                ],
                userActions: [
                  { id: 'dashboard', type: 'MLink', data: { text: '{{auth.user.name}} · {{auth.user.enterprise_name}}', url: '/dashboard' } }
                ]
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default' }
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('layout-renderer')).toBeVisible();
  await expect(page.getByTestId('layout-top-nav')).toContainText('Docs');
  await expect(page.getByTestId('layout-top-nav')).toContainText('Ada Lovelace · Analytical Engines');
  await expect(page.getByTestId('preview-blocks')).toContainText('Rendered inside the page slot.');
  await expect(page.getByTestId('layout-page-slot-panel')).toHaveCount(0);
  await expect(page.locator('[data-layout-page-slot-surface="plain"]')).toBeVisible();
});

test('renders guest actions without resolving logged-in user templates', async ({ page }) => {
  const pageUuid = '22222222-2222-4222-8222-222222222222';

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    pages: [
      {
        uuid: pageUuid,
        name: 'Guest Preview Page',
        layoutUuid: 'guest_layout',
        blocks: [
          {
            id: 'guest-copy',
            type: 'paragraph',
            data: {
              text: 'Guest page slot content.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'guest_layout',
        name: 'Guest Layout',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'guest_layout',
          name: 'Guest Layout',
          resources: {
            mainMenu: {
              type: 'static',
              items: [
                { label: 'Home', href: '/' }
              ]
            }
          },
          auth: {
            enabled: true,
            endpoint: '/api/mokelay/me'
          },
          blocks: [
            {
              id: 'top-nav',
              type: 'MSiteTopNav',
              data: {
                brand: { text: 'Mokelay', href: '/' },
                items: { template: '{{resources.mainMenu.items}}' },
                guestActions: [
                  { id: 'login', type: 'MLink', data: { text: 'Login', url: '/login' } }
                ],
                userActions: [
                  { id: 'dashboard', type: 'MLink', data: { text: '{{auth.user.name}}', url: '/dashboard' } }
                ]
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default' }
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('layout-block-error')).toHaveCount(0);
  await expect(page.getByTestId('layout-top-nav')).toContainText('Login');
  await expect(page.getByTestId('preview-blocks')).toContainText('Guest page slot content.');
});

test('binds a layout from the page editor and previews the page inside it', async ({ page }) => {
  const pageUuid = '33333333-3333-4333-8333-333333333333';
  const apiState = await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}`,
    pages: [
      {
        uuid: pageUuid,
        name: 'Index Page',
        blocks: [
          {
            id: 'index-copy',
            type: 'paragraph',
            data: {
              text: 'Index page body.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'main_layout',
        name: 'Main Layout',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'main_layout',
          name: 'Main Layout',
          resources: {
            mainMenu: {
              type: 'static',
              items: [
                { label: 'Home', href: '/' },
                { label: 'Pricing', href: '/pricing' }
              ]
            }
          },
          auth: {
            enabled: true,
            endpoint: '/api/mokelay/me'
          },
          blocks: [
            {
              id: 'top-nav',
              type: 'MSiteTopNav',
              data: {
                brand: { text: 'Mokelay', href: '/' },
                items: { template: '{{resources.mainMenu.items}}' },
                guestActions: [
                  { id: 'login', type: 'MLink', data: { text: 'Login', url: '/login' } }
                ],
                userActions: [
                  { id: 'dashboard', type: 'MLink', data: { text: '{{auth.user.name}}', url: '/dashboard' } }
                ]
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default' }
            }
          ]
        }
      }
    ]
  });

  await page.getByTestId('page-layout-select').selectOption('main_layout');

  await expect.poll(() => apiState.pages.get(pageUuid)?.layoutUuid).toBe('main_layout');
  expect(apiState.pageLayoutUpdatePayloads.at(-1)).toMatchObject({
    uuid: pageUuid,
    layoutUuid: 'main_layout'
  });

  await page.getByTestId('preview-button').click();

  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${pageUuid}\\/preview$`));
  await expect(page.getByTestId('layout-top-nav')).toContainText('Pricing');
  await expect(page.getByTestId('layout-top-nav')).toContainText('Login');
  await expect(page.getByTestId('preview-blocks')).toContainText('Index page body.');
});

test('renders a system page with its declared layout', async ({ page }) => {
  const pageUuid = 'mokelay_list_page';

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview?source=system`,
    systemPages: [
      {
        uuid: pageUuid,
        name: '页面列表',
        layoutUuid: 'mokelay_layout',
        blocks: [
          {
            id: 'system-copy',
            type: 'paragraph',
            data: {
              text: 'Built-in page list content.'
            }
          }
        ]
      }
    ],
    systemLayouts: [
      {
        uuid: 'mokelay_layout',
        name: 'Mokelay编辑器布局',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'mokelay_layout',
          name: 'Mokelay编辑器布局',
          resources: {
            mainMenu: {
              type: 'static',
              items: [
                { label: 'Apps', href: '#/' },
                { label: '页面列表', href: '#/pages', active: true }
              ]
            }
          },
          auth: {
            enabled: false
          },
          blocks: [
            {
              id: 'top-nav',
              type: 'MEditorTopNav',
              data: {
                brand: { text: 'Mokelay Editor', href: '#/', showMark: false },
                items: { template: '{{resources.mainMenu.items}}' }
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default', surface: 'panel' }
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('layout-renderer')).toBeVisible();
  await expect(page.getByTestId('layout-top-nav')).toContainText('Mokelay Editor');
  await expect(page.getByTestId('layout-top-nav').getByRole('link', { name: '首页', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('layout-top-nav')).toContainText('页面列表');
  await expect(page.getByTestId('layout-top-nav').getByRole('link', { name: 'Apps' })).not.toHaveClass(/layout-top-nav__link--active/);
  await expect(page.getByTestId('layout-top-nav').getByRole('link', { name: '页面列表' })).toHaveClass(/layout-top-nav__link--active/);
  await expect(page.getByTestId('preview-blocks')).toContainText('Built-in page list content.');
  await expect(page.getByTestId('layout-page-slot-panel')).toBeVisible();
  await expect(page.getByTestId('layout-page-slot-panel')).toHaveAttribute('data-layout-page-slot-surface', 'panel');

  const topNavBox = await page.getByTestId('layout-top-nav').boundingBox();
  const pageSlotBox = await page.locator('[data-layout-block-type="MPageSlot"]').boundingBox();
  expect(topNavBox).not.toBeNull();
  expect(pageSlotBox).not.toBeNull();
  expect(pageSlotBox!.y - (topNavBox!.y + topNavBox!.height)).toBeGreaterThanOrEqual(12);
});

test('keeps editor top nav usable in H5 width', async ({ page }) => {
  const pageUuid = '88888888-8888-4888-8888-888888888888';

  await page.setViewportSize({ width: 390, height: 844 });
  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    pages: [
      {
        uuid: pageUuid,
        name: 'H5 Layout Preview',
        layoutUuid: 'h5_editor_layout',
        blocks: [
          {
            id: 'h5-copy',
            type: 'paragraph',
            data: {
              text: 'H5 layout content.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'h5_editor_layout',
        name: 'H5 Editor Layout',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'h5_editor_layout',
          name: 'H5 Editor Layout',
          resources: {
            mainMenu: {
              type: 'static',
              items: [
                { label: 'Apps', href: '#/' },
                { label: '数据源', href: '#/datasources' },
                { label: '接口', href: '#/apis' },
                { label: '页面', href: '#/pages' },
                { label: '布局', href: '#/layouts' },
                { label: '文档', href: '#/docs' },
                { label: 'AI Chat', href: '#/ai-chat' }
              ]
            }
          },
          auth: {
            enabled: false
          },
          blocks: [
            {
              id: 'editor-top-nav',
              type: 'MEditorTopNav',
              data: {
                brand: { text: 'Mokelay Editor', href: '#/', showMark: false },
                items: { template: '{{resources.mainMenu.items}}' },
                utilityControls: [
                  {
                    id: 'theme',
                    type: 'select',
                    label: '主题',
                    binding: { source: 'globalSetting', key: 'theme' },
                    options: [
                      { label: '浅色', value: 'light' },
                      { label: '深色', value: 'dark' }
                    ]
                  },
                  {
                    id: 'language',
                    type: 'select',
                    label: '语言',
                    binding: { source: 'globalSetting', key: 'language' },
                    options: [
                      { label: '中文', value: 'zh' },
                      { label: 'English', value: 'en' }
                    ]
                  }
                ]
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default', surface: 'panel' }
            }
          ]
        }
      }
    ]
  });

  const topNav = page.getByTestId('layout-top-nav');
  const navLinks = topNav.locator('.layout-top-nav__links');
  const menuButton = topNav.getByTestId('layout-top-nav-menu-button');
  const themeButton = topNav.getByTestId('layout-top-nav-mobile-control-theme');
  const languageButton = topNav.getByTestId('layout-top-nav-mobile-control-language');

  await expect(topNav).toContainText('Mokelay Editor');
  await expect(topNav.getByRole('link', { name: '首页', exact: true })).toHaveCount(0);
  await expect(themeButton).toBeVisible();
  await expect(languageButton).toBeVisible();
  await expect(page.getByTestId('layout-top-nav-control-theme')).toBeHidden();
  await expect(page.getByTestId('layout-top-nav-control-language')).toBeHidden();
  await expect(navLinks).toBeHidden();
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toContainText('页面');
  await menuButton.click();
  await expect(topNav.getByTestId('layout-top-nav-menu-list')).toContainText('AI Chat');
  await themeButton.click();
  await expect(topNav.getByTestId('layout-top-nav-mobile-control-menu-theme')).toContainText('深色');
  await expect.poll(() => topNav.evaluate((element) => element.getBoundingClientRect().width <= document.documentElement.clientWidth)).toBe(true);
  await expect.poll(() => page.evaluate(() => {
    const documentWidth = document.documentElement.clientWidth;
    return document.documentElement.scrollWidth <= documentWidth && document.body.scrollWidth <= documentWidth;
  })).toBe(true);

  await page.getByTestId('preview-mode-h5').click();

  const phoneScreen = page.getByTestId('preview-phone-screen');
  const h5TopNav = phoneScreen.getByTestId('layout-top-nav');
  const h5NavLinks = h5TopNav.locator('.layout-top-nav__links');
  const h5MenuButton = h5TopNav.getByTestId('layout-top-nav-menu-button');
  const h5ThemeButton = h5TopNav.getByTestId('layout-top-nav-mobile-control-theme');
  const h5LanguageButton = h5TopNav.getByTestId('layout-top-nav-mobile-control-language');

  await expect(h5TopNav).toContainText('Mokelay Editor');
  await expect(h5ThemeButton).toBeVisible();
  await expect(h5LanguageButton).toBeVisible();
  await expect(phoneScreen.getByTestId('layout-top-nav-control-theme')).toBeHidden();
  await expect(phoneScreen.getByTestId('layout-top-nav-control-language')).toBeHidden();
  await expect(h5NavLinks).toBeHidden();
  await expect(h5MenuButton).toBeVisible();
  await h5MenuButton.click();
  await expect(h5TopNav.getByTestId('layout-top-nav-menu-list')).toContainText('AI Chat');
  await expect.poll(() => phoneScreen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test('binds editor top nav utility controls to global settings', async ({ page }) => {
  const pageUuid = '77777777-7777-4777-8777-777777777777';

  await page.context().addCookies([
    {
      name: 'mokelay-editor-theme-mode',
      value: 'light',
      url: 'http://127.0.0.1:4173'
    },
    {
      name: 'mokelay-editor-locale',
      value: 'zh',
      url: 'http://127.0.0.1:4173'
    }
  ]);

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    pages: [
      {
        uuid: pageUuid,
        name: 'Settings Layout Preview',
        layoutUuid: 'settings_layout',
        blocks: [
          {
            id: 'settings-copy',
            type: 'paragraph',
            data: {
              text: 'Global settings content.'
            }
          },
          {
            id: 'settings-table',
            type: 'MAdvanceTable',
            data: {
              index: false,
              selection: false,
              showPageBreak: true,
              columns: [
                {
                  columnName: '名称',
                  width: 180,
                  fixed: null,
                  columnContent: [
                    {
                      id: 'settings-table-name',
                      type: 'paragraph',
                      data: {
                        text: '{{name}}'
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'settings_layout',
        name: 'Settings Layout',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'settings_layout',
          name: 'Settings Layout',
          auth: {
            enabled: false
          },
          blocks: [
            {
              id: 'editor-top-nav',
              type: 'MEditorTopNav',
              data: {
                brand: { text: 'Mokelay Editor', href: '#/', showMark: false },
                utilityControls: [
                  {
                    id: 'theme',
                    type: 'select',
                    label: '主题',
                    binding: { source: 'globalSetting', key: 'theme' },
                    options: [
                      { label: '浅色', value: 'light' },
                      { label: '深色', value: 'dark' }
                    ]
                  },
                  {
                    id: 'language',
                    type: 'select',
                    label: '语言',
                    binding: { source: 'globalSetting', key: 'language' },
                    options: [
                      { label: '中文', value: 'zh' },
                      { label: 'English', value: 'en' }
                    ]
                  }
                ]
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default', surface: 'panel' }
            }
          ]
        }
      }
    ]
  });

  const themeSelect = page.getByTestId('layout-top-nav-control-theme');
  const languageSelect = page.getByTestId('layout-top-nav-control-language');

  await expect(themeSelect).toHaveValue('light');
  await expect(languageSelect).toHaveValue('zh');
  await expect.poll(() => page.evaluate(() => window.$mokelaySettings?.getTheme() ?? '')).toBe('light');
  await expect.poll(() => page.evaluate(() => window.$mokelaySettings?.getLanguage() ?? '')).toBe('zh');

  await themeSelect.selectOption('dark');

  await expect(themeSelect).toHaveValue('dark');
  await expect.poll(() => page.evaluate(() => window.$mokelaySettings?.getTheme() ?? '')).toBe('dark');
  await expect.poll(() => page.locator('html').evaluate((element) => element.classList.contains('dark'))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.cookie.includes('mokelay-editor-theme-mode=dark'))).toBe(true);
  await expect(page.getByTestId('layout-page-slot-panel')).toBeVisible();
  await expect(page.getByTestId('advance-table-header-0')).toBeVisible();
  await expect(page.getByTestId('advance-table-pagination')).toBeVisible();
  await expectBackgroundColor(page.getByTestId('layout-renderer'), 'rgb(2, 6, 23)');
  await expectBackgroundColor(page.getByTestId('layout-top-nav'), 'rgb(15, 23, 42)');
  await expectBackgroundColor(page.getByTestId('layout-page-slot-panel'), 'rgb(15, 23, 42)');
  await expectBackgroundColor(page.getByTestId('advance-table-header-0'), 'rgb(30, 41, 59)');
  await expectBackgroundColor(page.locator('.ce-advance-table-tool__empty'), 'rgb(15, 23, 42)');
  await expectBackgroundColor(page.getByTestId('advance-table-pagination'), 'rgb(30, 41, 59)');

  await languageSelect.selectOption('en');

  await expect(languageSelect).toHaveValue('en');
  await expect.poll(() => page.evaluate(() => window.$mokelaySettings?.getLanguage() ?? '')).toBe('en');
  await expect.poll(() => page.evaluate(() => document.cookie.includes('mokelay-editor-locale=en'))).toBe(true);
});

test('renders a web style static top navigation layout', async ({ page }) => {
  const pageUuid = '44444444-4444-4444-8444-444444444444';

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    pages: [
      {
        uuid: pageUuid,
        name: 'Web Layout Preview',
        layoutUuid: 'web_layout',
        blocks: [
          {
            id: 'web-body',
            type: 'paragraph',
            data: {
              text: 'Web layout page slot content.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'web_layout',
        name: 'Web顶部布局',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'web_layout',
          name: 'Web顶部布局',
          resources: {
            mainMenu: {
              type: 'static',
              items: [
                { label: '買幣', href: '#', caret: true },
                { label: '行情', href: '#' },
                { label: '現貨交易', href: '#', caret: true },
                { label: '合約交易', href: '#', caret: true, badge: '🔥', highlight: true },
                { label: '策略交易', href: '#', caret: true },
                { label: '跟單', href: '#', caret: true },
                { label: '理財', href: '#', caret: true },
                { label: '福利中心', href: '#' },
                { label: '更多', href: '#', caret: true }
              ]
            }
          },
          auth: {
            enabled: false
          },
          blocks: [
            {
              id: 'top-nav',
              type: 'MWebTopNav',
              data: {
                brand: { text: 'Mokelay', href: '#', showMark: false },
                items: { template: '{{resources.mainMenu.items}}' },
                actions: [
                  { id: 'search', type: 'MButton', data: { icon: 'search', shape: 'icon', variant: 'ghost' } },
                  { id: 'deposit', type: 'MButton', data: { label: '充值', variant: 'web-primary' } },
                  { id: 'assets', type: 'MLink', data: { text: '資產', url: '#', variant: 'ghost' } },
                  { id: 'notification', type: 'MButton', data: { icon: 'bell', badge: '9', shape: 'icon', variant: 'ghost' } },
                  { id: 'account', type: 'MButton', data: { icon: 'user', shape: 'icon', variant: 'ghost' } },
                  { id: 'download', type: 'MButton', data: { icon: 'download', shape: 'icon', variant: 'ghost' } },
                  { id: 'language', type: 'MButton', data: { icon: 'globe', shape: 'icon', variant: 'ghost' } },
                  { id: 'avatar', type: 'MButton', data: { icon: 'gradient-avatar', shape: 'avatar', variant: 'ghost' } }
                ]
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default' }
            }
          ]
        }
      }
    ]
  });

  const topNav = page.getByTestId('layout-top-nav');

  await expect(topNav).toContainText('Mokelay');
  await expect(topNav).toContainText('合約交易');
  await expect(topNav).toContainText('🔥');
  await expect(topNav).toContainText('充值');
  await expect(topNav).toContainText('資產');
  await expect(topNav.locator('.layout-top-nav__action-icon')).toHaveCount(5);
  await expect(topNav.locator('.layout-top-nav__avatar')).toBeVisible();
  await expect(page.getByTestId('preview-blocks')).toContainText('Web layout page slot content.');

  await expect.poll(async () => topNav.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test('renders an internal admin shell layout with a page slot', async ({ page }) => {
  const pageUuid = '77777777-7777-4777-8777-777777777777';

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    pages: [
      {
        uuid: pageUuid,
        name: 'Internal Admin Preview',
        layoutUuid: 'internal_admin_layout',
        blocks: [
          {
            id: 'internal-admin-body',
            type: 'paragraph',
            data: {
              text: 'Internal admin slot content.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'internal_admin_layout',
        name: '内部管理后台布局',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'internal_admin_layout',
          name: '内部管理后台布局',
          resources: {
            sidebarMenu: {
              type: 'static',
              items: [
                { label: '首页', href: '#/admin', icon: 'home', active: true, favorite: true },
                { label: '低代码菜单', href: '#/admin/low-code', icon: 'settings', expanded: true, children: [
                  { label: '官方渠道验证管理', href: '#/admin/channel-verify', icon: 'file', favorite: true },
                  { label: 'Banner(新)', href: '#/admin/banner-new', icon: 'image', favorite: true },
                  { label: 'Banner管理', href: '#/admin/banner', icon: 'image', favorite: true }
                ] },
                { label: '用户管理', href: '#/admin/users', icon: 'users' },
                { label: '资产管理', href: '#/admin/assets', icon: 'asset' },
                { label: '奖品管理', href: '#/admin/prizes', icon: 'gift' },
                { label: '卡券管理', href: '#/admin/cards', icon: 'card' },
                { label: '运营管理', href: '#/admin/operations', icon: 'settings', expanded: true, children: [
                  { label: '新活动配置', href: '#/admin/campaigns', icon: 'file' }
                ] }
              ]
            },
            favoriteMenu: {
              type: 'static',
              items: [
                { label: '新活动配置', href: '#/admin/campaigns', icon: 'file' },
                { label: 'dashboard', href: '#/admin/dashboard', icon: 'star' }
              ]
            },
            quickMenu: {
              type: 'static',
              items: [
                { label: '客户管理', href: '#/admin/customers', count: 101 },
                { label: '首页', href: '#/admin', count: 44 },
                { label: '常见问题', href: '#/admin/faqs', count: 43 },
                { label: '新活动配置', href: '#/admin/campaigns', count: 32 },
                { label: 'Mokelay页面配置集锦', href: '#/admin/mokelay-pages', count: 29 }
              ]
            }
          },
          auth: {
            enabled: false
          },
          blocks: [
            {
              id: 'admin-shell',
              type: 'MInternalAdminShell',
              data: {
                environmentLabel: '测试环境',
                searchPlaceholder: '搜索菜单...',
                header: {
                  breadcrumb: ['首页'],
                  tutorialLabel: '权限申请教程',
                  tutorialUrl: '#/admin/permission-guide',
                  user: { name: '管理员' },
                  tools: [
                    { id: 'fullscreen', label: '全屏', icon: 'fullscreen', href: '#' },
                    { id: 'type-scale', label: '文字', icon: 'type', href: '#' },
                    { id: 'translate', label: '翻译', icon: 'translate', href: '#' }
                  ]
                },
                tabs: [
                  { label: '首页', href: '#/admin', active: true, closable: true }
                ]
              },
              slots: {
                default: [
                  {
                    id: 'page-slot',
                    type: 'MPageSlot',
                    data: { name: 'default' }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('layout-block-error')).toHaveCount(0);
  await expect(page.getByTestId('internal-admin-shell')).toBeVisible();
  await expect(page.getByTestId('internal-admin-sidebar')).toContainText('测试环境');
  await expect(page.getByPlaceholder('搜索菜单...')).toBeVisible();
  await expect(page.getByTestId('internal-admin-sidebar')).toContainText('收藏菜单');
  await expect(page.getByTestId('internal-admin-sidebar')).toContainText('新活动配置');
  await expect(page.getByTestId('internal-admin-sidebar')).toContainText('用户管理');
  await expect(page.getByTestId('internal-admin-sidebar')).toContainText('Banner(新)');
  await page.getByRole('button', { name: '收起低代码菜单' }).click();
  await expect(page.getByTestId('internal-admin-sidebar').getByText('Banner(新)')).toBeHidden();
  await page.getByRole('button', { name: '展开低代码菜单' }).click();
  await expect(page.getByTestId('internal-admin-sidebar').getByText('Banner(新)')).toBeVisible();
  await expect(page.getByTestId('internal-admin-header')).toContainText('权限申请教程');
  await expect(page.getByTestId('internal-admin-quick-menu')).toContainText('快捷菜单');
  await expect(page.getByTestId('internal-admin-quick-menu')).toContainText('客户管理');
  await expect(page.getByTestId('internal-admin-quick-menu')).toContainText('101');
  await expect(page.getByTestId('internal-admin-tabs')).toContainText('首页');
  await expect(page.getByTestId('internal-admin-content')).toContainText('Internal admin slot content.');

  await page.locator('html').evaluate((element) => element.classList.add('dark'));
  await expect.poll(() => page.locator('html').evaluate((element) => element.classList.contains('dark'))).toBe(true);
  await expect(page.getByTestId('internal-admin-shell')).toBeVisible();
  await expect(page.getByTestId('internal-admin-content')).toContainText('Internal admin slot content.');
});

test('keeps legacy MTopNav variants working through the compatibility adapter', async ({ page }) => {
  const pageUuid = '55555555-5555-4555-8555-555555555555';

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    pages: [
      {
        uuid: pageUuid,
        name: 'Legacy Top Nav Preview',
        layoutUuid: 'legacy_layout',
        blocks: [
          {
            id: 'legacy-copy',
            type: 'paragraph',
            data: {
              text: 'Legacy layout content.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'legacy_layout',
        name: 'Legacy Layout',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'legacy_layout',
          name: 'Legacy Layout',
          resources: {
            mainMenu: {
              type: 'static',
              items: [
                { label: '页面列表', href: '#/pages', active: true },
                { label: '合約交易', href: '#', caret: true, badge: '🔥', highlight: true }
              ]
            }
          },
          auth: {
            enabled: false
          },
          blocks: [
            {
              id: 'editor-top-nav',
              type: 'MTopNav',
              data: {
                variant: 'editor',
                brand: { text: 'Mokelay Editor', href: '#/', showMark: false },
                items: { template: '{{resources.mainMenu.items}}' }
              }
            },
            {
              id: 'web-top-nav',
              type: 'MTopNav',
              data: {
                variant: 'web',
                brand: { text: 'Mokelay', href: '#', showMark: false },
                items: { template: '{{resources.mainMenu.items}}' },
                actions: [
                  { id: 'deposit', type: 'MButton', data: { label: '充值', variant: 'web-primary' } }
                ]
              }
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default' }
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('layout-block-error')).toHaveCount(0);
  await expect(page.getByTestId('layout-top-nav')).toHaveCount(2);
  await expect(page.getByTestId('layout-top-nav').first()).toContainText('Mokelay Editor');
  await expect(page.getByTestId('layout-top-nav').nth(1)).toContainText('Mokelay');
  await expect(page.getByTestId('layout-top-nav').nth(1)).toContainText('充值');
  await expect(page.getByTestId('preview-blocks')).toContainText('Legacy layout content.');
});

test('shows a clear error for an unregistered layout block', async ({ page }) => {
  const pageUuid = '66666666-6666-4666-8666-666666666666';

  await resetEditor(page, {
    initialRoute: `/#/pages/${pageUuid}/preview`,
    pages: [
      {
        uuid: pageUuid,
        name: 'Unknown Layout Block Preview',
        layoutUuid: 'unknown_layout',
        blocks: [
          {
            id: 'unknown-copy',
            type: 'paragraph',
            data: {
              text: 'Unknown block page slot content.'
            }
          }
        ]
      }
    ],
    layouts: [
      {
        uuid: 'unknown_layout',
        name: 'Unknown Layout',
        layoutJson: {
          schemaVersion: 1,
          uuid: 'unknown_layout',
          name: 'Unknown Layout',
          auth: {
            enabled: false
          },
          blocks: [
            {
              id: 'missing-block',
              type: 'AcmeMissingTopNav',
              data: {}
            },
            {
              id: 'page-slot',
              type: 'MPageSlot',
              data: { name: 'default' }
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('layout-block-error')).toContainText('Layout block was not registered: AcmeMissingTopNav');
  await expect(page.getByTestId('preview-blocks')).toContainText('Unknown block page slot content.');
});
