export type SuspendedPageDialog = {
  dialog: HTMLDialogElement;
  modal: boolean;
  returnValue: string;
};

export type SuspendedPageDialogChain = SuspendedPageDialog[];

export type PageEditorOverlayState = {
  restoreFocus?: HTMLElement;
  suspendedDialogs: SuspendedPageDialogChain;
};

const suspendedAttribute = 'data-page-editor-suspended';

function suppressSyntheticClose(event: Event) {
  event.stopImmediatePropagation();
}

/**
 * Remove dialogs owned by the active editor frame from the browser top layer
 * without letting their normal close handlers discard component draft state.
 */
export function suspendPageDialogChain(root: HTMLElement | null): SuspendedPageDialogChain {
  if (!root) return [];

  const chain = [...root.querySelectorAll<HTMLDialogElement>('dialog[open]')].map((dialog) => ({
    dialog,
    modal: dialog.matches(':modal'),
    returnValue: dialog.returnValue
  }));

  // Unwind the innermost dialog first, matching the native top-layer order.
  [...chain].reverse().forEach(({ dialog }) => {
    if (!dialog.open) return;
    dialog.setAttribute(suspendedAttribute, 'true');
    dialog.addEventListener('close', suppressSyntheticClose, {
      capture: true,
      once: true
    });
    try {
      dialog.close();
    } catch (error) {
      dialog.removeEventListener('close', suppressSyntheticClose, true);
      dialog.removeAttribute(suspendedAttribute);
      throw error;
    }
  });

  return chain;
}

/** Restore the outer-to-inner modal ordering after the child frame exits. */
export function restorePageDialogChain(chain: SuspendedPageDialogChain) {
  chain.forEach(({ dialog, modal, returnValue }) => {
    if (!dialog.isConnected || dialog.open) return;
    dialog.returnValue = returnValue;
    try {
      if (modal) dialog.showModal();
      else dialog.show();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Mokelay page editor] Failed to restore a suspended dialog.', error);
      }
    } finally {
      dialog.removeAttribute(suspendedAttribute);
    }
  });
}

/**
 * Owns the recursive frame stack contract, its promise resolvers and the native
 * dialog top-layer state associated with each push/pop operation.
 */
export class PageEditorCoordinator<
  TFrame extends PageEditorOverlayState & { id: string },
  TResult
> {
  private readonly resolvers = new Map<string, (result: TResult) => void>();
  private readonly frameRoots = new Map<string, HTMLElement>();

  constructor(private readonly getFrames: () => TFrame[]) {}

  get activeFrame() {
    return this.getFrames().at(-1);
  }

  registerFrameRoot(frameId: string, root: HTMLElement | null) {
    if (root) this.frameRoots.set(frameId, root);
    else this.frameRoots.delete(frameId);
  }

  captureOverlayState(parentFrameId?: string): PageEditorOverlayState {
    const restoreFocus = typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : undefined;
    return {
      restoreFocus,
      suspendedDialogs: parentFrameId
        ? suspendPageDialogChain(this.frameRoots.get(parentFrameId) ?? null)
        : []
    };
  }

  push(frame: TFrame): Promise<TResult> {
    const result = new Promise<TResult>((resolve) => {
      this.resolvers.set(frame.id, resolve);
    });
    this.getFrames().push(frame);
    return result;
  }

  isTop(frame: TFrame) {
    return this.activeFrame?.id === frame.id;
  }

  async pop(
    frame: TFrame,
    result: TResult,
    afterStackChange: () => Promise<void> | void
  ) {
    if (!this.isTop(frame)) return false;
    this.getFrames().pop();
    this.frameRoots.delete(frame.id);
    await afterStackChange();
    restorePageDialogChain(frame.suspendedDialogs);
    if (frame.restoreFocus?.isConnected) frame.restoreFocus.focus();
    const resolve = this.resolvers.get(frame.id);
    this.resolvers.delete(frame.id);
    resolve?.(result);
    return true;
  }
}
