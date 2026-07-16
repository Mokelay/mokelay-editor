import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "uuid": "mokelay-editor-MLayoutPreview",
 *   "blockType": "MLayoutPreview",
 *   "displayName": "布局预览",
 *   "category": "layout",
 *   "description": "布局预览，用于在编辑器内以只读方式渲染页面布局，辅助配置和校验区域内容。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MLayoutPreview",
 *     "toolSymbol": "mLayoutPreviewTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 80
 *   },
 *   "toolbox": {
 *     "title": "布局预览",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M3 9h18M8 9v11\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>"
 *   },
 *   "defaultData": {
 *     "layout": {}
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "label": "标题",
 *       "type": "text",
 *       "configurable": true
 *     },
 *     {
 *       "key": "layout",
 *       "label": "布局 JSON",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "validationMessage": "请输入有效布局 JSON。",
 *       "configurable": true
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存 title 和 layout 到 EditorJS block.data。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MLayoutPreview-example",
 *       "type": "MLayoutPreview",
 *       "data": {
 *         "layout": {}
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLayoutPreview.vue",
 *       "reason": "Vue component implementation and editor tool definition"
 *     }
 *   ]
 * }
 */
export const mLayoutPreviewTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
