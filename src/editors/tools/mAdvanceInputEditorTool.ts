import { defineEditorTool } from '@/editors/editorToolDefinition';
import type { MAdvanceInputProps } from 'mokelay-components/blocks/MAdvanceInput.vue';
import { normalizeStoredBlocks } from 'mokelay-components/blocks';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MAdvanceInput",
 *   "displayName": "高级输入框",
 *   "category": "form",
 *   "description": "高级输入框，支持文本片段与嵌入组件的混合编辑，并保存为可编排的结构化内容。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MAdvanceInput",
 *     "toolSymbol": "mAdvanceInputEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 110
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "高级输入框",
 *       "en": "Advanced Input"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"3\" ry=\"3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M7 10h5M7 14h3M14 10h3M14 14h3\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {},
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "StoredBlock[]",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceInput.vue",
 *       "line": 18,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "输入值"
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
 *       "id": "MAdvanceInput-example",
 *       "type": "MAdvanceInput",
 *       "data": {}
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MAdvanceInput.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mAdvanceInputEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mAdvanceInputEditorTool = defineEditorTool<MAdvanceInputProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeStoredBlocks(props.value)
  }),
  serialize: (props) => ({ value: normalizeStoredBlocks(props.value) })
});
