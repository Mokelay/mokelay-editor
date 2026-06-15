import { invalidProcessorConfig } from '@/processors/errors';
import { cloneProcessorValue, isRecord } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

export function readMergeDataParam(param: unknown) {
  const mergeValue = Array.isArray(param) && param.length === 1 ? param[0] : param;
  if (!isRecord(mergeValue)) {
    invalidProcessorConfig('merge_data', 'param must be an object or a single-element object array.');
  }
  return mergeValue;
}

export const mergeDataProcessor: ProcessorExecutor = (value, param) => {
  const mergeValue = readMergeDataParam(param);

  if (Array.isArray(value)) {
    return value.map((item) => isRecord(item)
      ? { ...cloneProcessorValue(item), ...cloneProcessorValue(mergeValue) }
      : item);
  }

  if (isRecord(value)) {
    return { ...cloneProcessorValue(value), ...cloneProcessorValue(mergeValue) };
  }

  return value;
};
