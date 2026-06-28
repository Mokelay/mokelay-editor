import { dateTimeFormatProcessor, validateDateTimeFormatParam } from '@/processors/executors/dateTimeFormat';
import { defaultValueProcessor } from '@/processors/executors/defaultValue';
import { filterProcessor } from '@/processors/executors/filter';
import { mergeDataProcessor, readMergeDataParam } from '@/processors/executors/mergeData';
import { trimProcessor } from '@/processors/executors/trim';
import { readFilterParam } from '@/processors/shared';
import type { ProcessorDefinition } from '@/processors/types';

export const processorDefinitions: ProcessorDefinition[] = [
  {
    name: 'trim',
    titleKey: 'datasource.processors.trim.title',
    descriptionKey: 'datasource.processors.trim.description',
    supportedTypes: ['string'],
    createDefault: () => 'trim',
    execute: trimProcessor
  },
  {
    name: 'default_value',
    titleKey: 'datasource.processors.defaultValue.title',
    descriptionKey: 'datasource.processors.defaultValue.description',
    supportedTypes: ['object', 'array', 'string', 'number', 'boolean', 'null'],
    paramExample: '-',
    createDefault: () => ({ processor: 'default_value', param: '-' }),
    execute: defaultValueProcessor
  },
  {
    name: 'merge_data',
    titleKey: 'datasource.processors.mergeData.title',
    descriptionKey: 'datasource.processors.mergeData.description',
    supportedTypes: ['object', 'array'],
    paramExample: {},
    createDefault: () => ({ processor: 'merge_data', param: [{}] }),
    execute: mergeDataProcessor,
    validateParam: readMergeDataParam
  },
  {
    name: 'filter',
    titleKey: 'datasource.processors.filter.title',
    descriptionKey: 'datasource.processors.filter.description',
    supportedTypes: ['array'],
    paramExample: { type: 'and', conditions: [] },
    createDefault: () => ({
      processor: 'filter',
      param: { type: 'and', conditions: [] }
    }),
    execute: filterProcessor,
    validateParam: readFilterParam
  },
  {
    name: 'date_time_format',
    titleKey: 'datasource.processors.dateTimeFormat.title',
    descriptionKey: 'datasource.processors.dateTimeFormat.description',
    supportedTypes: ['string', 'number'],
    paramExample: 'yyyy-MM-dd HH:mm:SS',
    createDefault: () => ({ processor: 'date_time_format', param: 'yyyy-MM-dd HH:mm:SS' }),
    execute: dateTimeFormatProcessor,
    validateParam: validateDateTimeFormatParam
  }
];

export const processorRegistry = Object.fromEntries(
  processorDefinitions.map((definition) => [definition.name, definition])
) as Record<string, ProcessorDefinition>;

export function getProcessorDefinition(name: string) {
  return processorRegistry[name];
}

export function getProcessorsForType(type: ProcessorDefinition['supportedTypes'][number]) {
  return processorDefinitions.filter((definition) => definition.supportedTypes.includes(type));
}
