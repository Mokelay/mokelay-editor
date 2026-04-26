<script setup lang="ts">
import EditorJS from '@editorjs/editorjs';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';

const holderId = 'editorjs-root';
const panelRef = ref<HTMLElement | null>(null);
const savedConfigText = ref('');
const showConfigDialog = ref(false);
let editor: EditorJS | null = null;
const editorTools = createEditorTools({ edit: true });

const defaultEditorData = {
  blocks: [
    {
      type: 'paragraph',
      data: {
        text: '欢迎使用 Mokelay 编辑器初始化模板。'
      }
    }
  ]
};

function getInitialData() {
  const cache = localStorage.getItem(MOKELAY_CONFIG_STORAGE_KEY);
  if (!cache) return defaultEditorData;
  try {
    return JSON.parse(cache);
  } catch {
    return defaultEditorData;
  }
}

onMounted(() => {
  editor = new EditorJS({
    holder: holderId,
    placeholder: '开始输入你的内容...',
    tools: editorTools,
    data: getInitialData()
  });
});

async function save() {
  if (!editor) return;
  const output = await editor.save();
  localStorage.setItem(MOKELAY_CONFIG_STORAGE_KEY, JSON.stringify(output));
  savedConfigText.value = JSON.stringify(output, null, 2);
  showConfigDialog.value = true;
}

function openPreview() {
  window.location.hash = '/preview';
}

function closeConfigDialog() {
  showConfigDialog.value = false;
}

async function toggleFullscreen() {
  if (!panelRef.value) return;
  if (!document.fullscreenElement) {
    await panelRef.value.requestFullscreen();
    return;
  }
  await document.exitFullscreen();
}

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <section
    ref="panelRef"
    class="flex h-[calc(100vh-14rem)] min-h-[520px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm [&:fullscreen]:h-screen dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="mb-3 flex items-center justify-end gap-2">
      <button class="rounded bg-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600" @click="toggleFullscreen">
        全屏编辑
      </button>
      <button class="rounded bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400" @click="save">保存内容</button>
      <button class="rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400" @click="openPreview">预览页面</button>
    </div>
    <div :id="holderId" class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"></div>

    <div
      v-if="showConfigDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      @click.self="closeConfigDialog"
    >
      <div class="w-full max-w-3xl rounded-xl bg-white p-4 shadow-2xl dark:bg-slate-900">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">配置 JSON</h3>
          <button
            class="rounded bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            @click="closeConfigDialog"
          >
            关闭
          </button>
        </div>
        <pre class="max-h-[60vh] overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300">{{ savedConfigText }}</pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
:deep(.ce-input-tool) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.ce-input-tool__label),
:deep(.ce-input-tool__control) {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 8px;
  padding: 8px 10px;
  background-color: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

:deep(.ce-input-tool__label:focus),
:deep(.ce-input-tool__control:focus) {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

:global(.dark) :deep(.ce-input-tool__label),
:global(.dark) :deep(.ce-input-tool__control) {
  background-color: rgb(15 23 42);
  color: rgb(226 232 240);
  border-color: rgb(71 85 105 / 0.9);
}
</style>
