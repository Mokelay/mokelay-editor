<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type MAdvanceTableFixed = 'left' | 'right' | '' | null;

type EmbeddedBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

type StoredSegment =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'component';
      component: EmbeddedBlock;
    };

export interface MAdvanceTableColumnConfig {
  columnName?: string;
  columnContent?: StoredSegment[] | string;
  width?: number | null;
  fixed?: MAdvanceTableFixed;
}

export interface MAdvanceTableProps {
  edit: boolean;
  index?: boolean;
  selection?: boolean;
  columns?: MAdvanceTableColumnConfig[];
  data?: Array<Record<string, unknown>>;
}

function getTextValue(text: string) {
  return [{ type: 'text', text }] satisfies StoredSegment[];
}

function getTagValue() {
  return [
    {
      type: 'component',
      component: {
        id: 'advance-table-default-tag',
        type: 'MTag',
        data: {
          tagName: '{{tag}}',
          type: '{{tagType}}',
          size: 'small',
          color: '',
          closable: false
        }
      }
    }
  ] satisfies StoredSegment[];
}

function getDefaultColumns(): MAdvanceTableColumnConfig[] {
  return [
    {
      columnName: i18n.t('advanceTable.defaultColumns.name'),
      columnContent: getTextValue('{{name}}'),
      width: 180,
      fixed: 'left'
    },
    {
      columnName: i18n.t('advanceTable.defaultColumns.status'),
      columnContent: getTextValue('{{status}}'),
      width: 140,
      fixed: null
    },
    {
      columnName: i18n.t('advanceTable.defaultColumns.tag'),
      columnContent: getTagValue(),
      width: 120,
      fixed: null
    },
    {
      columnName: i18n.t('advanceTable.defaultColumns.owner'),
      columnContent: getTextValue('{{owner}}'),
      width: 160,
      fixed: null
    }
  ];
}

function getDefaultData(): Array<Record<string, unknown>> {
  return [
    {
      name: i18n.t('advanceTable.defaultRows.first.name'),
      status: i18n.t('advanceTable.defaultRows.first.status'),
      tag: i18n.t('advanceTable.defaultRows.first.tag'),
      tagType: 'warning',
      owner: i18n.t('advanceTable.defaultRows.first.owner')
    },
    {
      name: i18n.t('advanceTable.defaultRows.second.name'),
      status: i18n.t('advanceTable.defaultRows.second.status'),
      tag: i18n.t('advanceTable.defaultRows.second.tag'),
      tagType: 'success',
      owner: i18n.t('advanceTable.defaultRows.second.owner')
    }
  ];
}

export const mAdvanceTableEditorTool = defineEditorTool<MAdvanceTableProps>({
  toolbox: {
    get title() {
      return i18n.t('advanceTable.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18M8 5v14M16 5v14" stroke="currentColor" stroke-width="2"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('advanceTable.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'index',
          label: i18n.t('advanceTable.properties.index'),
          type: 'checkbox' as const
        },
        {
          key: 'selection',
          label: i18n.t('advanceTable.properties.selection'),
          type: 'checkbox' as const
        }
      ];
    }
  },
  createInitialProps: () => ({
    index: false,
    selection: false,
    columns: getDefaultColumns(),
    data: getDefaultData()
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    index: props.index === true,
    selection: props.selection === true,
    columns: normalizeColumns(props.columns),
    data: normalizeData(props.data)
  }),
  serialize: (props) => ({
    index: props.index === true,
    selection: props.selection === true,
    columns: normalizeColumns(props.columns),
    data: normalizeData(props.data)
  })
});

function normalizeColumns(columns?: MAdvanceTableColumnConfig[]) {
  if (!Array.isArray(columns) || !columns.length) {
    return getDefaultColumns();
  }

  const normalized = columns
    .filter((column): column is MAdvanceTableColumnConfig => typeof column === 'object' && column !== null)
    .map((column, index) => ({
      columnName: column.columnName?.trim() || `${i18n.t('advanceTable.defaultColumnName')}${index + 1}`,
      columnContent: parseStoredSegments(column.columnContent),
      width: normalizeWidth(column.width),
      fixed: normalizeFixed(column.fixed)
    }));

  return normalized.length ? normalized : getDefaultColumns();
}

function normalizeData(data?: Array<Record<string, unknown>>) {
  if (!Array.isArray(data)) {
    return getDefaultData();
  }

  return data.filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null && !Array.isArray(row));
}

function normalizeWidth(width?: number | null) {
  if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0) {
    return null;
  }

  return Math.round(width);
}

function normalizeFixed(fixed?: MAdvanceTableFixed) {
  return fixed === 'left' || fixed === 'right' ? fixed : null;
}

function mergeTextSegments(segments: StoredSegment[]) {
  const merged: StoredSegment[] = [];

  for (const segment of segments) {
    if (segment.type === 'text') {
      const previous = merged[merged.length - 1];
      if (previous?.type === 'text') {
        previous.text += segment.text;
      } else {
        merged.push({ type: 'text', text: segment.text });
      }
      continue;
    }

    merged.push(segment);
  }

  return merged.length ? merged : getTextValue('');
}

function parseStoredSegments(value?: StoredSegment[] | string): StoredSegment[] {
  if (!value) {
    return getTextValue('');
  }

  if (Array.isArray(value)) {
    return normalizeStoredSegments(value);
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return normalizeStoredSegments(parsed);
    }
  } catch {
    // 兼容普通字符串配置。
  }

  return getTextValue(value);
}

function normalizeStoredSegments(segments: unknown[]) {
  const normalizedSegments: StoredSegment[] = [];

  segments.forEach((item) => {
    if (typeof item !== 'object' || item === null || !('type' in item)) {
      return;
    }

    const record = item as Record<string, unknown>;

    if (record.type === 'text') {
      normalizedSegments.push({
        type: 'text',
        text: typeof record.text === 'string' ? record.text : ''
      });
      return;
    }

    if (
      record.type === 'component' &&
      typeof record.component === 'object' &&
      record.component !== null &&
      typeof (record.component as Partial<EmbeddedBlock>).type === 'string'
    ) {
      const component = record.component as Partial<EmbeddedBlock>;
      normalizedSegments.push({
        type: 'component',
        component: {
          id: typeof component.id === 'string' ? component.id : component.type ?? 'component',
          type: component.type ?? '',
          data: toPlainRecord(component.data)
        }
      });
    }
  });

  return mergeTextSegments(normalizedSegments);
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toPlainRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return cloneJsonValue(value) as Record<string, unknown>;
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getInlineCustomComponentDefinition } from '@/editors/inlineCustomComponents';
import { useI18n } from '@/i18n';

type RenderSegment =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'component';
      component: EmbeddedBlock;
    };

const props = defineProps<MAdvanceTableProps & {
  onChange?: (payload: MAdvanceTableProps) => void;
  onToolChange?: (payload: MAdvanceTableProps) => void;
}>();

const { t } = useI18n();
const selectedRows = ref(new Set<number>());

const normalizedColumns = computed(() => normalizeColumns(props.columns));
const normalizedData = computed(() => normalizeData(props.data));
const hasSelectionColumn = computed(() => props.selection === true);
const hasIndexColumn = computed(() => props.index === true);
const selectionColumnWidth = 44;
const indexColumnWidth = 56;
const fallbackFixedColumnWidth = 160;

function stringifyCellValue(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function interpolateValue(value: string, row: Record<string, unknown>) {
  return value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, path: string) => stringifyCellValue(readRowPath(row, path)));
}

function readRowPath(row: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((current, key) => {
    if (typeof current !== 'object' || current === null || !(key in current)) {
      return '';
    }

    return (current as Record<string, unknown>)[key];
  }, row);
}

function resolveCellContent(row: Record<string, unknown>, column: MAdvanceTableColumnConfig) {
  const columnContent = column.columnContent;
  if (typeof columnContent === 'string') {
    if (columnContent in row) {
      return stringifyCellValue(row[columnContent]);
    }

    return columnContent;
  }

  if (Array.isArray(columnContent)) {
    return columnContent;
  }

  if (column.columnName && column.columnName in row) {
    return stringifyCellValue(row[column.columnName]);
  }

  return getTextValue('');
}

function interpolateComponentData(value: unknown, row: Record<string, unknown>): unknown {
  if (typeof value === 'string') {
    return interpolateValue(value, row);
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateComponentData(item, row));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, interpolateComponentData(item, row)])
    );
  }

  return value;
}

function getCellSegments(row: Record<string, unknown>, column: MAdvanceTableColumnConfig): RenderSegment[] {
  return parseStoredSegments(resolveCellContent(row, column)).map((segment) => {
    if (segment.type === 'text') {
      return {
        type: 'text',
        text: interpolateValue(segment.text, row)
      };
    }

    return {
      type: 'component',
      component: {
        ...segment.component,
        data: interpolateComponentData(segment.component.data, row) as Record<string, unknown>
      }
    };
  });
}

function getPreviewComponent(type: string) {
  return getInlineCustomComponentDefinition(type)?.component ?? null;
}

function getPreviewProps(block: EmbeddedBlock) {
  const definition = getInlineCustomComponentDefinition(block.type);
  if (!definition) return { edit: false };
  return definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...block.data,
    edit: false
  });
}

function getColumnWidth(column: MAdvanceTableColumnConfig) {
  return column.width ?? null;
}

function getFixedColumnWidth(column: MAdvanceTableColumnConfig) {
  return getColumnWidth(column) ?? fallbackFixedColumnWidth;
}

function getLeftOffset(columnIndex: number) {
  let offset = 0;
  if (hasSelectionColumn.value) offset += selectionColumnWidth;
  if (hasIndexColumn.value) offset += indexColumnWidth;

  for (let index = 0; index < columnIndex; index += 1) {
    const column = normalizedColumns.value[index];
    if (column?.fixed === 'left') {
      offset += getFixedColumnWidth(column);
    }
  }

  return offset;
}

function getRightOffset(columnIndex: number) {
  let offset = 0;

  for (let index = normalizedColumns.value.length - 1; index > columnIndex; index -= 1) {
    const column = normalizedColumns.value[index];
    if (column?.fixed === 'right') {
      offset += getFixedColumnWidth(column);
    }
  }

  return offset;
}

function getColumnStyle(column: MAdvanceTableColumnConfig, columnIndex: number) {
  const width = getColumnWidth(column);
  const style: Record<string, string> = {};

  if (width) {
    style.width = `${width}px`;
    style.minWidth = `${width}px`;
  }

  if (column.fixed === 'left') {
    style.position = 'sticky';
    style.left = `${getLeftOffset(columnIndex)}px`;
  }

  if (column.fixed === 'right') {
    style.position = 'sticky';
    style.right = `${getRightOffset(columnIndex)}px`;
  }

  return style;
}

function getFixedClass(column: MAdvanceTableColumnConfig) {
  return {
    'ce-advance-table-tool__cell--fixed-left': column.fixed === 'left',
    'ce-advance-table-tool__cell--fixed-right': column.fixed === 'right'
  };
}

function getSelectionStyle() {
  return {
    width: `${selectionColumnWidth}px`,
    minWidth: `${selectionColumnWidth}px`,
    left: '0px'
  };
}

function getIndexStyle() {
  return {
    width: `${indexColumnWidth}px`,
    minWidth: `${indexColumnWidth}px`,
    left: `${hasSelectionColumn.value ? selectionColumnWidth : 0}px`
  };
}

function isRowSelected(rowIndex: number) {
  return selectedRows.value.has(rowIndex);
}

function toggleRow(rowIndex: number) {
  const nextSelectedRows = new Set(selectedRows.value);
  if (nextSelectedRows.has(rowIndex)) {
    nextSelectedRows.delete(rowIndex);
  } else {
    nextSelectedRows.add(rowIndex);
  }
  selectedRows.value = nextSelectedRows;
}

function isAllRowsSelected() {
  return normalizedData.value.length > 0 && normalizedData.value.every((_, index) => selectedRows.value.has(index));
}

function toggleAllRows() {
  if (isAllRowsSelected()) {
    selectedRows.value = new Set();
    return;
  }

  selectedRows.value = new Set(normalizedData.value.map((_, index) => index));
}
</script>

<template>
  <div class="ce-advance-table-tool" data-testid="editor-advance-table-tool">
    <div class="ce-advance-table-tool__scroller">
      <table class="ce-advance-table-tool__table" data-testid="advance-table">
        <thead>
          <tr>
            <th
              v-if="selection"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--header ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :style="getSelectionStyle()"
              data-testid="advance-table-selection-header"
            >
              <input
                class="ce-advance-table-tool__checkbox"
                type="checkbox"
                :checked="isAllRowsSelected()"
                :aria-label="t('advanceTable.selectAll')"
                @change="toggleAllRows"
              />
            </th>
            <th
              v-if="index"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--header ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :style="getIndexStyle()"
              data-testid="advance-table-index-header"
            >
              #
            </th>
            <th
              v-for="(column, columnIndex) in normalizedColumns"
              :key="`header-${columnIndex}`"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--header"
              :class="getFixedClass(column)"
              :style="getColumnStyle(column, columnIndex)"
              :data-testid="`advance-table-header-${columnIndex}`"
            >
              {{ column.columnName }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in normalizedData"
            :key="`row-${rowIndex}`"
            class="ce-advance-table-tool__row"
            :class="{ 'ce-advance-table-tool__row--selected': isRowSelected(rowIndex) }"
            :data-testid="`advance-table-row-${rowIndex}`"
          >
            <td
              v-if="selection"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :style="getSelectionStyle()"
              :data-testid="`advance-table-selection-cell-${rowIndex}`"
            >
              <input
                class="ce-advance-table-tool__checkbox"
                type="checkbox"
                :checked="isRowSelected(rowIndex)"
                :aria-label="t('advanceTable.selectRow')"
                @change="toggleRow(rowIndex)"
              />
            </td>
            <td
              v-if="index"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :style="getIndexStyle()"
              :data-testid="`advance-table-index-cell-${rowIndex}`"
            >
              {{ rowIndex + 1 }}
            </td>
            <td
              v-for="(column, columnIndex) in normalizedColumns"
              :key="`cell-${rowIndex}-${columnIndex}`"
              class="ce-advance-table-tool__cell"
              :class="getFixedClass(column)"
              :style="getColumnStyle(column, columnIndex)"
              :data-testid="`advance-table-cell-${rowIndex}-${columnIndex}`"
            >
              <template
                v-for="(segment, segmentIndex) in getCellSegments(row, column)"
                :key="`${rowIndex}-${columnIndex}-${segment.type}-${segmentIndex}`"
              >
                <span v-if="segment.type === 'text'" class="ce-advance-table-tool__cell-text">{{ segment.text }}</span>
                <span v-else class="ce-advance-table-tool__cell-token">
                  <component :is="getPreviewComponent(segment.component.type)" v-bind="getPreviewProps(segment.component)" />
                </span>
              </template>
            </td>
          </tr>
          <tr v-if="!normalizedData.length">
            <td
              class="ce-advance-table-tool__cell ce-advance-table-tool__empty"
              :colspan="normalizedColumns.length + (selection ? 1 : 0) + (index ? 1 : 0)"
            >
              {{ t('advanceTable.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.ce-advance-table-tool {
  width: 100%;
  color: rgb(15 23 42);
}

.ce-advance-table-tool__scroller {
  width: 100%;
  overflow: auto;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-advance-table-tool__table {
  width: 100%;
  min-width: 520px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  line-height: 20px;
}

.ce-advance-table-tool__cell {
  border-right: 1px solid rgb(226 232 240);
  border-bottom: 1px solid rgb(226 232 240);
  padding: 10px 12px;
  background: rgb(255 255 255);
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.ce-advance-table-tool__cell:last-child {
  border-right: 0;
}

.ce-advance-table-tool__cell--header {
  position: sticky;
  top: 0;
  z-index: 3;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-weight: 600;
}

.ce-advance-table-tool__cell--control {
  padding: 10px;
  text-align: center;
}

.ce-advance-table-tool__cell--fixed-left,
.ce-advance-table-tool__cell--fixed-right {
  z-index: 2;
}

.ce-advance-table-tool__cell--header.ce-advance-table-tool__cell--fixed-left,
.ce-advance-table-tool__cell--header.ce-advance-table-tool__cell--fixed-right {
  z-index: 4;
}

.ce-advance-table-tool__cell--fixed-left {
  box-shadow: 1px 0 0 rgb(226 232 240);
}

.ce-advance-table-tool__cell--fixed-right {
  box-shadow: -1px 0 0 rgb(226 232 240);
}

.ce-advance-table-tool__row--selected .ce-advance-table-tool__cell {
  background: rgb(239 246 255);
}

.ce-advance-table-tool__checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  vertical-align: middle;
  accent-color: rgb(37 99 235);
}

.ce-advance-table-tool__cell-token {
  display: inline-flex;
  align-items: center;
  margin: 0 2px;
  vertical-align: middle;
}

.ce-advance-table-tool__empty {
  color: rgb(100 116 139);
  text-align: center;
}

:global(.dark) .ce-advance-table-tool {
  color: rgb(226 232 240);
}

:global(.dark) .ce-advance-table-tool__scroller {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .ce-advance-table-tool__cell {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

:global(.dark) .ce-advance-table-tool__cell--header {
  background: rgb(30 41 59);
  color: rgb(241 245 249);
}

:global(.dark) .ce-advance-table-tool__cell--fixed-left {
  box-shadow: 1px 0 0 rgb(51 65 85);
}

:global(.dark) .ce-advance-table-tool__cell--fixed-right {
  box-shadow: -1px 0 0 rgb(51 65 85);
}

:global(.dark) .ce-advance-table-tool__row--selected .ce-advance-table-tool__cell {
  background: rgb(30 58 138 / 0.35);
}

:global(.dark) .ce-advance-table-tool__empty {
  color: rgb(148 163 184);
}
</style>
