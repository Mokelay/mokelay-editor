import { i18n } from '@/i18n';
import type { EditorToolComponentProps, EditorToolPropertyField } from '@/editors/editorToolDefinition';

export type PageDslAlign = 'left' | 'center' | 'right';
export type PageDslButtonVariant = 'primary' | 'secondary' | 'ghost';

export type PageDslOption = {
  label: string;
  value: string;
  description?: string;
  imageUrl?: string;
};

export type PageDslMatrixRow = {
  label: string;
  value: string;
};

export type PageDslCallbacks<TProps extends EditorToolComponentProps> = {
  onChange?: (payload: TProps) => void;
  onToolChange?: (payload: TProps) => void;
};

export const textIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 6h14M5 12h10M5 18h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
export const fieldIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
export const choiceIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7h7M12 17h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
export const flowIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 6h14v5H5zM5 16h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
export const imageIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m7 16 4-4 3 3 2-2 3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const embedIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 7H7a5 5 0 0 0 0 10h3M14 7h3a5 5 0 0 1 0 10h-3M8 12h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
export const buttonIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="16" height="10" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

export const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
];

export const placeholderField: EditorToolPropertyField = { key: 'placeholder', label: '占位提示' };
export const valueField: EditorToolPropertyField = { key: 'value', label: '值' };
export const jsonValueField: EditorToolPropertyField = {
  key: 'value',
  label: '值 JSON',
  type: 'textarea',
  valueType: 'json',
  validationMessage: '请输入有效值 JSON。'
};

export const inputFields: EditorToolPropertyField[] = [placeholderField, valueField];

export const optionField: EditorToolPropertyField = {
  key: 'options',
  label: '选项 JSON',
  type: 'textarea',
  valueType: 'json',
  validationMessage: '请输入有效选项 JSON。'
};

let nextPageDslFieldId = 0;

export function createPageDslFieldId() {
  return `page-dsl-field-${++nextPageDslFieldId}`;
}

export function pageDslPropertyTitle(title: string) {
  return `${title}${i18n.t('editor.propertyDialogTitle')}`;
}

export function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export function booleanValue(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

export function numberValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : fallback;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeSelectValue<TValue extends string>(
  value: unknown,
  values: readonly TValue[],
  fallback: TValue
) {
  const stringifiedValue = stringValue(value);
  return values.includes(stringifiedValue as TValue) ? stringifiedValue as TValue : fallback;
}

export function normalizeAlign(value: unknown, fallback: PageDslAlign = 'left') {
  return normalizeSelectValue(value, ['left', 'center', 'right'] as const, fallback);
}

export function normalizeButtonVariant(value: unknown, fallback: PageDslButtonVariant = 'primary') {
  return normalizeSelectValue(value, ['primary', 'secondary', 'ghost'] as const, fallback);
}

export function normalizeOptions(value: unknown, fallback: PageDslOption[]) {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .map((item, index) => ({
      label: stringValue(item.label, `选项 ${index + 1}`),
      value: stringValue(item.value, `option_${index + 1}`),
      description: stringValue(item.description),
      imageUrl: stringValue(item.imageUrl)
    }));
}

export function normalizeMatrixRows(value: unknown, fallback: PageDslMatrixRow[]) {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .map((item, index) => ({
      label: stringValue(item.label, `问题 ${index + 1}`),
      value: stringValue(item.value, `row_${index + 1}`)
    }));
}

export function normalizeAction(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? JSON.parse(JSON.stringify(value)) as Record<string, unknown>
    : { type: 'submit' };
}

export function normalizeValue(value: unknown, fallback: unknown) {
  const source = value === undefined ? fallback : value;
  if (
    typeof source === 'string' ||
    typeof source === 'number' ||
    typeof source === 'boolean' ||
    source === null
  ) {
    return source;
  }

  if (typeof source === 'object' && source !== null) {
    return JSON.parse(JSON.stringify(source)) as unknown;
  }

  return fallback;
}
