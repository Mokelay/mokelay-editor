import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MMatrixField",
 *   "displayName": "矩阵题",
 *   "category": "form",
 *   "description": "矩阵题表单字段，支持行列选项与二维答案收集。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MMatrixField",
 *     "toolSymbol": "mMatrixFieldEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 390
 *   },
 *   "toolbox": {
 *     "title": "矩阵题",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 7h7M12 17h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": {},
 *     "rows": [
 *       {
 *         "label": "产品体验",
 *         "value": "product"
 *       },
 *       {
 *         "label": "服务响应",
 *         "value": "service"
 *       }
 *     ],
 *     "options": [
 *       {
 *         "label": "不满意",
 *         "value": "bad"
 *       },
 *       {
 *         "label": "一般",
 *         "value": "neutral"
 *       },
 *       {
 *         "label": "满意",
 *         "value": "good"
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "line": 21,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "值 JSON",
 *       "validationMessage": "请输入有效值 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "PageDslMatrixRow[]",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "line": 64,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "行 JSON",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "options",
 *       "optional": true,
 *       "tsType": "PageDslOption[]",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "line": 23,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "选项 JSON",
 *       "validationMessage": "请输入有效选项 JSON。",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "id",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "line": 20,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "字段 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [
 *     {
 *       "label": "值",
 *       "variable": "value",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MMatrixField.vue"
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
 *       "id": "MMatrixField-example",
 *       "type": "MMatrixField",
 *       "data": {
 *         "value": {},
 *         "rows": [
 *           {
 *             "label": "产品体验",
 *             "value": "product"
 *           },
 *           {
 *             "label": "服务响应",
 *             "value": "service"
 *           }
 *         ],
 *         "options": [
 *           {
 *             "label": "不满意",
 *             "value": "bad"
 *           },
 *           {
 *             "label": "一般",
 *             "value": "neutral"
 *           },
 *           {
 *             "label": "满意",
 *             "value": "good"
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MMatrixField.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mMatrixFieldEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mMatrixFieldEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
