import type {
  ApiBlock,
  ApiJson,
  BlockFunctionName,
  Condition,
  ConditionType,
  ProcessorConfig,
  ProcessableKey,
  RequestLocation
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

export type ProcessorDefinition = {
  name: string;
  title: string;
  description: string;
  needsParam: boolean;
  defaultParam?: unknown;
};

export type ApiTemplateDefinition = {
  id: string;
  title: string;
  description: string;
  build: (options: TemplateOptions) => ApiJson;
};

export type TemplateOptions = {
  datasource: string;
  table: string;
  idField: string;
  requestFields: string[];
  returnFields: string[];
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
      table: 'users',
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
      table: 'users',
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
      table: 'users',
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
      table: 'users',
      idField: 'id',
      fields: {
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
      table: 'users',
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
      table: 'users',
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

export const templateDefinitions: ApiTemplateDefinition[] = [
  {
    id: 'register',
    title: '注册接口',
    description: '校验邮箱重复，创建用户，读取用户，写入 Session。',
    build: (options) => buildRegisterTemplate(options)
  },
  {
    id: 'login',
    title: '登录接口',
    description: '读取用户，校验密码，写入 Session。',
    build: (options) => buildLoginTemplate(options)
  },
  {
    id: 'me',
    title: '当前用户',
    description: '读取 Session 并返回登录状态。',
    build: () => ({
      uuid: 'me',
      alias: '当前用户接口',
      method: 'GET',
      blocks: [createBlock('readSession', 'read_user_session', '读取用户 Session')],
      response: {
        user: template("blocks['read_user_session'].outputs.value"),
        loggedIn: {
          template: "{{blocks['read_user_session'].outputs.value}}",
          processors: ['not_null']
        }
      }
    })
  },
  {
    id: 'logout',
    title: '退出登录',
    description: '清除 Session 并返回成功标记。',
    build: () => ({
      uuid: 'logout',
      alias: '退出登录接口',
      method: 'POST',
      blocks: [createBlock('removeSession', 'clear_user_session', '清除用户 Session')],
      response: { success: true }
    })
  },
  {
    id: 'page',
    title: '分页列表',
    description: '读取 page/pageSize，返回数据和分页信息。',
    build: (options) => buildPageTemplate(options)
  },
  {
    id: 'detail',
    title: '详情查询',
    description: '按主键读取单条数据。',
    build: (options) => buildDetailTemplate(options)
  },
  {
    id: 'create-read',
    title: '创建后读取',
    description: '创建记录后读取完整数据返回。',
    build: (options) => buildCreateReadTemplate(options)
  },
  {
    id: 'update-read',
    title: '更新后读取',
    description: '更新记录后读取最新数据返回。',
    build: (options) => buildUpdateReadTemplate(options)
  },
  {
    id: 'delete',
    title: '删除接口',
    description: '按主键删除并返回影响行数。',
    build: (options) => ({
      uuid: `delete_${options.table}_by_${options.idField}`,
      alias: `删除 ${options.table}`,
      method: 'POST',
      request: { body: [requiredKey(options.idField)] },
      blocks: [
        {
          ...createBlock('delete', 'delete_record', '删除记录'),
          inputs: {
            datasource: options.datasource,
            table: options.table,
            conditions: [leafCondition(options.idField, template(`request.body.${options.idField}`))]
          }
        }
      ],
      response: { affected: template("blocks['delete_record'].outputs.affected") }
    })
  },
  {
    id: 'count',
    title: '统计接口',
    description: '统计表数据总数。',
    build: (options) => ({
      uuid: `count_${options.table}`,
      alias: `统计 ${options.table}`,
      method: 'GET',
      blocks: [
        {
          ...createBlock('count', 'count_records', '统计数量'),
          inputs: {
            datasource: options.datasource,
            table: options.table,
            conditions: []
          }
        }
      ],
      response: { total: template("blocks['count_records'].outputs.total") }
    })
  }
];

export function getBlockDefinition(functionName: string) {
  return blockDefinitions.find((definition) => definition.functionName === functionName);
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

export function createBlock(functionName: BlockFunctionName, uuid?: string, alias?: string): ApiBlock {
  const definition = getBlockDefinition(functionName);
  const blockUuid = uuid || `${functionName}_${randomToken()}`;

  return {
    uuid: blockUuid,
    alias: alias || definition?.title,
    functionName,
    inputs: cloneValue(definition?.defaultInputs() ?? {}),
    outputs: (definition?.outputs ?? []).map((key) => key)
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
    blocks: [],
    response: null
  };
}

export function template(path: string) {
  return {
    template: `{{${path}}}`
  };
}

export function requiredKey(key: string, processors: ProcessorConfig[] = ['is_not_null']): ProcessableKey {
  return {
    key,
    processors
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

export function normalizeTemplateOptions(value: Partial<TemplateOptions> = {}): TemplateOptions {
  return {
    datasource: value.datasource?.trim() || 'Mokelay',
    table: value.table?.trim() || 'users',
    idField: value.idField?.trim() || 'id',
    requestFields: normalizeFieldList(value.requestFields, ['name', 'email']),
    returnFields: normalizeFieldList(value.returnFields, ['id', 'name', 'email'])
  };
}

export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeFieldList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const fields = value
    .filter((field): field is string => typeof field === 'string')
    .map((field) => field.trim())
    .filter(Boolean);
  return fields.length ? Array.from(new Set(fields)) : fallback;
}

function randomToken() {
  return Math.random().toString(36).slice(2, 8);
}

function buildRegisterTemplate(options: TemplateOptions): ApiJson {
  const returnValue = objectFromFields(options.returnFields, "blocks['read_record'].outputs.data");

  return {
    uuid: `register_${options.table}`,
    alias: `${options.table} 注册接口`,
    method: 'POST',
    request: {
      body: [
        requiredKey('name', ['trim', 'is_not_null', { processor: 'max', param: [128] }]),
        requiredKey('email', ['trim', 'is_not_null', 'email_check', { processor: 'max', param: [255] }]),
        requiredKey('password', ['is_not_null', { processor: 'min', param: [8] }, { processor: 'max', param: [128] }])
      ]
    },
    blocks: [
      {
        ...createBlock('count', 'check_duplicate', '校验邮箱重复'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          conditions: [leafCondition('email', template('request.body.email'))]
        },
        outputs: [{ key: 'total', processors: [{ processor: 'eq', param: [0] }] }]
      },
      {
        ...createBlock('create', 'create_record', '创建用户'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          idField: options.idField,
          fields: {
            name: template('request.body.name'),
            email: template('request.body.email'),
            password_hash: {
              template: '{{request.body.password}}',
              processors: ['hash_make']
            }
          }
        }
      },
      {
        ...createBlock('read', 'read_record', '读取新用户'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          fields: options.returnFields,
          conditions: [leafCondition(options.idField, template("blocks['create_record'].outputs.uuid"))]
        }
      },
      {
        ...createBlock('addSession', 'set_user_session', '写入用户 Session'),
        inputs: {
          key: 'user',
          value: template("blocks['read_record'].outputs.data")
        }
      }
    ],
    response: {
      user: returnValue
    }
  };
}

function buildLoginTemplate(options: TemplateOptions): ApiJson {
  return {
    uuid: `login_${options.table}`,
    alias: `${options.table} 登录接口`,
    method: 'POST',
    request: {
      body: [
        requiredKey('email', ['trim', 'is_not_null', 'email_check', { processor: 'max', param: [255] }]),
        requiredKey('password', ['is_not_null'])
      ]
    },
    blocks: [
      {
        ...createBlock('read', 'read_user', '按邮箱读取用户'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          fields: Array.from(new Set([...options.returnFields, 'password_hash'])),
          conditions: [leafCondition('email', template('request.body.email'))]
        },
        outputs: [{ key: 'data', processors: ['is_not_null'] }]
      },
      {
        ...createBlock('addSession', 'set_user_session', '校验密码并写入 Session'),
        inputs: {
          key: 'user',
          password_check: {
            template: "{{blocks['read_user'].outputs.data.password_hash}}",
            processors: [
              {
                processor: 'hash_check',
                param: [template('request.body.password')]
              }
            ]
          },
          value: objectFromFields(options.returnFields, "blocks['read_user'].outputs.data")
        }
      }
    ],
    response: {
      user: objectFromFields(options.returnFields, "blocks['read_user'].outputs.data")
    }
  };
}

function buildPageTemplate(options: TemplateOptions): ApiJson {
  return {
    uuid: `page_${options.table}`,
    alias: `${options.table} 分页列表`,
    method: 'GET',
    request: {
      query: ['page', 'pageSize']
    },
    blocks: [
      {
        ...createBlock('page', 'page_records', '分页查询'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          fields: options.returnFields,
          page: template('request.query.page'),
          pageSize: template('request.query.pageSize'),
          orderBy: [{ fieldName: options.idField, direction: 'DESC' }]
        }
      }
    ],
    response: {
      datas: template("blocks['page_records'].outputs.datas"),
      pagination: {
        page: template("blocks['page_records'].outputs.page"),
        pageSize: template("blocks['page_records'].outputs.pageSize"),
        total: template("blocks['page_records'].outputs.total"),
        totalPages: template("blocks['page_records'].outputs.totalPages"),
        hasPreviousPage: template("blocks['page_records'].outputs.hasPreviousPage"),
        hasNextPage: template("blocks['page_records'].outputs.hasNextPage")
      }
    }
  };
}

function buildDetailTemplate(options: TemplateOptions): ApiJson {
  return {
    uuid: `read_${options.table}_by_${options.idField}`,
    alias: `${options.table} 详情查询`,
    method: 'GET',
    request: {
      query: [requiredKey(options.idField)]
    },
    blocks: [
      {
        ...createBlock('read', 'read_record', '读取详情'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          fields: options.returnFields,
          conditions: [leafCondition(options.idField, template(`request.query.${options.idField}`))]
        }
      }
    ],
    response: {
      data: template("blocks['read_record'].outputs.data")
    }
  };
}

function buildCreateReadTemplate(options: TemplateOptions): ApiJson {
  return {
    uuid: `create_${options.table}`,
    alias: `创建 ${options.table}`,
    method: 'POST',
    request: {
      body: options.requestFields.map((field) => requiredKey(field))
    },
    blocks: [
      {
        ...createBlock('create', 'create_record', '创建记录'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          idField: options.idField,
          fields: Object.fromEntries(options.requestFields.map((field) => [field, template(`request.body.${field}`)]))
        }
      },
      {
        ...createBlock('read', 'read_record', '读取新记录'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          fields: options.returnFields,
          conditions: [leafCondition(options.idField, template("blocks['create_record'].outputs.uuid"))]
        }
      }
    ],
    response: {
      uuid: template("blocks['create_record'].outputs.uuid"),
      data: template("blocks['read_record'].outputs.data")
    }
  };
}

function buildUpdateReadTemplate(options: TemplateOptions): ApiJson {
  return {
    uuid: `update_${options.table}_by_${options.idField}`,
    alias: `更新 ${options.table}`,
    method: 'POST',
    request: {
      query: [requiredKey(options.idField)],
      body: options.requestFields.map((field) => requiredKey(field))
    },
    blocks: [
      {
        ...createBlock('update', 'update_record', '更新记录'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          fields: Object.fromEntries(options.requestFields.map((field) => [field, template(`request.body.${field}`)])),
          conditions: [leafCondition(options.idField, template(`request.query.${options.idField}`))]
        }
      },
      {
        ...createBlock('read', 'read_record', '读取最新记录'),
        inputs: {
          datasource: options.datasource,
          table: options.table,
          fields: options.returnFields,
          conditions: [leafCondition(options.idField, template(`request.query.${options.idField}`))]
        }
      }
    ],
    response: {
      affected: template("blocks['update_record'].outputs.affected"),
      data: template("blocks['read_record'].outputs.data")
    }
  };
}

function objectFromFields(fields: string[], basePath: string) {
  return Object.fromEntries(fields.map((field) => [field, template(`${basePath}.${field}`)]));
}
