import { invalidProcessorConfig } from '@/processors/errors';
import type { FilterCondition, FilterParam, ProcessorConfig } from '@/processors/types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function processorName(config: ProcessorConfig) {
  return typeof config === 'string' ? config : config.processor;
}

export function processorParam(config: ProcessorConfig) {
  return typeof config === 'string' ? undefined : config.param;
}

export function cloneProcessorValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') {
    return value;
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      return value;
    }
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}

export function normalizeProcessorConfig(value: unknown): ProcessorConfig | undefined {
  if (typeof value === 'string') {
    const name = value.trim();
    return name || undefined;
  }

  if (!isRecord(value) || typeof value.processor !== 'string' || !value.processor.trim()) {
    return undefined;
  }

  return {
    processor: value.processor.trim(),
    ...(Object.prototype.hasOwnProperty.call(value, 'param')
      ? { param: cloneProcessorValue(value.param) }
      : {})
  };
}

export function isEmptyProcessorValue(value: unknown) {
  return value === undefined || value === null || value === '';
}

export function deepStrictEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right || left === null || right === null) return false;

  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => deepStrictEqual(item, right[index]));
  }

  if (!isRecord(left) || !isRecord(right)) return false;

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && deepStrictEqual(left[key], right[key]));
}

export function parseProcessorPath(path: string): string[] {
  return path.trim().split('.').map((segment) => segment.trim()).filter(Boolean);
}

function isArrayIndex(segment: string) {
  return /^(0|[1-9]\d*)$/.test(segment);
}

export function readPath(value: unknown, path: string) {
  if (!path.trim()) return value;

  let current = value;
  for (const segment of parseProcessorPath(path)) {
    if (Array.isArray(current)) {
      if (!isArrayIndex(segment)) return undefined;
      const index = Number(segment);
      if (index < 0 || index >= current.length) return undefined;
      current = current[index];
      continue;
    }

    if (!isRecord(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

export function hasPath(value: unknown, path: string) {
  if (!path.trim()) return true;

  let current = value;
  for (const segment of parseProcessorPath(path)) {
    if (Array.isArray(current)) {
      if (!isArrayIndex(segment)) return false;
      const index = Number(segment);
      if (index < 0 || index >= current.length) return false;
      current = current[index];
      continue;
    }

    if (!isRecord(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return false;
    }
    current = current[segment];
  }

  return true;
}

export function writePath(value: unknown, path: string, nextValue: unknown) {
  const segments = parseProcessorPath(path);
  if (!segments.length) return cloneProcessorValue(nextValue);

  const root = Array.isArray(value)
    ? [...value]
    : isRecord(value)
      ? { ...value }
      : isArrayIndex(segments[0])
        ? []
        : {};
  let current: unknown = root;

  segments.forEach((segment, index) => {
    const last = index === segments.length - 1;
    if (Array.isArray(current)) {
      if (!isArrayIndex(segment)) return;
      const arrayIndex = Number(segment);
      if (last) {
        current[arrayIndex] = cloneProcessorValue(nextValue);
        return;
      }
      const existing = current[arrayIndex];
      const nextSegment = segments[index + 1];
      const child = Array.isArray(existing)
        ? [...existing]
        : isRecord(existing)
          ? { ...existing }
          : isArrayIndex(nextSegment)
            ? []
            : {};
      current[arrayIndex] = child;
      current = child;
      return;
    }

    if (!isRecord(current)) return;
    if (last) {
      current[segment] = cloneProcessorValue(nextValue);
      return;
    }
    const existing = current[segment];
    const nextSegment = segments[index + 1];
    const child = Array.isArray(existing)
      ? [...existing]
      : isRecord(existing)
        ? { ...existing }
        : isArrayIndex(nextSegment)
          ? []
          : {};
    current[segment] = child;
    current = child;
  });

  return root;
}

const filterConditionTypes = new Set(['eq', 'gt', 'lt', 'is_empty', 'is_not_empty']);

export function readFilterParam(param: unknown): FilterParam {
  if (!isRecord(param) || (param.type !== 'and' && param.type !== 'or') || !Array.isArray(param.conditions)) {
    invalidProcessorConfig('filter', 'param must contain type "and" or "or" and a conditions array.');
  }

  const conditions = param.conditions.map((condition): FilterCondition => {
    if (!isRecord(condition) || typeof condition.variable !== 'string' || !condition.variable.trim()) {
      invalidProcessorConfig('filter', 'each condition must contain a non-empty variable path.');
    }
    if (typeof condition.condition !== 'string' || !filterConditionTypes.has(condition.condition)) {
      invalidProcessorConfig('filter', 'condition must be eq, gt, lt, is_empty, or is_not_empty.');
    }

    const conditionType = condition.condition as FilterCondition['condition'];
    if ((conditionType === 'eq' || conditionType === 'gt' || conditionType === 'lt') &&
      !Object.prototype.hasOwnProperty.call(condition, 'value')) {
      invalidProcessorConfig('filter', `${conditionType} requires a value.`);
    }

    return {
      variable: condition.variable.trim(),
      condition: conditionType,
      ...(conditionType === 'is_empty' || conditionType === 'is_not_empty'
        ? {}
        : { value: cloneProcessorValue(condition.value) })
    };
  });

  return {
    type: param.type,
    conditions
  };
}
