import { createApp, type App } from 'vue';
import { i18n } from '@/i18n';
import {
  getEditorComponentRegistry,
  getEditorComponentDefinition,
  type EditorToolComponentProps
} from '@/editors/editorComponentRegistry';

type EditorToolFactoryOptions = {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

type EditorToolClass = new (options: EditorToolFactoryOptions) => {
  render: () => HTMLElement;
  save: () => Record<string, unknown>;
  destroy: () => void;
};

// 缓存已经构建过的工具类，避免重复创建 class。
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
      private contentRoot: HTMLElement | null = null;
      private vueApp: App<Element> | null = null;
      private propertyButton: HTMLButtonElement | null = null;
      private propertyDialog: HTMLDialogElement | null = null;
      private readonly boundShowPropertyButton = () => {
        this.setPropertyButtonVisible(true);
      };
      private readonly boundHidePropertyButton = () => {
        if (!this.propertyDialog?.open) {
          this.setPropertyButtonVisible(false);
        }
      };
      private readonly boundTouchStart = () => {
        this.setPropertyButtonVisible(true);
      };

      constructor({ data, config }: EditorToolFactoryOptions) {
        // data 是已保存 block.data，config 是工具级固定配置（例如 edit）。
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
        // EditorJS 要求 render 返回宿主元素；内部再挂载 Vue 组件。
        const wrapper = document.createElement('div');
        wrapper.className = 'mokelay-editor-tool';

        const contentRoot = document.createElement('div');
        contentRoot.className = 'mokelay-editor-tool__content';
        wrapper.appendChild(contentRoot);

        this.wrapper = wrapper;
        this.contentRoot = contentRoot;
        this.createPropertyButton();
        this.createPropertyDialog();
        this.bindWrapperEvents();
        this.mountVueApp();
        return wrapper;
      }

      destroy() {
        this.unbindWrapperEvents();
        this.unmountVueApp();
        this.propertyDialog?.remove();
        this.propertyDialog = null;
        this.propertyButton = null;
        this.contentRoot = null;
        this.wrapper = null;
      }

      save() {
        return definition.serialize(this.state);
      }

      private mountVueApp() {
        if (!this.contentRoot) return;

        this.unmountVueApp();
        this.vueApp = createApp(definition.component, {
          ...this.state,
          // 兼容两种回调命名，统一回写到同一份 state。
          onToolChange: (payload: EditorToolComponentProps) => {
            Object.assign(this.state, payload);
          },
          onChange: (payload: EditorToolComponentProps) => {
            Object.assign(this.state, payload);
          }
        });
        this.vueApp.mount(this.contentRoot);
      }

      private unmountVueApp() {
        this.vueApp?.unmount();
        this.vueApp = null;
      }

      private createPropertyButton() {
        if (!this.wrapper || !definition.propertyPanel?.fields.length) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mokelay-editor-tool__property-button';
        button.textContent = i18n.t('editor.properties');
        button.hidden = true;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.openPropertyDialog();
        });
        this.wrapper.appendChild(button);
        this.propertyButton = button;
      }

      private createPropertyDialog() {
        if (!this.wrapper || !definition.propertyPanel?.fields.length) return;

        const dialog = document.createElement('dialog');
        dialog.className = 'mokelay-editor-tool__property-dialog';
        dialog.addEventListener('close', () => {
          this.boundHidePropertyButton();
        });

        const title = definition.propertyPanel.title || i18n.t('editor.propertyDialogTitle');
        const fields = definition.propertyPanel.fields.map((field) => {
          const value = this.getPropertyFieldValue(field.key);
          return `
            <label class="mokelay-editor-tool__property-field">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(field.label)}</span>
              <input
                class="mokelay-editor-tool__property-input"
                data-property-key="${field.key}"
                type="${field.type ?? 'text'}"
                value="${this.escapeHtml(value)}"
                placeholder="${this.escapeHtml(field.placeholder ?? '')}"
              />
            </label>
          `;
        }).join('');

        dialog.innerHTML = `
          <form method="dialog" class="mokelay-editor-tool__property-panel">
            <div class="mokelay-editor-tool__property-header">
              <h3 class="mokelay-editor-tool__property-title">${this.escapeHtml(title)}</h3>
              <button type="submit" class="mokelay-editor-tool__property-close">${this.escapeHtml(i18n.t('editor.close'))}</button>
            </div>
            <div class="mokelay-editor-tool__property-body">
              ${fields}
            </div>
          </form>
        `;

        dialog.querySelectorAll<HTMLInputElement>('[data-property-key]').forEach((input) => {
          // 属性面板输入实时更新工具状态。
          input.addEventListener('input', () => {
            const propertyKey = input.dataset.propertyKey;
            if (!propertyKey) return;
            this.updateProperty(propertyKey, input.value);
          });
        });

        this.wrapper.appendChild(dialog);
        this.propertyDialog = dialog;
      }

      private bindWrapperEvents() {
        if (!this.wrapper || !this.propertyButton) return;
        this.wrapper.addEventListener('mouseenter', this.boundShowPropertyButton);
        this.wrapper.addEventListener('mouseleave', this.boundHidePropertyButton);
        this.wrapper.addEventListener('touchstart', this.boundTouchStart, { passive: true });
      }

      private unbindWrapperEvents() {
        if (!this.wrapper || !this.propertyButton) return;
        this.wrapper.removeEventListener('mouseenter', this.boundShowPropertyButton);
        this.wrapper.removeEventListener('mouseleave', this.boundHidePropertyButton);
        this.wrapper.removeEventListener('touchstart', this.boundTouchStart);
      }

      private setPropertyButtonVisible(visible: boolean) {
        if (!this.propertyButton) return;
        this.propertyButton.hidden = !visible;
      }

      private openPropertyDialog() {
        if (!this.propertyDialog) return;
        this.setPropertyButtonVisible(true);
        this.syncPropertyDialogValues();
        if (!this.propertyDialog.open) {
          this.propertyDialog.showModal();
        }
      }

      private syncPropertyDialogValues() {
        if (!this.propertyDialog) return;
        this.propertyDialog.querySelectorAll<HTMLInputElement>('[data-property-key]').forEach((input) => {
          const propertyKey = input.dataset.propertyKey;
          if (!propertyKey) return;
          input.value = this.getPropertyFieldValue(propertyKey);
        });
      }

      private updateProperty(key: string, value: string) {
        (this.state as Record<string, unknown>)[key] = value;
        // 属性变化后重新挂载组件，确保视图与状态同步。
        this.mountVueApp();
      }

      private getPropertyFieldValue(key: string) {
        const value = (this.state as Record<string, unknown>)[key];
        return typeof value === 'string' ? value : '';
      }

      private escapeHtml(value: string) {
        return value
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
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
