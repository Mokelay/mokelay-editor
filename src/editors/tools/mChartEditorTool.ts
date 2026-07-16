import { defineEditorTool } from "@/editors/editorToolDefinition";

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MChart",
 *   "displayName": "图表",
 *   "category": "data",
 *   "description": "图表 Block，基于 ECharts 渲染可配置的数据、坐标轴和视觉样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MChart",
 *     "toolSymbol": "mChartEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 130
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "图表",
 *       "en": "Chart"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 16V11M12 16V8M16 16v-6\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "type": "line",
 *     "xAxis": [
 *       {
 *         "zh": "周一",
 *         "en": "Mon"
 *       },
 *       {
 *         "zh": "周二",
 *         "en": "Tue"
 *       },
 *       {
 *         "zh": "周三",
 *         "en": "Wed"
 *       },
 *       {
 *         "zh": "周四",
 *         "en": "Thu"
 *       },
 *       {
 *         "zh": "周五",
 *         "en": "Fri"
 *       }
 *     ],
 *     "series": [
 *       {
 *         "name": {
 *           "zh": "数据",
 *           "en": "Data"
 *         },
 *         "data": [
 *           120,
 *           200,
 *           150,
 *           80,
 *           70
 *         ]
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "type",
 *       "optional": true,
 *       "tsType": "MChartType",
 *       "source": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "line": 117,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图表类型",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "line",
 *           "label": {
 *             "zh": "折线图",
 *             "en": "Line chart"
 *           }
 *         },
 *         {
 *           "value": "bar",
 *           "label": {
 *             "zh": "柱状图",
 *             "en": "Bar chart"
 *           }
 *         },
 *         {
 *           "value": "pie",
 *           "label": {
 *             "zh": "饼图",
 *             "en": "Pie chart"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "xAxis",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "line": 127,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "图表数据",
 *       "type": "component",
 *       "component": "MChartDataEditor"
 *     },
 *     {
 *       "key": "series",
 *       "optional": true,
 *       "tsType": "MChartSeriesItem[]",
 *       "source": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "line": 134,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "系列数据"
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
 *       "id": "MChart-example",
 *       "type": "MChart",
 *       "data": {
 *         "type": "line",
 *         "xAxis": [
 *           {
 *             "zh": "周一",
 *             "en": "Mon"
 *           },
 *           {
 *             "zh": "周二",
 *             "en": "Tue"
 *           },
 *           {
 *             "zh": "周三",
 *             "en": "Wed"
 *           },
 *           {
 *             "zh": "周四",
 *             "en": "Thu"
 *           },
 *           {
 *             "zh": "周五",
 *             "en": "Fri"
 *           }
 *         ],
 *         "series": [
 *           {
 *             "name": {
 *               "zh": "数据",
 *               "en": "Data"
 *             },
 *             "data": [
 *               120,
 *               200,
 *               150,
 *               80,
 *               70
 *             ]
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MChart.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mChartEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mChartEditorTool = defineEditorTool({
  documentFieldsOnly: true,
  normalizeProps: (props) => ({ ...props, edit: props.edit ?? false }),
  serialize: (props) => Object.fromEntries(
    Object.entries(props).filter(([key, value]) => !["edit", "currentBlockId", "onChange", "onToolChange"].includes(key) && value !== undefined)
  )
});
