import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  createOrchestrationApi,
  getDatabaseSchema,
  getOrchestrationApi,
  listDatasources,
  publishOrchestrationApi,
  rollbackOrchestrationApi,
  saveOrchestrationApiDraft,
  testOrchestrationApi
} from '@/api-builder/api';
import { createBlock } from '@/api-builder/registries';
import { applyRequestParameterDrafts, cloneValue, createEmptyApiJson, getRequestParameterDrafts, normalizeApiJson } from '@/api-builder/json';
import { hasBlockingIssues, hasDangerousIssues, validateApiJson } from '@/api-builder/validator';
import type { ApiBlock, ApiDetail, ApiJson, BlockFunctionName, DatabaseTableSchema, RequestParameterDraft, TestRequestDraft } from '@/api-builder/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useApiBuilderStore = defineStore('apiBuilder', () => {
  const detail = ref<ApiDetail | null>(null);
  const apiJson = ref<ApiJson>(createEmptyApiJson());
  const parameters = ref<RequestParameterDraft[]>([]);
  const selectedBlockUuid = ref<string | null>(null);
  const selectedPanel = ref<'api' | 'request' | 'block' | 'response'>('api');
  const datasources = ref<string[]>([]);
  const tables = ref<DatabaseTableSchema[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isTesting = ref(false);
  const error = ref('');
  const testResult = ref<unknown>(null);
  const testRequest = ref<TestRequestDraft>({ header: {}, query: {}, body: {} });

  const validationIssues = computed(() => validateApiJson(generatedApiJson.value));
  const hasErrors = computed(() => hasBlockingIssues(validationIssues.value));
  const hasDanger = computed(() => hasDangerousIssues(validationIssues.value));
  const blocks = computed(() => apiJson.value.blocks ?? []);
  const selectedBlock = computed(() => blocks.value.find((block) => block.uuid === selectedBlockUuid.value) ?? null);
  const generatedApiJson = computed(() => applyRequestParameterDrafts(apiJson.value, parameters.value));

  function setApiJson(value: ApiJson) {
    apiJson.value = normalizeApiJson(value);
    parameters.value = getRequestParameterDrafts(apiJson.value);
    selectedBlockUuid.value = apiJson.value.blocks?.[0]?.uuid ?? null;
    selectedPanel.value = selectedBlockUuid.value ? 'block' : 'api';
  }

  function startNew(uuid = 'new_api') {
    detail.value = null;
    setApiJson(createEmptyApiJson(uuid));
  }

  async function load(uuid: string) {
    isLoading.value = true;
    error.value = '';
    try {
      const api = await getOrchestrationApi(uuid);
      detail.value = api;
      setApiJson(api.draftJson ?? api.publishedJson ?? createEmptyApiJson(uuid));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'API 读取失败。';
      startNew(uuid);
    } finally {
      isLoading.value = false;
    }
  }

  async function createFromCurrent() {
    isSaving.value = true;
    error.value = '';
    try {
      const api = await createOrchestrationApi({
        uuid: generatedApiJson.value.uuid,
        alias: generatedApiJson.value.alias,
        method: generatedApiJson.value.method,
        apiJson: generatedApiJson.value
      });
      detail.value = api;
      setApiJson(api.draftJson);
      return api;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'API 创建失败。';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function saveDraft() {
    isSaving.value = true;
    error.value = '';
    try {
      const api = await saveOrchestrationApiDraft(generatedApiJson.value.uuid, generatedApiJson.value, { apiJson: generatedApiJson.value });
      detail.value = api;
      setApiJson(api.draftJson);
      return api;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '草稿保存失败。';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function publish(changeNote = '') {
    isSaving.value = true;
    error.value = '';
    try {
      const api = await publishOrchestrationApi(generatedApiJson.value.uuid, generatedApiJson.value, { apiJson: generatedApiJson.value }, {
        changeNote,
        dangerAccepted: hasDanger.value
      });
      detail.value = api;
      setApiJson(api.draftJson);
      return api;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发布失败。';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function rollback(version: number) {
    isSaving.value = true;
    error.value = '';
    try {
      const api = await rollbackOrchestrationApi(generatedApiJson.value.uuid, version);
      detail.value = api;
      setApiJson(api.draftJson);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '回滚失败。';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function runTest() {
    isTesting.value = true;
    error.value = '';
    try {
      testResult.value = await testOrchestrationApi(generatedApiJson.value.uuid, generatedApiJson.value, testRequest.value, hasDanger.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '测试失败。';
      testResult.value = null;
    } finally {
      isTesting.value = false;
    }
  }

  async function loadDatasourcesAndSchema(datasource?: string) {
    try {
      const [nextDatasources, nextTables] = await Promise.all([
        listDatasources(),
        getDatabaseSchema(datasource)
      ]);
      datasources.value = nextDatasources.length ? nextDatasources : ['Mokelay'];
      tables.value = nextTables;
    } catch {
      datasources.value = ['Mokelay'];
      tables.value = [];
    }
  }

  function updateRoot(patch: Partial<ApiJson>) {
    apiJson.value = normalizeApiJson({ ...apiJson.value, ...patch });
  }

  function addParameter(location: RequestParameterDraft['location']) {
    parameters.value.push({
      id: nextId(location),
      location,
      key: '',
      required: false,
      processors: [],
      example: '',
      description: ''
    });
    selectedPanel.value = 'request';
  }

  function removeParameter(id: string) {
    parameters.value = parameters.value.filter((parameter) => parameter.id !== id);
  }

  function addBlock(functionName: BlockFunctionName) {
    const block = createBlock(functionName, blocks.value.length);
    apiJson.value.blocks = [...blocks.value, block];
    selectedBlockUuid.value = block.uuid;
    selectedPanel.value = 'block';
  }

  function updateBlock(uuid: string, patch: Partial<ApiBlock>) {
    apiJson.value.blocks = blocks.value.map((block) => block.uuid === uuid ? { ...block, ...patch } : block);
  }

  function updateSelectedBlockInputs(patch: Record<string, unknown>) {
    const block = selectedBlock.value;
    if (!block) return;
    updateBlock(block.uuid, { inputs: { ...(isRecord(block.inputs) ? block.inputs : {}), ...patch } });
  }

  function removeBlock(uuid: string) {
    apiJson.value.blocks = blocks.value.filter((block) => block.uuid !== uuid);
    if (selectedBlockUuid.value === uuid) {
      selectedBlockUuid.value = apiJson.value.blocks[0]?.uuid ?? null;
    }
  }

  function moveBlocks(nextBlocks: ApiBlock[]) {
    apiJson.value.blocks = nextBlocks.map((block) => cloneValue(block));
  }

  function selectBlock(uuid: string) {
    selectedBlockUuid.value = uuid;
    selectedPanel.value = 'block';
  }

  function setResponseFromText(value: string) {
    try {
      const parsed = JSON.parse(value) as unknown;
      apiJson.value.response = isRecord(parsed) ? parsed : null;
    } catch {
      apiJson.value.response = null;
    }
  }

  return {
    detail,
    apiJson,
    parameters,
    selectedBlockUuid,
    selectedPanel,
    selectedBlock,
    blocks,
    datasources,
    tables,
    isLoading,
    isSaving,
    isTesting,
    error,
    testResult,
    testRequest,
    generatedApiJson,
    validationIssues,
    hasErrors,
    hasDanger,
    startNew,
    load,
    createFromCurrent,
    saveDraft,
    publish,
    rollback,
    runTest,
    loadDatasourcesAndSchema,
    updateRoot,
    addParameter,
    removeParameter,
    addBlock,
    updateBlock,
    updateSelectedBlockInputs,
    removeBlock,
    moveBlocks,
    selectBlock,
    setResponseFromText
  };
});
