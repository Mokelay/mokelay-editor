<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { $message } from '@/utils/globalCalls';
import LayoutRenderer from '@/layouts/LayoutRenderer.vue';
import {
  createDefaultLayoutJson,
  getLayout,
  updateLayout,
  type MokelayLayout,
  type RenderBundlePage
} from '@/utils/layoutsApi';

const props = defineProps<{
  layoutUuid: string;
}>();

const emit = defineEmits<{
  (event: 'back'): void;
}>();

const layout = ref<MokelayLayout | null>(null);
const layoutName = ref('');
const layoutJsonText = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const error = ref('');
const jsonError = ref('');
let loadRequestId = 0;

const samplePage = computed<RenderBundlePage>(() => ({
  uuid: 'layout-preview-page',
  name: '布局预览页面',
  blocks: [
    {
      id: 'layout-preview-heading',
      type: 'MHeading',
      data: {
        text: '页面主体内容',
        level: 2,
        align: 'left'
      }
    },
    {
      id: 'layout-preview-paragraph',
      type: 'paragraph',
      data: {
        text: '这里会替换成当前页面 DSL 的 blocks。'
      }
    }
  ]
}));

const previewLayout = computed(() => {
  const parsed = parseLayoutJson(false);
  return parsed ?? layout.value;
});

onMounted(() => {
  void loadLayout();
});

watch(
  () => props.layoutUuid,
  () => {
    void loadLayout();
  }
);

async function loadLayout() {
  const requestId = loadRequestId + 1;
  loadRequestId = requestId;
  isLoading.value = true;
  error.value = '';
  jsonError.value = '';

  try {
    const record = await getLayout(props.layoutUuid);
    if (requestId !== loadRequestId) return;
    layout.value = record.layoutJson;
    layoutName.value = record.name;
    layoutJsonText.value = JSON.stringify(record.layoutJson, null, 2);
  } catch (loadError) {
    if (requestId !== loadRequestId) return;
    error.value = loadError instanceof Error ? loadError.message : '布局加载失败。';
    const fallback = createDefaultLayoutJson(props.layoutUuid, props.layoutUuid);
    layout.value = fallback;
    layoutName.value = fallback.name;
    layoutJsonText.value = JSON.stringify(fallback, null, 2);
  } finally {
    if (requestId === loadRequestId) {
      isLoading.value = false;
    }
  }
}

async function saveLayout() {
  const name = layoutName.value.trim();
  const parsed = parseLayoutJson(true);

  if (!name || !parsed) {
    return;
  }

  const nextLayout = {
    ...parsed,
    uuid: props.layoutUuid,
    name
  };

  isSaving.value = true;
  error.value = '';

  try {
    const updated = await updateLayout(props.layoutUuid, {
      name,
      layoutJson: nextLayout
    });
    layout.value = updated.layoutJson;
    layoutName.value = updated.name;
    layoutJsonText.value = JSON.stringify(updated.layoutJson, null, 2);
    void $message('success', '布局已保存。');
  } catch (saveError) {
    error.value = saveError instanceof Error ? saveError.message : '布局保存失败。';
  } finally {
    isSaving.value = false;
  }
}

function parseLayoutJson(reportError: boolean) {
  try {
    const parsed = JSON.parse(layoutJsonText.value) as unknown;
    if (!isRecord(parsed)) {
      throw new Error('布局 DSL 必须是 JSON 对象。');
    }

    const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
    const normalized = {
      ...parsed,
      schemaVersion: 1,
      uuid: props.layoutUuid,
      name: layoutName.value.trim() || props.layoutUuid,
      blocks
    } as MokelayLayout;

    if (reportError) {
      jsonError.value = '';
    }

    return normalized;
  } catch (parseError) {
    if (reportError) {
      jsonError.value = parseError instanceof Error ? parseError.message : '布局 JSON 无效。';
    }
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
</script>

<template>
  <section data-testid="layout-editor-panel" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button data-testid="back-to-layouts-button" class="mb-2 text-sm font-medium text-teal-700 hover:text-teal-500 dark:text-teal-300" @click="emit('back')">
            返回布局列表
          </button>
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-xl font-semibold text-slate-950 dark:text-white">{{ layoutName || layoutUuid }}</h2>
            <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ layoutUuid }}</code>
          </div>
        </div>

        <button data-testid="save-layout-button" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSaving || isLoading" @click="saveLayout">
          {{ isSaving ? '保存中...' : '保存布局' }}
        </button>
      </div>

      <p v-if="error" data-testid="layout-editor-error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ error }}</p>
      <p v-if="jsonError" data-testid="layout-json-error" class="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">{{ jsonError }}</p>
    </section>

    <section class="grid flex-1 gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(480px,1.1fr)]">
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label class="mb-4 flex flex-col gap-1.5 text-sm">
          <span class="font-medium text-slate-700 dark:text-slate-200">布局名称</span>
          <input v-model="layoutName" data-testid="layout-editor-name" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
        </label>

        <label class="flex min-h-[540px] flex-col gap-1.5 text-sm">
          <span class="font-medium text-slate-700 dark:text-slate-200">布局 DSL JSON</span>
          <textarea v-model="layoutJsonText" data-testid="layout-json-editor" spellcheck="false" class="min-h-[520px] flex-1 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs leading-5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"></textarea>
        </label>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">布局预览</div>
        <div class="h-[680px] overflow-auto bg-white dark:bg-slate-950">
          <LayoutRenderer v-if="previewLayout" :layout="previewLayout" :page="samplePage" />
        </div>
      </div>
    </section>
  </section>
</template>
