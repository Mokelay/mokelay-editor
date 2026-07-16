import { defineEditorTool } from "@/editors/editorToolDefinition";
import {
  normalizeTabs,
  type MTabsProps
} from 'mokelay-components/blocks/MTabs.vue';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTabs",
 *   "displayName": "页签",
 *   "category": "content",
 *   "description": "页签容器，按配置渲染多个页面或内容区，并支持当前页签切换。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MTabs",
 *     "toolSymbol": "mTabsEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 200
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "页签",
 *       "en": "Tabs"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M10 6v12M3 11h7\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>"
 *   },
 *   "defaultData": {
 *     "tabs": [],
 *     "activeTabId": ""
 *   },
 *   "properties": [
 *     {
 *       "key": "tabs",
 *       "optional": true,
 *       "tsType": "MTabsTab[]",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "页签配置",
 *       "type": "component",
 *       "component": "MTabsConfigEditor"
 *     },
 *     {
 *       "key": "activeTabId",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "激活页签 ID"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setActiviTabId",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "label": "设置激活页签"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "i18n.t('tabs.dataFields.activeTabId')",
 *         "zh": "激活页签 ID",
 *         "en": "Active tab ID"
 *       },
 *       "variable": "activeTabId",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('tabs.dataFields.activeTab')",
 *         "zh": "激活页签",
 *         "en": "Active tab"
 *       },
 *       "variable": "activeTab",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('tabs.dataFields.tabs')",
 *         "zh": "页签列表",
 *         "en": "Tabs"
 *       },
 *       "variable": "tabs",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MTabs.vue"
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
 *       "id": "MTabs-example",
 *       "type": "MTabs",
 *       "data": {
 *         "tabs": [],
 *         "activeTabId": ""
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MTabs.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mTabsEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTabsEditorTool = defineEditorTool<MTabsProps>({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({
    ...props,
    edit: props.edit ?? false,
    tabs: normalizeTabs(props.tabs)
  }),
  serialize: (props) => Object.fromEntries(
    Object.entries({
      ...props,
      tabs: normalizeTabs(props.tabs)
    }).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
