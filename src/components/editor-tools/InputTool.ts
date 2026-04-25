import { createApp, type App } from 'vue';
import MInput from '@/components/editor-tools/MInput.vue';
import type { MInputProps } from '@/components/editor-tools/input.types';

export default class InputTool {
  static get toolbox() {
    return {
      title: 'Input',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
  }

  private readonly data: Partial<MInputProps>;
  private readonly config: MInputProps;
  private readonly state: MInputProps;
  private wrapper: HTMLElement | null = null;
  private vueApp: App<Element> | null = null;

  constructor({ data, config }: { data: Partial<MInputProps>; config?: MInputProps }) {
    this.data = data ?? {};
    if (!config || typeof config.edit !== 'boolean') {
      throw new Error('InputTool requires config.edit to be explicitly set.');
    }
    this.config = config;
    const initialProps = {
      ...this.config,
      ...this.data
    };
    this.state = {
      edit: initialProps.edit,
      label: initialProps.label ?? '',
      placeholder: initialProps.placeholder ?? '请输入内容',
      value: initialProps.value ?? ''
    };
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
    return {
      label: this.state.label?.trim() ?? '',
      placeholder: this.state.placeholder ?? '',
      value: this.state.value ?? ''
    };
  }

  private mountVueApp() {
    if (!this.wrapper) return;

    this.unmountVueApp();
    this.vueApp = createApp(MInput, {
      ...this.state,
      onChange: (payload: MInputProps) => {
        this.state.edit = payload.edit;
        this.state.label = payload.label ?? '';
        this.state.placeholder = payload.placeholder ?? '';
        this.state.value = payload.value ?? '';
      }
    });
    this.vueApp.mount(this.wrapper);
  }

  private unmountVueApp() {
    this.vueApp?.unmount();
    this.vueApp = null;
  }
}
