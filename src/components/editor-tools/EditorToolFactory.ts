import { createApp, type App } from 'vue';
import {
  getEditorComponentRegistry,
  getEditorComponentDefinition,
  type EditorToolComponentProps
} from '@/components/editor-tools/editorComponentRegistry';

type EditorToolFactoryOptions = {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

type EditorToolClass = new (options: EditorToolFactoryOptions) => {
  render: () => HTMLElement;
  save: () => Record<string, unknown>;
  destroy: () => void;
};

const toolClassCache = new Map<string, EditorToolClass>();

export default class EditorToolFactory {
  static create(toolName: string): EditorToolClass {
    const cachedTool = toolClassCache.get(toolName);
    if (cachedTool) return cachedTool;

    const definition = getEditorComponentDefinition(toolName);
    if (!definition) {
      throw new Error(`EditorToolFactory could not find a registered component for "${toolName}".`);
    }

    class RegisteredEditorTool {
      static get toolbox() {
        return definition.toolbox;
      }

      private readonly state: EditorToolComponentProps;
      private wrapper: HTMLElement | null = null;
      private vueApp: App<Element> | null = null;

      constructor({ data, config }: EditorToolFactoryOptions) {
        const mergedProps = {
          ...(config ?? {}),
          ...(data ?? {})
        };

        if (typeof mergedProps.edit !== 'boolean') {
          throw new Error(`EditorToolFactory requires config.edit to be explicitly set for "${toolName}".`);
        }

        this.state = definition.normalizeProps({
          ...mergedProps
        });
      }

      render() {
        const wrapper = document.createElement('div');
        this.wrapper = wrapper;
        this.mountVueApp();
        return wrapper;
      }

      destroy() {
        this.unmountVueApp();
      }

      save() {
        return definition.serialize(this.state);
      }

      private mountVueApp() {
        if (!this.wrapper) return;

        this.unmountVueApp();
        this.vueApp = createApp(definition.component, {
          ...this.state,
          onChange: (payload: EditorToolComponentProps) => {
            Object.assign(this.state, payload);
          }
        });
        this.vueApp.mount(this.wrapper);
      }

      private unmountVueApp() {
        this.vueApp?.unmount();
        this.vueApp = null;
      }
    }

    const createdTool = RegisteredEditorTool as unknown as EditorToolClass;
    toolClassCache.set(toolName, createdTool);
    return createdTool;
  }
}

export function createEditorTools(sharedConfig: Partial<EditorToolComponentProps> = {}) {
  return Object.fromEntries(
    Object.entries(getEditorComponentRegistry()).map(([toolName, definition]) => [
      toolName,
      {
        class: EditorToolFactory.create(toolName),
        config: definition.normalizeProps({
          ...(definition.createInitialProps?.() ?? {}),
          ...sharedConfig
        })
      }
    ])
  );
}
