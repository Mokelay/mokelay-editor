import { defineAsyncComponent } from 'vue';
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import { cloneSelectorBlock, type StoredBlock } from '@/blocks/mEditorSelectorEditorTool';
import { cloneBlockEvents, type BlockEvent } from '@/utils/blockEvents';
import { normalizeVariableDataType } from '@/utils/variableValue';
import {
  normalizeFormItemProps,
  type MFormItemLayout,
  type MFormItemProps
} from '@/blocks/MFormItem.vue';

const MFormItemsEditor = defineAsyncComponent(() => import('@/blocks/MFormItemsEditor.vue'));

export interface MFormItemData {
  labelName: string;
  variableName: string;
  fieldDataType?: string;
  editor?: StoredBlock;
  layout: MFormItemLayout;
  events?: BlockEvent[];
}

export interface MFormProps {
  edit: boolean;
  currentBlockId?: string;
  items?: MFormItemData[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

type MFormItemDataInput = Partial<MFormItemProps> & {
  events?: unknown;
  fieldDataType?: unknown;
};

export function cloneFormItemData(item: MFormItemDataInput): MFormItemData {
  const normalized = normalizeFormItemProps({
    ...item,
    edit: false
  });
  const events = cloneBlockEvents(item.events);
  const fieldDataType = normalizeOptionalString(item.fieldDataType);

  return {
    labelName: normalized.labelName,
    variableName: normalized.variableName,
    ...(fieldDataType ? { fieldDataType } : {}),
    ...(normalized.editor ? { editor: cloneSelectorBlock(normalized.editor) } : {}),
    layout: normalized.layout,
    events
  };
}

export function normalizeMFormItem(value: unknown): MFormItemData | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return cloneFormItemData(value as MFormItemDataInput);
}

export function normalizeMFormItems(value: unknown): MFormItemData[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeMFormItem(item))
    .filter((item): item is MFormItemData => item !== undefined);
}

export const mFormEditorTool = defineEditorTool<MFormProps>({
  toolbox: {
    get title() {
      return i18n.t('form.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('form.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'items',
          label: i18n.t('form.properties.items'),
          type: 'component' as const,
          component: MFormItemsEditor
        }
      ];
    }
  },
  createInitialProps: () => ({
    items: []
  }),
  getDataFields: (context) => normalizeMFormItems(context.data.items).map((item) => ({
    label: item.labelName,
    variable: item.variableName,
    dataType: normalizeVariableDataType(item.fieldDataType)
  })),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    items: normalizeMFormItems(props.items)
  }),
  serialize: (props) => ({
    items: normalizeMFormItems(props.items).map((item) => cloneFormItemData(item))
  })
});
