import type { ApiBlock, ApiJson, ProcessableKey, ProcessorConfig, RequestLocation, RequestParameterDraft } from './types';
import { blockDefinitionOf } from './registries';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createEmptyApiJson(uuid = 'new_api'): ApiJson {
  return {
    uuid,
    alias: '',
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

export function normalizeApiJson(value: unknown): ApiJson {
  if (!isRecord(value)) {
    return createEmptyApiJson();
  }

  const request = isRecord(value.request) ? value.request : {};
  return {
    uuid: typeof value.uuid === 'string' ? value.uuid : 'new_api',
    alias: typeof value.alias === 'string' ? value.alias : '',
    method: typeof value.method === 'string' ? value.method.toUpperCase() : 'GET',
    request: {
      header: normalizeProcessableKeys(request.header),
      query: normalizeProcessableKeys(request.query),
      body: normalizeProcessableKeys(request.body)
    },
    blocks: Array.isArray(value.blocks) ? value.blocks.map(normalizeBlock) : [],
    response: isRecord(value.response) ? cloneValue(value.response) : value.response === null ? null : null
  };
}

function normalizeProcessableKeys(value: unknown): ProcessableKey[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === 'string' && item.trim()) {
      return item.trim();
    }

    if (isRecord(item) && typeof item.key === 'string' && item.key.trim()) {
      return {
        key: item.key.trim(),
        processors: Array.isArray(item.processors) ? item.processors as ProcessorConfig[] : []
      };
    }

    return [];
  });
}

function normalizeBlock(value: unknown, index: number): ApiBlock {
  const record = isRecord(value) ? value : {};
  const functionName = typeof record.functionName === 'string' ? record.functionName : 'read';
  const definition = blockDefinitionOf(functionName);
  const inputs = isRecord(record.inputs) ? cloneValue(record.inputs) : definition?.defaultInputs() ?? {};

  return {
    uuid: typeof record.uuid === 'string' && record.uuid.trim() ? record.uuid.trim() : `${functionName}_${index + 1}_block`,
    alias: typeof record.alias === 'string' ? record.alias : definition?.label ?? functionName,
    functionName,
    inputs,
    outputs: Array.isArray(record.outputs)
      ? normalizeProcessableKeys(record.outputs)
      : definition?.outputs.length
        ? [...definition.outputs]
        : undefined
  };
}

export function getRequestParameterDrafts(apiJson: ApiJson): RequestParameterDraft[] {
  const request = apiJson.request ?? {};
  return (['header', 'query', 'body'] satisfies RequestLocation[]).flatMap((location) =>
    (request[location] ?? []).map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `${location}-${index}-${item}`,
          location,
          key: item,
          required: true,
          processors: [],
          example: '',
          description: ''
        };
      }

      const processors = item.processors ?? [];
      return {
        id: `${location}-${index}-${item.key}`,
        location,
        key: item.key,
        required: processors.some((processor) => (typeof processor === 'string' ? processor : processor.processor) === 'is_not_null'),
        processors: processors.filter((processor) => (typeof processor === 'string' ? processor : processor.processor) !== 'is_not_null'),
        example: '',
        description: ''
      };
    })
  );
}

export function applyRequestParameterDrafts(apiJson: ApiJson, parameters: RequestParameterDraft[]) {
  const next = normalizeApiJson(apiJson);
  next.request = {
    header: buildProcessableKeys(parameters, 'header'),
    query: buildProcessableKeys(parameters, 'query'),
    body: buildProcessableKeys(parameters, 'body')
  };

  return next;
}

function buildProcessableKeys(parameters: RequestParameterDraft[], location: RequestLocation): ProcessableKey[] {
  return parameters
    .filter((parameter) => parameter.location === location && parameter.key.trim())
    .map((parameter) => {
      const processors = parameter.required
        ? ['is_not_null', ...parameter.processors]
        : parameter.processors;

      if (parameter.required && processors.length === 1) {
        return parameter.key.trim();
      }

      return {
        key: parameter.key.trim(),
        processors
      };
    });
}

export function parseJsonObjectInput(value: string, fallback: Record<string, unknown> = {}) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function templateValue(template: string) {
  return { template };
}
