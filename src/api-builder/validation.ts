import {
  declarationKey,
  getBlockDefinition,
  processorName,
  supportedOutputKeys
} from '@/api-builder/registry';
import type {
  ApiJson,
  Condition,
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

  if (!methods.has(String(apiJson.method).toUpperCase())) {
    add('error', '请求方法必须是 GET 或 POST。', 'api');
  }

  for (const location of ['header', 'query', 'body'] as const) {
    const declarations = apiJson.request?.[location] ?? [];
    const seen = new Set<string>();

    declarations.forEach((declaration, index) => {
      const key = declarationKey(declaration);
      if (!key.trim()) {
        add('error', `${location} 第 ${index + 1} 个参数名不能为空。`, 'request');
      }
      if (seen.has(key)) {
        add('warning', `${location}.${key} 重复声明，建议只保留一个。`, 'request');
      }
      seen.add(key);
      validateProcessors(typeof declaration === 'string' ? [] : declaration.processors ?? [], add, 'request');
    });
  }

  const blockUuids = new Set<string>();
  for (const block of apiJson.blocks ?? []) {
    const target = `block:${block.uuid}` as const;
    if (!block.uuid?.trim()) {
      add('error', 'Block UUID 不能为空。', target);
    }
    if (blockUuids.has(block.uuid)) {
      add('error', `Block UUID ${block.uuid} 重复。`, target);
    }
    blockUuids.add(block.uuid);

    const definition = getBlockDefinition(block.functionName);
    if (!definition) {
      add('error', `不支持的 Block 类型：${block.functionName}。`, target);
      continue;
    }

    validateOutputs(block.outputs, block.functionName, add, target);

    const inputs = block.inputs ?? {};
    if (['list', 'page', 'count', 'read', 'delete', 'create', 'update'].includes(block.functionName)) {
      const datasource = inputs.datasource;
      if (typeof datasource !== 'string' || !datasource.trim()) {
        add('error', '数据库 Block 必须选择数据源。', target);
      } else if (!datasourcePattern.test(datasource)) {
        add('error', '数据源只能包含字母、数字、下划线，且不能以数字开头。', target);
      }
      if (typeof inputs.table !== 'string' || !inputs.table.trim()) {
        add('error', '数据库 Block 必须填写表名。', target);
      }
    }

    if (['list', 'page', 'read'].includes(block.functionName)) {
      if (!Array.isArray(inputs.fields) || !inputs.fields.length) {
        add('error', '查询字段不能为空。', target);
      }
    }

    if (block.functionName === 'create') {
      if (typeof inputs.idField !== 'string' || !inputs.idField.trim()) {
        add('error', '创建数据必须配置返回 ID 字段。', target);
      }
      if (!isNonEmptyRecord(inputs.fields)) {
        add('error', '创建字段不能为空。', target);
      }
    }

    if (block.functionName === 'update') {
      if (!isNonEmptyRecord(inputs.fields)) {
        add('error', '更新字段不能为空。', target);
      }
      if (!Array.isArray(inputs.conditions) || !inputs.conditions.length) {
        add('warning', '更新没有条件，会更新整张表，本地发布前需要二次确认。', target);
      }
    }

    if (block.functionName === 'delete' && (!Array.isArray(inputs.conditions) || !inputs.conditions.length)) {
      add('warning', '删除没有条件，会删除整张表数据，本地发布前需要二次确认。', target);
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

  validateTemplateReferences(apiJson, add);

  return issues;
}

export function hasBlockingErrors(issues: ValidationIssue[]) {
  return issues.some((issue) => issue.severity === 'error');
}

export function hasDangerWarnings(issues: ValidationIssue[]) {
  return issues.some((issue) => issue.severity === 'warning' && /整张表/.test(issue.message));
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
  const requestKeys = {
    header: new Set((apiJson.request?.header ?? []).map(declarationKey)),
    query: new Set((apiJson.request?.query ?? []).map(declarationKey)),
    body: new Set((apiJson.request?.body ?? []).map(declarationKey))
  };
  const blockOutputs = new Map<string, Set<string>>();
  for (const block of apiJson.blocks ?? []) {
    blockOutputs.set(block.uuid, new Set((block.outputs ?? supportedOutputKeys(block.functionName)).map(declarationKey)));
  }

  const templates = collectTemplates(apiJson);
  for (const template of templates) {
    for (const path of extractTemplatePaths(template.value)) {
      const requestMatch = path.match(/^(request\.)?(header|query|body)\.([A-Za-z0-9_.$[\]'-]+)/);
      if (requestMatch) {
        const location = requestMatch[2] as keyof typeof requestKeys;
        const key = requestMatch[3].split(/[.[\]]/)[0];
        if (!requestKeys[location].has(key)) {
          add('warning', `变量 ${path} 未在 request 中声明。`, template.target);
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
