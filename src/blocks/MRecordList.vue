<script lang="ts">
import { defineEditorTool, type EditorToolPropertyField } from '@/editors/editorToolDefinition';
import { booleanValue, normalizeValue, pageDslPropertyTitle, stringValue } from '@/blocks/pageDslEditorTools';

export interface MRecordListProps {
  edit: boolean;
  items?: unknown;
  count?: string | number;
  displayName?: string;
  blockType?: string;
  emptyText?: string;
  fieldOrder?: string[];
  fieldLabels?: Record<string, string>;
  titleFields?: string[];
  showCount?: boolean;
}

const recordListTitle = '记录列表';
const recordListDefaults = {
  emptyText: '暂无数据',
  fieldOrder: [],
  fieldLabels: {},
  titleFields: ['key', 'name', 'event', 'method', 'variable', 'id', 'label'],
  showCount: true
} as const;

function stringArrayValue(value: unknown, fallback: string[] = []) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim())
    : fallback;
}

function stringRecordValue(value: unknown, fallback: Record<string, string> = {}) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return fallback;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => (
      typeof item === 'string' ? [[key, item]] : []
    ))
  );
}

function normalizeRecordListProps(props: Partial<MRecordListProps>): MRecordListProps {
  const merged = {
    ...recordListDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    items: props.items === undefined ? undefined : normalizeValue(props.items, undefined),
    count: typeof props.count === 'number' || typeof props.count === 'string' ? props.count : undefined,
    displayName: stringValue(props.displayName),
    blockType: stringValue(props.blockType),
    emptyText: stringValue(merged.emptyText, recordListDefaults.emptyText),
    fieldOrder: stringArrayValue(normalizeValue(merged.fieldOrder, recordListDefaults.fieldOrder)),
    fieldLabels: stringRecordValue(normalizeValue(merged.fieldLabels, recordListDefaults.fieldLabels)),
    titleFields: stringArrayValue(normalizeValue(merged.titleFields, recordListDefaults.titleFields), [...recordListDefaults.titleFields]),
    showCount: booleanValue(merged.showCount, true)
  };
}

const jsonField = (key: keyof MRecordListProps, label: string): EditorToolPropertyField => ({
  key,
  label,
  type: 'textarea',
  valueType: 'json',
  validationMessage: '请输入有效 JSON。'
});

export const mRecordListEditorTool = defineEditorTool<MRecordListProps>({
  toolbox: {
    title: recordListTitle,
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 6h11M8 12h11M8 18h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4.5" cy="6" r="1.5" fill="currentColor"/><circle cx="4.5" cy="12" r="1.5" fill="currentColor"/><circle cx="4.5" cy="18" r="1.5" fill="currentColor"/></svg>'
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(recordListTitle);
    },
    fields: [
      { key: 'emptyText', label: '空状态文案' },
      { key: 'showCount', label: '显示数量', type: 'checkbox' },
      jsonField('fieldOrder', '字段顺序 JSON'),
      jsonField('fieldLabels', '字段标签 JSON'),
      jsonField('titleFields', '标题字段 JSON')
    ]
  },
  createInitialProps: () => ({
    ...recordListDefaults,
    fieldOrder: [...recordListDefaults.fieldOrder],
    fieldLabels: { ...recordListDefaults.fieldLabels },
    titleFields: [...recordListDefaults.titleFields]
  }),
  normalizeProps: normalizeRecordListProps,
  serialize: (props) => {
    const normalized = normalizeRecordListProps(props);
    return {
      ...(normalized.items !== undefined ? { items: normalized.items } : {}),
      ...(normalized.count !== undefined ? { count: normalized.count } : {}),
      ...(normalized.displayName ? { displayName: normalized.displayName } : {}),
      ...(normalized.blockType ? { blockType: normalized.blockType } : {}),
      emptyText: normalized.emptyText,
      showCount: normalized.showCount,
      fieldOrder: normalized.fieldOrder,
      fieldLabels: normalized.fieldLabels,
      titleFields: normalized.titleFields
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

type RecordListField = {
  key: string;
  label: string;
  value: RecordListFieldValue;
};

type RecordListFieldValue =
  | {
      kind: 'text';
      text: string;
    }
  | {
      kind: 'records';
      records: NestedRecordListItem[];
    };

type NestedRecordListItem = {
  id: string;
  title: string;
  details: RecordListField[];
};

type RecordListItem = {
  id: string;
  title: string;
  fields: RecordListField[];
};

const props = defineProps<MRecordListProps & PageDslCallbacks<MRecordListProps>>();
const normalizedProps = computed(() => normalizeRecordListProps(props));
const sourceItems = computed(() => normalizeItems(normalizedProps.value.items));
const listItems = computed(() => sourceItems.value.map((item, index) => buildListItem(item, index)));
const contextTitle = computed(() => {
  const displayName = formatValue(normalizedProps.value.displayName);
  const blockType = formatValue(normalizedProps.value.blockType);
  return [displayName, blockType].filter(Boolean).join(' / ');
});
const countText = computed(() => {
  const rawCount = normalizedProps.value.count !== undefined && normalizedProps.value.count !== ''
    ? normalizedProps.value.count
    : undefined;
  const count = formatValue(rawCount) || String(listItems.value.length);
  return `共 ${count} 项`;
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return parsed;
      if (parsed === null || parsed === undefined) return [];
      return [parsed];
    } catch {
      return [trimmed];
    }
  }

  return value === null || value === undefined ? [] : [value];
}

function localizedLabelValue(value: Record<string, unknown>) {
  const zh = typeof value.zh === 'string' ? value.zh.trim() : '';
  const en = typeof value.en === 'string' ? value.en.trim() : '';
  const raw = typeof value.raw === 'string' ? value.raw.trim() : '';
  return [zh, en, raw].filter(Boolean).join(' / ');
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value) && value.every((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))) {
    return value.map((item) => formatValue(item)).filter(Boolean).join(', ');
  }

  if (isRecord(value)) {
    const localized = localizedLabelValue(value);
    if (localized) return localized;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatFieldValue(value: unknown): RecordListFieldValue | undefined {
  if (Array.isArray(value) && value.every(isRecord)) {
    const records = value.map((item, index) => buildNestedListItem(item, index));
    return records.length ? { kind: 'records', records } : undefined;
  }

  const text = formatValue(value);
  return text ? { kind: 'text', text } : undefined;
}

function getFieldKeys(item: Record<string, unknown>) {
  const fieldOrder = normalizedProps.value.fieldOrder ?? [];
  const orderedKeys = fieldOrder.filter((key) => Object.prototype.hasOwnProperty.call(item, key));
  const remainingKeys = Object.keys(item).filter((key) => !orderedKeys.includes(key));
  return [...orderedKeys, ...remainingKeys];
}

function getItemTitle(item: unknown, index: number) {
  if (!isRecord(item)) {
    return formatValue(item) || `#${index + 1}`;
  }

  for (const key of normalizedProps.value.titleFields ?? []) {
    const value = formatValue(item[key]);
    if (value) return value;
  }

  return `#${index + 1}`;
}

function getNestedTitleKey(item: Record<string, unknown>) {
  const titleKeys = normalizedProps.value.titleFields ?? [];
  return titleKeys.find((key) => formatValue(item[key]))
    ?? ['name', 'key', 'label', 'id'].find((key) => formatValue(item[key]))
    ?? '';
}

function getRecordFieldLabel(key: string) {
  const fieldLabels = normalizedProps.value.fieldLabels ?? {};
  const defaultLabels: Record<string, string> = {
    name: '名称',
    type: '类型',
    dataType: '数据类型'
  };
  return fieldLabels[key] ?? defaultLabels[key] ?? key;
}

function buildNestedListItem(item: Record<string, unknown>, index: number): NestedRecordListItem {
  const titleKey = getNestedTitleKey(item);
  const title = titleKey ? formatValue(item[titleKey]) : '';
  const detailKeys = Object.keys(item).filter((key) => {
    if (key === titleKey) return false;
    if (key === 'dataType' && formatValue(item.dataType) === formatValue(item.type)) return false;
    return true;
  });
  const details = detailKeys.flatMap((key) => {
    const value = formatFieldValue(item[key]);
    return value
      ? [{
          key,
          label: getRecordFieldLabel(key),
          value
        }]
      : [];
  });

  return {
    id: `nested-record-${index}`,
    title: title || `#${index + 1}`,
    details
  };
}

function buildListItem(item: unknown, index: number): RecordListItem {
  const fieldLabels = normalizedProps.value.fieldLabels ?? {};
  const fields: RecordListField[] = isRecord(item)
    ? getFieldKeys(item).flatMap((key) => {
      const value = formatFieldValue(item[key]);
      return value
        ? [{
            key,
            label: fieldLabels[key] ?? key,
            value
          }]
        : [];
    })
    : [{
        key: 'value',
        label: fieldLabels.value ?? '值',
        value: { kind: 'text', text: formatValue(item) }
      }];

  return {
    id: `record-${index}`,
    title: getItemTitle(item, index),
    fields
  };
}
</script>

<template>
  <PageDslBlock block-type="MRecordList">
    <section class="record-list" data-testid="record-list">
      <header v-if="contextTitle || normalizedProps.showCount" class="record-list__summary">
        <p v-if="contextTitle" class="record-list__context">{{ contextTitle }}</p>
        <p v-if="normalizedProps.showCount" class="record-list__count">{{ countText }}</p>
      </header>
      <p v-if="!listItems.length" class="record-list__empty" data-testid="record-list-empty">
        {{ normalizedProps.emptyText }}
      </p>
      <ul v-else class="record-list__items" data-testid="record-list-items">
        <li v-for="(item, itemIndex) in listItems" :key="item.id" class="record-list__item">
          <h3>{{ itemIndex + 1 }}. {{ item.title }}</h3>
          <dl class="record-list__fields">
            <div v-for="field in item.fields" :key="`${item.id}-${field.key}`" class="record-list__field">
              <dt>{{ field.label }}</dt>
              <dd>
                <template v-if="field.value.kind === 'records'">
                  <ul class="record-list__nested-items" data-testid="record-list-nested-items">
                    <li v-for="record in field.value.records" :key="record.id" class="record-list__nested-item">
                      <div class="record-list__nested-title">{{ record.title }}</div>
                      <dl v-if="record.details.length" class="record-list__nested-fields">
                        <div v-for="detail in record.details" :key="`${record.id}-${detail.key}`" class="record-list__nested-field">
                          <dt>{{ detail.label }}</dt>
                          <dd>
                            <template v-if="detail.value.kind === 'records'">
                              <span>{{ detail.value.records.map((nestedRecord) => nestedRecord.title).join(', ') }}</span>
                            </template>
                            <template v-else>{{ detail.value.text }}</template>
                          </dd>
                        </div>
                      </dl>
                    </li>
                  </ul>
                </template>
                <template v-else>{{ field.value.text }}</template>
              </dd>
            </div>
          </dl>
        </li>
      </ul>
    </section>
  </PageDslBlock>
</template>

<style scoped>
.record-list {
  width: 100%;
}

.record-list__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.record-list__context,
.record-list__count {
  margin: 0;
  color: rgb(71 85 105);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.record-list__count {
  color: rgb(15 118 110);
}

.record-list__empty {
  margin: 0;
  border: 1px dashed rgb(203 213 225);
  border-radius: 8px;
  padding: 22px;
  color: rgb(100 116 139);
  text-align: center;
}

.record-list__items {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.record-list__item {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 14px;
  background: rgb(255 255 255);
}

.record-list__item h3 {
  margin: 0 0 12px;
  color: rgb(15 23 42);
  font-size: 15px;
  line-height: 1.4;
}

.record-list__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
  margin: 0;
}

.record-list__field {
  min-width: 0;
}

.record-list__field dt {
  margin: 0 0 4px;
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.record-list__field dd {
  overflow-wrap: anywhere;
  margin: 0;
  border-radius: 6px;
  padding: 7px 9px;
  background: rgb(248 250 252);
  color: rgb(15 23 42);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.record-list__nested-items {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.record-list__nested-item {
  display: grid;
  gap: 6px;
  border: 1px solid rgb(226 232 240);
  border-radius: 6px;
  padding: 8px;
  background: rgb(255 255 255);
}

.record-list__nested-title {
  overflow-wrap: anywhere;
  color: rgb(15 23 42);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.record-list__nested-fields {
  display: grid;
  gap: 4px;
  margin: 0;
}

.record-list__nested-field {
  display: grid;
  grid-template-columns: minmax(54px, max-content) minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.record-list__nested-field dt,
.record-list__nested-field dd {
  margin: 0;
  padding: 0;
  background: transparent;
  color: rgb(71 85 105);
  font-size: 12px;
  line-height: 1.45;
  white-space: normal;
}

.record-list__nested-field dt {
  font-family: inherit;
  font-weight: 700;
}

.record-list__nested-field dd {
  overflow-wrap: anywhere;
}

:global(.dark) .record-list__context,
:global(.dark) .record-list__field dt {
  color: rgb(148 163 184);
}

:global(.dark) .record-list__count {
  color: rgb(94 234 212);
}

:global(.dark) .record-list__empty,
:global(.dark) .record-list__item {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .record-list__item h3,
:global(.dark) .record-list__field dd {
  color: rgb(241 245 249);
}

:global(.dark) .record-list__field dd {
  background: rgb(30 41 59);
}

:global(.dark) .record-list__nested-item {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .record-list__nested-title {
  color: rgb(241 245 249);
}

:global(.dark) .record-list__nested-field dt,
:global(.dark) .record-list__nested-field dd {
  color: rgb(203 213 225);
}

@media (max-width: 640px) {
  .record-list__fields {
    grid-template-columns: 1fr;
  }
}
</style>
