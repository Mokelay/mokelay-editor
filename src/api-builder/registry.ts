import type {
  ApiBlock,
  ApiController,
  ApiJson,
  ApiStandardBlock,
  BlockFunctionName,
  Condition,
  ConditionType,
  ControllerFunctionName,
  ProcessorConfig,
  ProcessableKey,
  RequestLocation,
  ResponseConfig,
  ResponseTerminal
} from '@/api-builder/types';

export type BlockGroup = 'query' | 'write' | 'session';

export type BlockDefinition = {
  functionName: BlockFunctionName;
  title: string;
  shortTitle: string;
  group: BlockGroup;
  description: string;
  outputs: string[];
  defaultInputs: () => Record<string, unknown>;
};

export type ControllerDefinition = {
  functionName: ControllerFunctionName;
  title: string;
  shortTitle: string;
  description: string;
  defaultInputs: () => Record<string, unknown>;
};

export type ProcessorDefinition = {
  name: string;
  title: string;
  description: string;
  needsParam: boolean;
  defaultParam?: unknown;
};

export const requestLocations: Array<{ value: RequestLocation; title: string }> = [
  { value: 'header', title: 'Header' },
  { value: 'query', title: 'Query' },
  { value: 'body', title: 'Body' }
];

export const conditionTypes: Array<{ value: ConditionType; title: string }> = [
  { value: 'EQ', title: '等于' },
  { value: 'NEQ', title: '不等于' },
  { value: 'GT', title: '大于' },
  { value: 'GE', title: '大于等于' },
  { value: 'LT', title: '小于' },
  { value: 'LE', title: '小于等于' },
  { value: 'IN', title: '包含在' },
  { value: 'NOTIN', title: '不包含在' }
];

export const processorDefinitions: ProcessorDefinition[] = [
  { name: 'trim', title: '去空格', description: '去除字符串前后空格。', needsParam: false },
  { name: 'is_not_null', title: '必填', description: '不能为空。', needsParam: false },
  { name: 'is_null', title: '必须为空', description: '值必须为空。', needsParam: false },
  { name: 'not_null', title: '是否有值', description: '返回布尔值。', needsParam: false },
  { name: 'email_check', title: '邮箱格式', description: '校验邮箱。', needsParam: false },
  { name: 'number_check', title: '数字格式', description: '校验数字。', needsParam: false },
  { name: 'eq', title: '必须等于', description: '值必须等于参数。', needsParam: true, defaultParam: ['expected'] },
  { name: 'min', title: '最小长度', description: '字符串或数组长度下限。', needsParam: true, defaultParam: [1] },
  { name: 'max', title: '最大长度', description: '字符串或数组长度上限。', needsParam: true, defaultParam: [255] },
  { name: 'regex', title: '正则匹配', description: '用正则校验字符串。', needsParam: true, defaultParam: ['^[a-zA-Z0-9_-]+$'] },
  { name: 'hash_make', title: '生成密码哈希', description: '把明文密码转成 hash。', needsParam: false },
  { name: 'hash_check', title: '校验密码', description: '校验 hash 与明文密码。', needsParam: true, defaultParam: [{ template: '{{request.body.password}}' }] }
];

export const blockDefinitions: BlockDefinition[] = [
  {
    functionName: 'list',
    title: '列表查询',
    shortTitle: '列表',
    group: 'query',
    description: '查询多行数据，不分页。',
    outputs: ['datas'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'employees',
      fields: ['id', 'name', 'created_at'],
      conditions: [],
      orderBy: []
    })
  },
  {
    functionName: 'page',
    title: '分页查询',
    shortTitle: '分页',
    group: 'query',
    description: '查询当前页数据和分页信息。',
    outputs: ['datas', 'total', 'totalPages', 'page', 'pageSize', 'hasPreviousPage', 'hasNextPage'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'pages',
      fields: ['uuid', 'name', 'updated_at'],
      page: { template: '{{request.query.page}}' },
      pageSize: { template: '{{request.query.pageSize}}' },
      conditions: [],
      orderBy: [{ fieldName: 'updated_at', direction: 'DESC' }]
    })
  },
  {
    functionName: 'count',
    title: '统计数量',
    shortTitle: '统计',
    group: 'query',
    description: '统计满足条件的记录数。',
    outputs: ['total'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'employees',
      conditions: []
    })
  },
  {
    functionName: 'read',
    title: '读取单条',
    shortTitle: '读取',
    group: 'query',
    description: '读取第一条匹配记录。',
    outputs: ['data'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'employees',
      fields: ['id', 'name', 'email'],
      conditions: [leafCondition('id', { template: '{{request.query.id}}' })]
    })
  },
  {
    functionName: 'create',
    title: '创建数据',
    shortTitle: '创建',
    group: 'write',
    description: '插入一条数据，并返回唯一 ID。',
    outputs: ['uuid'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'employees',
      idField: 'id',
      fields: {
        name: { template: '{{request.body.name}}' }
      }
    })
  },
  {
    functionName: 'upsert',
    title: '创建或更新',
    shortTitle: 'Upsert',
    group: 'write',
    description: '按唯一字段插入或覆盖一条数据。',
    outputs: ['uuid'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'employees',
      idField: 'id',
      fields: {
        id: { template: '{{request.body.id}}' },
        name: { template: '{{request.body.name}}' }
      }
    })
  },
  {
    functionName: 'update',
    title: '更新数据',
    shortTitle: '更新',
    group: 'write',
    description: '更新符合条件的数据。',
    outputs: ['affected'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'employees',
      fields: {
        name: { template: '{{request.body.name}}' }
      },
      conditions: [leafCondition('id', { template: '{{request.query.id}}' })]
    })
  },
  {
    functionName: 'delete',
    title: '删除数据',
    shortTitle: '删除',
    group: 'write',
    description: '删除符合条件的数据。',
    outputs: ['affected'],
    defaultInputs: () => ({
      datasource: 'Mokelay',
      table: 'employees',
      conditions: [leafCondition('id', { template: '{{request.body.id}}' })]
    })
  },
  {
    functionName: 'addSession',
    title: '写入 Session',
    shortTitle: '写入会话',
    group: 'session',
    description: '把值写入编排 Session。',
    outputs: [],
    defaultInputs: () => ({
      key: 'user',
      value: { template: "{{blocks['read_user'].outputs.data}}" }
    })
  },
  {
    functionName: 'readSession',
    title: '读取 Session',
    shortTitle: '读取会话',
    group: 'session',
    description: '读取 Session key。',
    outputs: ['value'],
    defaultInputs: () => ({
      key: 'user'
    })
  },
  {
    functionName: 'removeSession',
    title: '清除 Session',
    shortTitle: '清除会话',
    group: 'session',
    description: '删除 Session key。',
    outputs: [],
    defaultInputs: () => ({
      key: 'user'
    })
  }
];

export const controllerDefinitions: ControllerDefinition[] = [
  {
    functionName: 'if_controller',
    title: 'IF 控制器',
    shortTitle: 'IF',
    description: '根据 inputs.value 的真假选择 true / false 分支。',
    defaultInputs: () => ({
      value: { template: '{{request.body.value}}' }
    })
  },
  {
    functionName: 'switch_controller',
    title: 'Switch 控制器',
    shortTitle: 'Switch',
    description: '根据 inputs.value 和 dataType 严格匹配分支，未命中走 DEFAULT。',
    defaultInputs: () => ({
      value: { template: '{{request.body.status}}' },
      dataType: 'string'
    })
  }
];

export function getBlockDefinition(functionName: string) {
  return blockDefinitions.find((definition) => definition.functionName === functionName);
}

export function getControllerDefinition(functionName: string) {
  return controllerDefinitions.find((definition) => definition.functionName === functionName);
}

export function getProcessorDefinition(name: string) {
  return processorDefinitions.find((definition) => definition.name === name);
}

export function supportedOutputKeys(functionName: string) {
  return getBlockDefinition(functionName)?.outputs ?? [];
}

export function declarationKey(declaration: ProcessableKey) {
  return typeof declaration === 'string' ? declaration : declaration.key;
}

export function processorName(config: ProcessorConfig) {
  return typeof config === 'string' ? config : config.processor;
}

export function isStarterBlock(block: ApiBlock): block is { uuid: 'starter'; nextBlock?: string | null } {
  return block.uuid === 'starter';
}

export function isControllerBlock(block: ApiBlock): block is ApiController {
  return block.uuid !== 'starter' && 'type' in block && block.type === 'controller';
}

export function isStandardBlock(block: ApiBlock): block is ApiStandardBlock {
  return block.uuid !== 'starter' && (!('type' in block) || block.type !== 'controller');
}

export function collectResponseTerminals(apiJson: ApiJson): ResponseTerminal[] {
  const terminals: ResponseTerminal[] = [];

  for (const block of apiJson.blocks ?? []) {
    if (isStarterBlock(block)) {
      if (block.nextBlock === null) {
        terminals.push({
          uuid: 'starter',
          label: 'Starter'
        });
      }
      continue;
    }

    if (isControllerBlock(block)) {
      for (const node of block.nodes) {
        if (node.nextBlock === null) {
          terminals.push({
            uuid: node.uuid,
            label: `${block.alias || block.uuid} / ${controllerNodeLabel(node)}`
          });
        }
      }
      continue;
    }

    if (block.nextBlock === null) {
      terminals.push({
        uuid: block.uuid,
        label: block.alias || block.uuid
      });
    }
  }

  return terminals;
}

export function hasDefaultResponse(apiJson: ApiJson) {
  return Object.prototype.hasOwnProperty.call(apiJson, 'response');
}

export function getResponseForTerminal(apiJson: ApiJson, terminalUuid: string): ResponseConfig {
  if (apiJson.responses && Object.prototype.hasOwnProperty.call(apiJson.responses, terminalUuid)) {
    return apiJson.responses[terminalUuid] ?? null;
  }

  return hasDefaultResponse(apiJson) ? apiJson.response ?? null : null;
}

export function createStarterBlock(nextBlock: string | null = null): ApiBlock {
  return {
    uuid: 'starter',
    nextBlock
  };
}

export function createBlock(functionName: BlockFunctionName, uuid?: string, alias?: string): ApiStandardBlock {
  const definition = getBlockDefinition(functionName);
  const blockUuid = uuid || `${functionName}_${randomToken()}`;

  return {
    uuid: blockUuid,
    alias: alias || definition?.title,
    functionName,
    inputs: cloneValue(definition?.defaultInputs() ?? {}),
    outputs: (definition?.outputs ?? []).map((key) => key),
    nextBlock: null
  };
}

export function createController(functionName: ControllerFunctionName, uuid?: string, alias?: string): ApiController {
  const definition = getControllerDefinition(functionName);
  const controllerUuid = uuid || `${functionName.replace(/_controller$/, '')}_${randomToken()}`;

  return {
    uuid: controllerUuid,
    alias: alias || definition?.title,
    functionName,
    type: 'controller',
    inputs: cloneValue(definition?.defaultInputs() ?? {}),
    nodes: functionName === 'if_controller'
      ? [
          {
            uuid: `${controllerUuid}_true`,
            alias: 'True',
            value: true,
            nextBlock: null
          },
          {
            uuid: `${controllerUuid}_false`,
            alias: 'False',
            value: false,
            nextBlock: null
          }
        ]
      : [
          {
            uuid: `${controllerUuid}_case`,
            alias: 'Case',
            value: 'published',
            nextBlock: null
          },
          {
            uuid: `${controllerUuid}_default`,
            alias: 'Default',
            type: 'DEFAULT',
            nextBlock: null
          }
        ]
  };
}

export function createEmptyApiJson(): ApiJson {
  return {
    uuid: `api_${randomToken()}`,
    alias: '未命名 API',
    method: 'GET',
    request: {
      header: [],
      query: [],
      body: []
    },
    blocks: [createStarterBlock()],
    response: null
  };
}

export function leafCondition(fieldName = 'id', fieldValue: unknown = ''): Condition {
  return {
    group: false,
    fieldName,
    fieldValue,
    conditionType: 'EQ'
  };
}

export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function randomToken() {
  return Math.random().toString(36).slice(2, 8);
}

function controllerNodeLabel(node: { alias?: string; type?: 'DEFAULT'; value?: string | number | boolean }) {
  if (node.alias) return node.alias;
  if (node.type === 'DEFAULT') return 'DEFAULT';
  if (typeof node.value === 'boolean') return node.value ? 'true' : 'false';
  return String(node.value ?? 'case');
}
