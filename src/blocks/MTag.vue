<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type MTagType = 'success' | 'info' | 'warning' | 'danger';
export type MTagSize = 'medium' | 'small' | 'mini';
export type MTagEffect = 'dark' | 'light' | 'plain';

export interface MTagProps {
  edit: boolean;
  text?: string;
  type?: MTagType;
  closable?: boolean;
  disableTransitions?: boolean;
  hit?: boolean;
  color?: string;
  size?: MTagSize;
  effect?: MTagEffect;
}

export const mTagEditorTool = defineEditorTool<MTagProps>({
  toolbox: {
    get title() {
      return i18n.t('tag.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('tag.propertyPanelTitle');
    },
    get fields() {
      return [
        { key: 'text', label: i18n.t('tag.properties.text'), placeholder: i18n.t('tag.defaultText') },
        { key: 'type', label: i18n.t('tag.properties.type'), placeholder: 'success / info / warning / danger' },
        { key: 'closable', label: i18n.t('tag.properties.closable'), placeholder: 'true / false' },
        { key: 'disableTransitions', label: i18n.t('tag.properties.disableTransitions'), placeholder: 'true / false' },
        { key: 'hit', label: i18n.t('tag.properties.hit'), placeholder: 'true / false' },
        { key: 'color', label: i18n.t('tag.properties.color'), placeholder: i18n.t('tag.properties.colorPlaceholder') },
        { key: 'size', label: i18n.t('tag.properties.size'), placeholder: 'medium / small / mini' },
        { key: 'effect', label: i18n.t('tag.properties.effect'), placeholder: 'dark / light / plain' }
      ];
    }
  },
  createInitialProps: () => ({
    text: i18n.t('tag.defaultText'),
    type: 'info',
    closable: false,
    disableTransitions: false,
    hit: false,
    color: '',
    size: 'medium',
    effect: 'light'
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    text: props.text ?? i18n.t('tag.defaultText'),
    type: normalizeTagType(props.type),
    closable: normalizeBoolean(props.closable),
    disableTransitions: normalizeBoolean(props.disableTransitions),
    hit: normalizeBoolean(props.hit),
    color: props.color ?? '',
    size: normalizeTagSize(props.size),
    effect: normalizeTagEffect(props.effect)
  }),
  serialize: (props) => ({
    text: props.text ?? '',
    type: normalizeTagType(props.type),
    closable: normalizeBoolean(props.closable),
    disableTransitions: normalizeBoolean(props.disableTransitions),
    hit: normalizeBoolean(props.hit),
    color: props.color ?? '',
    size: normalizeTagSize(props.size),
    effect: normalizeTagEffect(props.effect)
  })
});

function normalizeBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

function normalizeTagType(value: unknown): MTagType {
  return value === 'success' || value === 'warning' || value === 'danger' ? value : 'info';
}

function normalizeTagSize(value: unknown): MTagSize {
  return value === 'small' || value === 'mini' ? value : 'medium';
}

function normalizeTagEffect(value: unknown): MTagEffect {
  return value === 'dark' || value === 'plain' ? value : 'light';
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<MTagProps & {
  onChange?: (payload: MTagProps) => void;
  onToolChange?: (payload: MTagProps) => void;
  onClick?: () => void;
  onClose?: () => void;
}>();

const hidden = ref(false);

watch(
  () => [props.text, props.type, props.color, props.size, props.effect],
  () => {
    hidden.value = false;
  }
);

const tagClass = computed(() => [
  'ce-tag-tool',
  `ce-tag-tool--${props.effect ?? 'light'}`,
  `ce-tag-tool--${props.type ?? 'info'}`,
  `ce-tag-tool--${props.size ?? 'medium'}`,
  {
    'is-hit': props.hit,
    'is-closable': props.closable,
    'is-no-transition': props.disableTransitions,
    'is-hidden': hidden.value
  }
]);

const customStyle = computed(() => {
  if (!props.color?.trim()) return undefined;
  return {
    backgroundColor: props.color
  };
});

function emitChange(payload: Partial<MTagProps>) {
  const nextPayload = {
    edit: props.edit,
    text: props.text ?? '',
    type: props.type ?? 'info',
    closable: props.closable ?? false,
    disableTransitions: props.disableTransitions ?? false,
    hit: props.hit ?? false,
    color: props.color ?? '',
    size: props.size ?? 'medium',
    effect: props.effect ?? 'light',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function handleTagClick() {
  props.onClick?.();
}

function handleCloseClick() {
  hidden.value = true;
  props.onClose?.();
}
</script>

<template>
  <div class="ce-tag-tool-wrap">
    <input
      v-if="edit"
      class="ce-tag-tool__editor"
      type="text"
      :value="text"
      :placeholder="'Tag text'"
      @input="emitChange({ text: ($event.target as HTMLInputElement).value })"
    />

    <span :class="tagClass" :style="customStyle" @click="handleTagClick">
      <span class="ce-tag-tool__text">{{ text }}</span>
      <button
        v-if="closable"
        class="ce-tag-tool__close"
        type="button"
        aria-label="close"
        @click.stop="handleCloseClick"
      >
        ×
      </button>
    </span>
  </div>
</template>
