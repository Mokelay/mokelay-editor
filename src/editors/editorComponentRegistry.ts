import { markRaw } from 'vue';
import MInput, { mInputEditorTool } from '@/blocks/MInput.vue';
import type { EditorToolDefinition } from '@/editors/editorToolDefinition';

export type { EditorComponentToolbox, EditorToolComponentProps, EditorToolDefinition } from '@/editors/editorToolDefinition';

type NamedComponent = {
  name?: string;
  __name?: string;
};

function getEditorComponentName(component: NamedComponent) {
  const componentName = component.name || component.__name;
  if (!componentName) {
    throw new Error('Editor component is missing both name and __name.');
  }
  return componentName;
}

const editorComponentRegistry: Record<string, EditorToolDefinition> = {
  [getEditorComponentName(MInput)]: {
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
