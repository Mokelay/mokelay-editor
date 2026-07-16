import { defineEditorTool } from "@/editors/editorToolDefinition";

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
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
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
 *       "source": "submodule/mokelay-components/src/blocks/MImage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图片地址",
 *       "type": "text"
 *     },
 *     {
 *       "key": "alt",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MImage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "替代文本",
 *       "type": "text"
 *     },
 *     {
 *       "key": "caption",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MImage.vue",
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
 *       "file": "submodule/mokelay-components/src/blocks/MImage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mImageEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mImageEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
