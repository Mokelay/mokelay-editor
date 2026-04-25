import { markRaw } from 'vue';
import MInput, { mInputEditorTool } from '@/components/editor-tools/MInput.vue';
import type { EditorToolDefinition } from '@/components/editor-tools/editorToolDefinition';

export type { EditorComponentToolbox, EditorToolComponentProps, EditorToolDefinition } from '@/components/editor-tools/editorToolDefinition';

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
