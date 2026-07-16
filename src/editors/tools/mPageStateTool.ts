import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MPageState",
 *   "displayName": "页面状态",
 *   "category": "state",
 *   "description": "页面级、内存态 JSON 状态容器。它把复杂页面的临时状态从专用 Vue 组件下沉到 DSL，向 action graph 和模板变量暴露读取、路径写入、根级浅合并、数组追加和恢复初始值能力；运行态不会持久化到 DSL、数据库或其他页面。编辑态显示调试摘要，预览态默认不占视觉空间。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MPageState",
 *     "toolSymbol": "mPageStateTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 90
 *   },
 *   "toolbox": {
 *     "title": "页面状态",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 7c0-1.1 3.1-2 7-2s7 .9 7 2-3.1 2-7 2-7-.9-7-2Zm0 0v5c0 1.1 3.1 2 7 2s7-.9 7-2V7m-14 5v5c0 1.1 3.1 2 7 2s7-.9 7-2v-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "initialState": {},
 *     "visibleInPreview": false,
 *     "readonly": false,
 *     "debugLabel": "Page State"
 *   },
 *   "properties": [
 *     {
 *       "key": "initialState",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "初始状态",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "defaultValue": {},
 *       "description": "页面创建和 clear 时使用的根状态。必须是可 JSON 序列化 object；数组、null、循环引用或不可序列化值会归一化为 {}。",
 *       "validationMessage": "请输入可 JSON 序列化的对象。"
 *     },
 *     {
 *       "key": "visibleInPreview",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "预览时显示",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "false 时作为无视觉占位的状态 Block；true 时在预览中显示只读调试 JSON。编辑态始终显示。"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox",
 *       "defaultValue": false,
 *       "description": "只读时 getData/getValue 仍可读取，setValue/merge/append/clear 返回 ok=false 且不修改状态。"
 *     },
 *     {
 *       "key": "debugLabel",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "调试名称",
 *       "type": "text",
 *       "defaultValue": "Page State",
 *       "description": "编辑态或 visibleInPreview=true 时显示的辅助标题，不参与变量路径。"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "{ value: Record<string, unknown>, path?: string, oldValue?: unknown }",
 *       "trigger": "setValue、merge、append 成功修改状态，或 clear 恢复 initialState",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "状态变化"
 *     },
 *     {
 *       "event": "clear",
 *       "payload": "{ value: Record<string, unknown>, oldValue: Record<string, unknown> }",
 *       "trigger": "clear 恢复 initialState 后",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "状态重置"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "获取页面状态",
 *       "description": "返回当前状态的 JSON 深拷贝，顶层字段可由 blocks[blockId] 变量上下文直接读取。"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [{ "name": "path", "optional": true, "description": "点号路径；为空时返回完整状态。" }],
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "读取状态值",
 *       "description": "按点号路径读取 JSON 值；数组索引使用数字段，例如 turns.0.response。缺失路径返回 undefined，非法路径抛出错误。"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         { "name": "path", "type": "string", "optional": true, "description": "点号路径；支持直接字段、args.path 或 inputs.path。为空时替换完整根状态。" },
 *         { "name": "value", "type": "unknown", "optional": false, "description": "可 JSON 序列化值；支持直接字段、args.value 或 inputs.value。无 path 时必须是 object。" }
 *       ],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "设置状态值",
 *       "description": "有 path 时写入路径并按后续数字段自动创建数组，否则创建 object；无 path 时要求 value 为 JSON 对象并替换完整状态。拒绝 __proto__、prototype 和 constructor 路径段。"
 *     },
 *     {
 *       "name": "merge",
 *       "exposed": true,
 *       "async": false,
 *       "params": [{ "name": "value", "type": "Record<string, unknown>", "optional": false, "description": "浅合并到根状态的可 JSON 序列化对象；支持直接字段、args.value 或 inputs.value。" }],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "合并页面状态",
 *       "description": "把 value 浅合并到根状态；嵌套对象不会递归合并。"
 *     },
 *     {
 *       "name": "append",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         { "name": "path", "type": "string", "optional": false, "description": "目标数组的点号路径。" },
 *         { "name": "value", "type": "unknown", "optional": false, "description": "追加的可 JSON 序列化值。" }
 *       ],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "追加数组项",
 *       "description": "向 path 指向的数组追加值；路径不存在或目标不是数组时，从空数组开始。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ ok: boolean, value: Record<string, unknown>, message?: string }",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "label": "重置页面状态",
 *       "description": "恢复 initialState，并触发 change 和 clear 事件。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "initialState 顶层字段（动态）",
 *       "variable": "<initialState key>",
 *       "dataType": "inferred",
 *       "source": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "description": "编辑器根据 initialState 的每个顶层 key 动态生成变量；array/number/boolean/string 保留类型，其余值按 object 暴露。运行时可通过 blocks[blockId][key] 读取当前值。"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "仅保存 initialState、visibleInPreview、readonly 和 debugLabel，不保存运行中的状态。"
 *     },
 *     {
 *       "key": "runtimeIsolation",
 *       "type": "behavior",
 *       "description": "每个 MPageState 实例维护独立内存状态，不跨页面、标签页或刷新共享。"
 *     },
 *     {
 *       "key": "runtimeNotification",
 *       "type": "behavior",
 *       "description": "成功写入后通知 PreviewBlockRuntime，使 blocks[blockId] 模板依赖重新求值；clear 同时触发 change 和 clear。"
 *     },
 *     {
 *       "key": "pathSafety",
 *       "type": "validation",
 *       "description": "点号路径不能为空段，并拒绝 __proto__、prototype、constructor；数组容器只接受数字索引。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MPageState-ai-chat-example",
 *       "type": "MPageState",
 *       "data": {
 *         "initialState": {
 *           "turns": [],
 *           "knownPageUuids": [],
 *           "knownApiUuids": [],
 *           "generationResult": null,
 *           "saveSummary": null,
 *           "isGenerating": false,
 *           "error": ""
 *         },
 *         "visibleInPreview": false,
 *         "readonly": false,
 *         "debugLabel": "AI Chat State"
 *       }
 *     },
 *     {
 *       "title": "通过 Action 更新并读取状态",
 *       "blockId": "ai-chat-state",
 *       "template": "{{blocks['ai-chat-state'].isGenerating}}",
 *       "action": {
 *         "action": "call_block_method",
 *         "inputs": {
 *           "blockId": "ai-chat-state",
 *           "method": "merge",
 *           "args": { "value": { "isGenerating": true, "error": "" } }
 *         },
 *         "outputs": ["returnData"]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MPageState.vue",
 *       "reason": "Vue component implementation and editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mPageStateTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
