import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTag",
 *   "displayName": "标签",
 *   "category": "content",
 *   "description": "标签 Block，支持标签文本、颜色、尺寸和展示样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MTag",
 *     "toolSymbol": "mTagEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 190
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "标签",
 *       "en": "Tag"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"5\" ry=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"8\" cy=\"12\" r=\"1.4\" fill=\"currentColor\"/></svg>"
 *   },
 *   "defaultData": {
 *     "tagName": {
 *       "zh": "标签",
 *       "en": "Tag"
 *     },
 *     "closable": false,
 *     "size": "",
 *     "color": "",
 *     "type": "success"
 *   },
 *   "properties": [
 *     {
 *       "key": "tagName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "line": 27,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标签内容",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "标签",
 *         "en": "Tag"
 *       }
 *     },
 *     {
 *       "key": "type",
 *       "optional": true,
 *       "tsType": "'' | 'primary' | 'success' | 'info' | 'warning' | 'danger'",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "line": 32,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标签类型",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "",
 *           "label": {
 *             "zh": "默认",
 *             "en": "Default"
 *           }
 *         },
 *         {
 *           "value": "primary",
 *           "label": {
 *             "zh": "主要",
 *             "en": "Primary"
 *           }
 *         },
 *         {
 *           "value": "success",
 *           "label": {
 *             "zh": "成功",
 *             "en": "Success"
 *           }
 *         },
 *         {
 *           "value": "info",
 *           "label": {
 *             "zh": "信息",
 *             "en": "Info"
 *           }
 *         },
 *         {
 *           "value": "warning",
 *           "label": {
 *             "zh": "警告",
 *             "en": "Warning"
 *           }
 *         },
 *         {
 *           "value": "danger",
 *           "label": {
 *             "zh": "危险",
 *             "en": "Danger"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "'' | 'large' | 'default' | 'small'",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "line": 45,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标签尺寸",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "",
 *           "label": {
 *             "zh": "默认",
 *             "en": "Default"
 *           }
 *         },
 *         {
 *           "value": "large",
 *           "label": {
 *             "zh": "大",
 *             "en": "Large"
 *           }
 *         },
 *         {
 *           "value": "default",
 *           "label": {
 *             "zh": "中",
 *             "en": "Medium"
 *           }
 *         },
 *         {
 *           "value": "small",
 *           "label": {
 *             "zh": "小",
 *             "en": "Small"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "color",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "line": 56,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "自定义颜色",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "例如：#409EFF",
 *         "en": "e.g. #409EFF"
 *       }
 *     },
 *     {
 *       "key": "closable",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "line": 61,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "可关闭",
 *       "type": "checkbox"
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
 *       "id": "MTag-example",
 *       "type": "MTag",
 *       "data": {
 *         "tagName": {
 *           "zh": "标签",
 *           "en": "Tag"
 *         },
 *         "closable": false,
 *         "size": "",
 *         "color": "",
 *         "type": "success"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MTag.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mTagEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTagEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
