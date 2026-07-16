import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MActionToolbar",
 *   "displayName": "动作工具栏",
 *   "category": "action",
 *   "description": "动作工具栏，支持行内、分组和下拉按钮，保留按钮的加载、禁用、可见性和嵌套动作配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MActionToolbar",
 *     "toolSymbol": "mActionToolbarEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 60
 *   },
 *   "toolbox": {
 *     "title": "动作工具栏",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M4 7h10M4 12h16M4 17h8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M17 6l3 3-3 3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "align": "left",
 *     "size": "medium",
 *     "mode": "inline",
 *     "buttons": [
 *       {
 *         "id": "search",
 *         "label": "搜索",
 *         "variant": "primary",
 *         "align": "left",
 *         "events": []
 *       },
 *       {
 *         "id": "reset",
 *         "label": "重置",
 *         "variant": "secondary",
 *         "align": "left",
 *         "events": []
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "toolbar",
 *       "label": "工具栏配置",
 *       "type": "component",
 *       "component": "MActionToolBarEditor",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 189,
 *       "declaredInProps": false,
 *       "configurable": true
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "MActionToolbarAlign | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 33,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "对齐方式"
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "MActionToolbarSize | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 34,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "尺寸"
 *     },
 *     {
 *       "key": "mode",
 *       "optional": true,
 *       "tsType": "MActionToolbarMode | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 35,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "模式"
 *     },
 *     {
 *       "key": "buttons",
 *       "optional": true,
 *       "tsType": "ToolbarButton[]",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 36,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "按钮配置"
 *     },
 *     {
 *       "key": "actions",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 37,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "动作配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "click",
 *       "payload": "payload: ButtonEventPayload & { nativeEvent?: MouseEvent }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 227,
 *       "label": "点击按钮"
 *     },
 *     {
 *       "event": "before-execute",
 *       "payload": "payload: ButtonEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 227,
 *       "label": "执行前"
 *     },
 *     {
 *       "event": "execute-success",
 *       "payload": "payload: ButtonEventPayload & { result?: unknown }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 227,
 *       "label": "执行成功"
 *     },
 *     {
 *       "event": "execute-error",
 *       "payload": "payload: ButtonEventPayload & { error: unknown }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 227,
 *       "label": "执行失败"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "trigger",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 419,
 *       "label": "触发动作"
 *     },
 *     {
 *       "name": "enable",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 420,
 *       "label": "启用"
 *     },
 *     {
 *       "name": "disable",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 421,
 *       "label": "禁用"
 *     },
 *     {
 *       "name": "setLoading",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 422,
 *       "label": "设置加载状态"
 *     },
 *     {
 *       "name": "setDisabled",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 423,
 *       "label": "设置禁用状态"
 *     },
 *     {
 *       "name": "getButton",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 424,
 *       "label": "获取按钮"
 *     },
 *     {
 *       "name": "getAction",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 425,
 *       "label": "获取动作"
 *     },
 *     {
 *       "name": "refreshVisibility",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "line": 426,
 *       "label": "刷新可见性"
 *     }
 *   ],
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
 *       "id": "MActionToolbar-example",
 *       "type": "MActionToolbar",
 *       "data": {
 *         "align": "left",
 *         "size": "medium",
 *         "mode": "inline",
 *         "buttons": [
 *           {
 *             "id": "search",
 *             "label": "搜索",
 *             "variant": "primary",
 *             "align": "left",
 *             "events": []
 *           },
 *           {
 *             "id": "reset",
 *             "label": "重置",
 *             "variant": "secondary",
 *             "align": "left",
 *             "events": []
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MActionToolbar.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mActionToolbarEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mActionToolbarEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
