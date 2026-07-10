<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { valueBlockDataField } from '@/blocks/blockDataFields';
import { normalizeValue, numberValue, stringValue } from '@/blocks/pageDslEditorTools';

export interface MJsonProps {
  edit: boolean;
  currentBlockId?: string;
  label?: string;
  value?: unknown;
  height?: number;
  expandDepth?: number;
}

const jsonDefaults = {
  label: 'JSON',
  value: {},
  height: 360,
  expandDepth: 1
} as const;

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = numberValue(value, fallback);
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function cloneJsonValue(value: unknown, fallback: unknown = jsonDefaults.value) {
  return normalizeValue(value, fallback);
}

function normalizeMJsonProps(props: Partial<MJsonProps>): MJsonProps {
  const merged = {
    ...jsonDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    label: stringValue(merged.label, jsonDefaults.label),
    value: cloneJsonValue(props.value, jsonDefaults.value),
    height: clampInteger(merged.height, jsonDefaults.height, 240, 900),
    expandDepth: clampInteger(merged.expandDepth, jsonDefaults.expandDepth, 0, 8)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MJson",
 *   "displayName": "JSON 查看器",
 *   "category": "content",
 *   "description": "只读 JSON 查看器，使用 json-editor-vue 的树形模式展示 JSON，支持搜索、展开收起和格式化复制。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MJson",
 *     "toolSymbol": "mJsonTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": false,
 *     "sortOrder": 81
 *   },
 *   "toolbox": {
 *     "title": "JSON 查看器",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M8 5C6.5 5 5.5 6 5.5 7.5v2c0 1.1-.9 2-2 2 1.1 0 2 .9 2 2v2C5.5 17 6.5 18 8 18M16 5c1.5 0 2.5 1 2.5 2.5v2c0 1.1.9 2 2 2-1.1 0-2 .9-2 2v2C18.5 17 17.5 18 16 18M10.5 9h3M10.5 12h3M10.5 15h3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "JSON",
 *     "value": {},
 *     "height": 360,
 *     "expandDepth": 1
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 值",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "validationMessage": "请输入有效 JSON。"
 *     },
 *     {
 *       "key": "height",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "查看器高度",
 *       "type": "text"
 *     },
 *     {
 *       "key": "expandDepth",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MJson.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "默认展开层级",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MJson.vue",
 *       "label": "获取数据"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "JSON 值",
 *       "variable": "value",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-editor/src/blocks/MJson.vue"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存标题、JSON 值、查看器高度和默认展开层级到 EditorJS block.data。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MJson-example",
 *       "type": "MJson",
 *       "data": {
 *         "label": "示例 JSON",
 *         "value": {
 *           "enabled": true,
 *           "items": [
 *             "one",
 *             "two"
 *           ]
 *         },
 *         "height": 360,
 *         "expandDepth": 1
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MJson.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mJsonTool = defineEditorTool<MJsonProps>({
  getDataFields: () => valueBlockDataField('object'),
  normalizeProps: normalizeMJsonProps,
  serialize: (props) => {
    const normalized = normalizeMJsonProps(props);
    return {
      label: normalized.label,
      value: cloneJsonValue(normalized.value),
      height: normalized.height,
      expandDepth: normalized.expandDepth
    };
  }
});
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import JsonEditorVue from 'json-editor-vue';
import { Mode } from 'vanilla-jsoneditor';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import { themeValue } from '@/utils/globalSettings';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

type JsonPath = Array<string | number>;

type JsonEditorInstance = {
  expand: (path: JsonPath, callback?: (relativePath: JsonPath) => boolean) => void;
  collapse: (path: JsonPath, recursive?: boolean) => void;
  scrollTo: (path: JsonPath) => Promise<void>;
  findElement: (path: JsonPath) => Element | undefined;
};

type JsonEditorVueInstance = {
  jsonEditor?: JsonEditorInstance;
};

type SearchMatch = {
  path: JsonPath;
  label: string;
};

const props = defineProps<MJsonProps & PageDslCallbacks<MJsonProps>>();

const jsonEditorRef = ref<JsonEditorVueInstance | null>(null);
const viewerValue = ref<object>({});
const hasValue = ref(false);
const valueError = ref('');
const formattedJson = ref('');
const searchQuery = ref('');
const activeSearchIndex = ref(0);
const copyState = ref('');
let copyTimer: number | undefined;
let highlightTimer: number | undefined;
let highlightedElement: Element | undefined;

const viewerLabel = computed(() => props.label || jsonDefaults.label);
const viewerHeight = computed(() => clampInteger(props.height, jsonDefaults.height, 240, 900));
const viewerExpandDepth = computed(() => clampInteger(props.expandDepth, jsonDefaults.expandDepth, 0, 8));
const isDark = computed(() => themeValue.value === 'dark');

function serializeJson(value: unknown) {
  if (value === undefined || value === null) {
    return { value: '', error: '' };
  }

  try {
    return { value: JSON.stringify(value, null, 2), error: '' };
  } catch {
    return { value: '', error: '当前数据无法序列化为 JSON。' };
  }
}

function updateViewerValue(value: unknown) {
  const serialized = serializeJson(value);
  formattedJson.value = serialized.value;
  valueError.value = serialized.error;
  hasValue.value = value !== undefined && value !== null && !serialized.error;

  if (!hasValue.value) {
    viewerValue.value = {};
    return;
  }

  try {
    viewerValue.value = JSON.parse(serialized.value) as object;
  } catch {
    valueError.value = '当前数据无法解析为 JSON。';
    hasValue.value = false;
    viewerValue.value = {};
  }
}

function getJsonEditor() {
  return jsonEditorRef.value?.jsonEditor;
}

function applyExpandDepth() {
  if (!hasValue.value || valueError.value) return;

  const editor = getJsonEditor();
  if (!editor) return;

  editor.collapse([], true);
  if (viewerExpandDepth.value > 0) {
    editor.expand([], (relativePath) => relativePath.length < viewerExpandDepth.value);
  }
}

function scheduleExpandDepth() {
  void nextTick(() => {
    window.requestAnimationFrame(applyExpandDepth);
  });
}

function pathLabel(path: JsonPath) {
  if (!path.length) return '$';

  return path.reduce<string>((label, part) => (
    typeof part === 'number' || /^\d+$/.test(String(part))
      ? `${label}[${part}]`
      : `${label}.${String(part)}`
  ), '$');
}

function scalarSearchText(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return String(value);
  return '';
}

function findSearchMatches(value: unknown, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [] as SearchMatch[];

  const matches: SearchMatch[] = [];
  const seen = new Set<string>();
  const visit = (current: unknown, path: JsonPath) => {
    if (matches.length >= 200) return;

    const addMatch = () => {
      const label = pathLabel(path);
      if (seen.has(label)) return;
      seen.add(label);
      matches.push({ path, label });
    };

    if (scalarSearchText(current).toLocaleLowerCase().includes(normalizedQuery)) {
      addMatch();
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, [...path, index]));
      return;
    }

    if (typeof current !== 'object' || current === null) return;

    Object.entries(current).forEach(([key, item]) => {
      const childPath = [...path, key];
      if (key.toLocaleLowerCase().includes(normalizedQuery)) {
        const label = pathLabel(childPath);
        if (!seen.has(label) && matches.length < 200) {
          seen.add(label);
          matches.push({ path: childPath, label });
        }
      }
      visit(item, childPath);
    });
  };

  visit(viewerValue.value, []);
  return matches;
}

const searchMatches = computed(() => findSearchMatches(viewerValue.value, searchQuery.value));
const activeSearchMatch = computed(() => searchMatches.value[activeSearchIndex.value]);

function clearHighlight() {
  if (highlightTimer !== undefined) {
    window.clearTimeout(highlightTimer);
    highlightTimer = undefined;
  }
  highlightedElement?.classList.remove('m-json__search-hit');
  highlightedElement = undefined;
}

async function focusSearchMatch(index: number) {
  const matches = searchMatches.value;
  if (!matches.length) return;

  activeSearchIndex.value = (index + matches.length) % matches.length;
  const match = activeSearchMatch.value;
  const editor = getJsonEditor();
  if (!match || !editor) return;

  editor.expand(match.path);
  await editor.scrollTo(match.path);
  clearHighlight();
  highlightedElement = editor.findElement(match.path);
  highlightedElement?.classList.add('m-json__search-hit');
  highlightTimer = window.setTimeout(clearHighlight, 2400);
}

function nextSearchMatch() {
  void focusSearchMatch(activeSearchIndex.value + 1);
}

function previousSearchMatch() {
  void focusSearchMatch(activeSearchIndex.value - 1);
}

function expandAll() {
  getJsonEditor()?.expand([], () => true);
}

function collapseAll() {
  getJsonEditor()?.collapse([], true);
}

function setCopyState(message: string) {
  if (copyTimer !== undefined) {
    window.clearTimeout(copyTimer);
  }

  copyState.value = message;
  copyTimer = window.setTimeout(() => {
    copyState.value = '';
    copyTimer = undefined;
  }, 2200);
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) {
    throw new Error('copy failed');
  }
}

async function copyJson() {
  if (!formattedJson.value) {
    setCopyState('没有可复制的 JSON 数据。');
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(formattedJson.value);
    } else {
      fallbackCopy(formattedJson.value);
    }
    setCopyState('JSON 已复制。');
  } catch {
    try {
      fallbackCopy(formattedJson.value);
      setCopyState('JSON 已复制。');
    } catch {
      setCopyState('复制 JSON 失败。');
    }
  }
}

function getData() {
  return {
    value: cloneJsonValue(props.value),
    json: cloneJsonValue(props.value)
  };
}

defineExpose({
  getData
});

watch(
  () => props.value,
  (value) => {
    updateViewerValue(value);
    activeSearchIndex.value = 0;
    clearHighlight();
    scheduleExpandDepth();
  },
  { deep: true, immediate: true }
);

watch(searchMatches, (matches) => {
  if (!matches.length) {
    activeSearchIndex.value = 0;
    clearHighlight();
    return;
  }

  if (activeSearchIndex.value >= matches.length) {
    activeSearchIndex.value = 0;
  }
});

watch(viewerExpandDepth, scheduleExpandDepth);

onMounted(scheduleExpandDepth);

onBeforeUnmount(() => {
  clearHighlight();
  if (copyTimer !== undefined) {
    window.clearTimeout(copyTimer);
  }
});
</script>

<template>
  <PageDslBlock block-type="MJson">
    <section
      class="m-json"
      :class="{ 'jse-theme-dark': isDark }"
      :style="{ '--m-json-height': `${viewerHeight}px` }"
      data-testid="m-json-viewer"
    >
      <header class="m-json__header">
        <div class="m-json__heading">
          <h3 class="m-json__title">{{ viewerLabel }}</h3>
          <span v-if="copyState" class="m-json__status" aria-live="polite">{{ copyState }}</span>
        </div>
        <div v-if="hasValue && !valueError" class="m-json__controls">
          <label class="m-json__search-label">
            <span class="sr-only">搜索 JSON</span>
            <input
              v-model="searchQuery"
              data-testid="m-json-search"
              class="m-json__search"
              type="search"
              placeholder="搜索键或值"
            >
          </label>
          <span v-if="searchQuery.trim()" class="m-json__match-count" data-testid="m-json-search-count">
            {{ searchMatches.length ? `${activeSearchIndex + 1} / ${searchMatches.length}` : '无结果' }}
          </span>
          <button
            class="m-json__button"
            type="button"
            title="上一个匹配项"
            aria-label="上一个匹配项"
            :disabled="!searchMatches.length"
            @click="previousSearchMatch"
          >上一个</button>
          <button
            class="m-json__button"
            type="button"
            title="下一个匹配项"
            aria-label="下一个匹配项"
            :disabled="!searchMatches.length"
            @click="nextSearchMatch"
          >下一个</button>
          <button class="m-json__button" type="button" title="全部展开" @click="expandAll">展开</button>
          <button class="m-json__button" type="button" title="全部收起" @click="collapseAll">收起</button>
          <button class="m-json__button" type="button" title="复制格式化 JSON" @click="copyJson">复制</button>
        </div>
      </header>

      <p v-if="valueError" class="m-json__state m-json__state--error" data-testid="m-json-viewer-error">{{ valueError }}</p>
      <p v-else-if="!hasValue" class="m-json__state" data-testid="m-json-viewer-empty">暂无 JSON 数据。</p>
      <div v-else class="m-json__content" data-testid="m-json-viewer-content">
        <JsonEditorVue
          ref="jsonEditorRef"
          :model-value="viewerValue"
          :mode="Mode.tree"
          :read-only="true"
          :main-menu-bar="false"
          :navigation-bar="false"
          :status-bar="false"
        />
      </div>
    </section>
  </PageDslBlock>
</template>

<style scoped>
.m-json {
  display: grid;
  overflow: hidden;
  width: 100%;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.m-json__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 48px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 8px 10px;
}

.m-json__heading,
.m-json__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.m-json__title {
  margin: 0;
  color: rgb(30 41 59);
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.m-json__status,
.m-json__match-count {
  color: rgb(71 85 105);
  font-size: 12px;
  line-height: 18px;
}

.m-json__search-label {
  display: block;
}

.m-json__search {
  width: min(200px, 40vw);
  height: 30px;
  border: 1px solid rgb(203 213 225);
  border-radius: 6px;
  background: rgb(248 250 252);
  color: rgb(30 41 59);
  font: inherit;
  font-size: 12px;
  padding: 0 8px;
}

.m-json__search:focus {
  outline: 2px solid rgb(20 184 166 / 0.28);
  outline-offset: 1px;
  border-color: rgb(13 148 136);
}

.m-json__button {
  min-height: 30px;
  border: 1px solid rgb(203 213 225);
  border-radius: 6px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  padding: 6px 8px;
}

.m-json__button:hover:not(:disabled) {
  border-color: rgb(45 212 191);
  color: rgb(15 118 110);
}

.m-json__button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.m-json__content {
  height: var(--m-json-height);
  min-height: 0;
  overflow: auto;
}

.m-json__state {
  margin: 12px;
  border: 1px dashed rgb(203 213 225);
  border-radius: 6px;
  color: rgb(100 116 139);
  font-size: 13px;
  line-height: 20px;
  padding: 10px;
  text-align: center;
}

.m-json__state--error {
  border-color: rgb(251 146 60 / 0.7);
  background: rgb(255 247 237);
  color: rgb(154 52 18);
}

:deep(.jse-main) {
  min-height: 100%;
  border: 0;
}

:deep(.m-json__search-hit) {
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgb(20 184 166 / 0.5);
}

.dark .m-json {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

.dark .m-json__header {
  border-color: rgb(71 85 105);
}

.dark .m-json__title {
  color: rgb(226 232 240);
}

.dark .m-json__status,
.dark .m-json__match-count {
  color: rgb(148 163 184);
}

.dark .m-json__search,
.dark .m-json__button {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
  color: rgb(226 232 240);
}

.dark .m-json__button:hover:not(:disabled) {
  border-color: rgb(45 212 191);
  color: rgb(94 234 212);
}

.dark .m-json__state {
  border-color: rgb(71 85 105);
  color: rgb(148 163 184);
}

.dark .m-json__state--error {
  border-color: rgb(194 65 12);
  background: rgb(124 45 18 / 0.28);
  color: rgb(254 215 170);
}

@media (max-width: 640px) {
  .m-json__header {
    align-items: stretch;
  }

  .m-json__controls {
    width: 100%;
  }

  .m-json__search {
    width: min(100%, 260px);
  }
}
</style>
