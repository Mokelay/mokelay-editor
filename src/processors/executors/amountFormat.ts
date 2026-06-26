import { isRecord, readPath } from '@/processors/shared';
import { formatNumberValue } from '@/processors/executors/numberPrecision';
import type { ProcessorExecutor } from '@/processors/types';

type AmountFormatParam = {
  coin?: string;
  precision?: number;
  precisionFrom?: string;
  showCoin?: boolean;
  thousand?: boolean;
  emptyValue?: unknown;
};

function normalizeParam(param: unknown): AmountFormatParam {
  return isRecord(param) ? {
    coin: typeof param.coin === 'string' ? param.coin.trim() : undefined,
    precision: typeof param.precision === 'number' && Number.isFinite(param.precision) ? Math.max(0, Math.trunc(param.precision)) : undefined,
    precisionFrom: typeof param.precisionFrom === 'string' ? param.precisionFrom.trim() : undefined,
    showCoin: param.showCoin === true,
    thousand: param.thousand === true,
    ...(Object.prototype.hasOwnProperty.call(param, 'emptyValue') ? { emptyValue: param.emptyValue } : {})
  } : {};
}

export const amountFormatProcessor: ProcessorExecutor = (value, param) => {
  const config = normalizeParam(param);
  const precisionFromValue = config.precisionFrom ? readPath(value, config.precisionFrom) : undefined;
  const precision = typeof precisionFromValue === 'number' && Number.isFinite(precisionFromValue)
    ? precisionFromValue
    : config.precision ?? 2;
  const amount = isRecord(value) && Object.prototype.hasOwnProperty.call(value, 'amount') ? value.amount : value;
  const formatted = formatNumberValue(amount, {
    precision,
    rounding: 'truncate',
    output: 'string',
    thousand: config.thousand,
    ...(Object.prototype.hasOwnProperty.call(config, 'emptyValue') ? { emptyValue: config.emptyValue } : {})
  });

  if (formatted === undefined || formatted === null || formatted === '') return formatted;
  const coin = config.coin || (isRecord(value) && typeof value.coin === 'string' ? value.coin : '');
  return config.showCoin && coin ? `${formatted} ${coin}` : formatted;
};
