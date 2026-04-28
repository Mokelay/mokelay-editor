<script setup lang="ts">
import { TooltipProvider } from 'reka-ui';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from '@/i18n';

const EditorPanel = defineAsyncComponent(() => import('@/components/EditorPanel.vue'));
const PreviewPanel = defineAsyncComponent(() => import('@/components/PreviewPanel.vue'));

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

const isDark = ref(getInitialThemeMode());
const routeHash = ref(window.location.hash || '#/');
const { t, localeValue, setLocale } = useI18n();
const editorPanelRef = ref<InstanceType<typeof EditorPanel> | null>(null);

const isPreviewPage = computed(() => routeHash.value === '#/preview');

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}

function syncRoute() {
  routeHash.value = window.location.hash || '#/';
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

function handleThemeModeChange(value: string) {
  isDark.value = value === 'dark';
}

function saveEditorContent() {
  editorPanelRef.value?.save();
}

function openPreviewPage() {
  editorPanelRef.value?.openPreview();
}

function backToEditorPage() {
  window.location.hash = '/';
}
</script>

<template>
  <TooltipProvider>
    <main data-testid="app-root" class="flex min-h-screen flex-col bg-slate-100 p-4 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header data-testid="app-header" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 data-testid="app-title" class="text-xl font-semibold">{{ t('app.title') }}</h1>
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

          <template v-if="!isPreviewPage">
            <button data-testid="save-button" class="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-400" @click="saveEditorContent">
              {{ t('editor.saveContent') }}
            </button>
            <button data-testid="preview-button" class="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-400" @click="openPreviewPage">
              {{ t('editor.previewPage') }}
            </button>
          </template>
          <button v-else data-testid="back-to-editor-button" class="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600" @click="backToEditorPage">
            {{ t('preview.backToEditor') }}
          </button>
        </div>
      </header>

      <PreviewPanel v-if="isPreviewPage" />
      <EditorPanel v-else ref="editorPanelRef" />
    </main>
  </TooltipProvider>
</template>
