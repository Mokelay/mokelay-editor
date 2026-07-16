import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  finalizeEditorBlocksWithEvents,
  normalizeSelectorBlock,
  type StoredBlock
} from 'mokelay-components/blocks';

export { cloneSelectorBlock, normalizeSelectorBlock } from 'mokelay-components/blocks';
export type { StoredBlock } from 'mokelay-components/blocks';

export interface MEditorSelectorProps {
  edit: boolean;
  value?: StoredBlock;
  excludeToolNames?: string[];
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MEditorSelector",
 *   "displayName": "组件选择器",
 *   "category": "container",
 *   "description": "嵌套组件选择器，用于在配置项中编辑单个 Block；候选组件与默认值由客户端 Block 文档 API 提供。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MEditorSelector",
 *     "toolSymbol": "mEditorSelectorEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 20
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "组件选择器",
 *       "en": "Component Selector"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 9h8M8 13h5\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M16 15l2 2 3-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {},
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "StoredBlock",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/mEditorSelectorEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "选中 Block"
 *     },
 *     {
 *       "key": "excludeToolNames",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/mEditorSelectorEditorTool.ts",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "排除工具名称"
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
 *       "id": "MEditorSelector-example",
 *       "type": "MEditorSelector",
 *       "data": {}
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MEditorSelector.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/mEditorSelectorEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mEditorSelectorEditorTool = defineEditorTool<MEditorSelectorProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeSelectorBlock(props.value),
    excludeToolNames: Array.isArray(props.excludeToolNames)
      ? props.excludeToolNames.filter((toolName): toolName is string => typeof toolName === 'string')
      : []
  }),
  serialize: (props) => {
    const value = normalizeSelectorBlock(props.value);
    return value ? { value: finalizeEditorBlocksWithEvents([value])[0] } : {};
  }
});
