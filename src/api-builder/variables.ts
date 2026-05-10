import type { ApiJson, VariableOption } from './types';
import { blockDefinitionOf } from './registries';

function declarationKey(value: string | { key: string }) {
  return typeof value === 'string' ? value : value.key;
}

export function getVariableOptions(apiJson: ApiJson, beforeBlockUuid?: string): VariableOption[] {
  const request = apiJson.request ?? {};
  const options: VariableOption[] = [];

  for (const location of ['header', 'query', 'body'] as const) {
    for (const declaration of request[location] ?? []) {
      const key = declarationKey(declaration);
      options.push({
        id: `request-${location}-${key}`,
        label: `请求.${location}.${key}`,
        template: `{{request.${location}.${key}}}`,
        source: 'request'
      });
    }
  }

  for (const block of apiJson.blocks ?? []) {
    if (beforeBlockUuid && block.uuid === beforeBlockUuid) {
      break;
    }

    const outputs = blockDefinitionOf(block.functionName)?.outputs ?? [];
    for (const output of outputs) {
      options.push({
        id: `block-${block.uuid}-${output}`,
        label: `${block.alias || block.uuid}.${output}`,
        template: `{{blocks['${block.uuid}'].outputs.${output}}}`,
        source: 'block'
      });
    }
  }

  options.push({
    id: 'system-now',
    label: '系统.now',
    template: '{{now}}',
    source: 'system'
  });

  return options;
}
