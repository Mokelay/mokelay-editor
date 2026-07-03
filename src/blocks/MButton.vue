<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import {
  alignOptions,
  buttonIcon,
  normalizeAction,
  normalizeAlign,
  normalizeButtonVariant,
  pageDslPropertyTitle,
  stringValue,
  booleanValue,
  type PageDslAlign,
  type PageDslButtonVariant
} from '@/blocks/pageDslEditorTools';

export interface MButtonProps {
  edit: boolean;
  currentBlockId?: string;
  label?: string;
  variant?: PageDslButtonVariant | string;
  align?: PageDslAlign | string;
  action?: Record<string, unknown>;
  disabled?: boolean;
  bare?: boolean;
}

const buttonTitle = '按钮';
const buttonDefaults = {
  label: '提交',
  variant: 'primary',
  align: 'left',
  action: { type: 'submit' },
  disabled: false
} as const;

export function normalizeButtonProps(props: Partial<MButtonProps>): MButtonProps {
  const merged = {
    ...buttonDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(merged.currentBlockId),
    label: stringValue(merged.label),
    variant: normalizeButtonVariant(merged.variant),
    align: normalizeAlign(merged.align),
    action: normalizeAction(merged.action),
    disabled: booleanValue(merged.disabled),
    bare: booleanValue(merged.bare)
  };
}

export const mButtonEditorTool = defineEditorTool<MButtonProps>({
  toolbox: {
    title: buttonTitle,
    icon: buttonIcon
  },
  propertyPanel: {
    get title() {
      return pageDslPropertyTitle(buttonTitle);
    },
    fields: [
      { key: 'label', label: '按钮文案' },
      {
        key: 'variant',
        label: '样式',
        type: 'select',
        options: [
          { label: '主要', value: 'primary' },
          { label: '次要', value: 'secondary' },
          { label: '朴素', value: 'ghost' },
          { label: '危险', value: 'danger' },
          { label: '警告', value: 'warning' },
          { label: '文本', value: 'text' }
        ]
      },
      { key: 'align', label: '对齐', type: 'select', options: alignOptions },
      { key: 'disabled', label: '禁用', type: 'checkbox' },
      { key: 'action', label: '动作 JSON（本阶段仅保存，不执行）', type: 'textarea', valueType: 'json' }
    ]
  },
  createInitialProps: () => ({
    ...buttonDefaults,
    action: { ...buttonDefaults.action }
  }),
  normalizeProps: normalizeButtonProps,
  serialize: (props) => {
    const normalized = normalizeButtonProps(props);
    return {
      label: normalized.label,
      variant: normalized.variant,
      align: normalized.align,
      action: normalized.action,
      ...(normalized.disabled ? { disabled: true } : {})
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = defineProps<MButtonProps & PageDslCallbacks<MButtonProps>>();
const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

const buttonClass = computed(() => {
  const variant = props.variant === 'secondary' ||
    props.variant === 'ghost' ||
    props.variant === 'danger' ||
    props.variant === 'warning' ||
    props.variant === 'text'
    ? props.variant
    : 'primary';
  return `page-dsl-button page-dsl-button--${variant}`;
});

const buttonWrapClass = computed(() => {
  if (props.align === 'center') return 'page-dsl-button-wrap page-dsl-button-wrap--center';
  if (props.align === 'right') return 'page-dsl-button-wrap page-dsl-button-wrap--right';
  return 'page-dsl-button-wrap';
});

const buttonTestId = computed(() => props.currentBlockId || undefined);

function handleClick(event: MouseEvent) {
  if (!props.edit && !props.disabled) {
    emit('click', event);
  }
}
</script>

<template>
  <PageDslBlock v-if="!bare" block-type="MButton">
    <div :class="buttonWrapClass">
      <button type="button" :class="buttonClass" :disabled="disabled" :data-testid="buttonTestId" @click="handleClick">
        {{ label || '提交' }}
      </button>
    </div>
  </PageDslBlock>
  <template v-else>
    <div :class="buttonWrapClass">
      <button type="button" :class="buttonClass" :disabled="disabled" :data-testid="buttonTestId" @click="handleClick">
        {{ label || '提交' }}
      </button>
    </div>
  </template>
</template>

<style scoped>
.page-dsl-button-wrap {
  display: flex;
  justify-content: flex-start;
}

.page-dsl-button-wrap--center {
  justify-content: center;
}

.page-dsl-button-wrap--right {
  justify-content: flex-end;
}

.page-dsl-button {
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: default;
}

.page-dsl-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.page-dsl-button--primary {
  border: 1px solid rgb(79 70 229);
  background: rgb(79 70 229);
  color: white;
}

.page-dsl-button--secondary {
  border: 1px solid rgb(203 213 225);
  background: rgb(255 255 255);
  color: rgb(15 23 42);
}

.page-dsl-button--ghost {
  border: 1px solid transparent;
  background: transparent;
  color: rgb(51 65 85);
}

.page-dsl-button--danger {
  border: 1px solid rgb(254 202 202);
  background: rgb(254 226 226);
  color: rgb(185 28 28);
}

.page-dsl-button--warning {
  border: 1px solid rgb(253 186 116);
  background: rgb(255 247 237);
  color: rgb(194 65 12);
}

.page-dsl-button--text {
  border: 1px solid transparent;
  background: transparent;
  color: rgb(37 99 235);
}

:global(.dark) .page-dsl-button--secondary {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.dark) .page-dsl-button--danger {
  border-color: rgb(127 29 29);
  background: rgb(127 29 29 / 0.34);
  color: rgb(254 202 202);
}

:global(.dark) .page-dsl-button--warning {
  border-color: rgb(154 52 18);
  background: rgb(154 52 18 / 0.24);
  color: rgb(254 215 170);
}

:global(.dark) .page-dsl-button--text {
  border-color: transparent;
  background: transparent;
  color: rgb(147 197 253);
}
</style>
