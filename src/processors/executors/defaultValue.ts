import { cloneProcessorValue, isEmptyProcessorValue } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

export const defaultValueProcessor: ProcessorExecutor = (value, param) => {
  const fallback = Array.isArray(param) && param.length === 1 ? param[0] : param;
  return isEmptyProcessorValue(value) ? cloneProcessorValue(fallback) : value;
};
