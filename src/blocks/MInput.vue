<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MInputProps {
  edit: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
}

export const mInputEditorTool = defineEditorTool<MInputProps>({
  toolbox: {
    title: i18n.t('input.toolboxTitle'),
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
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
}>();
const { t } = useI18n();

const labelText = computed(() => props.label ?? '');

function emitChange(payload: Partial<MInputProps>) {
  props.onChange?.({
    edit: props.edit,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    ...payload
  });
}
</script>

<template>
  <div class="ce-input-tool">
    <input
      v-if="edit"
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
      class="ce-input-tool__control"
      type="text"
      :placeholder="placeholder"
      :value="value"
      @input="emitChange({ value: ($event.target as HTMLInputElement).value })"
    />
  </div>
</template>
