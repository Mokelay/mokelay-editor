import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MUploadImport",
 *   "displayName": "上传导入",
 *   "category": "content",
 *   "description": "上传导入 Block，支持文件选择、解析导入、进度、结果汇总和错误反馈。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MUploadImport",
 *     "toolSymbol": "mUploadImportEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 310
 *   },
 *   "toolbox": {
 *     "title": "上传导入",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "mode": "file",
 *     "accept": "",
 *     "multiple": false,
 *     "maxCount": 1,
 *     "maxSizeMB": 20,
 *     "drag": true,
 *     "autoUpload": false,
 *     "uploadAction": [],
 *     "parsePreview": false,
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "mode",
 *       "optional": true,
 *       "tsType": "MUploadImportMode | string",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 210,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "模式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "file",
 *           "label": "普通文件"
 *         },
 *         {
 *           "value": "image",
 *           "label": "图片"
 *         },
 *         {
 *           "value": "excel",
 *           "label": "Excel"
 *         },
 *         {
 *           "value": "csv",
 *           "label": "CSV"
 *         },
 *         {
 *           "value": "batchText",
 *           "label": "批量文本"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "accept",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 211,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "文件类型",
 *       "type": "text",
 *       "placeholder": ".xlsx,.xls,.csv"
 *     },
 *     {
 *       "key": "multiple",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 212,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许多文件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "maxCount",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 213,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "最多文件数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "maxSizeMB",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 214,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "单文件大小 MB",
 *       "type": "text"
 *     },
 *     {
 *       "key": "drag",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 215,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "拖拽上传",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "autoUpload",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 216,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选择后自动上传",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "parsePreview",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 217,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "本地预览",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "template",
 *       "optional": true,
 *       "tsType": "MUploadImportTemplate",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 218,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "模板配置 JSON",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "validationMessage": "请输入有效模板 JSON。"
 *     },
 *     {
 *       "key": "uploadAction",
 *       "optional": true,
 *       "tsType": "ActionConfig[]",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 225,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "上传 Action",
 *       "type": "component",
 *       "component": "MActionEditor"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MUploadImportUploadedFile[]",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 57,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "result",
 *       "optional": true,
 *       "tsType": "MUploadImportResult",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 56,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "结果数据"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "payload: MUploadImportProps & { files: MUploadImportUploadedFile[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 260,
 *       "label": "变更"
 *     },
 *     {
 *       "event": "before-upload",
 *       "payload": "payload: { files: MUploadImportUploadedFile[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 260,
 *       "label": "上传前"
 *     },
 *     {
 *       "event": "upload-progress",
 *       "payload": "payload: { file: MUploadImportUploadedFile; percent: number }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 260,
 *       "label": "上传进度"
 *     },
 *     {
 *       "event": "upload-success",
 *       "payload": "payload: { result: MUploadImportResult; files: MUploadImportUploadedFile[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 260,
 *       "label": "上传成功"
 *     },
 *     {
 *       "event": "upload-error",
 *       "payload": "payload: { error: Error; file?: MUploadImportUploadedFile }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 260,
 *       "label": "上传失败"
 *     },
 *     {
 *       "event": "template-download",
 *       "payload": "payload: { template?: MUploadImportTemplate }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 260,
 *       "label": "下载模板"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "selectFiles",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 825,
 *       "label": "选择文件"
 *     },
 *     {
 *       "name": "upload",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 826,
 *       "label": "上传"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 827,
 *       "label": "清空"
 *     },
 *     {
 *       "name": "removeFile",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 828,
 *       "label": "移除文件"
 *     },
 *     {
 *       "name": "downloadTemplate",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 829,
 *       "label": "下载模板"
 *     },
 *     {
 *       "name": "parseFiles",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 830,
 *       "label": "解析文件"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 831,
 *       "label": "设置值"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 832,
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "'文件列表'",
 *         "zh": "文件列表",
 *         "en": "文件列表"
 *       },
 *       "variable": "files",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 192
 *     },
 *     {
 *       "label": {
 *         "raw": "'URL 列表'",
 *         "zh": "URL 列表",
 *         "en": "URL 列表"
 *       },
 *       "variable": "urls",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 193
 *     },
 *     {
 *       "label": {
 *         "raw": "'上传结果'",
 *         "zh": "上传结果",
 *         "en": "上传结果"
 *       },
 *       "variable": "result",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 194
 *     },
 *     {
 *       "label": {
 *         "raw": "'批量文本'",
 *         "zh": "批量文本",
 *         "en": "批量文本"
 *       },
 *       "variable": "text",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "line": 195
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
 *       "id": "MUploadImport-example",
 *       "type": "MUploadImport",
 *       "data": {
 *         "mode": "file",
 *         "accept": "",
 *         "multiple": false,
 *         "maxCount": 1,
 *         "maxSizeMB": 20,
 *         "drag": true,
 *         "autoUpload": false,
 *         "uploadAction": [],
 *         "parsePreview": false,
 *         "value": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MUploadImport.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mUploadImportEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mUploadImportEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
