<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { valueBlockDataField } from '@/blocks/blockDataFields';
import { booleanValue, normalizeValue, numberValue, stringValue } from '@/blocks/pageDslEditorTools';
import type { BlockDataField } from '@/utils/variableValue';

export interface MJsonEditorProps {
  edit: boolean;
  currentBlockId?: string;
  label?: string;
  value?: unknown;
  placeholder?: string;
  rows?: number;
  readonly?: boolean;
  recordUuid?: string;
  recordName?: string;
  schema?: Record<string, unknown>;
  requireObject?: boolean;
  allowArray?: boolean;
}

const jsonEditorDefaults = {
  label: 'JSON',
  value: {},
  placeholder: '{\n  \"schemaVersion\": 1\n}',
  rows: 18,
  readonly: false,
  requireObject: true,
  allowArray: false
} as const;

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function formatJsonValue(value: unknown) {
  if (typeof value === 'string') return value;
  if (value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function normalizeJsonEditorProps(props: Partial<MJsonEditorProps>): MJsonEditorProps {
  const merged = {
    ...jsonEditorDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    label: stringValue(merged.label, jsonEditorDefaults.label),
    value: normalizeValue(merged.value, jsonEditorDefaults.value),
    placeholder: stringValue(merged.placeholder, jsonEditorDefaults.placeholder),
    rows: numberValue(merged.rows, jsonEditorDefaults.rows),
    readonly: booleanValue(merged.readonly, jsonEditorDefaults.readonly),
    recordUuid: stringValue(merged.recordUuid),
    recordName: stringValue(merged.recordName),
    schema: typeof merged.schema === 'object' && merged.schema !== null && !Array.isArray(merged.schema)
      ? cloneValue(merged.schema as Record<string, unknown>)
      : undefined,
    requireObject: booleanValue(merged.requireObject, jsonEditorDefaults.requireObject),
    allowArray: booleanValue(merged.allowArray, jsonEditorDefaults.allowArray)
  };
}

function getJsonEditorDataFields(): BlockDataField[] {
  return [
    ...valueBlockDataField('string'),
    {
      label: 'JSON 对象',
      variable: 'layoutJson',
      dataType: 'object'
    },
    {
      label: '记录 UUID',
      variable: 'recordUuid',
      dataType: 'string'
    },
    {
      label: '记录名称',
      variable: 'recordName',
      dataType: 'string'
    },
    {
      label: '校验状态',
      variable: 'valid',
      dataType: 'boolean'
    }
  ];
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MJsonEditor",
 *     "toolSymbol": "mJsonEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 80
 *   },
 *   "toolbox": {
 *     "title": "JSON 编辑器",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M8 7 5 12l3 5M16 7l3 5-3 5M13 5l-2 14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "JSON",
 *     "value": {},
 *     "placeholder": "{\n  \"schemaVersion\": 1\n}",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "占位提示",
 *       "defaultValue": "{\n  \"schemaVersion\": 1\n}",
 *       "description": "编辑器为空时显示，不参与 JSON 解析。"
 *     },
 *     {
 *       "key": "recordUuid",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "记录 UUID",
 *       "description": "可选显式记录标识；getData 优先返回该值，否则读取对象 JSON 顶层 uuid。"
 *     },
 *     {
 *       "key": "recordName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "记录名称",
 *       "description": "可选显式记录名称；getData 优先返回该值，否则读取对象 JSON 顶层 name。"
 *     },
 *     {
 *       "key": "schema",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "label": "设置 JSON",
 *       "description": "把非 string 值格式化为 JSON 文本，写入编辑器、刷新语法和根节点校验、同步 onChange/onToolChange，并通知 PreviewBlockRuntime。方法返回完整 getData 结果，即使写入内容无效也不抛错。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string, layoutJson: object | null, json: unknown, valid: boolean, error: string, recordUuid: string, recordName: string }",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "label": "清空 JSON",
 *       "description": "将编辑器重置为默认空对象 {}，触发校验和运行时通知；readonly=true 时抛出 Error。"
 *     },
 *     {
 *       "name": "format",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string }",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "label": "格式化 JSON",
 *       "description": "语法和根节点校验通过后把当前 JSON 文本格式化为两空格缩进并通知运行时；失败时更新可见错误并抛出 Error。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "JSON 对象",
 *       "variable": "layoutJson",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "description": "当前文本解析成功且根值为 object 时返回；否则为 null。"
 *     },
 *     {
 *       "label": "记录 UUID",
 *       "variable": "recordUuid",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "记录名称",
 *       "variable": "recordName",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "校验状态",
 *       "variable": "valid",
 *       "dataType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue"
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
 *         "placeholder": "{\n  \"schemaVersion\": 1\n}",
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
 *         "placeholder": "{\n  \"requirementDocument\": \"...\"\n}",
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
 *       "file": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mJsonEditorTool = defineEditorTool<MJsonEditorProps>({
  getDataFields: () => getJsonEditorDataFields(),
  normalizeProps: normalizeJsonEditorProps,
  serialize: (props) => {
    const normalized = normalizeJsonEditorProps(props);
    return {
      label: normalized.label,
      value: cloneValue(normalized.value),
      placeholder: normalized.placeholder,
      rows: normalized.rows,
      ...(normalized.readonly ? { readonly: true } : {}),
      ...(normalized.recordUuid ? { recordUuid: normalized.recordUuid } : {}),
      ...(normalized.recordName ? { recordName: normalized.recordName } : {}),
      ...(normalized.schema ? { schema: cloneValue(normalized.schema) } : {}),
      ...(normalized.requireObject !== jsonEditorDefaults.requireObject ? { requireObject: normalized.requireObject } : {}),
      ...(normalized.allowArray !== jsonEditorDefaults.allowArray ? { allowArray: normalized.allowArray } : {})
    };
  }
});
</script>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import {
  PreviewBlockRuntimeKey,
  type BlockMethodInvocation
} from '@/utils/previewBlockRuntime';

const props = defineProps<MJsonEditorProps & {
  onChange?: (payload: MJsonEditorProps) => void;
  onToolChange?: (payload: MJsonEditorProps) => void;
}>();

const previewRuntime = inject(PreviewBlockRuntimeKey, null);
const editorText = ref(formatJsonValue(props.value));
const validationError = ref('');
const editorRows = computed(() => {
  const rows = Number(props.rows);
  return Number.isFinite(rows) && rows > 0 ? rows : jsonEditorDefaults.rows;
});
const editorLabel = computed(() => props.label || jsonEditorDefaults.label);
const editorPlaceholder = computed(() => props.placeholder || jsonEditorDefaults.placeholder);
const requiresObjectRoot = computed(() => props.requireObject !== false);
const allowsArrayRoot = computed(() => props.allowArray === true);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rootValidationError(value: unknown) {
  if (requiresObjectRoot.value && !isRecord(value)) {
    return 'JSON 必须是对象。';
  }

  if (Array.isArray(value) && !allowsArrayRoot.value) {
    return 'JSON 不允许使用数组作为根节点。';
  }

  return '';
}

function parseEditorText(reportError: boolean) {
  try {
    const parsed = JSON.parse(editorText.value) as unknown;
    const rootError = rootValidationError(parsed);
    if (rootError) {
      throw new Error(rootError);
    }
    if (reportError) {
      validationError.value = '';
    }
    return {
      ok: true as const,
      value: parsed
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON 无效。';
    if (reportError) {
      validationError.value = message;
    }
    return {
      ok: false as const,
      error: message
    };
  }
}

function normalizePatch(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function emitChange() {
  const payload = normalizeJsonEditorProps({
    edit: props.edit,
    currentBlockId: props.currentBlockId,
    label: props.label,
    value: editorText.value,
    placeholder: props.placeholder,
    rows: props.rows,
    readonly: props.readonly,
    recordUuid: props.recordUuid,
    recordName: props.recordName,
    schema: props.schema,
    requireObject: props.requireObject,
    allowArray: props.allowArray
  });
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  if (props.currentBlockId) {
    previewRuntime?.notifyBlockDataChange(props.currentBlockId);
  }
}

function handleInput(event: Event) {
  editorText.value = (event.target as HTMLTextAreaElement).value;
  parseEditorText(true);
  emitChange();
}

function getData() {
  const parsed = parseEditorText(false);
  const json = parsed.ok ? parsed.value : null;
  const objectJson = isRecord(json) ? json : null;

  return {
    value: editorText.value,
    layoutJson: objectJson,
    json,
    valid: parsed.ok,
    error: parsed.ok ? '' : parsed.error || validationError.value || 'JSON 无效。',
    recordUuid: props.recordUuid || readString(objectJson?.uuid),
    recordName: props.recordName || readString(objectJson?.name)
  };
}

function getLayoutJson(invocation?: BlockMethodInvocation) {
  const parsed = parseEditorText(true);
  if (!parsed.ok) {
    throw new Error(validationError.value || 'JSON 无效。');
  }

  if (!isRecord(parsed.value)) {
    validationError.value = 'JSON 必须是对象。';
    throw new Error(validationError.value);
  }

  return {
    ...parsed.value,
    ...normalizePatch(readInvocationValue(invocation, 'patch'))
  };
}

function getJson(invocation?: BlockMethodInvocation) {
  const parsed = parseEditorText(true);
  const strictValue = readInvocationValue(invocation, 'strict');
  const strict = strictValue === undefined ? true : strictValue !== false;

  if (!parsed.ok) {
    if (!strict) return null;
    throw new Error(validationError.value || parsed.error || 'JSON 无效。');
  }

  return cloneValue(parsed.value);
}

function readInvocationValue(invocation: unknown, key: string) {
  if (!isRecord(invocation)) return undefined;

  if (isRecord(invocation.args) && Object.prototype.hasOwnProperty.call(invocation.args, key)) {
    return invocation.args[key];
  }

  if (isRecord(invocation.inputs) && Object.prototype.hasOwnProperty.call(invocation.inputs, key)) {
    return invocation.inputs[key];
  }

  if (Object.prototype.hasOwnProperty.call(invocation, key)) {
    return invocation[key];
  }

  return undefined;
}

function readSetValueInput(invocation: unknown) {
  if (!isRecord(invocation)) return invocation;

  if (isRecord(invocation.args) && Object.prototype.hasOwnProperty.call(invocation.args, 'value')) {
    return invocation.args.value;
  }

  if (isRecord(invocation.inputs) && Object.prototype.hasOwnProperty.call(invocation.inputs, 'value')) {
    return invocation.inputs.value;
  }

  return invocation;
}

function ensureWritable() {
  if (props.readonly) {
    throw new Error('JSON 编辑器为只读状态，不能修改。');
  }
}

function setEditorText(value: unknown) {
  editorText.value = formatJsonValue(value);
  parseEditorText(true);
  emitChange();
  return getData();
}

function setValue(invocation?: unknown) {
  ensureWritable();
  return setEditorText(readSetValueInput(invocation));
}

function clear() {
  ensureWritable();
  return setEditorText(jsonEditorDefaults.value);
}

function format() {
  const parsed = parseEditorText(true);
  if (!parsed.ok) {
    throw new Error(validationError.value || parsed.error || 'JSON 无效。');
  }

  editorText.value = formatJsonValue(parsed.value);
  emitChange();
  return {
    value: editorText.value
  };
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

defineExpose({
  getData,
  getJson,
  getLayoutJson,
  setValue,
  clear,
  format
});

watch(
  () => props.value,
  (value) => {
    const nextText = formatJsonValue(value);
    if (nextText !== editorText.value) {
      editorText.value = nextText;
      validationError.value = '';
      if (props.currentBlockId) {
        previewRuntime?.notifyBlockDataChange(props.currentBlockId);
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <PageDslBlock block-type="MJsonEditor">
    <div class="m-json-editor" data-testid="m-json-editor">
      <label class="m-json-editor__label">
        <span class="m-json-editor__title">{{ editorLabel }}</span>
        <textarea
          data-testid="m-json-editor-control"
          class="m-json-editor__control"
          spellcheck="false"
          :readonly="readonly"
          :rows="editorRows"
          :placeholder="editorPlaceholder"
          :value="editorText"
          @input="handleInput"
        ></textarea>
      </label>
      <p v-if="validationError" data-testid="m-json-editor-error" class="m-json-editor__error">{{ validationError }}</p>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.m-json-editor {
  display: grid;
  gap: 8px;
  width: 100%;
}

.m-json-editor__label {
  display: grid;
  gap: 8px;
}

.m-json-editor__title {
  color: rgb(51 65 85);
  font-size: 14px;
  font-weight: 700;
}

.m-json-editor__control {
  width: 100%;
  min-height: 320px;
  resize: vertical;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 18px;
  padding: 10px 12px;
  tab-size: 2;
}

.m-json-editor__control:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.14);
}

.m-json-editor__control:read-only {
  background: rgb(248 250 252);
  color: rgb(71 85 105);
}

.m-json-editor__error {
  margin: 0;
  border: 1px solid rgb(251 191 36 / 0.62);
  border-radius: 8px;
  background: rgb(254 243 199 / 0.74);
  color: rgb(146 64 14);
  font-size: 13px;
  line-height: 18px;
  padding: 8px 10px;
}

.dark .m-json-editor__title {
  color: rgb(226 232 240);
}

.dark .m-json-editor__control {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .m-json-editor__control:read-only {
  background: rgb(15 23 42 / 0.7);
  color: rgb(148 163 184);
}

.dark .m-json-editor__error {
  border-color: rgb(180 83 9 / 0.72);
  background: rgb(146 64 14 / 0.22);
  color: rgb(254 215 170);
}
</style>
