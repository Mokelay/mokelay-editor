<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MTagProps {
  edit: boolean;
  tagName?: string;
  closable?: boolean;
  size?: '' | 'large' | 'default' | 'small';
  color?: string;
  type?: '' | 'primary' | 'success' | 'info' | 'warning' | 'danger';
}

export const mTagEditorTool = defineEditorTool<MTagProps>({
  toolbox: {
    get title() {
      return i18n.t('tag.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="16" height="10" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="12" r="1.4" fill="currentColor"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('tag.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'tagName',
          label: i18n.t('tag.properties.tagName'),
          placeholder: i18n.t('tag.defaultTagName')
        },
        {
          key: 'type',
          label: i18n.t('tag.properties.type'),
          type: 'select' as const,
          options: [
            { label: i18n.t('tag.types.default'), value: '' },
            { label: i18n.t('tag.types.primary'), value: 'primary' },
            { label: i18n.t('tag.types.success'), value: 'success' },
            { label: i18n.t('tag.types.info'), value: 'info' },
            { label: i18n.t('tag.types.warning'), value: 'warning' },
            { label: i18n.t('tag.types.danger'), value: 'danger' }
          ]
        },
        {
          key: 'size',
          label: i18n.t('tag.properties.size'),
          type: 'select' as const,
          options: [
            { label: i18n.t('tag.sizes.default'), value: '' },
            { label: i18n.t('tag.sizes.large'), value: 'large' },
            { label: i18n.t('tag.sizes.medium'), value: 'default' },
            { label: i18n.t('tag.sizes.small'), value: 'small' }
          ]
        },
        {
          key: 'color',
          label: i18n.t('tag.properties.color'),
          placeholder: i18n.t('tag.properties.colorPlaceholder')
        },
        {
          key: 'closable',
          label: i18n.t('tag.properties.closable'),
          type: 'checkbox' as const
        }
      ];
    }
  },
  createInitialProps: () => ({
    tagName: i18n.t('tag.defaultTagName'),
    closable: false,
    size: '',
    color: '',
    type: 'success'
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    tagName: props.tagName?.trim() || i18n.t('tag.defaultTagName'),
    closable: props.closable === true,
    size: props.size ?? '',
    color: props.color ?? '',
    type: props.type ?? 'success'
  }),
  serialize: (props) => ({
    tagName: props.tagName?.trim() || i18n.t('tag.defaultTagName'),
    closable: props.closable ?? false,
    size: props.size ?? '',
    color: props.color ?? '',
    type: props.type ?? ''
  })
});
</script>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue';
import { ElTag } from 'element-ui';
import 'element-ui/es/components/tag/style/css';

const props = defineProps<MTagProps & {
  onChange?: (payload: MTagProps) => void;
  onToolChange?: (payload: MTagProps) => void;
}>();
const rootRef = ref<HTMLElement | null>(null);
let toolbarAlignTimer: number | null = null;

function emitChange(payload: Partial<MTagProps>) {
  const nextPayload = {
    edit: props.edit,
    tagName: props.tagName ?? '',
    closable: props.closable ?? false,
    size: props.size ?? '',
    color: props.color ?? '',
    type: props.type ?? '',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function handleClose() {
  emitChange({
    closable: props.closable ?? false
  });
}

function clearToolbarAlignTimer() {
  if (toolbarAlignTimer === null) return;
  window.clearTimeout(toolbarAlignTimer);
  toolbarAlignTimer = null;
}

function alignToolbarToTag() {
  const root = rootRef.value;
  if (!root) return;

  const block = root.closest('.ce-block') as HTMLElement | null;
  const toolbar = root.closest('.codex-editor')?.querySelector('.ce-toolbar') as HTMLElement | null;
  const plusButton = toolbar?.querySelector('.ce-toolbar__plus') as HTMLElement | null;

  if (!block || !toolbar || !plusButton) return;

  const blockRect = block.getBoundingClientRect();
  const tagRect = root.getBoundingClientRect();
  const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
  const top = block.offsetTop + (tagRect.top - blockRect.top) + (tagRect.height - toolbarButtonHeight) / 2;

  toolbar.style.top = `${Math.round(top)}px`;
}

function scheduleToolbarAlignment() {
  clearToolbarAlignTimer();
  toolbarAlignTimer = window.setTimeout(() => {
    alignToolbarToTag();
  }, 0);
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
  <div ref="rootRef" class="ce-tag-tool" data-testid="editor-tag-tool">
    <ElTag
      data-testid="editor-tag-value"
      :closable="closable"
      :size="size || undefined"
      :color="color || undefined"
      :type="type || undefined"
      @close="handleClose"
    >
      {{ tagName }}
    </ElTag>
  </div>
</template>

<style scoped>
.ce-tag-tool {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  max-width: 100%;
}

.ce-tag-tool :deep(.el-tag) {
  max-width: 100%;
  line-height: 20px;
}

.ce-tag-tool :deep(.el-tag__content) {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}
</style>
