<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';

export interface MDividerLineProps {
  edit: boolean;
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MDividerLine",
 *   "displayName": "分割线",
 *   "category": "content",
 *   "description": "分割线内容 Block，支持横向分隔的样式、颜色和间距配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MDividerLine",
 *     "toolSymbol": "mDividerLineEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 170
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "分割线",
 *       "en": "Divider"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M4 12h16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {},
 *   "properties": [],
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
 *       "id": "MDividerLine-example",
 *       "type": "MDividerLine",
 *       "data": {}
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MDividerLine.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MDividerLine.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mDividerLineEditorTool = defineEditorTool<MDividerLineProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false
  }),
  serialize: () => ({})
});
</script>

<script setup lang="ts">
defineProps<MDividerLineProps & {
  onChange?: (payload: MDividerLineProps) => void;
  onToolChange?: (payload: MDividerLineProps) => void;
}>();
</script>

<template>
  <div
    class="ce-divider-line-tool"
    data-testid="editor-divider-line-tool"
    role="separator"
    aria-orientation="horizontal"
  >
    <span class="ce-divider-line-tool__line"></span>
  </div>
</template>

<style scoped>
.ce-divider-line-tool {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 32px;
  padding: 8px 0;
}

.ce-divider-line-tool__line {
  display: block;
  width: 100%;
  height: 1px;
  background-color: rgb(203 213 225);
}

.dark .ce-divider-line-tool__line {
  background-color: rgb(71 85 105);
}
</style>
