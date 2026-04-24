<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { TooltipProvider } from 'reka-ui';
import { onMounted, ref, watch } from 'vue';
import EditorPanel from '@/components/EditorPanel.vue';
const isDark = ref(true);

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}

onMounted(() => {
  applyTheme(isDark.value);
});

watch(isDark, (dark) => {
  applyTheme(dark);
});
</script>

<template>
  <TooltipProvider>
    <main class="flex min-h-screen flex-col gap-4 bg-slate-100 p-4 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 class="text-2xl font-bold">Mokelay Editor</h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">Mokelay页面配置器</p>
        <div class="mt-4 flex flex-wrap items-center gap-5">
          <SwitchGroup as="div" class="flex items-center gap-3">
            <SwitchLabel class="text-sm">深色模式</SwitchLabel>
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
        </div>
      </header>

      <EditorPanel />
    </main>
  </TooltipProvider>
</template>
