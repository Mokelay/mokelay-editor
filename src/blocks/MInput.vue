<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

// 输入框组件在编辑器中的属性定义。
export interface MInputProps {
  edit: boolean;
  label?: string;
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
          key: 'label',
          label: i18n.t('input.properties.label'),
          placeholder: i18n.t('input.editLabelPlaceholder')
        },
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
    label: i18n.t('input.defaultLabel'),
    placeholder: i18n.t('input.defaultPlaceholder'),
    value: ''
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? ''
  }),
  serialize: (props) => ({
    label: props.label?.trim() ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? ''
  })
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/i18n';

const props = defineProps<MInputProps & {
  onChange?: (payload: MInputProps) => void;
  onToolChange?: (payload: MInputProps) => void;
}>();
const { t } = useI18n();

// 统一标签展示文本，避免模板层重复判空。
const labelText = computed(() => props.label ?? '');

// 组件内任意字段变更后，向外抛出完整 payload，保持工具状态一致。
function emitChange(payload: Partial<MInputProps>) {
  const nextPayload = {
    edit: props.edit,
    label: props.label ?? '',
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
      v-if="edit"
      data-testid="editor-input-label"
      class="ce-input-tool__label"
      type="text"
      :placeholder="t('input.editLabelPlaceholder')"
      :value="label"
      @input="emitChange({ label: ($event.target as HTMLInputElement).value })"
    />
    <div v-else class="ce-input-tool__label">
      {{ labelText }}
    </div>

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
