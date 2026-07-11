
import { defineEditorTool } from '@/editors/editorToolDefinition';

import {
  normalizeMActionToolbarProps,
  serializeMActionToolbarProps,
  type MActionToolbarProps
} from '@/blocks/MActionToolbar.vue';
import { cloneSelectorBlock, type StoredBlock } from '@/editors/blocks/mEditorSelectorEditorTool';
import { cloneBlockEvents, type BlockEvent } from '@/utils/blockEvents';
import { normalizeVariableDataType } from '@/utils/variableValue';
import { normalizeProcessorConfig } from '@/processors/shared';
import type { ProcessorConfig } from '@/processors/types';
import {
  normalizeFormItemProps,
  type MFormItemLayout,
  type MFormItemProps
} from '@/blocks/mFormItemProps';

export interface MFormItemData {
  labelName: string;
  variableName: string;
  fieldDataType?: string;
  editor?: StoredBlock;
  layout: MFormItemLayout;
  hidden?: boolean;
  events?: BlockEvent[];
}

export interface MFormProps {
  edit: boolean;
  currentBlockId?: string;
  layout?: MFormLayout;
  items?: MFormItemData[];
  actionBar?: MFormActionBarData;
  toolbar?: MFormActionBarData;
  values?: Record<string, unknown>;
  defaultValues?: Record<string, unknown>;
  submit?: MFormSubmitData;
  processors?: MFormProcessorsData;
}

export type MFormLayout = 'Vertical' | 'Horizontal';
export type MFormActionBarData = Pick<MActionToolbarProps, 'align' | 'size' | 'mode' | 'buttons'>;

export interface MFormSubmitData {
  filterEmpty?: boolean;
  includeDisabled?: boolean;
  includeHidden?: boolean;
}

export interface MFormProcessorsData {
  beforeSetValues?: ProcessorConfig[];
  beforeSubmit?: ProcessorConfig[];
  beforeReset?: ProcessorConfig[];
}

function normalizeProcessorConfigs(value: unknown): ProcessorConfig[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const normalized = normalizeProcessorConfig(item);
    return normalized ? [normalized] : [];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

type MFormItemDataInput = Partial<MFormItemProps> & {
  events?: unknown;
  fieldDataType?: unknown;
  hidden?: unknown;
  visible?: unknown;
};

export function cloneFormItemData(item: MFormItemDataInput): MFormItemData {
  const normalized = normalizeFormItemProps({
    ...item,
    edit: false
  });
  const events = cloneBlockEvents(item.events);
  const fieldDataType = normalizeOptionalString(item.fieldDataType);

  return {
    labelName: normalized.labelName,
    variableName: normalized.variableName,
    ...(fieldDataType ? { fieldDataType } : {}),
    ...(normalized.editor ? { editor: cloneSelectorBlock(normalized.editor) } : {}),
    layout: normalized.layout,
    ...(item.hidden === true || item.visible === false ? { hidden: true } : {}),
    events
  };
}

export function normalizeMFormItem(value: unknown): MFormItemData | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return cloneFormItemData(value as MFormItemDataInput);
}

export function normalizeMFormItems(value: unknown): MFormItemData[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeMFormItem(item))
    .filter((item): item is MFormItemData => item !== undefined);
}

export function normalizeMFormValues(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    return {};
  }

  return cloneValue(value);
}

export function normalizeMFormSubmit(value: unknown): MFormSubmitData {
  if (!isRecord(value)) {
    return {};
  }

  return {
    ...(value.filterEmpty === true ? { filterEmpty: true } : {}),
    ...(value.includeDisabled === false ? { includeDisabled: false } : {}),
    ...(value.includeHidden === true ? { includeHidden: true } : {})
  };
}

export function normalizeMFormProcessors(value: unknown): MFormProcessorsData {
  if (!isRecord(value)) {
    return {};
  }

  const beforeSetValues = normalizeProcessorConfigs(value.beforeSetValues);
  const beforeSubmit = normalizeProcessorConfigs(value.beforeSubmit);
  const beforeReset = normalizeProcessorConfigs(value.beforeReset);

  return {
    ...(beforeSetValues.length ? { beforeSetValues } : {}),
    ...(beforeSubmit.length ? { beforeSubmit } : {}),
    ...(beforeReset.length ? { beforeReset } : {})
  };
}

export function normalizeMFormLayout(value: unknown): MFormLayout {
  return value === 'Horizontal' ? 'Horizontal' : 'Vertical';
}

export function normalizeMFormActionBar(value: unknown): MFormActionBarData | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const normalized = normalizeMActionToolbarProps({
    ...value,
    edit: false,
    buttons: Array.isArray(value.buttons) ? value.buttons : []
  });

  if (!normalized.buttons?.length) {
    return undefined;
  }

  return serializeMActionToolbarProps(normalized);
}

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
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
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
 *     "items": []
 *   },
 *   "properties": [
 *     {
 *       "key": "layout",
 *       "optional": true,
 *       "tsType": "MFormLayout",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 192,
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
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "MFormItemData[]",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 201,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "表单项配置",
 *       "type": "component",
 *       "component": "MFormItemsEditor"
 *     },
 *     {
 *       "key": "actionBar",
 *       "optional": true,
 *       "tsType": "MFormActionBarData",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 207,
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
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 39,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "工具栏配置"
 *     },
 *     {
 *       "key": "values",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 40,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "表单值"
 *     },
 *     {
 *       "key": "defaultValues",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 41,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "默认值"
 *     },
 *     {
 *       "key": "submit",
 *       "optional": true,
 *       "tsType": "MFormSubmitData",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 42,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "提交配置"
 *     },
 *     {
 *       "key": "processors",
 *       "optional": true,
 *       "tsType": "MFormProcessorsData",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 43,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 76,
 *       "label": "变更"
 *     },
 *     {
 *       "event": "reset",
 *       "payload": "payload: { values: Record<string, unknown> }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 76,
 *       "label": "重置"
 *     },
 *     {
 *       "event": "submit",
 *       "payload": "payload: { values: Record<string, unknown>; valid: boolean; errors: unknown[] }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 76,
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
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 1052,
 *       "label": "保存编辑器"
 *     },
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 1053,
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setValues",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 1054,
 *       "label": "设置表单值"
 *     },
 *     {
 *       "name": "reset",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 1055,
 *       "label": "重置"
 *     },
 *     {
 *       "name": "submit",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "line": 1056,
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
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
 *       "line": 220
 *     },
 *     {
 *       "label": {
 *         "zh": "表单项字段",
 *         "en": "Form item field",
 *         "raw": "normalizeMFormItems(context.data.items)"
 *       },
 *       "variable": "<item.variableName>",
 *       "dataType": "dynamic",
 *       "source": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
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
 *       "file": "submodule/mokelay-editor/src/blocks/MForm.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/mFormEditorTool.ts",
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
    label: item.labelName,
    variable: item.variableName,
    dataType: normalizeVariableDataType(item.fieldDataType)
  })),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    layout: normalizeMFormLayout(props.layout),
    items: normalizeMFormItems(props.items),
    actionBar: normalizeMFormActionBar(props.actionBar ?? props.toolbar),
    values: normalizeMFormValues(props.values),
    defaultValues: normalizeMFormValues(props.defaultValues),
    submit: normalizeMFormSubmit(props.submit),
    processors: normalizeMFormProcessors(props.processors)
  }),
  serialize: (props) => {
    const layout = normalizeMFormLayout(props.layout);
    const actionBar = normalizeMFormActionBar(props.actionBar ?? props.toolbar);
    const values = normalizeMFormValues(props.values);
    const defaultValues = normalizeMFormValues(props.defaultValues);
    const submit = normalizeMFormSubmit(props.submit);
    const processors = normalizeMFormProcessors(props.processors);
    return {
      ...(layout === 'Horizontal' ? { layout } : {}),
      items: normalizeMFormItems(props.items).map((item) => cloneFormItemData(item)),
      ...(actionBar ? { actionBar } : {}),
      ...(Object.keys(values).length ? { values } : {}),
      ...(Object.keys(defaultValues).length ? { defaultValues } : {}),
      ...(Object.keys(submit).length ? { submit } : {}),
      ...(Object.keys(processors).length ? { processors } : {})
    };
  }
});

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}
