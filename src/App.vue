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
const ApiListPage = defineAsyncComponent(() => import('@/components/api-builder/ApiListPage.vue'));
const ApiBuilderPage = defineAsyncComponent(() => import('@/components/api-builder/ApiBuilderPage.vue'));

const THEME_MODE_COOKIE_KEY = 'mokelay-editor-theme-mode';

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
  type: 'editor' | 'preview' | 'api-list' | 'api-builder';
  uuid: string | null;
  preview: boolean;
};

const isDark = ref(getInitialThemeMode());
const routeHash = ref(window.location.hash || '#/');
const { t, localeValue, setLocale } = useI18n();
const editorPanelRef = ref<InstanceType<typeof EditorPanel> | null>(null);
const currentPageUuid = ref<string | null>(null);
const currentPageName = ref('');
const pageBlocks = ref<OutputData['blocks']>(getInitialEditorBlocks(t));
const isLoadingPage = ref(false);
const isSavingPage = ref(false);
const pageError = ref('');
let loadRequestId = 0;

const parsedRoute = computed(() => parseRouteHash(routeHash.value));
const routePageUuid = computed(() => parsedRoute.value.type === 'editor' || parsedRoute.value.type === 'preview' ? parsedRoute.value.uuid : null);
const isPreviewPage = computed(() => parsedRoute.value.preview);
const isApiListPage = computed(() => parsedRoute.value.type === 'api-list');
const isApiBuilderPage = computed(() => parsedRoute.value.type === 'api-builder');
const apiBuilderUuid = computed(() => parsedRoute.value.type === 'api-builder' ? parsedRoute.value.uuid : null);
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

  if (pageMatch) {
    return {
      type: pageMatch[2] ? 'preview' : 'editor',
      uuid: safeDecodeURIComponent(pageMatch[1]),
      preview: Boolean(pageMatch[2])
    };
  }

  if (path === '/apis' || path === '/apis/') {
    return {
      type: 'api-list',
      uuid: null,
      preview: false
    };
  }

  const apiMatch = path.match(/^\/apis\/([^/]+)\/?$/);

  if (apiMatch) {
    return {
      type: 'api-builder',
      uuid: safeDecodeURIComponent(apiMatch[1]),
      preview: false
    };
  }

  return {
    type: path === '/preview' ? 'preview' : 'editor',
    uuid: null,
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
  currentPageName.value = page.name;
  pageBlocks.value = page.blocks;
  pageError.value = '';
  persistDraftBlocks(page.blocks);
}

function resetToLocalDraft() {
  loadRequestId += 1;
  currentPageUuid.value = null;
  currentPageName.value = '';
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
    currentPageName.value = '';
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
  routePageUuid,
  (uuid) => {
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
    const page = uuid
      ? await updatePage(uuid, { blocks })
      : await createPage({ name: formatPageName(new Date()), blocks });

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

function openEditorHome() {
  window.location.hash = '/';
}

function openApiList() {
  window.location.hash = '#/apis';
}
</script>

<template>
  <TooltipProvider>
    <main data-testid="app-root" class="flex min-h-screen flex-col bg-slate-100 p-4 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header data-testid="app-header" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 data-testid="app-title" class="text-xl font-semibold">{{ t('app.title') }}</h1>
        <div class="flex flex-wrap items-center gap-3">
          <button class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" type="button" @click="openEditorHome">
            页面
          </button>
          <button class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" type="button" @click="openApiList">
            API
          </button>
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

          <template v-if="!isPreviewPage && !isApiListPage && !isApiBuilderPage">
            <button
              data-testid="save-button"
              class="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
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

      <ApiListPage v-if="isApiListPage" />
      <ApiBuilderPage
        v-else-if="isApiBuilderPage"
        :uuid="apiBuilderUuid"
      />
      <PreviewPanel
        v-else-if="isPreviewPage"
        :blocks="pageBlocks"
        :loading="isLoadingPage"
        :error="pageError"
      />
      <EditorPanel
        v-else
        ref="editorPanelRef"
        :blocks="pageBlocks"
        :loading="isLoadingPage"
        :error="pageError"
        @change="handleEditorChange"
      />
    </main>
  </TooltipProvider>
</template>
