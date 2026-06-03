import { cloneValue, createEmptyApiJson, createStarterBlock } from '@/api-builder/registry';
import type {
  ApiBlock,
  ApiBuilderDraft,
  ApiBuilderLayout,
  ApiBuilderTestCase,
  ApiController,
  ApiJson,
  ApiBuilderNodePosition,
  ApiStandardBlock,
  ControllerNode,
  StarterBlock
} from '@/api-builder/types';

export function createDraft(apiJson: ApiJson = createEmptyApiJson(), layout: unknown = undefined): ApiBuilderDraft {
  const now = new Date().toISOString();
  const normalized = normalizeApiJson(apiJson);

  return {
    id: normalized.uuid || `api_${randomToken()}`,
    apiJson: normalized,
    layout: normalizeApiBuilderLayout(layout),
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
  const copy = createDraft(apiJson, draft.layout);
  copy.disabledBlockIds = [...draft.disabledBlockIds];
  return copy;
}

export function createDefaultApiBuilderLayout(): ApiBuilderLayout {
  return {
    version: 1,
    nodes: {}
  };
}

export function normalizeApiBuilderLayout(value: unknown): ApiBuilderLayout {
  if (!isRecord(value) || !isRecord(value.nodes)) {
    return createDefaultApiBuilderLayout();
  }

  const nodes = Object.entries(value.nodes).reduce<Record<string, ApiBuilderNodePosition>>((normalized, [uuid, position]) => {
    if (!uuid || !isRecord(position)) return normalized;

    const x = readFiniteNumber(position.x);
    const y = readFiniteNumber(position.y);
    if (x === undefined || y === undefined) return normalized;

    normalized[uuid] = { x, y };
    return normalized;
  }, {});

  return {
    version: 1,
    nodes
  };
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
    blocks: normalizeBlocks(value.blocks),
    response: isRecord(value.response) ? cloneValue(value.response) : value.response === null ? null : null
  };
}

export function generateApiJson(draft: ApiBuilderDraft): ApiJson {
  const apiJson = cloneValue(normalizeApiJson(draft.apiJson));
  const disabled = new Set(draft.disabledBlockIds);
  apiJson.blocks = clearDisabledReferences((apiJson.blocks ?? []).filter((block) => block.uuid === 'starter' || !disabled.has(block.uuid)), disabled);
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

function normalizeBlocks(value: unknown) {
  const blocks = Array.isArray(value) ? value.map((block) => normalizeBlock(block)) : [];
  const hasStarter = blocks.some((block) => block.uuid === 'starter');

  return hasStarter ? blocks : [createStarterBlock(), ...blocks];
}

function normalizeBlock(value: unknown): ApiBlock {
  if (!isRecord(value)) {
    return {
      uuid: `block_${randomToken()}`,
      functionName: 'read',
      inputs: {},
      outputs: [],
      nextBlock: undefined
    };
  }

  if (value.uuid === 'starter') {
    return normalizeStarterBlock(value);
  }

  if (value.type === 'controller') {
    return normalizeController(value);
  }

  return normalizeStandardBlock(value);
}

function normalizeStarterBlock(value: Record<string, unknown>): StarterBlock {
  return {
    uuid: 'starter',
    ...(Object.prototype.hasOwnProperty.call(value, 'nextBlock') ? { nextBlock: normalizeNextBlock(value.nextBlock) } : {})
  };
}

function normalizeStandardBlock(value: Record<string, unknown>): ApiStandardBlock {
  return {
    uuid: readString(value.uuid) || `block_${randomToken()}`,
    alias: readString(value.alias) || undefined,
    functionName: readString(value.functionName) || 'read',
    type: readString(value.type) || undefined,
    inputs: isRecord(value.inputs) ? cloneValue(value.inputs) : {},
    outputs: Array.isArray(value.outputs) ? normalizeProcessableKeys(value.outputs) : value.outputs === null ? null : undefined,
    ...(Object.prototype.hasOwnProperty.call(value, 'nextBlock') ? { nextBlock: normalizeNextBlock(value.nextBlock) } : {})
  };
}

function normalizeController(value: Record<string, unknown>): ApiController {
  return {
    uuid: readString(value.uuid) || `controller_${randomToken()}`,
    alias: readString(value.alias) || undefined,
    functionName: readString(value.functionName) || 'if_controller',
    type: 'controller',
    inputs: isRecord(value.inputs) ? cloneValue(value.inputs) : {},
    nodes: Array.isArray(value.nodes) ? value.nodes.map((node) => normalizeControllerNode(node)) : [],
    ...(Object.prototype.hasOwnProperty.call(value, 'nextBlock') ? { nextBlock: normalizeNextBlock(value.nextBlock) } : {})
  };
}

function normalizeControllerNode(value: unknown): ControllerNode {
  if (!isRecord(value)) {
    return {
      uuid: `node_${randomToken()}`,
      nextBlock: undefined
    };
  }

  const type = value.type === 'DEFAULT' ? 'DEFAULT' : undefined;
  const rawValue = value.value;

  return {
    uuid: readString(value.uuid) || `node_${randomToken()}`,
    alias: readString(value.alias) || undefined,
    ...(type ? { type } : {}),
    ...(typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean' ? { value: rawValue } : {}),
    ...(Object.prototype.hasOwnProperty.call(value, 'nextBlock') ? { nextBlock: normalizeNextBlock(value.nextBlock) } : {})
  };
}

function normalizeNextBlock(value: unknown) {
  return typeof value === 'string' ? value : value === null ? null : undefined;
}

function clearDisabledReferences(blocks: ApiBlock[], disabled: Set<string>) {
  const activeUuids = new Set(blocks.filter((block) => block.uuid !== 'starter').map((block) => block.uuid));
  const normalizeTarget = (nextBlock: string | null | undefined) => {
    if (nextBlock === null || nextBlock === undefined) return nextBlock;
    return disabled.has(nextBlock) || !activeUuids.has(nextBlock) ? null : nextBlock;
  };

  return blocks.map((block) => {
    if (block.uuid === 'starter') {
      return {
        ...block,
        nextBlock: normalizeTarget(block.nextBlock)
      };
    }

    if ('type' in block && block.type === 'controller' && 'nodes' in block) {
      return {
        ...block,
        nodes: block.nodes.map((node: ControllerNode) => ({
          ...node,
          nextBlock: normalizeTarget(node.nextBlock)
        }))
      };
    }

    return {
      ...block,
      nextBlock: normalizeTarget(block.nextBlock)
    };
  });
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
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
