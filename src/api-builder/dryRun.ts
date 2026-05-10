import {
  declarationKey,
  processorName,
  supportedOutputKeys
} from '@/api-builder/registry';
import { validateApiJson } from '@/api-builder/validation';
import type {
  ApiBlock,
  ApiJson,
  DryRunBlockLog,
  DryRunResult,
  ProcessableKey,
  ProcessorConfig,
  RequestLocation,
  RequestSnapshot
} from '@/api-builder/types';

type DryRunContext = {
  request: RequestSnapshot;
  header: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  now: string;
  blocks: Record<string, {
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
  }>;
};

const wholeTemplatePattern = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
const templatePattern = /\{\{\s*([^}]+?)\s*\}\}/g;

export function createRequestSnapshot(apiJson: ApiJson, current?: RequestSnapshot): RequestSnapshot {
  return {
    header: createLocationSnapshot(apiJson, 'header', current),
    query: createLocationSnapshot(apiJson, 'query', current),
    body: createLocationSnapshot(apiJson, 'body', current)
  };
}

export function runDryApiTest(apiJson: ApiJson, request: RequestSnapshot): DryRunResult {
  const errors: string[] = [];
  const issues = validateApiJson(apiJson);
  for (const issue of issues) {
    if (issue.severity === 'error') {
      errors.push(issue.message);
    }
  }

  const normalizedRequest = createRequestSnapshot(apiJson, request);
  const context: DryRunContext = {
    request: normalizedRequest,
    header: normalizedRequest.header,
    query: normalizedRequest.query,
    body: normalizedRequest.body,
    now: new Date().toISOString(),
    blocks: {}
  };
  const logs: DryRunBlockLog[] = [];

  try {
    applyRequestProcessors(apiJson, context);
  } catch (error) {
    errors.push(readErrorMessage(error));
  }

  for (const block of apiJson.blocks ?? []) {
    if (errors.length) {
      logs.push({
        uuid: block.uuid,
        alias: block.alias || block.uuid,
        functionName: block.functionName,
        inputs: block.inputs ?? {},
        outputs: {},
        status: 'skipped',
        message: '前置校验失败，已跳过。'
      });
      continue;
    }

    try {
      const inputs = resolveTemplates(block.inputs ?? {}, context) as Record<string, unknown>;
      const outputs = createMockOutputs(block, inputs);
      context.blocks[block.uuid] = { inputs, outputs };
      logs.push({
        uuid: block.uuid,
        alias: block.alias || block.uuid,
        functionName: block.functionName,
        inputs,
        outputs,
        status: 'success',
        message: '已模拟执行。'
      });
    } catch (error) {
      const message = readErrorMessage(error);
      errors.push(message);
      context.blocks[block.uuid] = { inputs: block.inputs ?? {}, outputs: {} };
      logs.push({
        uuid: block.uuid,
        alias: block.alias || block.uuid,
        functionName: block.functionName,
        inputs: block.inputs ?? {},
        outputs: {},
        status: 'error',
        message
      });
    }
  }

  let data: unknown = null;
  if (!errors.length) {
    try {
      data = apiJson.response == null ? null : resolveTemplates(apiJson.response, context);
    } catch (error) {
      errors.push(readErrorMessage(error));
    }
  }

  return {
    ok: errors.length === 0,
    data,
    errors,
    request: normalizedRequest,
    logs,
    apiJson
  };
}

function createLocationSnapshot(apiJson: ApiJson, location: RequestLocation, current?: RequestSnapshot) {
  const snapshot: Record<string, unknown> = {};
  for (const declaration of apiJson.request?.[location] ?? []) {
    const key = declarationKey(declaration);
    snapshot[key] = current?.[location]?.[key] ?? defaultValueForKey(key);
  }
  return snapshot;
}

function applyRequestProcessors(apiJson: ApiJson, context: DryRunContext) {
  for (const location of ['header', 'query', 'body'] as const) {
    for (const declaration of apiJson.request?.[location] ?? []) {
      const key = declarationKey(declaration);
      const value = context.request[location][key];
      if (typeof declaration === 'string') {
        if (isEmpty(value)) {
          throw new Error(`请填写 ${location}.${key}`);
        }
        continue;
      }
      context.request[location][key] = applyProcessors(value, declaration.processors ?? [], `${location}.${key}`, context);
    }
  }
}

function createMockOutputs(block: ApiBlock, inputs: Record<string, unknown>) {
  const fields = Array.isArray(inputs.fields)
    ? inputs.fields.filter((field): field is string => typeof field === 'string')
    : ['id', 'name'];
  const row = Object.fromEntries(fields.map((field) => [field, mockFieldValue(field)]));

  if (block.functionName === 'list') {
    return { datas: [row, { ...row, id: 'mock_2' }] };
  }
  if (block.functionName === 'page') {
    return {
      datas: [row],
      total: 1,
      totalPages: 1,
      page: Number(inputs.page || 1),
      pageSize: Number(inputs.pageSize || 20),
      hasPreviousPage: false,
      hasNextPage: false
    };
  }
  if (block.functionName === 'count') {
    return { total: 1 };
  }
  if (block.functionName === 'read') {
    return { data: row };
  }
  if (block.functionName === 'create') {
    return { uuid: 'mock_created_id' };
  }
  if (block.functionName === 'update' || block.functionName === 'delete') {
    return { affected: 1 };
  }
  if (block.functionName === 'readSession') {
    return {
      value: {
        id: 'mock_user',
        name: 'Mock User',
        email: 'mock@example.com'
      }
    };
  }
  return {};
}

function resolveTemplates(value: unknown, context: DryRunContext): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolveTemplates(item, context));
  }
  if (isTemplateObject(value)) {
    const wholeMatch = value.template.match(wholeTemplatePattern);
    const rendered = wholeMatch
      ? readPath(context, wholeMatch[1].trim())
      : value.template.replace(templatePattern, (_match, path) => stringifyTemplateValue(readPath(context, String(path).trim())));
    return applyProcessors(rendered, value.processors ?? [], value.template, context);
  }
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveTemplates(item, context)]));
  }
  return value;
}

function readPath(context: DryRunContext, path: string): unknown {
  const normalizedPath = path
    .replace(/^request\./, 'request.')
    .replace(/^header\./, 'request.header.')
    .replace(/^query\./, 'request.query.')
    .replace(/^body\./, 'request.body.');

  const segments = tokenizePath(normalizedPath);
  let cursor: unknown = context;

  for (const segment of segments) {
    if (isRecord(cursor) && segment in cursor) {
      cursor = cursor[segment];
      continue;
    }
    if (Array.isArray(cursor) && /^\d+$/.test(segment)) {
      cursor = cursor[Number(segment)];
      continue;
    }
    throw new Error(`变量不存在：${path}`);
  }

  return cursor;
}

function tokenizePath(path: string) {
  const segments: string[] = [];
  let cursor = '';
  for (let index = 0; index < path.length; index += 1) {
    const char = path[index];
    if (char === '.') {
      if (cursor) segments.push(cursor);
      cursor = '';
      continue;
    }
    if (char === '[') {
      if (cursor) segments.push(cursor);
      cursor = '';
      const end = path.indexOf(']', index);
      if (end === -1) {
        throw new Error(`变量路径无效：${path}`);
      }
      const raw = path.slice(index + 1, end).trim();
      segments.push(raw.replace(/^['"]|['"]$/g, ''));
      index = end;
      continue;
    }
    cursor += char;
  }
  if (cursor) segments.push(cursor);
  return segments;
}

function applyProcessors(value: unknown, processors: ProcessorConfig[], label: string, context: DryRunContext) {
  let current = value;
  for (const processor of processors) {
    const name = processorName(processor);
    if (name === 'trim' && typeof current === 'string') {
      current = current.trim();
    } else if (name === 'is_not_null') {
      if (isEmpty(current)) throw new Error(`请填写 ${label}`);
    } else if (name === 'is_null') {
      if (!isEmpty(current)) throw new Error(`${label} 必须为空`);
    } else if (name === 'not_null') {
      current = !isEmpty(current);
    } else if (name === 'email_check') {
      if (typeof current !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current)) {
        throw new Error(`${label} 需要是邮箱格式`);
      }
    } else if (name === 'number_check') {
      if (!Number.isFinite(Number(current))) {
        throw new Error(`${label} 需要是数字`);
      }
    } else if (name === 'min') {
      const limit = Number(readProcessorParam(processor, context)[0]);
      if ((typeof current === 'string' || Array.isArray(current)) && current.length < limit) {
        throw new Error(`${label} 长度不能小于 ${limit}`);
      }
    } else if (name === 'max') {
      const limit = Number(readProcessorParam(processor, context)[0]);
      if ((typeof current === 'string' || Array.isArray(current)) && current.length > limit) {
        throw new Error(`${label} 长度不能大于 ${limit}`);
      }
    } else if (name === 'eq') {
      const expected = readProcessorParam(processor, context)[0];
      if (JSON.stringify(current) !== JSON.stringify(expected)) {
        throw new Error(`${label} 必须等于 ${JSON.stringify(expected)}`);
      }
    } else if (name === 'regex') {
      const pattern = String(readProcessorParam(processor, context)[0] ?? '');
      if (typeof current !== 'string' || !new RegExp(pattern.replace(/^\/|\/[a-z]*$/g, '')).test(current)) {
        throw new Error(`${label} 不符合正则规则`);
      }
    } else if (name === 'hash_make') {
      current = `mock_hash(${String(current)})`;
    } else if (name === 'hash_check') {
      current = true;
    }
  }
  return current;
}

function readProcessorParam(processor: ProcessorConfig, context: DryRunContext) {
  if (typeof processor === 'string' || processor.param === undefined) return [];
  const param = resolveTemplates(processor.param, context);
  return Array.isArray(param) ? param : [param];
}

function defaultValueForKey(key: string) {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('email')) return 'mock@example.com';
  if (lowerKey.includes('password')) return 'password123';
  if (lowerKey.includes('pageSize'.toLowerCase())) return '20';
  if (lowerKey === 'page') return '1';
  if (lowerKey.endsWith('id') || lowerKey.includes('uuid')) return 'mock_id';
  if (lowerKey.includes('blocks')) return [];
  return `mock_${key}`;
}

function mockFieldValue(field: string) {
  const lowerField = field.toLowerCase();
  if (lowerField.includes('email')) return 'mock@example.com';
  if (lowerField.includes('created') || lowerField.includes('updated')) return new Date().toISOString();
  if (lowerField.endsWith('id') || lowerField === 'uuid') return 'mock_id';
  if (lowerField.includes('blocks')) return [];
  if (lowerField.includes('total')) return 1;
  return `mock_${field}`;
}

function stringifyTemplateValue(value: unknown) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function isTemplateObject(value: unknown): value is { template: string; processors?: ProcessorConfig[] } {
  return isRecord(value) && typeof value.template === 'string';
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '';
}

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '测试执行失败';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
