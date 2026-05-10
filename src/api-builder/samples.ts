import { normalizeTemplateOptions, templateDefinitions } from '@/api-builder/registry';
import type { ApiJson } from '@/api-builder/types';

const baseOptions = normalizeTemplateOptions({
  datasource: 'Mokelay',
  table: 'users',
  idField: 'id',
  requestFields: ['name', 'email'],
  returnFields: ['id', 'name', 'email', 'plan']
});

const pageOptions = normalizeTemplateOptions({
  datasource: 'Mokelay',
  table: 'pages',
  idField: 'uuid',
  requestFields: ['name', 'blocks'],
  returnFields: ['uuid', 'name', 'blocks', 'created_at', 'updated_at']
});

const walletOptions = normalizeTemplateOptions({
  datasource: 'BingX',
  table: 'wallets',
  idField: 'id',
  requestFields: ['chain_id', 'address', 'label', 'wallet_type'],
  returnFields: ['id', 'chain_id', 'address', 'label', 'wallet_type', 'created_at', 'updated_at']
});

function buildTemplate(id: string, options = baseOptions) {
  const definition = templateDefinitions.find((item) => item.id === id);
  if (!definition) {
    throw new Error(`Missing template: ${id}`);
  }
  return definition.build(options);
}

export type SampleApiDefinition = {
  id: string;
  title: string;
  description: string;
  apiJson: ApiJson;
};

export const sampleApis: SampleApiDefinition[] = [
  {
    id: 'login',
    title: '登录接口',
    description: '读取用户、校验密码、写入 Session。',
    apiJson: buildTemplate('login')
  },
  {
    id: 'register',
    title: '注册接口',
    description: '校验重复邮箱、创建用户、写入 Session。',
    apiJson: buildTemplate('register')
  },
  {
    id: 'me',
    title: '当前用户',
    description: '读取 Session 并返回 loggedIn。',
    apiJson: buildTemplate('me')
  },
  {
    id: 'logout',
    title: '退出登录',
    description: '清除 Session 并返回 success。',
    apiJson: buildTemplate('logout')
  },
  {
    id: 'list-pages',
    title: '页面分页',
    description: '分页查询 pages 并返回 pagination。',
    apiJson: buildTemplate('page', pageOptions)
  },
  {
    id: 'read-page',
    title: '页面详情',
    description: '按 uuid 查询单个页面。',
    apiJson: buildTemplate('detail', pageOptions)
  },
  {
    id: 'create-page',
    title: '创建页面',
    description: '创建记录后读取完整数据。',
    apiJson: buildTemplate('create-read', pageOptions)
  },
  {
    id: 'update-page',
    title: '更新页面',
    description: '更新 blocks 后读取最新页面。',
    apiJson: buildTemplate('update-read', pageOptions)
  },
  {
    id: 'delete-wallet',
    title: '删除钱包',
    description: '按 id 删除钱包并返回 affected。',
    apiJson: buildTemplate('delete', walletOptions)
  },
  {
    id: 'count-wallets',
    title: '统计钱包',
    description: '统计 BingX wallets 记录数量。',
    apiJson: buildTemplate('count', walletOptions)
  }
];
