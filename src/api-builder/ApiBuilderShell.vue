<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { runDryApiTest, createRequestSnapshot } from '@/api-builder/dryRun';
import {
  blockDefinitions,
  cloneValue,
  conditionTypes,
  createBlock,
  createEmptyApiJson,
  declarationKey,
  getBlockDefinition,
  getProcessorDefinition,
  normalizeTemplateOptions,
  processorDefinitions,
  processorName,
  requestLocations,
  templateDefinitions
} from '@/api-builder/registry';
import { sampleApis } from '@/api-builder/samples';
import {
  appendTestCase,
  appendVersion,
  createDraft,
  duplicateDraft,
  generateApiJson,
  getActiveDraftId,
  loadDrafts,
  restoreVersion,
  saveDrafts,
  setActiveDraftId,
  upsertDraft
} from '@/api-builder/store';
import { hasBlockingErrors, hasDangerWarnings, validateApiJson } from '@/api-builder/validation';
import { buildVariableOptions, makeTemplate } from '@/api-builder/variables';
import type {
  ApiBlock,
  ApiBuilderDraft,
  ApiBuilderVersion,
  BlockFunctionName,
  BuilderSelection,
  Condition,
  DryRunResult,
  ProcessableKey,
  ProcessorConfig,
  RequestLocation,
  RequestSnapshot,
  ValidationIssue
} from '@/api-builder/types';

type ApiBuilderShellProps = {
  routeUuid?: string | null;
};

const props = withDefaults(defineProps<ApiBuilderShellProps>(), {
  routeUuid: null
});

const drafts = ref<ApiBuilderDraft[]>(loadDrafts());
const activeDraftId = ref(props.routeUuid || getActiveDraftId());
const selection = ref<BuilderSelection>({ type: 'api' });
const bottomTab = ref<'json' | 'validation' | 'test' | 'versions'>('json');
const draggedBlockUuid = ref('');
const testRequest = ref<RequestSnapshot>({ header: {}, query: {}, body: {} });
const lastTestResult = ref<DryRunResult | null>(null);
const templateOptions = reactive({
  selectedTemplateId: 'page',
  datasource: 'Mokelay',
  table: 'users',
  idField: 'id',
  requestFields: 'name,email',
  returnFields: 'id,name,email,created_at'
});

const activeDraft = computed(() => drafts.value.find((draft) => draft.id === activeDraftId.value) ?? null);
const activeApiJson = computed(() => activeDraft.value ? generateApiJson(activeDraft.value) : null);
const validationIssues = computed(() => activeApiJson.value ? validateApiJson(activeApiJson.value) : []);
const activeBlock = computed(() => {
  const currentSelection = selection.value;
  if (!activeDraft.value || currentSelection.type !== 'block') return null;
  return activeDraft.value.apiJson.blocks?.find((block) => block.uuid === currentSelection.uuid) ?? null;
});
const variableOptions = computed(() => {
  if (!activeDraft.value) return [];
  const beforeBlockUuid = selection.value.type === 'block' ? selection.value.uuid : undefined;
  return buildVariableOptions(activeDraft.value.apiJson, beforeBlockUuid);
});
const sortedDrafts = computed(() => [...drafts.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
const hasApiRoute = computed(() => Boolean(props.routeUuid));
const groupedBlocks = computed(() => ({
  query: blockDefinitions.filter((definition) => definition.group === 'query'),
  write: blockDefinitions.filter((definition) => definition.group === 'write'),
  session: blockDefinitions.filter((definition) => definition.group === 'session')
}));

watch(
  () => props.routeUuid,
  (uuid) => {
    if (!uuid) {
      return;
    }
    activeDraftId.value = uuid;
    setActiveDraftId(uuid);
    selection.value = { type: 'api' };
  },
  { immediate: true }
);

watch(
  drafts,
  (value) => {
    saveDrafts(value);
  },
  { deep: true }
);

watch(
  activeDraft,
  (draft) => {
    if (!draft) {
      lastTestResult.value = null;
      return;
    }
    testRequest.value = createRequestSnapshot(generateApiJson(draft), testRequest.value);
    setActiveDraftId(draft.id);
  },
  { immediate: true }
);

function navigateToList() {
  window.location.hash = '/apis';
}

function navigateToDraft(draft: ApiBuilderDraft) {
  activeDraftId.value = draft.id;
  setActiveDraftId(draft.id);
  window.location.hash = `/apis/${encodeURIComponent(draft.id)}`;
}

function createBlankDraft() {
  const draft = createDraft(createEmptyApiJson());
  drafts.value = upsertDraft(drafts.value, draft);
  navigateToDraft(draft);
}

function createFromApiJson(apiJson: unknown) {
  const draft = createDraft(apiJson as never);
  drafts.value = upsertDraft(drafts.value, draft);
  navigateToDraft(draft);
}

function createFromTemplate(templateId = templateOptions.selectedTemplateId) {
  const definition = templateDefinitions.find((item) => item.id === templateId);
  if (!definition) return;

  const options = normalizeTemplateOptions({
    datasource: templateOptions.datasource,
    table: templateOptions.table,
    idField: templateOptions.idField,
    requestFields: splitFields(templateOptions.requestFields),
    returnFields: splitFields(templateOptions.returnFields)
  });
  createFromApiJson(definition.build(options));
}

function duplicateCurrentDraft() {
  if (!activeDraft.value) return;
  const draft = duplicateDraft(activeDraft.value);
  drafts.value = upsertDraft(drafts.value, draft);
  navigateToDraft(draft);
}

function deleteDraft(draft: ApiBuilderDraft) {
  if (!window.confirm(`删除本地草稿「${draft.apiJson.alias || draft.apiJson.uuid}」？`)) {
    return;
  }
  drafts.value = drafts.value.filter((item) => item.id !== draft.id);
  if (activeDraftId.value === draft.id) {
    activeDraftId.value = '';
    navigateToList();
  }
}

function saveActiveDraft() {
  if (!activeDraft.value) return;
  drafts.value = upsertDraft(drafts.value, activeDraft.value);
}

function publishLocally() {
  if (!activeDraft.value) return;
  const issues = validationIssues.value;
  if (hasBlockingErrors(issues)) {
    bottomTab.value = 'validation';
    return;
  }
  if (hasDangerWarnings(issues) && !window.confirm('存在会影响整张表的高风险操作，仍然本地发布？')) {
    return;
  }
  appendVersion(activeDraft.value, '本地发布快照');
  activeDraft.value.status = 'published';
  saveActiveDraft();
}

function addBlock(functionName: BlockFunctionName) {
  if (!activeDraft.value) return;
  const block = createBlock(functionName);
  activeDraft.value.apiJson.blocks = [...(activeDraft.value.apiJson.blocks ?? []), block];
  selection.value = { type: 'block', uuid: block.uuid };
  nextTick(() => {
    document.querySelector(`[data-block-uuid="${block.uuid}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}

function duplicateBlock(block: ApiBlock) {
  if (!activeDraft.value) return;
  const copy = cloneValue(block);
  copy.uuid = `${block.uuid}_copy`;
  copy.alias = `${block.alias || block.uuid} 副本`;
  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const index = blocks.findIndex((item) => item.uuid === block.uuid);
  blocks.splice(index + 1, 0, copy);
  selection.value = { type: 'block', uuid: copy.uuid };
}

function removeBlock(block: ApiBlock) {
  if (!activeDraft.value) return;
  activeDraft.value.apiJson.blocks = (activeDraft.value.apiJson.blocks ?? []).filter((item) => item.uuid !== block.uuid);
  activeDraft.value.disabledBlockIds = activeDraft.value.disabledBlockIds.filter((uuid) => uuid !== block.uuid);
  selection.value = { type: 'api' };
}

function toggleBlockDisabled(block: ApiBlock) {
  if (!activeDraft.value) return;
  const disabled = new Set(activeDraft.value.disabledBlockIds);
  if (disabled.has(block.uuid)) {
    disabled.delete(block.uuid);
  } else {
    disabled.add(block.uuid);
  }
  activeDraft.value.disabledBlockIds = Array.from(disabled);
}

function isBlockDisabled(block: ApiBlock) {
  return activeDraft.value?.disabledBlockIds.includes(block.uuid) ?? false;
}

function onBlockDragStart(block: ApiBlock) {
  draggedBlockUuid.value = block.uuid;
}

function onBlockDrop(targetBlock: ApiBlock) {
  if (!activeDraft.value || !draggedBlockUuid.value || draggedBlockUuid.value === targetBlock.uuid) return;
  const blocks = activeDraft.value.apiJson.blocks ?? [];
  const fromIndex = blocks.findIndex((block) => block.uuid === draggedBlockUuid.value);
  const toIndex = blocks.findIndex((block) => block.uuid === targetBlock.uuid);
  if (fromIndex === -1 || toIndex === -1) return;
  const [dragged] = blocks.splice(fromIndex, 1);
  blocks.splice(toIndex, 0, dragged);
  draggedBlockUuid.value = '';
}

function selectBlock(block: ApiBlock) {
  selection.value = { type: 'block', uuid: block.uuid };
}

function issueCount(severity: ValidationIssue['severity']) {
  return validationIssues.value.filter((issue) => issue.severity === severity).length;
}

function selectIssue(issue: ValidationIssue) {
  if (issue.target === 'api' || issue.target === 'request' || issue.target === 'response') {
    selection.value = { type: issue.target };
    return;
  }
  selection.value = { type: 'block', uuid: issue.target.replace(/^block:/, '') };
}

function getRequestList(location: RequestLocation) {
  if (!activeDraft.value) return [];
  const request = ensureRequest();
  request[location] ??= [];
  return request[location]!;
}

function addRequestParam(location: RequestLocation) {
  getRequestList(location).push({
    key: location === 'query' ? 'id' : 'name',
    processors: location === 'body' ? ['is_not_null'] : []
  });
}

function removeRequestParam(location: RequestLocation, index: number) {
  getRequestList(location).splice(index, 1);
}

function updateRequestKey(location: RequestLocation, index: number, key: string) {
  const list = getRequestList(location);
  const item = list[index];
  if (typeof item === 'string') {
    list[index] = key;
    return;
  }
  item.key = key;
}

function updateRequestProcessors(location: RequestLocation, index: number, processors: ProcessorConfig[]) {
  const list = getRequestList(location);
  const item = list[index];
  if (typeof item === 'string') {
    list[index] = { key: item, processors };
    return;
  }
  item.processors = processors;
}

function toggleRequired(location: RequestLocation, index: number) {
  const processors = getRequestProcessors(getRequestList(location)[index]);
  const names = processors.map(processorName);
  const next = names.includes('is_not_null')
    ? processors.filter((processor) => processorName(processor) !== 'is_not_null')
    : ['is_not_null', ...processors];
  updateRequestProcessors(location, index, next);
}

function addRequestProcessor(location: RequestLocation, index: number, name: string) {
  if (!name) return;
  const definition = getProcessorDefinition(name);
  const processor: ProcessorConfig = definition?.needsParam
    ? { processor: name, param: cloneValue(definition.defaultParam ?? []) }
    : name;
  updateRequestProcessors(location, index, [...getRequestProcessors(getRequestList(location)[index]), processor]);
}

function removeRequestProcessor(location: RequestLocation, index: number, processorIndex: number) {
  const processors = getRequestProcessors(getRequestList(location)[index]);
  processors.splice(processorIndex, 1);
  updateRequestProcessors(location, index, processors);
}

function getRequestKey(item: ProcessableKey) {
  return typeof item === 'string' ? item : item.key;
}

function getRequestProcessors(item: ProcessableKey) {
  return typeof item === 'string' ? [] : [...(item.processors ?? [])];
}

function isRequestRequired(item: ProcessableKey) {
  return typeof item === 'string' || getRequestProcessors(item).some((processor) => processorName(processor) === 'is_not_null');
}

function ensureRequest() {
  if (!activeDraft.value) {
    throw new Error('No active draft');
  }
  activeDraft.value.apiJson.request ??= {};
  return activeDraft.value.apiJson.request;
}

function blockInputs(block: ApiBlock | null = activeBlock.value) {
  if (!block) return {};
  block.inputs ??= {};
  return block.inputs;
}

function updateBlockInput(key: string, value: unknown) {
  if (!activeBlock.value) return;
  blockInputs()[key] = value;
}

function stringInput(key: string) {
  const value = blockInputs()[key];
  return typeof value === 'string' ? value : '';
}

function arrayInput(key: string) {
  const value = blockInputs()[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').join(', ') : '';
}

function updateArrayInput(key: string, value: string) {
  updateBlockInput(key, splitFields(value));
}

function getFieldEntries() {
  const fields = blockInputs().fields;
  return isRecord(fields) ? Object.entries(fields) : [];
}

function addFieldMapping() {
  const fields = ensureRecordInput('fields');
  fields.name = makeTemplate('request.body.name');
}

function updateFieldMapping(oldKey: string, newKey: string, value: unknown) {
  const fields = ensureRecordInput('fields');
  delete fields[oldKey];
  fields[newKey || oldKey] = value;
}

function removeFieldMapping(key: string) {
  const fields = ensureRecordInput('fields');
  delete fields[key];
}

function ensureRecordInput(key: string) {
  const inputs = blockInputs();
  if (!isRecord(inputs[key])) {
    inputs[key] = {};
  }
  return inputs[key] as Record<string, unknown>;
}

function conditionList() {
  const inputs = blockInputs();
  if (!Array.isArray(inputs.conditions)) {
    inputs.conditions = [];
  }
  return inputs.conditions as Condition[];
}

function addCondition() {
  conditionList().push({
    group: false,
    fieldName: 'id',
    conditionType: 'EQ',
    fieldValue: makeTemplate('request.query.id')
  });
}

function addConditionGroup() {
  conditionList().push({
    group: true,
    groupType: 'OR',
    groups: [
      {
        group: false,
        fieldName: 'plan',
        conditionType: 'EQ',
        fieldValue: 'free'
      },
      {
        group: false,
        fieldName: 'plan',
        conditionType: 'EQ',
        fieldValue: 'pro'
      }
    ]
  });
}

function removeCondition(index: number) {
  conditionList().splice(index, 1);
}

function updateConditionGroupJson(condition: Extract<Condition, { group: true }>, value: string) {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      condition.groups = parsed;
    }
  } catch {
    // Keep the last valid group while the user is typing partial JSON.
  }
}

function orderList() {
  const inputs = blockInputs();
  if (!Array.isArray(inputs.orderBy)) {
    inputs.orderBy = [];
  }
  return inputs.orderBy as Array<{ fieldName: string; direction: 'ASC' | 'DESC' }>;
}

function addOrderBy() {
  orderList().push({ fieldName: 'created_at', direction: 'DESC' });
}

function removeOrderBy(index: number) {
  orderList().splice(index, 1);
}

function getResponseEntries() {
  const response = ensureResponseObject();
  return Object.entries(response);
}

function ensureResponseObject() {
  if (!activeDraft.value) return {};
  if (!isRecord(activeDraft.value.apiJson.response)) {
    activeDraft.value.apiJson.response = {};
  }
  return activeDraft.value.apiJson.response;
}

function addResponseField() {
  const response = ensureResponseObject();
  response.data = variableOptions.value[0] ? makeTemplate(variableOptions.value[0].path) : null;
}

function updateResponseField(oldKey: string, newKey: string, value: unknown) {
  const response = ensureResponseObject();
  delete response[oldKey];
  response[newKey || oldKey] = value;
}

function removeResponseField(key: string) {
  const response = ensureResponseObject();
  delete response[key];
}

function setTemplateValue(target: (value: unknown) => void, path: string) {
  if (!path) return;
  target(makeTemplate(path));
}

function formatUnknown(value: unknown) {
  if (value === undefined) return '';
  if (isRecord(value) && typeof value.template === 'string') return value.template;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function parseLooseValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) {
    return { template: trimmed };
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function updateParamFromText(processor: ProcessorConfig, value: string) {
  if (typeof processor === 'string') return;
  processor.param = parseLooseValue(value);
}

function processorLabel(processor: ProcessorConfig) {
  const name = processorName(processor);
  return getProcessorDefinition(name)?.title ?? name;
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function copyJson() {
  if (!activeApiJson.value) return;
  void navigator.clipboard?.writeText(stringifyJson(activeApiJson.value));
}

function createVersionSnapshot() {
  if (!activeDraft.value) return;
  appendVersion(activeDraft.value, '手动快照');
  bottomTab.value = 'versions';
}

function restoreVersionSnapshot(version: ApiBuilderVersion) {
  if (!activeDraft.value) return;
  if (!window.confirm(`回滚到「${version.label}」？当前草稿会变为未发布。`)) return;
  restoreVersion(activeDraft.value, version);
  selection.value = { type: 'api' };
}

function updateTestValue(location: RequestLocation, key: string, value: string) {
  testRequest.value = {
    ...testRequest.value,
    [location]: {
      ...testRequest.value[location],
      [key]: parseLooseValue(value)
    }
  };
}

function runTest() {
  if (!activeDraft.value) return;
  const apiJson = generateApiJson(activeDraft.value);
  const result = runDryApiTest(apiJson, testRequest.value);
  lastTestResult.value = result;
  appendTestCase(activeDraft.value, {
    id: `test_${Date.now()}`,
    name: result.ok ? 'Dry-run 通过' : 'Dry-run 失败',
    request: result.request,
    result,
    createdAt: new Date().toISOString()
  });
  bottomTab.value = 'test';
}

function resetTestForm() {
  if (!activeApiJson.value) return;
  testRequest.value = createRequestSnapshot(activeApiJson.value);
}

function splitFields(value: string | string[]) {
  if (Array.isArray(value)) return value.map((field) => field.trim()).filter(Boolean);
  return value.split(',').map((field) => field.trim()).filter(Boolean);
}

function formatDate(value: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
</script>

<template>
  <section data-testid="api-builder-shell" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <div v-if="!hasApiRoute" class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-teal-700 dark:text-teal-300">API Builder</p>
            <h2 class="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">可视化搭建内部数据 API</h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              纯客户端草稿工作台。先把接口入口、请求参数、编排步骤和响应结构搭顺，再导出符合 Mokelay Orchestration 的 API JSON。
            </p>
          </div>
          <button data-testid="api-builder-new" class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="createBlankDraft">
            新建 API
          </button>
        </div>

        <div class="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th class="px-4 py-3">名称</th>
                <th class="px-4 py-3">UUID</th>
                <th class="px-4 py-3">方法</th>
                <th class="px-4 py-3">状态</th>
                <th class="px-4 py-3">最近编辑</th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-if="!sortedDrafts.length">
                <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">暂无本地草稿，可以从右侧模板或样例开始。</td>
              </tr>
              <tr v-for="draft in sortedDrafts" :key="draft.id" class="bg-white dark:bg-slate-900">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ draft.apiJson.alias || '未命名 API' }}</td>
                <td class="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ draft.apiJson.uuid }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">{{ draft.apiJson.method }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-md px-2 py-1 text-xs font-semibold" :class="draft.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100'">
                    {{ draft.status === 'published' ? '本地已发布' : '草稿' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ formatDate(draft.updatedAt) }}</td>
                <td class="px-4 py-3 text-right">
                  <button class="rounded-md px-2 py-1 text-teal-700 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-500/10" @click="navigateToDraft(draft)">打开</button>
                  <button class="rounded-md px-2 py-1 text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/10" @click="deleteDraft(draft)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="space-y-4">
        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">从模板创建</h3>
          <div class="mt-3 space-y-3">
            <select v-model="templateOptions.selectedTemplateId" class="builder-input">
              <option v-for="template in templateDefinitions" :key="template.id" :value="template.id">{{ template.title }}</option>
            </select>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="templateOptions.datasource" class="builder-input" placeholder="数据源，如 Mokelay">
              <input v-model="templateOptions.table" class="builder-input" placeholder="表名，如 users">
              <input v-model="templateOptions.idField" class="builder-input" placeholder="主键，如 id">
              <input v-model="templateOptions.requestFields" class="builder-input" placeholder="请求字段，逗号分隔">
            </div>
            <input v-model="templateOptions.returnFields" class="builder-input" placeholder="返回字段，逗号分隔">
            <button class="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950" @click="createFromTemplate()">
              使用模板
            </button>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">内置样例</h3>
          <div class="mt-3 grid gap-2">
            <button
              v-for="sample in sampleApis"
              :key="sample.id"
              class="rounded-lg border border-slate-200 p-3 text-left hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:border-teal-500/60 dark:hover:bg-teal-500/10"
              @click="createFromApiJson(sample.apiJson)"
            >
              <span class="block text-sm font-semibold text-slate-900 dark:text-white">{{ sample.title }}</span>
              <span class="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{{ sample.description }}</span>
            </button>
          </div>
        </section>
      </aside>
    </div>

    <div v-else-if="activeDraft && activeApiJson" class="flex flex-1 flex-col gap-4">
      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button class="mb-2 text-sm font-medium text-teal-700 hover:text-teal-500 dark:text-teal-300" @click="navigateToList">返回 API 列表</button>
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-xl font-semibold text-slate-950 dark:text-white">{{ activeDraft.apiJson.alias || '未命名 API' }}</h2>
              <span class="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-100">{{ activeDraft.apiJson.method }}</span>
              <span class="rounded-md px-2 py-1 text-xs font-semibold" :class="activeDraft.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100'">
                {{ activeDraft.status === 'published' ? '本地已发布' : '草稿' }}
              </span>
              <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">/api/mokelay/{{ activeDraft.apiJson.uuid }}</code>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="builder-secondary-button" @click="duplicateCurrentDraft">复制 API</button>
            <button class="builder-secondary-button" @click="createVersionSnapshot">保存快照</button>
            <button class="builder-secondary-button" @click="saveActiveDraft">保存本地</button>
            <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="publishLocally">本地发布</button>
          </div>
        </div>
      </section>

      <div class="grid min-h-[660px] flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_380px]">
        <aside class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="grid grid-cols-3 gap-2">
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'api' }" @click="selection = { type: 'api' }">入口</button>
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'request' }" @click="selection = { type: 'request' }">请求</button>
            <button class="builder-nav-button" :class="{ 'builder-nav-button-active': selection.type === 'response' }" @click="selection = { type: 'response' }">响应</button>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">查询数据</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.query" :key="block.functionName" class="builder-palette-button" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">写入数据</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.write" :key="block.functionName" class="builder-palette-button" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">登录态</h3>
            <div class="mt-2 grid gap-2">
              <button v-for="block in groupedBlocks.session" :key="block.functionName" class="builder-palette-button" @click="addBlock(block.functionName)">
                <span>{{ block.title }}</span>
                <small>{{ block.description }}</small>
              </button>
            </div>
          </div>
        </aside>

        <main class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-950 dark:text-white">编排步骤</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">按顺序执行。拖动步骤卡片可以排序。</p>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="rounded-md bg-rose-100 px-2 py-1 font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-100">{{ issueCount('error') }} 错误</span>
              <span class="rounded-md bg-amber-100 px-2 py-1 font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">{{ issueCount('warning') }} 提醒</span>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <button class="w-full rounded-lg border border-dashed border-slate-300 px-4 py-5 text-sm font-medium text-slate-500 hover:border-teal-400 hover:bg-teal-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-teal-500 dark:hover:bg-teal-500/10" v-if="!activeDraft.apiJson.blocks?.length" @click="addBlock('read')">
              添加第一个步骤
            </button>

            <article
              v-for="(block, index) in activeDraft.apiJson.blocks"
              :key="block.uuid"
              :data-block-uuid="block.uuid"
              draggable="true"
              class="rounded-xl border p-4 transition"
              :class="[
                selection.type === 'block' && selection.uuid === block.uuid ? 'border-teal-400 bg-teal-50/70 dark:border-teal-400 dark:bg-teal-500/10' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50',
                isBlockDisabled(block) ? 'opacity-55' : ''
              ]"
              @click="selectBlock(block)"
              @dragstart="onBlockDragStart(block)"
              @dragover.prevent
              @drop="onBlockDrop(block)"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-950">{{ index + 1 }}</span>
                    <h4 class="font-semibold text-slate-950 dark:text-white">{{ block.alias || getBlockDefinition(block.functionName)?.title || block.functionName }}</h4>
                    <span class="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">{{ block.functionName }}</span>
                    <span v-if="isBlockDisabled(block)" class="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">已禁用</span>
                  </div>
                  <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {{ block.uuid }} · {{ (block.outputs || []).map(declarationKey).join(', ') || '无输出' }}
                  </p>
                </div>
                <div class="flex flex-wrap gap-1">
                  <button class="builder-icon-button" @click.stop="toggleBlockDisabled(block)">{{ isBlockDisabled(block) ? '启用' : '禁用' }}</button>
                  <button class="builder-icon-button" @click.stop="duplicateBlock(block)">复制</button>
                  <button class="builder-icon-button text-rose-700 dark:text-rose-200" @click.stop="removeBlock(block)">删除</button>
                </div>
              </div>
              <div class="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                <div class="rounded-lg bg-white p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">数据源：{{ isRecord(block.inputs) ? block.inputs.datasource || '-' : '-' }}</div>
                <div class="rounded-lg bg-white p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">表：{{ isRecord(block.inputs) ? block.inputs.table || '-' : '-' }}</div>
                <div class="rounded-lg bg-white p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">输出：{{ (block.outputs || []).map(declarationKey).join(', ') || '-' }}</div>
              </div>
            </article>
          </div>
        </main>

        <aside class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <template v-if="selection.type === 'api'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">接口入口</h3>
            <div class="mt-4 space-y-3">
              <label class="builder-field">
                <span>接口名称</span>
                <input v-model="activeDraft.apiJson.alias" class="builder-input">
              </label>
              <label class="builder-field">
                <span>API 标识</span>
                <input v-model="activeDraft.apiJson.uuid" class="builder-input font-mono">
              </label>
              <label class="builder-field">
                <span>请求方法</span>
                <select v-model="activeDraft.apiJson.method" class="builder-input">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </label>
              <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                路径预览：<code>/api/mokelay/{{ activeDraft.apiJson.uuid }}</code>
              </div>
            </div>
          </template>

          <template v-else-if="selection.type === 'request'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">请求参数</h3>
            <div class="mt-4 space-y-5">
              <section v-for="location in requestLocations" :key="location.value">
                <div class="mb-2 flex items-center justify-between">
                  <h4 class="text-sm font-semibold text-slate-900 dark:text-white">{{ location.title }}</h4>
                  <button class="builder-small-button" @click="addRequestParam(location.value)">添加参数</button>
                </div>
                <div class="space-y-2">
                  <div v-for="(param, index) in getRequestList(location.value)" :key="`${location.value}-${index}`" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <input class="builder-input" :value="getRequestKey(param)" placeholder="参数名" @input="updateRequestKey(location.value, index, ($event.target as HTMLInputElement).value)">
                      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input type="checkbox" :checked="isRequestRequired(param)" @change="toggleRequired(location.value, index)">
                        必填
                      </label>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span v-for="(processor, processorIndex) in getRequestProcessors(param)" :key="processorIndex" class="rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-500/20 dark:text-teal-100">
                        {{ processorLabel(processor) }}
                        <button class="ml-1" @click="removeRequestProcessor(location.value, index, processorIndex)">×</button>
                      </span>
                      <select class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" @change="addRequestProcessor(location.value, index, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                        <option value="">添加规则</option>
                        <option v-for="processor in processorDefinitions" :key="processor.name" :value="processor.name">{{ processor.title }}</option>
                      </select>
                      <button class="ml-auto text-xs text-rose-600" @click="removeRequestParam(location.value, index)">删除</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </template>

          <template v-else-if="selection.type === 'response'">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">响应组装</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">把变量映射到响应 data 的字段。</p>
            <div class="mt-4 space-y-3">
              <div v-for="[key, value] in getResponseEntries()" :key="key" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <input class="builder-input" :value="key" @input="updateResponseField(key, ($event.target as HTMLInputElement).value, value)">
                <div class="mt-2 grid gap-2">
                  <input class="builder-input font-mono text-xs" :value="formatUnknown(value)" @input="updateResponseField(key, key, parseLooseValue(($event.target as HTMLInputElement).value))">
                  <select class="builder-input" @change="setTemplateValue((next) => updateResponseField(key, key, next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                    <option value="">从变量选择器填入</option>
                    <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }} · {{ option.path }}</option>
                  </select>
                </div>
                <button class="mt-2 text-xs text-rose-600" @click="removeResponseField(key)">删除字段</button>
              </div>
              <button class="builder-secondary-button w-full" @click="addResponseField">添加响应字段</button>
            </div>
          </template>

          <template v-else-if="activeBlock">
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">步骤配置</h3>
            <div class="mt-4 space-y-3">
              <label class="builder-field">
                <span>业务名称</span>
                <input v-model="activeBlock.alias" class="builder-input">
              </label>
              <label class="builder-field">
                <span>Block UUID</span>
                <input v-model="activeBlock.uuid" class="builder-input font-mono">
              </label>
              <label class="builder-field">
                <span>类型</span>
                <input :value="getBlockDefinition(activeBlock.functionName)?.title || activeBlock.functionName" class="builder-input" disabled>
              </label>

              <template v-if="['list', 'page', 'count', 'read', 'delete', 'create', 'update'].includes(activeBlock.functionName)">
                <label class="builder-field">
                  <span>数据源</span>
                  <input class="builder-input" :value="stringInput('datasource')" @input="updateBlockInput('datasource', ($event.target as HTMLInputElement).value)">
                </label>
                <label class="builder-field">
                  <span>表名</span>
                  <input class="builder-input" :value="stringInput('table')" @input="updateBlockInput('table', ($event.target as HTMLInputElement).value)">
                </label>
              </template>

              <template v-if="['list', 'page', 'read'].includes(activeBlock.functionName)">
                <label class="builder-field">
                  <span>查询字段</span>
                  <input class="builder-input" :value="arrayInput('fields')" placeholder="id, name, email" @input="updateArrayInput('fields', ($event.target as HTMLInputElement).value)">
                </label>
              </template>

              <template v-if="activeBlock.functionName === 'page'">
                <div class="grid grid-cols-2 gap-2">
                  <label class="builder-field">
                    <span>页码</span>
                    <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().page)" @input="updateBlockInput('page', parseLooseValue(($event.target as HTMLInputElement).value))">
                  </label>
                  <label class="builder-field">
                    <span>每页数量</span>
                    <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().pageSize)" @input="updateBlockInput('pageSize', parseLooseValue(($event.target as HTMLInputElement).value))">
                  </label>
                </div>
              </template>

              <template v-if="activeBlock.functionName === 'create'">
                <label class="builder-field">
                  <span>返回 ID 字段</span>
                  <input class="builder-input" :value="stringInput('idField')" @input="updateBlockInput('idField', ($event.target as HTMLInputElement).value)">
                </label>
              </template>

              <template v-if="['create', 'update'].includes(activeBlock.functionName)">
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">写入字段</h4>
                    <button class="builder-small-button" @click="addFieldMapping">添加字段</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="[fieldKey, fieldValue] in getFieldEntries()" :key="fieldKey" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <input class="builder-input" :value="fieldKey" @input="updateFieldMapping(fieldKey, ($event.target as HTMLInputElement).value, fieldValue)">
                      <input class="builder-input mt-2 font-mono text-xs" :value="formatUnknown(fieldValue)" @input="updateFieldMapping(fieldKey, fieldKey, parseLooseValue(($event.target as HTMLInputElement).value))">
                      <select class="builder-input mt-2" @change="setTemplateValue((next) => updateFieldMapping(fieldKey, fieldKey, next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                        <option value="">选择变量</option>
                        <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                      </select>
                      <button class="mt-2 text-xs text-rose-600" @click="removeFieldMapping(fieldKey)">删除字段</button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="['list', 'page', 'count', 'read', 'delete', 'update'].includes(activeBlock.functionName)">
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">条件</h4>
                    <div class="flex gap-1">
                      <button class="builder-small-button" @click="addCondition">添加条件</button>
                      <button class="builder-small-button" @click="addConditionGroup">添加 OR 组</button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(condition, index) in conditionList()" :key="index" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <template v-if="!condition.group">
                        <div class="grid gap-2 sm:grid-cols-2">
                          <input v-model="condition.fieldName" class="builder-input" placeholder="字段">
                          <select v-model="condition.conditionType" class="builder-input">
                            <option v-for="item in conditionTypes" :key="item.value" :value="item.value">{{ item.title }}</option>
                          </select>
                        </div>
                        <input class="builder-input mt-2 font-mono text-xs" :value="formatUnknown(condition.fieldValue)" @input="condition.fieldValue = parseLooseValue(($event.target as HTMLInputElement).value)">
                        <select class="builder-input mt-2" @change="setTemplateValue((next) => condition.fieldValue = next, ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                          <option value="">选择变量</option>
                          <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                        </select>
                      </template>
                      <template v-else>
                        <div class="flex items-center justify-between gap-2">
                          <select v-model="condition.groupType" class="builder-input">
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                          <span class="text-xs text-slate-500">条件组包含 {{ condition.groups.length }} 条，JSON 预览会保留嵌套结构。</span>
                        </div>
                        <textarea class="builder-input mt-2 min-h-28 font-mono text-xs" :value="stringifyJson(condition.groups)" @input="updateConditionGroupJson(condition, ($event.target as HTMLTextAreaElement).value)"></textarea>
                      </template>
                      <button class="mt-2 text-xs text-rose-600" @click="removeCondition(index)">删除条件</button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="['list', 'page'].includes(activeBlock.functionName)">
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white">排序</h4>
                    <button class="builder-small-button" @click="addOrderBy">添加排序</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(order, index) in orderList()" :key="index" class="grid grid-cols-[minmax(0,1fr)_96px_auto] gap-2">
                      <input v-model="order.fieldName" class="builder-input" placeholder="字段">
                      <select v-model="order.direction" class="builder-input">
                        <option value="ASC">ASC</option>
                        <option value="DESC">DESC</option>
                      </select>
                      <button class="text-xs text-rose-600" @click="removeOrderBy(index)">删除</button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="['addSession', 'removeSession', 'readSession'].includes(activeBlock.functionName)">
                <label class="builder-field">
                  <span>Session key</span>
                  <input class="builder-input" :value="stringInput('key')" @input="updateBlockInput('key', ($event.target as HTMLInputElement).value)">
                </label>
              </template>
              <template v-if="activeBlock.functionName === 'addSession'">
                <label class="builder-field">
                  <span>Session value</span>
                  <input class="builder-input font-mono text-xs" :value="formatUnknown(blockInputs().value)" @input="updateBlockInput('value', parseLooseValue(($event.target as HTMLInputElement).value))">
                </label>
                <select class="builder-input" @change="setTemplateValue((next) => updateBlockInput('value', next), ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
                  <option value="">选择变量</option>
                  <option v-for="option in variableOptions" :key="option.id" :value="option.path">{{ option.label }}</option>
                </select>
              </template>
            </div>
          </template>
        </aside>
      </div>

      <section class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex flex-wrap gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
          <button class="builder-tab-button" :class="{ 'builder-tab-button-active': bottomTab === 'json' }" @click="bottomTab = 'json'">JSON 预览</button>
          <button class="builder-tab-button" :class="{ 'builder-tab-button-active': bottomTab === 'validation' }" @click="bottomTab = 'validation'">校验 {{ validationIssues.length }}</button>
          <button class="builder-tab-button" :class="{ 'builder-tab-button-active': bottomTab === 'test' }" @click="bottomTab = 'test'">测试</button>
          <button class="builder-tab-button" :class="{ 'builder-tab-button-active': bottomTab === 'versions' }" @click="bottomTab = 'versions'">版本 {{ activeDraft.versions.length }}</button>
        </div>

        <div class="p-4">
          <div v-if="bottomTab === 'json'">
            <div class="mb-3 flex justify-end">
              <button class="builder-secondary-button" @click="copyJson">复制 JSON</button>
            </div>
            <pre data-testid="api-builder-json" class="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">{{ stringifyJson(activeApiJson) }}</pre>
          </div>

          <div v-else-if="bottomTab === 'validation'" class="space-y-2">
            <p v-if="!validationIssues.length" class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">校验通过，可以本地发布或复制 JSON。</p>
            <button
              v-for="issue in validationIssues"
              :key="issue.id"
              class="block w-full rounded-lg border p-3 text-left text-sm"
              :class="issue.severity === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'"
              @click="selectIssue(issue)"
            >
              <strong>{{ issue.severity === 'error' ? '错误' : '提醒' }}</strong> · {{ issue.message }}
            </button>
          </div>

          <div v-else-if="bottomTab === 'test'" class="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div class="space-y-4">
              <section v-for="location in requestLocations" :key="location.value">
                <h4 class="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{{ location.title }}</h4>
                <div class="space-y-2">
                  <label v-for="param in activeApiJson.request?.[location.value] || []" :key="`${location.value}-${declarationKey(param)}`" class="builder-field">
                    <span>{{ declarationKey(param) }}</span>
                    <input class="builder-input" :value="formatUnknown(testRequest[location.value]?.[declarationKey(param)])" @input="updateTestValue(location.value, declarationKey(param), ($event.target as HTMLInputElement).value)">
                  </label>
                  <p v-if="!(activeApiJson.request?.[location.value] || []).length" class="text-xs text-slate-500 dark:text-slate-400">没有 {{ location.title }} 参数。</p>
                </div>
              </section>
              <div class="flex gap-2">
                <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="runTest">运行 Dry-run</button>
                <button class="builder-secondary-button" @click="resetTestForm">重置表单</button>
              </div>
            </div>
            <div>
              <p v-if="!lastTestResult" class="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">填写测试表单后运行 dry-run。它不会访问数据库，只验证当前草稿的 JSON、模板路径和模拟链路。</p>
              <div v-else class="space-y-3">
                <p class="rounded-lg p-3 text-sm font-semibold" :class="lastTestResult.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100' : 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-100'">
                  {{ lastTestResult.ok ? 'Dry-run 通过' : lastTestResult.errors.join('；') }}
                </p>
                <div class="grid gap-3 lg:grid-cols-2">
                  <pre class="max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{{ stringifyJson({ ok: lastTestResult.ok, data: lastTestResult.data }) }}</pre>
                  <div class="space-y-2">
                    <div v-for="log in lastTestResult.logs" :key="log.uuid" class="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                      <div class="flex items-center justify-between gap-2">
                        <strong class="text-slate-900 dark:text-white">{{ log.alias }}</strong>
                        <span class="rounded px-2 py-0.5 text-xs" :class="log.status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'">{{ log.status }}</span>
                      </div>
                      <p class="mt-1 text-xs text-slate-500">{{ log.message }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-2">
            <p v-if="!activeDraft.versions.length" class="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">还没有本地版本。点击“保存快照”或“本地发布”会生成版本。</p>
            <div v-for="version in activeDraft.versions" :key="version.id" class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ version.label }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(version.createdAt) }} · {{ version.apiJson.blocks?.length || 0 }} steps</p>
              </div>
              <button class="builder-secondary-button" @click="restoreVersionSnapshot(version)">回滚</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section v-else class="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-xl font-semibold text-slate-950 dark:text-white">找不到这个本地 API 草稿</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">草稿只保存在当前浏览器。可以返回列表重新创建。</p>
      <button class="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" @click="navigateToList">返回 API 列表</button>
    </section>
  </section>
</template>

<style scoped>
.builder-input {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800;
}

.builder-field {
  @apply flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200;
}

.builder-secondary-button {
  @apply rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800;
}

.builder-small-button {
  @apply rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800;
}

.builder-icon-button {
  @apply rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900;
}

.builder-nav-button {
  @apply rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-teal-500/10;
}

.builder-nav-button-active {
  @apply border-teal-400 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-500/20 dark:text-teal-100;
}

.builder-palette-button {
  @apply rounded-lg border border-slate-200 p-3 text-left hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:hover:border-teal-500/60 dark:hover:bg-teal-500/10;
}

.builder-palette-button span {
  @apply block text-sm font-semibold text-slate-900 dark:text-white;
}

.builder-palette-button small {
  @apply mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400;
}

.builder-tab-button {
  @apply rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800;
}

.builder-tab-button-active {
  @apply bg-slate-900 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-white;
}
</style>
