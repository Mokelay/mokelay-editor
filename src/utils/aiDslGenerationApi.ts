import { apiClient } from '@/composables/useApi';

export type AiDslGenerationPayload = {
  requirementDocument: string;
  projectContext?: unknown;
  dslContext?: unknown;
  generationPreferences?: unknown;
};

export type AiDslUpgradePlan = {
  processors: unknown[];
  blocks: unknown[];
  actions: unknown[];
  controls: unknown[];
  components: unknown[];
};

export type AiDslGenerationResponse = {
  version: number;
  status: 'complete' | 'partial' | string;
  summary: string;
  pages: unknown[];
  apis: unknown[];
  upgradePlan: AiDslUpgradePlan;
  traceability: unknown[];
  assumptions: unknown[];
  warnings: unknown[];
};

type MokelaySuccessResponse<T> = {
  ok: true;
  data: T;
};

type MokelayErrorResponse = {
  ok: false;
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

type MokelayApiResponse<T> = MokelaySuccessResponse<T> | MokelayErrorResponse;

const AI_DSL_GENERATION_TIMEOUT_MS = 120000;

export async function generateAiDsl(payload: AiDslGenerationPayload) {
  try {
    const response = await apiClient.post<MokelayApiResponse<AiDslGenerationResponse>>(
      '/api/mokelay/ai-generate-dsl',
      payload,
      { timeout: AI_DSL_GENERATION_TIMEOUT_MS }
    );

    return normalizeAiDslGenerationResponse(unwrapApiResponse(response.data));
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new Error('AI DSL generation timed out. Please try a smaller requirement document or retry later.');
    }

    throw error;
  }
}

function unwrapApiResponse<T>(value: MokelayApiResponse<T>): T {
  if (!isRecord(value)) {
    throw new Error('Invalid API response.');
  }

  if (value.ok === true) {
    return value.data as T;
  }

  if (value.ok === false) {
    const error = isRecord(value.error) ? value.error : {};
    const code = typeof error.code === 'string' ? error.code : '';
    const message = typeof error.message === 'string' ? error.message : '';
    throw new Error(message || code || 'AI DSL generation failed.');
  }

  throw new Error('Invalid API response.');
}

function normalizeAiDslGenerationResponse(value: unknown): AiDslGenerationResponse {
  if (!isRecord(value)) {
    throw new Error('Invalid AI DSL response.');
  }

  return {
    version: typeof value.version === 'number' ? value.version : Number(value.version ?? 1),
    status: typeof value.status === 'string' ? value.status : 'partial',
    summary: typeof value.summary === 'string' ? value.summary : '',
    pages: Array.isArray(value.pages) ? value.pages : [],
    apis: Array.isArray(value.apis) ? value.apis : [],
    upgradePlan: normalizeUpgradePlan(value.upgradePlan),
    traceability: Array.isArray(value.traceability) ? value.traceability : [],
    assumptions: Array.isArray(value.assumptions) ? value.assumptions : [],
    warnings: Array.isArray(value.warnings) ? value.warnings : []
  };
}

function normalizeUpgradePlan(value: unknown): AiDslUpgradePlan {
  const record = isRecord(value) ? value : {};

  return {
    processors: readArray(record.processors),
    blocks: readArray(record.blocks),
    actions: readArray(record.actions),
    controls: readArray(record.controls),
    components: readArray(record.components)
  };
}

function readArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function isTimeoutError(error: unknown) {
  if (!isRecord(error)) {
    return false;
  }

  return error.code === 'ECONNABORTED' ||
    (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
