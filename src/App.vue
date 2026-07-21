<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { TooltipProvider } from 'reka-ui';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import PageEditorHost from '@/editors/page/PageEditorHost.vue';
import MPageEditorBlock from '@/editors/page/MPageEditorBlock.vue';
import {
  createPageEditorBridge,
  type PageEditorOpenRequest,
  type PageEditorResult
} from '@/editors/pageEditor';
import { formatPageReferenceIssue, validatePageReferences } from '@/editors/pageReferenceValidator';
import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';
import { $message } from 'mokelay-components/global-calls';
import { getInitialEditorBlocks } from '@/utils/editorData';
import SourceLayoutShell from 'mokelay-components/layouts/SourceLayoutShell.vue';
import type { LayoutNavigationRequest } from 'mokelay-components/layouts';
import {
  createPage,
  formatMokelayApiError,
  getPage,
  getSystemPage,
  updatePage,
  updatePageLayout,
  type MokelayPage,
  type PageSource,
  type UpdatePagePayload
} from '@/services/pagesApi';
import { generatePageSlug } from 'mokelay-components/pages';
import { collectMissingTranslations, normalizePageLocaleConfig, type PageLocaleConfig } from 'mokelay-components/runtime';
import { setContentEditingLocale, setContentLocaleConfig, useContentLocalization } from '@/composables/useContentLocalization';
import {
  normalizePageDataSources,
  type PageDataSourceConfig,
  type PageRuntimeContext
} from 'mokelay-components/pages';
import {
  getPageRenderBundle,
  getSystemLayout,
  listLayouts,
  listSystemLayouts,
  type MokelayLayout,
  type MokelayLayoutRecord,
  type RenderBundlePage
} from '@/services/layoutsApi';

const PreviewPanel = defineAsyncComponent(() => import('@/components/PreviewPanel.vue'));
const ApiBuilderShell = defineAsyncComponent(() => import('@/api-builder/ApiBuilderShell.vue'));
const NotFoundPage = defineAsyncComponent(() => import('@/components/NotFoundPage.vue'));

const runtimePageUuidPattern = /^[A-Za-z0-9_-]{1,128}$/;

type ParsedRoute = {
  pageUuid: string | null;
  pageSource: PageSource;
  apiUuid: string | null;
  apiBuilder: boolean;
  apiSource: 'user' | 'system';
  apiFragment: boolean;
  preview: boolean;
  runtimePage: boolean;
  notFound: boolean;
};

type RouteLocation = {
  rawPath: string;
};

type PageEditorBlockHandle = {
  flush: () => Promise<unknown>;
};

const routeLocation = ref(readRouteLocation());
const { t } = useI18n();
const pageEditorBlockRef = ref<PageEditorBlockHandle | null>(null);
const pageEditorHostRef = ref<{
  open: (request: PageEditorOpenRequest) => Promise<PageEditorResult>;
} | null>(null);
const currentPageUuid = ref<string | null>(null);
const draftPageSlug = ref(generatePageSlug());
const currentPageName = ref(formatPageName(new Date()));
const currentPageSource = ref<PageSource>('user');
const currentPageAppUuid = ref<string | null>(null);
const currentPageLayoutUuid = ref<string | null>(null);
const pageBlocks = ref<OutputData['blocks']>(getInitialEditorBlocks(t));
const pageDataSources = ref<PageDataSourceConfig[]>([]);
const pageLocaleConfig = ref<PageLocaleConfig>(normalizePageLocaleConfig(undefined));
const { editingLocale } = useContentLocalization();
const currentLayout = ref<MokelayLayout | null>(null);
const sourceLayout = ref<MokelayLayout | null>(null);
const pageLayoutOptions = ref<MokelayLayoutRecord[]>([]);
const isLoadingPage = ref(false);
const isSavingPage = ref(false);
const isLoadingPageLayouts = ref(false);
const isSavingPageLayout = ref(false);
const isLoadingSourceLayout = ref(false);
const pageError = ref('');
const pageLayoutError = ref('');
const sourceLayoutError = ref('');
const runtimePageLoadFailed = ref(false);
const systemPageDraftBaseline = ref<string | null>(null);
let loadRequestId = 0;
let layoutLoadRequestId = 0;
let pageLayoutOptionsRequestId = 0;
let runtimePageLoadRequestId = 0;
let sourceLayoutLoadRequestId = 0;
let layoutNavigationLayout: MokelayLayout | null = null;

const pageEditorBridge = createPageEditorBridge(
  (request) => {
    if (!pageEditorHostRef.value) {
      return Promise.reject(new Error('页面编排器尚未就绪。'));
    }
    return pageEditorHostRef.value.open(request);
  },
  () => currentPageUuid.value
    ? [{ uuid: currentPageUuid.value, source: currentPageSource.value }]
    : [],
  () => ({
    canPersist: currentPageSource.value === 'user',
    canCreateSubPage: currentPageSource.value === 'user',
    ...(currentPageAppUuid.value ? { appUuid: currentPageAppUuid.value } : {})
  })
);

const parsedRoute = computed(() => parseRouteLocation(routeLocation.value));
const routePageUuid = computed(() => parsedRoute.value.pageUuid);
const routePageSource = computed(() => parsedRoute.value.pageSource);
const isApiBuilderPage = computed(() => parsedRoute.value.apiBuilder);
const routeApiUuid = computed(() => parsedRoute.value.apiUuid);
const routeApiSource = computed(() => parsedRoute.value.apiSource);
const routeApiFragment = computed(() => parsedRoute.value.apiFragment);
const isPreviewPage = computed(() => !isApiBuilderPage.value && parsedRoute.value.preview);
const isRuntimePage = computed(() => !isApiBuilderPage.value && parsedRoute.value.runtimePage);
const isNotFoundPage = computed(() => !isApiBuilderPage.value && (parsedRoute.value.notFound || runtimePageLoadFailed.value));
const isEditorPage = computed(() => !isApiBuilderPage.value && !isPreviewPage.value && !isRuntimePage.value && !isNotFoundPage.value && Boolean(routePageUuid.value));
const pageRuntimeContext = computed<PageRuntimeContext>(() => ({
  route: {
    query: parseRouteQuery(routeLocation.value.rawPath)
  }
}));
const usesSourceLayout = computed(() => isApiBuilderPage.value || isEditorPage.value);
const isStandalonePage = computed(() => isPreviewPage.value || isRuntimePage.value || isNotFoundPage.value);
const isLayoutFramedPage = computed(() => isStandalonePage.value || usesSourceLayout.value);
const isEditorReady = computed(() => pageEditorBlockRef.value !== null && !isLoadingPage.value && !isSavingPage.value);
const isSaveReady = computed(() => isEditorReady.value && currentPageSource.value === 'user');
const isSystemPageDraftDirty = computed(() => (
  currentPageSource.value === 'system'
  && systemPageDraftBaseline.value !== null
  && systemPageDraftBaseline.value !== pageDraftFingerprint(
    currentPageName.value,
    pageBlocks.value,
    pageDataSources.value
  )
));
const sourceLayoutPage = computed<RenderBundlePage>(() => ({
  uuid: getSourceLayoutPageUuid(),
  name: getSourceLayoutPageName(),
  blocks: [],
  dataSources: [],
  layoutUuid: 'mokelay_layout',
  subPage: false,
  quotes: [],
  dependencies: []
}));

function syncRoute() {
  const nextLocation = readRouteLocation();

  if (
    isSystemPageDraftDirty.value
    && !isSameSystemDraftRoute(nextLocation)
    && !window.confirm('放弃内置页面的临时修改？')
  ) {
    const restoredUrl = new URL(window.location.href);
    restoredUrl.hash = `#${routeLocation.value.rawPath}`;
    window.history.replaceState(window.history.state, '', restoredUrl);
    return;
  }

  if (isSystemPageDraftDirty.value && !isSameSystemDraftRoute(nextLocation)) {
    systemPageDraftBaseline.value = null;
  }
  routeLocation.value = nextLocation;
}

function isSameSystemDraftRoute(location: RouteLocation) {
  if (currentPageSource.value !== 'system' || !currentPageUuid.value) return false;
  const route = parseRouteLocation(location);
  return route.pageUuid === currentPageUuid.value
    && route.pageSource === 'system'
    && !route.apiBuilder
    && !route.runtimePage
    && !route.notFound;
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!isSystemPageDraftDirty.value) return;
  event.preventDefault();
  event.returnValue = '';
}

function readRouteLocation(): RouteLocation {
  const hash = window.location.hash || '';

  if (hash) {
    return {
      rawPath: hash.replace(/^#/, '') || '/'
    };
  }

  const pathname = normalizeEntrypointPathname(window.location.pathname);

  return {
    rawPath: `${pathname || '/'}${window.location.search || ''}`
  };
}

function normalizeEntrypointPathname(pathname: string) {
  const filename = pathname.split('/').pop();

  if (filename === 'index.html' || filename === 'editor.html') {
    return '/';
  }

  return pathname;
}

function createParsedRoute(overrides: Partial<ParsedRoute> = {}): ParsedRoute {
  return {
    pageUuid: null,
    pageSource: 'user',
    apiUuid: null,
    apiBuilder: false,
    apiSource: 'user',
    apiFragment: false,
    preview: false,
    runtimePage: false,
    notFound: false,
    ...overrides
  };
}

function parseRouteLocation(location: RouteLocation): ParsedRoute {
  const rawPath = location.rawPath || '/';
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const [path, rawQuery = ''] = normalizedPath.split('?', 2);
  const query = new URLSearchParams(rawQuery);
  const apiSource = query.get('source') === 'system' ? 'system' : 'user';
  const apiFragment = query.get('fragment') === 'true' || query.get('type') === 'fragment';
  const pageMatch = path.match(/^\/pages\/([^/]+)(\/preview)?\/?$/);
  if (path === '/apis' || path === '/pages') {
    return createParsedRoute({ notFound: true });
  }

  const apiMatch = path.match(/^\/apis\/([^/]+)\/?$/);

  if (apiMatch) {
    return createParsedRoute({
      apiUuid: safeDecodeURIComponent(apiMatch[1]),
      apiBuilder: true,
      apiSource,
      apiFragment
    });
  }

  if (pageMatch) {
    return createParsedRoute({
      pageUuid: safeDecodeURIComponent(pageMatch[1]),
      pageSource: apiSource,
      preview: Boolean(pageMatch[2])
    });
  }

  if (path === '/preview') {
    return createParsedRoute({ preview: true });
  }

  const runtimePageMatch = path.match(/^\/([^/]+)\/?$/);
  const runtimePageUuid = path === '/'
    ? 'home'
    : runtimePageMatch ? safeDecodeURIComponent(runtimePageMatch[1]) : '';

  if (runtimePageUuidPattern.test(runtimePageUuid)) {
    return createParsedRoute({
      pageUuid: runtimePageUuid,
      pageSource: 'system',
      runtimePage: true
    });
  }

  return createParsedRoute({ notFound: true });
}

function parseRouteQuery(rawPath: string) {
  const queryIndex = rawPath.indexOf('?');
  const rawQuery = queryIndex >= 0 ? rawPath.slice(queryIndex + 1) : '';
  return Object.fromEntries(new URLSearchParams(rawQuery).entries());
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sourceQuery(source: PageSource) {
  return source === 'system' ? '?source=system' : '';
}

function getEditorHash(uuid: string, source: PageSource = 'user') {
  return `/pages/${encodeURIComponent(uuid)}${sourceQuery(source)}`;
}

function getPreviewHash(uuid: string, source: PageSource = 'user') {
  return `/pages/${encodeURIComponent(uuid)}/preview${sourceQuery(source)}`;
}

function persistDraftBlocks(blocks: OutputData['blocks']) {
  localStorage.setItem(MOKELAY_CONFIG_STORAGE_KEY, JSON.stringify({ blocks }));
}

function pageDraftFingerprint(
  name: string,
  blocks: unknown,
  dataSources: unknown
) {
  return JSON.stringify({ name, blocks, dataSources });
}

function applyPage(page: MokelayPage, source: PageSource = currentPageSource.value) {
  currentPageUuid.value = page.uuid;
  currentPageSource.value = source;
  currentPageName.value = page.name || formatPageName(new Date());
  currentPageAppUuid.value = page.appUuid ?? null;
  currentPageLayoutUuid.value = page.layoutUuid ?? null;
  pageBlocks.value = page.blocks;
  pageDataSources.value = page.dataSources ?? [];
  pageLocaleConfig.value = normalizePageLocaleConfig(page.localeConfig);
  setContentLocaleConfig(pageLocaleConfig.value);
  pageError.value = '';
  pageLayoutError.value = '';
  if (source === 'system') {
    systemPageDraftBaseline.value = pageDraftFingerprint(
      currentPageName.value,
      pageBlocks.value,
      pageDataSources.value
    );
  } else {
    systemPageDraftBaseline.value = null;
    persistDraftBlocks(page.blocks);
  }
}

function applyRuntimePage(page: RenderBundlePage, layout: MokelayLayout | null) {
  currentPageUuid.value = page.uuid;
  currentPageName.value = page.name || formatPageName(new Date());
  currentPageSource.value = 'system';
  currentPageAppUuid.value = page.appUuid ?? null;
  currentPageLayoutUuid.value = page.layoutUuid ?? null;
  pageBlocks.value = page.blocks;
  pageDataSources.value = page.dataSources ?? [];
  pageLocaleConfig.value = normalizePageLocaleConfig(page.localeConfig);
  setContentLocaleConfig(pageLocaleConfig.value);
  currentLayout.value = layout;
  systemPageDraftBaseline.value = null;
  pageError.value = '';
  pageLayoutError.value = '';
}

function resetToLocalDraft() {
  loadRequestId += 1;
  currentPageUuid.value = null;
  draftPageSlug.value = generatePageSlug();
  currentPageSource.value = 'user';
  currentPageName.value = formatPageName(new Date());
  currentPageAppUuid.value = null;
  currentPageLayoutUuid.value = null;
  pageError.value = '';
  pageLayoutError.value = '';
  isLoadingPage.value = false;
  pageBlocks.value = getInitialEditorBlocks(t);
  pageDataSources.value = [];
  pageLocaleConfig.value = normalizePageLocaleConfig(undefined);
  setContentLocaleConfig(pageLocaleConfig.value);
  currentLayout.value = null;
  systemPageDraftBaseline.value = null;
}

function resetRuntimePageState(uuid: string | null, preservedLayout: MokelayLayout | null = null) {
  currentPageUuid.value = uuid;
  currentPageSource.value = 'system';
  currentPageName.value = uuid || t('notFound.title');
  currentPageAppUuid.value = null;
  currentPageLayoutUuid.value = null;
  pageBlocks.value = [];
  pageDataSources.value = [];
  currentLayout.value = preservedLayout;
  systemPageDraftBaseline.value = null;
  pageError.value = '';
  pageLayoutError.value = '';
}

async function loadPage(uuid: string, source: PageSource) {
  const requestId = loadRequestId + 1;
  loadRequestId = requestId;
  isLoadingPage.value = true;
  pageError.value = '';
  currentPageSource.value = source;
  if (!isPreviewPage.value) {
    currentLayout.value = null;
  }

  try {
    const page = source === 'system' ? await getSystemPage(uuid) : await getPage(uuid);
    if (requestId !== loadRequestId) {
      return;
    }
    applyPage(page, source);
  } catch (error) {
    if (requestId !== loadRequestId) {
      return;
    }
    currentPageUuid.value = uuid;
    currentPageSource.value = source;
    currentPageName.value = formatPageName(new Date());
    pageBlocks.value = [];
    pageDataSources.value = [];
    systemPageDraftBaseline.value = null;
    pageError.value = toErrorMessage(error) || t('page.loadFailed');
    void $message('error', t('page.loadFailed'));
  } finally {
    if (requestId === loadRequestId) {
      isLoadingPage.value = false;
    }
  }
}

async function loadPreviewLayout(uuid: string, source: PageSource) {
  const requestId = layoutLoadRequestId + 1;
  layoutLoadRequestId = requestId;

  try {
    const bundle = await getPageRenderBundle(uuid, source);
    if (requestId !== layoutLoadRequestId) return;

    currentLayout.value = bundle.layout;

    if (bundle.page && currentPageUuid.value !== uuid) {
      applyPage({
        uuid: bundle.page.uuid,
        name: bundle.page.name,
        blocks: bundle.page.blocks,
        dataSources: bundle.page.dataSources,
        localeConfig: normalizePageLocaleConfig(bundle.page.localeConfig),
        appUuid: bundle.page.appUuid,
        layoutUuid: bundle.page.layoutUuid,
        subPage: bundle.page.subPage ?? false,
        quotes: bundle.page.quotes ?? [],
        dependencies: bundle.page.dependencies ?? [],
        createdAt: bundle.page.createdAt,
        updatedAt: bundle.page.updatedAt
      }, source);
    }
  } catch {
    if (requestId !== layoutLoadRequestId) return;
    currentLayout.value = null;
  }
}

async function loadRuntimePage(uuid: string) {
  const requestId = runtimePageLoadRequestId + 1;
  runtimePageLoadRequestId = requestId;
  const preservedLayout = layoutNavigationLayout;
  isLoadingPage.value = preservedLayout === null;
  runtimePageLoadFailed.value = false;
  if (!preservedLayout) {
    resetRuntimePageState(uuid);
  }

  try {
    const bundle = await getPageRenderBundle(uuid, 'system');
    if (requestId !== runtimePageLoadRequestId) return;

    if (!bundle.page) {
      runtimePageLoadFailed.value = true;
      return;
    }

    applyRuntimePage(bundle.page, preservedLayout ?? bundle.layout);
  } catch {
    if (requestId !== runtimePageLoadRequestId) return;
    runtimePageLoadFailed.value = true;
    if (!preservedLayout) {
      resetRuntimePageState(uuid);
    }
  } finally {
    if (requestId === runtimePageLoadRequestId) {
      isLoadingPage.value = false;
    }
  }
}

function handleLayoutNavigate(request: LayoutNavigationRequest) {
  const nextLocation = { rawPath: request.route };
  const nextRoute = parseRouteLocation(nextLocation);

  if (nextRoute.runtimePage) {
    layoutNavigationLayout = currentLayout.value ?? sourceLayout.value;
  } else {
    layoutNavigationLayout = null;
  }

  if (routeLocation.value.rawPath === request.route) return;
  window.location.hash = request.route;
}

async function loadSourceLayout() {
  if (sourceLayout.value?.uuid === 'mokelay_layout') {
    sourceLayoutError.value = '';
    isLoadingSourceLayout.value = false;
    return;
  }

  const requestId = sourceLayoutLoadRequestId + 1;
  sourceLayoutLoadRequestId = requestId;
  isLoadingSourceLayout.value = true;
  sourceLayoutError.value = '';

  try {
    const layout = await getSystemLayout('mokelay_layout');
    if (requestId !== sourceLayoutLoadRequestId) return;
    sourceLayout.value = layout;
  } catch (error) {
    if (requestId !== sourceLayoutLoadRequestId) return;
    sourceLayout.value = null;
    sourceLayoutError.value = toErrorMessage(error) || '源码页面布局加载失败。';
  } finally {
    if (requestId === sourceLayoutLoadRequestId) {
      isLoadingSourceLayout.value = false;
    }
  }
}

async function loadPageLayoutOptions(source: PageSource) {
  const requestId = pageLayoutOptionsRequestId + 1;
  pageLayoutOptionsRequestId = requestId;
  isLoadingPageLayouts.value = true;
  pageLayoutError.value = '';

  try {
    const layouts = source === 'system'
      ? await listSystemLayouts()
      : (await listLayouts({
          page: 1,
          pageSize: 100
        })).layouts;

    if (requestId !== pageLayoutOptionsRequestId) return;
    pageLayoutOptions.value = layouts;
  } catch (error) {
    if (requestId !== pageLayoutOptionsRequestId) return;
    pageLayoutOptions.value = [];
    pageLayoutError.value = toErrorMessage(error) || '布局列表加载失败。';
  } finally {
    if (requestId === pageLayoutOptionsRequestId) {
      isLoadingPageLayouts.value = false;
    }
  }
}

function toErrorMessage(error: unknown) {
  return formatMokelayApiError(error);
}

function formatPageName(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getSourceLayoutPageUuid() {
  if (isApiBuilderPage.value) {
    return routeApiUuid.value ? `apis/${routeApiUuid.value}` : 'apis';
  }

  if (isEditorPage.value) {
    return currentPageUuid.value ? `pages/${currentPageUuid.value}` : 'page-editor';
  }

  return 'source-page';
}

function getSourceLayoutPageName() {
  if (isApiBuilderPage.value) {
    return 'API Builder';
  }

  if (isEditorPage.value) {
    return currentPageName.value || t('page.unnamedPage');
  }

  return t('app.title');
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute);
  window.addEventListener('popstate', syncRoute);
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncRoute);
  window.removeEventListener('popstate', syncRoute);
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

watch(
  [routePageUuid, routePageSource, isApiBuilderPage, isRuntimePage, isNotFoundPage],
  ([uuid, source, apiBuilder, runtimePage, notFound]) => {
    if (apiBuilder || runtimePage || notFound) {
      loadRequestId += 1;
      return;
    }

    if (!uuid) {
      resetToLocalDraft();
      return;
    }

    if (uuid === currentPageUuid.value && source === currentPageSource.value) {
      return;
    }

    void loadPage(uuid, source);
  },
  { immediate: true }
);

watch(
  [isRuntimePage, routePageUuid],
  ([runtimePage, uuid]) => {
    runtimePageLoadFailed.value = false;

    if (!runtimePage) {
      runtimePageLoadRequestId += 1;
      return;
    }

    if (!uuid) {
      runtimePageLoadFailed.value = true;
      return;
    }

    void loadRuntimePage(uuid);
  },
  { immediate: true }
);

watch(
  [isPreviewPage, routePageUuid, routePageSource],
  ([preview, uuid, source], [wasPreview]) => {
    if (!preview) {
      if (wasPreview) {
        currentLayout.value = null;
      }
      layoutLoadRequestId += 1;
      return;
    }

    if (!uuid) {
      currentLayout.value = null;
      return;
    }

    void loadPreviewLayout(uuid, source);
  },
  { immediate: true }
);

watch(
  [isEditorPage, routePageSource],
  ([editorPage, source]) => {
    if (!editorPage) {
      pageLayoutOptionsRequestId += 1;
      pageLayoutOptions.value = [];
      isLoadingPageLayouts.value = false;
      pageLayoutError.value = '';
      return;
    }

    void loadPageLayoutOptions(source);
  },
  { immediate: true }
);

watch(
  usesSourceLayout,
  (enabled) => {
    if (!enabled) {
      sourceLayoutLoadRequestId += 1;
      isLoadingSourceLayout.value = false;
      sourceLayoutError.value = '';
      return;
    }

    void loadSourceLayout();
  },
  { immediate: true }
);

function handleEditorChange(blocks: OutputData['blocks']) {
  pageBlocks.value = blocks;
  if (currentPageSource.value === 'user') persistDraftBlocks(blocks);
}

function handlePageNameChange(name: string) {
  currentPageName.value = name;
}

async function readEditorBlocks(): Promise<OutputData['blocks']> {
  const draft = await pageEditorBlockRef.value?.flush();
  const blocks: OutputData['blocks'] = typeof draft === 'object' && draft !== null && 'blocks' in draft && Array.isArray(draft.blocks)
    ? draft.blocks as OutputData['blocks']
    : pageBlocks.value;
  pageBlocks.value = blocks;
  if (currentPageSource.value === 'user') persistDraftBlocks(blocks);

  return blocks;
}

async function saveEditorContent() {
  if (isSavingPage.value || isLoadingPage.value || currentPageSource.value !== 'user') {
    return;
  }

  isSavingPage.value = true;
  pageError.value = '';

  try {
    const blocks = await readEditorBlocks();
    const missingTranslations = collectMissingTranslations({ blocks, localeConfig: pageLocaleConfig.value });
    if (missingTranslations.length) {
      void $message('warning', `${t('contentLocalization.missingWarning')} ${missingTranslations.length}`);
    }
    const validation = validatePageReferences(blocks, currentPageUuid.value
      ? [{ uuid: currentPageUuid.value, source: currentPageSource.value }]
      : []);
    if (!validation.valid) {
      throw new Error(validation.issues[0]
        ? formatPageReferenceIssue(validation.issues[0])
        : '页面引用配置无效。');
    }
    const uuid = currentPageUuid.value;
    const name = currentPageName.value.trim() || formatPageName(new Date());
    currentPageName.value = name;
    const payload = { name, blocks } as UpdatePagePayload;
    payload.dataSources = normalizePageDataSources(pageDataSources.value as unknown);
    payload.localeConfig = pageLocaleConfig.value;
    let page: MokelayPage;
    if (uuid) {
      page = await updatePage(uuid, payload);
    } else {
      page = await createPage({
        ...payload,
        uuid: draftPageSlug.value
      });
    }

    applyPage(page, 'user');
    void $message('success', t('editor.saveSuccess'));

    if (!uuid) {
      window.location.hash = getEditorHash(page.uuid);
    }
  } catch (error) {
    pageError.value = toErrorMessage(error) || t('editor.saveFailed');
    void $message('error', t('editor.saveFailed'));
  } finally {
    isSavingPage.value = false;
  }
}

function updateSupportedLocales(event: Event) {
  const requested = [...new Set((event.target as HTMLInputElement).value
    .split(',')
    .map((locale) => locale.trim())
    .filter(Boolean))];
  if (!requested.length) return;
  const removed = pageLocaleConfig.value.supportedLocales.filter((locale) => !requested.includes(locale));
  if (removed.length && !window.confirm(t('contentLocalization.removeConfirm'))) {
    (event.target as HTMLInputElement).value = pageLocaleConfig.value.supportedLocales.join(', ');
    return;
  }
  pageLocaleConfig.value = normalizePageLocaleConfig({
    defaultLocale: requested.includes(pageLocaleConfig.value.defaultLocale)
      ? pageLocaleConfig.value.defaultLocale
      : requested[0],
    supportedLocales: requested
  });
  setContentLocaleConfig(pageLocaleConfig.value);
}

function updateDefaultLocale(event: Event) {
  pageLocaleConfig.value = normalizePageLocaleConfig({
    ...pageLocaleConfig.value,
    defaultLocale: (event.target as HTMLSelectElement).value
  });
  setContentLocaleConfig(pageLocaleConfig.value);
}

async function handlePageLayoutChange(layoutUuid: string | null) {
  if (
    isSavingPageLayout.value ||
    isLoadingPage.value ||
    currentPageSource.value !== 'user' ||
    !currentPageUuid.value ||
    layoutUuid === currentPageLayoutUuid.value
  ) {
    return;
  }

  isSavingPageLayout.value = true;
  pageLayoutError.value = '';

  try {
    const page = await updatePageLayout(currentPageUuid.value, {
      appUuid: currentPageAppUuid.value,
      layoutUuid
    });

    applyPage(page, 'user');
    void $message('success', layoutUuid ? '页面布局已绑定。' : '页面布局已清除。');
  } catch (error) {
    pageLayoutError.value = toErrorMessage(error) || '页面布局保存失败。';
    void $message('error', '页面布局保存失败。');
  } finally {
    isSavingPageLayout.value = false;
  }
}

async function openPreviewPage() {
  if (isLoadingPage.value || isSavingPage.value) {
    return;
  }

  await readEditorBlocks();
  window.location.hash = currentPageUuid.value ? getPreviewHash(currentPageUuid.value, currentPageSource.value) : '/preview';
}

function backToEditorPage() {
  const uuid = routePageUuid.value ?? currentPageUuid.value;
  window.location.hash = uuid ? getEditorHash(uuid, currentPageSource.value) : '/';
}

function backToPagesPage() {
  const query = new URLSearchParams(window.location.hash.split('?', 2)[1] ?? '');
  const appUuid = query.get('appUuid');
  window.location.hash = appUuid ? `/app?uuid=${encodeURIComponent(appUuid)}` : '/';
}

</script>

<template>
  <TooltipProvider>
    <main
      data-testid="app-root"
      :class="isLayoutFramedPage
        ? 'flex min-h-screen flex-col bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100'
        : 'flex min-h-screen flex-col bg-slate-100 p-4 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100'"
    >
      <SourceLayoutShell
        v-if="usesSourceLayout && (sourceLayout || sourceLayoutError)"
        :layout="sourceLayout"
        :page="sourceLayoutPage"
        :error="sourceLayoutError"
        :on-navigate="handleLayoutNavigate"
      >
        <ApiBuilderShell
          v-if="isApiBuilderPage"
          :route-uuid="routeApiUuid"
          :route-source="routeApiSource"
          :route-fragment="routeApiFragment"
        />
        <div v-else-if="isEditorPage" class="flex flex-1 flex-col gap-4">
          <section data-testid="page-editor-header" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <button data-testid="back-to-page-list-button" class="mb-2 text-sm font-medium text-teal-700 hover:text-teal-500 dark:text-teal-300" @click="backToPagesPage">
                  {{ t('page.backToPages') }}
                </button>
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-xl font-semibold text-slate-950 dark:text-white">{{ currentPageName || t('page.unnamedPage') }}</h2>
                  <code v-if="currentPageUuid" class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ currentPageUuid }}</code>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  data-testid="save-button"
                  class="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!isSaveReady"
                  @click="saveEditorContent"
                >
                  {{ isSavingPage ? t('editor.saving') : t('editor.saveContent') }}
                </button>
                <button
                  data-testid="preview-button"
                  class="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!isEditorReady"
                  @click="openPreviewPage"
                >
                  {{ t('editor.previewPage') }}
                </button>
              </div>
            </div>
          </section>

          <p
            v-if="currentPageSource === 'system'"
            data-testid="system-page-ephemeral-notice"
            class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
          >
            内置页面处于临时编排模式：修改不会保存，也不能创建或保存子页面。
          </p>

          <section class="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900" data-testid="page-locale-settings">
            <h3 class="font-semibold text-slate-900 dark:text-white">{{ t('contentLocalization.title') }}</h3>
            <div class="grid gap-3 md:grid-cols-3">
              <label class="grid gap-1">
                <span>{{ t('contentLocalization.supportedLocales') }}</span>
                <input class="rounded border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700" :value="pageLocaleConfig.supportedLocales.join(', ')" @change="updateSupportedLocales" />
              </label>
              <label class="grid gap-1">
                <span>{{ t('contentLocalization.defaultLocale') }}</span>
                <select class="rounded border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700" :value="pageLocaleConfig.defaultLocale" @change="updateDefaultLocale">
                  <option v-for="locale in pageLocaleConfig.supportedLocales" :key="locale" :value="locale">{{ locale }}</option>
                </select>
              </label>
              <label class="grid gap-1">
                <span>{{ t('contentLocalization.editingLocale') }}</span>
                <select class="rounded border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700" :value="editingLocale" @change="setContentEditingLocale(($event.target as HTMLSelectElement).value)">
                  <option v-for="locale in pageLocaleConfig.supportedLocales" :key="locale" :value="locale">{{ locale }}</option>
                </select>
              </label>
            </div>
          </section>

          <MPageEditorBlock
            ref="pageEditorBlockRef"
            mode="edit"
            context="standalone"
            :page-uuid="currentPageUuid"
            :page-name="currentPageName"
            :blocks="pageBlocks"
            :data-sources="pageDataSources"
            :page-editor="pageEditorBridge"
            :show-layout-binding="true"
            :layout-uuid="currentPageLayoutUuid"
            :layout-options="pageLayoutOptions"
            :layout-loading="isLoadingPageLayouts"
            :layout-saving="isSavingPageLayout"
            :layout-error="pageLayoutError"
            :can-edit-layout-binding="currentPageSource === 'user'"
            :loading="isLoadingPage"
            :error="pageError"
            @change="handleEditorChange"
            @name-change="handlePageNameChange"
            @layout-change="handlePageLayoutChange"
          />
        </div>
      </SourceLayoutShell>
      <section
        v-else-if="usesSourceLayout && isLoadingSourceLayout"
        class="flex min-h-screen flex-1 items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400"
        data-testid="source-layout-loading"
      >
        {{ t('page.loading') }}
      </section>
      <NotFoundPage v-else-if="isNotFoundPage" />
      <PreviewPanel
        v-else-if="isRuntimePage"
        :blocks="pageBlocks"
        :data-sources="pageDataSources"
        :locale-config="pageLocaleConfig"
        :runtime-context="pageRuntimeContext"
        :loading="isLoadingPage"
        :page-uuid="routePageUuid ?? currentPageUuid"
        :page-name="currentPageName"
        :layout="currentLayout"
        :minimal="true"
        :show-title="false"
        :show-toolbar="false"
        :on-navigate="handleLayoutNavigate"
      />
      <PreviewPanel
        v-else-if="isPreviewPage"
        :blocks="pageBlocks"
        :data-sources="pageDataSources"
        :locale-config="pageLocaleConfig"
        :runtime-context="pageRuntimeContext"
        :loading="isLoadingPage"
        :error="pageError"
        :page-uuid="routePageUuid ?? currentPageUuid"
        :page-name="currentPageName"
        :layout="currentLayout"
        :minimal="true"
        :show-title="false"
        :on-navigate="handleLayoutNavigate"
      >
        <template #toolbarLeading>
          <button
            data-testid="back-to-editor-button"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
            @click="backToEditorPage"
          >
            {{ t('preview.backToEditor') }}
          </button>
        </template>
      </PreviewPanel>
      <PageEditorHost ref="pageEditorHostRef" />
    </main>
  </TooltipProvider>
</template>
