<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import type { ApiJson } from '@/api-builder/types';
import { computed, reactive, ref } from 'vue';
import { useI18n } from '@/i18n';
import { saveApi } from '@/utils/apisApi';
import { $message } from '@/utils/globalCalls';
import { createPage, updatePage } from '@/utils/pagesApi';
import {
  generateAiDsl,
  type AiDslGenerationPayload,
  type AiDslGenerationResponse
} from '@/utils/aiDslGenerationApi';

type JsonFieldKey = 'projectContext' | 'dslContext' | 'generationPreferences';
type GeneratedSaveItemStatus = 'saving' | 'success' | 'error';

type GeneratedSaveItem = {
  title: string;
  sourceUuid: string;
  savedUuid?: string;
  href?: string;
  status: GeneratedSaveItemStatus;
  error?: string;
};

type GeneratedSaveSummary = {
  status: 'saving' | 'complete' | 'partial' | 'error';
  pages: GeneratedSaveItem[];
  apis: GeneratedSaveItem[];
};

type ChatTurn = {
  id: string;
  requirementDocument: string;
  payload: AiDslGenerationPayload;
  status: 'pending' | 'success' | 'error';
  response?: AiDslGenerationResponse;
  save?: GeneratedSaveSummary;
  error?: string;
};

type ConversationHistoryTurn = {
  requirementDocument: string;
  response: AiDslGenerationResponse;
};

type NormalizedGeneratedPage = {
  uuid: string;
  name: string;
  blocks: OutputData['blocks'];
};

const { t } = useI18n();
const requirementDocument = ref('');
const jsonInputs = reactive<Record<JsonFieldKey, string>>({
  projectContext: '',
  dslContext: '',
  generationPreferences: ''
});
const fieldErrors = reactive<Record<'requirementDocument' | JsonFieldKey, string>>({
  requirementDocument: '',
  projectContext: '',
  dslContext: '',
  generationPreferences: ''
});
const turns = ref<ChatTurn[]>([]);
const isGenerating = ref(false);
const savedPageUuids = new Set<string>();
const savedApiUuids = new Set<string>();
const pageUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const hasTurns = computed(() => turns.value.length > 0);
const canSubmit = computed(() => Boolean(requirementDocument.value.trim()) && !isGenerating.value);

function createTurnId() {
  return `ai-turn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resetFieldErrors() {
  fieldErrors.requirementDocument = '';
  fieldErrors.projectContext = '';
  fieldErrors.dslContext = '';
  fieldErrors.generationPreferences = '';
}

function parseJsonField(field: JsonFieldKey) {
  const rawValue = jsonInputs[field].trim();

  if (!rawValue) {
    return undefined;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    fieldErrors[field] = t('aiChat.errors.invalidJson');
    return invalidJsonMarker;
  }
}

const invalidJsonMarker = Symbol('invalid-json');

function buildConversationHistory(): ConversationHistoryTurn[] {
  return turns.value.flatMap((turn) => {
    if (turn.status !== 'success' || !turn.response) {
      return [];
    }

    return [{
      requirementDocument: turn.requirementDocument,
      response: turn.response
    }];
  });
}

function summarizeResponseForPrompt(response: AiDslGenerationResponse) {
  return {
    status: response.status,
    summary: response.summary,
    pages: response.pages.map((page) => ({
      uuid: readString(page, 'uuid'),
      name: readString(page, 'name')
    })),
    apis: response.apis.map((api) => ({
      uuid: readString(api, 'uuid'),
      alias: readString(api, 'alias'),
      method: readString(api, 'method')
    })),
    upgradePlan: {
      processors: response.upgradePlan.processors.map((item, index) => upgradeTitle(item, `processor_${index + 1}`, index)),
      blocks: response.upgradePlan.blocks.map((item, index) => upgradeTitle(item, `block_${index + 1}`, index)),
      actions: response.upgradePlan.actions.map((item, index) => upgradeTitle(item, `action_${index + 1}`, index)),
      controls: response.upgradePlan.controls.map((item, index) => upgradeTitle(item, `control_${index + 1}`, index)),
      components: response.upgradePlan.components.map((item, index) => upgradeTitle(item, `component_${index + 1}`, index))
    }
  };
}

function buildRequirementWithConversationContext(requirement: string, history: ReturnType<typeof buildConversationHistory>) {
  if (!history.length) {
    return requirement;
  }

  const compactHistory = history
    .slice()
    .reverse()
    .map((turn, index) => ({
      turn: index + 1,
      requirementDocument: turn.requirementDocument,
      response: summarizeResponseForPrompt(turn.response)
    }));

  return [
    '这是一次连续对话。请基于下面的历史需求和历史生成结果继续生成，不要把本轮需求当成全新独立任务，除非用户明确要求重做。',
    '',
    '历史对话上下文：',
    JSON.stringify(compactHistory, null, 2),
    '',
    '本轮用户新增/修改需求：',
    requirement
  ].join('\n');
}

function mergeConversationHistory(dslContext: unknown, history: ReturnType<typeof buildConversationHistory>) {
  if (!history.length) {
    return dslContext;
  }

  if (isRecord(dslContext)) {
    return {
      ...dslContext,
      conversationHistory: history
    };
  }

  if (dslContext !== undefined) {
    return {
      value: dslContext,
      conversationHistory: history
    };
  }

  return {
    conversationHistory: history
  };
}

function buildPayload(): AiDslGenerationPayload | null {
  resetFieldErrors();
  const requirement = requirementDocument.value.trim();

  if (!requirement) {
    fieldErrors.requirementDocument = t('aiChat.errors.requirementRequired');
    return null;
  }

  const projectContext = parseJsonField('projectContext');
  const dslContext = parseJsonField('dslContext');
  const generationPreferences = parseJsonField('generationPreferences');

  if (
    projectContext === invalidJsonMarker ||
    dslContext === invalidJsonMarker ||
    generationPreferences === invalidJsonMarker
  ) {
    return null;
  }

  const history = buildConversationHistory();
  const mergedDslContext = mergeConversationHistory(dslContext, history);
  const contextualRequirement = buildRequirementWithConversationContext(requirement, history);
  const payload: AiDslGenerationPayload = {
    requirementDocument: contextualRequirement
  };

  if (projectContext !== undefined) {
    payload.projectContext = projectContext;
  }

  if (mergedDslContext !== undefined) {
    payload.dslContext = mergedDslContext;
  }

  if (generationPreferences !== undefined) {
    payload.generationPreferences = generationPreferences;
  }

  return payload;
}

async function submitRequirement() {
  if (isGenerating.value) return;
  const payload = buildPayload();
  if (!payload) return;

  const turnId = createTurnId();
  const turn: ChatTurn = {
    id: turnId,
    requirementDocument: requirementDocument.value.trim(),
    payload,
    status: 'pending'
  };

  turns.value = [turn, ...turns.value];
  isGenerating.value = true;

  try {
    const response = await generateAiDsl(payload);
    updateTurn(turnId, {
      status: 'success',
      response,
      save: createInitialSaveSummary(response)
    });
    await saveGeneratedAssets(turnId, response);
  } catch (error) {
    updateTurn(turnId, {
      status: 'error',
      error: error instanceof Error ? error.message : t('aiChat.errors.requestFailed')
    });
  } finally {
    isGenerating.value = false;
  }
}

function updateTurn(id: string, patch: Partial<ChatTurn>) {
  turns.value = turns.value.map((turn) => (
    turn.id === id ? { ...turn, ...patch } : turn
  ));
}

function clearConversation() {
  if (isGenerating.value) return;
  turns.value = [];
  savedPageUuids.clear();
  savedApiUuids.clear();
}

function createInitialSaveSummary(response: AiDslGenerationResponse): GeneratedSaveSummary {
  const summary: GeneratedSaveSummary = {
    status: 'saving',
    pages: response.pages.map((page, index) => ({
      title: pageTitle(page, index),
      sourceUuid: readString(page, 'uuid'),
      status: 'saving'
    })),
    apis: response.apis.map((api, index) => ({
      title: apiTitle(api, index),
      sourceUuid: readString(api, 'uuid'),
      status: 'saving'
    }))
  };

  return {
    ...summary,
    status: computeSaveSummaryStatus(summary)
  };
}

async function saveGeneratedAssets(turnId: string, response: AiDslGenerationResponse) {
  const save = createInitialSaveSummary(response);

  if (!save.pages.length && !save.apis.length) {
    updateTurn(turnId, { save });
    return;
  }

  updateTurn(turnId, { save: cloneSaveSummary(save) });

  for (let index = 0; index < response.apis.length; index += 1) {
    save.apis[index] = await saveGeneratedApi(response.apis[index], index);
    updateTurn(turnId, { save: finalizeSaveSummary(save) });
  }

  for (let index = 0; index < response.pages.length; index += 1) {
    save.pages[index] = await saveGeneratedPage(response.pages[index], index);
    updateTurn(turnId, { save: finalizeSaveSummary(save) });
  }
}

async function saveGeneratedPage(page: unknown, index: number): Promise<GeneratedSaveItem> {
  const fallback: GeneratedSaveItem = {
    title: pageTitle(page, index),
    sourceUuid: readString(page, 'uuid'),
    status: 'error'
  };

  try {
    const normalized = normalizeGeneratedPage(page, index);
    const savedPage = savedPageUuids.has(normalized.uuid)
      ? await updatePage(normalized.uuid, {
          name: normalized.name,
          blocks: normalized.blocks
        })
      : await createPage({
          uuid: normalized.uuid,
          name: normalized.name,
          blocks: normalized.blocks
        });

    savedPageUuids.add(savedPage.uuid);

    return {
      title: savedPage.name || normalized.name,
      sourceUuid: normalized.uuid,
      savedUuid: savedPage.uuid,
      href: pageHref(savedPage.uuid),
      status: 'success'
    };
  } catch (error) {
    return {
      ...fallback,
      error: error instanceof Error ? error.message : t('aiChat.save.pageFailed')
    };
  }
}

async function saveGeneratedApi(api: unknown, index: number): Promise<GeneratedSaveItem> {
  const fallback: GeneratedSaveItem = {
    title: apiTitle(api, index),
    sourceUuid: readString(api, 'uuid'),
    status: 'error'
  };

  try {
    const apiJson = normalizeGeneratedApi(api);
    const savedApi = await saveApi({
      apiJson,
      status: 'draft',
      originalUuid: savedApiUuids.has(apiJson.uuid) ? apiJson.uuid : undefined
    });

    savedApiUuids.add(savedApi.uuid);

    return {
      title: savedApi.name || apiJson.alias || apiJson.uuid,
      sourceUuid: apiJson.uuid,
      savedUuid: savedApi.uuid,
      href: apiHref(savedApi.uuid),
      status: 'success'
    };
  } catch (error) {
    return {
      ...fallback,
      error: error instanceof Error ? error.message : t('aiChat.save.apiFailed')
    };
  }
}

function normalizeGeneratedPage(page: unknown, index: number): NormalizedGeneratedPage {
  if (!isRecord(page)) {
    throw new Error(t('aiChat.save.invalidPage'));
  }

  const uuid = readString(page, 'uuid');
  if (!pageUuidPattern.test(uuid)) {
    throw new Error(t('aiChat.save.invalidPageUuid'));
  }

  return {
    uuid,
    name: readString(page, 'name') || t('aiChat.generated.pageFallback').replace('{index}', String(index + 1)),
    blocks: Array.isArray(page.blocks) ? page.blocks as OutputData['blocks'] : []
  };
}

function normalizeGeneratedApi(api: unknown): ApiJson {
  if (!isRecord(api)) {
    throw new Error(t('aiChat.save.invalidApi'));
  }

  const uuid = readString(api, 'uuid');
  const method = readString(api, 'method');

  if (!uuid) {
    throw new Error(t('aiChat.save.invalidApiUuid'));
  }

  if (!method) {
    throw new Error(t('aiChat.save.invalidApiMethod'));
  }

  return {
    ...api,
    uuid,
    method
  } as ApiJson;
}

function finalizeSaveSummary(save: GeneratedSaveSummary): GeneratedSaveSummary {
  return {
    ...cloneSaveSummary(save),
    status: computeSaveSummaryStatus(save)
  };
}

function cloneSaveSummary(save: GeneratedSaveSummary): GeneratedSaveSummary {
  return {
    status: save.status,
    pages: save.pages.map((item) => ({ ...item })),
    apis: save.apis.map((item) => ({ ...item }))
  };
}

function computeSaveSummaryStatus(save: Pick<GeneratedSaveSummary, 'pages' | 'apis'>): GeneratedSaveSummary['status'] {
  const items = [...save.pages, ...save.apis];

  if (!items.length) {
    return 'complete';
  }

  if (items.some((item) => item.status === 'saving')) {
    return 'saving';
  }

  if (items.every((item) => item.status === 'success')) {
    return 'complete';
  }

  if (items.some((item) => item.status === 'success')) {
    return 'partial';
  }

  return 'error';
}

async function copyResponseJson(response: AiDslGenerationResponse) {
  try {
    await navigator.clipboard.writeText(formatJson(response));
    void $message('success', t('aiChat.copySuccess'));
  } catch {
    void $message('error', t('aiChat.copyFailed'));
  }
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function readString(value: unknown, key: string) {
  return isRecord(value) && typeof value[key] === 'string' ? value[key].trim() : '';
}

function pageTitle(page: unknown, index: number) {
  const name = readString(page, 'name');
  const uuid = readString(page, 'uuid');
  return name || uuid || t('aiChat.generated.pageFallback').replace('{index}', String(index + 1));
}

function apiTitle(api: unknown, index: number) {
  const method = readString(api, 'method');
  const alias = readString(api, 'alias');
  const uuid = readString(api, 'uuid');
  return [method, alias || uuid || t('aiChat.generated.apiFallback').replace('{index}', String(index + 1))]
    .filter(Boolean)
    .join(' ');
}

function pageSaveItem(turn: ChatTurn, index: number) {
  return turn.save?.pages[index];
}

function apiSaveItem(turn: ChatTurn, index: number) {
  return turn.save?.apis[index];
}

function saveStatusLabel(status: GeneratedSaveItemStatus) {
  return t(`aiChat.save.itemStatus.${status}`);
}

function saveStatusClass(status: GeneratedSaveItemStatus) {
  if (status === 'success') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200';
  }

  if (status === 'error') {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200';
  }

  return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200';
}

function saveSummaryText(save: GeneratedSaveSummary) {
  const items = [...save.pages, ...save.apis];
  const savedCount = items.filter((item) => item.status === 'success').length;
  const failedCount = items.filter((item) => item.status === 'error').length;
  const total = items.length;

  if (save.status === 'saving') {
    return t('aiChat.save.summary.saving')
      .replace('{saved}', String(savedCount))
      .replace('{total}', String(total));
  }

  if (save.status === 'complete') {
    return t('aiChat.save.summary.complete')
      .replace('{total}', String(total));
  }

  if (save.status === 'partial') {
    return t('aiChat.save.summary.partial')
      .replace('{saved}', String(savedCount))
      .replace('{failed}', String(failedCount));
  }

  return t('aiChat.save.summary.error')
    .replace('{failed}', String(failedCount || total));
}

function pageHref(uuid: string) {
  return `#/pages/${encodeURIComponent(uuid)}`;
}

function apiHref(uuid: string) {
  return `#/apis/${encodeURIComponent(uuid)}`;
}

function traceabilityTitle(item: unknown, index: number) {
  return readString(item, 'requirement') || t('aiChat.generated.traceFallback').replace('{index}', String(index + 1));
}

function traceabilityStatus(item: unknown) {
  return readString(item, 'status') || '-';
}

function upgradeSections(response: AiDslGenerationResponse) {
  return [
    { key: 'processors', label: t('aiChat.upgrade.processors'), items: response.upgradePlan.processors },
    { key: 'blocks', label: t('aiChat.upgrade.blocks'), items: response.upgradePlan.blocks },
    { key: 'actions', label: t('aiChat.upgrade.actions'), items: response.upgradePlan.actions },
    { key: 'controls', label: t('aiChat.upgrade.controls'), items: response.upgradePlan.controls },
    { key: 'components', label: t('aiChat.upgrade.components'), items: response.upgradePlan.components }
  ].filter((section) => section.items.length > 0);
}

function hasUpgradeItems(response: AiDslGenerationResponse) {
  return upgradeSections(response).length > 0;
}

function upgradeTitle(item: unknown, fallback: string, index: number) {
  return readString(item, 'name') ||
    readString(item, 'functionName') ||
    readString(item, 'action') ||
    readString(item, 'type') ||
    fallback.replace('{index}', String(index + 1));
}

function upgradeReason(item: unknown) {
  return readString(item, 'reason') || readString(item, 'behavior') || '';
}

function compactJson(value: unknown) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}
</script>

<template>
  <section data-testid="ai-chat-panel" class="flex min-h-[calc(100vh-112px)] flex-1 flex-col gap-4">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-teal-700 dark:text-teal-300">Mokelay Editor</p>
          <h2 class="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{{ t('aiChat.title') }}</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{{ t('aiChat.subtitle') }}</p>
        </div>
        <button
          data-testid="ai-chat-clear"
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500"
          :disabled="!hasTurns || isGenerating"
          @click="clearConversation"
        >
          {{ t('aiChat.actions.clear') }}
        </button>
      </div>
    </section>

    <div class="grid flex-1 gap-4 xl:grid-cols-[minmax(360px,420px)_1fr]">
      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <form class="flex flex-col gap-4" @submit.prevent="submitRequirement">
          <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.fields.requirementDocument') }}</span>
            <textarea
              v-model="requirementDocument"
              data-testid="ai-chat-requirement"
              class="min-h-36 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              :placeholder="t('aiChat.placeholders.requirementDocument')"
            />
            <span v-if="fieldErrors.requirementDocument" data-testid="ai-chat-requirement-error" class="text-sm text-rose-600 dark:text-rose-300">{{ fieldErrors.requirementDocument }}</span>
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.fields.projectContext') }}</span>
            <textarea
              v-model="jsonInputs.projectContext"
              data-testid="ai-chat-project-context"
              class="min-h-24 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              :placeholder="t('aiChat.placeholders.projectContext')"
            />
            <span v-if="fieldErrors.projectContext" data-testid="ai-chat-project-context-error" class="text-sm text-rose-600 dark:text-rose-300">{{ fieldErrors.projectContext }}</span>
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.fields.dslContext') }}</span>
            <textarea
              v-model="jsonInputs.dslContext"
              data-testid="ai-chat-dsl-context"
              class="min-h-24 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              :placeholder="t('aiChat.placeholders.dslContext')"
            />
            <span v-if="fieldErrors.dslContext" data-testid="ai-chat-dsl-context-error" class="text-sm text-rose-600 dark:text-rose-300">{{ fieldErrors.dslContext }}</span>
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.fields.generationPreferences') }}</span>
            <textarea
              v-model="jsonInputs.generationPreferences"
              data-testid="ai-chat-generation-preferences"
              class="min-h-24 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              :placeholder="t('aiChat.placeholders.generationPreferences')"
            />
            <span v-if="fieldErrors.generationPreferences" data-testid="ai-chat-generation-preferences-error" class="text-sm text-rose-600 dark:text-rose-300">{{ fieldErrors.generationPreferences }}</span>
          </label>

          <button
            data-testid="ai-chat-submit"
            type="submit"
            class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canSubmit"
          >
            {{ isGenerating ? t('aiChat.actions.generating') : t('aiChat.actions.generate') }}
          </button>
        </form>
      </section>

      <section class="flex flex-col gap-4">
        <div v-if="!hasTurns" data-testid="ai-chat-empty" class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {{ t('aiChat.empty') }}
        </div>

        <article
          v-for="(turn, index) in turns"
          :key="turn.id"
          data-testid="ai-chat-turn"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ t('aiChat.turn') }} {{ turns.length - index }}</p>
              <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800 dark:text-slate-100">{{ turn.requirementDocument }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="turn.status === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : turn.status === 'error' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'"
            >
              {{ t(`aiChat.status.${turn.status}`) }}
            </span>
          </div>

          <p v-if="turn.status === 'pending'" data-testid="ai-chat-loading" class="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {{ t('aiChat.loading') }}
          </p>

          <p v-if="turn.error" data-testid="ai-chat-error" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">
            {{ turn.error }}
          </p>

          <div v-if="turn.response" class="mt-5 grid gap-4">
            <section class="grid gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-950 dark:text-white">{{ t('aiChat.generated.summary') }}</h3>
                <span data-testid="ai-chat-response-status" class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ turn.response.status }}</span>
              </div>
              <p data-testid="ai-chat-summary" class="text-sm leading-6 text-slate-700 dark:text-slate-200">{{ turn.response.summary || t('aiChat.generated.emptySummary') }}</p>
              <p v-if="turn.save" data-testid="ai-chat-save-summary" class="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {{ saveSummaryText(turn.save) }}
              </p>
            </section>

            <section class="grid gap-3 md:grid-cols-2">
              <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.generated.pages') }} · {{ turn.response.pages.length }}</h4>
                <ul data-testid="ai-chat-pages" class="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <li v-for="(page, pageIndex) in turn.response.pages" :key="pageIndex" class="rounded bg-slate-50 px-3 py-2 dark:bg-slate-800">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        {{ pageSaveItem(turn, pageIndex)?.title || pageTitle(page, pageIndex) }}
                        <code v-if="pageSaveItem(turn, pageIndex)?.savedUuid || readString(page, 'uuid')" class="ml-2 text-xs text-slate-500 dark:text-slate-400">{{ pageSaveItem(turn, pageIndex)?.savedUuid || readString(page, 'uuid') }}</code>
                      </span>
                      <span
                        v-if="pageSaveItem(turn, pageIndex)"
                        class="rounded-full px-2 py-1 text-xs font-semibold"
                        :class="saveStatusClass(pageSaveItem(turn, pageIndex)?.status || 'saving')"
                      >
                        {{ saveStatusLabel(pageSaveItem(turn, pageIndex)?.status || 'saving') }}
                      </span>
                    </div>
                    <a
                      v-if="pageSaveItem(turn, pageIndex)?.href"
                      data-testid="ai-chat-page-link"
                      class="mt-2 inline-flex text-xs font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200"
                      :href="pageSaveItem(turn, pageIndex)?.href"
                    >
                      {{ t('aiChat.save.openPage') }}
                    </a>
                    <p v-if="pageSaveItem(turn, pageIndex)?.error" data-testid="ai-chat-save-error" class="mt-2 text-xs text-rose-600 dark:text-rose-300">
                      {{ pageSaveItem(turn, pageIndex)?.error }}
                    </p>
                  </li>
                  <li v-if="!turn.response.pages.length" class="text-slate-500 dark:text-slate-400">{{ t('aiChat.generated.noPages') }}</li>
                </ul>
              </div>

              <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.generated.apis') }} · {{ turn.response.apis.length }}</h4>
                <ul data-testid="ai-chat-apis" class="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <li v-for="(api, apiIndex) in turn.response.apis" :key="apiIndex" class="rounded bg-slate-50 px-3 py-2 dark:bg-slate-800">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        {{ apiSaveItem(turn, apiIndex)?.title || apiTitle(api, apiIndex) }}
                        <code v-if="apiSaveItem(turn, apiIndex)?.savedUuid || readString(api, 'uuid')" class="ml-2 text-xs text-slate-500 dark:text-slate-400">{{ apiSaveItem(turn, apiIndex)?.savedUuid || readString(api, 'uuid') }}</code>
                      </span>
                      <span
                        v-if="apiSaveItem(turn, apiIndex)"
                        class="rounded-full px-2 py-1 text-xs font-semibold"
                        :class="saveStatusClass(apiSaveItem(turn, apiIndex)?.status || 'saving')"
                      >
                        {{ saveStatusLabel(apiSaveItem(turn, apiIndex)?.status || 'saving') }}
                      </span>
                    </div>
                    <a
                      v-if="apiSaveItem(turn, apiIndex)?.href"
                      data-testid="ai-chat-api-link"
                      class="mt-2 inline-flex text-xs font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200"
                      :href="apiSaveItem(turn, apiIndex)?.href"
                    >
                      {{ t('aiChat.save.openApi') }}
                    </a>
                    <p v-if="apiSaveItem(turn, apiIndex)?.error" data-testid="ai-chat-save-error" class="mt-2 text-xs text-rose-600 dark:text-rose-300">
                      {{ apiSaveItem(turn, apiIndex)?.error }}
                    </p>
                  </li>
                  <li v-if="!turn.response.apis.length" class="text-slate-500 dark:text-slate-400">{{ t('aiChat.generated.noApis') }}</li>
                </ul>
              </div>
            </section>

            <section class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.generated.upgradePlan') }}</h4>
              <div v-if="hasUpgradeItems(turn.response)" data-testid="ai-chat-upgrade-plan" class="mt-3 grid gap-3">
                <div v-for="section in upgradeSections(turn.response)" :key="section.key" class="rounded bg-slate-50 p-3 dark:bg-slate-800">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ section.label }} · {{ section.items.length }}</p>
                  <ul class="mt-2 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <li v-for="(item, itemIndex) in section.items" :key="itemIndex">
                      <span class="font-semibold">{{ upgradeTitle(item, t('aiChat.generated.upgradeFallback'), itemIndex) }}</span>
                      <span v-if="upgradeReason(item)" class="ml-2 text-slate-500 dark:text-slate-400">{{ upgradeReason(item) }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <p v-else data-testid="ai-chat-upgrade-empty" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('aiChat.generated.noUpgrades') }}</p>
            </section>

            <section v-if="turn.response.traceability.length" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.generated.traceability') }}</h4>
              <ul data-testid="ai-chat-traceability" class="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                <li v-for="(item, traceIndex) in turn.response.traceability" :key="traceIndex" class="rounded bg-slate-50 px-3 py-2 dark:bg-slate-800">
                  <span class="font-semibold text-slate-800 dark:text-slate-100">{{ traceabilityTitle(item, traceIndex) }}</span>
                  <span class="ml-2">{{ traceabilityStatus(item) }}</span>
                </li>
              </ul>
            </section>

            <section v-if="turn.response.warnings.length || turn.response.assumptions.length" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.generated.notes') }}</h4>
              <ul data-testid="ai-chat-notes" class="mt-2 grid gap-1 text-sm text-slate-600 dark:text-slate-300">
                <li v-for="(warning, warningIndex) in turn.response.warnings" :key="`warning-${warningIndex}`">{{ compactJson(warning) }}</li>
                <li v-for="(assumption, assumptionIndex) in turn.response.assumptions" :key="`assumption-${assumptionIndex}`">{{ compactJson(assumption) }}</li>
              </ul>
            </section>

            <section class="grid gap-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ t('aiChat.generated.fullJson') }}</h4>
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500"
                  @click="copyResponseJson(turn.response)"
                >
                  {{ t('aiChat.actions.copyJson') }}
                </button>
              </div>
              <pre data-testid="ai-chat-result-json" class="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">{{ formatJson(turn.response) }}</pre>
            </section>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>
