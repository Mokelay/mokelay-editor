import type { OutputData } from '@editorjs/editorjs';
import { defineEditorTool } from '@/editors/editorToolDefinition';

import { finalizeEditorBlocksWithEvents } from '@/utils/blockEvents';

// MPage 工具在编辑器中的数据结构定义：
// - edit: 是否为编辑态
// - value: 页面内嵌 blocks 数据
export type MPageToolProps = {
  edit: boolean;
  value?: OutputData['blocks'];
};

// 为 MPage 注册 EditorJS 工具能力，统一处理默认值、归一化和序列化。
/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MPage",
 *   "displayName": "页面",
 *   "category": "container",
 *   "description": "页面编排容器，承载 EditorJS Block，并按客户端 Block 文档 API 的 active 配置注册可插入组件。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MPage",
 *     "toolSymbol": "mPageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 10
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "页面",
 *       "en": "Page"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\" ry=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 8h8M8 12h8M8 16h5\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": []
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "OutputData['blocks']",
 *       "source": "submodule/mokelay-editor/src/blocks/mPageEditorTool.ts",
 *       "line": 11,
 *       "declaredInProps": true,
 *       "configurable": false
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "blocks: OutputData['blocks']",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MPage.vue",
 *       "line": 57
 *     },
 *     {
 *       "event": "close",
 *       "payload": "result?: unknown",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MPage.vue",
 *       "line": 57
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "saveEditor",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MPage.vue",
 *       "line": 563
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MPage.vue",
 *       "line": 564
 *     },
 *     {
 *       "name": "close",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MPage.vue",
 *       "line": 565
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "key"
 *       },
 *       "variable": "key",
 *       "dataType": "inferDataType(value)",
 *       "source": "submodule/mokelay-editor/src/blocks/MPage.vue",
 *       "line": 137
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
 *       "id": "MPage-example",
 *       "type": "MPage",
 *       "data": {
 *         "value": []
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MPage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/mPageEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mPageEditorTool = defineEditorTool<MPageToolProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: Array.isArray(props.value) ? props.value : []
  }),
  serialize: (props) => ({
    value: finalizeEditorBlocksWithEvents(Array.isArray(props.value) ? props.value : [])
  })
});
