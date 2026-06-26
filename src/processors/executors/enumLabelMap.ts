import { cloneProcessorValue, isRecord } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

type EnumLabelMapParam = {
  map?: Record<string, unknown>;
  fallback?: unknown;
  returnObject?: boolean;
  emptyLabel?: unknown;
};

function normalizeParam(param: unknown): EnumLabelMapParam {
  return isRecord(param) ? {
    map: isRecord(param.map) ? param.map : {},
    ...(Object.prototype.hasOwnProperty.call(param, 'fallback') ? { fallback: param.fallback } : {}),
    returnObject: param.returnObject === true,
    ...(Object.prototype.hasOwnProperty.call(param, 'emptyLabel') ? { emptyLabel: param.emptyLabel } : {})
  } : { map: {} };
}

export const enumLabelMapProcessor: ProcessorExecutor = (value, param) => {
  const config = normalizeParam(param);
  if ((value === undefined || value === null || value === '') && Object.prototype.hasOwnProperty.call(config, 'emptyLabel')) {
    return config.emptyLabel;
  }

  const key = String(isRecord(value) && Object.prototype.hasOwnProperty.call(value, 'value') ? value.value : value);
  const mapped = config.map && Object.prototype.hasOwnProperty.call(config.map, key)
    ? config.map[key]
    : Object.prototype.hasOwnProperty.call(config, 'fallback')
      ? config.fallback
      : value;

  if (!config.returnObject) return cloneProcessorValue(mapped);

  return {
    value,
    label: mapped
  };
};
