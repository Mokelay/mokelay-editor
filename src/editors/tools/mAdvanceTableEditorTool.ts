import { defineEditorTool } from "@/editors/editorToolDefinition";
import {
  normalizeAdvanceTableColumns,
  type MAdvanceTableProps
} from 'mokelay-components/blocks';
import { getAdvanceTableDataFields } from 'mokelay-components/blocks/MAdvanceTable.vue';
import {
  isRecord,
  normalizeDatasource,
  type MDatasourceApiObject
} from 'mokelay-components/datasource';

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MAdvanceTable",
 *   "displayName": "高级表格",
 *   "category": "data",
 *   "description": "高级表格，支持静态数据或数据源、分页选择、固定列和单元格内嵌 Block 的行数据绑定。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-components",
 *     "sourcePackage": "mokelay-components",
 *     "componentName": "MAdvanceTable",
 *     "toolSymbol": "mAdvanceTableEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 120
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "高级表格",
 *       "en": "Advanced Table"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M3 10h18M8 5v14M16 5v14\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>"
 *   },
 *   "defaultData": {
 *     "index": false,
 *     "selection": false
 *   },
 *   "properties": [
 *     {
 *       "key": "index",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示序号列",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "selection",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示多选列",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "showPageBreak",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "显示分页",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "rows",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "行数据"
 *     },
 *     {
 *       "key": "columns",
 *       "optional": true,
 *       "tsType": "MAdvanceTableColumnConfig[]",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "列配置",
 *       "type": "component",
 *       "component": "MAdvanceTableColumnsEditor"
 *     },
 *     {
 *       "key": "ds",
 *       "optional": true,
 *       "tsType": "MDatasourceApiObject",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "数据源",
 *       "type": "component",
 *       "component": "MDatasourceEditor"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "havingSelectedRows",
 *       "payload": "payload: {\n    selectedRows: Record<string, unknown>[];\n    selection: ReturnType<typeof getSelectionState>;\n  }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "已选中行"
 *     },
 *     {
 *       "event": "emptySelectedRow",
 *       "payload": "payload: {\n    selectedRows: Record<string, unknown>[];\n    selection: ReturnType<typeof getSelectionState>;\n  }",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "清空选中行"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "refresh",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "刷新"
 *     },
 *     {
 *       "name": "search",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "搜索"
 *     },
 *     {
 *       "name": "getSelectedRows",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取选中行"
 *     },
 *     {
 *       "name": "getSelectedValues",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取选中值"
 *     },
 *     {
 *       "name": "clearSelection",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "清空选择"
 *     },
 *     {
 *       "name": "getSelectionState",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "label": "获取选择状态"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.data')",
 *         "zh": "列表数据",
 *         "en": "List data"
 *       },
 *       "variable": "data",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.page')",
 *         "zh": "当前页",
 *         "en": "Page"
 *       },
 *       "variable": "page",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.pageSize')",
 *         "zh": "每页条数",
 *         "en": "Page size"
 *       },
 *       "variable": "pageSize",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.total')",
 *         "zh": "总数",
 *         "en": "Total"
 *       },
 *       "variable": "total",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
 *     },
 *     {
 *       "label": {
 *         "raw": "i18n.t('advanceTable.datasourceFields.search')",
 *         "zh": "搜索条件",
 *         "en": "Search"
 *       },
 *       "variable": "search",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue"
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
 *       "id": "MAdvanceTable-example",
 *       "type": "MAdvanceTable",
 *       "data": {
 *         "index": false,
 *         "selection": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MAdvanceTable.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mAdvanceTableEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mAdvanceTableEditorTool = defineEditorTool<MAdvanceTableProps>({
  documentFieldsOnly: true,
  getDataFields: () => getAdvanceTableDataFields(),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    index: props.index === true,
    selection: props.selection === true,
    showPageBreak: props.showPageBreak === true,
    ...(props.rows !== undefined ? { rows: props.rows } : {}),
    columns: normalizeAdvanceTableColumns(props.columns),
    ds: normalizeDatasourceConfig(props.ds)
  }),
  serialize: (props) => {
    const columns = normalizeAdvanceTableColumns(props.columns);
    const ds = normalizeDatasourceConfig(props.ds);
    return {
      index: props.index === true,
      selection: props.selection === true,
      showPageBreak: props.showPageBreak === true,
      ...(props.rows !== undefined ? { rows: props.rows } : {}),
      ...(columns.length ? { columns } : {}),
      ...(ds ? { ds } : {})
    };
  }
});

function normalizeDatasourceConfig(value: unknown): MDatasourceApiObject | undefined {
  if (!isRecord(value)) return undefined;
  const datasource = normalizeDatasource(value);
  return datasource.type === 'API' ? datasource : undefined;
}
