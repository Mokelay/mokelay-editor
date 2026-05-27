<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

defineProps<{
  blockType: string;
}>();

const rootRef = ref<HTMLElement | null>(null);
let toolbarAlignTimer: number | null = null;

function clearToolbarAlignTimer() {
  if (toolbarAlignTimer === null) return;
  window.clearTimeout(toolbarAlignTimer);
  toolbarAlignTimer = null;
}

function alignToolbarToPageBlock() {
  toolbarAlignTimer = null;

  const root = rootRef.value;
  if (!root) return;

  const block = root.closest('.ce-block') as HTMLElement | null;
  const editorRoot = root.closest('.codex-editor') as HTMLElement | null;
  const toolbar = editorRoot?.querySelector<HTMLElement>(':scope > .ce-toolbar')
    ?? editorRoot?.querySelector<HTMLElement>('.ce-toolbar');
  const plusButton = toolbar?.querySelector<HTMLElement>('.ce-toolbar__plus');

  if (!block || !toolbar || !plusButton) return;

  const blockRect = block.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
  const top = block.offsetTop + (rootRect.top - blockRect.top) + (rootRect.height - toolbarButtonHeight) / 2;

  toolbar.style.top = `${Math.max(0, Math.round(top))}px`;
}

function scheduleToolbarAlignment() {
  clearToolbarAlignTimer();
  toolbarAlignTimer = window.setTimeout(() => {
    alignToolbarToPageBlock();
  }, 0);
}

onBeforeUnmount(() => {
  clearToolbarAlignTimer();
});
</script>

<template>
  <div
    ref="rootRef"
    class="page-dsl-block"
    :data-testid="`page-dsl-block-${blockType}`"
    @focusin="scheduleToolbarAlignment"
    @mouseenter="scheduleToolbarAlignment"
    @mousemove="scheduleToolbarAlignment"
  >
    <slot />
  </div>
</template>

<style scoped>
.page-dsl-block {
  width: 100%;
  color: rgb(15 23 42);
}

:global(.dark) .page-dsl-block {
  color: rgb(241 245 249);
}
</style>
