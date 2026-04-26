<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { TooltipProvider } from 'reka-ui';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import EditorPanel from '@/components/EditorPanel.vue';
import PreviewPanel from '@/components/PreviewPanel.vue';

const isDark = ref(true);
const routeHash = ref(window.location.hash || '#/');
const { t, localeValue, setLocale } = useI18n();

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
});

</script>

<template>
  <TooltipProvider>
    <main class="flex min-h-screen flex-col gap-4 bg-slate-100 p-4 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 class="text-2xl font-bold">{{ t('app.title') }}</h1>
        <!-- <p class="mt-2 text-slate-600 dark:text-slate-400">{{ t('app.subtitle') }}</p> -->
        <div class="mt-4 flex flex-wrap items-center gap-5">
          <SwitchGroup as="div" class="flex items-center gap-3">
            <SwitchLabel class="text-sm">{{ t('app.darkMode') }}</SwitchLabel>
            <Switch
              v-model="isDark"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="isDark ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="isDark ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </SwitchGroup>

          <label class="flex items-center gap-2 text-sm">
            <span>{{ t('app.language') }}</span>
            <select
              :value="localeValue"
              class="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
              @change="setLocale(($event.target as HTMLSelectElement).value as 'zh' | 'en')"
            >
              <option value="zh">{{ t('app.chinese') }}</option>
              <option value="en">{{ t('app.english') }}</option>
            </select>
          </label>
        </div>
      </header>

      <PreviewPanel v-if="isPreviewPage" />
      <EditorPanel v-else />
    </main>
  </TooltipProvider>
</template>
