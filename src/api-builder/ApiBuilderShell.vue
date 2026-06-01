<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import {
  Handle,
  MarkerType,
  Position,
  VueFlow,
  type Connection,
  type Edge,
  type Node
} from '@vue-flow/core';
import { runDryApiTest, createRequestSnapshot } from '@/api-builder/dryRun';
import {
  blockDefinitions,
  cloneValue,
  controllerDefinitions,
  conditionTypes,
  createBlock,
  createController,
  createEmptyApiJson,
  createStarterBlock,
  declarationKey,
  getBlockDefinition,
  getControllerDefinition,
  getProcessorDefinition,
  isControllerBlock,
  isStandardBlock,
  isStarterBlock,
  normalizeTemplateOptions,
  processorDefinitions,
  processorName,
  requestLocations,
  templateDefinitions
} from '@/api-builder/registry';
import { sampleApis } from '@/api-builder/samples';
import {
  appendTestCase,
  createDraft,
  duplicateDraft,
  generateApiJson,
} from '@/api-builder/store';
import { hasBlockingErrors, hasDangerWarnings, validateApiJson } from '@/api-builder/validation';
import { buildVariableOptions, makeTemplate } from '@/api-builder/variables';
import { deleteApi, getApi, listApis, saveApi, type MokelayApiRecord } from '@/utils/apisApi';
import type {
  ApiBlock,
  ApiBuilderDraft,
  ApiJson,
  ApiController,
  ApiStandardBlock,
  BlockFunctionName,
  BuilderSelection,
  Condition,
  ControllerFunctionName,
  ControllerNode,
  DryRunResult,
  ExecutableApiBlock,
  ProcessableKey,
  ProcessorConfig,
  RequestLocation,
  RequestSnapshot,
  ValidationIssue
} from '@/api-builder/types';

type ApiBuilderShellProps = {
  routeUuid?: string | null;
};

const props = withDefaults(defineProps<ApiBuilderShellProps>(), {
  routeUuid: null
});

const drafts = ref<ApiBuilderDraft[]>([]);
const activeDraftId = ref(props.routeUuid || '');
const selection = ref<BuilderSelection>({ type: 'api' });
const bottomTab = ref<'json' | 'validation' | 'test'>('json');
const draggedBlockUuid = ref('');
const nodePositions = ref<Record<string, { x: number; y: number }>>({});
const apiBuilderError = ref('');
const isApiListLoading = ref(false);
const isApiDetailLoading = ref(false);
const isSavingApi = ref(false);
const isApiInfoDialogOpen = ref(false);
const isSavingApiInfo = ref(false);
const apiInfoDialogMode = ref<'create' | 'duplicate' | 'edit'>('create');
const apiInfoSourceDraftId = ref('');
const apiInfoSourceJson = ref<ApiJson | null>(null);
const apiInfoError = ref('');
const serverDraftIds = ref(new Set<string>());
const testRequest = ref<RequestSnapshot>({ header: {}, query: {}, body: {} });
const lastTestResult = ref<DryRunResult | null>(null);
const apiInfoForm = reactive({
  name: '',
  uuid: '',
  method: 'GET'
});
const templateOptions = reactive({
  selectedTemplateId: 'page',
  datasource: 'Mokelay',
  table: 'users',
  idField: 'id',
  requestFields: 'name,email',
  returnFields: 'id,name,email,created_at'
});

const activeDraft = computed(() => drafts.value.find((draft) => draft.id === activeDraftId.value) ?? null);
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
const activeController = computed(() => activeBlock.value && isControllerBlock(activeBlock.value) ? activeBlock.value : null);
const variableOptions = computed(() => {
  if (!activeDraft.value) return [];
  const beforeBlockUuid = selection.value.type === 'block' ? selection.value.uuid : undefined;
  return buildVariableOptions(activeDraft.value.apiJson, beforeBlockUuid);
});
const sortedDrafts = computed(() => [...drafts.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
const hasApiRoute = computed(() => Boolean(props.routeUuid));
const groupedBlocks = computed(() => ({
  query: blockDefinitions.filter((definition) => definition.group === 'query'),
  write: blockDefinitions.filter((definition) => definition.group === 'write'),
  session: blockDefinitions.filter((definition) => definition.group === 'session')
}));
const groupedControllers = computed(() => controllerDefinitions);
const graphNodes = computed<Node[]>(() => buildGraphNodes());
const graphEdges = computed<Edge[]>(() => buildGraphEdges());
const apiUuidPattern = /^[A-Za-z0-9_-]{1,128}$/;

watch(
  () => props.routeUuid,
  (uuid) => {
    if (!uuid) {
      activeDraftId.value = '';
      return;
    }
    activeDraftId.value = uuid;
    selection.value = { type: 'api' };
    void loadApiDetail(uuid);
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

void refreshApiList();

function buildGraphNodes(): Node[] {
  if (!activeDraft.value) return [];

  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const starter = blocks.find(isStarterBlock);
  const nodes: Node[] = [];

  nodes.push({
    id: 'starter',
    type: 'starterNode',
    position: nodePositions.value.starter ?? { x: 40, y: 190 },
    data: {
      label: 'Starter',
      nextBlock: starter?.nextBlock ?? null
    },
    draggable: false,
    selectable: true
  });

  executableBlocks.value.forEach((block, index) => {
    const column = Math.floor(index / 4);
    const row = index % 4;
    nodes.push({
      id: block.uuid,
      type: isControllerBlock(block) ? 'controllerNode' : 'blockNode',
      position: nodePositions.value[block.uuid] ?? {
        x: 190 + column * 210,
        y: 50 + row * 150
      },
      data: {
        block,
        disabled: isBlockDisabled(block),
        selected: selection.value.type === 'block' && selection.value.uuid === block.uuid
      }
    });
  });

  return nodes;
}

function buildGraphEdges(): Edge[] {
  const blocks = activeDraft.value?.apiJson.blocks ?? [];
  const edges: Edge[] = [];
  const addEdge = (source: string, sourceHandle: string, target: string | null | undefined, label?: string) => {
    if (!target) return;
    edges.push({
      id: `${source}:${sourceHandle}->${target}`,
      source,
      sourceHandle,
      target,
      label,
      type: 'smoothstep',
      animated: false,
      markerEnd: MarkerType.ArrowClosed
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
  }

  return edges;
}

function draftFromApiRecord(record: MokelayApiRecord, currentDraft?: ApiBuilderDraft | null): ApiBuilderDraft {
  const apiJson = record.apiJson ?? currentDraft?.apiJson ?? {
    uuid: record.uuid,
    alias: record.name,
    method: record.method,
    request: { header: [], query: [], body: [] },
    blocks: [],
    response: null
  };
  const draft = createDraft(apiJson);

  draft.id = record.uuid;
  draft.apiJson.uuid = record.uuid;
  draft.apiJson.alias = draft.apiJson.alias || record.name;
  draft.apiJson.method = record.method;
  draft.status = record.status;
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

async function refreshApiList() {
  isApiListLoading.value = true;
  apiBuilderError.value = '';

  try {
    const result = await listApis({ page: 1, pageSize: 100 });
    const currentDrafts = new Map(drafts.value.map((draft) => [draft.id, draft]));
    drafts.value = result.apis.map((api) => {
      const currentDraft = currentDrafts.get(api.uuid);
      return mergeDraftSessionState(draftFromApiRecord(api, currentDraft), currentDraft);
    });
    serverDraftIds.value = new Set(result.apis.map((api) => api.uuid));

    if (activeDraftId.value && !drafts.value.some((draft) => draft.id === activeDraftId.value)) {
      await loadApiDetail(activeDraftId.value);
    }
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '加载 API 列表失败。';
  } finally {
    isApiListLoading.value = false;
  }
}

async function loadApiDetail(uuid: string) {
  if (!uuid) return;

  isApiDetailLoading.value = true;
  apiBuilderError.value = '';

  try {
    const api = await getApi(uuid);
    const currentDraft = drafts.value.find((draft) => draft.id === uuid);
    const draft = mergeDraftSessionState(draftFromApiRecord(api, currentDraft), currentDraft);
    replaceDraft(draft);
    serverDraftIds.value = new Set([...serverDraftIds.value, draft.id]);
    activeDraftId.value = draft.id;
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '加载 API 详情失败。';
  } finally {
    isApiDetailLoading.value = false;
  }
}

function navigateToList() {
  window.location.hash = '/apis';
}

function navigateToDraft(draft: ApiBuilderDraft) {
  activeDraftId.value = draft.id;
  window.location.hash = `/apis/${encodeURIComponent(draft.id)}`;
  if (serverDraftIds.value.has(draft.id)) {
    void loadApiDetail(draft.id);
  }
}

function createBlankDraft() {
  openCreateApiDialog(createEmptyApiJson());
}

function createFromApiJson(apiJson: unknown) {
  openCreateApiDialog(apiJson);
}

function createFromTemplate(templateId = templateOptions.selectedTemplateId) {
  const definition = templateDefinitions.find((item) => item.id === templateId);
  if (!definition) return;

  const options = normalizeTemplateOptions({
    datasource: templateOptions.datasource,
    table: templateOptions.table,
    idField: templateOptions.idField,
    requestFields: splitFields(templateOptions.requestFields),
    returnFields: splitFields(templateOptions.returnFields)
  });
  createFromApiJson(definition.build(options));
}

function openCreateApiDialog(apiJson: unknown = createEmptyApiJson()) {
  const draft = createDraft(apiJson as never);

  apiInfoDialogMode.value = 'create';
  apiInfoSourceDraftId.value = '';
  apiInfoSourceJson.value = cloneValue(draft.apiJson);
  fillApiInfoForm(draft.apiJson);
  apiInfoError.value = '';
  isApiInfoDialogOpen.value = true;
}

function openDuplicateApiDialog() {
  if (!activeDraft.value) return;

  const draft = duplicateDraft(activeDraft.value);

  apiInfoDialogMode.value = 'duplicate';
  apiInfoSourceDraftId.value = '';
  apiInfoSourceJson.value = generateApiJson(draft);
  fillApiInfoForm(draft.apiJson);
  apiInfoError.value = '';
  isApiInfoDialogOpen.value = true;
}

function closeApiInfoDialog() {
  if (isSavingApiInfo.value) return;
  isApiInfoDialogOpen.value = false;
}

function fillApiInfoForm(apiJson: ApiJson) {
  apiInfoForm.name = apiJson.alias || '未命名 API';
  apiInfoForm.uuid = apiJson.uuid || '';
  apiInfoForm.method = String(apiJson.method || 'GET').toUpperCase() === 'POST' ? 'POST' : 'GET';
}

function buildApiJsonFromInfo(source: ApiJson) {
  const apiJson = cloneValue(source);

  apiJson.alias = apiInfoForm.name.trim();
  apiJson.uuid = apiInfoForm.uuid.trim();
  apiJson.method = apiInfoForm.method === 'POST' ? 'POST' : 'GET';

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
  if (method !== 'GET' && method !== 'POST') {
    return '请求方法必须是 GET 或 POST。';
  }
  return '';
}

function validateApiInfoFromJson(apiJson: ApiJson) {
  return validateApiInfo(apiJson.alias || '未命名 API', apiJson.uuid, String(apiJson.method || 'GET').toUpperCase());
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

    if (apiInfoDialogMode.value === 'create' || apiInfoDialogMode.value === 'duplicate') {
      await saveApiJsonAsDraft(apiJson);
      isApiInfoDialogOpen.value = false;
      return;
    }

    if (!activeDraft.value) {
      apiInfoError.value = '当前 API 不存在。';
      return;
    }

    activeDraft.value.apiJson.uuid = apiJson.uuid;
    activeDraft.value.apiJson.alias = apiJson.alias;
    activeDraft.value.apiJson.method = apiJson.method;

    const saved = await saveDraftToServer(activeDraft.value.status, apiInfoSourceDraftId.value);
    if (saved) {
      isApiInfoDialogOpen.value = false;
    }
  } catch (error) {
    apiInfoError.value = error instanceof Error ? error.message : '保存 API 基本信息失败。';
  } finally {
    isSavingApiInfo.value = false;
  }
}

async function saveApiJsonAsDraft(apiJson: ApiJson) {
  const api = await saveApi({
    apiJson,
    status: 'draft'
  });
  const savedDraft = draftFromApiRecord(api);

  replaceDraft(savedDraft);
  serverDraftIds.value = new Set([...serverDraftIds.value, savedDraft.id]);
  activeDraftId.value = savedDraft.id;
  selection.value = { type: 'api' };
  window.location.hash = `/apis/${encodeURIComponent(savedDraft.id)}`;
}

function duplicateCurrentDraft() {
  if (!activeDraft.value) return;
  openDuplicateApiDialog();
}

async function deleteDraft(draft: ApiBuilderDraft) {
  if (!window.confirm(`删除接口「${draft.apiJson.alias || draft.apiJson.uuid}」？`)) {
    return;
  }

  apiBuilderError.value = '';

  try {
    if (serverDraftIds.value.has(draft.id)) {
      await deleteApi(draft.id);
    }
    drafts.value = drafts.value.filter((item) => item.id !== draft.id);
    const nextServerDraftIds = new Set(serverDraftIds.value);
    nextServerDraftIds.delete(draft.id);
    serverDraftIds.value = nextServerDraftIds;
    if (activeDraftId.value === draft.id) {
      activeDraftId.value = '';
      navigateToList();
    }
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '删除 API 失败。';
  }
}

async function saveDraftToServer(status: ApiBuilderDraft['status'], sourceDraftId = activeDraft.value?.id ?? '') {
  if (!activeDraft.value) return false;

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
    const shouldDeletePreviousServerRecord = currentDraftId !== currentDraft.apiJson.uuid && serverDraftIds.value.has(currentDraftId);
    const api = await saveApi({
      apiJson: generateApiJson(currentDraft),
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
    window.location.hash = `/apis/${encodeURIComponent(savedDraft.id)}`;
    return true;
  } catch (error) {
    apiBuilderError.value = error instanceof Error ? error.message : '保存 API 失败。';
    return false;
  } finally {
    isSavingApi.value = false;
  }
}

async function saveActiveDraft() {
  await saveDraftToServer('draft');
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
  const block = createBlock(functionName);
  activeDraft.value.apiJson.blocks = [...(activeDraft.value.apiJson.blocks ?? []), block];
  attachNewBlockToOpenSource(block.uuid);
  selection.value = { type: 'block', uuid: block.uuid };
  nextTick(() => {
    document.querySelector(`[data-block-uuid="${block.uuid}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}

function addController(functionName: ControllerFunctionName) {
  if (!activeDraft.value) return;
  ensureStarterBlock();
  const controller = createController(functionName);
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
  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const index = blocks.findIndex((item) => item.uuid === block.uuid);
  blocks.splice(index + 1, 0, copy);
  attachNewBlockToOpenSource(copy.uuid);
  selection.value = { type: 'block', uuid: copy.uuid };
}

function removeBlock(block: ApiBlock) {
  if (!activeDraft.value) return;
  if (isStarterBlock(block)) return;
  activeDraft.value.apiJson.blocks = (activeDraft.value.apiJson.blocks ?? []).filter((item) => item.uuid !== block.uuid);
  clearReferencesToBlock(block.uuid);
  activeDraft.value.disabledBlockIds = activeDraft.value.disabledBlockIds.filter((uuid) => uuid !== block.uuid);
  selection.value = { type: 'api' };
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
    source.nextBlock = targetUuid;
    return;
  }

  if (isControllerBlock(source)) {
    const node = source.nodes.find((item) => item.uuid === sourceHandle);
    if (node) {
      node.nextBlock = targetUuid;
    }
    return;
  }

  source.nextBlock = targetUuid;
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
  draggedBlockUuid.value = block.uuid;
}

function onBlockDrop(targetBlock: ApiBlock) {
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
}

function selectGraphNode(uuid: string) {
  selection.value = uuid === 'starter' ? { type: 'starter' } : { type: 'block', uuid };
}

function onFlowConnect(connection: Connection) {
  if (!connection.source || !connection.target) return;
  setNextBlock(connection.source, connection.sourceHandle, connection.target);
}

function onFlowEdgeClick(event: { edge?: Edge }) {
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
  nodePositions.value = {
    ...nodePositions.value,
    [node.id]: {
      x: node.position.x,
      y: node.position.y
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
  activeDraft.value.apiJson.request ??= {};
  return activeDraft.value.apiJson.request;
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
  }

  if (nodePositions.value[previous]) {
    nodePositions.value = {
      ...nodePositions.value,
      [next]: nodePositions.value[previous]
    };
    delete nodePositions.value[previous];
  }
  selection.value = { type: 'block', uuid: next };
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

function ensureResponseObject() {
  if (!activeDraft.value) return {};
  if (!isRecord(activeDraft.value.apiJson.response)) {
    activeDraft.value.apiJson.response = {};
  }
  return activeDraft.value.apiJson.response;
}

function addResponseField() {
  const response = ensureResponseObject();
  response.data = variableOptions.value[0] ? makeTemplate(variableOptions.value[0].path) : null;
}

function updateResponseField(oldKey: string, newKey: string, value: unknown) {
  const response = ensureResponseObject();
  delete response[oldKey];
  response[newKey || oldKey] = value;
}

function removeResponseField(key: string) {
  const response = ensureResponseObject();
  delete response[key];
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

function runTest() {
  if (!activeDraft.value) return;
  const apiJson = generateApiJson(activeDraft.value);
  const result = runDryApiTest(apiJson, testRequest.value);
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

function formatDate(value: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
</script>

<template>
  <section data-testid="api-builder-shell" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <div v-if="!hasApiRoute" class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">API Builder</p>
            <h2 class="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">可视化搭建内部数据 API</h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              接口编排工作台。先把接口入口、请求参数、编排步骤和响应结构搭顺，再保存为 Mokelay Orchestration API JSON。
            </p>
          </div>
          <button data-testid="api-builder-new" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="createBlankDraft">
            新建 API
          </button>
        </div>

        <p v-if="apiBuilderError" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ apiBuilderError }}</p>

        <div class="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th class="px-4 py-3">名称</th>
                <th class="px-4 py-3">UUID</th>
                <th class="px-4 py-3">方法</th>
                <th class="px-4 py-3">状态</th>
                <th class="px-4 py-3">最近编辑</th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-if="isApiListLoading">
                <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">正在加载 API 列表...</td>
              </tr>
              <tr v-else-if="!sortedDrafts.length">
                <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">暂无 API，可以从右侧模板或样例开始。</td>
              </tr>
              <tr v-for="draft in sortedDrafts" :key="draft.id" class="bg-white dark:bg-slate-900">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ draft.apiJson.alias || '未命名 API' }}</td>
                <td class="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ draft.apiJson.uuid }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">{{ draft.apiJson.method }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-md px-2 py-1 text-xs font-semibold" :class="draft.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100'">
                    {{ draft.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ formatDate(draft.updatedAt) }}</td>
                <td class="px-4 py-3 text-right">
                  <button class="rounded-md px-2 py-1 text-teal-700 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-500/10" @click="navigateToDraft(draft)">打开</button>
                  <button class="rounded-md px-2 py-1 text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/10" @click="deleteDraft(draft)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="space-y-4">
        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">从模板创建</h3>
          <div class="mt-3 space-y-3">
            <select v-model="templateOptions.selectedTemplateId" class="builder-input">
              <option v-for="template in templateDefinitions" :key="template.id" :value="template.id">{{ template.title }}</option>
            </select>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="templateOptions.datasource" class="builder-input" placeholder="数据源，如 Mokelay">
              <input v-model="templateOptions.table" class="builder-input" placeholder="表名，如 users">
              <input v-model="templateOptions.idField" class="builder-input" placeholder="主键，如 id">
              <input v-model="templateOptions.requestFields" class="builder-input" placeholder="请求字段，逗号分隔">
            </div>
            <input v-model="templateOptions.returnFields" class="builder-input" placeholder="返回字段，逗号分隔">
            <button class="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950" @click="createFromTemplate()">
              使用模板
            </button>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">内置样例</h3>
          <div class="mt-3 grid gap-2">
            <button
              v-for="sample in sampleApis"
              :key="sample.id"
              class="rounded-lg border border-slate-200 p-3 text-left hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:border-teal-500/60 dark:hover:bg-teal-500/10"
              @click="createFromApiJson(sample.apiJson)"
            >
              <span class="block text-sm font-semibold text-slate-900 dark:text-white">{{ sample.title }}</span>
              <span class="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{{ sample.description }}</span>
            </button>
          </div>
        </section>
      </aside>
    </div>

    <div v-else-if="activeDraft && activeApiJson" class="flex flex-1 flex-col gap-4">
      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p v-if="apiBuilderError" class="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">{{ apiBuilderError }}</p>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button class="mb-2 text-sm font-medium text-teal-700 hover:text-teal-500 dark:text-teal-300" @click="navigateToList">返回 API 列表</button>
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-xl font-semibold text-slate-950 dark:text-white">{{ activeDraft.apiJson.alias || '未命名 API' }}</h2>
              <span class="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">{{ activeDraft.apiJson.method }}</span>
              <span class="rounded-md px-2 py-1 text-xs font-semibold" :class="activeDraft.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100'">
                {{ activeDraft.status === 'published' ? '已发布' : '草稿' }}
              </span>
              <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">/api/mokelay/{{ activeDraft.apiJson.uuid }}</code>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="builder-secondary-button" @click="duplicateCurrentDraft">复制 API</button>
            <button class="builder-secondary-button disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSavingApi" @click="saveActiveDraft">{{ isSavingApi ? '保存中...' : '保存' }}</button>
            <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSavingApi" @click="publishApi">发布</button>
          </div>
        </div>
      </section>

      <div class="grid min-h-[660px] flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_380px]">
        <aside class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="grid grid-cols-3 gap-2">
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'api' }" @click="selection = { type: 'api' }">入口</button>
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'request' }" @click="selection = { type: 'request' }">请求</button>
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'response' }" @click="selection = { type: 'response' }">响应</button>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">查询数据</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.query" :key="block.functionName" class="builder-palette-button" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">写入数据</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.write" :key="block.functionName" class="builder-palette-button" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">登录态</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.session" :key="block.functionName" class="builder-palette-button" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">控制器</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="controller in groupedControllers" :key="controller.functionName" class="builder-palette-button" @click="addController(controller.functionName)">
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
              <span class="rounded-md bg-rose-100 px-2 py-1 font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">{{ issueCount('error') }} 错误</span>
              <span class="rounded-md bg-amber-100 px-2 py-1 font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">{{ issueCount('warning') }} 提醒</span>
            </div>
          </div>

          <div class="mt-4 h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
            <VueFlow
              :nodes="graphNodes"
              :edges="graphEdges"
              :fit-view-on-init="false"
              :default-viewport="{ zoom: 0.72, x: 0, y: 0 }"
              :min-zoom="0.4"
              :max-zoom="1"
              class="api-flow"
              @connect="onFlowConnect"
              @edge-click="onFlowEdgeClick"
              @node-click="onFlowNodeClick"
              @node-drag-stop="onFlowNodeDragStop"
            >
              <template #node-starterNode="{ data }">
                <div class="flow-node flow-node-starter" data-testid="api-flow-starter">
                  <Handle id="next" type="source" :position="Position.Right" />
                  <p class="text-xs font-semibold uppercase text-teal-700 dark:text-teal-200">Starter</p>
                  <h4 class="mt-1 font-semibold text-slate-950 dark:text-white">流程入口</h4>
                  <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">nextBlock: {{ data.nextBlock || 'null' }}</p>
                </div>
              </template>

              <template #node-blockNode="{ data }">
                <div
                  class="flow-node"
                  :class="[
                    data.selected ? 'flow-node-selected' : '',
                    data.disabled ? 'opacity-55' : ''
                  ]"
                  :data-block-uuid="data.block.uuid"
                >
                  <Handle type="target" :position="Position.Left" />
                  <Handle id="next" type="source" :position="Position.Right" />
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ data.block.functionName }}</p>
                      <h4 class="mt-1 truncate font-semibold text-slate-950 dark:text-white">{{ data.block.alias || getBlockDefinition(data.block.functionName)?.title || data.block.functionName }}</h4>
                      <p class="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">{{ data.block.uuid }}</p>
                    </div>
                    <span v-if="data.disabled" class="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">禁用</span>
                  </div>
                  <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">输出：{{ (data.block.outputs || []).map(declarationKey).join(', ') || '-' }}</p>
                </div>
              </template>

              <template #node-controllerNode="{ data }">
                <div class="flow-node flow-node-controller" :class="{ 'flow-node-selected': data.selected }" :data-block-uuid="data.block.uuid">
                  <Handle type="target" :position="Position.Left" />
                  <div
                    v-for="(node, index) in data.block.nodes"
                    :key="node.uuid"
                    class="flow-branch-handle"
                    :style="{ top: `${28 + index * 28}px` }"
                  >
                    <span>{{ nodeLabel(node) }}</span>
                    <Handle :id="node.uuid" type="source" :position="Position.Right" />
                  </div>
                  <p class="text-xs font-semibold text-violet-700 dark:text-violet-200">{{ getControllerDefinition(data.block.functionName)?.shortTitle || data.block.functionName }}</p>
                  <h4 class="mt-1 truncate font-semibold text-slate-950 dark:text-white">{{ data.block.alias || getControllerDefinition(data.block.functionName)?.title || data.block.functionName }}</h4>
                  <p class="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">{{ data.block.uuid }}</p>
                  <div class="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p v-for="node in data.block.nodes" :key="node.uuid">{{ nodeLabel(node) }} -> {{ node.nextBlock || 'null' }}</p>
                  </div>
                </div>
              </template>
            </VueFlow>
          </div>
        </main>

        <aside class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <template v-if="selection.type === 'api'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">接口入口</h3>
            <div class="mt-4 space-y-3">
              <label class="builder-field">
                <span>接口名称</span>
                <input v-model="activeDraft.apiJson.alias" class="builder-input">
              </label>
              <label class="builder-field">
                <span>API 标识</span>
                <input v-model="activeDraft.apiJson.uuid" class="builder-input font-mono">
              </label>
              <label class="builder-field">
                <span>请求方法</span>
                <select v-model="activeDraft.apiJson.method" class="builder-input">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </label>
              <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                路径预览：<code>/api/mokelay/{{ activeDraft.apiJson.uuid }}</code>
              </div>
              <button class="builder-secondary-button w-full disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSavingApi" @click="saveActiveDraft">
                {{ isSavingApi ? '保存中...' : '保存基本信息' }}
              </button>
            </div>
          </template>

          <template v-else-if="selection.type === 'request'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">请求参数</h3>
            <div class="mt-4 space-y-5">
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
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">响应组装</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">把变量映射到响应 data 的字段。</p>
            <div class="mt-4 space-y-3">
              <div v-for="[key, value] in getResponseEntries()" :key="key" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <input class="builder-input" :value="key" @input="updateResponseField(key, ($event.target as HTMLInputElement).value, value)">
                <div class="mt-2 grid gap-2">
                  <input class="builder-input font-mono text-xs" :value="formatUnknown(value)" @input="updateResponseField(key, key, parseLooseValue(($event.target as HTMLInputElement).value))">
                  <select class="builder-input" @change="setTemplateValue((next) => updateResponseField(key, key, next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                    <option value="">从变量选择器填入</option>
                    <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }} · {{ option.path }}</option>
                  </select>
                </div>
                <button class="mt-2 text-xs text-rose-600" @click="removeResponseField(key)">删除字段</button>
              </div>
              <button class="builder-secondary-button w-full" @click="addResponseField">添加响应字段</button>
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

              <template v-if="['list', 'page', 'count', 'read', 'delete', 'create', 'upsert', 'update'].includes(activeStandardBlock.functionName)">
                <label class="builder-field">
                  <span>数据源</span>
                  <input class="builder-input" :value="stringInput('datasource')" @input="updateBlockInput('datasource', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="builder-field">
                  <span>表名</span>
                  <input class="builder-input" :value="stringInput('table')" @input="updateBlockInput('table', ($event.target as HTMLInputElement).value)">
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
                        <input v-model="node.uuid" class="builder-input font-mono">
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
              <section v-for="location in requestLocations" :key="location.value">
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

    <div v-if="isApiInfoDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <section class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="api-info-dialog-title">
        <form class="space-y-4" @submit.prevent="submitApiInfoDialog">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">API Builder</p>
            <h2 id="api-info-dialog-title" class="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              {{ apiInfoDialogMode === 'edit' ? '编辑 API 基本信息' : apiInfoDialogMode === 'duplicate' ? '复制 API' : '新建 API' }}
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

          <label class="builder-field">
            <span>请求方法</span>
            <select v-model="apiInfoForm.method" data-testid="api-info-method" class="builder-input">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </label>

          <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            路径预览：<code>/api/mokelay/{{ apiInfoForm.uuid || '-' }}</code>
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

.api-flow {
  @apply h-full;
}

.flow-node {
  @apply relative w-44 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition dark:border-slate-700 dark:bg-slate-900;
}

.flow-node-selected {
  @apply border-teal-400 bg-teal-50 dark:border-teal-400 dark:bg-teal-500/10;
}

.flow-node-starter {
  @apply border-teal-300 bg-teal-50 dark:border-teal-500/60 dark:bg-teal-500/10;
}

.flow-node-controller {
  @apply border-violet-300 bg-violet-50 dark:border-violet-500/60 dark:bg-violet-500/10;
}

.flow-branch-handle {
  @apply absolute right-0 flex translate-x-full items-center gap-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-300;
}

.api-flow :deep(.vue-flow__handle) {
  @apply h-3 w-3 border-2 border-white bg-teal-500 dark:border-slate-900;
}
</style>
