import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTextareaField",
 *   "displayName": "多行文本",
 *   "category": "form",
 *   "description": "多行文本表单字段，支持行数、占位符、默认值和校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MTextareaField",
 *     "toolSymbol": "mTextareaFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 290
 *   },
 *   "toolbox": {
 *     "title": "多行文本",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": "请输入详细说明",
 *     "value": "",
 *     "rows": 4
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "必填"
 *     },
 *     {
 *       "key": "maxLength",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "最大长度"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "禁用"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "focus",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "label": "聚焦"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTextareaField.vue"
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
 *       "id": "MTextareaField-example",
 *       "type": "MTextareaField",
 *       "data": {
 *         "placeholder": "请输入详细说明",
 *         "value": "",
 *         "rows": 4
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MTextareaField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mTextareaFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTextareaFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
