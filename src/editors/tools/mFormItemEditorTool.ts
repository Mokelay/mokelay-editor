import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  normalizeFormItemProps,
  serializeFormItemProps,
  type MFormItemProps
} from 'mokelay-components/blocks/MFormItem.vue';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MFormItem",
 *   "displayName": "表单项",
 *   "category": "content",
 *   "description": "表单项容器，负责字段标签、布局、校验提示与内嵌字段 Block 的编排。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MFormItem",
 *     "toolSymbol": "mFormItemEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 180
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "表单项",
 *       "en": "Form Item"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 9h8M8 13h3\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"16\" cy=\"13\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>"
 *   },
 *   "defaultData": {
 *     "labelName": {
 *       "zh": "字段",
 *       "en": "Field"
 *     },
 *     "layout": "Vertical"
 *   },
 *   "properties": [
 *     {
 *       "key": "labelName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "字段文本",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "请输入字段文本",
 *         "en": "Enter field label"
 *       }
 *     },
 *     {
 *       "key": "variableName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "变量名",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "请输入变量名",
 *         "en": "Enter variable name"
 *       }
 *     },
 *     {
 *       "key": "layout",
 *       "optional": true,
 *       "tsType": "MFormItemLayout",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "布局方式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "Vertical",
 *           "label": {
 *             "zh": "垂直",
 *             "en": "Vertical"
 *           }
 *         },
 *         {
 *           "value": "Horizontal",
 *           "label": {
 *             "zh": "水平",
 *             "en": "Horizontal"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "editor",
 *       "optional": true,
 *       "tsType": "StoredBlock",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "编辑器配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "click",
 *       "payload": "payload: MouseEvent",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "label": "点击表单项"
 *     }
 *   ],
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
 *       "id": "MFormItem-example",
 *       "type": "MFormItem",
 *       "data": {
 *         "labelName": {
 *           "zh": "字段",
 *           "en": "Field"
 *         },
 *         "layout": "Vertical"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MFormItem.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mFormItemEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFormItemEditorTool = defineEditorTool<MFormItemProps>({
  normalizeProps: (props) => normalizeFormItemProps(props),
  serialize: serializeFormItemProps
});
