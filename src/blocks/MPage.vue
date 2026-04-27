<script setup lang="ts">
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import {
  getEditorComponentDefinition,
  isRegisteredEditorComponent
} from '@/editors/editorComponentRegistry';

export interface MPageProps {
  edit?: boolean;
  value?: OutputData['blocks'];
  onToolChange?: (payload: { edit: boolean; value: OutputData['blocks'] }) => void;
}

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
let skipNextPropSync = false;
let editorDataCache: OutputData = {
  blocks: props.value
};

const { t, localeValue } = useI18n();
const holderRef = ref<HTMLElement | null>(null);
const previewBlocks = computed(() => (Array.isArray(props.value) ? props.value : []));

function buildOutput(blocks: OutputData['blocks']): OutputData {
  return {
    blocks
  };
}

function isSameBlocks(left: OutputData['blocks'], right: OutputData['blocks']) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isCustomBlock(type: string) {
  return isRegisteredEditorComponent(type);
}

function getBlockComponent(type: string) {
  const definition = getEditorComponentDefinition(type);
  return definition?.component ?? null;
}

function getBlockProps(block: OutputData['blocks'][number]) {
  const definition = getEditorComponentDefinition(block.type);
  if (!definition) {
    return {
      edit: false,
      ...block.data
    };
  }

  return {
    ...definition.normalizeProps({
      ...(definition.createInitialProps?.() ?? {}),
      ...block.data,
      edit: false
    })
  };
}

function notifyChanges(blocks: OutputData['blocks']) {
  const payload = {
    edit: props.edit,
    value: blocks
  };
  props.onToolChange?.(payload);
  skipNextPropSync = true;
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
    if (skipNextPropSync) {
      skipNextPropSync = false;
      return;
    }

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
  <div v-else class="space-y-4">
    <div v-for="(block, index) in previewBlocks" :key="index" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <p v-if="block.type === 'paragraph'" class="text-sm leading-6" v-html="block.data.text"></p>

      <component
        :is="getBlockComponent(block.type)"
        v-else-if="isCustomBlock(block.type)"
        v-bind="getBlockProps(block)"
      />

      <pre v-else class="overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{{ block }}</pre>
    </div>
  </div>
</template>
