import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MJson",
 *   "displayName": "JSON 查看器",
 *   "category": "content",
 *   "description": "只读 JSON 查看器，使用 json-editor-vue 的树形模式展示任意可 JSON 序列化值，支持键和值搜索、匹配项定位、展开收起和复制。setValue/clear 可接收 action 或 processor 的运行时结果，并通知依赖 blocks[blockId] 的模板刷新；运行时值不会写回静态 DSL。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MJson",
 *     "toolSymbol": "mJsonTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": false,
 *     "sortOrder": 81
 *   },
 *   "toolbox": {
 *     "title": "JSON 查看器",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M8 5C6.5 5 5.5 6 5.5 7.5v2c0 1.1-.9 2-2 2 1.1 0 2 .9 2 2v2C5.5 17 6.5 18 8 18M16 5c1.5 0 2.5 1 2.5 2.5v2c0 1.1.9 2 2 2-1.1 0-2 .9-2 2v2C18.5 17 17.5 18 16 18M10.5 9h3M10.5 12h3M10.5 15h3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "JSON",
 *     "value": {},
 *     "height": 360,
 *     "expandDepth": 1,
 *     "emptyText": "暂无 JSON 数据。"
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text",
 *       "defaultValue": "JSON",
 *       "description": "查看器工具栏标题。"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 值",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "defaultValue": {},
 *       "description": "初始展示值，可为 object、array、string、number、boolean 或 null；setValue 成功调用后由运行时值覆盖。",
 *       "validationMessage": "请输入有效 JSON。"
 *     },
 *     {
 *       "key": "height",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "查看器高度",
 *       "type": "text",
 *       "defaultValue": 360,
 *       "minimum": 240,
 *       "maximum": 900,
 *       "description": "像素高度，序列化和渲染时截断为 240 到 900 的整数。"
 *     },
 *     {
 *       "key": "expandDepth",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "默认展开层级",
 *       "type": "text",
 *       "defaultValue": 1,
 *       "minimum": 0,
 *       "maximum": 8,
 *       "description": "首次渲染或 setValue 后自动展开的树深度；0 表示全部收起。"
 *     },
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空态文案",
 *       "type": "text",
 *       "defaultValue": "暂无 JSON 数据。",
 *       "description": "value 为 null/undefined 或无法序列化时显示。"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: unknown, json: unknown }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "获取当前 JSON",
 *       "description": "返回当前展示的 JSON 值；如果已通过 setValue 写入运行时值，则优先返回运行时值。"
 *     },
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": [
 *         {
 *           "name": "value",
 *           "type": "unknown",
 *           "optional": true,
 *           "description": "支持直接传入 JSON 值，或传入 { args: { value } } / { inputs: { value } } 的 call_block_method 调用对象。缺省或不可用值归一化为 null。"
 *         }
 *       ],
 *       "returns": "{ value: unknown, json: unknown }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "设置 JSON",
 *       "description": "深拷贝并写入运行时 JSON 值，重置搜索、高亮和展开状态，刷新查看器并通知 PreviewBlockRuntime。运行时值优先于后续 props.value 更新。"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": [],
 *       "returns": "{ value: null, json: null }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "清空 JSON",
 *       "description": "把运行时值设为 null，清空搜索和高亮，查看器进入空态；不会恢复静态 props.value。"
 *     },
 *     {
 *       "name": "copy",
 *       "exposed": true,
 *       "async": true,
 *       "params": [],
 *       "returns": "{ copied: boolean }",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "label": "复制 JSON",
 *       "description": "优先使用 Clipboard API，失败时回退到 document.execCommand；无有效 JSON 或两种复制方式都失败时返回 copied=false。"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "JSON 值",
 *       "variable": "value",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "description": "当前展示值；变量系统以 object 暴露，但运行时可以实际承载任意 JSON 类型。"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存标题、JSON 值、查看器高度、默认展开层级和空态文案到 EditorJS block.data；运行时 setValue 写入的值不反向写入静态 DSL。"
 *     },
 *     {
 *       "key": "runtimePrecedence",
 *       "type": "behavior",
 *       "description": "首次 setValue 或 clear 后进入运行时覆盖模式，后续 props.value 变化不会替换当前展示值，直到 Block 重新创建。"
 *     },
 *     {
 *       "key": "searchLimit",
 *       "type": "behavior",
 *       "description": "搜索同时匹配 key 和标量 value，单次最多记录 200 个路径匹配。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MJson-example",
 *       "type": "MJson",
 *       "data": {
 *         "label": "示例 JSON",
 *         "value": {
 *           "enabled": true,
 *           "items": [
 *             "one",
 *             "two"
 *           ]
 *         },
 *         "height": 360,
 *         "expandDepth": 1,
 *         "emptyText": "暂无 JSON 数据。"
 *       }
 *     },
 *     {
 *       "id": "MJson-runtime-result-example",
 *       "type": "MJson",
 *       "data": {
 *         "label": "AI 生成结果",
 *         "value": null,
 *         "height": 520,
 *         "expandDepth": 2,
 *         "emptyText": "等待生成结果..."
 *       }
 *     },
 *     {
 *       "title": "展示 Action 输出",
 *       "blockId": "generation-result",
 *       "action": {
 *         "action": "call_block_method",
 *         "inputs": {
 *           "blockId": "generation-result",
 *           "method": "setValue",
 *           "args": {
 *             "value": { "template": "{{actions['generate-dsl'].outputs.data}}" }
 *           }
 *         },
 *         "outputs": ["returnData"]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MJson.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mJsonTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
