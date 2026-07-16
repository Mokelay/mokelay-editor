import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MJsonEditor",
 *   "displayName": "JSON 编辑器",
 *   "category": "content",
 *   "description": "页面 DSL 的多行 JSON 文本编辑器。它保留原始文本，同时向变量和 action 暴露解析值、对象型 layoutJson、校验状态与错误；支持运行时 setValue/clear/format、根节点类型约束、只读模式及 JSON Schema 元信息。schema 在 v1 仅供描述和 AI 上下文使用，不执行关键字级 Schema 校验。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MJsonEditor",
 *     "toolSymbol": "mJsonEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 80
 *   },
 *   "toolbox": {
 *     "title": "JSON 编辑器",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M8 7 5 12l3 5M16 7l3 5-3 5M13 5l-2 14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "JSON",
 *     "value": {},
 *     "placeholder": "{\n  \"schemaVersion\": 1\n}",
 *     "rows": 18,
 *     "readonly": false,
 *     "requireObject": true,
 *     "allowArray": false
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text",
 *       "defaultValue": "JSON",
 *       "description": "编辑器上方显示的字段标题。"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 值",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "defaultValue": {},
 *       "description": "初始 JSON 值。非 string 值按两空格缩进序列化；string 被视为待编辑的原始 JSON 文本。",
 *       "validationMessage": "请输入有效 JSON。"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行数",
 *       "type": "text",
 *       "defaultValue": 18,
 *       "description": "textarea rows；渲染时非有限数或小于等于 0 使用默认值 18。"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "禁止用户输入以及 setValue/clear；getData/getJson/getLayoutJson 仍可读取，format 仍可格式化当前有效文本。"
 *     },
 *     {
 *       "key": "placeholder",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "占位提示",
 *       "defaultValue": "{\n  \"schemaVersion\": 1\n}",
 *       "description": "编辑器为空时显示，不参与 JSON 解析。"
 *     },
 *     {
 *       "key": "recordUuid",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "记录 UUID",
 *       "description": "可选显式记录标识；getData 优先返回该值，否则读取对象 JSON 顶层 uuid。"
 *     },
 *     {
 *       "key": "recordName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "记录名称",
 *       "description": "可选显式记录名称；getData 优先返回该值，否则读取对象 JSON 顶层 name。"
 *     },
 *     {
 *       "key": "schema",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON Schema",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "description": "随 DSL 保存并可被外部工具读取的 JSON Schema 元信息。v1 不执行 type、required、properties 等 Schema 关键字校验。",
 *       "validationMessage": "请输入有效 JSON Schema。"
 *     },
 *     {
 *       "key": "requireObject",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "要求根对象",
 *       "type": "checkbox",
 *       "defaultValue": true,
 *       "description": "true 时仅接受非数组 object，优先级高于 allowArray。要允许数组必须设为 false。"
 *     },
 *     {
 *       "key": "allowArray",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "允许根数组",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "仅在 requireObject=false 时生效。false 拒绝数组但允许 JSON 标量；true 允许数组和标量。"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string, layoutJson: object | null, json: unknown, valid: boolean, error: string, recordUuid: string, recordName: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "获取编辑器数据",
 *       "description": "返回原始文本 value、解析结果 json、仅 object 时存在的 layoutJson、valid/error 以及记录标识。无效 JSON 不抛错，而是返回 json=null、layoutJson=null 和 valid=false。"
 *     },
 *     {
 *       "name": "getJson",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "strict",
 *           "optional": true,
 *           "type": "boolean",
 *           "description": "默认 true；传 false 时 JSON 语法或根节点校验失败返回 null，不抛出异常。支持直接字段、args.strict 或 inputs.strict。"
 *         }
 *       ],
 *       "returns": "unknown | null",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "获取 JSON",
 *       "description": "解析并深拷贝返回当前 JSON，可返回对象、数组或标量；会遵守 requireObject 和 allowArray。strict=true 时失败会更新可见错误并抛出 Error。"
 *     },
 *     {
 *       "name": "getLayoutJson",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "patch",
 *           "optional": true,
 *           "type": "Record<string, unknown>",
 *           "description": "可选对象补丁，支持直接字段、args.patch 或 inputs.patch，会浅合并到解析出的对象 JSON；非 object 补丁按 {} 处理。"
 *         }
 *       ],
 *       "returns": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "获取布局 JSON",
 *       "description": "严格要求当前 JSON 为对象，解析失败或根节点不是对象时更新可见错误并抛出 Error；返回值不会修改编辑器文本。"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "value",
 *           "optional": true,
 *           "type": "unknown",
 *           "description": "支持直接传入 JSON 值或原始文本字符串，或传入 { args: { value } } / { inputs: { value } }。readonly=true 时抛出 Error。"
 *         }
 *       ],
 *       "returns": "{ value: string, layoutJson: object | null, json: unknown, valid: boolean, error: string, recordUuid: string, recordName: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "设置 JSON",
 *       "description": "把非 string 值格式化为 JSON 文本，写入编辑器、刷新语法和根节点校验、同步 onChange/onToolChange，并通知 PreviewBlockRuntime。方法返回完整 getData 结果，即使写入内容无效也不抛错。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string, layoutJson: object | null, json: unknown, valid: boolean, error: string, recordUuid: string, recordName: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "清空 JSON",
 *       "description": "将编辑器重置为默认空对象 {}，触发校验和运行时通知；readonly=true 时抛出 Error。"
 *     },
 *     {
 *       "name": "format",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "label": "格式化 JSON",
 *       "description": "语法和根节点校验通过后把当前 JSON 文本格式化为两空格缩进并通知运行时；失败时更新可见错误并抛出 Error。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "JSON 对象",
 *       "variable": "layoutJson",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "description": "当前文本解析成功且根值为 object 时返回；否则为 null。"
 *     },
 *     {
 *       "label": "记录 UUID",
 *       "variable": "recordUuid",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "记录名称",
 *       "variable": "recordName",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     },
 *     {
 *       "label": "校验状态",
 *       "variable": "valid",
 *       "dataType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MJsonEditor.vue"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存标题、JSON 值、占位提示和行数；readonly、recordUuid、recordName、schema、requireObject、allowArray 只在有值或偏离默认值时写入 EditorJS block.data。"
 *     },
 *     {
 *       "key": "schemaMetadataOnly",
 *       "type": "behavior",
 *       "description": "schema 会深拷贝保存，但组件 v1 只执行 JSON.parse 与根节点类型校验，不把 schema 交给 JSON Schema validator。"
 *     },
 *     {
 *       "key": "rootValidation",
 *       "type": "validation",
 *       "description": "requireObject=true 时只允许 object；requireObject=false 且 allowArray=false 时拒绝数组；两者分别为 false/true 时接受所有合法 JSON 根类型。"
 *     },
 *     {
 *       "key": "runtimeNotification",
 *       "type": "behavior",
 *       "description": "用户输入、setValue、clear、format 和外部 props.value 变化都会使 blocks[blockId] 变量依赖重新求值。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MJsonEditor-example",
 *       "type": "MJsonEditor",
 *       "data": {
 *         "label": "JSON",
 *         "value": {},
 *         "placeholder": "{\n  \"schemaVersion\": 1\n}",
 *         "rows": 18,
 *         "readonly": false,
 *         "requireObject": true,
 *         "allowArray": false
 *       }
 *     },
 *     {
 *       "id": "MJsonEditor-ai-chat-request-example",
 *       "type": "MJsonEditor",
 *       "data": {
 *         "label": "AI DSL 请求 JSON",
 *         "value": {
 *           "requirementDocument": "生成一个 CRM：包括客户管理，列表，添加，修改，删除",
 *           "projectContext": { "app": "crm", "datasource": "Mokelay" }
 *         },
 *         "placeholder": "{\n  \"requirementDocument\": \"...\"\n}",
 *         "rows": 24,
 *         "readonly": false,
 *         "schema": {
 *           "type": "object",
 *           "required": [
 *             "requirementDocument"
 *           ],
 *           "properties": {
 *             "requirementDocument": {
 *               "type": "string"
 *             },
 *             "projectContext": { "type": "object" }
 *           }
 *         },
 *         "requireObject": true,
 *         "allowArray": false
 *       }
 *     },
 *     {
 *       "id": "MJsonEditor-readonly-response-example",
 *       "type": "MJsonEditor",
 *       "data": {
 *         "label": "响应 JSON",
 *         "value": { "status": "complete", "pages": [], "apis": [] },
 *         "rows": 18,
 *         "readonly": true,
 *         "requireObject": true,
 *         "allowArray": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MJsonEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mJsonEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mJsonEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
