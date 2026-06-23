import type { ActionConfig, ActionNode } from '@/actions/types';

function truthyControllerValue(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return value.length > 0;
  return false;
}

function primitiveType(value: unknown): 'string' | 'number' | 'boolean' | undefined {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return undefined;
}

function requireControllerNodes(config: ActionConfig) {
  return Array.isArray(config.nodes) ? config.nodes : [];
}

export function selectIfControllerNode(config: ActionConfig, inputs: Record<string, unknown>): ActionNode {
  const nodes = requireControllerNodes(config);
  const trueNodes = nodes.filter((node) => node.value === true);
  const falseNodes = nodes.filter((node) => node.value === false);
  const unsupportedNodes = nodes.filter((node) => node.type === 'DEFAULT' || typeof node.value !== 'boolean');

  if (trueNodes.length !== 1 || falseNodes.length !== 1 || unsupportedNodes.length) {
    throw new Error(`if_controller ${config.uuid} requires exactly one true node and one false node.`);
  }

  return truthyControllerValue(inputs.value) ? trueNodes[0] : falseNodes[0];
}

export function selectSwitchControllerNode(config: ActionConfig, inputs: Record<string, unknown>): ActionNode {
  const dataType = inputs.dataType;
  if (dataType !== 'string' && dataType !== 'number' && dataType !== 'boolean') {
    throw new Error(`switch_controller ${config.uuid} inputs.dataType must be string, number, or boolean.`);
  }

  if (primitiveType(inputs.value) !== dataType) {
    throw new Error(`switch_controller ${config.uuid} inputs.value must be ${dataType}.`);
  }

  const nodes = requireControllerNodes(config);
  const defaultNodes = nodes.filter((node) => node.type === 'DEFAULT');
  if (defaultNodes.length > 1) {
    throw new Error(`switch_controller ${config.uuid} can only have one DEFAULT node.`);
  }

  const caseNodes = nodes.filter((node) => node.type !== 'DEFAULT');
  const invalidCase = caseNodes.find((node) => primitiveType(node.value) !== dataType);
  if (invalidCase) {
    throw new Error(`switch_controller ${config.uuid} case node ${invalidCase.uuid} value must be ${dataType}.`);
  }

  const matched = caseNodes.find((node) => node.value === inputs.value);
  if (matched) return matched;

  const defaultNode = defaultNodes[0];
  if (!defaultNode) {
    throw new Error(`switch_controller ${config.uuid} did not match a case and has no DEFAULT node.`);
  }
  return defaultNode;
}

export function selectControllerNode(config: ActionConfig, inputs: Record<string, unknown>): ActionNode {
  if (config.action === 'if_controller') {
    return selectIfControllerNode(config, inputs);
  }
  if (config.action === 'switch_controller') {
    return selectSwitchControllerNode(config, inputs);
  }
  throw new Error(`Unsupported controller action: ${config.action}`);
}
