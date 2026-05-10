import { declarationKey, supportedOutputKeys } from '@/api-builder/registry';
import type { ApiJson, VariableOption } from '@/api-builder/types';

export function buildVariableOptions(apiJson: ApiJson, beforeBlockUuid?: string): VariableOption[] {
  const options: VariableOption[] = [];

  for (const location of ['header', 'query', 'body'] as const) {
    for (const declaration of apiJson.request?.[location] ?? []) {
      const key = declarationKey(declaration);
      options.push({
        id: `request-${location}-${key}`,
        label: `请求 ${location}.${key}`,
        path: `request.${location}.${key}`,
        source: 'request'
      });
    }
  }

  for (const block of apiJson.blocks ?? []) {
    if (beforeBlockUuid && block.uuid === beforeBlockUuid) {
      break;
    }

    const outputKeys = block.outputs?.length
      ? block.outputs.map(declarationKey)
      : supportedOutputKeys(block.functionName);

    for (const output of outputKeys) {
      options.push({
        id: `block-${block.uuid}-${output}`,
        label: `${block.alias || block.uuid}.${output}`,
        path: `blocks['${block.uuid}'].outputs.${output}`,
        source: 'block'
      });

      if (output === 'data') {
        options.push({
          id: `block-${block.uuid}-${output}-field`,
          label: `${block.alias || block.uuid}.data.字段`,
          path: `blocks['${block.uuid}'].outputs.data.id`,
          source: 'block'
        });
      }
    }
  }

  options.push({
    id: 'system-now',
    label: '系统时间 now',
    path: 'now',
    source: 'system'
  });

  return options;
}

export function makeTemplate(path: string) {
  return {
    template: `{{${path}}}`
  };
}
