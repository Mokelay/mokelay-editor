<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { normalizeValue, numberValue, stringValue } from '@/blocks/pageDslEditorTools';
import { valueBlockDataField } from '@/blocks/blockDataFields';

export interface MRatingFieldProps {
  edit: boolean;
  value?: unknown;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

const ratingFieldDefaults = {
  value: '',
  max: 5,
  lowLabel: '不满意',
  highLabel: '非常满意'
} as const;

function normalizeRatingFieldProps(props: Partial<MRatingFieldProps>): MRatingFieldProps {
  const merged = {
    ...ratingFieldDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    value: normalizeValue(merged.value, ratingFieldDefaults.value),
    max: numberValue(merged.max, ratingFieldDefaults.max),
    lowLabel: stringValue(merged.lowLabel),
    highLabel: stringValue(merged.highLabel)
  };
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MRatingField",
 *     "toolSymbol": "mRatingFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 370
 *   },
 *   "toolbox": {
 *     "title": "评分",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
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
 *       "source": "submodule/mokelay-editor/src/blocks/MRatingField.vue",
 *       "line": 15,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text"
 *     },
 *     {
 *       "key": "max",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MRatingField.vue",
 *       "line": 53,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最高分",
 *       "type": "text"
 *     },
 *     {
 *       "key": "lowLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MRatingField.vue",
 *       "line": 53,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "低分文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "highLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MRatingField.vue",
 *       "line": 53,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MRatingField.vue"
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
 *       "file": "submodule/mokelay-editor/src/blocks/MRatingField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MRatingField.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRatingFieldEditorTool = defineEditorTool<MRatingFieldProps>({
  getDataFields: () => valueBlockDataField('number'),
  normalizeProps: normalizeRatingFieldProps,
  serialize: (props) => {
    const normalized = normalizeRatingFieldProps(props);
    return {
      value: normalized.value,
      max: normalized.max,
      lowLabel: normalized.lowLabel,
      highLabel: normalized.highLabel
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MRatingFieldProps & PageDslCallbacks<MRatingFieldProps>>();

const ratingMax = computed(() => Math.max(2, Number(props.max || 5)));
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});

function emitChange(payload: Partial<MRatingFieldProps>) {
  const nextPayload = normalizeRatingFieldProps({
    edit: props.edit,
    value: props.value,
    max: props.max,
    lowLabel: props.lowLabel,
    highLabel: props.highLabel,
    ...payload
  });
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}
</script>

<template>
  <PageDslBlock block-type="MRatingField">
    <div class="page-dsl-field">
      <div class="page-dsl-rating">
        <small>{{ lowLabel }}</small>
        <button
          v-for="item in ratingMax"
          :key="item"
          type="button"
          :class="{ 'page-dsl-choice-button--active': Number(stringInputValue) === item }"
          @click="emitChange({ value: String(item) })"
        >
          {{ item }}
        </button>
        <small>{{ highLabel }}</small>
      </div>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-field {
  display: grid;
  gap: 8px;
}

.page-dsl-rating {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.page-dsl-rating button {
  min-width: 36px;
  height: 36px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font-weight: 700;
}

.page-dsl-rating .page-dsl-choice-button--active {
  border-color: rgb(79 70 229);
  background: rgb(238 242 255);
  color: rgb(67 56 202);
}

.page-dsl-rating small {
  color: rgb(100 116 139);
  font-size: 12px;
}

.dark .page-dsl-rating button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
