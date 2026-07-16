<script setup lang="ts">
import { computed } from 'vue';
import type { JsonValue } from 'mokelay-components/datasource';

const props = withDefaults(defineProps<{
  value: JsonValue;
  name?: string;
  depth?: number;
}>(), {
  name: '',
  depth: 0
});

const isArray = computed(() => Array.isArray(props.value));
const isBranch = computed(() => isArray.value || (typeof props.value === 'object' && props.value !== null));
const entries = computed<Array<{ key: string; value: JsonValue }>>(() => {
  if (Array.isArray(props.value)) {
    return props.value.map((value, index) => ({ key: `[${index}]`, value }));
  }

  if (typeof props.value === 'object' && props.value !== null) {
    return Object.entries(props.value).map(([key, value]) => ({ key, value }));
  }

  return [];
});
const branchSummary = computed(() => {
  const count = entries.value.length;
  return isArray.value ? `Array(${count})` : `Object(${count})`;
});
const primitiveType = computed(() => props.value === null ? 'null' : typeof props.value);
const primitiveText = computed(() => {
  if (typeof props.value === 'string') {
    return JSON.stringify(props.value);
  }

  return String(props.value);
});
</script>

<template>
  <div class="json-tree-view">
    <details v-if="isBranch" class="json-tree-view__branch" :open="depth < 2">
      <summary class="json-tree-view__summary">
        <span v-if="name" class="json-tree-view__key">{{ name }}</span>
        <span v-if="name" class="json-tree-view__separator">:</span>
        <span class="json-tree-view__branch-summary">{{ branchSummary }}</span>
      </summary>
      <div v-if="entries.length" class="json-tree-view__children">
        <JsonTreeView
          v-for="entry in entries"
          :key="entry.key"
          :name="entry.key"
          :value="entry.value"
          :depth="depth + 1"
        />
      </div>
      <div v-else class="json-tree-view__empty">{{ isArray ? '[]' : '{}' }}</div>
    </details>
    <div v-else class="json-tree-view__primitive">
      <span v-if="name" class="json-tree-view__key">{{ name }}</span>
      <span v-if="name" class="json-tree-view__separator">:</span>
      <span class="json-tree-view__value" :class="`json-tree-view__value--${primitiveType}`">
        {{ primitiveText }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.json-tree-view {
  min-width: max-content;
  color: rgb(51 65 85);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 20px;
}

.json-tree-view__branch {
  margin: 0;
}

.json-tree-view__summary,
.json-tree-view__primitive {
  display: flex;
  min-height: 22px;
  align-items: baseline;
  gap: 5px;
  white-space: nowrap;
}

.json-tree-view__summary {
  cursor: pointer;
  list-style-position: outside;
}

.json-tree-view__summary::marker {
  color: rgb(100 116 139);
}

.json-tree-view__children,
.json-tree-view__empty {
  margin-left: 7px;
  border-left: 1px solid rgb(226 232 240);
  padding-left: 15px;
}

.json-tree-view__key {
  color: rgb(3 105 161);
  font-weight: 600;
}

.json-tree-view__separator,
.json-tree-view__branch-summary,
.json-tree-view__empty {
  color: rgb(100 116 139);
}

.json-tree-view__value--string {
  color: rgb(21 128 61);
}

.json-tree-view__value--number {
  color: rgb(147 51 234);
}

.json-tree-view__value--boolean {
  color: rgb(194 65 12);
}

.json-tree-view__value--null {
  color: rgb(100 116 139);
  font-style: italic;
}

.dark .json-tree-view {
  color: rgb(203 213 225);
}

.dark .json-tree-view__children,
.dark .json-tree-view__empty {
  border-left-color: rgb(51 65 85);
}

.dark .json-tree-view__key {
  color: rgb(125 211 252);
}

.dark .json-tree-view__separator,
.dark .json-tree-view__branch-summary,
.dark .json-tree-view__empty,
.dark .json-tree-view__summary::marker {
  color: rgb(148 163 184);
}

.dark .json-tree-view__value--string {
  color: rgb(134 239 172);
}

.dark .json-tree-view__value--number {
  color: rgb(216 180 254);
}

.dark .json-tree-view__value--boolean {
  color: rgb(253 186 116);
}
</style>
