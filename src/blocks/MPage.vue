<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import type { OutputData } from '@editorjs/editorjs';

export interface MPageProps {
  edit?: boolean;
  value?: OutputData['blocks'];
}

type MPageToolProps = {
  edit: boolean;
  value?: OutputData['blocks'];
};

export const mPageEditorTool = defineEditorTool<MPageToolProps>({
  toolbox: {
    get title() {
      return i18n.t('editor.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="16" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  createInitialProps: () => ({
    edit: false,
    value: []
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: Array.isArray(props.value) ? props.value : []
  }),
  serialize: (props) => ({
    value: props.value
  })
});
</script>

<script setup lang="ts">
import EditorJS from '@editorjs/editorjs';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';

const props = withDefaults(defineProps<MPageProps>(), {
  edit: false,
  value: () => []
});

const emit = defineEmits<{
  (event: 'change', blocks: OutputData['blocks']): void;
}>();

const shouldRenderEditor = computed(() => props.edit);
let editor: EditorJS | null = null;
let isSyncingFromProps = false;
let editorDataCache: OutputData = {
  blocks: props.value
};

const { t, localeValue } = useI18n();
const holderRef = ref<HTMLElement | null>(null);

function buildOutput(blocks: OutputData['blocks']): OutputData {
  return {
    blocks
  };
}

function isSameBlocks(left: OutputData['blocks'], right: OutputData['blocks']) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function mountEditor() {
  if (!holderRef.value || !shouldRenderEditor.value) return;
  editor = new EditorJS({
    holder: holderRef.value,
    placeholder: t('editor.placeholder'),
    tools: createEditorTools({ edit: true }),
    data: editorDataCache,
    i18n: {
      messages: getEditorJsI18nMessages(localeValue.value)
    },
    onChange: async () => {
      if (!editor) return;
      const output = await editor.save();
      editorDataCache = output;
      if (isSyncingFromProps) return;
      emit('change', output.blocks);
    }
  });
}

async function unmountEditor() {
  if (!editor) return;
  try {
    editorDataCache = await editor.save();
  } catch {
    editorDataCache = buildOutput(props.value);
  }
  editor.destroy();
  editor = null;
}

async function rebuildEditor() {
  await unmountEditor();
  await nextTick();
  await mountEditor();
}

async function saveEditor() {
  if (!editor) {
    return editorDataCache;
  }
  const output = await editor.save();
  editorDataCache = output;
  return output;
}

defineExpose({
  saveEditor
});

onMounted(async () => {
  await mountEditor();
});

watch(
  () => props.value,
  async (blocks) => {
    const nextBlocks = Array.isArray(blocks) ? blocks : ([] as OutputData['blocks']);
    const cachedBlocks = Array.isArray(editorDataCache.blocks) ? editorDataCache.blocks : ([] as OutputData['blocks']);
    if (isSameBlocks(nextBlocks, cachedBlocks)) {
      return;
    }
    isSyncingFromProps = true;
    editorDataCache = buildOutput(nextBlocks);
    if (editor) {
      await rebuildEditor();
    }
    isSyncingFromProps = false;
  },
  { deep: true }
);

watch(localeValue, async () => {
  if (!editor) return;
  await rebuildEditor();
});

watch(shouldRenderEditor, async (enabled) => {
  if (enabled) {
    await nextTick();
    await mountEditor();
    return;
  }
  await unmountEditor();
});

onBeforeUnmount(async () => {
  await unmountEditor();
});
</script>

<template>
  <div v-if="shouldRenderEditor" ref="holderRef" class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"></div>
</template>
