<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { computed, defineAsyncComponent, ref } from 'vue';
import { useI18n } from '@/i18n';
import type { MokelayLayoutRecord } from '@/services/layoutsApi';
import type { PageDataSourceConfig } from 'mokelay-components/pages';
import type { PageEditorBridge } from '@/editors/pageEditor';

type EditorPanelProps = {
  blocks?: OutputData['blocks'];
  dataSources?: PageDataSourceConfig[];
  pageUuid?: string | null;
  pageName?: string;
  pageEditor?: PageEditorBridge;
  layoutUuid?: string | null;
  layoutOptions?: MokelayLayoutRecord[];
  layoutLoading?: boolean;
  layoutSaving?: boolean;
  layoutError?: string;
  canEditLayoutBinding?: boolean;
  showLayoutBinding?: boolean;
  loading?: boolean;
  error?: string;
};

type MPageExpose = {
  saveEditor: () => Promise<OutputData | undefined>;
};

const MPageEditor = defineAsyncComponent(() => import('@/editors/page/MPageEditor.vue'));

const props = withDefaults(defineProps<EditorPanelProps>(), {
  blocks: () => [],
  dataSources: () => [],
  pageUuid: null,
  pageName: '',
  layoutUuid: null,
  layoutOptions: () => [],
  layoutLoading: false,
  layoutSaving: false,
  layoutError: '',
  canEditLayoutBinding: true,
  showLayoutBinding: true,
  loading: false,
  error: ''
});

const emit = defineEmits<{
  (event: 'change', blocks: OutputData['blocks']): void;
  (event: 'name-change', name: string): void;
  (event: 'layout-change', layoutUuid: string | null): void;
}>();

const pageRef = ref<MPageExpose | null>(null);
const { t } = useI18n();
const missingLayoutUuid = computed(() => {
  const currentUuid = props.layoutUuid?.trim();
  if (!currentUuid) return '';
  return props.layoutOptions.some((layout) => layout.uuid === currentUuid) ? '' : currentUuid;
});

async function save() {
  const output: OutputData = (await pageRef.value?.saveEditor()) ?? { blocks: props.blocks };
  emit('change', output.blocks);
  return output;
}

function handlePageChange(blocks: OutputData['blocks']) {
  emit('change', blocks);
}

function handleLayoutChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value.trim();
  emit('layout-change', value || null);
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

    <label v-if="!loading" class="mb-4 mk-form-field">
      <span class="font-medium text-slate-700 dark:text-slate-200">页面标题</span>
      <input
        data-testid="page-name-input"
        class="mk-form-control"
        :value="pageName"
        placeholder="请输入页面标题"
        @input="emit('name-change', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label v-if="!loading && showLayoutBinding" class="mb-4 mk-form-field">
      <span class="font-medium text-slate-700 dark:text-slate-200">页面布局</span>
      <select
        data-testid="page-layout-select"
        class="disabled:cursor-not-allowed mk-form-control"
        :value="layoutUuid || ''"
        :disabled="layoutLoading || layoutSaving || !canEditLayoutBinding"
        @change="handleLayoutChange"
      >
        <option value="">无布局</option>
        <option v-if="missingLayoutUuid" :value="missingLayoutUuid" disabled>
          {{ missingLayoutUuid }}
        </option>
        <option v-for="layout in layoutOptions" :key="layout.uuid" :value="layout.uuid">
          {{ layout.name || layout.uuid }}
        </option>
      </select>
      <span v-if="layoutSaving" data-testid="page-layout-saving" class="text-xs text-slate-500 dark:text-slate-400">布局绑定保存中...</span>
      <span v-else-if="layoutError" data-testid="page-layout-error" class="text-xs text-rose-600 dark:text-rose-300">{{ layoutError }}</span>
    </label>

    <MPageEditor
      v-if="!loading"
      ref="pageRef"
      :value="blocks"
      :page-id="pageUuid ?? undefined"
      :data-sources="dataSources"
      :page-editor="pageEditor"
      @change="handlePageChange"
    />
  </section>
</template>

<style scoped>
:deep(.mokelay-editor-tool) { position: relative; }
</style>
