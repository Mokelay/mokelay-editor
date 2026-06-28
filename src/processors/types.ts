import type { JSONSchemaType } from '@/utils/datasourceSchema';

export type ProcessorConfig =
  | string
  | {
      processor: string;
      param?: unknown;
    };

export type ProcessorPhase =
  | 'request'
  | 'response'
  | 'display'
  | 'action'
  | 'export'
  | 'preview';

export type ProcessorContext = {
  phase: ProcessorPhase;
  locale?: string;
  fallbackLocale?: string;
  enums?: Record<string, unknown>;
  coinPrecision?: Record<string, number>;
  permissions?: Set<string> | string[];
  request?: {
    pageNo?: number;
    pageSize?: number;
    query?: Record<string, unknown>;
    body?: unknown;
  };
  response?: {
    headers?: Headers | Record<string, string>;
    status?: number;
  };
  services?: {
    t?: (key: string, locale?: string) => string | undefined;
    hasPermission?: (permission: string) => boolean;
  };
};

export type ProcessorErrorCode =
  | 'PROCESSOR_INVALID_CONFIG'
  | 'PROCESSOR_UNSUPPORTED'
  | 'PROCESSOR_VALIDATION_FAILED'
  | 'PROCESSOR_CONTEXT_MISSING'
  | 'PROCESSOR_ASYNC_REQUIRED'
  | 'PROCESSOR_EXECUTION_FAILED';

export type ProcessorErrorMeta = {
  processor?: string;
  phase?: ProcessorPhase;
  param?: unknown;
  valuePreview?: unknown;
  cause?: unknown;
};

export type ProcessorExecutor = (
  value: unknown,
  param: unknown,
  context: ProcessorContext
) => unknown | Promise<unknown>;

export type ProcessorDefinition = {
  name: string;
  titleKey: string;
  descriptionKey: string;
  supportedTypes: JSONSchemaType[];
  supportedPhases?: ProcessorPhase[];
  requiresContext?: string[];
  async?: boolean;
  paramExample?: unknown;
  createDefault: () => ProcessorConfig;
  execute: ProcessorExecutor;
  validateParam?: (param: unknown, context?: ProcessorContext) => void;
};

export type FilterConditionType = 'eq' | 'gt' | 'lt' | 'is_empty' | 'is_not_empty';

export type FilterCondition = {
  variable: string;
  condition: FilterConditionType;
  value?: unknown;
};

export type FilterParam = {
  type: 'and' | 'or';
  conditions: FilterCondition[];
};
