import { isRecord } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

type TimezoneFormatParam = {
  from?: string;
  to?: string;
  format?: string;
  inputUnit?: 'ms' | 's';
  range?: {
    startOfDay?: boolean;
    endOfDay?: boolean;
  };
};

const dateFormatTokens = /yyyy|MM|dd|HH|mm|ss|SS/g;

function normalizeParam(param: unknown): TimezoneFormatParam {
  if (!isRecord(param)) return {};
  const range = isRecord(param.range)
    ? {
        startOfDay: param.range.startOfDay === true,
        endOfDay: param.range.endOfDay === true
      }
    : undefined;

  return {
    from: typeof param.from === 'string' && param.from.trim() ? param.from.trim() : 'local',
    to: typeof param.to === 'string' && param.to.trim() ? param.to.trim() : 'local',
    format: typeof param.format === 'string' && param.format.trim() ? param.format.trim() : undefined,
    inputUnit: param.inputUnit === 's' ? 's' : 'ms',
    ...(range ? { range } : {})
  };
}

function pad(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function timezoneForIntl(value?: string) {
  if (!value || value === 'local') return undefined;
  if (value === 'UTC') return 'UTC';
  return value;
}

function getZonedParts(date: Date, timeZone?: string) {
  if (!timeZone) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    };
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = partMap.hour === '24' ? '00' : partMap.hour;

  return {
    year: Number(partMap.year),
    month: Number(partMap.month),
    day: Number(partMap.day),
    hour: Number(hour),
    minute: Number(partMap.minute),
    second: Number(partMap.second)
  };
}

function getTimezoneOffsetMs(date: Date, timeZone?: string) {
  if (!timeZone) return -date.getTimezoneOffset() * 60_000;
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - date.getTime();
}

function zonedDateToUtc(parts: ReturnType<typeof getZonedParts>, timeZone?: string) {
  const guess = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
  const offset = getTimezoneOffsetMs(guess, timeZone);
  return new Date(guess.getTime() - offset);
}

function parseInput(value: unknown, config: TimezoneFormatParam, rangeEdge?: 'start' | 'end') {
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(config.inputUnit === 's' ? value * 1000 : value);
  }
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const text = value.trim();
  const fromZone = timezoneForIntl(config.from);

  if (isDateOnly(text)) {
    const [year, month, day] = text.split('-').map(Number);
    const edge = rangeEdge === 'end'
      ? { hour: 23, minute: 59, second: 59 }
      : { hour: 0, minute: 0, second: 0 };
    return zonedDateToUtc({ year, month, day, ...edge }, fromZone);
  }

  const date = new Date(text);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function formatDate(date: Date, format: string, timeZone?: string) {
  const parts = getZonedParts(date, timeZone);
  const replacements: Record<string, string> = {
    yyyy: pad(parts.year, 4),
    MM: pad(parts.month),
    dd: pad(parts.day),
    HH: pad(parts.hour),
    mm: pad(parts.minute),
    ss: pad(parts.second),
    SS: pad(parts.second)
  };

  return format.replace(dateFormatTokens, (token) => replacements[token]);
}

function convertSingleValue(value: unknown, config: TimezoneFormatParam, rangeEdge?: 'start' | 'end') {
  const date = parseInput(value, config, rangeEdge);
  if (!date) return value;
  const toZone = timezoneForIntl(config.to);
  return config.format ? formatDate(date, config.format, toZone) : date.getTime();
}

export const timezoneFormatProcessor: ProcessorExecutor = (value, param) => {
  const config = normalizeParam(param);
  if (Array.isArray(value)) {
    return value.map((item, index) => convertSingleValue(
      item,
      config,
      index === 0 && config.range?.startOfDay ? 'start' : index === 1 && config.range?.endOfDay ? 'end' : undefined
    ));
  }

  return convertSingleValue(value, config);
};
