import type { ApiBlock, BlockFunctionName, ProcessorConfig } from './types';

export type BlockDefinition = {
  functionName: BlockFunctionName;
  label: string;
  category: 'query' | 'write' | 'session';
  outputs: string[];
  defaultInputs: () => Record<string, unknown>;
};

export const blockDefinitions: BlockDefinition[] = [
  {
    functionName: 'list',
    label: '列表查询',
    category: 'query',
    outputs: ['datas'],
    defaultInputs: () => ({ datasource: 'Mokelay', table: '', fields: [], conditions: [], orderBy: [] })
  },
  {
    functionName: 'page',
    label: '分页查询',
    category: 'query',
    outputs: ['datas', 'total', 'totalPages', 'page', 'pageSize', 'hasPreviousPage', 'hasNextPage'],
    defaultInputs: () => ({ datasource: 'Mokelay', table: '', fields: [], page: 1, pageSize: 20, conditions: [], orderBy: [] })
  },
  {
    functionName: 'count',
    label: '统计数量',
    category: 'query',
    outputs: ['total'],
    defaultInputs: () => ({ datasource: 'Mokelay', table: '', conditions: [] })
  },
  {
    functionName: 'read',
    label: '读取单条',
    category: 'query',
    outputs: ['data'],
    defaultInputs: () => ({ datasource: 'Mokelay', table: '', fields: [], conditions: [] })
  },
  {
    functionName: 'create',
    label: '创建数据',
    category: 'write',
    outputs: ['uuid'],
    defaultInputs: () => ({ datasource: 'Mokelay', table: '', idField: 'uuid', fields: {} })
  },
  {
    functionName: 'update',
    label: '更新数据',
    category: 'write',
    outputs: ['affected'],
    defaultInputs: () => ({ datasource: 'Mokelay', table: '', fields: {}, conditions: [] })
  },
  {
    functionName: 'delete',
    label: '删除数据',
    category: 'write',
    outputs: ['affected'],
    defaultInputs: () => ({ datasource: 'Mokelay', table: '', conditions: [] })
  },
  {
    functionName: 'addSession',
    label: '写入 Session',
    category: 'session',
    outputs: [],
    defaultInputs: () => ({ key: 'user', value: null })
  },
  {
    functionName: 'readSession',
    label: '读取 Session',
    category: 'session',
    outputs: ['value'],
    defaultInputs: () => ({ key: 'user' })
  },
  {
    functionName: 'removeSession',
    label: '清除 Session',
    category: 'session',
    outputs: [],
    defaultInputs: () => ({ key: 'user' })
  }
];

export const processorDefinitions = [
  { name: 'trim', label: '去除前后空格', needsParam: false },
  { name: 'is_not_null', label: '必填', needsParam: false },
  { name: 'is_null', label: '必须为空', needsParam: false },
  { name: 'not_null', label: '是否有值', needsParam: false },
  { name: 'email_check', label: '邮箱格式', needsParam: false },
  { name: 'number_check', label: '数字格式', needsParam: false },
  { name: 'eq', label: '必须等于', needsParam: true },
  { name: 'min', label: '最小长度', needsParam: true },
  { name: 'max', label: '最大长度', needsParam: true },
  { name: 'regex', label: '正则匹配', needsParam: true },
  { name: 'hash_make', label: '生成密码哈希', needsParam: false },
  { name: 'hash_check', label: '校验密码', needsParam: true }
];

export function blockDefinitionOf(functionName: string) {
  return blockDefinitions.find((definition) => definition.functionName === functionName);
}

export function createBlock(functionName: BlockFunctionName, index: number): ApiBlock {
  const definition = blockDefinitionOf(functionName);
  const uuid = `${functionName}_${index + 1}_block`;

  return {
    uuid,
    alias: definition?.label ?? functionName,
    functionName,
    inputs: definition?.defaultInputs() ?? {},
    outputs: definition?.outputs.length ? [...definition.outputs] : undefined
  };
}

export function processorName(config: ProcessorConfig) {
  return typeof config === 'string' ? config : config.processor;
}

export function processorLabel(config: ProcessorConfig) {
  const name = processorName(config);
  return processorDefinitions.find((definition) => definition.name === name)?.label ?? name;
}
