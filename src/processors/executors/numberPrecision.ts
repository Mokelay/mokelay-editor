import { isRecord } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

export type NumberPrecisionParam = {
  precision?: number;
  rounding?: 'round' | 'floor' | 'ceil' | 'truncate';
  output?: 'string' | 'number';
  thousand?: boolean;
  emptyValue?: unknown;
};

function normalizeParam(param: unknown): Required<Omit<NumberPrecisionParam, 'emptyValue'>> & { emptyValue?: unknown } {
  const record = isRecord(param) ? param : {};
  const precision = typeof record.precision === 'number' && Number.isFinite(record.precision)
    ? Math.max(0, Math.trunc(record.precision))
    : 2;
  const rounding = record.rounding === 'floor' ||
    record.rounding === 'ceil' ||
    record.rounding === 'truncate'
    ? record.rounding
    : 'round';

  return {
    precision,
    rounding,
    output: record.output === 'number' ? 'number' : 'string',
    thousand: record.thousand === true,
    ...(Object.prototype.hasOwnProperty.call(record, 'emptyValue') ? { emptyValue: record.emptyValue } : {})
  };
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '';
}

function addThousands(value: string) {
  const [integer = '', fraction] = value.split('.');
  const sign = integer.startsWith('-') ? '-' : '';
  const unsigned = sign ? integer.slice(1) : integer;
  const grouped = unsigned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${grouped}${fraction !== undefined ? `.${fraction}` : ''}`;
}

function normalizeNumericString(value: unknown) {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  if (!text || !/^[+-]?\d+(\.\d+)?$/.test(text)) return '';
  return text;
}

function incrementDecimal(integer: string, fraction: string) {
  const combined = `${integer}${fraction}` || '0';
  const incremented = String(BigInt(combined) + 1n).padStart(combined.length, '0');
  return {
    integer: incremented.slice(0, Math.max(1, incremented.length - fraction.length)),
    fraction: fraction ? incremented.slice(-fraction.length) : ''
  };
}

function formatDecimal(value: string, param: ReturnType<typeof normalizeParam>) {
  const negative = value.startsWith('-');
  const unsigned = value.replace(/^[+-]/, '');
  const [integerPart = '0', fractionPart = ''] = unsigned.split('.');
  let integer = integerPart.replace(/^0+(?=\d)/, '') || '0';
  let fraction = fractionPart.padEnd(param.precision + 1, '0');
  const kept = fraction.slice(0, param.precision);
  const rest = fraction.slice(param.precision);
  const hasRest = /[1-9]/.test(rest);
  const shouldIncrement = param.rounding === 'round'
    ? Number(rest[0] ?? 0) >= 5
    : param.rounding === 'ceil'
      ? !negative && hasRest
      : param.rounding === 'floor'
        ? negative && hasRest
        : false;

  fraction = kept;
  if (shouldIncrement) {
    const incremented = incrementDecimal(integer, fraction);
    integer = incremented.integer;
    fraction = incremented.fraction;
  }

  const normalized = `${negative && (integer !== '0' || /[1-9]/.test(fraction)) ? '-' : ''}${integer}${param.precision ? `.${fraction.padEnd(param.precision, '0')}` : ''}`;
  return param.thousand ? addThousands(normalized) : normalized;
}

export function formatNumberValue(value: unknown, param?: unknown) {
  const config = normalizeParam(param);
  if (isEmpty(value)) {
    return Object.prototype.hasOwnProperty.call(config, 'emptyValue') ? config.emptyValue : value;
  }

  const numeric = normalizeNumericString(value);
  if (!numeric) return value;

  const formatted = formatDecimal(numeric, config);
  return config.output === 'number' ? Number(formatted.replace(/,/g, '')) : formatted;
}

export const numberPrecisionProcessor: ProcessorExecutor = formatNumberValue;
