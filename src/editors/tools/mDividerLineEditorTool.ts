import { defineEditorTool } from "@/editors/editorToolDefinition";

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
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
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
 *       "file": "submodule/mokelay-components/src/blocks/MDividerLine.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mDividerLineEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mDividerLineEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
