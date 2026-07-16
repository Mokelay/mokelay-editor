import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MHeading",
 *   "displayName": "页面标题",
 *   "category": "content",
 *   "description": "页面标题 Block，支持标题文字、级别、对齐和样式配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MHeading",
 *     "toolSymbol": "mHeadingEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 210
 *   },
 *   "toolbox": {
 *     "title": "页面标题",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 6h14M5 12h10M5 18h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "text": "页面标题",
 *     "level": "1",
 *     "align": "left"
 *   },
 *   "properties": [
 *     {
 *       "key": "text",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "line": 51,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题文本",
 *       "type": "text"
 *     },
 *     {
 *       "key": "level",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "line": 52,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "级别",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "1",
 *           "label": "一级标题"
 *         },
 *         {
 *           "value": "2",
 *           "label": "二级标题"
 *         },
 *         {
 *           "value": "3",
 *           "label": "三级标题"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "PageDslAlign | string",
 *       "source": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "line": 62,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "对齐",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "left",
 *           "label": "左对齐"
 *         },
 *         {
 *           "value": "center",
 *           "label": "居中"
 *         },
 *         {
 *           "value": "right",
 *           "label": "右对齐"
 *         }
 *       ]
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
 *       "id": "MHeading-example",
 *       "type": "MHeading",
 *       "data": {
 *         "text": "页面标题",
 *         "level": "1",
 *         "align": "left"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MHeading.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mHeadingEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mHeadingEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
