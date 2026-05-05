export type JsonObject = Record<string, unknown>;

export type EditorToolComponentProps = {
  edit: boolean;
};

export type EditorToolPropertyField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'select' | 'checkbox';
  options?: Array<{
    label: string;
    value: string;
  }>;
};

export type EditorToolPropertyPanel = {
  title?: string;
  fields: EditorToolPropertyField[];
};

export type EditorComponentToolbox = {
  title: string;
  icon: string;
};

export type EditorToolDefinition<TProps extends EditorToolComponentProps = EditorToolComponentProps> = {
  toolbox: EditorComponentToolbox;
  createInitialProps?: () => Partial<TProps>;
  propertyPanel?: EditorToolPropertyPanel;
  normalizeProps: (props: Partial<TProps>) => TProps;
  serialize: (props: TProps) => JsonObject;
};

export function defineTool<TProps extends EditorToolComponentProps>(definition: EditorToolDefinition<TProps>) {
  return definition;
}

export type ToolRegistry = Record<string, EditorToolDefinition>;

export function createRegistry(initialRegistry: ToolRegistry = {}): ToolRegistry {
  return { ...initialRegistry };
}

export function registerTool(registry: ToolRegistry, toolName: string, definition: EditorToolDefinition) {
  registry[toolName] = definition;
  return registry;
}

export function isToolRegistered(registry: ToolRegistry, toolName: string) {
  return toolName in registry;
}
