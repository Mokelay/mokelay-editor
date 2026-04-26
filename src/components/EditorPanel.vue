<script setup lang="ts">
import EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';

const holderId = 'editorjs-root';
const panelRef = ref<HTMLElement | null>(null);
const savedConfigText = ref('');
const showConfigDialog = ref(false);
let editor: EditorJS | null = null;
const { t, localeValue } = useI18n();
let editorDataCache: OutputData = getInitialData();

function getInitialData() {
  const cache = localStorage.getItem(MOKELAY_CONFIG_STORAGE_KEY);
  if (!cache) {
    return {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: t('editor.defaultParagraph')
          }
        }
      ]
    };
  }
  try {
    return JSON.parse(cache);
  } catch {
    return {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: t('editor.defaultParagraph')
          }
        }
      ]
    };
  }
}

async function mountEditor() {
  editor = new EditorJS({
    holder: holderId,
    placeholder: t('editor.placeholder'),
    tools: createEditorTools({ edit: true }),
    data: editorDataCache,
    i18n: {
      messages: getEditorJsI18nMessages(localeValue.value)
    }
  });
}

async function rebuildEditor() {
  if (editor) {
    try {
      editorDataCache = await editor.save();
    } catch {
      editorDataCache = getInitialData();
    }

    editor.destroy();
    editor = null;
  }

  await mountEditor();
}

onMounted(async () => {
  await mountEditor();
});

watch(localeValue, async () => {
  await rebuildEditor();
});

async function save() {
  if (!editor) return;
  const output = await editor.save();
  editorDataCache = output;
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
        {{ t('editor.fullscreenEdit') }}
      </button>
      <button class="rounded bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400" @click="save">{{ t('editor.saveContent') }}</button>
      <button class="rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400" @click="openPreview">{{ t('editor.previewPage') }}</button>
    </div>
    <div :id="holderId" class="min-h-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"></div>

    <div
      v-if="showConfigDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      @click.self="closeConfigDialog"
    >
      <div class="w-full max-w-3xl rounded-xl bg-white p-4 shadow-2xl dark:bg-slate-900">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">{{ t('editor.configJson') }}</h3>
          <button
            class="rounded bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            @click="closeConfigDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>
        <pre class="max-h-[60vh] overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300">{{ savedConfigText }}</pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
:deep(.mokelay-editor-tool) {
  position: relative;
}

:deep(.mokelay-editor-tool__property-button) {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  border: 0;
  border-radius: 9999px;
  padding: 4px 10px;
  background: rgb(15 23 42 / 0.88);
  color: rgb(248 250 252);
  font-size: 12px;
  line-height: 16px;
  cursor: pointer;
}

:deep(.mokelay-editor-tool__property-dialog) {
  width: min(100%, 480px);
  border: 0;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
}

:deep(.mokelay-editor-tool__property-dialog::backdrop) {
  background: rgb(15 23 42 / 0.45);
}

:deep(.mokelay-editor-tool__property-panel) {
  margin: 0;
  padding: 20px;
  background: rgb(255 255 255);
}

:deep(.mokelay-editor-tool__property-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

:deep(.mokelay-editor-tool__property-title) {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 18px;
  font-weight: 600;
}

:deep(.mokelay-editor-tool__property-close) {
  border: 0;
  border-radius: 10px;
  padding: 8px 12px;
  background: rgb(226 232 240);
  color: rgb(51 65 85);
  cursor: pointer;
}

:deep(.mokelay-editor-tool__property-body) {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:deep(.mokelay-editor-tool__property-field) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.mokelay-editor-tool__property-label) {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 600;
}

:deep(.mokelay-editor-tool__property-input) {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

:deep(.mokelay-editor-tool__property-input:focus) {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

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

:global(.dark) :deep(.mokelay-editor-tool__property-panel) {
  background: rgb(15 23 42);
}

:global(.dark) :deep(.mokelay-editor-tool__property-title) {
  color: rgb(241 245 249);
}

:global(.dark) :deep(.mokelay-editor-tool__property-close) {
  background: rgb(51 65 85);
  color: rgb(241 245 249);
}

:global(.dark) :deep(.mokelay-editor-tool__property-label) {
  color: rgb(203 213 225);
}

:global(.dark) :deep(.mokelay-editor-tool__property-input) {
  background: rgb(15 23 42);
  color: rgb(226 232 240);
  border-color: rgb(71 85 105 / 0.9);
}
</style>
