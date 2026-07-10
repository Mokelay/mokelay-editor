<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { stringValue } from '@/blocks/pageDslEditorTools';

export interface MThankYouPageProps {
  edit: boolean;
  title?: string;
  description?: string;
}

const thankYouPageDefaults = {
  title: '提交成功',
  description: '谢谢你的提交，我们已经收到。'
} as const;

function normalizeThankYouPageProps(props: Partial<MThankYouPageProps>): MThankYouPageProps {
  const merged = {
    ...thankYouPageDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    title: stringValue(merged.title),
    description: stringValue(merged.description)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MThankYouPage",
 *   "displayName": "感谢页",
 *   "category": "page",
 *   "description": "感谢页，用于流程完成后的提示、说明和后续导航。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MThankYouPage",
 *     "toolSymbol": "mThankYouPageEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 400
 *   },
 *   "toolbox": {
 *     "title": "感谢页",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 6h14v5H5zM5 16h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "提交成功",
 *     "description": "谢谢你的提交，我们已经收到。"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MThankYouPage.vue",
 *       "line": 40,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "description",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MThankYouPage.vue",
 *       "line": 41,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "说明",
 *       "type": "textarea"
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
 *       "id": "MThankYouPage-example",
 *       "type": "MThankYouPage",
 *       "data": {
 *         "title": "提交成功",
 *         "description": "谢谢你的提交，我们已经收到。"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MThankYouPage.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MThankYouPage.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mThankYouPageEditorTool = defineEditorTool<MThankYouPageProps>({
  normalizeProps: normalizeThankYouPageProps,
  serialize: (props) => {
    const normalized = normalizeThankYouPageProps(props);
    return {
      title: normalized.title,
      description: normalized.description
    };
  }
});
</script>

<script setup lang="ts">
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

defineProps<MThankYouPageProps & PageDslCallbacks<MThankYouPageProps>>();
</script>

<template>
  <PageDslBlock block-type="MThankYouPage">
    <div class="page-dsl-flow page-dsl-flow--thanks">
      <span>感谢页</span>
      <strong>{{ title || '提交成功' }}</strong>
      <p>{{ description || '谢谢你的提交，我们已经收到。' }}</p>
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

.page-dsl-flow--thanks {
  border-color: rgb(110 231 183);
  background: rgb(236 253 245);
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
