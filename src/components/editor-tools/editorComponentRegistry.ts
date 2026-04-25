import { markRaw, type Component } from 'vue';
import MInput from '@/components/editor-tools/MInput.vue';
import type { MInputProps } from '@/components/editor-tools/input.types';

export type EditorToolComponentProps = {
  edit: boolean;
} & Record<string, unknown>;

export type EditorComponentToolbox = {
  title: string;
  icon: string;
};

export type EditorComponentDefinition<TProps extends EditorToolComponentProps = EditorToolComponentProps> = {
  component: Component;
  getToolbox: () => EditorComponentToolbox;
  normalizeProps: (props: Partial<TProps>) => TProps;
  serialize: (props: TProps) => Record<string, unknown>;
};

const editorComponentRegistry: Record<string, EditorComponentDefinition> = {
  input: {
    component: markRaw(MInput),
    getToolbox: () => ({
      title: 'Input',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    }),
    normalizeProps: (props) => {
      const inputProps = props as Partial<MInputProps>;
      return {
        edit: inputProps.edit ?? false,
        label: inputProps.label ?? '',
        placeholder: inputProps.placeholder ?? '请输入内容',
        value: inputProps.value ?? ''
      };
    },
    serialize: (props) => {
      const inputProps = props as MInputProps;
      return {
        label: inputProps.label?.trim() ?? '',
        placeholder: inputProps.placeholder ?? '',
        value: inputProps.value ?? ''
      };
    }
  }
};

export function getEditorComponentDefinition(toolName: string) {
  return editorComponentRegistry[toolName];
}

export function isRegisteredEditorComponent(toolName: string) {
  return toolName in editorComponentRegistry;
}
