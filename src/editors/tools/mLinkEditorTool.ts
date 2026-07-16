import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLink",
 *   "displayName": "链接",
 *   "category": "content",
 *   "description": "链接 Block，支持文案、目标地址、打开方式和链接样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MLink",
 *     "toolSymbol": "mLinkEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 100
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "链接",
 *       "en": "Link"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M10.6 13.4a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7l-1.2 1.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M13.4 10.6a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.2-1.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "text": {
 *       "zh": "链接",
 *       "en": "Link"
 *     },
 *     "url": "https://mokelay.com",
 *     "open": false
 *   },
 *   "properties": [
 *     {
 *       "key": "text",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "line": 25,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "链接文本",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "链接",
 *         "en": "Link"
 *       }
 *     },
 *     {
 *       "key": "url",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "line": 30,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "链接地址",
 *       "type": "text",
 *       "placeholder": "https://mokelay.com"
 *     },
 *     {
 *       "key": "open",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "line": 35,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "新页面打开",
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
 *       "id": "MLink-example",
 *       "type": "MLink",
 *       "data": {
 *         "text": {
 *           "zh": "链接",
 *           "en": "Link"
 *         },
 *         "url": "https://mokelay.com",
 *         "open": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLink.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mLinkEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLinkEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
