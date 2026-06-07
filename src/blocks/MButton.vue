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
  type PageDslAlign,
  type PageDslButtonVariant
} from '@/blocks/pageDslEditorTools';

export interface MButtonProps {
  edit: boolean;
  label?: string;
  variant?: PageDslButtonVariant | string;
  align?: PageDslAlign | string;
  action?: Record<string, unknown>;
}

const buttonTitle = '按钮';
const buttonDefaults = {
  label: '提交',
  variant: 'primary',
  align: 'left',
  action: { type: 'submit' }
} as const;

function normalizeButtonProps(props: Partial<MButtonProps>): MButtonProps {
  const merged = {
    ...buttonDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    label: stringValue(merged.label),
    variant: normalizeButtonVariant(merged.variant),
    align: normalizeAlign(merged.align),
    action: normalizeAction(merged.action)
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
          { label: '朴素', value: 'ghost' }
        ]
      },
      { key: 'align', label: '对齐', type: 'select', options: alignOptions },
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
      action: normalized.action
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
  const variant = props.variant === 'secondary' ? 'secondary' : props.variant === 'ghost' ? 'ghost' : 'primary';
  return `page-dsl-button page-dsl-button--${variant}`;
});

const buttonWrapClass = computed(() => {
  if (props.align === 'center') return 'page-dsl-button-wrap page-dsl-button-wrap--center';
  if (props.align === 'right') return 'page-dsl-button-wrap page-dsl-button-wrap--right';
  return 'page-dsl-button-wrap';
});

function handleClick(event: MouseEvent) {
  if (!props.edit) {
    emit('click', event);
  }
}
</script>

<template>
  <PageDslBlock block-type="MButton">
    <div :class="buttonWrapClass">
      <button type="button" :class="buttonClass" @click="handleClick">
        {{ label || '提交' }}
      </button>
    </div>
  </PageDslBlock>
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

:global(.dark) .page-dsl-button--secondary {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
