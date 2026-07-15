import {
  declarationKey,
  getResponseForTerminal,
  isControllerBlock,
  isFragmentApiJson,
  isStandardBlock,
  isStarterBlock,
  processorName,
  supportedOutputKeys
} from '@/api-builder/registry';
import { validateApiJson } from '@/api-builder/validation';
import type {
  ApiController,
  ApiJson,
  ApiStandardBlock,
  ControllerNode,
  DryRunBlockLog,
  DryRunResult,
  FragmentResolver,
  ProcessableKey,
  ProcessorConfig,
  RequestLocation,
  RequestSnapshot
} from '@/api-builder/types';

type DryRunContext = {
  request: RequestSnapshot;
  params: Record<string, unknown>;
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
  const params: Record<string, unknown> = {};
  if (isFragmentApiJson(apiJson)) {
    for (const declaration of apiJson.params ?? []) {
      const key = declarationKey(declaration);
      params[key] = current?.params?.[key] ?? defaultValueForKey(key);
    }
  }

  return {
    header: createLocationSnapshot(apiJson, 'header', current),
    query: createLocationSnapshot(apiJson, 'query', current),
    body: createLocationSnapshot(apiJson, 'body', current),
    params
  };
}

export type DryRunOptions = {
  resolveFragment?: FragmentResolver;
};

export async function runDryApiTest(
  apiJson: ApiJson,
  request: RequestSnapshot,
  options: DryRunOptions = {}
): Promise<DryRunResult> {
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
    params: normalizedRequest.params,
    header: normalizedRequest.header,
    query: normalizedRequest.query,
    body: normalizedRequest.body,
    now: new Date().toISOString(),
    blocks: {}
  };
  const logs: DryRunBlockLog[] = [];
  let terminalUuid = 'starter';

  try {
    applyInputProcessors(apiJson, context);
  } catch (error) {
    errors.push(readErrorMessage(error));
  }

  if (errors.length) {
    for (const block of apiJson.blocks ?? []) {
      if (isStarterBlock(block)) continue;
      logs.push({
        uuid: block.uuid,
        alias: block.alias || block.uuid,
        functionName: block.functionName,
        inputs: block.inputs ?? {},
        outputs: {},
        status: 'skipped',
        message: '前置校验失败，已跳过。'
      });
    }
  } else {
    terminalUuid = await executeDryRunGraph(apiJson, context, logs, errors, options);
  }

  let data: unknown = null;
  if (!errors.length) {
    try {
      const response = getResponseForTerminal(apiJson, terminalUuid);
      data = response == null ? null : resolveTemplates(response, context);
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
  if (isFragmentApiJson(apiJson)) return snapshot;
  for (const declaration of apiJson.request?.[location] ?? []) {
    const key = declarationKey(declaration);
    snapshot[key] = current?.[location]?.[key] ?? defaultValueForKey(key);
  }
  return snapshot;
}

function applyInputProcessors(apiJson: ApiJson, context: DryRunContext) {
  if (isFragmentApiJson(apiJson)) {
    const declared = new Set((apiJson.params ?? []).map(declarationKey));
    for (const key of Object.keys(context.params)) {
      if (!declared.has(key)) {
        throw new Error(`Fragment 未声明参数 params.${key}`);
      }
    }
    for (const declaration of apiJson.params ?? []) {
      const key = declarationKey(declaration);
      const value = context.params[key];
      if (typeof declaration === 'string') {
        if (isEmpty(value)) throw new Error(`请填写 params.${key}`);
        continue;
      }
      context.params[key] = applyProcessors(value, declaration.processors ?? [], `params.${key}`, context);
    }
    return;
  }

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

async function executeDryRunGraph(
  apiJson: ApiJson,
  context: DryRunContext,
  logs: DryRunBlockLog[],
  errors: string[],
  options: DryRunOptions
) {
  const blocks = apiJson.blocks ?? [];
  const starter = blocks.find(isStarterBlock);
  const blockMap = new Map(blocks.filter((block) => !isStarterBlock(block)).map((block) => [block.uuid, block]));
  const visited = new Set<string>();
  let nextBlock = starter?.nextBlock ?? null;
  let terminalUuid = 'starter';

  while (nextBlock !== null) {
    if (visited.has(nextBlock)) {
      errors.push(`流程存在循环：${nextBlock}`);
      return terminalUuid;
    }
    visited.add(nextBlock);

    const block = blockMap.get(nextBlock);
    if (!block) {
      errors.push(`流程指向不存在的节点：${nextBlock}`);
      return terminalUuid;
    }

    if (isControllerBlock(block)) {
      const node = executeDryRunController(block, context, logs, errors);
      if (errors.length || !node) return terminalUuid;
      terminalUuid = node.uuid;
      nextBlock = node.nextBlock ?? null;
      continue;
    }

    if (isStandardBlock(block)) {
      nextBlock = await executeDryRunBlock(block, context, logs, errors, options);
      if (errors.length) return terminalUuid;
      terminalUuid = block.uuid;
    }
  }

  return terminalUuid;
}

async function executeDryRunBlock(
  block: ApiStandardBlock,
  context: DryRunContext,
  logs: DryRunBlockLog[],
  errors: string[],
  options: DryRunOptions
) {
  try {
    const inputs = resolveTemplates(block.inputs ?? {}, context) as Record<string, unknown>;
    const outputs = block.functionName === 'executeFragment'
      ? await executeDryFragment(inputs, options)
      : createMockOutputs(block, inputs);
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
    const catchesError = Object.prototype.hasOwnProperty.call(block, 'errorNextBlock');
    if (!catchesError) {
      errors.push(message);
    }
    context.blocks[block.uuid] = { inputs: block.inputs ?? {}, outputs: {} };
    logs.push({
      uuid: block.uuid,
      alias: block.alias || block.uuid,
      functionName: block.functionName,
      inputs: block.inputs ?? {},
      outputs: {},
      status: 'error',
      message: catchesError
        ? `${message}；已进入${block.errorNextBlock === null ? '错误终点' : `错误分支 ${block.errorNextBlock}`}`
        : message
    });
    return catchesError ? block.errorNextBlock ?? null : null;
  }

  return block.nextBlock ?? null;
}

function executeDryRunController(
  controller: ApiController,
  context: DryRunContext,
  logs: DryRunBlockLog[],
  errors: string[]
) {
  try {
    const inputs = resolveTemplates(controller.inputs ?? {}, context) as Record<string, unknown>;
    const node = selectControllerNode(controller, inputs);
    logs.push({
      uuid: controller.uuid,
      alias: controller.alias || controller.uuid,
      functionName: controller.functionName,
      inputs,
      outputs: {},
      status: 'success',
      message: `命中分支：${node.uuid}`
    });
    return node;
  } catch (error) {
    const message = readErrorMessage(error);
    errors.push(message);
    logs.push({
      uuid: controller.uuid,
      alias: controller.alias || controller.uuid,
      functionName: controller.functionName,
      inputs: controller.inputs ?? {},
      outputs: {},
      status: 'error',
      message
    });
    return null;
  }
}

function selectControllerNode(controller: ApiController, inputs: Record<string, unknown>): ControllerNode {
  if (controller.functionName === 'if_controller') {
    const selectedValue = truthyControllerValue(inputs.value);
    const node = controller.nodes.find((item) => item.value === selectedValue);
    if (!node) throw new Error(`IF 控制器缺少 ${selectedValue ? 'true' : 'false'} 分支`);
    return node;
  }

  if (controller.functionName !== 'switch_controller') {
    throw new Error(`不支持的 Controller 类型：${controller.functionName}`);
  }

  const dataType = inputs.dataType;
  if (dataType !== 'string' && dataType !== 'number' && dataType !== 'boolean') {
    throw new Error('Switch 控制器 dataType 必须是 string、number 或 boolean');
  }
  if (typeof inputs.value !== dataType) {
    throw new Error(`Switch 控制器 value 必须是 ${dataType} 类型`);
  }

  const matched = controller.nodes.find((node) => node.type !== 'DEFAULT' && node.value === inputs.value);
  if (matched) return matched;

  const defaultNode = controller.nodes.find((node) => node.type === 'DEFAULT');
  if (!defaultNode) throw new Error('Switch 控制器缺少 DEFAULT 分支');
  return defaultNode;
}

function truthyControllerValue(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return value.length > 0;
  return false;
}

function createMockOutputs(block: ApiStandardBlock, inputs: Record<string, unknown>) {
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
  if (block.functionName === 'create' || block.functionName === 'upsert') {
    return { uuid: 'mock_created_id' };
  }
  if (block.functionName === 'update' || block.functionName === 'delete') {
    return { affected: 1 };
  }
  if (block.functionName === 'randomId') {
    const prefix = typeof inputs.prefix === 'string' ? inputs.prefix : '';
    const length = typeof inputs.length === 'number' && Number.isInteger(inputs.length) ? inputs.length : 6;
    const alphabet = typeof inputs.alphabet === 'string' && inputs.alphabet.length ? inputs.alphabet : 'abcdefghijklmnopqrstuvwxyz0123456789';
    const seed = Array.from({ length }, (_, index) => alphabet[index % alphabet.length]).join('');
    const value = `${prefix}${seed}`;
    return { value: inputs.lowerCase === false ? value : value.toLowerCase() };
  }
  if (block.functionName === 'assertUnique') {
    return {};
  }
  if (block.functionName === 'createSchema') {
    const schema = typeof inputs.schema === 'string' ? inputs.schema : 'mock_schema';
    return { schema, created: true, exists: true };
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

async function executeDryFragment(inputs: Record<string, unknown>, options: DryRunOptions) {
  const fragmentUuid = inputs.fragmentUuid;
  if (typeof fragmentUuid !== 'string' || !fragmentUuid.trim()) {
    throw new Error('ExecuteFragment 缺少 fragmentUuid');
  }
  if (!isRecord(inputs.params)) {
    throw new Error('ExecuteFragment params 必须是对象');
  }
  if (!options.resolveFragment) {
    throw new Error(`Dry-run 无法解析 Fragment：${fragmentUuid}`);
  }

  const fragment = await options.resolveFragment(fragmentUuid);
  if (!isFragmentApiJson(fragment)) {
    throw new Error(`${fragmentUuid} 不是 Fragment`);
  }
  const childRequest = createRequestSnapshot(fragment);
  childRequest.params = { ...inputs.params };
  const result = await runDryApiTest(fragment, childRequest, options);
  if (!result.ok) {
    throw new Error(`Fragment ${fragmentUuid} 执行失败：${result.errors.join('；')}`);
  }
  return { result: result.data };
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
