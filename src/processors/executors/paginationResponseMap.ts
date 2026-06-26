import { cloneProcessorValue, isRecord, readPath } from '@/processors/shared';
import type { ProcessorExecutor } from '@/processors/types';

type PaginationResponseMapParam = {
  listPath?: string;
  totalPath?: string;
  pageNoPath?: string;
  pageSizePath?: string;
  fallbackListPaths?: string[];
  output?: {
    rows?: string;
    total?: string;
    pageNo?: string;
    pageSize?: string;
  };
};

const defaultListPaths = [
  'data.records',
  'data.list',
  'data.items',
  'records',
  'list',
  'datas',
  'items'
];

function normalizeParam(param: unknown): PaginationResponseMapParam {
  if (!isRecord(param)) return {};

  return {
    listPath: typeof param.listPath === 'string' ? param.listPath.trim() : undefined,
    totalPath: typeof param.totalPath === 'string' ? param.totalPath.trim() : undefined,
    pageNoPath: typeof param.pageNoPath === 'string' ? param.pageNoPath.trim() : undefined,
    pageSizePath: typeof param.pageSizePath === 'string' ? param.pageSizePath.trim() : undefined,
    fallbackListPaths: Array.isArray(param.fallbackListPaths)
      ? param.fallbackListPaths.filter((item): item is string => typeof item === 'string' && item.trim()).map((item) => item.trim())
      : undefined,
    output: isRecord(param.output)
      ? {
          rows: typeof param.output.rows === 'string' ? param.output.rows.trim() : undefined,
          total: typeof param.output.total === 'string' ? param.output.total.trim() : undefined,
          pageNo: typeof param.output.pageNo === 'string' ? param.output.pageNo.trim() : undefined,
          pageSize: typeof param.output.pageSize === 'string' ? param.output.pageSize.trim() : undefined
        }
      : undefined
  };
}

function firstValue(value: unknown, paths: string[]) {
  for (const path of paths) {
    const nextValue = readPath(value, path);
    if (nextValue !== undefined) return nextValue;
  }
  return undefined;
}

function numberOrUndefined(value: unknown) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : undefined;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
}

export const paginationResponseMapProcessor: ProcessorExecutor = (value, param) => {
  const config = normalizeParam(param);
  const listPaths = [
    ...(config.listPath ? [config.listPath] : []),
    ...(config.fallbackListPaths ?? []),
    ...defaultListPaths
  ];
  const rowsValue = firstValue(value, listPaths);
  const rows = Array.isArray(rowsValue) ? cloneProcessorValue(rowsValue) : [];
  const output = config.output ?? {};

  return {
    [output.rows || 'rows']: rows,
    [output.total || 'total']: numberOrUndefined(config.totalPath ? readPath(value, config.totalPath) : undefined) ?? rows.length,
    [output.pageNo || 'pageNo']: numberOrUndefined(config.pageNoPath ? readPath(value, config.pageNoPath) : undefined),
    [output.pageSize || 'pageSize']: numberOrUndefined(config.pageSizePath ? readPath(value, config.pageSizePath) : undefined),
    raw: cloneProcessorValue(value)
  };
};
