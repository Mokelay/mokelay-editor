import { cloneValue, createEmptyApiJson } from '@/api-builder/registry';
import type { ApiBuilderDraft, ApiBuilderTestCase, ApiBuilderVersion, ApiJson } from '@/api-builder/types';

export const API_BUILDER_DRAFTS_STORAGE_KEY = 'mokelay-api-builder-drafts';
export const API_BUILDER_ACTIVE_DRAFT_STORAGE_KEY = 'mokelay-api-builder-active-draft';

export function createDraft(apiJson: ApiJson = createEmptyApiJson()): ApiBuilderDraft {
  const now = new Date().toISOString();
  const normalized = normalizeApiJson(apiJson);

  return {
    id: normalized.uuid || `api_${randomToken()}`,
    apiJson: normalized,
    status: 'draft',
    disabledBlockIds: [],
    versions: [],
    testCases: [],
    createdAt: now,
    updatedAt: now
  };
}

export function duplicateDraft(draft: ApiBuilderDraft): ApiBuilderDraft {
  const apiJson = cloneValue(draft.apiJson);
  const suffix = randomToken();
  apiJson.uuid = `${apiJson.uuid || 'api'}_copy_${suffix}`;
  apiJson.alias = `${apiJson.alias || '未命名 API'} 副本`;
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

export function loadDrafts(): ApiBuilderDraft[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(API_BUILDER_DRAFTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeDraft(item));
  } catch {
    return [];
  }
}

export function saveDrafts(drafts: ApiBuilderDraft[]) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(API_BUILDER_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}

export function getActiveDraftId() {
  if (typeof localStorage === 'undefined') {
    return '';
  }
  return localStorage.getItem(API_BUILDER_ACTIVE_DRAFT_STORAGE_KEY) || '';
}

export function setActiveDraftId(id: string) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(API_BUILDER_ACTIVE_DRAFT_STORAGE_KEY, id);
}

export function upsertDraft(drafts: ApiBuilderDraft[], draft: ApiBuilderDraft) {
  const nextDraft = {
    ...draft,
    updatedAt: new Date().toISOString()
  };
  const index = drafts.findIndex((item) => item.id === draft.id);
  if (index === -1) {
    return [nextDraft, ...drafts];
  }
  const next = [...drafts];
  next[index] = nextDraft;
  return next;
}

export function createVersion(draft: ApiBuilderDraft, label = '本地版本'): ApiBuilderVersion {
  return {
    id: `version_${randomToken()}`,
    label,
    apiJson: generateApiJson(draft),
    disabledBlockIds: [...draft.disabledBlockIds],
    createdAt: new Date().toISOString()
  };
}

export function appendVersion(draft: ApiBuilderDraft, label?: string) {
  draft.versions = [createVersion(draft, label), ...draft.versions].slice(0, 20);
  draft.updatedAt = new Date().toISOString();
}

export function appendTestCase(draft: ApiBuilderDraft, testCase: ApiBuilderTestCase) {
  draft.testCases = [testCase, ...draft.testCases].slice(0, 20);
  draft.updatedAt = new Date().toISOString();
}

export function restoreVersion(draft: ApiBuilderDraft, version: ApiBuilderVersion) {
  draft.apiJson = cloneValue(version.apiJson);
  draft.disabledBlockIds = [...version.disabledBlockIds];
  draft.status = 'draft';
  draft.updatedAt = new Date().toISOString();
}

function normalizeDraft(value: unknown): ApiBuilderDraft {
  if (!isRecord(value)) {
    return createDraft();
  }

  const apiJson = normalizeApiJson(value.apiJson);
  const now = new Date().toISOString();

  return {
    id: readString(value.id) || apiJson.uuid || `api_${randomToken()}`,
    apiJson,
    status: value.status === 'published' ? 'published' : 'draft',
    disabledBlockIds: readStringArray(value.disabledBlockIds),
    versions: Array.isArray(value.versions) ? value.versions.map((version) => normalizeVersion(version)) : [],
    testCases: Array.isArray(value.testCases) ? value.testCases.filter(isRecord) as ApiBuilderTestCase[] : [],
    createdAt: readString(value.createdAt) || now,
    updatedAt: readString(value.updatedAt) || now
  };
}

function normalizeVersion(value: unknown): ApiBuilderVersion {
  if (!isRecord(value)) {
    return createVersion(createDraft(), '空版本');
  }

  return {
    id: readString(value.id) || `version_${randomToken()}`,
    label: readString(value.label) || '本地版本',
    apiJson: normalizeApiJson(value.apiJson),
    disabledBlockIds: readStringArray(value.disabledBlockIds),
    createdAt: readString(value.createdAt) || new Date().toISOString()
  };
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

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
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
