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

function numberInput(value: unknown, fallback: number) {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : fallback;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function fileInputs(value: unknown): File[] {
  if (isFile(value)) return [value];
  if (!Array.isArray(value)) return [];
  return value.filter(isFile);
}

function acceptInputs(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  return values
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function getFileExtension(file: File) {
  const dotIndex = file.name.lastIndexOf('.');
  return dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : '';
}

function fileMatchesAccept(file: File, accept: string[]) {
  if (!accept.length) return true;

  const extension = getFileExtension(file);
  const mime = file.type.toLowerCase();
  return accept.some((item) => {
    if (item.startsWith('.')) return extension === item;
    if (item.endsWith('/*')) return mime.startsWith(item.slice(0, -1));
    return mime === item;
  });
}

function normalizeUploadedFile(file: File, patch: Record<string, unknown> = {}) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    ...patch
  };
}

function readRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function mokelayFailureMessage(value: unknown) {
  const response = readRecord(value);
  if (response.ok !== false) return '';

  const error = readRecord(response.error);
  return stringInput(error.message) || '接口请求失败。';
}

function optionalRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function hasOwn(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function findCurrentPageBlockId(blocks: Record<string, Record<string, unknown>>) {
  return Object.entries(blocks).find(([, data]) => data?._blockType === 'MPage')?.[0] ?? '';
}

function firstStringPath(value: unknown, paths: string[]) {
  for (const path of paths) {
    const result = readPath(value, path);
    if (typeof result === 'string' && result.trim()) {
      return result.trim();
    }
  }

  return '';
}

function readPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((cursor, key) => (
    typeof cursor === 'object' && cursor !== null && key in cursor
      ? (cursor as Record<string, unknown>)[key]
      : undefined
  ), value);
}

function extractResponseUrl(value: unknown) {
  return firstStringPath(value, [
    'url',
    'fileUrl',
    'downloadUrl',
    'data.url',
    'data.fileUrl',
    'data.downloadUrl',
    'data.path',
    'result.url',
    'result.fileUrl'
  ]);
}

function normalizeRawResponse(value: unknown) {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    Array.isArray(value) ||
    (typeof value === 'object' && value !== null)
  ) {
    return value;
  }

  return {};
}

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.toLowerCase().includes('json')) {
    return await response.json() as unknown;
  }

  return await response.text();
}

async function uploadToEndpoint(file: File, endpoint: string, inputs: Record<string, unknown>) {
  const formData = new FormData();
  const fileField = stringInput(inputs.fileField) || 'file';
  formData.append(fileField, file);

  const extraFields = readRecord(inputs.fields);
  Object.entries(extraFields).forEach(([key, value]) => {
    if (!key) return;
    if (typeof value === 'string' || value instanceof Blob) {
      formData.append(key, value);
      return;
    }
    formData.append(key, JSON.stringify(value));
  });

  const response = await fetch(endpoint, {
    method: stringInput(inputs.method) || 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`.trim());
  }

  return await readResponsePayload(response);
}

function getDatasourceFileIndex(datasource: MDatasourceApiObject) {
  return datasource.bodyData.findIndex((item) => item.dataType === 'file');
}

async function uploadToDatasource(file: File, datasource: MDatasourceApiObject, state: Parameters<ActionExecutor>[0]['state']) {
  const fileIndex = getDatasourceFileIndex(datasource);
  const runtimeData = await resolveDatasourceRuntimeData(datasource, {
    bodyFiles: fileIndex >= 0 ? { [fileIndex]: file } : undefined,
    variableContext: {
      blocks: state.blocks
    }
  });
  return runtimeData.rawResponse;
}

async function uploadWithOssToken(file: File, inputs: Record<string, unknown>, state: Parameters<ActionExecutor>[0]['state']) {
  const tokenDatasource = datasourceInput(inputs.tokenDatasource);
  const tokenRuntimeData = await resolveDatasourceRuntimeData(tokenDatasource, {
    variableContext: {
      blocks: state.blocks
    }
  });
  const tokenResponse = tokenRuntimeData.rawResponse;
  const uploadUrl = firstStringPath(tokenResponse, ['uploadUrl', 'data.uploadUrl', 'result.uploadUrl']);
  if (!uploadUrl) {
    throw new Error('OSS token response is missing uploadUrl.');
  }

  const formData = new FormData();
  const tokenFields = readRecord(
    readPath(tokenResponse, 'fields') ??
    readPath(tokenResponse, 'data.fields') ??
    readPath(tokenResponse, 'result.fields')
  );
  Object.entries(tokenFields).forEach(([key, value]) => {
    if (!key) return;
    formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
  formData.append(stringInput(inputs.fileField) || 'file', file);

  const response = await fetch(uploadUrl, {
    method: stringInput(inputs.method) || 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error(`OSS upload failed: ${response.status} ${response.statusText}`.trim());
  }

  const responsePayload = await readResponsePayload(response).catch(() => ({}));
  const publicUrl = firstStringPath(tokenResponse, ['url', 'data.url', 'result.url']);
  return {
    uploadResponse: responsePayload,
    url: publicUrl
  };
}

export const executeDatasourceAction: ActionExecutor = async ({ inputs, state }) => {
  const dsConfig = datasourceInput(inputs.dsConfig ?? inputs.value ?? inputs);
  const runtimeData = await resolveDatasourceRuntimeData(dsConfig, {
    variableContext: {
      blocks: state.blocks
    }
  });
  const failureMessage = mokelayFailureMessage(runtimeData.rawResponse);
  if (failureMessage) {
    throw new Error(failureMessage);
  }
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
    pageSource: inputs.pageSource === 'system' ? 'system' : 'user',
    context: optionalRecord(inputs.context)
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
  const hasArgs = Object.prototype.hasOwnProperty.call(inputs, 'args');
  const returnData = await callBlockMethod(blockId, method, {
    actionConfig: config,
    inputs,
    ...(hasArgs ? { args: inputs.args } : {})
  });
  return { returnData };
};

export const closeDialogAction: ActionExecutor = async ({ inputs, state, callBlockMethod }) => {
  const reason = stringInput(inputs.reason) || 'success';
  const blockId = stringInput(
    inputs.blockId ??
    inputs.pageUUID ??
    inputs.pageUuid ??
    inputs.pageId ??
    inputs.dialogId
  ) || findCurrentPageBlockId(state.blocks);
  const result = hasOwn(inputs, 'result') ? inputs.result : undefined;
  const closeResult = {
    reason,
    ...(result !== undefined ? { result } : {})
  };

  if (booleanInput(inputs.confirmBeforeClose)) {
    const confirmed = await $confirm({
      title: stringInput(inputs.confirmTitle) || '关闭弹窗',
      content: stringInput(inputs.confirmContent) || '确认关闭当前弹窗？'
    });
    if (!confirmed) {
      return {
        closed: false,
        reason,
        ...(result !== undefined ? { result } : {})
      };
    }
  }

  if (!blockId) {
    return {
      closed: false,
      reason,
      ...(result !== undefined ? { result } : {})
    };
  }

  await callBlockMethod(blockId, 'close', {
    inputs: {
      closeResult
    }
  });

  return {
    closed: true,
    reason,
    ...(result !== undefined ? { result } : {})
  };
};

export const uploadFileAction: ActionExecutor = async ({ inputs, state }) => {
  const files = fileInputs(inputs.files ?? inputs.file);
  if (!files.length) {
    throw new Error('No file was provided for upload.');
  }

  const accept = acceptInputs(inputs.accept);
  const maxSize = numberInput(inputs.maxSize, 0);
  files.forEach((file) => {
    if (!fileMatchesAccept(file, accept)) {
      throw new Error(`File type is not allowed: ${file.name}`);
    }
    if (maxSize > 0 && file.size > maxSize) {
      throw new Error(`File is too large: ${file.name}`);
    }
  });

  const mode = stringInput(inputs.mode) || 'direct';
  const endpoint = stringInput(inputs.endpoint);
  const datasource = datasourceInput(inputs.datasource);
  const uploadedFiles = [];
  const urls: string[] = [];
  const rawResponses = [];

  for (const file of files) {
    const rawResponse = mode === 'oss-token'
      ? await uploadWithOssToken(file, inputs, state)
      : endpoint
        ? await uploadToEndpoint(file, endpoint, inputs)
        : await uploadToDatasource(file, datasource, state);
    const url = extractResponseUrl(rawResponse);
    if (url) urls.push(url);
    rawResponses.push(normalizeRawResponse(rawResponse));
    uploadedFiles.push(normalizeUploadedFile(file, {
      status: 'success',
      ...(url ? { url } : {}),
      response: normalizeRawResponse(rawResponse)
    }));
  }

  return {
    files: uploadedFiles,
    urls,
    success: true,
    rawResponse: rawResponses.length === 1 ? rawResponses[0] : rawResponses
  };
};

export const downloadBlobAction: ActionExecutor = async ({ inputs }) => {
  if (typeof document === 'undefined') {
    return { downloaded: false, fileName: stringInput(inputs.fileName) };
  }

  const fileName = stringInput(inputs.fileName) || 'download';
  const url = stringInput(inputs.url);
  let href = url;
  let objectUrl = '';

  if (!href) {
    const blobInput = inputs.blob;
    const blob = blobInput instanceof Blob
      ? blobInput
      : blobInput instanceof ArrayBuffer
        ? new Blob([blobInput], { type: stringInput(inputs.mime) })
        : undefined;
    if (!blob) {
      return { downloaded: false, fileName };
    }
    objectUrl = URL.createObjectURL(blob);
    href = objectUrl;
  }

  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (objectUrl && inputs.revokeObjectUrl !== false) {
    URL.revokeObjectURL(objectUrl);
  }

  return {
    downloaded: true,
    fileName
  };
};

export const actionExecutors: Record<string, ActionExecutor> = {
  execute_ds: executeDatasourceAction,
  confirm: confirmAction,
  open_dialog: openDialogAction,
  close_dialog: closeDialogAction,
  jump_url: jumpUrlAction,
  call_block_method: callBlockMethodAction,
  upload_file: uploadFileAction,
  download_blob: downloadBlobAction
};
