<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MLinkProps {
  edit: boolean;
  text?: string;
  url?: string;
  open?: boolean;
}

export const mLinkEditorTool = defineEditorTool<MLinkProps>({
  toolbox: {
    get title() {
      return i18n.t('link.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.6 13.4a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7l-1.2 1.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13.4 10.6a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.2-1.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('link.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'text',
          label: i18n.t('link.properties.text'),
          placeholder: i18n.t('link.defaultText')
        },
        {
          key: 'url',
          label: i18n.t('link.properties.url'),
          placeholder: i18n.t('link.defaultUrl')
        },
        {
          key: 'open',
          label: i18n.t('link.properties.open'),
          type: 'checkbox' as const
        }
      ];
    }
  },
  createInitialProps: () => ({
    text: i18n.t('link.defaultText'),
    url: i18n.t('link.defaultUrl'),
    open: false
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    text: props.text?.trim() || i18n.t('link.defaultText'),
    url: props.url?.trim() || i18n.t('link.defaultUrl'),
    open: props.open === true
  }),
  serialize: (props) => ({
    text: props.text?.trim() || i18n.t('link.defaultText'),
    url: props.url?.trim() || i18n.t('link.defaultUrl'),
    open: props.open === true
  })
});
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from '@/i18n';

const props = defineProps<MLinkProps & {
  onChange?: (payload: MLinkProps) => void;
  onToolChange?: (payload: MLinkProps) => void;
}>();

const { t } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const linkText = computed(() => props.text?.trim() || t('link.defaultText'));
const safeHref = computed(() => normalizeHref(props.url ?? ''));
const target = computed(() => (props.open ? '_blank' : undefined));
const rel = computed(() => (props.open ? 'noopener noreferrer' : undefined));
let toolbarAlignTimer: number | null = null;

function clearToolbarAlignTimer() {
  if (toolbarAlignTimer === null) return;
  window.clearTimeout(toolbarAlignTimer);
  toolbarAlignTimer = null;
}

function alignToolbarToLink() {
  const root = rootRef.value;
  if (!root) return;

  const block = root.closest('.ce-block') as HTMLElement | null;
  const toolbar = root.closest('.codex-editor')?.querySelector('.ce-toolbar') as HTMLElement | null;
  const plusButton = toolbar?.querySelector('.ce-toolbar__plus') as HTMLElement | null;

  if (!block || !toolbar || !plusButton) return;

  const blockRect = block.getBoundingClientRect();
  const linkRect = root.getBoundingClientRect();
  const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
  const top = block.offsetTop + (linkRect.top - blockRect.top) + (linkRect.height - toolbarButtonHeight) / 2;

  toolbar.style.top = `${Math.round(top)}px`;
}

function scheduleToolbarAlignment() {
  clearToolbarAlignTimer();
  toolbarAlignTimer = window.setTimeout(() => {
    alignToolbarToLink();
  }, 0);
}

function normalizeHref(url: string) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '#';

  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }

  const protocolMatch = trimmedUrl.match(/^([a-z][a-z\d+.-]*):/i);
  if (!protocolMatch) {
    return trimmedUrl;
  }

  const protocol = protocolMatch[1].toLowerCase();
  return ['http', 'https', 'mailto', 'tel'].includes(protocol) ? trimmedUrl : '#';
}

function emitChange(payload: Partial<MLinkProps>) {
  const nextPayload = {
    edit: props.edit,
    text: props.text ?? '',
    url: props.url ?? '',
    open: props.open ?? false,
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function handleClick(event: MouseEvent) {
  if (props.edit || safeHref.value === '#') {
    event.preventDefault();
  }

  emitChange({
    text: linkText.value,
    url: props.url ?? '',
    open: props.open ?? false
  });
}

onMounted(() => {
  nextTick(() => {
    rootRef.value?.addEventListener('mouseenter', scheduleToolbarAlignment);
    rootRef.value?.addEventListener('mousemove', scheduleToolbarAlignment);
  });
});

onBeforeUnmount(() => {
  clearToolbarAlignTimer();
  rootRef.value?.removeEventListener('mouseenter', scheduleToolbarAlignment);
  rootRef.value?.removeEventListener('mousemove', scheduleToolbarAlignment);
});
</script>

<template>
  <span ref="rootRef" class="ce-link-tool" data-testid="editor-link-tool">
    <a
      class="ce-link-tool__anchor"
      data-testid="editor-link-value"
      :href="safeHref"
      :target="target"
      :rel="rel"
      @click="handleClick"
    >
      {{ linkText }}
    </a>
  </span>
</template>

<style scoped>
.ce-link-tool {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 32px;
  vertical-align: middle;
}

.ce-link-tool__anchor {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  color: rgb(37 99 235);
  font-size: 14px;
  line-height: 20px;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}

.ce-link-tool__anchor:hover {
  color: rgb(29 78 216);
}

.ce-link-tool__anchor:focus-visible {
  outline: 2px solid rgb(96 165 250);
  outline-offset: 2px;
  border-radius: 4px;
}

:global(.dark) .ce-link-tool__anchor {
  color: rgb(96 165 250);
}

:global(.dark) .ce-link-tool__anchor:hover {
  color: rgb(147 197 253);
}
</style>
