<script setup lang="ts">
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import EditorJsColumns from '@calumk/editorjs-columns';
import Table from '@editorjs/table';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import EditorPreviewBlock from '@/blocks/components/EditorPreviewBlock.vue';

// MPage 作为容器块，既支持 EditorJS 编辑态，也支持组件化预览态。
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
// 缓存最近一次编辑器输出，用于编辑态与预览态切换时保留数据。
let editorDataCache: OutputData = {
  blocks: props.value
};

const { t, localeValue } = useI18n();
const holderRef = ref<HTMLElement | null>(null);
const previewBlocks = computed(() => (Array.isArray(props.value) ? props.value : []));

type EditorBlock = OutputData['blocks'][number];
type EditorColumnData = { blocks?: OutputData['blocks'] };

function getColumns(block: EditorBlock): EditorColumnData[] {
  const cols = (block.data as { cols?: unknown }).cols;
  if (!Array.isArray(cols)) return [];
  return cols.filter((col): col is EditorColumnData => typeof col === 'object' && col !== null);
}

function getColumnBlocks(column: EditorColumnData): OutputData['blocks'] {
  return Array.isArray(column.blocks) ? column.blocks : [];
}

function buildOutput(blocks: OutputData['blocks']): OutputData {
  return {
    blocks
  };
}

// 当前通过 JSON 深比较 blocks，保证外部同步时能正确判断是否需要重建编辑器。
function isSameBlocks(left: OutputData['blocks'], right: OutputData['blocks']) {
  return JSON.stringify(left) === JSON.stringify(right);
}

// 将内部变更通知给外部，并标记下一次 props 同步跳过，避免循环更新。
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
  if (!holderRef.value || !shouldRenderEditor.value || editor) return;
  const columnTools = {
    ...createEditorTools({ edit: true }),
    table: {
      class: Table,
      inlineToolbar: true
    }
  };
  editor = new EditorJS({
    holder: holderRef.value,
    placeholder: t('editor.placeholder'),
    tools: {
      ...columnTools,
      columns: {
        class: EditorJsColumns,
        config: {
          EditorJsLibrary: EditorJS,
          tools: columnTools
        }
      }
    },
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
  const currentEditor = editor;
  if (!currentEditor) return;
  editor = null;

  try {
    editorDataCache = await currentEditor.save();
  } catch {
    // 销毁阶段若保存失败，回退到当前 props，避免丢失可用数据。
    editorDataCache = buildOutput(props.value);
  }

  currentEditor.destroy();
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
    // 本次更新由内部触发时，跳过反向同步，避免重复重建。
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
  // 切换语言后重建 EditorJS，以刷新工具名称与界面文案。
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
  <div
    v-if="shouldRenderEditor"
    ref="holderRef"
    class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 py-3 pr-3 pl-11 dark:border-slate-700 dark:bg-slate-950"
  ></div>
  <div v-else class="space-y-4">
    <div v-for="(block, index) in previewBlocks" :key="index" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <EditorPreviewBlock v-if="block.type !== 'columns'" :block="block" />

      <div v-else-if="block.type === 'columns'" class="grid gap-3 md:grid-cols-2">
        <div
          v-for="(column, columnIndex) in getColumns(block)"
          :key="`columns-${index}-${columnIndex}`"
          class="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-700"
        >
          <div
            v-for="(columnBlock, columnBlockIndex) in getColumnBlocks(column)"
            :key="`columns-${index}-${columnIndex}-${columnBlockIndex}`"
            class="rounded border border-slate-200 p-2 dark:border-slate-700"
          >
            <EditorPreviewBlock :block="columnBlock" compact-table />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
