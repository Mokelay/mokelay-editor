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
}

const jsonEditorDefaults = {
  label: 'JSON',
  value: {},
  placeholder: '{\n  \"schemaVersion\": 1\n}',
  rows: 18,
  readonly: false
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
    recordName: stringValue(merged.recordName)
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
 *   "description": "可编辑 JSON 编辑器，提供格式化、校验和只读模式；用于布局等需要修改 JSON 的 DSL 场景。",
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
 *     "readonly": false
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 103,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 104,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 值",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "validationMessage": "请输入有效 JSON。"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 105,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 106,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 18,
 *       "declaredInProps": true,
 *       "configurable": false
 *     },
 *     {
 *       "key": "recordUuid",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 21,
 *       "declaredInProps": true,
 *       "configurable": false
 *     },
 *     {
 *       "key": "recordName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 22,
 *       "declaredInProps": true,
 *       "configurable": false
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
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 233
 *     },
 *     {
 *       "name": "getLayoutJson",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 234
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
 *       "label": {
 *         "raw": "'JSON 对象'",
 *         "zh": "JSON 对象",
 *         "en": "JSON 对象"
 *       },
 *       "variable": "layoutJson",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 70
 *     },
 *     {
 *       "label": {
 *         "raw": "'记录 UUID'",
 *         "zh": "记录 UUID",
 *         "en": "记录 UUID"
 *       },
 *       "variable": "recordUuid",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 75
 *     },
 *     {
 *       "label": {
 *         "raw": "'记录名称'",
 *         "zh": "记录名称",
 *         "en": "记录名称"
 *       },
 *       "variable": "recordName",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 80
 *     },
 *     {
 *       "label": {
 *         "raw": "'校验状态'",
 *         "zh": "校验状态",
 *         "en": "校验状态"
 *       },
 *       "variable": "valid",
 *       "dataType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MJsonEditor.vue",
 *       "line": 85
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
 *       "id": "MJsonEditor-example",
 *       "type": "MJsonEditor",
 *       "data": {
 *         "label": "JSON",
 *         "value": {},
 *         "placeholder": "{\n  \"schemaVersion\": 1\n}",
 *         "rows": 18,
 *         "readonly": false
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
      ...(normalized.recordName ? { recordName: normalized.recordName } : {})
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

function parseEditorText(reportError: boolean) {
  try {
    const parsed = JSON.parse(editorText.value) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('JSON 必须是对象。');
    }
    if (reportError) {
      validationError.value = '';
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (reportError) {
      validationError.value = error instanceof Error ? error.message : 'JSON 无效。';
    }
    return null;
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
    recordName: props.recordName
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
  const layoutJson = parseEditorText(false);

  return {
    value: editorText.value,
    layoutJson,
    json: layoutJson,
    valid: Boolean(layoutJson),
    error: layoutJson ? '' : validationError.value || 'JSON 无效。',
    recordUuid: props.recordUuid || readString(layoutJson?.uuid),
    recordName: props.recordName || readString(layoutJson?.name)
  };
}

function getLayoutJson(invocation?: BlockMethodInvocation) {
  const layoutJson = parseEditorText(true);
  if (!layoutJson) {
    throw new Error(validationError.value || 'JSON 无效。');
  }

  return {
    ...layoutJson,
    ...normalizePatch(invocation?.inputs?.patch)
  };
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

defineExpose({
  getData,
  getLayoutJson
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
