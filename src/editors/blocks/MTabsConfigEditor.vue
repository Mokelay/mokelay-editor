<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import type { MTabsTab } from '@/blocks/MTabs.vue';

export type MTabsConfigEditorData = {
  tabs: MTabsTab[];
  activeTabId: string;
  readonly?: boolean;
};

export type MTabsConfigEditorPayload = {
  value: MTabsConfigEditorData;
  patch?: {
    tabs: MTabsTab[];
    activeTabId: string;
  };
  oldValue?: MTabsConfigEditorData;
};

export type MTabsConfigEditorValidateResult = {
  valid: boolean;
  message?: string;
};

export interface MTabsConfigEditorProps extends EditorToolComponentProps {
  value?: unknown;
  tabs?: unknown;
  activeTabId?: unknown;
  readonly?: boolean;
  outputMode?: 'value' | 'patch';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseJsonIfString(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes'].includes(normalized)) return true;
    if (['0', 'false', 'no'].includes(normalized)) return false;
  }
  return fallback;
}

function normalizePageSource(value: unknown): MTabsTab['pageSource'] {
  if (value === 'system') return 'system';
  if (value === 'user') return 'user';
  return 'user';
}

function normalizeQueryMapping(value: unknown): MTabsTab['query'] {
  if (!isRecord(value)) return undefined;

  const query: NonNullable<MTabsTab['query']> = {};
  Object.entries(value).forEach(([rawKey, rawValue]) => {
    const key = rawKey.trim();
    if (!key) return;
    if (rawValue === null || typeof rawValue === 'string') {
      query[key] = rawValue === null ? null : rawValue.trim();
      return;
    }
    if (!Array.isArray(rawValue)) return;

    const values: Array<string | null> = [];
    rawValue.forEach((item) => {
      const normalized = item === null
        ? null
        : typeof item === 'string' ? item.trim() : undefined;
      if (normalized === undefined || values.includes(normalized)) return;
      values.push(normalized);
    });
    if (values.length) query[key] = values;
  });
  return Object.keys(query).length ? query : undefined;
}

function normalizeActiveTabId(value: unknown, tabs: MTabsTab[]) {
  const activeTabId = readString(value);
  if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) {
    return activeTabId;
  }
  return tabs[0]?.id ?? '';
}

function normalizeTabsInput(value: unknown): MTabsTab[] {
  const source = parseJsonIfString(value);
  if (!Array.isArray(source)) return [];

  const tabs: MTabsTab[] = [];
  const seenIds = new Set<string>();

  source.forEach((item) => {
    if (!isRecord(item)) return;

    const id = readString(item.id);
    const name = readString(item.name);
    const hasCanonical = Object.prototype.hasOwnProperty.call(item, 'pageUUID');
    const hasLegacy = Object.prototype.hasOwnProperty.call(item, 'pageUuid');
    const canonicalPageUUID = readString(item.pageUUID);
    const legacyPageUuid = readString(item.pageUuid);
    const pageUUID = canonicalPageUUID || legacyPageUuid;
    const query = normalizeQueryMapping(item.query);

    if (!id || !name || !pageUUID || seenIds.has(id)) return;

    seenIds.add(id);
    tabs.push({
      id,
      name,
      pageUUID,
      ...(hasCanonical && hasLegacy ? { pageUuid: legacyPageUuid } : {}),
      pageSource: normalizePageSource(item.pageSource),
      ...(query ? { query } : {})
    });
  });

  return tabs;
}

export function normalizeMTabsConfigEditorData(value: unknown): MTabsConfigEditorData {
  const parsed = parseJsonIfString(value);
  const record = isRecord(parsed) ? parsed : {};
  const tabsSource = isRecord(parsed) ? record.tabs : parsed;
  const tabs = normalizeTabsInput(tabsSource);
  return {
    tabs,
    activeTabId: normalizeActiveTabId(record.activeTabId, tabs),
    readonly: booleanValue(record.readonly)
  };
}

export function normalizeMTabsConfigEditorProps(
  props: Partial<MTabsConfigEditorProps>
): MTabsConfigEditorProps {
  const valueData = normalizeMTabsConfigEditorData(props.value);
  const tabs = normalizeTabsInput(props.tabs ?? valueData.tabs);
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    pageEditor: props.pageEditor,
    value: {
      tabs,
      activeTabId: normalizeActiveTabId(props.activeTabId ?? valueData.activeTabId, tabs),
      readonly: booleanValue(props.readonly ?? valueData.readonly)
    },
    tabs,
    activeTabId: normalizeActiveTabId(props.activeTabId ?? valueData.activeTabId, tabs),
    readonly: booleanValue(props.readonly ?? valueData.readonly),
    outputMode: props.outputMode === 'patch' ? 'patch' : 'value'
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MTabsConfigEditor",
 *   "displayName": "页签配置编辑器",
 *   "category": "container",
 *   "description": "页签配置编辑器，用于可视化维护 MTabs 的 tabs 列表和 activeTabId 默认激活页签。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MTabsConfigEditor",
 *     "toolSymbol": "mTabsConfigEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 1010
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "页签配置编辑器",
 *       "en": "Tabs Config Editor"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M7 6v12M3 10h18\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M10 14h7\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "tabs": [],
 *     "activeTabId": "",
 *     "readonly": false
 *   },
 *   "properties": [
 *     {
 *       "key": "tabs",
 *       "optional": true,
 *       "tsType": "MTabsTab[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "line": 13,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "页签列表"
 *     },
 *     {
 *       "key": "activeTabId",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "line": 14,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "默认激活页签"
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "line": 15,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "只读"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "change",
 *       "payload": "{ value: MTabsConfigEditorData, patch?: { tabs: MTabsTab[], activeTabId: string }, oldValue?: MTabsConfigEditorData }",
 *       "trigger": "保存页签配置或方法更新时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "变更"
 *     },
 *     {
 *       "event": "clear",
 *       "payload": "{ oldValue: MTabsConfigEditorData }",
 *       "trigger": "清空页签配置时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "清空"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "value: MTabsConfigEditorData",
 *       "returns": "void",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "设置值"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "-",
 *       "returns": "MTabsConfigEditorData",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "获取值"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": "-",
 *       "returns": "void",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "清空"
 *     },
 *     {
 *       "name": "validate",
 *       "exposed": true,
 *       "async": false,
 *       "params": "-",
 *       "returns": "MTabsConfigEditorValidateResult",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MTabsConfigEditor.vue",
 *       "label": "校验"
 *     }
 *   ],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时输出 tabs、activeTabId、readonly，不保存弹窗状态、页面候选缓存或校验提示。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MTabsConfigEditor-example",
 *       "type": "MTabsConfigEditor",
 *       "data": {
 *         "tabs": [],
 *         "activeTabId": "",
 *         "readonly": false
 *       }
 *     }
 *   ]
 * }
 */
export const mTabsConfigEditorTool = defineEditorTool<MTabsConfigEditorProps>({
  normalizeProps: normalizeMTabsConfigEditorProps,
  serialize: (props) => {
    const normalized = normalizeMTabsConfigEditorProps(props).value as MTabsConfigEditorData;
    return {
      tabs: normalized.tabs,
      activeTabId: normalized.activeTabId,
      readonly: normalized.readonly === true
    };
  }
});
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import {
  listPages,
  listSystemPages,
  type PageListItem,
  type PageSource
} from '@/utils/pagesApi';

type EditableTab = MTabsTab & {
  pageSource: PageSource;
};

const props = defineProps<MTabsConfigEditorProps & {
  onChange?: (payload: MTabsConfigEditorPayload) => void;
  onToolChange?: (payload: MTabsConfigEditorPayload) => void;
}>();

const emit = defineEmits<{
  (event: 'change', payload: MTabsConfigEditorPayload): void;
  (event: 'clear', payload: { oldValue: MTabsConfigEditorData }): void;
}>();

const { t } = useI18n();
const settingsDialogRef = ref<HTMLDialogElement | null>(null);
const isSettingsDialogOpen = ref(false);
const committedValue = ref<MTabsConfigEditorData>(normalizeFromProps());
const draftTabs = ref<EditableTab[]>(toEditableTabs(committedValue.value.tabs));
const draftActiveTabId = ref(committedValue.value.activeTabId);
const validationMessage = ref('');
const pageOptions = ref<PageListItem[]>([]);
const pagesLoading = ref(false);
const pagesError = ref('');
const pageSearch = ref('');
const pageKindFilter = ref<'all' | 'main' | 'sub'>('all');
const relationNotice = ref('');
let pagesLoadId = 0;

const isReadOnly = computed(() => !props.edit || props.readonly === true || committedValue.value.readonly === true);
const savedTabCount = computed(() => committedValue.value.tabs.length);
const activeTabSummary = computed(() => {
  const activeTab = committedValue.value.tabs.find((tab) => tab.id === committedValue.value.activeTabId);
  return activeTab?.name || t('tabs.configEditor.summary.noActive');
});
const pageOptionsByUuid = computed(() => {
  const map = new Map<string, PageListItem>();
  pageOptions.value.forEach((page) => {
    map.set(`${page.source}:${page.uuid}`, page);
  });
  return map;
});

function normalizeFromProps() {
  return normalizeMTabsConfigEditorProps(props).value as MTabsConfigEditorData;
}

function toEditableTabs(tabs: MTabsTab[]): EditableTab[] {
  return tabs.map((tab) => ({
    ...cloneValue(tab),
    pageSource: tab.pageSource === 'system' ? 'system' : 'user'
  }));
}

function fromEditableTabs(tabs: EditableTab[]): MTabsTab[] {
  return tabs.map((tab) => ({
    id: tab.id.trim(),
    name: tab.name.trim(),
    pageUUID: tab.pageUUID.trim(),
    pageSource: tab.pageSource === 'system' ? 'system' : 'user',
    ...(tab.query ? { query: cloneValue(tab.query) } : {})
  }));
}

function createDraftFromCommittedValue() {
  draftTabs.value = toEditableTabs(committedValue.value.tabs);
  draftActiveTabId.value = committedValue.value.activeTabId;
  validationMessage.value = '';
  relationNotice.value = '';
}

function createTabId() {
  const existingIds = new Set(draftTabs.value.map((tab) => tab.id));
  let index = draftTabs.value.length + 1;
  let id = `tab_${index}`;
  while (existingIds.has(id)) {
    index += 1;
    id = `tab_${index}`;
  }
  return id;
}

function addTab() {
  if (isReadOnly.value) return;
  const id = createTabId();
  const nextTab: EditableTab = {
    id,
    name: t('tabs.configEditor.defaultTabName').replace('{index}', String(draftTabs.value.length + 1)),
    pageUUID: '',
    pageSource: 'user'
  };
  draftTabs.value.push(nextTab);
  if (!draftActiveTabId.value) {
    draftActiveTabId.value = id;
  }
}

function removeTab(index: number) {
  if (isReadOnly.value) return;
  const removed = draftTabs.value[index];
  draftTabs.value.splice(index, 1);
  if (removed?.id === draftActiveTabId.value) {
    draftActiveTabId.value = draftTabs.value[0]?.id ?? '';
  }
}

function moveTab(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= draftTabs.value.length) return;
  const nextTabs = [...draftTabs.value];
  const [tab] = nextTabs.splice(index, 1);
  if (!tab) return;
  nextTabs.splice(nextIndex, 0, tab);
  draftTabs.value = nextTabs;
}

function updateTab(index: number, patch: Partial<EditableTab>) {
  if (isReadOnly.value) return;
  const tab = draftTabs.value[index];
  if (!tab) return;
  draftTabs.value[index] = {
    ...tab,
    ...patch
  };
  if (patch.id !== undefined && draftActiveTabId.value === tab.id) {
    draftActiveTabId.value = patch.id.trim();
  }
}

function selectActiveTab(tabId: string) {
  if (isReadOnly.value) return;
  draftActiveTabId.value = tabId;
}

function pageOptionLabel(page: PageListItem) {
  const sourceLabel = page.source === 'system'
    ? t('tabs.configEditor.sources.system')
    : t('tabs.configEditor.sources.user');
  const blocked = !isPageReferenceAllowed(page);
  return `${page.name || page.uuid} · ${sourceLabel} · ${page.subPage ? '子页面' : '主页面'}${blocked ? ' · 循环引用' : ''}`;
}

function isPageReferenceAllowed(page: Pick<PageListItem, 'uuid' | 'source'>) {
  return props.pageEditor?.canReference({ uuid: page.uuid, source: page.source }).allowed ?? true;
}

function filteredPageOptions(tab: EditableTab) {
  const query = pageSearch.value.trim().toLowerCase();
  return pageOptions.value.filter((page) => {
    if (page.source !== tab.pageSource) return false;
    if (pageKindFilter.value === 'sub' && !page.subPage) return false;
    if (pageKindFilter.value === 'main' && page.subPage) return false;
    if (!query) return true;
    return page.name.toLowerCase().includes(query) || page.uuid.toLowerCase().includes(query);
  });
}

function getPageOption(tab: EditableTab) {
  return pageOptionsByUuid.value.get(`${tab.pageSource}:${tab.pageUUID.trim()}`);
}

function updateTabPageUUID(index: number, pageUUID: string) {
  if (isReadOnly.value) return;
  const tab = draftTabs.value[index];
  if (!tab) return;
  const normalizedPageUUID = pageUUID.trim();
  const page = pageOptionsByUuid.value.get(`${tab.pageSource}:${normalizedPageUUID}`);
  updateTab(index, {
    pageUUID: normalizedPageUUID,
    name: !tab.name.trim() && page?.name ? page.name : tab.name
  });
}

async function createSubPage(index: number) {
  const tab = draftTabs.value[index];
  if (!tab || !props.pageEditor || isReadOnly.value) return;
  validationMessage.value = '';
  if (!props.pageEditor.canCreateSubPage) {
    validationMessage.value = '当前为临时编排会话，不能创建子页面。';
    return;
  }
  try {
    const result = await props.pageEditor.createUserSubPage({
      kind: 'tabs',
      blockId: props.currentBlockId,
      itemId: tab.id || `tab_${index + 1}`
    }, {
      name: tab.name
    });
    if (result.status !== 'saved') return;
    const page: PageListItem = {
      uuid: result.page.uuid,
      name: result.page.name,
      source: 'user',
      subPage: result.page.subPage,
      quotes: result.page.quotes,
      dependencies: result.page.dependencies
    };
    pageOptions.value = [
      page,
      ...pageOptions.value.filter((item) => `${item.source}:${item.uuid}` !== `user:${page.uuid}`)
    ];
    updateTab(index, { pageUUID: page.uuid, pageSource: 'user' });
    relationNotice.value = '子页面已保存；待当前页面保存后建立引用关系。';
  } catch (error) {
    validationMessage.value = error instanceof Error ? error.message : '无法打开子页面编排器。';
  }
}

async function editSubPage(index: number) {
  const tab = draftTabs.value[index];
  if (!tab || !tab.pageUUID.trim() || !props.pageEditor) return;
  validationMessage.value = '';
  try {
    await props.pageEditor.openExisting({
      uuid: tab.pageUUID.trim(),
      source: tab.pageSource
    }, {
      kind: 'tabs',
      blockId: props.currentBlockId,
      itemId: tab.id || `tab_${index + 1}`
    });
  } catch (error) {
    validationMessage.value = error instanceof Error ? error.message : '无法打开子页面编排器。';
  }
}

function validateTabsValue(tabs: EditableTab[], activeTabId: string): MTabsConfigEditorValidateResult {
  const seenIds = new Set<string>();

  for (const tab of tabs) {
    const id = tab.id.trim();
    if (!id) return { valid: false, message: t('tabs.configEditor.validation.emptyId') };
    if (seenIds.has(id)) return { valid: false, message: t('tabs.configEditor.validation.duplicateId').replace('{id}', id) };
    seenIds.add(id);

    if (!tab.name.trim()) return { valid: false, message: t('tabs.configEditor.validation.emptyName') };
    if (!tab.pageUUID.trim()) return { valid: false, message: t('tabs.configEditor.validation.emptyPageUUID') };
  }

  if (activeTabId && !seenIds.has(activeTabId)) {
    return { valid: false, message: t('tabs.configEditor.validation.invalidActive') };
  }

  return { valid: true };
}

function buildValueFromDraft(): MTabsConfigEditorData {
  const tabs = fromEditableTabs(draftTabs.value);
  const activeTabId = normalizeActiveTabId(draftActiveTabId.value, tabs);
  return {
    tabs,
    activeTabId,
    readonly: committedValue.value.readonly === true
  };
}

function buildPayload(value: MTabsConfigEditorData, oldValue?: MTabsConfigEditorData): MTabsConfigEditorPayload {
  const clonedValue = cloneValue(value);
  const payload: MTabsConfigEditorPayload = {
    value: clonedValue,
    ...(oldValue ? { oldValue: cloneValue(oldValue) } : {})
  };

  if (props.outputMode === 'patch') {
    payload.patch = {
      tabs: cloneValue(clonedValue.tabs),
      activeTabId: clonedValue.activeTabId
    };
  }

  return payload;
}

function emitValueChange(value: MTabsConfigEditorData, oldValue?: MTabsConfigEditorData) {
  const payload = buildPayload(value, oldValue);
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  emit('change', payload);
}

function saveTabs() {
  if (isReadOnly.value) return;
  const validation = validateTabsValue(draftTabs.value, draftActiveTabId.value);
  if (!validation.valid) {
    validationMessage.value = validation.message ?? t('tabs.configEditor.validation.invalid');
    return;
  }

  const oldValue = cloneValue(committedValue.value);
  const nextValue = buildValueFromDraft();
  committedValue.value = nextValue;
  emitValueChange(nextValue, oldValue);
  closeSettingsDialog();
}

function clearTabs() {
  if (isReadOnly.value) return;
  const oldValue = cloneValue(committedValue.value);
  const nextValue: MTabsConfigEditorData = {
    tabs: [],
    activeTabId: '',
    readonly: committedValue.value.readonly === true
  };
  committedValue.value = nextValue;
  createDraftFromCommittedValue();
  props.onToolChange?.(buildPayload(nextValue, oldValue));
  props.onChange?.(buildPayload(nextValue, oldValue));
  emit('clear', { oldValue });
  emit('change', buildPayload(nextValue, oldValue));
}

function getValue() {
  return cloneValue(committedValue.value);
}

function setValue(value: unknown) {
  const oldValue = cloneValue(committedValue.value);
  const nextValue = normalizeMTabsConfigEditorData(value);
  committedValue.value = nextValue;
  if (!isSettingsDialogOpen.value) {
    createDraftFromCommittedValue();
  }
  emitValueChange(nextValue, oldValue);
}

function validate() {
  return validateTabsValue(toEditableTabs(committedValue.value.tabs), committedValue.value.activeTabId);
}

async function refreshPages() {
  const loadId = ++pagesLoadId;
  pagesLoading.value = true;
  pagesError.value = '';

  try {
    const [userPages, systemPages] = await Promise.allSettled([
      listPages({ page: 1, pageSize: 1000 }),
      listSystemPages()
    ]);
    if (loadId !== pagesLoadId) return;

    const nextPages = [
      ...(userPages.status === 'fulfilled' ? userPages.value : []),
      ...(systemPages.status === 'fulfilled' ? systemPages.value : [])
    ];
    pageOptions.value = nextPages;

    if (userPages.status === 'rejected' && systemPages.status === 'rejected') {
      pagesError.value = t('tabs.configEditor.pageOptionsLoadFailed');
    }
  } finally {
    if (loadId === pagesLoadId) {
      pagesLoading.value = false;
    }
  }
}

function openSettingsDialog() {
  createDraftFromCommittedValue();
  isSettingsDialogOpen.value = true;
  if (!settingsDialogRef.value?.open) {
    settingsDialogRef.value?.showModal();
  }
  if (!pageOptions.value.length) {
    void refreshPages();
  }
}

function closeSettingsDialog() {
  isSettingsDialogOpen.value = false;
  if (settingsDialogRef.value?.open) {
    settingsDialogRef.value.close();
  }
}

watch(
  () => [props.value, props.tabs, props.activeTabId, props.readonly],
  () => {
    committedValue.value = normalizeFromProps();
    if (!isSettingsDialogOpen.value) {
      createDraftFromCommittedValue();
    }
  },
  { deep: true, immediate: true }
);

onBeforeUnmount(() => {
  pagesLoadId += 1;
});

defineExpose({
  setValue,
  getValue,
  clear: clearTabs,
  validate,
  refresh: refreshPages
});
</script>

<template>
  <div class="tabs-config-editor" data-testid="tabs-config-editor">
    <div class="tabs-config-editor__trigger-row">
      <button
        class="tabs-config-editor__primary-button"
        type="button"
        data-testid="tabs-config-settings-open"
        :disabled="isReadOnly"
        @click="openSettingsDialog"
      >
        {{ t('tabs.configEditor.actions.settings') }}
      </button>
      <div class="tabs-config-editor__summary" data-testid="tabs-config-summary">
        {{
          t('tabs.configEditor.summary.savedCount')
            .replace('{count}', String(savedTabCount))
            .replace('{active}', activeTabSummary)
        }}
      </div>
    </div>

    <dialog
      ref="settingsDialogRef"
      class="tabs-config-editor__dialog"
      data-testid="tabs-config-dialog"
      :aria-hidden="!isSettingsDialogOpen"
      aria-labelledby="tabs-config-dialog-title"
      @close="isSettingsDialogOpen = false"
    >
      <div class="tabs-config-editor__dialog-panel">
        <div class="tabs-config-editor__dialog-header">
          <h3
            id="tabs-config-dialog-title"
            class="tabs-config-editor__dialog-title"
            data-testid="tabs-config-dialog-title"
          >
            {{ t('tabs.configEditor.title') }}
          </h3>
          <button
            class="tabs-config-editor__secondary-button"
            type="button"
            data-testid="tabs-config-close"
            @click="closeSettingsDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="tabs-config-editor__dialog-body">
          <div class="tabs-config-editor__toolbar">
            <button
              class="tabs-config-editor__primary-button"
              type="button"
              data-testid="tabs-config-add"
              :disabled="isReadOnly"
              @click="addTab"
            >
              {{ t('tabs.configEditor.actions.add') }}
            </button>
            <button
              class="tabs-config-editor__secondary-button"
              type="button"
              data-testid="tabs-config-refresh-pages"
              :disabled="pagesLoading"
              @click="refreshPages"
            >
              {{ pagesLoading ? t('tabs.configEditor.loadingPages') : t('tabs.configEditor.actions.refreshPages') }}
            </button>
            <button
              class="tabs-config-editor__danger-button"
              type="button"
              data-testid="tabs-config-clear"
              :disabled="isReadOnly || !committedValue.tabs.length"
              @click="clearTabs"
            >
              {{ t('tabs.configEditor.actions.clear') }}
            </button>
          </div>

          <p v-if="pagesError" class="tabs-config-editor__notice tabs-config-editor__notice--warning">
            {{ pagesError }}
          </p>
          <div class="tabs-config-editor__page-filters">
            <input
              v-model="pageSearch"
              class="tabs-config-editor__input"
              type="search"
              placeholder="按页面名称或 UUID 搜索"
              data-testid="tabs-config-page-search"
            >
            <select v-model="pageKindFilter" class="tabs-config-editor__input" data-testid="tabs-config-page-kind-filter">
              <option value="all">全部页面</option>
              <option value="main">主页面</option>
              <option value="sub">子页面</option>
            </select>
          </div>

          <p v-if="relationNotice" class="tabs-config-editor__notice tabs-config-editor__notice--info" data-testid="tabs-config-relation-notice">
            {{ relationNotice }}
          </p>

          <p
            v-if="!draftTabs.length"
            class="tabs-config-editor__empty"
            data-testid="tabs-config-empty"
          >
            {{ t('tabs.configEditor.empty') }}
          </p>

          <div v-else class="tabs-config-editor__table" data-testid="tabs-config-list">
            <div class="tabs-config-editor__table-head" aria-hidden="true">
              <span>{{ t('tabs.configEditor.columns.active') }}</span>
              <span>{{ t('tabs.configEditor.columns.id') }}</span>
              <span>{{ t('tabs.configEditor.columns.name') }}</span>
              <span>{{ t('tabs.configEditor.columns.source') }}</span>
              <span>{{ t('tabs.configEditor.columns.pageUUID') }}</span>
              <span>{{ t('tabs.configEditor.columns.actions') }}</span>
            </div>

            <div
              v-for="(tab, index) in draftTabs"
              :key="`${tab.id}-${index}`"
              class="tabs-config-editor__row"
              :data-testid="`tabs-config-row-${index}`"
            >
              <label class="tabs-config-editor__active-cell">
                <input
                  type="radio"
                  name="tabs-config-active-tab"
                  :checked="draftActiveTabId === tab.id"
                  :disabled="isReadOnly || !tab.id"
                  :aria-label="t('tabs.configEditor.columns.active')"
                  :data-testid="`tabs-config-active-${index}`"
                  @change="selectActiveTab(tab.id)"
                >
              </label>

              <input
                class="tabs-config-editor__input"
                type="text"
                :value="tab.id"
                :readonly="isReadOnly"
                :data-testid="`tabs-config-id-${index}`"
                @input="updateTab(index, { id: ($event.target as HTMLInputElement).value })"
              >

              <input
                class="tabs-config-editor__input"
                type="text"
                :value="tab.name"
                :readonly="isReadOnly"
                :data-testid="`tabs-config-name-${index}`"
                @input="updateTab(index, { name: ($event.target as HTMLInputElement).value })"
              >

              <select
                class="tabs-config-editor__input"
                :value="tab.pageSource"
                :disabled="isReadOnly"
                :data-testid="`tabs-config-source-${index}`"
                @change="updateTab(index, { pageSource: ($event.target as HTMLSelectElement).value === 'system' ? 'system' : 'user', pageUUID: '' })"
              >
                <option value="user">{{ t('tabs.configEditor.sources.user') }}</option>
                <option value="system">{{ t('tabs.configEditor.sources.system') }}</option>
              </select>

              <div class="tabs-config-editor__page-cell">
                <select
                  class="tabs-config-editor__input"
                  :value="tab.pageUUID"
                  :disabled="isReadOnly || pagesLoading"
                  :data-testid="`tabs-config-page-uuid-${index}`"
                  @change="updateTabPageUUID(index, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">请选择页面</option>
                  <option
                    v-if="tab.pageUUID && !pageOptions.some((page) => page.source === tab.pageSource && page.uuid === tab.pageUUID)"
                    :value="tab.pageUUID"
                  >
                    {{ tab.pageUUID }}（当前配置）
                  </option>
                  <option
                    v-for="page in filteredPageOptions(tab)"
                    :key="`${page.source}:${page.uuid}`"
                    :value="page.uuid"
                    :disabled="!isPageReferenceAllowed(page)"
                  >
                    {{ pageOptionLabel(page) }}
                  </option>
                </select>
                <span
                  v-if="getPageOption(tab)"
                  class="tabs-config-editor__page-name"
                  :data-testid="`tabs-config-page-name-${index}`"
                >
                  {{ getPageOption(tab)?.name || getPageOption(tab)?.uuid }}
                </span>
              </div>

              <div class="tabs-config-editor__actions">
                <button
                  class="tabs-config-editor__secondary-button"
                  type="button"
                  :disabled="isReadOnly || !pageEditor || !pageEditor.canCreateSubPage"
                  :data-testid="`tabs-config-create-page-${index}`"
                  @click="createSubPage(index)"
                >
                  新建子页面
                </button>
                <button
                  class="tabs-config-editor__secondary-button"
                  type="button"
                  :disabled="!pageEditor || !tab.pageUUID"
                  :data-testid="`tabs-config-edit-page-${index}`"
                  @click="editSubPage(index)"
                >
                  {{ tab.pageSource === 'system' || !pageEditor?.canPersist ? '临时编排页面' : '编排页面' }}
                </button>
                <button
                  class="tabs-config-editor__icon-button"
                  type="button"
                  :disabled="isReadOnly || index === 0"
                  :data-testid="`tabs-config-move-up-${index}`"
                  @click="moveTab(index, -1)"
                >
                  ↑
                </button>
                <button
                  class="tabs-config-editor__icon-button"
                  type="button"
                  :disabled="isReadOnly || index === draftTabs.length - 1"
                  :data-testid="`tabs-config-move-down-${index}`"
                  @click="moveTab(index, 1)"
                >
                  ↓
                </button>
                <button
                  class="tabs-config-editor__danger-button"
                  type="button"
                  :disabled="isReadOnly"
                  :data-testid="`tabs-config-remove-${index}`"
                  @click="removeTab(index)"
                >
                  {{ t('tabs.configEditor.actions.remove') }}
                </button>
              </div>
            </div>
          </div>

          <p
            v-if="validationMessage"
            class="tabs-config-editor__notice tabs-config-editor__notice--error"
            data-testid="tabs-config-validation"
          >
            {{ validationMessage }}
          </p>
        </div>

        <div class="tabs-config-editor__dialog-actions">
          <button
            class="tabs-config-editor__secondary-button"
            type="button"
            data-testid="tabs-config-cancel"
            @click="closeSettingsDialog"
          >
            {{ t('globalCalls.cancel') }}
          </button>
          <button
            class="tabs-config-editor__primary-button"
            type="button"
            data-testid="tabs-config-save"
            :disabled="isReadOnly"
            @click="saveTabs"
          >
            {{ t('editor.saveContent') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.tabs-config-editor {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 8px;
}

.tabs-config-editor__trigger-row,
.tabs-config-editor__toolbar,
.tabs-config-editor__dialog-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tabs-config-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  flex: 1 1 220px;
  font-size: 12px;
  line-height: 18px;
  padding: 7px 10px;
}

.tabs-config-editor__primary-button,
.tabs-config-editor__secondary-button,
.tabs-config-editor__icon-button,
.tabs-config-editor__danger-button {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  min-height: 32px;
  padding: 6px 10px;
}

.tabs-config-editor__primary-button {
  border-color: rgb(37 99 235);
  background: rgb(37 99 235);
  color: white;
}

.tabs-config-editor__danger-button {
  border-color: rgb(254 202 202);
  color: rgb(185 28 28);
}

.tabs-config-editor__icon-button {
  width: 32px;
  padding: 6px;
}

.tabs-config-editor__primary-button:hover,
.tabs-config-editor__secondary-button:hover,
.tabs-config-editor__icon-button:hover,
.tabs-config-editor__danger-button:hover {
  filter: brightness(0.98);
}

.tabs-config-editor__primary-button:disabled,
.tabs-config-editor__secondary-button:disabled,
.tabs-config-editor__icon-button:disabled,
.tabs-config-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.tabs-config-editor__dialog {
  width: min(960px, calc(100vw - 32px));
  max-width: 960px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  padding: 0;
}

.tabs-config-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.tabs-config-editor__dialog-panel {
  display: flex;
  max-height: min(760px, calc(100vh - 48px));
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 12px;
  background: rgb(255 255 255);
  box-shadow: 0 24px 60px rgb(15 23 42 / 0.22);
}

.tabs-config-editor__dialog-header,
.tabs-config-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.tabs-config-editor__dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.tabs-config-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  line-height: 24px;
}

.tabs-config-editor__dialog-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  padding: 16px;
}

.tabs-config-editor__empty,
.tabs-config-editor__notice {
  margin: 0;
  border: 1px dashed rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 13px;
  line-height: 20px;
  padding: 12px;
}

.tabs-config-editor__notice--warning {
  border-color: rgb(253 230 138);
  background: rgb(254 252 232);
  color: rgb(146 64 14);
}

.tabs-config-editor__notice--error {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

.tabs-config-editor__notice--info {
  border-color: rgb(165 243 252);
  background: rgb(236 254 255);
  color: rgb(14 116 144);
}

.tabs-config-editor__page-filters {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 150px;
  gap: 8px;
}

.tabs-config-editor__table {
  display: grid;
  min-width: 1040px;
  gap: 8px;
}

.tabs-config-editor__table-head,
.tabs-config-editor__row {
  display: grid;
  grid-template-columns: 64px minmax(120px, 0.9fr) minmax(140px, 1fr) 118px minmax(180px, 1.25fr) 360px;
  align-items: center;
  gap: 8px;
}

.tabs-config-editor__table-head {
  color: rgb(71 85 105);
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  padding: 0 8px;
}

.tabs-config-editor__row {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
  padding: 8px;
}

.tabs-config-editor__active-cell {
  display: flex;
  justify-content: center;
}

.tabs-config-editor__input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 13px;
  line-height: 20px;
  padding: 7px 9px;
}

.tabs-config-editor__input:focus {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 2px rgb(37 99 235 / 0.16);
  outline: none;
}

.tabs-config-editor__input:read-only,
.tabs-config-editor__input:disabled {
  background: rgb(248 250 252);
  color: rgb(100 116 139);
}

.tabs-config-editor__page-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.tabs-config-editor__page-name {
  overflow: hidden;
  color: rgb(100 116 139);
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tabs-config-editor__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.dark .tabs-config-editor__summary,
.dark .tabs-config-editor__empty,
.dark .tabs-config-editor__row,
.dark .tabs-config-editor__dialog-panel {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

.dark .tabs-config-editor__summary,
.dark .tabs-config-editor__empty,
.dark .tabs-config-editor__table-head,
.dark .tabs-config-editor__page-name {
  color: rgb(203 213 225);
}

.dark .tabs-config-editor__dialog-header,
.dark .tabs-config-editor__dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .tabs-config-editor__dialog-title {
  color: rgb(248 250 252);
}

.dark .tabs-config-editor__input,
.dark .tabs-config-editor__secondary-button,
.dark .tabs-config-editor__icon-button,
.dark .tabs-config-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
  color: rgb(248 250 252);
}

.dark .tabs-config-editor__input:read-only,
.dark .tabs-config-editor__input:disabled {
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}

.dark .tabs-config-editor__notice--warning {
  border-color: rgb(146 64 14);
  background: rgb(146 64 14 / 0.2);
  color: rgb(253 230 138);
}

.dark .tabs-config-editor__notice--error {
  border-color: rgb(127 29 29);
  background: rgb(127 29 29 / 0.24);
  color: rgb(254 202 202);
}

@media (max-width: 760px) {
  .tabs-config-editor__dialog {
    width: calc(100vw - 16px);
  }

  .tabs-config-editor__dialog-panel {
    max-height: calc(100vh - 16px);
  }

  .tabs-config-editor__dialog-header,
  .tabs-config-editor__dialog-actions,
  .tabs-config-editor__dialog-body {
    padding: 12px;
  }
}
</style>
