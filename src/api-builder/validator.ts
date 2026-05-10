import Ajv from 'ajv';
import type { ApiJson, BuilderValidationIssue } from './types';
import { blockDefinitionOf } from './registries';

const apiJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['uuid', 'method'],
  properties: {
    uuid: { type: 'string', minLength: 1, pattern: '^[A-Za-z0-9_-]{1,128}$' },
    alias: { type: 'string' },
    method: { type: 'string', minLength: 1 },
    request: {
      type: 'object',
      additionalProperties: false,
      properties: {
        header: { type: 'array' },
        query: { type: 'array' },
        body: { type: 'array' }
      }
    },
    blocks: { type: 'array' },
    response: {
      anyOf: [
        { type: 'object' },
        { type: 'null' }
      ]
    }
  }
};

const ajv = new Ajv({ allErrors: true });
const validateBaseSchema = ajv.compile(apiJsonSchema);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateApiJson(apiJson: ApiJson): BuilderValidationIssue[] {
  const issues: BuilderValidationIssue[] = [];
  const validBase = validateBaseSchema(apiJson);

  if (!validBase) {
    for (const error of validateBaseSchema.errors ?? []) {
      issues.push({
        path: error.instancePath || '/',
        message: error.message ?? 'JSON 结构不符合规范。',
        level: 'error'
      });
    }
  }

  if (!['GET', 'POST'].includes(apiJson.method.toUpperCase())) {
    issues.push({ path: 'method', message: 'MVP 只支持 GET 或 POST。', level: 'error' });
  }

  (apiJson.blocks ?? []).forEach((block, index) => {
    const path = `blocks.${index}`;
    const definition = blockDefinitionOf(block.functionName);

    if (!block.uuid.trim()) {
      issues.push({ path: `${path}.uuid`, message: 'Block UUID 不能为空。', level: 'error' });
    }

    if (!definition) {
      issues.push({ path: `${path}.functionName`, message: `不支持的 block：${block.functionName}`, level: 'error' });
      return;
    }

    const inputs = isRecord(block.inputs) ? block.inputs : {};

    if (['list', 'page', 'read', 'count', 'create', 'update', 'delete'].includes(block.functionName)) {
      if (!isNonEmptyString(inputs.datasource)) {
        issues.push({ path: `${path}.inputs.datasource`, message: '数据源不能为空。', level: 'error' });
      }

      if (!isNonEmptyString(inputs.table)) {
        issues.push({ path: `${path}.inputs.table`, message: '表名不能为空。', level: 'error' });
      }
    }

    if (['list', 'page', 'read'].includes(block.functionName) && (!Array.isArray(inputs.fields) || inputs.fields.length === 0)) {
      issues.push({ path: `${path}.inputs.fields`, message: '查询字段不能为空。', level: 'error' });
    }

    if (['create', 'update'].includes(block.functionName) && (!isRecord(inputs.fields) || Object.keys(inputs.fields).length === 0)) {
      issues.push({ path: `${path}.inputs.fields`, message: '写入字段不能为空。', level: 'error' });
    }

    if (block.functionName === 'create' && !isNonEmptyString(inputs.idField)) {
      issues.push({ path: `${path}.inputs.idField`, message: '创建 block 必须配置返回 ID 字段。', level: 'error' });
    }

    if ((block.functionName === 'update' || block.functionName === 'delete') && (!Array.isArray(inputs.conditions) || inputs.conditions.length === 0)) {
      issues.push({ path: `${path}.inputs.conditions`, message: '无条件写操作会影响整张表。', level: 'warning' });
    }

    const declaredOutputs = block.outputs ?? [];
    for (const output of declaredOutputs) {
      const key = typeof output === 'string' ? output : output.key;
      if (!definition.outputs.includes(key)) {
        issues.push({ path: `${path}.outputs`, message: `${definition.label} 不支持输出 ${key}。`, level: 'error' });
      }
    }
  });

  return issues;
}

export function hasBlockingIssues(issues: BuilderValidationIssue[]) {
  return issues.some((issue) => issue.level === 'error');
}

export function hasDangerousIssues(issues: BuilderValidationIssue[]) {
  return issues.some((issue) => issue.level === 'warning' && issue.message.includes('整张表'));
}
