<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { booleanValue, createPageDslFieldId, normalizeValue, numberValue, stringValue } from '@/blocks/pageDslEditorTools';

export interface MFileUploadFieldProps {
  edit: boolean;
  id?: string;
  value?: unknown;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
}

const fileUploadFieldDefaults = {
  value: [] as unknown[],
  accept: '.pdf,.doc,.docx',
  multiple: false,
  maxFiles: 1
};

function normalizeFileUploadFieldProps(props: Partial<MFileUploadFieldProps>): MFileUploadFieldProps {
  const merged = {
    ...fileUploadFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    value: normalizeValue(merged.value, fileUploadFieldDefaults.value),
    accept: stringValue(merged.accept),
    multiple: booleanValue(merged.multiple),
    maxFiles: numberValue(merged.maxFiles, fileUploadFieldDefaults.maxFiles)
  };
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MFileUploadField",
 *     "toolSymbol": "mFileUploadFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 300
 *   },
 *   "toolbox": {
 *     "title": "文件上传",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
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
 *       "source": "submodule/mokelay-editor/src/blocks/MFileUploadField.vue",
 *       "line": 17,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MFileUploadField.vue",
 *       "line": 58,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MFileUploadField.vue",
 *       "line": 59,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许多文件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "maxFiles",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MFileUploadField.vue",
 *       "line": 60,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最多文件数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MFileUploadField.vue",
 *       "line": 16,
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
 *       "file": "submodule/mokelay-editor/src/blocks/MFileUploadField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MFileUploadField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFileUploadFieldEditorTool = defineEditorTool<MFileUploadFieldProps>({
  normalizeProps: normalizeFileUploadFieldProps,
  serialize: (props) => {
    const normalized = normalizeFileUploadFieldProps(props);
    return {
      value: normalized.value,
      accept: normalized.accept,
      multiple: normalized.multiple,
      maxFiles: normalized.maxFiles
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MFileUploadFieldProps & PageDslCallbacks<MFileUploadFieldProps>>();

const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || localFieldId);

function emitChange(payload: Partial<MFileUploadFieldProps>) {
  const nextPayload = normalizeFileUploadFieldProps({
    edit: props.edit,
    id: props.id,
    value: props.value,
    accept: props.accept,
    multiple: props.multiple,
    maxFiles: props.maxFiles,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function emitFileValue(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type
  }));
  emitChange({ value: files });
}
</script>

<template>
  <PageDslBlock block-type="MFileUploadField">
    <div class="page-dsl-field">
      <input
        :id="fieldId"
        class="page-dsl-control"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="emitFileValue"
      />
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-field {
  display: grid;
  gap: 8px;
}

.page-dsl-control {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 9px 11px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.page-dsl-control:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.14);
}

.dark .page-dsl-control {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
