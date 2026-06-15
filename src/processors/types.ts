import type { JSONSchemaType } from '@/utils/datasourceSchema';

export type ProcessorConfig =
  | string
  | {
      processor: string;
      param?: unknown;
    };

export type ProcessorErrorCode = 'PROCESSOR_INVALID_CONFIG' | 'PROCESSOR_UNSUPPORTED';

export type ProcessorExecutor = (value: unknown, param?: unknown) => unknown;

export type ProcessorDefinition = {
  name: string;
  titleKey: string;
  descriptionKey: string;
  supportedTypes: JSONSchemaType[];
  createDefault: () => ProcessorConfig;
  execute: ProcessorExecutor;
  validateParam?: (param: unknown) => void;
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
