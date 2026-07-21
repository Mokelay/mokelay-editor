import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  normalizeMFormItems,
  normalizeMFormProps,
  serializeMFormProps,
  type MFormProps
} from 'mokelay-components/blocks';
import { normalizeVariableDataType, resolveLocalizedValue } from 'mokelay-components/runtime';
import { getContentEditingLocale, getContentLocaleConfig } from '@/composables/useContentLocalization';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MForm",
 *   "displayName": "表单",
 *   "category": "container",
 *   "description": "表单容器，负责字段布局、校验和表单项的嵌套编辑；子组件工具由客户端 Block 文档 API 的元数据创建。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MForm",
 *     "toolSymbol": "mFormEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 30
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "表单",
 *       "en": "Form"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 8h8M8 12h8M8 16h4\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "layout": "Vertical",
 *     "itemWidthMode": "stretch",
 *     "items": []
 *   },
 *   "properties": [
 *     {
 *       "key": "layout",
 *       "optional": true,
 *       "tsType": "MFormLayout",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
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
 *       "key": "itemWidthMode",
 *       "optional": true,
 *       "tsType": "MFormItemWidthMode",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "横向项宽度",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "stretch",
 *           "label": {
 *             "zh": "撑满",
 *             "en": "Stretch"
 *           }
 *         },
 *         {
 *           "value": "compact",
 *           "label": {
 *             "zh": "紧凑",
 *             "en": "Compact"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "MFormItemData[]",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "localizablePaths": ["[].labelName"],
 *       "label": "表单项配置",
 *       "type": "component",
 *       "component": "MFormItemsEditor"
 *     },
 *     {
 *       "key": "actionBar",
 *       "optional": true,
 *       "tsType": "MFormActionBarData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "操作栏配置",
 *       "type": "component",
 *       "component": "MActionToolBarEditor"
 *     },
 *     {
 *       "key": "toolbar",
 *       "optional": true,
 *       "tsType": "MFormActionBarData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "工具栏配置"
 *     },
 *     {
 *       "key": "values",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "表单值"
 *     },
 *     {
 *       "key": "defaultValues",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "默认值"
 *     },
 *     {
 *       "key": "submit",
 *       "optional": true,
 *       "tsType": "MFormSubmitData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "提交配置"
 *     },
 *     {
 *       "key": "processors",
 *       "optional": true,
 *       "tsType": "MFormProcessorsData",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "处理器配置"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "items: MFormItemData[]",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "变更"
 *     },
 *     {
 *       "event": "reset",
 *       "payload": "payload: { values: Record<string, unknown> }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "重置"
 *     },
 *     {
 *       "event": "submit",
 *       "payload": "payload: { values: Record<string, unknown>; valid: boolean; errors: unknown[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "提交"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "saveEditor",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "保存编辑器"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setValues",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "设置表单值"
 *     },
 *     {
 *       "name": "reset",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "重置"
 *     },
 *     {
 *       "name": "submit",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "label": "提交"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "item.labelName"
 *       },
 *       "variable": "item.variableName",
 *       "dataType": "normalizeVariableDataType(item.fieldDataType)",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts"
 *     },
 *     {
 *       "label": {
 *         "zh": "表单项字段",
 *         "en": "Form item field",
 *         "raw": "normalizeMFormItems(context.data.items)"
 *       },
 *       "variable": "<item.variableName>",
 *       "dataType": "dynamic",
 *       "source": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "notes": "getDataFields maps each configured form item to its variableName and labelName."
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
 *       "id": "MForm-example",
 *       "type": "MForm",
 *       "data": {
 *         "layout": "Vertical",
 *         "items": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MForm.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mFormEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mFormEditorTool = defineEditorTool<MFormProps>({
  getDataFields: (context) => normalizeMFormItems(context.data.items).map((item) => ({
    label: typeof item.labelName === 'string'
      ? item.labelName
      : resolveLocalizedValue(item.labelName, getContentEditingLocale(), getContentLocaleConfig()),
    variable: item.variableName,
    dataType: normalizeVariableDataType(item.fieldDataType)
  })),
  normalizeProps: (props) => normalizeMFormProps(props),
  serialize: (props) => serializeMFormProps(props)
});
