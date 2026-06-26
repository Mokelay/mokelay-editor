import { invalidProcessorConfig } from '@/processors/errors';
import { isRecord } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

const dateFormatTokens = /yyyy|MM|dd|HH|mm|ss|SS/g;

type DateTimeFormatParam = string | {
  format?: string;
  inputUnit?: 'ms' | 's';
  output?: 'string' | 'number';
  emptyValue?: unknown;
  invalidValue?: unknown;
};

export function validateDateTimeFormatParam(param: unknown): asserts param is DateTimeFormatParam {
  if (typeof param === 'string') {
    if (!param.trim()) {
      invalidProcessorConfig('date_time_format', 'param must be a non-empty format string.');
    }
    return;
  }

  if (!isRecord(param) || (typeof param.format !== 'string' || !param.format.trim())) {
    invalidProcessorConfig('date_time_format', 'param must be a non-empty format string or an object with format.');
  }
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function normalizeParam(param: DateTimeFormatParam) {
  if (typeof param === 'string') {
    return {
      format: param,
      inputUnit: 'ms' as const,
      output: 'string' as const
    };
  }

  return {
    format: param.format?.trim() || 'yyyy-MM-dd HH:mm:SS',
    inputUnit: param.inputUnit === 's' ? 's' as const : 'ms' as const,
    output: param.output === 'number' ? 'number' as const : 'string' as const,
    ...(Object.prototype.hasOwnProperty.call(param, 'emptyValue') ? { emptyValue: param.emptyValue } : {}),
    ...(Object.prototype.hasOwnProperty.call(param, 'invalidValue') ? { invalidValue: param.invalidValue } : {})
  };
}

function isEmptyDateValue(value: unknown) {
  return value === undefined || value === null || value === '';
}

export const dateTimeFormatProcessor: ProcessorExecutor = (value, param) => {
  validateDateTimeFormatParam(param);
  const config = normalizeParam(param);
  if (isEmptyDateValue(value)) {
    return Object.prototype.hasOwnProperty.call(config, 'emptyValue') ? config.emptyValue : value;
  }
  if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') return value;
  if (typeof value === 'number' && !Number.isFinite(value)) return value;
  if (typeof value === 'string' && !value.trim()) return value;

  const date = value instanceof Date
    ? new Date(value.getTime())
    : typeof value === 'number'
      ? new Date(config.inputUnit === 's' ? value * 1000 : value)
      : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return Object.prototype.hasOwnProperty.call(config, 'invalidValue') ? config.invalidValue : value;
  }

  if (config.output === 'number') return date.getTime();

  const replacements: Record<string, string> = {
    yyyy: String(date.getFullYear()).padStart(4, '0'),
    MM: pad(date.getMonth() + 1),
    dd: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    SS: pad(date.getSeconds())
  };

  return config.format.replace(dateFormatTokens, (token) => replacements[token]);
};
