<script setup lang="ts">
import { computed } from 'vue';
import type { MInputProps } from '@/components/editor-tools/input.types';

const props = defineProps<MInputProps & {
  onChange?: (payload: MInputProps) => void;
}>();

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
      placeholder="字段标签（示例：用户名）"
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
      :readonly="!edit"
      @input="emitChange({ value: ($event.target as HTMLInputElement).value })"
    />
  </div>
</template>
