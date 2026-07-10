// This facade keeps preview components decoupled from the registry implementation.
// The registry itself contains only dynamic import descriptors, so importing this
// bridge never downloads a Block module.
export {
  getEditorComponentBehaviorRegistry,
  getEditorComponentDefinition,
  getEditorComponentRegistry,
  getRegisteredEditorComponentNames,
  getRegisteredEditorToolNames,
  isRegisteredEditorComponent,
  loadEditorComponentDefinition,
  loadEditorComponentDefinitions
} from '@/editors/editorComponentRegistry';
