<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { computed, ref } from 'vue';
import EditorPanel from '@/components/EditorPanel.vue';
import MPage from '@/blocks/MPage.vue';
import type { PageEditorBridge } from '@/editors/pageEditor';
import type { MokelayLayoutRecord } from '@/utils/layoutsApi';
import type { PageDataSourceConfig } from '@/utils/pageRuntimeContext';

export type PageEditorDraft = {
  name: string;
  blocks: OutputData['blocks'];
  dataSources: PageDataSourceConfig[];
};

type MPageEditorBlockProps = {
  pageUuid?: string | null;
  draft?: PageEditorDraft;
  pageName?: string;
  blocks?: OutputData['blocks'];
  dataSources?: PageDataSourceConfig[];
  mode: 'edit' | 'preview' | 'readonly';
  pageEditor?: PageEditorBridge;
  context?: 'embedded' | 'standalone';
  showLayoutBinding?: boolean;
  layoutUuid?: string | null;
  layoutOptions?: MokelayLayoutRecord[];
  layoutLoading?: boolean;
  layoutSaving?: boolean;
  layoutError?: string;
  canEditLayoutBinding?: boolean;
  loading?: boolean;
  error?: string;
};

const props = withDefaults(defineProps<MPageEditorBlockProps>(), {
  pageUuid: null,
  pageName: '',
  blocks: () => [],
  dataSources: () => [],
  context: 'embedded',
  showLayoutBinding: false,
  layoutUuid: null,
  layoutOptions: () => [],
  layoutLoading: false,
  layoutSaving: false,
  layoutError: '',
  canEditLayoutBinding: true,
  loading: false,
  error: ''
});
const emit = defineEmits<{
  (event: 'update:draft', value: PageEditorDraft): void;
  (event: 'change', value: OutputData['blocks']): void;
  (event: 'name-change', value: string): void;
  (event: 'layout-change', value: string | null): void;
}>();

const editorPanelRef = ref<InstanceType<typeof EditorPanel> | null>(null);
const temporaryPageId = `embedded-page-${Math.random().toString(36).slice(2)}`;
const runtimePageId = computed(() => props.pageUuid || temporaryPageId);
const draftName = computed(() => props.draft?.name ?? props.pageName);
const draftBlocks = computed(() => props.draft?.blocks ?? props.blocks);
const draftDataSources = computed(() => props.draft?.dataSources ?? props.dataSources);

function cloneDraft(patch: Partial<PageEditorDraft>): PageEditorDraft {
  return {
    name: patch.name ?? draftName.value,
    blocks: patch.blocks ?? draftBlocks.value,
    dataSources: patch.dataSources ?? draftDataSources.value
  };
}

function handleBlocksChange(blocks: OutputData['blocks']) {
  emit('update:draft', cloneDraft({ blocks }));
  emit('change', blocks);
}

function handleNameChange(name: string) {
  emit('update:draft', cloneDraft({ name }));
  emit('name-change', name);
}

async function flush() {
  if (props.mode === 'edit') {
    const output = await editorPanelRef.value?.save();
    if (output?.blocks) {
      const draft = cloneDraft({ blocks: output.blocks });
      emit('update:draft', draft);
      return draft;
    }
  }
  return cloneDraft({});
}

defineExpose({ flush });
</script>

<template>
  <EditorPanel
    v-if="mode === 'edit' || context === 'standalone'"
    ref="editorPanelRef"
    :blocks="draftBlocks"
    :data-sources="draftDataSources"
    :page-uuid="runtimePageId"
    :page-name="draftName"
    :page-editor="pageEditor"
    :layout-uuid="layoutUuid"
    :layout-options="layoutOptions"
    :layout-loading="layoutLoading"
    :layout-saving="layoutSaving"
    :layout-error="layoutError"
    :can-edit-layout-binding="canEditLayoutBinding"
    :show-layout-binding="showLayoutBinding"
    :editable="mode === 'edit'"
    :loading="loading"
    :error="error"
    @change="handleBlocksChange"
    @name-change="handleNameChange"
    @layout-change="emit('layout-change', $event)"
  />

  <section
    v-else
    class="embedded-page-preview"
    data-testid="embedded-page-preview"
  >
    <div class="embedded-page-preview__heading">
      <span>{{ mode === 'readonly' ? '系统页面（只读）' : '当前草稿预览' }}</span>
      <strong>{{ draftName }}</strong>
    </div>
    <MPage
      :edit="false"
      :value="draftBlocks"
      :page-id="runtimePageId"
      :data-sources="draftDataSources"
      :page-editor="pageEditor"
    />
  </section>
</template>

<style scoped>
.embedded-page-preview {
  min-height: 520px;
  flex: 1;
  overflow: auto;
  border: 1px solid rgb(226 232 240);
  border-radius: 14px;
  background: white;
  padding: 18px;
}

.embedded-page-preview__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  border-bottom: 1px solid rgb(226 232 240);
  padding-bottom: 12px;
  color: rgb(71 85 105);
  font-size: 13px;
}

.embedded-page-preview__heading strong {
  color: rgb(15 23 42);
  font-size: 15px;
}
</style>
