import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MActionCardList",
 *   "displayName": "动作卡片列表",
 *   "category": "action",
 *   "description": "动作卡片列表，以卡片或紧凑列表展示数据项，支持字段路径、禁用状态、加载状态和卡片级事件。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MActionCardList",
 *     "toolSymbol": "mActionCardListEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 50
 *   },
 *   "toolbox": {
 *     "title": "动作卡片列表",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 5.5h14M5 12h14M5 18.5h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"5\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"3\" y=\"9.5\" width=\"18\" height=\"5\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"18\" height=\"5\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>"
 *   },
 *   "defaultData": {
 *     "items": [
 *       {
 *         "key": "login",
 *         "title": "登录接口",
 *         "description": "读取用户、校验密码、写入 Session。"
 *       },
 *       {
 *         "key": "register",
 *         "title": "注册接口",
 *         "description": "校验重复邮箱、创建用户、写入 Session。"
 *       }
 *     ],
 *     "itemKey": "key",
 *     "titlePath": "title",
 *     "descriptionPath": "description",
 *     "variant": "card",
 *     "size": "md",
 *     "emptyText": "暂无数据",
 *     "disabled": false
 *   },
 *   "properties": [
 *     {
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "列表数据 JSON / 变量",
 *       "type": "component",
 *       "component": "MVariableValueEditor"
 *     },
 *     {
 *       "key": "itemKey",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "唯一标识路径",
 *       "type": "text",
 *       "placeholder": "key / uuid / id"
 *     },
 *     {
 *       "key": "titlePath",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题路径",
 *       "type": "text",
 *       "placeholder": "title / name"
 *     },
 *     {
 *       "key": "descriptionPath",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "描述路径",
 *       "type": "text",
 *       "placeholder": "description"
 *     },
 *     {
 *       "key": "variant",
 *       "optional": true,
 *       "tsType": "MActionCardListVariant | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "样式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "card",
 *           "label": "卡片"
 *         },
 *         {
 *           "value": "compact",
 *           "label": "紧凑"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "MActionCardListSize | string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "尺寸",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "sm",
 *           "label": "小"
 *         },
 *         {
 *           "value": "md",
 *           "label": "默认"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空状态文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "activeKey",
 *       "optional": true,
 *       "tsType": "MActionCardListKey | null",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "激活项标识"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "select",
 *       "payload": "payload: MActionCardListEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "选择卡片"
 *     },
 *     {
 *       "event": "click",
 *       "payload": "payload: MActionCardListEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "点击卡片"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setItems",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "设置列表数据"
 *     },
 *     {
 *       "name": "setActive",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "设置激活项"
 *     },
 *     {
 *       "name": "clearActive",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "label": "清除激活项"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "'选中项'",
 *         "zh": "选中项",
 *         "en": "选中项"
 *       },
 *       "variable": "selectedItem",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'选中标识'",
 *         "zh": "选中标识",
 *         "en": "选中标识"
 *       },
 *       "variable": "activeKey",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "'列表数据'",
 *         "zh": "列表数据",
 *         "en": "列表数据"
 *       },
 *       "variable": "items",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MActionCardList.vue"
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
 *       "id": "MActionCardList-example",
 *       "type": "MActionCardList",
 *       "data": {
 *         "items": [
 *           {
 *             "key": "login",
 *             "title": "登录接口",
 *             "description": "读取用户、校验密码、写入 Session。"
 *           },
 *           {
 *             "key": "register",
 *             "title": "注册接口",
 *             "description": "校验重复邮箱、创建用户、写入 Session。"
 *           }
 *         ],
 *         "itemKey": "key",
 *         "titlePath": "title",
 *         "descriptionPath": "description",
 *         "variant": "card",
 *         "size": "md",
 *         "emptyText": "暂无数据",
 *         "disabled": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MActionCardList.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mActionCardListEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mActionCardListEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
