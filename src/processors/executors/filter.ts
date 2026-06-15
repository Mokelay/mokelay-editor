import {
  deepStrictEqual,
  isEmptyProcessorValue,
  readFilterParam,
  readPath
} from '@/processors/shared';
import type { FilterCondition, ProcessorExecutor } from '@/processors/types';

function matchesCondition(item: unknown, condition: FilterCondition) {
  const current = readPath(item, condition.variable);

  if (condition.condition === 'is_empty') return isEmptyProcessorValue(current);
  if (condition.condition === 'is_not_empty') return !isEmptyProcessorValue(current);
  if (condition.condition === 'eq') return deepStrictEqual(current, condition.value);

  return typeof current === 'number' && Number.isFinite(current) &&
    typeof condition.value === 'number' && Number.isFinite(condition.value) &&
    (condition.condition === 'gt' ? current > condition.value : current < condition.value);
}

export const filterProcessor: ProcessorExecutor = (value, param) => {
  const filter = readFilterParam(param);
  if (!Array.isArray(value)) return value;
  if (!filter.conditions.length) return [...value];

  return value.filter((item) => {
    const results = filter.conditions.map((condition) => matchesCondition(item, condition));
    return filter.type === 'and' ? results.every(Boolean) : results.some(Boolean);
  });
};
