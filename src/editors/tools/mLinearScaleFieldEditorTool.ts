import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLinearScaleField",
 *   "displayName": "线性量表",
 *   "category": "form",
 *   "description": "线性量表字段，支持数值范围、刻度标签和表单校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MLinearScaleField",
 *     "toolSymbol": "mLinearScaleFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 380
 *   },
 *   "toolbox": {
 *     "title": "线性量表",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": "",
 *     "min": 0,
 *     "max": 10,
 *     "lowLabel": "完全不会",
 *     "highLabel": "非常愿意"
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "line": 15,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "text"
 *     },
 *     {
 *       "key": "min",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "line": 56,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最低分",
 *       "type": "text"
 *     },
 *     {
 *       "key": "max",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "line": 56,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最高分",
 *       "type": "text"
 *     },
 *     {
 *       "key": "lowLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "line": 56,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "低分文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "highLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "line": 56,
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
 *       "source": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue"
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
 *       "id": "MLinearScaleField-example",
 *       "type": "MLinearScaleField",
 *       "data": {
 *         "value": "",
 *         "min": 0,
 *         "max": 10,
 *         "lowLabel": "完全不会",
 *         "highLabel": "非常愿意"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLinearScaleField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mLinearScaleFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLinearScaleFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
