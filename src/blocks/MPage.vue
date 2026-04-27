<script setup lang="ts">
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import EditorJsColumns from '@calumk/editorjs-columns';
import Table from '@editorjs/table';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import {
  getEditorComponentDefinition,
  isRegisteredEditorComponent
} from '@/editors/editorComponentRegistry';

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

function getTableRows(block: OutputData['blocks'][number]) {
  const content = (block.data as { withHeadings?: boolean; content?: unknown }).content;
  if (!Array.isArray(content)) return [];
  return content.filter((row): row is string[] => Array.isArray(row));
}

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
  <div v-if="shouldRenderEditor" ref="holderRef" class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"></div>
  <div v-else class="space-y-4">
    <div v-for="(block, index) in previewBlocks" :key="index" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <p v-if="block.type === 'paragraph'" class="text-sm leading-6" v-html="block.data.text"></p>


      <div v-else-if="block.type === 'table'" class="overflow-auto">
        <table class="min-w-full border-collapse text-sm">
          <tbody>
            <tr
              v-for="(row, rowIndex) in getTableRows(block)"
              :key="`table-${index}-${rowIndex}`"
              class="border-b border-slate-200 dark:border-slate-700"
            >
              <component
                :is="rowIndex === 0 ? 'th' : 'td'"
                v-for="(cell, cellIndex) in row"
                :key="`table-${index}-${rowIndex}-${cellIndex}`"
                class="border border-slate-200 px-3 py-2 text-left align-top dark:border-slate-700"
                v-html="cell"
              />
            </tr>
          </tbody>
        </table>
      </div>

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
            <p v-if="columnBlock.type === 'paragraph'" class="text-sm leading-6" v-html="columnBlock.data.text"></p>
            <div v-else-if="columnBlock.type === 'table'" class="overflow-auto">
              <table class="min-w-full border-collapse text-xs">
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in getTableRows(columnBlock)"
                    :key="`table-col-${index}-${columnIndex}-${columnBlockIndex}-${rowIndex}`"
                    class="border-b border-slate-200 dark:border-slate-700"
                  >
                    <component
                      :is="rowIndex === 0 ? 'th' : 'td'"
                      v-for="(cell, cellIndex) in row"
                      :key="`table-col-${index}-${columnIndex}-${columnBlockIndex}-${rowIndex}-${cellIndex}`"
                      class="border border-slate-200 px-2 py-1 text-left align-top dark:border-slate-700"
                      v-html="cell"
                    />
                  </tr>
                </tbody>
              </table>
            </div>
            <component
              :is="getBlockComponent(columnBlock.type)"
              v-else-if="isCustomBlock(columnBlock.type)"
              v-bind="getBlockProps(columnBlock)"
            />
            <pre v-else class="overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{{ columnBlock }}</pre>
          </div>
        </div>
      </div>

      <component
        :is="getBlockComponent(block.type)"
        v-else-if="isCustomBlock(block.type)"
        v-bind="getBlockProps(block)"
      />

      <pre v-else class="overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{{ block }}</pre>
    </div>
  </div>
</template>
