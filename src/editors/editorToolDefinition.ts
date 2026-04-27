import type { Component } from 'vue';

// 所有编辑器工具组件共享的基础 props。
export type EditorToolComponentProps = {
  edit: boolean;
};

export type EditorToolPropertyField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text';
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
  component: Component;
  toolbox: EditorComponentToolbox;
  createInitialProps?: () => Partial<TProps>;
  propertyPanel?: EditorToolPropertyPanel;
  // 将任意输入 props 归一化为可渲染、可保存的完整结构。
  normalizeProps: (props: Partial<TProps>) => TProps;
  // 将组件状态序列化为 EditorJS block.data。
  serialize: (props: TProps) => Record<string, unknown>;
};

// 用于定义工具元数据的辅助函数，运行时不做额外加工，主要提供类型约束。
export function defineEditorTool<TProps extends EditorToolComponentProps>(definition: Omit<EditorToolDefinition<TProps>, 'component'>) {
  return definition;
}
