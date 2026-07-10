<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  cloneActions as cloneEditorActions,
  type ActionConfig as EditorActionConfig
} from '@/actions';

export interface MActionEditorProps {
  edit: boolean;
  value?: EditorActionConfig[];
  modelValue?: EditorActionConfig[];
}

function normalizeMActionEditorProps(props: Partial<MActionEditorProps>): MActionEditorProps {
  return {
    edit: props.edit ?? false,
    value: cloneEditorActions(props.value ?? props.modelValue)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
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
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 5h5v5H5V5Zm9 0h5v5h-5V5ZM5 14h5v5H5v-5Zm9.5.5 4 4m0-4-4 4M10 7.5h4M7.5 10v4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "EditorActionConfig[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionEditor.vue",
 *       "line": 10,
 *       "declaredInProps": true,
 *       "configurable": false
 *     },
 *     {
 *       "key": "modelValue",
 *       "optional": true,
 *       "tsType": "EditorActionConfig[]",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionEditor.vue",
 *       "line": 11,
 *       "declaredInProps": true,
 *       "configurable": false
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "update:modelValue",
 *       "payload": "value: ActionConfig[]",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionEditor.vue",
 *       "line": 144
 *     },
 *     {
 *       "event": "change",
 *       "payload": "value: ActionConfig[]",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionEditor.vue",
 *       "line": 144
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
 *       "file": "submodule/mokelay-editor/src/blocks/MActionEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MActionEditor.vue",
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
</script>

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
} from '@/actions';

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

const selectedAction = computed(() => draftActions.value.find((action) => action.uuid === selectedUuid.value) ?? draftActions.value[0] ?? null);
const targetOptions = computed(() => draftActions.value.map((action) => ({
  uuid: action.uuid,
  label: `${action.alias || action.action} / ${action.uuid}`
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
  isOpen.value = true;
}

function closeDialog() {
  isOpen.value = false;
}

function createEdge(source: string, target: string, sourceHandle: string, label = ''): Edge {
  return {
    id: `${source}-${sourceHandle}-${target}`,
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
        uuid: `${uuid}_${node.uuid}`
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
    uuid: `${action.uuid}_case_${nodes.length + 1}`,
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
    uuid: `${action.uuid}_default`,
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
</script>

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
              :data-testid="`m-action-add-${definition.action}`"
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
                    :style="{ top: `${70 + index * 28}px` }"
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

              <label>
                <span>inputs</span>
                <textarea
                  :value="formatJson(selectedAction.inputs)"
                  rows="8"
                  data-testid="m-action-inputs"
                  @change="updateInputs(($event.target as HTMLTextAreaElement).value)"
                ></textarea>
              </label>
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
