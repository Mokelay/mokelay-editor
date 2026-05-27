<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { flowIcon, pageDslPropertyTitle, stringValue } from '@/blocks/pageDslEditorTools';

export interface MPageBreakProps {
  edit: boolean;
  title?: string;
  description?: string;
}

const pageBreakTitle = '分页';
const pageBreakDefaults = {
  title: '下一页',
  description: ''
} as const;

function normalizePageBreakProps(props: Partial<MPageBreakProps>): MPageBreakProps {
  const merged = {
    ...pageBreakDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    title: stringValue(merged.title),
    description: stringValue(merged.description)
  };
}

export const mPageBreakEditorTool = defineEditorTool<MPageBreakProps>({
  toolbox: {
    title: pageBreakTitle,
    icon: flowIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(pageBreakTitle);
    },
    fields: [
      { key: 'title', label: '页面标题' },
      { key: 'description', label: '页面说明', type: 'textarea' }
    ]
  },
  createInitialProps: () => ({
    ...pageBreakDefaults
  }),
  normalizeProps: normalizePageBreakProps,
  serialize: (props) => {
    const normalized = normalizePageBreakProps(props);
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

defineProps<MPageBreakProps & PageDslCallbacks<MPageBreakProps>>();
</script>

<template>
  <PageDslBlock block-type="MPageBreak">
    <div class="page-dsl-flow page-dsl-flow--break">
      <span>分页</span>
      <strong>{{ title || '下一页' }}</strong>
      <p v-if="description">{{ description }}</p>
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
