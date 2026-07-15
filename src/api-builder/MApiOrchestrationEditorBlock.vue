<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  MarkerType,
  useVueFlow,
  type Connection,
  type Edge,
  type Node
} from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import MApiOrchestrationFlowCanvas from '@/api-builder/MApiOrchestrationFlowCanvas.vue';
import { runDryApiTest, createRequestSnapshot } from '@/api-builder/dryRun';
import {
  blockDefinitions,
  cloneValue,
  collectResponseTerminals,
  createBlock,
  createController,
  declarationKey,
  getProcessorDefinition,
  hasDefaultResponse,
  isControllerBlock,
  isEndpointApiJson,
  isFragmentApiJson,
  isStarterBlock,
  processorDefinitions,
  processorName,
  requestLocations
} from '@/api-builder/registry';
import { createDraft, generateApiJson, normalizeApiJson } from '@/api-builder/store';
import { validateApiJson } from '@/api-builder/validation';
import type {
  ApiBuilderDraft,
  ApiJson,
  BlockFunctionName,
  ControllerFunctionName,
  ExecutableApiBlock,
  FragmentResolver,
  OrchestrationEditorDraft,
  ProcessableKey,
  ProcessorConfig,
  RequestLocation,
  ResponseConfig
} from '@/api-builder/types';

type Props = {
  draft: ApiBuilderDraft;
  mode?: 'edit' | 'readonly';
  context?: 'standalone' | 'embedded';
  flowId?: string;
  resolveFragment?: FragmentResolver;
};

const props = withDefaults(defineProps<Props>(), {
  mode: 'edit',
  context: 'standalone'
});
const emit = defineEmits<{
  change: [draft: OrchestrationEditorDraft];
}>();

const root = ref<HTMLElement | null>(null);
const localDraft = ref<ApiBuilderDraft>(createDraft(props.draft.apiJson, props.draft.layout));
const selection = ref('starter');
const panel = ref<'params' | 'block' | 'outputs' | 'json' | 'test'>('params');
const responseText = ref('{}');
const selectedResponseTerminalUuid = ref('');
const jsonError = ref('');
const testResult = ref<Awaited<ReturnType<typeof runDryApiTest>> | null>(null);
const testInput = ref(createRequestSnapshot(localDraft.value.apiJson));
const flowId = props.flowId || `orchestration-flow-${Math.random().toString(36).slice(2, 10)}`;
const { fitView } = useVueFlow(flowId);

watch(
  () => props.draft,
  (draft) => {
    const next = createDraft(cloneValue(draft.apiJson), cloneValue(draft.layout));
    next.id = draft.id;
    next.status = draft.status;
    next.source = draft.source;
    next.disabledBlockIds = [...draft.disabledBlockIds];
    next.testCases = cloneValue(draft.testCases);
    localDraft.value = next;
    selection.value = 'starter';
    responseText.value = JSON.stringify(next.apiJson.response ?? {}, null, 2);
    testInput.value = createRequestSnapshot(next.apiJson);
  },
  { immediate: true }
);

const readonly = computed(() => props.mode === 'readonly');
const apiJson = computed(() => generateApiJson(localDraft.value));
const fragment = computed(() => isFragmentApiJson(localDraft.value.apiJson));
const executableBlocks = computed(() => (localDraft.value.apiJson.blocks ?? [])
  .filter((block): block is ExecutableApiBlock => !isStarterBlock(block)));
const starter = computed(() => (localDraft.value.apiJson.blocks ?? []).find(isStarterBlock) ?? null);
const selectedBlock = computed(() => executableBlocks.value.find((block) => block.uuid === selection.value) ?? null);
const issues = computed(() => validateApiJson(apiJson.value));
const palette = computed(() => blockDefinitions.filter((definition) => !fragment.value || definition.functionName !== 'executeFragment'));
const responseTerminals = computed(() => collectResponseTerminals(localDraft.value.apiJson));
const usesTerminalResponses = computed(() => Boolean(localDraft.value.apiJson.responses) || responseTerminals.value.length > 1);
const nodes = computed<Node[]>(() => {
  const layout = localDraft.value.layout.nodes;
  return [
    {
      id: 'starter',
      type: 'starterNode',
      position: layout.starter ?? { x: 30, y: 120 },
      data: { label: 'Starter', nextBlock: starter.value?.nextBlock ?? null },
      draggable: !readonly.value
    },
    ...executableBlocks.value.map((block, index) => ({
      id: block.uuid,
      type: isControllerBlock(block) ? 'controllerNode' : 'blockNode',
      position: layout[block.uuid] ?? { x: 250 + index * 220, y: 120 },
      data: { block, disabled: false, selected: selection.value === block.uuid },
      draggable: !readonly.value
    }))
  ];
});
const edges = computed<Edge[]>(() => {
  const result: Edge[] = [];
  for (const block of localDraft.value.apiJson.blocks ?? []) {
    if (isStarterBlock(block)) {
      if (block.nextBlock) result.push(edge('starter', block.nextBlock));
    } else if (isControllerBlock(block)) {
      for (const node of block.nodes) {
        if (node.nextBlock) result.push(edge(block.uuid, node.nextBlock, node.uuid));
      }
    } else if (block.nextBlock) {
      result.push(edge(block.uuid, block.nextBlock));
    }
    if (!isStarterBlock(block) && !isControllerBlock(block) && typeof block.errorNextBlock === 'string') {
      result.push(edge(block.uuid, block.errorNextBlock, 'error', true));
    }
  }
  return result;
});

watch(
  responseTerminals,
  (terminals) => {
    if (!terminals.length) {
      selectedResponseTerminalUuid.value = '';
    } else if (!terminals.some((terminal) => terminal.uuid === selectedResponseTerminalUuid.value)) {
      selectedResponseTerminalUuid.value = terminals[0].uuid;
    }
    syncResponseText();
  },
  { immediate: true }
);

function edge(source: string, target: string, sourceHandle = 'next', errorEdge = false): Edge {
  return {
    id: `${source}:${sourceHandle}->${target}`,
    source,
    sourceHandle,
    target,
    label: errorEdge ? '错误' : undefined,
    type: 'smoothstep',
    markerEnd: MarkerType.ArrowClosed,
    style: errorEdge ? { stroke: '#e11d48', strokeDasharray: '6 4' } : undefined,
    labelStyle: errorEdge ? { fill: '#be123c', fontWeight: 600 } : undefined
  };
}

function addStep(functionName: BlockFunctionName) {
  if (readonly.value || (fragment.value && functionName === 'executeFragment')) return;
  const block = createBlock(functionName, undefined, undefined, localDraft.value.apiJson);
  localDraft.value.apiJson.blocks = [...(localDraft.value.apiJson.blocks ?? []), block];
  const previousTerminal = appendLinear(block.uuid);
  migrateTerminalResponse(previousTerminal, responseTerminalUuidsForBlock(block));
  selection.value = block.uuid;
  panel.value = 'block';
  emitChange();
}

function addFlowController(functionName: ControllerFunctionName) {
  if (readonly.value) return;
  const controller = createController(functionName, undefined, undefined, localDraft.value.apiJson);
  localDraft.value.apiJson.blocks = [...(localDraft.value.apiJson.blocks ?? []), controller];
  const previousTerminal = appendLinear(controller.uuid);
  migrateTerminalResponse(previousTerminal, responseTerminalUuidsForBlock(controller));
  selection.value = controller.uuid;
  panel.value = 'block';
  emitChange();
}

function appendLinear(uuid: string) {
  const blocks = localDraft.value.apiJson.blocks ??= [];
  const starter = blocks.find(isStarterBlock);
  if (!starter) {
    blocks.unshift({ uuid: 'starter', nextBlock: uuid });
    return null;
  }
  if (!starter.nextBlock) {
    const previousTerminal = starter.nextBlock === null ? 'starter' : null;
    starter.nextBlock = uuid;
    return previousTerminal;
  }
  const terminal = [...blocks].reverse().find((block) => block.uuid !== uuid && !isStarterBlock(block) && !isControllerBlock(block) && block.nextBlock === null);
  if (terminal && !isStarterBlock(terminal) && !isControllerBlock(terminal)) {
    terminal.nextBlock = uuid;
    return terminal.uuid;
  }
  return null;
}

function removeSelected() {
  if (readonly.value || !selectedBlock.value) return;
  const uuid = selectedBlock.value.uuid;
  const removedTerminalUuids = responseTerminalUuidsForBlock(selectedBlock.value);
  const incomingTerminalUuids = collectIncomingTerminalUuids(uuid);
  const responseFallback = firstResponseConfig(removedTerminalUuids);
  localDraft.value.apiJson.blocks = (localDraft.value.apiJson.blocks ?? []).filter((block) => block.uuid !== uuid);
  for (const block of localDraft.value.apiJson.blocks) {
    if (isStarterBlock(block)) {
      if (block.nextBlock === uuid) block.nextBlock = null;
    } else if (isControllerBlock(block)) {
      for (const node of block.nodes) if (node.nextBlock === uuid) node.nextBlock = null;
    } else {
      if (block.nextBlock === uuid) block.nextBlock = null;
      if (block.errorNextBlock === uuid) block.errorNextBlock = null;
    }
  }
  for (const terminalUuid of removedTerminalUuids) {
    if (localDraft.value.apiJson.responses) delete localDraft.value.apiJson.responses[terminalUuid];
  }
  if (responseFallback !== undefined) {
    localDraft.value.apiJson.responses ??= {};
    for (const terminalUuid of incomingTerminalUuids) {
      if (!Object.prototype.hasOwnProperty.call(localDraft.value.apiJson.responses, terminalUuid)) {
        localDraft.value.apiJson.responses[terminalUuid] = cloneValue(responseFallback);
      }
    }
  }
  selection.value = 'starter';
  emitChange();
}

function responseTerminalUuidsForBlock(block: ExecutableApiBlock) {
  if (isControllerBlock(block)) {
    return block.nodes.filter((node) => node.nextBlock === null).map((node) => node.uuid);
  }
  const terminal = block.nextBlock === null
    || (Object.prototype.hasOwnProperty.call(block, 'errorNextBlock') && block.errorNextBlock === null);
  return terminal ? [block.uuid] : [];
}

function migrateTerminalResponse(previousTerminal: string | null, nextTerminals: string[]) {
  if (!previousTerminal || !nextTerminals.length) return;
  const responses = localDraft.value.apiJson.responses;
  if (!responses || !Object.prototype.hasOwnProperty.call(responses, previousTerminal)) return;
  const response = responses[previousTerminal];
  for (const terminalUuid of nextTerminals) {
    if (!Object.prototype.hasOwnProperty.call(responses, terminalUuid)) {
      responses[terminalUuid] = cloneValue(response);
    }
  }
  const previousStillTerminal = collectResponseTerminals(localDraft.value.apiJson)
    .some((terminal) => terminal.uuid === previousTerminal);
  if (!previousStillTerminal) delete responses[previousTerminal];
}

function responseTerminalUuidsFromTarget(targetUuid: string | null, visited = new Set<string>()): string[] {
  if (!targetUuid || visited.has(targetUuid)) return [];
  visited.add(targetUuid);
  const block = executableBlocks.value.find((candidate) => candidate.uuid === targetUuid);
  if (!block) return [];
  if (isControllerBlock(block)) {
    return [...new Set(block.nodes.flatMap((node) => node.nextBlock === null
      ? [node.uuid]
      : responseTerminalUuidsFromTarget(node.nextBlock ?? null, new Set(visited))))];
  }
  const terminals = block.nextBlock === null
    ? [block.uuid]
    : responseTerminalUuidsFromTarget(block.nextBlock ?? null, new Set(visited));
  if (Object.prototype.hasOwnProperty.call(block, 'errorNextBlock')) {
    if (block.errorNextBlock === null) terminals.push(block.uuid);
    else terminals.push(...responseTerminalUuidsFromTarget(block.errorNextBlock ?? null, new Set(visited)));
  }
  return [...new Set(terminals)];
}

function ensureResponseForTerminal(uuid: string) {
  const api = localDraft.value.apiJson;
  if (hasDefaultResponse(api)) return;
  api.responses ??= {};
  if (Object.prototype.hasOwnProperty.call(api.responses, uuid)) return;
  const fallback = Object.values(api.responses)[0];
  if (fallback !== undefined) api.responses[uuid] = cloneValue(fallback);
}

function collectIncomingTerminalUuids(targetUuid: string) {
  const terminals = new Set<string>();
  for (const block of localDraft.value.apiJson.blocks ?? []) {
    if (isStarterBlock(block)) {
      if (block.nextBlock === targetUuid) terminals.add('starter');
    } else if (isControllerBlock(block)) {
      for (const node of block.nodes) if (node.nextBlock === targetUuid) terminals.add(node.uuid);
    } else if (block.nextBlock === targetUuid || block.errorNextBlock === targetUuid) {
      terminals.add(block.uuid);
    }
  }
  return [...terminals];
}

function firstResponseConfig(preferredUuids: string[]) {
  const api = localDraft.value.apiJson;
  for (const uuid of preferredUuids) {
    if (api.responses && Object.prototype.hasOwnProperty.call(api.responses, uuid)) return api.responses[uuid];
  }
  if (Object.prototype.hasOwnProperty.call(api, 'response')) return api.response;
  return Object.values(api.responses ?? {})[0];
}

function params() {
  if (!isFragmentApiJson(localDraft.value.apiJson)) return [];
  localDraft.value.apiJson.params ??= [];
  return localDraft.value.apiJson.params;
}

function requestParams(location: RequestLocation) {
  if (!isEndpointApiJson(localDraft.value.apiJson)) return [];
  localDraft.value.apiJson.request ??= {};
  localDraft.value.apiJson.request[location] ??= [];
  return localDraft.value.apiJson.request[location]!;
}

function addParam() {
  params().push({ key: 'param', processors: ['is_not_null'] });
  emitChange();
}

function addRequestParam(location: RequestLocation) {
  requestParams(location).push({
    key: location === 'query' ? 'id' : 'name',
    processors: location === 'body' ? ['is_not_null'] : []
  });
  emitChange();
}

function removeParam(index: number) {
  params().splice(index, 1);
  emitChange();
}

function removeRequestParam(location: RequestLocation, index: number) {
  requestParams(location).splice(index, 1);
  emitChange();
}

function updateParam(index: number, key: string) {
  const item = params()[index];
  if (typeof item === 'string') params()[index] = key;
  else if (item) item.key = key;
  emitChange();
}

function updateRequestParam(location: RequestLocation, index: number, key: string) {
  const item = requestParams(location)[index];
  if (typeof item === 'string') requestParams(location)[index] = key;
  else if (item) item.key = key;
  emitChange();
}

function getProcessors(item: ProcessableKey) {
  return typeof item === 'string' ? [] : [...(item.processors ?? [])];
}

function writeProcessors(list: ProcessableKey[], index: number, processors: ProcessorConfig[]) {
  const item = list[index];
  if (typeof item === 'string') list[index] = { key: item, processors };
  else if (item) item.processors = processors;
  emitChange();
}

function addProcessor(list: ProcessableKey[], index: number, name: string) {
  if (!name) return;
  const item = list[index];
  if (!item) return;
  const definition = getProcessorDefinition(name);
  const processor: ProcessorConfig = definition?.needsParam
    ? { processor: name, param: cloneValue(definition.defaultParam ?? []) }
    : name;
  writeProcessors(list, index, [...getProcessors(item), processor]);
}

function removeProcessor(list: ProcessableKey[], index: number, processorIndex: number) {
  const item = list[index];
  if (!item) return;
  const processors = getProcessors(item);
  processors.splice(processorIndex, 1);
  writeProcessors(list, index, processors);
}

function updateProcessorParam(list: ProcessableKey[], index: number, processorIndex: number, value: string) {
  const item = list[index];
  if (!item) return;
  const processors = getProcessors(item);
  const processor = processors[processorIndex];
  if (typeof processor === 'string' || !processor) return;
  try {
    processor.param = JSON.parse(value);
  } catch {
    processor.param = value;
  }
  writeProcessors(list, index, processors);
}

function toggleRequired(index: number) {
  const item = params()[index];
  if (!item) return;
  if (typeof item === 'string') {
    params()[index] = { key: item, processors: [] };
  } else {
    const processors = item.processors ?? [];
    item.processors = processors.some((processor) => processorName(processor) === 'is_not_null')
      ? processors.filter((processor) => processorName(processor) !== 'is_not_null')
      : ['is_not_null', ...processors];
  }
  emitChange();
}

function toggleRequestRequired(location: RequestLocation, index: number) {
  const list = requestParams(location);
  const item = list[index];
  if (!item) return;
  const processors = getProcessors(item);
  writeProcessors(
    list,
    index,
    processors.some((processor) => processorName(processor) === 'is_not_null')
      ? processors.filter((processor) => processorName(processor) !== 'is_not_null')
      : ['is_not_null', ...processors]
  );
}

function isRequired(item: ProcessableKey) {
  return typeof item === 'string' || (item.processors ?? []).some((processor) => processorName(processor) === 'is_not_null');
}

function updateBlockJson(value: string) {
  if (!selectedBlock.value || readonly.value) return;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    selectedBlock.value.inputs = parsed;
    jsonError.value = '';
    emitChange();
  } catch {
    jsonError.value = 'inputs 必须是合法 JSON。';
  }
}

function updateControllerInputs(value: string) {
  if (!selectedBlock.value || !isControllerBlock(selectedBlock.value) || readonly.value) return;
  try {
    selectedBlock.value.inputs = JSON.parse(value) as Record<string, unknown>;
    jsonError.value = '';
    emitChange();
  } catch {
    jsonError.value = 'inputs 必须是合法 JSON。';
  }
}

function targetOptions(excludeUuid: string) {
  return executableBlocks.value.filter((block) => block.uuid !== excludeUuid);
}

function renameSelectedBlock(nextValue: string) {
  const block = selectedBlock.value;
  if (!block || readonly.value) return;
  const previous = block.uuid;
  const next = nextValue.trim();
  if (!next || previous === next) return;
  block.uuid = next;
  for (const candidate of localDraft.value.apiJson.blocks ?? []) {
    if (isStarterBlock(candidate)) {
      if (candidate.nextBlock === previous) candidate.nextBlock = next;
    } else if (isControllerBlock(candidate)) {
      for (const node of candidate.nodes) if (node.nextBlock === previous) node.nextBlock = next;
    } else {
      if (candidate.nextBlock === previous) candidate.nextBlock = next;
      if (candidate.errorNextBlock === previous) candidate.errorNextBlock = next;
    }
  }
  if (localDraft.value.layout.nodes[previous]) {
    localDraft.value.layout.nodes[next] = localDraft.value.layout.nodes[previous];
    delete localDraft.value.layout.nodes[previous];
  }
  if (localDraft.value.apiJson.responses?.[previous] !== undefined) {
    localDraft.value.apiJson.responses[next] = localDraft.value.apiJson.responses[previous];
    delete localDraft.value.apiJson.responses[previous];
  }
  if (selectedResponseTerminalUuid.value === previous) selectedResponseTerminalUuid.value = next;
  selection.value = next;
  emitChange();
}

function updateDeclaredOutputs(value: string) {
  const block = selectedBlock.value;
  if (!block || isControllerBlock(block) || readonly.value) return;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed !== null && !Array.isArray(parsed)) throw new Error('invalid');
    block.outputs = parsed as ProcessableKey[] | null;
    jsonError.value = '';
    emitChange();
  } catch {
    jsonError.value = 'outputs 必须是数组或 null。';
  }
}

function onConnect(connection: Connection) {
  if (readonly.value || !connection.source || !connection.target) return;
  const source = (localDraft.value.apiJson.blocks ?? []).find((block) => block.uuid === connection.source);
  if (!source) return;
  if (isStarterBlock(source)) {
    updateStarterNextBlock(connection.target);
  } else if (isControllerBlock(source)) {
    const node = source.nodes.find((item) => item.uuid === connection.sourceHandle);
    if (node) updateControllerNodeNextBlock(node, connection.target);
  } else if (connection.sourceHandle === 'error') {
    updateStandardErrorTarget(source, connection.target);
  } else {
    updateStandardNextBlock(source, connection.target);
  }
  emitChange();
}

function updateStarterNextBlock(targetUuid: string | null) {
  if (!starter.value) return;
  const previousTerminal = starter.value.nextBlock === null ? 'starter' : null;
  starter.value.nextBlock = targetUuid;
  migrateTerminalResponse(previousTerminal, responseTerminalUuidsFromTarget(targetUuid));
  if (targetUuid === null) ensureResponseForTerminal('starter');
}

function updateControllerNodeNextBlock(node: { uuid: string; nextBlock?: string | null }, targetUuid: string | null) {
  const previousTerminal = node.nextBlock === null ? node.uuid : null;
  node.nextBlock = targetUuid;
  migrateTerminalResponse(previousTerminal, responseTerminalUuidsFromTarget(targetUuid));
  if (targetUuid === null) ensureResponseForTerminal(node.uuid);
}

function updateStandardNextBlock(block: Exclude<ExecutableApiBlock, { type: 'controller' }>, targetUuid: string | null) {
  const previousTerminal = collectResponseTerminals(localDraft.value.apiJson).some((terminal) => terminal.uuid === block.uuid)
    ? block.uuid
    : null;
  block.nextBlock = targetUuid;
  migrateTerminalResponse(previousTerminal, responseTerminalUuidsFromTarget(targetUuid));
  if (targetUuid === null) ensureResponseForTerminal(block.uuid);
}

function updateStandardErrorTarget(block: Exclude<ExecutableApiBlock, { type: 'controller' }>, targetUuid: string | null | undefined) {
  const previousTerminal = collectResponseTerminals(localDraft.value.apiJson).some((terminal) => terminal.uuid === block.uuid)
    ? block.uuid
    : null;
  if (targetUuid === undefined) delete block.errorNextBlock;
  else block.errorNextBlock = targetUuid;
  migrateTerminalResponse(previousTerminal, responseTerminalUuidsFromTarget(targetUuid ?? null));
  if (targetUuid === null) ensureResponseForTerminal(block.uuid);
}

function updateSelectedNextBlock(value: string) {
  const block = selectedBlock.value;
  if (!block || isControllerBlock(block) || readonly.value) return;
  updateStandardNextBlock(block, value || null);
  syncResponseText();
  emitChange();
}

function onEdgeClick(event: { edge?: Edge }) {
  if (readonly.value || !event.edge) return;
  const source = (localDraft.value.apiJson.blocks ?? []).find((block) => block.uuid === event.edge!.source);
  if (!source) return;
  if (isStarterBlock(source)) updateStarterNextBlock(null);
  else if (isControllerBlock(source)) {
    const node = source.nodes.find((candidate) => candidate.uuid === event.edge!.sourceHandle);
    if (node) updateControllerNodeNextBlock(node, null);
  } else if (event.edge.sourceHandle === 'error') updateStandardErrorTarget(source, null);
  else updateStandardNextBlock(source, null);
  syncResponseText();
  emitChange();
}

function errorNextBlockSelectValue(block: ExecutableApiBlock) {
  if (isControllerBlock(block)) return '__unhandled__';
  if (!Object.prototype.hasOwnProperty.call(block, 'errorNextBlock')) return '__unhandled__';
  return block.errorNextBlock === null ? '__terminal__' : block.errorNextBlock;
}

function updateErrorNextBlock(value: string) {
  const block = selectedBlock.value;
  if (!block || isControllerBlock(block) || readonly.value) return;
  updateStandardErrorTarget(block, value === '__unhandled__' ? undefined : value === '__terminal__' ? null : value);
  syncResponseText();
  emitChange();
}

function updateOutputs(value: string) {
  responseText.value = value;
  if (readonly.value) return;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('invalid');
    if (usesTerminalResponses.value) {
      const terminalUuid = selectedResponseTerminalUuid.value || responseTerminals.value[0]?.uuid;
      if (!terminalUuid) throw new Error('missing terminal');
      localDraft.value.apiJson.responses ??= {};
      localDraft.value.apiJson.responses[terminalUuid] = parsed as Record<string, unknown>;
    } else {
      localDraft.value.apiJson.response = parsed as Record<string, unknown>;
    }
    jsonError.value = '';
    emitChange();
  } catch {
    jsonError.value = 'Outputs 必须是合法 JSON 对象。';
  }
}

function responseForSelection(): ResponseConfig {
  const api = localDraft.value.apiJson;
  if (usesTerminalResponses.value) {
    const terminalUuid = selectedResponseTerminalUuid.value || responseTerminals.value[0]?.uuid;
    if (!terminalUuid) return {};
    api.responses ??= {};
    if (!Object.prototype.hasOwnProperty.call(api.responses, terminalUuid)) {
      api.responses[terminalUuid] = hasDefaultResponse(api) ? cloneValue(api.response ?? null) : {};
    }
    return api.responses[terminalUuid] ?? {};
  }
  return api.response ?? {};
}

function syncResponseText() {
  responseText.value = JSON.stringify(responseForSelection(), null, 2);
}

function selectResponseTerminal(uuid: string) {
  selectedResponseTerminalUuid.value = uuid;
  syncResponseText();
}

function updateWholeJson(value: string) {
  if (readonly.value) return;
  try {
    localDraft.value.apiJson = normalizeApiJson(JSON.parse(value));
    syncResponseText();
    jsonError.value = '';
    emitChange();
  } catch {
    jsonError.value = 'DSL 必须是合法 JSON。';
  }
}

async function runTest() {
  testResult.value = await runDryApiTest(apiJson.value, testInput.value, {
    resolveFragment: props.resolveFragment
  });
}

function onNodeDragStop(event: { node?: Node }) {
  const node = event.node;
  if (!node || readonly.value) return;
  localDraft.value.layout.nodes[node.id] = { x: node.position.x, y: node.position.y };
  emitChange();
}

function emitChange() {
  emit('change', snapshot());
}

function snapshot(): OrchestrationEditorDraft {
  return {
    apiJson: cloneValue(apiJson.value),
    layout: cloneValue(localDraft.value.layout),
    disabledBlockIds: [...localDraft.value.disabledBlockIds],
    testCases: cloneValue(localDraft.value.testCases)
  };
}

async function flush() {
  return snapshot();
}

defineExpose({ flush, flowId });
</script>

<template>
  <section ref="root" data-testid="orchestration-editor-block" class="grid min-h-[620px] gap-3 lg:grid-cols-[230px_minmax(0,1fr)_320px]">
    <aside class="space-y-3 overflow-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div class="grid grid-cols-2 gap-2">
        <button class="editor-button" :class="{ active: panel === 'params' }" @click="panel = 'params'">{{ fragment ? 'Params' : 'Request' }}</button>
        <button class="editor-button" :class="{ active: panel === 'outputs' }" @click="panel = 'outputs'">{{ fragment ? 'Outputs' : 'Response' }}</button>
        <button class="editor-button" :class="{ active: panel === 'json' }" @click="panel = 'json'">JSON</button>
        <button class="editor-button" :class="{ active: panel === 'test' }" @click="panel = 'test'">Dry-run</button>
      </div>
      <div v-for="group in ['query', 'write', 'session', 'utility', 'fragment']" :key="group">
        <h4 class="mb-2 text-xs font-semibold uppercase text-slate-500">{{ group }}</h4>
        <div class="grid gap-1">
          <button
            v-for="definition in palette.filter((item) => item.group === group)"
            :key="definition.functionName"
            class="editor-palette"
            :disabled="readonly"
            @click="addStep(definition.functionName)"
          >{{ definition.title }}</button>
        </div>
      </div>
      <div>
        <h4 class="mb-2 text-xs font-semibold uppercase text-slate-500">controller</h4>
        <div class="grid gap-1">
          <button class="editor-palette" :disabled="readonly" @click="addFlowController('if_controller')">IF 控制器</button>
          <button class="editor-palette" :disabled="readonly" @click="addFlowController('switch_controller')">Switch 控制器</button>
        </div>
      </div>
    </aside>

    <main class="min-w-0 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div class="mb-2 flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-slate-950 dark:text-white">{{ fragment ? 'Fragment 编排' : 'API 编排' }}</h3>
          <p class="text-xs text-slate-500">VueFlow instance: {{ flowId }}</p>
        </div>
        <button class="editor-button" @click="fitView({ padding: 0.2 })">适应画布</button>
      </div>
      <MApiOrchestrationFlowCanvas
        class="h-[530px]"
        :flow-id="flowId"
        :nodes="nodes"
        :edges="edges"
        :nodes-draggable="!readonly"
        :nodes-connectable="!readonly"
        @connect="onConnect"
        @edge-click="onEdgeClick"
        @node-click="selection = $event.node?.id || 'starter'; panel = 'block'"
        @node-drag-stop="onNodeDragStop"
      />
    </main>

    <aside class="overflow-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <p v-if="jsonError" class="mb-3 rounded bg-rose-50 p-2 text-xs text-rose-700">{{ jsonError }}</p>
      <template v-if="panel === 'params'">
        <template v-if="fragment">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-semibold">Params</h3>
            <button class="editor-button" :disabled="readonly" @click="addParam">添加</button>
          </div>
          <div v-for="(param, index) in params()" :key="index" class="mb-2 rounded border border-slate-200 p-2 dark:border-slate-700">
            <input class="editor-input" :data-testid="`fragment-editor-param-${declarationKey(param)}`" :value="declarationKey(param)" :disabled="readonly" @input="updateParam(index, ($event.target as HTMLInputElement).value)">
            <label class="mt-2 flex gap-2 text-xs"><input type="checkbox" :checked="isRequired(param)" :disabled="readonly" @change="toggleRequired(index)">必填</label>
            <div class="mt-2 space-y-1">
              <div v-for="(processor, processorIndex) in getProcessors(param)" :key="processorIndex" class="rounded bg-teal-50 p-1.5 text-xs dark:bg-teal-500/10">
                <div class="flex items-center justify-between gap-2">
                  <span>{{ getProcessorDefinition(processorName(processor))?.title || processorName(processor) }}</span>
                  <button class="text-rose-600" :disabled="readonly" @click="removeProcessor(params(), index, processorIndex)">删除</button>
                </div>
                <input
                  v-if="typeof processor !== 'string'"
                  class="editor-input mt-1 font-mono text-xs"
                  :value="JSON.stringify(processor.param)"
                  :disabled="readonly"
                  @change="updateProcessorParam(params(), index, processorIndex, ($event.target as HTMLInputElement).value)"
                >
              </div>
            </div>
            <div class="mt-2 flex gap-2">
              <select class="editor-input text-xs" :disabled="readonly" @change="addProcessor(params(), index, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                <option value="">添加规则</option>
                <option v-for="processor in processorDefinitions" :key="processor.name" :value="processor.name">{{ processor.title }}</option>
              </select>
              <button class="text-xs text-rose-600" :disabled="readonly" @click="removeParam(index)">删除参数</button>
            </div>
          </div>
        </template>
        <template v-else>
          <section v-for="location in requestLocations" :key="location.value" class="mb-4">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="font-semibold">{{ location.title }}</h3>
              <button class="editor-button" :disabled="readonly" @click="addRequestParam(location.value)">添加</button>
            </div>
            <div v-for="(param, index) in requestParams(location.value)" :key="index" class="mb-2 rounded border border-slate-200 p-2 dark:border-slate-700">
              <input class="editor-input" :value="declarationKey(param)" :disabled="readonly" @input="updateRequestParam(location.value, index, ($event.target as HTMLInputElement).value)">
              <label class="mt-2 flex gap-2 text-xs"><input type="checkbox" :checked="isRequired(param)" :disabled="readonly" @change="toggleRequestRequired(location.value, index)">必填</label>
              <div class="mt-2 space-y-1">
                <div v-for="(processor, processorIndex) in getProcessors(param)" :key="processorIndex" class="rounded bg-teal-50 p-1.5 text-xs dark:bg-teal-500/10">
                  <div class="flex items-center justify-between gap-2">
                    <span>{{ getProcessorDefinition(processorName(processor))?.title || processorName(processor) }}</span>
                    <button class="text-rose-600" :disabled="readonly" @click="removeProcessor(requestParams(location.value), index, processorIndex)">删除</button>
                  </div>
                  <input
                    v-if="typeof processor !== 'string'"
                    class="editor-input mt-1 font-mono text-xs"
                    :value="JSON.stringify(processor.param)"
                    :disabled="readonly"
                    @change="updateProcessorParam(requestParams(location.value), index, processorIndex, ($event.target as HTMLInputElement).value)"
                  >
                </div>
              </div>
              <div class="mt-2 flex gap-2">
                <select class="editor-input text-xs" :disabled="readonly" @change="addProcessor(requestParams(location.value), index, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">添加规则</option>
                  <option v-for="processor in processorDefinitions" :key="processor.name" :value="processor.name">{{ processor.title }}</option>
                </select>
                <button class="text-xs text-rose-600" :disabled="readonly" @click="removeRequestParam(location.value, index)">删除参数</button>
              </div>
            </div>
          </section>
        </template>
      </template>
      <template v-else-if="panel === 'block'">
        <template v-if="selectedBlock">
          <h3 class="font-semibold">{{ selectedBlock.alias || selectedBlock.uuid }}</h3>
          <label class="mt-3 block text-xs">
            Alias
            <input v-model="selectedBlock.alias" class="editor-input mt-1" :disabled="readonly" @change="emitChange">
          </label>
          <label class="mt-2 block text-xs">
            UUID
            <input :value="selectedBlock.uuid" class="editor-input mt-1 font-mono" :disabled="readonly" @change="renameSelectedBlock(($event.target as HTMLInputElement).value)">
          </label>
          <template v-if="isControllerBlock(selectedBlock)">
            <textarea class="editor-input mt-3 min-h-32 font-mono text-xs" :value="JSON.stringify(selectedBlock.inputs ?? {}, null, 2)" :disabled="readonly" @input="updateControllerInputs(($event.target as HTMLTextAreaElement).value)" />
            <div v-for="node in selectedBlock.nodes" :key="node.uuid" class="mt-2 rounded border border-slate-200 p-2 dark:border-slate-700">
              <strong class="block text-xs">{{ node.alias || node.uuid }}</strong>
              <select :value="node.nextBlock ?? ''" class="editor-input mt-1" :disabled="readonly" @change="updateControllerNodeNextBlock(node, ($event.target as HTMLSelectElement).value || null); emitChange()">
                <option value="">null</option>
                <option v-for="target in targetOptions(selectedBlock.uuid)" :key="target.uuid" :value="target.uuid">{{ target.alias || target.uuid }}</option>
              </select>
            </div>
          </template>
          <template v-else>
            <label class="mt-2 block text-xs">
              nextBlock
              <select :value="selectedBlock.nextBlock ?? ''" class="editor-input mt-1" :disabled="readonly" @change="updateSelectedNextBlock(($event.target as HTMLSelectElement).value)">
                <option value="">null</option>
                <option v-for="target in targetOptions(selectedBlock.uuid)" :key="target.uuid" :value="target.uuid">{{ target.alias || target.uuid }}</option>
              </select>
            </label>
            <label class="mt-2 block text-xs">
              errorNextBlock
              <select
                data-testid="orchestration-error-next-block"
                class="editor-input mt-1"
                :value="errorNextBlockSelectValue(selectedBlock)"
                :disabled="readonly"
                @change="updateErrorNextBlock(($event.target as HTMLSelectElement).value)"
              >
                <option value="__unhandled__">未捕获（抛错）</option>
                <option value="__terminal__">终止（错误响应）</option>
                <option v-for="target in targetOptions(selectedBlock.uuid)" :key="target.uuid" :value="target.uuid">目标：{{ target.alias || target.uuid }}</option>
              </select>
            </label>
            <label class="mt-2 block text-xs">
              outputs
              <textarea class="editor-input mt-1 min-h-20 font-mono text-xs" :value="JSON.stringify(selectedBlock.outputs ?? null, null, 2)" :disabled="readonly" @input="updateDeclaredOutputs(($event.target as HTMLTextAreaElement).value)" />
            </label>
            <label class="mt-2 block text-xs">
              inputs
              <textarea class="editor-input mt-1 min-h-52 font-mono text-xs" :value="JSON.stringify(selectedBlock.inputs ?? {}, null, 2)" :disabled="readonly" @input="updateBlockJson(($event.target as HTMLTextAreaElement).value)" />
            </label>
          </template>
          <button class="mt-3 text-sm text-rose-600" :disabled="readonly" @click="removeSelected">删除步骤</button>
        </template>
        <template v-else-if="selection === 'starter' && starter">
          <h3 class="font-semibold">Starter</h3>
          <label class="mt-3 block text-xs">
            nextBlock
            <select :value="starter.nextBlock ?? ''" class="editor-input mt-1" :disabled="readonly" @change="updateStarterNextBlock(($event.target as HTMLSelectElement).value || null); emitChange()">
              <option value="">null</option>
              <option v-for="target in targetOptions('starter')" :key="target.uuid" :value="target.uuid">{{ target.alias || target.uuid }}</option>
            </select>
          </label>
        </template>
        <p v-else class="text-sm text-slate-500">选择画布中的步骤进行配置。</p>
      </template>
      <template v-else-if="panel === 'outputs'">
        <h3 class="font-semibold">{{ fragment ? 'Outputs' : 'Response' }}</h3>
        <div v-if="usesTerminalResponses" class="mt-3 flex flex-wrap gap-1">
          <button
            v-for="terminal in responseTerminals"
            :key="terminal.uuid"
            class="editor-button"
            :class="{ active: selectedResponseTerminalUuid === terminal.uuid }"
            @click="selectResponseTerminal(terminal.uuid)"
          >{{ terminal.label }}</button>
        </div>
        <textarea class="editor-input mt-3 min-h-80 font-mono text-xs" :value="responseText" :disabled="readonly" @input="updateOutputs(($event.target as HTMLTextAreaElement).value)" />
      </template>
      <template v-else-if="panel === 'json'">
        <h3 class="font-semibold">DSL JSON</h3>
        <textarea class="editor-input mt-3 min-h-[430px] font-mono text-xs" :value="JSON.stringify(apiJson, null, 2)" :disabled="readonly" @input="updateWholeJson(($event.target as HTMLTextAreaElement).value)" />
        <p class="mt-2 text-xs text-slate-500">{{ issues.length }} 个校验问题</p>
      </template>
      <template v-else>
        <h3 class="font-semibold">Dry-run</h3>
        <div v-if="fragment" class="mt-3 space-y-2">
          <label v-for="param in apiJson.params ?? []" :key="declarationKey(param)" class="block text-xs">
            {{ declarationKey(param) }}
            <input v-model="testInput.params[declarationKey(param)]" class="editor-input mt-1">
          </label>
        </div>
        <button class="editor-button mt-3" @click="runTest">运行</button>
        <pre v-if="testResult" class="mt-3 max-h-72 overflow-auto rounded bg-slate-950 p-2 text-xs text-white">{{ JSON.stringify(testResult, null, 2) }}</pre>
      </template>
    </aside>
  </section>
</template>

<style scoped>
.editor-button { @apply rounded border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700; }
.editor-button.active { @apply border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-100; }
.editor-palette { @apply rounded border border-slate-200 px-2 py-1.5 text-left text-xs hover:border-teal-400 disabled:opacity-50 dark:border-slate-700; }
.editor-input { @apply w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950; }
</style>
