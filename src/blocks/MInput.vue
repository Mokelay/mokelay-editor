<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

// 输入框组件在编辑器中的属性定义。
export interface MInputProps {
  edit: boolean;
  placeholder?: string;
  value?: string;
}

// 输入框工具定义：提供工具箱信息、属性面板、默认值和保存规则。
export const mInputEditorTool = defineEditorTool<MInputProps>({
  toolbox: {
    get title() {
      return i18n.t('input.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('input.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'placeholder',
          label: i18n.t('input.properties.placeholder'),
          placeholder: i18n.t('input.defaultPlaceholder')
        },
        {
          key: 'value',
          label: i18n.t('input.properties.value'),
          placeholder: i18n.t('input.properties.valuePlaceholder')
        }
      ];
    }
  },
  createInitialProps: () => ({
    placeholder: i18n.t('input.defaultPlaceholder'),
    value: ''
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    placeholder: props.placeholder ?? '',
    value: props.value ?? ''
  }),
  serialize: (props) => ({
    placeholder: props.placeholder ?? '',
    value: props.value ?? ''
  })
});
</script>

<script setup lang="ts">
const props = defineProps<MInputProps & {
  onChange?: (payload: MInputProps) => void;
  onToolChange?: (payload: MInputProps) => void;
}>();

// 组件内任意字段变更后，向外抛出完整 payload，保持工具状态一致。
function emitChange(payload: Partial<MInputProps>) {
  const nextPayload = {
    edit: props.edit,
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}
</script>

<template>
  <div class="ce-input-tool" data-testid="editor-input-tool">
    <input
      data-testid="editor-input-control"
      class="ce-input-tool__control"
      type="text"
      :placeholder="placeholder"
      :value="value"
      @input="emitChange({ value: ($event.target as HTMLInputElement).value })"
    />
  </div>
</template>

<style scoped>
.ce-input-tool {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-input-tool__control {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 8px;
  padding: 8px 10px;
  background-color: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-input-tool__control:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

:global(.dark) .ce-input-tool__control {
  background-color: rgb(15 23 42);
  color: rgb(226 232 240);
  border-color: rgb(71 85 105 / 0.9);
}
</style>
