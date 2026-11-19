<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import {
  getApi,
  getBuiltInApi,
  getApifoxApiDetail,
  listApis,
  listApifoxProjects,
  type ApifoxProjectRecord,
  type MokelayApiRecord,
  type MokelayApiSource
} from '@/utils/apisApi';
import {
  DEFAULT_API_DOMAIN_UUID,
  type ApiDomainRecord,
  getDefaultApiDomainUuid,
  listApiDomains,
  normalizeApiDomainUuid
} from 'mokelay-components/datasource';
import {
  buildDatasourceFromApifoxApi,
  buildDatasourceFromMokelayApi,
  DatasourceApiImportError,
  type ImportedApiDatasource
} from '@/utils/datasourceApiImport';

export type DatasourceApiImportSource = 'mokelay' | 'apifox';

const props = withDefaults(defineProps<{
  open: boolean;
  source: DatasourceApiImportSource;
  currentDomain?: string;
  readonly?: boolean;
}>(), {
  currentDomain: '',
  readonly: false
});

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'imported', value: ImportedApiDatasource): void;
}>();

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const apiDomainOptions = ref<ApiDomainRecord[]>([]);
const apiDomainLoading = ref(false);
const hasLoadedApiDomains = ref(false);
const mokelayApiSource = ref<MokelayApiSource>('user');
const mokelayApiOptionsBySource = ref<Record<MokelayApiSource, MokelayApiRecord[]>>({
  user: [],
  system: []
});
const selectedMokelayApiUuid = ref('');
const apiOptionKey = (api: MokelayApiRecord) => api.source === 'system' && api.assetApp && api.assetApp !== 'mokelay' ? `${api.assetApp}/${api.uuid}` : api.uuid;
const apifoxProjectOptions = ref<ApifoxProjectRecord[]>([]);
const selectedApifoxProjectId = ref('');
const apifoxApiId = ref('');
const apiImportOptionsLoading = ref(false);
const apiImportLoading = ref(false);
const apiImportError = ref('');
const loadedMokelayApiSources = ref<Record<MokelayApiSource, boolean>>({
  user: false,
  system: false
});
const hasLoadedApifoxProjects = ref(false);

const mokelayApiOptions = computed(() => mokelayApiOptionsBySource.value[mokelayApiSource.value]);
const isApiImportBusy = computed(() => apiImportOptionsLoading.value || apiImportLoading.value || apiDomainLoading.value);
const apiImportDialogTitle = computed(() => t(`datasource.import.sources.${props.source}`));
const canImportApi = computed(() => {
  if (props.readonly || isApiImportBusy.value) {
    return false;
  }

  if (props.source === 'mokelay') {
    return Boolean(selectedMokelayApiUuid.value);
  }

  return Boolean(selectedApifoxProjectId.value && apifoxApiId.value.trim());
});

function selectDefaultMokelayApi() {
  if (mokelayApiOptions.value.some((api) => apiOptionKey(api) === selectedMokelayApiUuid.value)) {
    return;
  }

  selectedMokelayApiUuid.value = mokelayApiOptions.value[0] ? apiOptionKey(mokelayApiOptions.value[0]) : '';
}

function selectDefaultApifoxProject() {
  if (apifoxProjectOptions.value.some((project) => project.id === selectedApifoxProjectId.value)) {
    return;
  }

  selectedApifoxProjectId.value = apifoxProjectOptions.value[0]?.id ?? '';
}

function getApiImportErrorMessage(error: unknown) {
  if (error instanceof DatasourceApiImportError) {
    if (error.code === 'unsupportedMethod') {
      return `${t('datasource.import.errors.unsupportedMethod')} ${error.method || ''}`.trim();
    }

    return t(`datasource.import.errors.${error.code}`);
  }

  return error instanceof Error ? error.message : String(error);
}

async function ensureApiDomainOptions(force = false) {
  if (!force && hasLoadedApiDomains.value) {
    return;
  }

  apiDomainLoading.value = true;
  apiImportError.value = '';

  try {
    apiDomainOptions.value = await listApiDomains(force);
    hasLoadedApiDomains.value = true;
  } catch (error) {
    apiImportError.value = error instanceof Error ? error.message : String(error);
  } finally {
    apiDomainLoading.value = false;
  }
}

function getImportApiDomainUuid(hostOrUuid: string) {
  const matchedValue = normalizeApiDomainUuid(hostOrUuid, apiDomainOptions.value);
  if (matchedValue) {
    return matchedValue;
  }

  const trimmedValue = hostOrUuid.trim();
  if (!trimmedValue || /^[a-z][a-z\d+\-.]*:/i.test(trimmedValue) || trimmedValue.startsWith('/')) {
    return '';
  }

  return normalizeApiDomainUuid(`https://${trimmedValue}`, apiDomainOptions.value) ||
    normalizeApiDomainUuid(`http://${trimmedValue}`, apiDomainOptions.value);
}

function getFallbackApifoxApiDomainUuid(importedDomain: string) {
  if (importedDomain.trim()) {
    return '';
  }

  return normalizeApiDomainUuid(props.currentDomain, apiDomainOptions.value) ||
    getDefaultApiDomainUuid(apiDomainOptions.value);
}

async function loadMokelayApiOptions(force = false) {
  const source = mokelayApiSource.value;
  if (apiImportOptionsLoading.value || (!force && loadedMokelayApiSources.value[source])) {
    selectDefaultMokelayApi();
    return;
  }

  apiImportOptionsLoading.value = true;
  apiImportError.value = '';

  try {
    const result = await listApis({ page: 1, pageSize: 100, source, fragment: false });
    mokelayApiOptionsBySource.value = {
      ...mokelayApiOptionsBySource.value,
      [source]: result.apis
    };
    loadedMokelayApiSources.value = {
      ...loadedMokelayApiSources.value,
      [source]: true
    };
    if (mokelayApiSource.value === source) {
      selectDefaultMokelayApi();
    }
  } catch (error) {
    apiImportError.value = error instanceof Error ? error.message : t('datasource.import.errors.loadOptions');
  } finally {
    apiImportOptionsLoading.value = false;
  }
}

async function loadApifoxProjectOptions(force = false) {
  if (apiImportOptionsLoading.value || (!force && hasLoadedApifoxProjects.value)) {
    return;
  }

  apiImportOptionsLoading.value = true;
  apiImportError.value = '';

  try {
    const result = await listApifoxProjects();
    apifoxProjectOptions.value = result.projects;
    hasLoadedApifoxProjects.value = true;
    selectDefaultApifoxProject();
  } catch (error) {
    apiImportError.value = error instanceof Error ? error.message : t('datasource.import.errors.loadOptions');
  } finally {
    apiImportOptionsLoading.value = false;
  }
}

async function ensureApiImportOptions(force = false) {
  if (props.readonly) {
    return;
  }

  if (props.source === 'mokelay') {
    await loadMokelayApiOptions(force);
    return;
  }

  await loadApifoxProjectOptions(force);
}

function refreshApiImportOptions() {
  void ensureApiImportOptions(true);
}

function changeMokelayApiSource(event: Event) {
  if (props.readonly || isApiImportBusy.value) return;

  mokelayApiSource.value = (event.target as HTMLSelectElement).value === 'system' ? 'system' : 'user';
  selectedMokelayApiUuid.value = '';
  apiImportError.value = '';
  void loadMokelayApiOptions();
}

async function importSelectedApi() {
  if (props.readonly || !canImportApi.value) return;

  apiImportLoading.value = true;
  apiImportError.value = '';

  try {
    await ensureApiDomainOptions();

    if (props.source === 'mokelay') {
      const selected = mokelayApiOptions.value.find(api => apiOptionKey(api) === selectedMokelayApiUuid.value);
      if (!selected) throw new Error(t('datasource.import.errors.loadOptions'));
      const api = mokelayApiSource.value === 'system'
        ? await getBuiltInApi(selected.uuid, { assetApp: selected.assetApp })
        : await getApi(selected.uuid);
      const domainUuid = getImportApiDomainUuid(DEFAULT_API_DOMAIN_UUID) || getDefaultApiDomainUuid(apiDomainOptions.value);
      if (!domainUuid) {
        throw new Error(t('datasource.import.errors.apiDomainNotFound'));
      }

      emit('imported', buildDatasourceFromMokelayApi(api, domainUuid));
      emit('close');
      return;
    }

    const result = await getApifoxApiDetail({
      projectId: selectedApifoxProjectId.value,
      apiId: apifoxApiId.value.trim()
    });
    const imported = buildDatasourceFromApifoxApi(result, apifoxApiId.value.trim());
    const domainUuid = getImportApiDomainUuid(imported.datasource.domain) ||
      getFallbackApifoxApiDomainUuid(imported.datasource.domain);
    if (!domainUuid) {
      throw new Error(t('datasource.import.errors.apiDomainNotFound'));
    }

    emit('imported', {
      ...imported,
      datasource: {
        ...imported.datasource,
        domain: domainUuid
      }
    });
    emit('close');
  } catch (error) {
    apiImportError.value = getApiImportErrorMessage(error);
  } finally {
    apiImportLoading.value = false;
  }
}

function closeDialog() {
  emit('close');
}

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      if (dialogRef.value?.open) {
        dialogRef.value.close();
      }
      return;
    }

    apiImportError.value = '';
    await nextTick();
    if (!dialogRef.value?.open) {
      dialogRef.value?.showModal();
    }
    void ensureApiImportOptions();
  },
  { immediate: true }
);

watch(
  () => props.source,
  () => {
    apiImportError.value = '';
    if (props.open) {
      void ensureApiImportOptions();
    }
  }
);
</script>

<template>
  <dialog
    ref="dialogRef"
    class="ce-datasource-tool__import-dialog mk-form-dialog"
    data-testid="datasource-api-import-dialog"
    :aria-hidden="!open"
    aria-labelledby="datasource-api-import-dialog-title"
    @close="emit('close')"
  >
    <div class="ce-datasource-tool__import-dialog-panel mk-form-dialog-panel">
      <div class="ce-datasource-tool__import-dialog-header mk-form-dialog-header">
        <h3
          id="datasource-api-import-dialog-title"
          class="ce-datasource-tool__import-dialog-title"
          data-testid="datasource-api-import-dialog-title"
        >
          {{ apiImportDialogTitle }}
        </h3>
        <button
          class="ce-datasource-tool__import-dialog-close mk-form-button"
          type="button"
          data-testid="datasource-api-import-dialog-close"
          @click="closeDialog"
        >
          {{ t('editor.close') }}
        </button>
      </div>

      <div class="ce-datasource-tool__import-dialog-body mk-form-dialog-body mk-form-scope">
        <template v-if="source === 'mokelay'">
          <label class="ce-datasource-tool__field mk-form-field">
            <span class="ce-datasource-tool__label mk-form-label">{{ t('datasource.fields.apiSource') }}</span>
            <select
              class="ce-datasource-tool__input mk-form-control"
              data-testid="datasource-import-mokelay-source"
              :disabled="isApiImportBusy"
              :value="mokelayApiSource"
              @change="changeMokelayApiSource"
            >
              <option value="user">{{ t('datasource.import.apiSources.user') }}</option>
              <option value="system">{{ t('datasource.import.apiSources.system') }}</option>
            </select>
          </label>
          <label class="ce-datasource-tool__field mk-form-field">
            <span class="ce-datasource-tool__label mk-form-label">{{ t('datasource.fields.mokelayApi') }}</span>
            <select
              class="ce-datasource-tool__input mk-form-control"
              data-testid="datasource-import-mokelay-api"
              :disabled="isApiImportBusy || !mokelayApiOptions.length"
              :value="selectedMokelayApiUuid"
              @change="selectedMokelayApiUuid = ($event.target as HTMLSelectElement).value"
            >
              <option v-if="!mokelayApiOptions.length" value="">
                {{ t('datasource.import.emptyMokelayApis') }}
              </option>
              <option v-for="api in mokelayApiOptions" :key="apiOptionKey(api)" :value="apiOptionKey(api)">
                {{ api.name }} ({{ api.method }}) · {{ api.assetApp ?? 'mokelay' }}
              </option>
            </select>
          </label>
        </template>
        <template v-else>
          <label class="ce-datasource-tool__field mk-form-field">
            <span class="ce-datasource-tool__label mk-form-label">{{ t('datasource.fields.apifoxProject') }}</span>
            <select
              class="ce-datasource-tool__input mk-form-control"
              data-testid="datasource-import-apifox-project"
              :disabled="isApiImportBusy || !apifoxProjectOptions.length"
              :value="selectedApifoxProjectId"
              @change="selectedApifoxProjectId = ($event.target as HTMLSelectElement).value"
            >
              <option v-if="!apifoxProjectOptions.length" value="">
                {{ t('datasource.import.emptyApifoxProjects') }}
              </option>
              <option v-for="project in apifoxProjectOptions" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </label>
          <label class="ce-datasource-tool__field mk-form-field">
            <span class="ce-datasource-tool__label mk-form-label">{{ t('datasource.fields.apifoxApiId') }}</span>
            <input
              class="ce-datasource-tool__input mk-form-control"
              data-testid="datasource-import-apifox-api-id"
              type="text"
              :readonly="isApiImportBusy"
              :placeholder="t('datasource.import.placeholders.apifoxApiId')"
              :value="apifoxApiId"
              @input="apifoxApiId = ($event.target as HTMLInputElement).value"
              @keydown.stop
            />
          </label>
        </template>
        <p v-if="apiImportError" class="ce-datasource-tool__error" data-testid="datasource-import-error">
          {{ apiImportError }}
        </p>
      </div>

      <div class="ce-datasource-tool__import-dialog-actions mk-form-dialog-footer">
        <button
          class="ce-datasource-tool__action mk-form-button"
          type="button"
          data-testid="datasource-import-refresh"
          :disabled="isApiImportBusy"
          @click="refreshApiImportOptions"
        >
          {{ apiImportOptionsLoading ? t('datasource.actions.refreshing') : t('datasource.actions.refresh') }}
        </button>
        <button
          class="ce-datasource-tool__schema-button mk-form-button"
          type="button"
          data-testid="datasource-import-apply"
          :disabled="!canImportApi"
          @click="importSelectedApi"
        >
          {{ apiImportLoading ? t('datasource.actions.importingApi') : t('datasource.actions.importApi') }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.ce-datasource-tool__import-dialog-panel {
  overflow: hidden;
}

.ce-datasource-tool__import-dialog-header,
.ce-datasource-tool__import-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ce-datasource-tool__import-dialog-actions {
  justify-content: flex-end;
}

.ce-datasource-tool__import-dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 700;
}

.ce-datasource-tool__import-dialog-close,
.ce-datasource-tool__action,
.ce-datasource-tool__schema-button {
  cursor: pointer;
}

.ce-datasource-tool__action:disabled,
.ce-datasource-tool__schema-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ce-datasource-tool__import-dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--mk-form-field-gap);
}

.ce-datasource-tool__error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 12px;
  font-weight: 650;
}

.dark .ce-datasource-tool__import-dialog-title {
  color: rgb(226 232 240);
}
</style>
