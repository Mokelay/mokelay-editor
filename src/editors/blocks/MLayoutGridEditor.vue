<script lang="ts">
export { mLayoutGridEditorTool } from '@/editors/tools/mLayoutGridEditorTool';
export type {
  MLayoutGridArea,
  MLayoutGridProps,
  MLayoutGridResponsiveConfig,
  MLayoutGridTrack
} from 'mokelay-components/blocks/MLayoutGrid.vue';
</script>

<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs';
import type { OutputData, ToolSettings } from '@editorjs/editorjs';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import PageDslEditorBlock from '@/editors/components/PageDslEditorBlock.vue';
import MLayoutGridRenderer, {
  deriveColumnsFromAreas,
  normalizeMLayoutGridProps,
  type MLayoutGridArea,
  type MLayoutGridProps
} from 'mokelay-components/blocks/MLayoutGrid.vue';
import type { EditorToolComponentProps } from '@/editors/editorToolDefinition';
import type { PageDslCallbacks } from 'mokelay-components/blocks/pageDslRuntime';
import {
  finalizeEditorOutputWithEvents,
  prepareEditorOutputWithEvents
} from 'mokelay-components/blocks';
import { PreviewBlockRuntimeKey } from 'mokelay-components/runtime';
import { getClientBlockDocsSnapshot } from '@/utils/clientBlockDocs';

type AreaEditorRegistry = Map<string, EditorJS>;
type AreaSyncEventName = 'input' | 'change' | 'click';
type AreaSyncListener = {
  event: AreaSyncEventName;
  listener: EventListener;
};

const GRID_TOOL_NAME = 'MLayoutGrid';
const MAX_AREAS = 4;

const props = defineProps<MLayoutGridProps & EditorToolComponentProps & PageDslCallbacks<MLayoutGridProps>>();
const { t, localeValue } = useI18n();
const previewRuntime = inject(PreviewBlockRuntimeKey, null);

const gridState = ref<MLayoutGridProps>(normalizeMLayoutGridProps({ ...props, edit: true }));
const areaHolders = new Map<string, HTMLElement>();
const areaEditors: AreaEditorRegistry = new Map();
// Ref callbacks and lifecycle reconciliation can request the same mount before imports resolve.
const areaEditorMounts = new Map<string, Promise<void>>();
const areaMutationObservers = new Map<string, MutationObserver>();
const scheduledAreaSyncs = new Map<string, number>();
const areaSyncListeners = new Map<string, AreaSyncListener[]>();
let isApplyingInternalChange = false;

const areas = computed(() => gridState.value.areas ?? []);
const canAddArea = computed(() => areas.value.length < MAX_AREAS);

function cloneBlocks(blocks: OutputData['blocks'] = []) {
  return JSON.parse(JSON.stringify(blocks)) as OutputData['blocks'];
}

function buildAreaOutput(area: MLayoutGridArea): OutputData {
  return {
    blocks: cloneBlocks(area.blocks)
  };
}

async function saveEditorJsInstance(instance: EditorJS): Promise<OutputData | undefined> {
  await instance.isReady?.catch(() => undefined);

  const editorApi = instance as EditorJS & {
    save?: () => Promise<OutputData>;
    saver?: {
      save?: () => Promise<OutputData>;
    };
  };

  if (typeof editorApi.save === 'function') {
    return editorApi.save();
  }

  if (typeof editorApi.saver?.save === 'function') {
    return editorApi.saver.save();
  }

  return undefined;
}

function createNestedTools(
  EditorJSConstructor: typeof import('@editorjs/editorjs').default,
  EditorJsColumns: ToolSettings['class'],
  Table: ToolSettings['class']
) {
  const baseTools = {
    ...(createEditorTools({
      edit: true,
      getAvailableBlockDataSources: props.getAvailableBlockDataSources,
      getAvailablePageVariableSources: props.getAvailablePageVariableSources,
      previewRuntime: previewRuntime ?? props.previewRuntime
    }, {
      exclude: [GRID_TOOL_NAME],
      docs: getClientBlockDocsSnapshot()
    }) as Record<string, ToolSettings>),
    table: {
      class: Table as unknown as ToolSettings['class'],
      inlineToolbar: true
    }
  };

  return {
    ...baseTools,
    columns: {
      class: EditorJsColumns as unknown as ToolSettings['class'],
      config: {
        EditorJsLibrary: EditorJSConstructor,
        tools: baseTools
      }
    }
  };
}

function findArea(areaId: string) {
  return areas.value.find((area) => area.id === areaId);
}

function emitGridChange() {
  const payload = normalizeMLayoutGridProps(gridState.value);
  gridState.value = payload;
  isApplyingInternalChange = true;
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function updateArea(areaId: string, updater: (area: MLayoutGridArea) => MLayoutGridArea) {
  const nextAreas = areas.value.map((area) => area.id === areaId ? updater(area) : area);
  gridState.value = {
    ...gridState.value,
    areas: nextAreas
  };
  emitGridChange();
}

function syncAreaBlocks(areaId: string, output: OutputData) {
  const finalizedOutput = finalizeEditorOutputWithEvents(output);
  updateArea(areaId, (area) => ({
    ...area,
    blocks: cloneBlocks(finalizedOutput.blocks)
  }));
}

function clearScheduledAreaSync(areaId: string) {
  const scheduled = scheduledAreaSyncs.get(areaId);
  if (scheduled === undefined) return;
  window.clearTimeout(scheduled);
  scheduledAreaSyncs.delete(areaId);
}

function scheduleAreaSync(areaId: string) {
  const editor = areaEditors.get(areaId);
  if (!editor) return;

  clearScheduledAreaSync(areaId);
  const scheduled = window.setTimeout(async () => {
    scheduledAreaSyncs.delete(areaId);
    const currentEditor = areaEditors.get(areaId);
    if (!currentEditor) return;

    try {
      const output = await saveEditorJsInstance(currentEditor);
      if (output) {
        syncAreaBlocks(areaId, output);
      }
    } catch {
      // EditorJS may reject while nested tools are mounting; later input/change events will sync.
    }
  }, 0);
  scheduledAreaSyncs.set(areaId, scheduled);
}

function startAreaSyncListeners(areaId: string) {
  const holder = areaHolders.get(areaId);
  if (!holder) return;

  stopAreaSyncListeners(areaId);
  const observer = new MutationObserver(() => scheduleAreaSync(areaId));
  observer.observe(holder, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  });
  const listeners: AreaSyncListener[] = (['input', 'change', 'click'] as const).map((event) => ({
    event,
    listener: () => scheduleAreaSync(areaId)
  }));
  listeners.forEach(({ event, listener }) => {
    holder.addEventListener(event, listener);
  });
  areaMutationObservers.set(areaId, observer);
  areaSyncListeners.set(areaId, listeners);
}

function stopAreaSyncListeners(areaId: string) {
  const holder = areaHolders.get(areaId);
  areaSyncListeners.get(areaId)?.forEach(({ event, listener }) => {
    holder?.removeEventListener(event, listener);
  });
  areaSyncListeners.delete(areaId);
  areaMutationObservers.get(areaId)?.disconnect();
  areaMutationObservers.delete(areaId);
  clearScheduledAreaSync(areaId);
}

async function mountAreaEditor(areaId: string) {
  if (!gridState.value.edit || areaEditors.has(areaId)) return;
  const existingMount = areaEditorMounts.get(areaId);
  if (existingMount) {
    await existingMount;
    if (gridState.value.edit && !areaEditors.has(areaId) && areaHolders.has(areaId)) {
      await mountAreaEditor(areaId);
    }
    return;
  }

  const requestedHolder = areaHolders.get(areaId);
  if (!requestedHolder || !findArea(areaId)) return;

  let mountPromise: Promise<void>;
  mountPromise = (async () => {
    const [
      { default: EditorJSConstructor },
      { default: EditorJsColumns },
      { default: Table }
    ] = await Promise.all([
      import('@editorjs/editorjs'),
      import('@calumk/editorjs-columns'),
      import('@editorjs/table')
    ]);
    const holder = areaHolders.get(areaId);
    const area = findArea(areaId);
    if (
      !gridState.value.edit
      || areaEditors.has(areaId)
      || !holder
      || holder !== requestedHolder
      || !area
    ) return;

    const editor = new EditorJSConstructor({
      holder,
      placeholder: t('editor.placeholder'),
      tools: createNestedTools(
        EditorJSConstructor,
        EditorJsColumns as unknown as ToolSettings['class'],
        Table as unknown as ToolSettings['class']
      ),
      data: prepareEditorOutputWithEvents(buildAreaOutput(area)),
      minHeight: 0,
      i18n: {
        messages: getEditorJsI18nMessages(localeValue.value)
      },
      onChange: async () => {
        const currentEditor = areaEditors.get(areaId);
        if (!currentEditor) return;
        const output = await saveEditorJsInstance(currentEditor);
        if (output) {
          syncAreaBlocks(areaId, output);
        }
      }
    });

    areaEditors.set(areaId, editor);
    startAreaSyncListeners(areaId);
  })().finally(() => {
    if (areaEditorMounts.get(areaId) === mountPromise) {
      areaEditorMounts.delete(areaId);
    }
  });

  areaEditorMounts.set(areaId, mountPromise);
  await mountPromise;
}

async function unmountAreaEditor(areaId: string) {
  await areaEditorMounts.get(areaId)?.catch(() => undefined);
  const editor = areaEditors.get(areaId);
  if (!editor) return;
  areaEditors.delete(areaId);
  stopAreaSyncListeners(areaId);

  try {
    const output = await saveEditorJsInstance(editor);
    if (output) {
      syncAreaBlocks(areaId, output);
    }
  } catch {
    // Keep last synced data.
  }

  editor.destroy();
}

async function reconcileAreaEditors() {
  if (!gridState.value.edit) {
    await unmountAllAreaEditors();
    return;
  }

  const areaIds = new Set(areas.value.map((area) => area.id));
  const mountedAreaIds = new Set([...areaEditors.keys(), ...areaEditorMounts.keys()]);
  await Promise.all(
    [...mountedAreaIds]
      .filter((areaId) => !areaIds.has(areaId))
      .map((areaId) => unmountAreaEditor(areaId))
  );

  await nextTick();
  await Promise.all(areas.value.map((area) => mountAreaEditor(area.id)));
}

async function unmountAllAreaEditors() {
  const areaIds = new Set([...areaEditors.keys(), ...areaEditorMounts.keys()]);
  await Promise.all([...areaIds].map((areaId) => unmountAreaEditor(areaId)));
}

function setAreaHolder(areaId: string, element: unknown) {
  if (element instanceof HTMLElement) {
    areaHolders.set(areaId, element);
    void nextTick(() => mountAreaEditor(areaId));
    return;
  }

  areaHolders.delete(areaId);
}

async function saveAllAreaEditors() {
  for (const [areaId, editor] of areaEditors.entries()) {
    try {
      const output = await saveEditorJsInstance(editor);
      if (output) {
        syncAreaBlocks(areaId, output);
      }
    } catch {
      // Keep last synced data.
    }
  }
  return normalizeMLayoutGridProps(gridState.value);
}

async function addArea() {
  if (!canAddArea.value) return;
  await saveAllAreaEditors();

  const nextIndex = areas.value.length + 1;
  const nextAreas = [
    ...areas.value,
    {
      id: `area_${nextIndex}`,
      name: `区域 ${nextIndex}`,
      width: 'minmax(0, 1fr)',
      blocks: []
    }
  ];
  gridState.value = {
    ...gridState.value,
    columns: deriveColumnsFromAreas(nextAreas),
    areas: nextAreas
  };
  emitGridChange();
  await nextTick();
  await reconcileAreaEditors();
}

async function removeArea(areaId: string) {
  if (areas.value.length <= 1) return;
  await saveAllAreaEditors();
  await unmountAreaEditor(areaId);

  const nextAreas = areas.value.filter((area) => area.id !== areaId);
  gridState.value = {
    ...gridState.value,
    columns: deriveColumnsFromAreas(nextAreas),
    areas: nextAreas
  };
  emitGridChange();
}

function updateAreaName(areaId: string, event: Event) {
  const value = event.target instanceof HTMLInputElement ? event.target.value : '';
  updateArea(areaId, (area) => ({
    ...area,
    name: value
  }));
}

function updateAreaWidth(areaId: string, event: Event) {
  const value = event.target instanceof HTMLInputElement ? event.target.value.trim() : '';
  const nextWidth = value || 'minmax(0, 1fr)';
  const nextAreas = areas.value.map((area) => area.id === areaId ? {
    ...area,
    width: nextWidth
  } : area);
  gridState.value = {
    ...gridState.value,
    columns: deriveColumnsFromAreas(nextAreas),
    areas: nextAreas
  };
  emitGridChange();
}

function getData() {
  return {
    areas: areas.value,
    areaCount: areas.value.length
  };
}

async function saveEditor() {
  return saveAllAreaEditors();
}

defineExpose({
  getData,
  saveEditor
});

onMounted(async () => {
  await nextTick();
  await reconcileAreaEditors();
});

watch(
  () => ({
    areas: props.areas,
    columns: props.columns,
    gap: props.gap,
    responsive: props.responsive
  }),
  async () => {
    if (isApplyingInternalChange) {
      isApplyingInternalChange = false;
      return;
    }

    gridState.value = normalizeMLayoutGridProps({ ...props, edit: true });
    await reconcileAreaEditors();
  },
  { deep: true }
);

watch(localeValue, async () => {
  await saveAllAreaEditors();
  await unmountAllAreaEditors();
  await nextTick();
  await reconcileAreaEditors();
});

onBeforeUnmount(async () => {
  await unmountAllAreaEditors();
});
</script>

<template>
  <PageDslEditorBlock block-type="MLayoutGrid">
    <div class="m-layout-grid-editor">
      <MLayoutGridRenderer v-bind="gridState" :edit="true">
        <template #area="{ area }">
          <header class="m-layout-grid-editor__area-toolbar">
            <input
              class="m-layout-grid-editor__area-name"
              :value="area.name"
              aria-label="区域名称"
              @input="updateAreaName(area.id, $event)"
            >
            <input
              class="m-layout-grid-editor__area-width"
              :value="area.width ?? ''"
              aria-label="区域宽度"
              placeholder="minmax(0, 1fr)"
              @input="updateAreaWidth(area.id, $event)"
            >
            <button
              type="button"
              class="m-layout-grid-editor__area-remove"
              :disabled="areas.length <= 1"
              @click="removeArea(area.id)"
            >
              删除
            </button>
          </header>
          <div
            :ref="(element) => setAreaHolder(area.id, element)"
            class="m-layout-grid-editor__surface"
            data-testid="layout-grid-area-editor"
          ></div>
        </template>
      </MLayoutGridRenderer>
      <button
        v-if="canAddArea"
        type="button"
        class="m-layout-grid-editor__add"
        @click="addArea"
      >
        添加区域
      </button>
    </div>
  </PageDslEditorBlock>
</template>

<style scoped>
.m-layout-grid-editor { width: 100%; }
.m-layout-grid-editor :deep(.m-layout-grid__area) {
  min-height: 180px;
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #d9e2ef;
}
.m-layout-grid-editor__area-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, 180px) auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.m-layout-grid-editor__area-name,
.m-layout-grid-editor__area-width {
  width: 100%;
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  color: #0f172a;
  font-size: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.m-layout-grid-editor__area-remove,
.m-layout-grid-editor__add {
  height: 30px;
  padding: 0 10px;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}
.m-layout-grid-editor__area-remove:disabled { cursor: not-allowed; opacity: 0.55; }
.m-layout-grid-editor__surface { min-height: 132px; padding: 2px 0; }
.m-layout-grid-editor__surface :deep(.codex-editor) { min-height: 120px; }
.m-layout-grid-editor__surface :deep(.ce-block__content),
.m-layout-grid-editor__surface :deep(.ce-toolbar__content) { max-width: none; }
.m-layout-grid-editor__surface :deep(.ce-block__content) { margin: 0; }
.m-layout-grid-editor__add {
  margin-top: 10px;
  color: #0f766e;
  border-color: #99f6e4;
}
@media (max-width: 640px) {
  .m-layout-grid-editor__area-toolbar { grid-template-columns: minmax(0, 1fr); }
}
:global(.dark) .m-layout-grid-editor :deep(.m-layout-grid__area) {
  background: #0f172a;
  border-color: #253247;
}
:global(.dark) .m-layout-grid-editor__area-name,
:global(.dark) .m-layout-grid-editor__area-width,
:global(.dark) .m-layout-grid-editor__area-remove,
:global(.dark) .m-layout-grid-editor__add {
  color: #e5e7eb;
  background: #111827;
  border-color: #374151;
}
</style>
