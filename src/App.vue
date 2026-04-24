<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { TooltipProvider } from '@reka-ui/vue';
import { ref } from 'vue';
import ChartPanel from '@/components/ChartPanel.vue';
import EditorPanel from '@/components/EditorPanel.vue';

const enablePreview = ref(true);
</script>

<template>
  <TooltipProvider>
    <main class="mx-auto flex min-h-screen max-w-6xl flex-col gap-5 p-6">
      <header class="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h1 class="text-2xl font-bold">Mokelay Editor Starter</h1>
        <p class="mt-2 text-slate-400">Vue 3 + Vite + TypeScript + Tailwind + Editor.js + ECharts</p>
        <SwitchGroup as="div" class="mt-4 flex items-center gap-3">
          <SwitchLabel class="text-sm">显示图表</SwitchLabel>
          <Switch
            v-model="enablePreview"
            class="relative inline-flex h-6 w-11 items-center rounded-full"
            :class="enablePreview ? 'bg-indigo-500' : 'bg-slate-600'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              :class="enablePreview ? 'translate-x-6' : 'translate-x-1'"
            />
          </Switch>
        </SwitchGroup>
      </header>

      <EditorPanel />
      <ChartPanel v-if="enablePreview" />
    </main>
  </TooltipProvider>
</template>
