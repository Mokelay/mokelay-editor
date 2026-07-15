<script setup lang="ts">
import {
  Handle,
  Position,
  VueFlow,
  type Connection,
  type Edge,
  type Node
} from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import {
  declarationKey,
  getBlockDefinition,
  getControllerDefinition
} from '@/api-builder/registry';
import type { ApiStandardBlock, ControllerNode } from '@/api-builder/types';

type Props = {
  flowId: string;
  nodes: Node[];
  edges: Edge[];
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  defaultViewport?: { zoom: number; x: number; y: number };
  minZoom?: number;
  maxZoom?: number;
};

withDefaults(defineProps<Props>(), {
  nodesDraggable: true,
  nodesConnectable: true,
  defaultViewport: () => ({ zoom: 0.72, x: 0, y: 0 }),
  minZoom: 0.4,
  maxZoom: 1
});

const emit = defineEmits<{
  connect: [connection: Connection];
  edgeClick: [event: { edge?: Edge }];
  nodeClick: [event: { node?: Node }];
  nodeDragStop: [event: { node?: Node }];
}>();

function controllerNodeLabel(node: ControllerNode) {
  if (node.alias) return node.alias;
  if (node.type === 'DEFAULT') return 'DEFAULT';
  if (typeof node.value === 'boolean') return node.value ? 'true' : 'false';
  return String(node.value ?? 'case');
}

function errorNextBlockLabel(block: ApiStandardBlock) {
  if (!Object.prototype.hasOwnProperty.call(block, 'errorNextBlock')) return '未捕获';
  return block.errorNextBlock === null ? '终止' : block.errorNextBlock;
}
</script>

<template>
  <div :data-flow-id="flowId" class="orchestration-flow-canvas">
    <VueFlow
      :id="flowId"
      :nodes="nodes"
      :edges="edges"
      :fit-view-on-init="false"
      :default-viewport="defaultViewport"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :nodes-draggable="nodesDraggable"
      :nodes-connectable="nodesConnectable"
      class="h-full"
      @connect="emit('connect', $event)"
      @edge-click="emit('edgeClick', $event)"
      @node-click="emit('nodeClick', $event)"
      @node-drag-stop="emit('nodeDragStop', $event)"
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
          <Handle id="next" type="source" :position="Position.Right" :style="{ top: '38%' }" />
          <Handle id="error" class="flow-error-handle" type="source" :position="Position.Right" :style="{ top: '72%' }" />
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ data.block.functionName }}</p>
              <h4 class="mt-1 truncate font-semibold text-slate-950 dark:text-white">{{ data.block.alias || getBlockDefinition(data.block.functionName)?.title || data.block.functionName }}</h4>
              <p class="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">{{ data.block.uuid }}</p>
            </div>
            <span v-if="data.disabled" class="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">禁用</span>
          </div>
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">输出：{{ (data.block.outputs || []).map(declarationKey).join(', ') || '-' }}</p>
          <p class="mt-1 text-xs text-rose-600 dark:text-rose-300">错误：{{ errorNextBlockLabel(data.block) }}</p>
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
            <span>{{ controllerNodeLabel(node) }}</span>
            <Handle :id="node.uuid" type="source" :position="Position.Right" />
          </div>
          <p class="text-xs font-semibold text-violet-700 dark:text-violet-200">{{ getControllerDefinition(data.block.functionName)?.shortTitle || data.block.functionName }}</p>
          <h4 class="mt-1 truncate font-semibold text-slate-950 dark:text-white">{{ data.block.alias || getControllerDefinition(data.block.functionName)?.title || data.block.functionName }}</h4>
          <p class="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">{{ data.block.uuid }}</p>
          <div class="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p v-for="node in data.block.nodes" :key="node.uuid">{{ controllerNodeLabel(node) }} -> {{ node.nextBlock || 'null' }}</p>
          </div>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.orchestration-flow-canvas { @apply h-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950; }
.flow-node { @apply relative w-44 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition dark:border-slate-700 dark:bg-slate-900; }
.flow-node-selected { @apply border-teal-400 bg-teal-50 dark:border-teal-400 dark:bg-teal-500/10; }
.flow-node-starter { @apply border-teal-300 bg-teal-50 dark:border-teal-500/60 dark:bg-teal-500/10; }
.flow-node-controller { @apply border-violet-300 bg-violet-50 dark:border-violet-500/60 dark:bg-violet-500/10; }
.flow-branch-handle { @apply absolute right-0 flex translate-x-full items-center gap-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-300; }
.orchestration-flow-canvas :deep(.vue-flow__handle) { @apply h-3 w-3 border-2 border-white bg-teal-500 dark:border-slate-900; }
.orchestration-flow-canvas :deep(.flow-error-handle) { @apply bg-rose-500; }
</style>
