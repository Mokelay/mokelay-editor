import { cloneProcessorValue, isRecord } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

type StatusTagMapParam = {
  map?: Record<string, unknown>;
  fallback?: unknown;
};

function normalizeParam(param: unknown): StatusTagMapParam {
  return isRecord(param)
    ? {
        map: isRecord(param.map) ? param.map : {},
        ...(Object.prototype.hasOwnProperty.call(param, 'fallback') ? { fallback: param.fallback } : {})
      }
    : { map: {} };
}

export const statusTagMapProcessor: ProcessorExecutor = (value, param) => {
  const config = normalizeParam(param);
  const keyValue = isRecord(value) && Object.prototype.hasOwnProperty.call(value, 'value') ? value.value : value;
  const key = String(keyValue);
  const mapped = config.map && Object.prototype.hasOwnProperty.call(config.map, key)
    ? config.map[key]
    : Object.prototype.hasOwnProperty.call(config, 'fallback')
      ? config.fallback
      : { label: String(value ?? ''), color: 'default' };
  const mappedRecord = isRecord(mapped) ? mapped : { label: mapped };

  return {
    ...(isRecord(value) ? cloneProcessorValue(value) : {}),
    value: keyValue,
    label: mappedRecord.label ?? String(keyValue ?? ''),
    ...(mappedRecord.type ? { type: mappedRecord.type } : {}),
    ...(mappedRecord.color ? { color: mappedRecord.color } : {}),
    ...(mappedRecord.icon ? { icon: mappedRecord.icon } : {}),
    ...(mappedRecord.tooltip ? { tooltip: mappedRecord.tooltip } : {})
  };
};
