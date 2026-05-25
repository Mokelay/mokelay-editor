import { cloneValue, createEmptyApiJson } from '@/api-builder/registry';
import type { ApiBuilderDraft, ApiBuilderTestCase, ApiJson } from '@/api-builder/types';

export function createDraft(apiJson: ApiJson = createEmptyApiJson()): ApiBuilderDraft {
  const now = new Date().toISOString();
  const normalized = normalizeApiJson(apiJson);

  return {
    id: normalized.uuid || `api_${randomToken()}`,
    apiJson: normalized,
    status: 'draft',
    disabledBlockIds: [],
    testCases: [],
    createdAt: now,
    updatedAt: now
  };
}

export function duplicateDraft(draft: ApiBuilderDraft): ApiBuilderDraft {
  const apiJson = cloneValue(draft.apiJson);
  const suffix = randomToken();
  apiJson.uuid = `${apiJson.uuid || 'api'}_copy_${suffix}`;
  apiJson.alias = `${apiJson.alias || '未命名 API'} copy`;
  const copy = createDraft(apiJson);
  copy.disabledBlockIds = [...draft.disabledBlockIds];
  return copy;
}

export function normalizeApiJson(value: unknown): ApiJson {
  if (!isRecord(value)) {
    return createEmptyApiJson();
  }

  return {
    uuid: readString(value.uuid) || `api_${randomToken()}`,
    alias: readString(value.alias) || '未命名 API',
    method: readString(value.method).toUpperCase() === 'POST' ? 'POST' : 'GET',
    request: normalizeRequest(value.request),
    blocks: Array.isArray(value.blocks) ? value.blocks.map((block) => normalizeBlock(block)) : [],
    response: isRecord(value.response) ? cloneValue(value.response) : value.response === null ? null : null
  };
}

export function generateApiJson(draft: ApiBuilderDraft): ApiJson {
  const apiJson = cloneValue(normalizeApiJson(draft.apiJson));
  const disabled = new Set(draft.disabledBlockIds);
  apiJson.blocks = (apiJson.blocks ?? []).filter((block) => !disabled.has(block.uuid));
  return apiJson;
}

export function appendTestCase(draft: ApiBuilderDraft, testCase: ApiBuilderTestCase) {
  draft.testCases = [testCase, ...draft.testCases].slice(0, 20);
  draft.updatedAt = new Date().toISOString();
}

function normalizeRequest(value: unknown) {
  if (!isRecord(value)) {
    return { header: [], query: [], body: [] };
  }

  return {
    header: normalizeProcessableKeys(value.header),
    query: normalizeProcessableKeys(value.query),
    body: normalizeProcessableKeys(value.body)
  };
}

function normalizeProcessableKeys(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!isRecord(item)) return undefined;
      const key = readString(item.key);
      if (!key) return undefined;
      return {
        key,
        processors: normalizeProcessors(item.processors)
      };
    })
    .filter((item): item is string | { key: string; processors: ReturnType<typeof normalizeProcessors> } => Boolean(item));
}

function normalizeProcessors(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string' && item.trim()) return item.trim();
      if (!isRecord(item)) return undefined;
      const processor = readString(item.processor);
      if (!processor) return undefined;
      return {
        processor,
        ...(Object.prototype.hasOwnProperty.call(item, 'param') ? { param: cloneOptionalValue(item.param) } : {})
      };
    })
    .filter((item): item is string | { processor: string; param?: unknown } => Boolean(item));
}

function normalizeBlock(value: unknown) {
  if (!isRecord(value)) {
    return {
      uuid: `block_${randomToken()}`,
      functionName: 'read',
      inputs: {},
      outputs: []
    };
  }

  return {
    uuid: readString(value.uuid) || `block_${randomToken()}`,
    alias: readString(value.alias) || undefined,
    functionName: readString(value.functionName) || 'read',
    inputs: isRecord(value.inputs) ? cloneValue(value.inputs) : {},
    outputs: Array.isArray(value.outputs) ? normalizeProcessableKeys(value.outputs) : value.outputs === null ? null : undefined
  };
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function cloneOptionalValue<T>(value: T): T {
  return value === undefined ? value : cloneValue(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function randomToken() {
  return Math.random().toString(36).slice(2, 10);
}
