<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import { $confirm, $message } from '@/utils/globalCalls';
import {
  createPage,
  deletePage,
  listPages,
  listSystemPages,
  type MokelayPage,
  type MokelayPagesPagination,
  type PageSource
} from '@/utils/pagesApi';

const props = withDefaults(defineProps<{
  source?: PageSource;
}>(), {
  source: 'user'
});

const emit = defineEmits<{
  (event: 'open-page', uuid: string, source: PageSource): void;
  (event: 'page-created', page: MokelayPage): void;
  (event: 'source-change', source: PageSource): void;
}>();

const PAGE_SIZE = 10;

const { t, localeValue } = useI18n();
const pages = ref<MokelayPage[]>([]);
const isLoadingPages = ref(false);
const pageListError = ref('');
const isCreateDialogOpen = ref(false);
const isCreatingPage = ref(false);
const createPageName = ref('');
const createPageError = ref('');
const isDeletingPageUuid = ref<string | null>(null);
const currentPage = ref(1);
const pageSource = ref<PageSource>(props.source);
const pagination = ref<MokelayPagesPagination>(createEmptyPagination(1));
let loadRequestId = 0;

const isSystemSource = computed(() => pageSource.value === 'system');
const pageTotalLabel = computed(() => t('pageList.total').replace('{count}', String(pagination.value.total)));
const pageRangeLabel = computed(() => {
  const total = pagination.value.total;

  if (total <= 0) {
    return t('pageList.pageRangeEmpty');
  }

  const start = (pagination.value.page - 1) * pagination.value.pageSize + 1;
  const end = Math.min(start + pages.value.length - 1, total);

  return t('pageList.pageRange')
    .replace('{start}', String(start))
    .replace('{end}', String(end))
    .replace('{total}', String(total));
});
const currentPageLabel = computed(() => t('pageList.currentPage')
  .replace('{page}', String(pagination.value.page))
  .replace('{totalPages}', String(Math.max(pagination.value.totalPages, 1))));

onMounted(() => {
  void refreshPages();
});

watch(
  () => props.source,
  (source) => {
    if (source === pageSource.value) return;
    pageSource.value = source;
    currentPage.value = 1;
    pagination.value = createEmptyPagination(1);
    void refreshPages(1);
  }
);

async function refreshPages(pageNumber = currentPage.value) {
  const normalizedPageNumber = Math.max(1, Math.floor(pageNumber));
  const requestId = loadRequestId + 1;
  loadRequestId = requestId;
  isLoadingPages.value = true;
  pageListError.value = '';

  try {
    const result = await (isSystemSource.value ? listSystemPages : listPages)({
      page: normalizedPageNumber,
      pageSize: PAGE_SIZE
    });

    if (requestId !== loadRequestId) {
      return;
    }

    pages.value = result.pages;
    pagination.value = normalizePaginationForDisplay(result.pagination, normalizedPageNumber);
    currentPage.value = pagination.value.page;
  } catch (error) {
    if (requestId !== loadRequestId) {
      return;
    }
    pageListError.value = error instanceof Error ? error.message : t('pageList.loadFailed');
  } finally {
    if (requestId === loadRequestId) {
      isLoadingPages.value = false;
    }
  }
}

function changePageSource(source: PageSource) {
  if (pageSource.value === source || isLoadingPages.value) return;
  pageSource.value = source;
  currentPage.value = 1;
  pagination.value = createEmptyPagination(1);
  emit('source-change', source);
  void refreshPages(1);
}

function goToPreviousPage() {
  if (isLoadingPages.value || !pagination.value.hasPreviousPage) return;
  void refreshPages(currentPage.value - 1);
}

function goToNextPage() {
  if (isLoadingPages.value || !pagination.value.hasNextPage) return;
  void refreshPages(currentPage.value + 1);
}

function openCreateDialog() {
  if (isSystemSource.value) return;
  createPageName.value = formatPageName(new Date());
  createPageError.value = '';
  isCreateDialogOpen.value = true;
}

function closeCreateDialog() {
  if (isCreatingPage.value) return;
  isCreateDialogOpen.value = false;
}

async function submitCreatePage() {
  if (isSystemSource.value) return;
  const name = createPageName.value.trim();
  const validationMessage = validatePageName(name);

  if (validationMessage) {
    createPageError.value = validationMessage;
    return;
  }

  isCreatingPage.value = true;
  createPageError.value = '';

  try {
    const page = await createPage({
      name,
      blocks: []
    });

    isCreateDialogOpen.value = false;
    emit('page-created', page);
  } catch (error) {
    createPageError.value = error instanceof Error ? error.message : t('pageList.createFailed');
  } finally {
    isCreatingPage.value = false;
  }
}

async function confirmDeletePage(page: MokelayPage) {
  if (isSystemSource.value) return;
  if (isDeletingPageUuid.value) return;

  const pageName = page.name || t('pageList.unnamedPage');
  const confirmed = await $confirm(
    t('pageList.deleteDialogTitle'),
    t('pageList.deleteDialogContent').replace('{name}', pageName)
  );

  if (!confirmed) {
    return;
  }

  await submitDeletePage(page.uuid);
}

async function submitDeletePage(uuid: string) {
  if (isDeletingPageUuid.value) return;

  isDeletingPageUuid.value = uuid;
  pageListError.value = '';

  try {
    const result = await deletePage(uuid);
    pages.value = pages.value.filter((page) => page.uuid !== uuid);

    if (result.affected > 0) {
      const nextPage = pages.value.length > 0 ? currentPage.value : Math.max(currentPage.value - 1, 1);
      void $message('success', t('pageList.deleteSuccess'));
      await refreshPages(nextPage);
      return;
    }

    pageListError.value = t('pageList.deleteNotFound');
    await refreshPages();
  } catch (error) {
    pageListError.value = error instanceof Error ? error.message : t('pageList.deleteFailed');
  } finally {
    isDeletingPageUuid.value = null;
  }
}

function validatePageName(name: string) {
  if (!name) {
    return t('pageList.nameRequired');
  }

  if (name.length > 120) {
    return t('pageList.nameTooLong');
  }

  return '';
}

function createEmptyPagination(page: number): MokelayPagesPagination {
  return {
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasPreviousPage: page > 1,
    hasNextPage: false
  };
}

function normalizePaginationForDisplay(value: MokelayPagesPagination, requestedPage: number): MokelayPagesPagination {
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

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(localeValue.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatPageName(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
</script>

<template>
  <section data-testid="page-list-panel" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Editor</p>
          <h2 class="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{{ t('pageList.title') }}</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {{ pageTotalLabel }}
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <div class="flex rounded-lg border border-slate-300 bg-slate-50 p-1 text-sm dark:border-slate-600 dark:bg-slate-800" role="group" :aria-label="t('pageList.source.label')">
            <button
              data-testid="page-source-user"
              type="button"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="pageSource === 'user' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'"
              :disabled="isLoadingPages"
              @click="changePageSource('user')"
            >
              {{ t('pageList.source.user') }}
            </button>
            <button
              data-testid="page-source-system"
              type="button"
              class="rounded-md px-3 py-1.5 font-medium"
              :class="pageSource === 'system' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'"
              :disabled="isLoadingPages"
              @click="changePageSource('system')"
            >
              {{ t('pageList.source.system') }}
            </button>
          </div>
          <button v-if="!isSystemSource" data-testid="create-page-button" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="openCreateDialog">
            {{ t('pageList.createPage') }}
          </button>
        </div>
      </div>

      <p v-if="pageListError" data-testid="page-list-error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ pageListError }}</p>

      <div class="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3">{{ t('pageList.columns.name') }}</th>
              <th class="px-4 py-3">{{ t('pageList.columns.uuid') }}</th>
              <th class="px-4 py-3">{{ t('pageList.columns.blocks') }}</th>
              <th class="px-4 py-3">{{ t('pageList.columns.createdAt') }}</th>
              <th class="px-4 py-3">{{ t('pageList.columns.updatedAt') }}</th>
              <th class="px-4 py-3 text-right">{{ t('pageList.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-if="isLoadingPages">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">{{ t('pageList.loading') }}</td>
            </tr>
            <tr v-else-if="!pages.length">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">{{ t('pageList.empty') }}</td>
            </tr>
            <template v-else>
              <tr v-for="page in pages" :key="page.uuid" class="bg-white dark:bg-slate-900">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ page.name || t('pageList.unnamedPage') }}</td>
                <td class="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ page.uuid }}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ page.blocks.length }}</td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ formatDate(page.createdAt) }}</td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ formatDate(page.updatedAt) }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2 whitespace-nowrap">
                    <button class="rounded-md px-2 py-1 text-teal-700 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-500/10" @click="emit('open-page', page.uuid, pageSource)">
                      {{ t('pageList.open') }}
                    </button>
                    <button
                      v-if="!isSystemSource"
                      :data-testid="`delete-page-button-${page.uuid}`"
                      class="rounded-md px-2 py-1 text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-200 dark:hover:bg-rose-500/10"
                      :disabled="isDeletingPageUuid !== null"
                      @click="confirmDeletePage(page)"
                    >
                      {{ isDeletingPageUuid === page.uuid ? t('pageList.deleting') : t('pageList.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.total > 0" data-testid="page-list-pagination" class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <p data-testid="page-list-pagination-info">
          {{ pageRangeLabel }} · {{ currentPageLabel }}
        </p>
        <div class="flex items-center gap-2">
          <button
            data-testid="page-list-prev-button"
            type="button"
            class="page-list-secondary-button"
            :disabled="isLoadingPages || !pagination.hasPreviousPage"
            @click="goToPreviousPage"
          >
            {{ t('pageList.previousPage') }}
          </button>
          <button
            data-testid="page-list-next-button"
            type="button"
            class="page-list-secondary-button"
            :disabled="isLoadingPages || !pagination.hasNextPage"
            @click="goToNextPage"
          >
            {{ t('pageList.nextPage') }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="isCreateDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <section class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="create-page-dialog-title">
        <form class="space-y-4" @submit.prevent="submitCreatePage">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Editor</p>
            <h2 id="create-page-dialog-title" class="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              {{ t('pageList.createDialogTitle') }}
            </h2>
          </div>

          <p v-if="createPageError" data-testid="create-page-error" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ createPageError }}</p>

          <label class="page-list-field">
            <span>{{ t('pageList.pageName') }}</span>
            <input v-model="createPageName" data-testid="create-page-name" class="page-list-input" maxlength="120" autofocus>
          </label>

          <div class="flex justify-end gap-2">
            <button type="button" class="page-list-secondary-button" :disabled="isCreatingPage" @click="closeCreateDialog">{{ t('globalCalls.cancel') }}</button>
            <button data-testid="create-page-submit" type="submit" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isCreatingPage">
              {{ isCreatingPage ? t('pageList.creating') : t('pageList.saveAndOpen') }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>
