<script setup lang="ts">
import { computed } from 'vue';
import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';

type EditorBlock = {
  type: string;
  data: Record<string, string>;
};

type EditorOutput = {
  blocks: EditorBlock[];
};

const savedConfig = computed<EditorOutput | null>(() => {
  const raw = localStorage.getItem(MOKELAY_CONFIG_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
});

const blocks = computed(() => savedConfig.value?.blocks ?? []);

function backToEditor() {
  window.location.hash = '/';
}
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold">配置预览</h2>
      <button class="rounded bg-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600" @click="backToEditor">
        返回编辑器
      </button>
    </div>

    <p v-if="!savedConfig" class="rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-100">
      未找到已保存配置，请先在编辑器点击“保存内容”。
    </p>

    <div v-else class="space-y-4">
      <div v-for="(block, index) in blocks" :key="index" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <p v-if="block.type === 'paragraph'" class="text-sm leading-6" v-html="block.data.text"></p>

        <div v-else-if="block.type === 'input'" class="space-y-2">
          <label class="block text-sm font-medium">{{ block.data.label }}</label>
          <input
            class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            :placeholder="block.data.placeholder"
            :value="block.data.value"
            readonly
          />
        </div>

        <pre v-else class="overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{{ block }}</pre>
      </div>
    </div>
  </section>
</template>
