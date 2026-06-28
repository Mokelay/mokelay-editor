<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';
import type { BlockDataField } from '@/utils/variableValue';

export type MTabsTab = {
  id: string;
  name: string;
  pageUUID: string;
  pageSource?: 'user' | 'system';
};

export interface MTabsProps {
  edit: boolean;
  currentBlockId?: string;
  tabs?: MTabsTab[];
  activeTabId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePageSource(value: unknown): MTabsTab['pageSource'] {
  return value === 'system' ? 'system' : undefined;
}

export function normalizeTabs(value: unknown): MTabsTab[] {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set<string>();
  const tabs: MTabsTab[] = [];

  value.forEach((item) => {
    if (!isRecord(item)) return;

    const id = readString(item.id);
    const name = readString(item.name);
    const pageUUID = readString(item.pageUUID);
    if (!id || !name || !pageUUID || seenIds.has(id)) return;

    seenIds.add(id);
    tabs.push({
      id,
      name,
      pageUUID,
      ...(normalizePageSource(item.pageSource) ? { pageSource: normalizePageSource(item.pageSource) } : {})
    });
  });

  return tabs;
}

function normalizeActiveTabId(value: unknown, tabs: MTabsTab[]) {
  const activeTabId = readString(value);
  if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) {
    return activeTabId;
  }
  return tabs[0]?.id ?? '';
}

function getTabsDataFields(): BlockDataField[] {
  return [
    {
      label: i18n.t('tabs.dataFields.activeTabId'),
      variable: 'activeTabId',
      dataType: 'string'
    },
    {
      label: i18n.t('tabs.dataFields.activeTab'),
      variable: 'activeTab',
      dataType: 'object'
    },
    {
      label: i18n.t('tabs.dataFields.tabs'),
      variable: 'tabs',
      dataType: 'array'
    }
  ];
}

export const mTabsEditorTool = defineEditorTool<MTabsProps>({
  toolbox: {
    get title() {
      return i18n.t('tabs.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 6v12M3 11h7" stroke="currentColor" stroke-width="2"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('tabs.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'tabs',
          label: i18n.t('tabs.properties.tabs'),
          type: 'textarea' as const,
          valueType: 'json' as const,
          validationMessage: i18n.t('tabs.validation.invalidTabsJson')
        },
        {
          key: 'activeTabId',
          label: i18n.t('tabs.properties.activeTabId')
        }
      ];
    }
  },
  createInitialProps: () => ({
    tabs: [],
    activeTabId: ''
  }),
  getDataFields: () => getTabsDataFields(),
  normalizeProps: (props) => {
    const tabs = normalizeTabs(props.tabs);
    return {
      edit: props.edit ?? false,
      currentBlockId: props.currentBlockId,
      tabs,
      activeTabId: normalizeActiveTabId(props.activeTabId, tabs)
    };
  },
  serialize: (props) => {
    const tabs = normalizeTabs(props.tabs);
    return {
      tabs,
      activeTabId: normalizeActiveTabId(props.activeTabId, tabs)
    };
  }
});
</script>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import MPage from '@/blocks/MPage.vue';
import { i18n as runtimeI18n } from '@/i18n';
import { getPage, getSystemPage, type MokelayPage } from '@/utils/pagesApi';
import {
  PageRuntimeContextKey,
  type PageRuntimeContext
} from '@/utils/pageRuntimeContext';
import {
  PreviewBlockRuntimeKey
} from '@/utils/previewBlockRuntime';

const props = defineProps<MTabsProps & {
  onChange?: (payload: MTabsProps) => void;
  onToolChange?: (payload: MTabsProps) => void;
}>();

const previewRuntime = inject(PreviewBlockRuntimeKey, null);
const parentRuntimeContext = inject(PageRuntimeContextKey, computed<PageRuntimeContext>(() => ({})));
const normalizedTabs = computed(() => normalizeTabs(props.tabs));
const internalActiveTabId = ref('');
const activePage = shallowRef<MokelayPage | null>(null);
const pageLoading = ref(false);
const pageError = ref('');
let pageLoadId = 0;

const activeTabId = computed(() => normalizeActiveTabId(internalActiveTabId.value, normalizedTabs.value));
const activeTab = computed(() => normalizedTabs.value.find((tab) => tab.id === activeTabId.value));
const hasActivePageBlocks = computed(() => Boolean(activePage.value?.blocks.length));

function getTabsSignature() {
  return JSON.stringify(normalizedTabs.value);
}

function emitChange() {
  const payload = {
    edit: props.edit,
    currentBlockId: props.currentBlockId,
    tabs: normalizedTabs.value,
    activeTabId: activeTabId.value
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  if (props.currentBlockId) {
    previewRuntime?.notifyBlockDataChange(props.currentBlockId);
  }
}

function setActiveTabId(tabId: unknown, notify = true) {
  const nextTabId = typeof tabId === 'string' ? tabId.trim() : '';
  if (!nextTabId || !normalizedTabs.value.some((tab) => tab.id === nextTabId)) {
    return false;
  }

  if (internalActiveTabId.value !== nextTabId) {
    internalActiveTabId.value = nextTabId;
    if (notify) {
      emitChange();
    }
  }

  return true;
}

function readTabIdFromRecord(value: Record<string, unknown>) {
  const ownValue = readString(value.args) ||
    readString(value.activeTabId) ||
    readString(value.tabId) ||
    readString(value.id);
  if (ownValue) return ownValue;

  const inputs = typeof value.inputs === 'object' && value.inputs !== null && !Array.isArray(value.inputs)
    ? value.inputs as Record<string, unknown>
    : undefined;
  if (!inputs) return '';

  return readString(inputs.args) ||
    readString(inputs.activeTabId) ||
    readString(inputs.tabId) ||
    readString(inputs.id);
}

function readTabIdFromInvocation(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!isRecord(value)) return '';

  const tabId = readTabIdFromRecord(value);
  if (tabId) return tabId;

  if (isRecord(value.args)) {
    return readTabIdFromRecord(value.args);
  }

  const inputs = isRecord(value.inputs) ? value.inputs : undefined;
  if (inputs && isRecord(inputs.args)) {
    return readTabIdFromRecord(inputs.args);
  }

  return '';
}

function getData() {
  const currentTab = activeTab.value;
  return {
    activeTabId: activeTabId.value,
    activeTab: currentTab ? { ...currentTab } : null,
    tabs: normalizedTabs.value.map((tab) => ({ ...tab }))
  };
}

function setActiviTabId(value: unknown) {
  setActiveTabId(readTabIdFromInvocation(value), true);
  return getData();
}

async function loadActivePage() {
  const tab = activeTab.value;
  const loadId = ++pageLoadId;
  activePage.value = null;
  pageError.value = '';

  if (!tab) {
    pageLoading.value = false;
    return;
  }

  pageLoading.value = true;
  try {
    const page = tab.pageSource === 'system'
      ? await getSystemPage(tab.pageUUID)
      : await getPage(tab.pageUUID);
    if (loadId !== pageLoadId) return;
    activePage.value = page;
  } catch (error) {
    if (loadId !== pageLoadId) return;
    pageError.value = error instanceof Error && error.message
      ? error.message
      : i18n.t('tabs.states.loadFailed');
  } finally {
    if (loadId === pageLoadId) {
      pageLoading.value = false;
    }
  }
}

defineExpose({
  getData,
  setActiviTabId
});

watch(
  () => [props.activeTabId, getTabsSignature()],
  () => {
    internalActiveTabId.value = normalizeActiveTabId(props.activeTabId, normalizedTabs.value);
  },
  { immediate: true }
);

watch(
  () => activeTab.value?.pageUUID ?? '',
  () => {
    void loadActivePage();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  pageLoadId += 1;
});
</script>

<template>
  <PageDslBlock block-type="MTabs">
    <div class="m-tabs" data-testid="editor-tabs-tool">
      <div v-if="normalizedTabs.length" class="m-tabs__bar-wrap">
        <div class="m-tabs__bar" data-testid="editor-tabs-list" role="tablist">
          <button
            v-for="tab in normalizedTabs"
            :key="tab.id"
            type="button"
            class="m-tabs__tab"
            :class="{ 'm-tabs__tab--active': tab.id === activeTabId }"
            :aria-selected="tab.id === activeTabId"
            :data-testid="`editor-tabs-tab-${tab.id}`"
            role="tab"
            @click="setActiveTabId(tab.id)"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <div class="m-tabs__panel" data-testid="editor-tabs-active-panel" role="tabpanel">
        <p v-if="!normalizedTabs.length" class="m-tabs__state" data-testid="editor-tabs-empty-state">
          {{ runtimeI18n.t('tabs.states.empty') }}
        </p>
        <p v-else-if="pageLoading" class="m-tabs__state" data-testid="editor-tabs-loading-state">
          {{ runtimeI18n.t('tabs.states.loading') }}
        </p>
        <p v-else-if="pageError" class="m-tabs__state m-tabs__state--error" data-testid="editor-tabs-error-state">
          {{ pageError }}
        </p>
        <p v-else-if="!hasActivePageBlocks" class="m-tabs__state" data-testid="editor-tabs-empty-page-state">
          {{ runtimeI18n.t('tabs.states.emptyPage') }}
        </p>
        <MPage
          v-else-if="activePage"
          :edit="false"
          :value="activePage.blocks"
          :page-id="activePage.uuid"
          :data-sources="activePage.dataSources"
          :runtime-context="parentRuntimeContext"
        />
      </div>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.m-tabs {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 12px;
}

.m-tabs__bar-wrap {
  max-width: 100%;
  overflow-x: auto;
  padding-bottom: 2px;
}

.m-tabs__bar {
  display: inline-flex;
  min-width: max-content;
  gap: 4px;
  border: 1px solid rgb(203 213 225);
  border-radius: 14px;
  background: rgb(248 250 252);
  padding: 8px;
}

.m-tabs__tab {
  flex: 0 0 auto;
  min-width: 0;
  max-width: min(240px, 58vw);
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: rgb(71 85 105);
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  overflow: hidden;
  padding: 8px 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m-tabs__tab--active {
  border-color: rgb(226 232 240);
  background: rgb(255 255 255);
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.12);
  color: rgb(2 6 23);
}

.m-tabs__panel {
  min-width: 0;
}

.m-tabs__state {
  margin: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 14px;
  line-height: 20px;
  padding: 12px;
}

.m-tabs__state--error {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

:global(.dark) .m-tabs__bar {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
}

:global(.dark) .m-tabs__tab {
  color: rgb(203 213 225);
}

:global(.dark) .m-tabs__tab--active {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.28);
  color: rgb(248 250 252);
}

:global(.dark) .m-tabs__state {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(203 213 225);
}

:global(.dark) .m-tabs__state--error {
  border-color: rgb(127 29 29);
  background: rgb(127 29 29 / 0.24);
  color: rgb(254 202 202);
}
</style>
