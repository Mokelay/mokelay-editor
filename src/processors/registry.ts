import { dateTimeFormatProcessor, validateDateTimeFormatParam } from '@/processors/executors/dateTimeFormat';
import { filterProcessor } from '@/processors/executors/filter';
import { mergeDataProcessor, readMergeDataParam } from '@/processors/executors/mergeData';
import { amountFormatProcessor } from '@/processors/executors/amountFormat';
import { enumLabelMapProcessor } from '@/processors/executors/enumLabelMap';
import { numberPrecisionProcessor } from '@/processors/executors/numberPrecision';
import { omitEmptyProcessor } from '@/processors/executors/omitEmpty';
import { paginationResponseMapProcessor } from '@/processors/executors/paginationResponseMap';
import { statusTagMapProcessor } from '@/processors/executors/statusTagMap';
import { timezoneFormatProcessor } from '@/processors/executors/timezoneFormat';
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
    name: 'merge_data',
    titleKey: 'datasource.processors.mergeData.title',
    descriptionKey: 'datasource.processors.mergeData.description',
    supportedTypes: ['object', 'array'],
    createDefault: () => ({ processor: 'merge_data', param: [{}] }),
    execute: mergeDataProcessor,
    validateParam: readMergeDataParam
  },
  {
    name: 'filter',
    titleKey: 'datasource.processors.filter.title',
    descriptionKey: 'datasource.processors.filter.description',
    supportedTypes: ['array'],
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
    createDefault: () => ({ processor: 'date_time_format', param: 'yyyy-MM-dd HH:mm:SS' }),
    execute: dateTimeFormatProcessor,
    validateParam: validateDateTimeFormatParam
  },
  {
    name: 'omit_empty',
    titleKey: 'datasource.processors.omitEmpty.title',
    descriptionKey: 'datasource.processors.omitEmpty.description',
    supportedTypes: ['object', 'array'],
    createDefault: () => ({ processor: 'omit_empty', param: { removeEmptyArray: true } }),
    execute: omitEmptyProcessor
  },
  {
    name: 'pagination_response_map',
    titleKey: 'datasource.processors.paginationResponseMap.title',
    descriptionKey: 'datasource.processors.paginationResponseMap.description',
    supportedTypes: ['object'],
    createDefault: () => ({ processor: 'pagination_response_map', param: {} }),
    execute: paginationResponseMapProcessor
  },
  {
    name: 'number_precision',
    titleKey: 'datasource.processors.numberPrecision.title',
    descriptionKey: 'datasource.processors.numberPrecision.description',
    supportedTypes: ['string', 'number'],
    createDefault: () => ({ processor: 'number_precision', param: { precision: 2, output: 'string' } }),
    execute: numberPrecisionProcessor
  },
  {
    name: 'amount_format',
    titleKey: 'datasource.processors.amountFormat.title',
    descriptionKey: 'datasource.processors.amountFormat.description',
    supportedTypes: ['string', 'number', 'object'],
    createDefault: () => ({ processor: 'amount_format', param: { precision: 2, thousand: true } }),
    execute: amountFormatProcessor
  },
  {
    name: 'enum_label_map',
    titleKey: 'datasource.processors.enumLabelMap.title',
    descriptionKey: 'datasource.processors.enumLabelMap.description',
    supportedTypes: ['string', 'number', 'boolean'],
    createDefault: () => ({ processor: 'enum_label_map', param: { map: {} } }),
    execute: enumLabelMapProcessor
  },
  {
    name: 'status_tag_map',
    titleKey: 'datasource.processors.statusTagMap.title',
    descriptionKey: 'datasource.processors.statusTagMap.description',
    supportedTypes: ['string', 'number', 'boolean', 'object'],
    createDefault: () => ({ processor: 'status_tag_map', param: { map: {} } }),
    execute: statusTagMapProcessor
  },
  {
    name: 'timezone_format',
    titleKey: 'datasource.processors.timezoneFormat.title',
    descriptionKey: 'datasource.processors.timezoneFormat.description',
    supportedTypes: ['string', 'number', 'array'],
    createDefault: () => ({ processor: 'timezone_format', param: { to: 'UTC', format: 'yyyy-MM-dd HH:mm:ss' } }),
    execute: timezoneFormatProcessor
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
