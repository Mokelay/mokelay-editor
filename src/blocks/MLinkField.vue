<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { createPageDslFieldId, normalizeValue, stringValue } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MLinkFieldProps {
  edit: boolean;
  id?: string;
  placeholder?: string;
  value?: unknown;
}

const linkFieldDefaults = {
  placeholder: 'https://example.com',
  value: ''
} as const;

function normalizeLinkFieldProps(props: Partial<MLinkFieldProps>): MLinkFieldProps {
  const merged = {
    ...linkFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    id: stringValue(merged.id),
    placeholder: stringValue(merged.placeholder),
    value: normalizeValue(merged.value, linkFieldDefaults.value)
  };
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MLinkField",
 *     "toolSymbol": "mLinkFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 280
 *   },
 *   "toolbox": {
 *     "title": "网址字段",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
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
 *       "source": "submodule/mokelay-editor/src/blocks/MLinkField.vue",
 *       "line": 16,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MLinkField.vue",
 *       "line": 17,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MLinkField.vue",
 *       "line": 15,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MLinkField.vue"
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
 *       "file": "submodule/mokelay-editor/src/blocks/MLinkField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MLinkField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLinkFieldEditorTool = defineEditorTool<MLinkFieldProps>({
  getDataFields: () => valueBlockDataField('string'),
  normalizeProps: normalizeLinkFieldProps,
  serialize: (props) => {
    const normalized = normalizeLinkFieldProps(props);
    return {
      placeholder: normalized.placeholder,
      value: normalized.value
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MLinkFieldProps & PageDslCallbacks<MLinkFieldProps>>();

const localFieldId = createPageDslFieldId();
const fieldId = computed(() => props.id || localFieldId);
const fieldPlaceholder = computed(() => props.placeholder || '');
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});

function emitChange(payload: Partial<MLinkFieldProps>) {
  const nextPayload = normalizeLinkFieldProps({
    edit: props.edit,
    id: props.id,
    placeholder: props.placeholder,
    value: props.value,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}
</script>

<template>
  <PageDslBlock block-type="MLinkField">
    <div class="page-dsl-field">
      <input
        :id="fieldId"
        class="page-dsl-control"
        type="url"
        :placeholder="fieldPlaceholder"
        :value="stringInputValue"
        @input="emitChange({ value: ($event.target as HTMLInputElement).value })"
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
