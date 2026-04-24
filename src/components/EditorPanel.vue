<script setup lang="ts">
import EditorJS from '@editorjs/editorjs';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const holderId = 'editorjs-root';
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

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <section class="rounded-xl border border-slate-700 bg-slate-900 p-4">
    <div :id="holderId" class="min-h-36 rounded-lg border border-slate-800 bg-slate-950 p-3"></div>
    <button class="mt-4 rounded bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400" @click="save">保存内容</button>
    <pre class="mt-4 max-h-48 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">{{ data }}</pre>
  </section>
</template>
