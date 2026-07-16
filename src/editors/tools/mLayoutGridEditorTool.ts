import { defineEditorTool } from '@/editors/editorToolDefinition';
import type { EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  normalizeMLayoutGridProps,
  serializeMLayoutGridProps,
  type MLayoutGridProps
} from 'mokelay-components/blocks/MLayoutGrid.vue';
import type { BlockDataField } from 'mokelay-components/runtime';

type MLayoutGridEditorProps = Omit<MLayoutGridProps, 'edit'> & EditorToolComponentProps;

function getLayoutGridDataFields(): BlockDataField[] {
  return [
    { label: '区域数据', variable: 'areas', dataType: 'array' },
    { label: '区域数量', variable: 'areaCount', dataType: 'number' }
  ];
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLayoutGrid",
 *   "displayName": "布局网格",
 *   "category": "content",
 *   "description": "多区域布局网格，支持列轨道、区域、嵌套 Block 和响应式断点；嵌套工具按当前文档 API 元数据构建。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MLayoutGrid",
 *     "toolSymbol": "mLayoutGridEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 90
 *   },
 *   "toolbox": {
 *     "title": "布局网格",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"5\" width=\"7\" height=\"14\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><rect x=\"13\" y=\"5\" width=\"7\" height=\"14\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>"
 *   },
 *   "defaultData": {
 *     "columns": 1,
 *     "gap": 16,
 *     "rowGap": 16,
 *     "minColumnWidth": 0,
 *     "alignItems": "stretch",
 *     "justifyItems": "stretch",
 *     "hideEmptyAreas": false,
 *     "responsive": {
 *       "mobile": {
 *         "columns": 1
 *       }
 *     },
 *     "areas": [
 *       {
 *         "id": "main",
 *         "name": "主区域",
 *         "blocks": []
 *       }
 *     ]
 *   },
 *   "properties": [
 *     {
 *       "key": "columns",
 *       "optional": true,
 *       "tsType": "MLayoutGridTrack | MLayoutGridTrack[]",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 239,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "列宽配置",
 *       "type": "text",
 *       "placeholder": "minmax(0, 1fr) 320px"
 *     },
 *     {
 *       "key": "gap",
 *       "optional": true,
 *       "tsType": "number | string",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 244,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "区域间距",
 *       "type": "text",
 *       "placeholder": "16 / 16px / 1rem"
 *     },
 *     {
 *       "key": "responsive",
 *       "optional": true,
 *       "tsType": "{\n    mobile?: MLayoutGridResponsiveConfig;\n    tablet?: MLayoutGridResponsiveConfig;\n    desktop?: MLayoutGridResponsiveConfig;\n  }",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 29,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "响应式配置",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "areas",
 *       "optional": true,
 *       "tsType": "MLayoutGridArea[]",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 34,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "区域配置",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "hideEmptyAreas",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "隐藏空区域",
 *       "type": "checkbox"
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
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 678,
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "saveEditor",
 *       "exposed": true,
 *       "async": true,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 679,
 *       "label": "保存编辑器"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "'区域数据'",
 *         "zh": "区域数据",
 *         "en": "区域数据"
 *       },
 *       "variable": "areas",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 216
 *     },
 *     {
 *       "label": {
 *         "raw": "'区域数量'",
 *         "zh": "区域数量",
 *         "en": "区域数量"
 *       },
 *       "variable": "areaCount",
 *       "dataType": "number",
 *       "source": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "line": 221
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
 *       "id": "MLayoutGrid-example",
 *       "type": "MLayoutGrid",
 *       "data": {
 *         "columns": "minmax(0, 1fr) 320px",
 *         "gap": 16,
 *         "responsive": {
 *           "mobile": {
 *             "columns": 1
 *           }
 *         },
 *         "areas": [
 *           {
 *             "id": "main",
 *             "name": "主区域",
 *             "width": "minmax(0, 1fr)",
 *             "blocks": []
 *           },
 *           {
 *             "id": "aside",
 *             "name": "侧边栏",
 *             "width": "320px",
 *             "blocks": []
 *           }
 *         ]
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-components/src/blocks/MLayoutGrid.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/tools/mLayoutGridEditorTool.ts",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLayoutGridEditorTool = defineEditorTool<MLayoutGridEditorProps>({
  getDataFields: getLayoutGridDataFields,
  normalizeProps: (props) => ({
    ...normalizeMLayoutGridProps(props),
    edit: props.edit ?? false
  }),
  serialize: serializeMLayoutGridProps
});
