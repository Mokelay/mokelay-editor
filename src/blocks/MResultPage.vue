<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { flowIcon, pageDslPropertyTitle, stringValue } from '@/blocks/pageDslEditorTools';

export interface MResultPageProps {
  edit: boolean;
  title?: string;
  description?: string;
  resultField?: string;
}

const resultPageTitle = '结果页';
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

export const mResultPageEditorTool = defineEditorTool<MResultPageProps>({
  toolbox: {
    title: resultPageTitle,
    icon: flowIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(resultPageTitle);
    },
    fields: [
      { key: 'title', label: '标题' },
      { key: 'description', label: '说明', type: 'textarea' },
      { key: 'resultField', label: '结果字段' }
    ]
  },
  createInitialProps: () => ({
    ...resultPageDefaults
  }),
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

:global(.dark) .page-dsl-flow {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}

:global(.dark) .page-dsl-flow strong {
  color: rgb(241 245 249);
}

:global(.dark) .page-dsl-flow p {
  color: rgb(203 213 225);
}
</style>
