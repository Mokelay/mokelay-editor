<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type MTagType = 'success' | 'info' | 'warning' | 'danger';
export type MTagSize = 'medium' | 'small' | 'mini';
export type MTagEffect = 'dark' | 'light' | 'plain';

export interface MTagProps {
  edit: boolean;
  label?: string;
  type?: MTagType;
  closable?: boolean;
  disableTransitions?: boolean;
  hit?: boolean;
  color?: string;
  size?: MTagSize;
  effect?: MTagEffect;
}

const TAG_TYPES: MTagType[] = ['success', 'info', 'warning', 'danger'];
const TAG_SIZES: MTagSize[] = ['medium', 'small', 'mini'];
const TAG_EFFECTS: MTagEffect[] = ['dark', 'light', 'plain'];

function normalizeType(type: unknown): MTagType {
  if (typeof type === 'string' && TAG_TYPES.includes(type as MTagType)) {
    return type as MTagType;
  }
  return 'info';
}

function normalizeSize(size: unknown): MTagSize {
  if (typeof size === 'string' && TAG_SIZES.includes(size as MTagSize)) {
    return size as MTagSize;
  }
  return 'medium';
}

function normalizeEffect(effect: unknown): MTagEffect {
  if (typeof effect === 'string' && TAG_EFFECTS.includes(effect as MTagEffect)) {
    return effect as MTagEffect;
  }
  return 'light';
}

function normalizeBoolean(input: unknown, fallback = false) {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const value = input.trim().toLowerCase();
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
}

export const mTagEditorTool = defineEditorTool<MTagProps>({
  toolbox: {
    get title() {
      return i18n.t('tag.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 3H5a2 2 0 0 0-2 2v5l9.7 9.7a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8L10 3Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('tag.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'label',
          label: i18n.t('tag.properties.label'),
          placeholder: i18n.t('tag.defaultLabel')
        },
        {
          key: 'type',
          label: i18n.t('tag.properties.type'),
          placeholder: 'success/info/warning/danger'
        },
        {
          key: 'size',
          label: i18n.t('tag.properties.size'),
          placeholder: 'medium/small/mini'
        },
        {
          key: 'effect',
          label: i18n.t('tag.properties.effect'),
          placeholder: 'dark/light/plain'
        },
        {
          key: 'color',
          label: i18n.t('tag.properties.color'),
          placeholder: '#409eff'
        },
        {
          key: 'closable',
          label: i18n.t('tag.properties.closable'),
          placeholder: 'true/false'
        },
        {
          key: 'hit',
          label: i18n.t('tag.properties.hit'),
          placeholder: 'true/false'
        },
        {
          key: 'disableTransitions',
          label: i18n.t('tag.properties.disableTransitions'),
          placeholder: 'true/false'
        }
      ];
    }
  },
  createInitialProps: () => ({
    edit: false,
    label: i18n.t('tag.defaultLabel'),
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
    label: props.label ?? i18n.t('tag.defaultLabel'),
    type: normalizeType(props.type),
    closable: normalizeBoolean(props.closable),
    disableTransitions: normalizeBoolean(props.disableTransitions),
    hit: normalizeBoolean(props.hit),
    color: props.color ?? '',
    size: normalizeSize(props.size),
    effect: normalizeEffect(props.effect)
  }),
  serialize: (props) => ({
    label: props.label?.trim() || i18n.t('tag.defaultLabel'),
    type: normalizeType(props.type),
    closable: normalizeBoolean(props.closable),
    disableTransitions: normalizeBoolean(props.disableTransitions),
    hit: normalizeBoolean(props.hit),
    color: props.color?.trim() ?? '',
    size: normalizeSize(props.size),
    effect: normalizeEffect(props.effect)
  })
});
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
const props = defineProps<MTagProps & {
  onChange?: (payload: MTagProps) => void;
  onToolChange?: (payload: MTagProps) => void;
  onClick?: () => void;
  onClose?: () => void;
}>();

const dismissed = ref(false);

watch(
  () => [props.label, props.type, props.effect, props.size, props.color, props.closable],
  () => {
    dismissed.value = false;
  }
);

const palette = {
  info: {
    text: '#409eff',
    border: '#b3d8ff',
    background: '#ecf5ff'
  },
  success: {
    text: '#67c23a',
    border: '#c2e7b0',
    background: '#f0f9eb'
  },
  warning: {
    text: '#e6a23c',
    border: '#f3d19e',
    background: '#fdf6ec'
  },
  danger: {
    text: '#f56c6c',
    border: '#fbc4c4',
    background: '#fef0f0'
  }
} as const;

const sizeClass = computed(() => {
  if (props.size === 'small') return 'h-8 px-3 text-lg';
  if (props.size === 'mini') return 'h-7 px-2.5 text-sm';
  return 'h-10 px-5 text-xl';
});

const transitionClass = computed(() => (props.disableTransitions ? '' : 'transition-colors duration-200'));

const tagStyle = computed(() => {
  const tone = palette[props.type ?? 'info'];
  const customColor = props.color?.trim();
  const style: Record<string, string> = {
    color: tone.text,
    borderColor: tone.border,
    backgroundColor: tone.background
  };

  if (props.effect === 'dark') {
    style.backgroundColor = customColor || tone.text;
    style.borderColor = customColor || tone.text;
    style.color = '#ffffff';
  } else if (props.effect === 'plain') {
    style.backgroundColor = customColor ? `${customColor}1A` : '#ffffff';
    style.borderColor = customColor || tone.border;
    style.color = customColor || tone.text;
  } else {
    style.backgroundColor = customColor ? `${customColor}1A` : tone.background;
    style.borderColor = customColor || tone.border;
    style.color = customColor || tone.text;
  }

  if (props.hit) {
    style.borderWidth = '2px';
  }

  return style;
});

function emitToolChange(payload: Partial<MTagProps>) {
  const nextPayload: MTagProps = {
    edit: props.edit,
    label: props.label,
    type: props.type,
    closable: props.closable,
    disableTransitions: props.disableTransitions,
    hit: props.hit,
    color: props.color,
    size: props.size,
    effect: props.effect,
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function handleClick() {
  props.onClick?.();
}

function handleClose() {
  dismissed.value = true;
  props.onClose?.();
  emitToolChange({});
}
</script>

<template>
  <div v-if="!dismissed" class="ce-tag-tool" @click="handleClick">
    <span
      class="inline-flex items-center gap-2 rounded-lg border text-base leading-none"
      :class="[sizeClass, transitionClass]"
      :style="tagStyle"
    >
      {{ label }}
      <button
        v-if="closable"
        class="inline-flex h-5 w-5 items-center justify-center rounded-full text-inherit/70 hover:bg-black/5 hover:text-inherit"
        type="button"
        @click.stop="handleClose"
      >
        ×
      </button>
    </span>
  </div>
</template>
