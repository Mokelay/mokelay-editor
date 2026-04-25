import { markRaw } from 'vue';
import MInput, { mInputEditorTool } from '@/blocks/MInput.vue';
import type { EditorToolDefinition } from '@/editors/editorToolDefinition';

export type { EditorComponentToolbox, EditorToolComponentProps, EditorToolDefinition } from '@/editors/editorToolDefinition';

const editorComponentRegistry: Record<string, EditorToolDefinition> = {
  input: {
    component: markRaw(MInput),
    ...mInputEditorTool
  }
};

export function getEditorComponentDefinition(toolName: string) {
  return editorComponentRegistry[toolName];
}

export function isRegisteredEditorComponent(toolName: string) {
  return toolName in editorComponentRegistry;
}

export function getEditorComponentRegistry() {
  return editorComponentRegistry;
}
