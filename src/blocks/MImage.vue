<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { stringValue } from '@/blocks/pageDslEditorTools';

export interface MImageProps {
  edit: boolean;
  src?: string;
  alt?: string;
  caption?: string;
}

const imageDefaults = {
  src: '',
  alt: '图片',
  caption: ''
} as const;

function normalizeImageProps(props: Partial<MImageProps>): MImageProps {
  const merged = {
    ...imageDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    src: stringValue(merged.src),
    alt: stringValue(merged.alt),
    caption: stringValue(merged.caption)
  };
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MImage",
 *     "toolSymbol": "mImageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 230
 *   },
 *   "toolbox": {
 *     "title": "图片",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"m7 16 4-4 3 3 2-2 3 3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
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
 *       "source": "submodule/mokelay-editor/src/blocks/MImage.vue",
 *       "line": 43,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图片地址",
 *       "type": "text"
 *     },
 *     {
 *       "key": "alt",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MImage.vue",
 *       "line": 44,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "替代文本",
 *       "type": "text"
 *     },
 *     {
 *       "key": "caption",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MImage.vue",
 *       "line": 45,
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
 *       "file": "submodule/mokelay-editor/src/blocks/MImage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MImage.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mImageEditorTool = defineEditorTool<MImageProps>({
  normalizeProps: normalizeImageProps,
  serialize: (props) => {
    const normalized = normalizeImageProps(props);
    return {
      src: normalized.src,
      alt: normalized.alt,
      caption: normalized.caption
    };
  }
});
</script>

<script setup lang="ts">
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

defineProps<MImageProps & PageDslCallbacks<MImageProps>>();
</script>

<template>
  <PageDslBlock block-type="MImage">
    <figure class="page-dsl-image">
      <img v-if="src" :src="src" :alt="alt || '图片'" />
      <div v-else class="page-dsl-image__empty">图片</div>
      <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-image {
  margin: 0;
}

.page-dsl-image img {
  display: block;
  width: 100%;
  max-height: 360px;
  border-radius: 8px;
  object-fit: cover;
}

.page-dsl-image__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 1px dashed rgb(148 163 184);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(100 116 139);
  font-size: 13px;
}

.page-dsl-image figcaption {
  margin-top: 6px;
  color: rgb(100 116 139);
  font-size: 12px;
  text-align: center;
}

.dark .page-dsl-image__empty {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}
</style>
