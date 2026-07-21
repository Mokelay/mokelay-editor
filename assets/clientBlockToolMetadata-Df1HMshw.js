const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MFormItemsEditor-CdhAHFmS.js","./element-plus-B7TX3q_R.js","./element-plus-CLuGgbGi.css","./MFieldsEditor-DlGNmpdQ.js","./translationsApi-BurMgT_P.js","./index-CZSz_1AT.js","./json-editor-CCiBQVtL.js","./json-editor-C9TzHYAF.css","./index-D2LbT4e7.css","./apisApi-DOQ_EmFx.js","./translationsApi-B2tCyd3V.css","./editorToolDefinition-BzSiZ_bo.js","./MFieldsEditor-DMAG6ZIa.css","./mFormRuntime-BTnnMgG1.js","./MActionToolbar2.vue-uJDwx9ur.js","./mFormItemTools-Co9Sovwy.js","./editorComponentRegistry-qQ-6gCDV.js","./MLocalizedTextEditor-D6Z1djIz.js","./MLocalizedTextEditor-QEIPsWSp.css","./MFormItemsEditor-VeYTvnZN.css","./MActionToolBarEditor-CHW0_w9i.js","./MActionEditor-CYi3yItt.js","./vue-flow-YXbDWTw1.js","./vue-flow-DjrIs5xU.css","./MActionEditor-BgQwrSt6.css","./MActionToolBarEditor-BYJwwZ_3.css","./MAdvanceTableColumnsEditor-CNEwhrmw.js","./advanceTableColumns-BBXYLCc5.js","./MAdvanceTableColumnsEditor-Cn0ufDCG.css","./MChartDataEditor-DbIe9k6l.js","./MChartDataEditor-DMpfYoPu.css","./MDatasourceEditor-BOs5Sww1.js","./MVariableValueEditor-BJP8PRIc.js","./MVariableValueEditor-BBIRqU0N.css","./MDatasourceEditor-KsUDRRu8.css","./MTabsConfigEditor-HZMrTRpp.js","./MTabsConfigEditor-DnAFTO7Q.css"])))=>i.map(i=>d[i]);
import{aw as M,E as y,aI as S}from"./index-CZSz_1AT.js";import{_ as s}from"./json-editor-CCiBQVtL.js";import{ag as d}from"./element-plus-B7TX3q_R.js";const I=`<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  cloneActions as cloneEditorActions,
  type ActionConfig as EditorActionConfig
} from 'mokelay-components/actions';

export interface MActionEditorProps extends EditorToolComponentProps {
  value?: EditorActionConfig[];
  modelValue?: EditorActionConfig[];
}

function normalizeMActionEditorProps(props: Partial<MActionEditorProps>): MActionEditorProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    pageEditor: props.pageEditor,
    value: cloneEditorActions(props.value ?? props.modelValue)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MActionEditor",
 *   "displayName": "Action配置",
 *   "category": "action",
 *   "description": "动作配置编辑器，用于编辑并序列化 Action 配置数组，同时发出变更事件。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MActionEditor",
 *     "toolSymbol": "mActionEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 40
 *   },
 *   "toolbox": {
 *     "title": "Action配置",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M5 5h5v5H5V5Zm9 0h5v5h-5V5ZM5 14h5v5H5v-5Zm9.5.5 4 4m0-4-4 4M10 7.5h4M7.5 10v4\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "EditorActionConfig[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "动作配置"
 *     },
 *     {
 *       "key": "modelValue",
 *       "optional": true,
 *       "tsType": "EditorActionConfig[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "绑定动作配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "update:modelValue",
 *       "payload": "value: ActionConfig[]",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionEditor.vue",
 *       "label": "更新绑定值"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "value: ActionConfig[]",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionEditor.vue",
 *       "label": "变更"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MActionEditor-example",
 *       "type": "MActionEditor",
 *       "data": {
 *         "value": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MActionEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MActionEditor.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mActionEditorTool = defineEditorTool<MActionEditorProps>({
  normalizeProps: normalizeMActionEditorProps,
  serialize: (props) => ({
    value: cloneEditorActions(props.value ?? props.modelValue)
  })
});
<\/script>

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
import {
  cloneActions,
  createActionUuid,
  type ActionConfig,
  type ActionNode
} from 'mokelay-components/actions';
import type { PageReference } from '@/editors/pageEditor';
import {
  listPages,
  listSystemPages,
  type PageListItem
} from '@/services/pagesApi';

const actionDefinitions = [
  {
    action: 'execute_ds',
    title: '调用数据源',
    alias: '调用数据源',
    inputs: { dsConfig: {} },
    outputs: ['rawResponse', 'responses', 'data']
  },
  {
    action: 'confirm',
    title: '确认',
    alias: '确认操作',
    inputs: { title: '提示', content: '是否确认操作？' },
    outputs: ['result']
  },
  {
    action: 'open_dialog',
    title: '打开对话框',
    alias: '打开对话框',
    inputs: { title: '', pageUUID: '', pageSource: 'user', context: {} },
    outputs: ['close_result']
  },
  {
    action: 'jump_url',
    title: '跳转链接',
    alias: '跳转链接',
    inputs: { openNew: false, url: '' },
    outputs: []
  },
  {
    action: 'call_block_method',
    title: '调用 Block 方法',
    alias: '调用方法',
    inputs: { blockId: '', method: '' },
    outputs: ['returnData']
  },
  {
    action: 'upload_file',
    title: '上传文件',
    alias: '上传文件',
    inputs: {
      file: { template: '{{event.file}}' },
      mode: 'direct',
      endpoint: '',
      fileField: 'file'
    },
    outputs: ['files', 'urls', 'success', 'rawResponse']
  },
  {
    action: 'download_blob',
    title: '下载文件',
    alias: '下载文件',
    inputs: {
      url: '',
      fileName: 'download'
    },
    outputs: ['downloaded', 'fileName']
  },
  {
    action: 'if_controller',
    title: 'If',
    alias: 'If 控制器',
    type: 'controller' as const,
    inputs: { value: true },
    outputs: [],
    nodes: [
      { uuid: 'true_node', alias: 'true', value: true, nextAction: null },
      { uuid: 'false_node', alias: 'false', value: false, nextAction: null }
    ]
  },
  {
    action: 'switch_controller',
    title: 'Switch',
    alias: 'Switch 控制器',
    type: 'controller' as const,
    inputs: { value: '', dataType: 'string' },
    outputs: [],
    nodes: [
      { uuid: 'case_1', alias: 'Case', value: '', nextAction: null },
      { uuid: 'default_node', alias: 'Default', type: 'DEFAULT' as const, nextAction: null }
    ]
  }
];

const props = defineProps<MActionEditorProps & {
  onToolChange?: (payload: MActionEditorProps) => void;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: ActionConfig[]): void;
  (event: 'change', value: ActionConfig[]): void;
}>();

const isOpen = ref(false);
const selectedUuid = ref('');
const draftActions = ref<ActionConfig[]>(cloneActions(props.modelValue ?? props.value));
const inputsError = ref('');
const outputsError = ref('');
const pageOptions = ref<PageListItem[]>([]);
const pagesLoading = ref(false);
const pagesError = ref('');
const pageSearch = ref('');
const pageKindFilter = ref<'all' | 'main' | 'sub'>('all');
const relationNotice = ref('');
let pagesLoadId = 0;

const selectedAction = computed(() => draftActions.value.find((action) => action.uuid === selectedUuid.value) ?? draftActions.value[0] ?? null);
const selectedOpenDialogTarget = computed(() => readOpenDialogTarget(selectedAction.value));
const filteredPageOptions = computed(() => {
  const query = pageSearch.value.trim().toLowerCase();
  return pageOptions.value.filter((page) => {
    if (pageKindFilter.value === 'sub' && !page.subPage) return false;
    if (pageKindFilter.value === 'main' && page.subPage) return false;
    if (!query) return true;
    return page.name.toLowerCase().includes(query) || page.uuid.toLowerCase().includes(query);
  });
});
const targetOptions = computed(() => draftActions.value.map((action) => ({
  uuid: action.uuid,
  label: \`\${action.alias || action.action} / \${action.uuid}\`
})));

const flowNodes = computed<Node[]>(() => draftActions.value.map((action, index) => ({
  id: action.uuid,
  type: action.type === 'controller' ? 'controllerAction' : 'commonAction',
  position: { x: 80 + index * 250, y: action.type === 'controller' ? 220 : 120 },
  data: {
    action,
    selected: selectedUuid.value === action.uuid,
    label: action.alias || action.action
  }
})));

const flowEdges = computed<Edge[]>(() => {
  const edges: Edge[] = [];
  draftActions.value.forEach((action) => {
    if (action.nextAction) {
      edges.push(createEdge(action.uuid, action.nextAction, 'next'));
    }
    action.nodes?.forEach((node) => {
      if (node.nextAction) {
        edges.push(createEdge(action.uuid, node.nextAction, node.uuid, nodeLabel(node)));
      }
    });
  });
  return edges;
});

watch(
  () => props.modelValue,
  (value) => {
    if (isOpen.value) return;
    draftActions.value = cloneActions(value ?? props.value);
    selectedUuid.value = draftActions.value[0]?.uuid ?? '';
  },
  { deep: true }
);

watch(
  () => props.value,
  (value) => {
    if (isOpen.value || props.modelValue !== undefined) return;
    draftActions.value = cloneActions(value);
    selectedUuid.value = draftActions.value[0]?.uuid ?? '';
  },
  { deep: true }
);

function openDialog() {
  draftActions.value = cloneActions(props.modelValue ?? props.value);
  selectedUuid.value = draftActions.value[0]?.uuid ?? '';
  inputsError.value = '';
  outputsError.value = '';
  relationNotice.value = '';
  isOpen.value = true;
  if (!pageOptions.value.length) {
    void refreshPageOptions();
  }
}

function closeDialog() {
  isOpen.value = false;
}

function createEdge(source: string, target: string, sourceHandle: string, label = ''): Edge {
  return {
    id: \`\${source}-\${sourceHandle}-\${target}\`,
    source,
    target,
    sourceHandle,
    label,
    markerEnd: MarkerType.ArrowClosed
  };
}

function emitChanges() {
  const actions = cloneActions(draftActions.value);
  emit('update:modelValue', actions);
  if (!props.onToolChange) {
    emit('change', actions);
  }
  props.onToolChange?.({
    edit: props.edit,
    value: actions
  });
}

function selectAction(uuid: string) {
  selectedUuid.value = uuid;
  inputsError.value = '';
  outputsError.value = '';
}

function addAction(definition: typeof actionDefinitions[number]) {
  const uuid = createActionUuid(definition.action);
  const nextAction = draftActions.value.length ? null : null;
  const action: ActionConfig = {
    uuid,
    action: definition.action,
    alias: definition.alias,
    ...(definition.type ? { type: definition.type } : {}),
    inputs: cloneValue(definition.inputs),
    ...(definition.outputs.length ? { outputs: [...definition.outputs] } : {}),
    nextAction,
    ...(definition.nodes ? {
      nodes: definition.nodes.map((node) => ({
        ...node,
        uuid: \`\${uuid}_\${node.uuid}\`
      }))
    } : {})
  };

  const previousAction = draftActions.value[draftActions.value.length - 1];
  if (previousAction && previousAction.nextAction === null) {
    previousAction.nextAction = uuid;
  }

  draftActions.value = [...draftActions.value, action];
  selectedUuid.value = uuid;
  emitChanges();
}

function removeSelectedAction() {
  const action = selectedAction.value;
  if (!action) return;

  draftActions.value = draftActions.value
    .filter((item) => item.uuid !== action.uuid)
    .map((item) => ({
      ...item,
      nextAction: item.nextAction === action.uuid ? null : item.nextAction,
      nodes: item.nodes?.map((node) => ({
        ...node,
        nextAction: node.nextAction === action.uuid ? null : node.nextAction
      }))
    }));
  selectedUuid.value = draftActions.value[0]?.uuid ?? '';
  emitChanges();
}

function updateSelectedAction(patch: Partial<ActionConfig>) {
  const action = selectedAction.value;
  if (!action) return;
  Object.assign(action, patch);
  emitChanges();
}

function updateSelectedUuid(value: string) {
  const action = selectedAction.value;
  const nextUuid = value.trim();
  if (!action || !nextUuid || draftActions.value.some((item) => item.uuid === nextUuid && item !== action)) return;
  const previousUuid = action.uuid;
  action.uuid = nextUuid;
  draftActions.value.forEach((item) => {
    if (item.nextAction === previousUuid) item.nextAction = nextUuid;
    item.nodes?.forEach((node) => {
      if (node.nextAction === previousUuid) node.nextAction = nextUuid;
    });
  });
  selectedUuid.value = nextUuid;
  emitChanges();
}

function hasOwn(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function readOpenDialogTarget(action: ActionConfig | null): {
  target: PageReference | null;
  error: string;
  rawUuid: unknown;
} {
  if (!action || action.action !== 'open_dialog') {
    return { target: null, error: '', rawUuid: undefined };
  }
  const inputs = isRecord(action.inputs) ? action.inputs : {};
  const hasCanonical = hasOwn(inputs, 'pageUUID');
  const hasLegacy = hasOwn(inputs, 'pageUuid');
  if (hasCanonical && hasLegacy) {
    return {
      target: null,
      error: '页面目标不能同时配置 pageUUID 和 pageUuid，请重新选择固定页面。',
      rawUuid: inputs.pageUUID
    };
  }
  const rawUuid = hasCanonical ? inputs.pageUUID : inputs.pageUuid;
  if (typeof rawUuid !== 'string' || !rawUuid.trim() || rawUuid.includes('{{') || rawUuid.includes('}}')) {
    return {
      target: null,
      error: rawUuid === undefined || rawUuid === ''
        ? '请选择固定页面。'
        : '不支持动态页面目标，请重新选择固定页面。',
      rawUuid
    };
  }
  if (inputs.pageSource !== undefined && inputs.pageSource !== 'user' && inputs.pageSource !== 'system') {
    return { target: null, error: '页面来源配置无效。', rawUuid };
  }
  return {
    target: {
      uuid: rawUuid.trim(),
      source: inputs.pageSource === 'system' ? 'system' : 'user'
    },
    error: '',
    rawUuid
  };
}

function pageOptionValue(page: Pick<PageListItem, 'source' | 'uuid'>) {
  return \`\${page.source}:\${page.uuid}\`;
}

function isPageReferenceAllowed(page: Pick<PageListItem, 'source' | 'uuid'>) {
  return props.pageEditor?.canReference({ uuid: page.uuid, source: page.source }).allowed ?? true;
}

function selectedPageOptionValue() {
  const target = selectedOpenDialogTarget.value.target;
  return target ? pageOptionValue(target) : '';
}

function updateOpenDialogInputs(patch: Record<string, unknown>) {
  const action = selectedAction.value;
  if (!action || action.action !== 'open_dialog') return;
  const inputs = isRecord(action.inputs) ? { ...action.inputs } : {};
  Object.assign(inputs, patch);
  if (Object.prototype.hasOwnProperty.call(patch, 'pageUUID')) {
    delete inputs.pageUuid;
  }
  action.inputs = inputs;
  inputsError.value = '';
  relationNotice.value = '';
  emitChanges();
}

function selectOpenDialogPage(value: string) {
  const separatorIndex = value.indexOf(':');
  if (separatorIndex < 0) return;
  const source = value.slice(0, separatorIndex) === 'system' ? 'system' : 'user';
  const uuid = value.slice(separatorIndex + 1).trim();
  if (!uuid) return;
  updateOpenDialogInputs({ pageUUID: uuid, pageSource: source });
}

function updateOpenDialogContext(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (!isRecord(parsed)) throw new Error('context must be an object');
    inputsError.value = '';
    updateOpenDialogInputs({ context: parsed });
  } catch {
    inputsError.value = '请输入有效的 context JSON 对象。';
  }
}

async function refreshPageOptions() {
  const loadId = ++pagesLoadId;
  pagesLoading.value = true;
  pagesError.value = '';
  try {
    const [userPages, systemPages] = await Promise.allSettled([
      listPages({ page: 1, pageSize: 1000 }),
      listSystemPages()
    ]);
    if (loadId !== pagesLoadId) return;
    pageOptions.value = [
      ...(userPages.status === 'fulfilled' ? userPages.value : []),
      ...(systemPages.status === 'fulfilled' ? systemPages.value : [])
    ];
    if (userPages.status === 'rejected' && systemPages.status === 'rejected') {
      pagesError.value = '页面列表加载失败。';
    }
  } finally {
    if (loadId === pagesLoadId) pagesLoading.value = false;
  }
}

async function createOpenDialogPage() {
  const action = selectedAction.value;
  if (!action || !props.pageEditor) return;
  pagesError.value = '';
  if (!props.pageEditor.canCreateSubPage) {
    pagesError.value = '当前为临时编排会话，不能创建子页面。';
    return;
  }
  try {
    const result = await props.pageEditor.createUserSubPage({
      kind: 'open_dialog',
      blockId: props.currentBlockId,
      actionUuid: action.uuid
    }, {
      name: typeof action.inputs?.title === 'string' ? action.inputs.title : undefined
    });
    if (result.status !== 'saved') return;
    const page: PageListItem = {
      uuid: result.page.uuid,
      name: result.page.name,
      source: 'user',
      subPage: result.page.subPage,
      quotes: result.page.quotes,
      dependencies: result.page.dependencies
    };
    pageOptions.value = [page, ...pageOptions.value.filter((item) => pageOptionValue(item) !== pageOptionValue(page))];
    updateOpenDialogInputs({ pageUUID: page.uuid, pageSource: 'user' });
    relationNotice.value = '子页面已保存；待当前页面保存后建立引用关系。';
  } catch (error) {
    pagesError.value = error instanceof Error ? error.message : '无法打开子页面编排器。';
  }
}

async function editOpenDialogPage() {
  const action = selectedAction.value;
  const target = selectedOpenDialogTarget.value.target;
  if (!action || !target || !props.pageEditor) return;
  pagesError.value = '';
  try {
    await props.pageEditor.openExisting(target, {
      kind: 'open_dialog',
      blockId: props.currentBlockId,
      actionUuid: action.uuid
    });
  } catch (error) {
    pagesError.value = error instanceof Error ? error.message : '无法打开子页面编排器。';
  }
}

function updateInputs(value: string) {
  const action = selectedAction.value;
  if (!action) return;
  try {
    const parsed = JSON.parse(value);
    if (!isRecord(parsed)) {
      throw new Error('inputs must be an object');
    }
    inputsError.value = '';
    action.inputs = parsed;
    emitChanges();
  } catch {
    inputsError.value = '请输入有效 JSON 对象。';
  }
}

function updateOutputs(value: string) {
  const action = selectedAction.value;
  if (!action) return;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
      throw new Error('outputs must be a string array');
    }
    outputsError.value = '';
    action.outputs = parsed.filter((item) => item.trim());
    emitChanges();
  } catch {
    outputsError.value = '请输入有效字符串数组 JSON。';
  }
}

function updateNextAction(action: ActionConfig, value: string) {
  action.nextAction = value || null;
  emitChanges();
}

function updateNode(node: ActionNode, patch: Partial<ActionNode>) {
  Object.assign(node, patch);
  emitChanges();
}

function addSwitchCase(action: ActionConfig) {
  const nodes = action.nodes ?? [];
  nodes.push({
    uuid: \`\${action.uuid}_case_\${nodes.length + 1}\`,
    alias: 'Case',
    value: defaultCaseValue(action),
    nextAction: null
  });
  action.nodes = nodes;
  emitChanges();
}

function addSwitchDefault(action: ActionConfig) {
  const nodes = action.nodes ?? [];
  if (nodes.some((node) => node.type === 'DEFAULT')) return;
  nodes.push({
    uuid: \`\${action.uuid}_default\`,
    alias: 'Default',
    type: 'DEFAULT',
    nextAction: null
  });
  action.nodes = nodes;
  emitChanges();
}

function removeNode(action: ActionConfig, index: number) {
  action.nodes?.splice(index, 1);
  emitChanges();
}

function updateNodeUuid(action: ActionConfig, node: ActionNode, value: string) {
  const uuid = value.trim();
  if (!uuid || action.nodes?.some((item) => item !== node && item.uuid === uuid)) return;
  node.uuid = uuid;
  emitChanges();
}

function parseNodeValue(value: string, action: ActionConfig) {
  const dataType = isRecord(action.inputs) ? action.inputs.dataType : 'string';
  if (dataType === 'number') {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  if (dataType === 'boolean') {
    return value === 'true';
  }
  return value;
}

function defaultCaseValue(action: ActionConfig) {
  const dataType = isRecord(action.inputs) ? action.inputs.dataType : 'string';
  if (dataType === 'number') return 0;
  if (dataType === 'boolean') return true;
  return '';
}

function onConnect(connection: Connection) {
  const source = draftActions.value.find((action) => action.uuid === connection.source);
  if (!source || !connection.target) return;

  if (connection.sourceHandle && connection.sourceHandle !== 'next') {
    const node = source.nodes?.find((item) => item.uuid === connection.sourceHandle);
    if (node) {
      node.nextAction = connection.target;
      emitChanges();
    }
    return;
  }

  source.nextAction = connection.target;
  emitChanges();
}

function nodeLabel(node: ActionNode) {
  if (node.type === 'DEFAULT') return 'DEFAULT';
  return String(node.value);
}

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function formatOutputs(value: unknown) {
  return JSON.stringify(Array.isArray(value) ? value : [], null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
<\/script>

<template>
  <div class="m-action-editor" data-testid="m-action-editor">
    <button type="button" class="m-action-editor__open" data-testid="m-action-editor-open" @click="openDialog">
      配置Actions
    </button>

    <div v-if="isOpen" class="m-action-editor__overlay" data-testid="m-action-editor-dialog">
      <section class="m-action-editor__dialog" role="dialog" aria-modal="true">
        <header class="m-action-editor__header">
          <h3>Action配置</h3>
          <button type="button" class="m-action-editor__close" data-testid="m-action-editor-close" @click="closeDialog">
            关闭
          </button>
        </header>

        <div class="m-action-editor__layout">
          <aside class="m-action-editor__palette">
            <h4>内置Action</h4>
            <button
              v-for="definition in actionDefinitions"
              :key="definition.action"
              type="button"
              class="m-action-editor__palette-button"
              :data-testid="\`m-action-add-\${definition.action}\`"
              @click="addAction(definition)"
            >
              <span>{{ definition.title }}</span>
              <code>{{ definition.action }}</code>
            </button>
          </aside>

          <main class="m-action-editor__canvas">
            <VueFlow
              id="m-action-editor-flow"
              :nodes="flowNodes"
              :edges="flowEdges"
              :default-viewport="{ zoom: 0.8, x: 0, y: 0 }"
              :min-zoom="0.35"
              :max-zoom="1.2"
              :nodes-draggable="true"
              :nodes-connectable="true"
              @connect="onConnect"
              @node-click="(payload) => payload.node?.id && selectAction(payload.node.id)"
            >
              <template #node-commonAction="{ data }">
                <div class="m-action-editor__flow-node" :class="{ 'is-selected': data.selected }">
                  <Handle type="target" :position="Position.Left" />
                  <Handle id="next" type="source" :position="Position.Right" />
                  <p>{{ data.action.action }}</p>
                  <strong>{{ data.label }}</strong>
                  <small>{{ data.action.uuid }}</small>
                </div>
              </template>

              <template #node-controllerAction="{ data }">
                <div class="m-action-editor__flow-node m-action-editor__flow-node--controller" :class="{ 'is-selected': data.selected }">
                  <Handle type="target" :position="Position.Left" />
                  <p>{{ data.action.action }}</p>
                  <strong>{{ data.label }}</strong>
                  <small>{{ data.action.uuid }}</small>
                  <div
                    v-for="(node, index) in data.action.nodes"
                    :key="node.uuid"
                    class="m-action-editor__branch-handle"
                    :style="{ top: \`\${70 + index * 28}px\` }"
                  >
                    <span>{{ nodeLabel(node) }}</span>
                    <Handle :id="node.uuid" type="source" :position="Position.Right" />
                  </div>
                </div>
              </template>
            </VueFlow>
          </main>

          <aside class="m-action-editor__inspector">
            <template v-if="selectedAction">
              <div class="m-action-editor__inspector-header">
                <h4>Action设置</h4>
                <button type="button" @click="removeSelectedAction">删除</button>
              </div>

              <label>
                <span>uuid</span>
                <input :value="selectedAction.uuid" data-testid="m-action-uuid" @change="updateSelectedUuid(($event.target as HTMLInputElement).value)" />
              </label>

              <label>
                <span>alias</span>
                <input v-model="selectedAction.alias" data-testid="m-action-alias" @input="emitChanges" />
              </label>

              <label>
                <span>action</span>
                <input :value="selectedAction.action" disabled />
              </label>

              <div v-if="selectedAction.action === 'open_dialog'" class="m-action-editor__page-reference" data-testid="m-action-open-dialog-fields">
                <label>
                  <span>弹窗标题</span>
                  <input
                    :value="typeof selectedAction.inputs?.title === 'string' ? selectedAction.inputs.title : ''"
                    data-testid="m-action-dialog-title"
                    @input="updateOpenDialogInputs({ title: ($event.target as HTMLInputElement).value })"
                  />
                </label>

                <div class="m-action-editor__page-filters">
                  <input v-model="pageSearch" type="search" placeholder="按名称或 UUID 搜索" data-testid="m-action-page-search" />
                  <select v-model="pageKindFilter" data-testid="m-action-page-kind-filter">
                    <option value="all">全部页面</option>
                    <option value="main">主页面</option>
                    <option value="sub">子页面</option>
                  </select>
                </div>

                <label>
                  <span>固定页面目标</span>
                  <select
                    :value="selectedPageOptionValue()"
                    data-testid="m-action-dialog-page"
                    @change="selectOpenDialogPage(($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">请选择页面</option>
                    <option
                      v-if="selectedOpenDialogTarget.target && !pageOptions.some((page) => pageOptionValue(page) === selectedPageOptionValue())"
                      :value="selectedPageOptionValue()"
                    >
                      {{ selectedOpenDialogTarget.target.uuid }}（当前配置）
                    </option>
                    <option
                      v-for="page in filteredPageOptions"
                      :key="pageOptionValue(page)"
                      :value="pageOptionValue(page)"
                      :disabled="!isPageReferenceAllowed(page)"
                    >
                      {{ page.name || page.uuid }} · {{ page.source === 'system' ? '系统' : '用户' }} · {{ page.subPage ? '子页面' : '主页面' }}{{ isPageReferenceAllowed(page) ? '' : ' · 循环引用' }}
                    </option>
                  </select>
                </label>

                <p v-if="selectedOpenDialogTarget.error" class="m-action-editor__error" data-testid="m-action-page-target-error">
                  {{ selectedOpenDialogTarget.error }}
                </p>

                <div class="m-action-editor__page-actions">
                  <button type="button" :disabled="!pageEditor || !edit || !pageEditor.canCreateSubPage" data-testid="m-action-create-subpage" @click="createOpenDialogPage">
                    新建子页面
                  </button>
                  <button
                    type="button"
                    :disabled="!pageEditor || !selectedOpenDialogTarget.target"
                    data-testid="m-action-edit-subpage"
                    @click="editOpenDialogPage"
                  >
                    {{ selectedOpenDialogTarget.target?.source === 'system' || !pageEditor?.canPersist ? '临时编排页面' : '编排页面' }}
                  </button>
                  <button type="button" :disabled="pagesLoading" data-testid="m-action-refresh-pages" @click="refreshPageOptions">
                    {{ pagesLoading ? '加载中…' : '刷新列表' }}
                  </button>
                </div>

                <label>
                  <span>context</span>
                  <textarea
                    :value="formatJson(selectedAction.inputs?.context)"
                    rows="5"
                    data-testid="m-action-dialog-context"
                    @change="updateOpenDialogContext(($event.target as HTMLTextAreaElement).value)"
                  ></textarea>
                </label>
                <p v-if="pagesError" class="m-action-editor__error">{{ pagesError }}</p>
                <p v-if="relationNotice" class="m-action-editor__notice" data-testid="m-action-relation-notice">{{ relationNotice }}</p>
              </div>

              <template v-else>
                <label>
                  <span>inputs</span>
                  <textarea
                    :value="formatJson(selectedAction.inputs)"
                    rows="8"
                    data-testid="m-action-inputs"
                    @change="updateInputs(($event.target as HTMLTextAreaElement).value)"
                  ></textarea>
                </label>
              </template>
              <p v-if="inputsError" class="m-action-editor__error">{{ inputsError }}</p>

              <label>
                <span>outputs</span>
                <textarea
                  :value="formatOutputs(selectedAction.outputs)"
                  rows="4"
                  data-testid="m-action-outputs"
                  @change="updateOutputs(($event.target as HTMLTextAreaElement).value)"
                ></textarea>
              </label>
              <p v-if="outputsError" class="m-action-editor__error">{{ outputsError }}</p>

              <label v-if="selectedAction.type !== 'controller'">
                <span>nextAction</span>
                <select :value="selectedAction.nextAction ?? ''" @change="updateNextAction(selectedAction, ($event.target as HTMLSelectElement).value)">
                  <option value="">null</option>
                  <option v-for="option in targetOptions" :key="option.uuid" :value="option.uuid" :disabled="option.uuid === selectedAction.uuid">
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <div v-if="selectedAction.type === 'controller'" class="m-action-editor__nodes">
                <div class="m-action-editor__nodes-header">
                  <h5>nodes</h5>
                  <template v-if="selectedAction.action === 'switch_controller'">
                    <button type="button" @click="addSwitchCase(selectedAction)">添加 Case</button>
                    <button type="button" @click="addSwitchDefault(selectedAction)">添加 DEFAULT</button>
                  </template>
                </div>

                <div v-for="(node, index) in selectedAction.nodes" :key="node.uuid" class="m-action-editor__node-card">
                  <label>
                    <span>node uuid</span>
                    <input :value="node.uuid" @change="updateNodeUuid(selectedAction, node, ($event.target as HTMLInputElement).value)" />
                  </label>
                  <label>
                    <span>alias</span>
                    <input v-model="node.alias" @input="emitChanges" />
                  </label>
                  <label v-if="selectedAction.action === 'switch_controller'">
                    <span>type</span>
                    <select :value="node.type === 'DEFAULT' ? 'DEFAULT' : 'CASE'" @change="updateNode(node, { type: ($event.target as HTMLSelectElement).value === 'DEFAULT' ? 'DEFAULT' : undefined })">
                      <option value="CASE">CASE</option>
                      <option value="DEFAULT">DEFAULT</option>
                    </select>
                  </label>
                  <label v-if="node.type !== 'DEFAULT'">
                    <span>value</span>
                    <input
                      :value="String(node.value ?? '')"
                      :disabled="selectedAction.action === 'if_controller'"
                      @input="updateNode(node, { value: parseNodeValue(($event.target as HTMLInputElement).value, selectedAction) })"
                    />
                  </label>
                  <label>
                    <span>nextAction</span>
                    <select :value="node.nextAction ?? ''" @change="updateNode(node, { nextAction: (($event.target as HTMLSelectElement).value || null) })">
                      <option value="">null</option>
                      <option v-for="option in targetOptions" :key="option.uuid" :value="option.uuid" :disabled="option.uuid === selectedAction.uuid">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>
                  <button v-if="selectedAction.action === 'switch_controller'" type="button" class="m-action-editor__remove-node" @click="removeNode(selectedAction, index)">删除分支</button>
                </div>
              </div>
            </template>

            <p v-else class="m-action-editor__empty">请选择或添加一个 Action。</p>
          </aside>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.m-action-editor {
  display: block;
}

.m-action-editor__open,
.m-action-editor__close,
.m-action-editor__palette-button,
.m-action-editor__inspector button,
.m-action-editor__nodes-header button {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: white;
  padding: 8px 10px;
  color: rgb(15 23 42);
  font-size: 13px;
  font-weight: 600;
}

.m-action-editor__open {
  width: 100%;
  text-align: center;
}

.m-action-editor__overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(15 23 42 / 0.55);
  padding: 24px;
}

.m-action-editor__dialog {
  display: flex;
  width: min(1180px, 96vw);
  height: min(760px, 92vh);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 12px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
}

.m-action-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.m-action-editor__header h3,
.m-action-editor__palette h4,
.m-action-editor__inspector h4,
.m-action-editor__nodes h5 {
  margin: 0;
}

.m-action-editor__layout {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 210px minmax(0, 1fr) 320px;
}

.m-action-editor__palette,
.m-action-editor__inspector {
  min-height: 0;
  overflow: auto;
  padding: 14px;
}

.m-action-editor__palette {
  border-right: 1px solid rgb(226 232 240);
}

.m-action-editor__palette-button {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-top: 10px;
}

.m-action-editor__palette-button code {
  color: rgb(71 85 105);
  font-size: 11px;
  font-weight: 500;
}

.m-action-editor__canvas {
  min-width: 0;
  background: rgb(248 250 252);
}

.m-action-editor__inspector {
  border-left: 1px solid rgb(226 232 240);
}

.m-action-editor__inspector-header,
.m-action-editor__nodes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.m-action-editor__inspector label,
.m-action-editor__node-card label {
  display: grid;
  gap: 5px;
  margin-bottom: 10px;
  color: rgb(71 85 105);
  font-size: 12px;
  font-weight: 600;
}

.m-action-editor__inspector input,
.m-action-editor__inspector textarea,
.m-action-editor__inspector select {
  width: 100%;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 8px 10px;
  color: rgb(15 23 42);
  font-family: inherit;
  font-size: 13px;
}

.m-action-editor__inspector textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.m-action-editor__flow-node {
  position: relative;
  width: 190px;
  min-height: 92px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: white;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.08);
}

.m-action-editor__flow-node.is-selected {
  border-color: rgb(20 184 166);
  box-shadow: 0 0 0 3px rgb(20 184 166 / 0.16), 0 8px 24px rgb(15 23 42 / 0.1);
}

.m-action-editor__flow-node--controller {
  min-height: 138px;
  border-color: rgb(167 139 250);
}

.m-action-editor__flow-node p {
  margin: 0;
  color: rgb(71 85 105);
  font-size: 12px;
}

.m-action-editor__flow-node strong,
.m-action-editor__flow-node small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m-action-editor__flow-node strong {
  margin-top: 4px;
  font-size: 14px;
}

.m-action-editor__flow-node small {
  margin-top: 6px;
  color: rgb(100 116 139);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
}

.m-action-editor__branch-handle {
  position: absolute;
  right: -1px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgb(91 33 182);
  font-size: 11px;
}

.m-action-editor__node-card {
  margin-top: 10px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 10px;
}

.m-action-editor__remove-node {
  color: rgb(190 18 60);
}

.m-action-editor__page-reference {
  margin-bottom: 12px;
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  padding: 10px;
}

.m-action-editor__page-filters,
.m-action-editor__page-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.m-action-editor__page-actions button {
  flex: 1;
}

.m-action-editor__notice {
  margin: 0 0 10px;
  color: rgb(13 116 144);
  font-size: 12px;
}

.m-action-editor__error {
  margin: -4px 0 10px;
  color: rgb(190 18 60);
  font-size: 12px;
}

.m-action-editor__empty {
  color: rgb(100 116 139);
  font-size: 13px;
}

.dark .m-action-editor__dialog,
.dark .m-action-editor__flow-node,
.dark .m-action-editor__open,
.dark .m-action-editor__close,
.dark .m-action-editor__palette-button,
.dark .m-action-editor__inspector button,
.dark .m-action-editor__nodes-header button {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .m-action-editor__canvas {
  background: rgb(2 6 23);
}

.dark .m-action-editor__header,
.dark .m-action-editor__palette,
.dark .m-action-editor__inspector {
  border-color: rgb(51 65 85);
}

.dark .m-action-editor__inspector input,
.dark .m-action-editor__inspector textarea,
.dark .m-action-editor__inspector select {
  border-color: rgb(51 65 85);
  background: rgb(2 6 23);
  color: rgb(226 232 240);
}
</style>
`,C=`<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  serializeMActionToolbarProps,
  type MActionToolbarAlign,
  type MActionToolbarMode,
  type MActionToolbarSize,
  type ToolbarButton
} from 'mokelay-components/blocks/MActionToolbar.vue';

export type MActionToolBarEditorData = {
  align?: MActionToolbarAlign | string;
  size?: MActionToolbarSize | string;
  mode?: MActionToolbarMode | string;
  buttons?: ToolbarButton[];
};

export type ActionToolBarEditorPayload = {
  value?: MActionToolBarEditorData;
  patch?: MActionToolBarEditorData;
};

export interface MActionToolBarEditorProps extends EditorToolComponentProps {
  value?: MActionToolBarEditorData;
  allowEmpty?: boolean;
  outputMode?: 'value' | 'patch';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeActionToolbarEditorValue(value: unknown): MActionToolBarEditorData {
  const source = isRecord(value) ? value : {};
  return serializeMActionToolbarProps({
    ...source,
    edit: false,
    buttons: Array.isArray(source.buttons) ? source.buttons : []
  });
}

export function normalizeMActionToolBarEditorProps(
  props: Partial<MActionToolBarEditorProps>
): MActionToolBarEditorProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    pageEditor: props.pageEditor,
    value: normalizeActionToolbarEditorValue(props.value),
    allowEmpty: props.allowEmpty === true,
    outputMode: props.outputMode === 'patch' ? 'patch' : 'value'
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MActionToolBarEditor",
 *   "displayName": "动作工具栏配置编辑器",
 *   "category": "action",
 *   "description": "动作工具栏配置编辑器，用于维护动作工具栏的对齐、尺寸、展示模式和按钮事件配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MActionToolBarEditor",
 *     "toolSymbol": "mActionToolBarEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 172
 *   },
 *   "toolbox": {
 *     "title": "动作工具栏配置编辑器",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 10h3M14 10h2M8 14h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": {
 *       "align": "left",
 *       "size": "md",
 *       "mode": "inline",
 *       "buttons": []
 *     },
 *     "allowEmpty": false,
 *     "outputMode": "value"
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MActionToolBarEditorData",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "工具栏配置"
 *     },
 *     {
 *       "key": "allowEmpty",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "允许空工具栏"
 *     },
 *     {
 *       "key": "outputMode",
 *       "optional": true,
 *       "tsType": "'value' | 'patch'",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "输出模式"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "toolChange",
 *       "payload": "{ value?: MActionToolBarEditorData; patch?: MActionToolBarEditorData }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "label": "工具变更"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "{ value?: MActionToolBarEditorData; patch?: MActionToolBarEditorData }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "label": "变更"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时输出 value、allowEmpty 和 outputMode；作为属性编辑器时由 payload 决定回写 value 或 patch。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MActionToolBarEditor-example",
 *       "type": "MActionToolBarEditor",
 *       "data": {
 *         "value": {
 *           "align": "left",
 *           "size": "md",
 *           "mode": "inline",
 *           "buttons": []
 *         }
 *       }
 *     }
 *   ]
 * }
 */
export const mActionToolBarEditorTool = defineEditorTool<MActionToolBarEditorProps>({
  normalizeProps: normalizeMActionToolBarEditorProps,
  serialize: (props) => {
    const normalized = normalizeMActionToolBarEditorProps(props);
    return {
      value: normalized.value,
      allowEmpty: normalized.allowEmpty,
      outputMode: normalized.outputMode
    };
  }
});
<\/script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MActionEditor from '@/editors/blocks/MActionEditor.vue';
import { cloneActions, type ActionConfig } from 'mokelay-components/actions';
import { cloneBlockEvents } from 'mokelay-components/blocks';
import { useI18n } from '@/i18n';

const props = defineProps<MActionToolBarEditorProps & {
  onChange?: (payload: ActionToolBarEditorPayload) => void;
  onToolChange?: (payload: ActionToolBarEditorPayload) => void;
}>();

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);
const committedToolbar = ref<MActionToolBarEditorData>(cloneToolbar(props.value));
const draftToolbar = ref<MActionToolBarEditorData>(cloneToolbar(props.value));
const savedButtonCount = computed(() => committedToolbar.value.buttons?.length ?? 0);
const draftButtons = computed(() => draftToolbar.value.buttons ?? []);
const isReadOnly = computed(() => !props.edit);

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeToolbar(value: unknown): MActionToolBarEditorData {
  return normalizeActionToolbarEditorValue(value);
}

function cloneToolbar(value: unknown): MActionToolBarEditorData {
  return cloneValue(normalizeToolbar(value));
}

function outputToolbar(value: MActionToolBarEditorData): MActionToolBarEditorData | undefined {
  const normalized = normalizeToolbar(value);
  return props.allowEmpty || normalized.buttons?.length ? normalized : undefined;
}

function openDialog() {
  draftToolbar.value = cloneToolbar(committedToolbar.value);
  isOpen.value = true;
  if (!dialogRef.value?.open) {
    dialogRef.value?.showModal();
  }
}

function closeDialog() {
  isOpen.value = false;
  if (dialogRef.value?.open) {
    dialogRef.value.close();
  }
}

function updateRootField(field: 'align' | 'size' | 'mode', value: string) {
  if (isReadOnly.value) return;
  draftToolbar.value = {
    ...draftToolbar.value,
    [field]: value
  };
}

function createButton(): ToolbarButton {
  const nextIndex = draftButtons.value.length + 1;
  return {
    id: \`button_\${nextIndex}\`,
    label: \`按钮\${nextIndex}\`,
    variant: 'primary',
    align: 'left',
    events: []
  };
}

function addButton() {
  if (isReadOnly.value) return;
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: [...draftButtons.value, createButton()]
  };
}

function updateButton(index: number, patch: Partial<ToolbarButton>) {
  if (isReadOnly.value) return;
  const nextButtons = draftButtons.value.map((button, buttonIndex) => (
    buttonIndex === index ? { ...button, ...patch } : button
  ));
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: nextButtons
  };
}

function removeButton(index: number) {
  if (isReadOnly.value) return;
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: draftButtons.value.filter((_, buttonIndex) => buttonIndex !== index)
  };
}

function moveButton(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= draftButtons.value.length) return;

  const nextButtons = [...draftButtons.value];
  const [button] = nextButtons.splice(index, 1);
  if (!button) return;
  nextButtons.splice(nextIndex, 0, button);
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: nextButtons
  };
}

function getClickActions(button: ToolbarButton) {
  return cloneBlockEvents(button.events)
    .find((eventConfig) => eventConfig.event === 'click')
    ?.actions ?? [];
}

function updateButtonActions(index: number, actions: ActionConfig[]) {
  if (isReadOnly.value) return;
  const button = draftButtons.value[index];
  if (!button) return;
  const otherEvents = cloneBlockEvents(button.events).filter((eventConfig) => eventConfig.event !== 'click');
  updateButton(index, {
    events: actions.length
      ? [{ event: 'click', actions: cloneActions(actions) }, ...otherEvents]
      : otherEvents
  });
}

function saveToolbar() {
  if (isReadOnly.value) return;
  const normalized = cloneToolbar(draftToolbar.value);
  committedToolbar.value = normalized;
  const output = outputToolbar(normalized);
  const payload = props.outputMode === 'patch'
    ? { patch: output }
    : { value: output };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  closeDialog();
}

watch(
  () => props.value,
  (value) => {
    committedToolbar.value = cloneToolbar(value);
    if (!isOpen.value) {
      draftToolbar.value = cloneToolbar(value);
    }
  },
  { deep: true, immediate: true }
);
<\/script>

<template>
  <div class="ce-form-action-bar-editor" data-testid="form-action-bar-editor">
    <div class="ce-form-action-bar-editor__trigger-row">
      <button
        class="ce-form-action-bar-editor__primary-button"
        type="button"
        data-testid="form-action-bar-settings-open"
        @click="openDialog"
      >
        {{ t('form.actionBarEditor.actions.settings') }}
      </button>
      <div class="ce-form-action-bar-editor__summary" data-testid="form-action-bar-summary">
        {{ t('form.actionBarEditor.summary.savedCount').replace('{count}', String(savedButtonCount)) }}
      </div>
    </div>

    <dialog
      ref="dialogRef"
      class="ce-form-action-bar-editor__dialog"
      data-testid="form-action-bar-dialog"
      :aria-hidden="!isOpen"
      aria-labelledby="form-action-bar-dialog-title"
      @close="isOpen = false"
    >
      <div class="ce-form-action-bar-editor__dialog-panel">
        <div class="ce-form-action-bar-editor__dialog-header">
          <h3
            id="form-action-bar-dialog-title"
            class="ce-form-action-bar-editor__dialog-title"
            data-testid="form-action-bar-dialog-title"
          >
            {{ t('form.actionBarEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-form-action-bar-editor__secondary-button"
            type="button"
            data-testid="form-action-bar-close"
            @click="closeDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-form-action-bar-editor__dialog-body">
          <section class="ce-form-action-bar-editor__section">
            <div class="ce-form-action-bar-editor__section-header">
              <div>
                <div class="ce-form-action-bar-editor__section-title">
                  {{ t('form.actionBarEditor.sections.layout') }}
                </div>
                <p class="ce-form-action-bar-editor__section-copy">
                  {{ t('form.actionBarEditor.help.layout') }}
                </p>
              </div>
            </div>
            <div class="ce-form-action-bar-editor__form-grid">
              <label>
                <span>{{ t('form.actionBarEditor.fields.align') }}</span>
                <select
                  class="ce-form-action-bar-editor__input"
                  data-testid="form-action-bar-align"
                  :disabled="isReadOnly"
                  :value="draftToolbar.align"
                  @change="updateRootField('align', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="left">{{ t('form.actionBarEditor.align.left') }}</option>
                  <option value="right">{{ t('form.actionBarEditor.align.right') }}</option>
                  <option value="space-between">{{ t('form.actionBarEditor.align.spaceBetween') }}</option>
                </select>
              </label>
              <label>
                <span>{{ t('form.actionBarEditor.fields.size') }}</span>
                <select
                  class="ce-form-action-bar-editor__input"
                  data-testid="form-action-bar-size"
                  :disabled="isReadOnly"
                  :value="draftToolbar.size"
                  @change="updateRootField('size', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="small">{{ t('form.actionBarEditor.size.small') }}</option>
                  <option value="medium">{{ t('form.actionBarEditor.size.medium') }}</option>
                  <option value="large">{{ t('form.actionBarEditor.size.large') }}</option>
                </select>
              </label>
              <label>
                <span>{{ t('form.actionBarEditor.fields.mode') }}</span>
                <select
                  class="ce-form-action-bar-editor__input"
                  data-testid="form-action-bar-mode"
                  :disabled="isReadOnly"
                  :value="draftToolbar.mode"
                  @change="updateRootField('mode', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="inline">{{ t('form.actionBarEditor.mode.inline') }}</option>
                  <option value="grouped">{{ t('form.actionBarEditor.mode.grouped') }}</option>
                  <option value="dropdown">{{ t('form.actionBarEditor.mode.dropdown') }}</option>
                </select>
              </label>
            </div>
          </section>

          <section class="ce-form-action-bar-editor__section">
            <div class="ce-form-action-bar-editor__section-header">
              <div>
                <div class="ce-form-action-bar-editor__section-title">
                  {{ t('form.actionBarEditor.sections.buttons') }}
                </div>
                <p class="ce-form-action-bar-editor__section-copy">
                  {{ t('form.actionBarEditor.summary.draftCount').replace('{count}', String(draftButtons.length)) }}
                </p>
              </div>
              <button
                v-if="edit"
                class="ce-form-action-bar-editor__primary-button"
                type="button"
                data-testid="form-action-bar-add-button"
                @click="addButton"
              >
                {{ t('form.actionBarEditor.actions.add') }}
              </button>
            </div>

            <div class="ce-form-action-bar-editor__button-list">
              <p
                v-if="!draftButtons.length"
                class="ce-form-action-bar-editor__empty"
                data-testid="form-action-bar-empty"
              >
                {{ t('form.actionBarEditor.empty') }}
              </p>

              <template v-else>
                <article
                  v-for="(button, index) in draftButtons"
                  :key="\`\${button.id}-\${index}\`"
                  class="ce-form-action-bar-editor__button-card"
                  :data-testid="\`form-action-bar-button-\${index}\`"
                >
                  <div class="ce-form-action-bar-editor__button-grid">
                    <label>
                      <span>{{ t('form.actionBarEditor.fields.id') }}</span>
                      <input
                        class="ce-form-action-bar-editor__input"
                        :data-testid="\`form-action-bar-button-id-\${index}\`"
                        type="text"
                        :readonly="isReadOnly"
                        :value="button.id"
                        @input="updateButton(index, { id: ($event.target as HTMLInputElement).value })"
                        @keydown.stop
                      />
                    </label>
                    <label>
                      <span>{{ t('form.actionBarEditor.fields.label') }}</span>
                      <input
                        class="ce-form-action-bar-editor__input"
                        :data-testid="\`form-action-bar-button-label-\${index}\`"
                        type="text"
                        :readonly="isReadOnly"
                        :value="button.label"
                        @input="updateButton(index, { label: ($event.target as HTMLInputElement).value })"
                        @keydown.stop
                      />
                    </label>
                    <label>
                      <span>{{ t('form.actionBarEditor.fields.variant') }}</span>
                      <select
                        class="ce-form-action-bar-editor__input"
                        :data-testid="\`form-action-bar-button-variant-\${index}\`"
                        :disabled="isReadOnly"
                        :value="button.variant"
                        @change="updateButton(index, { variant: ($event.target as HTMLSelectElement).value })"
                      >
                        <option value="primary">{{ t('form.actionBarEditor.variant.primary') }}</option>
                        <option value="secondary">{{ t('form.actionBarEditor.variant.secondary') }}</option>
                        <option value="ghost">{{ t('form.actionBarEditor.variant.ghost') }}</option>
                        <option value="danger">{{ t('form.actionBarEditor.variant.danger') }}</option>
                        <option value="warning">{{ t('form.actionBarEditor.variant.warning') }}</option>
                        <option value="text">{{ t('form.actionBarEditor.variant.text') }}</option>
                      </select>
                    </label>
                    <label>
                      <span>{{ t('form.actionBarEditor.fields.disabled') }}</span>
                      <input
                        class="ce-form-action-bar-editor__checkbox"
                        :data-testid="\`form-action-bar-button-disabled-\${index}\`"
                        type="checkbox"
                        :disabled="isReadOnly"
                        :checked="button.disabled === true"
                        @change="updateButton(index, { disabled: ($event.target as HTMLInputElement).checked })"
                      />
                    </label>
                  </div>

                  <div class="ce-form-action-bar-editor__card-footer">
                    <MActionEditor
                      :edit="edit"
                      :model-value="getClickActions(button)"
                      :current-block-id="currentBlockId"
                      :page-editor="pageEditor"
                      @update:model-value="updateButtonActions(index, $event)"
                      @change="updateButtonActions(index, $event)"
                    />
                    <div class="ce-form-action-bar-editor__row-actions">
                      <button
                        class="ce-form-action-bar-editor__icon-button"
                        type="button"
                        :data-testid="\`form-action-bar-button-up-\${index}\`"
                        :disabled="isReadOnly || index === 0"
                        @click="moveButton(index, -1)"
                      >
                        {{ t('form.actionBarEditor.actions.moveUp') }}
                      </button>
                      <button
                        class="ce-form-action-bar-editor__icon-button"
                        type="button"
                        :data-testid="\`form-action-bar-button-down-\${index}\`"
                        :disabled="isReadOnly || index === draftButtons.length - 1"
                        @click="moveButton(index, 1)"
                      >
                        {{ t('form.actionBarEditor.actions.moveDown') }}
                      </button>
                      <button
                        class="ce-form-action-bar-editor__danger-button"
                        type="button"
                        :data-testid="\`form-action-bar-button-remove-\${index}\`"
                        :disabled="isReadOnly"
                        @click="removeButton(index)"
                      >
                        {{ t('form.actionBarEditor.actions.remove') }}
                      </button>
                    </div>
                  </div>
                </article>
              </template>
            </div>
          </section>
        </div>

        <div class="ce-form-action-bar-editor__dialog-actions">
          <button
            class="ce-form-action-bar-editor__secondary-button"
            type="button"
            data-testid="form-action-bar-cancel"
            @click="closeDialog"
          >
            {{ edit ? t('form.actionBarEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-form-action-bar-editor__primary-button"
            type="button"
            data-testid="form-action-bar-save"
            @click="saveToolbar"
          >
            {{ t('form.actionBarEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.ce-form-action-bar-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-form-action-bar-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-form-action-bar-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-form-action-bar-editor__primary-button,
.ce-form-action-bar-editor__secondary-button,
.ce-form-action-bar-editor__icon-button,
.ce-form-action-bar-editor__danger-button {
  flex: 0 0 auto;
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 5px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.ce-form-action-bar-editor__primary-button {
  min-height: 34px;
  border-color: rgb(20 184 166 / 0.55);
  padding: 6px 14px;
  background: rgb(20 184 166);
  color: rgb(255 255 255);
  font-weight: 700;
}

.ce-form-action-bar-editor__primary-button:hover {
  background: rgb(13 148 136);
}

.ce-form-action-bar-editor__secondary-button:hover,
.ce-form-action-bar-editor__icon-button:hover,
.ce-form-action-bar-editor__danger-button:hover {
  background: rgb(248 250 252);
}

.ce-form-action-bar-editor__danger-button {
  border-color: rgb(254 202 202);
  color: rgb(185 28 28);
}

.ce-form-action-bar-editor__primary-button:disabled,
.ce-form-action-bar-editor__secondary-button:disabled,
.ce-form-action-bar-editor__icon-button:disabled,
.ce-form-action-bar-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ce-form-action-bar-editor__dialog {
  width: min(calc(100vw - 32px), 1100px);
  max-height: min(calc(100vh - 32px), 860px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-form-action-bar-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-form-action-bar-editor__dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-form-action-bar-editor__dialog-header,
.ce-form-action-bar-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.ce-form-action-bar-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-form-action-bar-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 750;
  line-height: 24px;
}

.ce-form-action-bar-editor__dialog-body {
  display: grid;
  grid-template-columns: minmax(240px, 0.55fr) minmax(0, 1.45fr);
  gap: 14px;
  overflow: auto;
  padding: 14px 16px;
}

.ce-form-action-bar-editor__section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-form-action-bar-editor__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px;
  background: rgb(248 250 252);
}

.ce-form-action-bar-editor__section-title {
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 750;
  line-height: 20px;
}

.ce-form-action-bar-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 12px;
  line-height: 18px;
}

.ce-form-action-bar-editor__form-grid,
.ce-form-action-bar-editor__button-list {
  padding: 12px;
}

.ce-form-action-bar-editor__form-grid {
  display: grid;
  gap: 12px;
}

.ce-form-action-bar-editor__button-list {
  display: grid;
  gap: 10px;
  overflow: auto;
}

.ce-form-action-bar-editor__button-card {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 10px;
  background: rgb(255 255 255);
}

.ce-form-action-bar-editor__button-grid {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(140px, 1fr) minmax(120px, 0.7fr) 82px;
  gap: 8px;
}

.ce-form-action-bar-editor label {
  display: grid;
  gap: 5px;
  color: rgb(71 85 105);
  font-size: 12px;
  font-weight: 650;
}

.ce-form-action-bar-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
  font-size: 13px;
  line-height: 18px;
}

.ce-form-action-bar-editor__input:focus {
  border-color: rgb(20 184 166);
  outline: 2px solid rgb(20 184 166 / 0.18);
}

.ce-form-action-bar-editor__input:read-only,
.ce-form-action-bar-editor__input:disabled {
  cursor: not-allowed;
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-form-action-bar-editor__checkbox {
  width: 18px;
  height: 18px;
}

.ce-form-action-bar-editor__card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.ce-form-action-bar-editor__row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-form-action-bar-editor__empty {
  margin: 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.dark .ce-form-action-bar-editor {
  color: rgb(226 232 240);
}

.dark .ce-form-action-bar-editor__summary,
.dark .ce-form-action-bar-editor__section-header {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(203 213 225);
}

.dark .ce-form-action-bar-editor__dialog-panel,
.dark .ce-form-action-bar-editor__section,
.dark .ce-form-action-bar-editor__button-card {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
}

.dark .ce-form-action-bar-editor__dialog-header,
.dark .ce-form-action-bar-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .ce-form-action-bar-editor__dialog-title,
.dark .ce-form-action-bar-editor__section-title {
  color: rgb(248 250 252);
}

.dark .ce-form-action-bar-editor__section-copy,
.dark .ce-form-action-bar-editor__empty,
.dark .ce-form-action-bar-editor label {
  color: rgb(148 163 184);
}

.dark .ce-form-action-bar-editor__input,
.dark .ce-form-action-bar-editor__secondary-button,
.dark .ce-form-action-bar-editor__icon-button,
.dark .ce-form-action-bar-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .ce-form-action-bar-editor__input:read-only,
.dark .ce-form-action-bar-editor__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}

@media (max-width: 920px) {
  .ce-form-action-bar-editor__dialog-body,
  .ce-form-action-bar-editor__button-grid {
    grid-template-columns: 1fr;
  }
}
</style>
`,F=`<script lang="ts">
export { mAdvanceInputEditorTool } from '@/editors/tools/mAdvanceInputEditorTool';
export type { MAdvanceInputProps } from 'mokelay-components/blocks/MAdvanceInput.vue';
<\/script>

<script setup lang="ts">
import { createApp, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { App } from 'vue';
import type { EditorToolPropertyField } from '@/editors/editorToolDefinition';
import { getInlineCustomComponentDefinition, getInlineCustomComponentEntries } from '@/editors/inlineCustomComponents';
import { useI18n } from '@/i18n';
import type { MAdvanceInputProps } from 'mokelay-components/blocks/MAdvanceInput.vue';
import {
  cloneStoredBlock,
  createParagraphBlock,
  generateBlockId,
  getEmptyStoredBlockValue as getEmptyValue,
  getParagraphText,
  mergeParagraphBlocks,
  normalizeStoredBlocks,
  toPlainRecord,
  type StoredBlock
} from 'mokelay-components/blocks';

type EmbeddedRecord = {
  app: App<Element>;
  block: StoredBlock;
  mountPoint: HTMLElement;
  wrapper: HTMLElement;
};

type ActiveEmbeddedComponent = {
  blockId: string;
  title: string;
  type: string;
  fields: EditorToolPropertyField[];
  values: Record<string, string | boolean>;
};

const props = defineProps<MAdvanceInputProps & {
  onChange?: (payload: MAdvanceInputProps) => void;
  onToolChange?: (payload: MAdvanceInputProps) => void;
}>();

const { t } = useI18n();
const editableRef = ref<HTMLElement | null>(null);
const embeddedDialogRef = ref<HTMLDialogElement | null>(null);
const menuVisible = ref(false);
const menuPosition = ref({ left: 0, top: 0 });
const activeEmbeddedComponent = ref<ActiveEmbeddedComponent | null>(null);

const embeddedRecords = new Map<string, EmbeddedRecord>();
let suppressDomSync = false;
let lastValueSignature = '';

function serializeBlocks(blocks: StoredBlock[]) {
  return mergeParagraphBlocks(blocks);
}

function getValueSignature(blocks: StoredBlock[]) {
  return JSON.stringify(serializeBlocks(blocks));
}

function createComponentBlock(type: string): StoredBlock {
  const definition = getInlineCustomComponentDefinition(type);
  if (!definition) {
    throw new Error(\`Unknown inline component "\${type}".\`);
  }

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    edit: false
  });

  return {
    id: generateBlockId(),
    type,
    data: toPlainRecord(definition.serialize(normalized))
  };
}

function unmountEmbeddedRecords() {
  embeddedRecords.forEach((record) => {
    record.app.unmount();
  });
  embeddedRecords.clear();
}

function createComponentWrapper(block: StoredBlock) {
  const plainBlock = cloneStoredBlock(block);
  const definition = getInlineCustomComponentDefinition(plainBlock.type);
  if (!definition) {
    const fallback = document.createElement('span');
    fallback.className = 'ce-advance-input-tool__token ce-advance-input-tool__token--unknown';
    fallback.dataset.segmentType = 'component';
    fallback.dataset.blockId = plainBlock.id;
    fallback.dataset.block = JSON.stringify(plainBlock);
    fallback.textContent = plainBlock.type;
    return fallback;
  }

  const wrapper = document.createElement('span');
  wrapper.className = 'ce-advance-input-tool__token';
  wrapper.dataset.segmentType = 'component';
  wrapper.dataset.blockId = plainBlock.id;
  wrapper.dataset.block = JSON.stringify(plainBlock);
  wrapper.contentEditable = 'false';
  wrapper.setAttribute('data-testid', \`editor-advance-input-token-\${plainBlock.type}\`);

  const mountPoint = document.createElement('span');
  mountPoint.className = 'ce-advance-input-tool__token-mount';
  wrapper.appendChild(mountPoint);

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...plainBlock.data,
    edit: false
  });

  const app = createApp(definition.component, normalized as unknown as Record<string, unknown>);
  app.mount(mountPoint);

  wrapper.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openEmbeddedComponentDialog(plainBlock.id);
  });

  embeddedRecords.set(plainBlock.id, {
    app,
    block: cloneStoredBlock(plainBlock),
    mountPoint,
    wrapper
  });

  return wrapper;
}

function renderEditableContent(value?: StoredBlock[], focusAtEnd = false) {
  const root = editableRef.value;
  if (!root) return;

  suppressDomSync = true;
  unmountEmbeddedRecords();
  root.innerHTML = '';

  const blocks = normalizeStoredBlocks(value);
  for (const block of blocks) {
    if (block.type === 'paragraph') {
      root.appendChild(document.createTextNode(getParagraphText(block)));
      continue;
    }

    root.appendChild(createComponentWrapper(block));
    root.appendChild(document.createTextNode('\\u200B'));
  }

  if (!root.childNodes.length) {
    root.appendChild(document.createTextNode(''));
  }

  lastValueSignature = getValueSignature(blocks);
  suppressDomSync = false;

  if (focusAtEnd) {
    nextTick(() => {
      placeCaretAtEnd(root);
    });
  }
}

function getBlocksFromDom() {
  const root = editableRef.value;
  if (!root) {
    return getEmptyValue();
  }

  const blocks: StoredBlock[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').replace(/\\u200B/g, '');
      blocks.push(createParagraphBlock(text));
      return;
    }

    if (!(node instanceof HTMLElement)) {
      return;
    }

    if (node.dataset.segmentType === 'component') {
      const blockId = node.dataset.blockId ?? '';
      const record = embeddedRecords.get(blockId);
      const fallbackBlock = node.dataset.block ? JSON.parse(node.dataset.block) as StoredBlock : null;
      const block = record?.block ?? fallbackBlock;
      if (block) {
        blocks.push(cloneStoredBlock(block));
      }
      return;
    }

    blocks.push(createParagraphBlock((node.textContent ?? '').replace(/\\u200B/g, '')));
  });

  return mergeParagraphBlocks(blocks);
}

function emitValueChange(value: StoredBlock[]) {
  lastValueSignature = getValueSignature(value);
  const payload = {
    edit: true,
    value
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function syncValueFromDom() {
  if (suppressDomSync) return;
  const value = serializeBlocks(getBlocksFromDom());
  if (getValueSignature(value) === lastValueSignature) return;
  emitValueChange(value);
}

function placeCaretAtEnd(root: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function focusEditor() {
  const root = editableRef.value;
  if (!root) return;
  root.focus();
}

function getCurrentSelection() {
  const root = editableRef.value;
  const selection = window.getSelection();
  if (!root || !selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  return { root, selection, range };
}

function updateSlashMenu() {
  const selectionState = getCurrentSelection();
  if (!selectionState || !selectionState.selection.isCollapsed) {
    menuVisible.value = false;
    return;
  }

  const { range, root } = selectionState;
  let previousChar = '';

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const text = range.startContainer.textContent ?? '';
    if (range.startOffset > 0) {
      previousChar = text[range.startOffset - 1] ?? '';
    }
  } else if (range.startContainer instanceof HTMLElement && range.startOffset > 0) {
    const previousNode = range.startContainer.childNodes[range.startOffset - 1];
    if (previousNode?.nodeType === Node.TEXT_NODE) {
      const text = previousNode.textContent ?? '';
      previousChar = text[text.length - 1] ?? '';
    }
  }

  if (previousChar !== '/') {
    menuVisible.value = false;
    return;
  }

  const caretRect = range.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  menuPosition.value = {
    left: Math.max(0, caretRect.left - rootRect.left),
    top: Math.max(rootRect.height + 8, caretRect.bottom - rootRect.top + 8)
  };
  menuVisible.value = true;
}

function handleEditableInput() {
  syncValueFromDom();
  updateSlashMenu();
}

function handleEditableClick() {
  updateSlashMenu();
}

function handleEditableBlur() {
  window.setTimeout(() => {
    menuVisible.value = false;
  }, 120);
}

function handleEditableKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    return;
  }

  if (event.key !== 'Backspace') {
    return;
  }

  const selectionState = getCurrentSelection();
  if (!selectionState || !selectionState.selection.isCollapsed) return;

  const { range } = selectionState;

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = range.startContainer as Text;
    if (range.startOffset <= 0) return;

    if (textNode.data[range.startOffset - 1] !== '\\u200B') return;
    const previousSibling = textNode.previousSibling;
    if (!(previousSibling instanceof HTMLElement) || previousSibling.dataset.segmentType !== 'component') return;

    event.preventDefault();
    const blockId = previousSibling.dataset.blockId ?? '';
    embeddedRecords.get(blockId)?.app.unmount();
    embeddedRecords.delete(blockId);
    previousSibling.remove();
    textNode.deleteData(range.startOffset - 1, 1);
    syncValueFromDom();
    return;
  }

  if (range.startContainer instanceof HTMLElement && range.startOffset > 0) {
    const previousNode = range.startContainer.childNodes[range.startOffset - 1];
    if (!(previousNode instanceof HTMLElement) || previousNode.dataset.segmentType !== 'component') return;

    event.preventDefault();
    const blockId = previousNode.dataset.blockId ?? '';
    embeddedRecords.get(blockId)?.app.unmount();
    embeddedRecords.delete(blockId);
    previousNode.remove();
    syncValueFromDom();
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData('text/plain') ?? '';
  document.execCommand('insertText', false, text.replace(/\\n/g, ' '));
}

function insertInlineComponent(type: string) {
  const selectionState = getCurrentSelection();
  if (!selectionState) return;

  const { selection, range } = selectionState;
  const block = createComponentBlock(type);

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = range.startContainer as Text;
    if (range.startOffset > 0 && textNode.data[range.startOffset - 1] === '/') {
      textNode.deleteData(range.startOffset - 1, 1);
      range.setStart(textNode, range.startOffset - 1);
      range.collapse(true);
    }
  }

  const componentNode = createComponentWrapper(block);
  const spacer = document.createTextNode('\\u200B');

  range.insertNode(spacer);
  range.insertNode(componentNode);

  const nextRange = document.createRange();
  nextRange.setStart(spacer, 1);
  nextRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(nextRange);

  menuVisible.value = false;
  syncValueFromDom();
  focusEditor();
}

function openEmbeddedComponentDialog(blockId: string) {
  const record = embeddedRecords.get(blockId);
  if (!record) return;

  const definition = getInlineCustomComponentDefinition(record.block.type);
  const fields = definition?.propertyPanel?.fields ?? [];
  if (!definition || !fields.length) return;

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...record.block.data,
    edit: false
  }) as unknown as Record<string, string | boolean>;

  activeEmbeddedComponent.value = {
    blockId,
    title: definition.propertyPanel?.title || t('editor.propertyDialogTitle'),
    type: record.block.type,
    fields,
    values: Object.fromEntries(fields.map((field) => [field.key, normalized[field.key] ?? '']))
  };

  embeddedDialogRef.value?.showModal();
}

function closeEmbeddedDialog() {
  embeddedDialogRef.value?.close();
  activeEmbeddedComponent.value = null;
}

function updateEmbeddedComponentField(key: string, value: string | boolean) {
  const active = activeEmbeddedComponent.value;
  if (!active) return;

  active.values[key] = value;
  activeEmbeddedComponent.value = {
    ...active,
    values: {
      ...active.values
    }
  };

  const record = embeddedRecords.get(active.blockId);
  const definition = getInlineCustomComponentDefinition(active.type);
  if (!record || !definition) return;

  const normalized = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...active.values,
    edit: false
  });

  record.block = {
    ...record.block,
    data: toPlainRecord(definition.serialize(normalized))
  };
  record.wrapper.dataset.block = JSON.stringify(record.block);

  record.app.unmount();
  const app = createApp(definition.component, normalized as unknown as Record<string, unknown>);
  app.mount(record.mountPoint);
  record.app = app;

  syncValueFromDom();
}

onMounted(() => {
  renderEditableContent(props.value);
});

onBeforeUnmount(() => {
  unmountEmbeddedRecords();
});

watch(
  () => props.value,
  (value) => {
    const nextBlocks = normalizeStoredBlocks(value);
    if (getValueSignature(nextBlocks) === lastValueSignature) return;
    renderEditableContent(nextBlocks);
  }
);
<\/script>

<template>
  <div class="ce-advance-input-tool" data-testid="editor-advance-input-tool">
    <div class="ce-advance-input-tool__editor-shell">
      <div
        ref="editableRef"
        class="ce-advance-input-tool__editor"
        data-testid="editor-advance-input-content"
        contenteditable="true"
        spellcheck="false"
        @input="handleEditableInput"
        @click="handleEditableClick"
        @keyup="updateSlashMenu"
        @keydown="handleEditableKeydown"
        @paste="handlePaste"
        @blur="handleEditableBlur"
      ></div>

      <div
        v-if="menuVisible"
        class="ce-advance-input-tool__menu"
        data-testid="editor-advance-input-menu"
        :style="{ left: \`\${menuPosition.left}px\`, top: \`\${menuPosition.top}px\` }"
      >
        <button
          v-for="[type, definition] in getInlineCustomComponentEntries()"
          :key="type"
          type="button"
          class="ce-advance-input-tool__menu-item"
          :data-testid="\`editor-advance-input-menu-item-\${type}\`"
          @mousedown.prevent="insertInlineComponent(type)"
        >
          {{ definition.toolbox.title }}
        </button>
      </div>
    </div>



    <dialog
      ref="embeddedDialogRef"
      class="ce-advance-input-tool__dialog"
      data-testid="advance-input-embedded-property-dialog"
      @close="activeEmbeddedComponent = null"
    >
      <form method="dialog" class="ce-advance-input-tool__dialog-panel" @submit.prevent="closeEmbeddedDialog">
        <div class="ce-advance-input-tool__dialog-header">
          <h3 class="ce-advance-input-tool__dialog-title" data-testid="advance-input-embedded-property-title">
            {{ activeEmbeddedComponent?.title }}
          </h3>
          <button
            type="submit"
            class="ce-advance-input-tool__dialog-close"
            data-testid="advance-input-embedded-property-close"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div v-if="activeEmbeddedComponent" class="ce-advance-input-tool__dialog-body">
          <label
            v-for="field in activeEmbeddedComponent.fields"
            :key="field.key"
            class="ce-advance-input-tool__dialog-field"
            :class="{ 'ce-advance-input-tool__dialog-field--checkbox': field.type === 'checkbox' }"
          >
            <template v-if="field.type === 'checkbox'">
              <input
                class="ce-advance-input-tool__dialog-checkbox"
                type="checkbox"
                :checked="activeEmbeddedComponent.values[field.key] === true"
                :data-testid="\`advance-input-embedded-property-input-\${field.key}\`"
                @change="updateEmbeddedComponentField(field.key, ($event.target as HTMLInputElement).checked)"
              />
              <span class="ce-advance-input-tool__dialog-label">{{ field.label }}</span>
            </template>

            <template v-else-if="field.type === 'select'">
              <span class="ce-advance-input-tool__dialog-label">{{ field.label }}</span>
              <select
                class="ce-advance-input-tool__dialog-input"
                :value="String(activeEmbeddedComponent.values[field.key] ?? '')"
                :data-testid="\`advance-input-embedded-property-input-\${field.key}\`"
                @change="updateEmbeddedComponentField(field.key, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="option in field.options ?? []" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </template>

            <template v-else>
              <span class="ce-advance-input-tool__dialog-label">{{ field.label }}</span>
              <input
                class="ce-advance-input-tool__dialog-input"
                type="text"
                :value="String(activeEmbeddedComponent.values[field.key] ?? '')"
                :placeholder="field.placeholder"
                :data-testid="\`advance-input-embedded-property-input-\${field.key}\`"
                @input="updateEmbeddedComponentField(field.key, ($event.target as HTMLInputElement).value)"
              />
            </template>
          </label>
        </div>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.ce-advance-input-tool {
  position: relative;
}

.ce-advance-input-tool__editor-shell {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 42px;
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 10px;
  background: rgb(255 255 255);
}

.ce-advance-input-tool__editor {
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  white-space: pre;
  overflow-x: auto;
  overflow-y: hidden;
  line-height: 22px;
  outline: none;
  cursor: text;
}



.ce-advance-input-tool__editor-shell:focus-within {
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

.ce-advance-input-tool__menu {
  position: absolute;
  z-index: 20;
  min-width: 168px;
  padding: 6px;
  border: 1px solid rgb(226 232 240);
  border-radius: 12px;
  background: rgb(255 255 255);
  box-shadow: 0 16px 40px rgb(15 23 42 / 0.18);
}

.ce-advance-input-tool__menu-item {
  display: flex;
  width: 100%;
  border: 0;
  border-radius: 8px;
  padding: 8px 10px;
  background: transparent;
  color: rgb(15 23 42);
  cursor: pointer;
  text-align: left;
}

.ce-advance-input-tool__menu-item:hover {
  background: rgb(241 245 249);
}


.ce-advance-input-tool__token {
  display: inline-flex;
  align-items: center;
  margin: 0 2px;
  vertical-align: middle;
}

.ce-advance-input-tool__token {
  border-radius: 10px;
  cursor: pointer;
}

.ce-advance-input-tool__token:hover {
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.18);
}

.ce-advance-input-tool__token--unknown {
  padding: 2px 8px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 12px;
}

.ce-advance-input-tool__dialog {
  width: min(100%, 480px);
  border: 0;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
}

.ce-advance-input-tool__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-advance-input-tool__dialog-panel {
  margin: 0;
  padding: 20px;
  background: rgb(255 255 255);
}

.ce-advance-input-tool__dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.ce-advance-input-tool__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 18px;
  font-weight: 600;
}

.ce-advance-input-tool__dialog-close {
  border: 0;
  border-radius: 10px;
  padding: 8px 12px;
  background: rgb(226 232 240);
  color: rgb(51 65 85);
  cursor: pointer;
}

.ce-advance-input-tool__dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ce-advance-input-tool__dialog-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ce-advance-input-tool__dialog-field--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.ce-advance-input-tool__dialog-label {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 600;
}

.ce-advance-input-tool__dialog-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
}

.ce-advance-input-tool__dialog-input {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-advance-input-tool__dialog-input:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

.dark .ce-advance-input-tool__editor-shell,
.dark .ce-advance-input-tool__editor,
.dark .ce-advance-input-tool__menu {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

.dark .ce-advance-input-tool__menu-item {
  color: rgb(226 232 240);
}

.dark .ce-advance-input-tool__menu-item:hover {
  background: rgb(30 41 59);
}

.dark .ce-advance-input-tool__dialog-panel {
  background: rgb(15 23 42);
}

.dark .ce-advance-input-tool__dialog-title {
  color: rgb(241 245 249);
}

.dark .ce-advance-input-tool__dialog-close {
  background: rgb(51 65 85);
  color: rgb(241 245 249);
}

.dark .ce-advance-input-tool__dialog-label {
  color: rgb(203 213 225);
}

.dark .ce-advance-input-tool__dialog-input {
  background: rgb(15 23 42);
  color: rgb(226 232 240);
  border-color: rgb(71 85 105 / 0.9);
}
</style>
`,P=`<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  normalizeAdvanceTableColumns,
  type MAdvanceTableColumnConfig
} from 'mokelay-components/blocks';

export type ColumnsEditorPayload = {
  value: MAdvanceTableColumnConfig[];
};

export interface MAdvanceTableColumnsEditorProps extends EditorToolComponentProps {
  value?: MAdvanceTableColumnConfig[];
}

export function normalizeMAdvanceTableColumnsEditorProps(
  props: Partial<MAdvanceTableColumnsEditorProps>
): MAdvanceTableColumnsEditorProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    value: normalizeAdvanceTableColumns(props.value)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MAdvanceTableColumnsEditor",
 *   "displayName": "高级表格列配置编辑器",
 *   "category": "data",
 *   "description": "高级表格列配置编辑器，用于维护 MAdvanceTable 的列字段、宽度、固定列、列内容模板和列级事件。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MAdvanceTableColumnsEditor",
 *     "toolSymbol": "mAdvanceTableColumnsEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 173
 *   },
 *   "toolbox": {
 *     "title": "高级表格列配置编辑器",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"5\\" width=\\"16\\" height=\\"14\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M10 5v14M14 5v14M4 10h16\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MAdvanceTableColumnConfig[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MAdvanceTableColumnsEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "列配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "toolChange",
 *       "payload": "{ value: MAdvanceTableColumnConfig[] }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MAdvanceTableColumnsEditor.vue",
 *       "label": "工具变更"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "{ value: MAdvanceTableColumnConfig[] }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MAdvanceTableColumnsEditor.vue",
 *       "label": "变更"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时输出归一化后的 value 列配置数组。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MAdvanceTableColumnsEditor-example",
 *       "type": "MAdvanceTableColumnsEditor",
 *       "data": {
 *         "value": []
 *       }
 *     }
 *   ]
 * }
 */
export const mAdvanceTableColumnsEditorTool = defineEditorTool<MAdvanceTableColumnsEditorProps>({
  normalizeProps: normalizeMAdvanceTableColumnsEditorProps,
  serialize: (props) => ({
    value: normalizeAdvanceTableColumns(props.value)
  })
});
<\/script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MFieldsEditor, {
  normalizeFieldsEditorValue,
  type MFieldsEditorField
} from '@/editors/blocks/MFieldsEditor.vue';
import { useI18n } from '@/i18n';
import {
  createAdvanceTableColumnFromField,
  getAdvanceTableFieldsFromColumns,
  getDefaultAdvanceTableFieldTemplate,
  getSingleParagraphColumnTemplate,
  inferAdvanceTableColumnVariable,
  normalizeAdvanceTableFixed,
  normalizeAdvanceTableWidth,
  setSingleParagraphColumnTemplate,
  type AdvanceTableColumnField,
  type MAdvanceTableFixed
} from 'mokelay-components/blocks';
import { cloneBlockEvents } from 'mokelay-components/blocks';

const props = defineProps<MAdvanceTableColumnsEditorProps & {
  onChange?: (payload: ColumnsEditorPayload) => void;
  onToolChange?: (payload: ColumnsEditorPayload) => void;
}>();

const { t } = useI18n();
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const committedColumns = ref<MAdvanceTableColumnConfig[]>(normalizeAdvanceTableColumns(props.value));
const columnsDraft = ref<MAdvanceTableColumnConfig[]>(normalizeAdvanceTableColumns(props.value));

const savedColumnCount = computed(() => committedColumns.value.length);
const selectedFieldValue = computed(() => getAdvanceTableFieldsFromColumns(columnsDraft.value));
const isReadOnly = computed(() => !props.edit);

function cloneColumns(value?: MAdvanceTableColumnConfig[]) {
  return normalizeAdvanceTableColumns(value).map((column) => ({
    ...column,
    columnContent: column.columnContent?.map((block) => ({
      ...block,
      data: { ...block.data },
      ...(block.events ? { events: cloneBlockEvents(block.events) } : {})
    }))
  }));
}

function getColumnVariable(column: MAdvanceTableColumnConfig) {
  return column.fieldVariable?.trim() || inferAdvanceTableColumnVariable(column.columnContent);
}

function getColumnWidthInputValue(column: MAdvanceTableColumnConfig) {
  return column.width ? String(column.width) : '';
}

function getColumnTemplate(column: MAdvanceTableColumnConfig) {
  return getSingleParagraphColumnTemplate(column);
}

function hasCustomColumnContent(column: MAdvanceTableColumnConfig) {
  return getColumnTemplate(column) === undefined;
}

function createDraftFromCommittedValue() {
  columnsDraft.value = cloneColumns(committedColumns.value);
}

function openSettingsDialog() {
  createDraftFromCommittedValue();
  isSettingsDialogOpen.value = true;
  if (!settingsDialogRef.value?.open) {
    settingsDialogRef.value?.showModal();
  }
}

function closeSettingsDialog() {
  isSettingsDialogOpen.value = false;
  if (settingsDialogRef.value?.open) {
    settingsDialogRef.value.close();
  }
}

function normalizeField(field: MFieldsEditorField): AdvanceTableColumnField | undefined {
  const normalized = normalizeFieldsEditorValue([field])[0];
  if (!normalized) return undefined;

  return {
    label: normalized.label,
    variable: normalized.variable,
    dataType: normalized.dataType
  };
}

function mergeFieldsIntoColumns(fields: MFieldsEditorField[]) {
  if (isReadOnly.value) return;

  const normalizedFields = fields
    .map((field) => normalizeField(field))
    .filter((field): field is AdvanceTableColumnField => Boolean(field));
  const selectedVariables = new Set(normalizedFields.map((field) => field.variable));
  const columnsByVariable = new Map<string, MAdvanceTableColumnConfig>();
  const customColumns: MAdvanceTableColumnConfig[] = [];

  columnsDraft.value.forEach((column) => {
    const variable = getColumnVariable(column);
    if (variable) {
      if (!columnsByVariable.has(variable)) {
        columnsByVariable.set(variable, column);
      }
      return;
    }

    customColumns.push(column);
  });

  const mergedColumns = normalizedFields.map((field) => {
    const existingColumn = columnsByVariable.get(field.variable);
    if (!existingColumn) {
      return createAdvanceTableColumnFromField(field);
    }

    return {
      ...existingColumn,
      columnName: field.label,
      fieldVariable: field.variable,
      fieldDataType: field.dataType
    };
  });

  columnsDraft.value = [
    ...mergedColumns,
    ...customColumns.filter((column) => {
      const variable = getColumnVariable(column);
      return !variable || selectedVariables.has(variable);
    })
  ];
}

function handleFieldsChange(payload: { value?: MFieldsEditorField[] }) {
  mergeFieldsIntoColumns(payload.value ?? []);
}

function updateColumnName(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = {
    ...column,
    columnName: value
  };
}

function updateColumnVariable(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  const previousVariable = getColumnVariable(column);
  const previousTemplate = getColumnTemplate(column);
  const nextVariable = value.trim();
  let nextColumn: MAdvanceTableColumnConfig = {
    ...column,
    fieldVariable: nextVariable || undefined
  };

  if (
    previousTemplate !== undefined &&
    (!previousTemplate.trim() || previousTemplate === getDefaultAdvanceTableFieldTemplate(previousVariable))
  ) {
    nextColumn = setSingleParagraphColumnTemplate(nextColumn, getDefaultAdvanceTableFieldTemplate(nextVariable));
  }

  columnsDraft.value[index] = nextColumn;
}

function updateColumnWidth(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = {
    ...column,
    width: value.trim() ? normalizeAdvanceTableWidth(Number(value)) : null
  };
}

function updateColumnFixed(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = {
    ...column,
    fixed: normalizeAdvanceTableFixed(value as MAdvanceTableFixed)
  };
}

function updateColumnTemplate(index: number, value: string) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = setSingleParagraphColumnTemplate(column, value);
}

function resetColumnTemplate(index: number) {
  if (isReadOnly.value) return;
  const column = columnsDraft.value[index];
  if (!column) return;

  columnsDraft.value[index] = setSingleParagraphColumnTemplate(
    column,
    getDefaultAdvanceTableFieldTemplate(getColumnVariable(column))
  );
}

function removeColumn(index: number) {
  if (isReadOnly.value) return;
  columnsDraft.value.splice(index, 1);
}

function moveColumn(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= columnsDraft.value.length) return;

  const nextColumns = [...columnsDraft.value];
  const [column] = nextColumns.splice(index, 1);
  if (!column) return;
  nextColumns.splice(nextIndex, 0, column);
  columnsDraft.value = nextColumns;
}

function saveColumns() {
  if (isReadOnly.value) return;

  const normalizedColumns = normalizeAdvanceTableColumns(columnsDraft.value);
  committedColumns.value = normalizedColumns;
  props.onToolChange?.({ value: normalizedColumns });
  props.onChange?.({ value: normalizedColumns });
  closeSettingsDialog();
}

watch(
  () => props.value,
  (value) => {
    committedColumns.value = cloneColumns(value);
    if (!isSettingsDialogOpen.value) {
      createDraftFromCommittedValue();
    }
  },
  { deep: true, immediate: true }
);
<\/script>

<template>
  <div class="ce-advance-table-columns-editor" data-testid="advance-table-columns-editor">
    <div class="ce-advance-table-columns-editor__trigger-row">
      <button
        class="ce-advance-table-columns-editor__primary-button"
        type="button"
        data-testid="advance-table-columns-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('advanceTable.columnsEditor.actions.settings') }}
      </button>
      <div class="ce-advance-table-columns-editor__summary" data-testid="advance-table-columns-summary">
        {{ t('advanceTable.columnsEditor.summary.savedCount').replace('{count}', String(savedColumnCount)) }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-advance-table-columns-editor__dialog"
      data-testid="advance-table-columns-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="advance-table-columns-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-advance-table-columns-editor__dialog-panel">
        <div class="ce-advance-table-columns-editor__dialog-header">
          <h3
            id="advance-table-columns-dialog-title"
            class="ce-advance-table-columns-editor__dialog-title"
            data-testid="advance-table-columns-dialog-title"
          >
            {{ t('advanceTable.columnsEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-advance-table-columns-editor__secondary-button"
            type="button"
            data-testid="advance-table-columns-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-advance-table-columns-editor__dialog-body">
          <section class="ce-advance-table-columns-editor__section" data-testid="advance-table-columns-fields-section">
            <div class="ce-advance-table-columns-editor__section-header">
              <div>
                <div class="ce-advance-table-columns-editor__section-title">
                  {{ t('advanceTable.columnsEditor.sections.fields') }}
                </div>
                <p class="ce-advance-table-columns-editor__section-copy">
                  {{ t('advanceTable.columnsEditor.help.fields') }}
                </p>
              </div>
            </div>
            <div class="ce-advance-table-columns-editor__section-body">
              <MFieldsEditor
                :edit="edit"
                :value="selectedFieldValue"
                :on-change="handleFieldsChange"
              />
            </div>
          </section>

          <section class="ce-advance-table-columns-editor__section" data-testid="advance-table-columns-list-section">
            <div class="ce-advance-table-columns-editor__section-header">
              <div>
                <div class="ce-advance-table-columns-editor__section-title">
                  {{ t('advanceTable.columnsEditor.sections.columns') }}
                </div>
                <p class="ce-advance-table-columns-editor__section-copy">
                  {{ t('advanceTable.columnsEditor.summary.draftCount').replace('{count}', String(columnsDraft.length)) }}
                </p>
              </div>
            </div>

            <div class="ce-advance-table-columns-editor__section-body ce-advance-table-columns-editor__section-body--columns">
              <p
                v-if="!columnsDraft.length"
                class="ce-advance-table-columns-editor__empty"
                data-testid="advance-table-columns-empty"
              >
                {{ t('advanceTable.columnsEditor.empty') }}
              </p>

              <div v-else class="ce-advance-table-columns-editor__table" data-testid="advance-table-columns-list">
                <div class="ce-advance-table-columns-editor__table-head" aria-hidden="true">
                  <span>{{ t('advanceTable.columnsEditor.columns.name') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.variable') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.width') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.fixed') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.template') }}</span>
                  <span>{{ t('advanceTable.columnsEditor.columns.actions') }}</span>
                </div>

                <div
                  v-for="(column, index) in columnsDraft"
                  :key="\`\${getColumnVariable(column)}-\${index}\`"
                  class="ce-advance-table-columns-editor__row"
                  :data-testid="\`advance-table-column-row-\${index}\`"
                >
                  <input
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="\`advance-table-column-name-\${index}\`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('advanceTable.columnsEditor.placeholders.name')"
                    :value="column.columnName ?? ''"
                    @input="updateColumnName(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="\`advance-table-column-variable-\${index}\`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('advanceTable.columnsEditor.placeholders.variable')"
                    :value="getColumnVariable(column)"
                    @input="updateColumnVariable(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="\`advance-table-column-width-\${index}\`"
                    type="number"
                    min="1"
                    step="1"
                    :readonly="isReadOnly"
                    :placeholder="t('advanceTable.columnsEditor.placeholders.width')"
                    :value="getColumnWidthInputValue(column)"
                    @input="updateColumnWidth(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <select
                    class="ce-advance-table-columns-editor__input"
                    :data-testid="\`advance-table-column-fixed-\${index}\`"
                    :disabled="isReadOnly"
                    :value="column.fixed ?? ''"
                    @change="updateColumnFixed(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">{{ t('advanceTable.columnsEditor.fixed.none') }}</option>
                    <option value="left">{{ t('advanceTable.columnsEditor.fixed.left') }}</option>
                    <option value="right">{{ t('advanceTable.columnsEditor.fixed.right') }}</option>
                  </select>

                  <div class="ce-advance-table-columns-editor__template-cell">
                    <textarea
                      v-if="!hasCustomColumnContent(column)"
                      class="ce-advance-table-columns-editor__input ce-advance-table-columns-editor__template"
                      :data-testid="\`advance-table-column-template-\${index}\`"
                      :readonly="isReadOnly"
                      rows="2"
                      :placeholder="t('advanceTable.columnsEditor.placeholders.template')"
                      :value="getColumnTemplate(column)"
                      @input="updateColumnTemplate(index, ($event.target as HTMLTextAreaElement).value)"
                      @keydown.stop
                    ></textarea>
                    <div
                      v-else
                      class="ce-advance-table-columns-editor__custom-content"
                      :data-testid="\`advance-table-column-custom-content-\${index}\`"
                    >
                      {{ t('advanceTable.columnsEditor.customContent') }}
                    </div>
                  </div>

                  <div class="ce-advance-table-columns-editor__actions">
                    <button
                      class="ce-advance-table-columns-editor__icon-button"
                      type="button"
                      :data-testid="\`advance-table-column-move-up-\${index}\`"
                      :disabled="isReadOnly || index === 0"
                      @click="moveColumn(index, -1)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.moveUp') }}
                    </button>
                    <button
                      class="ce-advance-table-columns-editor__icon-button"
                      type="button"
                      :data-testid="\`advance-table-column-move-down-\${index}\`"
                      :disabled="isReadOnly || index === columnsDraft.length - 1"
                      @click="moveColumn(index, 1)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.moveDown') }}
                    </button>
                    <button
                      class="ce-advance-table-columns-editor__icon-button"
                      type="button"
                      :data-testid="\`advance-table-column-reset-template-\${index}\`"
                      :disabled="isReadOnly"
                      @click="resetColumnTemplate(index)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.resetTemplate') }}
                    </button>
                    <button
                      class="ce-advance-table-columns-editor__danger-button"
                      type="button"
                      :data-testid="\`advance-table-column-remove-\${index}\`"
                      :disabled="isReadOnly"
                      @click="removeColumn(index)"
                    >
                      {{ t('advanceTable.columnsEditor.actions.remove') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="ce-advance-table-columns-editor__dialog-actions">
          <button
            class="ce-advance-table-columns-editor__secondary-button"
            type="button"
            data-testid="advance-table-columns-cancel"
            @click="closeSettingsDialog"
          >
            {{ edit ? t('advanceTable.columnsEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-advance-table-columns-editor__primary-button"
            type="button"
            data-testid="advance-table-columns-save"
            @click="saveColumns"
          >
            {{ t('advanceTable.columnsEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.ce-advance-table-columns-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-advance-table-columns-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-advance-table-columns-editor__primary-button {
  flex: 0 0 auto;
  min-height: 34px;
  border: 1px solid rgb(20 184 166 / 0.55);
  border-radius: 8px;
  padding: 6px 14px;
  background: rgb(20 184 166);
  color: rgb(255 255 255);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.ce-advance-table-columns-editor__primary-button:hover {
  background: rgb(13 148 136);
}

.ce-advance-table-columns-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-advance-table-columns-editor__dialog {
  width: min(calc(100vw - 32px), 1180px);
  max-height: min(calc(100vh - 32px), 880px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-advance-table-columns-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-advance-table-columns-editor__dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-advance-table-columns-editor__dialog-header,
.ce-advance-table-columns-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
}

.ce-advance-table-columns-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-advance-table-columns-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 700;
}

.ce-advance-table-columns-editor__dialog-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  padding: 12px;
}

.ce-advance-table-columns-editor__section {
  display: flex;
  min-height: 0;
  flex: 0 0 auto;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-advance-table-columns-editor__section-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
  background: rgb(248 250 252);
}

.ce-advance-table-columns-editor__section-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.ce-advance-table-columns-editor__section-body--columns {
  max-height: min(48vh, 520px);
  overflow: auto;
}

.ce-advance-table-columns-editor__section-title {
  color: rgb(15 23 42);
  font-size: 15px;
  font-weight: 700;
}

.ce-advance-table-columns-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-advance-table-columns-editor__empty {
  margin: 0;
  color: rgb(100 116 139);
}

.ce-advance-table-columns-editor__table {
  display: flex;
  min-width: 980px;
  flex-direction: column;
  gap: 8px;
}

.ce-advance-table-columns-editor__table-head,
.ce-advance-table-columns-editor__row {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(140px, 0.8fr) 90px 120px minmax(220px, 1fr) minmax(260px, 1fr);
  gap: 8px;
  align-items: center;
}

.ce-advance-table-columns-editor__table-head {
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.ce-advance-table-columns-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(255 255 255);
}

.ce-advance-table-columns-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
}

.ce-advance-table-columns-editor__template {
  min-height: 58px;
  resize: vertical;
}

.ce-advance-table-columns-editor__input:focus {
  outline: none;
  border-color: rgb(20 184 166);
  box-shadow: 0 0 0 2px rgb(20 184 166 / 0.15);
}

.ce-advance-table-columns-editor__input:read-only,
.ce-advance-table-columns-editor__input:disabled {
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-advance-table-columns-editor__template-cell {
  min-width: 0;
}

.ce-advance-table-columns-editor__custom-content {
  min-height: 58px;
  border: 1px dashed rgb(148 163 184 / 0.75);
  border-radius: 8px;
  padding: 8px 9px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 13px;
  line-height: 20px;
}

.ce-advance-table-columns-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-advance-table-columns-editor__secondary-button,
.ce-advance-table-columns-editor__icon-button,
.ce-advance-table-columns-editor__danger-button {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 6px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-advance-table-columns-editor__icon-button {
  min-height: 32px;
  padding: 5px 8px;
  font-size: 12px;
}

.ce-advance-table-columns-editor__danger-button {
  min-height: 32px;
  padding: 5px 8px;
  color: rgb(185 28 28);
  font-size: 12px;
}

.ce-advance-table-columns-editor__secondary-button:hover,
.ce-advance-table-columns-editor__icon-button:hover,
.ce-advance-table-columns-editor__danger-button:hover {
  background: rgb(248 250 252);
}

.ce-advance-table-columns-editor__primary-button:disabled,
.ce-advance-table-columns-editor__secondary-button:disabled,
.ce-advance-table-columns-editor__icon-button:disabled,
.ce-advance-table-columns-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dark .ce-advance-table-columns-editor {
  color: rgb(226 232 240);
}

.dark .ce-advance-table-columns-editor__summary,
.dark .ce-advance-table-columns-editor__section-header,
.dark .ce-advance-table-columns-editor__custom-content {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
  color: rgb(203 213 225);
}

.dark .ce-advance-table-columns-editor__dialog-panel,
.dark .ce-advance-table-columns-editor__section,
.dark .ce-advance-table-columns-editor__row {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

.dark .ce-advance-table-columns-editor__dialog-header,
.dark .ce-advance-table-columns-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .ce-advance-table-columns-editor__dialog-title,
.dark .ce-advance-table-columns-editor__section-title {
  color: rgb(241 245 249);
}

.dark .ce-advance-table-columns-editor__section-copy,
.dark .ce-advance-table-columns-editor__empty,
.dark .ce-advance-table-columns-editor__table-head {
  color: rgb(148 163 184);
}

.dark .ce-advance-table-columns-editor__input,
.dark .ce-advance-table-columns-editor__secondary-button,
.dark .ce-advance-table-columns-editor__icon-button,
.dark .ce-advance-table-columns-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .ce-advance-table-columns-editor__input:read-only,
.dark .ce-advance-table-columns-editor__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}
</style>
`,V=`<script lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import {
  defineEditorTool,
  type EditorToolComponentProps
} from '@/editors/editorToolDefinition';
import {
  normalizeValue,
  numberValue,
  stringValue
} from 'mokelay-components/blocks/pageDslRuntime';
import type { ClientBlockDoc } from '@/utils/clientBlockDocs';

export type MBlockPlaygroundInitialSource = 'example' | 'default';

export interface MBlockPlaygroundProps extends EditorToolComponentProps {
  title?: string;
  doc?: ClientBlockDoc | null;
  initialSource?: MBlockPlaygroundInitialSource | string;
  jsonRows?: number;
  emptyText?: string;
}

const blockPlaygroundDefaults = {
  title: 'Block 展示',
  doc: null,
  initialSource: 'example',
  jsonRows: 12,
  emptyText: '未找到对应的 Block 文档。'
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneJsonValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeInitialSource(value: unknown): MBlockPlaygroundInitialSource {
  return value === 'default' ? 'default' : 'example';
}

function clampJsonRows(value: unknown) {
  return Math.min(36, Math.max(6, Math.trunc(numberValue(value, blockPlaygroundDefaults.jsonRows))));
}

export function normalizeMBlockPlaygroundProps(props: Partial<MBlockPlaygroundProps>): MBlockPlaygroundProps {
  const merged = {
    ...blockPlaygroundDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    title: stringValue(merged.title, blockPlaygroundDefaults.title),
    doc: isRecord(merged.doc) ? cloneJsonValue(merged.doc) as ClientBlockDoc : null,
    initialSource: normalizeInitialSource(merged.initialSource),
    jsonRows: clampJsonRows(merged.jsonRows),
    emptyText: stringValue(merged.emptyText, blockPlaygroundDefaults.emptyText)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MBlockPlayground",
 *   "displayName": "Block 展示调试器",
 *   "category": "content",
 *   "description": "文档详情页专用的 Block 展示模块，根据客户端 Block 文档渲染真实组件，并提供属性表单与完整 data JSON 的临时调参预览。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MBlockPlayground",
 *     "toolSymbol": "mBlockPlaygroundTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": false,
 *     "sortOrder": 82
 *   },
 *   "toolbox": {
 *     "title": "Block 展示",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"5\\" width=\\"16\\" height=\\"14\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 9h8M8 13h5\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "Block 展示",
 *     "doc": null,
 *     "initialSource": "example",
 *     "jsonRows": 12,
 *     "emptyText": "未找到对应的 Block 文档。"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MBlockPlaygroundEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "doc",
 *       "optional": true,
 *       "tsType": "ClientBlockDoc | null",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MBlockPlaygroundEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "Block 文档"
 *     },
 *     {
 *       "key": "initialSource",
 *       "optional": true,
 *       "tsType": "\\"example\\" | \\"default\\"",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MBlockPlaygroundEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "初始数据",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "example",
 *           "label": "示例优先"
 *         },
 *         {
 *           "value": "default",
 *           "label": "默认值优先"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "jsonRows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MBlockPlaygroundEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 行数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MBlockPlaygroundEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空态文案",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存文档绑定、初始来源、JSON 行数和空态文案；调试区内用户修改的 preview data 不持久化。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MBlockPlayground-example",
 *       "type": "MBlockPlayground",
 *       "data": {
 *         "title": "Block 展示",
 *         "doc": null,
 *         "initialSource": "example",
 *         "jsonRows": 12
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MBlockPlaygroundEditor.vue",
 *       "reason": "Editor-only component and tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mBlockPlaygroundTool = defineEditorTool<MBlockPlaygroundProps>({
  normalizeProps: normalizeMBlockPlaygroundProps,
  serialize: (props) => {
    const normalized = normalizeMBlockPlaygroundProps(props);
    return {
      title: normalized.title,
      doc: normalizeValue(normalized.doc, null),
      initialSource: normalized.initialSource,
      jsonRows: normalized.jsonRows,
      emptyText: normalized.emptyText
    };
  }
});
<\/script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PageDslEditorBlock from '@/editors/components/PageDslEditorBlock.vue';
import MokelayBlockRenderer from 'mokelay-components/blocks/MokelayBlockRenderer.vue';
import { isMokelayBlockRegistered } from 'mokelay-components/blocks';
import type { EditorToolPropertyField } from '@/editors/editorToolDefinition';
import {
  getClientBlockDefaultData,
  resolveClientBlockPropertyFields
} from '@/editors/clientBlockToolMetadata';
import {
  normalizeClientBlockDoc,
  type NormalizedClientBlockDoc
} from '@/utils/clientBlockDocs';
import type { PageDslCallbacks } from 'mokelay-components/blocks/pageDslRuntime';

type EditorBlock = OutputData['blocks'][number];
type EditorColumnData = { blocks?: OutputData['blocks'] };

const props = defineProps<MBlockPlaygroundProps & PageDslCallbacks<MBlockPlaygroundProps>>();

const draftData = ref<Record<string, unknown>>({});
const jsonText = ref('');
const jsonError = ref('');
const fieldJsonTexts = ref<Record<string, string>>({});
const fieldErrors = ref<Record<string, string>>({});

const normalizedProps = computed(() => normalizeMBlockPlaygroundProps(props));
const normalizedDoc = computed<NormalizedClientBlockDoc | null>(() => {
  const doc = normalizedProps.value.doc;
  return doc ? normalizeClientBlockDoc(doc) : null;
});
const propertyFields = computed(() => (
  normalizedDoc.value ? resolveClientBlockPropertyFields(normalizedDoc.value) : []
));
const playgroundTitle = computed(() => normalizedProps.value.title || blockPlaygroundDefaults.title);
const playgroundEmptyText = computed(() => normalizedProps.value.emptyText || blockPlaygroundDefaults.emptyText);
const runtimePreviewUnavailableText = '该 Block 仅支持编辑态，无法运行时预览。';
const isRuntimePreviewSupported = computed(() => {
  const blockType = normalizedDoc.value?.blockType;
  if (!blockType || blockType === 'MBlockPlayground') return false;
  return blockType === 'paragraph' || blockType === 'table' || blockType === 'columns' ||
    isMokelayBlockRegistered(blockType);
});
const previewBlockId = computed(() => {
  const base = normalizedProps.value.currentBlockId || normalizedDoc.value?.blockType || 'block-playground';
  return \`\${base}-preview\`;
});
const previewBlock = computed<EditorBlock | null>(() => {
  const doc = normalizedDoc.value;
  if (!doc || !isRuntimePreviewSupported.value) return null;
  return {
    id: previewBlockId.value,
    type: doc.blockType,
    data: cloneRecord(draftData.value)
  };
});
const previewBlockSignature = computed(() => (
  previewBlock.value ? JSON.stringify(previewBlock.value) : ''
));
const initialDataSignature = computed(() => {
  const doc = normalizedDoc.value;
  if (!doc) return 'empty';
  return JSON.stringify({
    blockType: doc.blockType,
    initialSource: normalizedProps.value.initialSource,
    defaultData: doc.defaultData,
    examples: doc.examples
  });
});

function cloneRecord(value: Record<string, unknown>) {
  return cloneJsonValue(value) as Record<string, unknown>;
}

function formatJson(value: unknown) {
  try {
    const text = JSON.stringify(value, null, 2);
    return typeof text === 'string' ? text : '';
  } catch {
    return '';
  }
}

function isBlockExample(value: unknown): value is { data?: unknown } {
  return isRecord(value);
}

function firstExampleData(doc: NormalizedClientBlockDoc) {
  const example = doc.examples.find(isBlockExample);
  return isRecord(example?.data) ? cloneRecord(example.data) : undefined;
}

function defaultPreviewData(doc: NormalizedClientBlockDoc) {
  return cloneRecord(getClientBlockDefaultData(doc));
}

function buildInitialData() {
  const doc = normalizedDoc.value;
  if (!doc) return {};

  const exampleData = firstExampleData(doc);
  if (normalizedProps.value.initialSource === 'default') {
    return defaultPreviewData(doc);
  }

  return exampleData ?? defaultPreviewData(doc);
}

function syncJsonTextFromDraft() {
  jsonText.value = formatJson(draftData.value);
  jsonError.value = '';
}

function syncFieldTextsFromDraft() {
  const nextTexts: Record<string, string> = {};
  const nextErrors: Record<string, string> = {};
  propertyFields.value.forEach((field) => {
    if (field.valueType === 'json') {
      nextTexts[field.key] = formatJson(draftData.value[field.key]);
    }
  });
  fieldJsonTexts.value = nextTexts;
  fieldErrors.value = nextErrors;
}

function resetDraftData() {
  draftData.value = buildInitialData();
  syncJsonTextFromDraft();
  syncFieldTextsFromDraft();
}

function resetPlayground() {
  resetDraftData();
}

function formatJsonEditor() {
  try {
    const parsed = JSON.parse(jsonText.value);
    if (!isRecord(parsed)) {
      jsonError.value = '请输入 JSON 对象。';
      return;
    }

    draftData.value = cloneRecord(parsed);
    syncJsonTextFromDraft();
    syncFieldTextsFromDraft();
  } catch {
    jsonError.value = '请输入有效 JSON。';
  }
}

function updateDraftData(patch: Record<string, unknown>) {
  draftData.value = {
    ...draftData.value,
    ...cloneRecord(patch)
  };
  syncJsonTextFromDraft();
  syncFieldTextsFromDraft();
}

function updatePropertyField(field: EditorToolPropertyField, event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  if (target instanceof HTMLInputElement && target.type === 'checkbox') {
    updateDraftData({ [field.key]: target.checked });
    return;
  }

  if (field.valueType === 'json') {
    const value = target.value;
    fieldJsonTexts.value = {
      ...fieldJsonTexts.value,
      [field.key]: value
    };

    try {
      const parsed = JSON.parse(value);
      fieldErrors.value = {
        ...fieldErrors.value,
        [field.key]: ''
      };
      updateDraftData({ [field.key]: parsed });
    } catch {
      fieldErrors.value = {
        ...fieldErrors.value,
        [field.key]: field.validationMessage || '请输入有效 JSON。'
      };
    }
    return;
  }

  updateDraftData({ [field.key]: target.value });
}

function updateJsonEditor(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLTextAreaElement)) return;

  jsonText.value = target.value;
  try {
    const parsed = JSON.parse(target.value);
    if (!isRecord(parsed)) {
      jsonError.value = '请输入 JSON 对象。';
      return;
    }

    draftData.value = cloneRecord(parsed);
    jsonError.value = '';
    syncFieldTextsFromDraft();
  } catch {
    jsonError.value = '请输入有效 JSON。';
  }
}

function propertyFieldValue(field: EditorToolPropertyField) {
  if (field.valueType === 'json') {
    return fieldJsonTexts.value[field.key] ?? formatJson(draftData.value[field.key]);
  }

  const value = draftData.value[field.key];
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function propertyCheckboxValue(field: EditorToolPropertyField) {
  return draftData.value[field.key] === true;
}

function propertyError(field: EditorToolPropertyField) {
  return fieldErrors.value[field.key] || '';
}

function propertyInputEvent(field: EditorToolPropertyField) {
  return field.type === 'select' || field.type === 'checkbox' ? 'change' : 'input';
}

function getPropertyComponentProps(field: EditorToolPropertyField) {
  const state = draftData.value;
  const value = state[field.key];
  return {
    edit: true,
    currentBlockId: \`\${previewBlockId.value}-\${field.key}\`,
    getAvailableBlockDataSources: normalizedProps.value.getAvailableBlockDataSources,
    getAvailablePageVariableSources: normalizedProps.value.getAvailablePageVariableSources,
    previewRuntime: normalizedProps.value.previewRuntime,
    value,
    ...(field.getComponentProps?.({ value, state, edit: true }) ?? {})
  };
}

function handlePropertyComponentChange(field: EditorToolPropertyField, payload: unknown) {
  if (
    isRecord(payload) &&
    isRecord(payload.patch)
  ) {
    updateDraftData(payload.patch);
    return;
  }

  if (isRecord(payload) && Object.prototype.hasOwnProperty.call(payload, 'value')) {
    updateDraftData({ [field.key]: payload.value });
    return;
  }

  updateDraftData({ [field.key]: payload });
}

function getColumns(block: EditorBlock): EditorColumnData[] {
  const cols = (block.data as { cols?: unknown }).cols;
  if (!Array.isArray(cols)) return [];
  return cols.filter((col): col is EditorColumnData => isRecord(col));
}

function getColumnBlocks(column: EditorColumnData): OutputData['blocks'] {
  return Array.isArray(column.blocks) ? column.blocks : [];
}

function isColumnsBlock(block: EditorBlock | null): block is EditorBlock {
  return block?.type === 'columns';
}

watch(
  initialDataSignature,
  () => {
    resetDraftData();
  },
  { immediate: true }
);

watch(
  propertyFields,
  () => {
    syncFieldTextsFromDraft();
  },
  { deep: true }
);
<\/script>

<template>
  <PageDslEditorBlock block-type="MBlockPlayground">
    <section class="m-block-playground" data-testid="m-block-playground">
      <header class="m-block-playground__header">
        <div>
          <h2 class="m-block-playground__title">
            {{ playgroundTitle }}
          </h2>
          <p v-if="normalizedDoc" class="m-block-playground__subtitle">
            {{ normalizedDoc.displayName }} / {{ normalizedDoc.blockType }}
          </p>
        </div>
        <button
          type="button"
          class="m-block-playground__button m-block-playground__button--secondary"
          data-testid="m-block-playground-reset"
          :disabled="!normalizedDoc"
          @click="resetPlayground"
        >
          重置
        </button>
      </header>

      <p
        v-if="!normalizedDoc"
        class="m-block-playground__empty"
        data-testid="m-block-playground-empty"
      >
        {{ playgroundEmptyText }}
      </p>

      <div v-else class="m-block-playground__body">
        <div class="m-block-playground__preview-panel">
          <div class="m-block-playground__panel-title">
            实时预览
          </div>
          <div class="m-block-playground__preview" data-testid="m-block-playground-preview">
            <p
              v-if="!isRuntimePreviewSupported"
              class="m-block-playground__muted"
              data-testid="m-block-playground-preview-unavailable"
            >
              {{ runtimePreviewUnavailableText }}
            </p>
            <template v-else-if="previewBlock">
              <div
                v-if="isColumnsBlock(previewBlock)"
                data-testid="m-block-playground-preview-columns"
                class="m-block-playground__columns"
              >
                <div
                  v-for="(column, columnIndex) in getColumns(previewBlock)"
                  :key="\`columns-\${columnIndex}\`"
                  class="m-block-playground__column"
                  :data-testid="\`m-block-playground-preview-column-\${columnIndex}\`"
                >
                  <MokelayBlockRenderer
                    v-for="(columnBlock, blockIndex) in getColumnBlocks(column)"
                    :key="columnBlock.id ?? \`\${columnBlock.type}-\${blockIndex}\`"
                    :block="columnBlock"
                    compact-table
                  />
                </div>
              </div>
              <MokelayBlockRenderer
                v-else
                :key="previewBlockSignature"
                :block="previewBlock"
              />
            </template>
          </div>
        </div>

        <aside class="m-block-playground__settings">
          <div class="m-block-playground__panel-title">
            属性
          </div>
          <div
            v-if="propertyFields.length"
            class="m-block-playground__fields"
            data-testid="m-block-playground-fields"
          >
            <div
              v-for="field in propertyFields"
              :key="field.key"
              class="m-block-playground__field"
            >
              <template v-if="field.type === 'component'">
                <span class="m-block-playground__label">
                  {{ field.label }}
                </span>
                <component
                  :is="field.component"
                  v-if="field.component"
                  v-bind="getPropertyComponentProps(field)"
                  :data-testid="\`m-block-playground-field-\${field.key}\`"
                  @change="(payload: unknown) => handlePropertyComponentChange(field, payload)"
                  @tool-change="(payload: unknown) => handlePropertyComponentChange(field, payload)"
                />
              </template>

              <label
                v-else-if="field.type === 'checkbox'"
                class="m-block-playground__checkbox"
              >
                <input
                  :data-testid="\`m-block-playground-field-\${field.key}\`"
                  type="checkbox"
                  :checked="propertyCheckboxValue(field)"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                >
                <span>{{ field.label }}</span>
              </label>

              <label v-else class="m-block-playground__label-wrap">
                <span class="m-block-playground__label">
                  {{ field.label }}
                </span>
                <select
                  v-if="field.type === 'select'"
                  class="m-block-playground__input"
                  :data-testid="\`m-block-playground-field-\${field.key}\`"
                  :value="propertyFieldValue(field)"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                >
                  <option
                    v-for="option in field.options ?? []"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <textarea
                  v-else-if="field.type === 'textarea'"
                  class="m-block-playground__input m-block-playground__textarea"
                  :class="{ 'm-block-playground__input--invalid': propertyError(field) }"
                  :data-testid="\`m-block-playground-field-\${field.key}\`"
                  :value="propertyFieldValue(field)"
                  :placeholder="field.placeholder"
                  :rows="field.valueType === 'json' ? 5 : 3"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                />
                <input
                  v-else
                  class="m-block-playground__input"
                  :class="{ 'm-block-playground__input--invalid': propertyError(field) }"
                  :data-testid="\`m-block-playground-field-\${field.key}\`"
                  type="text"
                  :value="propertyFieldValue(field)"
                  :placeholder="field.placeholder"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                >
                <span
                  v-if="propertyError(field)"
                  class="m-block-playground__error"
                  :data-testid="\`m-block-playground-field-error-\${field.key}\`"
                >
                  {{ propertyError(field) }}
                </span>
              </label>
            </div>
          </div>
          <p v-else class="m-block-playground__muted" data-testid="m-block-playground-no-fields">
            该 Block 没有可配置属性。
          </p>

          <div class="m-block-playground__json-header">
            <span class="m-block-playground__panel-title">
              data JSON
            </span>
            <button
              type="button"
              class="m-block-playground__button"
              data-testid="m-block-playground-format"
              @click="formatJsonEditor"
            >
              格式化
            </button>
          </div>
          <textarea
            class="m-block-playground__input m-block-playground__textarea m-block-playground__json"
            :class="{ 'm-block-playground__input--invalid': jsonError }"
            data-testid="m-block-playground-json"
            :rows="normalizedProps.jsonRows"
            :value="jsonText"
            spellcheck="false"
            @input="updateJsonEditor"
          />
          <p
            v-if="jsonError"
            class="m-block-playground__error"
            data-testid="m-block-playground-json-error"
          >
            {{ jsonError }}
          </p>
        </aside>
      </div>
    </section>
  </PageDslEditorBlock>
</template>

<style scoped>
.m-block-playground {
  width: 100%;
  padding: 16px;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
}

.dark .m-block-playground {
  color: #e2e8f0;
  background: #0f172a;
  border-color: #334155;
}

.m-block-playground__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.m-block-playground__title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.m-block-playground__subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.dark .m-block-playground__subtitle,
.dark .m-block-playground__muted {
  color: #94a3b8;
}

.m-block-playground__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
  gap: 16px;
  align-items: start;
}

.m-block-playground__preview-panel,
.m-block-playground__settings {
  min-width: 0;
}

.m-block-playground__preview {
  min-height: 180px;
  padding: 16px;
  overflow: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.dark .m-block-playground__preview {
  background: #020617;
  border-color: #334155;
}

.m-block-playground__panel-title {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.dark .m-block-playground__panel-title {
  color: #cbd5e1;
}

.m-block-playground__fields {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.m-block-playground__field {
  min-width: 0;
}

.m-block-playground__label-wrap {
  display: grid;
  gap: 5px;
}

.m-block-playground__label {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.dark .m-block-playground__label {
  color: #cbd5e1;
}

.m-block-playground__checkbox {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 32px;
  color: #334155;
  font-size: 13px;
  font-weight: 650;
}

.dark .m-block-playground__checkbox {
  color: #e2e8f0;
}

.m-block-playground__input {
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.4;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.dark .m-block-playground__input {
  color: #f8fafc;
  background: #111827;
  border-color: #475569;
}

.m-block-playground__input--invalid {
  border-color: #dc2626;
  outline-color: #dc2626;
}

.m-block-playground__textarea {
  resize: vertical;
}

.m-block-playground__json {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.m-block-playground__json-header {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.m-block-playground__button {
  height: 32px;
  padding: 0 10px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}

.m-block-playground__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.m-block-playground__button--secondary {
  white-space: nowrap;
}

.dark .m-block-playground__button {
  color: #e2e8f0;
  background: #111827;
  border-color: #475569;
}

.m-block-playground__error {
  margin: 5px 0 0;
  color: #dc2626;
  font-size: 12px;
  font-weight: 650;
}

.m-block-playground__empty,
.m-block-playground__muted {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.m-block-playground__empty {
  padding: 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.m-block-playground__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.m-block-playground__column {
  min-width: 0;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

@media (max-width: 820px) {
  .m-block-playground__body {
    grid-template-columns: 1fr;
  }

  .m-block-playground__columns {
    grid-template-columns: 1fr;
  }
}
</style>
`,A=`<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type MChartDataEditorChartType = 'line' | 'bar' | 'pie';

export type MChartDataEditorSeriesItem = {
  name: string;
  data: number[];
};

export type MChartDataEditorData = {
  xAxis: string[];
  series: MChartDataEditorSeriesItem[];
  chartType?: MChartDataEditorChartType;
  readonly?: boolean;
};

export interface MChartDataEditorProps extends EditorToolComponentProps {
  value?: unknown;
  xAxis?: unknown;
  series?: unknown;
  chartType?: MChartDataEditorChartType | string;
  readonly?: boolean;
  outputMode?: 'value' | 'patch';
  testid?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseJsonIfString(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function localizedString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value.trim() || fallback;
  if (isRecord(value)) {
    const localeValue = i18n.locale === 'en' ? value.en : value.zh;
    if (typeof localeValue === 'string' && localeValue.trim()) return localeValue.trim();
    if (typeof value.raw === 'string' && value.raw.trim()) return value.raw.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes'].includes(normalized)) return true;
    if (['0', 'false', 'no'].includes(normalized)) return false;
  }
  return fallback;
}

function getDefaultXAxis() {
  return i18n.locale === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    : ['周一', '周二', '周三', '周四', '周五'];
}

function getDefaultSeries(length = getDefaultXAxis().length): MChartDataEditorSeriesItem[] {
  return [{
    name: i18n.t('chart.defaultSeriesName'),
    data: [120, 200, 150, 80, 70].slice(0, length).concat(Array.from({ length: Math.max(0, length - 5) }, () => 0))
  }];
}

function normalizeChartType(value: unknown): MChartDataEditorChartType {
  return value === 'bar' || value === 'pie' ? value : 'line';
}

function normalizeXAxis(value: unknown): string[] {
  const source = parseJsonIfString(value);
  if (!Array.isArray(source)) return getDefaultXAxis();

  const normalized = source
    .map((item) => localizedString(item))
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length ? normalized : getDefaultXAxis();
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function alignSeriesData(data: unknown[], length: number) {
  return Array.from({ length }, (_, index) => normalizeNumber(data[index]));
}

function normalizeSeries(value: unknown, xAxisLength: number): MChartDataEditorSeriesItem[] {
  const source = parseJsonIfString(value);
  if (!Array.isArray(source)) return getDefaultSeries(xAxisLength);

  const normalized = source
    .flatMap((item, index): MChartDataEditorSeriesItem[] => {
      if (!isRecord(item)) return [];
      const data = Array.isArray(item.data) ? item.data : [];
      return [{
        name: localizedString(item.name, \`\${i18n.t('chart.defaultSeriesName')}\${index + 1}\`),
        data: alignSeriesData(data, xAxisLength)
      }];
    })
    .filter((item) => item.name.trim());

  return normalized.length ? normalized : getDefaultSeries(xAxisLength);
}

function readValueRecord(value: unknown) {
  const parsed = parseJsonIfString(value);
  return isRecord(parsed) ? parsed : {};
}

export function normalizeMChartDataEditorData(value: unknown): MChartDataEditorData {
  const record = readValueRecord(value);
  const xAxis = normalizeXAxis(record.xAxis);
  return {
    xAxis,
    series: normalizeSeries(record.series, xAxis.length),
    chartType: normalizeChartType(record.chartType ?? record.type),
    readonly: booleanValue(record.readonly)
  };
}

export function normalizeMChartDataEditorProps(props: Partial<MChartDataEditorProps>): MChartDataEditorProps {
  const valueRecord = readValueRecord(props.value);
  const xAxis = normalizeXAxis(props.xAxis ?? valueRecord.xAxis);
  const chartType = normalizeChartType(props.chartType ?? valueRecord.chartType ?? valueRecord.type);
  return {
    edit: props.edit ?? false,
    currentBlockId: typeof props.currentBlockId === 'string' ? props.currentBlockId : undefined,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    value: {
      xAxis,
      series: normalizeSeries(props.series ?? valueRecord.series, xAxis.length),
      chartType,
      readonly: booleanValue(props.readonly ?? valueRecord.readonly)
    },
    xAxis,
    series: normalizeSeries(props.series ?? valueRecord.series, xAxis.length),
    chartType,
    readonly: booleanValue(props.readonly ?? valueRecord.readonly),
    outputMode: props.outputMode === 'patch' ? 'patch' : 'value',
    testid: typeof props.testid === 'string' ? props.testid : ''
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MChartDataEditor",
 *   "displayName": "图表数据编辑器",
 *   "category": "data",
 *   "description": "图表数据编辑器，用类表格方式维护 MChart 的横坐标和多组 series 数据，并保证分类和数据长度一致。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MChartDataEditor",
 *     "toolSymbol": "mChartDataEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 171
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "图表数据编辑器",
 *       "en": "Chart Data Editor"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"4\\" width=\\"16\\" height=\\"16\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 16V11M12 16V8M16 16v-6\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "xAxis": [
 *       { "zh": "周一", "en": "Mon" },
 *       { "zh": "周二", "en": "Tue" },
 *       { "zh": "周三", "en": "Wed" },
 *       { "zh": "周四", "en": "Thu" },
 *       { "zh": "周五", "en": "Fri" }
 *     ],
 *     "series": [
 *       {
 *         "name": { "zh": "数据", "en": "Data" },
 *         "data": [120, 200, 150, 80, 70]
 *       }
 *     ],
 *     "chartType": "line",
 *     "readonly": false
 *   },
 *   "properties": [
 *     {
 *       "key": "xAxis",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "横坐标数据"
 *     },
 *     {
 *       "key": "series",
 *       "optional": true,
 *       "tsType": "MChartDataEditorSeriesItem[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "图表数据"
 *     },
 *     {
 *       "key": "chartType",
 *       "optional": true,
 *       "tsType": "MChartDataEditorChartType | string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "预览图表类型",
 *       "type": "select",
 *       "options": [
 *         { "value": "line", "label": { "zh": "折线图", "en": "Line chart" } },
 *         { "value": "bar", "label": { "zh": "柱状图", "en": "Bar chart" } },
 *         { "value": "pie", "label": { "zh": "饼图", "en": "Pie chart" } }
 *       ]
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "update:modelValue",
 *       "payload": "value: MChartDataEditorData",
 *       "trigger": "图表数据保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "label": "更新绑定值"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "{ value?: MChartDataEditorData; patch?: Pick<MChartDataEditorData, 'xAxis' | 'series'> }",
 *       "trigger": "图表数据保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "label": "变更"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "value: unknown",
 *       "returns": "void",
 *       "label": "设置图表数据"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "MChartDataEditorData",
 *       "label": "获取图表数据"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "void",
 *       "label": "恢复默认数据"
 *     },
 *     {
 *       "name": "validate",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "{ valid: boolean; message?: string }",
 *       "label": "校验"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "横坐标",
 *       "variable": "xAxis",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue"
 *     },
 *     {
 *       "label": "系列数据",
 *       "variable": "series",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，输出 xAxis、series、chartType 和 readonly。作为 MChart 属性编辑器时通过 patch 回写 xAxis 和 series。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MChartDataEditor-example",
 *       "type": "MChartDataEditor",
 *       "data": {
 *         "xAxis": ["周一", "周二", "周三"],
 *         "series": [
 *           { "name": "数据", "data": [120, 200, 150] }
 *         ],
 *         "chartType": "line",
 *         "readonly": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mChartDataEditorTool = defineEditorTool<MChartDataEditorProps>({
  normalizeProps: normalizeMChartDataEditorProps,
  serialize: (props) => {
    const normalized = normalizeMChartDataEditorProps(props);
    return {
      xAxis: cloneValue(normalized.xAxis ?? []),
      series: cloneValue(normalized.series ?? []),
      chartType: normalizeChartType(normalized.chartType),
      readonly: normalized.readonly === true
    };
  }
});
<\/script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '@/i18n';

type DraftChartSeriesItem = {
  name: string;
  data: string[];
};

type DraftChartData = {
  xAxis: string[];
  series: DraftChartSeriesItem[];
};

type ChartDataPayload = {
  value?: MChartDataEditorData;
  patch?: Pick<MChartDataEditorData, 'xAxis' | 'series'>;
};

const props = withDefaults(defineProps<MChartDataEditorProps>(), {
  edit: false,
  readonly: false,
  outputMode: 'value',
  testid: ''
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: MChartDataEditorData): void;
  (event: 'toolChange', payload: ChartDataPayload): void;
  (event: 'change', payload: ChartDataPayload): void;
}>();

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);
const committedData = ref<MChartDataEditorData>(normalizeDataFromProps());
const draftData = ref<DraftChartData>(toDraftData(committedData.value));

const isReadOnly = computed(() => props.readonly === true || !props.edit);
const chartType = computed(() => normalizeChartType(props.chartType ?? committedData.value.chartType));
const savedSummary = computed(() => t('chart.dataEditor.summary')
  .replace('{categories}', String(committedData.value.xAxis.length))
  .replace('{series}', String(committedData.value.series.length)));
const validationMessage = computed(() => validateDraftData(draftData.value).message ?? '');
const previewData = computed(() => {
  const validation = validateDraftData(draftData.value);
  return validation.valid ? draftToData(draftData.value) : committedData.value;
});
const maxPreviewValue = computed(() => Math.max(
  1,
  ...previewData.value.series.flatMap((item) => item.data.map((value) => Math.abs(value)))
));
const previewColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

function normalizeDataFromProps(): MChartDataEditorData {
  const normalized = normalizeMChartDataEditorProps(props);
  return {
    xAxis: cloneValue(normalized.xAxis ?? []) as string[],
    series: cloneValue(normalized.series ?? []) as MChartDataEditorSeriesItem[],
    chartType: normalizeChartType(normalized.chartType),
    readonly: normalized.readonly === true
  };
}

function toDraftData(value: MChartDataEditorData): DraftChartData {
  return {
    xAxis: value.xAxis.map((item) => String(item)),
    series: value.series.map((item) => ({
      name: item.name,
      data: value.xAxis.map((_, index) => String(item.data[index] ?? 0))
    }))
  };
}

function draftToData(value: DraftChartData): MChartDataEditorData {
  const xAxis = value.xAxis.map((item) => item.trim());
  return {
    xAxis,
    series: value.series.map((item, index) => ({
      name: item.name.trim() || \`\${t('chart.defaultSeriesName')}\${index + 1}\`,
      data: xAxis.map((_, dataIndex) => Number(item.data[dataIndex] ?? 0))
    })),
    chartType: chartType.value,
    readonly: props.readonly === true
  };
}

function validateDraftData(value: DraftChartData): { valid: boolean; message?: string } {
  if (!value.xAxis.length) {
    return { valid: false, message: t('chart.dataEditor.validation.emptyCategory') };
  }

  if (value.xAxis.some((item) => !item.trim())) {
    return { valid: false, message: t('chart.dataEditor.validation.emptyCategory') };
  }

  if (!value.series.length) {
    return { valid: false, message: t('chart.dataEditor.validation.emptySeries') };
  }

  if (value.series.some((item) => !item.name.trim())) {
    return { valid: false, message: t('chart.dataEditor.validation.emptySeriesName') };
  }

  const hasInvalidNumber = value.series.some((item) => (
    item.data.length !== value.xAxis.length ||
    item.data.some((cell) => !cell.trim() || !Number.isFinite(Number(cell)))
  ));
  if (hasInvalidNumber) {
    return { valid: false, message: t('chart.dataEditor.validation.invalidNumber') };
  }

  return { valid: true };
}

function openDialog() {
  draftData.value = toDraftData(committedData.value);
  isOpen.value = true;
  if (!dialogRef.value?.open) {
    dialogRef.value?.showModal();
  }
}

function closeDialog() {
  isOpen.value = false;
  if (dialogRef.value?.open) {
    dialogRef.value.close();
  }
}

function emitData(value: MChartDataEditorData) {
  const output = {
    xAxis: cloneValue(value.xAxis),
    series: cloneValue(value.series)
  };
  const payload: ChartDataPayload = props.outputMode === 'patch'
    ? { patch: output }
    : { value: { ...output, chartType: value.chartType, readonly: value.readonly } };
  emit('update:modelValue', { ...output, chartType: value.chartType, readonly: value.readonly });
  emit('toolChange', payload);
  emit('change', payload);
}

function saveDraft() {
  if (isReadOnly.value) return;
  const validation = validateDraftData(draftData.value);
  if (!validation.valid) return;

  const normalized = draftToData(draftData.value);
  committedData.value = normalized;
  emitData(normalized);
  closeDialog();
}

function setCategory(index: number, value: string) {
  if (isReadOnly.value) return;
  draftData.value.xAxis[index] = value;
}

function addCategory() {
  if (isReadOnly.value) return;
  const nextIndex = draftData.value.xAxis.length + 1;
  draftData.value.xAxis.push(\`\${t('chart.dataEditor.categoryPrefix')}\${nextIndex}\`);
  draftData.value.series.forEach((item) => item.data.push('0'));
}

function removeCategory(index: number) {
  if (isReadOnly.value || draftData.value.xAxis.length <= 1) return;
  draftData.value.xAxis.splice(index, 1);
  draftData.value.series.forEach((item) => item.data.splice(index, 1));
}

function addSeries() {
  if (isReadOnly.value) return;
  const nextIndex = draftData.value.series.length + 1;
  draftData.value.series.push({
    name: \`\${t('chart.defaultSeriesName')}\${nextIndex}\`,
    data: draftData.value.xAxis.map(() => '0')
  });
}

function removeSeries(index: number) {
  if (isReadOnly.value || draftData.value.series.length <= 1) return;
  draftData.value.series.splice(index, 1);
}

function setSeriesName(index: number, value: string) {
  if (isReadOnly.value) return;
  const series = draftData.value.series[index];
  if (!series) return;
  series.name = value;
}

function setSeriesValue(seriesIndex: number, dataIndex: number, value: string) {
  if (isReadOnly.value) return;
  const series = draftData.value.series[seriesIndex];
  if (!series) return;
  series.data[dataIndex] = value;
}

function barHeight(value: number) {
  return Math.max(2, Math.round((Math.abs(value) / maxPreviewValue.value) * 76));
}

function barX(seriesIndex: number, dataIndex: number) {
  const categoryWidth = 320 / Math.max(1, previewData.value.xAxis.length);
  const seriesWidth = Math.max(4, Math.min(16, categoryWidth / Math.max(1, previewData.value.series.length) - 2));
  return 18 + dataIndex * categoryWidth + seriesIndex * (seriesWidth + 2);
}

function barWidth() {
  const categoryWidth = 320 / Math.max(1, previewData.value.xAxis.length);
  return Math.max(4, Math.min(16, categoryWidth / Math.max(1, previewData.value.series.length) - 2));
}

function linePoints(series: MChartDataEditorSeriesItem) {
  const width = 320;
  const step = previewData.value.xAxis.length > 1 ? width / (previewData.value.xAxis.length - 1) : 0;
  return series.data.map((value, index) => {
    const x = 18 + index * step;
    const y = 96 - (Math.abs(value) / maxPreviewValue.value) * 76;
    return \`\${x},\${y}\`;
  }).join(' ');
}

function setValue(value: unknown) {
  const normalized = normalizeMChartDataEditorData(value);
  committedData.value = normalized;
  draftData.value = toDraftData(normalized);
  emitData(normalized);
}

function getValue() {
  return cloneValue(committedData.value);
}

function clear() {
  const normalized = normalizeMChartDataEditorData({});
  committedData.value = normalized;
  draftData.value = toDraftData(normalized);
  emitData(normalized);
}

function validate() {
  return validateDraftData(draftData.value);
}

defineExpose({
  setValue,
  getValue,
  clear,
  validate
});

watch(
  () => [props.value, props.xAxis, props.series, props.chartType, props.readonly],
  () => {
    committedData.value = normalizeDataFromProps();
    if (!isOpen.value) {
      draftData.value = toDraftData(committedData.value);
    }
  },
  { deep: true }
);
<\/script>

<template>
  <div class="chart-data-editor" :data-testid="testid || 'chart-data-editor'">
    <div class="chart-data-editor__trigger-row">
      <button
        class="chart-data-editor__primary-button"
        type="button"
        data-testid="chart-data-settings-open"
        @click="openDialog"
      >
        {{ t('chart.dataEditor.actions.settings') }}
      </button>
      <span class="chart-data-editor__summary" data-testid="chart-data-summary">
        {{ savedSummary }}
      </span>
    </div>

    <dialog
      ref="dialogRef"
      class="chart-data-editor__dialog"
      data-testid="chart-data-dialog"
      :aria-hidden="!isOpen"
      aria-labelledby="chart-data-dialog-title"
      @close="isOpen = false"
    >
      <div class="chart-data-editor__dialog-panel">
        <div class="chart-data-editor__dialog-header">
          <h3 id="chart-data-dialog-title" class="chart-data-editor__dialog-title">
            {{ t('chart.dataEditor.title') }}
          </h3>
          <button
            class="chart-data-editor__secondary-button"
            type="button"
            data-testid="chart-data-close"
            @click="closeDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="chart-data-editor__dialog-body">
          <section class="chart-data-editor__section">
            <div class="chart-data-editor__section-header">
              <div>
                <div class="chart-data-editor__section-title">{{ t('chart.dataEditor.sections.grid') }}</div>
                <p class="chart-data-editor__section-copy">{{ t('chart.dataEditor.help.grid') }}</p>
              </div>
              <div class="chart-data-editor__section-actions">
                <button
                  v-if="edit"
                  class="chart-data-editor__secondary-button"
                  type="button"
                  data-testid="chart-data-add-category"
                  :disabled="isReadOnly"
                  @click="addCategory"
                >
                  {{ t('chart.dataEditor.actions.addCategory') }}
                </button>
                <button
                  v-if="edit"
                  class="chart-data-editor__secondary-button"
                  type="button"
                  data-testid="chart-data-add-series"
                  :disabled="isReadOnly"
                  @click="addSeries"
                >
                  {{ t('chart.dataEditor.actions.addSeries') }}
                </button>
              </div>
            </div>

            <div class="chart-data-editor__table-wrap">
              <table class="chart-data-editor__table" data-testid="chart-data-table">
                <thead>
                  <tr>
                    <th>{{ t('chart.dataEditor.columns.series') }}</th>
                    <th v-for="(category, index) in draftData.xAxis" :key="\`category-head-\${index}\`">
                      <div class="chart-data-editor__category-head">
                        <input
                          class="chart-data-editor__input chart-data-editor__category-input"
                          :data-testid="\`chart-data-category-\${index}\`"
                          type="text"
                          :readonly="isReadOnly"
                          :value="category"
                          @input="setCategory(index, ($event.target as HTMLInputElement).value)"
                          @keydown.stop
                        />
                        <button
                          v-if="edit"
                          class="chart-data-editor__icon-button"
                          type="button"
                          :data-testid="\`chart-data-category-remove-\${index}\`"
                          :disabled="isReadOnly || draftData.xAxis.length <= 1"
                          @click="removeCategory(index)"
                        >
                          {{ t('chart.dataEditor.actions.removeShort') }}
                        </button>
                      </div>
                    </th>
                    <th>{{ t('chart.dataEditor.columns.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(series, seriesIndex) in draftData.series" :key="\`series-\${seriesIndex}\`">
                    <th>
                      <input
                        class="chart-data-editor__input chart-data-editor__series-input"
                        :data-testid="\`chart-data-series-name-\${seriesIndex}\`"
                        type="text"
                        :readonly="isReadOnly"
                        :value="series.name"
                        @input="setSeriesName(seriesIndex, ($event.target as HTMLInputElement).value)"
                        @keydown.stop
                      />
                    </th>
                    <td v-for="(_, dataIndex) in draftData.xAxis" :key="\`series-\${seriesIndex}-data-\${dataIndex}\`">
                      <input
                        class="chart-data-editor__input chart-data-editor__number-input"
                        :data-testid="\`chart-data-value-\${seriesIndex}-\${dataIndex}\`"
                        type="number"
                        step="any"
                        :readonly="isReadOnly"
                        :value="series.data[dataIndex] ?? '0'"
                        @input="setSeriesValue(seriesIndex, dataIndex, ($event.target as HTMLInputElement).value)"
                        @keydown.stop
                      />
                    </td>
                    <td>
                      <button
                        v-if="edit"
                        class="chart-data-editor__danger-button"
                        type="button"
                        :data-testid="\`chart-data-series-remove-\${seriesIndex}\`"
                        :disabled="isReadOnly || draftData.series.length <= 1"
                        @click="removeSeries(seriesIndex)"
                      >
                        {{ t('chart.dataEditor.actions.remove') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="validationMessage" class="chart-data-editor__error" data-testid="chart-data-error">
              {{ validationMessage }}
            </p>
          </section>

          <section class="chart-data-editor__section">
            <div class="chart-data-editor__section-header">
              <div>
                <div class="chart-data-editor__section-title">{{ t('chart.dataEditor.sections.preview') }}</div>
                <p class="chart-data-editor__section-copy">{{ t(\`chart.types.\${chartType}\`) }}</p>
              </div>
            </div>
            <div class="chart-data-editor__preview" data-testid="chart-data-preview">
              <svg v-if="chartType !== 'pie'" viewBox="0 0 360 118" role="img" class="chart-data-editor__svg-preview">
                <line x1="18" y1="96" x2="342" y2="96" class="chart-data-editor__axis" />
                <line x1="18" y1="18" x2="18" y2="96" class="chart-data-editor__axis" />
                <template v-if="chartType === 'bar'">
                  <template v-for="(series, seriesIndex) in previewData.series" :key="\`bar-series-\${seriesIndex}\`">
                    <rect
                      v-for="(value, dataIndex) in series.data"
                      :key="\`bar-\${seriesIndex}-\${dataIndex}\`"
                      :x="barX(seriesIndex, dataIndex)"
                      :y="96 - barHeight(value)"
                      :width="barWidth()"
                      :height="barHeight(value)"
                      :fill="previewColors[seriesIndex % previewColors.length]"
                      rx="2"
                    />
                  </template>
                </template>
                <template v-else>
                  <polyline
                    v-for="(series, seriesIndex) in previewData.series"
                    :key="\`line-\${seriesIndex}\`"
                    :points="linePoints(series)"
                    fill="none"
                    :stroke="previewColors[seriesIndex % previewColors.length]"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </template>
              </svg>
              <div v-else class="chart-data-editor__pie-preview">
                <div
                  v-for="(category, index) in previewData.xAxis"
                  :key="\`pie-\${category}-\${index}\`"
                  class="chart-data-editor__pie-row"
                >
                  <span
                    class="chart-data-editor__pie-swatch"
                    :style="{ backgroundColor: previewColors[index % previewColors.length] }"
                  ></span>
                  <span>{{ category }}</span>
                  <strong>{{ previewData.series[0]?.data[index] ?? 0 }}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="chart-data-editor__dialog-actions">
          <button
            class="chart-data-editor__secondary-button"
            type="button"
            data-testid="chart-data-cancel"
            @click="closeDialog"
          >
            {{ t('globalCalls.cancel') }}
          </button>
          <button
            v-if="edit"
            class="chart-data-editor__primary-button"
            type="button"
            data-testid="chart-data-save"
            :disabled="isReadOnly || Boolean(validationMessage)"
            @click="saveDraft"
          >
            {{ t('editor.saveContent') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.chart-data-editor {
  width: 100%;
  min-width: 0;
}

.chart-data-editor__trigger-row,
.chart-data-editor__section-header,
.chart-data-editor__dialog-header,
.chart-data-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chart-data-editor__summary,
.chart-data-editor__section-copy {
  color: rgb(100 116 139);
  font-size: 12px;
  line-height: 18px;
}

.chart-data-editor__primary-button,
.chart-data-editor__secondary-button,
.chart-data-editor__danger-button,
.chart-data-editor__icon-button {
  min-height: 32px;
  border: 1px solid rgb(191 219 254);
  border-radius: 8px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
}

.chart-data-editor__primary-button {
  border-color: rgb(37 99 235);
  background: rgb(37 99 235);
  color: white;
}

.chart-data-editor__danger-button {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

.chart-data-editor__icon-button {
  min-height: 26px;
  padding: 3px 7px;
}

.chart-data-editor__primary-button:disabled,
.chart-data-editor__secondary-button:disabled,
.chart-data-editor__danger-button:disabled,
.chart-data-editor__icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.chart-data-editor__dialog {
  width: min(960px, calc(100vw - 32px));
  max-height: min(760px, calc(100vh - 32px));
  padding: 0;
  overflow: hidden;
  border: 1px solid rgb(203 213 225);
  border-radius: 12px;
  background: white;
  color: rgb(15 23 42);
}

.chart-data-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.36);
}

.chart-data-editor__dialog-panel {
  display: flex;
  max-height: min(760px, calc(100vh - 32px));
  flex-direction: column;
}

.chart-data-editor__dialog-header,
.chart-data-editor__dialog-actions {
  flex: 0 0 auto;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.chart-data-editor__dialog-actions {
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.chart-data-editor__dialog-title,
.chart-data-editor__section-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 800;
  line-height: 20px;
}

.chart-data-editor__dialog-body {
  display: grid;
  min-height: 0;
  gap: 14px;
  overflow: auto;
  padding: 14px 16px;
}

.chart-data-editor__section {
  display: grid;
  gap: 10px;
}

.chart-data-editor__section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-data-editor__table-wrap {
  overflow: auto;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
}

.chart-data-editor__table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
}

.chart-data-editor__table th,
.chart-data-editor__table td {
  border-bottom: 1px solid rgb(226 232 240);
  border-right: 1px solid rgb(226 232 240);
  padding: 8px;
  vertical-align: top;
}

.chart-data-editor__table th {
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 800;
  text-align: left;
}

.chart-data-editor__table tr:last-child td,
.chart-data-editor__table tr:last-child th {
  border-bottom: 0;
}

.chart-data-editor__table th:last-child,
.chart-data-editor__table td:last-child {
  border-right: 0;
}

.chart-data-editor__category-head {
  display: grid;
  gap: 6px;
}

.chart-data-editor__input {
  width: 100%;
  min-height: 32px;
  min-width: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: white;
  color: rgb(15 23 42);
  font: inherit;
  font-size: 12px;
  padding: 6px 8px;
}

.chart-data-editor__series-input {
  min-width: 120px;
}

.chart-data-editor__number-input,
.chart-data-editor__category-input {
  min-width: 96px;
}

.chart-data-editor__error {
  margin: 0;
  color: rgb(220 38 38);
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
}

.chart-data-editor__preview {
  min-height: 136px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(248 250 252);
  padding: 10px;
}

.chart-data-editor__svg-preview {
  display: block;
  width: 100%;
  height: 136px;
}

.chart-data-editor__axis {
  stroke: rgb(148 163 184);
  stroke-width: 1.5;
}

.chart-data-editor__pie-preview {
  display: grid;
  gap: 6px;
}

.chart-data-editor__pie-row {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  align-items: center;
  gap: 8px;
  color: rgb(51 65 85);
  font-size: 12px;
}

.chart-data-editor__pie-swatch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.dark .chart-data-editor__dialog {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .chart-data-editor__dialog-header,
.dark .chart-data-editor__dialog-actions,
.dark .chart-data-editor__table th,
.dark .chart-data-editor__table td,
.dark .chart-data-editor__table-wrap,
.dark .chart-data-editor__preview {
  border-color: rgb(51 65 85);
}

.dark .chart-data-editor__table th,
.dark .chart-data-editor__preview {
  background: rgb(30 41 59);
}

.dark .chart-data-editor__dialog-title,
.dark .chart-data-editor__section-title,
.dark .chart-data-editor__table th,
.dark .chart-data-editor__pie-row {
  color: rgb(226 232 240);
}

.dark .chart-data-editor__summary,
.dark .chart-data-editor__section-copy {
  color: rgb(148 163 184);
}

.dark .chart-data-editor__input {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
`,z=`<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';

import {
  cloneJsonSchema,
  cloneJsonValue,
  flattenSchemaTree,
  getSchemaSelectionFields,
  getSchemaTreeNodes,
  inferJSONSchema,
  isJsonObjectValue,
  isJsonValue,
  normalizeSchemaSelections,
  reconcileSchemaSelections,
  type DatasourceSchemaSelections,
  type JSONSchema,
  type JsonValue,
  type SchemaSelectionField,
  type SchemaTreeNode
} from 'mokelay-components/datasource';
import {
  $remote as resolveDatasourceRemote,
  DatasourceError,
  bodyDataTypes,
  getDefaultApiDatasource,
  getDefaultBodyValue,
  normalizeBodyDataType,
  normalizeBodyFileValue,
  normalizeBodyValue,
  normalizeDatasource,
  normalizeDatasourceExternalFields,
  normalizeDatasourceMatchingExternalFields,
  normalizeMethod,
  type DatasourceRequestOptions,
  type MDatasourceApiObject,
  type MDatasourceBodyDataType,
  type MDatasourceBodyFileValue,
  type MDatasourceBodyItem,
  type MDatasourceExternalField,
  type MDatasourceMatchingExternalField,
  type MDatasourceKeyValueItem
} from 'mokelay-components/datasource';

export type {
  DatasourceSchemaSelections,
  JSONSchema,
  JsonValue,
  MDatasourceApiMethod,
  MDatasourceApiObject,
  MDatasourceBodyDataType,
  MDatasourceBodyFileValue,
  MDatasourceBodyItem,
  MDatasourceExternalField,
  MDatasourceMatchingExternalField,
  MDatasourceKeyValueItem
} from 'mokelay-components/datasource';
export {
  normalizeDatasource,
  normalizeDatasourceExternalFields,
  normalizeDatasourceMatchingExternalFields
} from 'mokelay-components/datasource';
export type { SchemaSelectionField } from 'mokelay-components/datasource';

export interface MDatasourceEditorProps {
  edit: boolean;
  currentBlockId?: string;
  getAvailableBlockDataSources?: import('mokelay-components/runtime').GetAvailableBlockDataSources;
  getAvailablePageVariableSources?: import('mokelay-components/runtime').GetAvailablePageVariableSources;
  value?: MDatasourceApiObject;
  matchingExternalFields?: MDatasourceExternalField[];
  showPageBreak?: boolean;
}

export type MDatasourceEditorRuntimeData = {
  rawResponse?: JsonValue;
  data?: JsonValue;
  page: number;
  pageSize: number;
  total: number;
};

function normalizeApiDatasource(value: unknown): MDatasourceApiObject {
  const normalized = normalizeDatasource(value);
  return normalized.type === 'API' ? normalized : getDefaultApiDatasource();
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MDatasourceEditor",
 *   "displayName": "数据源编辑器",
 *   "category": "data",
 *   "description": "数据源编辑器，用于配置静态数据、变量或接口数据源，并规范化请求参数和分页设置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MDatasourceEditor",
 *     "toolSymbol": "mDatasourceEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 150
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "数据源编辑器",
 *       "en": "Datasource Editor"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><ellipse cx=\\"12\\" cy=\\"6\\" rx=\\"7\\" ry=\\"3\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12c1.1.5 2.5.8 4 .8s2.9-.3 4-.8\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": {
 *       "type": "API",
 *       "domain": "mokelay",
 *       "path": "",
 *       "method": "GET",
 *       "headerData": [],
 *       "bodyData": [],
 *       "queryData": []
 *     }
 *   },
 *   "properties": [
 *     {
 *       "key": "getAvailablePageVariableSources",
 *       "optional": true,
 *       "tsType": "import('mokelay-components/runtime').GetAvailablePageVariableSources",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MDatasourceEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "可用页面变量来源"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MDatasourceApiObject",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MDatasourceEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "数据源配置"
 *     },
 *     {
 *       "key": "matchingExternalFields",
 *       "optional": true,
 *       "tsType": "MDatasourceExternalField[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MDatasourceEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "匹配外部字段"
 *     },
 *     {
 *       "key": "showPageBreak",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MDatasourceEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "显示分页"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MDatasourceEditor.vue",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MDatasourceEditor-example",
 *       "type": "MDatasourceEditor",
 *       "data": {
 *         "value": {
 *           "type": "API",
 *           "domain": "mokelay",
 *           "path": "",
 *           "method": "GET",
 *           "headerData": [],
 *           "bodyData": [],
 *           "queryData": []
 *         }
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MDatasourceEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MDatasourceEditor.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mDatasourceEditorTool = defineEditorTool<MDatasourceEditorProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    value: normalizeApiDatasource(props.value),
    matchingExternalFields: normalizeDatasourceExternalFields(props.matchingExternalFields),
    showPageBreak: props.showPageBreak === true
  }),
  serialize: (props) => ({
    value: normalizeApiDatasource(props.value)
  })
});
<\/script>

<script setup lang="ts">
import { computed, inject, reactive, ref, shallowRef, triggerRef, watch } from 'vue';
import { useI18n } from '@/i18n';
import JsonTreeView from '@/editors/components/JsonTreeView.vue';
import MVariableValueEditor from '@/editors/blocks/MVariableValueEditor.vue';
import DatasourceApiImportDialog, {
  type DatasourceApiImportSource
} from '@/editors/dialogs/DatasourceApiImportDialog.vue';
import DatasourceResponseMockDialog, {
  type DatasourceResponseMockCapturePayload
} from '@/editors/dialogs/DatasourceResponseMockDialog.vue';
import { useEditorBlockToolbarAlignment } from '@/composables/useEditorBlockToolbarAlignment';
import {
  DEFAULT_API_DOMAIN_UUID,
  type ApiDomainRecord,
  getDefaultApiDomainUuid,
  listApiDomains,
  normalizeApiDomainUuid
} from 'mokelay-components/datasource';
import type { ImportedApiDatasource } from '@/utils/datasourceApiImport';
import { translateTextsToChinese } from '@/utils/translationsApi';
import ProcessorConfigDialog from '@/processors/components/ProcessorConfigDialog.vue';
import ProcessorPreviewDialog from '@/processors/components/ProcessorPreviewDialog.vue';
import {
  getProcessorDefinition,
  normalizeProcessors,
  processorName,
  type ProcessorConfig
} from 'mokelay-components/processors';
import { resolveDatasourceRuntimeData } from 'mokelay-components/datasource';
import { PreviewBlockRuntimeKey } from 'mokelay-components/runtime';
import { PageRuntimeVariableContextKey } from 'mokelay-components/pages';
import {
  isVariableValueConfig,
  stringifyVariableValue,
  type BlockDataSource,
  type PageVariableSource,
  type VariableOption,
  type VariableValueConfig,
  type VariableValueResolveContext
} from 'mokelay-components/runtime';

type KeyValueListName = 'headerData' | 'queryData';
type BodyValueParseResult = {
  ok: true;
  value: JsonValue | VariableValueConfig;
} | {
  ok: false;
  error: string;
};
type ApiStateBodyItem = Omit<MDatasourceBodyItem, 'value'> & {
  value: unknown;
};
type ApiState = Omit<MDatasourceApiObject, 'bodyData' | 'schemaSelections' | 'matchingExternalFields'> & {
  bodyData: ApiStateBodyItem[];
};
type ResponseExampleState = {
  id: number;
  value?: JsonValue;
  text: string;
  error: string;
  loading: boolean;
};
type SchemaFieldSource = 'list' | 'form';
type SchemaDataTypeFilter = 'all' | Extract<SchemaSelectionField['type'], 'string' | 'number' | 'boolean' | 'object' | 'array'>;
type CombinedSchemaSelectionField = SchemaSelectionField & {
  source: SchemaFieldSource;
  selected: boolean;
};
const props = defineProps<MDatasourceEditorProps & {
  onChange?: (payload: MDatasourceEditorProps) => void;
  onToolChange?: (payload: MDatasourceEditorProps) => void;
}>();

const { t } = useI18n();
const previewRuntime = inject(PreviewBlockRuntimeKey, null);
const pageVariableContext = inject(PageRuntimeVariableContextKey, computed<VariableValueResolveContext>(() => ({})));
const rootRef = ref<HTMLElement | null>(null);
const normalizedInitialValue = normalizeApiDatasource(props.value);
const bodyDataTypeOptions = bodyDataTypes;
const jsonSchemaValue = shallowRef<JSONSchema | undefined>();
const jsonSchemaError = ref('');
const schemaSelectionsValue = shallowRef<DatasourceSchemaSelections>(normalizeSchemaSelections(normalizedInitialValue.schemaSelections));
const matchingExternalFieldsValue = shallowRef<MDatasourceMatchingExternalField[]>(
  createMatchingExternalFieldsState(normalizedInitialValue.matchingExternalFields)
);
const schemaTranslationLoading = ref(false);
const schemaTranslationError = ref('');
const processorFieldPath = ref<string | null>(null);
const processorPreviewFieldPath = ref<string | null>(null);
const shouldRestoreSettingsAfterProcessorDialog = ref(false);
const shouldRestoreSettingsAfterProcessorPreviewDialog = ref(false);
let responseExampleId = 0;
const responseExamples = shallowRef<ResponseExampleState[]>(createResponseExampleStates());
const schemaDataTypeFilter = ref<SchemaDataTypeFilter>('all');
const schemaPathDepth = ref(1);
const schemaSearch = ref('');
const apiState = reactive<ApiState>(normalizedInitialValue);
const bodyValueInputs = ref<string[]>(apiState.bodyData.map((item) => getBodyValueInput(item)));
const bodyValueErrors = ref<string[]>(apiState.bodyData.map(() => ''));
const bodyFileInputs = ref<Array<File | undefined>>(apiState.bodyData.map(() => undefined));
const apiDomainOptions = ref<ApiDomainRecord[]>([]);
const apiDomainLoading = ref(false);
const apiDomainError = ref('');
const hasLoadedApiDomains = ref(false);
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const apiImportSource = ref<DatasourceApiImportSource>('mokelay');
const isApiImportDialogOpen = ref(false);
const fullSchemaDialogRef = ref<HTMLDialogElement | null>(null);
const isFullSchemaDialogOpen = ref(false);
const fullSchemaText = ref('');
const fullSchemaError = ref('');
const isResponseMockDialogOpen = ref(false);
const responseMockTargetIndex = ref<number | null>(null);
const responseMockError = ref('');
const runtimeData = shallowRef<MDatasourceEditorRuntimeData>({
  page: 1,
  pageSize: 10,
  total: 0
});
const isReadOnly = computed(() => !props.edit);
const configuredMatchingExternalFields = computed(() => normalizeDatasourceExternalFields(props.matchingExternalFields));
const variableOptions = computed<VariableOption[]>(() => {
  const variablesByName = new Map<string, VariableOption>();
  [...configuredMatchingExternalFields.value, ...matchingExternalFieldsValue.value].forEach((field) => {
    if (variablesByName.has(field.variable)) return;
    variablesByName.set(field.variable, {
      name: field.variable,
      label: field.label,
      type: field.type ?? 'string'
    });
  });
  return [...variablesByName.values()];
});
const blockDataSources = computed<BlockDataSource[]>(() => props.getAvailableBlockDataSources?.() ?? []);
const pageVariableSources = computed<PageVariableSource[]>(() => props.getAvailablePageVariableSources?.() ?? []);
const hasMatchingExternalFields = computed(() => configuredMatchingExternalFields.value.length > 0);
const schemaTree = computed(() => getSchemaTreeNodes(jsonSchemaValue.value));
const flattenedSchemaNodes = computed(() => flattenSchemaTree(schemaTree.value));
const generatedSelectionFields = computed(() => getSchemaSelectionFields(jsonSchemaValue.value));
const combinedSelectionFields = computed<CombinedSchemaSelectionField[]>(() => {
  const selectedPaths = new Set(schemaSelectionsValue.value.map((field) => field.path));
  return generatedSelectionFields.value.map((field) => {
    const source: SchemaFieldSource = field.path.includes('[]') ? 'list' : 'form';
    return {
      ...field,
      selected: selectedPaths.has(field.path),
      source
    };
  });
});
const visibleSelectionFields = computed(() => filterSelectionFields(
  combinedSelectionFields.value,
  schemaSearch.value,
  schemaDataTypeFilter.value,
  schemaPathDepth.value
));
const enabledFieldCount = computed(() => schemaSelectionsValue.value.length);
const unmatchedExternalFieldCount = computed(() =>
  matchingExternalFieldsValue.value.filter((field) => !field.matchFieldPath).length
);
const processorField = computed(() => schemaSelectionsValue.value.find((field) => field.path === processorFieldPath.value));
const processorPreviewField = computed(() => schemaSelectionsValue.value.find((field) => field.path === processorPreviewFieldPath.value));
const processorPreviewExamples = computed(() => responseExamples.value.map((example) => ({
  id: example.id,
  value: example.value,
  error: example.error
})));
const isResponseCaptureBusy = computed(() => responseExamples.value.some((item) => item.loading));
const isApiDomainSelectDisabled = computed(() => isReadOnly.value || apiDomainLoading.value || !apiDomainOptions.value.length);
const datasourceSummaryDomain = computed(() => {
  const rawDomain = apiState.domain.trim();
  if (!rawDomain) {
    return t('datasource.summary.emptyDomain');
  }

  const matchedDomain = apiDomainOptions.value.find((domain) => domain.uuid === rawDomain);
  return matchedDomain ? \`\${matchedDomain.alias} (\${matchedDomain.host})\` : rawDomain;
});
const datasourceSummaryPath = computed(() => apiState.path.trim() || t('datasource.summary.emptyPath'));
const datasourceSummaryMethod = computed(() => apiState.method || t('datasource.summary.emptyMethod'));
const apiDomainEmptyOptionText = computed(() => {
  if (apiDomainLoading.value) {
    return t('datasource.import.loadingApiDomains');
  }

  return apiDomainError.value || t('datasource.import.emptyApiDomains');
});
const responseMockBodyEntries = computed(() => apiState.bodyData
  .map((item, index) => ({ item, index }))
  .filter(({ item }) => item.key.trim()));
const responseMockHeaderData = computed(() => apiState.headerData
  .filter((item) => item.key.trim())
  .map((item) => ({ ...item })));
const responseMockQueryData = computed(() => apiState.queryData
  .filter((item) => item.key.trim())
  .map((item) => ({ ...item })));
const responseMockBodyData = computed<MDatasourceBodyItem[]>(() => responseMockBodyEntries.value.map(({ item }) => ({
  key: item.key,
  dataType: item.dataType,
  value: normalizeBodyValue(item.dataType, item.value)
})));
const responseMockBodyFiles = computed(() => responseMockBodyEntries.value.map(({ index }) => bodyFileInputs.value[index]));

useEditorBlockToolbarAlignment(rootRef);

function formatJsonValue(value: JsonValue) {
  return JSON.stringify(value, null, 2);
}

function formatOptionalJsonValue(value?: JsonValue) {
  return value === undefined ? '' : formatJsonValue(value);
}

function createResponseExampleState(value?: JsonValue): ResponseExampleState {
  const clonedValue = value === undefined ? undefined : cloneJsonValue(value);
  return {
    id: responseExampleId++,
    value: clonedValue,
    text: formatOptionalJsonValue(clonedValue),
    error: '',
    loading: false
  };
}

function createResponseExampleStates(values?: JsonValue[]) {
  return values?.length
    ? values.map((value) => createResponseExampleState(value))
    : [];
}

function formatJsonSchema(value?: JSONSchema) {
  return value ? JSON.stringify(value, null, 2) : '';
}

function getSchemaTypeLabel(type: SchemaTreeNode['type'] | SchemaSelectionField['type']) {
  return t(\`datasource.schemaTypes.\${type}\`);
}

function getProcessorLabel(processor: ProcessorConfig) {
  const name = processorName(processor);
  const definition = getProcessorDefinition(name);
  return definition ? t(definition.titleKey) : name;
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function normalizePositiveIntegerValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : fallback;
  const normalized = Math.trunc(parsed);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

function normalizeNonNegativeIntegerValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : fallback;
  const normalized = Math.trunc(parsed);
  return Number.isFinite(normalized) && normalized >= 0 ? normalized : fallback;
}

function getSchemaPathDepth(path: string) {
  return path.split('.').filter(Boolean).length || 1;
}

function updateSchemaPathDepth(event: Event) {
  // Editor.js treats non-InputEvent input events as mutation arrays. Number
  // steppers can emit a plain Event, so keep it away from that listener.
  event.stopImmediatePropagation();
  const numericValue = Number((event.target as HTMLInputElement).value);
  if (!Number.isFinite(numericValue)) {
    schemaPathDepth.value = 1;
    return;
  }

  schemaPathDepth.value = Math.min(10, Math.max(1, Math.round(numericValue)));
}

function filterSelectionFields(
  fields: CombinedSchemaSelectionField[],
  searchValue: string,
  dataTypeFilter: SchemaDataTypeFilter,
  pathDepth: number
) {
  const normalizedSearchValue = normalizeSearchValue(searchValue);
  return fields.filter((field) =>
    (dataTypeFilter === 'all' || field.type === dataTypeFilter) &&
    getSchemaPathDepth(field.path) <= pathDepth &&
    (!normalizedSearchValue || field.path.toLowerCase().includes(normalizedSearchValue))
  );
}

function reconcileMatchingExternalFieldMatches(fields: MDatasourceMatchingExternalField[]) {
  const selectedFieldPaths = new Set(schemaSelectionsValue.value.map((field) => field.path));
  return fields.map((field) => ({
    ...field,
    matchFieldPath: field.matchFieldPath && selectedFieldPaths.has(field.matchFieldPath)
      ? field.matchFieldPath
      : ''
  }));
}

function createMatchingExternalFieldsState(
  value: unknown,
  externalFields = normalizeDatasourceExternalFields(props.matchingExternalFields)
): MDatasourceMatchingExternalField[] {
  const savedFields = normalizeDatasourceMatchingExternalFields(value);
  if (!externalFields.length) {
    return reconcileMatchingExternalFieldMatches(savedFields);
  }

  const savedFieldsByVariable = new Map(savedFields.map((field) => [field.variable, field]));
  return reconcileMatchingExternalFieldMatches(externalFields.map((field) => ({
    label: field.label,
    variable: field.variable,
    matchFieldPath: savedFieldsByVariable.get(field.variable)?.matchFieldPath ?? ''
  })));
}

function syncMatchingExternalFields(value: unknown) {
  matchingExternalFieldsValue.value = createMatchingExternalFieldsState(value);
}

function getSerializableMatchingExternalFields() {
  const configuredFields = configuredMatchingExternalFields.value;
  if (!configuredFields.length) {
    return normalizeDatasourceMatchingExternalFields(matchingExternalFieldsValue.value);
  }

  return createMatchingExternalFieldsState(matchingExternalFieldsValue.value, configuredFields);
}

function updateMatchingExternalFieldMatch(variable: string, matchFieldPath: string) {
  if (!props.edit) return;

  const selectedFieldPaths = new Set(schemaSelectionsValue.value.map((field) => field.path));
  const normalizedMatchFieldPath = selectedFieldPaths.has(matchFieldPath) ? matchFieldPath : '';
  matchingExternalFieldsValue.value = matchingExternalFieldsValue.value.map((field) => (
    field.variable === variable
      ? {
          ...field,
          matchFieldPath: normalizedMatchFieldPath
        }
      : field
  ));
  emitCurrentDatasource();
}

function getDatasourcePayload(value: MDatasourceApiObject): MDatasourceEditorProps {
  return {
    edit: props.edit,
    value: normalizeApiDatasource(value),
    matchingExternalFields: configuredMatchingExternalFields.value,
    showPageBreak: props.showPageBreak === true
  };
}

function emitDatasource(value: MDatasourceApiObject) {
  if (!props.edit) return;

  const payload = getDatasourcePayload(value);
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function buildApiDatasource(): MDatasourceApiObject {
  const matchingExternalFields = getSerializableMatchingExternalFields();
  return normalizeApiDatasource({
    type: 'API',
    domain: apiState.domain,
    path: apiState.path,
    method: apiState.method,
    headerData: apiState.headerData,
    bodyData: apiState.bodyData,
    queryData: apiState.queryData,
    schemaSelections: schemaSelectionsValue.value,
    ...(matchingExternalFields.length ? { matchingExternalFields } : {})
  });
}

function emitCurrentDatasource() {
  emitApiChange();
}

function emitApiChange() {
  emitDatasource(buildApiDatasource());
}

function getMatchedRuntimeValue(fields: Array<{ variable: string; value?: JsonValue }>, variable: string) {
  return fields.find((field) => field.variable === variable)?.value;
}

function normalizeDatasourceEditorRuntimeData(
  rawResponse: JsonValue,
  fields: Array<{ variable: string; value?: JsonValue }>
): MDatasourceEditorRuntimeData {
  const data = getMatchedRuntimeValue(fields, 'data');
  return {
    rawResponse,
    data,
    page: normalizePositiveIntegerValue(getMatchedRuntimeValue(fields, 'page'), 1),
    pageSize: normalizePositiveIntegerValue(getMatchedRuntimeValue(fields, 'pageSize'), 10),
    total: normalizeNonNegativeIntegerValue(getMatchedRuntimeValue(fields, 'total'), 0)
  };
}

async function getData() {
  const blocks = await previewRuntime?.getBlockDataContext(props.currentBlockId);
  const resolvedData = await resolveDatasourceRuntimeData(buildApiDatasource(), {
    variableContext: {
      ...pageVariableContext.value,
      ...(blocks ? { blocks } : {})
    }
  });
  const normalizedRuntimeData = normalizeDatasourceEditorRuntimeData(
    resolvedData.rawResponse,
    resolvedData.matchingExternalFieldData
  );
  runtimeData.value = normalizedRuntimeData;
  return normalizedRuntimeData;
}

function getBodyFileValue(file: File): MDatasourceBodyFileValue {
  return {
    name: file.name,
    size: file.size,
    type: file.type
  };
}

function isSameBodyFileValue(file: File, value: unknown) {
  const normalizedValue = normalizeBodyFileValue(value);
  return normalizedValue.name === file.name &&
    normalizedValue.size === file.size &&
    normalizedValue.type === file.type;
}

function syncBodyValueInputs() {
  const previousBodyFileInputs = bodyFileInputs.value;
  bodyValueInputs.value = apiState.bodyData.map((item) => getBodyValueInput(item));
  bodyValueErrors.value = apiState.bodyData.map(() => '');
  bodyFileInputs.value = apiState.bodyData.map((item, index) => {
    const previousFile = previousBodyFileInputs[index];
    return item.dataType === 'file' && previousFile && isSameBodyFileValue(previousFile, item.value)
      ? previousFile
      : undefined;
  });
}

function syncTransientSchemaState(selections?: DatasourceSchemaSelections, examples?: JsonValue[]) {
  jsonSchemaValue.value = undefined;
  schemaSelectionsValue.value = normalizeSchemaSelections(selections);
  responseExamples.value = createResponseExampleStates(examples);
  jsonSchemaError.value = '';
  schemaTranslationError.value = '';
  processorFieldPath.value = null;
  processorPreviewFieldPath.value = null;
}

function syncApiState(value: MDatasourceApiObject) {
  Object.assign(apiState, {
    type: 'API' as const,
    domain: value.domain,
    path: value.path,
    method: value.method,
    headerData: value.headerData.map((item) => ({ ...item })),
    bodyData: value.bodyData.map((item) => ({
      key: item.key,
      dataType: item.dataType,
      value: normalizeBodyValue(item.dataType, item.value)
    })),
    queryData: value.queryData.map((item) => ({ ...item }))
  });
  syncBodyValueInputs();
}

function normalizeApiDomainState(shouldEmit = props.edit) {
  if (!apiDomainOptions.value.length) {
    return;
  }

  const currentDomain = apiState.domain;
  const normalizedDomain = normalizeApiDomainUuid(currentDomain, apiDomainOptions.value);
  const nextDomain = normalizedDomain ||
    (isDefaultBlankApiState() ? getDefaultApiDomainUuid(apiDomainOptions.value) : '');

  if (nextDomain === currentDomain) {
    return;
  }

  apiState.domain = nextDomain;

  if (shouldEmit) {
    emitApiChange();
  }
}

async function ensureApiDomainOptions(force = false) {
  if (!force && hasLoadedApiDomains.value) {
    return;
  }

  apiDomainLoading.value = true;
  apiDomainError.value = '';

  try {
    apiDomainOptions.value = await listApiDomains(force);
    hasLoadedApiDomains.value = true;
    normalizeApiDomainState();
  } catch (error) {
    apiDomainError.value = error instanceof Error ? error.message : String(error);
  } finally {
    apiDomainLoading.value = false;
  }
}

function isDefaultBlankApiState() {
  return apiState.domain === DEFAULT_API_DOMAIN_UUID &&
    !apiState.path.trim() &&
    !apiState.headerData.length &&
    !apiState.bodyData.length &&
    !apiState.queryData.length;
}

function applyImportedApiDatasource(imported: ImportedApiDatasource) {
  syncApiState(imported.datasource);
  syncTransientSchemaState(imported.datasource.schemaSelections, imported.responseExamples);
  syncMatchingExternalFields(imported.datasource.matchingExternalFields);
  emitApiChange();
}

function openSettingsDialog() {
  isSettingsDialogOpen.value = true;
  if (!settingsDialogRef.value?.open) {
    settingsDialogRef.value?.showModal();
  }
}

function closeSettingsDialog() {
  isSettingsDialogOpen.value = false;
  if (settingsDialogRef.value?.open) {
    settingsDialogRef.value.close();
  }
}

function captureSettingsDialogRestoreState() {
  const shouldRestore = isSettingsDialogOpen.value;
  if (shouldRestore) {
    closeSettingsDialog();
  }
  return shouldRestore;
}

function restoreSettingsDialog(shouldRestore: boolean) {
  if (shouldRestore) {
    openSettingsDialog();
  }
}

function setApiImportSource(value: DatasourceApiImportSource) {
  if (!props.edit) return;

  apiImportSource.value = value;
}

function openApiImportDialog(source: DatasourceApiImportSource) {
  if (!props.edit) return;

  setApiImportSource(source);
  isApiImportDialogOpen.value = true;
}

function closeApiImportDialog() {
  isApiImportDialogOpen.value = false;
}

function openFullSchemaDialog(index: number) {
  const item = responseExamples.value[index];
  fullSchemaText.value = '';
  fullSchemaError.value = '';

  if (!item || item.value === undefined) {
    fullSchemaError.value = item?.error || t('datasource.validation.missingResponseExample');
  } else if (item.error) {
    fullSchemaError.value = item.error;
  } else {
    try {
      fullSchemaText.value = formatJsonSchema(inferDatasourceSchemaFromData(item.value));
    } catch (error) {
      fullSchemaError.value = getDatasourceErrorMessage(error);
    }
  }

  isFullSchemaDialogOpen.value = true;
  if (!fullSchemaDialogRef.value?.open) {
    fullSchemaDialogRef.value?.showModal();
  }
}

function closeFullSchemaDialog() {
  isFullSchemaDialogOpen.value = false;
  fullSchemaText.value = '';
  fullSchemaError.value = '';
  if (fullSchemaDialogRef.value?.open) {
    fullSchemaDialogRef.value.close();
  }
}

function syncLocalState(value: unknown) {
  const normalized = normalizeApiDatasource(value);
  syncTransientSchemaState(normalized.schemaSelections);
  syncApiState(normalized);
  syncMatchingExternalFields(normalized.matchingExternalFields);
  normalizeApiDomainState();
}

function updateApiField(field: 'domain' | 'path', value: string) {
  if (!props.edit) return;

  apiState[field] = value;
  emitApiChange();
}

function updateApiMethod(value: string) {
  if (!props.edit) return;

  apiState.method = normalizeMethod(value);
  emitApiChange();
}

function getKeyValueList(listName: KeyValueListName) {
  return apiState[listName];
}

function addKeyValueItem(listName: KeyValueListName) {
  if (!props.edit) return;

  apiState[listName].push({
    key: '',
    value: ''
  });
  emitApiChange();
}

function updateKeyValueItem(
  listName: KeyValueListName,
  index: number,
  field: keyof MDatasourceKeyValueItem,
  value: string | VariableValueConfig
) {
  if (!props.edit) return;

  const item = apiState[listName][index];
  if (!item) return;

  if (field === 'key') {
    item.key = typeof value === 'string' ? value : stringifyVariableValue(value);
  } else {
    item.value = value;
  }
  emitApiChange();
}

function removeKeyValueItem(listName: KeyValueListName, index: number) {
  if (!props.edit) return;

  apiState[listName].splice(index, 1);
  emitApiChange();
}

function addBodyItem() {
  if (!props.edit) return;

  const item: ApiStateBodyItem = {
    key: '',
    dataType: 'string',
    value: ''
  };
  apiState.bodyData.push(item);
  bodyValueInputs.value.push(getBodyValueInput(item));
  bodyValueErrors.value.push('');
  bodyFileInputs.value.push(undefined);
  emitApiChange();
}

function updateBodyKey(index: number, value: string) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  item.key = value;
  emitApiChange();
}

function updateBodyDataType(index: number, value: string) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  item.dataType = normalizeBodyDataType(value);
  item.value = getDefaultBodyValue(item.dataType);
  bodyValueInputs.value[index] = getBodyValueInput(item);
  bodyValueErrors.value[index] = '';
  bodyFileInputs.value[index] = undefined;
  emitApiChange();
}

function updateBodyValue(index: number, inputValue: string) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  bodyValueInputs.value[index] = inputValue;
  const parsed = parseBodyValue(item.dataType, inputValue);
  if (!parsed.ok) {
    bodyValueErrors.value[index] = parsed.error;
    return;
  }

  item.value = parsed.value;
  bodyValueErrors.value[index] = '';
  emitApiChange();
}

function updateBodyVariableValue(index: number, value: unknown) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item) return;

  if (isVariableValueConfig(value)) {
    item.value = value;
    bodyValueInputs.value[index] = stringifyVariableValue(value);
    bodyValueErrors.value[index] = '';
    emitApiChange();
    return;
  }

  updateBodyValue(index, typeof value === 'string' ? value : stringifyVariableValue(value));
}

function updateBodyFile(index: number, file?: File) {
  if (!props.edit) return;

  const item = apiState.bodyData[index];
  if (!item || item.dataType !== 'file') return;

  bodyFileInputs.value[index] = file;
  item.value = file ? getBodyFileValue(file) : getDefaultBodyValue('file');
  bodyValueInputs.value[index] = getBodyValueInput(item);
  bodyValueErrors.value[index] = '';
  emitApiChange();
}

function removeBodyItem(index: number) {
  if (!props.edit) return;

  apiState.bodyData.splice(index, 1);
  bodyValueInputs.value.splice(index, 1);
  bodyValueErrors.value.splice(index, 1);
  bodyFileInputs.value.splice(index, 1);
  emitApiChange();
}

function getDatasourceErrorMessage(error: unknown) {
  if (error instanceof DatasourceError) {
    if (error.code === 'apiRequestFailed') {
      return \`\${t('datasource.validation.apiRequestFailed')} \${error.status ?? ''} \${error.statusText ?? ''}\`.trim();
    }

    return t(\`datasource.validation.\${error.code}\`);
  }

  return error instanceof Error ? error.message : String(error);
}

function applySelectedResponseSchema(schema: JSONSchema) {
  jsonSchemaValue.value = cloneJsonSchema(schema);
  schemaSelectionsValue.value = reconcileSchemaSelections(jsonSchemaValue.value, schemaSelectionsValue.value);
  syncMatchingExternalFields(matchingExternalFieldsValue.value);
  jsonSchemaError.value = '';
  emitCurrentDatasource();
}

function addResponseExample() {
  if (!props.edit) return;
  responseExamples.value.push(createResponseExampleState());
  triggerRef(responseExamples);
}

function removeResponseExample(index: number) {
  if (!props.edit) return;
  responseExamples.value.splice(index, 1);
  triggerRef(responseExamples);
}

function applyResponseExample(index: number, value: JsonValue) {
  const item = responseExamples.value[index];
  if (!item) return;

  item.value = cloneJsonValue(value);
  item.text = formatJsonValue(item.value);
  item.error = '';
  triggerRef(responseExamples);
}

function handleResponseExampleInput(index: number, event: Event) {
  if (!props.edit) return;

  const item = responseExamples.value[index];
  if (!item) return;

  const nextText = (event.target as HTMLTextAreaElement).value;
  item.text = nextText;

  if (!nextText.trim()) {
    item.value = undefined;
    item.error = '';
    triggerRef(responseExamples);
    return;
  }

  try {
    const parsed = JSON.parse(nextText) as unknown;
    if (!isJsonValue(parsed)) {
      throw new Error('Invalid JSON response example.');
    }

    item.value = cloneJsonValue(parsed);
    item.error = '';
    triggerRef(responseExamples);
  } catch {
    item.error = t('datasource.validation.invalidResponseExample');
    triggerRef(responseExamples);
  }
}

function inferDatasourceSchemaFromData(data: JsonValue) {
  const inferredSchema = inferJSONSchema(data);
  if (inferredSchema.ok) {
    return inferredSchema.schema;
  }

  if (inferredSchema.reason === 'emptyArray') {
    throw new DatasourceError('emptyArraySchema', 'Cannot infer JSON Schema from an empty array.');
  }

  throw new DatasourceError('mixedArraySchema', 'The array contains incompatible types, so JSON Schema cannot be inferred.');
}

function addSchemaSelection(path: string) {
  if (!props.edit) return;

  const currentSelections = normalizeSchemaSelections(schemaSelectionsValue.value);
  const field = generatedSelectionFields.value.find((item) => item.path === path);
  if (!field || currentSelections.some((item) => item.path === path)) return;

  schemaSelectionsValue.value = [
    ...currentSelections,
    {
      label: field.label,
      path: field.path,
      type: field.type
    }
  ];
  schemaTranslationError.value = '';
  emitCurrentDatasource();
}

function removeSchemaSelection(path: string) {
  if (!props.edit) return;

  const nextSelections = normalizeSchemaSelections(schemaSelectionsValue.value)
    .filter((field) => field.path !== path);
  if (nextSelections.length === schemaSelectionsValue.value.length) return;

  schemaSelectionsValue.value = nextSelections;
  syncMatchingExternalFields(matchingExternalFieldsValue.value);
  if (processorFieldPath.value === path) {
    processorFieldPath.value = null;
  }
  if (processorPreviewFieldPath.value === path) {
    processorPreviewFieldPath.value = null;
  }
  schemaTranslationError.value = '';
  emitCurrentDatasource();
}

function openProcessorDialog(path: string) {
  shouldRestoreSettingsAfterProcessorDialog.value = captureSettingsDialogRestoreState();
  processorFieldPath.value = path;
}

function closeProcessorDialog() {
  const shouldRestore = shouldRestoreSettingsAfterProcessorDialog.value;
  processorFieldPath.value = null;
  shouldRestoreSettingsAfterProcessorDialog.value = false;
  restoreSettingsDialog(shouldRestore);
}

function openProcessorPreviewDialog(path: string) {
  shouldRestoreSettingsAfterProcessorPreviewDialog.value = captureSettingsDialogRestoreState();
  processorPreviewFieldPath.value = path;
}

function closeProcessorPreviewDialog() {
  const shouldRestore = shouldRestoreSettingsAfterProcessorPreviewDialog.value;
  processorPreviewFieldPath.value = null;
  shouldRestoreSettingsAfterProcessorPreviewDialog.value = false;
  restoreSettingsDialog(shouldRestore);
}

function applyFieldProcessors(processors: ProcessorConfig[]) {
  const path = processorFieldPath.value;
  if (!path || !props.edit) return;

  const normalizedProcessors = normalizeProcessors(processors);
  schemaSelectionsValue.value = schemaSelectionsValue.value.map((field) => (
    field.path === path
      ? {
          ...field,
          ...(normalizedProcessors.length ? { processors: normalizedProcessors } : { processors: undefined })
        }
      : field
  ));
  const shouldRestore = shouldRestoreSettingsAfterProcessorDialog.value;
  processorFieldPath.value = null;
  shouldRestoreSettingsAfterProcessorDialog.value = false;
  emitCurrentDatasource();
  restoreSettingsDialog(shouldRestore);
}

async function translateSchemaSelectionLabels() {
  if (!props.edit || schemaTranslationLoading.value || !schemaSelectionsValue.value.length) return;

  schemaTranslationLoading.value = true;
  schemaTranslationError.value = '';
  try {
    const translations = await translateTextsToChinese(
      schemaSelectionsValue.value.map((field) => field.label)
    );
    schemaSelectionsValue.value = schemaSelectionsValue.value.map((field) => ({
      ...field,
      label: translations[field.label] ?? field.label
    }));
    emitCurrentDatasource();
  } catch {
    schemaTranslationError.value = t('datasource.validation.translateFieldsFailed');
  } finally {
    schemaTranslationLoading.value = false;
  }
}

function hasConfiguredRequestKeys() {
  return apiState.headerData.some((item) => item.key.trim()) ||
    apiState.queryData.some((item) => item.key.trim()) ||
    apiState.bodyData.some((item) => item.key.trim());
}

function openResponseMockDialog(index: number) {
  responseMockTargetIndex.value = index;
  responseMockError.value = '';
  isResponseMockDialogOpen.value = true;
}

function closeResponseMockDialog() {
  isResponseMockDialogOpen.value = false;
  responseMockTargetIndex.value = null;
}

async function runResponseCapture(
  index: number,
  datasource: MDatasourceApiObject,
  options?: DatasourceRequestOptions,
  fromDialog = false
) {
  const item = responseExamples.value[index];
  if (!item || item.loading) return;

  jsonSchemaError.value = '';
  responseMockError.value = '';
  item.loading = true;
  triggerRef(responseExamples);

  try {
    const responseData = await resolveDatasourceRemote(datasource, options);
    applyResponseExample(index, responseData);
    if (fromDialog) {
      closeResponseMockDialog();
    }
  } catch (error) {
    const message = getDatasourceErrorMessage(error);
    if (fromDialog) {
      responseMockError.value = message;
    } else {
      jsonSchemaError.value = message;
    }
  } finally {
    item.loading = false;
    triggerRef(responseExamples);
  }
}

function captureResponseExample(index: number) {
  if (!props.edit || isResponseCaptureBusy.value) return;

  if (hasConfiguredRequestKeys()) {
    openResponseMockDialog(index);
    return;
  }

  void runResponseCapture(index, buildApiDatasource());
}

function captureResponseExampleWithMock(payload: DatasourceResponseMockCapturePayload) {
  const targetIndex = responseMockTargetIndex.value;
  if (targetIndex === null || isResponseCaptureBusy.value) return;

  const datasource = normalizeApiDatasource({
    ...buildApiDatasource(),
    headerData: payload.headerData,
    queryData: payload.queryData,
    bodyData: payload.bodyData
  });
  void runResponseCapture(targetIndex, datasource, payload.options, true);
}

function selectResponseSchema(index: number) {
  if (!props.edit) return;

  const item = responseExamples.value[index];
  if (!item) return;

  jsonSchemaError.value = '';
  if (item.error) {
    return;
  }

  if (item.value === undefined) {
    item.error = t('datasource.validation.missingResponseExample');
    triggerRef(responseExamples);
    return;
  }

  try {
    applySelectedResponseSchema(inferDatasourceSchemaFromData(item.value));
  } catch (error) {
    jsonSchemaError.value = getDatasourceErrorMessage(error);
  }
}

function parseBodyValue(dataType: MDatasourceBodyDataType, inputValue: string): BodyValueParseResult {
  if (dataType === 'string') {
    return {
      ok: true,
      value: inputValue
    };
  }

  if (dataType === 'number') {
    const trimmedValue = inputValue.trim();
    const numberValue = Number(trimmedValue);
    if (!trimmedValue || !Number.isFinite(numberValue)) {
      return {
        ok: false,
        error: t('datasource.validation.invalidNumber')
      };
    }

    return {
      ok: true,
      value: numberValue
    };
  }

  if (dataType === 'boolean') {
    return {
      ok: true,
      value: inputValue === 'true'
    };
  }

  if (dataType === 'null') {
    return {
      ok: true,
      value: null
    };
  }

  if (dataType === 'file') {
    return {
      ok: true,
      value: normalizeBodyFileValue({
        name: inputValue,
        size: 0,
        type: ''
      })
    };
  }

  try {
    const parsed = JSON.parse(inputValue) as unknown;
    if (dataType === 'object') {
      if (!isJsonObjectValue(parsed)) {
        return {
          ok: false,
          error: t('datasource.validation.invalidObject')
        };
      }

      return {
        ok: true,
        value: cloneJsonValue(parsed)
      };
    }

    if (!Array.isArray(parsed) || !isJsonValue(parsed)) {
      return {
        ok: false,
        error: t('datasource.validation.invalidArray')
      };
    }

    return {
      ok: true,
      value: cloneJsonValue(parsed)
    };
  } catch {
    return {
      ok: false,
      error: dataType === 'object'
        ? t('datasource.validation.invalidObject')
        : t('datasource.validation.invalidArray')
    };
  }
}

function getBodyValueInput(item: Pick<ApiStateBodyItem, 'dataType' | 'value'>) {
  const normalizedValue = normalizeBodyValue(item.dataType, item.value);
  if (isVariableValueConfig(normalizedValue)) {
    return stringifyVariableValue(normalizedValue);
  }

  if (item.dataType === 'file') {
    return normalizeBodyFileValue(normalizedValue).name;
  }

  if (item.dataType === 'object' || item.dataType === 'array') {
    return formatJsonValue(normalizedValue);
  }

  if (item.dataType === 'null') {
    return 'null';
  }

  return String(normalizedValue);
}

void ensureApiDomainOptions();

defineExpose({
  getData
});

watch(
  () => props.value,
  (value) => {
    syncLocalState(value);
  },
  { deep: true }
);

watch(
  () => props.matchingExternalFields,
  (value) => {
    matchingExternalFieldsValue.value = createMatchingExternalFieldsState(
      matchingExternalFieldsValue.value,
      normalizeDatasourceExternalFields(value)
    );
  },
  { deep: true }
);
<\/script>

<template>
  <div ref="rootRef" class="ce-datasource-tool" data-testid="editor-datasource-tool">
    <div class="ce-datasource-tool__trigger-row">
      <button
        class="ce-datasource-tool__settings-button"
        type="button"
        data-testid="datasource-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('datasource.actions.settings') }}
      </button>
      <div class="ce-datasource-tool__summary" data-testid="datasource-summary">
        <span class="ce-datasource-tool__summary-item ce-datasource-tool__summary-item--type">API</span>
        <span class="ce-datasource-tool__summary-item">
          <span class="ce-datasource-tool__summary-label">{{ t('datasource.summary.domain') }}</span>
          <span class="ce-datasource-tool__summary-value">{{ datasourceSummaryDomain }}</span>
        </span>
        <span class="ce-datasource-tool__summary-item">
          <span class="ce-datasource-tool__summary-label">{{ t('datasource.summary.path') }}</span>
          <span class="ce-datasource-tool__summary-value">{{ datasourceSummaryPath }}</span>
        </span>
        <span class="ce-datasource-tool__summary-item">
          <span class="ce-datasource-tool__summary-label">{{ t('datasource.summary.method') }}</span>
          <span class="ce-datasource-tool__summary-value">{{ datasourceSummaryMethod }}</span>
        </span>
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-datasource-tool__settings-dialog"
      data-testid="datasource-settings-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="datasource-settings-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-datasource-tool__settings-dialog-panel">
        <div class="ce-datasource-tool__import-dialog-header">
          <h3
            id="datasource-settings-dialog-title"
            class="ce-datasource-tool__import-dialog-title"
            data-testid="datasource-settings-dialog-title"
          >
            {{ t('datasource.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-datasource-tool__import-dialog-close"
            type="button"
            data-testid="datasource-settings-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>
        <div class="ce-datasource-tool__settings-dialog-body">
          <div class="ce-datasource-tool__panel" data-testid="datasource-api-panel">
      <section v-if="edit" class="ce-datasource-tool__config-section" data-testid="datasource-import-config">
        <div class="ce-datasource-tool__config-section-header">
          <div class="ce-datasource-tool__config-section-title">{{ t('datasource.sections.importApi') }}</div>
        </div>
        <div class="ce-datasource-tool__config-section-body" data-testid="datasource-api-import-panel">
          <div class="ce-datasource-tool__import-sources">
            <button
              class="ce-datasource-tool__import-source-button"
              type="button"
              data-testid="datasource-import-open-mokelay"
              :disabled="isReadOnly"
              @click="openApiImportDialog('mokelay')"
            >
              <span class="ce-datasource-tool__import-source-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <ellipse cx="12" cy="6" rx="7" ry="3" fill="none" stroke="currentColor" stroke-width="2" />
                  <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" fill="none" stroke="currentColor" stroke-width="2" />
                </svg>
              </span>
              <span class="ce-datasource-tool__import-source-label">{{ t('datasource.import.sources.mokelay') }}</span>
            </button>
            <button
              class="ce-datasource-tool__import-source-button"
              type="button"
              data-testid="datasource-import-open-apifox"
              :disabled="isReadOnly"
              @click="openApiImportDialog('apifox')"
            >
              <span class="ce-datasource-tool__import-source-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                  <path d="M12 8v8M8.5 10.2l7 3.6M15.5 10.2l-7 3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              <span class="ce-datasource-tool__import-source-label">{{ t('datasource.import.sources.apifox') }}</span>
            </button>
          </div>
        </div>
      </section>

      <Teleport to="body">
        <DatasourceApiImportDialog
          v-if="edit"
          :open="isApiImportDialogOpen"
          :source="apiImportSource"
          :current-domain="apiState.domain"
          :readonly="isReadOnly"
          @close="closeApiImportDialog"
          @imported="applyImportedApiDatasource"
        />
      </Teleport>

      <section class="ce-datasource-tool__config-section" data-testid="datasource-request-config">
        <div class="ce-datasource-tool__config-section-header">
          <div class="ce-datasource-tool__config-section-title">{{ t('datasource.sections.requestConfig') }}</div>
        </div>
        <div class="ce-datasource-tool__config-section-body">
      <div class="ce-datasource-tool__grid">
        <label class="ce-datasource-tool__field">
          <span class="ce-datasource-tool__label">{{ t('datasource.fields.domain') }}</span>
          <select
            class="ce-datasource-tool__input"
            data-testid="datasource-domain"
            :disabled="isApiDomainSelectDisabled"
            :value="apiState.domain"
            @change="updateApiField('domain', ($event.target as HTMLSelectElement).value)"
          >
            <option v-if="!apiDomainOptions.length" value="">
              {{ apiDomainEmptyOptionText }}
            </option>
            <option v-else-if="!apiState.domain" value="">
              {{ t('datasource.import.selectApiDomain') }}
            </option>
            <option v-for="domain in apiDomainOptions" :key="domain.uuid" :value="domain.uuid">
              {{ domain.alias }} ({{ domain.host }})
            </option>
          </select>
          <p v-if="apiDomainError" class="ce-datasource-tool__error" data-testid="datasource-domain-error">
            {{ apiDomainError }}
          </p>
        </label>
        <label class="ce-datasource-tool__field">
          <span class="ce-datasource-tool__label">{{ t('datasource.fields.path') }}</span>
          <input
            class="ce-datasource-tool__input"
            data-testid="datasource-path"
            type="text"
            :readonly="isReadOnly"
            :value="apiState.path"
            @input="updateApiField('path', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
        </label>
        <label class="ce-datasource-tool__field">
          <span class="ce-datasource-tool__label">{{ t('datasource.fields.method') }}</span>
          <select
            class="ce-datasource-tool__input"
            data-testid="datasource-method"
            :disabled="isReadOnly"
            :value="apiState.method"
            @change="updateApiMethod(($event.target as HTMLSelectElement).value)"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </label>
      </div>

      <details open class="ce-datasource-tool__list" data-testid="datasource-header-list">
        <summary class="ce-datasource-tool__list-header">
          <span class="ce-datasource-tool__list-title">{{ t('datasource.sections.headers') }}</span>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-header-add"
            @click.stop.prevent="addKeyValueItem('headerData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!getKeyValueList('headerData').length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(item, index) in getKeyValueList('headerData')"
          :key="\`header-\${index}\`"
          class="ce-datasource-tool__row"
        >
          <input
            class="ce-datasource-tool__input"
            :data-testid="\`datasource-header-key-\${index}\`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.key')"
            :value="item.key"
            @input="updateKeyValueItem('headerData', index, 'key', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <MVariableValueEditor
            :testid="\`datasource-header-value-\${index}\`"
            :model-value="item.value"
            :variables="variableOptions"
            :block-data-sources="blockDataSources"
            :page-variable-sources="pageVariableSources"
            :current-block-id="currentBlockId"
            value-type="string"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.value')"
            @update:model-value="updateKeyValueItem('headerData', index, 'value', $event as string | VariableValueConfig)"
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="\`datasource-header-remove-\${index}\`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeKeyValueItem('headerData', index)"
          >
            {{ t('datasource.actions.remove') }}
          </button>
        </div>
      </details>

      <details open class="ce-datasource-tool__list" data-testid="datasource-query-list">
        <summary class="ce-datasource-tool__list-header">
          <span class="ce-datasource-tool__list-title">{{ t('datasource.sections.queries') }}</span>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-query-add"
            @click.stop.prevent="addKeyValueItem('queryData')"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!getKeyValueList('queryData').length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(item, index) in getKeyValueList('queryData')"
          :key="\`query-\${index}\`"
          class="ce-datasource-tool__row"
        >
          <input
            class="ce-datasource-tool__input"
            :data-testid="\`datasource-query-key-\${index}\`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.key')"
            :value="item.key"
            @input="updateKeyValueItem('queryData', index, 'key', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <MVariableValueEditor
            :testid="\`datasource-query-value-\${index}\`"
            :model-value="item.value"
            :variables="variableOptions"
            :block-data-sources="blockDataSources"
            :page-variable-sources="pageVariableSources"
            :current-block-id="currentBlockId"
            value-type="string"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.value')"
            @update:model-value="updateKeyValueItem('queryData', index, 'value', $event as string | VariableValueConfig)"
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="\`datasource-query-remove-\${index}\`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeKeyValueItem('queryData', index)"
          >
            {{ t('datasource.actions.remove') }}
          </button>
        </div>
      </details>

      <details open class="ce-datasource-tool__list" data-testid="datasource-body-list">
        <summary class="ce-datasource-tool__list-header">
          <span class="ce-datasource-tool__list-title">{{ t('datasource.sections.body') }}</span>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-body-add"
            @click.stop.prevent="addBodyItem"
          >
            {{ t('datasource.actions.add') }}
          </button>
        </summary>
        <p v-if="!apiState.bodyData.length" class="ce-datasource-tool__empty">
          {{ t('datasource.empty') }}
        </p>
        <div
          v-for="(body, index) in apiState.bodyData"
          :key="\`body-\${index}\`"
          class="ce-datasource-tool__body-row"
        >
          <input
            class="ce-datasource-tool__input"
            :data-testid="\`datasource-body-key-\${index}\`"
            type="text"
            :readonly="isReadOnly"
            :placeholder="t('datasource.fields.key')"
            :value="body.key"
            @input="updateBodyKey(index, ($event.target as HTMLInputElement).value)"
            @keydown.stop
          />
          <select
            class="ce-datasource-tool__input"
            :data-testid="\`datasource-body-type-\${index}\`"
            :disabled="isReadOnly"
            :value="body.dataType"
            @change="updateBodyDataType(index, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="dataType in bodyDataTypeOptions" :key="dataType" :value="dataType">
              {{ dataType }}
            </option>
          </select>
          <input
            v-if="body.dataType === 'null'"
            class="ce-datasource-tool__input"
            :data-testid="\`datasource-body-value-\${index}\`"
            type="text"
            readonly
            value="null"
          />
          <input
            v-else-if="body.dataType === 'file' && edit"
            class="ce-datasource-tool__input"
            :data-testid="\`datasource-body-value-\${index}\`"
            type="file"
            :disabled="isReadOnly"
            @change="updateBodyFile(index, ($event.target as HTMLInputElement).files?.[0])"
            @keydown.stop
          />
          <input
            v-else-if="body.dataType === 'file'"
            class="ce-datasource-tool__input"
            :data-testid="\`datasource-body-value-\${index}\`"
            type="text"
            readonly
            :value="getBodyValueInput(body)"
          />
          <MVariableValueEditor
            v-else
            :testid="\`datasource-body-value-\${index}\`"
            :model-value="body.value"
            :variables="variableOptions"
            :block-data-sources="blockDataSources"
            :page-variable-sources="pageVariableSources"
            :current-block-id="currentBlockId"
            :value-type="body.dataType === 'object' || body.dataType === 'array' || body.dataType === 'number' || body.dataType === 'boolean' ? body.dataType : 'string'"
            :readonly="isReadOnly"
            :multiline="body.dataType === 'object' || body.dataType === 'array'"
            :placeholder="t('datasource.fields.value')"
            @update:model-value="updateBodyVariableValue(index, $event)"
          />
          <button
            v-if="edit"
            class="ce-datasource-tool__remove"
            type="button"
            :data-testid="\`datasource-body-remove-\${index}\`"
            :aria-label="t('datasource.actions.remove')"
            @click="removeBodyItem(index)"
          >
            {{ t('datasource.actions.remove') }}
          </button>
          <p v-if="bodyValueErrors[index]" class="ce-datasource-tool__body-error" :data-testid="\`datasource-body-error-\${index}\`">
            {{ bodyValueErrors[index] }}
          </p>
        </div>
      </details>
        </div>
      </section>

      <Teleport to="body">
        <DatasourceResponseMockDialog
          v-if="edit"
          :open="isResponseMockDialogOpen"
          :method="apiState.method"
          :header-data="responseMockHeaderData"
          :query-data="responseMockQueryData"
          :body-data="responseMockBodyData"
          :body-files="responseMockBodyFiles"
          :loading="isResponseCaptureBusy"
          :error="responseMockError"
          @close="closeResponseMockDialog"
          @capture="captureResponseExampleWithMock"
        />
      </Teleport>

      <section class="ce-datasource-tool__config-section" data-testid="datasource-response-config">
        <div class="ce-datasource-tool__config-section-header">
          <div>
            <div class="ce-datasource-tool__config-section-title">{{ t('datasource.sections.responseConfig') }}</div>
            <p class="ce-datasource-tool__section-copy">{{ t('datasource.help.responseConfig') }}</p>
          </div>
          <button
            v-if="edit"
            class="ce-datasource-tool__action"
            type="button"
            data-testid="datasource-response-example-add"
            @click="addResponseExample"
          >
            {{ t('datasource.actions.addResponseExample') }}
          </button>
        </div>
        <div class="ce-datasource-tool__config-section-body ce-datasource-tool__config-section-body--response">
          <div class="ce-datasource-tool__response-example-list" data-testid="datasource-schema-generate-panel">
            <article
              v-for="(responseExample, index) in responseExamples"
              :key="responseExample.id"
              class="ce-datasource-tool__generate-panel ce-datasource-tool__response-example-card"
              :data-testid="\`datasource-response-example-item-\${index}\`"
            >
              <div class="ce-datasource-tool__response-example-header">
                <div class="ce-datasource-tool__section-title">
                  {{ t('datasource.fields.responseExample') }} {{ index + 1 }}
                </div>
                <div class="ce-datasource-tool__response-example-header-actions">
                  <button
                    type="button"
                    class="ce-datasource-tool__full-schema-button"
                    :data-testid="index === 0 ? 'datasource-full-schema-open' : \`datasource-full-schema-open-\${index}\`"
                    @click="openFullSchemaDialog(index)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2M10 8l-2 4 2 4M14 8l2 4-2 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>{{ t('datasource.actions.fullSchema') }}</span>
                  </button>
                  <button
                    v-if="edit"
                    class="ce-datasource-tool__schema-button"
                    type="button"
                    :data-testid="index === 0 ? 'datasource-response-schema-select-button' : \`datasource-response-schema-select-button-\${index}\`"
                    @click="selectResponseSchema(index)"
                  >
                    {{ t('datasource.actions.selectSchema') }}
                  </button>
                  <button
                    v-if="edit"
                    class="ce-datasource-tool__remove"
                    type="button"
                    :data-testid="\`datasource-response-example-remove-\${index}\`"
                    @click="removeResponseExample(index)"
                  >
                    {{ t('datasource.actions.remove') }}
                  </button>
                </div>
              </div>
              <div class="ce-datasource-tool__generate-actions">
                <button
                  v-if="edit"
                  class="ce-datasource-tool__schema-button"
                  type="button"
                  :data-testid="index === 0 ? 'datasource-json-schema-parse-button' : \`datasource-json-schema-parse-button-\${index}\`"
                  :disabled="isResponseCaptureBusy"
                  @click="captureResponseExample(index)"
                >
                  {{ responseExample.loading ? t('datasource.actions.capturingResponseExample') : t('datasource.actions.captureResponseExample') }}
                </button>
                <span v-if="jsonSchemaValue" class="ce-datasource-tool__schema-summary" data-testid="datasource-schema-summary">
                  {{ t('datasource.fields.generatedFields') }}: {{ flattenedSchemaNodes.length }}
                </span>
              </div>
              <div class="ce-datasource-tool__response-example-grid">
                <label class="ce-datasource-tool__field">
                  <span class="ce-datasource-tool__label">{{ t('datasource.fields.responseExampleInput') }}</span>
                  <textarea
                    class="ce-datasource-tool__textarea ce-datasource-tool__textarea--response-example"
                    :data-testid="index === 0 ? 'datasource-response-example' : \`datasource-response-example-\${index}\`"
                    spellcheck="false"
                    :readonly="isReadOnly"
                    :placeholder="t('datasource.fields.responseExamplePlaceholder')"
                    :value="responseExample.text"
                    @input="handleResponseExampleInput(index, $event)"
                    @keydown.stop
                  ></textarea>
                </label>
                <div class="ce-datasource-tool__field">
                  <span class="ce-datasource-tool__label">{{ t('datasource.fields.responseExamplePreview') }}</span>
                  <div
                    class="ce-datasource-tool__response-example-preview"
                    :data-testid="index === 0 ? 'datasource-response-example-preview' : \`datasource-response-example-preview-\${index}\`"
                  >
                    <p
                      v-if="responseExample.error"
                      class="ce-datasource-tool__response-example-preview-state ce-datasource-tool__response-example-preview-state--error"
                      :data-testid="index === 0 ? 'datasource-response-example-preview-error' : \`datasource-response-example-preview-error-\${index}\`"
                    >
                      {{ responseExample.error }}
                    </p>
                    <JsonTreeView v-else-if="responseExample.value !== undefined" :value="responseExample.value" />
                    <p v-else class="ce-datasource-tool__response-example-preview-state">
                      {{ t('datasource.fields.responseExamplePreviewEmpty') }}
                    </p>
                  </div>
                </div>
              </div>
              <p
                v-if="responseExample.error"
                class="ce-datasource-tool__error"
                :data-testid="index === 0 ? 'datasource-response-example-error' : \`datasource-response-example-error-\${index}\`"
              >
                {{ responseExample.error }}
              </p>
            </article>
          </div>
          <p v-if="jsonSchemaError" class="ce-datasource-tool__error" data-testid="datasource-json-schema-error">
            {{ jsonSchemaError }}
          </p>

    <div class="ce-datasource-tool__schema-panel" data-testid="datasource-json-schema-panel">
      <div class="ce-datasource-tool__schema-header">
        <div>
          <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.fieldSelection') }}</div>
          <p class="ce-datasource-tool__section-copy">{{ t('datasource.help.fieldSelection') }}</p>
        </div>
      </div>

        <div class="ce-datasource-tool__schema-tab-panel" data-testid="datasource-fields-schema-panel">
          <div class="ce-datasource-tool__field-list-summary">
            {{ t('datasource.fields.availableFields') }}
          </div>
          <p v-if="!jsonSchemaValue" class="ce-datasource-tool__empty" data-testid="datasource-schema-empty">
            {{ t('datasource.emptySchema') }}
          </p>
          <p v-else-if="!combinedSelectionFields.length" class="ce-datasource-tool__empty" data-testid="datasource-fields-schema-empty">
            {{ t('datasource.noSelectableFields') }}
          </p>

          <div v-if="combinedSelectionFields.length" class="ce-datasource-tool__schema-filters">
            <label class="ce-datasource-tool__field">
              <span class="ce-datasource-tool__label">{{ t('datasource.fields.pathDepth') }}</span>
              <input
                class="ce-datasource-tool__input"
                data-testid="datasource-schema-path-depth"
                type="number"
                min="1"
                max="10"
                step="1"
                :value="schemaPathDepth"
                @input="updateSchemaPathDepth"
                @keydown.stop
              />
            </label>

            <label class="ce-datasource-tool__field">
              <span class="ce-datasource-tool__label">{{ t('datasource.fields.dataType') }}</span>
              <select
                class="ce-datasource-tool__input"
                data-testid="datasource-schema-data-type-filter"
                :value="schemaDataTypeFilter"
                @change="schemaDataTypeFilter = ($event.target as HTMLSelectElement).value as SchemaDataTypeFilter"
              >
                <option value="all">{{ t('datasource.fields.allDataTypes') }}</option>
                <option value="string">{{ getSchemaTypeLabel('string') }}</option>
                <option value="number">{{ getSchemaTypeLabel('number') }}</option>
                <option value="boolean">{{ getSchemaTypeLabel('boolean') }}</option>
                <option value="object">{{ getSchemaTypeLabel('object') }}</option>
                <option value="array">{{ getSchemaTypeLabel('array') }}</option>
              </select>
            </label>

            <label class="ce-datasource-tool__field">
              <span class="ce-datasource-tool__label">{{ t('datasource.fields.fieldPath') }}</span>
              <input
                class="ce-datasource-tool__input"
                data-testid="datasource-schema-search"
                type="search"
                :placeholder="t('datasource.fields.searchFieldsByPath')"
                :value="schemaSearch"
                @input="schemaSearch = ($event.target as HTMLInputElement).value"
                @keydown.stop
              />
            </label>
          </div>

          <div v-if="visibleSelectionFields.length" class="ce-datasource-tool__field-list" data-testid="datasource-fields">
            <div
              v-for="field in visibleSelectionFields"
              :key="\`\${field.source}:\${field.path}\`"
              class="ce-datasource-tool__schema-field"
              :data-testid="\`datasource-\${field.source}-field-\${field.path}\`"
            >
              <span class="ce-datasource-tool__schema-field-main">
                <span class="ce-datasource-tool__schema-field-label" :data-testid="\`datasource-\${field.source}-field-label-\${field.path}\`">
                  {{ field.label }}
                </span>
                <span class="ce-datasource-tool__schema-path">{{ field.path }}</span>
              </span>
              <span class="ce-datasource-tool__schema-badges">
                <span class="ce-datasource-tool__schema-badge">{{ getSchemaTypeLabel(field.type) }}</span>
                <button
                  type="button"
                  class="ce-datasource-tool__field-action"
                  :disabled="isReadOnly || field.selected"
                  :data-testid="\`datasource-\${field.source}-field-add-\${field.path}\`"
                  @click="addSchemaSelection(field.path)"
                >
                  {{ field.selected ? t('datasource.actions.added') : t('datasource.actions.add') }}
                </button>
              </span>
            </div>
          </div>
          <p
            v-else-if="combinedSelectionFields.length"
            class="ce-datasource-tool__empty"
            data-testid="datasource-fields-search-empty"
          >
            {{ t('datasource.noFieldsMatchingPath') }}
          </p>
        </div>

        <div class="ce-datasource-tool__selected-fields" data-testid="datasource-selected-fields">
          <div class="ce-datasource-tool__selected-fields-header">
            <div class="ce-datasource-tool__field-list-summary">
              {{ t('datasource.fields.selectedFields') }}: {{ enabledFieldCount }}
            </div>
            <button
              type="button"
              class="ce-datasource-tool__schema-button"
              :disabled="isReadOnly || schemaTranslationLoading || !schemaSelectionsValue.length"
              data-testid="datasource-selected-fields-translate"
              @click="translateSchemaSelectionLabels"
            >
              {{ schemaTranslationLoading
                ? t('datasource.actions.translatingFields')
                : t('datasource.actions.translateFields') }}
            </button>
          </div>
          <div v-if="schemaSelectionsValue.length" class="ce-datasource-tool__field-list">
            <div
              v-for="field in schemaSelectionsValue"
              :key="field.path"
              class="ce-datasource-tool__schema-field"
              :data-testid="\`datasource-selected-field-\${field.path}\`"
            >
              <span class="ce-datasource-tool__schema-field-main">
                <span class="ce-datasource-tool__schema-field-label" :data-testid="\`datasource-selected-field-label-\${field.path}\`">
                  {{ field.label }}
                </span>
                <span class="ce-datasource-tool__schema-path">{{ field.path }}</span>
                <span
                  v-if="field.processors?.length"
                  class="ce-datasource-tool__processor-tags"
                  :data-testid="\`datasource-selected-field-processors-\${field.path}\`"
                >
                  <span
                    v-for="(processor, processorIndex) in field.processors"
                    :key="\`\${processorName(processor)}-\${processorIndex}\`"
                    class="ce-datasource-tool__processor-tag"
                  >
                    {{ getProcessorLabel(processor) }}
                  </span>
                </span>
              </span>
              <span class="ce-datasource-tool__schema-badges">
                <span class="ce-datasource-tool__selected-field-meta">
                  <span class="ce-datasource-tool__schema-badge">{{ getSchemaTypeLabel(field.type) }}</span>
                  <span
                    v-if="field.processors?.length"
                    class="ce-datasource-tool__schema-badge ce-datasource-tool__schema-badge--processor"
                  >
                    {{ t('datasource.processors.count').replace('{count}', String(field.processors.length)) }}
                  </span>
                </span>
                <span class="ce-datasource-tool__selected-field-actions">
                  <button
                    type="button"
                    class="ce-datasource-tool__field-action"
                    :data-testid="\`datasource-selected-field-preview-\${field.path}\`"
                    @click="openProcessorPreviewDialog(field.path)"
                  >
                    {{ t('datasource.actions.previewField') }}
                  </button>
                  <button
                    type="button"
                    class="ce-datasource-tool__field-action"
                    :data-testid="\`datasource-selected-field-processors-config-\${field.path}\`"
                    @click="openProcessorDialog(field.path)"
                  >
                    {{ isReadOnly ? t('datasource.processors.view') : t('datasource.processors.configure') }}
                  </button>
                  <button
                    type="button"
                    class="ce-datasource-tool__field-action ce-datasource-tool__field-action--remove"
                    :disabled="isReadOnly"
                    :data-testid="\`datasource-selected-field-remove-\${field.path}\`"
                    @click="removeSchemaSelection(field.path)"
                  >
                    {{ t('datasource.actions.remove') }}
                  </button>
                </span>
              </span>
            </div>
          </div>
          <p v-else class="ce-datasource-tool__empty" data-testid="datasource-selected-fields-empty">
            {{ t('datasource.emptySelectedFields') }}
          </p>
          <p v-if="schemaTranslationError" class="ce-datasource-tool__error" data-testid="datasource-selected-fields-translate-error">
            {{ schemaTranslationError }}
          </p>
        </div>

        <div
          v-if="hasMatchingExternalFields"
          class="ce-datasource-tool__selected-fields"
          data-testid="datasource-external-field-matching"
        >
          <div class="ce-datasource-tool__selected-fields-header">
            <div>
              <div class="ce-datasource-tool__field-list-summary">
                {{ t('datasource.sections.externalFieldMatching') }}
              </div>
              <p class="ce-datasource-tool__section-copy">
                {{ t('datasource.help.externalFieldMatching') }}
              </p>
            </div>
            <span
              v-if="unmatchedExternalFieldCount"
              class="ce-datasource-tool__schema-badge ce-datasource-tool__schema-badge--warning"
              data-testid="datasource-external-field-unmatched-count"
            >
              {{ t('datasource.matching.unmatchedCount').replace('{count}', String(unmatchedExternalFieldCount)) }}
            </span>
          </div>

          <div v-if="matchingExternalFieldsValue.length" class="ce-datasource-tool__field-list">
            <div
              v-for="field in matchingExternalFieldsValue"
              :key="field.variable"
              class="ce-datasource-tool__schema-field"
              :data-testid="\`datasource-external-field-\${field.variable}\`"
            >
              <span class="ce-datasource-tool__schema-field-main">
                <span class="ce-datasource-tool__schema-field-label">
                  {{ field.label }}
                </span>
                <span class="ce-datasource-tool__schema-path">{{ field.variable }}</span>
              </span>
              <span class="ce-datasource-tool__schema-badges ce-datasource-tool__schema-badges--matching">
                <select
                  class="ce-datasource-tool__input ce-datasource-tool__matching-select"
                  :data-testid="\`datasource-external-field-match-\${field.variable}\`"
                  :disabled="isReadOnly || !schemaSelectionsValue.length"
                  :value="field.matchFieldPath"
                  @change="updateMatchingExternalFieldMatch(field.variable, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">{{ t('datasource.matching.unmatched') }}</option>
                  <option
                    v-for="selectedField in schemaSelectionsValue"
                    :key="selectedField.path"
                    :value="selectedField.path"
                  >
                    {{ selectedField.label }} ({{ selectedField.path }})
                  </option>
                </select>
              </span>
            </div>
          </div>
          <p v-else class="ce-datasource-tool__empty" data-testid="datasource-external-field-matching-empty">
            {{ t('datasource.matching.empty') }}
          </p>
        </div>

      <Teleport to="body">
        <dialog
          ref="fullSchemaDialogRef"
          class="ce-datasource-tool__import-dialog ce-datasource-tool__schema-dialog"
          data-testid="datasource-full-schema-dialog"
          :aria-hidden="!isFullSchemaDialogOpen"
          aria-labelledby="datasource-full-schema-dialog-title"
          @close="isFullSchemaDialogOpen = false"
        >
          <div class="ce-datasource-tool__import-dialog-panel">
          <div class="ce-datasource-tool__import-dialog-header">
            <h3
              id="datasource-full-schema-dialog-title"
              class="ce-datasource-tool__import-dialog-title"
              data-testid="datasource-full-schema-dialog-title"
            >
              {{ t('datasource.actions.fullSchema') }}
            </h3>
            <button
              class="ce-datasource-tool__import-dialog-close"
              type="button"
              data-testid="datasource-full-schema-close"
              @click="closeFullSchemaDialog"
            >
              {{ t('editor.close') }}
            </button>
          </div>
          <div class="ce-datasource-tool__import-dialog-body">
            <textarea
              class="ce-datasource-tool__textarea ce-datasource-tool__textarea--schema ce-datasource-tool__textarea--full-schema"
              data-testid="datasource-json-schema"
              spellcheck="false"
              readonly
              :value="fullSchemaText"
              @keydown.stop
            ></textarea>
            <p v-if="fullSchemaError" class="ce-datasource-tool__error" data-testid="datasource-full-schema-error">
              {{ fullSchemaError }}
            </p>
          </div>
          </div>
        </dialog>
      </Teleport>
    </div>
        </div>
      </section>
    </div>
        </div>
      </div>
    </dialog>
    <ProcessorConfigDialog
      :open="Boolean(processorFieldPath)"
      :field="processorField"
      :readonly="isReadOnly"
      @close="closeProcessorDialog"
      @apply="applyFieldProcessors"
    />
    <ProcessorPreviewDialog
      :open="Boolean(processorPreviewFieldPath)"
      :field="processorPreviewField"
      :examples="processorPreviewExamples"
      @close="closeProcessorPreviewDialog"
    />
  </div>
</template>

<style scoped>
.ce-datasource-tool {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-datasource-tool__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-datasource-tool__settings-button {
  flex: 0 0 auto;
  min-height: 34px;
  border: 1px solid rgb(20 184 166 / 0.55);
  border-radius: 8px;
  padding: 6px 14px;
  background: rgb(20 184 166);
  color: rgb(255 255 255);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.ce-datasource-tool__settings-button:hover {
  background: rgb(13 148 136);
}

.ce-datasource-tool__summary {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-datasource-tool__summary-item {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  gap: 5px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-datasource-tool__summary-item--type {
  border-color: rgb(191 219 254);
  background: rgb(239 246 255);
  color: rgb(29 78 216);
}

.ce-datasource-tool__summary-label {
  flex: 0 0 auto;
  color: rgb(100 116 139);
}

.ce-datasource-tool__summary-value {
  min-width: 0;
  overflow: hidden;
  color: rgb(15 23 42);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__settings-dialog {
  width: min(calc(100vw - 32px), 1120px);
  max-height: min(calc(100vh - 32px), 900px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-datasource-tool__settings-dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-datasource-tool__settings-dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__settings-dialog-body {
  overflow-y: auto;
}

.ce-datasource-tool__panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
}

.ce-datasource-tool__config-section {
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__config-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__config-section-title {
  color: rgb(15 23 42);
  font-size: 15px;
  font-weight: 700;
}

.ce-datasource-tool__config-section-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
}

.ce-datasource-tool__schema-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid rgb(226 232 240);
  padding: 14px 0 0;
}

.ce-datasource-tool__generate-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ce-datasource-tool__response-example-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ce-datasource-tool__response-example-card {
  border: 1px solid rgb(226 232 240);
  border-radius: 10px;
  padding: 12px;
}

.ce-datasource-tool__response-example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.ce-datasource-tool__response-example-header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.ce-datasource-tool__response-example-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ce-datasource-tool__response-example-preview {
  min-height: 260px;
  max-height: 420px;
  overflow: auto;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 9px 10px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__response-example-preview-state {
  margin: 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-datasource-tool__response-example-preview-state--error {
  color: rgb(185 28 28);
}

.ce-datasource-tool__schema-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ce-datasource-tool__section-title {
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 700;
}

.ce-datasource-tool__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-datasource-tool__generate-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.ce-datasource-tool__schema-summary {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 600;
}

.ce-datasource-tool__schema-filters {
  display: grid;
  grid-template-columns: minmax(110px, 0.2fr) minmax(180px, 0.35fr) minmax(260px, 1fr);
  gap: 10px;
  align-items: end;
}

.ce-datasource-tool__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 0.4fr);
  gap: 10px;
}

.ce-datasource-tool__import-sources {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ce-datasource-tool__import-source-button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 9px 10px;
  background: rgb(255 255 255);
  color: rgb(30 64 175);
  font: inherit;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
}

.ce-datasource-tool__import-source-button:hover {
  border-color: rgb(37 99 235 / 0.55);
  background: rgb(239 246 255);
}

.ce-datasource-tool__import-source-button:disabled {
  cursor: default;
  opacity: 0.65;
}

.ce-datasource-tool__import-source-icon {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 8px;
  background: rgb(219 234 254);
}

.ce-datasource-tool__import-source-icon svg {
  width: 21px;
  height: 21px;
}

.ce-datasource-tool__import-source-label {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.35;
}

.ce-datasource-tool__import-dialog {
  width: min(100%, 520px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-datasource-tool__schema-dialog {
  width: min(100%, 760px);
}

.ce-datasource-tool__response-mock-dialog {
  width: min(100%, 760px);
}

.ce-datasource-tool__response-mock-body {
  max-height: min(620px, 70vh);
  overflow-y: auto;
}

.ce-datasource-tool__response-mock-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-datasource-tool__response-mock-row,
.ce-datasource-tool__response-mock-body-row {
  display: grid;
  grid-template-columns: minmax(160px, 0.45fr) minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__response-mock-body-row {
  grid-template-columns: minmax(140px, 0.35fr) minmax(90px, 0.2fr) minmax(0, 1fr);
}

.ce-datasource-tool__response-mock-body-error {
  grid-column: 3;
}

.ce-datasource-tool__import-dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-datasource-tool__import-dialog-panel {
  margin: 0;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__import-dialog-header,
.ce-datasource-tool__import-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
}

.ce-datasource-tool__import-dialog-header {
  border-bottom: 1px solid rgb(226 232 240);
}

.ce-datasource-tool__import-dialog-actions {
  border-top: 1px solid rgb(226 232 240);
  justify-content: flex-end;
}

.ce-datasource-tool__import-dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 650;
  line-height: 1.4;
}

.ce-datasource-tool__import-dialog-close {
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 5px 10px;
  background: rgb(255 255 255);
  color: rgb(71 85 105);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-datasource-tool__import-dialog-close:hover {
  background: rgb(248 250 252);
}

.ce-datasource-tool__import-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.ce-datasource-tool__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.ce-datasource-tool__field--wide {
  grid-column: span 2;
}

.ce-datasource-tool__label,
.ce-datasource-tool__list-title {
  margin: 0;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-datasource-tool__input,
.ce-datasource-tool__textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
}

.ce-datasource-tool__input {
  height: 36px;
  padding: 7px 10px;
}

.ce-datasource-tool__textarea {
  resize: vertical;
  padding: 9px 10px;
}

.ce-datasource-tool__textarea--schema {
  min-height: 130px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 19px;
}

.ce-datasource-tool__textarea--full-schema {
  min-height: min(520px, 65vh);
}

.ce-datasource-tool__textarea--response-example {
  min-height: 260px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 19px;
}

.ce-datasource-tool__textarea--value {
  min-height: 70px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 18px;
}

.ce-datasource-tool__input:focus,
.ce-datasource-tool__textarea:focus {
  outline: none;
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 2px rgb(37 99 235 / 0.15);
}

.ce-datasource-tool__input:read-only,
.ce-datasource-tool__textarea:read-only,
.ce-datasource-tool__input:disabled {
  background: rgb(248 250 252);
}

.ce-datasource-tool__error,
.ce-datasource-tool__body-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 13px;
}

.ce-datasource-tool__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-datasource-tool__list[open] {
  gap: 8px;
}

.ce-datasource-tool__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  list-style: none;
}

.ce-datasource-tool__list-header::-webkit-details-marker {
  display: none;
}

.ce-datasource-tool__action,
.ce-datasource-tool__remove,
.ce-datasource-tool__schema-button,
.ce-datasource-tool__full-schema-button {
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(30 64 175);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-datasource-tool__full-schema-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  padding: 5px 10px;
}

.ce-datasource-tool__full-schema-button svg {
  width: 18px;
  height: 18px;
}

.ce-datasource-tool__action {
  padding: 5px 12px;
}

.ce-datasource-tool__schema-button {
  padding: 5px 12px;
  white-space: nowrap;
}

.ce-datasource-tool__remove {
  padding: 5px 10px;
  color: rgb(185 28 28);
}

.ce-datasource-tool__action:hover,
.ce-datasource-tool__remove:hover,
.ce-datasource-tool__schema-button:hover,
.ce-datasource-tool__full-schema-button:hover {
  background: rgb(248 250 252);
}

.ce-datasource-tool__schema-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.ce-datasource-tool__full-schema-button:disabled {
  cursor: default;
  opacity: 0.55;
}

.ce-datasource-tool__action:disabled,
.ce-datasource-tool__remove:disabled {
  cursor: default;
  opacity: 0.65;
}

.ce-datasource-tool__schema-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ce-datasource-tool__selected-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid rgb(226 232 240);
}

.ce-datasource-tool__selected-fields-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ce-datasource-tool__field-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__selected-fields .ce-datasource-tool__field-list {
  grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
}

.ce-datasource-tool__field-list-summary {
  grid-column: 1 / -1;
  min-width: 0;
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-datasource-tool__schema-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 7px 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__schema-field-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.ce-datasource-tool__schema-field-label {
  overflow: hidden;
  color: rgb(15 23 42);
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__schema-path {
  overflow: hidden;
  color: rgb(100 116 139);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__processor-tags {
  display: flex;
  min-width: 0;
  flex-wrap: nowrap;
  gap: 4px;
  margin-top: 3px;
  overflow: hidden;
}

.ce-datasource-tool__processor-tag {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  padding: 1px 6px;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__schema-badges {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-datasource-tool__selected-fields .ce-datasource-tool__schema-field {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}

.ce-datasource-tool__selected-fields .ce-datasource-tool__schema-badges {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid rgb(241 245 249);
}

.ce-datasource-tool__selected-fields .ce-datasource-tool__schema-badges--matching {
  grid-template-columns: minmax(0, 1fr);
}

.ce-datasource-tool__selected-field-meta,
.ce-datasource-tool__selected-field-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.ce-datasource-tool__selected-field-meta {
  overflow: hidden;
}

.ce-datasource-tool__selected-field-actions {
  display: grid;
  grid-template-columns: minmax(52px, 0.75fr) minmax(88px, 1.25fr) minmax(52px, 0.75fr);
}

.ce-datasource-tool__selected-field-actions .ce-datasource-tool__field-action {
  min-width: 0;
  padding-inline: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__schema-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 999px;
  padding: 2px 7px;
  background: rgb(239 246 255);
  color: rgb(30 64 175);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.ce-datasource-tool__schema-badge--processor {
  background: rgb(240 253 250);
  color: rgb(15 118 110);
}

.ce-datasource-tool__schema-badge--warning {
  background: rgb(254 243 199);
  color: rgb(146 64 14);
}

.ce-datasource-tool__matching-select {
  min-width: min(100%, 260px);
}

.ce-datasource-tool__field-action {
  min-width: 52px;
  border: 1px solid rgb(191 219 254);
  border-radius: 6px;
  padding: 4px 9px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-datasource-tool__field-action--remove {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(220 38 38);
}

.ce-datasource-tool__field-action:disabled {
  cursor: default;
  opacity: 0.55;
}

.ce-datasource-tool__schema-tree {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(248 250 252);
}

.ce-datasource-tool__schema-node {
  display: grid;
  grid-template-columns: minmax(90px, 0.5fr) minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  min-height: 30px;
}

.ce-datasource-tool__schema-node-name {
  min-width: 0;
  color: rgb(15 23 42);
  font-size: 13px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-datasource-tool__empty {
  margin: 0;
  border: 1px dashed rgb(203 213 225);
  border-radius: 8px;
  padding: 9px 10px;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-datasource-tool__row {
  display: grid;
  grid-template-columns: minmax(120px, 0.42fr) minmax(0, 1.58fr) auto;
  gap: 8px;
  align-items: center;
}

.ce-datasource-tool__row :deep(.variable-value-editor) {
  gap: 4px;
}

.ce-datasource-tool__row :deep(.variable-value-editor__modes button) {
  padding-inline: 7px;
}

.ce-datasource-tool__row :deep(.variable-value-editor__source) {
  flex-basis: 88px;
}

.ce-datasource-tool__row :deep(.variable-value-editor__variable .variable-value-editor__input) {
  flex-basis: 96px;
  min-width: 68px;
}

.ce-datasource-tool__row :deep(.variable-value-editor__processor-button) {
  min-width: 84px;
  padding-inline: 8px;
}

.ce-datasource-tool__body-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(110px, 0.4fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__body-error {
  grid-column: 3 / 5;
}

@media (max-width: 720px) {
  .ce-datasource-tool__trigger-row {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__summary {
    flex-direction: column;
  }

  .ce-datasource-tool__summary-item {
    width: 100%;
  }

  .ce-datasource-tool__schema-header {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__grid,
  .ce-datasource-tool__response-example-grid,
  .ce-datasource-tool__schema-filters,
  .ce-datasource-tool__import-sources,
  .ce-datasource-tool__row,
  .ce-datasource-tool__body-row,
  .ce-datasource-tool__response-mock-row,
  .ce-datasource-tool__response-mock-body-row,
  .ce-datasource-tool__schema-node {
    grid-template-columns: 1fr;
  }

  .ce-datasource-tool__field-list {
    grid-template-columns: 1fr;
  }

  .ce-datasource-tool__import-dialog-header,
  .ce-datasource-tool__import-dialog-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__field--wide {
    grid-column: auto;
  }

  .ce-datasource-tool__body-error {
    grid-column: 1;
  }
}

@media (max-width: 420px) {
  .ce-datasource-tool__selected-fields .ce-datasource-tool__schema-badges {
    grid-template-columns: minmax(0, 1fr);
  }
}

.dark .ce-datasource-tool {
  color: rgb(226 232 240);
}

.dark .ce-datasource-tool__schema-panel {
  border-top-color: rgb(51 65 85);
}

.dark .ce-datasource-tool__response-example-card {
  border-color: rgb(51 65 85);
}

.dark .ce-datasource-tool__response-example-preview {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
}

.dark .ce-datasource-tool__response-example-preview-state {
  color: rgb(148 163 184);
}

.dark .ce-datasource-tool__response-example-preview-state--error {
  color: rgb(248 113 113);
}

.dark .ce-datasource-tool__config-section {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

.dark .ce-datasource-tool__config-section-header {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
}

.dark .ce-datasource-tool__config-section-title {
  color: rgb(241 245 249);
}

.dark .ce-datasource-tool__settings-button {
  border-color: rgb(45 212 191 / 0.55);
  background: rgb(15 118 110);
  color: rgb(240 253 250);
}

.dark .ce-datasource-tool__settings-button:hover {
  background: rgb(13 148 136);
}

.dark .ce-datasource-tool__summary-item {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
  color: rgb(203 213 225);
}

.dark .ce-datasource-tool__summary-item--type {
  border-color: rgb(96 165 250 / 0.55);
  background: rgb(30 64 175 / 0.32);
  color: rgb(191 219 254);
}

.dark .ce-datasource-tool__summary-label {
  color: rgb(148 163 184);
}

.dark .ce-datasource-tool__summary-value {
  color: rgb(241 245 249);
}

.dark .ce-datasource-tool__settings-dialog-panel {
  background: rgb(15 23 42);
}

.dark .ce-datasource-tool__section-title,
.dark .ce-datasource-tool__schema-node-name {
  color: rgb(241 245 249);
}

.dark .ce-datasource-tool__section-copy,
.dark .ce-datasource-tool__schema-summary,
.dark .ce-datasource-tool__schema-path {
  color: rgb(148 163 184);
}

.dark .ce-datasource-tool__label,
.dark .ce-datasource-tool__list-title,
.dark .ce-datasource-tool__field-list-summary {
  color: rgb(203 213 225);
}

.dark .ce-datasource-tool__import-source-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(191 219 254);
}

.dark .ce-datasource-tool__import-source-button:hover {
  border-color: rgb(96 165 250 / 0.7);
  background: rgb(30 41 59);
}

.dark .ce-datasource-tool__import-source-icon {
  background: rgb(30 64 175 / 0.45);
}

.dark .ce-datasource-tool__import-dialog-panel {
  background: rgb(15 23 42);
}

.dark .ce-datasource-tool__import-dialog-header,
.dark .ce-datasource-tool__import-dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .ce-datasource-tool__import-dialog-title {
  color: rgb(241 245 249);
}

.dark .ce-datasource-tool__import-dialog-close {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(203 213 225);
}

.dark .ce-datasource-tool__import-dialog-close:hover {
  background: rgb(30 41 59);
}

.dark .ce-datasource-tool__input,
.dark .ce-datasource-tool__textarea {
  border-color: rgb(71 85 105 / 0.9);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .ce-datasource-tool__input:read-only,
.dark .ce-datasource-tool__textarea:read-only,
.dark .ce-datasource-tool__input:disabled {
  background: rgb(30 41 59);
}

.dark .ce-datasource-tool__action,
.dark .ce-datasource-tool__remove,
.dark .ce-datasource-tool__schema-button,
.dark .ce-datasource-tool__full-schema-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

.dark .ce-datasource-tool__action:hover,
.dark .ce-datasource-tool__remove:hover,
.dark .ce-datasource-tool__schema-button:hover,
.dark .ce-datasource-tool__full-schema-button:hover {
  background: rgb(30 41 59);
}

.dark .ce-datasource-tool__empty {
  border-color: rgb(71 85 105);
  color: rgb(148 163 184);
}

.dark .ce-datasource-tool__schema-field,
.dark .ce-datasource-tool__schema-tree {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

.dark .ce-datasource-tool__selected-fields {
  border-color: rgb(51 65 85);
}

.dark .ce-datasource-tool__selected-fields .ce-datasource-tool__schema-badges {
  border-top-color: rgb(30 41 59);
}

.dark .ce-datasource-tool__field-action {
  border-color: rgb(30 64 175);
  background: rgb(30 64 175 / 0.25);
  color: rgb(191 219 254);
}

.dark .ce-datasource-tool__field-action--remove {
  border-color: rgb(153 27 27);
  background: rgb(127 29 29 / 0.25);
  color: rgb(254 202 202);
}

.dark .ce-datasource-tool__schema-field-label {
  color: rgb(226 232 240);
}

.dark .ce-datasource-tool__schema-badge {
  background: rgb(30 64 175 / 0.34);
  color: rgb(191 219 254);
}

.dark .ce-datasource-tool__processor-tag,
.dark .ce-datasource-tool__schema-badge--processor {
  background: rgb(13 148 136 / 0.25);
  color: rgb(153 246 228);
}

.dark .ce-datasource-tool__schema-badge--warning {
  background: rgb(120 53 15 / 0.35);
  color: rgb(253 230 138);
}

.dark .ce-datasource-tool__error,
.dark .ce-datasource-tool__body-error {
  color: rgb(248 113 113);
}
</style>
`,B=`<script lang="ts">
export { mEditorSelectorEditorTool } from '@/editors/blocks/mEditorSelectorEditorTool';
export type { MEditorSelectorProps, StoredBlock } from '@/editors/blocks/mEditorSelectorEditorTool';
<\/script>

<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs';
import type { OutputData, ToolSettings } from '@editorjs/editorjs';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEditorJsI18nMessages, useI18n } from '@/i18n';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { isRegisteredEditorComponent } from '@/editors/editorComponentRuntimeRegistry';
import MokelayBlockRenderer from 'mokelay-components/blocks/MokelayBlockRenderer.vue';
import {
  finalizeEditorOutputWithEvents,
  prepareEditorOutputWithEvents
} from 'mokelay-components/blocks';
import {
  cloneSelectorBlock,
  normalizeSelectorBlock,
  type MEditorSelectorProps,
  type StoredBlock
} from '@/editors/blocks/mEditorSelectorEditorTool';
import {
  getToolboxVisibleClientBlockDocs,
  loadClientBlockDocs,
  type NormalizedClientBlockDoc
} from '@/utils/clientBlockDocs';

const SELECTOR_TOOL_NAME = 'MEditorSelector';
const INTERNAL_BLOCK_TYPES = new Set(['paragraph', 'table', 'columns']);

const props = withDefaults(defineProps<MEditorSelectorProps & {
  onChange?: (payload: MEditorSelectorProps) => void;
  onToolChange?: (payload: MEditorSelectorProps) => void;
}>(), {
  edit: false,
  value: undefined
});

const { t, localeValue } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const holderRef = ref<HTMLElement | null>(null);
const selectedBlock = ref<StoredBlock | undefined>(normalizeSelectorBlock(props.value));
const hasSelectedBlock = computed(() => selectedBlock.value !== undefined);

let editor: EditorJS | null = null;
let isRenderingCanonicalValue = false;
let isEditorInitializing = false;
let editorMutationObserver: MutationObserver | null = null;
let scheduledEditorSync: number | null = null;
let scheduledToolbarSync: number | null = null;
let editorDataCache: OutputData = buildOutput(selectedBlock.value);
let clientBlockDocsCache: NormalizedClientBlockDoc[] = getToolboxVisibleClientBlockDocs();

function buildOutput(block?: StoredBlock): OutputData {
  return {
    blocks: block ? [cloneSelectorBlock(block)] : []
  };
}

function getBlockSignature(block?: StoredBlock) {
  return block ? JSON.stringify(block) : '';
}

function getExcludedToolNames() {
  const excludedToolNames = new Set([SELECTOR_TOOL_NAME]);
  (props.excludeToolNames ?? []).forEach((toolName) => {
    excludedToolNames.add(toolName);
  });
  return excludedToolNames;
}

function isAllowedSelectorType(type: string) {
  const docs = getToolboxVisibleClientBlockDocs(clientBlockDocsCache);
  return !getExcludedToolNames().has(type)
    && !INTERNAL_BLOCK_TYPES.has(type)
    && docs.some((doc) => doc.blockType === type)
    && isRegisteredEditorComponent(type);
}

function toStoredBlock(block: OutputData['blocks'][number]): StoredBlock | undefined {
  if (!isAllowedSelectorType(block.type)) return undefined;
  return normalizeSelectorBlock(block);
}

function getSelectedBlockFromOutput(output: OutputData) {
  const finalizedOutput = finalizeEditorOutputWithEvents(output);
  const blocks = Array.isArray(finalizedOutput.blocks) ? finalizedOutput.blocks : [];
  const selectorBlocks = blocks
    .map((block) => toStoredBlock(block))
    .filter((block): block is StoredBlock => block !== undefined);

  return selectorBlocks[selectorBlocks.length - 1];
}

function shouldRenderCanonicalOutput(output: OutputData, block?: StoredBlock) {
  const blocks = Array.isArray(output.blocks) ? output.blocks : [];
  if (!block) {
    return blocks.some((item) => isAllowedSelectorType(item.type));
  }

  if (blocks.length !== 1) return true;
  return getBlockSignature(toStoredBlock(blocks[0])) !== getBlockSignature(block);
}

function emitValueChange(block?: StoredBlock) {
  const payload = {
    edit: props.edit,
    value: block ? cloneSelectorBlock(block) : undefined
  };

  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

async function renderCanonicalValue(block?: StoredBlock) {
  const currentEditor = editor;
  if (!currentEditor) return;

  isRenderingCanonicalValue = true;
  editorDataCache = buildOutput(block);

  try {
    await currentEditor.blocks.render(prepareEditorOutputWithEvents(editorDataCache));
  } finally {
    await nextTick();
    isRenderingCanonicalValue = false;
  }
}

async function syncFromEditorOutput(output: OutputData) {
  if (isRenderingCanonicalValue) return;

  const nextBlock = getSelectedBlockFromOutput(output);
  const previousSignature = getBlockSignature(selectedBlock.value);
  const nextSignature = getBlockSignature(nextBlock);

  selectedBlock.value = nextBlock ? cloneSelectorBlock(nextBlock) : undefined;
  editorDataCache = buildOutput(selectedBlock.value);

  if (previousSignature !== nextSignature) {
    emitValueChange(selectedBlock.value);
  }

  if (shouldRenderCanonicalOutput(output, selectedBlock.value)) {
    await renderCanonicalValue(selectedBlock.value);
  }
}

function clearScheduledEditorSync() {
  if (scheduledEditorSync === null) return;
  window.clearTimeout(scheduledEditorSync);
  scheduledEditorSync = null;
}

function scheduleEditorSync() {
  if (!editor || isRenderingCanonicalValue || isEditorInitializing) return;

  clearScheduledEditorSync();
  scheduledEditorSync = window.setTimeout(async () => {
    scheduledEditorSync = null;
    if (!editor || isRenderingCanonicalValue || isEditorInitializing) return;

    try {
      const output = finalizeEditorOutputWithEvents(await editor.save());
      await syncFromEditorOutput(output);
    } catch {
      // EditorJS can reject while a block is still being mounted; the next DOM/input event will sync again.
    }
  }, 0);
}

function startEditorSyncListeners() {
  const holder = holderRef.value;
  if (!holder) return;

  stopEditorSyncListeners();
  editorMutationObserver = new MutationObserver(() => {
    scheduleEditorSync();
  });
  editorMutationObserver.observe(holder, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  });

  holder.addEventListener('input', scheduleEditorSync);
  holder.addEventListener('change', scheduleEditorSync);
  holder.addEventListener('click', scheduleEditorSync);
}

function stopEditorSyncListeners() {
  const holder = holderRef.value;
  editorMutationObserver?.disconnect();
  editorMutationObserver = null;
  clearScheduledEditorSync();

  holder?.removeEventListener('input', scheduleEditorSync);
  holder?.removeEventListener('change', scheduleEditorSync);
  holder?.removeEventListener('click', scheduleEditorSync);
}

function getSelectorToolbar(root: HTMLElement) {
  return root.querySelector<HTMLElement>('.codex-editor > .ce-toolbar');
}

function getToolbarScope(root: HTMLElement) {
  return root.closest<HTMLElement>('[data-testid="editor-form-tool"]')
    ?? root.closest<HTMLElement>('[data-testid="editor-panel"]')
    ?? document;
}

function closePeerSelectorToolbars() {
  const root = rootRef.value;
  if (!root) return;

  getToolbarScope(root).querySelectorAll<HTMLElement>('.ce-editor-selector-tool').forEach((selectorRoot) => {
    if (selectorRoot === root) return;
    const toolbar = getSelectorToolbar(selectorRoot);
    toolbar?.classList.remove('ce-toolbar--opened');
  });
}

function syncSelectorToolbarState() {
  const root = rootRef.value;
  if (!root) return;

  closePeerSelectorToolbars();
}

function clearScheduledToolbarSync() {
  if (scheduledToolbarSync === null) return;
  window.clearTimeout(scheduledToolbarSync);
  scheduledToolbarSync = null;
}

function scheduleSelectorToolbarSync() {
  clearScheduledToolbarSync();
  scheduledToolbarSync = window.setTimeout(() => {
    scheduledToolbarSync = null;
    syncSelectorToolbarState();
  }, 0);
}

async function mountEditor() {
  if (!props.edit || !holderRef.value || editor) return;

  const { default: EditorJSConstructor } = await import('@editorjs/editorjs');
  clientBlockDocsCache = await loadClientBlockDocs();
  const holder = holderRef.value;
  if (!props.edit || !holder?.isConnected || editor) return;
  editorDataCache = buildOutput(selectedBlock.value);
  const tools = createEditorTools(
    { edit: true },
    { exclude: getExcludedToolNames(), docs: clientBlockDocsCache }
  ) as Record<string, ToolSettings>;

  isEditorInitializing = true;
  const nextEditor = new EditorJSConstructor({
    holder,
    placeholder: t('editorSelector.placeholder'),
    tools,
    data: prepareEditorOutputWithEvents(editorDataCache),
    minHeight: 0,
    i18n: {
      messages: getEditorJsI18nMessages(localeValue.value)
    },
    onChange: async () => {
      if (editor !== nextEditor || isEditorInitializing) return;
      const output = finalizeEditorOutputWithEvents(await nextEditor.save());
      await syncFromEditorOutput(output);
    }
  });
  editor = nextEditor;

  void (async () => {
    try {
      await nextEditor.isReady;
      await waitForEditorToolMounts(holder);
    } catch {
      if (editor === nextEditor) editor = null;
      isEditorInitializing = false;
      return;
    }

    if (editor !== nextEditor || !holder.isConnected) {
      isEditorInitializing = false;
      return;
    }

    isEditorInitializing = false;
    startEditorSyncListeners();
  })();
}

async function waitForEditorToolMounts(holder: HTMLElement) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (!holder.isConnected || !holder.querySelector('[data-testid="editor-tool-loading"]')) return;
    await new Promise<void>((resolve) => window.setTimeout(resolve, 25));
  }
}

async function unmountEditor() {
  const currentEditor = editor;
  if (!currentEditor) return;
  editor = null;
  isEditorInitializing = false;
  stopEditorSyncListeners();

  try {
    await currentEditor.isReady;
    const output = finalizeEditorOutputWithEvents(await currentEditor.save());
    selectedBlock.value = getSelectedBlockFromOutput(output);
    editorDataCache = buildOutput(selectedBlock.value);
  } catch {
    editorDataCache = buildOutput(selectedBlock.value);
  }

  if (typeof currentEditor.destroy === 'function') {
    currentEditor.destroy();
  }
}

async function rebuildEditor() {
  await unmountEditor();
  await nextTick();
  await mountEditor();
}

onMounted(async () => {
  await mountEditor();
});

watch(
  () => props.value,
  async (value) => {
    const nextBlock = normalizeSelectorBlock(value);
    if (getBlockSignature(nextBlock) === getBlockSignature(selectedBlock.value)) return;

    selectedBlock.value = nextBlock;
    editorDataCache = buildOutput(nextBlock);

    if (editor) {
      await renderCanonicalValue(nextBlock);
    }
  },
  { deep: true }
);

watch(
  () => props.edit,
  async (edit) => {
    if (edit) {
      await nextTick();
      await mountEditor();
      return;
    }

    await unmountEditor();
  }
);

watch(localeValue, async () => {
  if (!editor) return;
  await rebuildEditor();
});

watch(
  () => props.excludeToolNames,
  async () => {
    if (!editor) return;
    await rebuildEditor();
  },
  { deep: true }
);

onBeforeUnmount(async () => {
  clearScheduledToolbarSync();
  await unmountEditor();
});
<\/script>

<template>
  <div
    ref="rootRef"
    class="ce-editor-selector-tool"
    :class="{ 'ce-editor-selector-tool--filled': hasSelectedBlock }"
    data-testid="editor-selector-tool"
    @mouseenter="scheduleSelectorToolbarSync"
    @mousemove="scheduleSelectorToolbarSync"
  >
    <div
      v-if="edit"
      class="ce-editor-selector-tool__editor-shell"
      :class="{ 'ce-editor-selector-tool__editor-shell--filled': hasSelectedBlock }"
      data-testid="editor-selector-shell"
    >
      <div ref="holderRef" class="ce-editor-selector-tool__editor" data-testid="editor-selector-surface"></div>
    </div>

    <div v-else class="ce-editor-selector-tool__preview" data-testid="preview-editor-selector-value">
      <MokelayBlockRenderer v-if="selectedBlock" :block="selectedBlock" />
    </div>
  </div>
</template>

<style scoped>
.ce-editor-selector-tool {
  position: relative;
  width: 100%;
}

.ce-editor-selector-tool__editor-shell,
.ce-editor-selector-tool__preview {
  position: relative;
  width: 100%;
  min-height: 38px;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-editor-selector-tool__editor-shell {
  height: 38px;
  padding: 0 10px 0 38px;
  overflow: visible;
}

.ce-editor-selector-tool__editor-shell--filled {
  height: auto;
  padding-top: 4px;
  padding-bottom: 4px;
}

.ce-editor-selector-tool__editor,
.ce-editor-selector-tool__preview {
  min-height: 0;
}

.ce-editor-selector-tool__preview {
  display: flex;
  align-items: center;
  padding: 7px 10px;
}

.ce-editor-selector-tool__preview:empty {
  padding: 0 10px;
}

.ce-editor-selector-tool :deep(.codex-editor) {
  min-height: 0;
}

.ce-editor-selector-tool :deep(.codex-editor__redactor) {
  min-height: 0;
  padding-bottom: 0 !important;
}

.ce-editor-selector-tool :deep(.ce-block) {
  padding: 0;
}

.ce-editor-selector-tool :deep(.ce-block__content),
.ce-editor-selector-tool :deep(.ce-toolbar__content) {
  max-width: none;
  margin: 0;
}

.ce-editor-selector-tool :deep(.ce-toolbar__actions) {
  right: calc(100% + 8px);
  padding-right: 0;
}

.ce-editor-selector-tool :deep(.ce-paragraph) {
  min-height: 36px;
  padding: 8px 0;
  line-height: 20px;
  font-size: 14px;
}

.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-block),
.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-block__content),
.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-paragraph) {
  min-height: 0;
  height: 36px;
}

.ce-editor-selector-tool:not(.ce-editor-selector-tool--filled) :deep(.ce-paragraph) {
  padding: 8px 0;
}

.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='paragraph']),
.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='table']),
.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='columns']),
.ce-editor-selector-tool :deep(.ce-popover-item[data-item-name='MEditorSelector']) {
  display: none;
}

.dark .ce-editor-selector-tool__editor-shell,
.dark .ce-editor-selector-tool__preview {
  border-color: rgb(71 85 105 / 0.9);
  background: rgb(15 23 42);
}
</style>
`,R=`<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { bodyDataTypes } from 'mokelay-components/datasource';
import { isRecord } from 'mokelay-components/datasource';

export interface MFieldsEditorField {
  label: string;
  variable: string;
  dataType: string;
}

export interface MFieldsEditorProps {
  edit: boolean;
  value?: MFieldsEditorField[];
}

const fieldDataTypeOptions = bodyDataTypes;

function normalizeFieldsEditorDataType(value: unknown) {
  return fieldDataTypeOptions.includes(value as typeof fieldDataTypeOptions[number])
    ? value as string
    : 'string';
}

function normalizeFieldsEditorField(value: unknown): MFieldsEditorField | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = typeof value.label === 'string' ? value.label.trim() : '';
  const variable = typeof value.variable === 'string' ? value.variable.trim() : '';
  if (!label || !variable) {
    return undefined;
  }

  return {
    label,
    variable,
    dataType: normalizeFieldsEditorDataType(value.dataType)
  };
}

export function normalizeFieldsEditorValue(value: unknown): MFieldsEditorField[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const fieldsByVariable = new Map<string, MFieldsEditorField>();
  value.forEach((item) => {
    const field = normalizeFieldsEditorField(item);
    if (field && !fieldsByVariable.has(field.variable)) {
      fieldsByVariable.set(field.variable, field);
    }
  });

  return [...fieldsByVariable.values()];
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MFieldsEditor",
 *   "displayName": "字段编辑器",
 *   "category": "form",
 *   "description": "字段编辑器，用于维护字段名、类型、标签和表单字段配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MFieldsEditor",
 *     "toolSymbol": "mFieldsEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 160
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "字段编辑器",
 *       "en": "Fields Editor"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"5\\" width=\\"16\\" height=\\"14\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 9h8M8 13h8M8 17h5\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MFieldsEditorField[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFieldsEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段配置"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "field.label"
 *       },
 *       "variable": "field.variable",
 *       "dataType": "normalizeFieldsEditorDataType(field.dataType)",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFieldsEditor.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "candidate.label.trim()"
 *       },
 *       "variable": "candidate.variable.trim()",
 *       "dataType": "normalizeFieldsEditorDataType(candidate.dataType)",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFieldsEditor.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "item.key.trim()"
 *       },
 *       "variable": "item.key.trim()",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFieldsEditor.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "field.label"
 *       },
 *       "variable": "field.path",
 *       "dataType": "normalizeFieldsEditorDataType(field.type)",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFieldsEditor.vue"
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
 *       "id": "MFieldsEditor-example",
 *       "type": "MFieldsEditor",
 *       "data": {
 *         "value": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MFieldsEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MFieldsEditor.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFieldsEditorTool = defineEditorTool<MFieldsEditorProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeFieldsEditorValue(props.value)
  }),
  serialize: (props) => ({
    value: normalizeFieldsEditorValue(props.value)
  })
});
<\/script>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import DatasourceApiImportDialog, {
  type DatasourceApiImportSource
} from '@/editors/dialogs/DatasourceApiImportDialog.vue';
import DatasourceResponseMockDialog, {
  type DatasourceResponseMockCapturePayload
} from '@/editors/dialogs/DatasourceResponseMockDialog.vue';
import { useEditorBlockToolbarAlignment } from '@/composables/useEditorBlockToolbarAlignment';
import { useI18n } from '@/i18n';
import {
  $remote as resolveDatasourceRemote,
  DatasourceError,
  bodyDataTypes as setupBodyDataTypes,
  getDefaultApiDatasource,
  normalizeBodyValue,
  normalizeDatasource,
  type DatasourceRequestOptions,
  type MDatasourceApiObject,
  type MDatasourceBodyItem,
  type JsonValue
} from 'mokelay-components/datasource';
import {
  getSchemaSelectionFields,
  inferJSONSchema,
  type SchemaSelectionField
} from 'mokelay-components/datasource';
import { translateTextsToChinese } from '@/utils/translationsApi';
import type { ImportedApiDatasource } from '@/utils/datasourceApiImport';
import {
  getDefaultApiDomainUuid,
  listApiDomains,
  normalizeApiDomainUuid,
  type ApiDomainRecord
} from 'mokelay-components/datasource';

type FieldsEditorCandidateSource = 'saved' | 'manual' | 'api' | 'response';

type FieldsEditorCandidate = MFieldsEditorField & {
  id: string;
  selected: boolean;
  source: FieldsEditorCandidateSource;
};

const props = defineProps<MFieldsEditorProps & {
  onChange?: (payload: MFieldsEditorProps) => void;
  onToolChange?: (payload: MFieldsEditorProps) => void;
}>();

const { t } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const fieldsDraft = ref<FieldsEditorCandidate[]>([]);
const availableFieldsDraft = ref<FieldsEditorCandidate[]>([]);
const availableFieldSearch = ref('');
const validationError = ref('');
const fieldTranslationLoading = ref(false);
const fieldTranslationError = ref('');
const apiImportSource = ref<DatasourceApiImportSource>('mokelay');
const isApiImportDialogOpen = ref(false);
const importedDatasource = shallowRef<MDatasourceApiObject | null>(null);
const apiDomainOptions = ref<ApiDomainRecord[]>([]);
const apiDomainLoading = ref(false);
const apiDomainError = ref('');
const hasLoadedApiDomains = ref(false);
const isResponseMockDialogOpen = ref(false);
const responseMockDomain = ref('');
const responseCaptureLoading = ref(false);
const responseCaptureError = ref('');
const committedFields = ref<MFieldsEditorField[]>(normalizeFieldsEditorValue(props.value));
const fieldOptions = setupBodyDataTypes;
let fieldCandidateId = 0;

const savedFields = computed(() => committedFields.value);
const savedFieldCount = computed(() => savedFields.value.length);
const selectedDraftCount = computed(() => fieldsDraft.value.length);
const isReadOnly = computed(() => !props.edit);
const visibleAvailableFields = computed(() => {
  const selectedVariables = new Set(fieldsDraft.value.map((field) => field.variable.trim()).filter(Boolean));
  const search = availableFieldSearch.value.trim().toLowerCase();

  return availableFieldsDraft.value
    .map((field) => ({
      ...field,
      selected: selectedVariables.has(field.variable.trim())
    }))
    .filter((field) => {
      if (!search) return true;
      return field.label.toLowerCase().includes(search) ||
        field.variable.toLowerCase().includes(search) ||
        field.dataType.toLowerCase().includes(search);
    });
});
const responseMockBodyEntries = computed(() => (importedDatasource.value?.bodyData ?? [])
  .map((item, index) => ({ item, index }))
  .filter(({ item }) => item.key.trim()));
const responseMockHeaderData = computed(() => (importedDatasource.value?.headerData ?? [])
  .filter((item) => item.key.trim())
  .map((item) => ({ ...item })));
const responseMockQueryData = computed(() => (importedDatasource.value?.queryData ?? [])
  .filter((item) => item.key.trim())
  .map((item) => ({ ...item })));
const responseMockBodyData = computed<MDatasourceBodyItem[]>(() => responseMockBodyEntries.value.map(({ item }) => ({
  key: item.key,
  dataType: item.dataType,
  value: normalizeBodyValue(item.dataType, item.value)
})));
const responseMockBodyFiles = computed(() => responseMockBodyEntries.value.map(() => undefined));

useEditorBlockToolbarAlignment(rootRef);

function normalizeApiDatasource(value: unknown): MDatasourceApiObject {
  const normalized = normalizeDatasource(value);
  return normalized.type === 'API' ? normalized : getDefaultApiDatasource();
}

function createCandidate(
  field: MFieldsEditorField,
  selected: boolean,
  source: FieldsEditorCandidateSource
): FieldsEditorCandidate {
  return {
    id: \`fields-editor-field-\${fieldCandidateId++}\`,
    label: field.label,
    variable: field.variable,
    dataType: normalizeFieldsEditorDataType(field.dataType),
    selected,
    source
  };
}

function createDraftFromSavedValue() {
  fieldsDraft.value = savedFields.value.map((field) => createCandidate(field, true, 'saved'));
  availableFieldsDraft.value = [];
  availableFieldSearch.value = '';
  validationError.value = '';
  fieldTranslationError.value = '';
  responseCaptureError.value = '';
  responseMockDomain.value = '';
  apiDomainError.value = '';
  importedDatasource.value = null;
}

function getCandidateField(candidate: FieldsEditorCandidate): MFieldsEditorField {
  return {
    label: candidate.label.trim(),
    variable: candidate.variable.trim(),
    dataType: normalizeFieldsEditorDataType(candidate.dataType)
  };
}

function emitFields(value: MFieldsEditorField[]) {
  if (!props.edit) return;

  const payload: MFieldsEditorProps = {
    edit: props.edit,
    value: normalizeFieldsEditorValue(value)
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function openSettingsDialog() {
  createDraftFromSavedValue();
  isSettingsDialogOpen.value = true;
  if (!settingsDialogRef.value?.open) {
    settingsDialogRef.value?.showModal();
  }
}

function closeSettingsDialog() {
  isSettingsDialogOpen.value = false;
  if (settingsDialogRef.value?.open) {
    settingsDialogRef.value.close();
  }
}

function addField() {
  if (isReadOnly.value) return;

  fieldsDraft.value.push(createCandidate({
    label: '',
    variable: '',
    dataType: 'string'
  }, true, 'manual'));
}

function addAvailableField(field: FieldsEditorCandidate) {
  if (isReadOnly.value || field.selected) return;

  const normalized = normalizeFieldsEditorValue([field])[0];
  if (!normalized) return;

  fieldsDraft.value.push(createCandidate(normalized, true, field.source));
  validationError.value = '';
}

function updateField(index: number, field: keyof MFieldsEditorField, value: string) {
  if (isReadOnly.value) return;

  const item = fieldsDraft.value[index];
  if (!item) return;

  item[field] = field === 'dataType' ? normalizeFieldsEditorDataType(value) : value;
  validationError.value = '';
}

function removeField(index: number) {
  if (isReadOnly.value) return;

  fieldsDraft.value.splice(index, 1);
  validationError.value = '';
}

function mergeFieldCandidates(fields: MFieldsEditorField[], source: FieldsEditorCandidateSource) {
  if (isReadOnly.value) return;

  const existingVariables = new Set(
    availableFieldsDraft.value
      .map((field) => field.variable.trim())
      .filter(Boolean)
  );
  const nextFields = [...availableFieldsDraft.value];

  fields.forEach((field) => {
    const normalized = normalizeFieldsEditorValue([field])[0];
    if (!normalized || existingVariables.has(normalized.variable)) {
      return;
    }

    nextFields.push(createCandidate(normalized, true, source));
    existingVariables.add(normalized.variable);
  });

  availableFieldsDraft.value = nextFields;
  availableFieldSearch.value = '';
  validationError.value = '';
}

function getRequestFieldsFromDatasource(datasource: MDatasourceApiObject): MFieldsEditorField[] {
  const headerFields = datasource.headerData
    .filter((item) => item.key.trim())
    .map((item) => ({
      label: item.key.trim(),
      variable: item.key.trim(),
      dataType: 'string'
    }));
  const queryFields = datasource.queryData
    .filter((item) => item.key.trim())
    .map((item) => ({
      label: item.key.trim(),
      variable: item.key.trim(),
      dataType: 'string'
    }));
  const bodyFields = datasource.bodyData
    .filter((item) => item.key.trim())
    .map((item) => ({
      label: item.key.trim(),
      variable: item.key.trim(),
      dataType: normalizeFieldsEditorDataType(item.dataType)
    }));

  return [...headerFields, ...queryFields, ...bodyFields];
}

function getNormalizedImportedDatasourceDomain() {
  const datasourceDomain = importedDatasource.value?.domain ?? '';
  if (!apiDomainOptions.value.length) {
    return responseMockDomain.value || datasourceDomain;
  }

  return normalizeApiDomainUuid(responseMockDomain.value, apiDomainOptions.value) ||
    normalizeApiDomainUuid(datasourceDomain, apiDomainOptions.value) ||
    getDefaultApiDomainUuid(apiDomainOptions.value);
}

function updateImportedDatasourceDomain(domain: string) {
  const datasource = importedDatasource.value;
  if (!datasource || !domain || datasource.domain === domain) {
    return;
  }

  importedDatasource.value = normalizeApiDatasource({
    ...datasource,
    domain
  });
}

function normalizeImportedDatasourceDomain() {
  const domain = getNormalizedImportedDatasourceDomain();
  if (!domain) {
    return;
  }

  responseMockDomain.value = domain;
  updateImportedDatasourceDomain(domain);
}

async function ensureApiDomainOptions(force = false) {
  if (!force && hasLoadedApiDomains.value) {
    normalizeImportedDatasourceDomain();
    return;
  }

  apiDomainLoading.value = true;
  apiDomainError.value = '';

  try {
    apiDomainOptions.value = await listApiDomains(force);
    hasLoadedApiDomains.value = true;
    normalizeImportedDatasourceDomain();
  } catch (error) {
    apiDomainError.value = error instanceof Error ? error.message : String(error);
  } finally {
    apiDomainLoading.value = false;
  }
}

function applyImportedApiDatasource(imported: ImportedApiDatasource) {
  importedDatasource.value = normalizeApiDatasource(imported.datasource);
  responseMockDomain.value = importedDatasource.value.domain;
  mergeFieldCandidates(getRequestFieldsFromDatasource(importedDatasource.value), 'api');
  responseCaptureError.value = '';
  void ensureApiDomainOptions();
  mergeImportedResponseFields(imported);
}

function openApiImportDialog(source: DatasourceApiImportSource) {
  if (isReadOnly.value) return;

  apiImportSource.value = source;
  isApiImportDialogOpen.value = true;
}

function closeApiImportDialog() {
  isApiImportDialogOpen.value = false;
}

function hasConfiguredRequestKeys(datasource: MDatasourceApiObject) {
  return datasource.headerData.some((item) => item.key.trim()) ||
    datasource.queryData.some((item) => item.key.trim()) ||
    datasource.bodyData.some((item) => item.key.trim());
}

function getDatasourceErrorMessage(error: unknown) {
  if (error instanceof DatasourceError) {
    if (error.code === 'apiRequestFailed') {
      return \`\${t('datasource.validation.apiRequestFailed')} \${error.status ?? ''} \${error.statusText ?? ''}\`.trim();
    }

    return t(\`datasource.validation.\${error.code}\`);
  }

  return error instanceof Error ? error.message : String(error);
}

function inferResponseFieldsFromData(data: JsonValue): MFieldsEditorField[] {
  const inferredSchema = inferJSONSchema(data);
  if (!inferredSchema.ok) {
    if (inferredSchema.reason === 'emptyArray') {
      throw new DatasourceError('emptyArraySchema', 'Cannot infer JSON Schema from an empty array.');
    }

    throw new DatasourceError('mixedArraySchema', 'The array contains incompatible types, so JSON Schema cannot be inferred.');
  }

  return getSchemaSelectionFields(inferredSchema.schema).map((field: SchemaSelectionField) => ({
    label: field.label,
    variable: field.path,
    dataType: normalizeFieldsEditorDataType(field.type)
  }));
}

function getImportedResponseFields(imported: ImportedApiDatasource) {
  if (apiImportSource.value !== 'apifox') {
    return [];
  }

  return (imported.responseExamples ?? []).flatMap((example) => inferResponseFieldsFromData(example));
}

function mergeImportedResponseFields(imported: ImportedApiDatasource) {
  if (!imported.responseExamples?.length) {
    return;
  }

  try {
    mergeFieldCandidates(getImportedResponseFields(imported), 'response');
  } catch (error) {
    responseCaptureError.value = getDatasourceErrorMessage(error);
  }
}

async function runResponseCapture(datasource: MDatasourceApiObject, options?: DatasourceRequestOptions) {
  if (responseCaptureLoading.value) return;

  responseCaptureLoading.value = true;
  responseCaptureError.value = '';

  try {
    const responseData = await resolveDatasourceRemote(datasource, options);
    mergeFieldCandidates(inferResponseFieldsFromData(responseData), 'response');
    closeResponseMockDialog();
  } catch (error) {
    responseCaptureError.value = getDatasourceErrorMessage(error);
  } finally {
    responseCaptureLoading.value = false;
  }
}

async function captureResponseFields() {
  if (isReadOnly.value || responseCaptureLoading.value) return;

  const datasource = importedDatasource.value;
  if (!datasource) {
    responseCaptureError.value = t('fieldsEditor.validation.missingImportedApi');
    return;
  }

  await ensureApiDomainOptions();
  if (apiDomainError.value) {
    responseCaptureError.value = apiDomainError.value;
    return;
  }

  const domain = getNormalizedImportedDatasourceDomain();
  if (!domain) {
    responseCaptureError.value = t('datasource.validation.missingApiDomain');
    return;
  }

  responseMockDomain.value = domain;
  const datasourceWithDomain = normalizeApiDatasource({
    ...datasource,
    domain
  });
  updateImportedDatasourceDomain(domain);

  if (hasConfiguredRequestKeys(datasourceWithDomain)) {
    responseCaptureError.value = '';
    isResponseMockDialogOpen.value = true;
    return;
  }

  void runResponseCapture(datasourceWithDomain);
}

function closeResponseMockDialog() {
  isResponseMockDialogOpen.value = false;
}

function captureResponseFieldsWithMock(payload: DatasourceResponseMockCapturePayload) {
  const datasource = importedDatasource.value;
  if (!datasource || responseCaptureLoading.value) return;

  const domain = payload.domain?.trim() || getNormalizedImportedDatasourceDomain();
  if (!domain) {
    responseCaptureError.value = t('datasource.validation.missingApiDomain');
    return;
  }

  responseMockDomain.value = domain;
  updateImportedDatasourceDomain(domain);
  void runResponseCapture(normalizeApiDatasource({
    ...datasource,
    domain,
    headerData: payload.headerData,
    queryData: payload.queryData,
    bodyData: payload.bodyData
  }), payload.options);
}

function validateSelectedFields() {
  const selectedFields = fieldsDraft.value.map((field) => getCandidateField(field));

  for (const field of selectedFields) {
    if (!field.label || !field.variable) {
      return {
        ok: false as const,
        error: t('fieldsEditor.validation.required')
      };
    }
  }

  const variables = new Set<string>();
  for (const field of selectedFields) {
    if (variables.has(field.variable)) {
      return {
        ok: false as const,
        error: t('fieldsEditor.validation.duplicateVariable')
      };
    }

    variables.add(field.variable);
  }

  return {
    ok: true as const,
    value: selectedFields
  };
}

async function translateSelectedFieldLabels() {
  if (isReadOnly.value || fieldTranslationLoading.value || !fieldsDraft.value.length) return;

  fieldTranslationLoading.value = true;
  fieldTranslationError.value = '';
  try {
    const translations = await translateTextsToChinese(fieldsDraft.value.map((field) => field.label));
    fieldsDraft.value = fieldsDraft.value.map((field) => ({
      ...field,
      label: translations[field.label] ?? field.label
    }));
  } catch {
    fieldTranslationError.value = t('fieldsEditor.validation.translateFieldsFailed');
  } finally {
    fieldTranslationLoading.value = false;
  }
}

function getVariableTail(variable: string) {
  const normalized = variable.trim();
  if (!normalized) return '';

  const tail = normalized.split('.').filter(Boolean).pop() ?? normalized;
  return tail.replace(/\\[\\]$/g, '') || normalized;
}

function truncateSelectedFieldVariablesToTail() {
  if (isReadOnly.value || !fieldsDraft.value.length) return;

  fieldsDraft.value = fieldsDraft.value.map((field) => ({
    ...field,
    variable: getVariableTail(field.variable)
  }));
  validationError.value = '';
}

function saveFields() {
  if (isReadOnly.value) return;

  const validation = validateSelectedFields();
  if (!validation.ok) {
    validationError.value = validation.error;
    return;
  }

  const normalizedValue = normalizeFieldsEditorValue(validation.value);
  committedFields.value = normalizedValue;
  emitFields(normalizedValue);
  closeSettingsDialog();
}

watch(
  () => props.value,
  (value) => {
    committedFields.value = normalizeFieldsEditorValue(value);
    if (!isSettingsDialogOpen.value) {
      createDraftFromSavedValue();
    }
  },
  { deep: true, immediate: true }
);
<\/script>

<template>
  <div ref="rootRef" class="ce-fields-editor" data-testid="editor-fields-tool">
    <div class="ce-fields-editor__trigger-row">
      <button
        class="ce-fields-editor__settings-button"
        type="button"
        data-testid="fields-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('fieldsEditor.actions.settings') }}
      </button>
      <div class="ce-fields-editor__summary" data-testid="fields-summary">
        {{ t('fieldsEditor.summary.savedCount').replace('{count}', String(savedFieldCount)) }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-fields-editor__dialog"
      data-testid="fields-settings-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="fields-settings-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-fields-editor__dialog-panel">
        <div class="ce-fields-editor__dialog-header">
          <h3
            id="fields-settings-dialog-title"
            class="ce-fields-editor__dialog-title"
            data-testid="fields-settings-dialog-title"
          >
            {{ t('fieldsEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-fields-editor__secondary-button"
            type="button"
            data-testid="fields-settings-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-fields-editor__dialog-body">
          <section v-if="edit" class="ce-fields-editor__section" data-testid="fields-import-section">
            <div class="ce-fields-editor__section-header">
              <div>
                <div class="ce-fields-editor__section-title">{{ t('fieldsEditor.sections.importApi') }}</div>
                <p class="ce-fields-editor__section-copy">{{ t('fieldsEditor.help.importApi') }}</p>
              </div>
            </div>
            <div class="ce-fields-editor__section-body">
              <div class="ce-fields-editor__import-actions">
                <button
                  class="ce-fields-editor__import-button"
                  type="button"
                  data-testid="fields-import-open-mokelay"
                  @click="openApiImportDialog('mokelay')"
                >
                  {{ t('datasource.import.sources.mokelay') }}
                </button>
                <button
                  class="ce-fields-editor__import-button"
                  type="button"
                  data-testid="fields-import-open-apifox"
                  @click="openApiImportDialog('apifox')"
                >
                  {{ t('datasource.import.sources.apifox') }}
                </button>
                <button
                  class="ce-fields-editor__primary-button"
                  type="button"
                  data-testid="fields-capture-response-fields"
                  :disabled="!importedDatasource || responseCaptureLoading || apiDomainLoading"
                  @click="captureResponseFields"
                >
                  {{ responseCaptureLoading
                    ? t('fieldsEditor.actions.capturingResponseFields')
                    : t('fieldsEditor.actions.captureResponseFields') }}
                </button>
              </div>
              <p v-if="responseCaptureError" class="ce-fields-editor__error" data-testid="fields-response-capture-error">
                {{ responseCaptureError }}
              </p>
            </div>
          </section>

          <section
            v-if="edit && availableFieldsDraft.length"
            class="ce-fields-editor__section ce-fields-editor__section--available"
            data-testid="fields-available-section"
          >
            <div class="ce-fields-editor__section-header">
              <div>
                <div class="ce-fields-editor__section-title">{{ t('fieldsEditor.sections.availableFields') }}</div>
                <p class="ce-fields-editor__section-copy">{{ t('fieldsEditor.help.availableFields') }}</p>
              </div>
            </div>
            <div class="ce-fields-editor__section-body ce-fields-editor__section-body--available">
              <label class="ce-fields-editor__field">
                <span class="ce-fields-editor__label">{{ t('fieldsEditor.columns.variable') }}</span>
                <input
                  class="ce-fields-editor__input"
                  data-testid="fields-available-search"
                  type="search"
                  :placeholder="t('fieldsEditor.placeholders.searchFields')"
                  :value="availableFieldSearch"
                  @input="availableFieldSearch = ($event.target as HTMLInputElement).value"
                  @keydown.stop
                />
              </label>

              <div
                v-if="visibleAvailableFields.length"
                class="ce-fields-editor__available-list"
                data-testid="fields-available-list"
              >
                <div
                  v-for="field in visibleAvailableFields"
                  :key="field.id"
                  class="ce-fields-editor__available-field"
                  :data-testid="\`fields-available-field-\${field.variable}\`"
                >
                  <span class="ce-fields-editor__available-main">
                    <span class="ce-fields-editor__available-label">{{ field.label }}</span>
                    <span class="ce-fields-editor__available-variable">{{ field.variable }}</span>
                  </span>
                  <span class="ce-fields-editor__available-actions">
                    <span class="ce-fields-editor__badge">{{ field.dataType }}</span>
                    <button
                      class="ce-fields-editor__field-action"
                      type="button"
                      :disabled="isReadOnly || field.selected"
                      :data-testid="\`fields-available-add-\${field.variable}\`"
                      @click="addAvailableField(field)"
                    >
                      {{ field.selected ? t('fieldsEditor.actions.added') : t('fieldsEditor.actions.addCandidate') }}
                    </button>
                  </span>
                </div>
              </div>
              <p
                v-else
                class="ce-fields-editor__empty"
                data-testid="fields-available-empty"
              >
                {{ t('fieldsEditor.emptySearch') }}
              </p>
            </div>
          </section>

          <section
            class="ce-fields-editor__section ce-fields-editor__section--fields"
            data-testid="fields-list-section"
          >
            <div class="ce-fields-editor__section-header">
              <div>
                <div class="ce-fields-editor__section-title">{{ t('fieldsEditor.sections.fields') }}</div>
                <p class="ce-fields-editor__section-copy">
                  {{ t('fieldsEditor.summary.selectedCount').replace('{count}', String(selectedDraftCount)) }}
                </p>
              </div>
              <div v-if="edit" class="ce-fields-editor__section-actions">
                <button
                  class="ce-fields-editor__secondary-button"
                  type="button"
                  data-testid="fields-add"
                  @click="addField"
                >
                  {{ t('fieldsEditor.actions.add') }}
                </button>
                <button
                  class="ce-fields-editor__secondary-button"
                  type="button"
                  data-testid="fields-translate-labels"
                  :disabled="fieldTranslationLoading || !fieldsDraft.length"
                  @click="translateSelectedFieldLabels"
                >
                  {{ fieldTranslationLoading
                    ? t('fieldsEditor.actions.translatingLabels')
                    : t('fieldsEditor.actions.translateLabels') }}
                </button>
                <button
                  class="ce-fields-editor__secondary-button"
                  type="button"
                  data-testid="fields-truncate-variables"
                  :disabled="!fieldsDraft.length"
                  @click="truncateSelectedFieldVariablesToTail"
                >
                  {{ t('fieldsEditor.actions.truncateVariables') }}
                </button>
              </div>
            </div>

            <div class="ce-fields-editor__section-body ce-fields-editor__section-body--fields">
              <p v-if="!fieldsDraft.length" class="ce-fields-editor__empty" data-testid="fields-empty">
                {{ t('fieldsEditor.empty') }}
              </p>

              <div v-else class="ce-fields-editor__table" data-testid="fields-list">
                <div class="ce-fields-editor__table-head" aria-hidden="true">
                  <span>{{ t('fieldsEditor.columns.label') }}</span>
                  <span>{{ t('fieldsEditor.columns.variable') }}</span>
                  <span>{{ t('fieldsEditor.columns.dataType') }}</span>
                  <span>{{ t('fieldsEditor.columns.actions') }}</span>
                </div>

                <div
                  v-for="(field, index) in fieldsDraft"
                  :key="field.id"
                  class="ce-fields-editor__row"
                  :data-testid="\`fields-row-\${index}\`"
                >
                  <input
                    class="ce-fields-editor__input"
                    :data-testid="\`fields-label-\${index}\`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('fieldsEditor.placeholders.label')"
                    :value="field.label"
                    @input="updateField(index, 'label', ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-fields-editor__input"
                    :data-testid="\`fields-variable-\${index}\`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('fieldsEditor.placeholders.variable')"
                    :value="field.variable"
                    @input="updateField(index, 'variable', ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <select
                    class="ce-fields-editor__input"
                    :data-testid="\`fields-data-type-\${index}\`"
                    :disabled="isReadOnly"
                    :value="field.dataType"
                    @change="updateField(index, 'dataType', ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="dataType in fieldOptions" :key="dataType" :value="dataType">
                      {{ dataType }}
                    </option>
                  </select>
                  <button
                    v-if="edit"
                    class="ce-fields-editor__danger-button"
                    type="button"
                    :data-testid="\`fields-remove-\${index}\`"
                    @click="removeField(index)"
                  >
                    {{ t('fieldsEditor.actions.remove') }}
                  </button>
                </div>
              </div>

              <p v-if="validationError" class="ce-fields-editor__error" data-testid="fields-validation-error">
                {{ validationError }}
              </p>
              <p v-if="fieldTranslationError" class="ce-fields-editor__error" data-testid="fields-translation-error">
                {{ fieldTranslationError }}
              </p>
            </div>
          </section>
        </div>

        <div class="ce-fields-editor__dialog-actions">
          <button
            class="ce-fields-editor__secondary-button"
            type="button"
            data-testid="fields-cancel"
            @click="closeSettingsDialog"
          >
            {{ edit ? t('fieldsEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-fields-editor__primary-button"
            type="button"
            data-testid="fields-save"
            @click="saveFields"
          >
            {{ t('fieldsEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>

    <Teleport to="body">
      <DatasourceApiImportDialog
        v-if="edit"
        :open="isApiImportDialogOpen"
        :source="apiImportSource"
        :current-domain="responseMockDomain || importedDatasource?.domain"
        :readonly="isReadOnly"
        @close="closeApiImportDialog"
        @imported="applyImportedApiDatasource"
      />
    </Teleport>

    <Teleport to="body">
      <DatasourceResponseMockDialog
        v-if="edit"
        :open="isResponseMockDialogOpen"
        :domain="responseMockDomain || importedDatasource?.domain"
        :api-domains="apiDomainOptions"
        :domain-loading="apiDomainLoading"
        :domain-error="apiDomainError"
        :method="importedDatasource?.method"
        :header-data="responseMockHeaderData"
        :query-data="responseMockQueryData"
        :body-data="responseMockBodyData"
        :body-files="responseMockBodyFiles"
        :loading="responseCaptureLoading"
        :error="responseCaptureError"
        @close="closeResponseMockDialog"
        @capture="captureResponseFieldsWithMock"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.ce-fields-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-fields-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-fields-editor__settings-button,
.ce-fields-editor__primary-button {
  flex: 0 0 auto;
  min-height: 34px;
  border: 1px solid rgb(20 184 166 / 0.55);
  border-radius: 8px;
  padding: 6px 14px;
  background: rgb(20 184 166);
  color: rgb(255 255 255);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.ce-fields-editor__settings-button:hover,
.ce-fields-editor__primary-button:hover {
  background: rgb(13 148 136);
}

.ce-fields-editor__primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ce-fields-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-fields-editor__dialog {
  width: min(calc(100vw - 32px), 1040px);
  max-height: min(calc(100vh - 32px), 860px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-fields-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-fields-editor__dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__dialog-header,
.ce-fields-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
}

.ce-fields-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-fields-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 700;
}

.ce-fields-editor__dialog-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  padding: 12px;
}

.ce-fields-editor__section {
  display: flex;
  min-height: 0;
  flex: 0 0 auto;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__section--fields {
  flex: 0 1 auto;
}

.ce-fields-editor__section--available {
  flex: 0 1 auto;
}

.ce-fields-editor__section-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
  background: rgb(248 250 252);
}

.ce-fields-editor__section-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.ce-fields-editor__section-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.ce-fields-editor__section-body--fields {
  flex: 0 1 auto;
  max-height: min(48vh, 520px);
  overflow: auto;
}

.ce-fields-editor__section-body--available {
  flex: 0 1 auto;
  max-height: min(34vh, 360px);
  overflow: auto;
}

.ce-fields-editor__section-title {
  color: rgb(15 23 42);
  font-size: 15px;
  font-weight: 700;
}

.ce-fields-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-fields-editor__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.ce-fields-editor__label {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-fields-editor__import-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ce-fields-editor__available-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  align-items: start;
}

.ce-fields-editor__available-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 7px 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__available-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.ce-fields-editor__available-label {
  overflow: hidden;
  color: rgb(15 23 42);
  font-weight: 650;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-fields-editor__available-variable {
  overflow: hidden;
  color: rgb(100 116 139);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-fields-editor__available-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ce-fields-editor__badge {
  border-radius: 999px;
  padding: 4px 8px;
  background: rgb(239 246 255);
  color: rgb(30 64 175);
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
}

.ce-fields-editor__import-button,
.ce-fields-editor__secondary-button,
.ce-fields-editor__danger-button,
.ce-fields-editor__field-action {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 6px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-fields-editor__import-button {
  color: rgb(30 64 175);
}

.ce-fields-editor__danger-button {
  color: rgb(185 28 28);
}

.ce-fields-editor__field-action {
  border-color: rgb(147 197 253);
  color: rgb(30 64 175);
}

.ce-fields-editor__import-button:hover,
.ce-fields-editor__secondary-button:hover,
.ce-fields-editor__danger-button:hover,
.ce-fields-editor__field-action:hover {
  background: rgb(248 250 252);
}

.ce-fields-editor__field-action:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ce-fields-editor__table {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 8px;
}

.ce-fields-editor__table-head,
.ce-fields-editor__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 0.35fr) auto;
  gap: 8px;
  align-items: center;
}

.ce-fields-editor__table-head {
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.ce-fields-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(255 255 255);
}

.ce-fields-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
}

.ce-fields-editor__input:focus {
  outline: none;
  border-color: rgb(20 184 166);
  box-shadow: 0 0 0 2px rgb(20 184 166 / 0.15);
}

.ce-fields-editor__input:read-only,
.ce-fields-editor__input:disabled {
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-fields-editor__empty,
.ce-fields-editor__error {
  margin: 0;
  font-size: 13px;
}

.ce-fields-editor__empty {
  color: rgb(100 116 139);
}

.ce-fields-editor__error {
  color: rgb(185 28 28);
  font-size: 12px;
  font-weight: 650;
}

@media (max-width: 760px) {
  .ce-fields-editor__trigger-row,
  .ce-fields-editor__section-header,
  .ce-fields-editor__dialog-header,
  .ce-fields-editor__dialog-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-fields-editor__table-head {
    display: none;
  }

  .ce-fields-editor__row {
    grid-template-columns: 1fr;
  }
}

.dark .ce-fields-editor {
  color: rgb(226 232 240);
}

.dark .ce-fields-editor__summary,
.dark .ce-fields-editor__section-header {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
  color: rgb(203 213 225);
}

.dark .ce-fields-editor__dialog-panel,
.dark .ce-fields-editor__section,
.dark .ce-fields-editor__available-field,
.dark .ce-fields-editor__row {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

.dark .ce-fields-editor__dialog-header,
.dark .ce-fields-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .ce-fields-editor__dialog-title,
.dark .ce-fields-editor__section-title {
  color: rgb(226 232 240);
}

.dark .ce-fields-editor__section-copy,
.dark .ce-fields-editor__label,
.dark .ce-fields-editor__available-variable,
.dark .ce-fields-editor__table-head,
.dark .ce-fields-editor__empty {
  color: rgb(148 163 184);
}

.dark .ce-fields-editor__available-label {
  color: rgb(226 232 240);
}

.dark .ce-fields-editor__badge {
  background: rgb(30 58 138 / 0.45);
  color: rgb(191 219 254);
}

.dark .ce-fields-editor__input {
  border-color: rgb(71 85 105);
  background: rgb(2 6 23);
  color: rgb(226 232 240);
}

.dark .ce-fields-editor__input:read-only,
.dark .ce-fields-editor__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}

.dark .ce-fields-editor__import-button,
.dark .ce-fields-editor__secondary-button,
.dark .ce-fields-editor__danger-button,
.dark .ce-fields-editor__field-action {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
  color: rgb(226 232 240);
}

.dark .ce-fields-editor__danger-button {
  color: rgb(252 165 165);
}

.dark .ce-fields-editor__import-button:hover,
.dark .ce-fields-editor__secondary-button:hover,
.dark .ce-fields-editor__danger-button:hover,
.dark .ce-fields-editor__field-action:hover {
  background: rgb(51 65 85);
}
</style>
`,O=`<script lang="ts">
export { mFormEditorTool } from '@/editors/tools/mFormEditorTool';
export type { MFormItemData, MFormProps } from 'mokelay-components/blocks/MForm.vue';
<\/script>

<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs';
import type { OutputData, ToolSettings } from '@editorjs/editorjs';
import type { MenuConfig } from '@editorjs/editorjs/types/tools';
import { createApp, type App, computed, h, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import MFormItemEditor, {
  normalizeFormItemProps,
  serializeFormItemProps,
  type NormalizedMFormItemProps,
  type MFormItemProps
} from '@/editors/blocks/MFormItemEditor.vue';
import {
  cloneSelectorBlock,
  type StoredBlock,
  normalizeSelectorBlock
} from '@/editors/blocks/mEditorSelectorEditorTool';
import {
  cloneFormItemData,
  normalizeMFormItem,
  normalizeMFormItems,
  normalizeMFormProps,
  normalizeMFormLayout,
  normalizeMFormActionBar,
  normalizeMFormValues,
  normalizeMFormSubmit,
  normalizeMFormProcessors,
  type MFormItemData,
  type MFormProps
} from 'mokelay-components/blocks';
import type { BlockEventsDialogController } from '@/editors/blockEventsDialog';
import type { EditorToolPropertyField, ResolvedEditorToolDefinition } from '@/editors/editorToolDefinition';
import { loadEditorComponentDefinition } from '@/editors/editorComponentRuntimeRegistry';
import { getEditorJsI18nMessages, i18n, useI18n } from '@/i18n';
import { cloneBlockEvents, normalizeBlockEvents, type BlockEvent } from 'mokelay-components/blocks';
import MFormRenderer from 'mokelay-components/blocks/MForm.vue';
import type { PageEditorBridge } from '@/editors/pageEditor';

type FormItemToolOptions = {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  block?: {
    dispatchChange: () => void;
  };
};

type FormItemToolClass = new (options: FormItemToolOptions) => {
  render: () => HTMLElement;
  save: () => Record<string, unknown>;
  destroy: () => void;
  renderSettings: () => MenuConfig;
};

const INTERNAL_FORM_TOOL_NAMES = new Set(['MPage', 'MForm', 'MFormItem', 'MEditorSelector']);
const fallbackFormItemToolName = 'MInput';
const blockEventsIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5h4v4H5V5Zm10 0h4v4h-4V5ZM5 15h4v4H5v-4Zm10.5-.5 3.5 3.5m0-3.5-3.5 3.5M9 7h6M7 9v6M17 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const formItemToolClassCache = new Map<string, FormItemToolClass>();

const props = withDefaults(defineProps<MFormProps & {
  pageEditor?: PageEditorBridge;
  onChange?: (payload: MFormProps) => void;
  onToolChange?: (payload: MFormProps) => void;
}>(), {
  edit: true,
  items: () => []
});

const emit = defineEmits<{
  (event: 'change', items: MFormItemData[]): void;
}>();

const { t, localeValue } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const holderRef = ref<HTMLElement | null>(null);
const previewItems = computed(() => normalizeMFormItems(props.items));
const rendererProps = computed(() => normalizeMFormProps({ ...props, edit: true }));

let editor: EditorJS | null = null;
let isSyncingFromProps = false;
let skipNextPropSync = false;
let editorMutationObserver: MutationObserver | null = null;
let scheduledEditorSync: number | null = null;
let editorDataCache: OutputData = buildOutput(previewItems.value);
let toolbarAlignTimer: number | null = null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function clearToolbarAlignTimer() {
  if (toolbarAlignTimer === null) return;
  window.clearTimeout(toolbarAlignTimer);
  toolbarAlignTimer = null;
}

function alignOuterToolbarToForm() {
  toolbarAlignTimer = null;

  const root = rootRef.value;
  if (!root) return;

  const block = root.closest('.ce-block') as HTMLElement | null;
  const editorRoot = root.closest('.codex-editor') as HTMLElement | null;
  const toolbar = editorRoot?.querySelector<HTMLElement>(':scope > .ce-toolbar')
    ?? editorRoot?.querySelector<HTMLElement>('.ce-toolbar');
  const plusButton = toolbar?.querySelector<HTMLElement>('.ce-toolbar__plus');

  if (!block || !toolbar || !plusButton) return;

  const blockRect = block.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
  const top = block.offsetTop + (rootRect.top - blockRect.top) + (rootRect.height - toolbarButtonHeight) / 2;

  toolbar.style.top = \`\${Math.max(0, Math.round(top))}px\`;
}

function scheduleOuterToolbarAlignment() {
  if (!props.edit) return;
  clearToolbarAlignTimer();
  toolbarAlignTimer = window.setTimeout(() => {
    alignOuterToolbarToForm();
  }, 0);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function createFormItemTool(
  toolName: string,
  definition: Pick<ResolvedEditorToolDefinition, 'toolbox'>,
  formItemDefinition: ResolvedEditorToolDefinition,
  initialEditorBlock: StoredBlock
): FormItemToolClass {
  const cacheKey = \`\${i18n.locale}:\${toolName}:\${definition.toolbox.title}:\${formItemDefinition.propertyPanel?.title ?? ''}\`;
  const cachedTool = formItemToolClassCache.get(cacheKey);
  if (cachedTool) return cachedTool;

  class FormItemTool {
    static get toolbox() {
      return definition.toolbox;
    }

    private readonly state: NormalizedMFormItemProps;
    private wrapper: HTMLElement | null = null;
    private contentRoot: HTMLElement | null = null;
    private vueApp: App<Element> | null = null;
    private propertyComponentApps: App<Element>[] = [];
    private propertyDialog: HTMLDialogElement | null = null;
    private eventsDialog: BlockEventsDialogController | null = null;
    private events: BlockEvent[] = [];
    private fieldDataType = '';
    private hidden = false;
    private toolbarAlignTimer: number | null = null;
    private readonly blockApi?: FormItemToolOptions['block'];
    private readonly pageEditor?: PageEditorBridge;
    private readonly handleToolbarPointer = () => {
      this.scheduleToolbarAlignment();
    };

    constructor({ data, config, block }: FormItemToolOptions) {
      this.blockApi = block;
      this.pageEditor = config?.pageEditor as PageEditorBridge | undefined;
      const edit = typeof config?.edit === 'boolean' ? config.edit : true;
      const existingEditor = normalizeSelectorBlock(data?.editor);
      this.events = cloneBlockEvents(data?.events);
      this.fieldDataType = normalizeOptionalString(data?.fieldDataType);
      this.hidden = data?.hidden === true || data?.visible === false;

      this.state = reactive(normalizeFormItemProps({
        ...(data ?? {}),
        edit,
        editor: existingEditor ?? cloneSelectorBlock(initialEditorBlock)
      })) as NormalizedMFormItemProps;
    }

    render() {
      const wrapper = document.createElement('div');
      wrapper.className = 'mokelay-form-item-tool';
      wrapper.dataset.toolName = toolName;
      wrapper.dataset.testid = \`form-item-tool-\${toolName}\`;

      const contentRoot = document.createElement('div');
      contentRoot.className = 'mokelay-form-item-tool__content';
      wrapper.appendChild(contentRoot);

      this.wrapper = wrapper;
      this.contentRoot = contentRoot;
      wrapper.addEventListener('mouseenter', this.handleToolbarPointer);
      wrapper.addEventListener('mousemove', this.handleToolbarPointer);
      this.createPropertyDialog();
      void this.ensureEventsDialog();
      this.mountVueApp();
      return wrapper;
    }

    destroy() {
      this.clearToolbarAlignTimer();
      this.wrapper?.removeEventListener('mouseenter', this.handleToolbarPointer);
      this.wrapper?.removeEventListener('mousemove', this.handleToolbarPointer);
      this.unmountVueApp();
      this.unmountPropertyComponents();
      this.propertyDialog?.remove();
      this.eventsDialog?.destroy();
      this.eventsDialog = null;
      this.propertyDialog = null;
      this.contentRoot = null;
      this.wrapper = null;
    }

    save() {
      const events = cloneBlockEvents(this.events);
      return {
        ...serializeFormItemProps(this.state),
        ...(this.fieldDataType ? { fieldDataType: this.fieldDataType } : {}),
        ...(this.hidden ? { hidden: true } : {}),
        events
      };
    }

    renderSettings(): MenuConfig {
      const settings = [];

      if (this.getPropertyFields().length) {
        settings.push({
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.11 9.51C21.29 9.37 21.34 9.11 21.23 8.9L19.35 5.64C19.24 5.43 18.99 5.35 18.77 5.42L16.44 6.17C15.96 5.8 15.44 5.48 14.87 5.23L14.51 2.75C14.48 2.52 14.28 2.35 14.04 2.35H10.28C10.04 2.35 9.84 2.52 9.81 2.75L9.45 5.23C8.88 5.48 8.36 5.81 7.88 6.17L5.55 5.42C5.33 5.35 5.08 5.43 4.97 5.64L3.09 8.9C2.98 9.11 3.03 9.37 3.21 9.51L5.19 11.06C5.14 11.36 5.12 11.68 5.12 12C5.12 12.32 5.14 12.64 5.19 12.94L3.21 14.49C3.03 14.63 2.98 14.89 3.09 15.1L4.97 18.36C5.08 18.57 5.33 18.65 5.55 18.58L7.88 17.83C8.36 18.2 8.88 18.52 9.45 18.77L9.81 21.25C9.84 21.48 10.04 21.65 10.28 21.65H14.04C14.28 21.65 14.48 21.48 14.51 21.25L14.87 18.77C15.44 18.52 15.96 18.19 16.44 17.83L18.77 18.58C18.99 18.65 19.24 18.57 19.35 18.36L21.23 15.1C21.34 14.89 21.29 14.63 21.11 14.49L19.14 12.94ZM12.16 15.6C10.17 15.6 8.56 13.99 8.56 12C8.56 10.01 10.17 8.4 12.16 8.4C14.15 8.4 15.76 10.01 15.76 12C15.76 13.99 14.15 15.6 12.16 15.6Z" fill="currentColor"/></svg>',
          title: i18n.t('editor.properties'),
          onActivate: () => {
            this.openPropertyDialog();
          },
          closeOnActivate: true
        });
      }

      settings.push({
        icon: blockEventsIcon,
        title: i18n.t('editor.events.menu'),
        onActivate: () => {
          this.openEventsDialog();
        },
        closeOnActivate: true
      });

      return settings as MenuConfig;
    }

    private mountVueApp() {
      if (!this.contentRoot) return;

      const updateState = (payload: MFormItemProps) => {
        Object.assign(this.state, normalizeFormItemProps(payload, this.state.variableName));
      };

      this.unmountVueApp();
      this.vueApp = createApp({
        render: () => h(MFormItemEditor, {
          ...this.state,
          edit: true,
          onToolChange: updateState,
          onChange: updateState
        })
      });
      this.vueApp.mount(this.contentRoot);
    }

    private unmountVueApp() {
      this.vueApp?.unmount();
      this.vueApp = null;
    }

    private clearToolbarAlignTimer() {
      if (this.toolbarAlignTimer === null) return;
      window.clearTimeout(this.toolbarAlignTimer);
      this.toolbarAlignTimer = null;
    }

    private scheduleToolbarAlignment() {
      this.clearToolbarAlignTimer();
      this.toolbarAlignTimer = window.setTimeout(() => {
        this.alignToolbarToFormItem();
      }, 0);
    }

    private alignToolbarToFormItem() {
      this.toolbarAlignTimer = null;

      const root = this.wrapper;
      if (!root) return;

      const block = root.closest('.ce-block') as HTMLElement | null;
      const editorRoot = root.closest('.codex-editor') as HTMLElement | null;
      const toolbar = editorRoot?.querySelector<HTMLElement>(':scope > .ce-toolbar');
      const plusButton = toolbar?.querySelector('.ce-toolbar__plus') as HTMLElement | null;

      if (!block || !toolbar || !plusButton) return;

      const blockRect = block.getBoundingClientRect();
      const itemRect = root.getBoundingClientRect();
      const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
      const top = block.offsetTop + (itemRect.top - blockRect.top) + (itemRect.height - toolbarButtonHeight) / 2;

      toolbar.style.top = \`\${Math.max(0, Math.round(top))}px\`;
    }

    private getPropertyFields() {
      return formItemDefinition.propertyPanel?.fields ?? [];
    }

    private createPropertyDialog() {
      if (!this.wrapper || !this.getPropertyFields().length) return;

      const dialog = document.createElement('dialog');
      dialog.className = 'mokelay-editor-tool__property-dialog';
      dialog.dataset.testid = 'tool-property-dialog';
      dialog.dataset.toolName = 'MFormItem';

      const title = formItemDefinition.propertyPanel?.title || i18n.t('editor.propertyDialogTitle');
      const fields = this.getPropertyFields().map((field) => this.renderPropertyField(field)).join('');

      dialog.innerHTML = \`
        <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-property-panel">
          <div class="mokelay-editor-tool__property-header">
            <h3 class="mokelay-editor-tool__property-title" data-testid="tool-property-title">\${escapeHtml(title)}</h3>
            <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-property-close">\${escapeHtml(i18n.t('editor.close'))}</button>
          </div>
          <div class="mokelay-editor-tool__property-body" data-testid="tool-property-body">
            \${fields}
          </div>
        </form>
      \`;

      this.wrapper.appendChild(dialog);
      this.propertyDialog = dialog;
      this.bindPropertyInputs();
      this.mountPropertyComponents();
    }

    private async ensureEventsDialog() {
      if (this.eventsDialog || !this.wrapper) return this.eventsDialog;
      const { BlockEventsDialogController } = await import('@/editors/blockEventsDialog');
      if (this.eventsDialog || !this.wrapper) return this.eventsDialog;

      this.eventsDialog = new BlockEventsDialogController({
        owner: this.wrapper,
        toolName,
        getEvents: () => cloneBlockEvents(this.events),
        setEvents: (events) => {
          this.events = cloneBlockEvents(events);
          this.blockApi?.dispatchChange();
        },
        pageEditor: this.pageEditor
      });
      this.eventsDialog.mount();
      return this.eventsDialog;
    }

    private openPropertyDialog() {
      if (!this.propertyDialog) return;
      this.syncPropertyDialogValues();
      this.mountPropertyComponents();
      if (!this.propertyDialog.open) {
        this.propertyDialog.showModal();
      }
    }

    private async openEventsDialog() {
      const dialog = await this.ensureEventsDialog();
      dialog?.open();
    }

    private syncPropertyDialogValues() {
      if (!this.propertyDialog) return;
      this.propertyDialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-property-key]').forEach((input) => {
        const propertyKey = input.dataset.propertyKey;
        if (!propertyKey) return;
        const value = this.getPropertyFieldValue(propertyKey);
        if (input instanceof HTMLInputElement && input.type === 'checkbox') {
          input.checked = value === true;
          return;
        }
        input.value = typeof value === 'string' ? value : '';
      });
    }

    private updateProperty(key: string, value: unknown) {
      Object.assign(this.state, normalizeFormItemProps({
        ...this.state,
        [key]: value,
        edit: true
      }, this.state.variableName));
    }

    private getPropertyFieldValue(key: string): unknown {
      return this.state[key as keyof NormalizedMFormItemProps];
    }

    private renderPropertyField(field: EditorToolPropertyField) {
      if (field.type === 'component') {
        return \`
          <div class="mokelay-editor-tool__property-field mokelay-editor-tool__property-field--component">
            <span class="mokelay-editor-tool__property-label">\${escapeHtml(field.label)}</span>
            <div data-property-component-key="\${escapeHtml(field.key)}"></div>
          </div>
        \`;
      }
      if (field.type === 'checkbox') {
        return \`
          <label class="mokelay-editor-tool__property-field mokelay-editor-tool__property-field--checkbox">
            <input
              class="mokelay-editor-tool__property-checkbox"
              data-testid="tool-property-input-\${field.key}"
              data-property-key="\${field.key}"
              data-property-type="checkbox"
              type="checkbox"
              \${this.getPropertyFieldValue(field.key) === true ? 'checked' : ''}
            />
            <span class="mokelay-editor-tool__property-label">\${escapeHtml(field.label)}</span>
          </label>
        \`;
      }

      if (field.type === 'select') {
        const value = this.getPropertyFieldValue(field.key);
        const options = (field.options ?? []).map((option) => \`
          <option value="\${escapeHtml(option.value)}" \${value === option.value ? 'selected' : ''}>\${escapeHtml(option.label)}</option>
        \`).join('');

        return \`
          <label class="mokelay-editor-tool__property-field">
            <span class="mokelay-editor-tool__property-label">\${escapeHtml(field.label)}</span>
            <select
              class="mokelay-editor-tool__property-input"
              data-testid="tool-property-input-\${field.key}"
              data-property-key="\${field.key}"
              data-property-type="select"
            >
              \${options}
            </select>
          </label>
        \`;
      }

      const value = this.getPropertyFieldValue(field.key);
      return \`
        <label class="mokelay-editor-tool__property-field">
          <span class="mokelay-editor-tool__property-label">\${escapeHtml(field.label)}</span>
          <input
            class="mokelay-editor-tool__property-input"
            data-testid="tool-property-input-\${field.key}"
            data-property-key="\${field.key}"
            data-property-type="text"
            type="text"
            value="\${escapeHtml(typeof value === 'string' ? value : '')}"
            placeholder="\${escapeHtml(field.placeholder ?? '')}"
          />
        </label>
      \`;
    }

    private bindPropertyInputs() {
      if (!this.propertyDialog) return;

      this.propertyDialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-property-key]').forEach((input) => {
        const eventName = input instanceof HTMLInputElement
          ? (input.type === 'checkbox' ? 'change' : 'input')
          : 'change';
        input.addEventListener(eventName, () => {
          const propertyKey = input.dataset.propertyKey;
          if (!propertyKey) return;
          this.updateProperty(propertyKey, this.readPropertyInputValue(input));
        });
      });
    }

    private mountPropertyComponents() {
      if (!this.propertyDialog) return;
      this.unmountPropertyComponents();
      this.getPropertyFields().filter((field) => field.type === 'component').forEach((field) => {
        if (!field.component || !this.propertyDialog) return;
        const host = this.propertyDialog.querySelector<HTMLElement>(\`[data-property-component-key="\${field.key}"]\`);
        if (!host) return;
        const app = createApp(field.component, {
          value: this.getPropertyFieldValue(field.key),
          ...(field.getComponentProps?.({ value: this.getPropertyFieldValue(field.key), state: this.state as unknown as Record<string, unknown>, edit: true }) ?? {}),
          onToolChange: (value: unknown) => this.updateProperty(field.key, value),
          onChange: (value: unknown) => this.updateProperty(field.key, value)
        });
        app.mount(host);
        this.propertyComponentApps.push(app);
      });
    }

    private unmountPropertyComponents() {
      this.propertyComponentApps.forEach((app) => app.unmount());
      this.propertyComponentApps = [];
    }

    private readPropertyInputValue(input: HTMLInputElement | HTMLSelectElement) {
      if (input instanceof HTMLInputElement && input.type === 'checkbox') {
        return input.checked;
      }
      return input.value;
    }
  }

  const createdTool = FormItemTool as unknown as FormItemToolClass;
  formItemToolClassCache.set(cacheKey, createdTool);
  return createdTool;
}

function isAllowedFormItemToolName(toolName: string) {
  return Boolean(toolName) && !INTERNAL_FORM_TOOL_NAMES.has(toolName) && toolName.startsWith('M');
}

async function createFormItemEditorTools(pageEditor?: PageEditorBridge) {
  const { createInitialFormItemEditorBlock, getFormItemToolNames, getFormItemToolbox } =
    await import('@/editors/form/mFormItemTools');
  const formItemDefinition = await loadEditorComponentDefinition('MFormItem');
  if (!formItemDefinition) return {};

  const toolEntries = getFormItemToolNames().flatMap((toolName) => {
    return [[
      toolName,
      {
        class: createFormItemTool(
          toolName,
          { toolbox: getFormItemToolbox(toolName) },
          formItemDefinition,
          createInitialFormItemEditorBlock(toolName)
        ),
        config: {
          edit: true,
          pageEditor
        }
      }
    ]];
  });

  return Object.fromEntries(toolEntries) as Record<string, ToolSettings>;
}

function getBlockToolName(item: MFormItemData) {
  const editorType = item.editor?.type;
  if (editorType && isAllowedFormItemToolName(editorType)) {
    return editorType;
  }

  return fallbackFormItemToolName;
}

function formItemToBlock(item: MFormItemData, index: number): OutputData['blocks'][number] | undefined {
  const toolName = getBlockToolName(item);
  if (!toolName) return undefined;

  return {
    id: \`form-item-\${item.variableName || index}\`,
    type: toolName,
    data: cloneFormItemData(item)
  };
}

function buildOutput(items: MFormItemData[]): OutputData {
  return {
    blocks: items
      .map((item, index) => formItemToBlock(item, index))
      .filter((block): block is OutputData['blocks'][number] => block !== undefined)
  };
}

function getItemsFromOutput(output: OutputData) {
  const blocks = Array.isArray(output.blocks) ? output.blocks : [];

  return blocks
    .filter((block) => isAllowedFormItemToolName(block.type))
    .map((block) => normalizeMFormItem(block.data))
    .filter((item): item is MFormItemData => item !== undefined);
}

function isSameItems(left: MFormItemData[], right: MFormItemData[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function notifyChanges(items: MFormItemData[]) {
  const normalizedItems = normalizeMFormItems(items);
  const values = normalizeMFormValues(props.values);
  const defaultValues = normalizeMFormValues(props.defaultValues);
  const submit = normalizeMFormSubmit(props.submit);
  const processors = normalizeMFormProcessors(props.processors);
  const actionBar = normalizeMFormActionBar(props.actionBar ?? props.toolbar);
  const payload = {
    edit: true,
    layout: normalizeMFormLayout(props.layout),
    items: normalizedItems.map((item) => cloneFormItemData(item)),
    ...(actionBar ? { actionBar } : {}),
    ...(Object.keys(values).length ? { values } : {}),
    ...(Object.keys(defaultValues).length ? { defaultValues } : {}),
    ...(Object.keys(submit).length ? { submit } : {}),
    ...(Object.keys(processors).length ? { processors } : {})
  };

  skipNextPropSync = true;
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  emit('change', payload.items);
}

async function syncFromEditorOutput(output: OutputData) {
  const previousItems = getItemsFromOutput(editorDataCache);
  const nextItems = getItemsFromOutput(output);
  editorDataCache = buildOutput(nextItems);

  if (!isSyncingFromProps && !isSameItems(previousItems, nextItems)) {
    notifyChanges(nextItems);
  }
}

function clearScheduledEditorSync() {
  if (scheduledEditorSync === null) return;
  window.clearTimeout(scheduledEditorSync);
  scheduledEditorSync = null;
}

function scheduleEditorSync() {
  if (!editor) return;

  clearScheduledEditorSync();
  scheduledEditorSync = window.setTimeout(async () => {
    scheduledEditorSync = null;
    if (!editor) return;

    try {
      const output = await editor.save();
      await syncFromEditorOutput(output);
    } catch {
      // EditorJS can reject during nested block mounting; the next DOM event will sync again.
    }
  }, 0);
}

function startEditorSyncListeners() {
  const holder = holderRef.value;
  if (!holder) return;

  stopEditorSyncListeners();
  editorMutationObserver = new MutationObserver(() => {
    scheduleEditorSync();
  });
  editorMutationObserver.observe(holder, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  });

  holder.addEventListener('input', scheduleEditorSync);
  holder.addEventListener('change', scheduleEditorSync);
  holder.addEventListener('click', scheduleEditorSync);
}

function stopEditorSyncListeners() {
  const holder = holderRef.value;
  editorMutationObserver?.disconnect();
  editorMutationObserver = null;
  clearScheduledEditorSync();

  holder?.removeEventListener('input', scheduleEditorSync);
  holder?.removeEventListener('change', scheduleEditorSync);
  holder?.removeEventListener('click', scheduleEditorSync);
}

async function mountEditor() {
  const holder = holderRef.value;
  if (!props.edit || !holder?.isConnected || editor) return;

  editorDataCache = buildOutput(previewItems.value);
  const [{ default: EditorJSConstructor }, tools] = await Promise.all([
    import('@editorjs/editorjs'),
    createFormItemEditorTools(props.pageEditor)
  ]);
  if (!props.edit || holderRef.value !== holder || !holder.isConnected || editor) return;

  const nextEditor = new EditorJSConstructor({
    holder,
    placeholder: t('form.placeholder'),
    tools,
    data: editorDataCache,
    minHeight: 0,
    i18n: {
      messages: getEditorJsI18nMessages(localeValue.value)
    },
    onChange: async () => {
      if (editor !== nextEditor) return;
      const output = await nextEditor.save();
      await syncFromEditorOutput(output);
    }
  });
  editor = nextEditor;

  try {
    await nextEditor.isReady;
  } catch {
    if (editor === nextEditor) editor = null;
    return;
  }

  if (editor !== nextEditor || !holder.isConnected) return;

  startEditorSyncListeners();
}

async function unmountEditor() {
  const currentEditor = editor;
  if (!currentEditor) return;
  editor = null;
  stopEditorSyncListeners();

  try {
    await currentEditor.isReady;
    const output = await currentEditor.save();
    editorDataCache = buildOutput(getItemsFromOutput(output));
  } catch {
    editorDataCache = buildOutput(previewItems.value);
  }

  if (typeof currentEditor.destroy === 'function') {
    currentEditor.destroy();
  }
}

async function rebuildEditor() {
  await unmountEditor();
  await nextTick();
  await mountEditor();
}

async function saveEditor() {
  if (!editor) {
    return editorDataCache;
  }

  const output = await editor.save();
  await syncFromEditorOutput(output);
  return editorDataCache;
}

defineExpose({ saveEditor });

onMounted(async () => {
  await mountEditor();
});

watch(
  () => props.items,
  async (items) => {
    if (skipNextPropSync) {
      skipNextPropSync = false;
      return;
    }

    const nextItems = normalizeMFormItems(items);
    const cachedItems = getItemsFromOutput(editorDataCache);
    if (isSameItems(nextItems, cachedItems)) {
      return;
    }

    isSyncingFromProps = true;
    editorDataCache = buildOutput(nextItems);
    if (editor) {
      await rebuildEditor();
    }
    isSyncingFromProps = false;
  },
  { deep: true }
);

watch(localeValue, async () => {
  if (!editor) return;
  await rebuildEditor();
});

watch(
  () => props.edit,
  async (edit) => {
    if (edit) {
      await nextTick();
      await mountEditor();
      return;
    }

    await unmountEditor();
  }
);

onBeforeUnmount(async () => {
  clearToolbarAlignTimer();
  await unmountEditor();
});
<\/script>

<template>
  <div
    ref="rootRef"
    class="m-form-editor"
    data-testid="form-editor-wrapper"
    @focusin="scheduleOuterToolbarAlignment"
    @mouseenter="scheduleOuterToolbarAlignment"
    @mousemove="scheduleOuterToolbarAlignment"
  >
    <MFormRenderer v-bind="rendererProps">
      <template #items>
        <div class="m-form-editor__surface" data-testid="form-editor-shell">
          <div ref="holderRef" data-testid="form-editor-surface"></div>
        </div>
      </template>
    </MFormRenderer>
  </div>
</template>

<style scoped>
.m-form-editor { width: 100%; }
.m-form-editor__surface {
  width: 100%;
  min-height: 54px;
  border: 1px dashed rgb(148 163 184 / 0.72);
  border-radius: 8px;
  background: rgb(248 250 252);
  padding: 8px 10px 8px 38px;
}
.m-form-editor :deep(.codex-editor),
.m-form-editor :deep(.codex-editor__redactor) { min-height: 0; }
.m-form-editor :deep(.codex-editor__redactor) { padding-bottom: 0 !important; }
.m-form-editor :deep(.ce-block) { padding: 0; }
.m-form-editor :deep(.ce-block + .ce-block) { margin-top: 10px; }
.m-form-editor :deep(.ce-form-tool--horizontal .codex-editor__redactor) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.m-form-editor :deep(.ce-form-tool--horizontal .ce-block) {
  flex: 1 1 260px;
  min-width: min(100%, 240px);
}
.m-form-editor :deep(.ce-block__content),
.m-form-editor :deep(.ce-toolbar__content) { max-width: none; margin: 0; }
.m-form-editor :deep(.ce-toolbar__actions) { right: calc(100% + 8px); padding-right: 0; }
.m-form-editor :deep(.ce-popover-item[data-item-name='paragraph']) { display: none; }
.m-form-editor :deep(.ce-paragraph) {
  min-height: 36px;
  padding: 8px 0;
  color: rgb(100 116 139);
  font-size: 14px;
  line-height: 20px;
}
.dark .m-form-editor__surface {
  border-color: rgb(71 85 105 / 0.9);
  background: rgb(15 23 42);
}
</style>
`,L=`<script lang="ts">
export {
  generateFormItemVariableName,
  getDefaultFormItemLabelName,
  normalizeFormItemProps,
  serializeFormItemProps
} from 'mokelay-components/blocks';
export type {
  MFormItemLayout,
  MFormItemProps,
  NormalizedMFormItemProps
} from 'mokelay-components/blocks';
export { mFormItemEditorTool } from '@/editors/tools/mFormItemEditorTool';
<\/script>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import MFormItemRenderer from 'mokelay-components/blocks/MFormItem.vue';
import {
  cloneEditorBlock,
  normalizeFormItemProps,
  normalizeLayout,
  type MFormItemProps
} from 'mokelay-components/blocks';
import { resolveLocalizedValue } from 'mokelay-components/runtime';
import { useContentLocalization } from '@/composables/useContentLocalization';
import MEditorSelector from '@/editors/blocks/MEditorSelector.vue';
import {
  normalizeSelectorBlock,
  type MEditorSelectorProps
} from '@/editors/blocks/mEditorSelectorEditorTool';

const props = withDefaults(defineProps<MFormItemProps & {
  onChange?: (payload: MFormItemProps) => void;
  onToolChange?: (payload: MFormItemProps) => void;
}>(), {
  edit: true,
  editor: undefined,
  layout: 'Vertical'
});

const selectorExcludeToolNames = ['MFormItem', 'MForm'];
const formItem = reactive(normalizeFormItemProps({ ...props, edit: true }));
const { localeConfig, editingLocale } = useContentLocalization();
const previewLabelName = computed(() => typeof formItem.labelName === 'string'
  ? formItem.labelName
  : resolveLocalizedValue(formItem.labelName, editingLocale.value, localeConfig.value));

function emitChange() {
  const payload: MFormItemProps = {
    edit: true,
    labelName: formItem.labelName,
    variableName: formItem.variableName,
    editor: cloneEditorBlock(formItem.editor),
    layout: normalizeLayout(formItem.layout)
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function updateFormItem(payload: Partial<MFormItemProps>) {
  if (payload.labelName !== undefined) formItem.labelName = payload.labelName;
  if (payload.variableName !== undefined) formItem.variableName = payload.variableName;
  if ('editor' in payload) formItem.editor = normalizeSelectorBlock(payload.editor);
  if (payload.layout !== undefined) formItem.layout = normalizeLayout(payload.layout);
  emitChange();
}

function handleEditorChange(payload: MEditorSelectorProps) {
  updateFormItem({ editor: payload.value });
}

watch(
  () => ({
    labelName: props.labelName,
    variableName: props.variableName,
    editor: props.editor,
    layout: props.layout
  }),
  (value) => Object.assign(formItem, normalizeFormItemProps({ ...value, edit: true }, formItem.variableName)),
  { deep: true }
);
<\/script>

<template>
  <div class="m-form-item-editor" data-testid="form-item-edit-shell">
    <MFormItemRenderer
      :edit="true"
      :label-name="previewLabelName"
      :variable-name="formItem.variableName"
      :editor="formItem.editor"
      :layout="formItem.layout"
    >
      <template #control>
        <MEditorSelector
          :edit="true"
          :value="formItem.editor"
          :exclude-tool-names="selectorExcludeToolNames"
          :on-change="handleEditorChange"
        />
      </template>
    </MFormItemRenderer>
  </div>
</template>

<style scoped>
.m-form-item-editor {
  width: 100%;
  border: 1px dashed rgb(148 163 184 / 0.7);
  border-radius: 8px;
  padding: 8px;
}
.dark .m-form-item-editor { border-color: rgb(71 85 105 / 0.9); }
</style>
`,N=`<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  normalizeMFormItems,
  type MFormItemData
} from 'mokelay-components/blocks';

export type FormItemsEditorPayload = {
  value: MFormItemData[];
};

export interface MFormItemsEditorProps extends EditorToolComponentProps {
  value?: MFormItemData[];
}

export function normalizeMFormItemsEditorProps(
  props: Partial<MFormItemsEditorProps>
): MFormItemsEditorProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    value: normalizeMFormItems(props.value)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MFormItemsEditor",
 *   "displayName": "表单项列表编辑器",
 *   "category": "form",
 *   "description": "表单项列表编辑器，用于维护 MForm 的字段列表、字段变量、布局和内嵌字段组件配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MFormItemsEditor",
 *     "toolSymbol": "mFormItemsEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 174
 *   },
 *   "toolbox": {
 *     "title": "表单项列表编辑器",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"4\\" width=\\"16\\" height=\\"16\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 8h8M8 12h8M8 16h5\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MFormItemData[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFormItemsEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "表单项配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "toolChange",
 *       "payload": "{ value: MFormItemData[] }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFormItemsEditor.vue",
 *       "label": "工具变更"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "{ value: MFormItemData[] }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MFormItemsEditor.vue",
 *       "label": "变更"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时输出归一化后的 value 表单项数组。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MFormItemsEditor-example",
 *       "type": "MFormItemsEditor",
 *       "data": {
 *         "value": []
 *       }
 *     }
 *   ]
 * }
 */
export const mFormItemsEditorTool = defineEditorTool<MFormItemsEditorProps>({
  normalizeProps: normalizeMFormItemsEditorProps,
  serialize: (props) => ({
    value: normalizeMFormItems(props.value)
  })
});
<\/script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MFieldsEditor, {
  normalizeFieldsEditorValue,
  type MFieldsEditorField
} from '@/editors/blocks/MFieldsEditor.vue';
import {
  cloneFormItemData
} from 'mokelay-components/blocks';
import {
  createInitialFormItemEditorBlock,
  getDefaultFormItemToolName,
  getFormItemToolNames,
  isAllowedFormItemToolName
} from '@/editors/form/mFormItemTools';
import { getEditorComponentDefinition } from '@/editors/editorComponentRuntimeRegistry';
import { useI18n } from '@/i18n';
import { getClientBlockDocSnapshot } from '@/utils/clientBlockDocs';
import MLocalizedTextEditor from '@/editors/blocks/MLocalizedTextEditor.vue';
import {
  normalizeLocalizedValue,
  resolveLocalizedValue,
  type LocalizedTextValue,
  type LocalizedValue
} from 'mokelay-components/runtime';
import { useContentLocalization } from '@/composables/useContentLocalization';

const props = defineProps<MFormItemsEditorProps & {
  onChange?: (payload: FormItemsEditorPayload) => void;
  onToolChange?: (payload: FormItemsEditorPayload) => void;
}>();

const { t } = useI18n();
const { localeConfig, editingLocale } = useContentLocalization();
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const committedItems = ref<MFormItemData[]>(cloneItems(props.value));
const itemsDraft = ref<MFormItemData[]>(cloneItems(props.value));

const savedItemCount = computed(() => committedItems.value.length);
const selectedFieldValue = computed(() => getFieldsFromItems(itemsDraft.value));
const isReadOnly = computed(() => !props.edit);
const formItemToolOptions = computed(() => getFormItemToolNames().map((toolName) => ({
  label: getToolTitle(toolName),
  value: toolName
})));

function cloneItems(value?: MFormItemData[]) {
  return normalizeMFormItems(value).map((item) => cloneFormItemData(item));
}

function getToolTitle(toolName: string) {
  const doc = getClientBlockDocSnapshot(toolName);
  if (doc?.displayName) return doc.displayName;
  return getEditorComponentDefinition(toolName)?.toolbox.title ?? toolName;
}

function createDraftFromCommittedValue() {
  itemsDraft.value = cloneItems(committedItems.value);
}

function openSettingsDialog() {
  createDraftFromCommittedValue();
  isSettingsDialogOpen.value = true;
  if (!settingsDialogRef.value?.open) {
    settingsDialogRef.value?.showModal();
  }
}

function closeSettingsDialog() {
  isSettingsDialogOpen.value = false;
  if (settingsDialogRef.value?.open) {
    settingsDialogRef.value.close();
  }
}

function normalizeField(field: MFieldsEditorField): MFieldsEditorField | undefined {
  return normalizeFieldsEditorValue([field])[0];
}

function getFieldsFromItems(items?: MFormItemData[]): MFieldsEditorField[] {
  const fieldsByVariable = new Map<string, MFieldsEditorField>();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const variable = item.variableName.trim();
    if (!variable || fieldsByVariable.has(variable)) return;

    fieldsByVariable.set(variable, {
      label: resolveEditorText(item.labelName),
      variable,
      dataType: item.fieldDataType || 'string'
    });
  });

  return [...fieldsByVariable.values()];
}

function createFormItemFromField(field: MFieldsEditorField): MFormItemData {
  const toolName = getDefaultFormItemToolName();
  return cloneFormItemData({
    labelName: field.label,
    variableName: field.variable,
    fieldDataType: field.dataType,
    layout: 'Vertical',
    ...(toolName ? { editor: createInitialFormItemEditorBlock(toolName) } : {})
  });
}

function mergeFieldsIntoItems(fields: MFieldsEditorField[]) {
  if (isReadOnly.value) return;

  const normalizedFields = fields
    .map((field) => normalizeField(field))
    .filter((field): field is MFieldsEditorField => Boolean(field));
  const itemsByVariable = new Map<string, MFormItemData>();

  itemsDraft.value.forEach((item) => {
    const variable = item.variableName.trim();
    if (variable && !itemsByVariable.has(variable)) {
      itemsByVariable.set(variable, item);
    }
  });

  itemsDraft.value = normalizedFields.map((field) => {
    const existingItem = itemsByVariable.get(field.variable);
    if (!existingItem) {
      return createFormItemFromField(field);
    }

    return cloneFormItemData({
      ...existingItem,
      labelName: mergeEditorText(existingItem.labelName, field.label),
      variableName: field.variable,
      fieldDataType: field.dataType
    });
  });
}

function handleFieldsChange(payload: { value?: MFieldsEditorField[] }) {
  mergeFieldsIntoItems(payload.value ?? []);
}

function updateItemLabelName(index: number, value: LocalizedValue) {
  if (isReadOnly.value) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    labelName: value
  };
}

function resolveEditorText(value: LocalizedTextValue) {
  return typeof value === 'string'
    ? value
    : resolveLocalizedValue(value, editingLocale.value, localeConfig.value);
}

function mergeEditorText(value: LocalizedTextValue, text: string): LocalizedTextValue {
  if (resolveEditorText(value) === text) return value;
  if (typeof value === 'string') {
    const localized = normalizeLocalizedValue({
      $i18n: { [localeConfig.value.defaultLocale]: value }
    }, localeConfig.value);
    localized.$i18n[editingLocale.value] = text;
    return localized;
  }
  const localized = normalizeLocalizedValue(value, localeConfig.value);
  localized.$i18n[editingLocale.value] = text;
  return localized;
}

function updateItemVariableName(index: number, value: string) {
  if (isReadOnly.value) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    variableName: value
  };
}

function updateItemLayout(index: number, value: string) {
  if (isReadOnly.value) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    layout: value === 'Horizontal' ? 'Horizontal' : 'Vertical'
  };
}

function getItemEditorToolName(item: MFormItemData) {
  const toolName = item.editor?.type;
  if (toolName && isAllowedFormItemToolName(toolName)) {
    return toolName;
  }

  return getDefaultFormItemToolName() ?? '';
}

function updateItemEditorToolName(index: number, value: string) {
  if (isReadOnly.value || !isAllowedFormItemToolName(value)) return;
  const item = itemsDraft.value[index];
  if (!item) return;

  itemsDraft.value[index] = {
    ...item,
    editor: createInitialFormItemEditorBlock(value)
  };
}

function removeItem(index: number) {
  if (isReadOnly.value) return;
  itemsDraft.value.splice(index, 1);
}

function moveItem(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= itemsDraft.value.length) return;

  const nextItems = [...itemsDraft.value];
  const [item] = nextItems.splice(index, 1);
  if (!item) return;
  nextItems.splice(nextIndex, 0, item);
  itemsDraft.value = nextItems;
}

function saveItems() {
  if (isReadOnly.value) return;

  const normalizedItems = cloneItems(itemsDraft.value);
  committedItems.value = normalizedItems;
  props.onToolChange?.({ value: normalizedItems });
  props.onChange?.({ value: normalizedItems });
  closeSettingsDialog();
}

watch(
  () => props.value,
  (value) => {
    committedItems.value = cloneItems(value);
    if (!isSettingsDialogOpen.value) {
      createDraftFromCommittedValue();
    }
  },
  { deep: true, immediate: true }
);
<\/script>

<template>
  <div class="ce-form-items-editor" data-testid="form-items-editor">
    <div class="ce-form-items-editor__trigger-row">
      <button
        class="ce-form-items-editor__primary-button"
        type="button"
        data-testid="form-items-settings-open"
        @click="openSettingsDialog"
      >
        {{ t('form.itemsEditor.actions.settings') }}
      </button>
      <div class="ce-form-items-editor__summary" data-testid="form-items-summary">
        {{ t('form.itemsEditor.summary.savedCount').replace('{count}', String(savedItemCount)) }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="ce-form-items-editor__dialog"
      data-testid="form-items-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="form-items-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="ce-form-items-editor__dialog-panel">
        <div class="ce-form-items-editor__dialog-header">
          <h3
            id="form-items-dialog-title"
            class="ce-form-items-editor__dialog-title"
            data-testid="form-items-dialog-title"
          >
            {{ t('form.itemsEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-form-items-editor__secondary-button"
            type="button"
            data-testid="form-items-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-form-items-editor__dialog-body">
          <section class="ce-form-items-editor__section" data-testid="form-items-fields-section">
            <div class="ce-form-items-editor__section-header">
              <div>
                <div class="ce-form-items-editor__section-title">
                  {{ t('form.itemsEditor.sections.fields') }}
                </div>
                <p class="ce-form-items-editor__section-copy">
                  {{ t('form.itemsEditor.help.fields') }}
                </p>
              </div>
            </div>
            <div class="ce-form-items-editor__section-body">
              <MFieldsEditor
                :edit="edit"
                :value="selectedFieldValue"
                :on-change="handleFieldsChange"
              />
            </div>
          </section>

          <section class="ce-form-items-editor__section" data-testid="form-items-list-section">
            <div class="ce-form-items-editor__section-header">
              <div>
                <div class="ce-form-items-editor__section-title">
                  {{ t('form.itemsEditor.sections.items') }}
                </div>
                <p class="ce-form-items-editor__section-copy">
                  {{ t('form.itemsEditor.summary.draftCount').replace('{count}', String(itemsDraft.length)) }}
                </p>
              </div>
            </div>

            <div class="ce-form-items-editor__section-body ce-form-items-editor__section-body--items">
              <p
                v-if="!itemsDraft.length"
                class="ce-form-items-editor__empty"
                data-testid="form-items-empty"
              >
                {{ t('form.itemsEditor.empty') }}
              </p>

              <div v-else class="ce-form-items-editor__table" data-testid="form-items-list">
                <div class="ce-form-items-editor__table-head" aria-hidden="true">
                  <span>{{ t('form.itemsEditor.columns.label') }}</span>
                  <span>{{ t('form.itemsEditor.columns.variable') }}</span>
                  <span>{{ t('form.itemsEditor.columns.layout') }}</span>
                  <span>{{ t('form.itemsEditor.columns.editor') }}</span>
                  <span>{{ t('form.itemsEditor.columns.actions') }}</span>
                </div>

                <div
                  v-for="(item, index) in itemsDraft"
                  :key="\`\${item.variableName}-\${index}\`"
                  class="ce-form-items-editor__row"
                  :data-testid="\`form-item-row-\${index}\`"
                >
                  <MLocalizedTextEditor
                    compact
                    :readonly="isReadOnly"
                    :value="item.labelName"
                    :data-testid="\`form-item-label-\${index}\`"
                    :placeholder="t('form.itemsEditor.placeholders.label')"
                    :on-change="(value) => updateItemLabelName(index, value)"
                    @keydown.stop
                  />
                  <input
                    class="ce-form-items-editor__input"
                    :data-testid="\`form-item-variable-\${index}\`"
                    type="text"
                    :readonly="isReadOnly"
                    :placeholder="t('form.itemsEditor.placeholders.variable')"
                    :value="item.variableName"
                    @input="updateItemVariableName(index, ($event.target as HTMLInputElement).value)"
                    @keydown.stop
                  />
                  <select
                    class="ce-form-items-editor__input"
                    :data-testid="\`form-item-layout-\${index}\`"
                    :disabled="isReadOnly"
                    :value="item.layout"
                    @change="updateItemLayout(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="Vertical">{{ t('formItem.layouts.vertical') }}</option>
                    <option value="Horizontal">{{ t('formItem.layouts.horizontal') }}</option>
                  </select>
                  <select
                    class="ce-form-items-editor__input"
                    :data-testid="\`form-item-editor-type-\${index}\`"
                    :disabled="isReadOnly"
                    :value="getItemEditorToolName(item)"
                    @change="updateItemEditorToolName(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option
                      v-for="option in formItemToolOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <div class="ce-form-items-editor__actions">
                    <button
                      class="ce-form-items-editor__icon-button"
                      type="button"
                      :data-testid="\`form-item-move-up-\${index}\`"
                      :disabled="isReadOnly || index === 0"
                      @click="moveItem(index, -1)"
                    >
                      {{ t('form.itemsEditor.actions.moveUp') }}
                    </button>
                    <button
                      class="ce-form-items-editor__icon-button"
                      type="button"
                      :data-testid="\`form-item-move-down-\${index}\`"
                      :disabled="isReadOnly || index === itemsDraft.length - 1"
                      @click="moveItem(index, 1)"
                    >
                      {{ t('form.itemsEditor.actions.moveDown') }}
                    </button>
                    <button
                      class="ce-form-items-editor__danger-button"
                      type="button"
                      :data-testid="\`form-item-remove-\${index}\`"
                      :disabled="isReadOnly"
                      @click="removeItem(index)"
                    >
                      {{ t('form.itemsEditor.actions.remove') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="ce-form-items-editor__dialog-actions">
          <button
            class="ce-form-items-editor__secondary-button"
            type="button"
            data-testid="form-items-cancel"
            @click="closeSettingsDialog"
          >
            {{ edit ? t('form.itemsEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-form-items-editor__primary-button"
            type="button"
            data-testid="form-items-save"
            @click="saveItems"
          >
            {{ t('form.itemsEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.ce-form-items-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-form-items-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-form-items-editor__primary-button {
  flex: 0 0 auto;
  min-height: 34px;
  border: 1px solid rgb(20 184 166 / 0.55);
  border-radius: 8px;
  padding: 6px 14px;
  background: rgb(20 184 166);
  color: rgb(255 255 255);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.ce-form-items-editor__primary-button:hover {
  background: rgb(13 148 136);
}

.ce-form-items-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-form-items-editor__dialog {
  width: min(calc(100vw - 32px), 1100px);
  max-height: min(calc(100vh - 32px), 860px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-form-items-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-form-items-editor__dialog-panel {
  display: flex;
  max-height: inherit;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-form-items-editor__dialog-header,
.ce-form-items-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.ce-form-items-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-form-items-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 750;
  line-height: 24px;
}

.ce-form-items-editor__dialog-body {
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.25fr);
  gap: 14px;
  overflow: auto;
  padding: 14px 16px;
}

.ce-form-items-editor__section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-form-items-editor__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px;
  background: rgb(248 250 252);
}

.ce-form-items-editor__section-body {
  padding: 12px;
}

.ce-form-items-editor__section-body--items {
  overflow: auto;
}

.ce-form-items-editor__section-title {
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 750;
  line-height: 20px;
}

.ce-form-items-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 12px;
  line-height: 18px;
}

.ce-form-items-editor__empty {
  margin: 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-form-items-editor__table {
  min-width: 720px;
}

.ce-form-items-editor__table-head,
.ce-form-items-editor__row {
  display: grid;
  grid-template-columns: minmax(130px, 0.9fr) minmax(130px, 0.9fr) 120px 160px minmax(220px, 1fr);
  align-items: center;
  gap: 8px;
}

.ce-form-items-editor__table-head {
  padding: 0 0 8px;
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.ce-form-items-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  background: rgb(255 255 255);
}

.ce-form-items-editor__row + .ce-form-items-editor__row {
  margin-top: 8px;
}

.ce-form-items-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
  font-size: 13px;
  line-height: 18px;
}

.ce-form-items-editor__input:focus {
  border-color: rgb(20 184 166);
  outline: 2px solid rgb(20 184 166 / 0.18);
}

.ce-form-items-editor__input:read-only,
.ce-form-items-editor__input:disabled {
  cursor: not-allowed;
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-form-items-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-form-items-editor__secondary-button,
.ce-form-items-editor__icon-button,
.ce-form-items-editor__danger-button {
  min-height: 32px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 5px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.ce-form-items-editor__icon-button {
  min-height: 28px;
  padding: 4px 8px;
  font-size: 12px;
}

.ce-form-items-editor__danger-button {
  border-color: rgb(254 202 202);
  color: rgb(185 28 28);
}

.ce-form-items-editor__secondary-button:hover,
.ce-form-items-editor__icon-button:hover,
.ce-form-items-editor__danger-button:hover {
  background: rgb(248 250 252);
}

.ce-form-items-editor__primary-button:disabled,
.ce-form-items-editor__secondary-button:disabled,
.ce-form-items-editor__icon-button:disabled,
.ce-form-items-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dark .ce-form-items-editor {
  color: rgb(226 232 240);
}

.dark .ce-form-items-editor__summary,
.dark .ce-form-items-editor__section-header {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(203 213 225);
}

.dark .ce-form-items-editor__dialog-panel,
.dark .ce-form-items-editor__section,
.dark .ce-form-items-editor__row {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
}

.dark .ce-form-items-editor__dialog-header,
.dark .ce-form-items-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .ce-form-items-editor__dialog-title,
.dark .ce-form-items-editor__section-title {
  color: rgb(248 250 252);
}

.dark .ce-form-items-editor__section-copy,
.dark .ce-form-items-editor__empty,
.dark .ce-form-items-editor__table-head {
  color: rgb(148 163 184);
}

.dark .ce-form-items-editor__input,
.dark .ce-form-items-editor__secondary-button,
.dark .ce-form-items-editor__icon-button,
.dark .ce-form-items-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .ce-form-items-editor__input:read-only,
.dark .ce-form-items-editor__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}

@media (max-width: 920px) {
  .ce-form-items-editor__dialog-body {
    grid-template-columns: 1fr;
  }
}
</style>
`,j=`<script lang="ts">
export { mLayoutGridEditorTool } from '@/editors/tools/mLayoutGridEditorTool';
export type {
  MLayoutGridArea,
  MLayoutGridProps,
  MLayoutGridResponsiveConfig,
  MLayoutGridTrack
} from 'mokelay-components/blocks/MLayoutGrid.vue';
<\/script>

<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs';
import type { OutputData, ToolSettings } from '@editorjs/editorjs';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createEditorTools } from '@/editors/EditorToolFactory';
import { createLocalizedParagraphToolSettings } from '@/editors/localizedParagraphTool';
import { useContentLocalization } from '@/composables/useContentLocalization';
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
const { editingLocale } = useContentLocalization();
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
    },
    paragraph: createLocalizedParagraphToolSettings({
      placeholder: t('editor.placeholder'),
      settingsLabel: t('contentLocalization.editAll'),
      saveLabel: t('editor.saveContent'),
      cancelLabel: t('globalCalls.cancel')
    })
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
      id: \`area_\${nextIndex}\`,
      name: \`区域 \${nextIndex}\`,
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

watch(editingLocale, async () => {
  await saveAllAreaEditors();
  await unmountAllAreaEditors();
  await nextTick();
  await reconcileAreaEditors();
});

onBeforeUnmount(async () => {
  await unmountAllAreaEditors();
});
<\/script>

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
`,J=`<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  isLocalizedValue,
  migrateLegacyLocalizedValue,
  normalizeLocalizedValue,
  type LocalizedValue
} from 'mokelay-components/runtime';
import { useContentLocalization } from '@/composables/useContentLocalization';
import { useI18n } from '@/i18n';
import { formatContentLocale } from '@/i18n/contentLocales';

const props = withDefaults(defineProps<{
  value?: unknown;
  placeholder?: string;
  multiline?: boolean;
  dataTestid?: string;
  readonly?: boolean;
  compact?: boolean;
  onChange?: (value: LocalizedValue) => void;
  onToolChange?: (value: LocalizedValue) => void;
}>(), { placeholder: '', multiline: false });

const { localeConfig, editingLocale, setEditingLocale } = useContentLocalization();
const { t } = useI18n();
const showAll = ref(false);
const normalizedValue = computed(() => {
  const migrated = migrateLegacyLocalizedValue(props.value);
  if (migrated) return normalizeLocalizedValue(migrated, localeConfig.value);
  if (typeof props.value === 'string') {
    return normalizeLocalizedValue({ $i18n: { [localeConfig.value.defaultLocale]: props.value } }, localeConfig.value);
  }
  return normalizeLocalizedValue(isLocalizedValue(props.value) ? props.value : undefined, localeConfig.value);
});
const visibleLocales = computed(() => showAll.value ? localeConfig.value.supportedLocales : [editingLocale.value]);
const completed = computed(() => localeConfig.value.supportedLocales.filter((locale) => normalizedValue.value.$i18n[locale]?.trim()).length);

function update(locale: string, text: string) {
  const next = normalizeLocalizedValue(normalizedValue.value, localeConfig.value);
  next.$i18n[locale] = text;
  props.onToolChange?.(next);
  props.onChange?.(next);
}
<\/script>

<template>
  <div class="localized-editor" :class="{ 'localized-editor--compact': compact }" data-testid="localized-text-editor">
    <div v-if="compact" class="localized-editor__compact-row">
      <select :value="editingLocale" :disabled="readonly" data-testid="localized-editing-locale" @change="setEditingLocale(($event.target as HTMLSelectElement).value)">
        <option v-for="locale in localeConfig.supportedLocales" :key="locale" :value="locale">{{ formatContentLocale(locale) }}</option>
      </select>
      <input type="text" :value="normalizedValue.$i18n[editingLocale]" :readonly="readonly" :placeholder="placeholder" :data-testid="dataTestid || \`localized-input-\${editingLocale}\`" @input="update(editingLocale, ($event.target as HTMLInputElement).value)">
      <span class="localized-editor__completion">{{ completed }}/{{ localeConfig.supportedLocales.length }}</span>
      <button type="button" :disabled="readonly" @click="showAll = !showAll">{{ showAll ? t('contentLocalization.collapse') : t('contentLocalization.editAll') }}</button>
      <div v-if="showAll" class="localized-editor__popover">
        <label v-for="locale in localeConfig.supportedLocales" :key="locale" class="localized-editor__field">
          <span>{{ formatContentLocale(locale) }}</span>
          <input type="text" :value="normalizedValue.$i18n[locale]" :readonly="readonly" :placeholder="placeholder" @input="update(locale, ($event.target as HTMLInputElement).value)">
        </label>
      </div>
    </div>
    <template v-else>
    <div class="localized-editor__toolbar">
      <select :value="editingLocale" :disabled="readonly" data-testid="localized-editing-locale" @change="setEditingLocale(($event.target as HTMLSelectElement).value)">
        <option v-for="locale in localeConfig.supportedLocales" :key="locale" :value="locale">{{ formatContentLocale(locale) }}</option>
      </select>
      <span>{{ completed }}/{{ localeConfig.supportedLocales.length }}</span>
      <button type="button" :disabled="readonly" @click="showAll = !showAll">{{ showAll ? t('contentLocalization.collapse') : t('contentLocalization.editAll') }}</button>
    </div>
    <label v-for="locale in visibleLocales" :key="locale" class="localized-editor__field">
      <span>{{ formatContentLocale(locale) }}</span>
      <textarea v-if="multiline" :value="normalizedValue.$i18n[locale]" :readonly="readonly" :placeholder="placeholder" :data-testid="dataTestid" @input="update(locale, ($event.target as HTMLTextAreaElement).value)" />
      <input v-else type="text" :value="normalizedValue.$i18n[locale]" :readonly="readonly" :placeholder="placeholder" :data-testid="dataTestid || \`localized-input-\${locale}\`" @input="update(locale, ($event.target as HTMLInputElement).value)" />
    </label>
    </template>
  </div>
</template>

<style scoped>
.localized-editor { display: grid; gap: 8px; }
.localized-editor__toolbar { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.localized-editor__toolbar select, .localized-editor__toolbar button, .localized-editor__field input, .localized-editor__field textarea { border: 1px solid rgb(203 213 225); border-radius: 6px; padding: 6px 8px; background: transparent; }
.localized-editor__toolbar button { margin-left: auto; cursor: pointer; }
.localized-editor__field { display: grid; gap: 4px; font-size: 12px; }
.localized-editor__field input, .localized-editor__field textarea { width: 100%; font-size: 14px; }
.localized-editor--compact { min-width: 250px; }
.localized-editor__compact-row { position: relative; display: grid; grid-template-columns: 76px minmax(110px, 1fr) auto 30px; align-items: center; gap: 4px; }
.localized-editor__compact-row select,
.localized-editor__compact-row input,
.localized-editor__compact-row button { min-width: 0; height: 32px; border: 1px solid rgb(203 213 225); border-radius: 6px; background: transparent; padding: 4px 6px; }
.localized-editor__compact-row button { overflow: hidden; padding-inline: 5px; cursor: pointer; font-size: 0; }
.localized-editor__compact-row button::before { content: '\\2026'; font-size: 16px; }
.localized-editor__completion { color: rgb(100 116 139); white-space: nowrap; font-size: 11px; }
.localized-editor__popover { position: absolute; z-index: 20; top: calc(100% + 6px); left: 0; width: min(360px, 80vw); display: grid; gap: 8px; border: 1px solid rgb(203 213 225); border-radius: 8px; background: rgb(255 255 255); box-shadow: 0 12px 32px rgb(15 23 42 / 0.2); padding: 10px; }
.dark .localized-editor__popover { background: rgb(15 23 42); }
</style>
`,$=`<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import type { MTabsTab } from 'mokelay-components/blocks/MTabs.vue';
import { normalizeLocalizedTextValue } from 'mokelay-components/runtime';

export type MTabsConfigEditorData = {
  tabs: MTabsTab[];
  activeTabId: string;
  readonly?: boolean;
};

export type MTabsConfigEditorPayload = {
  value: MTabsConfigEditorData;
  patch?: {
    tabs: MTabsTab[];
    activeTabId: string;
  };
  oldValue?: MTabsConfigEditorData;
};

export type MTabsConfigEditorValidateResult = {
  valid: boolean;
  message?: string;
};

export interface MTabsConfigEditorProps extends EditorToolComponentProps {
  value?: unknown;
  tabs?: unknown;
  activeTabId?: unknown;
  readonly?: boolean;
  outputMode?: 'value' | 'patch';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseJsonIfString(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes'].includes(normalized)) return true;
    if (['0', 'false', 'no'].includes(normalized)) return false;
  }
  return fallback;
}

function normalizePageSource(value: unknown): MTabsTab['pageSource'] {
  if (value === 'system') return 'system';
  if (value === 'user') return 'user';
  return 'user';
}

function normalizeQueryMapping(value: unknown): MTabsTab['query'] {
  if (!isRecord(value)) return undefined;

  const query: NonNullable<MTabsTab['query']> = {};
  Object.entries(value).forEach(([rawKey, rawValue]) => {
    const key = rawKey.trim();
    if (!key) return;
    if (rawValue === null || typeof rawValue === 'string') {
      query[key] = rawValue === null ? null : rawValue.trim();
      return;
    }
    if (!Array.isArray(rawValue)) return;

    const values: Array<string | null> = [];
    rawValue.forEach((item) => {
      const normalized = item === null
        ? null
        : typeof item === 'string' ? item.trim() : undefined;
      if (normalized === undefined || values.includes(normalized)) return;
      values.push(normalized);
    });
    if (values.length) query[key] = values;
  });
  return Object.keys(query).length ? query : undefined;
}

function normalizeActiveTabId(value: unknown, tabs: MTabsTab[]) {
  const activeTabId = readString(value);
  if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) {
    return activeTabId;
  }
  return tabs[0]?.id ?? '';
}

function normalizeTabsInput(value: unknown): MTabsTab[] {
  const source = parseJsonIfString(value);
  if (!Array.isArray(source)) return [];

  const tabs: MTabsTab[] = [];
  const seenIds = new Set<string>();

  source.forEach((item) => {
    if (!isRecord(item)) return;

    const id = readString(item.id);
    const name = normalizeLocalizedTextValue(item.name);
    const hasCanonical = Object.prototype.hasOwnProperty.call(item, 'pageUUID');
    const hasLegacy = Object.prototype.hasOwnProperty.call(item, 'pageUuid');
    const canonicalPageUUID = readString(item.pageUUID);
    const legacyPageUuid = readString(item.pageUuid);
    const pageUUID = canonicalPageUUID || legacyPageUuid;
    const query = normalizeQueryMapping(item.query);

    if (!id || (typeof name === 'string' && !name) || !pageUUID || seenIds.has(id)) return;

    seenIds.add(id);
    tabs.push({
      id,
      name,
      pageUUID,
      ...(hasCanonical && hasLegacy ? { pageUuid: legacyPageUuid } : {}),
      pageSource: normalizePageSource(item.pageSource),
      ...(query ? { query } : {})
    });
  });

  return tabs;
}

export function normalizeMTabsConfigEditorData(value: unknown): MTabsConfigEditorData {
  const parsed = parseJsonIfString(value);
  const record = isRecord(parsed) ? parsed : {};
  const tabsSource = isRecord(parsed) ? record.tabs : parsed;
  const tabs = normalizeTabsInput(tabsSource);
  return {
    tabs,
    activeTabId: normalizeActiveTabId(record.activeTabId, tabs),
    readonly: booleanValue(record.readonly)
  };
}

export function normalizeMTabsConfigEditorProps(
  props: Partial<MTabsConfigEditorProps>
): MTabsConfigEditorProps {
  const valueData = normalizeMTabsConfigEditorData(props.value);
  const tabs = normalizeTabsInput(props.tabs ?? valueData.tabs);
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    pageEditor: props.pageEditor,
    value: {
      tabs,
      activeTabId: normalizeActiveTabId(props.activeTabId ?? valueData.activeTabId, tabs),
      readonly: booleanValue(props.readonly ?? valueData.readonly)
    },
    tabs,
    activeTabId: normalizeActiveTabId(props.activeTabId ?? valueData.activeTabId, tabs),
    readonly: booleanValue(props.readonly ?? valueData.readonly),
    outputMode: props.outputMode === 'patch' ? 'patch' : 'value'
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MTabsConfigEditor",
 *   "displayName": "页签配置编辑器",
 *   "category": "container",
 *   "description": "页签配置编辑器，用于可视化维护 MTabs 的 tabs 列表和 activeTabId 默认激活页签。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MTabsConfigEditor",
 *     "toolSymbol": "mTabsConfigEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 1010
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "页签配置编辑器",
 *       "en": "Tabs Config Editor"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"3\\" y=\\"6\\" width=\\"18\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M7 6v12M3 10h18\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M10 14h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "tabs": [],
 *     "activeTabId": "",
 *     "readonly": false
 *   },
 *   "properties": [
 *     {
 *       "key": "tabs",
 *       "optional": true,
 *       "tsType": "MTabsTab[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "页签列表"
 *     },
 *     {
 *       "key": "activeTabId",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "默认激活页签"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "只读"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "{ value: MTabsConfigEditorData, patch?: { tabs: MTabsTab[], activeTabId: string }, oldValue?: MTabsConfigEditorData }",
 *       "trigger": "保存页签配置或方法更新时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "变更"
 *     },
 *     {
 *       "event": "clear",
 *       "payload": "{ oldValue: MTabsConfigEditorData }",
 *       "trigger": "清空页签配置时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "清空"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "value: MTabsConfigEditorData",
 *       "returns": "void",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "设置值"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "-",
 *       "returns": "MTabsConfigEditorData",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "获取值"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": "-",
 *       "returns": "void",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "清空"
 *     },
 *     {
 *       "name": "validate",
 *       "exposed": true,
 *       "async": false,
 *       "params": "-",
 *       "returns": "MTabsConfigEditorValidateResult",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "校验"
 *     }
 *   ],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时输出 tabs、activeTabId、readonly，不保存弹窗状态、页面候选缓存或校验提示。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MTabsConfigEditor-example",
 *       "type": "MTabsConfigEditor",
 *       "data": {
 *         "tabs": [],
 *         "activeTabId": "",
 *         "readonly": false
 *       }
 *     }
 *   ]
 * }
 */
export const mTabsConfigEditorTool = defineEditorTool<MTabsConfigEditorProps>({
  normalizeProps: normalizeMTabsConfigEditorProps,
  serialize: (props) => {
    const normalized = normalizeMTabsConfigEditorProps(props).value as MTabsConfigEditorData;
    return {
      tabs: normalized.tabs,
      activeTabId: normalized.activeTabId,
      readonly: normalized.readonly === true
    };
  }
});
<\/script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import MLocalizedTextEditor from '@/editors/blocks/MLocalizedTextEditor.vue';
import {
  normalizeLocalizedValue,
  resolveLocalizedValue,
  type LocalizedTextValue,
  type LocalizedValue
} from 'mokelay-components/runtime';
import { useContentLocalization } from '@/composables/useContentLocalization';
import {
  listPages,
  type PageListItem,
  type PageSource
} from '@/services/pagesApi';

type EditableTab = MTabsTab & {
  pageSource: PageSource;
};

const props = defineProps<MTabsConfigEditorProps & {
  onChange?: (payload: MTabsConfigEditorPayload) => void;
  onToolChange?: (payload: MTabsConfigEditorPayload) => void;
}>();

const emit = defineEmits<{
  (event: 'change', payload: MTabsConfigEditorPayload): void;
  (event: 'clear', payload: { oldValue: MTabsConfigEditorData }): void;
}>();

const { t } = useI18n();
const { localeConfig, editingLocale } = useContentLocalization();
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const committedValue = ref<MTabsConfigEditorData>(normalizeFromProps());
const draftTabs = ref<EditableTab[]>(toEditableTabs(committedValue.value.tabs));
const draftActiveTabId = ref(committedValue.value.activeTabId);
const validationMessage = ref('');
const pageOptions = ref<PageListItem[]>([]);
const pagesLoading = ref(false);
const pagesError = ref('');
const pageSearch = ref('');
const pageKindFilter = ref<'all' | 'main' | 'sub'>('all');
const relationNotice = ref('');
let pagesLoadId = 0;

const isReadOnly = computed(() => !props.edit || props.readonly === true || committedValue.value.readonly === true);
const savedTabCount = computed(() => committedValue.value.tabs.length);
const activeTabSummary = computed(() => {
  const activeTab = committedValue.value.tabs.find((tab) => tab.id === committedValue.value.activeTabId);
  return activeTab ? resolveEditorText(activeTab.name) : t('tabs.configEditor.summary.noActive');
});
const pageOptionsByUuid = computed(() => {
  const map = new Map<string, PageListItem>();
  pageOptions.value.forEach((page) => {
    map.set(page.uuid, page);
  });
  return map;
});

function normalizeFromProps() {
  return normalizeMTabsConfigEditorProps(props).value as MTabsConfigEditorData;
}

function toEditableTabs(tabs: MTabsTab[]): EditableTab[] {
  return tabs.map((tab) => ({
    ...cloneValue(tab),
    pageSource: 'user'
  }));
}

function fromEditableTabs(tabs: EditableTab[]): MTabsTab[] {
  return tabs.map((tab) => ({
    id: tab.id.trim(),
    name: cloneValue(tab.name),
    pageUUID: tab.pageUUID.trim(),
    pageSource: 'user',
    ...(tab.query ? { query: cloneValue(tab.query) } : {})
  }));
}

function createDraftFromCommittedValue() {
  draftTabs.value = toEditableTabs(committedValue.value.tabs);
  draftActiveTabId.value = committedValue.value.activeTabId;
  validationMessage.value = '';
  relationNotice.value = '';
}

function createTabId() {
  const existingIds = new Set(draftTabs.value.map((tab) => tab.id));
  let index = draftTabs.value.length + 1;
  let id = \`tab_\${index}\`;
  while (existingIds.has(id)) {
    index += 1;
    id = \`tab_\${index}\`;
  }
  return id;
}

function addTab() {
  if (isReadOnly.value) return;
  const id = createTabId();
  const nextTab: EditableTab = {
    id,
    name: createLocalizedText(t('tabs.configEditor.defaultTabName').replace('{index}', String(draftTabs.value.length + 1))),
    pageUUID: '',
    pageSource: 'user'
  };
  draftTabs.value.push(nextTab);
  if (!draftActiveTabId.value) {
    draftActiveTabId.value = id;
  }
}

function removeTab(index: number) {
  if (isReadOnly.value) return;
  const removed = draftTabs.value[index];
  draftTabs.value.splice(index, 1);
  if (removed?.id === draftActiveTabId.value) {
    draftActiveTabId.value = draftTabs.value[0]?.id ?? '';
  }
}

function moveTab(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= draftTabs.value.length) return;
  const nextTabs = [...draftTabs.value];
  const [tab] = nextTabs.splice(index, 1);
  if (!tab) return;
  nextTabs.splice(nextIndex, 0, tab);
  draftTabs.value = nextTabs;
}

function updateTab(index: number, patch: Partial<EditableTab>) {
  if (isReadOnly.value) return;
  const tab = draftTabs.value[index];
  if (!tab) return;
  draftTabs.value[index] = {
    ...tab,
    ...patch
  };
  if (patch.id !== undefined && draftActiveTabId.value === tab.id) {
    draftActiveTabId.value = patch.id.trim();
  }
}

function resolveEditorText(value: LocalizedTextValue) {
  return typeof value === 'string'
    ? value
    : resolveLocalizedValue(value, editingLocale.value, localeConfig.value);
}

function createLocalizedText(text: string): LocalizedValue {
  return normalizeLocalizedValue({ $i18n: { [editingLocale.value]: text } }, localeConfig.value);
}

function selectActiveTab(tabId: string) {
  if (isReadOnly.value) return;
  draftActiveTabId.value = tabId;
}

function pageOptionLabel(page: PageListItem) {
  const blocked = !isPageReferenceAllowed(page);
  return \`\${page.name || page.uuid} · \${page.subPage ? '子页面' : '主页面'}\${blocked ? ' · 循环引用' : ''}\`;
}

function isPageReferenceAllowed(page: Pick<PageListItem, 'uuid' | 'source'>) {
  return props.pageEditor?.canReference({ uuid: page.uuid, source: page.source }).allowed ?? true;
}

function filteredPageOptions(tab: EditableTab) {
  const query = pageSearch.value.trim().toLowerCase();
  return pageOptions.value.filter((page) => {
    if (pageKindFilter.value === 'sub' && !page.subPage) return false;
    if (pageKindFilter.value === 'main' && page.subPage) return false;
    if (!query) return true;
    return page.name.toLowerCase().includes(query) || page.uuid.toLowerCase().includes(query);
  });
}

function getPageOption(tab: EditableTab) {
  return pageOptionsByUuid.value.get(tab.pageUUID.trim());
}

function updateTabPageUUID(index: number, pageUUID: string) {
  if (isReadOnly.value) return;
  const tab = draftTabs.value[index];
  if (!tab) return;
  const normalizedPageUUID = pageUUID.trim();
  const page = pageOptionsByUuid.value.get(normalizedPageUUID);
  updateTab(index, {
    pageUUID: normalizedPageUUID,
    name: !resolveEditorText(tab.name).trim() && page?.name ? createLocalizedText(page.name) : tab.name
  });
}

async function createSubPage(index: number) {
  const tab = draftTabs.value[index];
  if (!tab || !props.pageEditor || isReadOnly.value) return;
  validationMessage.value = '';
  if (!props.pageEditor.canCreateSubPage) {
    validationMessage.value = '当前为临时编排会话，不能创建子页面。';
    return;
  }
  try {
    const result = await props.pageEditor.createUserSubPage({
      kind: 'tabs',
      blockId: props.currentBlockId,
      itemId: tab.id || \`tab_\${index + 1}\`
    }, {
      name: resolveEditorText(tab.name)
    });
    if (result.status !== 'saved') return;
    const page: PageListItem = {
      uuid: result.page.uuid,
      name: result.page.name,
      source: 'user',
      subPage: result.page.subPage,
      quotes: result.page.quotes,
      dependencies: result.page.dependencies
    };
    pageOptions.value = [
      page,
      ...pageOptions.value.filter((item) => \`\${item.source}:\${item.uuid}\` !== \`user:\${page.uuid}\`)
    ];
    updateTab(index, { pageUUID: page.uuid, pageSource: 'user' });
    relationNotice.value = '子页面已保存；待当前页面保存后建立引用关系。';
  } catch (error) {
    validationMessage.value = error instanceof Error ? error.message : '无法打开子页面编排器。';
  }
}

async function editSubPage(index: number) {
  const tab = draftTabs.value[index];
  if (!tab || !tab.pageUUID.trim() || !props.pageEditor) return;
  validationMessage.value = '';
  try {
    await props.pageEditor.openExisting({
      uuid: tab.pageUUID.trim(),
      source: 'user'
    }, {
      kind: 'tabs',
      blockId: props.currentBlockId,
      itemId: tab.id || \`tab_\${index + 1}\`
    });
  } catch (error) {
    validationMessage.value = error instanceof Error ? error.message : '无法打开子页面编排器。';
  }
}

function validateTabsValue(tabs: EditableTab[], activeTabId: string): MTabsConfigEditorValidateResult {
  const seenIds = new Set<string>();

  for (const tab of tabs) {
    const id = tab.id.trim();
    if (!id) return { valid: false, message: t('tabs.configEditor.validation.emptyId') };
    if (seenIds.has(id)) return { valid: false, message: t('tabs.configEditor.validation.duplicateId').replace('{id}', id) };
    seenIds.add(id);

    if (!resolveEditorText(tab.name).trim()) return { valid: false, message: t('tabs.configEditor.validation.emptyName') };
    if (!tab.pageUUID.trim()) return { valid: false, message: t('tabs.configEditor.validation.emptyPageUUID') };
  }

  if (activeTabId && !seenIds.has(activeTabId)) {
    return { valid: false, message: t('tabs.configEditor.validation.invalidActive') };
  }

  return { valid: true };
}

function buildValueFromDraft(): MTabsConfigEditorData {
  const tabs = fromEditableTabs(draftTabs.value);
  const activeTabId = normalizeActiveTabId(draftActiveTabId.value, tabs);
  return {
    tabs,
    activeTabId,
    readonly: committedValue.value.readonly === true
  };
}

function buildPayload(value: MTabsConfigEditorData, oldValue?: MTabsConfigEditorData): MTabsConfigEditorPayload {
  const clonedValue = cloneValue(value);
  const payload: MTabsConfigEditorPayload = {
    value: clonedValue,
    ...(oldValue ? { oldValue: cloneValue(oldValue) } : {})
  };

  if (props.outputMode === 'patch') {
    payload.patch = {
      tabs: cloneValue(clonedValue.tabs),
      activeTabId: clonedValue.activeTabId
    };
  }

  return payload;
}

function emitValueChange(value: MTabsConfigEditorData, oldValue?: MTabsConfigEditorData) {
  const payload = buildPayload(value, oldValue);
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  emit('change', payload);
}

function saveTabs() {
  if (isReadOnly.value) return;
  const validation = validateTabsValue(draftTabs.value, draftActiveTabId.value);
  if (!validation.valid) {
    validationMessage.value = validation.message ?? t('tabs.configEditor.validation.invalid');
    return;
  }

  const oldValue = cloneValue(committedValue.value);
  const nextValue = buildValueFromDraft();
  committedValue.value = nextValue;
  emitValueChange(nextValue, oldValue);
  closeSettingsDialog();
}

function clearTabs() {
  if (isReadOnly.value) return;
  const oldValue = cloneValue(committedValue.value);
  const nextValue: MTabsConfigEditorData = {
    tabs: [],
    activeTabId: '',
    readonly: committedValue.value.readonly === true
  };
  committedValue.value = nextValue;
  createDraftFromCommittedValue();
  props.onToolChange?.(buildPayload(nextValue, oldValue));
  props.onChange?.(buildPayload(nextValue, oldValue));
  emit('clear', { oldValue });
  emit('change', buildPayload(nextValue, oldValue));
}

function getValue() {
  return cloneValue(committedValue.value);
}

function setValue(value: unknown) {
  const oldValue = cloneValue(committedValue.value);
  const nextValue = normalizeMTabsConfigEditorData(value);
  committedValue.value = nextValue;
  if (!isSettingsDialogOpen.value) {
    createDraftFromCommittedValue();
  }
  emitValueChange(nextValue, oldValue);
}

function validate() {
  return validateTabsValue(toEditableTabs(committedValue.value.tabs), committedValue.value.activeTabId);
}

async function refreshPages() {
  const loadId = ++pagesLoadId;
  pagesLoading.value = true;
  pagesError.value = '';

  try {
    const userPages = await listPages({
      page: 1,
      pageSize: 1000,
      ...(props.pageEditor?.appUuid ? { appUuid: props.pageEditor.appUuid } : {})
    });
    if (loadId !== pagesLoadId) return;
    pageOptions.value = userPages.filter((page) => page.source === 'user');
  } catch {
    if (loadId === pagesLoadId) pagesError.value = t('tabs.configEditor.pageOptionsLoadFailed');
  } finally {
    if (loadId === pagesLoadId) {
      pagesLoading.value = false;
    }
  }
}

function openSettingsDialog() {
  createDraftFromCommittedValue();
  isSettingsDialogOpen.value = true;
  if (!settingsDialogRef.value?.open) {
    settingsDialogRef.value?.showModal();
  }
  if (!pageOptions.value.length) {
    void refreshPages();
  }
}

function closeSettingsDialog() {
  isSettingsDialogOpen.value = false;
  if (settingsDialogRef.value?.open) {
    settingsDialogRef.value.close();
  }
}

watch(
  () => [props.value, props.tabs, props.activeTabId, props.readonly],
  () => {
    committedValue.value = normalizeFromProps();
    if (!isSettingsDialogOpen.value) {
      createDraftFromCommittedValue();
    }
  },
  { deep: true, immediate: true }
);

onBeforeUnmount(() => {
  pagesLoadId += 1;
});

defineExpose({
  setValue,
  getValue,
  clear: clearTabs,
  validate,
  refresh: refreshPages
});
<\/script>

<template>
  <div class="tabs-config-editor" data-testid="tabs-config-editor">
    <div class="tabs-config-editor__trigger-row">
      <button
        class="tabs-config-editor__primary-button"
        type="button"
        data-testid="tabs-config-settings-open"
        :disabled="isReadOnly"
        @click="openSettingsDialog"
      >
        {{ t('tabs.configEditor.actions.settings') }}
      </button>
      <div class="tabs-config-editor__summary" data-testid="tabs-config-summary">
        {{
          t('tabs.configEditor.summary.savedCount')
            .replace('{count}', String(savedTabCount))
            .replace('{active}', activeTabSummary)
        }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="tabs-config-editor__dialog"
      data-testid="tabs-config-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="tabs-config-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="tabs-config-editor__dialog-panel">
        <div class="tabs-config-editor__dialog-header">
          <h3
            id="tabs-config-dialog-title"
            class="tabs-config-editor__dialog-title"
            data-testid="tabs-config-dialog-title"
          >
            {{ t('tabs.configEditor.title') }}
          </h3>
          <button
            class="tabs-config-editor__secondary-button"
            type="button"
            data-testid="tabs-config-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="tabs-config-editor__dialog-body">
          <div class="tabs-config-editor__toolbar">
            <button
              class="tabs-config-editor__primary-button"
              type="button"
              data-testid="tabs-config-add"
              :disabled="isReadOnly"
              @click="addTab"
            >
              {{ t('tabs.configEditor.actions.add') }}
            </button>
            <button
              class="tabs-config-editor__secondary-button"
              type="button"
              data-testid="tabs-config-refresh-pages"
              :disabled="pagesLoading"
              @click="refreshPages"
            >
              {{ pagesLoading ? t('tabs.configEditor.loadingPages') : t('tabs.configEditor.actions.refreshPages') }}
            </button>
            <button
              class="tabs-config-editor__danger-button"
              type="button"
              data-testid="tabs-config-clear"
              :disabled="isReadOnly || !committedValue.tabs.length"
              @click="clearTabs"
            >
              {{ t('tabs.configEditor.actions.clear') }}
            </button>
          </div>

          <p v-if="pagesError" class="tabs-config-editor__notice tabs-config-editor__notice--warning">
            {{ pagesError }}
          </p>
          <div class="tabs-config-editor__page-filters">
            <input
              v-model="pageSearch"
              class="tabs-config-editor__input"
              type="search"
              placeholder="按页面名称或 UUID 搜索"
              data-testid="tabs-config-page-search"
            >
            <select v-model="pageKindFilter" class="tabs-config-editor__input" data-testid="tabs-config-page-kind-filter">
              <option value="all">全部页面</option>
              <option value="main">主页面</option>
              <option value="sub">子页面</option>
            </select>
          </div>

          <p v-if="relationNotice" class="tabs-config-editor__notice tabs-config-editor__notice--info" data-testid="tabs-config-relation-notice">
            {{ relationNotice }}
          </p>

          <p
            v-if="!draftTabs.length"
            class="tabs-config-editor__empty"
            data-testid="tabs-config-empty"
          >
            {{ t('tabs.configEditor.empty') }}
          </p>

          <div v-else class="tabs-config-editor__table" data-testid="tabs-config-list">
            <div class="tabs-config-editor__table-head" aria-hidden="true">
              <span>{{ t('tabs.configEditor.columns.active') }}</span>
              <span>{{ t('tabs.configEditor.columns.id') }}</span>
              <span>{{ t('tabs.configEditor.columns.name') }}</span>
              <span>{{ t('tabs.configEditor.columns.pageUUID') }}</span>
              <span>{{ t('tabs.configEditor.columns.actions') }}</span>
            </div>

            <div
              v-for="(tab, index) in draftTabs"
              :key="\`\${tab.id}-\${index}\`"
              class="tabs-config-editor__row"
              :data-testid="\`tabs-config-row-\${index}\`"
            >
              <label class="tabs-config-editor__active-cell">
                <input
                  type="radio"
                  name="tabs-config-active-tab"
                  :checked="draftActiveTabId === tab.id"
                  :disabled="isReadOnly || !tab.id"
                  :aria-label="t('tabs.configEditor.columns.active')"
                  :data-testid="\`tabs-config-active-\${index}\`"
                  @change="selectActiveTab(tab.id)"
                >
              </label>

              <input
                class="tabs-config-editor__input"
                type="text"
                :value="tab.id"
                :readonly="isReadOnly"
                :data-testid="\`tabs-config-id-\${index}\`"
                @input="updateTab(index, { id: ($event.target as HTMLInputElement).value })"
              >

              <MLocalizedTextEditor
                compact
                :readonly="isReadOnly"
                :value="tab.name"
                :data-testid="\`tabs-config-name-\${index}\`"
                :on-change="(value) => updateTab(index, { name: value })"
              />

              <div class="tabs-config-editor__page-cell">
                <select
                  class="tabs-config-editor__input"
                  :value="tab.pageUUID"
                  :disabled="isReadOnly || pagesLoading"
                  :data-testid="\`tabs-config-page-uuid-\${index}\`"
                  @change="updateTabPageUUID(index, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">请选择页面</option>
                  <option
                    v-if="tab.pageUUID && !pageOptions.some((page) => page.uuid === tab.pageUUID)"
                    :value="tab.pageUUID"
                  >
                    {{ tab.pageUUID }}（当前配置）
                  </option>
                  <option
                    v-for="page in filteredPageOptions(tab)"
                    :key="\`\${page.source}:\${page.uuid}\`"
                    :value="page.uuid"
                    :disabled="!isPageReferenceAllowed(page)"
                  >
                    {{ pageOptionLabel(page) }}
                  </option>
                </select>
                <span
                  v-if="getPageOption(tab)"
                  class="tabs-config-editor__page-name"
                  :data-testid="\`tabs-config-page-name-\${index}\`"
                >
                  {{ getPageOption(tab)?.name || getPageOption(tab)?.uuid }}
                </span>
              </div>

              <div class="tabs-config-editor__actions">
                <button
                  class="tabs-config-editor__secondary-button"
                  type="button"
                  :disabled="isReadOnly || !pageEditor || !pageEditor.canCreateSubPage"
                  :data-testid="\`tabs-config-create-page-\${index}\`"
                  @click="createSubPage(index)"
                >
                  新建子页面
                </button>
                <button
                  class="tabs-config-editor__secondary-button"
                  type="button"
                  :disabled="!pageEditor || !tab.pageUUID"
                  :data-testid="\`tabs-config-edit-page-\${index}\`"
                  @click="editSubPage(index)"
                >
                  {{ !pageEditor?.canPersist ? '临时编排页面' : '编排页面' }}
                </button>
                <button
                  class="tabs-config-editor__icon-button"
                  type="button"
                  :disabled="isReadOnly || index === 0"
                  :data-testid="\`tabs-config-move-up-\${index}\`"
                  @click="moveTab(index, -1)"
                >
                  ↑
                </button>
                <button
                  class="tabs-config-editor__icon-button"
                  type="button"
                  :disabled="isReadOnly || index === draftTabs.length - 1"
                  :data-testid="\`tabs-config-move-down-\${index}\`"
                  @click="moveTab(index, 1)"
                >
                  ↓
                </button>
                <button
                  class="tabs-config-editor__danger-button"
                  type="button"
                  :disabled="isReadOnly"
                  :data-testid="\`tabs-config-remove-\${index}\`"
                  @click="removeTab(index)"
                >
                  {{ t('tabs.configEditor.actions.remove') }}
                </button>
              </div>
            </div>
          </div>

          <p
            v-if="validationMessage"
            class="tabs-config-editor__notice tabs-config-editor__notice--error"
            data-testid="tabs-config-validation"
          >
            {{ validationMessage }}
          </p>
        </div>

        <div class="tabs-config-editor__dialog-actions">
          <button
            class="tabs-config-editor__secondary-button"
            type="button"
            data-testid="tabs-config-cancel"
            @click="closeSettingsDialog"
          >
            {{ t('globalCalls.cancel') }}
          </button>
          <button
            class="tabs-config-editor__primary-button"
            type="button"
            data-testid="tabs-config-save"
            :disabled="isReadOnly"
            @click="saveTabs"
          >
            {{ t('editor.saveContent') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.tabs-config-editor {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 8px;
}

.tabs-config-editor__trigger-row,
.tabs-config-editor__toolbar,
.tabs-config-editor__dialog-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tabs-config-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  flex: 1 1 220px;
  font-size: 12px;
  line-height: 18px;
  padding: 7px 10px;
}

.tabs-config-editor__primary-button,
.tabs-config-editor__secondary-button,
.tabs-config-editor__icon-button,
.tabs-config-editor__danger-button {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  min-height: 32px;
  padding: 6px 10px;
}

.tabs-config-editor__primary-button {
  border-color: rgb(37 99 235);
  background: rgb(37 99 235);
  color: white;
}

.tabs-config-editor__danger-button {
  border-color: rgb(254 202 202);
  color: rgb(185 28 28);
}

.tabs-config-editor__icon-button {
  width: 32px;
  padding: 6px;
}

.tabs-config-editor__primary-button:hover,
.tabs-config-editor__secondary-button:hover,
.tabs-config-editor__icon-button:hover,
.tabs-config-editor__danger-button:hover {
  filter: brightness(0.98);
}

.tabs-config-editor__primary-button:disabled,
.tabs-config-editor__secondary-button:disabled,
.tabs-config-editor__icon-button:disabled,
.tabs-config-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.tabs-config-editor__dialog {
  width: min(960px, calc(100vw - 32px));
  max-width: 960px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  padding: 0;
}

.tabs-config-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.tabs-config-editor__dialog-panel {
  display: flex;
  max-height: min(760px, calc(100vh - 48px));
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 12px;
  background: rgb(255 255 255);
  box-shadow: 0 24px 60px rgb(15 23 42 / 0.22);
}

.tabs-config-editor__dialog-header,
.tabs-config-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.tabs-config-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.tabs-config-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  line-height: 24px;
}

.tabs-config-editor__dialog-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  padding: 16px;
}

.tabs-config-editor__empty,
.tabs-config-editor__notice {
  margin: 0;
  border: 1px dashed rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 13px;
  line-height: 20px;
  padding: 12px;
}

.tabs-config-editor__notice--warning {
  border-color: rgb(253 230 138);
  background: rgb(254 252 232);
  color: rgb(146 64 14);
}

.tabs-config-editor__notice--error {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

.tabs-config-editor__notice--info {
  border-color: rgb(165 243 252);
  background: rgb(236 254 255);
  color: rgb(14 116 144);
}

.tabs-config-editor__page-filters {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 150px;
  gap: 8px;
}

.tabs-config-editor__table {
  display: grid;
  min-width: 900px;
  gap: 8px;
}

.tabs-config-editor__table-head,
.tabs-config-editor__row {
  display: grid;
  grid-template-columns: 56px minmax(105px, 0.75fr) minmax(250px, 1.35fr) minmax(180px, 1fr) 330px;
  align-items: center;
  gap: 8px;
}

.tabs-config-editor__table-head {
  color: rgb(71 85 105);
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  padding: 0 8px;
}

.tabs-config-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
  padding: 8px;
}

.tabs-config-editor__active-cell {
  display: flex;
  justify-content: center;
}

.tabs-config-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 13px;
  line-height: 20px;
  padding: 7px 9px;
}

.tabs-config-editor__input:focus {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 2px rgb(37 99 235 / 0.16);
  outline: none;
}

.tabs-config-editor__input:read-only,
.tabs-config-editor__input:disabled {
  background: rgb(248 250 252);
  color: rgb(100 116 139);
}

.tabs-config-editor__page-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.tabs-config-editor__page-name {
  overflow: hidden;
  color: rgb(100 116 139);
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tabs-config-editor__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.dark .tabs-config-editor__summary,
.dark .tabs-config-editor__empty,
.dark .tabs-config-editor__row,
.dark .tabs-config-editor__dialog-panel {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

.dark .tabs-config-editor__summary,
.dark .tabs-config-editor__empty,
.dark .tabs-config-editor__table-head,
.dark .tabs-config-editor__page-name {
  color: rgb(203 213 225);
}

.dark .tabs-config-editor__dialog-header,
.dark .tabs-config-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .tabs-config-editor__dialog-title {
  color: rgb(248 250 252);
}

.dark .tabs-config-editor__input,
.dark .tabs-config-editor__secondary-button,
.dark .tabs-config-editor__icon-button,
.dark .tabs-config-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
  color: rgb(248 250 252);
}

.dark .tabs-config-editor__input:read-only,
.dark .tabs-config-editor__input:disabled {
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}

.dark .tabs-config-editor__notice--warning {
  border-color: rgb(146 64 14);
  background: rgb(146 64 14 / 0.2);
  color: rgb(253 230 138);
}

.dark .tabs-config-editor__notice--error {
  border-color: rgb(127 29 29);
  background: rgb(127 29 29 / 0.24);
  color: rgb(254 202 202);
}

@media (max-width: 760px) {
  .tabs-config-editor__dialog {
    width: calc(100vw - 16px);
  }

  .tabs-config-editor__dialog-panel {
    max-height: calc(100vh - 16px);
  }

  .tabs-config-editor__dialog-header,
  .tabs-config-editor__dialog-actions,
  .tabs-config-editor__dialog-body {
    padding: 12px;
  }
}
</style>
`,U=`<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import { valueBlockDataField } from 'mokelay-components/blocks/blockDataFields';
import {
  normalizeVariableDataType as normalizeEditorVariableDataType,
  normalizeVariableValueConfig as normalizeEditorVariableValueConfig,
  serializeVariableValueConfig as serializeEditorVariableValueConfig,
  type BlockDataSource as EditorBlockDataSource,
  type GetAvailableBlockDataSources as EditorGetAvailableBlockDataSources,
  type GetAvailablePageVariableSources as EditorGetAvailablePageVariableSources,
  type PageVariableSource as EditorPageVariableSource,
  type VariableOption as EditorVariableOption,
  type VariableValueDataType as EditorVariableValueDataType
} from 'mokelay-components/runtime';

export interface MVariableValueEditorProps extends EditorToolComponentProps {
  value?: unknown;
  modelValue?: unknown;
  variables?: EditorVariableOption[];
  blockDataSources?: EditorBlockDataSource[];
  pageVariableSources?: EditorPageVariableSource[];
  getAvailableBlockDataSources?: EditorGetAvailableBlockDataSources;
  getAvailablePageVariableSources?: EditorGetAvailablePageVariableSources;
  valueType?: EditorVariableValueDataType;
  readonly?: boolean;
  multiline?: boolean;
  placeholder?: string;
  testid?: string;
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes'].includes(normalized)) return true;
    if (['0', 'false', 'no'].includes(normalized)) return false;
  }
  return fallback;
}

function normalizeMVariableValueEditorProps(props: Partial<MVariableValueEditorProps>): MVariableValueEditorProps {
  const value = props.value !== undefined ? props.value : props.modelValue;
  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    value: serializeEditorVariableValueConfig(normalizeEditorVariableValueConfig(value)),
    modelValue: serializeEditorVariableValueConfig(normalizeEditorVariableValueConfig(value)),
    valueType: normalizeEditorVariableDataType(props.valueType),
    readonly: booleanValue(props.readonly),
    multiline: booleanValue(props.multiline),
    placeholder: stringValue(props.placeholder),
    testid: stringValue(props.testid)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MVariableValueEditor",
 *   "displayName": "变量值编辑器",
 *   "category": "content",
 *   "description": "变量值编辑器，用于在固定值、Block 输出变量、页面变量、存储变量和 flow 表达式之间切换，并序列化为可运行的 VariableValueConfig 或普通值。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MVariableValueEditor",
 *     "toolSymbol": "mVariableValueEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 170
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "变量值编辑器",
 *       "en": "Variable Value Editor"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M4 7h6M14 7h6M4 17h6M14 17h6\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/><path d=\\"M10 7c2 0 2 10 4 10M14 7c-2 0-2 10-4 10\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": "",
 *     "valueType": "string",
 *     "multiline": false,
 *     "readonly": false,
 *     "placeholder": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown | VariableValueConfig",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "值配置"
 *     },
 *     {
 *       "key": "valueType",
 *       "optional": true,
 *       "tsType": "VariableValueDataType",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值类型",
 *       "type": "select",
 *       "options": [
 *         { "value": "string", "label": "字符串" },
 *         { "value": "number", "label": "数字" },
 *         { "value": "boolean", "label": "布尔" },
 *         { "value": "object", "label": "对象" },
 *         { "value": "array", "label": "数组" }
 *       ]
 *     },
 *     {
 *       "key": "multiline",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "多行输入",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "update:modelValue",
 *       "payload": "value: unknown",
 *       "trigger": "值配置变化时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "label": "更新绑定值"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "{ value: unknown }",
 *       "trigger": "值配置变化时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "label": "变更"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "value: unknown",
 *       "returns": "void",
 *       "label": "设置值"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "unknown",
 *       "label": "获取值"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "void",
 *       "label": "清空"
 *     },
 *     {
 *       "name": "validate",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "{ valid: boolean; message?: string }",
 *       "label": "校验"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只输出 value、valueType、multiline、readonly 和 placeholder。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MVariableValueEditor-example",
 *       "type": "MVariableValueEditor",
 *       "data": {
 *         "value": "",
 *         "valueType": "string",
 *         "multiline": false,
 *         "readonly": false,
 *         "placeholder": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MVariableValueEditor.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mVariableValueEditorTool = defineEditorTool<MVariableValueEditorProps>({
  getDataFields: (context) => valueBlockDataField(normalizeEditorVariableDataType(context.data.valueType)),
  normalizeProps: normalizeMVariableValueEditorProps,
  serialize: (props) => {
    const normalized = normalizeMVariableValueEditorProps(props);
    return {
      value: normalized.value,
      valueType: normalized.valueType,
      multiline: normalized.multiline,
      readonly: normalized.readonly,
      placeholder: normalized.placeholder
    };
  }
});
<\/script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import MVariableFlowDialog from '@/editors/dialogs/MVariableFlowDialog.vue';
import ProcessorConfigDialog from '@/processors/components/ProcessorConfigDialog.vue';
import { getProcessorDefinition, processorName } from 'mokelay-components/processors';
import type { ProcessorConfig } from 'mokelay-components/processors';
import type { DatasourceSchemaSelection } from 'mokelay-components/datasource';
import {
  createFlowFromInput,
  createFlowFromVariable,
  normalizeVariableOptions,
  normalizeBlockDataSources,
  normalizePageVariableSources,
  normalizeVariableValueConfig,
  serializeVariableValueConfig,
  stringifyVariableValue,
  validateVariableFlowConfig,
  type BlockDataSource,
  type GetAvailableBlockDataSources,
  type GetAvailablePageVariableSources,
  type PageVariableSource,
  type VariableFlowConfig,
  type VariableOption,
  type VariableValueConfig,
  type VariableValueDataType,
  type VariableValueSource
} from 'mokelay-components/runtime';

const props = withDefaults(defineProps<{
  edit?: boolean;
  value?: unknown;
  modelValue?: unknown;
  variables?: VariableOption[];
  blockDataSources?: BlockDataSource[];
  pageVariableSources?: PageVariableSource[];
  getAvailableBlockDataSources?: GetAvailableBlockDataSources;
  getAvailablePageVariableSources?: GetAvailablePageVariableSources;
  currentBlockId?: string;
  valueType?: VariableValueDataType;
  readonly?: boolean;
  multiline?: boolean;
  placeholder?: string;
  testid?: string;
}>(), {
  edit: false,
  readonly: false,
  multiline: false,
  placeholder: '',
  testid: ''
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void;
  (event: 'change', payload: { value: unknown }): void;
}>();

const { t } = useI18n();
const mode = ref<VariableValueConfig['mode']>('input');
const inputValue = ref('');
const variableSource = ref<VariableValueSource>('Block');
const blockId = ref('');
const blockType = ref('');
const pageId = ref('');
const variableName = ref('');
const variableProcessors = ref<ProcessorConfig[]>([]);
const flowValue = ref<VariableFlowConfig>(createFlowFromInput(''));
const processorOpen = ref(false);
const flowOpen = ref(false);
const previousSummary = ref('');
const pageIdListId = \`variable-page-id-options-\${Math.random().toString(36).slice(2)}\`;
const inputErrorId = \`variable-value-error-\${Math.random().toString(36).slice(2)}\`;
let lastEmittedValue = '';
const legacySourceBlockId = '__legacy_variables__';
const variableSourceOptions: Array<{ value: VariableValueSource; label: string }> = [
  { value: 'Block', label: 'Block' },
  { value: 'MPage', label: 'MPage' },
  { value: 'Cookie', label: 'Cookie' },
  { value: 'localStorage', label: 'localStorage' },
  { value: 'sessionStorage', label: 'sessionStorage' }
];

const normalizedVariables = computed(() => normalizeVariableOptions(props.variables));
const availablePageVariableSources = computed(() => {
  const sources = normalizePageVariableSources(
    props.pageVariableSources ?? props.getAvailablePageVariableSources?.()
  );
  if (!pageId.value || sources.some((source) => source.pageId === pageId.value)) return sources;

  return [{
    pageId: pageId.value,
    pageLabel: t('variableValue.variable.missingPage').replace('{pageId}', pageId.value)
  }, ...sources];
});
const availableBlockDataSources = computed(() => {
  const sources = normalizeBlockDataSources(
    props.blockDataSources ?? props.getAvailableBlockDataSources?.(props.currentBlockId)
  );
  const hasSelectedSource = blockId.value && sources.some((source) => source.blockId === blockId.value);
  const shouldShowLegacySource = normalizedVariables.value.length && !sources.length;
  const legacySource = shouldShowLegacySource
    ? [{
        blockId: legacySourceBlockId,
        blockType: 'legacy',
        blockLabel: t('variableValue.variable.legacySource'),
        fields: normalizedVariables.value.map((variable) => ({
          label: variable.label,
          variable: variable.name,
          dataType: variable.type
        }))
      }]
    : [];
  const missingSource = blockId.value && variableName.value && !hasSelectedSource
    ? [{
        blockId: blockId.value,
        blockType: blockType.value || 'missing',
        blockLabel: t('variableValue.variable.missingBlock').replace('{blockId}', blockId.value),
        fields: [{
          label: variableName.value,
          variable: variableName.value,
          dataType: 'string' as VariableValueDataType
        }]
      }]
    : [];
  return [...missingSource, ...sources, ...legacySource];
});
const selectedBlock = computed(() => {
  if (variableSource.value !== 'Block') return undefined;
  if (!blockId.value) {
    return availableBlockDataSources.value.find((source) => source.blockId === legacySourceBlockId);
  }
  return availableBlockDataSources.value.find((source) => source.blockId === blockId.value);
});
const selectedField = computed(() => selectedBlock.value?.fields.find((field) => field.variable === variableName.value));
const processorField = computed<DatasourceSchemaSelection | undefined>(() => {
  if (variableSource.value !== 'Block') {
    const variable = variableName.value.trim();
    if (!variable) return undefined;
    return {
      path: variable,
      label: variable,
      type: props.valueType ?? 'string',
      processors: variableProcessors.value
    };
  }

  const field = selectedField.value;
  if (!field) return undefined;
  return {
    path: field.variable,
    label: field.label,
    type: field.dataType,
    processors: variableProcessors.value
  };
});
const inputValidation = computed(() => mode.value === 'input'
  ? parseInputValue(inputValue.value)
  : { valid: true as const, value: undefined });
const inputValidationError = computed(() => inputValidation.value.valid ? '' : inputValidation.value.message);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseInputValue(value: string): { valid: true; value: unknown } | { valid: false; message: string } {
  const valueType = props.valueType ?? 'string';
  if (valueType === 'string') {
    return { valid: true, value };
  }

  const trimmed = value.trim();
  if (valueType === 'number') {
    const numberValue = Number(trimmed);
    return trimmed && Number.isFinite(numberValue)
      ? { valid: true, value: numberValue }
      : { valid: false, message: t('variableValue.validation.invalidNumber') };
  }

  if (valueType === 'boolean') {
    const normalized = trimmed.toLowerCase();
    if (normalized === 'true') return { valid: true, value: true };
    if (normalized === 'false') return { valid: true, value: false };
    return { valid: false, message: t('variableValue.validation.invalidBoolean') };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (valueType === 'array') {
      return Array.isArray(parsed)
        ? { valid: true, value: parsed }
        : { valid: false, message: t('variableValue.validation.invalidArray') };
    }

    return isPlainObject(parsed)
      ? { valid: true, value: parsed }
      : { valid: false, message: t('variableValue.validation.invalidObject') };
  } catch {
    return {
      valid: false,
      message: valueType === 'array'
        ? t('variableValue.validation.invalidArray')
        : valueType === 'object'
          ? t('variableValue.validation.invalidObject')
          : t('variableValue.validation.invalidJson')
    };
  }
}

function boundValue() {
  return props.modelValue !== undefined ? props.modelValue : props.value;
}

function syncFromValue(value: unknown) {
  const config = normalizeVariableValueConfig(value);
  mode.value = config.mode;
  previousSummary.value = stringifyVariableValue(config);
  if (config.mode === 'input') {
    inputValue.value = config.value;
    variableSource.value = 'Block';
    blockId.value = '';
    blockType.value = '';
    pageId.value = '';
    variableName.value = '';
    variableProcessors.value = [];
    flowValue.value = createFlowFromInput(config.value);
    return;
  }
  if (config.mode === 'variable') {
    inputValue.value = '';
    variableSource.value = config.source ?? 'Block';
    blockId.value = config.blockId ?? '';
    blockType.value = config.blockType ?? '';
    pageId.value = config.pageId ?? '';
    variableName.value = config.variable;
    variableProcessors.value = [...(config.processors ?? [])];
    flowValue.value = createFlowFromVariable(config.variable, variableProcessors.value, {
      source: config.source ?? 'Block',
      blockId: config.blockId,
      blockType: config.blockType,
      pageId: config.pageId
    });
    return;
  }
  inputValue.value = '';
  variableSource.value = 'Block';
  blockId.value = '';
  blockType.value = '';
  pageId.value = '';
  variableName.value = '';
  variableProcessors.value = [];
  flowValue.value = config.flow;
}

function emitValue(value: unknown) {
  lastEmittedValue = JSON.stringify(value);
  emit('update:modelValue', value);
  emit('change', { value });
}

function buildVariableConfig(): VariableValueConfig {
  const base = {
    mode: 'variable' as const,
    source: variableSource.value,
    variable: variableName.value,
    ...(variableProcessors.value.length ? { processors: variableProcessors.value } : {})
  };

  if (variableSource.value === 'MPage') {
    return {
      ...base,
      ...(pageId.value ? { pageId: pageId.value } : {})
    };
  }

  if (variableSource.value === 'Cookie' || variableSource.value === 'localStorage' || variableSource.value === 'sessionStorage') {
    return base;
  }

  return {
    ...base,
    ...(blockId.value ? { blockId: blockId.value } : {}),
    ...(blockId.value && blockType.value ? { blockType: blockType.value } : {})
  };
}

function emitCurrentMode() {
  if (props.readonly) return;
  if (mode.value === 'input') {
    const result = parseInputValue(inputValue.value);
    if (!result.valid) return;
    emitValue(result.value);
    return;
  }
  if (mode.value === 'variable') {
    emitValue(buildVariableConfig());
    return;
  }
  emitValue({ mode: 'flow', flow: flowValue.value });
}

function switchMode(nextMode: VariableValueConfig['mode']) {
  if (props.readonly || nextMode === mode.value) return;
  previousSummary.value = stringifyVariableValue(normalizeVariableValueConfig(currentConfig()));
  if (nextMode === 'input') {
    mode.value = 'input';
    inputValue.value = '';
    emitCurrentMode();
    return;
  }
  if (nextMode === 'variable') {
    mode.value = 'variable';
    variableSource.value = 'Block';
    blockId.value = '';
    blockType.value = '';
    pageId.value = '';
    variableName.value = '';
    variableProcessors.value = [];
    emitCurrentMode();
    return;
  }
  flowValue.value = mode.value === 'variable' && variableName.value
    ? createFlowFromVariable(variableName.value, variableProcessors.value, {
        source: variableSource.value,
        ...(blockId.value ? { blockId: blockId.value } : {}),
        ...(blockId.value && blockType.value ? { blockType: blockType.value } : {}),
        ...(pageId.value ? { pageId: pageId.value } : {})
      })
    : createFlowFromInput(inputValue.value || previousSummary.value);
  mode.value = 'flow';
  flowOpen.value = true;
  emitCurrentMode();
}

function currentConfig(): VariableValueConfig {
  if (mode.value === 'input') return { mode: 'input', value: inputValue.value };
  if (mode.value === 'variable') {
    return buildVariableConfig();
  }
  return { mode: 'flow', flow: flowValue.value };
}

function updateInput(value: string) {
  if (props.readonly) return;
  inputValue.value = value;
  if (mode.value !== 'input') mode.value = 'input';
  emitCurrentMode();
}

function updateVariableSource(value: string) {
  if (props.readonly) return;
  const nextSource = variableSourceOptions.some((option) => option.value === value)
    ? value as VariableValueSource
    : 'Block';
  if (nextSource === variableSource.value) return;

  variableSource.value = nextSource;
  blockId.value = '';
  blockType.value = '';
  pageId.value = '';
  variableName.value = '';
  variableProcessors.value = [];
  emitCurrentMode();
}

function updateBlock(value: string) {
  if (props.readonly) return;
  if (variableSource.value !== 'Block') return;
  const next = availableBlockDataSources.value.find((source) => source.blockId === value);
  blockId.value = next && next.blockId !== legacySourceBlockId ? next.blockId : '';
  blockType.value = next && next.blockId !== legacySourceBlockId ? next.blockType : '';
  variableName.value = next?.fields[0]?.variable ?? '';
  variableProcessors.value = [];
  emitCurrentMode();
}

function updatePageId(value: string) {
  if (props.readonly) return;
  pageId.value = value.trim();
  emitCurrentMode();
}

function updateVariable(value: string) {
  if (props.readonly) return;
  const previous = selectedField.value;
  const next = selectedBlock.value?.fields.find((field) => field.variable === value);
  variableName.value = value;
  if (previous && next && previous.dataType !== next.dataType) {
    variableProcessors.value = [];
  }
  emitCurrentMode();
}

function applyProcessors(processors: ProcessorConfig[]) {
  if (props.readonly) return;
  variableProcessors.value = processors;
  processorOpen.value = false;
  emitCurrentMode();
}

function applyFlow(flow: VariableFlowConfig) {
  flowValue.value = flow;
  flowOpen.value = false;
  mode.value = 'flow';
  emitCurrentMode();
}

function processorLabel(processor: ProcessorConfig) {
  const name = processorName(processor);
  const definition = getProcessorDefinition(name);
  return definition ? t(definition.titleKey) : name;
}

function setValue(value: unknown) {
  syncFromValue(value);
  if (mode.value === 'input') {
    const result = parseInputValue(inputValue.value);
    if (result.valid) {
      emitValue(result.value);
    }
    return;
  }
  emitValue(serializeVariableValueConfig(normalizeVariableValueConfig(value)));
}

function getValue() {
  if (mode.value === 'input' && inputValidation.value.valid) {
    return inputValidation.value.value;
  }
  return serializeVariableValueConfig(currentConfig());
}

function clear() {
  syncFromValue('');
  emitValue('');
}

function validate() {
  if (mode.value === 'input' && !inputValidation.value.valid) {
    return {
      valid: false,
      message: inputValidation.value.message
    };
  }

  if (mode.value === 'variable' && !variableName.value.trim()) {
    return {
      valid: false,
      message: t('variableValue.variable.fieldPlaceholder')
    };
  }

  if (mode.value === 'flow') {
    try {
      validateVariableFlowConfig(flowValue.value);
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  return { valid: true };
}

defineExpose({
  setValue,
  getValue,
  clear,
  validate
});

watch(() => boundValue(), (value) => {
  if (lastEmittedValue && JSON.stringify(value) === lastEmittedValue) {
    lastEmittedValue = '';
    return;
  }
  syncFromValue(value);
}, { immediate: true, deep: true });
<\/script>

<template>
  <div
    class="variable-value-editor"
    :class="{ 'variable-value-editor--multiline': multiline }"
    :data-testid="testid ? \`\${testid}-editor\` : undefined"
    :title="previousSummary && mode === 'input' ? \`\${t('variableValue.previous')}: \${previousSummary}\` : undefined"
    @keydown.stop
  >
    <div class="variable-value-editor__modes" role="tablist" :aria-label="t('variableValue.modeLabel')">
      <button
        type="button"
        :class="{ 'variable-value-editor__mode--active': mode === 'input' }"
        data-testid="variable-mode-input"
        @click="switchMode('input')"
      >
        {{ t('variableValue.modes.input') }}
      </button>
      <button
        type="button"
        :class="{ 'variable-value-editor__mode--active': mode === 'variable' }"
        data-testid="variable-mode-variable"
        @click="switchMode('variable')"
      >
        {{ t('variableValue.modes.variable') }}
      </button>
      <button
        type="button"
        :class="{ 'variable-value-editor__mode--active': mode === 'flow' }"
        data-testid="variable-mode-flow"
        @click="switchMode('flow')"
      >
        {{ t('variableValue.modes.flow') }}
      </button>
    </div>

    <div v-if="mode === 'input'" class="variable-value-editor__constant">
      <textarea
        v-if="multiline"
        class="variable-value-editor__input variable-value-editor__input--multiline"
        :class="{ 'variable-value-editor__input--invalid': inputValidationError }"
        :data-testid="testid"
        :readonly="readonly"
        :placeholder="placeholder"
        :value="inputValue"
        :aria-invalid="inputValidationError ? 'true' : undefined"
        :aria-describedby="inputValidationError ? inputErrorId : undefined"
        @input="updateInput(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <input
        v-else
        class="variable-value-editor__input"
        :class="{ 'variable-value-editor__input--invalid': inputValidationError }"
        :data-testid="testid"
        type="text"
        :readonly="readonly"
        :placeholder="placeholder"
        :value="inputValue"
        :aria-invalid="inputValidationError ? 'true' : undefined"
        :aria-describedby="inputValidationError ? inputErrorId : undefined"
        @input="updateInput(($event.target as HTMLInputElement).value)"
      >
      <p
        v-if="inputValidationError"
        :id="inputErrorId"
        class="variable-value-editor__error"
        :data-testid="testid ? \`\${testid}-error\` : undefined"
      >
        {{ inputValidationError }}
      </p>
    </div>

    <div v-else-if="mode === 'variable'" class="variable-value-editor__variable" :data-testid="testid">
      <select
        class="variable-value-editor__input variable-value-editor__source"
        data-testid="variable-source-select"
        :disabled="readonly"
        :value="variableSource"
        @change="updateVariableSource(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="sourceOption in variableSourceOptions" :key="sourceOption.value" :value="sourceOption.value">
          {{ sourceOption.label }}
        </option>
      </select>
      <span v-if="variableSource === 'Block' && !availableBlockDataSources.length" class="variable-value-editor__empty">
        {{ t('variableValue.variable.emptySources') }}
      </span>
      <select
        v-else-if="variableSource === 'Block'"
        class="variable-value-editor__input"
        data-testid="variable-block-select"
        :disabled="readonly"
        :value="selectedBlock?.blockId ?? blockId"
        @change="updateBlock(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('variableValue.variable.blockPlaceholder') }}</option>
        <option v-for="source in availableBlockDataSources" :key="\`\${source.blockId}-\${source.blockType}\`" :value="source.blockId">
          {{ source.blockType }} / {{ source.blockId === legacySourceBlockId ? 'legacy' : source.blockId }}
        </option>
      </select>
      <select
        v-if="variableSource === 'Block' && availableBlockDataSources.length"
        class="variable-value-editor__input"
        data-testid="variable-single-select"
        :disabled="readonly || !selectedBlock"
        :value="variableName"
        @change="updateVariable(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('variableValue.variable.fieldPlaceholder') }}</option>
        <option v-for="field in selectedBlock?.fields ?? []" :key="field.variable" :value="field.variable">
          {{ field.label }} {{ field.variable }} · {{ field.dataType }}
        </option>
      </select>
      <input
        v-if="variableSource === 'MPage'"
        class="variable-value-editor__input"
        data-testid="variable-page-id"
        type="text"
        :list="availablePageVariableSources.length ? pageIdListId : undefined"
        :readonly="readonly"
        placeholder="pageId"
        :value="pageId"
        @input="updatePageId(($event.target as HTMLInputElement).value)"
      >
      <datalist v-if="variableSource === 'MPage' && availablePageVariableSources.length" :id="pageIdListId">
        <option
          v-for="source in availablePageVariableSources"
          :key="source.pageId"
          :value="source.pageId"
          :label="source.pageLabel"
        ></option>
      </datalist>
      <input
        v-if="variableSource !== 'Block'"
        class="variable-value-editor__input"
        data-testid="variable-path-input"
        type="text"
        :readonly="readonly"
        :placeholder="variableSource === 'MPage' ? 'context.items / dataSources.detail.items' : 'key'"
        :value="variableName"
        @input="updateVariable(($event.target as HTMLInputElement).value)"
      >
      <button
        type="button"
        class="variable-value-editor__processor-button"
        data-testid="variable-single-processors"
        :disabled="readonly || (variableSource === 'Block' ? !selectedField : !variableName.trim())"
        @click="processorOpen = true"
      >
        {{ variableProcessors.length ? t('datasource.processors.count').replace('{count}', String(variableProcessors.length)) : t('datasource.processors.configure') }}
      </button>
      <span v-for="(processor, index) in variableProcessors" :key="\`\${processorName(processor)}-\${index}\`" class="variable-value-editor__processor">
        {{ processorLabel(processor) }}
      </span>
    </div>

    <div v-else class="variable-value-editor__flow" :data-testid="testid">
      <span>{{ t('variableValue.flow.summary') }}: {{ flowValue.nodes.length }} nodes / {{ flowValue.edges.length }} edges</span>
      <button type="button" data-testid="variable-flow-open" :disabled="readonly" @click="flowOpen = true">
        {{ t('variableValue.flow.open') }}
      </button>
    </div>

    <ProcessorConfigDialog
      :open="processorOpen"
      :field="processorField"
      :readonly="readonly"
      :teleport-disabled="true"
      @close="processorOpen = false"
      @apply="applyProcessors"
    />

    <MVariableFlowDialog
      :open="flowOpen"
      :flow="flowValue"
      :variables="normalizedVariables"
      :block-data-sources="availableBlockDataSources"
      :readonly="readonly"
      :teleport-disabled="true"
      @close="flowOpen = false"
      @apply="applyFlow"
    />
  </div>
</template>

<style scoped>
.variable-value-editor {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
}

.variable-value-editor--multiline {
  align-items: flex-start;
}

.variable-value-editor__modes {
  display: inline-flex;
  width: fit-content;
  flex: 0 0 auto;
  align-self: flex-start;
  overflow: hidden;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
}

.variable-value-editor__modes button {
  min-height: 36px;
  border: 0;
  border-right: 1px solid rgb(203 213 225);
  background: transparent;
  color: rgb(71 85 105);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  padding: 4px 8px;
  cursor: pointer;
}

.variable-value-editor__modes button:last-child {
  border-right: 0;
}

.variable-value-editor__modes .variable-value-editor__mode--active {
  background: rgb(37 99 235);
  color: white;
}

.variable-value-editor__input {
  flex: 1 1 auto;
  min-height: 36px;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  background: white;
  color: rgb(15 23 42);
  font: inherit;
  padding: 7px 9px;
}

.variable-value-editor__constant {
  flex: 1 1 auto;
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.variable-value-editor__input--multiline {
  min-height: 86px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
}

.variable-value-editor__input--invalid {
  border-color: rgb(220 38 38);
  box-shadow: 0 0 0 2px rgb(220 38 38 / 0.12);
}

.variable-value-editor__error {
  margin: 0;
  color: rgb(220 38 38);
  font-size: 12px;
  font-weight: 650;
  line-height: 16px;
}

.variable-value-editor__variable,
.variable-value-editor__flow {
  flex: 1 1 auto;
  display: flex;
  min-width: 0;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
}

.variable-value-editor__variable .variable-value-editor__input {
  flex: 1 1 112px;
  min-width: 72px;
}

.variable-value-editor__variable .variable-value-editor__source {
  flex: 0 0 96px;
}

.variable-value-editor__empty {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 650;
}

.variable-value-editor__processor-button,
.variable-value-editor__flow button {
  flex: 0 0 auto;
  min-height: 36px;
  border: 1px solid rgb(191 219 254);
  border-radius: 8px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  padding: 6px 10px;
  cursor: pointer;
}

.variable-value-editor__processor-button {
  min-width: 88px;
  white-space: nowrap;
}

.variable-value-editor__processor-button:disabled,
.variable-value-editor__flow button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.variable-value-editor__processor {
  flex: 0 0 auto;
  max-width: 160px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.variable-value-editor__flow {
  min-height: 36px;
  justify-content: space-between;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  background: white;
  padding: 5px 6px 5px 10px;
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
}

.dark .variable-value-editor__input,
.dark .variable-value-editor__flow {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .variable-value-editor__input--invalid {
  border-color: rgb(248 113 113);
  box-shadow: 0 0 0 2px rgb(248 113 113 / 0.14);
}
</style>
`,H=`import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  finalizeEditorBlocksWithEvents,
  normalizeSelectorBlock,
  type StoredBlock
} from 'mokelay-components/blocks';

export { cloneSelectorBlock, normalizeSelectorBlock } from 'mokelay-components/blocks';
export type { StoredBlock } from 'mokelay-components/blocks';

export interface MEditorSelectorProps {
  edit: boolean;
  value?: StoredBlock;
  excludeToolNames?: string[];
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MEditorSelector",
 *   "displayName": "组件选择器",
 *   "category": "container",
 *   "description": "嵌套组件选择器，用于在配置项中编辑单个 Block；候选组件与默认值由客户端 Block 文档 API 提供。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MEditorSelector",
 *     "toolSymbol": "mEditorSelectorEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 20
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "组件选择器",
 *       "en": "Component Selector"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"5\\" width=\\"16\\" height=\\"14\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 9h8M8 13h5\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/><path d=\\"M16 15l2 2 3-4\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {},
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "StoredBlock",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/mEditorSelectorEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "选中 Block"
 *     },
 *     {
 *       "key": "excludeToolNames",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/mEditorSelectorEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "排除工具名称"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MEditorSelector-example",
 *       "type": "MEditorSelector",
 *       "data": {}
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MEditorSelector.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/mEditorSelectorEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mEditorSelectorEditorTool = defineEditorTool<MEditorSelectorProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeSelectorBlock(props.value),
    excludeToolNames: Array.isArray(props.excludeToolNames)
      ? props.excludeToolNames.filter((toolName): toolName is string => typeof toolName === 'string')
      : []
  }),
  serialize: (props) => {
    const value = normalizeSelectorBlock(props.value);
    return value ? { value: finalizeEditorBlocksWithEvents([value])[0] } : {};
  }
});
`,K=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MActionCardList",
 *   "displayName": "动作卡片列表",
 *   "category": "action",
 *   "description": "动作卡片列表，以卡片或紧凑列表展示数据项，支持字段路径、禁用状态、加载状态和卡片级事件。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MActionCardList",
 *     "toolSymbol": "mActionCardListEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 50
 *   },
 *   "toolbox": {
 *     "title": "动作卡片列表",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M5 5.5h14M5 12h14M5 18.5h14\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/><rect x=\\"3\\" y=\\"3\\" width=\\"18\\" height=\\"5\\" rx=\\"1.5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\"/><rect x=\\"3\\" y=\\"9.5\\" width=\\"18\\" height=\\"5\\" rx=\\"1.5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\"/><rect x=\\"3\\" y=\\"16\\" width=\\"18\\" height=\\"5\\" rx=\\"1.5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "items": [
 *       {
 *         "key": "login",
 *         "title": "登录接口",
 *         "description": "读取用户、校验密码、写入 Session。"
 *       },
 *       {
 *         "key": "register",
 *         "title": "注册接口",
 *         "description": "校验重复邮箱、创建用户、写入 Session。"
 *       }
 *     ],
 *     "itemKey": "key",
 *     "titlePath": "title",
 *     "descriptionPath": "description",
 *     "variant": "card",
 *     "size": "md",
 *     "emptyText": "暂无数据",
 *     "disabled": false
 *   },
 *   "properties": [
 *     {
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "列表数据 JSON / 变量",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "itemKey",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "唯一标识路径",
 *       "type": "text",
 *       "placeholder": "key / uuid / id"
 *     },
 *     {
 *       "key": "titlePath",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题路径",
 *       "type": "text",
 *       "placeholder": "title / name"
 *     },
 *     {
 *       "key": "descriptionPath",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "描述路径",
 *       "type": "text",
 *       "placeholder": "description"
 *     },
 *     {
 *       "key": "variant",
 *       "optional": true,
 *       "tsType": "MActionCardListVariant | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "样式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "card",
 *           "label": "卡片"
 *         },
 *         {
 *           "value": "compact",
 *           "label": "紧凑"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "MActionCardListSize | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "尺寸",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "sm",
 *           "label": "小"
 *         },
 *         {
 *           "value": "md",
 *           "label": "默认"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空状态文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "activeKey",
 *       "optional": true,
 *       "tsType": "MActionCardListKey | null",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "激活项标识"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "select",
 *       "payload": "payload: MActionCardListEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "选择卡片"
 *     },
 *     {
 *       "event": "click",
 *       "payload": "payload: MActionCardListEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "点击卡片"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setItems",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "设置列表数据"
 *     },
 *     {
 *       "name": "setActive",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "设置激活项"
 *     },
 *     {
 *       "name": "clearActive",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "清除激活项"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "'选中项'",
 *         "zh": "选中项",
 *         "en": "选中项"
 *       },
 *       "variable": "selectedItem",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'选中标识'",
 *         "zh": "选中标识",
 *         "en": "选中标识"
 *       },
 *       "variable": "activeKey",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'列表数据'",
 *         "zh": "列表数据",
 *         "en": "列表数据"
 *       },
 *       "variable": "items",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue"
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
 *       "id": "MActionCardList-example",
 *       "type": "MActionCardList",
 *       "data": {
 *         "items": [
 *           {
 *             "key": "login",
 *             "title": "登录接口",
 *             "description": "读取用户、校验密码、写入 Session。"
 *           },
 *           {
 *             "key": "register",
 *             "title": "注册接口",
 *             "description": "校验重复邮箱、创建用户、写入 Session。"
 *           }
 *         ],
 *         "itemKey": "key",
 *         "titlePath": "title",
 *         "descriptionPath": "description",
 *         "variant": "card",
 *         "size": "md",
 *         "emptyText": "暂无数据",
 *         "disabled": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mActionCardListEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mActionCardListEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,q=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MActionToolbar",
 *   "displayName": "动作工具栏",
 *   "category": "action",
 *   "description": "动作工具栏，支持行内、分组和下拉按钮，保留按钮的加载、禁用、可见性和嵌套动作配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MActionToolbar",
 *     "toolSymbol": "mActionToolbarEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 60
 *   },
 *   "toolbox": {
 *     "title": "动作工具栏",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M4 7h10M4 12h16M4 17h8\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/><path d=\\"M17 6l3 3-3 3\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "align": "left",
 *     "size": "medium",
 *     "mode": "inline",
 *     "buttons": [
 *       {
 *         "id": "search",
 *         "label": "搜索",
 *         "variant": "primary",
 *         "align": "left",
 *         "events": []
 *       },
 *       {
 *         "id": "reset",
 *         "label": "重置",
 *         "variant": "secondary",
 *         "align": "left",
 *         "events": []
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "toolbar",
 *       "label": "工具栏配置",
 *       "type": "component",
 *       "component": "MActionToolBarEditor",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "declaredInProps": false,
 *       "configurable": true
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "MActionToolbarAlign | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "对齐方式"
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "MActionToolbarSize | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "尺寸"
 *     },
 *     {
 *       "key": "mode",
 *       "optional": true,
 *       "tsType": "MActionToolbarMode | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "模式"
 *     },
 *     {
 *       "key": "buttons",
 *       "optional": true,
 *       "tsType": "ToolbarButton[]",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "按钮配置"
 *     },
 *     {
 *       "key": "actions",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "动作配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "click",
 *       "payload": "payload: ButtonEventPayload & { nativeEvent?: MouseEvent }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "点击按钮"
 *     },
 *     {
 *       "event": "before-execute",
 *       "payload": "payload: ButtonEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "执行前"
 *     },
 *     {
 *       "event": "execute-success",
 *       "payload": "payload: ButtonEventPayload & { result?: unknown }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "执行成功"
 *     },
 *     {
 *       "event": "execute-error",
 *       "payload": "payload: ButtonEventPayload & { error: unknown }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "执行失败"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "trigger",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "触发动作"
 *     },
 *     {
 *       "name": "enable",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "启用"
 *     },
 *     {
 *       "name": "disable",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "禁用"
 *     },
 *     {
 *       "name": "setLoading",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "设置加载状态"
 *     },
 *     {
 *       "name": "setDisabled",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "设置禁用状态"
 *     },
 *     {
 *       "name": "getButton",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "获取按钮"
 *     },
 *     {
 *       "name": "getAction",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "获取动作"
 *     },
 *     {
 *       "name": "refreshVisibility",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "label": "刷新可见性"
 *     }
 *   ],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MActionToolbar-example",
 *       "type": "MActionToolbar",
 *       "data": {
 *         "align": "left",
 *         "size": "medium",
 *         "mode": "inline",
 *         "buttons": [
 *           {
 *             "id": "search",
 *             "label": "搜索",
 *             "variant": "primary",
 *             "align": "left",
 *             "events": []
 *           },
 *           {
 *             "id": "reset",
 *             "label": "重置",
 *             "variant": "secondary",
 *             "align": "left",
 *             "events": []
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mActionToolbarEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mActionToolbarEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,G=`import { defineEditorTool } from '@/editors/editorToolDefinition';
import type { MAdvanceInputProps } from 'mokelay-components/blocks/MAdvanceInput.vue';
import { normalizeStoredBlocks } from 'mokelay-components/blocks';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MAdvanceInput",
 *   "displayName": "高级输入框",
 *   "category": "form",
 *   "description": "高级输入框，支持文本片段与嵌入组件的混合编辑，并保存为可编排的结构化内容。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MAdvanceInput",
 *     "toolSymbol": "mAdvanceInputEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 110
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "高级输入框",
 *       "en": "Advanced Input"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"3\\" y=\\"5\\" width=\\"18\\" height=\\"14\\" rx=\\"3\\" ry=\\"3\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M7 10h5M7 14h3M14 10h3M14 14h3\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {},
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "StoredBlock[]",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceInput.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "输入值"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MAdvanceInput-example",
 *       "type": "MAdvanceInput",
 *       "data": {}
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MAdvanceInput.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mAdvanceInputEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mAdvanceInputEditorTool = defineEditorTool<MAdvanceInputProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeStoredBlocks(props.value)
  }),
  serialize: (props) => ({ value: normalizeStoredBlocks(props.value) })
});
`,W=`import { defineEditorTool } from "@/editors/editorToolDefinition";
import {
  normalizeAdvanceTableColumns,
  type MAdvanceTableProps
} from 'mokelay-components/blocks';
import { getAdvanceTableDataFields } from 'mokelay-components/blocks/MAdvanceTable.vue';
import {
  isRecord,
  normalizeDatasource,
  type MDatasourceApiObject
} from 'mokelay-components/datasource';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MAdvanceTable",
 *   "displayName": "高级表格",
 *   "category": "data",
 *   "description": "高级表格，支持静态数据或数据源、分页选择、固定列和单元格内嵌 Block 的行数据绑定。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MAdvanceTable",
 *     "toolSymbol": "mAdvanceTableEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 120
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "高级表格",
 *       "en": "Advanced Table"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"3\\" y=\\"5\\" width=\\"18\\" height=\\"14\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M3 10h18M8 5v14M16 5v14\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "index": false,
 *     "selection": false
 *   },
 *   "properties": [
 *     {
 *       "key": "index",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示序号列",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "selection",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示多选列",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "showPageBreak",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示分页",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "行数据"
 *     },
 *     {
 *       "key": "columns",
 *       "optional": true,
 *       "tsType": "MAdvanceTableColumnConfig[]",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "列配置",
 *       "type": "component",
 *       "component": "MAdvanceTableColumnsEditor"
 *     },
 *     {
 *       "key": "ds",
 *       "optional": true,
 *       "tsType": "MDatasourceApiObject",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "数据源",
 *       "type": "component",
 *       "component": "MDatasourceEditor"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "havingSelectedRows",
 *       "payload": "payload: {\\n    selectedRows: Record<string, unknown>[];\\n    selection: ReturnType<typeof getSelectionState>;\\n  }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "已选中行"
 *     },
 *     {
 *       "event": "emptySelectedRow",
 *       "payload": "payload: {\\n    selectedRows: Record<string, unknown>[];\\n    selection: ReturnType<typeof getSelectionState>;\\n  }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "清空选中行"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "refresh",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "刷新"
 *     },
 *     {
 *       "name": "search",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "搜索"
 *     },
 *     {
 *       "name": "getSelectedRows",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取选中行"
 *     },
 *     {
 *       "name": "getSelectedValues",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取选中值"
 *     },
 *     {
 *       "name": "clearSelection",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "清空选择"
 *     },
 *     {
 *       "name": "getSelectionState",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取选择状态"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.data')",
 *         "zh": "列表数据",
 *         "en": "List data"
 *       },
 *       "variable": "data",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.page')",
 *         "zh": "当前页",
 *         "en": "Page"
 *       },
 *       "variable": "page",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.pageSize')",
 *         "zh": "每页条数",
 *         "en": "Page size"
 *       },
 *       "variable": "pageSize",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.total')",
 *         "zh": "总数",
 *         "en": "Total"
 *       },
 *       "variable": "total",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.search')",
 *         "zh": "搜索条件",
 *         "en": "Search"
 *       },
 *       "variable": "search",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
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
 *       "id": "MAdvanceTable-example",
 *       "type": "MAdvanceTable",
 *       "data": {
 *         "index": false,
 *         "selection": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mAdvanceTableEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mAdvanceTableEditorTool = defineEditorTool<MAdvanceTableProps>({
  documentFieldsOnly: true,
  getDataFields: () => getAdvanceTableDataFields(),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    index: props.index === true,
    selection: props.selection === true,
    showPageBreak: props.showPageBreak === true,
    ...(props.rows !== undefined ? { rows: props.rows } : {}),
    columns: normalizeAdvanceTableColumns(props.columns),
    ds: normalizeDatasourceConfig(props.ds)
  }),
  serialize: (props) => {
    const columns = normalizeAdvanceTableColumns(props.columns);
    const ds = normalizeDatasourceConfig(props.ds);
    return {
      index: props.index === true,
      selection: props.selection === true,
      showPageBreak: props.showPageBreak === true,
      ...(props.rows !== undefined ? { rows: props.rows } : {}),
      ...(columns.length ? { columns } : {}),
      ...(ds ? { ds } : {})
    };
  }
});

function normalizeDatasourceConfig(value: unknown): MDatasourceApiObject | undefined {
  if (!isRecord(value)) return undefined;
  const datasource = normalizeDatasource(value);
  return datasource.type === 'API' ? datasource : undefined;
}
`,X=`import { defineEditorTool } from "@/editors/editorToolDefinition";
import {
  normalizeButtonProps,
  type MButtonProps
} from 'mokelay-components/blocks/MButton.vue';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MButton",
 *   "displayName": "按钮",
 *   "category": "action",
 *   "description": "按钮，支持样式、动作、禁用状态以及页面 DSL 的 visible/hidden 条件渲染。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MButton",
 *     "toolSymbol": "mButtonEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 420
 *   },
 *   "toolbox": {
 *     "title": "按钮",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"7\\" width=\\"16\\" height=\\"10\\" rx=\\"5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M9 12h6\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "提交",
 *     "variant": "primary",
 *     "align": "left",
 *     "action": {
 *       "type": "submit"
 *     },
 *     "disabled": false,
 *     "visible": true,
 *     "hidden": false
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "按钮文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "variant",
 *       "optional": true,
 *       "tsType": "PageDslButtonVariant | string",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "样式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "primary",
 *           "label": "主要"
 *         },
 *         {
 *           "value": "secondary",
 *           "label": "次要"
 *         },
 *         {
 *           "value": "ghost",
 *           "label": "朴素"
 *         },
 *         {
 *           "value": "danger",
 *           "label": "危险"
 *         },
 *         {
 *           "value": "warning",
 *           "label": "警告"
 *         },
 *         {
 *           "value": "text",
 *           "label": "文本"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "PageDslAlign | string",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "对齐",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "left",
 *           "label": "左对齐"
 *         },
 *         {
 *           "value": "center",
 *           "label": "居中"
 *         },
 *         {
 *           "value": "right",
 *           "label": "右对齐"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "action",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "动作 JSON（本阶段仅保存，不执行）",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "bare",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "裸按钮"
 *     },
 *     {
 *       "key": "visible",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "显示条件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "hidden",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "隐藏条件",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "click",
 *       "payload": "payload: MouseEvent",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "label": "点击按钮"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     },
 *     {
 *       "key": "disabled",
 *       "type": "omitWhenFalse",
 *       "description": "disabled 仅在 true 时写入；默认 false 不保存。"
 *     },
 *     {
 *       "key": "action",
 *       "type": "json",
 *       "description": "动作配置作为 JSON 对象原样保留。"
 *     },
 *     {
 *       "key": "visible",
 *       "type": "omitWhenTrue",
 *       "description": "visible 默认 true；仅在 false 时写入，用于页面 DSL 的条件展示。"
 *     },
 *     {
 *       "key": "hidden",
 *       "type": "omitWhenFalse",
 *       "description": "hidden 默认 false；仅在 true 时写入，用于页面 DSL 的条件隐藏。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MButton-example",
 *       "type": "MButton",
 *       "data": {
 *         "label": "提交",
 *         "variant": "primary",
 *         "align": "left",
 *         "action": {
 *           "type": "submit"
 *         },
 *         "disabled": false,
 *         "visible": true,
 *         "hidden": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mButtonEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mButtonEditorTool = defineEditorTool<MButtonProps>({
  normalizeProps: normalizeButtonProps,
  serialize: (props) => {
    const normalized = normalizeButtonProps(props);
    return {
      label: normalized.label,
      variant: normalized.variant,
      align: normalized.align,
      action: normalized.action,
      ...(normalized.disabled ? { disabled: true } : {}),
      ...(normalized.visible ? {} : { visible: false }),
      ...(normalized.hidden ? { hidden: true } : {})
    };
  }
});
`,Y=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MChart",
 *   "displayName": "图表",
 *   "category": "data",
 *   "description": "图表 Block，基于 ECharts 渲染可配置的数据、坐标轴和视觉样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MChart",
 *     "toolSymbol": "mChartEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 130
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "图表",
 *       "en": "Chart"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"4\\" width=\\"16\\" height=\\"16\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 16V11M12 16V8M16 16v-6\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "type": "line",
 *     "xAxis": [
 *       {
 *         "zh": "周一",
 *         "en": "Mon"
 *       },
 *       {
 *         "zh": "周二",
 *         "en": "Tue"
 *       },
 *       {
 *         "zh": "周三",
 *         "en": "Wed"
 *       },
 *       {
 *         "zh": "周四",
 *         "en": "Thu"
 *       },
 *       {
 *         "zh": "周五",
 *         "en": "Fri"
 *       }
 *     ],
 *     "series": [
 *       {
 *         "name": {
 *           "zh": "数据",
 *           "en": "Data"
 *         },
 *         "data": [
 *           120,
 *           200,
 *           150,
 *           80,
 *           70
 *         ]
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "type",
 *       "optional": true,
 *       "tsType": "MChartType",
 *       "source": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图表类型",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "line",
 *           "label": {
 *             "zh": "折线图",
 *             "en": "Line chart"
 *           }
 *         },
 *         {
 *           "value": "bar",
 *           "label": {
 *             "zh": "柱状图",
 *             "en": "Bar chart"
 *           }
 *         },
 *         {
 *           "value": "pie",
 *           "label": {
 *             "zh": "饼图",
 *             "en": "Pie chart"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "xAxis",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图表数据",
 *       "type": "component",
 *       "component": "MChartDataEditor"
 *     },
 *     {
 *       "key": "series",
 *       "optional": true,
 *       "tsType": "MChartSeriesItem[]",
 *       "source": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "系列数据"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MChart-example",
 *       "type": "MChart",
 *       "data": {
 *         "type": "line",
 *         "xAxis": [
 *           {
 *             "zh": "周一",
 *             "en": "Mon"
 *           },
 *           {
 *             "zh": "周二",
 *             "en": "Tue"
 *           },
 *           {
 *             "zh": "周三",
 *             "en": "Wed"
 *           },
 *           {
 *             "zh": "周四",
 *             "en": "Thu"
 *           },
 *           {
 *             "zh": "周五",
 *             "en": "Fri"
 *           }
 *         ],
 *         "series": [
 *           {
 *             "name": {
 *               "zh": "数据",
 *               "en": "Data"
 *             },
 *             "data": [
 *               120,
 *               200,
 *               150,
 *               80,
 *               70
 *             ]
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mChartEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mChartEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Z=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MCheckboxGroupField",
 *   "displayName": "多选题",
 *   "category": "form",
 *   "description": "多选题表单字段，支持选项、必填校验、帮助信息和多值结果。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MCheckboxGroupField",
 *     "toolSymbol": "mCheckboxGroupFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 350
 *   },
 *   "toolbox": {
 *     "title": "多选题",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><circle cx=\\"7\\" cy=\\"7\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"7\\" cy=\\"17\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M12 7h7M12 17h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": [],
 *     "options": [
 *       {
 *         "label": "产品演示",
 *         "value": "demo"
 *       },
 *       {
 *         "label": "价格咨询",
 *         "value": "pricing"
 *       },
 *       {
 *         "label": "技术支持",
 *         "value": "support"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MCheckboxGroupField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-components/src/blocks/MCheckboxGroupField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项 JSON",
 *       "validationMessage": "请输入有效选项 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MCheckboxGroupField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MCheckboxGroupField.vue"
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
 *       "id": "MCheckboxGroupField-example",
 *       "type": "MCheckboxGroupField",
 *       "data": {
 *         "value": [],
 *         "options": [
 *           {
 *             "label": "产品演示",
 *             "value": "demo"
 *           },
 *           {
 *             "label": "价格咨询",
 *             "value": "pricing"
 *           },
 *           {
 *             "label": "技术支持",
 *             "value": "support"
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MCheckboxGroupField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mCheckboxGroupFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mCheckboxGroupFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Q=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MDateRangeField",
 *   "displayName": "日期范围",
 *   "category": "form",
 *   "description": "日期范围表单字段，收集开始和结束日期，并支持必填、禁用和展示格式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MDateRangeField",
 *     "toolSymbol": "mDateRangeFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 140
 *   },
 *   "toolbox": {
 *     "title": "日期范围",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": {
 *       "start": "",
 *       "end": ""
 *     }
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MDateRangeField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MDateRangeField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
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
 *       "source": "submodule/mokelay-components/src/blocks/MDateRangeField.vue",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MDateRangeField.vue"
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
 *       "id": "MDateRangeField-example",
 *       "type": "MDateRangeField",
 *       "data": {
 *         "value": {
 *           "start": "",
 *           "end": ""
 *         }
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MDateRangeField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mDateRangeFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mDateRangeFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ee=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MDividerLine",
 *   "displayName": "分割线",
 *   "category": "content",
 *   "description": "分割线内容 Block，支持横向分隔的样式、颜色和间距配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MDividerLine",
 *     "toolSymbol": "mDividerLineEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 170
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "分割线",
 *       "en": "Divider"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M4 12h16\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {},
 *   "properties": [],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MDividerLine-example",
 *       "type": "MDividerLine",
 *       "data": {}
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MDividerLine.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mDividerLineEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mDividerLineEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ne=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MEmailField",
 *   "displayName": "邮箱字段",
 *   "category": "form",
 *   "description": "邮箱字段，提供邮箱格式校验、标签、占位符和表单输入状态。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MEmailField",
 *     "toolSymbol": "mEmailFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 260
 *   },
 *   "toolbox": {
 *     "title": "邮箱字段",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "you@example.com",
 *     "value": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MEmailField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MEmailField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MEmailField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MEmailField.vue"
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
 *       "id": "MEmailField-example",
 *       "type": "MEmailField",
 *       "data": {
 *         "placeholder": "you@example.com",
 *         "value": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MEmailField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mEmailFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mEmailFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,oe=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MEmbed",
 *   "displayName": "嵌入",
 *   "category": "content",
 *   "description": "嵌入 Block，用于通过 URL 或 HTML 嵌入外部内容，并支持尺寸配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MEmbed",
 *     "toolSymbol": "mEmbedEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 240
 *   },
 *   "toolbox": {
 *     "title": "嵌入",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M10 7H7a5 5 0 0 0 0 10h3M14 7h3a5 5 0 0 1 0 10h-3M8 12h8\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "外部资料",
 *     "url": "https://www.mokelay.com/"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MEmbed.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "url",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MEmbed.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "链接",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MEmbed-example",
 *       "type": "MEmbed",
 *       "data": {
 *         "title": "外部资料",
 *         "url": "https://www.mokelay.com/"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MEmbed.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mEmbedEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mEmbedEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,te=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MFileUploadField",
 *   "displayName": "文件上传",
 *   "category": "form",
 *   "description": "文件上传字段，支持文件选择、上传状态、格式限制和表单值保存。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MFileUploadField",
 *     "toolSymbol": "mFileUploadFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 300
 *   },
 *   "toolbox": {
 *     "title": "文件上传",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": [],
 *     "accept": ".pdf,.doc,.docx",
 *     "multiple": false,
 *     "maxFiles": 1
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "accept",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "文件类型",
 *       "type": "text",
 *       "placeholder": ".pdf,.doc,.docx"
 *     },
 *     {
 *       "key": "multiple",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许多文件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "maxFiles",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最多文件数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MFileUploadField-example",
 *       "type": "MFileUploadField",
 *       "data": {
 *         "value": [],
 *         "accept": ".pdf,.doc,.docx",
 *         "multiple": false,
 *         "maxFiles": 1
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mFileUploadFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFileUploadFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ae=`import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  normalizeMFormItems,
  normalizeMFormProps,
  serializeMFormProps,
  type MFormProps
} from 'mokelay-components/blocks';
import { normalizeVariableDataType, resolveLocalizedValue } from 'mokelay-components/runtime';
import { getContentEditingLocale, getContentLocaleConfig } from '@/composables/useContentLocalization';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MForm",
 *   "displayName": "表单",
 *   "category": "container",
 *   "description": "表单容器，负责字段布局、校验和表单项的嵌套编辑；子组件工具由客户端 Block 文档 API 的元数据创建。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MForm",
 *     "toolSymbol": "mFormEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 30
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "表单",
 *       "en": "Form"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"4\\" width=\\"16\\" height=\\"16\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 8h8M8 12h8M8 16h4\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "layout": "Vertical",
 *     "itemWidthMode": "stretch",
 *     "items": []
 *   },
 *   "properties": [
 *     {
 *       "key": "layout",
 *       "optional": true,
 *       "tsType": "MFormLayout",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "布局方式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "Vertical",
 *           "label": {
 *             "zh": "垂直",
 *             "en": "Vertical"
 *           }
 *         },
 *         {
 *           "value": "Horizontal",
 *           "label": {
 *             "zh": "水平",
 *             "en": "Horizontal"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "itemWidthMode",
 *       "optional": true,
 *       "tsType": "MFormItemWidthMode",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "横向项宽度",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "stretch",
 *           "label": {
 *             "zh": "撑满",
 *             "en": "Stretch"
 *           }
 *         },
 *         {
 *           "value": "compact",
 *           "label": {
 *             "zh": "紧凑",
 *             "en": "Compact"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "MFormItemData[]",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "localizablePaths": ["[].labelName"],
 *       "label": "表单项配置",
 *       "type": "component",
 *       "component": "MFormItemsEditor"
 *     },
 *     {
 *       "key": "actionBar",
 *       "optional": true,
 *       "tsType": "MFormActionBarData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "操作栏配置",
 *       "type": "component",
 *       "component": "MActionToolBarEditor"
 *     },
 *     {
 *       "key": "toolbar",
 *       "optional": true,
 *       "tsType": "MFormActionBarData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "工具栏配置"
 *     },
 *     {
 *       "key": "values",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "表单值"
 *     },
 *     {
 *       "key": "defaultValues",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "默认值"
 *     },
 *     {
 *       "key": "submit",
 *       "optional": true,
 *       "tsType": "MFormSubmitData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "提交配置"
 *     },
 *     {
 *       "key": "processors",
 *       "optional": true,
 *       "tsType": "MFormProcessorsData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "处理器配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "items: MFormItemData[]",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "变更"
 *     },
 *     {
 *       "event": "reset",
 *       "payload": "payload: { values: Record<string, unknown> }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "重置"
 *     },
 *     {
 *       "event": "submit",
 *       "payload": "payload: { values: Record<string, unknown>; valid: boolean; errors: unknown[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "提交"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "saveEditor",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "保存编辑器"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setValues",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "设置表单值"
 *     },
 *     {
 *       "name": "reset",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "重置"
 *     },
 *     {
 *       "name": "submit",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "提交"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "item.labelName"
 *       },
 *       "variable": "item.variableName",
 *       "dataType": "normalizeVariableDataType(item.fieldDataType)",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts"
 *     },
 *     {
 *       "label": {
 *         "zh": "表单项字段",
 *         "en": "Form item field",
 *         "raw": "normalizeMFormItems(context.data.items)"
 *       },
 *       "variable": "<item.variableName>",
 *       "dataType": "dynamic",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "notes": "getDataFields maps each configured form item to its variableName and labelName."
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
 *       "id": "MForm-example",
 *       "type": "MForm",
 *       "data": {
 *         "layout": "Vertical",
 *         "items": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFormEditorTool = defineEditorTool<MFormProps>({
  getDataFields: (context) => normalizeMFormItems(context.data.items).map((item) => ({
    label: typeof item.labelName === 'string'
      ? item.labelName
      : resolveLocalizedValue(item.labelName, getContentEditingLocale(), getContentLocaleConfig()),
    variable: item.variableName,
    dataType: normalizeVariableDataType(item.fieldDataType)
  })),
  normalizeProps: (props) => normalizeMFormProps(props),
  serialize: (props) => serializeMFormProps(props)
});
`,re=`import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  normalizeFormItemProps,
  serializeFormItemProps,
  type MFormItemProps
} from 'mokelay-components/blocks/MFormItem.vue';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MFormItem",
 *   "displayName": "表单项",
 *   "category": "content",
 *   "description": "表单项容器，负责字段标签、布局、校验提示与内嵌字段 Block 的编排。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MFormItem",
 *     "toolSymbol": "mFormItemEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 180
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "表单项",
 *       "en": "Form Item"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"5\\" width=\\"16\\" height=\\"14\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 9h8M8 13h3\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/><circle cx=\\"16\\" cy=\\"13\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "labelName": {
 *       "zh": "字段",
 *       "en": "Field"
 *     },
 *     "layout": "Vertical"
 *   },
 *   "properties": [
 *     {
 *       "key": "labelName",
 *       "optional": true,
 *       "tsType": "LocalizedTextValue",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "localizable": true,
 *       "label": "字段文本",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "请输入字段文本",
 *         "en": "Enter field label"
 *       }
 *     },
 *     {
 *       "key": "variableName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "变量名",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "请输入变量名",
 *         "en": "Enter variable name"
 *       }
 *     },
 *     {
 *       "key": "layout",
 *       "optional": true,
 *       "tsType": "MFormItemLayout",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "布局方式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "Vertical",
 *           "label": {
 *             "zh": "垂直",
 *             "en": "Vertical"
 *           }
 *         },
 *         {
 *           "value": "Horizontal",
 *           "label": {
 *             "zh": "水平",
 *             "en": "Horizontal"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "editor",
 *       "optional": true,
 *       "tsType": "StoredBlock",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "编辑器配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "click",
 *       "payload": "payload: MouseEvent",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "label": "点击表单项"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MFormItem-example",
 *       "type": "MFormItem",
 *       "data": {
 *         "labelName": {
 *           "zh": "字段",
 *           "en": "Field"
 *         },
 *         "layout": "Vertical"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mFormItemEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFormItemEditorTool = defineEditorTool<MFormItemProps>({
  normalizeProps: (props) => normalizeFormItemProps(props),
  serialize: serializeFormItemProps
});
`,ie=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MHeading",
 *   "displayName": "页面标题",
 *   "category": "content",
 *   "description": "页面标题 Block，支持标题文字、级别、对齐和样式配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MHeading",
 *     "toolSymbol": "mHeadingEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 210
 *   },
 *   "toolbox": {
 *     "title": "页面标题",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M5 6h14M5 12h10M5 18h14\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "text": "页面标题",
 *     "level": "1",
 *     "align": "left"
 *   },
 *   "properties": [
 *     {
 *       "key": "text",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题文本",
 *       "type": "text"
 *     },
 *     {
 *       "key": "level",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "级别",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "1",
 *           "label": "一级标题"
 *         },
 *         {
 *           "value": "2",
 *           "label": "二级标题"
 *         },
 *         {
 *           "value": "3",
 *           "label": "三级标题"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "PageDslAlign | string",
 *       "source": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "对齐",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "left",
 *           "label": "左对齐"
 *         },
 *         {
 *           "value": "center",
 *           "label": "居中"
 *         },
 *         {
 *           "value": "right",
 *           "label": "右对齐"
 *         }
 *       ]
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MHeading-example",
 *       "type": "MHeading",
 *       "data": {
 *         "text": "页面标题",
 *         "level": "1",
 *         "align": "left"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mHeadingEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mHeadingEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,le=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MImageChoiceField",
 *   "displayName": "图片选择",
 *   "category": "form",
 *   "description": "图片选择表单字段，使用图片选项收集单选或多选结果。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MImageChoiceField",
 *     "toolSymbol": "mImageChoiceFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 360
 *   },
 *   "toolbox": {
 *     "title": "图片选择",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><circle cx=\\"7\\" cy=\\"7\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"7\\" cy=\\"17\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M12 7h7M12 17h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": [],
 *     "multiple": false,
 *     "options": [
 *       {
 *         "label": "简洁",
 *         "value": "clean",
 *         "imageUrl": ""
 *       },
 *       {
 *         "label": "活泼",
 *         "value": "playful",
 *         "imageUrl": ""
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MImageChoiceField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "multiple",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MImageChoiceField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许多选",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-components/src/blocks/MImageChoiceField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项 JSON",
 *       "validationMessage": "请输入有效选项 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MImageChoiceField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MImageChoiceField-example",
 *       "type": "MImageChoiceField",
 *       "data": {
 *         "value": [],
 *         "multiple": false,
 *         "options": [
 *           {
 *             "label": "简洁",
 *             "value": "clean",
 *             "imageUrl": ""
 *           },
 *           {
 *             "label": "活泼",
 *             "value": "playful",
 *             "imageUrl": ""
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MImageChoiceField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mImageChoiceFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mImageChoiceFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,se=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MImage",
 *   "displayName": "图片",
 *   "category": "content",
 *   "description": "图片 Block，支持图片地址、替代文本、尺寸与对齐展示。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MImage",
 *     "toolSymbol": "mImageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 230
 *   },
 *   "toolbox": {
 *     "title": "图片",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"5\\" width=\\"16\\" height=\\"14\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"m7 16 4-4 3 3 2-2 3 3\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "src": "",
 *     "alt": "图片",
 *     "caption": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "src",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MImage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图片地址",
 *       "type": "text"
 *     },
 *     {
 *       "key": "alt",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MImage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "替代文本",
 *       "type": "text"
 *     },
 *     {
 *       "key": "caption",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MImage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图片说明",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MImage-example",
 *       "type": "MImage",
 *       "data": {
 *         "src": "",
 *         "alt": "图片",
 *         "caption": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MImage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mImageEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mImageEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,de=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MInput",
 *   "displayName": "输入框",
 *   "category": "form",
 *   "description": "输入框，支持标签、占位符、输入类型、禁用状态和受控值。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MInput",
 *     "toolSymbol": "mInputEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 70
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "输入框",
 *       "en": "Input"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"3\\" y=\\"6\\" width=\\"18\\" height=\\"12\\" rx=\\"2\\" ry=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": {
 *       "zh": "请输入.....",
 *       "en": "Please enter..."
 *     },
 *     "value": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "localizable": true,
 *       "label": "占位提示",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "请输入.....",
 *         "en": "Please enter..."
 *       }
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "默认值",
 *       "type": "component",
 *       "placeholder": {
 *         "zh": "请输入默认值",
 *         "en": "Please enter a default value"
 *       },
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "必填"
 *     },
 *     {
 *       "key": "maxLength",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "最大长度"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "禁用"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "focus",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "label": "聚焦"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue"
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
 *       "id": "MInput-example",
 *       "type": "MInput",
 *       "data": {
 *         "placeholder": {
 *           "zh": "请输入.....",
 *           "en": "Please enter..."
 *         },
 *         "value": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mInputEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mInputEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ce=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MJsonEditor",
 *   "displayName": "JSON 编辑器",
 *   "category": "content",
 *   "description": "页面 DSL 的多行 JSON 文本编辑器。它保留原始文本，同时向变量和 action 暴露解析值、对象型 layoutJson、校验状态与错误；支持运行时 setValue/clear/format、根节点类型约束、只读模式及 JSON Schema 元信息。schema 在 v1 仅供描述和 AI 上下文使用，不执行关键字级 Schema 校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MJsonEditor",
 *     "toolSymbol": "mJsonEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 80
 *   },
 *   "toolbox": {
 *     "title": "JSON 编辑器",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M8 7 5 12l3 5M16 7l3 5-3 5M13 5l-2 14\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "JSON",
 *     "value": {},
 *     "placeholder": "{\\n  \\"schemaVersion\\": 1\\n}",
 *     "rows": 18,
 *     "readonly": false,
 *     "requireObject": true,
 *     "allowArray": false
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text",
 *       "defaultValue": "JSON",
 *       "description": "编辑器上方显示的字段标题。"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 值",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "defaultValue": {},
 *       "description": "初始 JSON 值。非 string 值按两空格缩进序列化；string 被视为待编辑的原始 JSON 文本。",
 *       "validationMessage": "请输入有效 JSON。"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行数",
 *       "type": "text",
 *       "defaultValue": 18,
 *       "description": "textarea rows；渲染时非有限数或小于等于 0 使用默认值 18。"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "禁止用户输入以及 setValue/clear；getData/getJson/getLayoutJson 仍可读取，format 仍可格式化当前有效文本。"
 *     },
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "占位提示",
 *       "defaultValue": "{\\n  \\"schemaVersion\\": 1\\n}",
 *       "description": "编辑器为空时显示，不参与 JSON 解析。"
 *     },
 *     {
 *       "key": "recordUuid",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "记录 UUID",
 *       "description": "可选显式记录标识；getData 优先返回该值，否则读取对象 JSON 顶层 uuid。"
 *     },
 *     {
 *       "key": "recordName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "记录名称",
 *       "description": "可选显式记录名称；getData 优先返回该值，否则读取对象 JSON 顶层 name。"
 *     },
 *     {
 *       "key": "schema",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON Schema",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "description": "随 DSL 保存并可被外部工具读取的 JSON Schema 元信息。v1 不执行 type、required、properties 等 Schema 关键字校验。",
 *       "validationMessage": "请输入有效 JSON Schema。"
 *     },
 *     {
 *       "key": "requireObject",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "要求根对象",
 *       "type": "checkbox",
 *       "defaultValue": true,
 *       "description": "true 时仅接受非数组 object，优先级高于 allowArray。要允许数组必须设为 false。"
 *     },
 *     {
 *       "key": "allowArray",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许根数组",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "仅在 requireObject=false 时生效。false 拒绝数组但允许 JSON 标量；true 允许数组和标量。"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string, layoutJson: object | null, json: unknown, valid: boolean, error: string, recordUuid: string, recordName: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "获取编辑器数据",
 *       "description": "返回原始文本 value、解析结果 json、仅 object 时存在的 layoutJson、valid/error 以及记录标识。无效 JSON 不抛错，而是返回 json=null、layoutJson=null 和 valid=false。"
 *     },
 *     {
 *       "name": "getJson",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "strict",
 *           "optional": true,
 *           "type": "boolean",
 *           "description": "默认 true；传 false 时 JSON 语法或根节点校验失败返回 null，不抛出异常。支持直接字段、args.strict 或 inputs.strict。"
 *         }
 *       ],
 *       "returns": "unknown | null",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "获取 JSON",
 *       "description": "解析并深拷贝返回当前 JSON，可返回对象、数组或标量；会遵守 requireObject 和 allowArray。strict=true 时失败会更新可见错误并抛出 Error。"
 *     },
 *     {
 *       "name": "getLayoutJson",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "patch",
 *           "optional": true,
 *           "type": "Record<string, unknown>",
 *           "description": "可选对象补丁，支持直接字段、args.patch 或 inputs.patch，会浅合并到解析出的对象 JSON；非 object 补丁按 {} 处理。"
 *         }
 *       ],
 *       "returns": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "获取布局 JSON",
 *       "description": "严格要求当前 JSON 为对象，解析失败或根节点不是对象时更新可见错误并抛出 Error；返回值不会修改编辑器文本。"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "value",
 *           "optional": true,
 *           "type": "unknown",
 *           "description": "支持直接传入 JSON 值或原始文本字符串，或传入 { args: { value } } / { inputs: { value } }。readonly=true 时抛出 Error。"
 *         }
 *       ],
 *       "returns": "{ value: string, layoutJson: object | null, json: unknown, valid: boolean, error: string, recordUuid: string, recordName: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "设置 JSON",
 *       "description": "把非 string 值格式化为 JSON 文本，写入编辑器、刷新语法和根节点校验、同步 onChange/onToolChange，并通知 PreviewBlockRuntime。方法返回完整 getData 结果，即使写入内容无效也不抛错。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string, layoutJson: object | null, json: unknown, valid: boolean, error: string, recordUuid: string, recordName: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "清空 JSON",
 *       "description": "将编辑器重置为默认空对象 {}，触发校验和运行时通知；readonly=true 时抛出 Error。"
 *     },
 *     {
 *       "name": "format",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "格式化 JSON",
 *       "description": "语法和根节点校验通过后把当前 JSON 文本格式化为两空格缩进并通知运行时；失败时更新可见错误并抛出 Error。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "JSON 对象",
 *       "variable": "layoutJson",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "description": "当前文本解析成功且根值为 object 时返回；否则为 null。"
 *     },
 *     {
 *       "label": "记录 UUID",
 *       "variable": "recordUuid",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "记录名称",
 *       "variable": "recordName",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "校验状态",
 *       "variable": "valid",
 *       "dataType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存标题、JSON 值、占位提示和行数；readonly、recordUuid、recordName、schema、requireObject、allowArray 只在有值或偏离默认值时写入 EditorJS block.data。"
 *     },
 *     {
 *       "key": "schemaMetadataOnly",
 *       "type": "behavior",
 *       "description": "schema 会深拷贝保存，但组件 v1 只执行 JSON.parse 与根节点类型校验，不把 schema 交给 JSON Schema validator。"
 *     },
 *     {
 *       "key": "rootValidation",
 *       "type": "validation",
 *       "description": "requireObject=true 时只允许 object；requireObject=false 且 allowArray=false 时拒绝数组；两者分别为 false/true 时接受所有合法 JSON 根类型。"
 *     },
 *     {
 *       "key": "runtimeNotification",
 *       "type": "behavior",
 *       "description": "用户输入、setValue、clear、format 和外部 props.value 变化都会使 blocks[blockId] 变量依赖重新求值。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MJsonEditor-example",
 *       "type": "MJsonEditor",
 *       "data": {
 *         "label": "JSON",
 *         "value": {},
 *         "placeholder": "{\\n  \\"schemaVersion\\": 1\\n}",
 *         "rows": 18,
 *         "readonly": false,
 *         "requireObject": true,
 *         "allowArray": false
 *       }
 *     },
 *     {
 *       "id": "MJsonEditor-ai-chat-request-example",
 *       "type": "MJsonEditor",
 *       "data": {
 *         "label": "AI DSL 请求 JSON",
 *         "value": {
 *           "requirementDocument": "生成一个 CRM：包括客户管理，列表，添加，修改，删除",
 *           "projectContext": { "app": "crm", "datasource": "Mokelay" }
 *         },
 *         "placeholder": "{\\n  \\"requirementDocument\\": \\"...\\"\\n}",
 *         "rows": 24,
 *         "readonly": false,
 *         "schema": {
 *           "type": "object",
 *           "required": [
 *             "requirementDocument"
 *           ],
 *           "properties": {
 *             "requirementDocument": {
 *               "type": "string"
 *             },
 *             "projectContext": { "type": "object" }
 *           }
 *         },
 *         "requireObject": true,
 *         "allowArray": false
 *       }
 *     },
 *     {
 *       "id": "MJsonEditor-readonly-response-example",
 *       "type": "MJsonEditor",
 *       "data": {
 *         "label": "响应 JSON",
 *         "value": { "status": "complete", "pages": [], "apis": [] },
 *         "rows": 18,
 *         "readonly": true,
 *         "requireObject": true,
 *         "allowArray": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mJsonEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mJsonEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ue=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MJson",
 *   "displayName": "JSON 查看器",
 *   "category": "content",
 *   "description": "只读 JSON 查看器，使用 json-editor-vue 的树形模式展示任意可 JSON 序列化值，支持键和值搜索、匹配项定位、展开收起和复制。setValue/clear 可接收 action 或 processor 的运行时结果，并通知依赖 blocks[blockId] 的模板刷新；运行时值不会写回静态 DSL。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MJson",
 *     "toolSymbol": "mJsonTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": false,
 *     "sortOrder": 81
 *   },
 *   "toolbox": {
 *     "title": "JSON 查看器",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M8 5C6.5 5 5.5 6 5.5 7.5v2c0 1.1-.9 2-2 2 1.1 0 2 .9 2 2v2C5.5 17 6.5 18 8 18M16 5c1.5 0 2.5 1 2.5 2.5v2c0 1.1.9 2 2 2-1.1 0-2 .9-2 2v2C18.5 17 17.5 18 16 18M10.5 9h3M10.5 12h3M10.5 15h3\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "JSON",
 *     "value": {},
 *     "height": 360,
 *     "expandDepth": 1,
 *     "emptyText": "暂无 JSON 数据。"
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text",
 *       "defaultValue": "JSON",
 *       "description": "查看器工具栏标题。"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 值",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "defaultValue": {},
 *       "description": "初始展示值，可为 object、array、string、number、boolean 或 null；setValue 成功调用后由运行时值覆盖。",
 *       "validationMessage": "请输入有效 JSON。"
 *     },
 *     {
 *       "key": "height",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "查看器高度",
 *       "type": "text",
 *       "defaultValue": 360,
 *       "minimum": 240,
 *       "maximum": 900,
 *       "description": "像素高度，序列化和渲染时截断为 240 到 900 的整数。"
 *     },
 *     {
 *       "key": "expandDepth",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "默认展开层级",
 *       "type": "text",
 *       "defaultValue": 1,
 *       "minimum": 0,
 *       "maximum": 8,
 *       "description": "首次渲染或 setValue 后自动展开的树深度；0 表示全部收起。"
 *     },
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空态文案",
 *       "type": "text",
 *       "defaultValue": "暂无 JSON 数据。",
 *       "description": "value 为 null/undefined 或无法序列化时显示。"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: unknown, json: unknown }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "获取当前 JSON",
 *       "description": "返回当前展示的 JSON 值；如果已通过 setValue 写入运行时值，则优先返回运行时值。"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "value",
 *           "type": "unknown",
 *           "optional": true,
 *           "description": "支持直接传入 JSON 值，或传入 { args: { value } } / { inputs: { value } } 的 call_block_method 调用对象。缺省或不可用值归一化为 null。"
 *         }
 *       ],
 *       "returns": "{ value: unknown, json: unknown }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "设置 JSON",
 *       "description": "深拷贝并写入运行时 JSON 值，重置搜索、高亮和展开状态，刷新查看器并通知 PreviewBlockRuntime。运行时值优先于后续 props.value 更新。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: null, json: null }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "清空 JSON",
 *       "description": "把运行时值设为 null，清空搜索和高亮，查看器进入空态；不会恢复静态 props.value。"
 *     },
 *     {
 *       "name": "copy",
 *       "exposed": true,
 *       "async": true,
 *       "params": [],
 *       "returns": "{ copied: boolean }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "复制 JSON",
 *       "description": "优先使用 Clipboard API，失败时回退到 document.execCommand；无有效 JSON 或两种复制方式都失败时返回 copied=false。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "JSON 值",
 *       "variable": "value",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "description": "当前展示值；变量系统以 object 暴露，但运行时可以实际承载任意 JSON 类型。"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存标题、JSON 值、查看器高度、默认展开层级和空态文案到 EditorJS block.data；运行时 setValue 写入的值不反向写入静态 DSL。"
 *     },
 *     {
 *       "key": "runtimePrecedence",
 *       "type": "behavior",
 *       "description": "首次 setValue 或 clear 后进入运行时覆盖模式，后续 props.value 变化不会替换当前展示值，直到 Block 重新创建。"
 *     },
 *     {
 *       "key": "searchLimit",
 *       "type": "behavior",
 *       "description": "搜索同时匹配 key 和标量 value，单次最多记录 200 个路径匹配。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MJson-example",
 *       "type": "MJson",
 *       "data": {
 *         "label": "示例 JSON",
 *         "value": {
 *           "enabled": true,
 *           "items": [
 *             "one",
 *             "two"
 *           ]
 *         },
 *         "height": 360,
 *         "expandDepth": 1,
 *         "emptyText": "暂无 JSON 数据。"
 *       }
 *     },
 *     {
 *       "id": "MJson-runtime-result-example",
 *       "type": "MJson",
 *       "data": {
 *         "label": "AI 生成结果",
 *         "value": null,
 *         "height": 520,
 *         "expandDepth": 2,
 *         "emptyText": "等待生成结果..."
 *       }
 *     },
 *     {
 *       "title": "展示 Action 输出",
 *       "blockId": "generation-result",
 *       "action": {
 *         "action": "call_block_method",
 *         "inputs": {
 *           "blockId": "generation-result",
 *           "method": "setValue",
 *           "args": {
 *             "value": { "template": "{{actions['generate-dsl'].outputs.data}}" }
 *           }
 *         },
 *         "outputs": ["returnData"]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mJsonTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,pe=`import { defineEditorTool } from '@/editors/editorToolDefinition';
import type { EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  normalizeMLayoutGridProps,
  serializeMLayoutGridProps,
  type MLayoutGridProps
} from 'mokelay-components/blocks/MLayoutGrid.vue';
import type { BlockDataField } from 'mokelay-components/runtime';

type MLayoutGridEditorProps = Omit<MLayoutGridProps, 'edit'> & EditorToolComponentProps;

function getLayoutGridDataFields(): BlockDataField[] {
  return [
    { label: '区域数据', variable: 'areas', dataType: 'array' },
    { label: '区域数量', variable: 'areaCount', dataType: 'number' }
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
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MLayoutGrid",
 *     "toolSymbol": "mLayoutGridEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 90
 *   },
 *   "toolbox": {
 *     "title": "布局网格",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"5\\" width=\\"7\\" height=\\"14\\" rx=\\"1.5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><rect x=\\"13\\" y=\\"5\\" width=\\"7\\" height=\\"14\\" rx=\\"1.5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "columns": 1,
 *     "gap": 16,
 *     "rowGap": 16,
 *     "minColumnWidth": 0,
 *     "alignItems": "stretch",
 *     "justifyItems": "stretch",
 *     "hideEmptyAreas": false,
 *     "responsive": {
 *       "mobile": {
 *         "columns": 1
 *       }
 *     },
 *     "areas": [
 *       {
 *         "id": "main",
 *         "name": "主区域",
 *         "blocks": []
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "columns",
 *       "optional": true,
 *       "tsType": "MLayoutGridTrack | MLayoutGridTrack[]",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
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
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "区域间距",
 *       "type": "text",
 *       "placeholder": "16 / 16px / 1rem"
 *     },
 *     {
 *       "key": "responsive",
 *       "optional": true,
 *       "tsType": "{\\n    mobile?: MLayoutGridResponsiveConfig;\\n    tablet?: MLayoutGridResponsiveConfig;\\n    desktop?: MLayoutGridResponsiveConfig;\\n  }",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "响应式配置",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "areas",
 *       "optional": true,
 *       "tsType": "MLayoutGridArea[]",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "区域配置",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "hideEmptyAreas",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "隐藏空区域",
 *       "type": "checkbox"
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
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "saveEditor",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
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
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'区域数量'",
 *         "zh": "区域数量",
 *         "en": "区域数量"
 *       },
 *       "variable": "areaCount",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue"
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
 *       "file": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mLayoutGridEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLayoutGridEditorTool = defineEditorTool<MLayoutGridEditorProps>({
  getDataFields: getLayoutGridDataFields,
  normalizeProps: (props) => ({
    ...normalizeMLayoutGridProps(props),
    edit: props.edit ?? false
  }),
  serialize: serializeMLayoutGridProps
});
`,me=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "uuid": "mokelay-editor-MLayoutPreview",
 *   "blockType": "MLayoutPreview",
 *   "displayName": "布局预览",
 *   "category": "layout",
 *   "description": "布局预览，用于在编辑器内以只读方式渲染页面布局，辅助配置和校验区域内容。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MLayoutPreview",
 *     "toolSymbol": "mLayoutPreviewTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 80
 *   },
 *   "toolbox": {
 *     "title": "布局预览",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"3\\" y=\\"4\\" width=\\"18\\" height=\\"16\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M3 9h18M8 9v11\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "layout": {}
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "label": "标题",
 *       "type": "text",
 *       "configurable": true
 *     },
 *     {
 *       "key": "layout",
 *       "label": "布局 JSON",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "validationMessage": "请输入有效布局 JSON。",
 *       "configurable": true
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存 title 和 layout 到 EditorJS block.data。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MLayoutPreview-example",
 *       "type": "MLayoutPreview",
 *       "data": {
 *         "layout": {}
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLayoutPreview.vue",
 *       "reason": "Vue component implementation and editor tool definition"
 *     }
 *   ]
 * }
 */
export const mLayoutPreviewTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,be=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLinearScaleField",
 *   "displayName": "线性量表",
 *   "category": "form",
 *   "description": "线性量表字段，支持数值范围、刻度标签和表单校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MLinearScaleField",
 *     "toolSymbol": "mLinearScaleFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 380
 *   },
 *   "toolbox": {
 *     "title": "线性量表",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><circle cx=\\"7\\" cy=\\"7\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"7\\" cy=\\"17\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M12 7h7M12 17h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": "",
 *     "min": 0,
 *     "max": 10,
 *     "lowLabel": "完全不会",
 *     "highLabel": "非常愿意"
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text"
 *     },
 *     {
 *       "key": "min",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最低分",
 *       "type": "text"
 *     },
 *     {
 *       "key": "max",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最高分",
 *       "type": "text"
 *     },
 *     {
 *       "key": "lowLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "低分文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "highLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "高分文案",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue"
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
 *       "id": "MLinearScaleField-example",
 *       "type": "MLinearScaleField",
 *       "data": {
 *         "value": "",
 *         "min": 0,
 *         "max": 10,
 *         "lowLabel": "完全不会",
 *         "highLabel": "非常愿意"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mLinearScaleFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLinearScaleFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ge=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLink",
 *   "displayName": "链接",
 *   "category": "content",
 *   "description": "链接 Block，支持文案、目标地址、打开方式和链接样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MLink",
 *     "toolSymbol": "mLinkEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 100
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "链接",
 *       "en": "Link"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M10.6 13.4a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7l-1.2 1.2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/><path d=\\"M13.4 10.6a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.2-1.2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "text": {
 *       "zh": "链接",
 *       "en": "Link"
 *     },
 *     "url": "https://mokelay.com",
 *     "open": false
 *   },
 *   "properties": [
 *     {
 *       "key": "text",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "链接文本",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "链接",
 *         "en": "Link"
 *       }
 *     },
 *     {
 *       "key": "url",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "链接地址",
 *       "type": "text",
 *       "placeholder": "https://mokelay.com"
 *     },
 *     {
 *       "key": "open",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "新页面打开",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MLink-example",
 *       "type": "MLink",
 *       "data": {
 *         "text": {
 *           "zh": "链接",
 *           "en": "Link"
 *         },
 *         "url": "https://mokelay.com",
 *         "open": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mLinkEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLinkEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,fe=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLinkField",
 *   "displayName": "网址字段",
 *   "category": "form",
 *   "description": "网址字段，提供 URL 输入、格式校验和表单状态。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MLinkField",
 *     "toolSymbol": "mLinkFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 280
 *   },
 *   "toolbox": {
 *     "title": "网址字段",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "https://example.com",
 *     "value": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLinkField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MLinkField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLinkField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLinkField.vue"
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
 *       "id": "MLinkField-example",
 *       "type": "MLinkField",
 *       "data": {
 *         "placeholder": "https://example.com",
 *         "value": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLinkField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mLinkFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLinkFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ve=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MMatrixField",
 *   "displayName": "矩阵题",
 *   "category": "form",
 *   "description": "矩阵题表单字段，支持行列选项与二维答案收集。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MMatrixField",
 *     "toolSymbol": "mMatrixFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 390
 *   },
 *   "toolbox": {
 *     "title": "矩阵题",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><circle cx=\\"7\\" cy=\\"7\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"7\\" cy=\\"17\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M12 7h7M12 17h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": {},
 *     "rows": [
 *       {
 *         "label": "产品体验",
 *         "value": "product"
 *       },
 *       {
 *         "label": "服务响应",
 *         "value": "service"
 *       }
 *     ],
 *     "options": [
 *       {
 *         "label": "不满意",
 *         "value": "bad"
 *       },
 *       {
 *         "label": "一般",
 *         "value": "neutral"
 *       },
 *       {
 *         "label": "满意",
 *         "value": "good"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "PageDslMatrixRow[]",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行 JSON",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项 JSON",
 *       "validationMessage": "请输入有效选项 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue"
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
 *       "id": "MMatrixField-example",
 *       "type": "MMatrixField",
 *       "data": {
 *         "value": {},
 *         "rows": [
 *           {
 *             "label": "产品体验",
 *             "value": "product"
 *           },
 *           {
 *             "label": "服务响应",
 *             "value": "service"
 *           }
 *         ],
 *         "options": [
 *           {
 *             "label": "不满意",
 *             "value": "bad"
 *           },
 *           {
 *             "label": "一般",
 *             "value": "neutral"
 *           },
 *           {
 *             "label": "满意",
 *             "value": "good"
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mMatrixFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mMatrixFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,ye=`import type { OutputData } from '@editorjs/editorjs';
import { defineEditorTool } from '@/editors/editorToolDefinition';

import { finalizeEditorBlocksWithEvents } from 'mokelay-components/blocks';

// MPage 工具在编辑器中的数据结构定义：
// - edit: 是否为编辑态
// - value: 页面内嵌 blocks 数据
export type MPageToolProps = {
  edit: boolean;
  value?: OutputData['blocks'];
};

// 为 MPage 注册 EditorJS 工具能力，统一处理默认值、归一化和序列化。
/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MPage",
 *   "displayName": "页面",
 *   "category": "container",
 *   "description": "页面编排容器，承载 EditorJS Block，并按客户端 Block 文档 API 的 active 配置注册可插入组件。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MPage",
 *     "toolSymbol": "mPageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 10
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "页面",
 *       "en": "Page"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"3\\" width=\\"16\\" height=\\"18\\" rx=\\"2\\" ry=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 8h8M8 12h8M8 16h5\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "OutputData['blocks']",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mPageEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "页面 Blocks"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "blocks: OutputData['blocks']",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MPage.vue",
 *       "label": "变更"
 *     },
 *     {
 *       "event": "close",
 *       "payload": "result?: unknown",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MPage.vue",
 *       "label": "关闭"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "saveEditor",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MPage.vue",
 *       "label": "保存编辑器"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MPage.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "close",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MPage.vue",
 *       "label": "关闭"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "key"
 *       },
 *       "variable": "key",
 *       "dataType": "inferDataType(value)",
 *       "source": "submodule/mokelay-components/src/blocks/MPage.vue"
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
 *       "id": "MPage-example",
 *       "type": "MPage",
 *       "data": {
 *         "value": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MPage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mPageEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mPageEditorTool = defineEditorTool<MPageToolProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: Array.isArray(props.value) ? props.value : []
  }),
  serialize: (props) => ({
    value: finalizeEditorBlocksWithEvents(Array.isArray(props.value) ? props.value : [])
  })
});
`,ke=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MPageState",
 *   "displayName": "页面状态",
 *   "category": "state",
 *   "description": "页面级、内存态 JSON 状态容器。它把复杂页面的临时状态从专用 Vue 组件下沉到 DSL，向 action graph 和模板变量暴露读取、路径写入、根级浅合并、数组追加和恢复初始值能力；运行态不会持久化到 DSL、数据库或其他页面。编辑态显示调试摘要，预览态默认不占视觉空间。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MPageState",
 *     "toolSymbol": "mPageStateTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 90
 *   },
 *   "toolbox": {
 *     "title": "页面状态",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M5 7c0-1.1 3.1-2 7-2s7 .9 7 2-3.1 2-7 2-7-.9-7-2Zm0 0v5c0 1.1 3.1 2 7 2s7-.9 7-2V7m-14 5v5c0 1.1 3.1 2 7 2s7-.9 7-2v-5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "initialState": {},
 *     "visibleInPreview": false,
 *     "readonly": false,
 *     "debugLabel": "Page State"
 *   },
 *   "properties": [
 *     {
 *       "key": "initialState",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "初始状态",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "defaultValue": {},
 *       "description": "页面创建和 clear 时使用的根状态。必须是可 JSON 序列化 object；数组、null、循环引用或不可序列化值会归一化为 {}。",
 *       "validationMessage": "请输入可 JSON 序列化的对象。"
 *     },
 *     {
 *       "key": "visibleInPreview",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "预览时显示",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "false 时作为无视觉占位的状态 Block；true 时在预览中显示只读调试 JSON。编辑态始终显示。"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "只读时 getData/getValue 仍可读取，setValue/merge/append/clear 返回 ok=false 且不修改状态。"
 *     },
 *     {
 *       "key": "debugLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "调试名称",
 *       "type": "text",
 *       "defaultValue": "Page State",
 *       "description": "编辑态或 visibleInPreview=true 时显示的辅助标题，不参与变量路径。"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "{ value: Record<string, unknown>, path?: string, oldValue?: unknown }",
 *       "trigger": "setValue、merge、append 成功修改状态，或 clear 恢复 initialState",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "状态变化"
 *     },
 *     {
 *       "event": "clear",
 *       "payload": "{ value: Record<string, unknown>, oldValue: Record<string, unknown> }",
 *       "trigger": "clear 恢复 initialState 后",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "状态重置"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "获取页面状态",
 *       "description": "返回当前状态的 JSON 深拷贝，顶层字段可由 blocks[blockId] 变量上下文直接读取。"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [{ "name": "path", "optional": true, "description": "点号路径；为空时返回完整状态。" }],
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "读取状态值",
 *       "description": "按点号路径读取 JSON 值；数组索引使用数字段，例如 turns.0.response。缺失路径返回 undefined，非法路径抛出错误。"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         { "name": "path", "type": "string", "optional": true, "description": "点号路径；支持直接字段、args.path 或 inputs.path。为空时替换完整根状态。" },
 *         { "name": "value", "type": "unknown", "optional": false, "description": "可 JSON 序列化值；支持直接字段、args.value 或 inputs.value。无 path 时必须是 object。" }
 *       ],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "设置状态值",
 *       "description": "有 path 时写入路径并按后续数字段自动创建数组，否则创建 object；无 path 时要求 value 为 JSON 对象并替换完整状态。拒绝 __proto__、prototype 和 constructor 路径段。"
 *     },
 *     {
 *       "name": "merge",
 *       "exposed": true,
 *       "async": false,
 *       "params": [{ "name": "value", "type": "Record<string, unknown>", "optional": false, "description": "浅合并到根状态的可 JSON 序列化对象；支持直接字段、args.value 或 inputs.value。" }],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "合并页面状态",
 *       "description": "把 value 浅合并到根状态；嵌套对象不会递归合并。"
 *     },
 *     {
 *       "name": "append",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         { "name": "path", "type": "string", "optional": false, "description": "目标数组的点号路径。" },
 *         { "name": "value", "type": "unknown", "optional": false, "description": "追加的可 JSON 序列化值。" }
 *       ],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "追加数组项",
 *       "description": "向 path 指向的数组追加值；路径不存在或目标不是数组时，从空数组开始。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "重置页面状态",
 *       "description": "恢复 initialState，并触发 change 和 clear 事件。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "initialState 顶层字段（动态）",
 *       "variable": "<initialState key>",
 *       "dataType": "inferred",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "description": "编辑器根据 initialState 的每个顶层 key 动态生成变量；array/number/boolean/string 保留类型，其余值按 object 暴露。运行时可通过 blocks[blockId][key] 读取当前值。"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "仅保存 initialState、visibleInPreview、readonly 和 debugLabel，不保存运行中的状态。"
 *     },
 *     {
 *       "key": "runtimeIsolation",
 *       "type": "behavior",
 *       "description": "每个 MPageState 实例维护独立内存状态，不跨页面、标签页或刷新共享。"
 *     },
 *     {
 *       "key": "runtimeNotification",
 *       "type": "behavior",
 *       "description": "成功写入后通知 PreviewBlockRuntime，使 blocks[blockId] 模板依赖重新求值；clear 同时触发 change 和 clear。"
 *     },
 *     {
 *       "key": "pathSafety",
 *       "type": "validation",
 *       "description": "点号路径不能为空段，并拒绝 __proto__、prototype、constructor；数组容器只接受数字索引。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MPageState-ai-chat-example",
 *       "type": "MPageState",
 *       "data": {
 *         "initialState": {
 *           "turns": [],
 *           "knownPageUuids": [],
 *           "knownApiUuids": [],
 *           "generationResult": null,
 *           "saveSummary": null,
 *           "isGenerating": false,
 *           "error": ""
 *         },
 *         "visibleInPreview": false,
 *         "readonly": false,
 *         "debugLabel": "AI Chat State"
 *       }
 *     },
 *     {
 *       "title": "通过 Action 更新并读取状态",
 *       "blockId": "ai-chat-state",
 *       "template": "{{blocks['ai-chat-state'].isGenerating}}",
 *       "action": {
 *         "action": "call_block_method",
 *         "inputs": {
 *           "blockId": "ai-chat-state",
 *           "method": "merge",
 *           "args": { "value": { "isGenerating": true, "error": "" } }
 *         },
 *         "outputs": ["returnData"]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "reason": "Vue component implementation and editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mPageStateTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,he=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MPhoneField",
 *   "displayName": "电话字段",
 *   "category": "form",
 *   "description": "电话字段，提供电话输入、格式校验和表单状态。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MPhoneField",
 *     "toolSymbol": "mPhoneFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 270
 *   },
 *   "toolbox": {
 *     "title": "电话字段",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "+1 555 000 0000",
 *     "value": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MPhoneField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MPhoneField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MPhoneField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MPhoneField.vue"
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
 *       "id": "MPhoneField-example",
 *       "type": "MPhoneField",
 *       "data": {
 *         "placeholder": "+1 555 000 0000",
 *         "value": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MPhoneField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mPhoneFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mPhoneFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,xe=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MRadioGroupField",
 *   "displayName": "单选题",
 *   "category": "form",
 *   "description": "单选题表单字段，支持选项、默认值和必填校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MRadioGroupField",
 *     "toolSymbol": "mRadioGroupFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 330
 *   },
 *   "toolbox": {
 *     "title": "单选题",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><circle cx=\\"7\\" cy=\\"7\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"7\\" cy=\\"17\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M12 7h7M12 17h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": "",
 *     "options": [
 *       {
 *         "label": "非常符合",
 *         "value": "high"
 *       },
 *       {
 *         "label": "一般",
 *         "value": "medium"
 *       },
 *       {
 *         "label": "不符合",
 *         "value": "low"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MRadioGroupField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-components/src/blocks/MRadioGroupField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项 JSON",
 *       "validationMessage": "请输入有效选项 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRadioGroupField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRadioGroupField.vue"
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
 *       "id": "MRadioGroupField-example",
 *       "type": "MRadioGroupField",
 *       "data": {
 *         "value": "",
 *         "options": [
 *           {
 *             "label": "非常符合",
 *             "value": "high"
 *           },
 *           {
 *             "label": "一般",
 *             "value": "medium"
 *           },
 *           {
 *             "label": "不符合",
 *             "value": "low"
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MRadioGroupField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mRadioGroupFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRadioGroupFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,_e=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MRatingField",
 *   "displayName": "评分",
 *   "category": "form",
 *   "description": "评分字段，支持评分值、最大值和表单校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MRatingField",
 *     "toolSymbol": "mRatingFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 370
 *   },
 *   "toolbox": {
 *     "title": "评分",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><circle cx=\\"7\\" cy=\\"7\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"7\\" cy=\\"17\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M12 7h7M12 17h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": "",
 *     "max": 5,
 *     "lowLabel": "不满意",
 *     "highLabel": "非常满意"
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MRatingField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text"
 *     },
 *     {
 *       "key": "max",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MRatingField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最高分",
 *       "type": "text"
 *     },
 *     {
 *       "key": "lowLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRatingField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "低分文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "highLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRatingField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "高分文案",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MRatingField.vue"
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
 *       "id": "MRatingField-example",
 *       "type": "MRatingField",
 *       "data": {
 *         "value": "",
 *         "max": 5,
 *         "lowLabel": "不满意",
 *         "highLabel": "非常满意"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MRatingField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mRatingFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRatingFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Te=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MRecordList",
 *   "displayName": "记录列表",
 *   "category": "content",
 *   "description": "记录列表，按字段顺序呈现对象或数组数据，支持字段别名、隐藏字段、标题字段和数量显示。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MRecordList",
 *     "toolSymbol": "mRecordListEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 340
 *   },
 *   "toolbox": {
 *     "title": "记录列表",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M8 6h11M8 12h11M8 18h11\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/><circle cx=\\"4.5\\" cy=\\"6\\" r=\\"1.5\\" fill=\\"currentColor\\"/><circle cx=\\"4.5\\" cy=\\"12\\" r=\\"1.5\\" fill=\\"currentColor\\"/><circle cx=\\"4.5\\" cy=\\"18\\" r=\\"1.5\\" fill=\\"currentColor\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "emptyText": "暂无数据",
 *     "fieldOrder": [],
 *     "hiddenFields": [],
 *     "fieldLabels": {},
 *     "titleFields": [
 *       "key",
 *       "name",
 *       "event",
 *       "method",
 *       "variable",
 *       "id",
 *       "label"
 *     ],
 *     "showCount": true
 *   },
 *   "properties": [
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空状态文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "showCount",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示数量",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "fieldOrder",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "字段顺序 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "hiddenFields",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "隐藏字段 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "fieldLabels",
 *       "optional": true,
 *       "tsType": "Record<string, string>",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "字段标签 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "titleFields",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题字段 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "列表数据"
 *     },
 *     {
 *       "key": "count",
 *       "optional": true,
 *       "tsType": "string | number",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "数量"
 *     },
 *     {
 *       "key": "displayName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "显示名称"
 *     },
 *     {
 *       "key": "blockType",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "Block 类型"
 *     },
 *     {
 *       "key": "value",
 *       "label": "fieldLabels.value ?? '值'",
 *       "type": "text",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "declaredInProps": false,
 *       "configurable": false
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MRecordList-example",
 *       "type": "MRecordList",
 *       "data": {
 *         "emptyText": "暂无数据",
 *         "fieldOrder": [],
 *         "hiddenFields": [],
 *         "fieldLabels": {},
 *         "titleFields": [
 *           "key",
 *           "name",
 *           "event",
 *           "method",
 *           "variable",
 *           "id",
 *           "label"
 *         ],
 *         "showCount": true
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mRecordListEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRecordListEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Ee=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MResultPage",
 *   "displayName": "结果页",
 *   "category": "page",
 *   "description": "结果页，用于表单或流程完成后展示计算结果、说明和后续动作。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MResultPage",
 *     "toolSymbol": "mResultPageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 410
 *   },
 *   "toolbox": {
 *     "title": "结果页",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M5 6h14v5H5zM5 16h14\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "你的结果",
 *     "description": "这里展示测验或问卷结果。",
 *     "resultField": "score"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "description",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "说明",
 *       "type": "textarea"
 *     },
 *     {
 *       "key": "resultField",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "结果字段",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MResultPage-example",
 *       "type": "MResultPage",
 *       "data": {
 *         "title": "你的结果",
 *         "description": "这里展示测验或问卷结果。",
 *         "resultField": "score"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mResultPageEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mResultPageEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,we=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MRichText",
 *   "displayName": "富文本",
 *   "category": "content",
 *   "description": "富文本 Block，用于渲染和保存 HTML 富文本内容。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MRichText",
 *     "toolSymbol": "mRichTextEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 220
 *   },
 *   "toolbox": {
 *     "title": "富文本",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M5 6h14M5 12h10M5 18h14\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "content": "这里填写说明内容。"
 *   },
 *   "properties": [
 *     {
 *       "key": "content",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRichText.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "正文",
 *       "type": "textarea"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MRichText-example",
 *       "type": "MRichText",
 *       "data": {
 *         "content": "这里填写说明内容。"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MRichText.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mRichTextEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRichTextEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,De=`import { defineEditorTool } from "@/editors/editorToolDefinition";
import type { MSelectFieldProps } from 'mokelay-components/blocks/MSelectField.vue';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MSelectField",
 *   "displayName": "下拉选择",
 *   "category": "form",
 *   "description": "下拉选择表单字段，支持静态 PageDslOption[] 或 VariableValueConfig 动态选项。预览运行时会先解析变量，再通过 optionLabelField/optionValueField 点路径把任意对象数组映射为标准选项；选择值可被 MForm、getData 和 blocks[blockId].value 读取。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MSelectField",
 *     "toolSymbol": "mSelectFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 320
 *   },
 *   "toolbox": {
 *     "title": "下拉选择",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><circle cx=\\"7\\" cy=\\"7\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"7\\" cy=\\"17\\" r=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M12 7h7M12 17h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "请选择",
 *     "value": "",
 *     "optionLabelField": "label",
 *     "optionValueField": "value",
 *     "required": false,
 *     "disabled": false,
 *     "options": [
 *       {
 *         "label": "选项 A",
 *         "value": "a"
 *       },
 *       {
 *         "label": "选项 B",
 *         "value": "b"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text",
 *       "defaultValue": "请选择",
 *       "description": "当选项中没有 value='' 时自动插入的空选项文案。"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text",
 *       "defaultValue": "",
 *       "description": "当前选择值；string 或 number 会转换为 select 使用的 string，其他类型显示为空值。"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[] | VariableValueConfig",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项",
 *       "type": "component",
 *       "component": "MVariableValueEditor",
 *       "description": "静态选项数组，或由 MVariableValueEditor 生成的变量配置。变量必须在渲染前解析为数组；非数组结果显示为空选项集。"
 *     },
 *     {
 *       "key": "optionLabelField",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项标签字段",
 *       "type": "text",
 *       "defaultValue": "label",
 *       "description": "动态对象项中用作显示文本的点路径，例如 app.profile.name。缺失时回退到 value 字段或选项序号。"
 *     },
 *     {
 *       "key": "optionValueField",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项值字段",
 *       "type": "text",
 *       "defaultValue": "value",
 *       "description": "动态对象项中用作提交值的点路径；number 会转为 string，无法映射时使用 option_N。"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "必填",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "设置原生 select.required；表单提交时由 MForm/浏览器校验空值。"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "禁用原生 select，阻止用户修改。"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID",
 *       "description": "作为 MForm 字段 key 和 DOM id；为空时仅生成组件本地 DOM id。"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "description": "优先读取原生 select 当前值；组件尚未挂载时返回 props.value 的 string 形式。供 MForm 与 call_block_method 读取。",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "description": "当前选择值；动态选项也只暴露映射后的 string value。"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存 id、placeholder、value、options；optionLabelField/optionValueField 仅偏离默认值时保存，required/disabled 仅为 true 时保存。VariableValueConfig 保持原结构，不保存解析结果。"
 *     },
 *     {
 *       "key": "optionFieldMapping",
 *       "type": "behavior",
 *       "description": "静态或动态对象数组通过 optionLabelField 与 optionValueField 映射显示文本和提交值，两个字段均支持点路径。标准 { label, value } 数组无需额外配置。"
 *     },
 *     {
 *       "key": "dynamicResolution",
 *       "type": "behavior",
 *       "description": "VariableValueConfig 由 EditorPreviewBlock/页面变量运行时解析；MSelectField 组件最终只消费 PageDslOption[]，解析失败或结果非数组时安全降级为空数组。"
 *     },
 *     {
 *       "key": "placeholderOption",
 *       "type": "behavior",
 *       "description": "映射后的 options 不含空 string value 时自动补充 placeholder 空选项；已有空值选项时不重复添加。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MSelectField-example",
 *       "type": "MSelectField",
 *       "data": {
 *         "value": "",
 *         "options": [
 *           {
 *             "label": "选项 A",
 *             "value": "a"
 *           },
 *           {
 *             "label": "选项 B",
 *             "value": "b"
 *           }
 *         ]
 *       }
 *     },
 *     {
 *       "id": "MSelectField-dynamic-options",
 *       "type": "MSelectField",
 *       "data": {
 *         "placeholder": "请选择 APP",
 *         "options": {
 *           "mode": "variable",
 *           "source": "MPage",
 *           "pageId": "page_uuid",
 *           "variable": "dataSources.apps.apps"
 *         },
 *         "optionLabelField": "alias",
 *         "optionValueField": "uuid",
 *         "required": true
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MSelectField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mSelectFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mSelectFieldEditorTool = defineEditorTool<MSelectFieldProps>({
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => ({
    ...(typeof props.id === 'string' && props.id.trim() ? { id: props.id.trim() } : {}),
    placeholder: typeof props.placeholder === 'string' ? props.placeholder : '请选择',
    value: props.value ?? '',
    options: props.options ?? [],
    ...(props.optionLabelField && props.optionLabelField !== 'label'
      ? { optionLabelField: props.optionLabelField }
      : {}),
    ...(props.optionValueField && props.optionValueField !== 'value'
      ? { optionValueField: props.optionValueField }
      : {}),
    ...(props.required === true ? { required: true } : {}),
    ...(props.disabled === true ? { disabled: true } : {})
  })
});
`,Me=`import { defineEditorTool } from "@/editors/editorToolDefinition";
import {
  normalizeTabs,
  type MTabsProps
} from 'mokelay-components/blocks/MTabs.vue';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTabs",
 *   "displayName": "页签",
 *   "category": "content",
 *   "description": "页签容器，按配置渲染多个页面或内容区，并支持当前页签切换。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MTabs",
 *     "toolSymbol": "mTabsEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 200
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "页签",
 *       "en": "Tabs"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"3\\" y=\\"6\\" width=\\"18\\" height=\\"12\\" rx=\\"3\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M10 6v12M3 11h7\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "tabs": [],
 *     "activeTabId": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "tabs",
 *       "optional": true,
 *       "tsType": "MTabsTab[]",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "localizablePaths": ["[].name"],
 *       "label": "页签配置",
 *       "type": "component",
 *       "component": "MTabsConfigEditor"
 *     },
 *     {
 *       "key": "activeTabId",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "激活页签 ID"
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
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setActiviTabId",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "label": "设置激活页签"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "i18n.t('tabs.dataFields.activeTabId')",
 *         "zh": "激活页签 ID",
 *         "en": "Active tab ID"
 *       },
 *       "variable": "activeTabId",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('tabs.dataFields.activeTab')",
 *         "zh": "激活页签",
 *         "en": "Active tab"
 *       },
 *       "variable": "activeTab",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('tabs.dataFields.tabs')",
 *         "zh": "页签列表",
 *         "en": "Tabs"
 *       },
 *       "variable": "tabs",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue"
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
 *       "id": "MTabs-example",
 *       "type": "MTabs",
 *       "data": {
 *         "tabs": [],
 *         "activeTabId": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mTabsEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTabsEditorTool = defineEditorTool<MTabsProps>({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({
    ...props,
    edit: props.edit ?? false,
    tabs: normalizeTabs(props.tabs)
  }),
  serialize: (props) => Object.fromEntries(
    Object.entries({
      ...props,
      tabs: normalizeTabs(props.tabs)
    }).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Se=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTag",
 *   "displayName": "标签",
 *   "category": "content",
 *   "description": "标签 Block，支持标签文本、颜色、尺寸和展示样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MTag",
 *     "toolSymbol": "mTagEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 190
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "标签",
 *       "en": "Tag"
 *     },
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"7\\" width=\\"16\\" height=\\"10\\" rx=\\"5\\" ry=\\"5\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><circle cx=\\"8\\" cy=\\"12\\" r=\\"1.4\\" fill=\\"currentColor\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "tagName": {
 *       "zh": "标签",
 *       "en": "Tag"
 *     },
 *     "closable": false,
 *     "size": "",
 *     "color": "",
 *     "type": "success"
 *   },
 *   "properties": [
 *     {
 *       "key": "tagName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标签内容",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "标签",
 *         "en": "Tag"
 *       }
 *     },
 *     {
 *       "key": "type",
 *       "optional": true,
 *       "tsType": "'' | 'primary' | 'success' | 'info' | 'warning' | 'danger'",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标签类型",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "",
 *           "label": {
 *             "zh": "默认",
 *             "en": "Default"
 *           }
 *         },
 *         {
 *           "value": "primary",
 *           "label": {
 *             "zh": "主要",
 *             "en": "Primary"
 *           }
 *         },
 *         {
 *           "value": "success",
 *           "label": {
 *             "zh": "成功",
 *             "en": "Success"
 *           }
 *         },
 *         {
 *           "value": "info",
 *           "label": {
 *             "zh": "信息",
 *             "en": "Info"
 *           }
 *         },
 *         {
 *           "value": "warning",
 *           "label": {
 *             "zh": "警告",
 *             "en": "Warning"
 *           }
 *         },
 *         {
 *           "value": "danger",
 *           "label": {
 *             "zh": "危险",
 *             "en": "Danger"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "'' | 'large' | 'default' | 'small'",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标签尺寸",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "",
 *           "label": {
 *             "zh": "默认",
 *             "en": "Default"
 *           }
 *         },
 *         {
 *           "value": "large",
 *           "label": {
 *             "zh": "大",
 *             "en": "Large"
 *           }
 *         },
 *         {
 *           "value": "default",
 *           "label": {
 *             "zh": "中",
 *             "en": "Medium"
 *           }
 *         },
 *         {
 *           "value": "small",
 *           "label": {
 *             "zh": "小",
 *             "en": "Small"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "color",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "自定义颜色",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "例如：#409EFF",
 *         "en": "e.g. #409EFF"
 *       }
 *     },
 *     {
 *       "key": "closable",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "可关闭",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MTag-example",
 *       "type": "MTag",
 *       "data": {
 *         "tagName": {
 *           "zh": "标签",
 *           "en": "Tag"
 *         },
 *         "closable": false,
 *         "size": "",
 *         "color": "",
 *         "type": "success"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mTagEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTagEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Ie=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTextField",
 *   "displayName": "单行文本",
 *   "category": "form",
 *   "description": "单行文本表单字段，支持标签、占位符、默认值和校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MTextField",
 *     "toolSymbol": "mTextFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 250
 *   },
 *   "toolbox": {
 *     "title": "单行文本",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "请输入文本",
 *     "value": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTextField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextField.vue"
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
 *       "id": "MTextField-example",
 *       "type": "MTextField",
 *       "data": {
 *         "placeholder": "请输入文本",
 *         "value": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MTextField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mTextFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTextFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Ce=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTextareaField",
 *   "displayName": "多行文本",
 *   "category": "form",
 *   "description": "多行文本表单字段，支持行数、占位符、默认值和校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MTextareaField",
 *     "toolSymbol": "mTextareaFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 290
 *   },
 *   "toolbox": {
 *     "title": "多行文本",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "请输入详细说明",
 *     "value": "",
 *     "rows": 4
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "必填"
 *     },
 *     {
 *       "key": "maxLength",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "最大长度"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "禁用"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "focus",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "label": "聚焦"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue"
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
 *       "id": "MTextareaField-example",
 *       "type": "MTextareaField",
 *       "data": {
 *         "placeholder": "请输入详细说明",
 *         "value": "",
 *         "rows": 4
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mTextareaFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTextareaFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Fe=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MThankYouPage",
 *   "displayName": "感谢页",
 *   "category": "page",
 *   "description": "感谢页，用于流程完成后的提示、说明和后续导航。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MThankYouPage",
 *     "toolSymbol": "mThankYouPageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 400
 *   },
 *   "toolbox": {
 *     "title": "感谢页",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M5 6h14v5H5zM5 16h14\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linejoin=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "提交成功",
 *     "description": "谢谢你的提交，我们已经收到。"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MThankYouPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "description",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MThankYouPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "说明",
 *       "type": "textarea"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MThankYouPage-example",
 *       "type": "MThankYouPage",
 *       "data": {
 *         "title": "提交成功",
 *         "description": "谢谢你的提交，我们已经收到。"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MThankYouPage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mThankYouPageEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mThankYouPageEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Pe=`import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MUploadImport",
 *   "displayName": "上传导入",
 *   "category": "content",
 *   "description": "上传导入 Block，支持文件选择、解析导入、进度、结果汇总和错误反馈。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MUploadImport",
 *     "toolSymbol": "mUploadImportEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 310
 *   },
 *   "toolbox": {
 *     "title": "上传导入",
 *     "icon": "<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect x=\\"4\\" y=\\"6\\" width=\\"16\\" height=\\"12\\" rx=\\"2\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"/><path d=\\"M8 12h8\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg>"
 *   },
 *   "defaultData": {
 *     "mode": "file",
 *     "accept": "",
 *     "multiple": false,
 *     "maxCount": 1,
 *     "maxSizeMB": 20,
 *     "drag": true,
 *     "autoUpload": false,
 *     "uploadAction": [],
 *     "parsePreview": false,
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "mode",
 *       "optional": true,
 *       "tsType": "MUploadImportMode | string",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "模式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "file",
 *           "label": "普通文件"
 *         },
 *         {
 *           "value": "image",
 *           "label": "图片"
 *         },
 *         {
 *           "value": "excel",
 *           "label": "Excel"
 *         },
 *         {
 *           "value": "csv",
 *           "label": "CSV"
 *         },
 *         {
 *           "value": "batchText",
 *           "label": "批量文本"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "accept",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "文件类型",
 *       "type": "text",
 *       "placeholder": ".xlsx,.xls,.csv"
 *     },
 *     {
 *       "key": "multiple",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许多文件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "maxCount",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最多文件数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "maxSizeMB",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "单文件大小 MB",
 *       "type": "text"
 *     },
 *     {
 *       "key": "drag",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "拖拽上传",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "autoUpload",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选择后自动上传",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "parsePreview",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "本地预览",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "template",
 *       "optional": true,
 *       "tsType": "MUploadImportTemplate",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "模板配置 JSON",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "validationMessage": "请输入有效模板 JSON。"
 *     },
 *     {
 *       "key": "uploadAction",
 *       "optional": true,
 *       "tsType": "ActionConfig[]",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "上传 Action",
 *       "type": "component",
 *       "component": "MActionEditor"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MUploadImportUploadedFile[]",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "result",
 *       "optional": true,
 *       "tsType": "MUploadImportResult",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "结果数据"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "payload: MUploadImportProps & { files: MUploadImportUploadedFile[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "变更"
 *     },
 *     {
 *       "event": "before-upload",
 *       "payload": "payload: { files: MUploadImportUploadedFile[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "上传前"
 *     },
 *     {
 *       "event": "upload-progress",
 *       "payload": "payload: { file: MUploadImportUploadedFile; percent: number }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "上传进度"
 *     },
 *     {
 *       "event": "upload-success",
 *       "payload": "payload: { result: MUploadImportResult; files: MUploadImportUploadedFile[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "上传成功"
 *     },
 *     {
 *       "event": "upload-error",
 *       "payload": "payload: { error: Error; file?: MUploadImportUploadedFile }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "上传失败"
 *     },
 *     {
 *       "event": "template-download",
 *       "payload": "payload: { template?: MUploadImportTemplate }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "下载模板"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "selectFiles",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "选择文件"
 *     },
 *     {
 *       "name": "upload",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "上传"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "清空"
 *     },
 *     {
 *       "name": "removeFile",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "移除文件"
 *     },
 *     {
 *       "name": "downloadTemplate",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "下载模板"
 *     },
 *     {
 *       "name": "parseFiles",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "解析文件"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "设置值"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "'文件列表'",
 *         "zh": "文件列表",
 *         "en": "文件列表"
 *       },
 *       "variable": "files",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'URL 列表'",
 *         "zh": "URL 列表",
 *         "en": "URL 列表"
 *       },
 *       "variable": "urls",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'上传结果'",
 *         "zh": "上传结果",
 *         "en": "上传结果"
 *       },
 *       "variable": "result",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'批量文本'",
 *         "zh": "批量文本",
 *         "en": "批量文本"
 *       },
 *       "variable": "text",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue"
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
 *       "id": "MUploadImport-example",
 *       "type": "MUploadImport",
 *       "data": {
 *         "mode": "file",
 *         "accept": "",
 *         "multiple": false,
 *         "maxCount": 1,
 *         "maxSizeMB": 20,
 *         "drag": true,
 *         "autoUpload": false,
 *         "uploadAction": [],
 *         "parsePreview": false,
 *         "value": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mUploadImportEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mUploadImportEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
`,Ve=Object.assign({"./blocks/MActionEditor.vue":I,"./blocks/MActionToolBarEditor.vue":C,"./blocks/MAdvanceInputEditor.vue":F,"./blocks/MAdvanceTableColumnsEditor.vue":P,"./blocks/MBlockPlaygroundEditor.vue":V,"./blocks/MChartDataEditor.vue":A,"./blocks/MDatasourceEditor.vue":z,"./blocks/MEditorSelector.vue":B,"./blocks/MFieldsEditor.vue":R,"./blocks/MFormEditor.vue":O,"./blocks/MFormItemEditor.vue":L,"./blocks/MFormItemsEditor.vue":N,"./blocks/MLayoutGridEditor.vue":j,"./blocks/MLocalizedTextEditor.vue":J,"./blocks/MTabsConfigEditor.vue":$,"./blocks/MVariableValueEditor.vue":U,"./blocks/mEditorSelectorEditorTool.ts":H,"./tools/mActionCardListEditorTool.ts":K,"./tools/mActionToolbarEditorTool.ts":q,"./tools/mAdvanceInputEditorTool.ts":G,"./tools/mAdvanceTableEditorTool.ts":W,"./tools/mButtonEditorTool.ts":X,"./tools/mChartEditorTool.ts":Y,"./tools/mCheckboxGroupFieldEditorTool.ts":Z,"./tools/mDateRangeFieldEditorTool.ts":Q,"./tools/mDividerLineEditorTool.ts":ee,"./tools/mEmailFieldEditorTool.ts":ne,"./tools/mEmbedEditorTool.ts":oe,"./tools/mFileUploadFieldEditorTool.ts":te,"./tools/mFormEditorTool.ts":ae,"./tools/mFormItemEditorTool.ts":re,"./tools/mHeadingEditorTool.ts":ie,"./tools/mImageChoiceFieldEditorTool.ts":le,"./tools/mImageEditorTool.ts":se,"./tools/mInputEditorTool.ts":de,"./tools/mJsonEditorTool.ts":ce,"./tools/mJsonTool.ts":ue,"./tools/mLayoutGridEditorTool.ts":pe,"./tools/mLayoutPreviewTool.ts":me,"./tools/mLinearScaleFieldEditorTool.ts":be,"./tools/mLinkEditorTool.ts":ge,"./tools/mLinkFieldEditorTool.ts":fe,"./tools/mMatrixFieldEditorTool.ts":ve,"./tools/mPageEditorTool.ts":ye,"./tools/mPageStateTool.ts":ke,"./tools/mPhoneFieldEditorTool.ts":he,"./tools/mRadioGroupFieldEditorTool.ts":xe,"./tools/mRatingFieldEditorTool.ts":_e,"./tools/mRecordListEditorTool.ts":Te,"./tools/mResultPageEditorTool.ts":Ee,"./tools/mRichTextEditorTool.ts":we,"./tools/mSelectFieldEditorTool.ts":De,"./tools/mTabsEditorTool.ts":Me,"./tools/mTagEditorTool.ts":Se,"./tools/mTextFieldEditorTool.ts":Ie,"./tools/mTextareaFieldEditorTool.ts":Ce,"./tools/mThankYouPageEditorTool.ts":Fe,"./tools/mUploadImportEditorTool.ts":Pe});function Ae(e,n){const o=[],t=/@clientBlockDoc([\s\S]*?)\*\//g;for(const r of e.matchAll(t)){const a=r[1].split(/\r?\n/).map(i=>i.replace(/^\s*\*\s?/,"")).join(`
`).trim();if(a.startsWith("{"))try{const i=JSON.parse(a),m=i.blockType||i.block_type||"";if(!m)continue;o.push({...i,uuid:i.uuid||`local:${m}`,sourceFile:i.sourceFile||i.source_file||n})}catch{}}return o}const ze=Object.entries(Ve).flatMap(([e,n])=>Ae(n,e));function Be(){return ze.map(e=>({...e}))}const k=T(Be()),Re=new Set(k.map(e=>e.blockType));let u=k,b=null;function f(e,n){if(typeof e=="boolean")return e;if(typeof e=="number")return e!==0;if(typeof e=="string"){const o=e.trim().toLowerCase();if(["1","true","yes"].includes(o))return!0;if(["0","false","no"].includes(o))return!1}return n}function Oe(e,n){const o=Number(e);return Number.isFinite(o)?o:n}function x(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)?{...e}:{}}function p(e){return Array.isArray(e)?[...e]:[]}function Le(e,n=0){const o=(e.blockType||e.block_type||"").trim();if(!o)return null;const t=x(e.registration),r=f(e.editorEnabled??e.editor_enabled??t.editorEnabled,!0),a=f(e.toolboxVisible??e.toolbox_visible??t.toolboxVisible,r),i=f(e.editorBlock??e.editor_block,!1),m=Oe(e.sortOrder??e.sort_order??t.sortOrder,n*10),D=x(e.defaultData??e.default_data??e.initialProps??e.initial_props);return{uuid:e.uuid,blockType:o,displayName:e.displayName||e.display_name||o,category:e.category||"custom",sourceKind:e.sourceKind||e.source_kind||t.sourceKind||"mokelay-editor",sourcePackage:e.sourcePackage||e.source_package||t.sourcePackage||"",sourceFile:e.sourceFile||e.source_file||"",componentName:e.componentName||e.component_name||t.componentName||o,toolSymbol:e.toolSymbol||e.tool_symbol||t.toolSymbol||"",description:e.description||"",status:e.status||"active",editorEnabled:r,toolboxVisible:a,editorBlock:i,sortOrder:m,registration:{...t,editorEnabled:r,toolboxVisible:a,sortOrder:m},toolbox:e.toolbox||{},defaultData:D,properties:p(e.properties??e.property_schema),events:p(e.events??e.event_schema),methods:p(e.methods??e.method_schema),dataFields:p(e.dataFields??e.data_fields_schema),saveRules:p(e.saveRules??e.save_schema),examples:p(e.examples)}}function T(e){return e.map((n,o)=>Le(n,o)).filter(n=>!!n).sort((n,o)=>n.sortOrder-o.sortOrder||n.blockType.localeCompare(o.blockType))}function Ne(e){return[...k,...e.filter(n=>!Re.has(n.blockType))].sort((n,o)=>n.sortOrder-o.sortOrder||n.blockType.localeCompare(o.blockType))}function je(e){var n;return((n=e.data)==null?void 0:n.docs)??e.docs??[]}function bn(){return u}function h(e){return u.find(n=>n.blockType===e)}function gn(e,n){const o=h(e);if(!o)return n;const t=new Set([...Object.keys(o.defaultData),...o.properties.filter(r=>r.configurable!==!1).map(r=>r.key)]);return Object.fromEntries(Object.entries(n).filter(([r,a])=>t.has(r)&&a!==void 0))}function Je(e=u){return e.filter(n=>n.status==="active"&&n.editorEnabled)}function fn(e=u){return Je(e).filter(n=>n.toolboxVisible)}async function vn(){return b||(b=M.get("/api/mokelay/list_client_block_docs",{timeout:1200,params:{page:1,pageSize:1e3,status:"active"}}).then(e=>{const n=T(je(e.data));return u=Ne(n),u}).catch(e=>u).finally(()=>{b=null}),b)}const $e=d(()=>s(()=>import("./MFormItemsEditor-CdhAHFmS.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]),import.meta.url)),_=d(()=>s(()=>import("./MActionToolBarEditor-CHW0_w9i.js"),__vite__mapDeps([20,1,2,21,22,23,5,6,7,8,11,24,14,25]),import.meta.url)),Ue=d(()=>s(()=>import("./MActionEditor-CYi3yItt.js"),__vite__mapDeps([21,1,2,22,23,5,6,7,8,11,24]),import.meta.url)),He=d(()=>s(()=>import("./MAdvanceTableColumnsEditor-CNEwhrmw.js"),__vite__mapDeps([26,1,2,3,4,5,6,7,8,9,10,11,12,27,28]),import.meta.url)),Ke=d(()=>s(()=>import("./MChartDataEditor-DbIe9k6l.js"),__vite__mapDeps([29,1,2,5,6,7,8,11,30]),import.meta.url)),qe=d(()=>s(()=>import("./MDatasourceEditor-BOs5Sww1.js"),__vite__mapDeps([31,1,2,5,6,7,8,32,22,23,11,33,4,9,10,34]),import.meta.url)),Ge=d(()=>s(()=>import("./MTabsConfigEditor-HZMrTRpp.js"),__vite__mapDeps([35,1,2,5,6,7,8,17,18,11,36]),import.meta.url)),We=d(()=>s(()=>import("./MVariableValueEditor-BJP8PRIc.js").then(e=>e.a),__vite__mapDeps([32,1,2,5,6,7,8,22,23,11,33]),import.meta.url)),Xe=d(()=>s(()=>import("./MLocalizedTextEditor-D6Z1djIz.js"),__vite__mapDeps([17,5,1,2,6,7,8,18]),import.meta.url));function g(e){return e==null||typeof e!="object"?e:JSON.parse(JSON.stringify(e))}function Ye(e,n){if(typeof e=="string")return e;if(typeof e!="object"||e===null||Array.isArray(e))return n;const o=e,t=y.locale==="en"?o.en:o.zh;return typeof t=="string"&&t.trim()?t:typeof o.raw=="string"&&o.raw.trim()?o.raw:n}function Ze(){var e;return((e=h("MAdvanceTable"))==null?void 0:e.dataFields.flatMap(n=>{if(typeof n!="object"||n===null||Array.isArray(n))return[];const o=n,t=Ye(o.label,o.variable);return o.variable!=="search"&&typeof o.variable=="string"&&typeof o.dataType=="string"?[{label:String(t),variable:o.variable,type:o.dataType}]:[]}))??[]}function Qe(e){const n=e.getAvailableBlockDataSources;if(typeof n!="function")return[];const o=typeof e.currentBlockId=="string"?e.currentBlockId:void 0;return n(o)}function en(e){const n=e.getAvailablePageVariableSources;return typeof n!="function"?[]:n()}function l(e){return{component:We,getComponentProps:({value:n,state:o})=>({modelValue:n,valueType:typeof e.valueType=="function"?e.valueType(o):e.valueType,multiline:e.multiline===!0,placeholder:e.placeholder??"",blockDataSources:Qe(o),pageVariableSources:en(o)})}}const nn={"MForm.items":{component:$e},"MForm.actionBar":{component:_},"MActionToolbar.toolbar":{component:_,getComponentProps:({state:e})=>({value:{align:e.align,size:e.size,mode:e.mode,buttons:g(e.buttons)},allowEmpty:!0,outputMode:"patch"})},"MAdvanceTable.columns":{component:He},"MAdvanceTable.ds":{component:qe,getComponentProps:({value:e,state:n})=>({value:e,matchingExternalFields:Ze(),showPageBreak:n.showPageBreak===!0})},"MChart.xAxis":{component:Ke,getComponentProps:({state:e})=>({xAxis:g(e.xAxis),series:g(e.series),chartType:typeof e.type=="string"?e.type:"line",outputMode:"patch"})},"MTabs.tabs":{component:Ge,getComponentProps:({state:e})=>({tabs:g(e.tabs),activeTabId:typeof e.activeTabId=="string"?e.activeTabId:"",outputMode:"patch"})},"MUploadImport.uploadAction":{component:Ue},"MInput.value":l({valueType:"string"}),"MTextField.value":l({valueType:"string"}),"MEmailField.value":l({valueType:"string"}),"MPhoneField.value":l({valueType:"string"}),"MLinkField.value":l({valueType:"string"}),"MTextareaField.value":l({valueType:"string",multiline:!0}),"MSelectField.options":l({valueType:"array",multiline:!0}),"MDateRangeField.value":l({valueType:"object",multiline:!0,placeholder:'{ "start": "2026-01-01", "end": "2026-01-31" }'}),"MCheckboxGroupField.value":l({valueType:"array",multiline:!0}),"MImageChoiceField.value":l({valueType:e=>e.multiple===!0?"array":"string",multiline:!0}),"MActionCardList.items":l({valueType:"array",multiline:!0})};function on(e,n){return nn[`${e}.${n}`]}function tn(e){return{component:Xe,getComponentProps:({value:n})=>({value:n,placeholder:(e==null?void 0:e.placeholder)??"",multiline:(e==null?void 0:e.multiline)===!0,dataTestid:e!=null&&e.propertyKey?`tool-property-input-${e.propertyKey}`:void 0})}}function E(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function c(e,n=""){if(typeof e=="string")return e;if(e&&typeof e=="object"){const o=y.locale==="en"?e.en:e.zh;if(typeof o=="string"&&o.trim())return o;if(typeof e.raw=="string"&&e.raw.trim()&&!e.raw.includes("i18n."))return e.raw}return n}function an(e){const n=Object.keys(e);return n.some(o=>o==="zh"||o==="en"||o==="raw")&&n.every(o=>["zh","en","raw","value"].includes(o))}function v(e){return Array.isArray(e)?e.map(v):E(e)?an(e)?c(e,""):Object.fromEntries(Object.entries(e).map(([n,o])=>[n,v(o)])):e}function rn(e){if(!e)return{};const n=v(e.defaultData);for(const o of e.properties){if(o.localizable!==!0&&!w.has(o.key)||!o.key)continue;const t=S(e.defaultData[o.key]);t&&(n[o.key]=t)}return n}function ln(e){return e==="select"||e==="checkbox"||e==="textarea"||e==="component"?e:"text"}function sn(e){return e==="json"||e==="string"?e:void 0}function dn(e){if(!Array.isArray(e))return;const n=e.flatMap(o=>{if(!E(o))return[];const t=typeof o.value=="string"?o.value:"";return t?[{label:c(o.label,t),value:t}]:[]});return n.length?n:void 0}const w=new Set(["placeholder","title","label","text","description","emptyText","caption","alt","lowLabel","highLabel","displayName","debugLabel","labelName"]);function cn(e){return e.properties.flatMap(n=>{if(!n.key||n.configurable===!1)return[];const o=n.localizable===!0||w.has(n.key),t=ln(n.type),r=o?"component":t,a=o?tn({placeholder:c(n.placeholder),multiline:t==="textarea",propertyKey:n.key}):r==="component"?on(e.blockType,n.key):void 0;return r==="component"&&!(a!=null&&a.component)?[]:[{key:n.key,label:c(n.label,n.key),type:r,valueType:sn(n.valueType),placeholder:c(n.placeholder),validationMessage:c(n.validationMessage),localizable:o,options:dn(n.options),component:a==null?void 0:a.component,getComponentProps:a==null?void 0:a.getComponentProps}]})}function yn(e,n,o){const t=o??h(e),r=t?c(t.toolbox.title,t.displayName):e,a=t?cn(t):[];return{...n,toolbox:{title:r,icon:t&&typeof t.toolbox.icon=="string"?t.toolbox.icon:""},createInitialProps:()=>rn(t),propertyPanel:a.length?{title:`${r}${y.t("editor.propertyDialogTitle")}`,fields:a}:void 0}}export{rn as a,h as b,fn as c,vn as d,cn as e,gn as f,bn as g,c as l,Le as n,yn as r};
