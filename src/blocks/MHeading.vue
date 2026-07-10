<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { normalizeAlign, normalizeSelectValue, stringValue, type PageDslAlign } from '@/blocks/pageDslEditorTools';

export interface MHeadingProps {
  edit: boolean;
  text?: string;
  level?: string;
  align?: PageDslAlign | string;
}

const headingDefaults = {
  text: '页面标题',
  level: '1',
  align: 'left'
} as const;

function normalizeHeadingProps(props: Partial<MHeadingProps>): MHeadingProps {
  const merged = {
    ...headingDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    text: stringValue(merged.text),
    level: normalizeSelectValue(merged.level, ['1', '2', '3'] as const, '1'),
    align: normalizeAlign(merged.align)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MHeading",
 *   "displayName": "页面标题",
 *   "category": "content",
 *   "description": "页面标题 Block，支持标题文字、级别、对齐和样式配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MHeading",
 *     "toolSymbol": "mHeadingEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 210
 *   },
 *   "toolbox": {
 *     "title": "页面标题",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 6h14M5 12h10M5 18h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "text": "页面标题",
 *     "level": "1",
 *     "align": "left"
 *   },
 *   "properties": [
 *     {
 *       "key": "text",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MHeading.vue",
 *       "line": 51,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题文本",
 *       "type": "text"
 *     },
 *     {
 *       "key": "level",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MHeading.vue",
 *       "line": 52,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "级别",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "1",
 *           "label": "一级标题"
 *         },
 *         {
 *           "value": "2",
 *           "label": "二级标题"
 *         },
 *         {
 *           "value": "3",
 *           "label": "三级标题"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "PageDslAlign | string",
 *       "source": "submodule/mokelay-editor/src/blocks/MHeading.vue",
 *       "line": 62,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "对齐",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "left",
 *           "label": "左对齐"
 *         },
 *         {
 *           "value": "center",
 *           "label": "居中"
 *         },
 *         {
 *           "value": "right",
 *           "label": "右对齐"
 *         }
 *       ]
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
 *       "id": "MHeading-example",
 *       "type": "MHeading",
 *       "data": {
 *         "text": "页面标题",
 *         "level": "1",
 *         "align": "left"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MHeading.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MHeading.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mHeadingEditorTool = defineEditorTool<MHeadingProps>({
  normalizeProps: normalizeHeadingProps,
  serialize: (props) => {
    const normalized = normalizeHeadingProps(props);
    return {
      text: normalized.text,
      level: normalized.level,
      align: normalized.align
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MHeadingProps & PageDslCallbacks<MHeadingProps>>();

const headingTag = computed(() => {
  if (props.level === '2') return 'h2';
  if (props.level === '3') return 'h3';
  return 'h1';
});

const headingClass = computed(() => {
  const alignClass = props.align === 'center' ? 'page-dsl-block--center' : props.align === 'right' ? 'page-dsl-block--right' : '';
  return ['page-dsl-heading', `page-dsl-heading--${props.level || '1'}`, alignClass].filter(Boolean).join(' ');
});
</script>

<template>
  <PageDslBlock block-type="MHeading">
    <component :is="headingTag" :class="headingClass">
      {{ text || '页面标题' }}
    </component>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-heading {
  margin: 0;
  color: rgb(15 23 42);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.18;
}

.page-dsl-heading--1 {
  font-size: 30px;
}

.page-dsl-heading--2 {
  font-size: 24px;
}

.page-dsl-heading--3 {
  font-size: 18px;
}

.page-dsl-block--center {
  text-align: center;
}

.page-dsl-block--right {
  text-align: right;
}

.dark .page-dsl-heading {
  color: rgb(241 245 249);
}
</style>
