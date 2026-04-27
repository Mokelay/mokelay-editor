<script setup lang="ts">
import { computed } from 'vue';
import type { OutputData } from '@editorjs/editorjs';
import { useI18n } from '@/i18n';
import MPage from '@/blocks/MPage.vue';
import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';

type EditorOutput = {
  blocks: OutputData['blocks'];
};
const { t } = useI18n();

const savedConfig = computed<EditorOutput | null>(() => {
  const raw = localStorage.getItem(MOKELAY_CONFIG_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
});

const blocks = computed<OutputData['blocks']>(() => savedConfig.value?.blocks ?? []);

function backToEditor() {
  window.location.hash = '/';
}
</script>

<template>
  <section
    class="flex min-h-[520px] flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold">{{ t('preview.title') }}</h2>
      <button class="rounded bg-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600" @click="backToEditor">
        {{ t('preview.backToEditor') }}
      </button>
    </div>

    <div class="flex-1 overflow-auto">
      <p v-if="!savedConfig" class="rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-100">
        {{ t('preview.emptyState') }}
      </p>

      <MPage v-else :edit="false" :value="blocks" />
    </div>
  </section>
</template>
