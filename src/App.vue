<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { TooltipProvider } from 'reka-ui';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';
import { $message } from '@/utils/globalCalls';
import { getInitialEditorBlocks } from '@/utils/editorData';
import { createPage, getPage, updatePage, type MokelayPage } from '@/utils/pagesApi';

const EditorPanel = defineAsyncComponent(() => import('@/components/EditorPanel.vue'));
const PreviewPanel = defineAsyncComponent(() => import('@/components/PreviewPanel.vue'));
const PageListPanel = defineAsyncComponent(() => import('@/components/PageListPanel.vue'));
const ApiBuilderShell = defineAsyncComponent(() => import('@/api-builder/ApiBuilderShell.vue'));

const THEME_MODE_COOKIE_KEY = 'mokelay-editor-theme-mode';
const DEFAULT_WEBSITE_HOME_URL = 'https://www.mokelay.com';
const websiteHomeUrl = normalizeWebsiteHomeUrl(import.meta.env.VITE_MOKELAY_WEBSITE_URL);

function normalizeWebsiteHomeUrl(value?: string) {
  const rawUrl = value?.trim() || DEFAULT_WEBSITE_HOME_URL;

  try {
    return new URL('/', rawUrl).toString();
  } catch {
    return new URL('/', DEFAULT_WEBSITE_HOME_URL).toString();
  }
}

function getCookieValue(name: string): string | null {
  const entries = document.cookie ? document.cookie.split('; ') : [];
  const entry = entries.find((item) => item.startsWith(`${name}=`));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice(name.length + 1));
}

function setCookieValue(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function getInitialThemeMode() {
  const savedThemeMode = getCookieValue(THEME_MODE_COOKIE_KEY);

  if (savedThemeMode === 'dark') {
    return true;
  }

  if (savedThemeMode === 'light') {
    return false;
  }

  return false;
}

type ParsedRoute = {
  pageUuid: string | null;
  apiUuid: string | null;
  apiBuilder: boolean;
  preview: boolean;
};

const isDark = ref(getInitialThemeMode());
const routeHash = ref(window.location.hash || '#/');
const { t, localeValue, setLocale } = useI18n();
const editorPanelRef = ref<InstanceType<typeof EditorPanel> | null>(null);
const currentPageUuid = ref<string | null>(null);
const currentPageName = ref(formatPageName(new Date()));
const pageBlocks = ref<OutputData['blocks']>(getInitialEditorBlocks(t));
const isLoadingPage = ref(false);
const isSavingPage = ref(false);
const pageError = ref('');
let loadRequestId = 0;

const parsedRoute = computed(() => parseRouteHash(routeHash.value));
const routePageUuid = computed(() => parsedRoute.value.pageUuid);
const isApiBuilderPage = computed(() => parsedRoute.value.apiBuilder);
const routeApiUuid = computed(() => parsedRoute.value.apiUuid);
const isPreviewPage = computed(() => !isApiBuilderPage.value && parsedRoute.value.preview);
const isEditorPage = computed(() => !isApiBuilderPage.value && !isPreviewPage.value && Boolean(routePageUuid.value));
const isEditorReady = computed(() => editorPanelRef.value !== null && !isLoadingPage.value && !isSavingPage.value);

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}

function syncRoute() {
  routeHash.value = window.location.hash || '#/';
}

function parseRouteHash(hash: string): ParsedRoute {
  const rawPath = hash.replace(/^#/, '') || '/';
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const pageMatch = path.match(/^\/pages\/([^/]+)(\/preview)?\/?$/);
  const apiMatch = path.match(/^\/apis(?:\/([^/]+))?\/?$/);

  if (apiMatch) {
    return {
      pageUuid: null,
      apiUuid: apiMatch[1] ? safeDecodeURIComponent(apiMatch[1]) : null,
      apiBuilder: true,
      preview: false
    };
  }

  if (pageMatch) {
    return {
      pageUuid: safeDecodeURIComponent(pageMatch[1]),
      apiUuid: null,
      apiBuilder: false,
      preview: Boolean(pageMatch[2])
    };
  }

  return {
    pageUuid: null,
    apiUuid: null,
    apiBuilder: false,
    preview: path === '/preview'
  };
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getEditorHash(uuid: string) {
  return `/pages/${encodeURIComponent(uuid)}`;
}

function getPreviewHash(uuid: string) {
  return `/pages/${encodeURIComponent(uuid)}/preview`;
}

function persistDraftBlocks(blocks: OutputData['blocks']) {
  localStorage.setItem(MOKELAY_CONFIG_STORAGE_KEY, JSON.stringify({ blocks }));
}

function applyPage(page: MokelayPage) {
  currentPageUuid.value = page.uuid;
  currentPageName.value = page.name || formatPageName(new Date());
  pageBlocks.value = page.blocks;
  pageError.value = '';
  persistDraftBlocks(page.blocks);
}

function resetToLocalDraft() {
  loadRequestId += 1;
  currentPageUuid.value = null;
  currentPageName.value = formatPageName(new Date());
  pageError.value = '';
  isLoadingPage.value = false;
  pageBlocks.value = getInitialEditorBlocks(t);
}

async function loadPage(uuid: string) {
  const requestId = loadRequestId + 1;
  loadRequestId = requestId;
  isLoadingPage.value = true;
  pageError.value = '';

  try {
    const page = await getPage(uuid);
    if (requestId !== loadRequestId) {
      return;
    }
    applyPage(page);
  } catch (error) {
    if (requestId !== loadRequestId) {
      return;
    }
    currentPageUuid.value = uuid;
    currentPageName.value = formatPageName(new Date());
    pageBlocks.value = [];
    pageError.value = toErrorMessage(error) || t('page.loadFailed');
    void $message('error', t('page.loadFailed'));
  } finally {
    if (requestId === loadRequestId) {
      isLoadingPage.value = false;
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
  applyTheme(isDark.value);
  window.addEventListener('hashchange', syncRoute);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncRoute);
});

watch(isDark, (dark) => {
  applyTheme(dark);
  setCookieValue(THEME_MODE_COOKIE_KEY, dark ? 'dark' : 'light');
});

watch(
  [routePageUuid, isApiBuilderPage],
  ([uuid, apiBuilder]) => {
    if (apiBuilder) {
      return;
    }

    if (!uuid) {
      resetToLocalDraft();
      return;
    }

    if (uuid === currentPageUuid.value) {
      return;
    }

    void loadPage(uuid);
  },
  { immediate: true }
);

function handleThemeModeChange(value: string) {
  isDark.value = value === 'dark';
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
  if (isSavingPage.value || isLoadingPage.value) {
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

async function openPreviewPage() {
  if (isLoadingPage.value || isSavingPage.value) {
    return;
  }

  await readEditorBlocks();
  window.location.hash = currentPageUuid.value ? getPreviewHash(currentPageUuid.value) : '/preview';
}

function backToEditorPage() {
  const uuid = routePageUuid.value ?? currentPageUuid.value;
  window.location.hash = uuid ? getEditorHash(uuid) : '/';
}

function backToPageList() {
  window.location.hash = '/';
}

function openPageFromList(uuid: string) {
  window.location.hash = getEditorHash(uuid);
}

function handlePageCreated(page: MokelayPage) {
  applyPage(page);
  window.location.hash = getEditorHash(page.uuid);
}
</script>

<template>
  <TooltipProvider>
    <main data-testid="app-root" class="flex min-h-screen flex-col bg-slate-100 p-4 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header data-testid="app-header" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap items-center gap-3">
          <h1 data-testid="app-title" class="text-xl font-semibold">{{ t('app.title') }}</h1>
          <a
            data-testid="home-link"
            :href="websiteHomeUrl"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
          >
            {{ t('app.home') }}
          </a>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-sm">
            <select
              data-testid="theme-select"
              :value="isDark ? 'dark' : 'light'"
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
              :value="localeValue"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              @change="setLocale(($event.target as HTMLSelectElement).value as 'zh' | 'en')"
            >
              <option value="zh">{{ t('app.chinese') }}</option>
              <option value="en">{{ t('app.english') }}</option>
            </select>
          </label>

          <nav class="flex items-center gap-2 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
            <a
              href="#/"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="!isApiBuilderPage ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
            >
              {{ t('app.pageList') }}
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
              :disabled="!isEditorReady"
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
      />
      <PreviewPanel
        v-else-if="isPreviewPage"
        :blocks="pageBlocks"
        :loading="isLoadingPage"
        :error="pageError"
      />
      <div v-else-if="isEditorPage" class="flex flex-1 flex-col gap-4">
        <section data-testid="page-editor-header" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <button data-testid="back-to-page-list-button" class="mb-2 text-sm font-medium text-teal-700 hover:text-teal-500 dark:text-teal-300" @click="backToPageList">
                {{ t('pageList.backToList') }}
              </button>
              <div class="flex flex-wrap items-center gap-3">
                <h2 class="text-xl font-semibold text-slate-950 dark:text-white">{{ currentPageName || t('pageList.unnamedPage') }}</h2>
                <code v-if="currentPageUuid" class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ currentPageUuid }}</code>
              </div>
            </div>
          </div>
        </section>

        <EditorPanel
          ref="editorPanelRef"
          :blocks="pageBlocks"
          :page-name="currentPageName"
          :loading="isLoadingPage"
          :error="pageError"
          @change="handleEditorChange"
          @name-change="handlePageNameChange"
        />
      </div>
      <PageListPanel
        v-else
        @open-page="openPageFromList"
        @page-created="handlePageCreated"
      />
    </main>
  </TooltipProvider>
</template>
