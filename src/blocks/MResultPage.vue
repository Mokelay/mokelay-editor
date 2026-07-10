<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { stringValue } from '@/blocks/pageDslEditorTools';

export interface MResultPageProps {
  edit: boolean;
  title?: string;
  description?: string;
  resultField?: string;
}

const resultPageDefaults = {
  title: '你的结果',
  description: '这里展示测验或问卷结果。',
  resultField: 'score'
} as const;

function normalizeResultPageProps(props: Partial<MResultPageProps>): MResultPageProps {
  const merged = {
    ...resultPageDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    title: stringValue(merged.title),
    description: stringValue(merged.description),
    resultField: stringValue(merged.resultField, 'score')
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MResultPage",
 *   "displayName": "结果页",
 *   "category": "page",
 *   "description": "结果页，用于表单或流程完成后展示计算结果、说明和后续动作。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MResultPage",
 *     "toolSymbol": "mResultPageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 410
 *   },
 *   "toolbox": {
 *     "title": "结果页",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 6h14v5H5zM5 16h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "你的结果",
 *     "description": "这里展示测验或问卷结果。",
 *     "resultField": "score"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MResultPage.vue",
 *       "line": 43,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "description",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MResultPage.vue",
 *       "line": 44,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "说明",
 *       "type": "textarea"
 *     },
 *     {
 *       "key": "resultField",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MResultPage.vue",
 *       "line": 45,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "结果字段",
 *       "type": "text"
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
 *       "id": "MResultPage-example",
 *       "type": "MResultPage",
 *       "data": {
 *         "title": "你的结果",
 *         "description": "这里展示测验或问卷结果。",
 *         "resultField": "score"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MResultPage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MResultPage.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mResultPageEditorTool = defineEditorTool<MResultPageProps>({
  normalizeProps: normalizeResultPageProps,
  serialize: (props) => {
    const normalized = normalizeResultPageProps(props);
    return {
      title: normalized.title,
      description: normalized.description,
      resultField: normalized.resultField
    };
  }
});
</script>

<script setup lang="ts">
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

defineProps<MResultPageProps & PageDslCallbacks<MResultPageProps>>();
</script>

<template>
  <PageDslBlock block-type="MResultPage">
    <div class="page-dsl-flow page-dsl-flow--result">
      <span>结果页</span>
      <strong>{{ title || '你的结果' }}</strong>
      <p>{{ description || '这里展示测验或问卷结果。' }}</p>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-flow {
  display: grid;
  gap: 6px;
  border: 1px dashed rgb(148 163 184);
  border-radius: 8px;
  padding: 14px;
  background: rgb(248 250 252);
}

.page-dsl-flow span {
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.page-dsl-flow strong {
  color: rgb(15 23 42);
  font-size: 18px;
}

.page-dsl-flow p {
  margin: 0;
  color: rgb(71 85 105);
  font-size: 13px;
}

.page-dsl-flow--result {
  border-color: rgb(165 180 252);
  background: rgb(238 242 255);
}

.dark .page-dsl-flow {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}

.dark .page-dsl-flow strong {
  color: rgb(241 245 249);
}

.dark .page-dsl-flow p {
  color: rgb(203 213 225);
}
</style>
