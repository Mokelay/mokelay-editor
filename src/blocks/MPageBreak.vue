<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { flowIcon, numberValue, pageDslPropertyTitle } from '@/blocks/pageDslEditorTools';

export interface MPageBreakProps {
  edit: boolean;
  value?: MPageBreakValue;
}

export interface MPageBreakValue {
  page: number;
  pageSize: number;
  total: number;
}

const pageBreakTitle = '分页';
const pageBreakDefaults = {
  page: 1,
  pageSize: 10,
  total: 0
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function positiveIntegerValue(value: unknown, fallback: number) {
  const parsed = Math.trunc(numberValue(value, fallback));
  return parsed > 0 ? parsed : fallback;
}

function nonNegativeIntegerValue(value: unknown, fallback: number) {
  const parsed = Math.trunc(numberValue(value, fallback));
  return parsed >= 0 ? parsed : fallback;
}

function normalizePageBreakValue(value: unknown): MPageBreakValue {
  const source = isRecord(value) ? value : {};

  return {
    page: positiveIntegerValue(source.page, pageBreakDefaults.page),
    pageSize: positiveIntegerValue(source.pageSize, pageBreakDefaults.pageSize),
    total: nonNegativeIntegerValue(source.total, pageBreakDefaults.total)
  };
}

function normalizePageBreakProps(props: Partial<MPageBreakProps>): MPageBreakProps {
  return {
    edit: props.edit ?? false,
    value: normalizePageBreakValue(props.value)
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
      {
        key: 'value',
        label: '分页值 JSON',
        type: 'textarea',
        valueType: 'json',
        validationMessage: '请输入有效分页值 JSON。'
      }
    ]
  },
  createInitialProps: () => ({
    value: {
      ...pageBreakDefaults
    }
  }),
  normalizeProps: normalizePageBreakProps,
  serialize: (props) => {
    const normalized = normalizePageBreakProps(props);
    return {
      value: normalized.value
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MPageBreakProps & PageDslCallbacks<MPageBreakProps>>();

const pagination = computed(() => {
  const normalized = normalizePageBreakProps(props);
  const value = normalized.value ?? pageBreakDefaults;
  const page = value.page;
  const pageSize = value.pageSize;
  const total = value.total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = total > 0 ? Math.min(currentPage * pageSize, total) : 0;

  return {
    currentPage,
    end,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    pageSize,
    start,
    total,
    totalPages
  };
});

const paginationSummary = computed(() => {
  const item = pagination.value;
  return `第 ${item.start}-${item.end} 条，共 ${item.total} 条 · 第 ${item.currentPage} / ${item.totalPages} 页`;
});
</script>

<template>
  <PageDslBlock block-type="MPageBreak">
    <div class="page-dsl-pagination">
      <p>{{ paginationSummary }}</p>
      <div class="page-dsl-pagination__actions" aria-label="分页">
        <button type="button" :disabled="!pagination.hasPreviousPage">
          上一页
        </button>
        <button type="button" :disabled="!pagination.hasNextPage">
          下一页
        </button>
      </div>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.page-dsl-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  width: 100%;
}

.page-dsl-pagination p {
  margin: 0;
  color: rgb(71 85 105);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.page-dsl-pagination__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.page-dsl-pagination button {
  min-width: 72px;
  height: 36px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: default;
}

.page-dsl-pagination button:disabled {
  color: rgb(148 163 184);
  background: rgb(248 250 252);
}

:global(.dark) .page-dsl-pagination p {
  color: rgb(148 163 184);
}

:global(.dark) .page-dsl-pagination button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.dark) .page-dsl-pagination button:disabled {
  color: rgb(100 116 139);
  background: rgb(2 6 23);
}

@media (max-width: 640px) {
  .page-dsl-pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
