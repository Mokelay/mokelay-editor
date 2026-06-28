import {
  ProcessorError,
  processorAsyncRequired,
  processorContextMissing,
  processorExecutionFailed
} from '@/processors/errors';
import { processorRegistry } from '@/processors/registry';
import {
  cloneProcessorValue,
  hasPath,
  normalizeProcessorConfig,
  processorName,
  processorParam
} from '@/processors/shared';
import type { ProcessorConfig, ProcessorContext } from '@/processors/types';

const defaultProcessorContext: ProcessorContext = { phase: 'display' };

function normalizeProcessorContext(context?: Partial<ProcessorContext>): ProcessorContext {
  return {
    ...defaultProcessorContext,
    ...context,
    phase: context?.phase ?? defaultProcessorContext.phase
  };
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return typeof value === 'object' && value !== null && 'then' in value &&
    typeof (value as { then?: unknown }).then === 'function';
}

function assertProcessorContext(name: string, context: ProcessorContext, requiredPaths: string[] = []) {
  requiredPaths.forEach((path) => {
    if (!hasPath(context, path)) {
      processorContextMissing(name, path);
    }
  });
}

export function normalizeProcessors(value: unknown): ProcessorConfig[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const normalized = normalizeProcessorConfig(item);
    return normalized ? [normalized] : [];
  });
}

export function validateProcessorConfig(config: ProcessorConfig, context?: Partial<ProcessorContext>) {
  const normalized = normalizeProcessorConfig(config);
  if (!normalized) {
    throw new ProcessorError('PROCESSOR_INVALID_CONFIG', 'Processor configuration is invalid.');
  }

  const name = processorName(normalized);
  const definition = processorRegistry[name];
  if (!definition) {
    throw new ProcessorError('PROCESSOR_UNSUPPORTED', `Unsupported Processor: ${name}`, name);
  }

  const processorContext = normalizeProcessorContext(context);
  if (definition.supportedPhases?.length && !definition.supportedPhases.includes(processorContext.phase)) {
    throw new ProcessorError(
      'PROCESSOR_INVALID_CONFIG',
      `Processor ${name} does not support phase ${processorContext.phase}.`,
      { processor: name, phase: processorContext.phase }
    );
  }
  assertProcessorContext(name, processorContext, definition.requiresContext);

  const param = processorParam(normalized);
  definition.validateParam?.(param, processorContext);
}

export function validateProcessors(processors: ProcessorConfig[], context?: Partial<ProcessorContext>) {
  processors.forEach((processor) => validateProcessorConfig(processor, context));
}

export function applyProcessor(value: unknown, config: ProcessorConfig, context?: Partial<ProcessorContext>) {
  const processorContext = normalizeProcessorContext(context);
  validateProcessorConfig(config, processorContext);
  const normalized = normalizeProcessorConfig(config)!;
  const name = processorName(normalized);
  const definition = processorRegistry[name];
  if (definition.async) {
    processorAsyncRequired(name);
  }
  const param = processorParam(normalized);
  try {
    const result = definition.execute(value, cloneProcessorValue(param), processorContext);
    if (isPromiseLike(result)) {
      processorAsyncRequired(name);
    }
    return result;
  } catch (error) {
    if (error instanceof ProcessorError) throw error;
    processorExecutionFailed(name, error);
  }
}

export function applyProcessors(value: unknown, processors: ProcessorConfig[], context?: Partial<ProcessorContext>) {
  return processors.reduce(
    (current, processor) => applyProcessor(current, processor, context),
    value
  );
}

export async function applyProcessorAsync(
  value: unknown,
  config: ProcessorConfig,
  context?: Partial<ProcessorContext>
) {
  const processorContext = normalizeProcessorContext(context);
  validateProcessorConfig(config, processorContext);
  const normalized = normalizeProcessorConfig(config)!;
  const name = processorName(normalized);
  const definition = processorRegistry[name];
  const param = processorParam(normalized);
  try {
    return await definition.execute(value, cloneProcessorValue(param), processorContext);
  } catch (error) {
    if (error instanceof ProcessorError) throw error;
    processorExecutionFailed(name, error);
  }
}

export async function applyProcessorsAsync(
  value: unknown,
  processors: ProcessorConfig[],
  context?: Partial<ProcessorContext>
) {
  let current = value;
  for (const processor of processors) {
    current = await applyProcessorAsync(current, processor, context);
  }
  return current;
}
