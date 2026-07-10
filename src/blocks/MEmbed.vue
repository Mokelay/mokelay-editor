<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { stringValue } from '@/blocks/pageDslEditorTools';

export interface MEmbedProps {
  edit: boolean;
  title?: string;
  url?: string;
}

const embedDefaults = {
  title: '外部资料',
  url: 'https://www.mokelay.com/'
} as const;

function normalizeEmbedProps(props: Partial<MEmbedProps>): MEmbedProps {
  const merged = {
    ...embedDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    title: stringValue(merged.title),
    url: stringValue(merged.url)
  };
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MEmbed",
 *     "toolSymbol": "mEmbedEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 240
 *   },
 *   "toolbox": {
 *     "title": "嵌入",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M10 7H7a5 5 0 0 0 0 10h3M14 7h3a5 5 0 0 1 0 10h-3M8 12h8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
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
 *       "source": "submodule/mokelay-editor/src/blocks/MEmbed.vue",
 *       "line": 40,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "url",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MEmbed.vue",
 *       "line": 41,
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
 *       "file": "submodule/mokelay-editor/src/blocks/MEmbed.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MEmbed.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mEmbedEditorTool = defineEditorTool<MEmbedProps>({
  normalizeProps: normalizeEmbedProps,
  serialize: (props) => {
    const normalized = normalizeEmbedProps(props);
    return {
      title: normalized.title,
      url: normalized.url
    };
  }
});
</script>

<script setup lang="ts">
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

defineProps<MEmbedProps & PageDslCallbacks<MEmbedProps>>();
</script>

<template>
  <PageDslBlock block-type="MEmbed">
    <a
      class="page-dsl-embed"
      :href="url || 'https://www.mokelay.com/'"
      target="_blank"
      rel="noreferrer"
    >
      <span>{{ title || '外部资料' }}</span>
      <small>{{ url || 'https://www.mokelay.com/' }}</small>
    </a>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-embed {
  display: block;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 14px;
  color: rgb(15 23 42);
  text-decoration: none;
}

.page-dsl-embed span,
.page-dsl-embed small {
  display: block;
}

.page-dsl-embed span {
  font-weight: 700;
}

.page-dsl-embed small {
  margin-top: 4px;
  color: rgb(100 116 139);
  word-break: break-all;
}

.dark .page-dsl-embed {
  border-color: rgb(51 65 85);
}
</style>
