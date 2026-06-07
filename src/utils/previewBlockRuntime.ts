import type { InjectionKey } from 'vue';
import type { OutputData } from '@editorjs/editorjs';
import type { BlockEvent } from '@/utils/blockEvents';

export type PreviewRuntimeBlock = OutputData['blocks'][number] | {
  id?: string;
  type: string;
  data: Record<string, unknown>;
  events?: BlockEvent[];
};

export type BlockRuntimeHandle = {
  id: string;
  type: string;
  instance: unknown;
};

export type BlockEventInvocation = {
  sourceBlock: PreviewRuntimeBlock;
  targetBlock: BlockRuntimeHandle;
  eventConfig: BlockEvent;
  event: unknown;
};

export type PreviewBlockRuntime = {
  registerBlock: (id: string, handle: BlockRuntimeHandle) => void;
  unregisterBlock: (id: string, instance?: unknown) => void;
  invokeBlockMethod: (eventConfig: BlockEvent, sourceBlock: PreviewRuntimeBlock, event: unknown) => void;
};

export const PreviewBlockRuntimeKey: InjectionKey<PreviewBlockRuntime> = Symbol('PreviewBlockRuntime');

function warnRuntime(message: string, details?: unknown) {
  if (!import.meta.env.DEV) return;
  console.warn(`[Mokelay preview events] ${message}`, details);
}

function getCallableMethod(instance: unknown, methodName: string) {
  if (typeof instance !== 'object' || instance === null) {
    return undefined;
  }

  const method = (instance as Record<string, unknown>)[methodName];
  return typeof method === 'function' ? method : undefined;
}

export function createPreviewBlockRuntime(): PreviewBlockRuntime {
  const handles = new Map<string, BlockRuntimeHandle>();

  return {
    registerBlock(id, handle) {
      if (!id) return;
      handles.set(id, handle);
    },

    unregisterBlock(id, instance) {
      const currentHandle = handles.get(id);
      if (!currentHandle) return;

      if (instance !== undefined && currentHandle.instance !== instance) {
        return;
      }

      handles.delete(id);
    },

    invokeBlockMethod(eventConfig, sourceBlock, event) {
      if (!eventConfig.event || !eventConfig.block || !eventConfig.method) {
        warnRuntime('Skipped incomplete event config.', { eventConfig, sourceBlock });
        return;
      }

      const targetBlock = handles.get(eventConfig.block);
      if (!targetBlock) {
        warnRuntime('Target block was not found.', { eventConfig, sourceBlock });
        return;
      }

      const method = getCallableMethod(targetBlock.instance, eventConfig.method);
      if (!method) {
        warnRuntime('Target method was not exposed.', { eventConfig, sourceBlock, targetBlock });
        return;
      }

      const invocation: BlockEventInvocation = {
        sourceBlock,
        targetBlock,
        eventConfig,
        event
      };

      try {
        const result = method.call(targetBlock.instance, invocation);
        if (result && typeof (result as Promise<unknown>).catch === 'function') {
          void (result as Promise<unknown>).catch((error) => {
            warnRuntime('Target method rejected.', { eventConfig, sourceBlock, targetBlock, error });
          });
        }
      } catch (error) {
        warnRuntime('Target method threw.', { eventConfig, sourceBlock, targetBlock, error });
      }
    }
  };
}
