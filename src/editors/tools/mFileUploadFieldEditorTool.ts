import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MFileUploadField",
 *   "displayName": "文件上传",
 *   "category": "form",
 *   "description": "文件上传字段，支持文件选择、上传状态、格式限制和表单值保存。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MFileUploadField",
 *     "toolSymbol": "mFileUploadFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 300
 *   },
 *   "toolbox": {
 *     "title": "文件上传",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": [],
 *     "accept": ".pdf,.doc,.docx",
 *     "multiple": false,
 *     "maxFiles": 1
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "line": 17,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "accept",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "line": 58,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "文件类型",
 *       "type": "text",
 *       "placeholder": ".pdf,.doc,.docx"
 *     },
 *     {
 *       "key": "multiple",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "line": 59,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许多文件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "maxFiles",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "line": 60,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最多文件数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "line": 16,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
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
 *       "id": "MFileUploadField-example",
 *       "type": "MFileUploadField",
 *       "data": {
 *         "value": [],
 *         "accept": ".pdf,.doc,.docx",
 *         "multiple": false,
 *         "maxFiles": 1
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MFileUploadField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mFileUploadFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFileUploadFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
