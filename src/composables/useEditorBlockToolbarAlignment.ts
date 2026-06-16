import { nextTick, onBeforeUnmount, onMounted, type Ref } from 'vue';

type ToolbarAlignmentOptions = {
  target?: Ref<HTMLElement | null>;
};

function getAlignmentTarget(
  root: HTMLElement,
  options?: ToolbarAlignmentOptions
) {
  return options?.target?.value ?? root;
}

export function useEditorBlockToolbarAlignment(
  rootRef: Ref<HTMLElement | null>,
  options?: ToolbarAlignmentOptions
) {
  let alignTimer: number | null = null;

  function clearAlignTimer() {
    if (alignTimer === null) return;
    window.clearTimeout(alignTimer);
    alignTimer = null;
  }

  function alignToolbar() {
    alignTimer = null;

    const root = rootRef.value;
    if (!root) return;

    const target = getAlignmentTarget(root, options);
    const block = root.closest('.ce-block') as HTMLElement | null;
    const editorRoot = root.closest('.codex-editor') as HTMLElement | null;
    const toolbar = editorRoot?.querySelector<HTMLElement>(':scope > .ce-toolbar')
      ?? editorRoot?.querySelector<HTMLElement>('.ce-toolbar');
    const plusButton = toolbar?.querySelector<HTMLElement>('.ce-toolbar__plus');

    if (!block || !toolbar || !plusButton) return;

    const blockRect = block.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
    const top = block.offsetTop +
      (targetRect.top - blockRect.top) +
      (targetRect.height - toolbarButtonHeight) / 2;

    toolbar.style.top = `${Math.max(0, Math.round(top))}px`;
  }

  function scheduleToolbarAlignment() {
    clearAlignTimer();
    alignTimer = window.setTimeout(alignToolbar, 0);
  }

  onMounted(() => {
    void nextTick(() => {
      const root = rootRef.value;
      if (!root) return;

      root.addEventListener('mouseenter', scheduleToolbarAlignment);
      root.addEventListener('mousemove', scheduleToolbarAlignment);
      root.addEventListener('focusin', scheduleToolbarAlignment);
    });
  });

  onBeforeUnmount(() => {
    const root = rootRef.value;
    clearAlignTimer();
    root?.removeEventListener('mouseenter', scheduleToolbarAlignment);
    root?.removeEventListener('mousemove', scheduleToolbarAlignment);
    root?.removeEventListener('focusin', scheduleToolbarAlignment);
  });

  return {
    scheduleToolbarAlignment
  };
}
