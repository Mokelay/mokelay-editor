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
const cascadeConfigKeyPattern = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const methods = new Set(['GET', 'POST']);
const conditionTypes = new Set(['GE', 'GT', 'LE', 'LT', 'NEQ', 'EQ', 'NOTIN', 'IN', 'LIKE']);
const processorNames = new Set([
  'trim',
  'is_not_null',
  'is_null',
  'not_null',
  'email_check',
  'number_check',
  'eq',
  'equals',
  'default_value',
  'env_value',
  'api_json_when_published',
  'boolean_value',
  'min',
  'max',
  'regex',
  'string_array_check',
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

    if (['list', 'page', 'count', 'read', 'delete', 'create', 'upsert', 'update', 'assertUnique', 'createSchema', 'cascadeDelete', 'dropSchemas'].includes(block.functionName)) {
      const datasource = inputs.datasource;
      if (typeof datasource !== 'string' || !datasource.trim()) {
        add('error', '数据库 Block 必须选择数据源。', target);
      } else if (!datasourcePattern.test(datasource)) {
        add('error', '数据源只能包含字母、数字、下划线，且不能以数字开头。', target);
      }
      if (!['createSchema', 'cascadeDelete', 'dropSchemas'].includes(block.functionName) && (typeof inputs.table !== 'string' || !inputs.table.trim())) {
        add('error', '数据库 Block 必须填写表名。', target);
      }
    }

    if (block.functionName === 'cascadeDelete') {
      validateCascadeDelete(inputs, add, target);
    }

    if (block.functionName === 'dropSchemas') {
      validateDropSchemas(inputs, add, target);
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
  processors: unknown,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (!Array.isArray(processors)) {
    add('error', 'processors 必须是数组。', target);
    return;
  }

  for (const processor of processors) {
    if (
      (typeof processor !== 'string' || !processor.trim())
      && (!isRecord(processor) || typeof processor.processor !== 'string' || !processor.processor.trim())
    ) {
      add('error', '处理规则必须是非空字符串或包含 processor 的对象。', target);
      continue;
    }

    const name = processorName(processor as ProcessorConfig);
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

function validateCascadeDelete(
  inputs: Record<string, unknown>,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  const root = inputs.root;
  if (!isRecord(root)) {
    add('error', '级联删除必须配置 root 对象。', target);
    return;
  }

  validateCascadeNodeIdentity(root, 'root', add, target);
  if (!Array.isArray(root.conditions) || !cascadeConditionsProduceScope(root.conditions)) {
    add('error', '级联删除 root.conditions 必须至少生成一个有效条件，避免误删整张表。', target);
  }
  validateConditions(root.conditions, add, target);
  validateCascadeConditionComplexity(root.conditions, 'root', add, target);

  const rootId = readNonemptyString(root.id);
  const nodeIds = new Set<string>();
  if (rootId) nodeIds.add(rootId);
  const tables: string[] = [];
  const rootTable = readNonemptyString(root.table);
  if (rootTable) tables.push(rootTable);

  const relations = inputs.relations ?? [];
  if (!Array.isArray(relations)) {
    add('error', '级联删除 relations 必须是数组。', target);
  } else {
    if (relations.length + 1 > 32) {
      add('error', '级联删除关系图最多允许 32 个节点（包含 root）。', target);
    }
    for (const [index, relation] of relations.entries()) {
      if (!isRecord(relation)) {
        add('error', `级联删除 relation #${index + 1} 必须是对象。`, target);
        continue;
      }
      validateCascadeNodeIdentity(relation, `relation #${index + 1}`, add, target);
      const relationId = readNonemptyString(relation.id);
      if (relationId && nodeIds.has(relationId)) {
        add('error', `级联删除节点 ID ${relationId} 重复。`, target);
      }
      if (relationId) nodeIds.add(relationId);
      const table = readNonemptyString(relation.table);
      if (table && tables.some((existingTable) => cascadeTablesOverlap(existingTable, table))) {
        add('error', `级联删除 table ${table} 重复配置。`, target);
      }
      if (table) tables.push(table);
      if (!readNonemptyString(relation.parent)) {
        add('error', `级联删除 relation #${index + 1} 必须配置 parent。`, target);
      } else if (!cascadeConfigKeyPattern.test(readNonemptyString(relation.parent)!)) {
        add('error', `级联删除 relation #${index + 1} parent 格式无效。`, target);
      }
      validateCascadeSqlName(relation.foreignKey, `relation #${index + 1} foreignKey`, false, add, target);
      validateConditions(relation.conditions, add, target);
      validateCascadeConditionComplexity(relation.conditions, `relation #${index + 1}`, add, target);
    }

    for (const [index, relation] of relations.entries()) {
      if (!isRecord(relation)) continue;
      const parent = readNonemptyString(relation.parent);
      if (parent && !nodeIds.has(parent)) {
        add('error', `级联删除 relation #${index + 1} 引用了不存在的 parent：${parent}。`, target);
      }
      if (parent && parent === readNonemptyString(relation.id)) {
        add('error', `级联删除 relation #${index + 1} 不能引用自身作为 parent。`, target);
      }
    }
    validateCascadeRelationCycles(relations, add, target);
    validateCascadeRelationDepth(rootId, relations, add, target);
  }

  const collect = inputs.collect ?? [];
  if (!Array.isArray(collect)) {
    add('error', '级联删除 collect 必须是数组。', target);
  } else {
    if (collect.length > 16) {
      add('error', '级联删除 collect 最多允许配置 16 项。', target);
    }
    const collectKeys = new Set<string>();
    for (const [index, item] of collect.entries()) {
      if (!isRecord(item)) {
        add('error', `级联删除 collect #${index + 1} 必须是对象。`, target);
        continue;
      }
      const key = readNonemptyString(item.key);
      if (!key) {
        add('error', `级联删除 collect #${index + 1} 必须配置 key。`, target);
      } else {
        if (!cascadeConfigKeyPattern.test(key)) {
          add('error', `级联删除 collect key ${key} 格式无效。`, target);
        }
        if (collectKeys.has(key)) {
          add('error', `级联删除 collect key ${key} 重复。`, target);
        }
        collectKeys.add(key);
      }
      const node = readNonemptyString(item.node);
      if (!node) {
        add('error', `级联删除 collect #${index + 1} 必须配置 node。`, target);
      } else if (!cascadeConfigKeyPattern.test(node)) {
        add('error', `级联删除 collect #${index + 1} node 格式无效。`, target);
      } else if (!nodeIds.has(node)) {
        add('error', `级联删除 collect #${index + 1} 引用了不存在的 node：${node}。`, target);
      }
      if (item.mode !== 'values' && item.mode !== 'rows') {
        add('error', `级联删除 collect #${index + 1} mode 只能是 values 或 rows。`, target);
      }
      if (!Array.isArray(item.fields) || item.fields.length === 0) {
        add('error', `级联删除 collect #${index + 1} fields 不能为空。`, target);
      } else {
        if (item.fields.length > 32) {
          add('error', `级联删除 collect #${index + 1} fields 最多允许 32 项。`, target);
        }
        validateCascadeCollectFields(item.fields, index, add, target);
        if (item.mode === 'values' && item.fields.length !== 1) {
          add('error', `级联删除 collect #${index + 1} 使用 values 模式时必须且只能配置一个 field。`, target);
        }
      }
      if (item.distinct !== undefined && typeof item.distinct !== 'boolean') {
        add('error', `级联删除 collect #${index + 1} distinct 必须是 boolean。`, target);
      }
      validateOrderBy(item.orderBy, add, target);
      if (Array.isArray(item.orderBy)) {
        for (const [orderIndex, order] of item.orderBy.entries()) {
          if (isRecord(order)) {
            validateCascadeSqlName(order.fieldName, `collect #${index + 1} orderBy #${orderIndex + 1} fieldName`, false, add, target);
          }
        }
      }
    }
  }

  const limits = inputs.limits;
  if (limits === undefined) return;
  if (!isRecord(limits)) {
    add('error', '级联删除 limits 必须是对象。', target);
    return;
  }
  if (Object.prototype.hasOwnProperty.call(limits, 'maxRootRows')) {
    validateCascadeLimit(limits.maxRootRows, 'maxRootRows', 10000, add, target);
  }
  if (Object.prototype.hasOwnProperty.call(limits, 'maxAffectedRows')) {
    validateCascadeLimit(limits.maxAffectedRows, 'maxAffectedRows', 1000000, add, target);
  }
  if (Object.prototype.hasOwnProperty.call(limits, 'maxCollectedRows')) {
    validateCascadeLimit(limits.maxCollectedRows, 'maxCollectedRows', 100000, add, target);
  }
}

function validateCascadeNodeIdentity(
  node: Record<string, unknown>,
  label: string,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  const id = readNonemptyString(node.id);
  if (!id) {
    add('error', `级联删除 ${label} 必须配置 id。`, target);
  } else if (!cascadeConfigKeyPattern.test(id)) {
    add('error', `级联删除 ${label} id 格式无效。`, target);
  }
  validateCascadeSqlName(node.table, `${label} table`, true, add, target);
  validateCascadeSqlName(node.keyField, `${label} keyField`, false, add, target);
}

function validateCascadeCollectFields(
  fields: unknown[],
  collectIndex: number,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  const seen = new Set<string>();
  for (const [fieldIndex, field] of fields.entries()) {
    if (typeof field !== 'string' && !isRecord(field)) {
      add('error', `级联删除 collect #${collectIndex + 1} field #${fieldIndex + 1} 格式无效。`, target);
      continue;
    }
    const key = typeof field === 'string' ? field : readNonemptyString(field.key) ?? '';
    if (!key.trim()) {
      add('error', `级联删除 collect #${collectIndex + 1} field #${fieldIndex + 1} 不能为空。`, target);
    } else if (!isCascadeSqlName(key, false)) {
      add('error', `级联删除 collect #${collectIndex + 1} field ${key} 必须是单字段 SQL 标识符。`, target);
    }
    if (seen.has(key)) {
      add('error', `级联删除 collect #${collectIndex + 1} field ${key} 重复。`, target);
    }
    seen.add(key);
    if (isRecord(field)) {
      const processors = field.processors;
      if (processors !== undefined && !Array.isArray(processors)) {
        add('error', `级联删除 collect #${collectIndex + 1} field ${key} 的 processors 必须是数组。`, target);
      } else {
        validateProcessors((processors ?? []) as ProcessorConfig[], add, target);
      }
    }
  }
}

function validateCascadeRelationCycles(
  relations: unknown[],
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  const parents = new Map<string, string>();
  for (const relation of relations) {
    if (!isRecord(relation)) continue;
    const id = readNonemptyString(relation.id);
    const parent = readNonemptyString(relation.parent);
    if (id && parent) parents.set(id, parent);
  }
  for (const id of parents.keys()) {
    const path = new Set<string>();
    let cursor: string | undefined = id;
    while (cursor && parents.has(cursor)) {
      if (path.has(cursor)) {
        add('error', `级联删除关系图存在循环：${cursor}。`, target);
        return;
      }
      path.add(cursor);
      cursor = parents.get(cursor);
    }
  }
}

function validateCascadeRelationDepth(
  rootId: string | null,
  relations: unknown[],
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (!rootId) return;
  const parents = new Map<string, string>();
  for (const relation of relations) {
    if (!isRecord(relation)) continue;
    const id = readNonemptyString(relation.id);
    const parent = readNonemptyString(relation.parent);
    if (id && parent) parents.set(id, parent);
  }
  for (const id of parents.keys()) {
    let cursor: string | undefined = id;
    let depth = 1;
    const visited = new Set<string>();
    while (cursor && cursor !== rootId && parents.has(cursor) && !visited.has(cursor)) {
      visited.add(cursor);
      cursor = parents.get(cursor);
      depth += 1;
    }
    if (depth > 8) {
      add('error', `级联删除关系图深度不能超过 8（节点 ${id} 当前深度 ${depth}）。`, target);
      return;
    }
  }
}

function validateCascadeConditionComplexity(
  conditions: unknown,
  label: string,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (!Array.isArray(conditions)) return;
  let leaves = 0;
  let maxDepth = conditions.length ? 1 : 0;
  const visit = (condition: unknown, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    if (!isRecord(condition) || condition.group !== true || !Array.isArray(condition.groups)) {
      leaves += 1;
      return;
    }
    for (const child of condition.groups) visit(child, depth + 1);
  };
  for (const condition of conditions) visit(condition, 1);
  if (maxDepth > 8) {
    add('error', `级联删除 ${label} 条件树深度不能超过 8。`, target);
  }
  if (leaves > 100) {
    add('error', `级联删除 ${label} 条件叶子不能超过 100 个。`, target);
  }
}

function cascadeConditionsProduceScope(conditions: unknown[]) {
  const producesScope = (condition: unknown): boolean => {
    if (!isRecord(condition)) return false;
    if (condition.group === true) {
      return Array.isArray(condition.groups) && condition.groups.some(producesScope);
    }
    if (condition.optional === true) {
      const fieldValue = condition.fieldValue;
      if (
        fieldValue === undefined
        || fieldValue === null
        || fieldValue === ''
        || (Array.isArray(fieldValue) && fieldValue.length === 0)
      ) return false;
    }
    return true;
  };
  return conditions.some(producesScope);
}

function validateCascadeSqlName(
  value: unknown,
  label: string,
  allowQualified: boolean,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  if (!isCascadeSqlName(value, allowQualified)) {
    add('error', `级联删除 ${label} 必须是${allowQualified ? '合法' : '单字段'} SQL 标识符。`, target);
  }
}

function isCascadeSqlName(value: unknown, allowQualified: boolean) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const parts = value.trim().split('.');
  return (allowQualified || parts.length === 1) && parts.every((part) => Boolean(part.trim()));
}

function cascadeTablesOverlap(left: string, right: string) {
  const leftParts = left.trim().split('.').map((part) => part.trim().toLowerCase());
  const rightParts = right.trim().split('.').map((part) => part.trim().toLowerCase());

  if (leftParts.join('.') === rightParts.join('.')) return true;
  return leftParts.at(-1) === rightParts.at(-1)
    && (leftParts.length === 1 || rightParts.length === 1);
}

function validateCascadeLimit(
  value: unknown,
  key: string,
  maximum: number,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  const actual = Number(value);
  if (!Number.isSafeInteger(actual) || actual < 0 || actual > maximum) {
    add('error', `级联删除 limits.${key} 必须是 0 到 ${maximum} 的安全整数。`, target);
  }
}

function validateDropSchemas(
  inputs: Record<string, unknown>,
  add: (severity: ValidationIssue['severity'], message: string, target: ValidationIssue['target']) => void,
  target: ValidationIssue['target']
) {
  const schemas = inputs.schemas;
  const isTemplate = isRecord(schemas) && typeof schemas.template === 'string' && schemas.template.trim().length > 0;
  if (!Array.isArray(schemas) && !isTemplate) {
    add('error', '删除 Schemas 的 schemas 必须是数组或模板变量。', target);
  } else if (Array.isArray(schemas)) {
    const seen = new Set<string>();
    for (const [index, schema] of schemas.entries()) {
      const normalizedSchema = typeof schema === 'string' ? schema.trim() : '';
      const lowerSchema = normalizedSchema.toLowerCase();
      if (
        typeof schema !== 'string'
        || !/^[A-Za-z_][A-Za-z0-9_]{0,62}$/.test(normalizedSchema)
        || lowerSchema === 'public'
        || lowerSchema === 'information_schema'
        || lowerSchema.startsWith('pg_')
      ) {
        add('error', `删除 Schemas 的第 ${index + 1} 个 schema 名称格式无效。`, target);
        continue;
      }
      if (seen.has(normalizedSchema)) {
        add('warning', `删除 Schemas 的 schema ${normalizedSchema} 重复，运行时会去重。`, target);
      }
      seen.add(normalizedSchema);
    }
  }
  if (inputs.cascade !== undefined && typeof inputs.cascade !== 'boolean') {
    add('error', '删除 Schemas 的 cascade 必须是 boolean。', target);
  }
}

function readNonemptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
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
