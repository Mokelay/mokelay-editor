import { isRecord } from '@/processors/shared';
import type { ProcessorExecutor, RandomIdParam } from '@/processors/types';

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const defaultLength = 6;
const maxLength = 32;

type NormalizedRandomIdParam = {
  prefix: string;
  length: number;
  alphabet: string[];
  lowerCase: boolean;
  when: 'always' | 'empty';
};

function normalizeLength(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return defaultLength;
  }

  return Math.min(maxLength, Math.trunc(value));
}

function normalizeAlphabet(value: unknown, lowerCase: boolean) {
  const raw = typeof value === 'string' && value ? value : defaultAlphabet;
  const source = lowerCase ? raw.toLowerCase() : raw;
  const chars = Array.from(source);
  const unique = chars.filter((char, index) => chars.indexOf(char) === index);
  return unique.length ? unique : Array.from(defaultAlphabet);
}

function normalizeParam(param: unknown): NormalizedRandomIdParam {
  const objectParam = isRecord(param) ? param : {};
  const lowerCase = !isRecord(param) || typeof param.lowerCase !== 'boolean'
    ? true
    : param.lowerCase;

  return {
    prefix: typeof param === 'string'
      ? param
      : typeof objectParam.prefix === 'string'
        ? objectParam.prefix
        : '',
    length: typeof param === 'number' ? normalizeLength(param) : normalizeLength(objectParam.length),
    alphabet: normalizeAlphabet(objectParam.alphabet, lowerCase),
    lowerCase,
    when: objectParam.when === 'always' ? 'always' : 'empty'
  };
}

function shouldReuseInput(value: unknown, param: NormalizedRandomIdParam) {
  return param.when === 'empty' && typeof value === 'string' && Boolean(value.trim());
}

function randomIndex(max: number) {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    const range = 0x100000000;
    const limit = range - (range % max);
    const buffer = new Uint32Array(1);

    do {
      cryptoApi.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return buffer[0] % max;
  }

  return Math.floor(Math.random() * max);
}

export function readRandomIdParam(param: unknown): RandomIdParam {
  const normalized = normalizeParam(param);
  return {
    prefix: normalized.prefix,
    length: normalized.length,
    alphabet: normalized.alphabet.join(''),
    lowerCase: normalized.lowerCase,
    when: normalized.when
  };
}

export const randomIdProcessor: ProcessorExecutor = (value, param) => {
  const normalized = normalizeParam(param);
  if (shouldReuseInput(value, normalized)) {
    return value;
  }

  const randomPart = Array.from({ length: normalized.length }, () =>
    normalized.alphabet[randomIndex(normalized.alphabet.length)]
  ).join('');
  const result = `${normalized.prefix}${randomPart}`;
  return normalized.lowerCase ? result.toLowerCase() : result;
};
