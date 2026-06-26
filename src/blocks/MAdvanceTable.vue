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
  type MDatasourceApiObject,
  type MDatasourceBodyItem,
  type MDatasourceKeyValueItem
} from '@/utils/datasource';
import type { BlockDataField, VariableValueConfig } from '@/utils/variableValue';
import { isRecord } from '@/utils/datasourceSchema';
import {
  normalizeAdvanceTableColumns as normalizeColumns,
  type ConditionConfig,
  type MAdvanceTableAlign,
  type MAdvanceTableColumnConfig
} from '@/utils/advanceTableColumns';

export type {
  ConditionConfig,
  MAdvanceTableColumnConfig,
  MAdvanceTableFixed
} from '@/utils/advanceTableColumns';

export type TableSelectionConfig = {
  enabled?: boolean;
  reserveSelection?: boolean;
  rowKey?: string;
  disabledWhen?: ConditionConfig;
};

export type TablePaginationConfig = {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  pageSizes?: number[];
  layout?: Array<'total' | 'sizes' | 'prev' | 'pager' | 'next' | 'jumper'>;
  hideOnSinglePage?: boolean;
  resetPageOnQuery?: boolean;
};

export type TableRequestMapping = {
  page?: string;
  pageSize?: string;
  sortField?: string;
  sortOrder?: string;
  zeroBasedPage?: boolean;
};

export type TableResponseMapping = {
  rows?: string;
  total?: string;
  page?: string;
  pageSize?: string;
  totalPages?: string;
};

export type TableSortState = {
  prop?: string;
  order?: 'asc' | 'desc' | 'ascending' | 'descending' | '' | null;
};

export interface MAdvanceTableProps {
  edit: boolean;
  currentBlockId?: string;
  index?: boolean;
  selection?: boolean | TableSelectionConfig;
  showPageBreak?: boolean;
  columns?: MAdvanceTableColumnConfig[];
  ds?: MDatasourceApiObject;
  rowKey?: string;
  size?: 'small' | 'default' | 'large' | string;
  border?: boolean;
  stripe?: boolean;
  height?: number | string;
  maxHeight?: number | string;
  emptyText?: string;
  loadingText?: string;
  errorText?: string;
  pagination?: TablePaginationConfig;
  requestMapping?: TableRequestMapping;
  responseMapping?: TableResponseMapping;
  sort?: TableSortState;
  filters?: Record<string, unknown>;
}

function getAdvanceTableDataFields(): BlockDataField[] {
  return [
    {
      label: i18n.t('advanceTable.datasourceFields.data'),
      variable: 'data',
      dataType: 'array'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.page'),
      variable: 'page',
      dataType: 'number'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.pageSize'),
      variable: 'pageSize',
      dataType: 'number'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.total'),
      variable: 'total',
      dataType: 'number'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.rows'),
      variable: 'rows',
      dataType: 'array'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.query'),
      variable: 'query',
      dataType: 'object'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.sort'),
      variable: 'sort',
      dataType: 'object'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.filters'),
      variable: 'filters',
      dataType: 'object'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.selectedRows'),
      variable: 'selectedRows',
      dataType: 'array'
    },
    {
      label: i18n.t('advanceTable.datasourceFields.keys'),
      variable: 'keys',
      dataType: 'array'
    }
  ];
}

function getAdvanceTableDatasourceFields(): BlockDataField[] {
  return getAdvanceTableDataFields().filter((field) => ['data', 'page', 'pageSize', 'total'].includes(field.variable));
}

function normalizeDatasourceConfig(value: unknown): MDatasourceApiObject | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const datasource = normalizeDatasource(value);
  return datasource.type === 'API' ? datasource : undefined;
}

function normalizeSelectionConfig(value: unknown): boolean | TableSelectionConfig {
  if (value === true || value === false) return value;
  if (!isRecord(value)) return false;

  const rowKey = typeof value.rowKey === 'string' ? value.rowKey.trim() : '';
  const disabledWhen = isRecord(value.disabledWhen) ? value.disabledWhen as ConditionConfig : undefined;

  return {
    enabled: value.enabled !== false,
    reserveSelection: value.reserveSelection === true,
    ...(rowKey ? { rowKey } : {}),
    ...(disabledWhen ? { disabledWhen } : {})
  };
}

function normalizePositiveIntegerConfig(value: unknown, fallback?: number) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : fallback;
  if (typeof parsed !== 'number') return undefined;
  const normalized = Math.trunc(parsed);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

function normalizeNonNegativeIntegerConfig(value: unknown, fallback?: number) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : fallback;
  if (typeof parsed !== 'number') return undefined;
  const normalized = Math.trunc(parsed);
  return Number.isFinite(normalized) && normalized >= 0 ? normalized : fallback;
}

function normalizePaginationConfig(value: unknown): TablePaginationConfig | undefined {
  if (!isRecord(value)) return undefined;

  const page = normalizePositiveIntegerConfig(value.page);
  const pageSize = normalizePositiveIntegerConfig(value.pageSize);
  const total = normalizeNonNegativeIntegerConfig(value.total);
  const pageSizes = Array.isArray(value.pageSizes)
    ? value.pageSizes
      .map((item) => normalizePositiveIntegerConfig(item))
      .filter((item): item is number => typeof item === 'number')
    : undefined;
  const layoutValues = new Set(['total', 'sizes', 'prev', 'pager', 'next', 'jumper']);
  const layout = Array.isArray(value.layout)
    ? value.layout.filter((item): item is NonNullable<TablePaginationConfig['layout']>[number] => typeof item === 'string' && layoutValues.has(item))
    : undefined;

  return {
    ...(typeof value.enabled === 'boolean' ? { enabled: value.enabled } : {}),
    ...(page ? { page } : {}),
    ...(pageSize ? { pageSize } : {}),
    ...(total !== undefined ? { total } : {}),
    ...(pageSizes?.length ? { pageSizes } : {}),
    ...(layout?.length ? { layout } : {}),
    ...(value.hideOnSinglePage === true ? { hideOnSinglePage: true } : {}),
    ...(value.resetPageOnQuery === false ? { resetPageOnQuery: false } : value.resetPageOnQuery === true ? { resetPageOnQuery: true } : {})
  };
}

function normalizeRequestMapping(value: unknown): TableRequestMapping | undefined {
  if (!isRecord(value)) return undefined;
  const result: TableRequestMapping = {};
  if (typeof value.page === 'string' && value.page.trim()) result.page = value.page.trim();
  if (typeof value.pageSize === 'string' && value.pageSize.trim()) result.pageSize = value.pageSize.trim();
  if (typeof value.sortField === 'string' && value.sortField.trim()) result.sortField = value.sortField.trim();
  if (typeof value.sortOrder === 'string' && value.sortOrder.trim()) result.sortOrder = value.sortOrder.trim();
  if (value.zeroBasedPage === true) result.zeroBasedPage = true;
  return Object.keys(result).length ? result : undefined;
}

function normalizeResponseMapping(value: unknown): TableResponseMapping | undefined {
  if (!isRecord(value)) return undefined;
  const result: TableResponseMapping = {};
  if (typeof value.rows === 'string' && value.rows.trim()) result.rows = value.rows.trim();
  if (typeof value.total === 'string' && value.total.trim()) result.total = value.total.trim();
  if (typeof value.page === 'string' && value.page.trim()) result.page = value.page.trim();
  if (typeof value.pageSize === 'string' && value.pageSize.trim()) result.pageSize = value.pageSize.trim();
  if (typeof value.totalPages === 'string' && value.totalPages.trim()) result.totalPages = value.totalPages.trim();
  return Object.keys(result).length ? result : undefined;
}

function normalizeSortState(value: unknown): TableSortState | undefined {
  if (!isRecord(value)) return undefined;
  const prop = typeof value.prop === 'string'
    ? value.prop.trim()
    : typeof value.field === 'string'
      ? value.field.trim()
      : '';
  const rawOrder = typeof value.order === 'string' ? value.order : '';
  const order = rawOrder === 'descending' || rawOrder === 'desc'
    ? 'desc'
    : rawOrder === 'ascending' || rawOrder === 'asc'
      ? 'asc'
      : '';

  return prop || order ? {
    ...(prop ? { prop } : {}),
    ...(order ? { order } : {})
  } : undefined;
}

function normalizeRecordConfig(value: unknown): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined;
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function normalizeDimension(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeTableSize(value: unknown) {
  return value === 'small' || value === 'large' || value === 'default' ? value : 'default';
}

function serializeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getDatasourceConfigSignature(value: MDatasourceApiObject | undefined) {
  if (!value) return '';

  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function normalizeMAdvanceTableProps(props: Partial<MAdvanceTableProps>): MAdvanceTableProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    index: props.index === true,
    selection: normalizeSelectionConfig(props.selection),
    showPageBreak: props.showPageBreak === true,
    columns: normalizeColumns(props.columns),
    ds: normalizeDatasourceConfig(props.ds),
    rowKey: serializeOptionalString(props.rowKey),
    size: normalizeTableSize(props.size),
    border: props.border === true,
    stripe: props.stripe === true,
    height: normalizeDimension(props.height),
    maxHeight: normalizeDimension(props.maxHeight),
    emptyText: serializeOptionalString(props.emptyText),
    loadingText: serializeOptionalString(props.loadingText),
    errorText: serializeOptionalString(props.errorText),
    pagination: normalizePaginationConfig(props.pagination),
    requestMapping: normalizeRequestMapping(props.requestMapping),
    responseMapping: normalizeResponseMapping(props.responseMapping),
    sort: normalizeSortState(props.sort),
    filters: normalizeRecordConfig(props.filters)
  };
}

function serializeMAdvanceTableProps(props: Partial<MAdvanceTableProps>) {
  const normalized = normalizeMAdvanceTableProps(props);
  const columns = normalizeColumns(normalized.columns);
  const ds = normalizeDatasourceConfig(normalized.ds);
  return {
    index: normalized.index === true,
    selection: normalized.selection ?? false,
    showPageBreak: normalized.showPageBreak === true,
    ...(columns.length ? { columns } : {}),
    ...(ds ? { ds } : {}),
    ...(normalized.rowKey ? { rowKey: normalized.rowKey } : {}),
    ...(normalized.size && normalized.size !== 'default' ? { size: normalized.size } : {}),
    ...(normalized.border ? { border: true } : {}),
    ...(normalized.stripe ? { stripe: true } : {}),
    ...(normalized.height ? { height: normalized.height } : {}),
    ...(normalized.maxHeight ? { maxHeight: normalized.maxHeight } : {}),
    ...(normalized.emptyText ? { emptyText: normalized.emptyText } : {}),
    ...(normalized.loadingText ? { loadingText: normalized.loadingText } : {}),
    ...(normalized.errorText ? { errorText: normalized.errorText } : {}),
    ...(normalized.pagination ? { pagination: normalized.pagination } : {}),
    ...(normalized.requestMapping ? { requestMapping: normalized.requestMapping } : {}),
    ...(normalized.responseMapping ? { responseMapping: normalized.responseMapping } : {}),
    ...(normalized.sort ? { sort: normalized.sort } : {}),
    ...(normalized.filters && Object.keys(normalized.filters).length ? { filters: normalized.filters } : {})
  };
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
          type: 'textarea' as const,
          valueType: 'json' as const
        },
        {
          key: 'rowKey',
          label: i18n.t('advanceTable.properties.rowKey'),
          placeholder: 'id'
        },
        {
          key: 'size',
          label: i18n.t('advanceTable.properties.size'),
          type: 'select' as const,
          options: [
            { label: i18n.t('advanceTable.sizes.small'), value: 'small' },
            { label: i18n.t('advanceTable.sizes.default'), value: 'default' },
            { label: i18n.t('advanceTable.sizes.large'), value: 'large' }
          ]
        },
        {
          key: 'border',
          label: i18n.t('advanceTable.properties.border'),
          type: 'checkbox' as const
        },
        {
          key: 'stripe',
          label: i18n.t('advanceTable.properties.stripe'),
          type: 'checkbox' as const
        },
        { key: 'height', label: i18n.t('advanceTable.properties.height') },
        { key: 'maxHeight', label: i18n.t('advanceTable.properties.maxHeight') },
        { key: 'emptyText', label: i18n.t('advanceTable.properties.emptyText') },
        { key: 'loadingText', label: i18n.t('advanceTable.properties.loadingText') },
        { key: 'errorText', label: i18n.t('advanceTable.properties.errorText') },
        {
          key: 'showPageBreak',
          label: i18n.t('advanceTable.properties.showPageBreak'),
          type: 'checkbox' as const
        },
        {
          key: 'pagination',
          label: i18n.t('advanceTable.properties.pagination'),
          type: 'textarea' as const,
          valueType: 'json' as const
        },
        {
          key: 'requestMapping',
          label: i18n.t('advanceTable.properties.requestMapping'),
          type: 'textarea' as const,
          valueType: 'json' as const
        },
        {
          key: 'responseMapping',
          label: i18n.t('advanceTable.properties.responseMapping'),
          type: 'textarea' as const,
          valueType: 'json' as const
        },
        {
          key: 'sort',
          label: i18n.t('advanceTable.properties.sort'),
          type: 'textarea' as const,
          valueType: 'json' as const
        },
        {
          key: 'filters',
          label: i18n.t('advanceTable.properties.filters'),
          type: 'textarea' as const,
          valueType: 'json' as const
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
            matchingExternalFields: getAdvanceTableDatasourceFields().map((field) => ({
              label: field.label,
              variable: field.variable,
              type: field.dataType
            })),
            showPageBreak: state.showPageBreak === true
          })
        }
      ];
    }
  },
  createInitialProps: () => ({
    index: false,
    selection: false,
    size: 'default'
  }),
  getDataFields: () => getAdvanceTableDataFields(),
  normalizeProps: normalizeMAdvanceTableProps,
  serialize: serializeMAdvanceTableProps
});
</script>

<script setup lang="ts">
import { computed, inject, nextTick, ref, shallowRef, watch } from 'vue';
import { useEditorBlockToolbarAlignment } from '@/composables/useEditorBlockToolbarAlignment';
import { getInlineCustomComponentDefinition } from '@/editors/inlineCustomComponents';
import { useI18n } from '@/i18n';
import {
  resolveDatasourceRuntimeData,
  type DatasourceRuntimeMatchingExternalFieldData
} from '@/utils/datasourceRuntime';
import { normalizeBlockEvents } from '@/utils/blockEvents';
import {
  PreviewBlockRuntimeKey,
  type PreviewRuntimeBlock
} from '@/utils/previewBlockRuntime';
import { applyProcessors } from '@/processors';

type RowRecord = Record<string, unknown>;
type RowKeyValue = string | number;
type RefreshOptions = {
  resetPage?: boolean;
  query?: Record<string, unknown>;
  sort?: TableSortState;
  filters?: Record<string, unknown>;
  clearSelection?: boolean;
};

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

type RenderColumn = MAdvanceTableColumnConfig & {
  id: string;
  depth: number;
  leafIndex: number;
  children?: RenderColumn[];
};

const props = defineProps<MAdvanceTableProps & {
  onChange?: (payload: MAdvanceTableProps) => void;
  onToolChange?: (payload: MAdvanceTableProps) => void;
}>();
const emit = defineEmits<{
  (event: 'havingSelectedRows', payload: {
    selectedRows: RowRecord[];
    selection: ReturnType<typeof getSelectionState>;
  }): void;
  (event: 'emptySelectedRow', payload: {
    selectedRows: RowRecord[];
    selection: ReturnType<typeof getSelectionState>;
  }): void;
  (event: 'selection-change', payload: ReturnType<typeof getSelectionState>): void;
  (event: 'row-click', payload: RowEventPayload): void;
  (event: 'row-dblclick', payload: RowEventPayload): void;
  (event: 'sort-change', payload: { prop: string; order: string; sort: TableSortState }): void;
  (event: 'page-change', payload: { page: number; pageSize: number }): void;
  (event: 'page-size-change', payload: { page: number; pageSize: number }): void;
  (event: 'refresh-success', payload: { rows: RowRecord[]; total: number; response: unknown }): void;
  (event: 'refresh-error', payload: { error: unknown }): void;
}>();

type RowEventPayload = {
  row: RowRecord;
  index: number;
  key?: RowKeyValue;
  nativeEvent?: Event;
};

const { t } = useI18n();
const previewRuntime = inject(PreviewBlockRuntimeKey, null);
const rootRef = ref<HTMLElement | null>(null);
const selectedIndexes = ref(new Set<number>());
const selectedKeys = ref(new Set<string>());
const selectedRowsByKey = shallowRef(new Map<string, RowRecord>());
const tableData = shallowRef<RowRecord[]>([]);
const queryState = ref<Record<string, unknown>>({});
const filterState = ref<Record<string, unknown>>(normalizeRecordConfig(props.filters) ?? {});
const sortState = ref<TableSortState>(normalizeSortState(props.sort) ?? {});
const manualLoading = ref(false);
const paginationState = ref<PaginationState>({
  page: normalizePaginationConfig(props.pagination)?.page ?? 1,
  pageSize: normalizePaginationConfig(props.pagination)?.pageSize ?? 10,
  total: normalizePaginationConfig(props.pagination)?.total ?? 0
});
const datasourceLoading = ref(false);
const datasourceError = ref('');
const pageJumpValue = ref('');
let datasourceLoadId = 0;
let lastSelectionEmpty = true;

const normalizedProps = computed(() => normalizeMAdvanceTableProps(props));
const normalizedColumns = computed(() => normalizeColumns(props.columns));
const normalizedDatasource = computed(() => normalizeDatasourceConfig(props.ds));
const normalizedSelection = computed(() => normalizeSelectionConfig(props.selection));
const normalizedPagination = computed(() => normalizePaginationConfig(props.pagination));
const normalizedRequestMapping = computed(() => normalizeRequestMapping(props.requestMapping));
const normalizedResponseMapping = computed(() => normalizeResponseMapping(props.responseMapping));
const hasConfiguredColumns = computed(() => normalizedColumns.value.length > 0);
const selectionConfig = computed<TableSelectionConfig>(() => typeof normalizedSelection.value === 'object'
  ? normalizedSelection.value
  : { enabled: normalizedSelection.value === true });
const hasSelectionColumn = computed(() => selectionConfig.value.enabled === true);
const hasIndexColumn = computed(() => props.index === true);
const shouldShowPageBreak = computed(() => {
  if (normalizedPagination.value?.enabled === false) return false;
  if (normalizedPagination.value?.enabled === true) return !normalizedPagination.value.hideOnSinglePage || pagination.value.totalPages > 1;
  return props.showPageBreak === true;
});
const shouldReserveSelection = computed(() => selectionConfig.value.reserveSelection === true && Boolean(effectiveRowKey.value));
const effectiveRowKey = computed(() => selectionConfig.value.rowKey || normalizedProps.value.rowKey || '');
const displayRows = computed(() => hasConfiguredColumns.value ? tableData.value : []);
const tableColumnTree = computed(() => buildRenderColumns(normalizedColumns.value));
const leafColumns = computed(() => flattenRenderColumns(tableColumnTree.value));
const maxHeaderDepth = computed(() => Math.max(1, ...leafColumns.value.map((column) => column.depth + 1)));
const headerRows = computed(() => buildHeaderRows(tableColumnTree.value, maxHeaderDepth.value));
const displayColumnCount = computed(() => leafColumns.value.length);
const paginationLayout = computed(() => normalizedPagination.value?.layout ?? ['total', 'sizes', 'prev', 'pager', 'next', 'jumper']);
const availablePageSizes = computed(() => {
  const configured = normalizedPagination.value?.pageSizes ?? [];
  const values = configured.length ? configured : [10, 20, 50, 100];
  const current = pagination.value.pageSize;
  return [...new Set([...values, current])].sort((left, right) => left - right);
});
const pagination = computed(() => {
  const pageSize = normalizePositiveIntegerValue(paginationState.value.pageSize, normalizedPagination.value?.pageSize ?? 10);
  const total = normalizeNonNegativeIntegerValue(paginationState.value.total, normalizedPagination.value?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(normalizePositiveIntegerValue(paginationState.value.page, normalizedPagination.value?.page ?? 1), 1), totalPages);
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
const pageNumbers = computed(() => {
  const totalPages = pagination.value.totalPages;
  const currentPage = pagination.value.currentPage;
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
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
  if (datasourceLoading.value) return normalizedProps.value.loadingText || t('advanceTable.loading');
  if (datasourceError.value) return normalizedProps.value.errorText || datasourceError.value;
  if (!normalizedDatasource.value && !displayRows.value.length) return t('advanceTable.noDatasource');
  return normalizedProps.value.emptyText || t('advanceTable.empty');
});
const emptyColumnSpan = computed(() => Math.max(
  1,
  displayColumnCount.value + (hasSelectionColumn.value ? 1 : 0) + (hasIndexColumn.value ? 1 : 0)
));
const isLoading = computed(() => datasourceLoading.value || manualLoading.value);
const tableClass = computed(() => [
  'ce-advance-table-tool',
  `ce-advance-table-tool--${normalizedProps.value.size || 'default'}`,
  {
    'ce-advance-table-tool--border': normalizedProps.value.border === true,
    'ce-advance-table-tool--stripe': normalizedProps.value.stripe === true
  }
]);
const scrollerStyle = computed(() => {
  const style: Record<string, string> = {};
  const height = normalizeCssDimension(normalizedProps.value.height);
  const maxHeight = normalizeCssDimension(normalizedProps.value.maxHeight);
  if (height) style.height = height;
  if (maxHeight) style.maxHeight = maxHeight;
  return style;
});
const selectionColumnWidth = 44;
const indexColumnWidth = 56;
const fallbackFixedColumnWidth = 160;

useEditorBlockToolbarAlignment(rootRef);

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

function normalizeRuntimeRows(value: unknown): RowRecord[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => isRecord(item))) {
    return undefined;
  }

  return value.map((row) => ({ ...row }));
}

function normalizeCssDimension(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return `${value}px`;
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function clonePlainValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}

function buildRenderColumns(columns: MAdvanceTableColumnConfig[], depth = 0, prefix = 'column'): RenderColumn[] {
  let leafIndex = 0;
  const walk = (items: MAdvanceTableColumnConfig[], currentDepth: number, currentPrefix: string): RenderColumn[] => items.flatMap((column, index) => {
    if (!isColumnVisible(column)) return [];
    const children = Array.isArray(column.children) ? walk(column.children, currentDepth + 1, `${currentPrefix}-${index}`) : [];
    const renderColumn: RenderColumn = {
      ...column,
      id: `${currentPrefix}-${index}`,
      depth: currentDepth,
      leafIndex: children.length ? -1 : leafIndex++,
      ...(children.length ? { children } : {})
    };
    return [renderColumn];
  });

  return walk(columns, depth, prefix);
}

function flattenRenderColumns(columns: RenderColumn[]): RenderColumn[] {
  return columns.flatMap((column) => column.children?.length ? flattenRenderColumns(column.children) : [column]);
}

function getColumnLeafCount(column: RenderColumn): number {
  return column.children?.length ? column.children.reduce((total, child) => total + getColumnLeafCount(child), 0) : 1;
}

function buildHeaderRows(columns: RenderColumn[], maxDepth: number) {
  const rows: Array<Array<RenderColumn & { colspan: number; rowspan: number }>> = Array.from({ length: maxDepth }, () => []);
  const walk = (items: RenderColumn[]) => {
    items.forEach((column) => {
      const hasChildren = Boolean(column.children?.length);
      rows[column.depth].push({
        ...column,
        colspan: hasChildren ? getColumnLeafCount(column) : 1,
        rowspan: hasChildren ? 1 : maxDepth - column.depth
      });
      if (column.children?.length) walk(column.children);
    });
  };
  walk(columns);
  return rows;
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

function notifyRuntimeDataChange() {
  if (!props.currentBlockId) return;
  previewRuntime?.notifyBlockDataChange(props.currentBlockId);
}

function normalizeKeyId(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function getRowKeyValue(row: RowRecord, rowIndex: number): RowKeyValue | undefined {
  const path = effectiveRowKey.value;
  if (!path) return rowIndex;
  const value = readDataPath(row, path);
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function getSelectionState() {
  const indexedRows = [...selectedIndexes.value]
    .sort((left, right) => left - right)
    .flatMap((index) => {
      const row = displayRows.value[index];
      return row ? [{ index, row, key: getRowKeyValue(row, index) }] : [];
    });
  const keyedRows = [...selectedKeys.value]
    .flatMap((keyId) => {
      const row = selectedRowsByKey.value.get(keyId);
      return row ? [{ keyId, row }] : [];
    });
  const useKeys = Boolean(effectiveRowKey.value);
  const rows = useKeys ? keyedRows.map((item) => item.row) : indexedRows.map((item) => item.row);
  const indexes = useKeys
    ? displayRows.value.flatMap((row, index) => selectedKeys.value.has(normalizeKeyId(getRowKeyValue(row, index))) ? [index] : [])
    : indexedRows.map((item) => item.index);
  const keys = useKeys
    ? [...selectedKeys.value].map((key) => key)
    : indexedRows.flatMap((item) => item.key === undefined ? [] : [item.key]);

  return {
    empty: rows.length === 0,
    count: rows.length,
    indexes,
    rows,
    keys
  };
}

function emitSelectionEvents() {
  const selection = getSelectionState();
  emit('selection-change', selection);
  if (selection.empty !== lastSelectionEmpty) {
    lastSelectionEmpty = selection.empty;
    const payload = {
      selectedRows: selection.rows,
      selection
    };
    emit(selection.empty ? 'emptySelectedRow' : 'havingSelectedRows', payload);
  }
}

function commitSelection(nextIndexes: Set<number>, nextKeys = selectedKeys.value, nextRowsByKey = selectedRowsByKey.value) {
  selectedIndexes.value = nextIndexes;
  selectedKeys.value = nextKeys;
  selectedRowsByKey.value = nextRowsByKey;
  notifyRuntimeDataChange();
  emitSelectionEvents();
}

function clearSelection() {
  commitSelection(new Set(), new Set(), new Map());
}

function shouldClearSelectionOnRefresh(options?: RefreshOptions) {
  if (options?.clearSelection === true) return true;
  return !shouldReserveSelection.value;
}

function getVariableConfigBlockId(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return '';
  const config = value as Partial<VariableValueConfig>;
  return config.mode === 'variable' &&
    config.blockType === 'MAdvanceTable' &&
    typeof config.blockId === 'string'
    ? config.blockId
    : '';
}

function getDatasourceSelfReferenceBlockId(datasource: MDatasourceApiObject) {
  if (props.currentBlockId) return props.currentBlockId;
  const referencedBlockIds = new Set<string>();
  datasource.headerData.forEach((item) => {
    const blockId = getVariableConfigBlockId(item.value);
    if (blockId) referencedBlockIds.add(blockId);
  });
  datasource.queryData.forEach((item) => {
    const blockId = getVariableConfigBlockId(item.value);
    if (blockId) referencedBlockIds.add(blockId);
  });
  datasource.bodyData.forEach((item: MDatasourceBodyItem) => {
    const blockId = getVariableConfigBlockId(item.value);
    if (blockId) referencedBlockIds.add(blockId);
  });
  return referencedBlockIds.size === 1 ? [...referencedBlockIds][0] : '';
}

function isEmptyRequestValue(value: unknown) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function getMappedRequestParams() {
  const mapping = normalizedRequestMapping.value;
  if (!mapping) return {};
  const params: Record<string, unknown> = {};
  const pageKey = mapping.page || 'page';
  const pageSizeKey = mapping.pageSize || 'pageSize';
  params[pageKey] = mapping.zeroBasedPage ? Math.max(0, pagination.value.currentPage - 1) : pagination.value.currentPage;
  params[pageSizeKey] = pagination.value.pageSize;
  if (mapping.sortField && sortState.value.prop) params[mapping.sortField] = sortState.value.prop;
  if (mapping.sortOrder && sortState.value.order) params[mapping.sortOrder] = normalizeSortOrder(sortState.value.order);
  return params;
}

function buildRequestParams() {
  return {
    ...queryState.value,
    ...filterState.value,
    ...getMappedRequestParams()
  };
}

function stringifyDatasourceValue(value: unknown) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function mergeDatasourceQueryData(datasource: MDatasourceApiObject) {
  const requestParams = buildRequestParams();
  const overrideKeys = new Set(Object.keys(requestParams));
  const existing = datasource.queryData.filter((item) => !overrideKeys.has(item.key.trim()));
  const mapped: MDatasourceKeyValueItem[] = Object.entries(requestParams)
    .filter(([, value]) => !isEmptyRequestValue(value))
    .map(([key, value]) => ({
      key,
      value: stringifyDatasourceValue(value)
    }));

  return {
    ...datasource,
    queryData: [...existing, ...mapped]
  };
}

async function loadDatasourceRows(options: RefreshOptions = {}) {
  const datasource = normalizedDatasource.value;
  const loadId = ++datasourceLoadId;

  if (options.resetPage) {
    paginationState.value = {
      ...paginationState.value,
      page: 1
    };
  }
  if (options.query && isRecord(options.query)) {
    queryState.value = { ...queryState.value, ...clonePlainValue(options.query) };
  }
  if (options.filters && isRecord(options.filters)) {
    filterState.value = { ...clonePlainValue(options.filters) };
  }
  if (options.sort) {
    sortState.value = normalizeSortState(options.sort) ?? {};
  }
  if (shouldClearSelectionOnRefresh(options)) {
    clearSelection();
  }

  if (!datasource) {
    tableData.value = [];
    datasourceLoading.value = false;
    datasourceError.value = '';
    notifyRuntimeDataChange();
    return;
  }

  datasourceLoading.value = true;
  datasourceError.value = '';

  try {
    const requestDatasource = mergeDatasourceQueryData(datasource);
    const selfBlockId = getDatasourceSelfReferenceBlockId(requestDatasource);
    const blocks = await previewRuntime?.getBlockDataContext(selfBlockId) ?? {};
    if (selfBlockId) {
      blocks[selfBlockId] = getData();
    }
    const runtimeData = await resolveDatasourceRuntimeData(requestDatasource, {
      variableContext: { blocks }
    });
    if (loadId !== datasourceLoadId) return;

    const rowsValue = resolveResponseRows(runtimeData);
    const rows = normalizeRuntimeRows(rowsValue);
    if (!rows) {
      datasourceError.value = t('advanceTable.invalidMatchedData');
      emit('refresh-error', { error: new Error(datasourceError.value) });
      return;
    }

    tableData.value = rows;
    paginationState.value = {
      page: normalizePositiveIntegerValue(resolveResponseNumber(runtimeData, 'page'), pagination.value.currentPage),
      pageSize: normalizePositiveIntegerValue(resolveResponseNumber(runtimeData, 'pageSize'), pagination.value.pageSize),
      total: normalizeNonNegativeIntegerValue(resolveResponseNumber(runtimeData, 'total'), rows.length)
    };
    syncReservedSelectionRows(rows);
    notifyRuntimeDataChange();
    emit('refresh-success', {
      rows,
      total: paginationState.value.total,
      response: runtimeData.rawResponse
    });
  } catch (error) {
    if (loadId !== datasourceLoadId) return;
    datasourceError.value = normalizedProps.value.errorText || t('advanceTable.loadFailed');
    emit('refresh-error', { error });
  } finally {
    if (loadId === datasourceLoadId) {
      datasourceLoading.value = false;
    }
  }
}

function resolveResponseRows(runtimeData: Awaited<ReturnType<typeof resolveDatasourceRuntimeData>>) {
  const mapping = normalizedResponseMapping.value;
  if (mapping?.rows) {
    const mappedValue = readDataPath(runtimeData.rawResponse, mapping.rows);
    if (mappedValue !== undefined) return mappedValue;
  }

  const matchedDataField = runtimeData.matchingExternalFieldData.find((field) => field.variable === 'data');
  if (matchedDataField?.matchFieldPath && matchedDataField.value !== undefined) {
    return matchedDataField.value;
  }

  return firstResponsePath(runtimeData.rawResponse, [
    'data.list',
    'data.records',
    'data.items',
    'records',
    'list',
    'datas',
    'items'
  ]);
}

function resolveResponseNumber(runtimeData: Awaited<ReturnType<typeof resolveDatasourceRuntimeData>>, variable: 'page' | 'pageSize' | 'total') {
  const mapping = normalizedResponseMapping.value;
  const mappingPath = mapping?.[variable];
  if (mappingPath) {
    const mappedValue = readDataPath(runtimeData.rawResponse, mappingPath);
    if (mappedValue !== undefined) return mappedValue;
  }

  const matchedValue = getMatchedRuntimeValue(runtimeData.matchingExternalFieldData, variable);
  if (matchedValue !== undefined) return matchedValue;

  if (variable === 'total') {
    return firstResponsePath(runtimeData.rawResponse, ['data.total', 'data.totalCount', 'total', 'totalCount']);
  }
  if (variable === 'page') {
    return firstResponsePath(runtimeData.rawResponse, ['data.page', 'data.pageNo', 'data.pageNum', 'page', 'pageNo', 'pageNum']);
  }
  return firstResponsePath(runtimeData.rawResponse, ['data.pageSize', 'data.size', 'pageSize', 'size', 'limit']);
}

function firstResponsePath(value: unknown, paths: string[]) {
  for (const path of paths) {
    const result = readDataPath(value, path);
    if (result !== undefined) return result;
  }
  return undefined;
}

function syncReservedSelectionRows(rows: RowRecord[]) {
  if (!effectiveRowKey.value || !selectedKeys.value.size) return;
  const nextRows = new Map(selectedRowsByKey.value);
  rows.forEach((row, index) => {
    const keyId = normalizeKeyId(getRowKeyValue(row, index));
    if (keyId && selectedKeys.value.has(keyId)) {
      nextRows.set(keyId, row);
    }
  });
  selectedRowsByKey.value = nextRows;
}

function readInvocationInputs(value: unknown) {
  if (!isRecord(value)) return {};
  return isRecord(value.inputs) ? value.inputs : {};
}

function readInvocationArgs(value: unknown) {
  const inputs = readInvocationInputs(value);
  return isRecord(inputs.args) ? inputs.args : {};
}

function readRefreshOptions(value: unknown): RefreshOptions {
  const direct = isRecord(value) && !Object.prototype.hasOwnProperty.call(value, 'targetBlock') ? value : {};
  const inputs = readInvocationInputs(value);
  const args = readInvocationArgs(value);
  const source = {
    ...direct,
    ...inputs,
    ...args
  };

  return {
    resetPage: source.resetPage === true,
    query: isRecord(source.query) ? source.query : undefined,
    sort: isRecord(source.sort) ? source.sort as TableSortState : undefined,
    filters: isRecord(source.filters) ? source.filters : undefined,
    clearSelection: source.clearSelection === true
  };
}

function getData() {
  const selection = getSelectionState();
  return {
    data: tableData.value,
    rows: tableData.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
    total: pagination.value.total,
    query: queryState.value,
    filters: filterState.value,
    sort: sortState.value,
    selectedRows: selection.rows,
    keys: selection.keys,
    selection
  };
}

async function refresh(value?: unknown) {
  await loadDatasourceRows(readRefreshOptions(value));
  return getData();
}

function resetPageAndRefresh(value?: unknown) {
  return refresh({
    ...readRefreshOptions(value),
    resetPage: true
  });
}

function getSelectedRows() {
  return getSelectionState().rows;
}

function getSelectedValueField(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (!isRecord(value)) return '';

  const inputs = isRecord(value.inputs) ? value.inputs : {};
  const args = isRecord(inputs.args) ? inputs.args : {};
  const field = inputs.field ?? inputs.path ?? args.field ?? args.path;

  return typeof field === 'string' ? field.trim() : '';
}

function getSelectedValues(fieldOrInvocation: unknown) {
  const field = getSelectedValueField(fieldOrInvocation);
  if (!field) return [];

  return getSelectedRows()
    .map((row) => readDataPath(row, field))
    .filter((value) => value !== null && value !== undefined && value !== '');
}

function setRows(value: unknown) {
  const inputs = readInvocationInputs(value);
  const args = readInvocationArgs(value);
  const rowsValue = Array.isArray(value) ? value : inputs.rows ?? inputs.value ?? args.rows ?? args.value;
  const rows = normalizeRuntimeRows(rowsValue) ?? [];
  tableData.value = rows;
  paginationState.value = {
    ...paginationState.value,
    total: rows.length
  };
  notifyRuntimeDataChange();
}

function setLoading(value: unknown) {
  const inputs = readInvocationInputs(value);
  const args = readInvocationArgs(value);
  const nextLoading = typeof value === 'boolean' ? value : inputs.loading ?? args.loading ?? inputs.value ?? args.value;
  manualLoading.value = nextLoading === true;
}

function setPagination(value: unknown) {
  const inputs = readInvocationInputs(value);
  const args = readInvocationArgs(value);
  const state = isRecord(value) && !Object.prototype.hasOwnProperty.call(value, 'targetBlock')
    ? value
    : isRecord(inputs.state)
      ? inputs.state
      : args;
  paginationState.value = {
    page: normalizePositiveIntegerValue(state.page, pagination.value.currentPage),
    pageSize: normalizePositiveIntegerValue(state.pageSize, pagination.value.pageSize),
    total: normalizeNonNegativeIntegerValue(state.total, pagination.value.total)
  };
  notifyRuntimeDataChange();
}

function setSort(value: unknown) {
  const inputs = readInvocationInputs(value);
  const args = readInvocationArgs(value);
  const sort = normalizeSortState(isRecord(value) && !Object.prototype.hasOwnProperty.call(value, 'targetBlock')
    ? value
    : inputs.sort ?? args.sort ?? args) ?? {};
  sortState.value = sort;
  notifyRuntimeDataChange();
}

function selectRows(value: unknown) {
  const inputs = readInvocationInputs(value);
  const args = readInvocationArgs(value);
  const keysValue = Array.isArray(value) ? value : inputs.keys ?? inputs.value ?? args.keys ?? args.value;
  const keys = Array.isArray(keysValue) ? keysValue.map(normalizeKeyId).filter(Boolean) : [];
  const keySet = new Set(keys);
  const rowsByKey = new Map(selectedRowsByKey.value);
  displayRows.value.forEach((row, index) => {
    const keyId = normalizeKeyId(getRowKeyValue(row, index));
    if (keyId && keySet.has(keyId)) rowsByKey.set(keyId, row);
  });
  commitSelection(new Set(), keySet, rowsByKey);
}

function scrollToRow(value: unknown) {
  const inputs = readInvocationInputs(value);
  const args = readInvocationArgs(value);
  const key = typeof value === 'string' || typeof value === 'number' ? value : inputs.key ?? inputs.value ?? args.key ?? args.value;
  const keyId = normalizeKeyId(key);
  if (!keyId) return;
  nextTick(() => {
    rootRef.value?.querySelector<HTMLElement>(`[data-row-key="${CSS.escape(keyId)}"]`)?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest'
    });
  });
}

function stringifyCellValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isEmptyCellValue(value: unknown) {
  return value === undefined || value === null || value === '';
}

function normalizeTemplatePath(path: string) {
  const trimmedPath = path.trim();
  if (trimmedPath.startsWith('row.')) return trimmedPath.slice(4);
  return trimmedPath;
}

function getTemplateContext(row: RowRecord, rowIndex: number) {
  const rowKey = getRowKeyValue(row, rowIndex);
  return {
    row,
    index: rowIndex,
    rowIndex,
    rowKey,
    key: rowKey
  };
}

function readTemplateValue(row: RowRecord, rowIndex: number, path: string) {
  const context = getTemplateContext(row, rowIndex);
  const normalizedPath = normalizeTemplatePath(path);
  if (normalizedPath === 'index' || normalizedPath === 'rowIndex') return rowIndex;
  if (normalizedPath === 'rowKey' || normalizedPath === 'key') return context.rowKey;
  if (path.trim().startsWith('row.')) return readDataPath(row, normalizedPath);
  return readDataPath(row, normalizedPath);
}

function interpolateValue(value: string, row: RowRecord, rowIndex: number, column?: MAdvanceTableColumnConfig) {
  const wholeMatch = value.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/);
  if (wholeMatch) {
    return applyColumnProcessors(readTemplateValue(row, rowIndex, wholeMatch[1]), column);
  }

  return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path: string) => (
    stringifyCellValue(applyColumnProcessors(readTemplateValue(row, rowIndex, path), column))
  ));
}

function readDataPath(value: unknown, path: string) {
  if (!path.trim()) return value;

  return path.replace(/\[\]/g, '').split('.').filter(Boolean).reduce<unknown>((current, key) => {
    if (Array.isArray(current) && /^\d+$/.test(key)) return current[Number(key)];
    if (typeof current !== 'object' || current === null || !(key in current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, value);
}

function applyColumnProcessors(value: unknown, column?: MAdvanceTableColumnConfig) {
  if (!column?.processors?.length) return value;
  try {
    return applyProcessors(value, column.processors);
  } catch {
    return value;
  }
}

function interpolateComponentData(value: unknown, row: RowRecord, rowIndex: number, column: MAdvanceTableColumnConfig): unknown {
  if (typeof value === 'string') {
    return interpolateValue(value, row, rowIndex, column);
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateComponentData(item, row, rowIndex, column));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, interpolateComponentData(item, row, rowIndex, column)])
    );
  }

  return value;
}

const tagTypes = ['primary', 'success', 'info', 'warning', 'danger'] as const;

function isTagType(value: unknown): value is (typeof tagTypes)[number] {
  return typeof value === 'string' && tagTypes.includes(value as (typeof tagTypes)[number]);
}

function normalizeTagData(data: Record<string, unknown>) {
  const tagValue = isRecord(data.value) ? data.value : undefined;
  if (!tagValue) return data;

  const colorValue = typeof tagValue.color === 'string' ? tagValue.color : '';
  const tagType = isTagType(tagValue.type) ? tagValue.type : isTagType(colorValue) ? colorValue : undefined;
  const customColor = colorValue && !isTagType(colorValue) && colorValue !== 'default' ? colorValue : undefined;

  return {
    ...data,
    tagName: typeof tagValue.label === 'string' ? tagValue.label : stringifyCellValue(tagValue.label ?? tagValue.value),
    type: tagType ?? data.type,
    color: customColor ?? data.color
  };
}

function getCellBlocks(row: RowRecord, rowIndex: number, column: MAdvanceTableColumnConfig): StoredBlock[] {
  return normalizeStoredBlocks(column.columnContent).map((block) => {
    if (block.type === 'paragraph') {
      const renderedValue = interpolateValue(getParagraphText(block), row, rowIndex, column);
      return {
        ...block,
        data: {
          text: stringifyCellValue(isEmptyCellValue(renderedValue) ? column.emptyText || normalizedProps.value.emptyText || '-' : renderedValue)
        }
      };
    }

    const data = interpolateComponentData(block.data, row, rowIndex, column) as Record<string, unknown>;
    return {
      ...block,
      data: block.type === 'MTag' ? normalizeTagData(data) : data
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

function createCellEventPayload(row: RowRecord, rowIndex: number, event: unknown) {
  return {
    row,
    index: rowIndex,
    key: getRowKeyValue(row, rowIndex),
    nativeEvent: event
  };
}

function getCellBlockEventListeners(block: StoredBlock, row: RowRecord, rowIndex: number) {
  if (props.edit) return {};

  const listeners: Record<string, (event: unknown) => void> = {};
  normalizeBlockEvents(block.events).forEach((eventConfig) => {
    if (!eventConfig.event) return;
    const previousListener = listeners[eventConfig.event];
    listeners[eventConfig.event] = (event: unknown) => {
      previousListener?.(event);
      previewRuntime?.invokeBlockActions(eventConfig, block as PreviewRuntimeBlock, createCellEventPayload(row, rowIndex, event));
    };
  });

  return listeners;
}

function getBlockText(block: StoredBlock) {
  return getParagraphText(block);
}

function getColumnWidth(column: MAdvanceTableColumnConfig) {
  return column.width ?? null;
}

function getFixedColumnWidth(column: MAdvanceTableColumnConfig) {
  return getColumnWidth(column) ?? column.minWidth ?? fallbackFixedColumnWidth;
}

function getLeftOffset(columnIndex: number) {
  let offset = 0;
  if (hasSelectionColumn.value) offset += selectionColumnWidth;
  if (hasIndexColumn.value) offset += indexColumnWidth;

  for (let index = 0; index < columnIndex; index += 1) {
    const column = leafColumns.value[index];
    if (column?.fixed === 'left') {
      offset += getFixedColumnWidth(column);
    }
  }

  return offset;
}

function getRightOffset(columnIndex: number) {
  let offset = 0;

  for (let index = leafColumns.value.length - 1; index > columnIndex; index -= 1) {
    const column = leafColumns.value[index];
    if (column?.fixed === 'right') {
      offset += getFixedColumnWidth(column);
    }
  }

  return offset;
}

function getColumnStyle(column: MAdvanceTableColumnConfig, columnIndex: number, header = false) {
  const width = getColumnWidth(column);
  const style: Record<string, string> = {};
  const align = header ? column.headerAlign || column.align : column.align;

  if (width) {
    style.width = `${width}px`;
    style.minWidth = `${width}px`;
  } else if (column.minWidth) {
    style.minWidth = `${column.minWidth}px`;
  }

  if (align) {
    style.textAlign = align;
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

function isRowDisabled(row: RowRecord, rowIndex: number) {
  const condition = selectionConfig.value.disabledWhen;
  if (!condition) return false;
  try {
    return evaluateCondition(condition, row, rowIndex, getRowKeyValue(row, rowIndex));
  } catch {
    return false;
  }
}

function isColumnVisible(column: MAdvanceTableColumnConfig) {
  if (!column.visibleWhen) return true;
  try {
    return evaluateCondition(column.visibleWhen, {}, 0, undefined);
  } catch {
    return true;
  }
}

function readConditionOperand(value: unknown, row: RowRecord, rowIndex: number, key: RowKeyValue | undefined) {
  if (isRecord(value) && value.kind === 'variable' && typeof value.variable === 'string') {
    return readConditionOperand(value.variable, row, rowIndex, key);
  }
  if (typeof value === 'string') {
    if (value === 'index') return rowIndex;
    if (value === 'key' || value === 'rowKey') return key;
    if (value.startsWith('row.')) return readDataPath(row, value.slice(4));
    return readDataPath(row, value);
  }
  return value;
}

function evaluateCondition(condition: ConditionConfig, row: RowRecord, rowIndex: number, key: RowKeyValue | undefined) {
  const left = readConditionOperand(condition.left, row, rowIndex, key);
  const right = readConditionOperand(condition.right, row, rowIndex, key);
  if (condition.operator === 'NEQ') return !Object.is(left, right);
  if (condition.operator === 'GT') return Number(left) > Number(right);
  if (condition.operator === 'GE') return Number(left) >= Number(right);
  if (condition.operator === 'LT') return Number(left) < Number(right);
  if (condition.operator === 'LE') return Number(left) <= Number(right);
  if (condition.operator === 'IN') return Array.isArray(right) && right.includes(left);
  if (condition.operator === 'NOTIN') return Array.isArray(right) && !right.includes(left);
  return Object.is(left, right);
}

function isRowSelected(row: RowRecord, rowIndex: number) {
  if (effectiveRowKey.value) {
    return selectedKeys.value.has(normalizeKeyId(getRowKeyValue(row, rowIndex)));
  }
  return selectedIndexes.value.has(rowIndex);
}

function toggleRow(row: RowRecord, rowIndex: number) {
  if (isRowDisabled(row, rowIndex)) return;

  if (effectiveRowKey.value) {
    const key = getRowKeyValue(row, rowIndex);
    const keyId = normalizeKeyId(key);
    if (!keyId) return;
    const nextKeys = new Set(selectedKeys.value);
    const nextRows = new Map(selectedRowsByKey.value);
    if (nextKeys.has(keyId)) {
      nextKeys.delete(keyId);
      nextRows.delete(keyId);
    } else {
      nextKeys.add(keyId);
      nextRows.set(keyId, row);
    }
    commitSelection(new Set(), nextKeys, nextRows);
    return;
  }

  const nextSelectedRows = new Set(selectedIndexes.value);
  if (nextSelectedRows.has(rowIndex)) {
    nextSelectedRows.delete(rowIndex);
  } else {
    nextSelectedRows.add(rowIndex);
  }
  commitSelection(nextSelectedRows);
}

function selectableRows() {
  return displayRows.value
    .map((row, index) => ({ row, index }))
    .filter(({ row, index }) => !isRowDisabled(row, index));
}

function isAllRowsSelected() {
  const rows = selectableRows();
  return rows.length > 0 && rows.every(({ row, index }) => isRowSelected(row, index));
}

function toggleAllRows() {
  const rows = selectableRows();
  if (isAllRowsSelected()) {
    if (effectiveRowKey.value) {
      const nextKeys = new Set(selectedKeys.value);
      const nextRows = new Map(selectedRowsByKey.value);
      rows.forEach(({ row, index }) => {
        const keyId = normalizeKeyId(getRowKeyValue(row, index));
        nextKeys.delete(keyId);
        nextRows.delete(keyId);
      });
      commitSelection(new Set(), nextKeys, nextRows);
      return;
    }

    commitSelection(new Set());
    return;
  }

  if (effectiveRowKey.value) {
    const nextKeys = new Set(selectedKeys.value);
    const nextRows = new Map(selectedRowsByKey.value);
    rows.forEach(({ row, index }) => {
      const keyId = normalizeKeyId(getRowKeyValue(row, index));
      if (keyId) {
        nextKeys.add(keyId);
        nextRows.set(keyId, row);
      }
    });
    commitSelection(new Set(), nextKeys, nextRows);
    return;
  }

  commitSelection(new Set(rows.map(({ index }) => index)));
}

function goToPage(page: number) {
  if (isLoading.value) return;
  const targetPage = Math.min(Math.max(page, 1), pagination.value.totalPages);
  if (targetPage === pagination.value.currentPage) return;
  paginationState.value = {
    ...paginationState.value,
    page: targetPage
  };
  pageJumpValue.value = '';
  emit('page-change', { page: targetPage, pageSize: pagination.value.pageSize });
  void loadDatasourceRows();
}

function changePageSize(pageSize: number) {
  if (isLoading.value) return;
  const nextPageSize = normalizePositiveIntegerValue(pageSize, pagination.value.pageSize);
  if (nextPageSize === pagination.value.pageSize) return;
  paginationState.value = {
    ...paginationState.value,
    page: 1,
    pageSize: nextPageSize
  };
  emit('page-size-change', { page: 1, pageSize: nextPageSize });
  void loadDatasourceRows();
}

function jumpToPage() {
  const page = normalizePositiveIntegerValue(pageJumpValue.value, pagination.value.currentPage);
  goToPage(page);
}

function normalizeSortOrder(order: unknown) {
  if (order === 'descending' || order === 'desc') return 'desc';
  if (order === 'ascending' || order === 'asc') return 'asc';
  return '';
}

function toggleSort(column: MAdvanceTableColumnConfig) {
  if (!column.sortable) return;
  const prop = column.fieldVariable || '';
  if (!prop) return;
  const currentOrder = sortState.value.prop === prop ? normalizeSortOrder(sortState.value.order) : '';
  const order = currentOrder === 'asc' ? 'desc' : currentOrder === 'desc' ? '' : 'asc';
  sortState.value = order ? { prop, order } : {};
  paginationState.value = {
    ...paginationState.value,
    page: 1
  };
  const nextSort = { ...sortState.value };
  emit('sort-change', { prop, order, sort: nextSort });
  void loadDatasourceRows();
}

function getSortIndicator(column: MAdvanceTableColumnConfig) {
  if (!column.sortable || !column.fieldVariable || sortState.value.prop !== column.fieldVariable) return '';
  const order = normalizeSortOrder(sortState.value.order);
  if (order === 'asc') return '▲';
  if (order === 'desc') return '▼';
  return '';
}

function emitRowEvent(eventName: 'row-click' | 'row-dblclick', row: RowRecord, index: number, event: Event) {
  if (props.edit) return;
  emit(eventName, {
    row,
    index,
    key: getRowKeyValue(row, index),
    nativeEvent: event
  });
}

async function copyCellValue(row: RowRecord, rowIndex: number, column: MAdvanceTableColumnConfig) {
  const value = column.fieldVariable
    ? applyColumnProcessors(readDataPath(row, column.fieldVariable), column)
    : getCellBlocks(row, rowIndex, column).map(getBlockText).join('');
  const text = stringifyCellValue(value);
  if (!text) return;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text).catch(() => undefined);
  }
}

function getRowDataKey(row: RowRecord, rowIndex: number) {
  return normalizeKeyId(getRowKeyValue(row, rowIndex));
}

watch(
  () => getDatasourceConfigSignature(normalizedDatasource.value),
  () => {
    void loadDatasourceRows();
  },
  { immediate: true }
);

watch(
  () => props.filters,
  (value) => {
    filterState.value = normalizeRecordConfig(value) ?? {};
  },
  { deep: true }
);

watch(
  () => props.sort,
  (value) => {
    sortState.value = normalizeSortState(value) ?? {};
  },
  { deep: true }
);

defineExpose({
  getData,
  refresh,
  getSelectedRows,
  getSelectedValues,
  clearSelection,
  getSelectionState,
  setRows,
  setLoading,
  setPagination,
  resetPageAndRefresh,
  setSort,
  selectRows,
  scrollToRow
});
</script>

<template>
  <div ref="rootRef" :class="tableClass" data-testid="editor-advance-table-tool">
    <div class="ce-advance-table-tool__scroller" :style="scrollerStyle">
      <table class="ce-advance-table-tool__table" data-testid="advance-table">
        <thead>
          <tr v-for="(headerRow, headerRowIndex) in headerRows" :key="`header-row-${headerRowIndex}`">
            <th
              v-if="headerRowIndex === 0 && hasSelectionColumn"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--header ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :rowspan="maxHeaderDepth"
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
              v-if="headerRowIndex === 0 && hasIndexColumn"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--header ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :rowspan="maxHeaderDepth"
              :style="getIndexStyle()"
              data-testid="advance-table-index-header"
            >
              #
            </th>
            <th
              v-for="column in headerRow"
              :key="`header-${column.id}`"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--header"
              :class="getFixedClass(column)"
              :style="getColumnStyle(column, Math.max(column.leafIndex, 0), true)"
              :colspan="column.colspan"
              :rowspan="column.rowspan"
              :data-testid="column.leafIndex >= 0 ? `advance-table-header-${column.leafIndex}` : `advance-table-header-group-${column.id}`"
              @click="toggleSort(column)"
            >
              <button
                v-if="column.sortable"
                class="ce-advance-table-tool__sort-button"
                type="button"
              >
                <span>{{ column.columnName }}</span>
                <span class="ce-advance-table-tool__sort-indicator">{{ getSortIndicator(column) }}</span>
              </button>
              <template v-else>{{ column.columnName }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in displayRows"
            :key="`row-${getRowDataKey(row, rowIndex) || rowIndex}`"
            class="ce-advance-table-tool__row"
            :class="{ 'ce-advance-table-tool__row--selected': isRowSelected(row, rowIndex) }"
            :data-testid="`advance-table-row-${rowIndex}`"
            :data-row-key="getRowDataKey(row, rowIndex)"
            @click="emitRowEvent('row-click', row, rowIndex, $event)"
            @dblclick="emitRowEvent('row-dblclick', row, rowIndex, $event)"
          >
            <td
              v-if="hasSelectionColumn"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :style="getSelectionStyle()"
              :data-testid="`advance-table-selection-cell-${rowIndex}`"
            >
              <input
                class="ce-advance-table-tool__checkbox"
                type="checkbox"
                :checked="isRowSelected(row, rowIndex)"
                :disabled="isRowDisabled(row, rowIndex)"
                :aria-label="t('advanceTable.selectRow')"
                @change.stop="toggleRow(row, rowIndex)"
                @click.stop
              />
            </td>
            <td
              v-if="hasIndexColumn"
              class="ce-advance-table-tool__cell ce-advance-table-tool__cell--control ce-advance-table-tool__cell--fixed-left"
              :style="getIndexStyle()"
              :data-testid="`advance-table-index-cell-${rowIndex}`"
            >
              {{ rowIndex + 1 }}
            </td>
            <td
              v-for="(column, columnIndex) in leafColumns"
              :key="`cell-${rowIndex}-${column.id}`"
              class="ce-advance-table-tool__cell"
              :class="getFixedClass(column)"
              :style="getColumnStyle(column, columnIndex)"
              :data-testid="`advance-table-cell-${rowIndex}-${columnIndex}`"
              :title="column.tooltip && column.fieldVariable ? stringifyCellValue(readDataPath(row, column.fieldVariable)) : undefined"
            >
              <template
                v-for="(block, blockIndex) in getCellBlocks(row, rowIndex, column)"
                :key="`${rowIndex}-${columnIndex}-${block.id}-${block.type}-${blockIndex}`"
              >
                <span v-if="block.type === 'paragraph'" class="ce-advance-table-tool__cell-text">{{ getBlockText(block) }}</span>
                <span v-else class="ce-advance-table-tool__cell-token">
                  <component
                    :is="getPreviewComponent(block.type)"
                    v-bind="getPreviewProps(block)"
                    v-on="getCellBlockEventListeners(block, row, rowIndex)"
                  />
                </span>
              </template>
              <button
                v-if="column.copyable"
                class="ce-advance-table-tool__copy-button"
                type="button"
                :aria-label="t('advanceTable.copyCell')"
                @click.stop="copyCellValue(row, rowIndex, column)"
              >
                {{ t('advanceTable.copy') }}
              </button>
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
      <p v-if="paginationLayout.includes('total')" data-testid="advance-table-pagination-summary">{{ paginationSummary }}</p>
      <div class="ce-advance-table-tool__pagination-actions" :aria-label="t('advanceTable.pagination.label')">
        <select
          v-if="paginationLayout.includes('sizes')"
          class="ce-advance-table-tool__page-size"
          :value="pagination.pageSize"
          :disabled="isLoading"
          @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="size in availablePageSizes" :key="size" :value="size">
            {{ t('advanceTable.pagination.pageSize').replace('{size}', String(size)) }}
          </option>
        </select>
        <button
          v-if="paginationLayout.includes('prev')"
          type="button"
          :disabled="isLoading || !pagination.hasPreviousPage"
          @click="goToPage(pagination.currentPage - 1)"
        >
          {{ t('advanceTable.pagination.previous') }}
        </button>
        <template v-if="paginationLayout.includes('pager')">
          <button
            v-for="page in pageNumbers"
            :key="page"
            class="ce-advance-table-tool__page-button"
            :class="{ 'ce-advance-table-tool__page-button--active': page === pagination.currentPage }"
            type="button"
            :disabled="isLoading || page === pagination.currentPage"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>
        <button
          v-if="paginationLayout.includes('next')"
          type="button"
          :disabled="isLoading || !pagination.hasNextPage"
          @click="goToPage(pagination.currentPage + 1)"
        >
          {{ t('advanceTable.pagination.next') }}
        </button>
        <span v-if="paginationLayout.includes('jumper')" class="ce-advance-table-tool__jumper">
          <input
            v-model="pageJumpValue"
            type="number"
            min="1"
            :max="pagination.totalPages"
            :placeholder="t('advanceTable.pagination.jumper')"
            @keydown.enter="jumpToPage"
          />
          <button type="button" :disabled="isLoading" @click="jumpToPage">
            {{ t('advanceTable.pagination.jump') }}
          </button>
        </span>
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

.ce-advance-table-tool--small .ce-advance-table-tool__table {
  font-size: 12px;
}

.ce-advance-table-tool--large .ce-advance-table-tool__table {
  font-size: 15px;
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

.ce-advance-table-tool--stripe .ce-advance-table-tool__row:nth-child(even) .ce-advance-table-tool__cell {
  background: rgb(248 250 252);
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

.ce-advance-table-tool__sort-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  cursor: pointer;
}

.ce-advance-table-tool__sort-indicator {
  display: inline-flex;
  min-width: 12px;
  color: rgb(37 99 235);
  font-size: 11px;
}

.ce-advance-table-tool__copy-button {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: rgb(37 99 235);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
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

.ce-advance-table-tool__pagination-actions,
.ce-advance-table-tool__jumper {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.ce-advance-table-tool__pagination button,
.ce-advance-table-tool__page-size,
.ce-advance-table-tool__jumper input {
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
}

.ce-advance-table-tool__jumper input {
  width: 84px;
  min-width: 84px;
  padding: 0 8px;
}

.ce-advance-table-tool__pagination button:disabled,
.ce-advance-table-tool__page-size:disabled {
  color: rgb(148 163 184);
  background: rgb(248 250 252);
}

.ce-advance-table-tool__page-button--active {
  border-color: rgb(37 99 235);
  background: rgb(239 246 255);
  color: rgb(37 99 235);
}

.ce-advance-table-tool__cell-token {
  display: inline-flex;
  align-items: center;
  margin: 2px 3px;
  vertical-align: middle;
}

.ce-advance-table-tool__cell-token :deep(.page-dsl-block) {
  display: inline-flex;
  width: auto;
}

.ce-advance-table-tool__cell-token :deep(.page-dsl-button-wrap) {
  display: inline-flex;
}

.ce-advance-table-tool__cell-token :deep(.page-dsl-button) {
  min-height: 30px;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 16px;
}

.ce-advance-table-tool__empty {
  color: rgb(100 116 139);
  text-align: center;
}

:global(.dark) .ce-advance-table-tool {
  color: rgb(226 232 240);
}

:global(.dark) .ce-advance-table-tool__scroller,
:global(.dark) .ce-advance-table-tool__pagination {
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
</style>
