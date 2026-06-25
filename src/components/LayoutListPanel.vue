<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { $message } from '@/utils/globalCalls';
import {
  createDefaultLayoutJson,
  createLayout,
  listLayouts,
  type LayoutsPagination,
  type MokelayLayoutRecord
} from '@/utils/layoutsApi';

const PAGE_SIZE = 10;

const emit = defineEmits<{
  (event: 'open-layout', uuid: string): void;
}>();

const layouts = ref<MokelayLayoutRecord[]>([]);
const isLoading = ref(false);
const error = ref('');
const isDialogOpen = ref(false);
const isSaving = ref(false);
const layoutUuid = ref('');
const layoutName = ref('');
const dialogError = ref('');
const currentPage = ref(1);
const pagination = ref<LayoutsPagination>(createEmptyPagination(1));
let loadRequestId = 0;

const rangeLabel = computed(() => {
  if (pagination.value.total <= 0) return '暂无布局';
  const start = (pagination.value.page - 1) * pagination.value.pageSize + 1;
  const end = Math.min(start + layouts.value.length - 1, pagination.value.total);
  return `${start}-${end} / ${pagination.value.total}`;
});

onMounted(() => {
  void refreshLayouts();
});

async function refreshLayouts(pageNumber = currentPage.value) {
  const requestId = loadRequestId + 1;
  loadRequestId = requestId;
  isLoading.value = true;
  error.value = '';

  try {
    const result = await listLayouts({
      page: Math.max(1, Math.floor(pageNumber)),
      pageSize: PAGE_SIZE
    });

    if (requestId !== loadRequestId) return;
    layouts.value = result.layouts;
    pagination.value = normalizePaginationForDisplay(result.pagination, pageNumber);
    currentPage.value = pagination.value.page;
  } catch (loadError) {
    if (requestId !== loadRequestId) return;
    error.value = loadError instanceof Error ? loadError.message : '布局列表加载失败。';
  } finally {
    if (requestId === loadRequestId) {
      isLoading.value = false;
    }
  }
}

function openCreateDialog() {
  layoutUuid.value = '';
  layoutName.value = '';
  dialogError.value = '';
  isDialogOpen.value = true;
}

function closeDialog() {
  if (isSaving.value) return;
  isDialogOpen.value = false;
}

async function submitLayout() {
  const uuid = layoutUuid.value.trim();
  const name = layoutName.value.trim();

  if (!uuid || !name) {
    dialogError.value = '请输入布局 UUID 和名称。';
    return;
  }

  isSaving.value = true;
  dialogError.value = '';

  try {
    await createLayout({
      uuid,
      name,
      layoutJson: createDefaultLayoutJson(uuid, name)
    });
    void $message('success', '布局已创建。');
    isDialogOpen.value = false;
    emit('open-layout', uuid);
  } catch (createError) {
    dialogError.value = createError instanceof Error ? createError.message : '布局创建失败。';
  } finally {
    isSaving.value = false;
  }
}

function goToPreviousPage() {
  if (isLoading.value || !pagination.value.hasPreviousPage) return;
  void refreshLayouts(currentPage.value - 1);
}

function goToNextPage() {
  if (isLoading.value || !pagination.value.hasNextPage) return;
  void refreshLayouts(currentPage.value + 1);
}

function createEmptyPagination(page: number): LayoutsPagination {
  return {
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasPreviousPage: page > 1,
    hasNextPage: false
  };
}

function normalizePaginationForDisplay(value: LayoutsPagination, requestedPage: number): LayoutsPagination {
  const pageSize = value.pageSize || PAGE_SIZE;
  const totalPages = value.totalPages || (value.total > 0 ? Math.ceil(value.total / pageSize) : 0);
  const page = value.page || requestedPage;

  return {
    page,
    pageSize,
    total: value.total,
    totalPages,
    hasPreviousPage: value.hasPreviousPage || page > 1,
    hasNextPage: value.hasNextPage || (totalPages > 0 && page < totalPages)
  };
}
</script>

<template>
  <section data-testid="layout-list-panel" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Layout DSL</p>
          <h2 class="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">布局列表</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ rangeLabel }}</p>
        </div>
        <button data-testid="create-layout-button" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="openCreateDialog">
          创建布局
        </button>
      </div>

      <p v-if="error" data-testid="layout-list-error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ error }}</p>

      <div class="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3">UUID</th>
              <th class="px-4 py-3">名称</th>
              <th class="px-4 py-3">更新时间</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-if="isLoading">
              <td colspan="4" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">加载中...</td>
            </tr>
            <tr v-else-if="!layouts.length">
              <td colspan="4" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">暂无布局</td>
            </tr>
            <template v-else>
              <tr v-for="layout in layouts" :key="layout.uuid" class="bg-white dark:bg-slate-900">
                <td class="px-4 py-3">
                  <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ layout.uuid }}</code>
                </td>
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ layout.name }}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ layout.updatedAt || '-' }}</td>
                <td class="px-4 py-3 text-right">
                  <button :data-testid="`open-layout-${layout.uuid}`" class="rounded-md px-2 py-1 text-teal-700 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-500/10" @click="emit('open-layout', layout.uuid)">
                    打开
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.total > 0" class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <p>{{ rangeLabel }}</p>
        <div class="flex items-center gap-2">
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600" :disabled="isLoading || !pagination.hasPreviousPage" @click="goToPreviousPage">
            上一页
          </button>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600" :disabled="isLoading || !pagination.hasNextPage" @click="goToNextPage">
            下一页
          </button>
        </div>
      </div>
    </section>

    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form data-testid="layout-dialog" class="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900" @submit.prevent="submitLayout">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-slate-950 dark:text-white">创建布局</h3>
          <button type="button" class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800" @click="closeDialog">关闭</button>
        </div>

        <label class="mb-3 flex flex-col gap-1.5 text-sm">
          <span class="font-medium text-slate-700 dark:text-slate-200">布局 UUID</span>
          <input v-model="layoutUuid" data-testid="layout-uuid" required maxlength="128" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
        </label>

        <label class="mb-3 flex flex-col gap-1.5 text-sm">
          <span class="font-medium text-slate-700 dark:text-slate-200">布局名称</span>
          <input v-model="layoutName" data-testid="layout-name" required maxlength="120" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
        </label>

        <p v-if="dialogError" data-testid="layout-dialog-error" class="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ dialogError }}</p>

        <button data-testid="layout-submit" type="submit" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '创建' }}
        </button>
      </form>
    </div>
  </section>
</template>
