import { defineAsyncComponent } from 'vue';
import { i18n } from '@/i18n';
import type { EditorToolPropertyField } from '@/editors/editorToolDefinition';
import { getClientBlockDocSnapshot } from '@/utils/clientBlockDocs';
import type { VariableValueDataType } from '@/utils/variableValue';

const MFormItemsEditor = defineAsyncComponent(() => import('@/editors/blocks/MFormItemsEditor.vue'));
const MActionToolBarEditor = defineAsyncComponent(() => import('@/editors/blocks/MActionToolBarEditor.vue'));
const MActionEditor = defineAsyncComponent(() => import('@/editors/blocks/MActionEditor.vue'));
const MAdvanceTableColumnsEditor = defineAsyncComponent(() => import('@/editors/blocks/MAdvanceTableColumnsEditor.vue'));
const MChartDataEditor = defineAsyncComponent(() => import('@/editors/blocks/MChartDataEditor.vue'));
const MDatasourceEditor = defineAsyncComponent(() => import('@/editors/blocks/MDatasourceEditor.vue'));
const MTabsConfigEditor = defineAsyncComponent(() => import('@/editors/blocks/MTabsConfigEditor.vue'));
const MVariableValueEditor = defineAsyncComponent(() => import('@/editors/blocks/MVariableValueEditor.vue'));

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

function getRuntimeBlockDataSources(state: Record<string, unknown>) {
  const getter = state.getAvailableBlockDataSources;
  if (typeof getter !== 'function') return [];
  const currentBlockId = typeof state.currentBlockId === 'string' ? state.currentBlockId : undefined;
  return (getter as (excludeBlockId?: string) => unknown)(currentBlockId);
}

function getRuntimePageVariableSources(state: Record<string, unknown>) {
  const getter = state.getAvailablePageVariableSources;
  if (typeof getter !== 'function') return [];
  return (getter as () => unknown)();
}

type VariableValueBindingOptions = {
  valueType: VariableValueDataType | ((state: Record<string, unknown>) => VariableValueDataType);
  multiline?: boolean;
  placeholder?: string;
};

function variableValueBinding(options: VariableValueBindingOptions): PropertyComponentBinding {
  return {
    component: MVariableValueEditor,
    getComponentProps: ({ value, state }) => ({
      modelValue: value,
      valueType: typeof options.valueType === 'function'
        ? options.valueType(state)
        : options.valueType,
      multiline: options.multiline === true,
      placeholder: options.placeholder ?? '',
      blockDataSources: getRuntimeBlockDataSources(state),
      pageVariableSources: getRuntimePageVariableSources(state)
    })
  };
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
  'MChart.xAxis': {
    component: MChartDataEditor,
    getComponentProps: ({ state }) => ({
      xAxis: cloneJsonValue(state.xAxis),
      series: cloneJsonValue(state.series),
      chartType: typeof state.type === 'string' ? state.type : 'line',
      outputMode: 'patch'
    })
  },
  'MTabs.tabs': {
    component: MTabsConfigEditor,
    getComponentProps: ({ state }) => ({
      tabs: cloneJsonValue(state.tabs),
      activeTabId: typeof state.activeTabId === 'string' ? state.activeTabId : '',
      outputMode: 'patch'
    })
  },
  'MUploadImport.uploadAction': {
    component: MActionEditor
  },
  'MInput.value': variableValueBinding({ valueType: 'string' }),
  'MTextField.value': variableValueBinding({ valueType: 'string' }),
  'MEmailField.value': variableValueBinding({ valueType: 'string' }),
  'MPhoneField.value': variableValueBinding({ valueType: 'string' }),
  'MLinkField.value': variableValueBinding({ valueType: 'string' }),
  'MTextareaField.value': variableValueBinding({ valueType: 'string', multiline: true }),
  'MSelectField.options': variableValueBinding({ valueType: 'array', multiline: true }),
  'MDateRangeField.value': variableValueBinding({
    valueType: 'object',
    multiline: true,
    placeholder: '{ "start": "2026-01-01", "end": "2026-01-31" }'
  }),
  'MCheckboxGroupField.value': variableValueBinding({ valueType: 'array', multiline: true }),
  'MImageChoiceField.value': variableValueBinding({
    valueType: (state) => state.multiple === true ? 'array' : 'string',
    multiline: true
  }),
  'MActionCardList.items': variableValueBinding({ valueType: 'array', multiline: true })
};

export function getClientBlockPropertyComponentBinding(blockType: string, propertyKey: string) {
  return propertyComponentBindings[`${blockType}.${propertyKey}`];
}
