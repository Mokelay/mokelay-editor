import {
  collectResponseTerminals,
  declarationKey,
  getBlockDefinition,
  hasDefaultResponse,
  isControllerBlock,
  isFragmentApiJson,
  isStandardBlock,
  isStarterBlock,
  processorName,
  supportedOutputKeys
} from '@/api-builder/registry';
import type {
  ApiJson,
  ApiStandardBlock,
  Condition,
  ControllerNode,
  ProcessableKey,
  ProcessorConfig,
  ValidationIssue
} from '@/api-builder/types';

const apiUuidPattern = /^[A-Za-z0-9_-]{1,128}$/;
const datasourcePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
const methods = new Set(['GET', 'POST']);
const conditionTypes = new Set(['GE', 'GT', 'LE', 'LT', 'NEQ', 'EQ', 'NOTIN', 'IN']);
const processorNames = new Set([
  'trim',
  'is_not_null',
  'is_null',
  'not_null',
  'email_check',
  'number_check',
  'eq',
  'min',
  'max',
  'regex',
  'hash_make',
  'hash_check'
]);

export function validateApiJson(apiJson: ApiJson): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => {
    issues.push({
      id: `${severity}_${issues.length}_${target}`,
      severity,
      message,
      target
    });
  };

  if (!apiJson.uuid?.trim()) {
    add('error', 'API 标识不能为空。', 'api');
  } else if (!apiUuidPattern.test(apiJson.uuid)) {
    add('error', 'API 标识只能包含字母、数字、下划线和连字符，长度 1-128。', 'api');
  }

  if (isFragmentApiJson(apiJson)) {
    if ('method' in apiJson || 'request' in apiJson) {
      add('error', 'Fragment DSL 不能包含 method 或 request。', 'api');
    }
    validateDeclarations(apiJson.params ?? [], 'params', add);
  } else {
    if (!methods.has(String(apiJson.method).toUpperCase())) {
      add('error', '请求方法必须是 GET 或 POST。', 'api');
    }
    if ('params' in apiJson) {
      add('error', '普通 API DSL 不能包含 params。', 'api');
    }
    for (const location of ['header', 'query', 'body'] as const) {
      validateDeclarations(apiJson.request?.[location] ?? [], location, add);
    }
  }

  const blockUuids = new Set<string>();
  const executableUuids = new Set<string>();
  const nodeUuids = new Set<string>();
  let starterCount = 0;

  for (const block of apiJson.blocks ?? []) {
    const target = `block:${block.uuid}` as const;
    if (!block.uuid?.trim()) {
      add('error', 'Block UUID 不能为空。', target);
    }
    if (blockUuids.has(block.uuid) || nodeUuids.has(block.uuid)) {
      add('error', `Block UUID ${block.uuid} 重复。`, target);
    }
    blockUuids.add(block.uuid);

    if (isStarterBlock(block)) {
      starterCount += 1;
      continue;
    }

    executableUuids.add(block.uuid);

    if (isControllerBlock(block)) {
      for (const node of block.nodes) {
        const nodeTarget = `block:${block.uuid}` as const;
        if (!node.uuid?.trim()) {
          add('error', 'Controller node UUID 不能为空。', nodeTarget);
        }
        if (blockUuids.has(node.uuid) || nodeUuids.has(node.uuid)) {
          add('error', `UUID ${node.uuid} 重复。`, nodeTarget);
        }
        nodeUuids.add(node.uuid);
      }
      continue;
    }
  }

  if (starterCount !== 1) {
    add('error', 'API JSON 必须且只能配置一个 uuid 为 starter 的 Starter Block。', 'api');
  }

  for (const block of apiJson.blocks ?? []) {
    const target = `block:${block.uuid}` as const;

    if (isStarterBlock(block)) {
      validateNextBlock(block.uuid, block.nextBlock, executableUuids, nodeUuids, add, target);
      continue;
    }

    if (isControllerBlock(block)) {
      if (Object.prototype.hasOwnProperty.call(block, 'nextBlock')) {
        add('error', 'Controller 不能配置 nextBlock，请通过 node.nextBlock 连线。', target);
      }
      validateController(block.functionName, block.inputs ?? {}, block.nodes, add, target);
      for (const node of block.nodes) {
        validateNextBlock(node.uuid, node.nextBlock, executableUuids, nodeUuids, add, target);
      }
      continue;
    }

    validateNextBlock(block.uuid, block.nextBlock, executableUuids, nodeUuids, add, target);
    if (Object.prototype.hasOwnProperty.call(block, 'errorNextBlock')) {
      validateNextBlock(block.uuid, block.errorNextBlock, executableUuids, nodeUuids, add, target, 'errorNextBlock');
    }
    validateStandardBlock(block, apiJson, add, target);
  }

  validateGraph(apiJson, executableUuids, add);
  validateResponses(apiJson, add);
  validateTemplateReferences(apiJson, add);

  return issues;
}

export function hasBlockingErrors(issues: ValidationIssue[]) {
  return issues.some((issue) => issue.severity === 'error');
}

export function hasDangerWarnings(issues: ValidationIssue[]) {
  return issues.some((issue) => issue.severity === 'warning' && /整张表/.test(issue.message));
}

function validateStandardBlock(
  block: ApiStandardBlock,
  apiJson: ApiJson,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
    const definition = getBlockDefinition(block.functionName);
    if (!definition) {
      add('error', `不支持的 Block 类型：${block.functionName}。`, target);
      return;
    }

    validateOutputs(block.outputs, block.functionName, add, target);

    const inputs = block.inputs ?? {};
    if (block.functionName === 'executeFragment') {
      if (isFragmentApiJson(apiJson)) {
        add('error', 'Fragment V1 不支持嵌套执行 Fragment。', target);
      }
      if (typeof inputs.fragmentUuid !== 'string' || !inputs.fragmentUuid.trim()) {
        add('error', 'ExecuteFragment 必须选择 Fragment。', target);
      } else if (!apiUuidPattern.test(inputs.fragmentUuid) || /\{\{/.test(inputs.fragmentUuid)) {
        add('error', 'ExecuteFragment 的 fragmentUuid 必须是合法的字面量 UUID。', target);
      }
      if (!isRecord(inputs.params)) {
        add('error', 'ExecuteFragment inputs.params 必须是对象。', target);
      }
      const outputKeys = (block.outputs ?? []).map(declarationKey);
      if (outputKeys.length !== 1 || outputKeys[0] !== 'result') {
        add('error', 'ExecuteFragment outputs 必须固定为 ["result"]。', target);
      }
      return;
    }

    if (['list', 'page', 'count', 'read', 'delete', 'create', 'upsert', 'update', 'assertUnique', 'createSchema'].includes(block.functionName)) {
      const datasource = inputs.datasource;
      if (typeof datasource !== 'string' || !datasource.trim()) {
        add('error', '数据库 Block 必须选择数据源。', target);
      } else if (!datasourcePattern.test(datasource)) {
        add('error', '数据源只能包含字母、数字、下划线，且不能以数字开头。', target);
      }
      if (block.functionName !== 'createSchema' && (typeof inputs.table !== 'string' || !inputs.table.trim())) {
        add('error', '数据库 Block 必须填写表名。', target);
      }
    }

    if (block.functionName === 'assertUnique') {
      if (typeof inputs.fieldName !== 'string' || !inputs.fieldName.trim()) {
        add('error', '唯一性校验必须配置 fieldName。', target);
      }
      if (!Object.prototype.hasOwnProperty.call(inputs, 'value')) {
        add('error', '唯一性校验必须配置 value。', target);
      }
    }

    if (block.functionName === 'createSchema' && !Object.prototype.hasOwnProperty.call(inputs, 'schema')) {
      add('error', '创建 Schema 必须配置 schema。', target);
    }

    if (block.functionName === 'randomId') {
      if (inputs.prefix !== undefined && typeof inputs.prefix !== 'string') {
        add('error', 'randomId prefix 必须是字符串。', target);
      }
      if (inputs.length !== undefined && (
        typeof inputs.length !== 'number'
        || !Number.isInteger(inputs.length)
        || inputs.length < 1
        || inputs.length > 32
      )) {
        add('error', 'randomId length 必须是 1 到 32 的整数。', target);
      }
      if (inputs.alphabet !== undefined && (typeof inputs.alphabet !== 'string' || !inputs.alphabet.length)) {
        add('error', 'randomId alphabet 必须是非空字符串。', target);
      }
      if (inputs.lowerCase !== undefined && typeof inputs.lowerCase !== 'boolean') {
        add('error', 'randomId lowerCase 必须是 boolean。', target);
      }
    }

    if (['list', 'page', 'read'].includes(block.functionName)) {
      if (!Array.isArray(inputs.fields) || !inputs.fields.length) {
        add('error', '查询字段不能为空。', target);
      }
    }

    if (block.functionName === 'create' || block.functionName === 'upsert') {
      if (typeof inputs.idField !== 'string' || !inputs.idField.trim()) {
        add('error', '写入数据必须配置唯一 ID 字段。', target);
      }
      if (!isNonEmptyRecord(inputs.fields)) {
        add('error', '写入字段不能为空。', target);
      }
      if (block.functionName === 'upsert' && isNonEmptyRecord(inputs.fields) && typeof inputs.idField === 'string' && !Object.prototype.hasOwnProperty.call(inputs.fields, inputs.idField)) {
        add('error', 'Upsert 字段必须包含唯一 ID 字段。', target);
      }
    }

    if (block.functionName === 'update') {
      if (!isNonEmptyRecord(inputs.fields)) {
        add('error', '更新字段不能为空。', target);
      }
      if (!Array.isArray(inputs.conditions) || !inputs.conditions.length) {
        add('warning', '更新没有条件，会更新整张表，发布前需要二次确认。', target);
      }
    }

    if (block.functionName === 'delete' && (!Array.isArray(inputs.conditions) || !inputs.conditions.length)) {
      add('warning', '删除没有条件，会删除整张表数据，发布前需要二次确认。', target);
    }

    if (['list', 'page', 'count', 'read', 'delete', 'update'].includes(block.functionName)) {
      validateConditions(inputs.conditions, add, target);
    }

    if (['list', 'page'].includes(block.functionName)) {
      validateOrderBy(inputs.orderBy, add, target);
    }

    if (['addSession', 'removeSession', 'readSession'].includes(block.functionName)) {
      if (typeof inputs.key !== 'string' || !inputs.key.trim()) {
        add('error', 'Session key 不能为空。', target);
      }
    }
    if (block.functionName === 'addSession' && !Object.prototype.hasOwnProperty.call(inputs, 'value')) {
      add('error', '写入 Session 必须配置 value。', target);
    }
}

function validateDeclarations(
  declarations: ProcessableKey[],
  location: string,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void
) {
  const seen = new Set<string>();

  declarations.forEach((declaration, index) => {
    const key = declarationKey(declaration);
    if (!key.trim()) {
      add('error', `${location} 第 ${index + 1} 个参数名不能为空。`, 'request');
    }
    if (seen.has(key)) {
      add('error', `${location}.${key} 重复声明。`, 'request');
    }
    seen.add(key);
    validateProcessors(typeof declaration === 'string' ? [] : declaration.processors ?? [], add, 'request');
  });
}

function validateNextBlock(
  sourceUuid: string,
  nextBlock: string | null | undefined,
  executableUuids: Set<string>,
  nodeUuids: Set<string>,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target'],
  fieldName = 'nextBlock'
) {
  if (nextBlock === undefined) {
    add('error', `${sourceUuid}.${fieldName} 缺失。`, target);
    return;
  }
  if (nextBlock === null) return;
  if (!nextBlock.trim()) {
    add('error', `${sourceUuid}.${fieldName} 不能为空字符串。`, target);
    return;
  }
  if (nextBlock === 'starter') {
    add('error', `${sourceUuid}.${fieldName} 不能指向 starter。`, target);
    return;
  }
  if (nodeUuids.has(nextBlock)) {
    add('error', `${sourceUuid}.${fieldName} 不能指向 Controller node：${nextBlock}。`, target);
    return;
  }
  if (!executableUuids.has(nextBlock)) {
    add('error', `${sourceUuid}.${fieldName} 指向不存在的 block：${nextBlock}。`, target);
  }
}

function validateController(
  functionName: string,
  inputs: Record<string, unknown>,
  nodes: ControllerNode[],
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (functionName !== 'if_controller' && functionName !== 'switch_controller') {
    add('error', `不支持的 Controller 类型：${functionName}。`, target);
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(inputs, 'value')) {
    add('error', 'Controller inputs.value 不能为空。', target);
  }

  if (!nodes.length) {
    add('error', 'Controller nodes 不能为空。', target);
    return;
  }

  if (functionName === 'if_controller') {
    const trueNodes = nodes.filter((node) => node.value === true);
    const falseNodes = nodes.filter((node) => node.value === false);
    const unsupportedNodes = nodes.filter((node) => node.type === 'DEFAULT' || typeof node.value !== 'boolean');
    if (trueNodes.length !== 1 || falseNodes.length !== 1 || unsupportedNodes.length > 0) {
      add('error', 'if_controller 必须且只能配置一个 value=true node 和一个 value=false node。', target);
    }
    return;
  }

  const dataType = inputs.dataType;
  if (dataType !== 'string' && dataType !== 'number' && dataType !== 'boolean') {
    add('error', 'switch_controller inputs.dataType 必须是 string、number 或 boolean。', target);
  }

  const defaultNodes = nodes.filter((node) => node.type === 'DEFAULT');
  if (defaultNodes.length > 1) {
    add('error', 'switch_controller 只能配置一个 DEFAULT node。', target);
  }

  const expectedType = typeof dataType === 'string' ? dataType : '';
  for (const node of nodes.filter((item) => item.type !== 'DEFAULT')) {
    if (expectedType && typeof node.value !== expectedType) {
      add('error', `switch_controller 普通 node.value 必须是 ${expectedType} 类型。`, target);
    }
  }
}

function validateGraph(
  apiJson: ApiJson,
  executableUuids: Set<string>,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void
) {
  const blocks = apiJson.blocks ?? [];
  const starter = blocks.find(isStarterBlock);
  if (!starter || starter.nextBlock === undefined) return;

  const blockMap = new Map(blocks.filter((block) => !isStarterBlock(block)).map((block) => [block.uuid, block]));
  const reached = new Set<string>();
  walkBranch(starter.nextBlock, blockMap, reached, new Set(), add);

  for (const uuid of executableUuids) {
    if (!reached.has(uuid)) {
      add('error', `节点 ${uuid} 未从 starter 流程到达。`, `block:${uuid}`);
    }
  }
}

function walkBranch(
  nextBlock: string | null | undefined,
  blockMap: Map<string, Exclude<ApiJson['blocks'], undefined>[number]>,
  reached: Set<string>,
  path: Set<string>,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void
) {
  if (nextBlock === null || nextBlock === undefined) return;

  if (path.has(nextBlock)) {
    add('error', `API JSON 流程存在循环：${nextBlock}。`, `block:${nextBlock}`);
    return;
  }

  if (reached.has(nextBlock)) {
    return;
  }

  reached.add(nextBlock);
  const block = blockMap.get(nextBlock);
  if (!block) return;

  const nextPath = new Set(path);
  nextPath.add(nextBlock);

  if (isControllerBlock(block)) {
    for (const node of block.nodes) {
      walkBranch(node.nextBlock, blockMap, reached, nextPath, add);
    }
    return;
  }

  if (isStandardBlock(block)) {
    walkBranch(block.nextBlock, blockMap, reached, nextPath, add);
    if (Object.prototype.hasOwnProperty.call(block, 'errorNextBlock')) {
      walkBranch(block.errorNextBlock, blockMap, reached, nextPath, add);
    }
  }
}

function validateOutputs(
  outputs: ProcessableKey[] | null | undefined,
  functionName: string,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (!outputs) return;
  const allowed = supportedOutputKeys(functionName);
  for (const output of outputs) {
    const key = declarationKey(output);
    if (!allowed.includes(key)) {
      add('error', `${functionName} 不支持输出 ${key}。`, target);
    }
    if (typeof output !== 'string') {
      validateProcessors(output.processors ?? [], add, target);
    }
  }
}

function validateResponses(
  apiJson: ApiJson,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void
) {
  if (isFragmentApiJson(apiJson)) {
    const responseValues = [
      ...(Object.prototype.hasOwnProperty.call(apiJson, 'response') ? [apiJson.response] : []),
      ...Object.values(apiJson.responses ?? {})
    ];
    if (!responseValues.length) {
      add('error', 'Fragment 必须配置 outputs（response 或 responses）。', 'response');
    }
    for (const response of responseValues) {
      if (!isNonEmptyRecord(response)) {
        add('error', 'Fragment outputs 必须是非空对象。', 'response');
      } else if (Object.prototype.hasOwnProperty.call(response, 'redirect')) {
        add('error', 'Fragment outputs 不能包含顶层 redirect。', 'response');
      }
    }
    const responseKeySets = responseValues
      .filter(isNonEmptyRecord)
      .map((response) => Object.keys(response as Record<string, unknown>).sort().join('\u0000'));
    if (new Set(responseKeySets).size > 1) {
      add('error', 'Fragment 的所有终点必须返回相同的顶层 output keys。', 'response');
    }
  }

  if (!apiJson.responses) return;

  const terminals = collectResponseTerminals(apiJson);
  const terminalUuids = new Set(terminals.map((terminal) => terminal.uuid));
  const responseUuids = new Set(Object.keys(apiJson.responses));

  for (const responseUuid of responseUuids) {
    if (!terminalUuids.has(responseUuid)) {
      add('error', `responses.${responseUuid} 必须对应一个成功或错误终点。`, 'response');
    }
  }

  if (hasDefaultResponse(apiJson)) return;

  for (const terminal of terminals) {
    if (!responseUuids.has(terminal.uuid)) {
      add('error', `responses 缺少终点 ${terminal.label} (${terminal.uuid}) 的响应配置。`, 'response');
    }
  }
}

function validateProcessors(
  processors: ProcessorConfig[],
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  for (const processor of processors) {
    const name = processorName(processor);
    if (!processorNames.has(name)) {
      add('error', `不支持的处理规则：${name}。`, target);
    }
  }
}

function validateConditions(
  value: unknown,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    add('error', 'conditions 必须是数组。', target);
    return;
  }
  for (const condition of value) {
    validateCondition(condition, add, target);
  }
}

function validateCondition(
  value: unknown,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (!isRecord(value)) {
    add('error', '条件必须是对象。', target);
    return;
  }
  if (value.group === true) {
    if (value.groupType !== 'AND' && value.groupType !== 'OR') {
      add('error', '条件组必须选择 AND 或 OR。', target);
    }
    if (!Array.isArray(value.groups) || !value.groups.length) {
      add('error', '条件组不能为空。', target);
      return;
    }
    value.groups.forEach((item) => validateCondition(item, add, target));
    return;
  }
  if (value.group !== false) {
    add('error', '普通条件 group 必须为 false。', target);
  }
  if (typeof value.fieldName !== 'string' || !value.fieldName.trim()) {
    add('error', '条件字段不能为空。', target);
  }
  if (!conditionTypes.has(String(value.conditionType))) {
    add('error', '条件类型无效。', target);
  }
  if (!Object.prototype.hasOwnProperty.call(value, 'fieldValue')) {
    add('error', '条件值不能为空。', target);
  }
  if ((value.conditionType === 'IN' || value.conditionType === 'NOTIN') && (!Array.isArray(value.fieldValue) || !value.fieldValue.length)) {
    add('error', 'IN / NOTIN 的条件值必须是非空数组。', target);
  }
}

function validateOrderBy(
  value: unknown,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    add('error', 'orderBy 必须是数组。', target);
    return;
  }
  for (const item of value) {
    if (!isRecord(item) || typeof item.fieldName !== 'string' || !item.fieldName.trim()) {
      add('error', '排序字段不能为空。', target);
      continue;
    }
    if (item.direction !== undefined && item.direction !== 'ASC' && item.direction !== 'DESC') {
      add('error', '排序方向只能是 ASC 或 DESC。', target);
    }
  }
}

function validateTemplateReferences(
  apiJson: ApiJson,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void
) {
  const fragment = isFragmentApiJson(apiJson);
  const requestKeys = fragment
    ? { header: new Set<string>(), query: new Set<string>(), body: new Set<string>() }
    : {
        header: new Set((apiJson.request?.header ?? []).map(declarationKey)),
        query: new Set((apiJson.request?.query ?? []).map(declarationKey)),
        body: new Set((apiJson.request?.body ?? []).map(declarationKey))
      };
  const paramKeys = new Set(fragment ? (apiJson.params ?? []).map(declarationKey) : []);
  const blockOutputs = new Map<string, Set<string>>();
  for (const block of apiJson.blocks ?? []) {
    if (!isStandardBlock(block)) {
      continue;
    }
    blockOutputs.set(block.uuid, new Set((block.outputs ?? supportedOutputKeys(block.functionName)).map(declarationKey)));
  }

  const templates = collectTemplates(apiJson);
  for (const template of templates) {
    for (const path of extractTemplatePaths(template.value)) {
      const requestMatch = path.match(/^(request\.)?(header|query|body)\.([A-Za-z0-9_.$[\]'-]+)/);
      if (requestMatch) {
        if (fragment) {
          add('error', `Fragment 不能引用 request 变量：${path}。`, template.target);
          continue;
        }
        const location = requestMatch[2] as keyof typeof requestKeys;
        const key = requestMatch[3].split(/[.[\]]/)[0];
        if (!requestKeys[location].has(key)) {
          add('warning', `变量 ${path} 未在 request 中声明。`, template.target);
        }
      }

      const paramsMatch = path.match(/^params\.([A-Za-z0-9_]+)/);
      if (paramsMatch) {
        if (!fragment) {
          add('error', `普通 API 不能引用 params 变量：${path}。`, template.target);
        } else if (!paramKeys.has(paramsMatch[1])) {
          add('error', `变量 ${path} 未在 params 中声明。`, template.target);
        }
      }

      const blockMatch = path.match(/^blocks\['([^']+)'\]\.outputs\.([A-Za-z0-9_]+)/);
      if (blockMatch) {
        const [, uuid, output] = blockMatch;
        const outputs = blockOutputs.get(uuid);
        if (!outputs) {
          add('warning', `变量引用了不存在的步骤：${uuid}。`, template.target);
        } else if (!outputs.has(output)) {
          add('warning', `步骤 ${uuid} 不声明输出 ${output}。`, template.target);
        }
      }
    }
  }
}

function collectTemplates(value: unknown, target: ValidationIssue['target'] = 'response') {
  const result: Array<{ value: string; target: ValidationIssue['target'] }> = [];
  const visit = (item: unknown, currentTarget: ValidationIssue['target']) => {
    if (isRecord(item) && typeof item.template === 'string') {
      result.push({ value: item.template, target: currentTarget });
      return;
    }
    if (Array.isArray(item)) {
      item.forEach((child) => visit(child, currentTarget));
      return;
    }
    if (isRecord(item)) {
      for (const child of Object.values(item)) {
        visit(child, currentTarget);
      }
    }
  };

  visit(value, target);
  return result;
}

function extractTemplatePaths(template: string) {
  return Array.from(template.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g), (match) => match[1].trim());
}

function isNonEmptyRecord(value: unknown) {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
