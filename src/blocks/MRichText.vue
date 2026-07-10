<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { stringValue } from '@/blocks/pageDslEditorTools';

export interface MRichTextProps {
  edit: boolean;
  content?: string;
}

const richTextDefaults = {
  content: '这里填写说明内容。'
} as const;

function normalizeRichTextProps(props: Partial<MRichTextProps>): MRichTextProps {
  const merged = {
    ...richTextDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    content: stringValue(merged.content)
  };
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MRichText",
 *     "toolSymbol": "mRichTextEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 220
 *   },
 *   "toolbox": {
 *     "title": "富文本",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 6h14M5 12h10M5 18h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "content": "这里填写说明内容。"
 *   },
 *   "properties": [
 *     {
 *       "key": "content",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MRichText.vue",
 *       "line": 36,
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
 *       "file": "submodule/mokelay-editor/src/blocks/MRichText.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MRichText.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRichTextEditorTool = defineEditorTool<MRichTextProps>({
  normalizeProps: normalizeRichTextProps,
  serialize: (props) => {
    const normalized = normalizeRichTextProps(props);
    return {
      content: normalized.content
    };
  }
});
</script>

<script setup lang="ts">
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

defineProps<MRichTextProps & PageDslCallbacks<MRichTextProps>>();
</script>

<template>
  <PageDslBlock block-type="MRichText">
    <div class="page-dsl-rich-text">
      {{ content || '这里填写说明内容。' }}
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-rich-text {
  white-space: pre-line;
  color: rgb(71 85 105);
  font-size: 14px;
  line-height: 1.75;
}

.dark .page-dsl-rich-text {
  color: rgb(203 213 225);
}
</style>
