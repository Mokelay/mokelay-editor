import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MResultPage",
 *   "displayName": "结果页",
 *   "category": "page",
 *   "description": "结果页，用于表单或流程完成后展示计算结果、说明和后续动作。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MResultPage",
 *     "toolSymbol": "mResultPageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 410
 *   },
 *   "toolbox": {
 *     "title": "结果页",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 6h14v5H5zM5 16h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "你的结果",
 *     "description": "这里展示测验或问卷结果。",
 *     "resultField": "score"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "description",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "说明",
 *       "type": "textarea"
 *     },
 *     {
 *       "key": "resultField",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "结果字段",
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
 *       "id": "MResultPage-example",
 *       "type": "MResultPage",
 *       "data": {
 *         "title": "你的结果",
 *         "description": "这里展示测验或问卷结果。",
 *         "resultField": "score"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MResultPage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mResultPageEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mResultPageEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
