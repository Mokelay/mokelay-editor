import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MRecordList",
 *   "displayName": "记录列表",
 *   "category": "content",
 *   "description": "记录列表，按字段顺序呈现对象或数组数据，支持字段别名、隐藏字段、标题字段和数量显示。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MRecordList",
 *     "toolSymbol": "mRecordListEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 340
 *   },
 *   "toolbox": {
 *     "title": "记录列表",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M8 6h11M8 12h11M8 18h11\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"4.5\" cy=\"6\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"4.5\" cy=\"12\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"4.5\" cy=\"18\" r=\"1.5\" fill=\"currentColor\"/></svg>"
 *   },
 *   "defaultData": {
 *     "emptyText": "暂无数据",
 *     "fieldOrder": [],
 *     "hiddenFields": [],
 *     "fieldLabels": {},
 *     "titleFields": [
 *       "key",
 *       "name",
 *       "event",
 *       "method",
 *       "variable",
 *       "id",
 *       "label"
 *     ],
 *     "showCount": true
 *   },
 *   "properties": [
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 83,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空状态文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "showCount",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 84,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示数量",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "fieldOrder",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 12,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "字段顺序 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "hiddenFields",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 13,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "隐藏字段 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "fieldLabels",
 *       "optional": true,
 *       "tsType": "Record<string, string>",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 13,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "字段标签 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "titleFields",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 14,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题字段 JSON",
 *       "validationMessage": "请输入有效 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 7,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "列表数据"
 *     },
 *     {
 *       "key": "count",
 *       "optional": true,
 *       "tsType": "string | number",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 8,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "数量"
 *     },
 *     {
 *       "key": "displayName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 9,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "显示名称"
 *     },
 *     {
 *       "key": "blockType",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 10,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "Block 类型"
 *     },
 *     {
 *       "key": "value",
 *       "label": "fieldLabels.value ?? '值'",
 *       "type": "text",
 *       "source": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "line": 302,
 *       "declaredInProps": false,
 *       "configurable": false
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
 *       "id": "MRecordList-example",
 *       "type": "MRecordList",
 *       "data": {
 *         "emptyText": "暂无数据",
 *         "fieldOrder": [],
 *         "hiddenFields": [],
 *         "fieldLabels": {},
 *         "titleFields": [
 *           "key",
 *           "name",
 *           "event",
 *           "method",
 *           "variable",
 *           "id",
 *           "label"
 *         ],
 *         "showCount": true
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MRecordList.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mRecordListEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mRecordListEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
