<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import {
  MarkerType,
  useVueFlow,
  type Connection,
  type Edge,
  type Node
} from '@vue-flow/core';
import { runDryApiTest, createRequestSnapshot } from '@/api-builder/dryRun';
import {
  blockDefinitions,
  cloneValue,
  collectResponseTerminals,
  controllerDefinitions,
  conditionTypes,
  createBlock,
  createController,
  createEmptyApiJson,
  createEmptyFragmentJson,
  createStarterBlock,
  declarationKey,
  getBlockDefinition,
  getControllerDefinition,
  getProcessorDefinition,
  hasDefaultResponse,
  isControllerBlock,
  isEndpointApiJson,
  isFragmentApiJson,
  isStandardBlock,
  isStarterBlock,
  processorDefinitions,
  processorName,
  requestLocations
} from '@/api-builder/registry';
import {
  appendTestCase,
  createDraft,
  duplicateDraft,
  generateApiJson,
  normalizeApiBuilderLayout,
} from '@/api-builder/store';
import { hasBlockingErrors, hasDangerWarnings, validateApiJson } from '@/api-builder/validation';
import { buildVariableOptions, makeTemplate } from '@/api-builder/variables';
import MApiOrchestrationEditorBlock from '@/api-builder/MApiOrchestrationEditorBlock.vue';
import MApiOrchestrationFlowCanvas from '@/api-builder/MApiOrchestrationFlowCanvas.vue';
import {
  deleteApi,
  getApi,
  getApiBySource,
  getBuiltInApi,
  listApis,
  listApiBuilderSamples,
  saveApi,
  type MokelayApiRecord,
  type MokelayApiSource,
  type ApiBuilderSampleRecord
} from '@/utils/apisApi';
import type {
  ApiBlock,
  ApiBuilderDraft,
  ApiBuilderLayout,
  ApiBuilderNodePosition,
  ApiJson,
  ApiController,
  ApiStandardBlock,
  BlockFunctionName,
  BuilderSelection,
  CascadeDeleteCollect,
  CascadeDeleteLimits,
  CascadeDeleteRelation,
  CascadeDeleteRoot,
  Condition,
  ControllerFunctionName,
  ControllerNode,
  DryRunResult,
  ExecutableApiBlock,
  OrderBy,
  ProcessableKey,
  ProcessorConfig,
  RequestLocation,
  RequestSnapshot,
  ResponseConfig,
  ValidationIssue
} from '@/api-builder/types';

type ApiBuilderShellProps = {
  routeUuid?: string | null;
  routeSource?: MokelayApiSource;
  routeFragment?: boolean;
};

const props = withDefaults(defineProps<ApiBuilderShellProps>(), {
  routeUuid: '',
  routeSource: 'user',
  routeFragment: false
});

const editorRoot = ref<HTMLElement | null>(null);
const flowId = `api-builder-flow-${Math.random().toString(36).slice(2, 10)}`;

const drafts = ref<ApiBuilderDraft[]>([]);
const activeDraftId = ref(props.routeUuid || '');
const selection = ref<BuilderSelection>({ type: 'api' });
const bottomTab = ref<'json' | 'validation' | 'test'>('json');
const draggedBlockUuid = ref('');
const apiBuilderError = ref('');
const isApiDetailLoading = ref(false);
const isSavingApi = ref(false);
const isApiInfoDialogOpen = ref(false);
const isSavingApiInfo = ref(false);
const apiInfoSourceJson = ref<ApiJson | null>(null);
const apiInfoSourceLayout = ref<ApiBuilderLayout | null>(null);
const apiInfoError = ref('');
const apiInfoDialogMode = ref<'create' | 'copy'>('copy');
const apiList = ref<MokelayApiRecord[]>([]);
const apiSamples = ref<ApiBuilderSampleRecord[]>([]);
const apiListSource = ref<MokelayApiSource>(props.routeSource);
const isApiListLoading = ref(false);
const serverDraftIds = ref(new Set<string>());
const selectedResponseTerminalUuid = ref('');
const testRequest = ref<RequestSnapshot>({ header: {}, query: {}, body: {}, params: {} });
const lastTestResult = ref<DryRunResult | null>(null);
const fragmentOptionsBySource = ref<Record<MokelayApiSource, MokelayApiRecord[]>>({
  user: [],
  system: []
});
const fragmentDetails = ref(new Map<string, MokelayApiRecord>());
const fragmentLoadingBySource = ref<Record<MokelayApiSource, boolean>>({
  user: false,
  system: false
});
const isFragmentEditorOpen = ref(false);
const isSavingFragment = ref(false);
const fragmentEditorError = ref('');
const fragmentEditorDraft = ref<ApiBuilderDraft | null>(null);
const fragmentEditorOriginalUuid = ref('');
const fragmentEditorRef = ref<InstanceType<typeof MApiOrchestrationEditorBlock> | null>(null);
const apiInfoForm = reactive({
  name: '',
  uuid: '',
  method: 'GET'
});

const activeDraft = computed(() => drafts.value.find((draft) => draft.id === activeDraftId.value) ?? null);
const isListMode = computed(() => !props.routeUuid);
const activeApiJson = computed(() => activeDraft.value ? generateApiJson(activeDraft.value) : null);
const validationIssues = computed(() => activeApiJson.value ? validateApiJson(activeApiJson.value) : []);
const activeBlocks = computed(() => activeDraft.value?.apiJson.blocks ?? []);
const starterBlock = computed(() => activeBlocks.value.find(isStarterBlock) ?? null);
const executableBlocks = computed(() => activeBlocks.value.filter((block): block is ExecutableApiBlock => !isStarterBlock(block)));
const activeBlock = computed(() => {
  const currentSelection = selection.value;
  if (!activeDraft.value || currentSelection.type !== 'block') return null;
  const block = activeDraft.value.apiJson.blocks?.find((item) => item.uuid === currentSelection.uuid);
  return block && !isStarterBlock(block) ? block : null;
});
const activeStandardBlock = computed(() => activeBlock.value && isStandardBlock(activeBlock.value) ? activeBlock.value : null);
const activeExecuteFragmentBlock = computed(() => activeStandardBlock.value?.functionName === 'executeFragment'
  ? activeStandardBlock.value
  : null);
const activeFragmentSource = computed<MokelayApiSource>(() => activeDraft.value?.source ?? 'user');
const fragmentOptions = computed(() => fragmentOptionsBySource.value[activeFragmentSource.value]);
const isLoadingFragments = computed(() => fragmentLoadingBySource.value[activeFragmentSource.value]);
const selectedFragmentUuid = computed(() => {
  const value = activeExecuteFragmentBlock.value?.inputs?.fragmentUuid;
  return typeof value === 'string' ? value : '';
});
const selectedFragmentParams = computed(() => {
  const record = fragmentDetails.value.get(fragmentDetailKey(activeFragmentSource.value, selectedFragmentUuid.value))
    ?? fragmentOptions.value.find((item) => item.uuid === selectedFragmentUuid.value);
  return record?.apiJson && isFragmentApiJson(record.apiJson) ? record.apiJson.params ?? [] : [];
});
const activeController = computed(() => activeBlock.value && isControllerBlock(activeBlock.value) ? activeBlock.value : null);
const responseTerminals = computed(() => activeDraft.value ? collectResponseTerminals(activeDraft.value.apiJson) : []);
const usesTerminalResponses = computed(() => Boolean(activeDraft.value?.apiJson.responses) || responseTerminals.value.length > 1);
const variableOptions = computed(() => {
  if (!activeDraft.value) return [];
  const beforeBlockUuid = selection.value.type === 'block' ? selection.value.uuid : undefined;
  return buildVariableOptions(activeDraft.value.apiJson, beforeBlockUuid);
});
const isActiveApiReadonly = computed(() => activeDraft.value?.source === 'system');
const isActiveFragment = computed(() => Boolean(activeDraft.value && isFragmentApiJson(activeDraft.value.apiJson)));
const groupedBlocks = computed(() => ({
  query: blockDefinitions.filter((definition) => definition.group === 'query'),
  write: blockDefinitions.filter((definition) => definition.group === 'write'),
  session: blockDefinitions.filter((definition) => definition.group === 'session'),
  utility: blockDefinitions.filter((definition) => definition.group === 'utility'),
  fragment: blockDefinitions.filter((definition) => definition.group === 'fragment')
}));
const groupedControllers = computed(() => controllerDefinitions);
const graphNodes = computed<Node[]>(() => buildGraphNodes());
const graphEdges = computed<Edge[]>(() => buildGraphEdges());
const { fitView } = useVueFlow(flowId);
const apiUuidPattern = /^[A-Za-z0-9_-]{1,128}$/;
let apiDetailRequestId = 0;

watch(
  () => [props.routeUuid, props.routeSource, props.routeFragment] as const,
  ([uuid, source, fragment]) => {
    if (!uuid) {
      apiDetailRequestId += 1;
      activeDraftId.value = '';
      apiBuilderError.value = '';
      isApiDetailLoading.value = false;
      apiListSource.value = source;
      void loadApiList(source);
      return;
    }
    activeDraftId.value = uuid;
    selection.value = { type: 'api' };
    void loadApiDetail(uuid, source, fragment);
  },
  { immediate: true }
);

watch(
  activeDraft,
  (draft) => {
    if (!draft) {
      lastTestResult.value = null;
      return;
    }
    testRequest.value = createRequestSnapshot(generateApiJson(draft), testRequest.value);
  },
  { immediate: true }
);

watch(
  responseTerminals,
  (terminals) => {
    if (!terminals.length) {
      selectedResponseTerminalUuid.value = '';
      return;
    }
    if (!terminals.some((terminal) => terminal.uuid === selectedResponseTerminalUuid.value)) {
      selectedResponseTerminalUuid.value = terminals[0].uuid;
    }
  },
  { immediate: true }
);

watch(
  () => [Boolean(activeExecuteFragmentBlock.value), selectedFragmentUuid.value, activeFragmentSource.value] as const,
  ([hasExecuteFragment, uuid, source]) => {
    if (hasExecuteFragment) {
      void loadFragmentOptions(source);
    }
    if (uuid && !fragmentDetails.value.has(fragmentDetailKey(source, uuid))) {
      void loadFragmentDetail(uuid, source);
    }
  },
  { immediate: true }
);

function fragmentDetailKey(source: MokelayApiSource, uuid: string) {
  return `${source}:${uuid}`;
}

async function loadFragmentOptions(source: MokelayApiSource = activeFragmentSource.value) {
  if (fragmentLoadingBySource.value[source]) return;
  fragmentLoadingBySource.value = { ...fragmentLoadingBySource.value, [source]: true };
  try {
    const records: MokelayApiRecord[] = [];
    let page = 1;
    let hasNextPage = true;
    while (hasNextPage) {
      const result = await listApis({ page, pageSize: 200, source, fragment: true });
      records.push(...result.apis);
      hasNextPage = result.pagination.hasNextPage && page < result.pagination.totalPages;
      page += 1;
    }
    const sourceOptions = [...new Map(records
      .filter((record) => record.source === source && record.fragment && record.status === 'published')
      .map((record) => [record.uuid, record])).values()];
    fragmentOptionsBySource.value = {
      ...fragmentOptionsBySource.value,
      [source]: sourceOptions
    };
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '加载 Fragment 列表失败。';
  } finally {
    fragmentLoadingBySource.value = { ...fragmentLoadingBySource.value, [source]: false };
  }
}

async function loadFragmentDetail(uuid: string, source: MokelayApiSource = activeFragmentSource.value) {
  try {
    const record = await getApiBySource(uuid, source, { fragment: true });
    if (record.source !== source || !record.fragment || !record.apiJson || !isFragmentApiJson(record.apiJson)) {
      throw new Error(`${source === 'system' ? '内置' : '用户'} Fragment ${uuid} 不存在或类型不正确。`);
    }
    const next = new Map(fragmentDetails.value);
    next.set(fragmentDetailKey(source, uuid), record);
    fragmentDetails.value = next;
    if (activeFragmentSource.value === source) reconcileFragmentParamMappings(uuid, record);
  } catch (error) {
    apiBuilderError.value = error instanceof Error
      ? `${source === 'system' ? '内置' : '用户'} Fragment 读取失败：${error.message}`
      : '加载 Fragment 详情失败。';
  }
}

function buildGraphNodes(): Node[] {
  if (!activeDraft.value) return [];

  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const starter = blocks.find(isStarterBlock);
  const layoutNodes = activeDraft.value.layout.nodes;
  const nodes: Node[] = [];

  nodes.push({
    id: 'starter',
    type: 'starterNode',
    position: layoutNodes.starter ?? { x: 40, y: 190 },
    data: {
      label: 'Starter',
      nextBlock: starter?.nextBlock ?? null
    },
    draggable: true,
    selectable: true
  });

  executableBlocks.value.forEach((block, index) => {
    const column = Math.floor(index / 4);
    const row = index % 4;
    nodes.push({
      id: block.uuid,
      type: isControllerBlock(block) ? 'controllerNode' : 'blockNode',
      position: layoutNodes[block.uuid] ?? {
        x: 190 + column * 210,
        y: 50 + row * 150
      },
      data: {
        block,
        disabled: isBlockDisabled(block),
        selected: selection.value.type === 'block' && selection.value.uuid === block.uuid
      },
      draggable: true,
      connectable: !isActiveApiReadonly.value
    });
  });

  return nodes;
}

function buildGraphEdges(): Edge[] {
  const blocks = activeDraft.value?.apiJson.blocks ?? [];
  const edges: Edge[] = [];
  const addEdge = (source: string, sourceHandle: string, target: string | null | undefined, label?: string, errorEdge = false) => {
    if (!target) return;
    edges.push({
      id: `${source}:${sourceHandle}->${target}`,
      source,
      sourceHandle,
      target,
      label,
      type: 'smoothstep',
      animated: false,
      markerEnd: MarkerType.ArrowClosed,
      style: errorEdge ? { stroke: '#e11d48', strokeDasharray: '6 4' } : undefined,
      labelStyle: errorEdge ? { fill: '#be123c', fontWeight: 600 } : undefined
    });
  };

  for (const block of blocks) {
    if (isStarterBlock(block)) {
      addEdge('starter', 'next', block.nextBlock, 'start');
      continue;
    }

    if (isControllerBlock(block)) {
      for (const node of block.nodes) {
        addEdge(block.uuid, node.uuid, node.nextBlock, nodeLabel(node));
      }
      continue;
    }

    addEdge(block.uuid, 'next', block.nextBlock);
    addEdge(block.uuid, 'error', block.errorNextBlock, '错误', true);
  }

  return edges;
}

function draftFromApiRecord(record: MokelayApiRecord, currentDraft?: ApiBuilderDraft | null): ApiBuilderDraft {
  const apiJson = record.apiJson ?? currentDraft?.apiJson ?? (record.fragment
    ? {
        uuid: record.uuid,
        alias: record.name,
        fragment: true,
        params: [],
        blocks: [],
        response: {}
      }
    : {
        uuid: record.uuid,
        alias: record.name,
        fragment: false,
        method: record.method,
        request: { header: [], query: [], body: [] },
        blocks: [],
        response: null
      });
  const draft = createDraft(apiJson, record.layout ?? currentDraft?.layout);

  draft.id = record.uuid;
  draft.apiJson.uuid = record.uuid;
  draft.apiJson.alias = draft.apiJson.alias || record.name;
  if (isEndpointApiJson(draft.apiJson)) {
    draft.apiJson.method = record.method;
  }
  draft.status = record.status;
  draft.source = record.source;
  draft.createdAt = record.createdAt || draft.createdAt;
  draft.updatedAt = record.updatedAt || draft.updatedAt;

  return draft;
}

function mergeDraftSessionState(nextDraft: ApiBuilderDraft, currentDraft?: ApiBuilderDraft | null) {
  if (!currentDraft) {
    return nextDraft;
  }

  nextDraft.disabledBlockIds = currentDraft.disabledBlockIds.filter((uuid) => (
    nextDraft.apiJson.blocks?.some((block) => block.uuid === uuid)
  ));
  nextDraft.testCases = currentDraft.testCases;

  return nextDraft;
}

function replaceDraft(draft: ApiBuilderDraft) {
  const index = drafts.value.findIndex((item) => item.id === draft.id);

  if (index === -1) {
    drafts.value = [draft, ...drafts.value];
    return;
  }

  const next = [...drafts.value];
  next[index] = draft;
  drafts.value = next;
}

async function loadApiDetail(
  uuid: string,
  source: MokelayApiSource = props.routeSource,
  fragment = props.routeFragment
) {
  if (!uuid) return;

  const requestId = ++apiDetailRequestId;
  isApiDetailLoading.value = true;
  apiBuilderError.value = '';

  try {
    const api = source === 'system'
      ? await getBuiltInApi(uuid, fragment ? { fragment: true } : {})
      : await getApi(uuid);
    if (requestId !== apiDetailRequestId) return;
    const currentDraft = drafts.value.find((draft) => draft.id === uuid);
    const draft = mergeDraftSessionState(draftFromApiRecord(api, currentDraft), currentDraft);
    replaceDraft(draft);
    if (source === 'user') {
      serverDraftIds.value = new Set([...serverDraftIds.value, draft.id]);
    }
    activeDraftId.value = draft.id;
  } catch (error) {
    if (requestId === apiDetailRequestId) {
      apiBuilderError.value = error instanceof Error ? error.message : '加载 API 详情失败。';
    }
  } finally {
    if (requestId === apiDetailRequestId) {
      isApiDetailLoading.value = false;
    }
  }
}

function apiRouteQuery(source: MokelayApiSource, fragment = false) {
  const query = new URLSearchParams();
  if (source === 'system') query.set('source', 'system');
  if (fragment) query.set('fragment', 'true');
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

function apiListHash(source: MokelayApiSource, fragment = false) {
  return `/apis${apiRouteQuery(source, fragment)}`;
}

function apiDetailHash(uuid: string, source: MokelayApiSource, fragment = false) {
  return `/apis/${encodeURIComponent(uuid)}${apiRouteQuery(source, fragment)}`;
}

function navigateToList() {
  if ((activeDraft.value?.source ?? props.routeSource) === 'system') {
    const fragment = isActiveFragment.value || props.routeFragment;
    window.location.hash = `/setting?section=system-apis${fragment ? '&fragment=true' : ''}`;
    return;
  }

  window.location.hash = apiListHash(
    activeDraft.value?.source ?? props.routeSource,
    isActiveFragment.value || props.routeFragment
  );
}

async function loadApiList(source: MokelayApiSource = apiListSource.value) {
  isApiListLoading.value = true;
  apiBuilderError.value = '';
  try {
    const [result, samples] = await Promise.all([
      listApis({ page: 1, pageSize: 200, source }),
      source === 'user' ? listApiBuilderSamples({ page: 1, pageSize: 100 }) : Promise.resolve({ samples: [] })
    ]);
    if (source !== apiListSource.value) return;
    apiList.value = result.apis;
    apiSamples.value = samples.samples;
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '加载 API 列表失败。';
  } finally {
    isApiListLoading.value = false;
  }
}

function switchApiListSource(source: MokelayApiSource) {
  apiListSource.value = source;
  window.location.hash = apiListHash(source);
  void loadApiList(source);
}

function openApiRecord(record: MokelayApiRecord) {
  window.location.hash = apiDetailHash(record.uuid, record.source, record.fragment);
}

function openCreateDialog(fragment = false, sample?: ApiBuilderSampleRecord) {
  const apiJson = sample
    ? cloneValue(sample.apiJson)
    : fragment
      ? createEmptyFragmentJson()
      : createEmptyApiJson();
  apiInfoDialogMode.value = 'create';
  apiInfoSourceJson.value = apiJson;
  apiInfoSourceLayout.value = normalizeApiBuilderLayout(undefined);
  fillApiInfoForm(apiJson);
  apiInfoError.value = '';
  isApiInfoDialogOpen.value = true;
}

async function removeApiRecord(record: MokelayApiRecord) {
  if (record.source === 'system' || !window.confirm(`删除 ${record.name}？`)) return;
  try {
    await deleteApi(record.uuid);
    await loadApiList();
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '删除失败。';
  }
}

function openDuplicateApiDialog() {
  if (!activeDraft.value) return;

  if (activeDraft.value.source === 'system' && executeFragmentTargets(activeDraft.value.apiJson).length > 0) {
    apiBuilderError.value = '该内置 API 引用了内置 Fragment，不能复制为用户 API。请先在用户空间重建对应 Fragment 和调用关系。';
    return;
  }

  const draft = duplicateDraft(activeDraft.value);

  apiInfoDialogMode.value = 'copy';
  apiInfoSourceJson.value = generateApiJson(draft);
  apiInfoSourceLayout.value = normalizeApiBuilderLayout(draft.layout);
  fillApiInfoForm(draft.apiJson);
  apiInfoError.value = '';
  isApiInfoDialogOpen.value = true;
}

function closeApiInfoDialog() {
  if (isSavingApiInfo.value) return;
  isApiInfoDialogOpen.value = false;
}

function fillApiInfoForm(apiJson: ApiJson) {
  apiInfoForm.name = apiJson.alias || (isFragmentApiJson(apiJson) ? '未命名 Fragment' : '未命名 API');
  apiInfoForm.uuid = apiJson.uuid || '';
  apiInfoForm.method = isFragmentApiJson(apiJson)
    ? 'FRAGMENT'
    : String(apiJson.method || 'GET').toUpperCase() === 'POST' ? 'POST' : 'GET';
}

function buildApiJsonFromInfo(source: ApiJson) {
  const apiJson = cloneValue(source);

  apiJson.alias = apiInfoForm.name.trim();
  apiJson.uuid = apiInfoForm.uuid.trim();
  if (isEndpointApiJson(apiJson)) {
    apiJson.method = apiInfoForm.method === 'POST' ? 'POST' : 'GET';
  }

  return apiJson;
}

function validateApiInfo(name: string, uuid: string, method: string) {
  if (!name.trim()) {
    return '接口名称不能为空。';
  }
  if (name.trim().length > 120) {
    return '接口名称不能超过 120 个字符。';
  }
  if (!apiUuidPattern.test(uuid.trim())) {
    return 'API 标识只能包含字母、数字、下划线和连字符，长度 1-128。';
  }
  if (method !== 'GET' && method !== 'POST' && method !== 'FRAGMENT') {
    return '请求方法必须是 GET 或 POST。';
  }
  return '';
}

function validateApiInfoFromJson(apiJson: ApiJson) {
  return validateApiInfo(
    apiJson.alias || (isFragmentApiJson(apiJson) ? '未命名 Fragment' : '未命名 API'),
    apiJson.uuid,
    isFragmentApiJson(apiJson) ? 'FRAGMENT' : String(apiJson.method || 'GET').toUpperCase()
  );
}

async function submitApiInfoDialog() {
  const validationMessage = validateApiInfo(apiInfoForm.name, apiInfoForm.uuid, apiInfoForm.method);

  if (validationMessage) {
    apiInfoError.value = validationMessage;
    return;
  }

  if (!apiInfoSourceJson.value) {
    apiInfoError.value = '缺少 API JSON。';
    return;
  }

  isSavingApiInfo.value = true;
  apiInfoError.value = '';

  try {
    const apiJson = buildApiJsonFromInfo(apiInfoSourceJson.value);

    await saveApiJsonAsDraft(apiJson, apiInfoSourceLayout.value ?? undefined);
    isApiInfoDialogOpen.value = false;
  } catch (error) {
    apiInfoError.value = error instanceof Error ? error.message : '保存 API 基本信息失败。';
  } finally {
    isSavingApiInfo.value = false;
  }
}

async function saveApiJsonAsDraft(apiJson: ApiJson, layout: ApiBuilderLayout = normalizeApiBuilderLayout(undefined)) {
  await assertFragmentReferencesForSource(apiJson, 'user');
  const api = await saveApi({
    apiJson,
    layout,
    status: 'draft'
  });
  const savedDraft = draftFromApiRecord(api);

  replaceDraft(savedDraft);
  serverDraftIds.value = new Set([...serverDraftIds.value, savedDraft.id]);
  activeDraftId.value = savedDraft.id;
  selection.value = { type: 'api' };
  window.location.hash = apiDetailHash(savedDraft.id, savedDraft.source, isFragmentApiJson(savedDraft.apiJson));
}

function duplicateCurrentDraft() {
  if (!activeDraft.value) return;
  openDuplicateApiDialog();
}

async function saveDraftToServer(status: ApiBuilderDraft['status'], sourceDraftId = activeDraft.value?.id ?? '') {
  if (!activeDraft.value || isActiveApiReadonly.value) return false;

  const validationMessage = validateApiInfoFromJson(activeDraft.value.apiJson);
  if (validationMessage) {
    apiBuilderError.value = validationMessage;
    return false;
  }

  isSavingApi.value = true;
  apiBuilderError.value = '';

  try {
    const currentDraft = activeDraft.value;
    const currentDraftId = sourceDraftId || currentDraft.id;
    const apiJson = generateApiJson(currentDraft);
    await assertFragmentReferencesForSource(apiJson, currentDraft.source);
    const shouldDeletePreviousServerRecord = currentDraftId !== currentDraft.apiJson.uuid && serverDraftIds.value.has(currentDraftId);
    const api = await saveApi({
      apiJson,
      layout: currentDraft.layout,
      status,
      originalUuid: serverDraftIds.value.has(currentDraftId) ? currentDraftId : undefined
    });
    if (shouldDeletePreviousServerRecord) {
      await deleteApi(currentDraftId);
    }
    const savedDraft = mergeDraftSessionState(draftFromApiRecord(api), currentDraft);
    if (currentDraftId !== savedDraft.id) {
      drafts.value = drafts.value.filter((draft) => draft.id !== currentDraftId);
      const nextServerDraftIds = new Set(serverDraftIds.value);
      nextServerDraftIds.delete(currentDraftId);
      serverDraftIds.value = nextServerDraftIds;
    }
    replaceDraft(savedDraft);
    serverDraftIds.value = new Set([...serverDraftIds.value, savedDraft.id]);
    activeDraftId.value = savedDraft.id;
    window.location.hash = apiDetailHash(savedDraft.id, savedDraft.source, isFragmentApiJson(savedDraft.apiJson));
    return true;
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '保存 API 失败。';
    return false;
  } finally {
    isSavingApi.value = false;
  }
}

async function saveActiveDraft() {
  const status = activeDraft.value?.status === 'published' && isActiveFragment.value ? 'published' : 'draft';
  await saveDraftToServer(status);
}

async function publishApi() {
  if (!activeDraft.value) return;
  const issues = validationIssues.value;
  if (hasBlockingErrors(issues)) {
    bottomTab.value = 'validation';
    return;
  }
  if (hasDangerWarnings(issues) && !window.confirm('存在会影响整张表的高风险操作，仍然发布？')) {
    return;
  }
  await saveDraftToServer('published');
}

function addBlock(functionName: BlockFunctionName) {
  if (!activeDraft.value) return;
  ensureStarterBlock();
  const block = createBlock(functionName, undefined, undefined, activeDraft.value.apiJson);
  activeDraft.value.apiJson.blocks = [...(activeDraft.value.apiJson.blocks ?? []), block];
  attachNewBlockToOpenSource(block.uuid);
  selection.value = { type: 'block', uuid: block.uuid };
  if (functionName === 'executeFragment') void loadFragmentOptions();
  nextTick(() => {
    editorRoot.value?.querySelector(`[data-block-uuid="${block.uuid}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}

function addController(functionName: ControllerFunctionName) {
  if (!activeDraft.value) return;
  ensureStarterBlock();
  const controller = createController(functionName, undefined, undefined, activeDraft.value.apiJson);
  activeDraft.value.apiJson.blocks = [...(activeDraft.value.apiJson.blocks ?? []), controller];
  attachNewBlockToOpenSource(controller.uuid);
  selection.value = { type: 'block', uuid: controller.uuid };
}

function ensureStarterBlock() {
  if (!activeDraft.value) return null;
  activeDraft.value.apiJson.blocks ??= [];
  const starter = activeDraft.value.apiJson.blocks.find(isStarterBlock);
  if (starter) {
    return starter;
  }

  const nextStarter = createStarterBlock();
  activeDraft.value.apiJson.blocks = [nextStarter, ...activeDraft.value.apiJson.blocks];
  return nextStarter;
}

function attachNewBlockToOpenSource(uuid: string) {
  const source = findAutoConnectSource(uuid);
  if (!source) return;
  setNextBlock(source.uuid, source.handle, uuid);
}

function findAutoConnectSource(excludeUuid = '') {
  const starter = starterBlock.value;
  if (starter && starter.nextBlock == null) {
    return { uuid: 'starter', handle: 'next' };
  }

  if (selection.value.type === 'starter' && starter && starter.nextBlock == null) {
    return { uuid: 'starter', handle: 'next' };
  }

  if (selection.value.type === 'block') {
    const selectedUuid = selection.value.uuid;
    const selected = executableBlocks.value.find((block) => block.uuid === selectedUuid);
    if (selected && isStandardBlock(selected) && selected.nextBlock == null) {
      return { uuid: selected.uuid, handle: 'next' };
    }
  }

  const terminal = [...executableBlocks.value]
    .reverse()
    .find((block) => block.uuid !== excludeUuid && isStandardBlock(block) && block.nextBlock == null);
  return terminal ? { uuid: terminal.uuid, handle: 'next' } : null;
}

function duplicateBlock(block: ApiBlock) {
  if (!activeDraft.value) return;
  if (isStarterBlock(block)) return;
  const copy = cloneValue(block);
  copy.uuid = `${block.uuid}_copy`;
  copy.alias = `${block.alias || block.uuid} 副本`;
  if (isControllerBlock(copy)) {
    delete copy.nextBlock;
    copy.nodes = copy.nodes.map((node) => ({
      ...node,
      uuid: `${node.uuid}_copy`,
      nextBlock: null
    }));
  } else {
    copy.nextBlock = null;
  }
  const sourcePosition = readGraphNodePosition(block.uuid);
  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const index = blocks.findIndex((item) => item.uuid === block.uuid);
  blocks.splice(index + 1, 0, copy);
  copyNodePosition(block.uuid, copy.uuid, { x: 24, y: 24 }, sourcePosition);
  attachNewBlockToOpenSource(copy.uuid);
  selection.value = { type: 'block', uuid: copy.uuid };
}

function removeBlock(block: ApiBlock) {
  if (!activeDraft.value) return;
  if (isStarterBlock(block)) return;
  const incomingTerminalUuids = collectIncomingTerminalUuids(block.uuid);
  const responseFallback = responseFallbackForRemoval(block);
  activeDraft.value.apiJson.blocks = (activeDraft.value.apiJson.blocks ?? []).filter((item) => item.uuid !== block.uuid);
  clearReferencesToBlock(block.uuid);
  removeBlockResponseTerminals(block);
  if (responseFallback !== undefined && !hasDefaultResponse(activeDraft.value.apiJson)) {
    activeDraft.value.apiJson.responses ??= {};
    const currentTerminals = new Set(collectResponseTerminals(activeDraft.value.apiJson).map((terminal) => terminal.uuid));
    for (const terminalUuid of incomingTerminalUuids) {
      if (currentTerminals.has(terminalUuid) && !Object.prototype.hasOwnProperty.call(activeDraft.value.apiJson.responses, terminalUuid)) {
        activeDraft.value.apiJson.responses[terminalUuid] = cloneValue(responseFallback);
      }
    }
  }
  activeDraft.value.disabledBlockIds = activeDraft.value.disabledBlockIds.filter((uuid) => uuid !== block.uuid);
  removeNodePosition(block.uuid);
  selection.value = { type: 'api' };
}

function collectIncomingTerminalUuids(targetUuid: string) {
  const terminalUuids = new Set<string>();
  for (const candidate of activeDraft.value?.apiJson.blocks ?? []) {
    if (isStarterBlock(candidate)) {
      if (candidate.nextBlock === targetUuid) terminalUuids.add('starter');
    } else if (isControllerBlock(candidate)) {
      for (const node of candidate.nodes) if (node.nextBlock === targetUuid) terminalUuids.add(node.uuid);
    } else if (candidate.nextBlock === targetUuid || candidate.errorNextBlock === targetUuid) {
      terminalUuids.add(candidate.uuid);
    }
  }
  return [...terminalUuids];
}

function responseFallbackForRemoval(block: Exclude<ApiBlock, { uuid: 'starter' }>) {
  if (!activeDraft.value) return undefined;
  const apiJson = activeDraft.value.apiJson;
  const preferredUuids = isControllerBlock(block) ? block.nodes.map((node) => node.uuid) : [block.uuid];
  for (const uuid of preferredUuids) {
    if (apiJson.responses && Object.prototype.hasOwnProperty.call(apiJson.responses, uuid)) {
      return cloneValue(apiJson.responses[uuid]);
    }
  }
  if (hasDefaultResponse(apiJson)) return cloneValue(apiJson.response);
  const fallback = Object.values(apiJson.responses ?? {})[0];
  return fallback === undefined ? undefined : cloneValue(fallback);
}

function removeBlockResponseTerminals(block: ApiBlock) {
  if (isStarterBlock(block)) return;
  if (isControllerBlock(block)) {
    block.nodes.forEach((node) => removeResponseTerminal(node.uuid));
    return;
  }
  removeResponseTerminal(block.uuid);
}

function toggleBlockDisabled(block: ApiBlock) {
  if (!activeDraft.value) return;
  const disabled = new Set(activeDraft.value.disabledBlockIds);
  if (disabled.has(block.uuid)) {
    disabled.delete(block.uuid);
  } else {
    disabled.add(block.uuid);
    clearReferencesToBlock(block.uuid);
  }
  activeDraft.value.disabledBlockIds = Array.from(disabled);
}

function isBlockDisabled(block: ApiBlock) {
  if (isStarterBlock(block)) return false;
  return activeDraft.value?.disabledBlockIds.includes(block.uuid) ?? false;
}

function setNextBlock(sourceUuid: string, sourceHandle: string | null | undefined, targetUuid: string | null) {
  if (!activeDraft.value) return;
  if (sourceUuid === 'starter') {
    ensureStarterBlock();
  }
  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const source = sourceUuid === 'starter'
    ? blocks.find(isStarterBlock)
    : blocks.find((block) => block.uuid === sourceUuid);

  if (!source) return;
  if (targetUuid === 'starter') return;
  if (targetUuid && !blocks.some((block) => block.uuid === targetUuid && !isStarterBlock(block))) return;

  if (isStarterBlock(source)) {
    const response = readTerminalResponse('starter');
    source.nextBlock = targetUuid;
    migrateTerminalResponse('starter', targetUuid, response);
    if (targetUuid === null) ensureTerminalResponse('starter');
    return;
  }

  if (isControllerBlock(source)) {
    const node = source.nodes.find((item) => item.uuid === sourceHandle);
    if (node) {
      const response = readTerminalResponse(node.uuid);
      node.nextBlock = targetUuid;
      migrateTerminalResponse(node.uuid, targetUuid, response);
      if (targetUuid === null) ensureTerminalResponse(node.uuid);
    }
    return;
  }

  if (sourceHandle === 'error') {
    const response = readTerminalResponse(source.uuid);
    source.errorNextBlock = targetUuid;
    migrateTerminalResponse(source.uuid, targetUuid, response);
    if (targetUuid === null) ensureTerminalResponse(source.uuid);
    return;
  }

  const response = readTerminalResponse(source.uuid);
  source.nextBlock = targetUuid;
  migrateTerminalResponse(source.uuid, targetUuid, response);
  if (targetUuid === null) ensureTerminalResponse(source.uuid);
}

function readTerminalResponse(uuid: string) {
  const responses = activeDraft.value?.apiJson.responses;
  return responses && Object.prototype.hasOwnProperty.call(responses, uuid)
    ? cloneValue(responses[uuid])
    : undefined;
}

function responseTerminalsFromTarget(targetUuid: string | null, visited = new Set<string>()): string[] {
  if (!targetUuid || visited.has(targetUuid) || !activeDraft.value) return [];
  visited.add(targetUuid);
  const block = activeDraft.value.apiJson.blocks?.find((candidate) => candidate.uuid === targetUuid);
  if (!block || isStarterBlock(block)) return [];
  if (isControllerBlock(block)) {
    return [...new Set(block.nodes.flatMap((node) => node.nextBlock === null
      ? [node.uuid]
      : responseTerminalsFromTarget(node.nextBlock ?? null, new Set(visited))))];
  }
  const terminals = block.nextBlock === null
    ? [block.uuid]
    : responseTerminalsFromTarget(block.nextBlock ?? null, new Set(visited));
  if (Object.prototype.hasOwnProperty.call(block, 'errorNextBlock')) {
    if (block.errorNextBlock === null) terminals.push(block.uuid);
    else terminals.push(...responseTerminalsFromTarget(block.errorNextBlock ?? null, new Set(visited)));
  }
  return [...new Set(terminals)];
}

function migrateTerminalResponse(previousTerminal: string, targetUuid: string | null, response: ResponseConfig | undefined) {
  if (!activeDraft.value || response === undefined) return;
  const apiJson = activeDraft.value.apiJson;
  apiJson.responses ??= {};
  for (const terminalUuid of responseTerminalsFromTarget(targetUuid)) {
    if (!Object.prototype.hasOwnProperty.call(apiJson.responses, terminalUuid)) {
      apiJson.responses[terminalUuid] = cloneValue(response);
    }
  }
  const remainsTerminal = collectResponseTerminals(apiJson).some((terminal) => terminal.uuid === previousTerminal);
  if (!remainsTerminal) delete apiJson.responses[previousTerminal];
}

function ensureTerminalResponse(uuid: string) {
  if (!activeDraft.value || hasDefaultResponse(activeDraft.value.apiJson)) return;
  const apiJson = activeDraft.value.apiJson;
  apiJson.responses ??= {};
  if (Object.prototype.hasOwnProperty.call(apiJson.responses, uuid)) return;
  const fallback = Object.values(apiJson.responses)[0];
  if (fallback !== undefined) apiJson.responses[uuid] = cloneValue(fallback);
}

function errorNextBlockSelectValue(block: ApiStandardBlock) {
  if (!Object.prototype.hasOwnProperty.call(block, 'errorNextBlock')) return '__unhandled__';
  return block.errorNextBlock === null ? '__terminal__' : block.errorNextBlock;
}

function updateErrorNextBlock(block: ApiStandardBlock, value: string) {
  const response = readTerminalResponse(block.uuid);
  if (value === '__unhandled__') {
    delete block.errorNextBlock;
    migrateTerminalResponse(block.uuid, null, response);
  } else if (value === '__terminal__') {
    block.errorNextBlock = null;
    ensureTerminalResponse(block.uuid);
  } else {
    block.errorNextBlock = value;
    migrateTerminalResponse(block.uuid, value, response);
  }
}

function clearReferencesToBlock(uuid: string) {
  if (!activeDraft.value) return;
  for (const block of activeDraft.value.apiJson.blocks ?? []) {
    if (isStarterBlock(block)) {
      if (block.nextBlock === uuid) block.nextBlock = null;
      continue;
    }

    if (isControllerBlock(block)) {
      for (const node of block.nodes) {
        if (node.nextBlock === uuid) node.nextBlock = null;
      }
      continue;
    }

    if (block.nextBlock === uuid) {
      block.nextBlock = null;
    }
    if (block.errorNextBlock === uuid) {
      block.errorNextBlock = null;
    }
  }
}

function executableTargetOptions(excludeUuid = '') {
  return executableBlocks.value
    .filter((block) => block.uuid !== excludeUuid)
    .map((block) => ({
      uuid: block.uuid,
      label: `${block.alias || block.uuid} (${block.uuid})`
    }));
}

function onBlockDragStart(block: ApiBlock) {
  if (isActiveApiReadonly.value) return;
  draggedBlockUuid.value = block.uuid;
}

function onBlockDrop(targetBlock: ApiBlock) {
  if (isActiveApiReadonly.value) return;
  if (!activeDraft.value || !draggedBlockUuid.value || draggedBlockUuid.value === targetBlock.uuid) return;
  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const fromIndex = blocks.findIndex((block) => block.uuid === draggedBlockUuid.value);
  const toIndex = blocks.findIndex((block) => block.uuid === targetBlock.uuid);
  if (fromIndex === -1 || toIndex === -1) return;
  const [dragged] = blocks.splice(fromIndex, 1);
  blocks.splice(toIndex, 0, dragged);
  draggedBlockUuid.value = '';
}

function selectBlock(block: ApiBlock) {
  selection.value = isStarterBlock(block) ? { type: 'starter' } : { type: 'block', uuid: block.uuid };
  if (isStandardBlock(block) && block.functionName === 'executeFragment') void loadFragmentOptions();
}

function selectGraphNode(uuid: string) {
  selection.value = uuid === 'starter' ? { type: 'starter' } : { type: 'block', uuid };
  const block = activeDraft.value?.apiJson.blocks?.find((item) => item.uuid === uuid);
  if (block && isStandardBlock(block) && block.functionName === 'executeFragment') void loadFragmentOptions();
}

function onFlowConnect(connection: Connection) {
  if (isActiveApiReadonly.value) return;
  if (!connection.source || !connection.target) return;
  setNextBlock(connection.source, connection.sourceHandle, connection.target);
}

function onFlowEdgeClick(event: { edge?: Edge }) {
  if (isActiveApiReadonly.value) return;
  const edge = event.edge;
  if (!edge) return;
  setNextBlock(edge.source, edge.sourceHandle, null);
}

function onFlowNodeClick(event: { node?: Node }) {
  if (!event.node?.id) return;
  selectGraphNode(event.node.id);
}

function onFlowNodeDragStop(event: { node?: Node }) {
  const node = event.node;
  if (!node?.id || !node.position) return;
  setNodePosition(node.id, node.position);
}

async function autoArrangeGraph() {
  if (!activeDraft.value) return;

  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const blockOrder = new Map<string, number>([['starter', 0]]);
  const blockByUuid = new Map<string, ApiBlock>();

  blocks.forEach((block, index) => {
    const uuid = isStarterBlock(block) ? 'starter' : block.uuid;
    blockOrder.set(uuid, index + 1);
    blockByUuid.set(uuid, block);
  });

  if (!blockByUuid.has('starter')) {
    blockByUuid.set('starter', createStarterBlock());
  }

  const nodeUuids = [...blockByUuid.keys()];
  const nodeUuidSet = new Set(nodeUuids);
  const outgoing = new Map<string, string[]>();

  for (const [uuid, block] of blockByUuid) {
    const targets = isStarterBlock(block)
      ? [block.nextBlock]
      : isControllerBlock(block)
        ? block.nodes.map((node) => node.nextBlock)
        : [block.nextBlock, block.errorNextBlock];
    outgoing.set(uuid, [...new Set(targets.filter((target): target is string => (
      typeof target === 'string' && nodeUuidSet.has(target)
    )))]);
  }

  const reachable = new Set<string>();
  const pending = ['starter'];
  while (pending.length) {
    const uuid = pending.shift()!;
    if (reachable.has(uuid)) continue;
    reachable.add(uuid);
    pending.push(...(outgoing.get(uuid) ?? []));
  }

  const indegree = new Map([...reachable].map((uuid) => [uuid, 0]));
  for (const uuid of reachable) {
    for (const target of outgoing.get(uuid) ?? []) {
      if (reachable.has(target)) {
        indegree.set(target, (indegree.get(target) ?? 0) + 1);
      }
    }
  }

  const depth = new Map<string, number>([['starter', 0]]);
  const queue = [...reachable]
    .filter((uuid) => (indegree.get(uuid) ?? 0) === 0)
    .sort((left, right) => (blockOrder.get(left) ?? 0) - (blockOrder.get(right) ?? 0));

  while (queue.length) {
    const uuid = queue.shift()!;
    const currentDepth = depth.get(uuid) ?? 0;

    for (const target of outgoing.get(uuid) ?? []) {
      if (!reachable.has(target)) continue;
      depth.set(target, Math.max(depth.get(target) ?? 0, currentDepth + 1));
      const nextIndegree = (indegree.get(target) ?? 0) - 1;
      indegree.set(target, nextIndegree);
      if (nextIndegree === 0) queue.push(target);
    }

    queue.sort((left, right) => (blockOrder.get(left) ?? 0) - (blockOrder.get(right) ?? 0));
  }

  const levels = new Map<number, string[]>();
  for (const uuid of reachable) {
    const level = depth.get(uuid) ?? 0;
    levels.set(level, [...(levels.get(level) ?? []), uuid]);
  }

  const maxReachableDepth = Math.max(0, ...levels.keys());
  const disconnected = nodeUuids.filter((uuid) => !reachable.has(uuid));
  disconnected.forEach((uuid, index) => {
    const level = maxReachableDepth + 1 + Math.floor(index / 4);
    levels.set(level, [...(levels.get(level) ?? []), uuid]);
  });

  for (const uuids of levels.values()) {
    uuids.sort((left, right) => (blockOrder.get(left) ?? 0) - (blockOrder.get(right) ?? 0));
  }

  const horizontalGap = 280;
  const verticalGap = 240;
  const maxRows = Math.max(1, ...[...levels.values()].map((uuids) => uuids.length));
  const positions: Record<string, ApiBuilderNodePosition> = {};

  for (const [level, uuids] of levels) {
    const verticalOffset = ((maxRows - uuids.length) * verticalGap) / 2;
    uuids.forEach((uuid, index) => {
      positions[uuid] = {
        x: 40 + level * horizontalGap,
        y: 50 + verticalOffset + index * verticalGap
      };
    });
  }

  activeDraft.value.layout = {
    version: 1,
    nodes: positions
  };

  await nextTick();
  await fitView({ padding: 0.15, minZoom: 0.4, maxZoom: 0.9, duration: 300 });
}

function ensureDraftLayout(draft: ApiBuilderDraft | null = activeDraft.value) {
  if (!draft) return null;
  draft.layout = normalizeApiBuilderLayout(draft.layout);
  return draft.layout;
}

function setNodePosition(uuid: string, position: ApiBuilderNodePosition) {
  if (!activeDraft.value || !uuid) return;

  const layout = ensureDraftLayout();
  if (!layout) return;

  activeDraft.value.layout = {
    ...layout,
    nodes: {
      ...layout.nodes,
      [uuid]: {
        x: position.x,
        y: position.y
      }
    }
  };
}

function removeNodePosition(uuid: string) {
  if (!activeDraft.value || !uuid) return;

  const layout = ensureDraftLayout();
  if (!layout || !layout.nodes[uuid]) return;

  const nodes = { ...layout.nodes };
  delete nodes[uuid];
  activeDraft.value.layout = {
    ...layout,
    nodes
  };
}

function moveNodePosition(previous: string, next: string) {
  if (!activeDraft.value || !previous || !next || previous === next) return;

  const layout = ensureDraftLayout();
  const position = layout?.nodes[previous];
  if (!layout || !position) return;

  const nodes = { ...layout.nodes };
  delete nodes[previous];
  nodes[next] = position;
  activeDraft.value.layout = {
    ...layout,
    nodes
  };
}

function readGraphNodePosition(uuid: string) {
  const position = graphNodes.value.find((node) => node.id === uuid)?.position;
  return position
    ? {
        x: position.x,
        y: position.y
      }
    : undefined;
}

function copyNodePosition(source: string, target: string, offset: ApiBuilderNodePosition, fallbackPosition?: ApiBuilderNodePosition) {
  if (!activeDraft.value || !source || !target) return;

  const layout = ensureDraftLayout();
  const position = layout?.nodes[source] ?? fallbackPosition;
  if (!layout || !position) return;

  activeDraft.value.layout = {
    ...layout,
    nodes: {
      ...layout.nodes,
      [target]: {
        x: position.x + offset.x,
        y: position.y + offset.y
      }
    }
  };
}

function issueCount(severity: ValidationIssue['severity']) {
  return validationIssues.value.filter((issue) => issue.severity === severity).length;
}

function selectIssue(issue: ValidationIssue) {
  if (issue.target === 'api' || issue.target === 'request' || issue.target === 'response') {
    selection.value = { type: issue.target };
    return;
  }
  const uuid = issue.target.replace(/^block:/, '');
  selection.value = uuid === 'starter' ? { type: 'starter' } : { type: 'block', uuid };
}

function getRequestList(location: RequestLocation) {
  if (!activeDraft.value) return [];
  const request = ensureRequest();
  request[location] ??= [];
  return request[location]!;
}

function addRequestParam(location: RequestLocation) {
  getRequestList(location).push({
    key: location === 'query' ? 'id' : 'name',
    processors: location === 'body' ? ['is_not_null'] : []
  });
}

function removeRequestParam(location: RequestLocation, index: number) {
  getRequestList(location).splice(index, 1);
}

function updateRequestKey(location: RequestLocation, index: number, key: string) {
  const list = getRequestList(location);
  const item = list[index];
  if (typeof item === 'string') {
    list[index] = key;
    return;
  }
  item.key = key;
}

function updateRequestProcessors(location: RequestLocation, index: number, processors: ProcessorConfig[]) {
  const list = getRequestList(location);
  const item = list[index];
  if (typeof item === 'string') {
    list[index] = { key: item, processors };
    return;
  }
  item.processors = processors;
}

function toggleRequired(location: RequestLocation, index: number) {
  const processors = getRequestProcessors(getRequestList(location)[index]);
  const names = processors.map(processorName);
  const next = names.includes('is_not_null')
    ? processors.filter((processor) => processorName(processor) !== 'is_not_null')
    : ['is_not_null', ...processors];
  updateRequestProcessors(location, index, next);
}

function addRequestProcessor(location: RequestLocation, index: number, name: string) {
  if (!name) return;
  const definition = getProcessorDefinition(name);
  const processor: ProcessorConfig = definition?.needsParam
    ? { processor: name, param: cloneValue(definition.defaultParam ?? []) }
    : name;
  updateRequestProcessors(location, index, [...getRequestProcessors(getRequestList(location)[index]), processor]);
}

function removeRequestProcessor(location: RequestLocation, index: number, processorIndex: number) {
  const processors = getRequestProcessors(getRequestList(location)[index]);
  processors.splice(processorIndex, 1);
  updateRequestProcessors(location, index, processors);
}

function getRequestKey(item: ProcessableKey) {
  return typeof item === 'string' ? item : item.key;
}

function getRequestProcessors(item: ProcessableKey) {
  return typeof item === 'string' ? [] : [...(item.processors ?? [])];
}

function isRequestRequired(item: ProcessableKey) {
  return typeof item === 'string' || getRequestProcessors(item).some((processor) => processorName(processor) === 'is_not_null');
}

function ensureRequest() {
  if (!activeDraft.value) {
    throw new Error('No active draft');
  }
  if (!isEndpointApiJson(activeDraft.value.apiJson)) {
    throw new Error('Fragment does not have request declarations');
  }
  activeDraft.value.apiJson.request ??= {};
  return activeDraft.value.apiJson.request;
}

function getFragmentParams() {
  if (!activeDraft.value || !isFragmentApiJson(activeDraft.value.apiJson)) return [];
  activeDraft.value.apiJson.params ??= [];
  return activeDraft.value.apiJson.params;
}

function addFragmentParam() {
  getFragmentParams().push({ key: 'param', processors: ['is_not_null'] });
}

function removeFragmentParam(index: number) {
  getFragmentParams().splice(index, 1);
}

function updateFragmentParamKey(index: number, key: string) {
  const list = getFragmentParams();
  const item = list[index];
  if (typeof item === 'string') list[index] = key;
  else if (item) item.key = key;
}

function updateFragmentParamProcessors(index: number, processors: ProcessorConfig[]) {
  const list = getFragmentParams();
  const item = list[index];
  if (typeof item === 'string') list[index] = { key: item, processors };
  else if (item) item.processors = processors;
}

function toggleFragmentParamRequired(index: number) {
  const item = getFragmentParams()[index];
  if (!item) return;
  const processors = getRequestProcessors(item);
  const next = processors.some((processor) => processorName(processor) === 'is_not_null')
    ? processors.filter((processor) => processorName(processor) !== 'is_not_null')
    : ['is_not_null', ...processors];
  updateFragmentParamProcessors(index, next);
}

function addFragmentParamProcessor(index: number, name: string) {
  if (!name) return;
  const item = getFragmentParams()[index];
  if (!item) return;
  const definition = getProcessorDefinition(name);
  const processor: ProcessorConfig = definition?.needsParam
    ? { processor: name, param: cloneValue(definition.defaultParam ?? []) }
    : name;
  updateFragmentParamProcessors(index, [...getRequestProcessors(item), processor]);
}

function removeFragmentParamProcessor(index: number, processorIndex: number) {
  const item = getFragmentParams()[index];
  if (!item) return;
  const processors = getRequestProcessors(item);
  processors.splice(processorIndex, 1);
  updateFragmentParamProcessors(index, processors);
}

function blockInputs(block: ApiBlock | null = activeBlock.value) {
  if (!block) return {};
  if (isStarterBlock(block)) return {};
  block.inputs ??= {};
  return block.inputs;
}

function updateBlockInput(key: string, value: unknown) {
  if (!activeBlock.value) return;
  blockInputs()[key] = value;
}

async function selectFragment(uuid: string) {
  if (!activeExecuteFragmentBlock.value || isActiveApiReadonly.value) return;
  if (uuid && !fragmentOptions.value.some((record) => record.uuid === uuid)) {
    apiBuilderError.value = `${activeFragmentSource.value === 'system' ? '内置' : '用户'} Fragment ${uuid} 不在可用列表中。`;
    return;
  }
  const currentParams = isRecord(activeExecuteFragmentBlock.value.inputs?.params)
    ? activeExecuteFragmentBlock.value.inputs.params
    : {};
  activeExecuteFragmentBlock.value.inputs = {
    ...(activeExecuteFragmentBlock.value.inputs ?? {}),
    fragmentUuid: uuid,
    params: { ...currentParams }
  };
  activeExecuteFragmentBlock.value.outputs = ['result'];
  if (uuid) await loadFragmentDetail(uuid, activeFragmentSource.value);
  else activeExecuteFragmentBlock.value.inputs.params = {};
}

function reconcileFragmentParamMappings(uuid: string, record: MokelayApiRecord) {
  const block = activeExecuteFragmentBlock.value;
  if (!block || block.inputs?.fragmentUuid !== uuid || !record.apiJson || !isFragmentApiJson(record.apiJson)) return;
  const current = isRecord(block.inputs.params) ? block.inputs.params : {};
  const next: Record<string, unknown> = {};
  for (const declaration of record.apiJson.params ?? []) {
    const key = declarationKey(declaration);
    if (Object.prototype.hasOwnProperty.call(current, key)) next[key] = current[key];
  }
  block.inputs.params = next;
}

function fragmentParamMappings() {
  if (!activeExecuteFragmentBlock.value) return {};
  const inputs = activeExecuteFragmentBlock.value.inputs ??= {};
  if (!isRecord(inputs.params)) inputs.params = {};
  return inputs.params as Record<string, unknown>;
}

function updateFragmentParamMapping(key: string, value: unknown) {
  fragmentParamMappings()[key] = value;
}

async function openFragmentEditor(uuid = selectedFragmentUuid.value) {
  fragmentEditorError.value = '';
  const source = activeFragmentSource.value;
  if (!uuid && source === 'system') {
    apiBuilderError.value = '系统内置 API 不能创建用户 Fragment。';
    return;
  }
  try {
    const record = uuid ? await getApiBySource(uuid, source, { fragment: true }) : null;
    if (record && (record.source !== source || !record.fragment || !record.apiJson || !isFragmentApiJson(record.apiJson))) {
      throw new Error(`${source === 'system' ? '内置' : '用户'} Fragment ${uuid} 不存在或类型不正确。`);
    }
    fragmentEditorDraft.value = record ? draftFromApiRecord(record) : createDraft(createEmptyFragmentJson());
    fragmentEditorOriginalUuid.value = record?.uuid ?? '';
    isFragmentEditorOpen.value = true;
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '打开 Fragment 编辑器失败。';
  }
}

function closeFragmentEditor() {
  if (isSavingFragment.value) return;
  isFragmentEditorOpen.value = false;
  fragmentEditorDraft.value = null;
  fragmentEditorOriginalUuid.value = '';
  fragmentEditorError.value = '';
}

async function saveFragmentFromModal(status: ApiBuilderDraft['status']) {
  const draft = fragmentEditorDraft.value;
  if (!draft || draft.source === 'system') return;
  isSavingFragment.value = true;
  fragmentEditorError.value = '';
  try {
    const flushed = await fragmentEditorRef.value?.flush();
    if (flushed) {
      draft.apiJson = flushed.apiJson;
      draft.layout = flushed.layout;
      draft.disabledBlockIds = flushed.disabledBlockIds;
      draft.testCases = flushed.testCases;
    }
    const apiJson = generateApiJson(draft);
    const issues = validateApiJson(apiJson);
    if (status === 'published' && hasBlockingErrors(issues)) {
      throw new Error(issues.find((issue) => issue.severity === 'error')?.message || 'Fragment 校验失败。');
    }
    const record = await saveApi({
      apiJson,
      layout: draft.layout,
      status,
      originalUuid: fragmentEditorOriginalUuid.value || undefined
    });
    fragmentEditorDraft.value = draftFromApiRecord(record);
    fragmentEditorOriginalUuid.value = record.uuid;
    const details = new Map(fragmentDetails.value);
    details.set(record.uuid, record);
    fragmentDetails.value = details;
    await loadFragmentOptions('user');
    if (status === 'published' && activeExecuteFragmentBlock.value) await selectFragment(record.uuid);
    isFragmentEditorOpen.value = false;
  } catch (error) {
    fragmentEditorError.value = error instanceof Error ? error.message : '保存 Fragment 失败。';
  } finally {
    isSavingFragment.value = false;
  }
}

function updateActiveBlockUuid(value: string) {
  if (!activeBlock.value) return;
  const previous = activeBlock.value.uuid;
  const next = value.trim();
  activeBlock.value.uuid = next;
  if (!previous || previous === next) return;

  for (const block of activeDraft.value?.apiJson.blocks ?? []) {
    if (isStarterBlock(block)) {
      if (block.nextBlock === previous) block.nextBlock = next;
      continue;
    }
    if (isControllerBlock(block)) {
      for (const node of block.nodes) {
        if (node.nextBlock === previous) node.nextBlock = next;
      }
      continue;
    }
    if (block.nextBlock === previous) block.nextBlock = next;
    if (block.errorNextBlock === previous) block.errorNextBlock = next;
  }

  renameResponseTerminal(previous, next);
  moveNodePosition(previous, next);
  selection.value = { type: 'block', uuid: next };
}

function updateControllerNodeUuid(node: ControllerNode, value: string) {
  const previous = node.uuid;
  const next = value.trim();
  node.uuid = next;
  renameResponseTerminal(previous, next);
}

function nodeLabel(node: ControllerNode) {
  if (node.type === 'DEFAULT') return node.alias || 'DEFAULT';
  if (typeof node.value === 'boolean') return node.value ? 'true' : 'false';
  return node.alias || String(node.value ?? 'case');
}

function addSwitchCase(controller: ApiController) {
  if (controller.functionName !== 'switch_controller') return;
  const index = controller.nodes.length + 1;
  controller.nodes.push({
    uuid: `${controller.uuid}_case_${index}`,
    alias: `Case ${index}`,
    value: defaultSwitchNodeValue(controller),
    nextBlock: null
  });
}

function addSwitchDefault(controller: ApiController) {
  if (controller.functionName !== 'switch_controller') return;
  controller.nodes.push({
    uuid: `${controller.uuid}_default_${controller.nodes.length + 1}`,
    alias: 'Default',
    type: 'DEFAULT',
    nextBlock: null
  });
}

function removeControllerNode(controller: ApiController, index: number) {
  if (controller.functionName === 'if_controller') return;
  const node = controller.nodes[index];
  if (node) {
    removeResponseTerminal(node.uuid);
  }
  controller.nodes.splice(index, 1);
}

function updateControllerNodeType(node: ControllerNode, type: 'CASE' | 'DEFAULT', controller: ApiController) {
  if (type === 'DEFAULT') {
    node.type = 'DEFAULT';
    delete node.value;
    return;
  }

  delete node.type;
  if (node.value === undefined) {
    node.value = defaultSwitchNodeValue(controller);
  }
}

function defaultSwitchNodeValue(controller: ApiController) {
  const dataType = controller.inputs?.dataType;
  if (dataType === 'number') return 1;
  if (dataType === 'boolean') return true;
  return 'published';
}

function parseControllerNodeValue(value: string, controller: ApiController) {
  const dataType = controller.inputs?.dataType;
  if (dataType === 'number') {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }
  if (dataType === 'boolean') {
    return value === 'true';
  }
  return value;
}

function stringInput(key: string) {
  const value = blockInputs()[key];
  return typeof value === 'string' ? value : '';
}

function arrayInput(key: string) {
  const value = blockInputs()[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').join(', ') : '';
}

function updateArrayInput(key: string, value: string) {
  updateBlockInput(key, splitFields(value));
}

function cascadeRootInput() {
  const inputs = blockInputs();
  if (!isRecord(inputs.root)) {
    inputs.root = {
      id: 'employees',
      table: 'employees',
      keyField: 'id',
      conditions: []
    } satisfies CascadeDeleteRoot;
  }
  const root = inputs.root as Record<string, unknown>;
  if (!Array.isArray(root.conditions)) root.conditions = [];
  return root as unknown as CascadeDeleteRoot;
}

function cascadeRelations() {
  const inputs = blockInputs();
  if (!Array.isArray(inputs.relations)) inputs.relations = [];
  return inputs.relations as CascadeDeleteRelation[];
}

function addCascadeRelation() {
  const relations = cascadeRelations();
  const rootId = cascadeRootInput().id || 'root';
  const index = relations.length + 1;
  relations.push({
    id: `relation_${index}`,
    table: `related_table_${index}`,
    keyField: 'id',
    parent: rootId,
    foreignKey: `${rootId}_id`,
    conditions: []
  });
}

function removeCascadeRelation(index: number) {
  cascadeRelations().splice(index, 1);
}

function cascadeCollectItems() {
  const inputs = blockInputs();
  if (!Array.isArray(inputs.collect)) inputs.collect = [];
  return inputs.collect as CascadeDeleteCollect[];
}

function addCascadeCollect() {
  const collects = cascadeCollectItems();
  collects.push({
    key: `values_${collects.length + 1}`,
    node: cascadeRootInput().id || 'root',
    mode: 'values',
    fields: ['uuid'],
    distinct: true,
    orderBy: []
  });
}

function removeCascadeCollect(index: number) {
  cascadeCollectItems().splice(index, 1);
}

function cascadeCollectFields(collect: CascadeDeleteCollect) {
  if (!Array.isArray(collect.fields)) collect.fields = [];
  return collect.fields;
}

function addCascadeCollectField(collect: CascadeDeleteCollect) {
  cascadeCollectFields(collect).push('uuid');
}

function updateCascadeCollectFieldKey(collect: CascadeDeleteCollect, index: number, key: string) {
  const field = cascadeCollectFields(collect)[index];
  if (typeof field === 'string') collect.fields[index] = key;
  else if (field) field.key = key;
}

function cascadeCollectFieldProcessors(field: ProcessableKey) {
  return typeof field === 'string' ? [] : field.processors ?? [];
}

function updateCascadeCollectFieldProcessors(collect: CascadeDeleteCollect, index: number, value: string) {
  try {
    const processors = JSON.parse(value);
    if (!Array.isArray(processors)) return;
    const field = cascadeCollectFields(collect)[index];
    const key = field ? declarationKey(field) : 'uuid';
    collect.fields[index] = processors.length ? { key, processors } : key;
  } catch {
    // Preserve the last valid processors while the user types partial JSON.
  }
}

function removeCascadeCollectField(collect: CascadeDeleteCollect, index: number) {
  cascadeCollectFields(collect).splice(index, 1);
}

function cascadeCollectOrderBy(collect: CascadeDeleteCollect) {
  return Array.isArray(collect.orderBy) ? collect.orderBy as OrderBy[] : [];
}

function addCascadeCollectOrderBy(collect: CascadeDeleteCollect) {
  if (!Array.isArray(collect.orderBy)) collect.orderBy = [];
  collect.orderBy.push({ fieldName: 'uuid', direction: 'ASC' });
}

function removeCascadeCollectOrderBy(collect: CascadeDeleteCollect, index: number) {
  cascadeCollectOrderBy(collect).splice(index, 1);
}

function cascadeConditions(node: CascadeDeleteRoot | CascadeDeleteRelation) {
  return Array.isArray(node.conditions) ? node.conditions : [];
}

function addCascadeCondition(node: CascadeDeleteRoot | CascadeDeleteRelation) {
  if (!Array.isArray(node.conditions)) node.conditions = [];
  node.conditions.push({
    group: false,
    fieldName: node.keyField || 'id',
    conditionType: 'EQ',
    fieldValue: makeTemplate('request.body.id')
  });
}

function removeCascadeCondition(node: CascadeDeleteRoot | CascadeDeleteRelation, index: number) {
  cascadeConditions(node).splice(index, 1);
}

function cascadeLimitsInput() {
  const inputs = blockInputs();
  if (!isRecord(inputs.limits)) {
    inputs.limits = {
      maxRootRows: 1,
      maxAffectedRows: 100000,
      maxCollectedRows: 10000
    } satisfies CascadeDeleteLimits;
  }
  return inputs.limits as unknown as CascadeDeleteLimits;
}

function cascadeNodeOptions() {
  const ids = [cascadeRootInput().id, ...cascadeRelations().map((relation) => relation.id)];
  return Array.from(new Set(ids.filter((id): id is string => typeof id === 'string' && Boolean(id.trim()))));
}

function getFieldEntries() {
  const fields = blockInputs().fields;
  return isRecord(fields) ? Object.entries(fields) : [];
}

function addFieldMapping() {
  const fields = ensureRecordInput('fields');
  fields.name = makeTemplate('request.body.name');
}

function updateFieldMapping(oldKey: string, newKey: string, value: unknown) {
  const fields = ensureRecordInput('fields');
  delete fields[oldKey];
  fields[newKey || oldKey] = value;
}

function removeFieldMapping(key: string) {
  const fields = ensureRecordInput('fields');
  delete fields[key];
}

function ensureRecordInput(key: string) {
  const inputs = blockInputs();
  if (!isRecord(inputs[key])) {
    inputs[key] = {};
  }
  return inputs[key] as Record<string, unknown>;
}

function conditionList() {
  const inputs = blockInputs();
  if (!Array.isArray(inputs.conditions)) {
    inputs.conditions = [];
  }
  return inputs.conditions as Condition[];
}

function addCondition() {
  conditionList().push({
    group: false,
    fieldName: 'id',
    conditionType: 'EQ',
    fieldValue: makeTemplate('request.query.id')
  });
}

function addConditionGroup() {
  conditionList().push({
    group: true,
    groupType: 'OR',
    groups: [
      {
        group: false,
        fieldName: 'plan',
        conditionType: 'EQ',
        fieldValue: 'free'
      },
      {
        group: false,
        fieldName: 'plan',
        conditionType: 'EQ',
        fieldValue: 'pro'
      }
    ]
  });
}

function removeCondition(index: number) {
  conditionList().splice(index, 1);
}

function updateConditionGroupJson(condition: Extract<Condition, { group: true }>, value: string) {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      condition.groups = parsed;
    }
  } catch {
    // Keep the last valid group while the user is typing partial JSON.
  }
}

function orderList() {
  const inputs = blockInputs();
  if (!Array.isArray(inputs.orderBy)) {
    inputs.orderBy = [];
  }
  return inputs.orderBy as Array<{ fieldName: string; direction: 'ASC' | 'DESC' }>;
}

function addOrderBy() {
  orderList().push({ fieldName: 'created_at', direction: 'DESC' });
}

function removeOrderBy(index: number) {
  orderList().splice(index, 1);
}

function getResponseEntries() {
  const response = ensureResponseObject();
  return Object.entries(response);
}

function writeResponseEntries(entries: Array<[string, unknown]>) {
  const response = ensureResponseObject();
  Object.keys(response).forEach((key) => delete response[key]);
  entries.forEach(([key, value]) => {
    response[key] = value;
  });
}

function nextResponseFieldKey(response: Record<string, unknown>) {
  if (!Object.prototype.hasOwnProperty.call(response, 'data')) {
    return 'data';
  }

  let index = 1;
  let key = `data_${index}`;
  while (Object.prototype.hasOwnProperty.call(response, key)) {
    index += 1;
    key = `data_${index}`;
  }
  return key;
}

function getSelectedResponseTerminalLabel() {
  return responseTerminals.value.find((terminal) => terminal.uuid === selectedResponseTerminalUuid.value)?.label || selectedResponseTerminalUuid.value;
}

function selectResponseTerminal(uuid: string) {
  selectedResponseTerminalUuid.value = uuid;
  ensureResponseObject();
}

function ensureResponseObject() {
  if (!activeDraft.value) return {};
  const apiJson = activeDraft.value.apiJson;

  if (usesTerminalResponses.value) {
    const terminalUuid = selectedResponseTerminalUuid.value || responseTerminals.value[0]?.uuid || 'starter';
    selectedResponseTerminalUuid.value = terminalUuid;
    apiJson.responses ??= {};
    if (!Object.prototype.hasOwnProperty.call(apiJson.responses, terminalUuid)) {
      apiJson.responses[terminalUuid] = hasDefaultResponse(apiJson)
        ? cloneValue(apiJson.response ?? null)
        : null;
    }
    if (!isRecord(apiJson.responses[terminalUuid])) {
      apiJson.responses[terminalUuid] = {};
    }
    return apiJson.responses[terminalUuid] as Record<string, unknown>;
  }

  if (!isRecord(apiJson.response)) {
    apiJson.response = {};
  }
  return apiJson.response as Record<string, unknown>;
}

function addResponseField() {
  const response = ensureResponseObject();
  response[nextResponseFieldKey(response)] = variableOptions.value[0] ? makeTemplate(variableOptions.value[0].path) : null;
}

function updateResponseField(index: number, key: string, value: unknown) {
  const entries = getResponseEntries();
  if (!entries[index]) return;
  entries[index] = [key, value];
  writeResponseEntries(entries);
}

function removeResponseField(index: number) {
  const entries = getResponseEntries();
  if (!entries[index]) return;
  entries.splice(index, 1);
  writeResponseEntries(entries);
}

function renameResponseTerminal(previous: string, next: string) {
  if (!activeDraft.value || !previous || !next || previous === next) return;
  const responses = activeDraft.value.apiJson.responses;
  if (responses && Object.prototype.hasOwnProperty.call(responses, previous)) {
    if (!Object.prototype.hasOwnProperty.call(responses, next)) {
      responses[next] = responses[previous] as ResponseConfig;
    }
    delete responses[previous];
  }
  if (selectedResponseTerminalUuid.value === previous) {
    selectedResponseTerminalUuid.value = next;
  }
}

function removeResponseTerminal(uuid: string) {
  if (!activeDraft.value) return;
  if (activeDraft.value.apiJson.responses) {
    delete activeDraft.value.apiJson.responses[uuid];
  }
  if (selectedResponseTerminalUuid.value === uuid) {
    selectedResponseTerminalUuid.value = '';
  }
}

function setTemplateValue(target: (value: unknown) => void, path: string) {
  if (!path) return;
  target(makeTemplate(path));
}

function formatUnknown(value: unknown) {
  if (value === undefined) return '';
  if (isRecord(value) && typeof value.template === 'string') return value.template;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function parseLooseValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) {
    return { template: trimmed };
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function updateParamFromText(processor: ProcessorConfig, value: string) {
  if (typeof processor === 'string') return;
  processor.param = parseLooseValue(value);
}

function processorLabel(processor: ProcessorConfig) {
  const name = processorName(processor);
  return getProcessorDefinition(name)?.title ?? name;
}

function executeFragmentTargets(apiJson: ApiJson) {
  return [...new Set((apiJson.blocks ?? [])
    .filter((block): block is ApiStandardBlock => isStandardBlock(block) && block.functionName === 'executeFragment')
    .map((block) => block.inputs?.fragmentUuid)
    .filter((uuid): uuid is string => typeof uuid === 'string' && Boolean(uuid.trim()))
    .map((uuid) => uuid.trim()))];
}

async function assertFragmentReferencesForSource(apiJson: ApiJson, source: MokelayApiSource) {
  for (const uuid of executeFragmentTargets(apiJson)) {
    const key = fragmentDetailKey(source, uuid);
    let record = fragmentDetails.value.get(key);
    if (!record) {
      try {
        record = await getApiBySource(uuid, source, { fragment: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : '目标不存在';
        throw new Error(`${source === 'system' ? '内置' : '用户'} API 只能引用同来源 Fragment：${uuid}（${message}）`);
      }
    }
    if (record.source !== source || !record.fragment || !record.apiJson || !isFragmentApiJson(record.apiJson)) {
      throw new Error(`${source === 'system' ? '内置' : '用户'} API 只能引用同来源 Fragment：${uuid}`);
    }
    const next = new Map(fragmentDetails.value);
    next.set(key, record);
    fragmentDetails.value = next;
  }
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function copyJson() {
  if (!activeApiJson.value) return;
  void navigator.clipboard?.writeText(stringifyJson(activeApiJson.value));
}

function updateTestValue(location: RequestLocation, key: string, value: string) {
  testRequest.value = {
    ...testRequest.value,
    [location]: {
      ...testRequest.value[location],
      [key]: parseLooseValue(value)
    }
  };
}

function updateTestParam(key: string, value: string) {
  testRequest.value = {
    ...testRequest.value,
    params: {
      ...testRequest.value.params,
      [key]: parseLooseValue(value)
    }
  };
}

async function runTest() {
  if (!activeDraft.value) return;
  const apiJson = generateApiJson(activeDraft.value);
  const source = activeDraft.value.source;
  const result = await runDryApiTest(apiJson, testRequest.value, {
    resolveFragment: async (uuid) => {
      const record = await getApiBySource(uuid, source, { fragment: true });
      if (record.source !== source || !record.fragment || !record.apiJson || !isFragmentApiJson(record.apiJson)) {
        throw new Error(`${source === 'system' ? '内置' : '用户'} Fragment ${uuid} 不存在或类型不正确。`);
      }
      return record.apiJson;
    }
  });
  lastTestResult.value = result;
  appendTestCase(activeDraft.value, {
    id: `test_${Date.now()}`,
    name: result.ok ? 'Dry-run 通过' : 'Dry-run 失败',
    request: result.request,
    result,
    createdAt: new Date().toISOString()
  });
  bottomTab.value = 'test';
}

function resetTestForm() {
  if (!activeApiJson.value) return;
  testRequest.value = createRequestSnapshot(activeApiJson.value);
}

function splitFields(value: string | string[]) {
  if (Array.isArray(value)) return value.map((field) => field.trim()).filter(Boolean);
  return value.split(',').map((field) => field.trim()).filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
</script>

<template>
  <section ref="editorRoot" data-testid="api-builder-shell" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <div v-if="isListMode" class="flex flex-1 flex-col gap-4">
      <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">API Builder</p>
            <h2 class="mt-1 text-xl font-semibold text-slate-950 dark:text-white">可视化搭建内部数据 API</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">API 与 Fragment 共用同一套编排能力；Fragment 只能通过 ExecuteFragment 调用。</p>
          </div>
          <div v-if="apiListSource === 'user'" class="flex gap-2">
            <button data-testid="api-builder-new-fragment" class="builder-secondary-button" @click="openCreateDialog(true)">新建 Fragment</button>
            <button data-testid="api-builder-new" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white" @click="openCreateDialog(false)">新建 API</button>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button data-testid="api-source-user" class="builder-nav-button" :class="{ 'builder-nav-button-active': apiListSource === 'user' }" @click="switchApiListSource('user')">用户编排</button>
          <button data-testid="api-source-system" class="builder-nav-button" :class="{ 'builder-nav-button-active': apiListSource === 'system' }" @click="switchApiListSource('system')">系统内置</button>
        </div>
      </section>

      <p v-if="apiBuilderError" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{{ apiBuilderError }}</p>

      <section v-if="apiListSource === 'user' && apiSamples.length" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 class="text-base font-semibold text-slate-950 dark:text-white">内置样例</h3>
        <div class="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <button v-for="sample in apiSamples" :key="sample.uuid" class="rounded-lg border border-slate-200 p-3 text-left hover:border-teal-400 dark:border-slate-700" @click="openCreateDialog(false, sample)">
            <strong class="block">{{ sample.title }}</strong>
            <small class="mt-1 block text-slate-500">{{ sample.description }}</small>
          </button>
        </div>
      </section>

      <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p v-if="isApiListLoading" class="p-6 text-center text-sm text-slate-500">正在加载...</p>
        <table v-else class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th class="px-4 py-3">名称</th>
              <th class="px-4 py-3">UUID</th>
              <th class="px-4 py-3">类型</th>
              <th v-if="apiListSource === 'user'" class="px-4 py-3">状态</th>
              <th v-if="apiListSource === 'user'" class="px-4 py-3">最近编辑</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="record in apiList" :key="record.uuid">
              <td class="px-4 py-3 font-medium">{{ record.name }}</td>
              <td class="px-4 py-3 font-mono text-xs">{{ record.uuid }}</td>
              <td class="px-4 py-3"><span class="rounded bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">{{ record.fragment ? 'Fragment' : record.method }}</span></td>
              <td v-if="apiListSource === 'user'" class="px-4 py-3">{{ record.status === 'published' ? '已发布' : '草稿' }}</td>
              <td v-if="apiListSource === 'user'" class="px-4 py-3 text-slate-500">{{ record.updatedAt || '-' }}</td>
              <td class="px-4 py-3 text-right">
                <button class="builder-small-button" @click="openApiRecord(record)">打开</button>
                <button v-if="record.source !== 'system'" class="ml-2 text-xs text-rose-600" @click="removeApiRecord(record)">删除</button>
              </td>
            </tr>
            <tr v-if="!apiList.length">
              <td :colspan="apiListSource === 'user' ? 6 : 4" class="px-4 py-8 text-center text-slate-500">暂无 API 或 Fragment。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <div v-else-if="activeDraft && activeApiJson" class="flex flex-1 flex-col gap-4">
      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p v-if="apiBuilderError" class="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ apiBuilderError }}</p>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button class="mb-2 text-sm font-medium text-teal-700 hover:text-teal-500 dark:text-teal-300" @click="navigateToList">返回 API 列表</button>
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-xl font-semibold text-slate-950 dark:text-white">{{ activeDraft.apiJson.alias || (isActiveFragment ? '未命名 Fragment' : '未命名 API') }}</h2>
              <span class="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">{{ isActiveFragment ? 'Fragment' : activeDraft.apiJson.method }}</span>
              <span v-if="!isActiveApiReadonly" class="rounded-md px-2 py-1 text-xs font-semibold" :class="activeDraft.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100'">
                {{ activeDraft.status === 'published' ? '已发布' : '草稿' }}
              </span>
              <span v-else class="rounded-md bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-100">系统内置</span>
              <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ isActiveFragment ? activeDraft.apiJson.uuid : `/api/mokelay/${activeDraft.apiJson.uuid}` }}</code>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="builder-secondary-button" @click="duplicateCurrentDraft">复制{{ isActiveFragment ? ' Fragment' : ' API' }}</button>
            <button v-if="!isActiveApiReadonly" class="builder-secondary-button disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSavingApi" @click="saveActiveDraft">{{ isSavingApi ? '保存中...' : '保存' }}</button>
            <button v-if="!isActiveApiReadonly" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSavingApi" @click="publishApi">发布</button>
          </div>
        </div>
      </section>

      <div class="grid min-h-[660px] flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_380px]">
        <aside class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="grid grid-cols-3 gap-2">
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'api' }" @click="selection = { type: 'api' }">入口</button>
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'request' }" @click="selection = { type: 'request' }">{{ isActiveFragment ? 'Params' : '请求' }}</button>
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'response' }" @click="selection = { type: 'response' }">{{ isActiveFragment ? 'Outputs' : '响应' }}</button>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">查询数据</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.query" :key="block.functionName" class="builder-palette-button disabled:cursor-not-allowed disabled:opacity-50" :disabled="isActiveApiReadonly" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">写入数据</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.write" :key="block.functionName" class="builder-palette-button disabled:cursor-not-allowed disabled:opacity-50" :disabled="isActiveApiReadonly" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">登录态</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.session" :key="block.functionName" class="builder-palette-button disabled:cursor-not-allowed disabled:opacity-50" :disabled="isActiveApiReadonly" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">工具</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.utility" :key="block.functionName" class="builder-palette-button disabled:cursor-not-allowed disabled:opacity-50" :disabled="isActiveApiReadonly" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div v-if="!isActiveFragment">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">逻辑片段</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.fragment" :key="block.functionName" data-testid="api-add-execute-fragment" class="builder-palette-button disabled:cursor-not-allowed disabled:opacity-50" :disabled="isActiveApiReadonly" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">控制器</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="controller in groupedControllers" :key="controller.functionName" class="builder-palette-button disabled:cursor-not-allowed disabled:opacity-50" :disabled="isActiveApiReadonly" @click="addController(controller.functionName)">
                <span>{{ controller.title }}</span>
                <small>{{ controller.description }}</small>
              </button>
            </div>
          </div>
        </aside>

        <main class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-950 dark:text-white">编排画布</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">从 starter 开始，通过连线决定 block 和 controller 的执行流。</p>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <button data-testid="api-flow-auto-layout" class="builder-secondary-button px-3 py-1.5 text-xs" @click="autoArrangeGraph">
                自动整理
              </button>
              <span class="rounded-md bg-rose-100 px-2 py-1 font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">{{ issueCount('error') }} 错误</span>
              <span class="rounded-md bg-amber-100 px-2 py-1 font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">{{ issueCount('warning') }} 提醒</span>
            </div>
          </div>

          <MApiOrchestrationFlowCanvas
            class="mt-4 h-[560px]"
            :flow-id="flowId"
            :nodes="graphNodes"
            :edges="graphEdges"
            :nodes-draggable="true"
            :nodes-connectable="!isActiveApiReadonly"
            @connect="onFlowConnect"
            @edge-click="onFlowEdgeClick"
            @node-click="onFlowNodeClick"
            @node-drag-stop="onFlowNodeDragStop"
          />
        </main>

        <aside class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p v-if="isActiveApiReadonly" class="mb-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-800 dark:bg-violet-500/10 dark:text-violet-100">系统内置接口为只读，可以查看、测试或复制为用户接口。</p>
          <fieldset :disabled="isActiveApiReadonly" class="contents">
          <template v-if="selection.type === 'api'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">{{ isActiveFragment ? 'Fragment 配置' : '接口入口' }}</h3>
            <div class="mt-4 space-y-3">
              <label class="builder-field">
                <span>接口名称</span>
                <input v-model="activeDraft.apiJson.alias" class="builder-input">
              </label>
              <label class="builder-field">
                <span>API 标识</span>
                <input v-model="activeDraft.apiJson.uuid" class="builder-input font-mono">
              </label>
              <label v-if="!isActiveFragment" class="builder-field">
                <span>请求方法</span>
                <select v-model="activeDraft.apiJson.method" class="builder-input">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </label>
              <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {{ isActiveFragment ? 'Fragment UUID：' : '路径预览：' }}<code>{{ isActiveFragment ? activeDraft.apiJson.uuid : `/api/mokelay/${activeDraft.apiJson.uuid}` }}</code>
              </div>
              <button class="builder-secondary-button w-full disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSavingApi" @click="saveActiveDraft">
                {{ isSavingApi ? '保存中...' : '保存基本信息' }}
              </button>
            </div>
          </template>

          <template v-else-if="selection.type === 'request'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">{{ isActiveFragment ? 'Params 参数' : '请求参数' }}</h3>
            <div v-if="isActiveFragment" class="mt-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm text-slate-500 dark:text-slate-400">声明调用 Fragment 时必须映射的输入参数。</p>
                <button data-testid="fragment-add-param" class="builder-small-button" @click="addFragmentParam">添加参数</button>
              </div>
              <div v-for="(param, index) in getFragmentParams()" :key="`params-${index}`" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input class="builder-input" :value="getRequestKey(param)" data-testid="fragment-param-key" placeholder="参数名" @input="updateFragmentParamKey(index, ($event.target as HTMLInputElement).value)">
                  <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input type="checkbox" :checked="isRequestRequired(param)" @change="toggleFragmentParamRequired(index)">
                    必填
                  </label>
                </div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="(processor, processorIndex) in getRequestProcessors(param)" :key="processorIndex" class="rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-500/20 dark:text-teal-100">
                    {{ processorLabel(processor) }}
                    <button class="ml-1" @click="removeFragmentParamProcessor(index, processorIndex)">×</button>
                  </span>
                  <select class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" @change="addFragmentParamProcessor(index, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                    <option value="">添加规则</option>
                    <option v-for="processor in processorDefinitions" :key="processor.name" :value="processor.name">{{ processor.title }}</option>
                  </select>
                  <button class="ml-auto text-xs text-rose-600" @click="removeFragmentParam(index)">删除</button>
                </div>
              </div>
            </div>
            <div v-else class="mt-4 space-y-5">
              <section v-for="location in requestLocations" :key="location.value">
                <div class="mb-2 flex items-center justify-between">
                  <h4 class="text-sm font-semibold text-slate-900 dark:text-white">{{ location.title }}</h4>
                  <button class="builder-small-button" @click="addRequestParam(location.value)">添加参数</button>
                </div>
                <div class="space-y-2">
                  <div v-for="(param, index) in getRequestList(location.value)" :key="`${location.value}-${index}`" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <input class="builder-input" :value="getRequestKey(param)" placeholder="参数名" @input="updateRequestKey(location.value, index, ($event.target as HTMLInputElement).value)">
                      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input type="checkbox" :checked="isRequestRequired(param)" @change="toggleRequired(location.value, index)">
                        必填
                      </label>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span v-for="(processor, processorIndex) in getRequestProcessors(param)" :key="processorIndex" class="rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-500/20 dark:text-teal-100">
                        {{ processorLabel(processor) }}
                        <button class="ml-1" @click="removeRequestProcessor(location.value, index, processorIndex)">×</button>
                      </span>
                      <select class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" @change="addRequestProcessor(location.value, index, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                        <option value="">添加规则</option>
                        <option v-for="processor in processorDefinitions" :key="processor.name" :value="processor.name">{{ processor.title }}</option>
                      </select>
                      <button class="ml-auto text-xs text-rose-600" @click="removeRequestParam(location.value, index)">删除</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </template>

          <template v-else-if="selection.type === 'response'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">{{ isActiveFragment ? 'Outputs 组装' : '响应组装' }}</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ isActiveFragment ? 'Fragment 的 outputs 会被调用方包装到 ExecuteFragment.outputs.result。' : '把变量映射到响应 data 的字段。' }}</p>
            <div v-if="usesTerminalResponses" class="mt-4">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="terminal in responseTerminals"
                  :key="terminal.uuid"
                  class="builder-small-button"
                  :class="{ 'border-teal-500 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-teal-500/10 dark:text-teal-100': selectedResponseTerminalUuid === terminal.uuid }"
                  :data-testid="`api-response-terminal-${terminal.uuid}`"
                  @click="selectResponseTerminal(terminal.uuid)"
                >
                  {{ terminal.label }}
                </button>
              </div>
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">当前终点：{{ getSelectedResponseTerminalLabel() || '未选择' }}</p>
            </div>
            <div class="mt-4 space-y-3">
              <div v-for="([key, value], index) in getResponseEntries()" :key="`${selectedResponseTerminalUuid || 'default'}-${index}`" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <input class="builder-input" :value="key" data-testid="api-response-field-key" @input="updateResponseField(index, ($event.target as HTMLInputElement).value, value)">
                <div class="mt-2 grid gap-2">
                  <input class="builder-input font-mono text-xs" :value="formatUnknown(value)" @input="updateResponseField(index, key, parseLooseValue(($event.target as HTMLInputElement).value))">
                  <select class="builder-input" @change="setTemplateValue((next) => updateResponseField(index, key, next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                    <option value="">从变量选择器填入</option>
                    <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }} · {{ option.path }}</option>
                  </select>
                </div>
                <button class="mt-2 text-xs text-rose-600" @click="removeResponseField(index)">删除字段</button>
              </div>
              <button class="builder-secondary-button w-full" @click="addResponseField">添加{{ isActiveFragment ? ' output' : '响应字段' }}</button>
            </div>
          </template>

          <template v-else-if="selection.type === 'starter'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">Starter Block</h3>
            <div class="mt-4 space-y-3">
              <label class="builder-field">
                <span>UUID</span>
                <input value="starter" class="builder-input font-mono" disabled>
              </label>
              <label class="builder-field">
                <span>下一个节点</span>
                <select class="builder-input" :value="starterBlock?.nextBlock ?? ''" @change="setNextBlock('starter', 'next', ($event.target as HTMLSelectElement).value || null)">
                  <option value="">null</option>
                  <option v-for="option in executableTargetOptions()" :key="option.uuid" :value="option.uuid">{{ option.label }}</option>
                </select>
              </label>
            </div>
          </template>

          <template v-else-if="activeStandardBlock">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">步骤配置</h3>
            <div class="mt-4 space-y-3">
              <label class="builder-field">
                <span>业务名称</span>
                <input v-model="activeStandardBlock.alias" class="builder-input">
              </label>
              <label class="builder-field">
                <span>Block UUID</span>
                <input :value="activeStandardBlock.uuid" class="builder-input font-mono" @input="updateActiveBlockUuid(($event.target as HTMLInputElement).value)">
              </label>
              <label class="builder-field">
                <span>类型</span>
                <input :value="getBlockDefinition(activeStandardBlock.functionName)?.title || activeStandardBlock.functionName" class="builder-input" disabled>
              </label>
              <label class="builder-field">
                <span>下一个节点</span>
                <select class="builder-input" :value="activeStandardBlock.nextBlock ?? ''" @change="setNextBlock(activeStandardBlock.uuid, 'next', ($event.target as HTMLSelectElement).value || null)">
                  <option value="">null</option>
                  <option v-for="option in executableTargetOptions(activeStandardBlock.uuid)" :key="option.uuid" :value="option.uuid">{{ option.label }}</option>
                </select>
              </label>
              <label class="builder-field">
                <span>错误处理</span>
                <select
                  data-testid="block-error-next-block"
                  class="builder-input"
                  :value="errorNextBlockSelectValue(activeStandardBlock)"
                  @change="updateErrorNextBlock(activeStandardBlock, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="__unhandled__">未捕获（抛错）</option>
                  <option value="__terminal__">终止（使用当前 Block 响应）</option>
                  <option v-for="option in executableTargetOptions(activeStandardBlock.uuid)" :key="option.uuid" :value="option.uuid">目标 Block：{{ option.label }}</option>
                </select>
              </label>

              <template v-if="activeStandardBlock.functionName === 'executeFragment'">
                <label class="builder-field">
                  <span>目标 Fragment</span>
                  <select data-testid="execute-fragment-picker" class="builder-input" :value="selectedFragmentUuid" @change="selectFragment(($event.target as HTMLSelectElement).value)">
                    <option value="">{{ isLoadingFragments ? '加载中...' : '请选择已发布 Fragment' }}</option>
                    <option v-for="fragment in fragmentOptions" :key="fragment.uuid" :value="fragment.uuid">{{ fragment.name }} · {{ fragment.uuid }}</option>
                  </select>
                </label>
                <div class="flex gap-2">
                  <button v-if="!isActiveApiReadonly" type="button" class="builder-secondary-button flex-1" :disabled="!selectedFragmentUuid" @click="openFragmentEditor()">编排 Fragment</button>
                  <button v-if="!isActiveApiReadonly" type="button" class="builder-secondary-button flex-1" @click="openFragmentEditor('')">新建 Fragment</button>
                </div>
                <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Params 映射</h4>
                    <code class="text-xs text-slate-500">outputs: ['result']</code>
                  </div>
                  <p v-if="!selectedFragmentParams.length" class="text-xs text-slate-500 dark:text-slate-400">选择 Fragment 后按其 params 配置输入。</p>
                  <label v-for="param in selectedFragmentParams" :key="declarationKey(param)" class="builder-field mt-2">
                    <span>{{ declarationKey(param) }}</span>
                    <input class="builder-input font-mono text-xs" :data-testid="`execute-fragment-param-${declarationKey(param)}`" :value="formatUnknown(fragmentParamMappings()[declarationKey(param)])" @input="updateFragmentParamMapping(declarationKey(param), parseLooseValue(($event.target as HTMLInputElement).value))">
                    <select class="builder-input" @change="setTemplateValue((next) => updateFragmentParamMapping(declarationKey(param), next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                      <option value="">选择变量</option>
                      <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                    </select>
                  </label>
                </div>
              </template>

              <template v-if="activeStandardBlock.functionName === 'cascadeDelete'">
                <label class="builder-field">
                  <span>数据源</span>
                  <input data-testid="cascade-delete-datasource" class="builder-input" :value="stringInput('datasource')" @input="updateBlockInput('datasource', ($event.target as HTMLInputElement).value)">
                </label>

                <section class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Root 节点</h4>
                    <button data-testid="cascade-add-root-condition" class="builder-small-button" @click="addCascadeCondition(cascadeRootInput())">添加条件</button>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-3">
                    <label class="builder-field">
                      <span>节点 ID</span>
                      <input data-testid="cascade-root-id" class="builder-input" :value="cascadeRootInput().id" @input="cascadeRootInput().id = ($event.target as HTMLInputElement).value">
                    </label>
                    <label class="builder-field">
                      <span>表名</span>
                      <input data-testid="cascade-root-table" class="builder-input" :value="cascadeRootInput().table" @input="cascadeRootInput().table = ($event.target as HTMLInputElement).value">
                    </label>
                    <label class="builder-field">
                      <span>主键字段</span>
                      <input data-testid="cascade-root-key-field" class="builder-input" :value="cascadeRootInput().keyField" @input="cascadeRootInput().keyField = ($event.target as HTMLInputElement).value">
                    </label>
                  </div>
                  <div class="mt-3 space-y-2">
                    <div v-for="(condition, index) in cascadeConditions(cascadeRootInput())" :key="index" class="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                      <template v-if="!condition.group">
                        <div class="grid gap-2 sm:grid-cols-2">
                          <input v-model="condition.fieldName" class="builder-input" placeholder="字段">
                          <select v-model="condition.conditionType" class="builder-input">
                            <option v-for="item in conditionTypes" :key="item.value" :value="item.value">{{ item.title }}</option>
                          </select>
                        </div>
                        <input class="builder-input mt-2 font-mono text-xs" :value="formatUnknown(condition.fieldValue)" @input="condition.fieldValue = parseLooseValue(($event.target as HTMLInputElement).value)">
                        <select class="builder-input mt-2" @change="setTemplateValue((next) => condition.fieldValue = next, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                          <option value="">选择变量</option>
                          <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                        </select>
                      </template>
                      <template v-else>
                        <select v-model="condition.groupType" class="builder-input">
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                        <textarea class="builder-input mt-2 min-h-24 font-mono text-xs" :value="stringifyJson(condition.groups)" @input="updateConditionGroupJson(condition, ($event.target as HTMLTextAreaElement).value)"></textarea>
                      </template>
                      <button class="mt-2 text-xs text-rose-600" @click="removeCascadeCondition(cascadeRootInput(), index)">删除条件</button>
                    </div>
                  </div>
                </section>

                <section class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Relations</h4>
                      <p class="mt-1 text-xs text-slate-500">显式配置父子关系；每张表只能对应一个节点。</p>
                    </div>
                    <button data-testid="cascade-add-relation" class="builder-small-button" @click="addCascadeRelation">添加关系</button>
                  </div>
                  <div class="space-y-3">
                    <article v-for="(relation, relationIndex) in cascadeRelations()" :key="relationIndex" class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                      <div class="grid gap-2 sm:grid-cols-2">
                        <label class="builder-field">
                          <span>节点 ID</span>
                          <input v-model="relation.id" :data-testid="`cascade-relation-${relationIndex}-id`" class="builder-input">
                        </label>
                        <label class="builder-field">
                          <span>表名</span>
                          <input v-model="relation.table" :data-testid="`cascade-relation-${relationIndex}-table`" class="builder-input">
                        </label>
                        <label class="builder-field">
                          <span>主键字段</span>
                          <input v-model="relation.keyField" :data-testid="`cascade-relation-${relationIndex}-key-field`" class="builder-input">
                        </label>
                        <label class="builder-field">
                          <span>父节点</span>
                          <select v-model="relation.parent" :data-testid="`cascade-relation-${relationIndex}-parent`" class="builder-input">
                            <option value="">请选择父节点</option>
                            <option v-for="nodeId in cascadeNodeOptions()" :key="nodeId" :value="nodeId">{{ nodeId }}</option>
                          </select>
                        </label>
                        <label class="builder-field sm:col-span-2">
                          <span>外键字段</span>
                          <input v-model="relation.foreignKey" :data-testid="`cascade-relation-${relationIndex}-foreign-key`" class="builder-input">
                        </label>
                      </div>
                      <div class="mt-3 flex items-center justify-between gap-2">
                        <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">附加条件</span>
                        <button class="builder-small-button" @click="addCascadeCondition(relation)">添加条件</button>
                      </div>
                      <div class="mt-2 space-y-2">
                        <div v-for="(condition, conditionIndex) in cascadeConditions(relation)" :key="conditionIndex" class="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                          <template v-if="!condition.group">
                            <div class="grid gap-2 sm:grid-cols-2">
                              <input v-model="condition.fieldName" class="builder-input" placeholder="字段">
                              <select v-model="condition.conditionType" class="builder-input">
                                <option v-for="item in conditionTypes" :key="item.value" :value="item.value">{{ item.title }}</option>
                              </select>
                            </div>
                            <input class="builder-input mt-2 font-mono text-xs" :value="formatUnknown(condition.fieldValue)" @input="condition.fieldValue = parseLooseValue(($event.target as HTMLInputElement).value)">
                            <select class="builder-input mt-2" @change="setTemplateValue((next) => condition.fieldValue = next, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                              <option value="">选择变量</option>
                              <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                            </select>
                          </template>
                          <template v-else>
                            <select v-model="condition.groupType" class="builder-input">
                              <option value="AND">AND</option>
                              <option value="OR">OR</option>
                            </select>
                            <textarea class="builder-input mt-2 min-h-24 font-mono text-xs" :value="stringifyJson(condition.groups)" @input="updateConditionGroupJson(condition, ($event.target as HTMLTextAreaElement).value)"></textarea>
                          </template>
                          <button class="mt-2 text-xs text-rose-600" @click="removeCascadeCondition(relation, conditionIndex)">删除条件</button>
                        </div>
                      </div>
                      <button class="mt-3 text-xs text-rose-600" @click="removeCascadeRelation(relationIndex)">删除关系</button>
                    </article>
                    <p v-if="!cascadeRelations().length" class="text-xs text-slate-500">没有子节点时可保持空数组。</p>
                  </div>
                </section>

                <section class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Collect</h4>
                      <p class="mt-1 text-xs text-slate-500">在删除前收集节点字段，供后续 Block 使用。</p>
                    </div>
                    <button data-testid="cascade-add-collect" class="builder-small-button" @click="addCascadeCollect">添加收集项</button>
                  </div>
                  <div class="space-y-3">
                    <article v-for="(collect, collectIndex) in cascadeCollectItems()" :key="collectIndex" class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                      <div class="grid gap-2 sm:grid-cols-2">
                        <label class="builder-field">
                          <span>输出 key</span>
                          <input v-model="collect.key" :data-testid="`cascade-collect-${collectIndex}-key`" class="builder-input">
                        </label>
                        <label class="builder-field">
                          <span>节点</span>
                          <select v-model="collect.node" :data-testid="`cascade-collect-${collectIndex}-node`" class="builder-input">
                            <option value="">请选择节点</option>
                            <option v-for="nodeId in cascadeNodeOptions()" :key="nodeId" :value="nodeId">{{ nodeId }}</option>
                          </select>
                        </label>
                        <label class="builder-field">
                          <span>模式</span>
                          <select v-model="collect.mode" :data-testid="`cascade-collect-${collectIndex}-mode`" class="builder-input">
                            <option value="values">values</option>
                            <option value="rows">rows</option>
                          </select>
                        </label>
                        <label class="flex items-center gap-2 self-end pb-2 text-sm text-slate-600 dark:text-slate-300">
                          <input v-model="collect.distinct" type="checkbox">
                          去重 distinct
                        </label>
                      </div>

                      <div class="mt-3">
                        <div class="mb-2 flex items-center justify-between">
                          <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Fields</span>
                          <button class="builder-small-button" @click="addCascadeCollectField(collect)">添加字段</button>
                        </div>
                        <div class="space-y-2">
                          <div v-for="(field, fieldIndex) in cascadeCollectFields(collect)" :key="fieldIndex" class="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                            <input class="builder-input" :data-testid="`cascade-collect-${collectIndex}-field-${fieldIndex}`" :value="declarationKey(field)" @input="updateCascadeCollectFieldKey(collect, fieldIndex, ($event.target as HTMLInputElement).value)">
                            <textarea class="builder-input mt-2 min-h-20 font-mono text-xs" :data-testid="`cascade-collect-${collectIndex}-field-${fieldIndex}-processors`" :value="stringifyJson(cascadeCollectFieldProcessors(field))" placeholder="processors JSON（可选）" @input="updateCascadeCollectFieldProcessors(collect, fieldIndex, ($event.target as HTMLTextAreaElement).value)"></textarea>
                            <button class="mt-2 text-xs text-rose-600" @click="removeCascadeCollectField(collect, fieldIndex)">删除字段</button>
                          </div>
                        </div>
                      </div>

                      <div class="mt-3">
                        <div class="mb-2 flex items-center justify-between">
                          <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Order By</span>
                          <button class="builder-small-button" @click="addCascadeCollectOrderBy(collect)">添加排序</button>
                        </div>
                        <div class="space-y-2">
                          <div v-for="(order, orderIndex) in cascadeCollectOrderBy(collect)" :key="orderIndex" class="grid grid-cols-[minmax(0,1fr)_96px_auto] gap-2">
                            <input v-model="order.fieldName" class="builder-input" placeholder="字段">
                            <select v-model="order.direction" class="builder-input">
                              <option value="ASC">ASC</option>
                              <option value="DESC">DESC</option>
                            </select>
                            <button class="text-xs text-rose-600" @click="removeCascadeCollectOrderBy(collect, orderIndex)">删除</button>
                          </div>
                        </div>
                      </div>
                      <button class="mt-3 text-xs text-rose-600" @click="removeCascadeCollect(collectIndex)">删除收集项</button>
                    </article>
                    <p v-if="!cascadeCollectItems().length" class="text-xs text-slate-500">不需要向后续步骤传值时可保持空数组。</p>
                  </div>
                </section>

                <section class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <h4 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">安全限制 Limits</h4>
                  <div class="grid gap-2 sm:grid-cols-3">
                    <label class="builder-field">
                      <span>maxRootRows</span>
                      <input data-testid="cascade-limit-max-root-rows" type="number" min="0" max="10000" class="builder-input" :value="cascadeLimitsInput().maxRootRows" @input="cascadeLimitsInput().maxRootRows = Number(($event.target as HTMLInputElement).value)">
                    </label>
                    <label class="builder-field">
                      <span>maxAffectedRows</span>
                      <input data-testid="cascade-limit-max-affected-rows" type="number" min="0" max="1000000" class="builder-input" :value="cascadeLimitsInput().maxAffectedRows" @input="cascadeLimitsInput().maxAffectedRows = Number(($event.target as HTMLInputElement).value)">
                    </label>
                    <label class="builder-field">
                      <span>maxCollectedRows</span>
                      <input data-testid="cascade-limit-max-collected-rows" type="number" min="0" max="100000" class="builder-input" :value="cascadeLimitsInput().maxCollectedRows" @input="cascadeLimitsInput().maxCollectedRows = Number(($event.target as HTMLInputElement).value)">
                    </label>
                  </div>
                </section>
              </template>

              <template v-if="activeStandardBlock.functionName === 'dropSchemas'">
                <label class="builder-field">
                  <span>数据源</span>
                  <input data-testid="drop-schemas-datasource" class="builder-input" :value="stringInput('datasource')" @input="updateBlockInput('datasource', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="builder-field">
                  <span>Schemas 数组或模板</span>
                  <input data-testid="drop-schemas-value" class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().schemas)" @input="updateBlockInput('schemas', parseLooseValue(($event.target as HTMLInputElement).value))">
                </label>
                <select data-testid="drop-schemas-variable" class="builder-input" @change="setTemplateValue((next) => updateBlockInput('schemas', next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">选择变量</option>
                  <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                </select>
                <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input data-testid="drop-schemas-cascade" type="checkbox" :checked="blockInputs().cascade === true" @change="updateBlockInput('cascade', ($event.target as HTMLInputElement).checked)">
                  使用 DROP SCHEMA CASCADE
                </label>
              </template>

              <template v-if="['list', 'page', 'count', 'read', 'delete', 'create', 'upsert', 'update', 'assertUnique'].includes(activeStandardBlock.functionName)">
                <label class="builder-field">
                  <span>数据源</span>
                  <input class="builder-input" :value="stringInput('datasource')" @input="updateBlockInput('datasource', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="builder-field">
                  <span>表名</span>
                  <input class="builder-input" :value="stringInput('table')" @input="updateBlockInput('table', ($event.target as HTMLInputElement).value)">
                </label>
              </template>

              <template v-if="activeStandardBlock.functionName === 'assertUnique'">
                <label class="builder-field">
                  <span>唯一字段</span>
                  <input class="builder-input" :value="stringInput('fieldName')" @input="updateBlockInput('fieldName', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="builder-field">
                  <span>校验值</span>
                  <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().value)" @input="updateBlockInput('value', parseLooseValue(($event.target as HTMLInputElement).value))">
                </label>
                <select class="builder-input" @change="setTemplateValue((next) => updateBlockInput('value', next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">选择变量</option>
                  <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                </select>
                <label class="builder-field">
                  <span>冲突提示</span>
                  <input class="builder-input" :value="stringInput('message')" @input="updateBlockInput('message', ($event.target as HTMLInputElement).value)">
                </label>
              </template>

              <template v-if="activeStandardBlock.functionName === 'createSchema'">
                <label class="builder-field">
                  <span>数据源</span>
                  <input class="builder-input" :value="stringInput('datasource')" @input="updateBlockInput('datasource', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="builder-field">
                  <span>Schema</span>
                  <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().schema)" @input="updateBlockInput('schema', parseLooseValue(($event.target as HTMLInputElement).value))">
                </label>
                <select class="builder-input" @change="setTemplateValue((next) => updateBlockInput('schema', next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">选择变量</option>
                  <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                </select>
              </template>

              <template v-if="activeStandardBlock.functionName === 'randomId'">
                <label class="builder-field">
                  <span>Prefix</span>
                  <input class="builder-input" :value="stringInput('prefix')" @input="updateBlockInput('prefix', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="builder-field">
                  <span>Length</span>
                  <input type="number" min="1" max="32" class="builder-input" :value="Number(blockInputs().length ?? 6)" @input="updateBlockInput('length', Number(($event.target as HTMLInputElement).value))">
                </label>
                <label class="builder-field">
                  <span>Alphabet</span>
                  <input class="builder-input font-mono text-xs" :value="stringInput('alphabet')" @input="updateBlockInput('alphabet', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" :checked="blockInputs().lowerCase !== false" @change="updateBlockInput('lowerCase', ($event.target as HTMLInputElement).checked)">
                  转为小写
                </label>
              </template>

              <template v-if="['list', 'page', 'read'].includes(activeStandardBlock.functionName)">
                <label class="builder-field">
                  <span>查询字段</span>
                  <input class="builder-input" :value="arrayInput('fields')" placeholder="id, name, email" @input="updateArrayInput('fields', ($event.target as HTMLInputElement).value)">
                </label>
              </template>

              <template v-if="activeStandardBlock.functionName === 'page'">
                <div class="grid grid-cols-2 gap-2">
                  <label class="builder-field">
                    <span>页码</span>
                    <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().page)" @input="updateBlockInput('page', parseLooseValue(($event.target as HTMLInputElement).value))">
                  </label>
                  <label class="builder-field">
                    <span>每页数量</span>
                    <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().pageSize)" @input="updateBlockInput('pageSize', parseLooseValue(($event.target as HTMLInputElement).value))">
                  </label>
                </div>
              </template>

              <template v-if="['create', 'upsert'].includes(activeStandardBlock.functionName)">
                <label class="builder-field">
                  <span>ID 字段</span>
                  <input class="builder-input" :value="stringInput('idField')" @input="updateBlockInput('idField', ($event.target as HTMLInputElement).value)">
                </label>
              </template>

              <template v-if="['create', 'upsert', 'update'].includes(activeStandardBlock.functionName)">
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">写入字段</h4>
                    <button class="builder-small-button" @click="addFieldMapping">添加字段</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="[fieldKey, fieldValue] in getFieldEntries()" :key="fieldKey" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <input class="builder-input" :value="fieldKey" @input="updateFieldMapping(fieldKey, ($event.target as HTMLInputElement).value, fieldValue)">
                      <input class="builder-input mt-2 font-mono text-xs" :value="formatUnknown(fieldValue)" @input="updateFieldMapping(fieldKey, fieldKey, parseLooseValue(($event.target as HTMLInputElement).value))">
                      <select class="builder-input mt-2" @change="setTemplateValue((next) => updateFieldMapping(fieldKey, fieldKey, next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                        <option value="">选择变量</option>
                        <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                      </select>
                      <button class="mt-2 text-xs text-rose-600" @click="removeFieldMapping(fieldKey)">删除字段</button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="['list', 'page', 'count', 'read', 'delete', 'update'].includes(activeStandardBlock.functionName)">
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">条件</h4>
                    <div class="flex gap-1">
                      <button class="builder-small-button" @click="addCondition">添加条件</button>
                      <button class="builder-small-button" @click="addConditionGroup">添加 OR 组</button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(condition, index) in conditionList()" :key="index" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <template v-if="!condition.group">
                        <div class="grid gap-2 sm:grid-cols-2">
                          <input v-model="condition.fieldName" class="builder-input" placeholder="字段">
                          <select v-model="condition.conditionType" class="builder-input">
                            <option v-for="item in conditionTypes" :key="item.value" :value="item.value">{{ item.title }}</option>
                          </select>
                        </div>
                        <input class="builder-input mt-2 font-mono text-xs" :value="formatUnknown(condition.fieldValue)" @input="condition.fieldValue = parseLooseValue(($event.target as HTMLInputElement).value)">
                        <select class="builder-input mt-2" @change="setTemplateValue((next) => condition.fieldValue = next, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                          <option value="">选择变量</option>
                          <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                        </select>
                      </template>
                      <template v-else>
                        <div class="flex items-center justify-between gap-2">
                          <select v-model="condition.groupType" class="builder-input">
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                          <span class="text-xs text-slate-500">条件组包含 {{ condition.groups.length }} 条，JSON 预览会保留嵌套结构。</span>
                        </div>
                        <textarea class="builder-input mt-2 min-h-28 font-mono text-xs" :value="stringifyJson(condition.groups)" @input="updateConditionGroupJson(condition, ($event.target as HTMLTextAreaElement).value)"></textarea>
                      </template>
                      <button class="mt-2 text-xs text-rose-600" @click="removeCondition(index)">删除条件</button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="['list', 'page'].includes(activeStandardBlock.functionName)">
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">排序</h4>
                    <button class="builder-small-button" @click="addOrderBy">添加排序</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(order, index) in orderList()" :key="index" class="grid grid-cols-[minmax(0,1fr)_96px_auto] gap-2">
                      <input v-model="order.fieldName" class="builder-input" placeholder="字段">
                      <select v-model="order.direction" class="builder-input">
                        <option value="ASC">ASC</option>
                        <option value="DESC">DESC</option>
                      </select>
                      <button class="text-xs text-rose-600" @click="removeOrderBy(index)">删除</button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="['addSession', 'removeSession', 'readSession'].includes(activeStandardBlock.functionName)">
                <label class="builder-field">
                  <span>Session key</span>
                  <input class="builder-input" :value="stringInput('key')" @input="updateBlockInput('key', ($event.target as HTMLInputElement).value)">
                </label>
              </template>
              <template v-if="activeStandardBlock.functionName === 'addSession'">
                <label class="builder-field">
                  <span>Session value</span>
                  <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().value)" @input="updateBlockInput('value', parseLooseValue(($event.target as HTMLInputElement).value))">
                </label>
                <select class="builder-input" @change="setTemplateValue((next) => updateBlockInput('value', next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">选择变量</option>
                  <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                </select>
              </template>
              <div class="flex gap-1">
                <button class="builder-icon-button" @click="toggleBlockDisabled(activeStandardBlock)">{{ isBlockDisabled(activeStandardBlock) ? '启用' : '禁用' }}</button>
                <button class="builder-icon-button" @click="duplicateBlock(activeStandardBlock)">复制</button>
                <button class="builder-icon-button text-rose-700 dark:text-rose-200" @click="removeBlock(activeStandardBlock)">删除</button>
              </div>
            </div>
          </template>

          <template v-else-if="activeController">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">控制器配置</h3>
            <div class="mt-4 space-y-3">
              <label class="builder-field">
                <span>业务名称</span>
                <input v-model="activeController.alias" class="builder-input">
              </label>
              <label class="builder-field">
                <span>Controller UUID</span>
                <input :value="activeController.uuid" class="builder-input font-mono" @input="updateActiveBlockUuid(($event.target as HTMLInputElement).value)">
              </label>
              <label class="builder-field">
                <span>类型</span>
                <input :value="getControllerDefinition(activeController.functionName)?.title || activeController.functionName" class="builder-input" disabled>
              </label>
              <label class="builder-field">
                <span>inputs.value</span>
                <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().value)" @input="updateBlockInput('value', parseLooseValue(($event.target as HTMLInputElement).value))">
              </label>
              <select class="builder-input" @change="setTemplateValue((next) => updateBlockInput('value', next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                <option value="">选择变量</option>
                <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
              </select>

              <label v-if="activeController.functionName === 'switch_controller'" class="builder-field">
                <span>inputs.dataType</span>
                <select class="builder-input" :value="String(blockInputs().dataType || 'string')" @change="updateBlockInput('dataType', ($event.target as HTMLSelectElement).value)">
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                </select>
              </label>

              <div>
                <div class="mb-2 flex items-center justify-between gap-2">
                  <h4 class="text-sm font-semibold text-slate-900 dark:text-white">分支节点</h4>
                  <div v-if="activeController.functionName === 'switch_controller'" class="flex gap-1">
                    <button class="builder-small-button" @click="addSwitchCase(activeController)">添加 Case</button>
                    <button class="builder-small-button" @click="addSwitchDefault(activeController)">添加 DEFAULT</button>
                  </div>
                </div>
                <div class="space-y-2">
                  <div v-for="(node, index) in activeController.nodes" :key="node.uuid" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div class="grid gap-2">
                      <label class="builder-field">
                        <span>Node UUID</span>
                        <input :value="node.uuid" class="builder-input font-mono" @input="updateControllerNodeUuid(node, ($event.target as HTMLInputElement).value)">
                      </label>
                      <label class="builder-field">
                        <span>别名</span>
                        <input v-model="node.alias" class="builder-input">
                      </label>
                      <label v-if="activeController.functionName === 'switch_controller'" class="builder-field">
                        <span>类型</span>
                        <select class="builder-input" :value="node.type === 'DEFAULT' ? 'DEFAULT' : 'CASE'" @change="updateControllerNodeType(node, ($event.target as HTMLSelectElement).value as 'CASE' | 'DEFAULT', activeController)">
                          <option value="CASE">CASE</option>
                          <option value="DEFAULT">DEFAULT</option>
                        </select>
                      </label>
                      <label v-if="node.type !== 'DEFAULT'" class="builder-field">
                        <span>value</span>
                        <input class="builder-input font-mono text-xs" :value="String(node.value ?? '')" :disabled="activeController.functionName === 'if_controller'" @input="node.value = parseControllerNodeValue(($event.target as HTMLInputElement).value, activeController)">
                      </label>
                      <label class="builder-field">
                        <span>nextBlock</span>
                        <select class="builder-input" :value="node.nextBlock ?? ''" @change="node.nextBlock = (($event.target as HTMLSelectElement).value || null)">
                          <option value="">null</option>
                          <option v-for="option in executableTargetOptions(activeController.uuid)" :key="option.uuid" :value="option.uuid">{{ option.label }}</option>
                        </select>
                      </label>
                    </div>
                    <button v-if="activeController.functionName === 'switch_controller'" class="mt-2 text-xs text-rose-600" @click="removeControllerNode(activeController, index)">删除分支</button>
                  </div>
                </div>
              </div>

              <div class="flex gap-1">
                <button class="builder-icon-button" @click="toggleBlockDisabled(activeController)">{{ isBlockDisabled(activeController) ? '启用' : '禁用' }}</button>
                <button class="builder-icon-button" @click="duplicateBlock(activeController)">复制</button>
                <button class="builder-icon-button text-rose-700 dark:text-rose-200" @click="removeBlock(activeController)">删除</button>
              </div>
            </div>
          </template>
          </fieldset>
          <button
            v-if="isActiveApiReadonly && activeExecuteFragmentBlock"
            type="button"
            data-testid="view-system-fragment"
            class="builder-secondary-button mt-3 w-full"
            :disabled="!selectedFragmentUuid"
            @click="openFragmentEditor()"
          >查看内置 Fragment</button>
        </aside>
      </div>

      <section class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
          <button class="builder-tab-button" :class="{ 'builder-tab-button-active': bottomTab === 'json' }" @click="bottomTab = 'json'">JSON 预览</button>
          <button class="builder-tab-button" :class="{ 'builder-tab-button-active': bottomTab === 'validation' }" @click="bottomTab = 'validation'">校验 {{ validationIssues.length }}</button>
          <button class="builder-tab-button" :class="{ 'builder-tab-button-active': bottomTab === 'test' }" @click="bottomTab = 'test'">测试</button>
        </div>

        <div class="p-4">
          <div v-if="bottomTab === 'json'">
            <div class="mb-3 flex justify-end">
              <button class="builder-secondary-button" @click="copyJson">复制 JSON</button>
            </div>
            <pre data-testid="api-builder-json" class="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">{{ stringifyJson(activeApiJson) }}</pre>
          </div>

          <div v-else-if="bottomTab === 'validation'" class="space-y-2">
            <p v-if="!validationIssues.length" class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">校验通过，可以发布或复制 JSON。</p>
            <button
              v-for="issue in validationIssues"
              :key="issue.id"
              class="block w-full rounded-lg border p-3 text-left text-sm"
              :class="issue.severity === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'"
              @click="selectIssue(issue)"
            >
              <strong>{{ issue.severity === 'error' ? '错误' : '提醒' }}</strong> · {{ issue.message }}
            </button>
          </div>

          <div v-else-if="bottomTab === 'test'" class="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div class="space-y-4">
              <section v-if="isActiveFragment">
                <h4 class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Params</h4>
                <div class="space-y-2">
                  <label v-for="param in activeApiJson.params || []" :key="`params-${declarationKey(param)}`" class="builder-field">
                    <span>{{ declarationKey(param) }}</span>
                    <input class="builder-input" :value="formatUnknown(testRequest.params[declarationKey(param)])" @input="updateTestParam(declarationKey(param), ($event.target as HTMLInputElement).value)">
                  </label>
                  <p v-if="!(activeApiJson.params || []).length" class="text-xs text-slate-500 dark:text-slate-400">没有 Params 参数。</p>
                </div>
              </section>
              <section v-for="location in (isActiveFragment ? [] : requestLocations)" :key="location.value">
                <h4 class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{{ location.title }}</h4>
                <div class="space-y-2">
                  <label v-for="param in activeApiJson.request?.[location.value] || []" :key="`${location.value}-${declarationKey(param)}`" class="builder-field">
                    <span>{{ declarationKey(param) }}</span>
                    <input class="builder-input" :value="formatUnknown(testRequest[location.value]?.[declarationKey(param)])" @input="updateTestValue(location.value, declarationKey(param), ($event.target as HTMLInputElement).value)">
                  </label>
                  <p v-if="!(activeApiJson.request?.[location.value] || []).length" class="text-xs text-slate-500 dark:text-slate-400">没有 {{ location.title }} 参数。</p>
                </div>
              </section>
              <div class="flex gap-2">
                <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="runTest">运行 Dry-run</button>
                <button class="builder-secondary-button" @click="resetTestForm">重置表单</button>
              </div>
            </div>
            <div>
              <p v-if="!lastTestResult" class="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">填写测试表单后运行 dry-run。它不会访问数据库，只验证当前草稿的 JSON、模板路径和模拟链路。</p>
              <div v-else class="space-y-3">
                <p class="rounded-lg p-3 text-sm font-semibold" :class="lastTestResult.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100' : 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-100'">
                  {{ lastTestResult.ok ? 'Dry-run 通过' : lastTestResult.errors.join('；') }}
                </p>
                <div class="grid gap-3 lg:grid-cols-2">
                  <pre class="max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{{ stringifyJson({ ok: lastTestResult.ok, data: lastTestResult.data }) }}</pre>
                  <div class="space-y-2">
                    <div v-for="log in lastTestResult.logs" :key="log.uuid" class="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                      <div class="flex items-center justify-between gap-2">
                        <strong class="text-slate-900 dark:text-white">{{ log.alias }}</strong>
                        <span class="rounded px-2 py-0.5 text-xs" :class="log.status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'">{{ log.status }}</span>
                      </div>
                      <p class="mt-1 text-xs text-slate-500">{{ log.message }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>

    <section v-else-if="isApiDetailLoading" class="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-xl font-semibold text-slate-950 dark:text-white">正在加载 API</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">正在从服务端读取接口编排信息。</p>
    </section>

    <section v-else class="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-xl font-semibold text-slate-950 dark:text-white">找不到这个 API</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">服务端没有返回这个接口，可以返回列表重新创建。</p>
      <p v-if="apiBuilderError" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ apiBuilderError }}</p>
      <button class="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="navigateToList">返回 API 列表</button>
    </section>

    <div v-if="isFragmentEditorOpen && fragmentEditorDraft" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4">
      <section class="flex max-h-[96vh] w-full max-w-[1500px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="fragment-editor-dialog-title">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">
              {{ fragmentEditorDraft.source === 'system' ? '内置 Fragment · 只读' : 'Fragment Editor' }}
            </p>
            <h2 id="fragment-editor-dialog-title" class="text-xl font-semibold text-slate-950 dark:text-white">{{ fragmentEditorDraft.apiJson.alias || '未命名 Fragment' }}</h2>
          </div>
          <div class="flex gap-2">
            <button class="builder-secondary-button" :disabled="isSavingFragment" @click="closeFragmentEditor">取消</button>
            <button v-if="fragmentEditorDraft.source !== 'system' && fragmentEditorDraft.status !== 'published'" class="builder-secondary-button" :disabled="isSavingFragment" @click="saveFragmentFromModal('draft')">保存草稿</button>
            <button v-if="fragmentEditorDraft.source !== 'system'" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="isSavingFragment" @click="saveFragmentFromModal('published')">发布</button>
          </div>
        </div>
        <p v-if="fragmentEditorError" class="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{{ fragmentEditorError }}</p>
        <div class="min-h-0 flex-1 overflow-auto">
          <MApiOrchestrationEditorBlock
            ref="fragmentEditorRef"
            :draft="fragmentEditorDraft"
            :mode="fragmentEditorDraft.source === 'system' ? 'readonly' : 'edit'"
            context="embedded"
          />
        </div>
      </section>
    </div>

    <div v-if="isApiInfoDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <section class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="api-info-dialog-title">
        <form class="space-y-4" @submit.prevent="submitApiInfoDialog">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">API Builder</p>
            <h2 id="api-info-dialog-title" class="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              {{ apiInfoDialogMode === 'create' ? '新建' : '复制' }}{{ apiInfoForm.method === 'FRAGMENT' ? ' Fragment' : ' API' }}
            </h2>
          </div>

          <p v-if="apiInfoError" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ apiInfoError }}</p>

          <label class="builder-field">
            <span>接口名称</span>
            <input v-model="apiInfoForm.name" data-testid="api-info-name" class="builder-input" maxlength="120" autofocus>
          </label>

          <label class="builder-field">
            <span>API 标识</span>
            <input v-model="apiInfoForm.uuid" data-testid="api-info-uuid" class="builder-input font-mono" maxlength="128">
          </label>

          <label v-if="apiInfoForm.method !== 'FRAGMENT'" class="builder-field">
            <span>请求方法</span>
            <select v-model="apiInfoForm.method" data-testid="api-info-method" class="builder-input">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </label>

          <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {{ apiInfoForm.method === 'FRAGMENT' ? 'Fragment UUID：' : '路径预览：' }}<code>{{ apiInfoForm.method === 'FRAGMENT' ? (apiInfoForm.uuid || '-') : `/api/mokelay/${apiInfoForm.uuid || '-'}` }}</code>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" class="builder-secondary-button" :disabled="isSavingApiInfo" @click="closeApiInfoDialog">取消</button>
            <button data-testid="api-info-submit" type="submit" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSavingApiInfo">
              {{ isSavingApiInfo ? '保存中...' : '保存并打开' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.builder-input {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800;
}

.builder-field {
  @apply flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200;
}

.builder-secondary-button {
  @apply rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800;
}

.builder-small-button {
  @apply rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800;
}

.builder-icon-button {
  @apply rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900;
}

.builder-nav-button {
  @apply rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-teal-500/10;
}

.builder-nav-button-active {
  @apply border-teal-400 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-500/20 dark:text-teal-100;
}

.builder-palette-button {
  @apply rounded-lg border border-slate-200 p-3 text-left hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:border-teal-500/60 dark:hover:bg-teal-500/10;
}

.builder-palette-button span {
  @apply block text-sm font-semibold text-slate-900 dark:text-white;
}

.builder-palette-button small {
  @apply mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400;
}

.builder-tab-button {
  @apply rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800;
}

.builder-tab-button-active {
  @apply bg-slate-900 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-white;
}

</style>
