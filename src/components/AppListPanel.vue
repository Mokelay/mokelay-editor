<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from '@/i18n';
import { $message } from '@/utils/globalCalls';
import { createApp, listApps, type MokelayApp, type MokelayAppsPagination } from '@/utils/appsApi';

const PAGE_SIZE = 10;

const { t } = useI18n();
const apps = ref<MokelayApp[]>([]);
const isLoadingApps = ref(false);
const appListError = ref('');
const isCreateDialogOpen = ref(false);
const isCreatingApp = ref(false);
const createAppAlias = ref('');
const createAppDescription = ref('');
const createAppError = ref('');
const currentPage = ref(1);
const pagination = ref<MokelayAppsPagination>(createEmptyPagination(1));
let loadRequestId = 0;

const appTotalLabel = computed(() => t('appList.total').replace('{count}', String(pagination.value.total)));
const appRangeLabel = computed(() => {
  const total = pagination.value.total;

  if (total <= 0) {
    return t('appList.pageRangeEmpty');
  }

  const start = (pagination.value.page - 1) * pagination.value.pageSize + 1;
  const end = Math.min(start + apps.value.length - 1, total);

  return t('appList.pageRange')
    .replace('{start}', String(start))
    .replace('{end}', String(end))
    .replace('{total}', String(total));
});
const currentPageLabel = computed(() => t('appList.currentPage')
  .replace('{page}', String(pagination.value.page))
  .replace('{totalPages}', String(Math.max(pagination.value.totalPages, 1))));

onMounted(() => {
  void refreshApps();
});

async function refreshApps(pageNumber = currentPage.value) {
  const normalizedPageNumber = Math.max(1, Math.floor(pageNumber));
  const requestId = loadRequestId + 1;
  loadRequestId = requestId;
  isLoadingApps.value = true;
  appListError.value = '';

  try {
    const result = await listApps({
      page: normalizedPageNumber,
      pageSize: PAGE_SIZE
    });

    if (requestId !== loadRequestId) {
      return;
    }

    apps.value = result.apps;
    pagination.value = normalizePaginationForDisplay(result.pagination, normalizedPageNumber);
    currentPage.value = pagination.value.page;
  } catch (error) {
    if (requestId !== loadRequestId) {
      return;
    }
    appListError.value = error instanceof Error ? error.message : t('appList.loadFailed');
  } finally {
    if (requestId === loadRequestId) {
      isLoadingApps.value = false;
    }
  }
}

function goToPreviousPage() {
  if (isLoadingApps.value || !pagination.value.hasPreviousPage) return;
  void refreshApps(currentPage.value - 1);
}

function goToNextPage() {
  if (isLoadingApps.value || !pagination.value.hasNextPage) return;
  void refreshApps(currentPage.value + 1);
}

function openCreateDialog() {
  createAppAlias.value = '';
  createAppDescription.value = '';
  createAppError.value = '';
  isCreateDialogOpen.value = true;
}

function closeCreateDialog() {
  if (isCreatingApp.value) return;
  isCreateDialogOpen.value = false;
}

async function submitCreateApp() {
  const alias = createAppAlias.value.trim();
  const description = createAppDescription.value.trim();
  const validationMessage = validateAppAlias(alias);

  if (validationMessage) {
    createAppError.value = validationMessage;
    return;
  }

  isCreatingApp.value = true;
  createAppError.value = '';

  try {
    await createApp({
      alias,
      description
    });

    isCreateDialogOpen.value = false;
    void $message('success', t('appList.createSuccess'));
    await refreshApps(1);
  } catch (error) {
    createAppError.value = error instanceof Error ? error.message : t('appList.createFailed');
  } finally {
    isCreatingApp.value = false;
  }
}

function validateAppAlias(alias: string) {
  if (!alias) {
    return t('appList.aliasRequired');
  }

  if (alias.length > 120) {
    return t('appList.aliasTooLong');
  }

  return '';
}

function createEmptyPagination(page: number): MokelayAppsPagination {
  return {
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasPreviousPage: page > 1,
    hasNextPage: false
  };
}

function normalizePaginationForDisplay(value: MokelayAppsPagination, requestedPage: number): MokelayAppsPagination {
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
  <section data-testid="app-list-panel" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Editor</p>
          <h2 class="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{{ t('appList.title') }}</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {{ appTotalLabel }}
          </p>
        </div>
        <button data-testid="create-app-button" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="openCreateDialog">
          {{ t('appList.createApp') }}
        </button>
      </div>

      <p v-if="appListError" data-testid="app-list-error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ appListError }}</p>

      <div class="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3">{{ t('appList.columns.id') }}</th>
              <th class="px-4 py-3">{{ t('appList.columns.uuid') }}</th>
              <th class="px-4 py-3">{{ t('appList.columns.alias') }}</th>
              <th class="px-4 py-3">{{ t('appList.columns.description') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-if="isLoadingApps">
              <td colspan="4" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">{{ t('appList.loading') }}</td>
            </tr>
            <tr v-else-if="!apps.length">
              <td colspan="4" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">{{ t('appList.empty') }}</td>
            </tr>
            <template v-else>
              <tr v-for="app in apps" :key="app.uuid" class="bg-white dark:bg-slate-900">
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ app.id }}</td>
                <td class="px-4 py-3">
                  <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ app.uuid }}</code>
                </td>
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ app.alias || t('appList.unnamedApp') }}</td>
                <td class="max-w-xl px-4 py-3 text-slate-600 dark:text-slate-300">
                  <span class="line-clamp-2">{{ app.description || '-' }}</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.total > 0" data-testid="app-list-pagination" class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <p data-testid="app-list-pagination-info">
          {{ appRangeLabel }} · {{ currentPageLabel }}
        </p>
        <div class="flex items-center gap-2">
          <button data-testid="app-list-prev-button" type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600" :disabled="isLoadingApps || !pagination.hasPreviousPage" @click="goToPreviousPage">
            {{ t('appList.previousPage') }}
          </button>
          <button data-testid="app-list-next-button" type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600" :disabled="isLoadingApps || !pagination.hasNextPage" @click="goToNextPage">
            {{ t('appList.nextPage') }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="isCreateDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="create-app-dialog-title">
        <form class="flex flex-col gap-4" @submit.prevent="submitCreateApp">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay App</p>
            <h2 id="create-app-dialog-title" class="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              {{ t('appList.createDialogTitle') }}
            </h2>
          </div>

          <p v-if="createAppError" data-testid="create-app-error" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ createAppError }}</p>

          <label class="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{{ t('appList.appAlias') }}</span>
            <input v-model="createAppAlias" data-testid="create-app-alias" class="page-list-input" maxlength="120" autofocus>
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{{ t('appList.appDescription') }}</span>
            <textarea v-model="createAppDescription" data-testid="create-app-description" class="page-list-input min-h-24 resize-y"></textarea>
          </label>

          <div class="flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800" @click="closeCreateDialog">
              {{ t('globalCalls.cancel') }}
            </button>
            <button data-testid="create-app-submit" type="submit" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isCreatingApp">
              {{ isCreatingApp ? t('appList.creating') : t('appList.save') }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>
