<script setup lang="ts">
import EditorJS from '@editorjs/editorjs';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const holderId = 'editorjs-root';
const panelRef = ref<HTMLElement | null>(null);
const data = ref('');
let editor: EditorJS | null = null;

onMounted(() => {
  editor = new EditorJS({
    holder: holderId,
    placeholder: '开始输入你的内容...',
    data: {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: '欢迎使用 Mokelay 编辑器初始化模板。'
          }
        }
      ]
    }
  });
});

async function save() {
  if (!editor) return;
  const output = await editor.save();
  data.value = JSON.stringify(output, null, 2);
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
    </div>
    <div :id="holderId" class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"></div>
    <pre class="mt-4 max-h-48 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300">{{ data }}</pre>
  </section>
</template>
