<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { TooltipProvider } from 'reka-ui';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';
import { $message } from '@/utils/globalCalls';
import { useGlobalSettings } from '@/utils/globalSettings';
import { getInitialEditorBlocks } from '@/utils/editorData';
import {
  createPage,
  getPage,
  getSystemPage,
  updatePage,
  updatePageLayout,
  type MokelayPage,
  type PageSource
} from '@/utils/pagesApi';
import type { PageDataSourceConfig } from '@/utils/pageRuntimeContext';
import {
  getPageRenderBundle,
  listLayouts,
  type MokelayLayout,
  type MokelayLayoutRecord,
  type RenderBundlePage
} from '@/utils/layoutsApi';

const EditorPanel = defineAsyncComponent(() => import('@/components/EditorPanel.vue'));
const PreviewPanel = defineAsyncComponent(() => import('@/components/PreviewPanel.vue'));
const ChatAiPanel = defineAsyncComponent(() => import('@/components/ChatAiPanel.vue'));
const ApiBuilderShell = defineAsyncComponent(() => import('@/api-builder/ApiBuilderShell.vue'));
const NotFoundPage = defineAsyncComponent(() => import('@/components/NotFoundPage.vue'));

const runtimePageUuidPattern = /^[A-Za-z0-9_-]{1,128}$/;

type ParsedRoute = {
  pageUuid: string | null;
  pageSource: PageSource;
  apiUuid: string | null;
  apiBuilder: boolean;
  apiSource: 'user' | 'system';
  aiChat: boolean;
  preview: boolean;
  runtimePage: boolean;
  notFound: boolean;
};

type RouteLocation = {
  rawPath: string;
};

const routeLocation = ref(readRouteLocation());
const { t } = useI18n();
const { themeValue, languageValue, setTheme, setLanguage } = useGlobalSettings();
const editorPanelRef = ref<InstanceType<typeof EditorPanel> | null>(null);
const currentPageUuid = ref<string | null>(null);
const currentPageName = ref(formatPageName(new Date()));
const currentPageSource = ref<PageSource>('user');
const currentPageAppUuid = ref<string | null>(null);
const currentPageLayoutUuid = ref<string | null>(null);
const pageBlocks = ref<OutputData['blocks']>(getInitialEditorBlocks(t));
const pageDataSources = ref<PageDataSourceConfig[]>([]);
const currentLayout = ref<MokelayLayout | null>(null);
const pageLayoutOptions = ref<MokelayLayoutRecord[]>([]);
const isLoadingPage = ref(false);
const isSavingPage = ref(false);
const isLoadingPageLayouts = ref(false);
const isSavingPageLayout = ref(false);
const pageError = ref('');
const pageLayoutError = ref('');
const runtimePageLoadFailed = ref(false);
let loadRequestId = 0;
let layoutLoadRequestId = 0;
let pageLayoutOptionsRequestId = 0;
let runtimePageLoadRequestId = 0;

const parsedRoute = computed(() => parseRouteLocation(routeLocation.value));
const routePageUuid = computed(() => parsedRoute.value.pageUuid);
const routePageSource = computed(() => parsedRoute.value.pageSource);
const isApiBuilderPage = computed(() => parsedRoute.value.apiBuilder);
const routeApiUuid = computed(() => parsedRoute.value.apiUuid);
const routeApiSource = computed(() => parsedRoute.value.apiSource);
const isAiChatPage = computed(() => !isApiBuilderPage.value && parsedRoute.value.aiChat);
const isPreviewPage = computed(() => !isApiBuilderPage.value && parsedRoute.value.preview);
const isRuntimePage = computed(() => !isApiBuilderPage.value && parsedRoute.value.runtimePage);
const isNotFoundPage = computed(() => !isApiBuilderPage.value && (parsedRoute.value.notFound || runtimePageLoadFailed.value));
const isEditorPage = computed(() => !isApiBuilderPage.value && !isPreviewPage.value && !isRuntimePage.value && !isNotFoundPage.value && Boolean(routePageUuid.value));
const isAppsSection = computed(() => isRuntimePage.value && routePageUuid.value === 'home');
const isPagesSection = computed(() => isEditorPage.value || isPreviewPage.value);
const isDatasourcesSection = computed(() => isRuntimePage.value && routePageUuid.value === 'datasources');
const isLayoutsSection = computed(() => isRuntimePage.value && routePageUuid.value === 'layouts');
const isDocsSection = computed(() => isRuntimePage.value && routePageUuid.value === 'block_component_docs');
const isStandalonePage = computed(() => isPreviewPage.value || isRuntimePage.value || isNotFoundPage.value);
const isEditorReady = computed(() => editorPanelRef.value !== null && !isLoadingPage.value && !isSavingPage.value);
const isSaveReady = computed(() => isEditorReady.value && currentPageSource.value === 'user');

function syncRoute() {
  routeLocation.value = readRouteLocation();
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
    aiChat: false,
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
  const apiSource = new URLSearchParams(rawQuery).get('source') === 'system' ? 'system' : 'user';
  const pageMatch = path.match(/^\/pages\/([^/]+)(\/preview)?\/?$/);
  const apiMatch = path.match(/^\/apis(?:\/([^/]+))?\/?$/);

  if (apiMatch) {
    return createParsedRoute({
      apiUuid: apiMatch[1] ? safeDecodeURIComponent(apiMatch[1]) : null,
      apiBuilder: true,
      apiSource
    });
  }

  if (path === '/ai-chat') {
    return createParsedRoute({ aiChat: true });
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

function applyPage(page: MokelayPage) {
  currentPageUuid.value = page.uuid;
  currentPageName.value = page.name || formatPageName(new Date());
  currentPageAppUuid.value = page.appUuid ?? null;
  currentPageLayoutUuid.value = page.layoutUuid ?? null;
  pageBlocks.value = page.blocks;
  pageDataSources.value = page.dataSources ?? [];
  pageError.value = '';
  pageLayoutError.value = '';
  persistDraftBlocks(page.blocks);
}

function applyRuntimePage(page: RenderBundlePage, layout: MokelayLayout | null) {
  currentPageUuid.value = page.uuid;
  currentPageName.value = page.name || formatPageName(new Date());
  currentPageSource.value = 'system';
  currentPageAppUuid.value = page.appUuid ?? null;
  currentPageLayoutUuid.value = page.layoutUuid ?? null;
  pageBlocks.value = page.blocks;
  pageDataSources.value = page.dataSources ?? [];
  currentLayout.value = layout;
  pageError.value = '';
  pageLayoutError.value = '';
}

function resetToLocalDraft() {
  loadRequestId += 1;
  currentPageUuid.value = null;
  currentPageSource.value = 'user';
  currentPageName.value = formatPageName(new Date());
  currentPageAppUuid.value = null;
  currentPageLayoutUuid.value = null;
  pageError.value = '';
  pageLayoutError.value = '';
  isLoadingPage.value = false;
  pageBlocks.value = getInitialEditorBlocks(t);
  pageDataSources.value = [];
  currentLayout.value = null;
}

function resetRuntimePageState(uuid: string | null) {
  currentPageUuid.value = uuid;
  currentPageSource.value = 'system';
  currentPageName.value = uuid || t('notFound.title');
  currentPageAppUuid.value = null;
  currentPageLayoutUuid.value = null;
  pageBlocks.value = [];
  pageDataSources.value = [];
  currentLayout.value = null;
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
    applyPage(page);
  } catch (error) {
    if (requestId !== loadRequestId) {
      return;
    }
    currentPageUuid.value = uuid;
    currentPageSource.value = source;
    currentPageName.value = formatPageName(new Date());
    pageBlocks.value = [];
    pageDataSources.value = [];
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
        appUuid: bundle.page.appUuid,
        layoutUuid: bundle.page.layoutUuid,
        createdAt: bundle.page.createdAt,
        updatedAt: bundle.page.updatedAt
      });
      currentPageSource.value = source;
    }
  } catch {
    if (requestId !== layoutLoadRequestId) return;
    currentLayout.value = null;
  }
}

async function loadRuntimePage(uuid: string) {
  const requestId = runtimePageLoadRequestId + 1;
  runtimePageLoadRequestId = requestId;
  isLoadingPage.value = true;
  runtimePageLoadFailed.value = false;
  resetRuntimePageState(uuid);

  try {
    const bundle = await getPageRenderBundle(uuid, 'system');
    if (requestId !== runtimePageLoadRequestId) return;

    if (!bundle.page) {
      runtimePageLoadFailed.value = true;
      return;
    }

    applyRuntimePage(bundle.page, bundle.layout);
  } catch {
    if (requestId !== runtimePageLoadRequestId) return;
    runtimePageLoadFailed.value = true;
    resetRuntimePageState(uuid);
  } finally {
    if (requestId === runtimePageLoadRequestId) {
      isLoadingPage.value = false;
    }
  }
}

async function loadPageLayoutOptions() {
  const requestId = pageLayoutOptionsRequestId + 1;
  pageLayoutOptionsRequestId = requestId;
  isLoadingPageLayouts.value = true;
  pageLayoutError.value = '';

  try {
    const result = await listLayouts({
      page: 1,
      pageSize: 100
    });

    if (requestId !== pageLayoutOptionsRequestId) return;
    pageLayoutOptions.value = result.layouts;
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
  return error instanceof Error ? error.message : '';
}

function formatPageName(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute);
  window.addEventListener('popstate', syncRoute);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncRoute);
  window.removeEventListener('popstate', syncRoute);
});

watch(
  [routePageUuid, routePageSource, isApiBuilderPage, isAiChatPage, isRuntimePage, isNotFoundPage],
  ([uuid, source, apiBuilder, aiChat, runtimePage, notFound]) => {
    if (apiBuilder || aiChat || runtimePage || notFound) {
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
  ([preview, uuid, source]) => {
    if (!preview) {
      currentLayout.value = null;
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
    if (!editorPage || source !== 'user') {
      pageLayoutOptionsRequestId += 1;
      pageLayoutOptions.value = [];
      isLoadingPageLayouts.value = false;
      pageLayoutError.value = '';
      return;
    }

    void loadPageLayoutOptions();
  },
  { immediate: true }
);

function handleThemeModeChange(value: string) {
  setTheme(value === 'dark' ? 'dark' : 'light');
}

function handleEditorChange(blocks: OutputData['blocks']) {
  pageBlocks.value = blocks;
  persistDraftBlocks(blocks);
}

function handlePageNameChange(name: string) {
  currentPageName.value = name;
}

async function readEditorBlocks() {
  const output = await editorPanelRef.value?.save();
  const blocks = output?.blocks ?? pageBlocks.value;
  pageBlocks.value = blocks;
  persistDraftBlocks(blocks);

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
    const uuid = currentPageUuid.value;
    const name = currentPageName.value.trim() || formatPageName(new Date());
    currentPageName.value = name;
    const page = uuid
      ? await updatePage(uuid, { name, blocks })
      : await createPage({ name, blocks });

    applyPage(page);
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

    applyPage(page);
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
  window.location.hash = '/pages';
}

</script>

<template>
  <TooltipProvider>
    <main
      data-testid="app-root"
      :class="isStandalonePage
        ? 'flex min-h-screen flex-col bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100'
        : 'flex min-h-screen flex-col bg-slate-100 p-4 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100'"
    >
      <header v-if="!isStandalonePage" data-testid="app-header" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap items-center gap-3">
          <h1 data-testid="app-title" class="text-xl font-semibold">{{ t('app.title') }}</h1>
          <a
            data-testid="home-link"
            href="https://www.mokelay.com/"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
          >
            {{ t('app.home') }}
          </a>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-sm">
            <select
              data-testid="theme-select"
              :value="themeValue"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              @change="handleThemeModeChange(($event.target as HTMLSelectElement).value)"
            >
              <option value="dark">{{ t('app.dark') }}</option>
              <option value="light">{{ t('app.light') }}</option>
            </select>
          </label>

          <label class="flex items-center gap-2 text-sm">
            <select
              data-testid="locale-select"
              :value="languageValue"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              @change="setLanguage(($event.target as HTMLSelectElement).value as 'zh' | 'en')"
            >
              <option value="zh">{{ t('app.chinese') }}</option>
              <option value="en">{{ t('app.english') }}</option>
            </select>
          </label>

          <nav class="flex items-center gap-2 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
            <a
              href="#/"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="isAppsSection ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              {{ t('app.apps') }}
            </a>
            <a
              href="#/datasources"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="isDatasourcesSection ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              {{ t('app.datasources') }}
            </a>
            <a
              href="#/pages"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="isPagesSection ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              {{ t('app.pageList') }}
            </a>
            <a
              href="#/layouts"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="isLayoutsSection ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              布局
            </a>
            <a
              href="#/block_component_docs"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="isDocsSection ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              文档
            </a>
            <a
              href="#/ai-chat"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="isAiChatPage ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              {{ t('app.aiChat') }}
            </a>
            <a
              href="#/apis"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="isApiBuilderPage ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              API Builder
            </a>
          </nav>

          <template v-if="isEditorPage">
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
          </template>
          <button v-else-if="isPreviewPage" data-testid="back-to-editor-button" class="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600" @click="backToEditorPage">
            {{ t('preview.backToEditor') }}
          </button>
        </div>
      </header>

      <ApiBuilderShell
        v-if="isApiBuilderPage"
        :route-uuid="routeApiUuid"
        :route-source="routeApiSource"
      />
      <NotFoundPage v-else-if="isNotFoundPage" />
      <PreviewPanel
        v-else-if="isRuntimePage"
        :blocks="pageBlocks"
        :data-sources="pageDataSources"
        :loading="isLoadingPage"
        :page-uuid="routePageUuid ?? currentPageUuid"
        :page-name="currentPageName"
        :layout="currentLayout"
        :minimal="true"
        :show-title="false"
        :show-toolbar="false"
      />
      <PreviewPanel
        v-else-if="isPreviewPage"
        :blocks="pageBlocks"
        :data-sources="pageDataSources"
        :loading="isLoadingPage"
        :error="pageError"
        :page-uuid="routePageUuid ?? currentPageUuid"
        :page-name="currentPageName"
        :layout="currentLayout"
        :minimal="true"
        :show-title="false"
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
          </div>
        </section>

        <EditorPanel
          ref="editorPanelRef"
          :blocks="pageBlocks"
          :page-uuid="currentPageUuid"
          :page-name="currentPageName"
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
      <ChatAiPanel v-else-if="isAiChatPage" />
    </main>
  </TooltipProvider>
</template>
