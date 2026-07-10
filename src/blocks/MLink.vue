<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MLinkProps {
  edit: boolean;
  text?: string;
  url?: string;
  open?: boolean;
}

function trimmedString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MLink",
 *   "displayName": "链接",
 *   "category": "content",
 *   "description": "链接 Block，支持文案、目标地址、打开方式和链接样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MLink",
 *     "toolSymbol": "mLinkEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 100
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "链接",
 *       "en": "Link"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M10.6 13.4a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7l-1.2 1.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M13.4 10.6a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.2-1.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "text": {
 *       "zh": "链接",
 *       "en": "Link"
 *     },
 *     "url": "https://mokelay.com",
 *     "open": false
 *   },
 *   "properties": [
 *     {
 *       "key": "text",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MLink.vue",
 *       "line": 25,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "链接文本",
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "链接",
 *         "en": "Link"
 *       }
 *     },
 *     {
 *       "key": "url",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MLink.vue",
 *       "line": 30,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "链接地址",
 *       "type": "text",
 *       "placeholder": "https://mokelay.com"
 *     },
 *     {
 *       "key": "open",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MLink.vue",
 *       "line": 35,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "新页面打开",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MLink-example",
 *       "type": "MLink",
 *       "data": {
 *         "text": {
 *           "zh": "链接",
 *           "en": "Link"
 *         },
 *         "url": "https://mokelay.com",
 *         "open": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MLink.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MLink.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mLinkEditorTool = defineEditorTool<MLinkProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    text: trimmedString(props.text, i18n.t('link.defaultText')),
    url: trimmedString(props.url, i18n.t('link.defaultUrl')),
    open: props.open === true
  }),
  serialize: (props) => ({
    text: trimmedString(props.text, i18n.t('link.defaultText')),
    url: trimmedString(props.url, i18n.t('link.defaultUrl')),
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
const linkText = computed(() => trimmedString(props.text, t('link.defaultText')));
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

.dark .ce-link-tool__anchor {
  color: rgb(96 165 250);
}

.dark .ce-link-tool__anchor:hover {
  color: rgb(147 197 253);
}
</style>
