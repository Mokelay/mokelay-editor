import { cloneProcessorValue, isRecord } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

type OmitEmptyParam = {
  deep?: boolean;
  emptyValues?: unknown[];
  keep?: string[];
  removeEmptyArray?: boolean;
  removeUndefined?: boolean;
};

function normalizeParam(param: unknown): OmitEmptyParam {
  return isRecord(param) ? {
    deep: param.deep === true,
    emptyValues: Array.isArray(param.emptyValues) ? param.emptyValues : ['', null],
    keep: Array.isArray(param.keep) ? param.keep.filter((item): item is string => typeof item === 'string') : [],
    removeEmptyArray: param.removeEmptyArray !== false,
    removeUndefined: param.removeUndefined !== false
  } : {
    deep: false,
    emptyValues: ['', null],
    keep: [],
    removeEmptyArray: true,
    removeUndefined: true
  };
}

function isEmptyValue(value: unknown, param: OmitEmptyParam) {
  if (value === undefined) return param.removeUndefined !== false;
  if (Array.isArray(value) && param.removeEmptyArray !== false && value.length === 0) return true;
  return (param.emptyValues ?? ['', null]).some((emptyValue) => Object.is(value, emptyValue));
}

function omitEmpty(value: unknown, param: OmitEmptyParam): unknown {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => param.deep ? omitEmpty(item, param) : cloneProcessorValue(item))
      .filter((item) => !isEmptyValue(item, param));
    return items;
  }

  if (!isRecord(value)) return value;

  const keep = new Set(param.keep ?? []);
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      const nextValue = param.deep ? omitEmpty(item, param) : cloneProcessorValue(item);
      if (!keep.has(key) && isEmptyValue(nextValue, param)) return [];
      return [[key, nextValue]];
    })
  );
}

export const omitEmptyProcessor: ProcessorExecutor = (value, param) => omitEmpty(value, normalizeParam(param));
