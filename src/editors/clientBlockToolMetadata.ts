import { i18n } from '@/i18n';
import type {
  EditorToolDefinition,
  EditorToolPropertyField,
  ResolvedEditorToolDefinition
} from '@/editors/editorToolDefinition';
import { getClientBlockPropertyComponentBinding, getLocalizedTextPropertyBinding } from '@/editors/clientBlockPropertyComponents';
import { migrateLegacyLocalizedValue } from 'mokelay-components/runtime';
import {
  getClientBlockDocSnapshot,
  type ClientBlockPropertyField,
  type LocalizedText,
  type NormalizedClientBlockDoc
} from '@/utils/clientBlockDocs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function localizedClientBlockText(value: LocalizedText | undefined, fallback = '') {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const localeValue = i18n.locale === 'en' ? value.en : value.zh;
    if (typeof localeValue === 'string' && localeValue.trim()) return localeValue;
    if (typeof value.raw === 'string' && value.raw.trim() && !value.raw.includes('i18n.')) return value.raw;
  }
  return fallback;
}

function isLocalizedValue(value: Record<string, unknown>) {
  const keys = Object.keys(value);
  return keys.some((key) => key === 'zh' || key === 'en' || key === 'raw')
    && keys.every((key) => ['zh', 'en', 'raw', 'value'].includes(key));
}

export function resolveClientBlockDefaultValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(resolveClientBlockDefaultValue);
  if (!isRecord(value)) return value;
  if (isLocalizedValue(value)) return localizedClientBlockText(value as LocalizedText, '');

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, resolveClientBlockDefaultValue(item)])
  );
}

export function getClientBlockDefaultData(doc: NormalizedClientBlockDoc | undefined) {
  if (!doc) return {};
  const data = resolveClientBlockDefaultValue(doc.defaultData) as Record<string, unknown>;
  for (const field of doc.properties) {
    if ((field.localizable !== true && !commonLocalizablePropertyKeys.has(field.key)) || !field.key) continue;
    const localized = migrateLegacyLocalizedValue(doc.defaultData[field.key]);
    if (localized) data[field.key] = localized;
  }
  return data;
}

function allowedFieldType(value: unknown): EditorToolPropertyField['type'] {
  return value === 'select' || value === 'checkbox' || value === 'textarea' || value === 'component'
    ? value
    : 'text';
}

function allowedValueType(value: unknown): EditorToolPropertyField['valueType'] | undefined {
  return value === 'json' || value === 'string' ? value : undefined;
}

function normalizeOptions(value: unknown): EditorToolPropertyField['options'] | undefined {
  if (!Array.isArray(value)) return undefined;
  const options = value.flatMap((option) => {
    if (!isRecord(option)) return [];
    const optionValue = typeof option.value === 'string' ? option.value : '';
    if (!optionValue) return [];
    return [{
      label: localizedClientBlockText(option.label as LocalizedText | undefined, optionValue),
      value: optionValue
    }];
  });
  return options.length ? options : undefined;
}

// Central schema for common top-level user-facing text. Complex component editors
// declare their nested localizable paths alongside their own schemas.
const commonLocalizablePropertyKeys = new Set([
  'placeholder', 'title', 'label', 'text', 'description', 'emptyText', 'caption',
  'alt', 'lowLabel', 'highLabel', 'displayName', 'debugLabel', 'labelName'
]);

export function resolveClientBlockPropertyFields(doc: NormalizedClientBlockDoc): EditorToolPropertyField[] {
  return doc.properties.flatMap((field: ClientBlockPropertyField): EditorToolPropertyField[] => {
    if (!field.key || field.configurable === false) return [];
    const localizable = field.localizable === true || commonLocalizablePropertyKeys.has(field.key);
    const requestedType = allowedFieldType(field.type);
    const type = localizable ? 'component' : requestedType;
    const binding = localizable
      ? getLocalizedTextPropertyBinding({
          placeholder: localizedClientBlockText(field.placeholder),
          multiline: requestedType === 'textarea',
          propertyKey: field.key
        })
      : type === 'component'
      ? getClientBlockPropertyComponentBinding(doc.blockType, field.key)
      : undefined;

    if (type === 'component' && !binding?.component) return [];

    return [{
      key: field.key,
      label: localizedClientBlockText(field.label, field.key),
      type,
      valueType: allowedValueType(field.valueType),
      placeholder: localizedClientBlockText(field.placeholder),
      validationMessage: localizedClientBlockText(field.validationMessage),
      localizable,
      options: normalizeOptions(field.options),
      component: binding?.component,
      getComponentProps: binding?.getComponentProps
    }];
  });
}

export function resolveEditorToolDefinition<T extends EditorToolDefinition>(
  toolName: string,
  definition: T,
  suppliedDoc?: NormalizedClientBlockDoc
): ResolvedEditorToolDefinition {
  const doc = suppliedDoc ?? getClientBlockDocSnapshot(toolName);
  const title = doc
    ? localizedClientBlockText(doc.toolbox.title, doc.displayName)
    : toolName;
  const fields = doc ? resolveClientBlockPropertyFields(doc) : [];

  return {
    ...definition,
    toolbox: {
      title,
      icon: doc && typeof doc.toolbox.icon === 'string' ? doc.toolbox.icon : ''
    },
    createInitialProps: () => getClientBlockDefaultData(doc),
    propertyPanel: fields.length
      ? {
          title: `${title}${i18n.t('editor.propertyDialogTitle')}`,
          fields
        }
      : undefined
  };
}
