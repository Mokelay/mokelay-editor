<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { useI18n } from '@/i18n';
import MPage from '@/blocks/MPage.vue';

type PreviewPanelProps = {
  blocks?: OutputData['blocks'];
  loading?: boolean;
  error?: string;
};

withDefaults(defineProps<PreviewPanelProps>(), {
  blocks: () => [],
  loading: false,
  error: ''
});

const { t } = useI18n();
</script>

<template>
  <section
    data-testid="preview-panel"
    class="flex min-h-[520px] flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="flex-1 overflow-auto">
      <p v-if="loading" data-testid="preview-loading-state" class="rounded border border-sky-300 bg-sky-50 p-3 text-sky-800 dark:border-sky-500/60 dark:bg-sky-900/30 dark:text-sky-100">
        {{ t('page.loading') }}
      </p>
      <p v-else-if="error" data-testid="preview-error-state" class="rounded border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-500/60 dark:bg-red-900/30 dark:text-red-100">
        {{ error }}
      </p>
      <p v-else-if="!blocks.length" data-testid="preview-empty-state" class="rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-100">
        {{ t('preview.emptyState') }}
      </p>

      <MPage v-else :edit="false" :value="blocks" />
    </div>
  </section>
</template>
