<script setup lang="ts">
import { computed } from 'vue';
import { Tag as ElTag } from 'element-ui';
import 'element-ui/lib/theme-chalk/tag.css';
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

defineOptions({
  name: 'MTag'
});

export interface MTagProps {
  edit: boolean;
  tagName?: string;
  closable?: boolean;
  size?: 'medium' | 'small' | 'mini' | '';
  color?: string;
  type?: 'success' | 'info' | 'warning' | 'danger' | '';
}

export const mTagEditorTool = defineEditorTool<MTagProps>({
  toolbox: {
    get title() {
      return i18n.t('tag.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
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
          placeholder: i18n.t('tag.defaults.tagName')
        },
        {
          key: 'size',
          label: i18n.t('tag.properties.size'),
          placeholder: i18n.t('tag.defaults.size')
        },
        {
          key: 'type',
          label: i18n.t('tag.properties.type'),
          placeholder: i18n.t('tag.defaults.type')
        },
        {
          key: 'color',
          label: i18n.t('tag.properties.color'),
          placeholder: i18n.t('tag.defaults.color')
        },
        {
          key: 'closable',
          label: i18n.t('tag.properties.closable'),
          placeholder: i18n.t('tag.defaults.closable')
        }
      ];
    }
  },
  createInitialProps: () => ({
    edit: false,
    tagName: i18n.t('tag.defaults.tagName'),
    closable: false,
    size: '',
    color: '',
    type: ''
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    tagName: props.tagName ?? '',
    closable: props.closable === true || props.closable === 'true',
    size: props.size === 'medium' || props.size === 'small' || props.size === 'mini' ? props.size : '',
    color: props.color ?? '',
    type: props.type === 'success' || props.type === 'info' || props.type === 'warning' || props.type === 'danger' ? props.type : ''
  }),
  serialize: (props) => ({
    tagName: props.tagName ?? '',
    closable: props.closable ?? false,
    size: props.size ?? '',
    color: props.color ?? '',
    type: props.type ?? ''
  })
});

const props = withDefaults(defineProps<MTagProps>(), {
  edit: false,
  tagName: '',
  closable: false,
  size: '',
  color: '',
  type: ''
});

const tagStyle = computed(() => (props.color ? { backgroundColor: props.color, borderColor: props.color } : undefined));
</script>

<template>
  <ElTag :closable="closable" :size="size" :type="type" :style="tagStyle">
    {{ tagName }}
  </ElTag>
</template>
