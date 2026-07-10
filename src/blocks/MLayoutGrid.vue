<script lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import { normalizeValue, stringValue } from '@/blocks/pageDslEditorTools';
import type { BlockDataField } from '@/utils/variableValue';

export type MLayoutGridTrack = string | number;

export type MLayoutGridResponsiveConfig = {
  columns?: MLayoutGridTrack | MLayoutGridTrack[];
  gap?: number | string;
  areaOrder?: string[];
};

export type MLayoutGridArea = {
  id: string;
  name?: string;
  width?: MLayoutGridTrack;
  blocks: OutputData['blocks'];
};

export interface MLayoutGridProps extends EditorToolComponentProps {
  columns?: MLayoutGridTrack | MLayoutGridTrack[];
  gap?: number | string;
  responsive?: {
    mobile?: MLayoutGridResponsiveConfig;
    tablet?: MLayoutGridResponsiveConfig;
    desktop?: MLayoutGridResponsiveConfig;
  };
  areas?: MLayoutGridArea[];
}

const defaultAreas: MLayoutGridArea[] = [
  {
    id: 'main',
    name: '主区域',
    width: 'minmax(0, 1fr)',
    blocks: []
  },
  {
    id: 'aside',
    name: '侧边栏',
    width: '320px',
    blocks: []
  }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeTrack(value: unknown): MLayoutGridTrack | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.min(Math.trunc(value), 24);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed && /^[a-zA-Z0-9_#%(),.\-\s/]+$/.test(trimmed)) {
      return trimmed;
    }
  }

  return undefined;
}

function normalizeCssLength(value: unknown, fallback: number | string = 16): number | string {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.min(value, 1000);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
    if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(trimmed)) {
      return trimmed;
    }
  }

  return fallback;
}

function normalizeBlocks(value: unknown): OutputData['blocks'] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((block): block is OutputData['blocks'][number] => isRecord(block) && typeof block.type === 'string')
    .map((block) => cloneValue(block));
}

function normalizeAreaId(value: unknown, index: number, seenIds: Set<string>) {
  const rawId = typeof value === 'string' ? value.trim() : '';
  const baseId = rawId && /^[a-zA-Z0-9_-]+$/.test(rawId) ? rawId : `area_${index + 1}`;
  let id = baseId;
  let suffix = 2;
  while (seenIds.has(id)) {
    id = `${baseId}_${suffix++}`;
  }
  seenIds.add(id);
  return id;
}

function normalizeAreas(value: unknown): MLayoutGridArea[] {
  const source = Array.isArray(value) && value.length ? value : defaultAreas;
  const seenIds = new Set<string>();
  const areas = source
    .filter((area): area is Record<string, unknown> => isRecord(area))
    .slice(0, 4)
    .map((area, index) => ({
      id: normalizeAreaId(area.id, index, seenIds),
      name: stringValue(area.name, `区域 ${index + 1}`),
      width: normalizeTrack(area.width),
      blocks: normalizeBlocks(area.blocks)
    }));

  return areas.length ? areas : cloneValue(defaultAreas);
}

export function cssTrackValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return `${value}fr`;
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return 'minmax(0, 1fr)';
}

export function deriveColumnsFromAreas(areas: MLayoutGridArea[]) {
  return areas.map((area) => cssTrackValue(area.width)).join(' ');
}

function normalizeColumns(value: unknown, areas: MLayoutGridArea[]): MLayoutGridTrack | MLayoutGridTrack[] {
  if (Array.isArray(value)) {
    const tracks = value
      .map((item) => normalizeTrack(item))
      .filter((item): item is MLayoutGridTrack => item !== undefined);
    return tracks.length ? tracks : deriveColumnsFromAreas(areas);
  }

  return normalizeTrack(value) ?? deriveColumnsFromAreas(areas);
}

function normalizeResponsiveConfig(value: unknown): MLayoutGridResponsiveConfig | undefined {
  if (!isRecord(value)) return undefined;
  const areaOrder = Array.isArray(value.areaOrder)
    ? value.areaOrder
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim())
    : undefined;

  return {
    ...(value.columns !== undefined ? { columns: normalizeColumns(value.columns, defaultAreas) } : {}),
    ...(value.gap !== undefined ? { gap: normalizeCssLength(value.gap) } : {}),
    ...(areaOrder?.length ? { areaOrder } : {})
  };
}

function normalizeResponsive(value: unknown): MLayoutGridProps['responsive'] {
  if (!isRecord(value)) {
    return {
      mobile: {
        columns: 1
      }
    };
  }

  const mobile = normalizeResponsiveConfig(value.mobile) ?? { columns: 1 };
  return {
    ...(mobile ? { mobile } : {}),
    ...(normalizeResponsiveConfig(value.tablet) ? { tablet: normalizeResponsiveConfig(value.tablet) } : {}),
    ...(normalizeResponsiveConfig(value.desktop) ? { desktop: normalizeResponsiveConfig(value.desktop) } : {})
  };
}

export function normalizeMLayoutGridProps(props: Partial<MLayoutGridProps>): MLayoutGridProps {
  const areas = normalizeAreas(props.areas);
  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    columns: normalizeColumns(props.columns, areas),
    gap: normalizeCssLength(props.gap),
    responsive: normalizeResponsive(props.responsive),
    areas
  };
}

export function serializeMLayoutGridProps(props: Partial<MLayoutGridProps>) {
  const normalized = normalizeMLayoutGridProps(props);
  return {
    columns: normalizeValue(normalized.columns, deriveColumnsFromAreas(normalized.areas ?? defaultAreas)),
    gap: normalizeValue(normalized.gap, 16),
    ...(Object.keys(normalized.responsive ?? {}).length ? { responsive: cloneValue(normalized.responsive) } : {}),
    areas: (normalized.areas ?? []).map((area) => ({
      id: area.id,
      ...(area.name ? { name: area.name } : {}),
      ...(area.width !== undefined ? { width: area.width } : {}),
      blocks: cloneValue(area.blocks)
    }))
  };
}

function getLayoutGridDataFields(): BlockDataField[] {
  return [
    {
      label: '区域数据',
      variable: 'areas',
      dataType: 'array'
    },
    {
      label: '区域数量',
      variable: 'areaCount',
      dataType: 'number'
    }
  ];
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLayoutGrid",
 *   "displayName": "布局网格",
 *   "category": "content",
 *   "description": "多区域布局网格，支持列轨道、区域、嵌套 Block 和响应式断点；嵌套工具按当前文档 API 元数据构建。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MLayoutGrid",
 *     "toolSymbol": "mLayoutGridEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 90
 *   },
 *   "toolbox": {
 *     "title": "布局网格",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"5\" width=\"7\" height=\"14\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><rect x=\"13\" y=\"5\" width=\"7\" height=\"14\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>"
 *   },
 *   "defaultData": {
 *     "columns": "minmax(0, 1fr) 320px",
 *     "gap": 16,
 *     "responsive": {
 *       "mobile": {
 *         "columns": 1
 *       }
 *     },
 *     "areas": [
 *       {
 *         "id": "main",
 *         "name": "主区域",
 *         "width": "minmax(0, 1fr)",
 *         "blocks": []
 *       },
 *       {
 *         "id": "aside",
 *         "name": "侧边栏",
 *         "width": "320px",
 *         "blocks": []
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "columns",
 *       "optional": true,
 *       "tsType": "MLayoutGridTrack | MLayoutGridTrack[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 239,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "列宽配置",
 *       "type": "text",
 *       "placeholder": "minmax(0, 1fr) 320px"
 *     },
 *     {
 *       "key": "gap",
 *       "optional": true,
 *       "tsType": "number | string",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 244,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "区域间距",
 *       "type": "text",
 *       "placeholder": "16 / 16px / 1rem"
 *     },
 *     {
 *       "key": "responsive",
 *       "optional": true,
 *       "tsType": "{\n    mobile?: MLayoutGridResponsiveConfig;\n    tablet?: MLayoutGridResponsiveConfig;\n    desktop?: MLayoutGridResponsiveConfig;\n  }",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 29,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "响应式配置"
 *     },
 *     {
 *       "key": "areas",
 *       "optional": true,
 *       "tsType": "MLayoutGridArea[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 34,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "区域配置"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 678,
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "saveEditor",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 679,
 *       "label": "保存编辑器"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "'区域数据'",
 *         "zh": "区域数据",
 *         "en": "区域数据"
 *       },
 *       "variable": "areas",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 216
 *     },
 *     {
 *       "label": {
 *         "raw": "'区域数量'",
 *         "zh": "区域数量",
 *         "en": "区域数量"
 *       },
 *       "variable": "areaCount",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "line": 221
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MLayoutGrid-example",
 *       "type": "MLayoutGrid",
 *       "data": {
 *         "columns": "minmax(0, 1fr) 320px",
 *         "gap": 16,
 *         "responsive": {
 *           "mobile": {
 *             "columns": 1
 *           }
 *         },
 *         "areas": [
 *           {
 *             "id": "main",
 *             "name": "主区域",
 *             "width": "minmax(0, 1fr)",
 *             "blocks": []
 *           },
 *           {
 *             "id": "aside",
 *             "name": "侧边栏",
 *             "width": "320px",
 *             "blocks": []
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MLayoutGrid.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLayoutGridEditorTool = defineEditorTool<MLayoutGridProps>({
  getDataFields: getLayoutGridDataFields,
  normalizeProps: normalizeMLayoutGridProps,
  serialize: serializeMLayoutGridProps
});
</script>

<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs';
import type { ToolSettings } from '@editorjs/editorjs';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import EditorPreviewBlock from '@/blocks/components/EditorPreviewBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';
import {
  finalizeEditorOutputWithEvents,
  prepareEditorOutputWithEvents
} from '@/utils/blockEvents';
import { PreviewBlockRuntimeKey } from '@/utils/previewBlockRuntime';
import { getClientBlockDocsSnapshot } from '@/utils/clientBlockDocs';

type AreaEditorRegistry = Map<string, EditorJS>;
type AreaSyncEventName = 'input' | 'change' | 'click';
type AreaSyncListener = {
  event: AreaSyncEventName;
  listener: EventListener;
};

const GRID_TOOL_NAME = 'MLayoutGrid';
const MAX_AREAS = 4;

const props = defineProps<MLayoutGridProps & PageDslCallbacks<MLayoutGridProps>>();
const { t, localeValue } = useI18n();
const previewRuntime = inject(PreviewBlockRuntimeKey, null);

const gridState = ref<MLayoutGridProps>(normalizeMLayoutGridProps(props));
const viewportWidth = ref(typeof window === 'undefined' ? 1024 : window.innerWidth);
const areaHolders = new Map<string, HTMLElement>();
const areaEditors: AreaEditorRegistry = new Map();
const areaMutationObservers = new Map<string, MutationObserver>();
const scheduledAreaSyncs = new Map<string, number>();
const areaSyncListeners = new Map<string, AreaSyncListener[]>();
let isApplyingInternalChange = false;

const areas = computed(() => gridState.value.areas ?? []);
const canAddArea = computed(() => areas.value.length < MAX_AREAS);

const activeResponsiveConfig = computed(() => {
  if (viewportWidth.value < 640) return gridState.value.responsive?.mobile;
  if (viewportWidth.value < 1024) return gridState.value.responsive?.tablet;
  return gridState.value.responsive?.desktop;
});

const orderedAreas = computed(() => {
  const order = activeResponsiveConfig.value?.areaOrder;
  if (!order?.length) return areas.value;

  const areaById = new Map(areas.value.map((area) => [area.id, area]));
  const sorted = order.map((id) => areaById.get(id)).filter((area): area is MLayoutGridArea => Boolean(area));
  areas.value.forEach((area) => {
    if (!sorted.some((item) => item.id === area.id)) {
      sorted.push(area);
    }
  });
  return sorted;
});

const gridStyle = computed(() => ({
  '--m-layout-grid-columns': cssColumns(activeResponsiveConfig.value?.columns ?? gridState.value.columns, areas.value),
  '--m-layout-grid-gap': cssLength(activeResponsiveConfig.value?.gap ?? gridState.value.gap)
}));

function cssLength(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`;
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }
  return '16px';
}

function cssColumns(value: unknown, fallbackAreas: MLayoutGridArea[]) {
  if (Array.isArray(value)) return value.map((item) => cssTrackValue(item)).join(' ');
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return `repeat(${Math.min(Math.trunc(value), MAX_AREAS)}, minmax(0, 1fr))`;
  }
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed)
      ? `repeat(${Math.min(Number(trimmed), MAX_AREAS)}, minmax(0, 1fr))`
      : trimmed;
  }
  return deriveColumnsFromAreas(fallbackAreas);
}

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
  const holder = areaHolders.get(areaId);
  const area = findArea(areaId);
  if (!holder || !area) return;

  const [
    { default: EditorJSConstructor },
    { default: EditorJsColumns },
    { default: Table }
  ] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@calumk/editorjs-columns'),
    import('@editorjs/table')
  ]);
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
}

async function unmountAreaEditor(areaId: string) {
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
  await Promise.all(
    [...areaEditors.keys()]
      .filter((areaId) => !areaIds.has(areaId))
      .map((areaId) => unmountAreaEditor(areaId))
  );

  await nextTick();
  await Promise.all(areas.value.map((area) => mountAreaEditor(area.id)));
}

async function unmountAllAreaEditors() {
  await Promise.all([...areaEditors.keys()].map((areaId) => unmountAreaEditor(areaId)));
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

function updateViewportWidth() {
  viewportWidth.value = window.innerWidth;
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
  window.addEventListener('resize', updateViewportWidth);
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

    gridState.value = normalizeMLayoutGridProps(props);
    await reconcileAreaEditors();
  },
  { deep: true }
);

watch(
  () => props.edit,
  async (edit) => {
    gridState.value = {
      ...gridState.value,
      edit
    };
    await reconcileAreaEditors();
  }
);

watch(localeValue, async () => {
  await saveAllAreaEditors();
  await unmountAllAreaEditors();
  await nextTick();
  await reconcileAreaEditors();
});

onBeforeUnmount(async () => {
  window.removeEventListener('resize', updateViewportWidth);
  await unmountAllAreaEditors();
});
</script>

<template>
  <PageDslBlock block-type="MLayoutGrid">
    <div
      class="m-layout-grid"
      :class="{ 'm-layout-grid--edit': gridState.edit }"
      :style="gridStyle"
      data-testid="m-layout-grid"
      :data-block-id="currentBlockId || undefined"
    >
      <section
        v-for="area in orderedAreas"
        :key="area.id"
        class="m-layout-grid__area"
        :data-area-id="area.id"
        :data-testid="`m-layout-grid-area-${area.id}`"
      >
        <header v-if="gridState.edit" class="m-layout-grid__area-toolbar">
          <input
            class="m-layout-grid__area-name"
            :value="area.name"
            aria-label="区域名称"
            @input="updateAreaName(area.id, $event)"
          >
          <input
            class="m-layout-grid__area-width"
            :value="area.width ?? ''"
            aria-label="区域宽度"
            placeholder="minmax(0, 1fr)"
            @input="updateAreaWidth(area.id, $event)"
          >
          <button
            type="button"
            class="m-layout-grid__area-remove"
            :disabled="areas.length <= 1"
            @click="removeArea(area.id)"
          >
            删除
          </button>
        </header>

        <div
          v-if="gridState.edit"
          :ref="(element) => setAreaHolder(area.id, element)"
          class="m-layout-grid__editor"
          data-testid="layout-grid-area-editor"
        ></div>

        <div v-else class="m-layout-grid__preview">
          <EditorPreviewBlock
            v-for="block in area.blocks"
            :key="block.id ?? `${area.id}-${block.type}`"
            :block="block"
          />
          <p v-if="!area.blocks.length" class="m-layout-grid__empty">
            暂无内容
          </p>
        </div>
      </section>

      <button
        v-if="gridState.edit && canAddArea"
        type="button"
        class="m-layout-grid__add"
        @click="addArea"
      >
        添加区域
      </button>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.m-layout-grid {
  display: grid;
  grid-template-columns: var(--m-layout-grid-columns);
  gap: var(--m-layout-grid-gap);
  width: 100%;
}

.m-layout-grid__area {
  min-width: 0;
  border-radius: 8px;
}

.m-layout-grid--edit {
  align-items: stretch;
}

.m-layout-grid--edit .m-layout-grid__area {
  min-height: 180px;
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #d9e2ef;
}

.m-layout-grid__area-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, 180px) auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.m-layout-grid__area-name,
.m-layout-grid__area-width {
  width: 100%;
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  color: #0f172a;
  font-size: 12px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.m-layout-grid__area-remove,
.m-layout-grid__add {
  height: 30px;
  padding: 0 10px;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}

.m-layout-grid__area-remove:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.m-layout-grid__editor {
  min-height: 132px;
  padding: 2px 0;
}

.m-layout-grid__editor :deep(.codex-editor) {
  min-height: 120px;
}

.m-layout-grid__editor :deep(.ce-block__content),
.m-layout-grid__editor :deep(.ce-toolbar__content) {
  max-width: none;
}

.m-layout-grid__editor :deep(.ce-block__content) {
  margin: 0;
}

.m-layout-grid__preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 1px;
}

.m-layout-grid__empty {
  margin: 0;
  padding: 18px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.m-layout-grid__add {
  justify-self: start;
  color: #0f766e;
  border-color: #99f6e4;
}

@media (max-width: 640px) {
  .m-layout-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .m-layout-grid__area-toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
}

:global(.dark) .m-layout-grid--edit .m-layout-grid__area {
  background: #0f172a;
  border-color: #253247;
}

:global(.dark) .m-layout-grid__area-name,
:global(.dark) .m-layout-grid__area-width,
:global(.dark) .m-layout-grid__area-remove,
:global(.dark) .m-layout-grid__add {
  color: #e5e7eb;
  background: #111827;
  border-color: #374151;
}

:global(.dark) .m-layout-grid__empty {
  color: #94a3b8;
  border-color: #374151;
}
</style>
