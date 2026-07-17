import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  mockPagesApi,
  type MockMokelayLayout,
  type MockMokelayPage
} from './helpers/editor';

const topNavBlockTypes = new Set(['MSiteTopNav', 'MEditorTopNav', 'MWebTopNav', 'MTopNav']);

function runtimePage(uuid: string, text: string): MockMokelayPage {
  return {
    uuid,
    name: text,
    blocks: [
      {
        id: `${uuid}-heading`,
        type: 'MHeading',
        data: {
          text,
          level: '1'
        }
      }
    ],
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z'
  };
}

function resolveAssetDir(assetDir: 'mokelay-pages' | 'mokelay-layouts') {
  const candidates = [
    resolve(process.cwd(), '../mokelay-server/server/assets', assetDir),
    resolve(process.cwd(), 'submodule/mokelay-server/server/assets', assetDir)
  ];
  const assetPath = candidates.find((candidate) => existsSync(candidate));

  if (!assetPath) {
    throw new Error(`Missing Mokelay server asset directory: ${assetDir}`);
  }

  return assetPath;
}

function readJsonAsset<T>(assetDir: 'mokelay-pages' | 'mokelay-layouts', fileName: string): T {
  return JSON.parse(readFileSync(resolve(resolveAssetDir(assetDir), fileName), 'utf8')) as T;
}

function readSystemPageAsset(uuid: string): MockMokelayPage {
  return readJsonAsset<MockMokelayPage>('mokelay-pages', `${uuid}.json`);
}

function readSystemLayoutAsset(uuid: string): MockMokelayLayout {
  const layoutJson = readJsonAsset<Record<string, unknown>>('mokelay-layouts', `${uuid}.json`);
  return {
    uuid,
    name: typeof layoutJson.name === 'string' ? layoutJson.name : uuid,
    layoutJson,
    createdAt: typeof layoutJson.createdAt === 'string' ? layoutJson.createdAt : undefined,
    updatedAt: typeof layoutJson.updatedAt === 'string' ? layoutJson.updatedAt : undefined
  };
}

function collectEmbeddedTopNavBlocks(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectEmbeddedTopNavBlocks);
  }

  if (!isRecord(value)) {
    return [];
  }

  const type = typeof value.type === 'string' ? value.type : '';
  const id = typeof value.id === 'string' ? value.id : '';
  const current = topNavBlockTypes.has(type) ? [`${type}${id ? `#${id}` : ''}`] : [];

  return [
    ...current,
    ...Object.values(value).flatMap(collectEmbeddedTopNavBlocks)
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

test('all standalone built-in page DSL assets use the editor layout without embedded top navigation blocks', async () => {
  const pageAssetFiles = readdirSync(resolveAssetDir('mokelay-pages'))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();
  const violations = pageAssetFiles.flatMap((fileName) => {
    const asset = readJsonAsset<Record<string, unknown>>('mokelay-pages', fileName);
    const uuid = typeof asset.uuid === 'string' ? asset.uuid : fileName.replace(/\.json$/, '');
    const isEmbeddedQuotedSubpage = asset.subPage === true
      && Array.isArray(asset.quotes)
      && asset.quotes.length > 0;
    const layoutViolation = asset.layoutUuid === 'mokelay_layout' || isEmbeddedQuotedSubpage
      ? []
      : [`${uuid}: layoutUuid=${String(asset.layoutUuid)}`];
    const topNavViolations = collectEmbeddedTopNavBlocks(asset.blocks).map((block) => `${uuid}: ${block}`);

    return [...layoutViolation, ...topNavViolations];
  });

  expect(violations).toEqual([]);
});

test('renders a built-in page DSL from an unmatched hash route', async ({ page }) => {
  const uuid = 'runtime_hash_page';
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: [runtimePage(uuid, 'Runtime hash DSL page')]
  });

  const bundleRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/render_page_bundle' &&
      url.searchParams.get('uuid') === uuid &&
      url.searchParams.get('source') === 'system';
  });

  await page.goto(`/#/${uuid}`);
  await bundleRequest;

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('preview-mode-switcher')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toContainText('Runtime hash DSL page');
});

test('renders a built-in page DSL from a bare path', async ({ page }) => {
  const uuid = 'runtime_bare_page';
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: [runtimePage(uuid, 'Runtime bare DSL page')]
  });

  const bundleRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/render_page_bundle' &&
      url.searchParams.get('uuid') === uuid &&
      url.searchParams.get('source') === 'system';
  });

  await page.goto(`/${uuid}`);
  await bundleRequest;

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('preview-mode-switcher')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toContainText('Runtime bare DSL page');
});

test('renders a built-in source page with the shared editor layout from a runtime route', async ({ page }) => {
  const uuid = 'home';
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: [readSystemPageAsset(uuid)],
    systemLayouts: [readSystemLayoutAsset('mokelay_layout')]
  });

  const bundleRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/render_page_bundle' &&
      url.searchParams.get('uuid') === uuid &&
      url.searchParams.get('source') === 'system';
  });

  await page.goto(`/#/${uuid}`);
  await bundleRequest;

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('preview-mode-switcher')).toHaveCount(0);
  await expect(page.getByTestId('layout-renderer')).toBeVisible();
  await expect(page.getByTestId('layout-top-nav')).toContainText('Mokelay Editor');
  await expect(page.getByTestId('layout-page-slot-panel')).toBeVisible();
  await expect(page.getByTestId('preview-panel')).toContainText('应用管理');
});

test('layout navigation replaces only the page DSL and keeps the current layout', async ({ page }) => {
  const home = { ...runtimePage('home', 'Home DSL'), layoutUuid: 'mokelay_layout' };
  const docs = { ...runtimePage('docs', 'Docs DSL'), layoutUuid: 'web_layout' };
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: [home, docs],
    systemLayouts: [
      readSystemLayoutAsset('mokelay_layout'),
      readSystemLayoutAsset('web_layout')
    ]
  });

  await page.goto('/#/home');
  await expect(page.getByTestId('layout-top-nav')).toContainText('Mokelay Editor');
  await expect(page.getByTestId('preview-panel')).toContainText('Home DSL');
  await page.getByTestId('layout-top-nav').getByRole('link', { name: '文档', exact: true }).click();
  await expect(page).toHaveURL(/#\/docs$/);
  await expect(page.getByTestId('preview-panel')).toContainText('Docs DSL');
  await expect(page.getByTestId('layout-top-nav')).toContainText('Mokelay Editor');
  await expect(page.getByTestId('layout-runtime-loading')).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/#\/home$/);
  await expect(page.getByTestId('preview-panel')).toContainText('Home DSL');
  await expect(page.getByTestId('layout-top-nav')).toContainText('Mokelay Editor');
});

test('shows a 404 page when an unmatched route has no built-in page DSL', async ({ page }) => {
  const uuid = 'missing_runtime_page';
  await mockPagesApi(page, {
    seedDefaultPage: false,
    systemPages: []
  });

  const bundleRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET' &&
      url.pathname === '/api/mokelay/render_page_bundle' &&
      url.searchParams.get('uuid') === uuid &&
      url.searchParams.get('source') === 'system';
  });

  await page.goto(`/#/${uuid}`);
  await bundleRequest;

  await expect(page.getByTestId('app-header')).toHaveCount(0);
  await expect(page.getByTestId('preview-panel')).toHaveCount(0);
  await expect(page.getByTestId('not-found-page')).toBeVisible();
});
