<script setup lang="ts">
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';

export interface MPageProps {
  edit?: boolean;
  value?: OutputData['blocks'];
}

const props = withDefaults(defineProps<MPageProps>(), {
  edit: false,
  value: () => []
});
const attrs = useAttrs();

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

function notifyChanges(blocks: OutputData['blocks']) {
  const onChange = attrs.onChange as ((payload: { edit: boolean; value: OutputData['blocks'] }) => void) | undefined;
  onChange?.({
    edit: props.edit,
    value: blocks
  });
  emit('change', blocks);
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
      notifyChanges(output.blocks);
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
