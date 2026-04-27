<script setup lang="ts">
import { computed } from 'vue';
import { type OutputData } from '@editorjs/editorjs';
import {
  getEditorComponentDefinition,
  isRegisteredEditorComponent
} from '@/editors/editorComponentRegistry';

interface EditorPreviewBlockProps {
  block: OutputData['blocks'][number];
  compactTable?: boolean;
}

const props = withDefaults(defineProps<EditorPreviewBlockProps>(), {
  compactTable: false
});

const tableClass = computed(() =>
  props.compactTable ? 'min-w-full border-collapse text-xs' : 'min-w-full border-collapse text-sm'
);

const tableCellClass = computed(() =>
  props.compactTable
    ? 'border border-slate-200 px-2 py-1 text-left align-top dark:border-slate-700'
    : 'border border-slate-200 px-3 py-2 text-left align-top dark:border-slate-700'
);

function getTableRows(block: OutputData['blocks'][number]) {
  const content = (block.data as { withHeadings?: boolean; content?: unknown }).content;
  if (!Array.isArray(content)) return [];
  return content.filter((row): row is string[] => Array.isArray(row));
}

function shouldRenderTableHeaderCell(block: OutputData['blocks'][number], rowIndex: number) {
  const withHeadings = (block.data as { withHeadings?: unknown }).withHeadings;
  return rowIndex === 0 && withHeadings === true;
}

function isCustomBlock(type: string) {
  return isRegisteredEditorComponent(type);
}

function getBlockComponent(type: string) {
  const definition = getEditorComponentDefinition(type);
  return definition?.component ?? null;
}

function getBlockProps(block: OutputData['blocks'][number]) {
  const definition = getEditorComponentDefinition(block.type);
  if (!definition) {
    return {
      edit: false,
      ...block.data
    };
  }

  return {
    ...definition.normalizeProps({
      ...(definition.createInitialProps?.() ?? {}),
      ...block.data,
      edit: false
    })
  };
}
</script>

<template>
  <p v-if="block.type === 'paragraph'" class="text-sm leading-6" v-html="block.data.text"></p>

  <div v-else-if="block.type === 'table'" class="overflow-auto">
    <table :class="tableClass">
      <tbody>
        <tr
          v-for="(row, rowIndex) in getTableRows(block)"
          :key="`table-${rowIndex}`"
          class="border-b border-slate-200 dark:border-slate-700"
        >
          <component
            :is="shouldRenderTableHeaderCell(block, rowIndex) ? 'th' : 'td'"
            v-for="(cell, cellIndex) in row"
            :key="`table-${rowIndex}-${cellIndex}`"
            :class="tableCellClass"
            v-html="cell"
          />
        </tr>
      </tbody>
    </table>
  </div>

  <component
    :is="getBlockComponent(block.type)"
    v-else-if="isCustomBlock(block.type)"
    v-bind="getBlockProps(block)"
  />

  <pre v-else class="overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{{ block }}</pre>
</template>
