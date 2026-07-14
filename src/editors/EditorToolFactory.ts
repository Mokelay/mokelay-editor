import { computed, createApp, type App } from 'vue';
import { i18n } from '@/i18n';
import type { MenuConfig } from '@editorjs/editorjs/types/tools';
import type {
  EditorToolComponentProps,
  EditorToolPropertyField,
  ResolvedEditorToolDefinition
} from '@/editors/editorToolDefinition';
import type { BlockEventsDialogController } from '@/editors/blockEventsDialog';
import {
  isRegisteredEditorComponent,
  loadEditorComponentDefinition
} from '@/editors/editorComponentRuntimeRegistry';
import {
  getClientBlockDefaultData,
  localizedClientBlockText
} from '@/editors/clientBlockToolMetadata';
import {
  PreviewBlockRuntimeKey,
  type PreviewBlockRuntime
} from '@/utils/previewBlockRuntime';
import { PageReferenceAncestryKey } from '@/utils/pageReferenceRuntime';
import {
  attachInternalBlockEventsToData,
  cloneBlockEvents,
  getInternalBlockEventsFromData,
  normalizeBlockEvents,
  removeInternalBlockEventsFromData,
  type BlockEvent
} from '@/utils/blockEvents';
import {
  getClientBlockDocSnapshot,
  getClientBlockDocsSnapshot,
  type NormalizedClientBlockDoc
} from '@/utils/clientBlockDocs';

type EditorToolFactoryOptions = {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  block?: {
    id?: string;
    dispatchChange: () => void;
  };
};

type EditorToolClass = new (options: EditorToolFactoryOptions) => {
  render: () => HTMLElement;
  save: () => Record<string, unknown>;
  destroy: () => void;
  renderSettings?: () => MenuConfig;
};

type PropertyInput = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type PropertyInputReadResult = {
  valid: true;
  value: unknown;
} | {
  valid: false;
  message: string;
};

type CreateEditorToolsOptions = {
  exclude?: Iterable<string>;
  docs?: readonly NormalizedClientBlockDoc[];
};

type MergedEditorToolProps = Partial<EditorToolComponentProps> & Record<string, unknown>;

const blockEventsIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5h4v4H5V5Zm10 0h4v4h-4V5ZM5 15h4v4H5v-4Zm10.5-.5 3.5 3.5m0-3.5-3.5 3.5M9 7h6M7 9v6M17 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// 缓存已经构建过的工具类，避免重复创建 class。
const toolClassCache = new Map<string, EditorToolClass>();

function docSignature(doc: NormalizedClientBlockDoc | undefined) {
  if (!doc) return 'local';
  return JSON.stringify({
    uuid: doc.uuid,
    editorEnabled: doc.editorEnabled,
    toolboxVisible: doc.toolboxVisible,
    sortOrder: doc.sortOrder,
    toolbox: doc.toolbox,
    defaultData: doc.defaultData,
    properties: doc.properties
  });
}

function getToolbox(doc: NormalizedClientBlockDoc | undefined, toolName: string) {
  return {
    title: doc
      ? localizedClientBlockText(doc.toolbox.title, doc.displayName || toolName)
      : toolName,
    icon: doc && typeof doc.toolbox.icon === 'string' ? doc.toolbox.icon : ''
  };
}

export default class EditorToolFactory {
  static create(toolName: string, doc?: NormalizedClientBlockDoc): EditorToolClass {
    const effectiveDoc = doc ?? getClientBlockDocSnapshot(toolName);
    // 文档元数据里的工具箱标题和属性标签会随当前语言解析，不能复用另一种语言创建的类。
    const cacheKey = `${i18n.locale}:${toolName}:${docSignature(effectiveDoc)}`;
    const cachedTool = toolClassCache.get(cacheKey);
    if (cachedTool) return cachedTool;

   const showInToolbox = !effectiveDoc || (effectiveDoc.editorEnabled && effectiveDoc.toolboxVisible);
    const toolbox = getToolbox(effectiveDoc, toolName);

    class RegisteredEditorTool {
      static get toolbox() {
        return showInToolbox ? toolbox : false;
      }

      private state: EditorToolComponentProps | null = null;
      private definition: ResolvedEditorToolDefinition | undefined;
     private wrapper: HTMLElement | null = null;
      private contentRoot: HTMLElement | null = null;
      private vueApp: App<Element> | null = null;
      private propertyComponentApps: App<Element>[] = [];
      private propertyDialog: HTMLDialogElement | null = null;
      private eventsDialog: BlockEventsDialogController | null = null;
      private events: BlockEvent[] = [];
     private readonly blockApi?: EditorToolFactoryOptions['block'];
     private readonly previewRuntime?: PreviewBlockRuntime;
      private readonly pendingInput: MergedEditorToolProps;
      private rawData: Record<string, unknown>;
      private loadingPromise: Promise<void> | null = null;
     private runtimeBlockId = '';
      private runtimeBlockInstance: unknown;

      constructor({ data, config, block }: EditorToolFactoryOptions) {
        // data 是已保存 block.data，config 是工具级固定配置（例如 edit）。
        this.blockApi = block;
        this.previewRuntime = config?.previewRuntime as PreviewBlockRuntime | undefined;
        this.pendingInput = {
         ...(config ?? {}),
         ...removeInternalBlockEventsFromData(data),
         ...(typeof block?.id === 'string' && block.id.trim() ? { currentBlockId: block.id.trim() } : {})
       };
        this.rawData = { ...(data ?? {}) };
       this.events = getInternalBlockEventsFromData(data);
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
        this.setLoadingState();
        void this.loadAndMount();
       return wrapper;
      }

      destroy() {
        this.unmountVueApp();
        this.unmountPropertyComponents();
        this.propertyDialog?.remove();
        this.eventsDialog?.destroy();
        this.eventsDialog = null;
        this.propertyDialog = null;
       this.contentRoot = null;
       this.wrapper = null;
        this.loadingPromise = null;
     }

     save() {
        const definition = this.definition;
        const state = this.state;
        if (!definition || !state) {
          return attachInternalBlockEventsToData(this.rawData, this.events, true);
        }
        return attachInternalBlockEventsToData(definition.serialize(state), this.events, true);
     }

     renderSettings(): MenuConfig {
       const settings = [];
        const definition = this.definition;

        if (definition?.propertyPanel?.fields.length) {
          settings.push({
            icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.11 9.51C21.29 9.37 21.34 9.11 21.23 8.9L19.35 5.64C19.24 5.43 18.99 5.35 18.77 5.42L16.44 6.17C15.96 5.8 15.44 5.48 14.87 5.23L14.51 2.75C14.48 2.52 14.28 2.35 14.04 2.35H10.28C10.04 2.35 9.84 2.52 9.81 2.75L9.45 5.23C8.88 5.48 8.36 5.81 7.88 6.17L5.55 5.42C5.33 5.35 5.08 5.43 4.97 5.64L3.09 8.9C2.98 9.11 3.03 9.37 3.21 9.51L5.19 11.06C5.14 11.36 5.12 11.68 5.12 12C5.12 12.32 5.14 12.64 5.19 12.94L3.21 14.49C3.03 14.63 2.98 14.89 3.09 15.1L4.97 18.36C5.08 18.57 5.33 18.65 5.55 18.58L7.88 17.83C8.36 18.2 8.88 18.52 9.45 18.77L9.81 21.25C9.84 21.48 10.04 21.65 10.28 21.65H14.04C14.28 21.65 14.48 21.48 14.51 21.25L14.87 18.77C15.44 18.52 15.96 18.19 16.44 17.83L18.77 18.58C18.99 18.65 19.24 18.57 19.35 18.36L21.23 15.1C21.34 14.89 21.29 14.63 21.11 14.49L19.14 12.94ZM12.16 15.6C10.17 15.6 8.56 13.99 8.56 12C8.56 10.01 10.17 8.4 12.16 8.4C14.15 8.4 15.76 10.01 15.76 12C15.76 13.99 14.15 15.6 12.16 15.6Z" fill="currentColor"/></svg>',
            title: i18n.t('editor.properties'),
            onActivate: () => {
              this.openPropertyDialog();
            },
            closeOnActivate: true
          });
        }

        settings.push({
          icon: blockEventsIcon,
          title: i18n.t('editor.events.menu'),
          onActivate: () => {
            this.openEventsDialog();
          },
          closeOnActivate: true
        });

       return settings as MenuConfig;
     }

      private setLoadingState() {
        if (!this.contentRoot) return;
        this.contentRoot.replaceChildren();
        const state = document.createElement('div');
        state.className = 'mokelay-editor-tool__loading';
        state.dataset.testid = 'editor-tool-loading';
        state.textContent = i18n.t('page.loading');
        this.contentRoot.appendChild(state);
      }

      private setErrorState(message: string) {
        if (!this.contentRoot) return;
        this.contentRoot.replaceChildren();
        const state = document.createElement('div');
        state.className = 'mokelay-editor-tool__load-error';
        state.dataset.testid = 'editor-tool-load-error';
        state.textContent = message;
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.dataset.testid = 'editor-tool-retry';
        retry.textContent = i18n.locale === 'zh' ? '重试' : 'Retry';
        retry.addEventListener('click', () => {
          this.loadingPromise = null;
          this.setLoadingState();
          void this.loadAndMount();
        });
        state.appendChild(retry);
        this.contentRoot.appendChild(state);
        if (import.meta.env.DEV) {
          console.error(`[Mokelay editor] Failed to load block "${toolName}": ${message}`);
        }
      }

      private async loadAndMount() {
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = (async () => {
          try {
            const definition = await loadEditorComponentDefinition(toolName, effectiveDoc);
            if (!definition) {
              throw new Error(`EditorToolFactory could not load a registered component for "${toolName}".`);
            }
            if (typeof this.pendingInput.edit !== 'boolean') {
              throw new Error(`EditorToolFactory requires config.edit to be explicitly set for "${toolName}".`);
            }

            this.definition = definition;
            const normalized = definition.normalizeProps({ ...this.pendingInput });
            this.state = {
              ...normalized,
              ...(typeof this.pendingInput.currentBlockId === 'string'
                ? { currentBlockId: this.pendingInput.currentBlockId }
                : {}),
              ...(typeof this.pendingInput.getAvailableBlockDataSources === 'function'
                ? { getAvailableBlockDataSources: this.pendingInput.getAvailableBlockDataSources }
                : {}),
              ...(typeof this.pendingInput.getAvailablePageVariableSources === 'function'
                ? { getAvailablePageVariableSources: this.pendingInput.getAvailablePageVariableSources }
                : {}),
              ...(this.pendingInput.pageEditor
                ? { pageEditor: this.pendingInput.pageEditor as EditorToolComponentProps['pageEditor'] }
                : {}),
              ...(Array.isArray(this.pendingInput.pageReferenceAncestry)
                ? { pageReferenceAncestry: [...this.pendingInput.pageReferenceAncestry] as string[] }
                : {})
            };
            if (!this.wrapper || !this.contentRoot) return;
            this.contentRoot.replaceChildren();
            this.createPropertyDialog();
            this.createEventsDialog();
            this.mountVueApp();
          } catch (error) {
            this.setErrorState(error instanceof Error ? error.message : String(error));
          }
        })();

        return this.loadingPromise;
      }

     private mountVueApp() {
        const definition = this.definition;
        const state = this.state;
        if (!this.contentRoot || !definition || !state) return;

        const blockEventListeners = this.createBlockEventListeners();
        const updateState = (payload: unknown) => {
          if (typeof payload === 'object' && payload !== null) {
            Object.assign(state, payload);
          }
        };
        this.unmountVueApp();
        this.vueApp = createApp(definition.component, {
          ...state,
          ...blockEventListeners,
          // 兼容两种回调命名，统一回写到同一份 state。
          onToolChange: this.chainHandlers(blockEventListeners.onToolChange, updateState),
          onChange: this.chainHandlers(blockEventListeners.onChange, updateState)
        });
        this.provideRuntime(this.vueApp);
        const instance = this.vueApp.mount(this.contentRoot);
        this.registerRuntimeBlock(instance);
      }

      private unmountVueApp() {
        this.unregisterRuntimeBlock();
        this.vueApp?.unmount();
        this.vueApp = null;
      }

      private provideRuntime(app: App<Element>) {
        const ancestry = Array.isArray(this.state?.pageReferenceAncestry)
          ? [...this.state.pageReferenceAncestry]
          : [];
        app.provide(PageReferenceAncestryKey, computed<readonly string[]>(() => ancestry));
        if (this.previewRuntime) {
          app.provide(PreviewBlockRuntimeKey, this.previewRuntime);
        }
      }

     private getCurrentBlockId() {
        return typeof this.state?.currentBlockId === 'string' ? this.state.currentBlockId.trim() : '';
     }

     private registerRuntimeBlock(instance: unknown) {
       const id = this.getCurrentBlockId();
       if (!this.previewRuntime || !id || !instance) return;
        const definition = this.definition;
        const state = this.state;
        if (!definition || !state) return;

        this.previewRuntime.registerBlock(id, {
          id,
          type: toolName,
          instance,
          data: definition.serialize(state)
        });
        this.runtimeBlockId = id;
        this.runtimeBlockInstance = instance;
      }

      private unregisterRuntimeBlock() {
        if (!this.previewRuntime || !this.runtimeBlockId) return;

        this.previewRuntime.unregisterBlock(this.runtimeBlockId, this.runtimeBlockInstance);
        this.runtimeBlockId = '';
        this.runtimeBlockInstance = undefined;
      }

     private createSourceBlock() {
        const definition = this.definition;
        const state = this.state;
       return {
         id: this.getCurrentBlockId(),
         type: toolName,
         data: definition && state ? definition.serialize(state) : { ...this.rawData },
         events: cloneBlockEvents(this.events),
         _pageAncestry: Array.isArray(state?.pageReferenceAncestry)
           ? [...state.pageReferenceAncestry]
           : []
       };
      }

      private listenerPropName(eventName: string) {
        return `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
      }

      private chainHandlers(
        previous: ((event: unknown) => void) | undefined,
        next: (event: unknown) => void
      ) {
        return (event: unknown) => {
          previous?.(event);
          next(event);
        };
      }

      private createBlockEventListeners() {
        const listeners: Record<string, (event: unknown) => void> = {};
        normalizeBlockEvents(this.events).forEach((eventConfig) => {
          if (!eventConfig.event) return;
          const key = this.listenerPropName(eventConfig.event);
          const previousListener = listeners[key];
          listeners[key] = (event: unknown) => {
            previousListener?.(event);
            this.previewRuntime?.invokeBlockActions(eventConfig, this.createSourceBlock(), event);
          };
        });
        return listeners;
      }

     private createPropertyDialog() {
        const definition = this.definition;
        if (!this.wrapper || !definition?.propertyPanel?.fields.length) return;

        const dialog = document.createElement('dialog');
        dialog.className = 'mokelay-editor-tool__property-dialog';
        if (definition.propertyPanel.fields.some((field) => field.type === 'component')) {
          dialog.classList.add('mokelay-editor-tool__property-dialog--wide');
        }
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

      private async createEventsDialog() {
        if (!this.wrapper) return;

        const { BlockEventsDialogController } = await import('@/editors/blockEventsDialog');
        if (!this.wrapper) return;

        this.eventsDialog = new BlockEventsDialogController({
          owner: this.wrapper,
          toolName,
          getEvents: () => cloneBlockEvents(this.events),
          setEvents: (events) => {
            this.events = cloneBlockEvents(events);
            this.blockApi?.dispatchChange();
          },
          pageEditor: this.state?.pageEditor
        });
        this.eventsDialog.mount();
      }

      private openPropertyDialog() {
        if (!this.propertyDialog) return;
        this.syncPropertyDialogValues();
        if (!this.propertyDialog.open) {
          this.propertyDialog.showModal();
        }
      }

      private openEventsDialog() {
        this.eventsDialog?.open();
      }

      private syncPropertyDialogValues() {
        if (!this.propertyDialog) return;
        this.propertyDialog.querySelectorAll<PropertyInput>('[data-property-key]').forEach((input) => {
          const propertyKey = input.dataset.propertyKey;
          if (!propertyKey) return;
          const value = this.getPropertyFieldValue(propertyKey);
          this.setPropertyInputValidity(input, '');
          if (input instanceof HTMLInputElement && input.type === 'checkbox') {
            input.checked = value === true;
            return;
          }
          input.value = this.stringifyPropertyInputValue(value, input.dataset.propertyValueType);
        });
        this.mountPropertyComponents();
      }

      private updateProperty(key: string, value: unknown) {
        (this.state as Record<string, unknown>)[key] = value;
        // 属性变化后重新挂载组件，确保视图与状态同步。
        this.mountVueApp();
        this.blockApi?.dispatchChange();
      }

      private updateProperties(patch: Record<string, unknown>) {
        Object.entries(patch).forEach(([key, value]) => {
          (this.state as Record<string, unknown>)[key] = value;
        });
        // 属性变化后重新挂载组件，确保视图与状态同步。
        this.mountVueApp();
        this.blockApi?.dispatchChange();
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
        if (field.type === 'component') {
          return `
            <div class="mokelay-editor-tool__property-field mokelay-editor-tool__property-field--component">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(field.label)}</span>
              <div
                class="mokelay-editor-tool__property-component"
                data-testid="tool-property-component-${field.key}"
                data-property-component-key="${field.key}"
              ></div>
            </div>
          `;
        }

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

        if (field.type === 'textarea') {
          const value = this.getPropertyFieldValue(field.key);
          const valueType = field.valueType ?? 'string';
          const validationMessage = field.validationMessage ?? i18n.t('editor.invalidJson');
          const rows = valueType === 'json' ? 6 : 4;
          const textareaValue = this.stringifyPropertyInputValue(value, valueType);

          return `
            <label class="mokelay-editor-tool__property-field">
              <span class="mokelay-editor-tool__property-label">${this.escapeHtml(field.label)}</span>
              <textarea
                class="mokelay-editor-tool__property-input mokelay-editor-tool__property-textarea"
                data-testid="tool-property-input-${field.key}"
                data-property-key="${field.key}"
                data-property-type="textarea"
                data-property-value-type="${this.escapeHtml(valueType)}"
                data-property-validation-message="${this.escapeHtml(validationMessage)}"
                rows="${rows}"
                placeholder="${this.escapeHtml(field.placeholder ?? '')}"
              >${this.escapeHtml(textareaValue)}</textarea>
              <span
                class="mokelay-editor-tool__property-error"
                data-testid="tool-property-error-${field.key}"
                data-property-error-for="${field.key}"
                hidden
              ></span>
            </label>
          `;
        }

        const value = this.getPropertyFieldValue(field.key);
        const valueType = field.valueType ?? 'string';
        return `
          <label class="mokelay-editor-tool__property-field">
            <span class="mokelay-editor-tool__property-label">${this.escapeHtml(field.label)}</span>
            <input
              class="mokelay-editor-tool__property-input"
              data-testid="tool-property-input-${field.key}"
              data-property-key="${field.key}"
              data-property-type="text"
              data-property-value-type="${this.escapeHtml(valueType)}"
              data-property-validation-message="${this.escapeHtml(field.validationMessage ?? i18n.t('editor.invalidJson'))}"
              type="text"
              value="${this.escapeHtml(this.stringifyPropertyInputValue(value, valueType))}"
              placeholder="${this.escapeHtml(field.placeholder ?? '')}"
            />
          </label>
        `;
      }

      private bindPropertyInputs() {
        if (!this.propertyDialog) return;

        this.propertyDialog.querySelectorAll<PropertyInput>('[data-property-key]').forEach((input) => {
          const eventName = input instanceof HTMLSelectElement || (input instanceof HTMLInputElement && input.type === 'checkbox')
            ? 'change'
            : 'input';
          input.addEventListener(eventName, () => {
            const propertyKey = input.dataset.propertyKey;
            if (!propertyKey) return;
            const result = this.readPropertyInputValue(input);
            if (!result.valid) {
              this.setPropertyInputValidity(input, result.message);
              return;
            }

            this.setPropertyInputValidity(input, '');
            this.updateProperty(propertyKey, result.value);
          });
        });
      }

      private mountPropertyComponents() {
        if (!this.propertyDialog) return;

        this.unmountPropertyComponents();
        this.definition?.propertyPanel?.fields
          .filter((field) => field.type === 'component')
          .forEach((field) => {
            if (!field.component || !this.propertyDialog) return;
            const host = this.propertyDialog.querySelector<HTMLElement>(`[data-property-component-key="${field.key}"]`);
            if (!host) return;

            const app = createApp(field.component, {
              ...this.getPropertyComponentProps(field),
              onToolChange: (payload: unknown) => {
                this.handlePropertyComponentChange(field, payload);
              },
              onChange: (payload: unknown) => {
                this.handlePropertyComponentChange(field, payload);
              }
            });
            this.provideRuntime(app);
            app.mount(host);
            this.propertyComponentApps.push(app);
          });
      }

      private unmountPropertyComponents() {
        this.propertyComponentApps.forEach((app) => {
          app.unmount();
        });
        this.propertyComponentApps = [];
      }

      private getPropertyComponentProps(field: EditorToolPropertyField) {
        const state = this.state as Record<string, unknown>;
        const edit = state.edit === true;
        const value = this.getPropertyFieldValue(field.key);
        return {
          edit,
          currentBlockId: typeof state.currentBlockId === 'string' ? state.currentBlockId : undefined,
          getAvailableBlockDataSources: state.getAvailableBlockDataSources,
          getAvailablePageVariableSources: state.getAvailablePageVariableSources,
          pageEditor: state.pageEditor,
          value,
          ...(field.getComponentProps?.({ value, state, edit }) ?? {})
        };
      }

      private handlePropertyComponentChange(field: EditorToolPropertyField, payload: unknown) {
        if (
          typeof payload === 'object' &&
          payload !== null &&
          'patch' in payload &&
          typeof (payload as { patch?: unknown }).patch === 'object' &&
          (payload as { patch?: unknown }).patch !== null &&
          !Array.isArray((payload as { patch?: unknown }).patch)
        ) {
          this.updateProperties((payload as { patch: Record<string, unknown> }).patch);
          return;
        }

        if (typeof payload === 'object' && payload !== null && 'value' in payload) {
          this.updateProperty(field.key, (payload as { value?: unknown }).value);
          return;
        }

        this.updateProperty(field.key, payload);
      }

      private readPropertyInputValue(input: PropertyInput): PropertyInputReadResult {
        if (input instanceof HTMLInputElement && input.type === 'checkbox') {
          return {
            valid: true,
            value: input.checked
          };
        }

        if (input.dataset.propertyValueType === 'json') {
          try {
            return {
              valid: true,
              value: JSON.parse(input.value)
            };
          } catch {
            return {
              valid: false,
              message: input.dataset.propertyValidationMessage || i18n.t('editor.invalidJson')
            };
          }
        }

        return {
          valid: true,
          value: input.value
        };
      }

      private stringifyPropertyInputValue(value: unknown, valueType?: string) {
        if (valueType === 'json') {
          try {
            return JSON.stringify(value, null, 2) ?? '';
          } catch {
            return '';
          }
        }

        if (typeof value === 'string' || typeof value === 'number') {
          return String(value);
        }

        return '';
      }

      private setPropertyInputValidity(input: PropertyInput, message: string) {
        if (message) {
          input.setAttribute('aria-invalid', 'true');
        } else {
          input.removeAttribute('aria-invalid');
        }
        input.dataset.invalid = message ? 'true' : 'false';
        input.title = message;

        const propertyKey = input.dataset.propertyKey;
        const error = propertyKey
          ? this.propertyDialog?.querySelector<HTMLElement>(`[data-property-error-for="${propertyKey}"]`)
          : null;

        if (!error) return;
        error.textContent = message;
        error.hidden = !message;
      }
    }

    const createdTool = RegisteredEditorTool as unknown as EditorToolClass;
    toolClassCache.set(cacheKey, createdTool);
    return createdTool;
  }
}

export function createEditorTools(
  sharedConfig: Partial<EditorToolComponentProps> = {},
  options: CreateEditorToolsOptions = {}
) {
  const excludedTools = new Set(options.exclude ?? []);
  const docs = [...(options.docs ?? getClientBlockDocsSnapshot())]
    .filter((doc) => doc.status === 'active')
    .filter((doc) => !excludedTools.has(doc.blockType) && isRegisteredEditorComponent(doc.blockType));

  return Object.fromEntries(
    docs.map((doc) => [
      doc.blockType,
      {
        class: EditorToolFactory.create(doc.blockType, doc),
        config: {
          ...getClientBlockDefaultData(doc),
          ...sharedConfig
        }
      }
    ])
  );
}
