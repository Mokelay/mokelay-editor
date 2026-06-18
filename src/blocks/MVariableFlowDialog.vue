<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
import { useI18n } from '@/i18n';
import ProcessorConfigDialog from '@/processors/components/ProcessorConfigDialog.vue';
import { getProcessorDefinition, processorName } from '@/processors';
import type { ProcessorConfig } from '@/processors';
import type { DatasourceSchemaSelection } from '@/utils/datasourceSchema';
import {
  createFlowFromInput,
  normalizeBlockDataSources,
  normalizeVariableOptions,
  validateVariableFlowConfig,
  type BlockDataSource,
  type VariableFlowConditionOperator,
  type VariableFlowConfig,
  type VariableFlowNode,
  type VariableOption
} from '@/utils/variableValue';

const props = defineProps<{
  open: boolean;
  flow?: VariableFlowConfig;
  variables?: VariableOption[];
  blockDataSources?: BlockDataSource[];
  readonly?: boolean;
  teleportDisabled?: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'apply', flow: VariableFlowConfig): void;
}>();

const { t } = useI18n();
const draftFlow = ref<VariableFlowConfig>(createFlowFromInput(''));
const selectedNodeId = ref('');
const processorNodeId = ref<string | null>(null);
const validationError = ref('');
let nodeId = 0;

const variables = computed(() => normalizeVariableOptions(props.variables));
const blockDataSources = computed(() => {
  const sources = normalizeBlockDataSources(props.blockDataSources);
  if (sources.length || !variables.value.length) return sources;
  return [{
    blockId: '',
    blockType: 'legacy',
    blockLabel: t('variableValue.variable.legacySource'),
    fields: variables.value.map((variable) => ({
      label: variable.label,
      variable: variable.name,
      dataType: variable.type
    }))
  }];
});
const selectedNode = computed(() => draftFlow.value.nodes.find((node) => node.id === selectedNodeId.value));
const selectedVariableBlock = computed(() => selectedNode.value?.type === 'variable'
  ? blockDataSources.value.find((source) => source.blockId === (selectedNode.value as Extract<VariableFlowNode, { type: 'variable' }>).blockId)
  : undefined);
const processorField = computed<DatasourceSchemaSelection | undefined>(() => {
  const node = processorNodeId.value ? draftFlow.value.nodes.find((item) => item.id === processorNodeId.value) : undefined;
  if (!node || (node.type !== 'processor' && node.type !== 'variable')) return undefined;
  const field = node.type === 'variable'
    ? blockDataSources.value
      .find((source) => source.blockId === (node.blockId ?? ''))
      ?.fields.find((item) => item.variable === node.variable)
    : undefined;
  return {
    path: node.id,
    label: field?.label ?? node.id,
    type: field?.dataType ?? 'string',
    processors: node.processors ?? []
  };
});

const graphNodes = computed<Node[]>(() => draftFlow.value.nodes.map((node) => ({
  id: node.id,
  type: 'variableFlowNode',
  position: draftFlow.value.layout[node.id] ?? { x: 80, y: 80 },
  data: {
    node,
    label: nodeLabel(node),
    selected: node.id === selectedNodeId.value
  }
})));

const graphEdges = computed<Edge[]>(() => draftFlow.value.edges.map((edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle,
  markerEnd: MarkerType.ArrowClosed,
  label: edge.sourceHandle === 'true' ? 'true' : edge.sourceHandle === 'false' ? 'false' : undefined
})));

const conditionOperators: VariableFlowConditionOperator[] = ['EQ', 'NEQ', 'GT', 'GE', 'LT', 'LE', 'IN', 'NOTIN'];

function cloneFlow(flow?: VariableFlowConfig) {
  return JSON.parse(JSON.stringify(flow ?? createFlowFromInput(''))) as VariableFlowConfig;
}

function resetDraft() {
  draftFlow.value = cloneFlow(props.flow);
  selectedNodeId.value = draftFlow.value.outputNodeId;
  validationError.value = '';
  nodeId = draftFlow.value.nodes.length;
}

function nodeLabel(node: VariableFlowNode) {
  if (node.type === 'variable') {
    const source = blockDataSources.value.find((item) => item.blockId === (node.blockId ?? ''));
    const field = source?.fields.find((item) => item.variable === node.variable);
    return field ? `${source?.blockLabel ?? ''} / ${field.label} ${field.variable}` : node.variable || t('variableValue.flow.nodes.variable');
  }
  if (node.type === 'constant') return `${t('variableValue.flow.nodes.constant')}: ${String(node.value ?? '')}`;
  if (node.type === 'processor') return `${t('variableValue.flow.nodes.processor')}: ${(node.processors ?? []).map(processorLabel).join(', ') || '-'}`;
  if (node.type === 'if') return t('variableValue.flow.nodes.if');
  return t('variableValue.flow.nodes.output');
}

function processorLabel(processor: ProcessorConfig) {
  const name = processorName(processor);
  const definition = getProcessorDefinition(name);
  return definition ? t(definition.titleKey) : name;
}

function nextNodeId(type: VariableFlowNode['type']) {
  nodeId += 1;
  return `${type}_${nodeId}`;
}

function addNode(type: VariableFlowNode['type']) {
  if (props.readonly) return;
  const id = nextNodeId(type);
  const baseX = 80 + (draftFlow.value.nodes.length % 4) * 210;
  const baseY = 80 + Math.floor(draftFlow.value.nodes.length / 4) * 140;
  let node: VariableFlowNode;
  if (type === 'variable') {
    const source = blockDataSources.value[0];
    node = {
      id,
      type,
      ...(source?.blockId ? { blockId: source.blockId } : {}),
      ...(source?.blockType ? { blockType: source.blockType } : {}),
      variable: source?.fields[0]?.variable ?? ''
    };
  } else if (type === 'constant') {
    node = { id, type, value: '' };
  } else if (type === 'processor') {
    node = { id, type, processors: [] };
  } else if (type === 'if') {
    node = {
      id,
      type,
      condition: {
        left: { kind: 'variable', variable: variables.value[0]?.name ?? '' },
        operator: 'EQ',
        right: { kind: 'constant', value: '' }
      }
    };
  } else {
    if (draftFlow.value.nodes.some((item) => item.type === 'output')) {
      validationError.value = t('variableValue.flow.validation.singleOutput');
      return;
    }
    node = { id, type };
    draftFlow.value.outputNodeId = id;
  }
  draftFlow.value.nodes.push(node);
  draftFlow.value.layout[id] = { x: baseX, y: baseY };
  if (node.type !== 'output' && draftFlow.value.outputNodeId) {
    if (node.type === 'if') {
      draftFlow.value.edges.push({
        id: `${id}-true-${draftFlow.value.outputNodeId}`,
        source: id,
        target: draftFlow.value.outputNodeId,
        sourceHandle: 'true'
      });
      draftFlow.value.edges.push({
        id: `${id}-false-${draftFlow.value.outputNodeId}`,
        source: id,
        target: draftFlow.value.outputNodeId,
        sourceHandle: 'false'
      });
    } else {
      draftFlow.value.edges.push({
        id: `${id}-next-${draftFlow.value.outputNodeId}`,
        source: id,
        target: draftFlow.value.outputNodeId
      });
    }
  }
  selectedNodeId.value = id;
  validationError.value = '';
}

function removeSelectedNode() {
  if (props.readonly || !selectedNode.value || selectedNode.value.type === 'output') return;
  const id = selectedNode.value.id;
  draftFlow.value.nodes = draftFlow.value.nodes.filter((node) => node.id !== id);
  draftFlow.value.edges = draftFlow.value.edges.filter((edge) => edge.source !== id && edge.target !== id);
  delete draftFlow.value.layout[id];
  selectedNodeId.value = draftFlow.value.outputNodeId;
}

function onConnect(connection: Connection) {
  if (props.readonly || !connection.source || !connection.target) return;
  const sourceHandle = connection.sourceHandle ?? undefined;
  const id = `${connection.source}-${sourceHandle ?? 'next'}-${connection.target}`;
  draftFlow.value.edges = draftFlow.value.edges.filter((edge) => !(edge.source === connection.source && edge.sourceHandle === sourceHandle));
  draftFlow.value.edges.push({
    id,
    source: connection.source,
    target: connection.target,
    ...(sourceHandle ? { sourceHandle } : {})
  });
}

function onNodeClick(event: { node: Node }) {
  selectedNodeId.value = event.node.id;
}

function onEdgeClick(event: { edge: Edge }) {
  if (props.readonly) return;
  draftFlow.value.edges = draftFlow.value.edges.filter((edge) => edge.id !== event.edge.id);
}

function onNodeDragStop(event: { node: Node }) {
  if (!event.node.position) return;
  draftFlow.value.layout[event.node.id] = {
    x: event.node.position.x,
    y: event.node.position.y
  };
}

function updateSelectedNode(patch: Partial<VariableFlowNode>) {
  if (!selectedNode.value || props.readonly) return;
  const index = draftFlow.value.nodes.findIndex((node) => node.id === selectedNode.value?.id);
  if (index < 0) return;
  draftFlow.value.nodes[index] = {
    ...draftFlow.value.nodes[index],
    ...patch
  } as VariableFlowNode;
}

function updateSelectedVariableBlock(nextBlockId: string) {
  const source = blockDataSources.value.find((item) => item.blockId === nextBlockId);
  updateSelectedNode({
    blockId: source?.blockId,
    blockType: source?.blockType,
    variable: source?.fields[0]?.variable ?? '',
    processors: []
  } as Partial<VariableFlowNode>);
}

function updateSelectedVariableField(nextVariable: string) {
  const node = selectedNode.value;
  if (!node || node.type !== 'variable') return;
  const previousField = blockDataSources.value
    .find((source) => source.blockId === (node.blockId ?? ''))
    ?.fields.find((field) => field.variable === node.variable);
  const nextField = blockDataSources.value
    .find((source) => source.blockId === (node.blockId ?? ''))
    ?.fields.find((field) => field.variable === nextVariable);
  updateSelectedNode({
    variable: nextVariable,
    ...(previousField && nextField && previousField.dataType !== nextField.dataType ? { processors: [] } : {})
  } as Partial<VariableFlowNode>);
}

function updateConditionOperand(side: 'left' | 'right', kind: 'variable' | 'constant', value: string) {
  const node = selectedNode.value;
  if (!node || node.type !== 'if' || props.readonly) return;
  node.condition = {
    ...node.condition,
    [side]: kind === 'variable'
      ? { kind, variable: value }
      : { kind, value }
  };
}

function updateConditionOperator(operator: string) {
  const node = selectedNode.value;
  if (!node || node.type !== 'if' || props.readonly) return;
  node.condition = {
    ...node.condition,
    operator: conditionOperators.includes(operator as VariableFlowConditionOperator)
      ? operator as VariableFlowConditionOperator
      : 'EQ'
  };
}

function openProcessorDialog(nodeId: string) {
  processorNodeId.value = nodeId;
}

function closeProcessorDialog() {
  processorNodeId.value = null;
}

function applyProcessors(processors: ProcessorConfig[]) {
  const node = processorNodeId.value
    ? draftFlow.value.nodes.find((item) => item.id === processorNodeId.value)
    : undefined;
  if (!node || (node.type !== 'processor' && node.type !== 'variable') || props.readonly) return;
  node.processors = processors;
  processorNodeId.value = null;
}

function applyFlow() {
  try {
    validateVariableFlowConfig(draftFlow.value);
    validationError.value = '';
    emit('apply', cloneFlow(draftFlow.value));
  } catch (error) {
    validationError.value = error instanceof Error ? error.message : String(error);
  }
}

watch(() => props.open, (open) => {
  if (open) resetDraft();
}, { immediate: true });
</script>

<template>
  <Teleport to="body" :disabled="teleportDisabled">
    <div v-if="open" class="variable-flow-dialog" data-testid="variable-flow-dialog" @keydown.stop>
      <section class="variable-flow-dialog__panel">
        <header class="variable-flow-dialog__header">
          <div>
            <h2>{{ t('variableValue.flow.title') }}</h2>
            <p>{{ t('variableValue.flow.subtitle') }}</p>
          </div>
          <button type="button" data-testid="variable-flow-close" @click="emit('close')">
            {{ t('editor.close') }}
          </button>
        </header>

        <div class="variable-flow-dialog__body">
          <aside class="variable-flow-dialog__library">
            <strong>{{ t('variableValue.flow.library') }}</strong>
            <button type="button" data-testid="variable-flow-add-variable" @click="addNode('variable')">{{ t('variableValue.flow.nodes.variable') }}</button>
            <button type="button" data-testid="variable-flow-add-constant" @click="addNode('constant')">{{ t('variableValue.flow.nodes.constant') }}</button>
            <button type="button" data-testid="variable-flow-add-processor" @click="addNode('processor')">{{ t('variableValue.flow.nodes.processor') }}</button>
            <button type="button" data-testid="variable-flow-add-if" @click="addNode('if')">{{ t('variableValue.flow.nodes.if') }}</button>
            <button type="button" data-testid="variable-flow-add-output" @click="addNode('output')">{{ t('variableValue.flow.nodes.output') }}</button>
          </aside>

          <main class="variable-flow-dialog__canvas">
            <VueFlow
              id="variable-value-flow"
              :nodes="graphNodes"
              :edges="graphEdges"
              :fit-view-on-init="false"
              :default-viewport="{ zoom: 0.85, x: 0, y: 0 }"
              :min-zoom="0.4"
              :max-zoom="1.2"
              :nodes-draggable="!readonly"
              :nodes-connectable="!readonly"
              @connect="onConnect"
              @edge-click="onEdgeClick"
              @node-click="onNodeClick"
              @node-drag-stop="onNodeDragStop"
            >
              <template #node-variableFlowNode="{ data }">
                <div class="variable-flow-node" :class="{ 'variable-flow-node--selected': data.selected }" :data-testid="`variable-flow-node-${data.node.id}`">
                  <Handle type="target" :position="Position.Left" />
                  <Handle v-if="data.node.type !== 'output'" type="source" :position="Position.Right" />
                  <template v-if="data.node.type === 'if'">
                    <Handle id="true" type="source" :position="Position.Right" :style="{ top: '36%' }" />
                    <Handle id="false" type="source" :position="Position.Right" :style="{ top: '66%' }" />
                  </template>
                  <span>{{ t(`variableValue.flow.nodes.${data.node.type}`) }}</span>
                  <strong>{{ data.label }}</strong>
                </div>
              </template>
            </VueFlow>
          </main>

          <aside class="variable-flow-dialog__inspector">
            <strong>{{ t('variableValue.flow.inspector') }}</strong>
            <p v-if="!selectedNode" class="variable-flow-dialog__muted">{{ t('variableValue.flow.noSelection') }}</p>
            <template v-else>
              <div class="variable-flow-dialog__node-title">
                <span>{{ selectedNode.id }}</span>
                <button v-if="selectedNode.type !== 'output'" type="button" @click="removeSelectedNode">{{ t('datasource.actions.remove') }}</button>
              </div>

              <template v-if="selectedNode.type === 'variable'">
                <label class="variable-flow-dialog__field">
                  <span>{{ t('variableValue.variable.blockPlaceholder') }}</span>
                  <select :value="selectedNode.blockId ?? ''" @change="updateSelectedVariableBlock(($event.target as HTMLSelectElement).value)">
                    <option v-for="source in blockDataSources" :key="`${source.blockId}-${source.blockType}`" :value="source.blockId">
                      {{ source.blockType }} / {{ source.blockId || 'legacy' }}
                    </option>
                  </select>
                </label>
                <label class="variable-flow-dialog__field">
                  <span>{{ t('variableValue.variable.fieldPlaceholder') }}</span>
                  <select :value="selectedNode.variable" @change="updateSelectedVariableField(($event.target as HTMLSelectElement).value)">
                    <option v-for="field in selectedVariableBlock?.fields ?? []" :key="field.variable" :value="field.variable">
                      {{ field.label }} {{ field.variable }} · {{ field.dataType }}
                    </option>
                  </select>
                </label>
              </template>

              <label v-if="selectedNode.type === 'constant'" class="variable-flow-dialog__field">
                <span>{{ t('variableValue.flow.fields.value') }}</span>
                <textarea :value="String(selectedNode.value ?? '')" @input="updateSelectedNode({ value: ($event.target as HTMLTextAreaElement).value })"></textarea>
              </label>

              <button
                v-if="selectedNode.type === 'processor' || selectedNode.type === 'variable'"
                type="button"
                data-testid="variable-flow-config-processors"
                @click="openProcessorDialog(selectedNode.id)"
              >
                {{ t('variableValue.variable.configureProcessors') }}
              </button>

              <template v-if="selectedNode.type === 'if'">
                <label class="variable-flow-dialog__field">
                  <span>{{ t('variableValue.flow.fields.left') }}</span>
                  <select
                    :value="selectedNode.condition.left.kind === 'variable' ? selectedNode.condition.left.variable : ''"
                    @change="updateConditionOperand('left', 'variable', ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="variable in variables" :key="variable.name" :value="variable.name">
                      {{ variable.label }} {{ variable.name }}
                    </option>
                  </select>
                </label>
                <label class="variable-flow-dialog__field">
                  <span>{{ t('variableValue.flow.fields.operator') }}</span>
                  <select :value="selectedNode.condition.operator" @change="updateConditionOperator(($event.target as HTMLSelectElement).value)">
                    <option v-for="operator in conditionOperators" :key="operator" :value="operator">{{ operator }}</option>
                  </select>
                </label>
                <label class="variable-flow-dialog__field">
                  <span>{{ t('variableValue.flow.fields.right') }}</span>
                  <input
                    :value="selectedNode.condition.right.kind === 'constant' ? String(selectedNode.condition.right.value ?? '') : ''"
                    @input="updateConditionOperand('right', 'constant', ($event.target as HTMLInputElement).value)"
                  >
                </label>
              </template>
            </template>
          </aside>
        </div>

        <footer class="variable-flow-dialog__footer">
          <p v-if="validationError" class="variable-flow-dialog__error" data-testid="variable-flow-error">{{ validationError }}</p>
          <button type="button" @click="emit('close')">{{ t('datasource.actions.cancel') }}</button>
          <button type="button" class="variable-flow-dialog__primary" data-testid="variable-flow-apply" @click="applyFlow">
            {{ t('datasource.processors.apply') }}
          </button>
        </footer>

        <ProcessorConfigDialog
          :open="processorNodeId !== null"
          :field="processorField"
          :readonly="readonly"
          :teleport-disabled="true"
          @close="closeProcessorDialog"
          @apply="applyProcessors"
        />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.variable-flow-dialog {
  position: fixed;
  z-index: 12000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(15 23 42 / 0.5);
}

.variable-flow-dialog__panel {
  display: flex;
  width: min(1200px, 100%);
  height: min(820px, calc(100vh - 36px));
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  background: white;
  color: rgb(15 23 42);
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.35);
}

.variable-flow-dialog__header,
.variable-flow-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.variable-flow-dialog__footer {
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
  justify-content: flex-end;
}

.variable-flow-dialog__header h2,
.variable-flow-dialog__header p {
  margin: 0;
}

.variable-flow-dialog__header h2 {
  font-size: 17px;
}

.variable-flow-dialog__header p,
.variable-flow-dialog__muted {
  color: rgb(100 116 139);
  font-size: 12px;
}

.variable-flow-dialog__body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 150px minmax(0, 1fr) 270px;
}

.variable-flow-dialog__library,
.variable-flow-dialog__inspector {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  border-right: 1px solid rgb(226 232 240);
  padding: 12px;
}

.variable-flow-dialog__inspector {
  border-right: 0;
  border-left: 1px solid rgb(226 232 240);
}

.variable-flow-dialog__canvas {
  min-width: 0;
  background: rgb(248 250 252);
}

.variable-flow-dialog__library button,
.variable-flow-dialog__inspector button,
.variable-flow-dialog__footer button {
  min-height: 32px;
  border: 1px solid rgb(191 219 254);
  border-radius: 7px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.variable-flow-dialog__primary {
  background: rgb(37 99 235) !important;
  color: white !important;
}

.variable-flow-dialog__node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.variable-flow-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
}

.variable-flow-dialog__field input,
.variable-flow-dialog__field select,
.variable-flow-dialog__field textarea {
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 7px;
  padding: 6px 8px;
  background: white;
  color: rgb(15 23 42);
  font: inherit;
}

.variable-flow-dialog__field textarea {
  min-height: 72px;
  resize: vertical;
}

.variable-flow-node {
  position: relative;
  display: flex;
  min-width: 150px;
  max-width: 210px;
  flex-direction: column;
  gap: 5px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: white;
  padding: 10px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.12);
}

.variable-flow-node--selected {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 3px rgb(191 219 254);
}

.variable-flow-node span {
  color: rgb(100 116 139);
  font-size: 11px;
  font-weight: 750;
}

.variable-flow-node strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.variable-flow-dialog__error {
  margin: 0 auto 0 0;
  color: rgb(185 28 28);
  font-size: 12px;
}
</style>
