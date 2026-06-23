<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from '@/i18n';
import { $message } from '@/utils/globalCalls';
import {
  createDatasource,
  listDatasources,
  syncDatasourceSchema,
  updateDatasource,
  type MokelayDatasource,
  type MokelayDatasourcesPagination
} from '@/utils/datasourcesApi';

const PAGE_SIZE = 10;

const { t } = useI18n();
const datasources = ref<MokelayDatasource[]>([]);
const isLoading = ref(false);
const listError = ref('');
const currentPage = ref(1);
const pagination = ref<MokelayDatasourcesPagination>(createEmptyPagination(1));
const isDialogOpen = ref(false);
const editingDatasource = ref<MokelayDatasource | null>(null);
const formUuid = ref('');
const formAlias = ref('');
const formDescription = ref('');
const formError = ref('');
const isSaving = ref(false);
const syncingUuids = ref<Set<string>>(new Set());
const schemaDetailsDatasource = ref<MokelayDatasource | null>(null);
let loadRequestId = 0;

const totalLabel = computed(() => t('datasourceList.total').replace('{count}', String(pagination.value.total)));
const rangeLabel = computed(() => {
  if (pagination.value.total <= 0) return t('datasourceList.pageRangeEmpty');
  const start = (pagination.value.page - 1) * pagination.value.pageSize + 1;
  const end = Math.min(start + datasources.value.length - 1, pagination.value.total);
  return t('datasourceList.pageRange')
    .replace('{start}', String(start))
    .replace('{end}', String(end))
    .replace('{total}', String(pagination.value.total));
});
const currentPageLabel = computed(() => t('datasourceList.currentPage')
  .replace('{page}', String(pagination.value.page))
  .replace('{totalPages}', String(Math.max(pagination.value.totalPages, 1))));
const dialogTitle = computed(() => editingDatasource.value
  ? t('datasourceList.editDialogTitle')
  : t('datasourceList.createDialogTitle'));
const schemaDetailsTitle = computed(() => {
  const datasource = schemaDetailsDatasource.value;
  return t('datasourceList.schemaDetailsTitle')
    .replace('{alias}', datasource?.alias || datasource?.uuid || '');
});
const schemaDetailsSummary = computed(() => {
  const tables = schemaDetailsDatasource.value?.schemaData ?? [];
  const columnCount = tables.reduce((total, table) => total + table.columns.length, 0);
  return t('datasourceList.schemaDetailsSummary')
    .replace('{tables}', String(tables.length))
    .replace('{columns}', String(columnCount));
});

onMounted(() => {
  void refreshDatasources();
});

async function refreshDatasources(pageNumber = currentPage.value) {
  const normalizedPage = Math.max(1, Math.floor(pageNumber));
  const requestId = ++loadRequestId;
  isLoading.value = true;
  listError.value = '';

  try {
    const result = await listDatasources({ page: normalizedPage, pageSize: PAGE_SIZE });
    if (requestId !== loadRequestId) return;
    datasources.value = result.datasources;
    pagination.value = normalizePaginationForDisplay(result.pagination, normalizedPage);
    currentPage.value = pagination.value.page;
  } catch (error) {
    if (requestId !== loadRequestId) return;
    listError.value = error instanceof Error ? error.message : t('datasourceList.loadFailed');
  } finally {
    if (requestId === loadRequestId) isLoading.value = false;
  }
}

function openCreateDialog() {
  editingDatasource.value = null;
  formUuid.value = '';
  formAlias.value = '';
  formDescription.value = '';
  formError.value = '';
  isDialogOpen.value = true;
}

function openEditDialog(datasource: MokelayDatasource) {
  editingDatasource.value = datasource;
  formUuid.value = datasource.uuid;
  formAlias.value = datasource.alias;
  formDescription.value = datasource.description;
  formError.value = '';
  isDialogOpen.value = true;
}

function closeDialog() {
  if (isSaving.value) return;
  isDialogOpen.value = false;
}

function openSchemaDetails(datasource: MokelayDatasource) {
  schemaDetailsDatasource.value = datasource;
}

function closeSchemaDetails() {
  schemaDetailsDatasource.value = null;
}

async function submitDatasource() {
  const uuid = formUuid.value.trim();
  const alias = formAlias.value.trim();
  const description = formDescription.value.trim();
  const validationMessage = validateUuid(uuid) || validateAlias(alias);

  if (validationMessage) {
    formError.value = validationMessage;
    return;
  }

  isSaving.value = true;
  formError.value = '';

  try {
    if (editingDatasource.value) {
      const updated = await updateDatasource(editingDatasource.value.uuid, { alias, description });
      replaceDatasource(updated);
      void $message('success', t('datasourceList.updateSuccess'));
    } else {
      await createDatasource({ uuid, alias, description });
      void $message('success', t('datasourceList.createSuccess'));
      await refreshDatasources(1);
    }
    isDialogOpen.value = false;
  } catch (error) {
    formError.value = error instanceof Error
      ? error.message
      : editingDatasource.value ? t('datasourceList.updateFailed') : t('datasourceList.createFailed');
  } finally {
    isSaving.value = false;
  }
}

async function syncSchema(datasource: MokelayDatasource) {
  if (syncingUuids.value.has(datasource.uuid)) return;
  syncingUuids.value = new Set(syncingUuids.value).add(datasource.uuid);
  listError.value = '';

  try {
    const updated = await syncDatasourceSchema(datasource.uuid);
    replaceDatasource(updated);
    void $message('success', t('datasourceList.syncSuccess'));
  } catch (error) {
    listError.value = error instanceof Error ? error.message : t('datasourceList.syncFailed');
  } finally {
    const nextSyncingUuids = new Set(syncingUuids.value);
    nextSyncingUuids.delete(datasource.uuid);
    syncingUuids.value = nextSyncingUuids;
  }
}

function replaceDatasource(updated: MokelayDatasource) {
  datasources.value = datasources.value.map((datasource) => (
    datasource.uuid === updated.uuid ? updated : datasource
  ));

  if (schemaDetailsDatasource.value?.uuid === updated.uuid) {
    schemaDetailsDatasource.value = updated;
  }
}

function schemaLabel(datasource: MokelayDatasource) {
  return datasource.schemaData.length
    ? t('datasourceList.schemaTables').replace('{count}', String(datasource.schemaData.length))
    : t('datasourceList.schemaNotSynced');
}

function schemaFieldsLabel(count: number) {
  return t('datasourceList.schemaFields').replace('{count}', String(count));
}

function validateAlias(alias: string) {
  if (!alias) return t('datasourceList.aliasRequired');
  if (alias.length > 120) return t('datasourceList.aliasTooLong');
  return '';
}

function validateUuid(uuid: string) {
  if (!uuid) return t('datasourceList.uuidRequired');
  if (uuid.length > 8) return t('datasourceList.uuidTooLong');
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(uuid)) return t('datasourceList.uuidInvalid');
  return '';
}

function goToPreviousPage() {
  if (!isLoading.value && pagination.value.hasPreviousPage) void refreshDatasources(currentPage.value - 1);
}

function goToNextPage() {
  if (!isLoading.value && pagination.value.hasNextPage) void refreshDatasources(currentPage.value + 1);
}

function createEmptyPagination(page: number): MokelayDatasourcesPagination {
  return { page, pageSize: PAGE_SIZE, total: 0, totalPages: 0, hasPreviousPage: page > 1, hasNextPage: false };
}

function normalizePaginationForDisplay(value: MokelayDatasourcesPagination, requestedPage: number): MokelayDatasourcesPagination {
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
  <section data-testid="datasource-list-panel" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Editor</p>
          <h2 class="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{{ t('datasourceList.title') }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ totalLabel }}</p>
        </div>
        <button data-testid="create-datasource-button" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="openCreateDialog">
          {{ t('datasourceList.createDatasource') }}
        </button>
      </div>

      <p v-if="listError" data-testid="datasource-list-error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ listError }}</p>

      <div class="mt-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3">{{ t('datasourceList.columns.id') }}</th>
              <th class="px-4 py-3">{{ t('datasourceList.columns.uuid') }}</th>
              <th class="px-4 py-3">{{ t('datasourceList.columns.alias') }}</th>
              <th class="px-4 py-3">{{ t('datasourceList.columns.description') }}</th>
              <th class="px-4 py-3">{{ t('datasourceList.columns.schema') }}</th>
              <th class="px-4 py-3 text-right">{{ t('datasourceList.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-if="isLoading">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">{{ t('datasourceList.loading') }}</td>
            </tr>
            <tr v-else-if="!datasources.length">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">{{ t('datasourceList.empty') }}</td>
            </tr>
            <tr v-for="datasource in datasources" v-else :key="datasource.uuid" class="bg-white dark:bg-slate-900">
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ datasource.id }}</td>
              <td class="px-4 py-3"><code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ datasource.uuid }}</code></td>
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ datasource.alias }}</td>
              <td class="max-w-xl px-4 py-3 text-slate-600 dark:text-slate-300"><span class="line-clamp-2">{{ datasource.description || '-' }}</span></td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ schemaLabel(datasource) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2 whitespace-nowrap">
                  <button :data-testid="`edit-datasource-button-${datasource.uuid}`" class="rounded-md px-2 py-1 text-teal-700 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-500/10" @click="openEditDialog(datasource)">
                    {{ t('datasourceList.edit') }}
                  </button>
                  <button :data-testid="`schema-details-button-${datasource.uuid}`" class="rounded-md px-2 py-1 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" @click="openSchemaDetails(datasource)">
                    {{ t('datasourceList.schemaDetails') }}
                  </button>
                  <button
                    :data-testid="`sync-datasource-button-${datasource.uuid}`"
                    class="rounded-md px-2 py-1 text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-indigo-200 dark:hover:bg-indigo-500/10"
                    :disabled="syncingUuids.has(datasource.uuid)"
                    @click="syncSchema(datasource)"
                  >
                    {{ syncingUuids.has(datasource.uuid) ? t('datasourceList.syncing') : t('datasourceList.syncSchema') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.total > 0" data-testid="datasource-list-pagination" class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <p data-testid="datasource-list-pagination-info">{{ rangeLabel }} · {{ currentPageLabel }}</p>
        <div class="flex items-center gap-2">
          <button data-testid="datasource-list-prev-button" class="page-list-secondary-button" :disabled="isLoading || !pagination.hasPreviousPage" @click="goToPreviousPage">{{ t('datasourceList.previousPage') }}</button>
          <button data-testid="datasource-list-next-button" class="page-list-secondary-button" :disabled="isLoading || !pagination.hasNextPage" @click="goToNextPage">{{ t('datasourceList.nextPage') }}</button>
        </div>
      </div>
    </section>

    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="datasource-dialog-title">
        <form class="flex flex-col gap-4" @submit.prevent="submitDatasource">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Datasource</p>
            <h2 id="datasource-dialog-title" class="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{{ dialogTitle }}</h2>
          </div>
          <p v-if="formError" data-testid="datasource-form-error" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ formError }}</p>
          <label class="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{{ t('datasourceList.datasourceUuid') }}</span>
            <input
              v-model="formUuid"
              data-testid="datasource-uuid"
              class="page-list-input disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-800"
              maxlength="8"
              required
              :disabled="editingDatasource !== null"
              :autofocus="editingDatasource === null"
            >
            <small class="font-normal text-slate-500 dark:text-slate-400">{{ t('datasourceList.uuidHint') }}</small>
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{{ t('datasourceList.datasourceAlias') }}</span>
            <input v-model="formAlias" data-testid="datasource-alias" class="page-list-input" maxlength="120" required :autofocus="editingDatasource !== null">
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{{ t('datasourceList.datasourceDescription') }}</span>
            <textarea v-model="formDescription" data-testid="datasource-description" class="page-list-input min-h-24 resize-y"></textarea>
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800" @click="closeDialog">{{ t('globalCalls.cancel') }}</button>
            <button data-testid="datasource-submit" type="submit" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSaving">
              {{ isSaving ? t('datasourceList.saving') : t('datasourceList.save') }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="schemaDetailsDatasource" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="closeSchemaDetails">
      <section class="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="datasource-schema-dialog-title">
        <header class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Datasource</p>
            <h2 id="datasource-schema-dialog-title" class="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{{ schemaDetailsTitle }}</h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ schemaDetailsSummary }}</p>
          </div>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800" @click="closeSchemaDetails">
            {{ t('editor.close') }}
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto p-5">
          <p v-if="!schemaDetailsDatasource.schemaData.length" data-testid="schema-details-empty" class="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {{ t('datasourceList.schemaEmpty') }}
          </p>
          <div v-else class="grid gap-4">
            <section
              v-for="table in schemaDetailsDatasource.schemaData"
              :key="table.name"
              class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            >
              <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                <h3 class="font-mono text-sm font-semibold text-slate-950 dark:text-white">{{ table.name }}</h3>
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ schemaFieldsLabel(table.columns.length) }}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead class="bg-white text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    <tr>
                      <th class="px-4 py-3">{{ t('datasourceList.schemaColumns.name') }}</th>
                      <th class="px-4 py-3">{{ t('datasourceList.schemaColumns.type') }}</th>
                      <th class="px-4 py-3">{{ t('datasourceList.schemaColumns.dataType') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr v-for="column in table.columns" :key="`${table.name}-${column.name}`">
                      <td class="px-4 py-3 font-mono text-slate-900 dark:text-slate-100">{{ column.name }}</td>
                      <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ column.type }}</td>
                      <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ column.dataType }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
