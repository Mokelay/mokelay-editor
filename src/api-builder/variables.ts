import {
  declarationKey,
  isFragmentApiJson,
  isControllerBlock,
  isStarterBlock,
  isStandardBlock,
  supportedOutputKeys
} from '@/api-builder/registry';
import type { ApiJson, VariableOption } from '@/api-builder/types';

export function buildVariableOptions(apiJson: ApiJson, beforeBlockUuid?: string): VariableOption[] {
  const options: VariableOption[] = [];

  if (isFragmentApiJson(apiJson)) {
    for (const declaration of apiJson.params ?? []) {
      const key = declarationKey(declaration);
      options.push({
        id: `params-${key}`,
        label: `Fragment 参数 ${key}`,
        path: `params.${key}`,
        source: 'params'
      });
    }
  } else {
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
  }

  for (const block of orderedReachableBlocks(apiJson)) {
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

function orderedReachableBlocks(apiJson: ApiJson) {
  const blocks = apiJson.blocks ?? [];
  const starter = blocks.find(isStarterBlock);
  const executableBlocks = blocks.filter(isStandardBlock);
  const blockMap = new Map(blocks.filter((block) => !isStarterBlock(block)).map((block) => [block.uuid, block]));
  const ordered: typeof executableBlocks = [];
  const visited = new Set<string>();

  const visit = (uuid: string | null | undefined) => {
    if (!uuid || visited.has(uuid)) return;
    visited.add(uuid);

    const block = blockMap.get(uuid);
    if (!block) return;

    if (isStandardBlock(block)) {
      ordered.push(block);
      visit(block.nextBlock);
      return;
    }

    if (isControllerBlock(block)) {
      for (const node of block.nodes) {
        visit(node.nextBlock);
      }
    }
  };

  visit(starter?.nextBlock);

  for (const block of executableBlocks) {
    if (!visited.has(block.uuid)) {
      ordered.push(block);
    }
  }

  return ordered;
}
