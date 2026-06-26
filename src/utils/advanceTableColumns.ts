import { i18n } from '@/i18n';
import { normalizeProcessors, type ProcessorConfig } from '@/processors';
import {
  createParagraphBlock,
  getParagraphText,
  normalizeStoredBlocks,
  type StoredBlock
} from '@/utils/storedBlocks';

export type MAdvanceTableFixed = 'left' | 'right' | '' | null;
export type MAdvanceTableAlign = 'left' | 'center' | 'right';
export type MAdvanceTableSortable = boolean | 'custom';

export type ConditionConfig = {
  left?: unknown;
  operator?: 'EQ' | 'NEQ' | 'GT' | 'GE' | 'LT' | 'LE' | 'IN' | 'NOTIN';
  right?: unknown;
};

export interface MAdvanceTableColumnConfig {
  columnName?: string;
  columnContent?: StoredBlock[];
  width?: number | null;
  minWidth?: number | null;
  fixed?: MAdvanceTableFixed;
  fieldVariable?: string;
  fieldDataType?: string;
  align?: MAdvanceTableAlign;
  headerAlign?: MAdvanceTableAlign;
  sortable?: MAdvanceTableSortable;
  filterable?: boolean;
  copyable?: boolean;
  tooltip?: boolean;
  emptyText?: string;
  processors?: ProcessorConfig[];
  visibleWhen?: ConditionConfig;
  children?: MAdvanceTableColumnConfig[];
}

export interface AdvanceTableColumnField {
  label: string;
  variable: string;
  dataType: string;
}

function getTextValue(text: string, id?: string) {
  return [createParagraphBlock(text, id)] satisfies StoredBlock[];
}

export function normalizeAdvanceTableFixed(fixed?: MAdvanceTableFixed) {
  return fixed === 'left' || fixed === 'right' ? fixed : null;
}

export function normalizeAdvanceTableWidth(width?: unknown) {
  if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0) {
    return null;
  }

  return Math.round(width);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

function normalizeAlignValue(value: unknown): MAdvanceTableAlign | undefined {
  return value === 'center' || value === 'right' || value === 'left' ? value : undefined;
}

function normalizeSortable(value: unknown): MAdvanceTableSortable | undefined {
  if (value === 'custom') return 'custom';
  if (typeof value === 'boolean') return value;
  return undefined;
}

function clonePlainValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}

function normalizeCondition(value: unknown): ConditionConfig | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const operator = record.operator;
  const normalizedOperator = operator === 'NEQ' ||
    operator === 'GT' ||
    operator === 'GE' ||
    operator === 'LT' ||
    operator === 'LE' ||
    operator === 'IN' ||
    operator === 'NOTIN'
    ? operator
    : 'EQ';

  return {
    ...(Object.prototype.hasOwnProperty.call(record, 'left') ? { left: clonePlainValue(record.left) } : {}),
    operator: normalizedOperator,
    ...(Object.prototype.hasOwnProperty.call(record, 'right') ? { right: clonePlainValue(record.right) } : {})
  };
}

function normalizeColumnChildren(value: unknown) {
  return Array.isArray(value) ? normalizeAdvanceTableColumns(value as MAdvanceTableColumnConfig[]) : [];
}

export function getDefaultAdvanceTableFieldTemplate(variable: string) {
  return variable ? `{{${variable}}}` : '';
}

export function inferAdvanceTableColumnVariable(columnContent?: StoredBlock[]) {
  const normalizedContent = normalizeStoredBlocks(columnContent);

  for (const block of normalizedContent) {
    const variable = inferTemplateVariable(block.type === 'paragraph' ? getParagraphText(block) : block.data);
    if (variable) return variable;
  }

  return '';
}

function inferTemplateVariable(value: unknown): string {
  if (typeof value === 'string') {
    const match = value.match(/\{\{\s*([A-Za-z0-9_.\[\]-]+)\s*\}\}/);
    return match?.[1]?.trim() ?? '';
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const variable = inferTemplateVariable(item);
      if (variable) return variable;
    }
    return '';
  }

  if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value)) {
      const variable = inferTemplateVariable(item);
      if (variable) return variable;
    }
  }

  return '';
}

export function getSingleParagraphColumnTemplate(column: MAdvanceTableColumnConfig) {
  const content = normalizeStoredBlocks(column.columnContent);
  if (content.length !== 1 || content[0]?.type !== 'paragraph') {
    return undefined;
  }

  return getParagraphText(content[0]);
}

export function setSingleParagraphColumnTemplate(
  column: MAdvanceTableColumnConfig,
  template: string
): MAdvanceTableColumnConfig {
  const content = normalizeStoredBlocks(column.columnContent);
  const existingParagraph = content.length === 1 && content[0]?.type === 'paragraph'
    ? content[0]
    : undefined;

  return {
    ...column,
    columnContent: [createParagraphBlock(template, existingParagraph?.id)]
  };
}

export function createAdvanceTableColumnFromField(field: AdvanceTableColumnField): MAdvanceTableColumnConfig {
  return {
    columnName: field.label,
    fieldVariable: field.variable,
    fieldDataType: field.dataType,
    columnContent: getTextValue(getDefaultAdvanceTableFieldTemplate(field.variable)),
    width: null,
    fixed: null
  };
}

export function normalizeAdvanceTableColumns(columns?: MAdvanceTableColumnConfig[]) {
  if (!Array.isArray(columns) || !columns.length) {
    return [];
  }

  const normalized = columns
    .filter((column): column is MAdvanceTableColumnConfig => typeof column === 'object' && column !== null)
    .map((column, index) => {
      const columnContent = normalizeStoredBlocks(column.columnContent);
      const inferredVariable = inferAdvanceTableColumnVariable(columnContent);
      const fieldVariable = normalizeOptionalString(column.fieldVariable) || inferredVariable;
      const fieldDataType = normalizeOptionalString(column.fieldDataType);
      const minWidth = normalizeAdvanceTableWidth(column.minWidth);
      const align = normalizeAlignValue(column.align);
      const headerAlign = normalizeAlignValue(column.headerAlign);
      const sortable = normalizeSortable(column.sortable);
      const emptyText = normalizeOptionalString(column.emptyText);
      const processors = normalizeProcessors(column.processors);
      const visibleWhen = normalizeCondition(column.visibleWhen);
      const children = normalizeColumnChildren(column.children);

      return {
        columnName: normalizeOptionalString(column.columnName) || `${i18n.t('advanceTable.defaultColumnName')}${index + 1}`,
        columnContent,
        width: normalizeAdvanceTableWidth(column.width),
        ...(minWidth ? { minWidth } : {}),
        fixed: normalizeAdvanceTableFixed(column.fixed),
        ...(fieldVariable ? { fieldVariable } : {}),
        ...(fieldDataType ? { fieldDataType } : {}),
        ...(align ? { align } : {}),
        ...(headerAlign ? { headerAlign } : {}),
        ...(sortable !== undefined ? { sortable } : {}),
        ...(normalizeBoolean(column.filterable) ? { filterable: true } : {}),
        ...(normalizeBoolean(column.copyable) ? { copyable: true } : {}),
        ...(normalizeBoolean(column.tooltip) ? { tooltip: true } : {}),
        ...(emptyText ? { emptyText } : {}),
        ...(processors.length ? { processors } : {}),
        ...(visibleWhen ? { visibleWhen } : {}),
        ...(children.length ? { children } : {})
      };
    });

  return normalized;
}

export function getAdvanceTableFieldsFromColumns(columns?: MAdvanceTableColumnConfig[]): AdvanceTableColumnField[] {
  const normalizedColumns = normalizeAdvanceTableColumns(columns);
  const fieldsByVariable = new Map<string, AdvanceTableColumnField>();

  normalizedColumns.forEach((column) => {
    const variable = normalizeOptionalString(column.fieldVariable) || inferAdvanceTableColumnVariable(column.columnContent);
    if (!variable || fieldsByVariable.has(variable)) {
      return;
    }

    fieldsByVariable.set(variable, {
      label: normalizeOptionalString(column.columnName) || variable,
      variable,
      dataType: normalizeOptionalString(column.fieldDataType) || 'string'
    });
  });

  return [...fieldsByVariable.values()];
}
