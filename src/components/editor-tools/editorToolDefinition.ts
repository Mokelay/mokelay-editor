import type { Component } from 'vue';

export type EditorToolComponentProps = {
  edit: boolean;
};

export type EditorComponentToolbox = {
  title: string;
  icon: string;
};

export type EditorToolDefinition<TProps extends EditorToolComponentProps = EditorToolComponentProps> = {
  component: Component;
  toolbox: EditorComponentToolbox;
  createInitialProps?: () => Partial<TProps>;
  normalizeProps: (props: Partial<TProps>) => TProps;
  serialize: (props: TProps) => Record<string, unknown>;
};

export function defineEditorTool<TProps extends EditorToolComponentProps>(definition: Omit<EditorToolDefinition<TProps>, 'component'>) {
  return definition;
}
