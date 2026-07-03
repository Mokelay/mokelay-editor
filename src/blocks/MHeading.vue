<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  alignOptions,
  normalizeAlign,
  normalizeSelectValue,
  pageDslPropertyTitle,
  stringValue,
  textIcon,
  type PageDslAlign
} from '@/blocks/pageDslEditorTools';

export interface MHeadingProps {
  edit: boolean;
  text?: string;
  level?: string;
  align?: PageDslAlign | string;
}

const headingTitle = '页面标题';
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

export const mHeadingEditorTool = defineEditorTool<MHeadingProps>({
  toolbox: {
    title: headingTitle,
    icon: textIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(headingTitle);
    },
    fields: [
      { key: 'text', label: '标题文本' },
      {
        key: 'level',
        label: '级别',
        type: 'select',
        options: [
          { label: '一级标题', value: '1' },
          { label: '二级标题', value: '2' },
          { label: '三级标题', value: '3' }
        ]
      },
      { key: 'align', label: '对齐', type: 'select', options: alignOptions }
    ]
  },
  createInitialProps: () => ({
    ...headingDefaults
  }),
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
