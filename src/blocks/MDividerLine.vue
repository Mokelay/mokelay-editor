<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MDividerLineProps {
  edit: boolean;
}

export const mDividerLineEditorTool = defineEditorTool<MDividerLineProps>({
  toolbox: {
    get title() {
      return i18n.t('dividerLine.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  createInitialProps: () => ({}),
  normalizeProps: (props) => ({
    edit: props.edit ?? false
  }),
  serialize: () => ({})
});
</script>

<script setup lang="ts">
defineProps<MDividerLineProps & {
  onChange?: (payload: MDividerLineProps) => void;
  onToolChange?: (payload: MDividerLineProps) => void;
}>();
</script>

<template>
  <div
    class="ce-divider-line-tool"
    data-testid="editor-divider-line-tool"
    role="separator"
    aria-orientation="horizontal"
  >
    <span class="ce-divider-line-tool__line"></span>
  </div>
</template>

<style scoped>
.ce-divider-line-tool {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 32px;
  padding: 8px 0;
}

.ce-divider-line-tool__line {
  display: block;
  width: 100%;
  height: 1px;
  background-color: rgb(203 213 225);
}

:global(.dark) .ce-divider-line-tool__line {
  background-color: rgb(71 85 105);
}
</style>
