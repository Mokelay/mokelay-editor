<script lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import {
  defineEditorTool,
  type EditorToolComponentProps
} from '@/editors/editorToolDefinition';
import {
  normalizeValue,
  numberValue,
  stringValue
} from '@/blocks/pageDslEditorTools';
import type { ClientBlockDoc } from '@/utils/clientBlockDocs';

export type MBlockPlaygroundInitialSource = 'example' | 'default';

export interface MBlockPlaygroundProps extends EditorToolComponentProps {
  title?: string;
  doc?: ClientBlockDoc | null;
  initialSource?: MBlockPlaygroundInitialSource | string;
  jsonRows?: number;
  emptyText?: string;
}

const blockPlaygroundDefaults = {
  title: 'Block 展示',
  doc: null,
  initialSource: 'example',
  jsonRows: 12,
  emptyText: '未找到对应的 Block 文档。'
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneJsonValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeInitialSource(value: unknown): MBlockPlaygroundInitialSource {
  return value === 'default' ? 'default' : 'example';
}

function clampJsonRows(value: unknown) {
  return Math.min(36, Math.max(6, Math.trunc(numberValue(value, blockPlaygroundDefaults.jsonRows))));
}

export function normalizeMBlockPlaygroundProps(props: Partial<MBlockPlaygroundProps>): MBlockPlaygroundProps {
  const merged = {
    ...blockPlaygroundDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    title: stringValue(merged.title, blockPlaygroundDefaults.title),
    doc: isRecord(merged.doc) ? cloneJsonValue(merged.doc) as ClientBlockDoc : null,
    initialSource: normalizeInitialSource(merged.initialSource),
    jsonRows: clampJsonRows(merged.jsonRows),
    emptyText: stringValue(merged.emptyText, blockPlaygroundDefaults.emptyText)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MBlockPlayground",
 *   "displayName": "Block 展示调试器",
 *   "category": "content",
 *   "description": "文档详情页专用的 Block 展示模块，根据客户端 Block 文档渲染真实组件，并提供属性表单与完整 data JSON 的临时调参预览。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MBlockPlayground",
 *     "toolSymbol": "mBlockPlaygroundTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": false,
 *     "sortOrder": 82
 *   },
 *   "toolbox": {
 *     "title": "Block 展示",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 9h8M8 13h5\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "title": "Block 展示",
 *     "doc": null,
 *     "initialSource": "example",
 *     "jsonRows": 12,
 *     "emptyText": "未找到对应的 Block 文档。"
 *   },
 *   "properties": [
 *     {
 *       "key": "title",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MBlockPlayground.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题",
 *       "type": "text"
 *     },
 *     {
 *       "key": "doc",
 *       "optional": true,
 *       "tsType": "ClientBlockDoc | null",
 *       "source": "submodule/mokelay-editor/src/blocks/MBlockPlayground.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "Block 文档"
 *     },
 *     {
 *       "key": "initialSource",
 *       "optional": true,
 *       "tsType": "\"example\" | \"default\"",
 *       "source": "submodule/mokelay-editor/src/blocks/MBlockPlayground.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "初始数据",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "example",
 *           "label": "示例优先"
 *         },
 *         {
 *           "value": "default",
 *           "label": "默认值优先"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "jsonRows",
 *       "optional": true,
 *       "tsType": "number",
 *       "source": "submodule/mokelay-editor/src/blocks/MBlockPlayground.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "JSON 行数",
 *       "type": "text"
 *     },
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MBlockPlayground.vue",
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空态文案",
 *       "type": "text"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存文档绑定、初始来源、JSON 行数和空态文案；调试区内用户修改的 preview data 不持久化。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MBlockPlayground-example",
 *       "type": "MBlockPlayground",
 *       "data": {
 *         "title": "Block 展示",
 *         "doc": null,
 *         "initialSource": "example",
 *         "jsonRows": 12
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MBlockPlayground.vue",
 *       "reason": "Vue component implementation and editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mBlockPlaygroundTool = defineEditorTool<MBlockPlaygroundProps>({
  normalizeProps: normalizeMBlockPlaygroundProps,
  serialize: (props) => {
    const normalized = normalizeMBlockPlaygroundProps(props);
    return {
      title: normalized.title,
      doc: normalizeValue(normalized.doc, null),
      initialSource: normalized.initialSource,
      jsonRows: normalized.jsonRows,
      emptyText: normalized.emptyText
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import EditorPreviewBlock from '@/blocks/components/EditorPreviewBlock.vue';
import type { EditorToolPropertyField } from '@/editors/editorToolDefinition';
import {
  getClientBlockDefaultData,
  resolveClientBlockPropertyFields
} from '@/editors/clientBlockToolMetadata';
import {
  normalizeClientBlockDoc,
  type NormalizedClientBlockDoc
} from '@/utils/clientBlockDocs';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

type EditorBlock = OutputData['blocks'][number];
type EditorColumnData = { blocks?: OutputData['blocks'] };

const props = defineProps<MBlockPlaygroundProps & PageDslCallbacks<MBlockPlaygroundProps>>();

const draftData = ref<Record<string, unknown>>({});
const jsonText = ref('');
const jsonError = ref('');
const fieldJsonTexts = ref<Record<string, string>>({});
const fieldErrors = ref<Record<string, string>>({});

const normalizedProps = computed(() => normalizeMBlockPlaygroundProps(props));
const normalizedDoc = computed<NormalizedClientBlockDoc | null>(() => {
  const doc = normalizedProps.value.doc;
  return doc ? normalizeClientBlockDoc(doc) : null;
});
const propertyFields = computed(() => (
  normalizedDoc.value ? resolveClientBlockPropertyFields(normalizedDoc.value) : []
));
const playgroundTitle = computed(() => normalizedProps.value.title || blockPlaygroundDefaults.title);
const playgroundEmptyText = computed(() => normalizedProps.value.emptyText || blockPlaygroundDefaults.emptyText);
const previewBlockId = computed(() => {
  const base = normalizedProps.value.currentBlockId || normalizedDoc.value?.blockType || 'block-playground';
  return `${base}-preview`;
});
const previewBlock = computed<EditorBlock | null>(() => {
  const doc = normalizedDoc.value;
  if (!doc) return null;
  return {
    id: previewBlockId.value,
    type: doc.blockType,
    data: cloneRecord(draftData.value)
  };
});
const previewBlockSignature = computed(() => (
  previewBlock.value ? JSON.stringify(previewBlock.value) : ''
));
const initialDataSignature = computed(() => {
  const doc = normalizedDoc.value;
  if (!doc) return 'empty';
  return JSON.stringify({
    blockType: doc.blockType,
    initialSource: normalizedProps.value.initialSource,
    defaultData: doc.defaultData,
    examples: doc.examples
  });
});

function cloneRecord(value: Record<string, unknown>) {
  return cloneJsonValue(value) as Record<string, unknown>;
}

function formatJson(value: unknown) {
  try {
    const text = JSON.stringify(value, null, 2);
    return typeof text === 'string' ? text : '';
  } catch {
    return '';
  }
}

function isBlockExample(value: unknown): value is { data?: unknown } {
  return isRecord(value);
}

function firstExampleData(doc: NormalizedClientBlockDoc) {
  const example = doc.examples.find(isBlockExample);
  return isRecord(example?.data) ? cloneRecord(example.data) : undefined;
}

function defaultPreviewData(doc: NormalizedClientBlockDoc) {
  return cloneRecord(getClientBlockDefaultData(doc));
}

function buildInitialData() {
  const doc = normalizedDoc.value;
  if (!doc) return {};

  const exampleData = firstExampleData(doc);
  if (normalizedProps.value.initialSource === 'default') {
    return defaultPreviewData(doc);
  }

  return exampleData ?? defaultPreviewData(doc);
}

function syncJsonTextFromDraft() {
  jsonText.value = formatJson(draftData.value);
  jsonError.value = '';
}

function syncFieldTextsFromDraft() {
  const nextTexts: Record<string, string> = {};
  const nextErrors: Record<string, string> = {};
  propertyFields.value.forEach((field) => {
    if (field.valueType === 'json') {
      nextTexts[field.key] = formatJson(draftData.value[field.key]);
    }
  });
  fieldJsonTexts.value = nextTexts;
  fieldErrors.value = nextErrors;
}

function resetDraftData() {
  draftData.value = buildInitialData();
  syncJsonTextFromDraft();
  syncFieldTextsFromDraft();
}

function resetPlayground() {
  resetDraftData();
}

function formatJsonEditor() {
  try {
    const parsed = JSON.parse(jsonText.value);
    if (!isRecord(parsed)) {
      jsonError.value = '请输入 JSON 对象。';
      return;
    }

    draftData.value = cloneRecord(parsed);
    syncJsonTextFromDraft();
    syncFieldTextsFromDraft();
  } catch {
    jsonError.value = '请输入有效 JSON。';
  }
}

function updateDraftData(patch: Record<string, unknown>) {
  draftData.value = {
    ...draftData.value,
    ...cloneRecord(patch)
  };
  syncJsonTextFromDraft();
  syncFieldTextsFromDraft();
}

function updatePropertyField(field: EditorToolPropertyField, event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  if (target instanceof HTMLInputElement && target.type === 'checkbox') {
    updateDraftData({ [field.key]: target.checked });
    return;
  }

  if (field.valueType === 'json') {
    const value = target.value;
    fieldJsonTexts.value = {
      ...fieldJsonTexts.value,
      [field.key]: value
    };

    try {
      const parsed = JSON.parse(value);
      fieldErrors.value = {
        ...fieldErrors.value,
        [field.key]: ''
      };
      updateDraftData({ [field.key]: parsed });
    } catch {
      fieldErrors.value = {
        ...fieldErrors.value,
        [field.key]: field.validationMessage || '请输入有效 JSON。'
      };
    }
    return;
  }

  updateDraftData({ [field.key]: target.value });
}

function updateJsonEditor(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLTextAreaElement)) return;

  jsonText.value = target.value;
  try {
    const parsed = JSON.parse(target.value);
    if (!isRecord(parsed)) {
      jsonError.value = '请输入 JSON 对象。';
      return;
    }

    draftData.value = cloneRecord(parsed);
    jsonError.value = '';
    syncFieldTextsFromDraft();
  } catch {
    jsonError.value = '请输入有效 JSON。';
  }
}

function propertyFieldValue(field: EditorToolPropertyField) {
  if (field.valueType === 'json') {
    return fieldJsonTexts.value[field.key] ?? formatJson(draftData.value[field.key]);
  }

  const value = draftData.value[field.key];
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function propertyCheckboxValue(field: EditorToolPropertyField) {
  return draftData.value[field.key] === true;
}

function propertyError(field: EditorToolPropertyField) {
  return fieldErrors.value[field.key] || '';
}

function propertyInputEvent(field: EditorToolPropertyField) {
  return field.type === 'select' || field.type === 'checkbox' ? 'change' : 'input';
}

function getPropertyComponentProps(field: EditorToolPropertyField) {
  const state = draftData.value;
  const value = state[field.key];
  return {
    edit: true,
    currentBlockId: `${previewBlockId.value}-${field.key}`,
    getAvailableBlockDataSources: normalizedProps.value.getAvailableBlockDataSources,
    getAvailablePageVariableSources: normalizedProps.value.getAvailablePageVariableSources,
    previewRuntime: normalizedProps.value.previewRuntime,
    value,
    ...(field.getComponentProps?.({ value, state, edit: true }) ?? {})
  };
}

function handlePropertyComponentChange(field: EditorToolPropertyField, payload: unknown) {
  if (
    isRecord(payload) &&
    isRecord(payload.patch)
  ) {
    updateDraftData(payload.patch);
    return;
  }

  if (isRecord(payload) && Object.prototype.hasOwnProperty.call(payload, 'value')) {
    updateDraftData({ [field.key]: payload.value });
    return;
  }

  updateDraftData({ [field.key]: payload });
}

function getColumns(block: EditorBlock): EditorColumnData[] {
  const cols = (block.data as { cols?: unknown }).cols;
  if (!Array.isArray(cols)) return [];
  return cols.filter((col): col is EditorColumnData => isRecord(col));
}

function getColumnBlocks(column: EditorColumnData): OutputData['blocks'] {
  return Array.isArray(column.blocks) ? column.blocks : [];
}

function isColumnsBlock(block: EditorBlock | null): block is EditorBlock {
  return block?.type === 'columns';
}

watch(
  initialDataSignature,
  () => {
    resetDraftData();
  },
  { immediate: true }
);

watch(
  propertyFields,
  () => {
    syncFieldTextsFromDraft();
  },
  { deep: true }
);
</script>

<template>
  <PageDslBlock block-type="MBlockPlayground">
    <section class="m-block-playground" data-testid="m-block-playground">
      <header class="m-block-playground__header">
        <div>
          <h2 class="m-block-playground__title">
            {{ playgroundTitle }}
          </h2>
          <p v-if="normalizedDoc" class="m-block-playground__subtitle">
            {{ normalizedDoc.displayName }} / {{ normalizedDoc.blockType }}
          </p>
        </div>
        <button
          type="button"
          class="m-block-playground__button m-block-playground__button--secondary"
          data-testid="m-block-playground-reset"
          :disabled="!normalizedDoc"
          @click="resetPlayground"
        >
          重置
        </button>
      </header>

      <p
        v-if="!normalizedDoc"
        class="m-block-playground__empty"
        data-testid="m-block-playground-empty"
      >
        {{ playgroundEmptyText }}
      </p>

      <div v-else class="m-block-playground__body">
        <div class="m-block-playground__preview-panel">
          <div class="m-block-playground__panel-title">
            实时预览
          </div>
          <div class="m-block-playground__preview" data-testid="m-block-playground-preview">
            <template v-if="previewBlock">
              <div
                v-if="isColumnsBlock(previewBlock)"
                data-testid="m-block-playground-preview-columns"
                class="m-block-playground__columns"
              >
                <div
                  v-for="(column, columnIndex) in getColumns(previewBlock)"
                  :key="`columns-${columnIndex}`"
                  class="m-block-playground__column"
                  :data-testid="`m-block-playground-preview-column-${columnIndex}`"
                >
                  <EditorPreviewBlock
                    v-for="(columnBlock, blockIndex) in getColumnBlocks(column)"
                    :key="columnBlock.id ?? `${columnBlock.type}-${blockIndex}`"
                    :block="columnBlock"
                    compact-table
                  />
                </div>
              </div>
              <EditorPreviewBlock
                v-else
                :key="previewBlockSignature"
                :block="previewBlock"
              />
            </template>
          </div>
        </div>

        <aside class="m-block-playground__settings">
          <div class="m-block-playground__panel-title">
            属性
          </div>
          <div
            v-if="propertyFields.length"
            class="m-block-playground__fields"
            data-testid="m-block-playground-fields"
          >
            <div
              v-for="field in propertyFields"
              :key="field.key"
              class="m-block-playground__field"
            >
              <template v-if="field.type === 'component'">
                <span class="m-block-playground__label">
                  {{ field.label }}
                </span>
                <component
                  :is="field.component"
                  v-if="field.component"
                  v-bind="getPropertyComponentProps(field)"
                  :data-testid="`m-block-playground-field-${field.key}`"
                  @change="(payload: unknown) => handlePropertyComponentChange(field, payload)"
                  @tool-change="(payload: unknown) => handlePropertyComponentChange(field, payload)"
                />
              </template>

              <label
                v-else-if="field.type === 'checkbox'"
                class="m-block-playground__checkbox"
              >
                <input
                  :data-testid="`m-block-playground-field-${field.key}`"
                  type="checkbox"
                  :checked="propertyCheckboxValue(field)"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                >
                <span>{{ field.label }}</span>
              </label>

              <label v-else class="m-block-playground__label-wrap">
                <span class="m-block-playground__label">
                  {{ field.label }}
                </span>
                <select
                  v-if="field.type === 'select'"
                  class="m-block-playground__input"
                  :data-testid="`m-block-playground-field-${field.key}`"
                  :value="propertyFieldValue(field)"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                >
                  <option
                    v-for="option in field.options ?? []"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <textarea
                  v-else-if="field.type === 'textarea'"
                  class="m-block-playground__input m-block-playground__textarea"
                  :class="{ 'm-block-playground__input--invalid': propertyError(field) }"
                  :data-testid="`m-block-playground-field-${field.key}`"
                  :value="propertyFieldValue(field)"
                  :placeholder="field.placeholder"
                  :rows="field.valueType === 'json' ? 5 : 3"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                />
                <input
                  v-else
                  class="m-block-playground__input"
                  :class="{ 'm-block-playground__input--invalid': propertyError(field) }"
                  :data-testid="`m-block-playground-field-${field.key}`"
                  type="text"
                  :value="propertyFieldValue(field)"
                  :placeholder="field.placeholder"
                  @[propertyInputEvent(field)]="(event: Event) => updatePropertyField(field, event)"
                >
                <span
                  v-if="propertyError(field)"
                  class="m-block-playground__error"
                  :data-testid="`m-block-playground-field-error-${field.key}`"
                >
                  {{ propertyError(field) }}
                </span>
              </label>
            </div>
          </div>
          <p v-else class="m-block-playground__muted" data-testid="m-block-playground-no-fields">
            该 Block 没有可配置属性。
          </p>

          <div class="m-block-playground__json-header">
            <span class="m-block-playground__panel-title">
              data JSON
            </span>
            <button
              type="button"
              class="m-block-playground__button"
              data-testid="m-block-playground-format"
              @click="formatJsonEditor"
            >
              格式化
            </button>
          </div>
          <textarea
            class="m-block-playground__input m-block-playground__textarea m-block-playground__json"
            :class="{ 'm-block-playground__input--invalid': jsonError }"
            data-testid="m-block-playground-json"
            :rows="normalizedProps.jsonRows"
            :value="jsonText"
            spellcheck="false"
            @input="updateJsonEditor"
          />
          <p
            v-if="jsonError"
            class="m-block-playground__error"
            data-testid="m-block-playground-json-error"
          >
            {{ jsonError }}
          </p>
        </aside>
      </div>
    </section>
  </PageDslBlock>
</template>

<style scoped>
.m-block-playground {
  width: 100%;
  padding: 16px;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
}

.dark .m-block-playground {
  color: #e2e8f0;
  background: #0f172a;
  border-color: #334155;
}

.m-block-playground__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.m-block-playground__title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.m-block-playground__subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.dark .m-block-playground__subtitle,
.dark .m-block-playground__muted {
  color: #94a3b8;
}

.m-block-playground__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
  gap: 16px;
  align-items: start;
}

.m-block-playground__preview-panel,
.m-block-playground__settings {
  min-width: 0;
}

.m-block-playground__preview {
  min-height: 180px;
  padding: 16px;
  overflow: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.dark .m-block-playground__preview {
  background: #020617;
  border-color: #334155;
}

.m-block-playground__panel-title {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.dark .m-block-playground__panel-title {
  color: #cbd5e1;
}

.m-block-playground__fields {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.m-block-playground__field {
  min-width: 0;
}

.m-block-playground__label-wrap {
  display: grid;
  gap: 5px;
}

.m-block-playground__label {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.dark .m-block-playground__label {
  color: #cbd5e1;
}

.m-block-playground__checkbox {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 32px;
  color: #334155;
  font-size: 13px;
  font-weight: 650;
}

.dark .m-block-playground__checkbox {
  color: #e2e8f0;
}

.m-block-playground__input {
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.4;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.dark .m-block-playground__input {
  color: #f8fafc;
  background: #111827;
  border-color: #475569;
}

.m-block-playground__input--invalid {
  border-color: #dc2626;
  outline-color: #dc2626;
}

.m-block-playground__textarea {
  resize: vertical;
}

.m-block-playground__json {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.m-block-playground__json-header {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.m-block-playground__button {
  height: 32px;
  padding: 0 10px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}

.m-block-playground__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.m-block-playground__button--secondary {
  white-space: nowrap;
}

.dark .m-block-playground__button {
  color: #e2e8f0;
  background: #111827;
  border-color: #475569;
}

.m-block-playground__error {
  margin: 5px 0 0;
  color: #dc2626;
  font-size: 12px;
  font-weight: 650;
}

.m-block-playground__empty,
.m-block-playground__muted {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.m-block-playground__empty {
  padding: 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.m-block-playground__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.m-block-playground__column {
  min-width: 0;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

@media (max-width: 820px) {
  .m-block-playground__body {
    grid-template-columns: 1fr;
  }

  .m-block-playground__columns {
    grid-template-columns: 1fr;
  }
}
</style>
