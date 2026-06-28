import type { ProcessorErrorCode, ProcessorErrorMeta } from '@/processors/types';

export class ProcessorError extends Error {
  readonly code: ProcessorErrorCode;
  readonly processor?: string;
  readonly meta: ProcessorErrorMeta;

  constructor(code: ProcessorErrorCode, message: string, meta?: string | ProcessorErrorMeta) {
    super(message);
    this.name = 'ProcessorError';
    this.code = code;
    this.meta = typeof meta === 'string' ? { processor: meta } : meta ?? {};
    this.processor = this.meta.processor;
  }
}

export function invalidProcessorConfig(processor: string, message: string): never {
  throw new ProcessorError(
    'PROCESSOR_INVALID_CONFIG',
    `Processor ${processor} configuration is invalid: ${message}`,
    processor
  );
}

export function processorContextMissing(processor: string, path: string): never {
  throw new ProcessorError(
    'PROCESSOR_CONTEXT_MISSING',
    `Processor ${processor} requires context value: ${path}`,
    { processor }
  );
}

export function processorAsyncRequired(processor: string): never {
  throw new ProcessorError(
    'PROCESSOR_ASYNC_REQUIRED',
    `Processor ${processor} requires the asynchronous processor runner.`,
    { processor }
  );
}

export function processorExecutionFailed(processor: string, cause: unknown): never {
  throw new ProcessorError(
    'PROCESSOR_EXECUTION_FAILED',
    `Processor ${processor} execution failed.`,
    { processor, cause }
  );
}
