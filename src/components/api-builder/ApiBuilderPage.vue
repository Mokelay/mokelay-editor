<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useSortable } from '@vueuse/integrations/useSortable';
import { diff } from 'jsondiffpatch';
import { storeToRefs } from 'pinia';
import { useApiBuilderStore } from '@/stores/apiBuilder';
import { blockDefinitions, blockDefinitionOf, processorDefinitions, processorLabel } from '@/api-builder/registries';
import { getVariableOptions } from '@/api-builder/variables';
import type { ApiBlock, BlockFunctionName, Condition, ProcessorConfig, RequestLocation } from '@/api-builder/types';

const props = defineProps<{
  uuid: string | null;
}>();

const store = useApiBuilderStore();
const {
  apiJson,
  detail,
  parameters,
  blocks,
  selectedBlockUuid,
  selectedPanel,
  selectedBlock,
  datasources,
  tables,
  generatedApiJson,
  validationIssues,
  hasErrors,
  hasDanger,
  isLoading,
  isSaving,
  isTesting,
  error,
  testRequest,
  testResult
} = storeToRefs(store);

const blockListRef = ref<HTMLElement | null>(null);
const changeNote = ref('');
const quickConditionField = ref('');
const quickConditionValue = ref('');
const quickResponseField = ref('');

const sortableBlocks = computed<ApiBlock[]>({
  get: () => blocks.value,
  set: (value) => store.moveBlocks(value)
});

useSortable(blockListRef, sortableBlocks, {
  animation: 150,
  handle: '.api-builder-step__handle'
});

const currentVariables = computed(() => getVariableOptions(generatedApiJson.value, selectedBlock.value?.uuid));
const selectedInputs = computed(() => selectedBlock.value?.inputs && typeof selectedBlock.value.inputs === 'object'
  ? selectedBlock.value.inputs as Record<string, unknown>
  : {});
const selectedDefinition = computed(() => selectedBlock.value ? blockDefinitionOf(selectedBlock.value.functionName) : undefined);
const selectedTable = computed(() => tables.value.find((table) => table.name === selectedInputs.value.table));
const selectedTableFields = computed(() => selectedTable.value?.columns.map((column) => column.name) ?? []);
const jsonPreview = computed(() => JSON.stringify(generatedApiJson.value, null, 2));
const responseText = computed({
  get: () => JSON.stringify(apiJson.value.response ?? {}, null, 2),
  set: (value: string) => store.setResponseFromText(value)
});
const draftDiff = computed(() => {
  if (!detail.value?.publishedJson) {
    return null;
  }
  return diff(detail.value.publishedJson, generatedApiJson.value);
});

watch(
  () => props.uuid,
  (uuid) => {
    if (!uuid || uuid === 'new') {
      store.startNew('new_api');
      void store.loadDatasourcesAndSchema();
      return;
    }
    void store.load(uuid);
    void store.loadDatasourcesAndSchema();
  },
  { immediate: true }
);

onMounted(() => {
  void store.loadDatasourcesAndSchema();
});

function goList() {
  window.location.hash = '#/apis';
}

async function save() {
  if (detail.value || props.uuid !== 'new') {
    await store.saveDraft();
  } else {
    const api = await store.createFromCurrent();
    window.location.hash = `#/apis/${encodeURIComponent(api.uuid)}`;
  }
}

async function publish() {
  await store.publish(changeNote.value);
  changeNote.value = '';
}

function setMethod(method: string) {
  store.updateRoot({ method });
}

function addRequestParameter(location: RequestLocation) {
  store.addParameter(location);
}

function toggleProcessor(parameterId: string, processor: string) {
  const parameter = parameters.value.find((item) => item.id === parameterId);
  if (!parameter) return;
  const exists = parameter.processors.some((item) => (typeof item === 'string' ? item : item.processor) === processor);
  parameter.processors = exists
    ? parameter.processors.filter((item) => (typeof item === 'string' ? item : item.processor) !== processor)
    : [...parameter.processors, processor];
}

function hasProcessor(processors: ProcessorConfig[], processor: string) {
  return processors.some((item) => (typeof item === 'string' ? item : item.processor) === processor);
}

function updateInput(key: string, value: unknown) {
  store.updateSelectedBlockInputs({ [key]: value });
}

function updateFieldsFromText(value: string) {
  const fieldList = value.split(',').map((field) => field.trim()).filter(Boolean);
  updateInput('fields', fieldList);
}

function updateJsonInput(key: string, value: string, fallback: unknown) {
  try {
    updateInput(key, JSON.parse(value) as unknown);
  } catch {
    updateInput(key, fallback);
  }
}

function addQuickCondition() {
  if (!quickConditionField.value.trim() || !selectedBlock.value) return;
  const current = Array.isArray(selectedInputs.value.conditions) ? selectedInputs.value.conditions as Condition[] : [];
  updateInput('conditions', [
    ...current,
    {
      group: false,
      conditionType: 'EQ',
      fieldName: quickConditionField.value.trim(),
      fieldValue: quickConditionValue.value
        ? { template: quickConditionValue.value }
        : ''
    }
  ]);
  quickConditionField.value = '';
  quickConditionValue.value = '';
}

function addResponseVariable() {
  if (!quickResponseField.value.trim()) return;
  const variable = currentVariables.value[0];
  if (!variable) return;
  apiJson.value.response = {
    ...(apiJson.value.response ?? {}),
    [quickResponseField.value.trim()]: { template: variable.template }
  };
  quickResponseField.value = '';
}

function addResponseFieldFromVariable(field: string, template: string) {
  apiJson.value.response = {
    ...(apiJson.value.response ?? {}),
    [field]: { template }
  };
}

function updateTestValue(location: RequestLocation, key: string, value: string) {
  testRequest.value[location][key] = value;
}

function parameterLocationLabel(location: RequestLocation) {
  if (location === 'header') return 'Header';
  if (location === 'query') return 'Query';
  return 'Body';
}
</script>

<template>
  <section data-testid="api-builder-page" class="flex min-h-[calc(100vh-6rem)] flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <button class="mb-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100" type="button" @click="goList">← API 列表</button>
        <h2 class="text-lg font-semibold">{{ apiJson.alias || apiJson.uuid || '新建 API' }}</h2>
        <p class="mt-1 font-mono text-xs text-slate-500">/api/mokelay/{{ apiJson.uuid || 'new_api' }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span v-if="hasDanger" class="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">包含危险写操作</span>
        <button data-testid="api-builder-save" class="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600" type="button" :disabled="isSaving" @click="save">
          {{ isSaving ? '保存中...' : '保存草稿' }}
        </button>
        <button class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50" type="button" :disabled="hasErrors || isSaving" @click="publish">
          发布
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
      {{ error }}
    </div>

    <div v-if="isLoading" class="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
      正在读取 API...
    </div>

    <div v-else class="grid min-h-[720px] grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_380px]">
      <aside class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">组件</h3>
          <button class="text-xs text-slate-500" type="button" @click="selectedPanel = 'api'">基本信息</button>
        </div>
        <div v-for="category in ['query', 'write', 'session']" :key="category" class="mb-4">
          <div class="mb-2 text-xs font-medium uppercase text-slate-400">{{ category === 'query' ? '查询数据' : category === 'write' ? '写入数据' : '登录态' }}</div>
          <div class="grid gap-2">
            <button
              v-for="definition in blockDefinitions.filter((item) => item.category === category)"
              :key="definition.functionName"
              class="rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950"
              type="button"
              @click="store.addBlock(definition.functionName)"
            >
              {{ definition.label }}
              <span class="mt-1 block font-mono text-xs text-slate-400">{{ definition.functionName }}</span>
            </button>
          </div>
        </div>
      </aside>

      <main class="flex min-w-0 flex-col gap-4">
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="text-sm font-semibold">编排步骤</h3>
              <p class="mt-1 text-xs text-slate-500">按顺序执行，可拖拽排序。</p>
            </div>
            <div class="flex gap-2">
              <button class="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600" type="button" @click="selectedPanel = 'request'">请求参数</button>
              <button class="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600" type="button" @click="selectedPanel = 'response'">响应组装</button>
            </div>
          </div>
          <div ref="blockListRef" class="grid gap-3">
            <article
              v-for="(block, index) in blocks"
              :key="block.uuid"
              class="api-builder-step rounded-lg border p-3"
              :class="selectedBlockUuid === block.uuid ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/40' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'"
              @click="store.selectBlock(block.uuid)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="api-builder-step__handle cursor-grab rounded bg-slate-200 px-2 py-1 text-xs dark:bg-slate-800">拖拽</span>
                    <span class="text-xs text-slate-500">#{{ index + 1 }}</span>
                    <strong class="truncate text-sm">{{ block.alias || block.uuid }}</strong>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2 text-xs">
                    <span class="rounded bg-white px-2 py-1 font-mono dark:bg-slate-900">{{ block.functionName }}</span>
                    <span v-if="block.inputs && typeof block.inputs === 'object' && 'datasource' in block.inputs" class="rounded bg-white px-2 py-1 dark:bg-slate-900">{{ (block.inputs as Record<string, unknown>).datasource }}</span>
                    <span v-if="block.inputs && typeof block.inputs === 'object' && 'table' in block.inputs" class="rounded bg-white px-2 py-1 dark:bg-slate-900">{{ (block.inputs as Record<string, unknown>).table || '未选表' }}</span>
                  </div>
                </div>
                <button class="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 dark:border-rose-900 dark:text-rose-300" type="button" @click.stop="store.removeBlock(block.uuid)">
                  删除
                </button>
              </div>
            </article>
            <div v-if="!blocks.length" class="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
              从左侧添加一个 block 开始。
            </div>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 class="mb-3 text-sm font-semibold">校验</h3>
            <div v-if="!validationIssues.length" class="text-sm text-emerald-600">当前 JSON 结构可发布。</div>
            <ul v-else class="space-y-2 text-sm">
              <li v-for="issue in validationIssues" :key="`${issue.path}-${issue.message}`" :class="issue.level === 'error' ? 'text-rose-600' : 'text-amber-600'">
                <span class="font-mono text-xs">{{ issue.path }}</span> {{ issue.message }}
              </li>
            </ul>
          </section>
          <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-semibold">测试接口</h3>
              <button class="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900" type="button" :disabled="isTesting" @click="store.runTest">
                {{ isTesting ? '测试中...' : '运行测试' }}
              </button>
            </div>
            <div class="grid gap-2">
              <label v-for="parameter in parameters" :key="parameter.id" class="grid gap-1 text-xs">
                <span>{{ parameterLocationLabel(parameter.location) }}.{{ parameter.key || '未命名' }}</span>
                <input class="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-950" :value="testRequest[parameter.location][parameter.key] ?? parameter.example" @input="updateTestValue(parameter.location, parameter.key, ($event.target as HTMLInputElement).value)" />
              </label>
            </div>
            <pre v-if="testResult" class="mt-3 max-h-80 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-50">{{ JSON.stringify(testResult, null, 2) }}</pre>
          </section>
        </div>

        <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <details open>
            <summary class="cursor-pointer text-sm font-semibold">JSON 预览</summary>
            <pre class="mt-3 max-h-96 overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-50">{{ jsonPreview }}</pre>
          </details>
        </section>
      </main>

      <aside class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-4 flex gap-2 border-b border-slate-200 pb-3 text-xs dark:border-slate-700">
          <button class="rounded px-2 py-1" :class="selectedPanel === 'api' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'" type="button" @click="selectedPanel = 'api'">API</button>
          <button class="rounded px-2 py-1" :class="selectedPanel === 'request' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'" type="button" @click="selectedPanel = 'request'">Request</button>
          <button class="rounded px-2 py-1" :class="selectedPanel === 'block' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'" type="button" :disabled="!selectedBlock" @click="selectedPanel = 'block'">Block</button>
          <button class="rounded px-2 py-1" :class="selectedPanel === 'response' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'" type="button" @click="selectedPanel = 'response'">Response</button>
        </div>

        <div v-if="selectedPanel === 'api'" class="grid gap-3">
          <label class="grid gap-1 text-sm">
            <span>API UUID</span>
            <input data-testid="api-builder-uuid" class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="apiJson.uuid" @input="store.updateRoot({ uuid: ($event.target as HTMLInputElement).value })" />
          </label>
          <label class="grid gap-1 text-sm">
            <span>接口名称</span>
            <input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="apiJson.alias" @input="store.updateRoot({ alias: ($event.target as HTMLInputElement).value })" />
          </label>
          <label class="grid gap-1 text-sm">
            <span>请求方法</span>
            <select class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="apiJson.method" @change="setMethod(($event.target as HTMLSelectElement).value)">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </label>
          <label class="grid gap-1 text-sm">
            <span>发布说明</span>
            <textarea v-model="changeNote" class="min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <div v-if="detail?.versions.length" class="border-t border-slate-200 pt-3 dark:border-slate-700">
            <h4 class="mb-2 text-sm font-semibold">版本</h4>
            <div v-for="version in detail.versions" :key="version.id" class="mb-2 flex items-center justify-between rounded bg-slate-50 p-2 text-xs dark:bg-slate-950">
              <span>v{{ version.version }} {{ version.changeNote }}</span>
              <button class="text-indigo-600 dark:text-indigo-300" type="button" @click="store.rollback(version.version)">回滚</button>
            </div>
          </div>
          <div v-if="draftDiff" class="border-t border-slate-200 pt-3 dark:border-slate-700">
            <h4 class="mb-2 text-sm font-semibold">草稿 Diff</h4>
            <pre class="max-h-60 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-50">{{ JSON.stringify(draftDiff, null, 2) }}</pre>
          </div>
        </div>

        <div v-else-if="selectedPanel === 'request'" class="grid gap-4">
          <div class="flex flex-wrap gap-2">
            <button class="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600" type="button" @click="addRequestParameter('header')">+ Header</button>
            <button class="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600" type="button" @click="addRequestParameter('query')">+ Query</button>
            <button class="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600" type="button" @click="addRequestParameter('body')">+ Body</button>
          </div>
          <div v-for="parameter in parameters" :key="parameter.id" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div class="mb-2 flex items-center justify-between gap-2">
              <select v-model="parameter.location" class="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-950">
                <option value="header">Header</option>
                <option value="query">Query</option>
                <option value="body">Body</option>
              </select>
              <button class="text-xs text-rose-600" type="button" @click="store.removeParameter(parameter.id)">删除</button>
            </div>
            <input v-model="parameter.key" class="mb-2 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-950" placeholder="参数名" />
            <label class="mb-2 flex items-center gap-2 text-xs"><input v-model="parameter.required" type="checkbox" /> 必填</label>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="processor in processorDefinitions.filter((item) => ['trim', 'email_check', 'number_check', 'min', 'max', 'regex', 'hash_make'].includes(item.name))"
                :key="processor.name"
                type="button"
                class="rounded-full border px-2 py-1 text-xs"
                :class="hasProcessor(parameter.processors, processor.name) ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200' : 'border-slate-200 dark:border-slate-700'"
                @click="toggleProcessor(parameter.id, processor.name)"
              >
                {{ processor.label }}
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="selectedPanel === 'block' && selectedBlock" class="grid gap-3">
          <label class="grid gap-1 text-sm">
            <span>Block UUID</span>
            <input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="selectedBlock.uuid" @input="store.updateBlock(selectedBlock.uuid, { uuid: ($event.target as HTMLInputElement).value })" />
          </label>
          <label class="grid gap-1 text-sm">
            <span>业务名称</span>
            <input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="selectedBlock.alias" @input="store.updateBlock(selectedBlock.uuid, { alias: ($event.target as HTMLInputElement).value })" />
          </label>
          <div class="rounded bg-slate-50 p-2 text-xs dark:bg-slate-950">
            类型：{{ selectedDefinition?.label ?? selectedBlock.functionName }}
            <div class="mt-1">输出：{{ selectedDefinition?.outputs.join(', ') || '无' }}</div>
          </div>

          <template v-if="['list', 'page', 'read', 'count', 'create', 'update', 'delete'].includes(selectedBlock.functionName)">
            <label class="grid gap-1 text-sm">
              <span>数据源</span>
              <select class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="selectedInputs.datasource" @change="updateInput('datasource', ($event.target as HTMLSelectElement).value); store.loadDatasourcesAndSchema(($event.target as HTMLSelectElement).value)">
                <option v-for="datasource in datasources" :key="datasource" :value="datasource">{{ datasource }}</option>
              </select>
            </label>
            <label class="grid gap-1 text-sm">
              <span>表</span>
              <input list="api-builder-table-list" class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="selectedInputs.table" @input="updateInput('table', ($event.target as HTMLInputElement).value)" />
              <datalist id="api-builder-table-list">
                <option v-for="table in tables" :key="table.name" :value="table.name" />
              </datalist>
            </label>
          </template>

          <template v-if="['list', 'page', 'read'].includes(selectedBlock.functionName)">
            <label class="grid gap-1 text-sm">
              <span>查询字段</span>
              <input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="Array.isArray(selectedInputs.fields) ? selectedInputs.fields.join(', ') : ''" @input="updateFieldsFromText(($event.target as HTMLInputElement).value)" />
            </label>
            <div v-if="selectedTableFields.length" class="flex flex-wrap gap-1">
              <button v-for="field in selectedTableFields" :key="field" class="rounded-full border border-slate-200 px-2 py-1 text-xs dark:border-slate-700" type="button" @click="updateInput('fields', Array.from(new Set([...(Array.isArray(selectedInputs.fields) ? selectedInputs.fields : []), field])))">{{ field }}</button>
            </div>
          </template>

          <template v-if="['create', 'update'].includes(selectedBlock.functionName)">
            <label v-if="selectedBlock.functionName === 'create'" class="grid gap-1 text-sm">
              <span>返回 ID 字段</span>
              <input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="selectedInputs.idField" @input="updateInput('idField', ($event.target as HTMLInputElement).value)" />
            </label>
            <label class="grid gap-1 text-sm">
              <span>写入字段 JSON</span>
              <textarea class="min-h-32 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-950" :value="JSON.stringify(selectedInputs.fields ?? {}, null, 2)" @change="updateJsonInput('fields', ($event.target as HTMLTextAreaElement).value, {})" />
            </label>
          </template>

          <template v-if="['page'].includes(selectedBlock.functionName)">
            <div class="grid grid-cols-2 gap-2">
              <label class="grid gap-1 text-sm"><span>page</span><input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="typeof selectedInputs.page === 'object' ? JSON.stringify(selectedInputs.page) : selectedInputs.page" @input="updateInput('page', ($event.target as HTMLInputElement).value)" /></label>
              <label class="grid gap-1 text-sm"><span>pageSize</span><input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="typeof selectedInputs.pageSize === 'object' ? JSON.stringify(selectedInputs.pageSize) : selectedInputs.pageSize" @input="updateInput('pageSize', ($event.target as HTMLInputElement).value)" /></label>
            </div>
          </template>

          <template v-if="['list', 'page', 'count', 'read', 'update', 'delete'].includes(selectedBlock.functionName)">
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <h4 class="mb-2 text-sm font-semibold">快速条件</h4>
              <input v-model="quickConditionField" class="mb-2 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-950" placeholder="字段名" />
              <select v-model="quickConditionValue" class="mb-2 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-950">
                <option value="">固定空值</option>
                <option v-for="variable in currentVariables" :key="variable.id" :value="variable.template">{{ variable.label }}</option>
              </select>
              <button class="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600" type="button" @click="addQuickCondition">添加 EQ 条件</button>
            </div>
            <label class="grid gap-1 text-sm">
              <span>conditions JSON</span>
              <textarea class="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-950" :value="JSON.stringify(selectedInputs.conditions ?? [], null, 2)" @change="updateJsonInput('conditions', ($event.target as HTMLTextAreaElement).value, [])" />
            </label>
          </template>

          <template v-if="['list', 'page'].includes(selectedBlock.functionName)">
            <label class="grid gap-1 text-sm">
              <span>orderBy JSON</span>
              <textarea class="min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-950" :value="JSON.stringify(selectedInputs.orderBy ?? [], null, 2)" @change="updateJsonInput('orderBy', ($event.target as HTMLTextAreaElement).value, [])" />
            </label>
          </template>

          <template v-if="['addSession', 'readSession', 'removeSession'].includes(selectedBlock.functionName)">
            <label class="grid gap-1 text-sm">
              <span>Session key</span>
              <input class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" :value="selectedInputs.key" @input="updateInput('key', ($event.target as HTMLInputElement).value)" />
            </label>
            <label v-if="selectedBlock.functionName === 'addSession'" class="grid gap-1 text-sm">
              <span>value JSON</span>
              <textarea class="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-950" :value="JSON.stringify(selectedInputs.value ?? null, null, 2)" @change="updateJsonInput('value', ($event.target as HTMLTextAreaElement).value, null)" />
            </label>
          </template>
        </div>

        <div v-else-if="selectedPanel === 'response'" class="grid gap-3">
          <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h4 class="mb-2 text-sm font-semibold">可用变量</h4>
            <div class="grid gap-1">
              <button v-for="variable in currentVariables" :key="variable.id" class="rounded border border-slate-200 px-2 py-1 text-left text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" type="button" @click="addResponseFieldFromVariable(variable.label.split('.').pop() || 'value', variable.template)">
                {{ variable.label }}
                <span class="block font-mono text-[11px] text-slate-400">{{ variable.template }}</span>
              </button>
            </div>
          </div>
          <label class="grid gap-1 text-sm">
            <span>快速响应字段</span>
            <input v-model="quickResponseField" class="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" placeholder="字段名" />
          </label>
          <button class="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600" type="button" @click="addResponseVariable">使用第一个变量添加</button>
          <label class="grid gap-1 text-sm">
            <span>response JSON</span>
            <textarea v-model="responseText" class="min-h-72 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-950" />
          </label>
        </div>
      </aside>
    </div>
  </section>
</template>
