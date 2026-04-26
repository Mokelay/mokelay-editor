import { createApp, type App } from 'vue';
import {
  getEditorComponentRegistry,
  getEditorComponentDefinition,
  type EditorToolComponentProps
} from '@/editors/editorComponentRegistry';
import { i18n } from '@/i18n';

type EditorToolFactoryOptions = {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

type EditorToolClass = new (options: EditorToolFactoryOptions) => {
  render: () => HTMLElement;
  save: () => Record<string, unknown>;
  destroy: () => void;
  renderSettings: () => EditorToolSettingsItem[];
};

const toolClassCache = new Map<string, EditorToolClass>();

type EditorToolSettingsItem = {
  icon: string;
  label?: string;
  name?: string;
  onActivate?: () => void;
  isActive?: () => boolean;
  closeOnActivate?: boolean;
};

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

      renderSettings() {
        return [
          {
            name: 'properties',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            label: i18n.t('editor.blockProperties'),
            closeOnActivate: true,
            onActivate: () => {
              this.openPropsDialog();
            }
          }
        ];
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

      private openPropsDialog() {
        const editableKeys = Object.keys(this.state).filter((key) => key !== 'edit');
        if (!editableKeys.length) return;

        const overlay = document.createElement('div');
        overlay.className = 'ce-props-dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'ce-props-dialog';
        overlay.appendChild(dialog);

        const title = document.createElement('h3');
        title.className = 'ce-props-dialog__title';
        title.textContent = i18n.t('editor.blockProperties');
        dialog.appendChild(title);

        const form = document.createElement('div');
        form.className = 'ce-props-dialog__form';
        dialog.appendChild(form);

        const fields = editableKeys.map((key) => {
          const row = document.createElement('label');
          row.className = 'ce-props-dialog__field';

          const caption = document.createElement('span');
          caption.textContent = key;
          row.appendChild(caption);

          const input = document.createElement('input');
          input.className = 'ce-props-dialog__input';
          input.type = 'text';
          input.value = String((this.state as Record<string, unknown>)[key] ?? '');
          row.appendChild(input);

          form.appendChild(row);
          return { key, input };
        });

        const actions = document.createElement('div');
        actions.className = 'ce-props-dialog__actions';
        dialog.appendChild(actions);

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'ce-props-dialog__btn ce-props-dialog__btn--cancel';
        cancelButton.textContent = i18n.t('editor.cancel');

        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'ce-props-dialog__btn ce-props-dialog__btn--confirm';
        saveButton.textContent = i18n.t('editor.confirm');

        actions.append(cancelButton, saveButton);

        const closeDialog = () => {
          overlay.remove();
        };

        cancelButton.addEventListener('click', closeDialog);
        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) closeDialog();
        });
        saveButton.addEventListener('click', () => {
          fields.forEach(({ key, input }) => {
            (this.state as Record<string, unknown>)[key] = input.value;
          });
          this.mountVueApp();
          closeDialog();
        });

        document.body.appendChild(overlay);
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
