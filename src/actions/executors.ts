import { $confirm } from '@/utils/globalCalls';
import { resolveDatasourceRuntimeData } from '@/utils/datasourceRuntime';
import type { MDatasourceApiObject } from '@/utils/datasource';
import { showActionPageDialog } from '@/actions/dialogHost';
import type { ActionExecutor } from '@/actions/types';

function stringInput(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function booleanInput(value: unknown) {
  return value === true;
}

function datasourceInput(value: unknown) {
  return (typeof value === 'object' && value !== null ? value : {}) as MDatasourceApiObject;
}

export const executeDatasourceAction: ActionExecutor = async ({ inputs, state }) => {
  const dsConfig = datasourceInput(inputs.dsConfig ?? inputs.value ?? inputs);
  const runtimeData = await resolveDatasourceRuntimeData(dsConfig, {
    variableContext: {
      blocks: state.blocks
    }
  });
  const responses = Object.fromEntries(
    runtimeData.schemaSelectionData.map((field) => [field.path, field.value])
  );
  const matchedOutputs = Object.fromEntries(
    runtimeData.matchingExternalFieldData.map((field) => [field.variable, field.value])
  );

  return {
    rawResponse: runtimeData.rawResponse,
    responses,
    ...matchedOutputs
  };
};

export const confirmAction: ActionExecutor = async ({ inputs }) => {
  const result = await $confirm({
    title: stringInput(inputs.title),
    content: stringInput(inputs.content)
  });
  return { result };
};

export const openDialogAction: ActionExecutor = async ({ inputs }) => {
  const closeResult = await showActionPageDialog({
    title: stringInput(inputs.title),
    pageUUID: stringInput(inputs.pageUUID ?? inputs.pageUuid),
    pageSource: inputs.pageSource === 'system' ? 'system' : 'user'
  });
  return {
    close_result: closeResult
  };
};

export const jumpUrlAction: ActionExecutor = ({ inputs }) => {
  const url = stringInput(inputs.url);
  if (!url || typeof window === 'undefined') {
    return {};
  }

  if (booleanInput(inputs.openNew)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return {};
  }

  window.location.href = url;
  return {};
};

export const callBlockMethodAction: ActionExecutor = async ({ config, inputs, callBlockMethod }) => {
  const blockId = stringInput(inputs.blockId);
  const method = stringInput(inputs.method);
  const returnData = await callBlockMethod(blockId, method, {
    actionConfig: config,
    inputs
  });
  return { returnData };
};

export const actionExecutors: Record<string, ActionExecutor> = {
  execute_ds: executeDatasourceAction,
  confirm: confirmAction,
  open_dialog: openDialogAction,
  jump_url: jumpUrlAction,
  call_block_method: callBlockMethodAction
};
