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
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <p v-if="!savedConfig" class="rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-100">
      {{ t('preview.emptyState') }}
    </p>

    <MPage v-else :edit="false" :value="blocks" />
  </section>
</template>
