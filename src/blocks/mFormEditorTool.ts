import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import { cloneSelectorBlock, type StoredBlock } from '@/blocks/mEditorSelectorEditorTool';
import {
  normalizeFormItemProps,
  type MFormItemLayout,
  type MFormItemProps
} from '@/blocks/MFormItem.vue';

export interface MFormItemData {
  labelName: string;
  variableName: string;
  editor?: StoredBlock;
  layout: MFormItemLayout;
}

export interface MFormProps {
  edit: boolean;
  items?: MFormItemData[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function cloneFormItemData(item: Partial<MFormItemProps>): MFormItemData {
  const normalized = normalizeFormItemProps({
    ...item,
    edit: false
  });

  return {
    labelName: normalized.labelName,
    variableName: normalized.variableName,
    ...(normalized.editor ? { editor: cloneSelectorBlock(normalized.editor) } : {}),
    layout: normalized.layout
  };
}

export function normalizeMFormItem(value: unknown): MFormItemData | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return cloneFormItemData(value as Partial<MFormItemProps>);
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
  createInitialProps: () => ({
    items: []
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    items: normalizeMFormItems(props.items)
  }),
  serialize: (props) => ({
    items: normalizeMFormItems(props.items).map((item) => cloneFormItemData(item))
  })
});
