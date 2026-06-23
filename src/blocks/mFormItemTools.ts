import {
  getEditorComponentDefinition,
  getEditorComponentRegistry
} from '@/editors/editorComponentRegistry';
import type { EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  cloneSelectorBlock,
  type StoredBlock
} from '@/blocks/mEditorSelectorEditorTool';

const INTERNAL_FORM_TOOL_NAMES = new Set(['MPage', 'MForm', 'MFormItem', 'MEditorSelector']);

function generateBlockId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 10);
  }

  return Math.random().toString(36).slice(2, 12);
}

export function getFormItemToolNames() {
  return Object.keys(getEditorComponentRegistry()).filter((toolName) =>
    !INTERNAL_FORM_TOOL_NAMES.has(toolName) && Boolean(getEditorComponentDefinition(toolName))
  );
}

export function isAllowedFormItemToolName(toolName: string) {
  return getFormItemToolNames().includes(toolName);
}

export function getDefaultFormItemToolName() {
  const preferredToolName = 'MInput';
  return isAllowedFormItemToolName(preferredToolName) ? preferredToolName : getFormItemToolNames()[0];
}

export function createInitialFormItemEditorBlock(toolName: string): StoredBlock {
  const definition = getEditorComponentDefinition(toolName);
  if (!definition) {
    throw new Error(`MForm could not find a registered component for "${toolName}".`);
  }

  const normalizedProps = definition.normalizeProps({
    ...(definition.createInitialProps?.() ?? {}),
    edit: true
  } as Partial<EditorToolComponentProps>);

  return cloneSelectorBlock({
    id: generateBlockId(),
    type: toolName,
    data: definition.serialize(normalizedProps)
  });
}
