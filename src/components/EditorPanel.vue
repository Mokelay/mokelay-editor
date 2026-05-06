<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { ref } from 'vue';
import MPage from '@/blocks/MPage.vue';
import { useI18n } from '@/i18n';

type EditorPanelProps = {
  blocks?: OutputData['blocks'];
  loading?: boolean;
  error?: string;
};

const props = withDefaults(defineProps<EditorPanelProps>(), {
  blocks: () => [],
  loading: false,
  error: ''
});

const emit = defineEmits<{
  (event: 'change', blocks: OutputData['blocks']): void;
}>();

const pageRef = ref<InstanceType<typeof MPage> | null>(null);
const { t } = useI18n();

async function save() {
  const output: OutputData = (await pageRef.value?.saveEditor()) ?? { blocks: props.blocks };
  emit('change', output.blocks);
  return output;
}

function handlePageChange(blocks: OutputData['blocks']) {
  emit('change', blocks);
}

defineExpose({
  save
});
</script>

<template>
  <section
    data-testid="editor-panel"
    class="flex min-h-[520px] flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <p v-if="loading" data-testid="editor-loading-state" class="mb-3 rounded border border-sky-300 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-500/60 dark:bg-sky-900/30 dark:text-sky-100">
      {{ t('page.loading') }}
    </p>
    <p v-else-if="error" data-testid="editor-error-state" class="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/60 dark:bg-red-900/30 dark:text-red-100">
      {{ error }}
    </p>

    <MPage v-if="!loading" ref="pageRef" :edit="true" :value="blocks" @change="handlePageChange" />
  </section>
</template>

<style scoped>
:deep(.mokelay-editor-tool) {
  position: relative;
}

:deep(.mokelay-editor-tool__property-dialog) {
  width: min(100%, 480px);
  border: 0;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
}

:deep(.mokelay-editor-tool__property-dialog::backdrop) {
  background: rgb(15 23 42 / 0.45);
}

:deep(.mokelay-editor-tool__property-panel) {
  margin: 0;
  padding: 20px;
  background: rgb(255 255 255);
}

:deep(.mokelay-editor-tool__property-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

:deep(.mokelay-editor-tool__property-title) {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 18px;
  font-weight: 600;
}

:deep(.mokelay-editor-tool__property-close) {
  border: 0;
  border-radius: 10px;
  padding: 8px 12px;
  background: rgb(226 232 240);
  color: rgb(51 65 85);
  cursor: pointer;
}

:deep(.mokelay-editor-tool__property-body) {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:deep(.mokelay-editor-tool__property-field) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.mokelay-editor-tool__property-field--checkbox) {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

:deep(.mokelay-editor-tool__property-label) {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 600;
}

:deep(.mokelay-editor-tool__property-checkbox) {
  width: 16px;
  height: 16px;
  margin: 0;
}

:deep(.mokelay-editor-tool__property-input) {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

:deep(.mokelay-editor-tool__property-input:focus) {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

:global(.dark) :deep(.mokelay-editor-tool__property-panel) {
  background: rgb(15 23 42);
}

:global(.dark) :deep(.mokelay-editor-tool__property-title) {
  color: rgb(241 245 249);
}

:global(.dark) :deep(.mokelay-editor-tool__property-close) {
  background: rgb(51 65 85);
  color: rgb(241 245 249);
}

:global(.dark) :deep(.mokelay-editor-tool__property-label) {
  color: rgb(203 213 225);
}

:global(.dark) :deep(.mokelay-editor-tool__property-input) {
  background: rgb(15 23 42);
  color: rgb(226 232 240);
  border-color: rgb(71 85 105 / 0.9);
}
</style>
