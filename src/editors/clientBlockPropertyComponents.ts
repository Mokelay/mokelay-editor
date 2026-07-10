import { defineAsyncComponent } from 'vue';
import { i18n } from '@/i18n';
import type { EditorToolPropertyField } from '@/editors/editorToolDefinition';
import { getClientBlockDocSnapshot } from '@/utils/clientBlockDocs';

const MFormItemsEditor = defineAsyncComponent(() => import('@/blocks/MFormItemsEditor.vue'));
const MActionToolBarEditor = defineAsyncComponent(() => import('@/blocks/MActionToolBarEditor.vue'));
const MActionEditor = defineAsyncComponent(() => import('@/blocks/MActionEditor.vue'));
const MAdvanceTableColumnsEditor = defineAsyncComponent(() => import('@/blocks/MAdvanceTableColumnsEditor.vue'));
const MDatasourceEditor = defineAsyncComponent(() => import('@/blocks/MDatasourceEditor.vue'));

type PropertyComponentBinding = Pick<EditorToolPropertyField, 'component' | 'getComponentProps'>;

type LocalizedDataFieldLabel = {
  zh?: unknown;
  en?: unknown;
  raw?: unknown;
};

function cloneJsonValue(value: unknown) {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}

function localizedDataFieldLabel(value: unknown, fallback: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return fallback;

  const label = value as LocalizedDataFieldLabel;
  const localeValue = i18n.locale === 'en' ? label.en : label.zh;
  if (typeof localeValue === 'string' && localeValue.trim()) return localeValue;
  if (typeof label.raw === 'string' && label.raw.trim()) return label.raw;
  return fallback;
}

function advanceTableMatchingFields() {
  return getClientBlockDocSnapshot('MAdvanceTable')?.dataFields.flatMap((field) => {
    if (typeof field !== 'object' || field === null || Array.isArray(field)) return [];
    const record = field as Record<string, unknown>;
    const localizedLabel = localizedDataFieldLabel(record.label, record.variable);
    // `search` is the table's runtime query state, not a value supplied by its
    // datasource response, so it must not be persisted as a datasource match.
    return record.variable !== 'search' && typeof record.variable === 'string' && typeof record.dataType === 'string'
      ? [{ label: String(localizedLabel), variable: record.variable, type: record.dataType }]
      : [];
  }) ?? [];
}

// JSON documents identify a component editor by name; this map keeps only the
// executable Vue component and any runtime-only props callback out of the docs.
const propertyComponentBindings: Record<string, PropertyComponentBinding> = {
  'MForm.items': {
    component: MFormItemsEditor
  },
  'MForm.actionBar': {
    component: MActionToolBarEditor
  },
  'MActionToolbar.toolbar': {
    component: MActionToolBarEditor,
    getComponentProps: ({ state }) => ({
      value: {
        align: state.align,
        size: state.size,
        mode: state.mode,
        buttons: cloneJsonValue(state.buttons)
      },
      allowEmpty: true,
      outputMode: 'patch'
    })
  },
  'MAdvanceTable.columns': {
    component: MAdvanceTableColumnsEditor
  },
  'MAdvanceTable.ds': {
    component: MDatasourceEditor,
    getComponentProps: ({ value, state }) => ({
      value,
      matchingExternalFields: advanceTableMatchingFields(),
      showPageBreak: state.showPageBreak === true
    })
  },
  'MUploadImport.uploadAction': {
    component: MActionEditor
  }
};

export function getClientBlockPropertyComponentBinding(blockType: string, propertyKey: string) {
  return propertyComponentBindings[`${blockType}.${propertyKey}`];
}
