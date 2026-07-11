import {
  getRegisteredEditorToolNames,
  isRegisteredEditorComponent
} from '@/editors/editorComponentRuntimeRegistry';
import type { EditorComponentToolbox } from '@/editors/editorToolDefinition';
import { getClientBlockDefaultData } from '@/editors/clientBlockToolMetadata';
import {
  getClientBlockDocSnapshot,
  getToolboxVisibleClientBlockDocs
} from '@/utils/clientBlockDocs';
import {
  cloneSelectorBlock,
  type StoredBlock
} from '@/editors/blocks/mEditorSelectorEditorTool';

const INTERNAL_FORM_TOOL_NAMES = new Set(['MPage', 'MForm', 'MFormItem', 'MEditorSelector']);

function generateBlockId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 10);
  }

  return Math.random().toString(36).slice(2, 12);
}

export function getFormItemToolNames() {
  const docs = getToolboxVisibleClientBlockDocs();
  if (docs.length) {
    return docs
      .map((doc) => doc.blockType)
      .filter((toolName) => !INTERNAL_FORM_TOOL_NAMES.has(toolName) && isRegisteredEditorComponent(toolName));
  }

  return getRegisteredEditorToolNames().filter((toolName) =>
    !INTERNAL_FORM_TOOL_NAMES.has(toolName) && isRegisteredEditorComponent(toolName)
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
  const doc = getClientBlockDocSnapshot(toolName);
 return cloneSelectorBlock({
   id: generateBlockId(),
   type: toolName,
    data: getClientBlockDefaultData(doc)
 });
}

export function getFormItemToolbox(toolName: string): EditorComponentToolbox {
  const doc = getClientBlockDocSnapshot(toolName);
  return {
    title: doc?.displayName || toolName,
    icon: typeof doc?.toolbox.icon === 'string' ? doc.toolbox.icon : '',
  };
}
