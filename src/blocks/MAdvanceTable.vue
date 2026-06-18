<script lang="ts">
import { defineEditorTool, type EditorToolPropertyField } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import MDatasourceEditor from '@/blocks/MDatasourceEditor.vue';
import MAdvanceTableColumnsEditor from '@/blocks/MAdvanceTableColumnsEditor.vue';
import {
  getParagraphText,
  normalizeStoredBlocks,
  type StoredBlock
} from '@/utils/storedBlocks';
import {
  normalizeDatasource,
  type MDatasourceApiObject
} from '@/utils/datasource';
import { isRecord } from '@/utils/datasourceSchema';
import {
  normalizeAdvanceTableColumns as normalizeColumns,
  type MAdvanceTableColumnConfig
} from '@/utils/advanceTableColumns';

export type {
  MAdvanceTableColumnConfig,
  MAdvanceTableFixed
} from '@/utils/advanceTableColumns';

export interface MAdvanceTableProps {
  edit: boolean;
  index?: boolean;
  selection?: boolean;
  showPageBreak?: boolean;
  columns?: MAdvanceTableColumnConfig[];
  ds?: MDatasourceApiObject;
}

function getDatasourceExternalFields() {
  return [
    {
      label: i18n.t('advanceTable.datasourceFields.data'),
      variable: 'data'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.page'),
      variable: 'page'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.pageSize'),
      variable: 'pageSize'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.total'),
      variable: 'total'
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
    get fields(): EditorToolPropertyField[] {
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
        },
        {
          key: 'showPageBreak',
          label: i18n.t('advanceTable.properties.showPageBreak'),
          type: 'checkbox' as const
        },
        {
          key: 'columns',
          label: i18n.t('advanceTable.properties.columns'),
          type: 'component' as const,
          component: MAdvanceTableColumnsEditor
        },
        {
          key: 'ds',
          label: i18n.t('advanceTable.properties.ds'),
          type: 'component' as const,
          component: MDatasourceEditor,
          getComponentProps: ({ value, state }) => ({
            value,
            matchingExternalFields: getDatasourceExternalFields(),
            showPageBreak: state.showPageBreak === true
          })
        }
      ];
    }
  },
  createInitialProps: () => ({
    index: false,
    selection: false
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    index: props.index === true,
    selection: props.selection === true,
    showPageBreak: props.showPageBreak === true,
    columns: normalizeColumns(props.columns),
    ds: normalizeDatasourceConfig(props.ds)
  }),
  serialize: (props) => {
    const ds = normalizeDatasourceConfig(props.ds);
    const columns = normalizeColumns(props.columns);
    return {
      index: props.index === true,
      selection: props.selection === true,
      showPageBreak: props.showPageBreak === true,
      ...(columns.length ? { columns } : {}),
      ...(ds ? { ds } : {})
    };
  }
});

function normalizeDatasourceConfig(value: unknown): MDatasourceApiObject | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const datasource = normalizeDatasource(value);
  return datasource.type === 'API' ? datasource : undefined;
}

</script>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useEditorBlockToolbarAlignment } from '@/composables/useEditorBlockToolbarAlignment';
import { getInlineCustomComponentDefinition } from '@/editors/inlineCustomComponents';
import { useI18n } from '@/i18n';
import {
  resolveDatasourceRuntimeData,
  type DatasourceRuntimeMatchingExternalFieldData
} from '@/utils/datasourceRuntime';

const props = defineProps<MAdvanceTableProps & {
  onChange?: (payload: MAdvanceTableProps) => void;
  onToolChange?: (payload: MAdvanceTableProps) => void;
}>();

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

const { t } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const selectedRows = ref(new Set<number>());
const tableData = shallowRef<Record<string, unknown>[]>([]);
const paginationState = ref<PaginationState>({
  page: 1,
  pageSize: 10,
  total: 0
});
const datasourceLoading = ref(false);
const datasourceError = ref('');
let datasourceLoadId = 0;

const normalizedColumns = computed(() => normalizeColumns(props.columns));
const normalizedDatasource = computed(() => normalizeDatasourceConfig(props.ds));
const normalizedData = computed(() => tableData.value);
const hasConfiguredColumns = computed(() => normalizedColumns.value.length > 0);
const displayRows = computed(() => hasConfiguredColumns.value ? normalizedData.value : []);
const hasSelectionColumn = computed(() => props.selection === true);
const hasIndexColumn = computed(() => props.index === true);
const shouldShowPageBreak = computed(() => props.showPageBreak === true);
const pagination = computed(() => {
  const pageSize = normalizePositiveIntegerValue(paginationState.value.pageSize, 10);
  const total = normalizeNonNegativeIntegerValue(paginationState.value.total, 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(normalizePositiveIntegerValue(paginationState.value.page, 1), 1), totalPages);
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
const paginationSummary = computed(() => t('advanceTable.pagination.summary')
  .replace('{start}', String(pagination.value.start))
  .replace('{end}', String(pagination.value.end))
  .replace('{total}', String(pagination.value.total))
  .replace('{page}', String(pagination.value.currentPage))
  .replace('{totalPages}', String(pagination.value.totalPages)));
const shouldShowEmptyRow = computed(() =>
  !hasConfiguredColumns.value ||
  datasourceLoading.value ||
  Boolean(datasourceError.value) ||
  (!normalizedDatasource.value && !displayRows.value.length) ||
  !displayRows.value.length
);
const emptyMessage = computed(() => {
  if (!hasConfiguredColumns.value) return t('advanceTable.noColumns');
  if (datasourceLoading.value) return t('advanceTable.loading');
  if (datasourceError.value) return datasourceError.value;
  if (!normalizedDatasource.value && !displayRows.value.length) return t('advanceTable.noDatasource');
  return t('advanceTable.empty');
});
const emptyColumnSpan = computed(() => Math.max(
  1,
  normalizedColumns.value.length + (hasSelectionColumn.value ? 1 : 0) + (hasIndexColumn.value ? 1 : 0)
));
const selectionColumnWidth = 44;
const indexColumnWidth = 56;
const fallbackFixedColumnWidth = 160;

useEditorBlockToolbarAlignment(rootRef);

function normalizeRuntimeRows(value: unknown): Record<string, unknown>[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => isRecord(item))) {
    return undefined;
  }

  return value.map((row) => ({ ...row }));
}

function normalizePositiveIntegerValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : fallback;
  const normalized = Math.trunc(parsed);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

function normalizeNonNegativeIntegerValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : fallback;
  const normalized = Math.trunc(parsed);
  return Number.isFinite(normalized) && normalized >= 0 ? normalized : fallback;
}

function getMatchedRuntimeField(
  fields: DatasourceRuntimeMatchingExternalFieldData[],
  variable: string
) {
  return fields.find((field) => field.variable === variable);
}

function getMatchedRuntimeValue(
  fields: DatasourceRuntimeMatchingExternalFieldData[],
  variable: string
) {
  return getMatchedRuntimeField(fields, variable)?.value;
}

function resetRuntimeData() {
  tableData.value = [];
  paginationState.value = {
    page: 1,
    pageSize: 10,
    total: 0
  };
}

async function loadDatasourceRows() {
  const datasource = normalizedDatasource.value;
  const loadId = ++datasourceLoadId;
  selectedRows.value = new Set();
  resetRuntimeData();

  if (!datasource) {
    datasourceLoading.value = false;
    datasourceError.value = '';
    return;
  }

  datasourceLoading.value = true;
  datasourceError.value = '';

  try {
    const runtimeData = await resolveDatasourceRuntimeData(datasource);
    if (loadId !== datasourceLoadId) return;

    const matchedDataField = runtimeData.matchingExternalFieldData.find((field) => field.variable === 'data');
    if (!matchedDataField?.matchFieldPath) {
      datasourceError.value = t('advanceTable.missingMatchedField');
      return;
    }

    const rows = normalizeRuntimeRows(matchedDataField.value);
    if (!rows) {
      datasourceError.value = t('advanceTable.invalidMatchedData');
      return;
    }

    tableData.value = rows;
    paginationState.value = {
      page: normalizePositiveIntegerValue(getMatchedRuntimeValue(runtimeData.matchingExternalFieldData, 'page'), 1),
      pageSize: normalizePositiveIntegerValue(getMatchedRuntimeValue(runtimeData.matchingExternalFieldData, 'pageSize'), 10),
      total: normalizeNonNegativeIntegerValue(getMatchedRuntimeValue(runtimeData.matchingExternalFieldData, 'total'), 0)
    };
  } catch {
    if (loadId !== datasourceLoadId) return;
    datasourceError.value = t('advanceTable.loadFailed');
  } finally {
    if (loadId === datasourceLoadId) {
      datasourceLoading.value = false;
    }
  }
}

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

function getCellBlocks(row: Record<string, unknown>, column: MAdvanceTableColumnConfig): StoredBlock[] {
  return normalizeStoredBlocks(column.columnContent).map((block) => {
    if (block.type === 'paragraph') {
      return {
        ...block,
        data: {
          text: interpolateValue(getParagraphText(block), row)
        }
      };
    }

    return {
      ...block,
      data: interpolateComponentData(block.data, row) as Record<string, unknown>
    };
  });
}

function getPreviewComponent(type: string) {
  return getInlineCustomComponentDefinition(type)?.component ?? null;
}

function getPreviewProps(block: StoredBlock) {
  const definition = getInlineCustomComponentDefinition(block.type);
  if (!definition) return { edit: false };
  return definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    ...block.data,
    edit: false
  });
}

function getBlockText(block: StoredBlock) {
  return getParagraphText(block);
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
  return displayRows.value.length > 0 && displayRows.value.every((_, index) => selectedRows.value.has(index));
}

function toggleAllRows() {
  if (isAllRowsSelected()) {
    selectedRows.value = new Set();
    return;
  }

  selectedRows.value = new Set(displayRows.value.map((_, index) => index));
}

watch(
  () => props.ds,
  () => {
    void loadDatasourceRows();
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div ref="rootRef" class="ce-advance-table-tool" data-testid="editor-advance-table-tool">
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
            v-for="(row, rowIndex) in displayRows"
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
                v-for="(block, blockIndex) in getCellBlocks(row, column)"
                :key="`${rowIndex}-${columnIndex}-${block.id}-${block.type}-${blockIndex}`"
              >
                <span v-if="block.type === 'paragraph'" class="ce-advance-table-tool__cell-text">{{ getBlockText(block) }}</span>
                <span v-else class="ce-advance-table-tool__cell-token">
                  <component :is="getPreviewComponent(block.type)" v-bind="getPreviewProps(block)" />
                </span>
              </template>
            </td>
          </tr>
          <tr v-if="shouldShowEmptyRow">
            <td
              class="ce-advance-table-tool__cell ce-advance-table-tool__empty"
              :colspan="emptyColumnSpan"
            >
              {{ emptyMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="shouldShowPageBreak"
      class="ce-advance-table-tool__pagination"
      data-testid="advance-table-pagination"
    >
      <p data-testid="advance-table-pagination-summary">{{ paginationSummary }}</p>
      <div class="ce-advance-table-tool__pagination-actions" :aria-label="t('advanceTable.pagination.label')">
        <button type="button" :disabled="!pagination.hasPreviousPage">
          {{ t('advanceTable.pagination.previous') }}
        </button>
        <button type="button" :disabled="!pagination.hasNextPage">
          {{ t('advanceTable.pagination.next') }}
        </button>
      </div>
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

.ce-advance-table-tool__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgb(226 232 240);
  border-top: 0;
  border-radius: 0 0 8px 8px;
  padding: 10px 12px;
  background: rgb(248 250 252);
}

.ce-advance-table-tool__scroller:has(+ .ce-advance-table-tool__pagination) {
  border-radius: 8px 8px 0 0;
}

.ce-advance-table-tool__pagination p {
  margin: 0;
  color: rgb(71 85 105);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.ce-advance-table-tool__pagination-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.ce-advance-table-tool__pagination button {
  min-width: 72px;
  height: 36px;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: default;
}

.ce-advance-table-tool__pagination button:disabled {
  color: rgb(148 163 184);
  background: rgb(248 250 252);
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

:global(.dark) .ce-advance-table-tool__pagination {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
}

:global(.dark) .ce-advance-table-tool__pagination p {
  color: rgb(203 213 225);
}

:global(.dark) .ce-advance-table-tool__pagination button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.dark) .ce-advance-table-tool__pagination button:disabled {
  color: rgb(100 116 139);
  background: rgb(2 6 23);
}

@media (max-width: 640px) {
  .ce-advance-table-tool__pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
