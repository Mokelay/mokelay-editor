import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MInput",
 *   "displayName": "输入框",
 *   "category": "form",
 *   "description": "输入框，支持标签、占位符、输入类型、禁用状态和受控值。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MInput",
 *     "toolSymbol": "mInputEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 70
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "输入框",
 *       "en": "Input"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" ry=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "placeholder": {
 *       "zh": "请输入.....",
 *       "en": "Please enter..."
 *     },
 *     "value": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 63,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "占位提示",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "请输入.....",
 *         "en": "Please enter..."
 *       }
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 68,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "默认值",
 *       "type": "component",
 *       "placeholder": {
 *         "zh": "请输入默认值",
 *         "en": "Please enter a default value"
 *       },
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 10,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     },
 *     {
 *       "key": "required",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 13,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "必填"
 *     },
 *     {
 *       "key": "maxLength",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 14,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "最大长度"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 15,
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
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 135,
 *       "label": "聚焦"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "line": 136,
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MInput.vue"
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
 *       "id": "MInput-example",
 *       "type": "MInput",
 *       "data": {
 *         "placeholder": {
 *           "zh": "请输入.....",
 *           "en": "Please enter..."
 *         },
 *         "value": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MInput.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mInputEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mInputEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
