import { invalidProcessorConfig } from '@/processors/errors';
import type { ProcessorExecutor } from '@/processors/types';

const dateFormatTokens = /yyyy|MM|dd|HH|mm|SS/g;

export function validateDateTimeFormatParam(param: unknown): asserts param is string {
  if (typeof param !== 'string' || !param.trim()) {
    invalidProcessorConfig('date_time_format', 'param must be a non-empty format string.');
  }
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export const dateTimeFormatProcessor: ProcessorExecutor = (value, param) => {
  validateDateTimeFormatParam(param);
  if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') return value;
  if (typeof value === 'number' && !Number.isFinite(value)) return value;
  if (typeof value === 'string' && !value.trim()) return value;

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) return value;

  const replacements: Record<string, string> = {
    yyyy: String(date.getFullYear()).padStart(4, '0'),
    MM: pad(date.getMonth() + 1),
    dd: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    SS: pad(date.getSeconds())
  };

  return param.replace(dateFormatTokens, (token) => replacements[token]);
};
