<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { booleanValue, stringValue } from '@/blocks/pageDslEditorTools';
import type { BlockDataField, VariableValueDataType } from '@/utils/variableValue';

export interface MPageStateProps {
  edit: boolean;
  currentBlockId?: string;
  initialState?: Record<string, unknown>;
  visibleInPreview?: boolean;
  readonly?: boolean;
  debugLabel?: string;
}

const pageStateDefaults = {
  initialState: {},
  visibleInPreview: false,
  readonly: false,
  debugLabel: 'Page State'
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function warnInvalidInitialState(value: unknown) {
  if (!import.meta.env.DEV || value === undefined) return;
  console.warn('[MPageState] initialState must be a JSON-serializable object.', value);
}

function cloneJsonValue<T>(value: T): T {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new Error('Value must be JSON serializable.');
  }
  return JSON.parse(serialized) as T;
}

function normalizeInitialState(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    warnInvalidInitialState(value);
    return {};
  }

  try {
    const cloned = cloneJsonValue(value);
    if (isRecord(cloned)) return cloned;
  } catch {
    warnInvalidInitialState(value);
  }

  return {};
}

export function normalizePageStateProps(props: Partial<MPageStateProps>): MPageStateProps {
  const merged = {
    ...pageStateDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    initialState: normalizeInitialState(merged.initialState),
    visibleInPreview: booleanValue(merged.visibleInPreview, pageStateDefaults.visibleInPreview),
    readonly: booleanValue(merged.readonly, pageStateDefaults.readonly),
    debugLabel: stringValue(merged.debugLabel, pageStateDefaults.debugLabel)
  };
}

function inferDataType(value: unknown): VariableValueDataType {
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') return 'string';
  return 'object';
}

function getPageStateDataFields(data: Record<string, unknown>): BlockDataField[] {
  const initialState = normalizeInitialState(data.initialState);
  return Object.entries(initialState).map(([key, value]) => ({
    label: key,
    variable: key,
    dataType: inferDataType(value)
  }));
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MPageState",
 *     "toolSymbol": "mPageStateTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 90
 *   },
 *   "toolbox": {
 *     "title": "页面状态",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 7c0-1.1 3.1-2 7-2s7 .9 7 2-3.1 2-7 2-7-.9-7-2Zm0 0v5c0 1.1 3.1 2 7 2s7-.9 7-2V7m-14 5v5c0 1.1 3.1 2 7 2s7-.9 7-2v-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
 *       "label": "状态变化"
 *     },
 *     {
 *       "event": "clear",
 *       "payload": "{ value: Record<string, unknown>, oldValue: Record<string, unknown> }",
 *       "trigger": "clear 恢复 initialState 后",
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
 *       "label": "获取页面状态",
 *       "description": "返回当前状态的 JSON 深拷贝，顶层字段可由 blocks[blockId] 变量上下文直接读取。"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [{ "name": "path", "optional": true, "description": "点号路径；为空时返回完整状态。" }],
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
 *       "label": "设置状态值",
 *       "description": "有 path 时写入路径并按后续数字段自动创建数组，否则创建 object；无 path 时要求 value 为 JSON 对象并替换完整状态。拒绝 __proto__、prototype 和 constructor 路径段。"
 *     },
 *     {
 *       "name": "merge",
 *       "exposed": true,
 *       "async": false,
 *       "params": [{ "name": "value", "type": "Record<string, unknown>", "optional": false, "description": "浅合并到根状态的可 JSON 序列化对象；支持直接字段、args.value 或 inputs.value。" }],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
 *       "label": "追加数组项",
 *       "description": "向 path 指向的数组追加值；路径不存在或目标不是数组时，从空数组开始。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
 *       "label": "重置页面状态",
 *       "description": "恢复 initialState，并触发 change 和 clear 事件。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "initialState 顶层字段（动态）",
 *       "variable": "<initialState key>",
 *       "dataType": "inferred",
 *       "source": "submodule/mokelay-editor/src/blocks/MPageState.vue",
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
 *       "file": "submodule/mokelay-editor/src/blocks/MPageState.vue",
 *       "reason": "Vue component implementation and editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mPageStateTool = defineEditorTool<MPageStateProps>({
  getDataFields: ({ data }) => getPageStateDataFields(data),
  normalizeProps: normalizePageStateProps,
  serialize: (props) => {
    const normalized = normalizePageStateProps(props);
    return {
      initialState: normalizeInitialState(normalized.initialState),
      visibleInPreview: normalized.visibleInPreview,
      readonly: normalized.readonly,
      debugLabel: normalized.debugLabel
    };
  }
});
</script>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';
import { useI18n } from '@/i18n';
import {
  PreviewBlockRuntimeKey,
  type BlockMethodInvocation
} from '@/utils/previewBlockRuntime';

type StateChangePayload = {
  value: Record<string, unknown>;
  path?: string;
  oldValue?: unknown;
};

type StateMethodResult = {
  ok: boolean;
  value: Record<string, unknown>;
  message?: string;
};

const forbiddenPathSegments = new Set(['__proto__', 'prototype', 'constructor']);
const props = defineProps<MPageStateProps & PageDslCallbacks<MPageStateProps>>();
const emit = defineEmits<{
  (event: 'change', payload: StateChangePayload): void;
  (event: 'clear', payload: StateChangePayload): void;
}>();
const { t } = useI18n();
const previewRuntime = inject(PreviewBlockRuntimeKey, null);
const state = ref<Record<string, unknown>>(normalizeInitialState(props.initialState));

const normalized = computed(() => normalizePageStateProps(props));
const shouldRender = computed(() => normalized.value.edit || normalized.value.visibleInPreview);
const keyCount = computed(() => Object.keys(state.value).length);
const keyCountLabel = computed(() => t('pageState.keyCount').replace('{count}', String(keyCount.value)));
const prettyState = computed(() => JSON.stringify(state.value, null, 2));

function hasOwn(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function cloneRuntimeValue<T>(value: T): T {
  if (value === undefined) return value;
  return cloneJsonValue(value);
}

function readInvocationValue(invocation: unknown, key: string) {
  if (!isRecord(invocation)) return undefined;

  if (isRecord(invocation.args) && hasOwn(invocation.args, key)) {
    return invocation.args[key];
  }

  if (isRecord(invocation.inputs) && hasOwn(invocation.inputs, key)) {
    return invocation.inputs[key];
  }

  return hasOwn(invocation, key) ? invocation[key] : undefined;
}

function parsePath(value: unknown, required = false) {
  if (value === undefined || value === null || value === '') {
    return required
      ? { ok: false as const, message: t('pageState.errors.pathRequired') }
      : { ok: true as const, segments: [] as string[], path: '' };
  }

  if (typeof value !== 'string') {
    return { ok: false as const, message: t('pageState.errors.invalidPath') };
  }

  const path = value.trim();
  const segments = path.split('.').map((segment) => segment.trim());
  if (!path || segments.some((segment) => !segment || forbiddenPathSegments.has(segment))) {
    return { ok: false as const, message: t('pageState.errors.invalidPath') };
  }

  return { ok: true as const, segments, path };
}

function readPathValue(source: unknown, segments: string[]) {
  let current = source;
  for (const segment of segments) {
    if (Array.isArray(current)) {
      if (!/^\d+$/.test(segment)) return undefined;
      current = current[Number(segment)];
      continue;
    }

    if (!isRecord(current) || !hasOwn(current, segment)) return undefined;
    current = current[segment];
  }
  return current;
}

function isArrayIndex(value: string) {
  return /^\d+$/.test(value);
}

function setPathValue(target: Record<string, unknown>, segments: string[], value: unknown) {
  let current: Record<string, unknown> | unknown[] = target;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    if (isLast) {
      if (Array.isArray(current)) {
        if (!isArrayIndex(segment)) throw new Error(t('pageState.errors.invalidPath'));
        current[Number(segment)] = value;
      } else {
        current[segment] = value;
      }
      return;
    }

    const nextSegment = segments[index + 1];
    const currentValue = Array.isArray(current)
      ? (isArrayIndex(segment) ? current[Number(segment)] : undefined)
      : current[segment];
    const nextContainer = Array.isArray(currentValue) || isRecord(currentValue)
      ? currentValue
      : isArrayIndex(nextSegment) ? [] : {};

    if (Array.isArray(current)) {
      if (!isArrayIndex(segment)) throw new Error(t('pageState.errors.invalidPath'));
      current[Number(segment)] = nextContainer;
    } else {
      current[segment] = nextContainer;
    }
    current = nextContainer;
  });
}

function currentValue() {
  return cloneJsonValue(state.value);
}

function methodFailure(message: string): StateMethodResult {
  return {
    ok: false,
    value: currentValue(),
    message
  };
}

function writableFailure() {
  return normalized.value.readonly ? methodFailure(t('pageState.errors.readonly')) : null;
}

function notifyChange(payload: StateChangePayload, event: 'change' | 'clear' = 'change') {
  if (props.currentBlockId) {
    previewRuntime?.notifyBlockDataChange(props.currentBlockId);
  }
  if (event === 'clear') {
    emit('clear', payload);
    return;
  }
  emit('change', payload);
}

function commit(nextState: Record<string, unknown>, payload: Omit<StateChangePayload, 'value'> = {}) {
  state.value = nextState;
  const value = currentValue();
  notifyChange({ value, ...payload });
  return { ok: true, value } satisfies StateMethodResult;
}

function getData() {
  return currentValue();
}

function getValue(invocation?: BlockMethodInvocation | { path?: string }) {
  const parsedPath = parsePath(readInvocationValue(invocation, 'path'));
  if (!parsedPath.ok) {
    throw new Error(parsedPath.message);
  }

  return cloneRuntimeValue(readPathValue(state.value, parsedPath.segments));
}

function setValue(invocation?: BlockMethodInvocation | { path?: string; value?: unknown }) {
  const readonlyResult = writableFailure();
  if (readonlyResult) return readonlyResult;

  const parsedPath = parsePath(readInvocationValue(invocation, 'path'));
  if (!parsedPath.ok) return methodFailure(parsedPath.message);

  const inputValue = readInvocationValue(invocation, 'value');
  let nextValue: unknown;
  try {
    nextValue = cloneJsonValue(inputValue);
  } catch {
    return methodFailure(t('pageState.errors.invalidValue'));
  }

  if (!parsedPath.segments.length) {
    if (!isRecord(nextValue)) return methodFailure(t('pageState.errors.objectRequired'));
    return commit(nextValue, { oldValue: currentValue() });
  }

  const nextState = currentValue();
  const oldValue = cloneRuntimeValue(readPathValue(nextState, parsedPath.segments));
  try {
    setPathValue(nextState, parsedPath.segments, nextValue);
  } catch (error) {
    return methodFailure(error instanceof Error ? error.message : t('pageState.errors.invalidPath'));
  }
  return commit(nextState, {
    path: parsedPath.path,
    ...(oldValue === undefined ? {} : { oldValue })
  });
}

function merge(invocation?: BlockMethodInvocation | { value?: unknown }) {
  const readonlyResult = writableFailure();
  if (readonlyResult) return readonlyResult;

  const inputValue = readInvocationValue(invocation, 'value');
  if (!isRecord(inputValue)) return methodFailure(t('pageState.errors.objectRequired'));

  let patch: Record<string, unknown>;
  try {
    patch = cloneJsonValue(inputValue);
  } catch {
    return methodFailure(t('pageState.errors.invalidValue'));
  }

  const oldValue = currentValue();
  return commit({ ...oldValue, ...patch }, { oldValue });
}

function append(invocation?: BlockMethodInvocation | { path?: string; value?: unknown }) {
  const readonlyResult = writableFailure();
  if (readonlyResult) return readonlyResult;

  const parsedPath = parsePath(readInvocationValue(invocation, 'path'), true);
  if (!parsedPath.ok) return methodFailure(parsedPath.message);

  let item: unknown;
  try {
    item = cloneJsonValue(readInvocationValue(invocation, 'value'));
  } catch {
    return methodFailure(t('pageState.errors.invalidValue'));
  }

  const nextState = currentValue();
  const currentArray = readPathValue(nextState, parsedPath.segments);
  const oldValue = Array.isArray(currentArray) ? cloneJsonValue(currentArray) : currentArray;
  try {
    setPathValue(nextState, parsedPath.segments, [
      ...(Array.isArray(currentArray) ? currentArray : []),
      item
    ]);
  } catch (error) {
    return methodFailure(error instanceof Error ? error.message : t('pageState.errors.invalidPath'));
  }
  return commit(nextState, {
    path: parsedPath.path,
    ...(oldValue === undefined ? {} : { oldValue: cloneRuntimeValue(oldValue) })
  });
}

function clear() {
  const readonlyResult = writableFailure();
  if (readonlyResult) return readonlyResult;

  const oldValue = currentValue();
  state.value = normalizeInitialState(props.initialState);
  const value = currentValue();
  const payload = { value, oldValue };
  notifyChange(payload);
  emit('clear', payload);
  return { ok: true, value } satisfies StateMethodResult;
}

defineExpose({
  getData,
  getValue,
  setValue,
  merge,
  append,
  clear
});

watch(
  () => props.initialState,
  (value) => {
    if (props.edit) {
      state.value = normalizeInitialState(value);
    }
  },
  { deep: true }
);
</script>

<template>
  <PageDslBlock v-if="shouldRender" block-type="MPageState">
    <section class="m-page-state" data-testid="m-page-state" :aria-label="normalized.debugLabel">
      <header class="m-page-state__header">
        <strong class="m-page-state__label">{{ normalized.debugLabel }}</strong>
        <span class="m-page-state__meta">{{ keyCountLabel }}</span>
        <span v-if="normalized.readonly" class="m-page-state__badge" data-testid="m-page-state-readonly">{{ t('pageState.readonly') }}</span>
      </header>
      <pre class="m-page-state__json" data-testid="m-page-state-json">{{ prettyState }}</pre>
    </section>
  </PageDslBlock>
</template>

<style scoped>
.m-page-state {
  display: grid;
  gap: 8px;
  width: 100%;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
  padding: 12px;
}

.m-page-state__header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.m-page-state__label {
  min-width: 0;
  overflow-wrap: anywhere;
  color: rgb(15 23 42);
  font-size: 13px;
  line-height: 18px;
}

.m-page-state__meta,
.m-page-state__badge {
  flex: none;
  color: rgb(71 85 105);
  font-size: 12px;
  line-height: 18px;
}

.m-page-state__badge {
  margin-left: auto;
  border: 1px solid rgb(148 163 184);
  border-radius: 4px;
  padding: 0 6px;
}

.m-page-state__json {
  max-height: 120px;
  margin: 0;
  overflow: auto;
  border-top: 1px solid rgb(226 232 240);
  color: rgb(51 65 85);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 18px;
  padding-top: 8px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.dark .m-page-state {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

.dark .m-page-state__label {
  color: rgb(241 245 249);
}

.dark .m-page-state__meta,
.dark .m-page-state__badge,
.dark .m-page-state__json {
  color: rgb(203 213 225);
}

.dark .m-page-state__json {
  border-top-color: rgb(51 65 85);
}
</style>
