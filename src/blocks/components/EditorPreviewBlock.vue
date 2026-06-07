<script setup lang="ts">
import { computed, inject, onBeforeUnmount, shallowRef, watch } from 'vue';
import { type OutputData } from '@editorjs/editorjs';
import {
  getEditorComponentDefinition,
  isRegisteredEditorComponent
} from '@/editors/editorComponentRegistry';
import { normalizeBlockEvents } from '@/utils/blockEvents';
import {
  PreviewBlockRuntimeKey,
  type PreviewRuntimeBlock
} from '@/utils/previewBlockRuntime';

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

const previewRuntime = inject(PreviewBlockRuntimeKey, null);
const componentInstance = shallowRef<unknown | null>(null);
let registeredId = '';
let registeredInstance: unknown;

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

function getBlockId(block: OutputData['blocks'][number]) {
  return typeof block.id === 'string' ? block.id : '';
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

function unregisterCurrentBlock() {
  if (!previewRuntime || !registeredId) return;
  previewRuntime.unregisterBlock(registeredId, registeredInstance);
  registeredId = '';
  registeredInstance = undefined;
}

function registerCurrentBlock() {
  const id = getBlockId(props.block);
  const instance = componentInstance.value;
  if (!previewRuntime || !id || !instance || !isCustomBlock(props.block.type)) return;

  previewRuntime.registerBlock(id, {
    id,
    type: props.block.type,
    instance
  });
  registeredId = id;
  registeredInstance = instance;
}

function setComponentRef(instance: unknown) {
  unregisterCurrentBlock();
  componentInstance.value = instance;
  if (instance) {
    registerCurrentBlock();
  }
}

const blockEventListeners = computed(() => {
  const listeners: Record<string, (event: unknown) => void> = {};
  const events = normalizeBlockEvents((props.block as OutputData['blocks'][number] & { events?: unknown }).events);

  events.forEach((eventConfig) => {
    if (!eventConfig.event) return;
    const previousListener = listeners[eventConfig.event];
    listeners[eventConfig.event] = (event: unknown) => {
      previousListener?.(event);
      previewRuntime?.invokeBlockMethod(eventConfig, props.block as PreviewRuntimeBlock, event);
    };
  });

  return listeners;
});

watch(
  () => [props.block.id, props.block.type],
  () => {
    unregisterCurrentBlock();
    registerCurrentBlock();
  }
);

onBeforeUnmount(() => {
  unregisterCurrentBlock();
});
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
    :ref="setComponentRef"
    v-bind="getBlockProps(block)"
    v-on="blockEventListeners"
  />

  <pre v-else class="overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{{ block }}</pre>
</template>
