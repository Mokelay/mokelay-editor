import type { ProcessorExecutor } from '@/processors/types';

export const trimProcessor: ProcessorExecutor = (value) => (
  typeof value === 'string' ? value.trim() : value
);
