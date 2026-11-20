<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { VueFlow, getRectOfNodes, getTransformForBounds, type Connection, type Edge, type Node, type VueFlowStore } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import { createActionUuid } from 'mokelay-components/actions';
import { useI18n } from '@/i18n';

const props = defineProps<{ nodes: Node[]; edges: Edge[] }>();
const emit = defineEmits<{
  connect: [connection: Connection];
  select: [uuid: string];
}>();
const { t } = useI18n();

// Keep viewport updates out of the inspector's render cycle so gestures cannot
// overwrite JSON fields that have not emitted their change event yet.
const flowId = createActionUuid('m-action-editor');
let active = true;
const flowInstance = shallowRef<VueFlowStore | null>(null);
const minZoom = ref(0.35);
const maxZoom = 1.2;
const initialFitPending = ref(props.nodes.length > 0);
let fitFrame = 0;
let fitRequest = 0;
const zoom = computed(() => flowInstance.value?.viewport.value.zoom ?? 1);
const zoomPercent = computed(() => `${Math.round(zoom.value * 1000) / 10}%`);
const canFit = computed(() => {
  const flow = flowInstance.value;
  return !!(active && flow?.viewportHelper.value.viewportInitialized
    && props.nodes.length && flow.getNodes.value.length === props.nodes.length
    && flow.getNodes.value.every((node) => node.dimensions.width > 0
      && node.dimensions.height > 0 && node.handleBounds));
});

watch(canFit, (ready) => {
  if (ready && initialFitPending.value) {
    void scheduleFit();
  }
}, { flush: 'post' });

function onFlowInit(instance: VueFlowStore) {
  if (active && instance.id === flowId) flowInstance.value = instance;
}

function clearFlow() {
  active = false;
  fitRequest++;
  cancelAnimationFrame(fitFrame);
  fitFrame = 0;
  initialFitPending.value = false;
  flowInstance.value = null;
}

onBeforeUnmount(clearFlow);

async function scheduleFit() {
  const request = ++fitRequest;
  cancelAnimationFrame(fitFrame);
  // Wait for measured nodes and their edge paths to render in the same frame.
  await nextTick();
  if (request !== fitRequest || !canFit.value) return;
  fitFrame = requestAnimationFrame(() => {
    fitFrame = 0;
    const flow = flowInstance.value;
    if (request !== fitRequest || !canFit.value || !flow) return;
    const bounds = getRectOfNodes(flow.getNodes.value);
    const element = flow.vueFlowRef.value;
    if (!element) return;
    const pane = element.getBoundingClientRect();
    const viewport = flow.viewport.value;
    // Backward connections and branch labels can extend beyond node bounds.
    element.querySelectorAll('.vue-flow__edge-path, .vue-flow__edge-textwrapper, .m-action-editor__branch-handle')
      .forEach((element) => {
        const rect = element.getBoundingClientRect();
        const left = (rect.left - pane.left - viewport.x) / viewport.zoom;
        const top = (rect.top - pane.top - viewport.y) / viewport.zoom;
        const right = Math.max(bounds.x + bounds.width, left + rect.width / viewport.zoom);
        const bottom = Math.max(bounds.y + bounds.height, top + rect.height / viewport.zoom);
        bounds.x = Math.min(bounds.x, left);
        bounds.y = Math.min(bounds.y, top);
        bounds.width = right - bounds.x;
        bounds.height = bottom - bounds.y;
      });
    const { width, height } = flow.dimensions.value;
    const target = getTransformForBounds(bounds, width, height, 0, 1, '24px');
    if (!Number.isFinite(target.zoom) || target.zoom <= 0) return;
    initialFitPending.value = false;
    // Keep gestures and buttons usable even when the overview is below 35%.
    minZoom.value = Math.min(minZoom.value, target.zoom);
    flow.setMinZoom(minZoom.value);
    void flow.setViewport(target);
  });
}
</script>

<template>
  <div class="m-action-flow-canvas">
    <div class="m-action-editor__zoom-toolbar" role="group" :aria-label="t('editor.actionCanvas.controls')">
      <button type="button" class="mk-form-button" data-testid="m-action-zoom-out"
        :aria-label="t('editor.actionCanvas.zoomOut')" :title="t('editor.actionCanvas.zoomOut')"
        :disabled="!flowInstance || zoom <= minZoom + 0.000001" @click="flowInstance?.zoomOut()">−</button>
      <output class="m-action-editor__zoom-percent" data-testid="m-action-zoom-percent"
        :aria-label="t('editor.actionCanvas.zoomLevel')">{{ zoomPercent }}</output>
      <button type="button" class="mk-form-button" data-testid="m-action-zoom-in"
        :aria-label="t('editor.actionCanvas.zoomIn')" :title="t('editor.actionCanvas.zoomIn')"
        :disabled="!flowInstance || zoom >= maxZoom - 0.000001" @click="flowInstance?.zoomIn()">+</button>
      <button type="button" class="mk-form-button" data-testid="m-action-fit-view"
        :disabled="!canFit" @click="scheduleFit">{{ t('editor.actionCanvas.fitView') }}</button>
    </div>
    <VueFlow
      :id="flowId"
      class="m-action-editor__flow"
      data-testid="m-action-flow"
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :fit-view-on-init="false"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      :pan-on-drag="true"
      :nodes-draggable="true"
      :nodes-connectable="true"
      @init="onFlowInit"
      @connect="emit('connect', $event)"
      @node-click="(payload) => payload.node?.id && emit('select', payload.node.id)"
    >
      <template #node-commonAction="slotProps">
        <slot name="node-commonAction" v-bind="slotProps" />
      </template>
      <template #node-controllerAction="slotProps">
        <slot name="node-controllerAction" v-bind="slotProps" />
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.m-action-flow-canvas {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.m-action-editor__zoom-toolbar {
  display: flex;
  flex: none;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid var(--mk-form-border);
}

.m-action-editor__zoom-toolbar button {
  flex: none;
}

.m-action-editor__zoom-percent {
  min-width: 54px;
  text-align: center;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.m-action-editor__flow {
  flex: 1;
  height: auto;
  min-height: 0;
}
</style>
