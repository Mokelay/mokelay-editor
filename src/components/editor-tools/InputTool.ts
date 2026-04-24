interface InputToolData {
  label?: string;
  placeholder?: string;
  value?: string;
}

interface InputToolConfig {
  edit: boolean;
  defaultLabel?: string;
  defaultPlaceholder?: string;
}

export default class InputTool {
  static get toolbox() {
    return {
      title: 'Input',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
  }

  private readonly data: InputToolData;
  private readonly config: InputToolConfig;
  private labelInput: HTMLInputElement | null = null;
  private valueInput: HTMLInputElement | null = null;
  private labelValue = '';

  constructor({ data, config }: { data: InputToolData; config: InputToolConfig }) {
    this.data = data ?? {};
    if (!config || typeof config.edit !== 'boolean') {
      throw new Error('InputTool requires config.edit to be explicitly set.');
    }
    this.config = config;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'ce-input-tool';

    this.labelValue = this.data.label ?? this.config.defaultLabel ?? '';

    if (this.config.edit) {
      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.placeholder = '字段标签（示例：用户名）';
      labelInput.value = this.labelValue;
      labelInput.className = 'ce-input-tool__label';
      wrapper.append(labelInput);
      this.labelInput = labelInput;
    } else {
      const labelText = document.createElement('div');
      labelText.className = 'ce-input-tool__label';
      labelText.textContent = this.labelValue;
      wrapper.append(labelText);
      this.labelInput = null;
    }

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = this.data.placeholder ?? this.config.defaultPlaceholder ?? '请输入内容';
    valueInput.value = this.data.value ?? '';
    valueInput.className = 'ce-input-tool__control';

    wrapper.append(valueInput);

    this.valueInput = valueInput;

    return wrapper;
  }

  save() {
    return {
      label: this.labelInput?.value.trim() ?? this.labelValue,
      placeholder: this.valueInput?.placeholder ?? '',
      value: this.valueInput?.value ?? ''
    };
  }
}
