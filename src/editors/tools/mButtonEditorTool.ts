import { defineEditorTool } from "@/editors/editorToolDefinition";
import {
  normalizeButtonProps,
  type MButtonProps
} from 'mokelay-components/blocks/MButton.vue';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MButton",
 *   "displayName": "按钮",
 *   "category": "action",
 *   "description": "按钮，支持样式、动作、禁用状态以及页面 DSL 的 visible/hidden 条件渲染。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MButton",
 *     "toolSymbol": "mButtonEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 420
 *   },
 *   "toolbox": {
 *     "title": "按钮",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M9 12h6\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "提交",
 *     "variant": "primary",
 *     "align": "left",
 *     "action": {
 *       "type": "submit"
 *     },
 *     "disabled": false,
 *     "visible": true,
 *     "hidden": false
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 64,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "按钮文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "variant",
 *       "optional": true,
 *       "tsType": "PageDslButtonVariant | string",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 65,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "样式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "primary",
 *           "label": "主要"
 *         },
 *         {
 *           "value": "secondary",
 *           "label": "次要"
 *         },
 *         {
 *           "value": "ghost",
 *           "label": "朴素"
 *         },
 *         {
 *           "value": "danger",
 *           "label": "危险"
 *         },
 *         {
 *           "value": "warning",
 *           "label": "警告"
 *         },
 *         {
 *           "value": "text",
 *           "label": "文本"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "PageDslAlign | string",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 78,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "对齐",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "left",
 *           "label": "左对齐"
 *         },
 *         {
 *           "value": "center",
 *           "label": "居中"
 *         },
 *         {
 *           "value": "right",
 *           "label": "右对齐"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 79,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "action",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 80,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "动作 JSON（本阶段仅保存，不执行）",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "bare",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 24,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "裸按钮"
 *     },
 *     {
 *       "key": "visible",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 14,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "显示条件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "hidden",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 15,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "隐藏条件",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "click",
 *       "payload": "payload: MouseEvent",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "line": 107,
 *       "label": "点击按钮"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     },
 *     {
 *       "key": "disabled",
 *       "type": "omitWhenFalse",
 *       "description": "disabled 仅在 true 时写入；默认 false 不保存。"
 *     },
 *     {
 *       "key": "action",
 *       "type": "json",
 *       "description": "动作配置作为 JSON 对象原样保留。"
 *     },
 *     {
 *       "key": "visible",
 *       "type": "omitWhenTrue",
 *       "description": "visible 默认 true；仅在 false 时写入，用于页面 DSL 的条件展示。"
 *     },
 *     {
 *       "key": "hidden",
 *       "type": "omitWhenFalse",
 *       "description": "hidden 默认 false；仅在 true 时写入，用于页面 DSL 的条件隐藏。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MButton-example",
 *       "type": "MButton",
 *       "data": {
 *         "label": "提交",
 *         "variant": "primary",
 *         "align": "left",
 *         "action": {
 *           "type": "submit"
 *         },
 *         "disabled": false,
 *         "visible": true,
 *         "hidden": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MButton.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mButtonEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mButtonEditorTool = defineEditorTool<MButtonProps>({
  normalizeProps: normalizeButtonProps,
  serialize: (props) => {
    const normalized = normalizeButtonProps(props);
    return {
      label: normalized.label,
      variant: normalized.variant,
      align: normalized.align,
      action: normalized.action,
      ...(normalized.disabled ? { disabled: true } : {}),
      ...(normalized.visible ? {} : { visible: false }),
      ...(normalized.hidden ? { hidden: true } : {})
    };
  }
});
