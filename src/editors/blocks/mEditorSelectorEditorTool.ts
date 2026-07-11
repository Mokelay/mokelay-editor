import { defineEditorTool } from '@/editors/editorToolDefinition';

import { cloneBlockEvents, finalizeEditorBlocksWithEvents, type BlockEvent } from '@/utils/blockEvents';

export type StoredBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  events?: BlockEvent[];
};

export interface MEditorSelectorProps {
  edit: boolean;
  value?: StoredBlock;
  excludeToolNames?: string[];
}

function generateBlockId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toPlainRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return cloneJsonValue(value) as Record<string, unknown>;
}

export function normalizeSelectorBlock(value?: unknown): StoredBlock | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.type !== 'string' || typeof record.data !== 'object' || record.data === null || Array.isArray(record.data)) {
    return undefined;
  }

  const events = cloneBlockEvents(record.events);

  return {
    id: typeof record.id === 'string' && record.id ? record.id : generateBlockId(),
    type: record.type,
    data: toPlainRecord(record.data),
    ...(events.length || Object.prototype.hasOwnProperty.call(record, 'events') ? { events } : {})
  };
}

export function cloneSelectorBlock(block: StoredBlock): StoredBlock {
  const events = cloneBlockEvents(block.events);
  const hasEvents = Object.prototype.hasOwnProperty.call(block, 'events');

  return {
    id: block.id,
    type: block.type,
    data: toPlainRecord(block.data),
    ...(events.length || hasEvents ? { events } : {})
  };
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
 *       "line": 14,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "选中 Block"
 *     },
 *     {
 *       "key": "excludeToolNames",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/mEditorSelectorEditorTool.ts",
 *       "line": 15,
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
