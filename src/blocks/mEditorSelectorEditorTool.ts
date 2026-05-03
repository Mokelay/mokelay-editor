import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type StoredBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

export interface MEditorSelectorProps {
  edit: boolean;
  value?: StoredBlock;
  excludeToolNames?: string[];
}

function generateBlockId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
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

export function normalizeSelectorBlock(value?: unknown): StoredBlock | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.type !== 'string' || typeof record.data !== 'object' || record.data === null || Array.isArray(record.data)) {
    return undefined;
  }

  return {
    id: typeof record.id === 'string' && record.id ? record.id : generateBlockId(),
    type: record.type,
    data: toPlainRecord(record.data)
  };
}

export function cloneSelectorBlock(block: StoredBlock): StoredBlock {
  return {
    id: block.id,
    type: block.type,
    data: toPlainRecord(block.data)
  };
}

export const mEditorSelectorEditorTool = defineEditorTool<MEditorSelectorProps>({
  toolbox: {
    get title() {
      return i18n.t('editorSelector.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 15l2 2 3-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  createInitialProps: () => ({
    value: undefined
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: normalizeSelectorBlock(props.value),
    excludeToolNames: Array.isArray(props.excludeToolNames)
      ? props.excludeToolNames.filter((toolName): toolName is string => typeof toolName === 'string')
      : []
  }),
  serialize: (props) => {
    const value = normalizeSelectorBlock(props.value);
    return value ? { value } : {};
  }
});
