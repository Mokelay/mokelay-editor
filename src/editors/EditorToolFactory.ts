import { createApp, type App } from 'vue';
import { i18n } from '@/i18n';
import type { MenuConfig } from '@editorjs/editorjs/types/tools';
import type { EditorToolPropertyField } from '@/editors/editorToolDefinition';
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

type CreateEditorToolsOptions = {
  exclude?: Iterable<string>;
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
      private propertyDialog: HTMLDialogElement | null = null;

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
        wrapper.dataset.toolName = toolName;
        wrapper.dataset.testid = `editor-tool-${toolName}`;

        const contentRoot = document.createElement('div');
        contentRoot.className = 'mokelay-editor-tool__content';
        contentRoot.dataset.testid = `editor-tool-content-${toolName}`;
        wrapper.appendChild(contentRoot);

        this.wrapper = wrapper;
        this.contentRoot = contentRoot;
        this.createPropertyDialog();
        this.mountVueApp();
        return wrapper;
      }

      destroy() {
        this.unmountVueApp();
        this.propertyDialog?.remove();
        this.propertyDialog = null;
        this.contentRoot = null;
        this.wrapper = null;
      }

      save() {
        return definition.serialize(this.state);
      }

      renderSettings(): MenuConfig {
        if (!definition.propertyPanel?.fields.length) {
          return [];
        }

        return {
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.11 9.51C21.29 9.37 21.34 9.11 21.23 8.9L19.35 5.64C19.24 5.43 18.99 5.35 18.77 5.42L16.44 6.17C15.96 5.8 15.44 5.48 14.87 5.23L14.51 2.75C14.48 2.52 14.28 2.35 14.04 2.35H10.28C10.04 2.35 9.84 2.52 9.81 2.75L9.45 5.23C8.88 5.48 8.36 5.81 7.88 6.17L5.55 5.42C5.33 5.35 5.08 5.43 4.97 5.64L3.09 8.9C2.98 9.11 3.03 9.37 3.21 9.51L5.19 11.06C5.14 11.36 5.12 11.68 5.12 12C5.12 12.32 5.14 12.64 5.19 12.94L3.21 14.49C3.03 14.63 2.98 14.89 3.09 15.1L4.97 18.36C5.08 18.57 5.33 18.65 5.55 18.58L7.88 17.83C8.36 18.2 8.88 18.52 9.45 18.77L9.81 21.25C9.84 21.48 10.04 21.65 10.28 21.65H14.04C14.28 21.65 14.48 21.48 14.51 21.25L14.87 18.77C15.44 18.52 15.96 18.19 16.44 17.83L18.77 18.58C18.99 18.65 19.24 18.57 19.35 18.36L21.23 15.1C21.34 14.89 21.29 14.63 21.11 14.49L19.14 12.94ZM12.16 15.6C10.17 15.6 8.56 13.99 8.56 12C8.56 10.01 10.17 8.4 12.16 8.4C14.15 8.4 15.76 10.01 15.76 12C15.76 13.99 14.15 15.6 12.16 15.6Z" fill="currentColor"/></svg>',
          title: i18n.t('editor.properties'),
          onActivate: () => {
            this.openPropertyDialog();
          },
          closeOnActivate: true
        };
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

      private createPropertyDialog() {
        if (!this.wrapper || !definition.propertyPanel?.fields.length) return;

        const dialog = document.createElement('dialog');
        dialog.className = 'mokelay-editor-tool__property-dialog';
        dialog.dataset.testid = 'tool-property-dialog';
        dialog.dataset.toolName = toolName;

        const title = definition.propertyPanel.title || i18n.t('editor.propertyDialogTitle');
        const fields = definition.propertyPanel.fields.map((field) => this.renderPropertyField(field)).join('');

        dialog.innerHTML = `
          <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-property-panel">
            <div class="mokelay-editor-tool__property-header">
              <h3 class="mokelay-editor-tool__property-title" data-testid="tool-property-title">${this.escapeHtml(title)}</h3>
              <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-property-close">${this.escapeHtml(i18n.t('editor.close'))}</button>
            </div>
            <div class="mokelay-editor-tool__property-body" data-testid="tool-property-body">
              ${fields}
            </div>
          </form>
        `;

        this.wrapper.appendChild(dialog);
        this.propertyDialog = dialog;
        this.bindPropertyInputs();
      }

      private openPropertyDialog() {
        if (!this.propertyDialog) return;
        this.syncPropertyDialogValues();
        if (!this.propertyDialog.open) {
          this.propertyDialog.showModal();
        }
      }

      private syncPropertyDialogValues() {
        if (!this.propertyDialog) return;
        this.propertyDialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-property-key]').forEach((input) => {
          const propertyKey = input.dataset.propertyKey;
          if (!propertyKey) return;
          const value = this.getPropertyFieldValue(propertyKey);
          if (input instanceof HTMLInputElement && input.type === 'checkbox') {
            input.checked = value === true;
            return;
          }
          input.value = typeof value === 'string' ? value : '';
        });
      }

      private updateProperty(key: string, value: string | boolean) {
        (this.state as Record<string, unknown>)[key] = value;
        // 属性变化后重新挂载组件，确保视图与状态同步。
        this.mountVueApp();
      }

      private getPropertyFieldValue(key: string) {
        return (this.state as Record<string, unknown>)[key];
      }

      private escapeHtml(value: string) {
        return value
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      private renderPropertyField(field: EditorToolPropertyField) {
        if (field.type === 'checkbox') {
          return `
            <label class="mokelay-editor-tool__property-field mokelay-editor-tool__property-field--checkbox">
              <input
                class="mokelay-editor-tool__property-checkbox"
                data-testid="tool-property-input-${field.key}"
                data-property-key="${field.key}"
                data-property-type="checkbox"
                type="checkbox"
                ${this.getPropertyFieldValue(field.key) === true ? 'checked' : ''}
              />
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(field.label)}</span>
            </label>
          `;
        }

        if (field.type === 'select') {
          const value = this.getPropertyFieldValue(field.key);
          const options = (field.options ?? []).map((option) => `
            <option value="${this.escapeHtml(option.value)}" ${value === option.value ? 'selected' : ''}>${this.escapeHtml(option.label)}</option>
          `).join('');

          return `
            <label class="mokelay-editor-tool__property-field">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(field.label)}</span>
              <select
                class="mokelay-editor-tool__property-input"
                data-testid="tool-property-input-${field.key}"
                data-property-key="${field.key}"
                data-property-type="select"
              >
                ${options}
              </select>
            </label>
          `;
        }

        const value = this.getPropertyFieldValue(field.key);
        return `
          <label class="mokelay-editor-tool__property-field">
            <span class="mokelay-editor-tool__property-label">${this.escapeHtml(field.label)}</span>
            <input
              class="mokelay-editor-tool__property-input"
              data-testid="tool-property-input-${field.key}"
              data-property-key="${field.key}"
              data-property-type="text"
              type="text"
              value="${this.escapeHtml(typeof value === 'string' ? value : '')}"
              placeholder="${this.escapeHtml(field.placeholder ?? '')}"
            />
          </label>
        `;
      }

      private bindPropertyInputs() {
        if (!this.propertyDialog) return;

        this.propertyDialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-property-key]').forEach((input) => {
          const eventName = input instanceof HTMLInputElement
            ? (input.type === 'checkbox' ? 'change' : 'input')
            : 'change';
          input.addEventListener(eventName, () => {
            const propertyKey = input.dataset.propertyKey;
            if (!propertyKey) return;
            this.updateProperty(propertyKey, this.readPropertyInputValue(input));
          });
        });
      }

      private readPropertyInputValue(input: HTMLInputElement | HTMLSelectElement) {
        if (input instanceof HTMLInputElement && input.type === 'checkbox') {
          return input.checked;
        }
        return input.value;
      }
    }

    const createdTool = RegisteredEditorTool as unknown as EditorToolClass;
    toolClassCache.set(toolName, createdTool);
    return createdTool;
  }
}

export function createEditorTools(
  sharedConfig: Partial<EditorToolComponentProps> = {},
  options: CreateEditorToolsOptions = {}
) {
  const excludedTools = new Set(options.exclude ?? []);

  return Object.fromEntries(
    Object.entries(getEditorComponentRegistry())
      .filter(([toolName]) => !excludedTools.has(toolName))
      .map(([toolName, definition]) => [
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
