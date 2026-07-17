<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import * as QRCode from 'qrcode';
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import type { MokelayLayout, RenderBundlePage } from '@/services/layoutsApi';
import type { LayoutNavigateHandler } from 'mokelay-components/layouts';
import type { PageDataSourceConfig, PageRuntimeContext } from 'mokelay-components/pages';

const previewModes = ['pc', 'h5', 'ios', 'android'] as const;

type PreviewMode = typeof previewModes[number];

type PreviewPanelProps = {
  blocks?: OutputData['blocks'];
  dataSources?: PageDataSourceConfig[];
  runtimeContext?: PageRuntimeContext;
  loading?: boolean;
  error?: string;
  pageUuid?: string | null;
  pageName?: string;
  layout?: MokelayLayout | null;
  minimal?: boolean;
  showTitle?: boolean;
  showToolbar?: boolean;
  onNavigate?: LayoutNavigateHandler;
};

const MPage = defineAsyncComponent(() => import('mokelay-components/blocks/MPage.vue'));
const LayoutRenderer = defineAsyncComponent(() => import('mokelay-components/layouts/LayoutRenderer.vue'));

const props = withDefaults(defineProps<PreviewPanelProps>(), {
  blocks: () => [],
  loading: false,
  error: '',
  pageUuid: null,
  pageName: '',
  layout: null,
  minimal: false,
  showTitle: true,
  showToolbar: true
});

const { t } = useI18n();
const previewMode = ref<PreviewMode>('pc');
const qrCodeDataUrl = ref('');
const qrCodeError = ref('');
const qrCodeLoading = ref(false);
const previewPage = computed<RenderBundlePage>(() => ({
  uuid: props.pageUuid ?? '',
  name: props.pageName,
  blocks: props.blocks,
  dataSources: props.dataSources,
  subPage: false,
  quotes: [],
  dependencies: []
}));
const isAppPreviewMode = computed(() => previewMode.value === 'ios' || previewMode.value === 'android');
const qrCodeValue = computed(() => {
  if (previewMode.value === 'ios') {
    return typeof window === 'undefined' ? '' : window.location.href;
  }

  if (previewMode.value === 'android') {
    const ticket = props.pageUuid || 'draft';
    return `mokelay://preview/android?ticket=${encodeURIComponent(ticket)}`;
  }

  return '';
});
const qrCodeTitle = computed(() => previewMode.value === 'ios' ? t('preview.iosQrCode') : t('preview.androidQrCode'));
const qrCodeDescription = computed(() => previewMode.value === 'ios'
  ? t('preview.iosQrCodeDescription')
  : t('preview.androidQrCodeDescription'));
const panelClass = computed(() => props.minimal
  ? 'flex min-h-screen flex-1 flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100'
  : 'flex min-h-[520px] flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900');
const toolbarClass = computed(() => props.minimal
  ? 'sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95'
  : 'mb-4 flex flex-wrap items-center justify-between gap-3');
const bodyClass = computed(() => props.minimal ? 'min-h-0 flex-1 overflow-auto' : 'flex-1 overflow-auto');
const mobileCanvasTestId = computed(() => `preview-${previewMode.value}-canvas`);
const phoneShellClass = computed(() => {
  if (previewMode.value === 'ios') {
    return 'relative shrink-0 rounded-[52px] border-[10px] border-slate-950 bg-slate-950 p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-800';
  }

  if (previewMode.value === 'android') {
    return 'relative shrink-0 rounded-[38px] border-[8px] border-slate-900 bg-slate-900 p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-800';
  }

  return 'relative shrink-0 rounded-[32px] border border-slate-300 bg-slate-200 p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800';
});
const phoneScreenClass = computed(() => {
  if (previewMode.value === 'android') {
    return 'h-[800px] w-[390px] overflow-auto rounded-[28px] bg-white p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100';
  }

  if (previewMode.value === 'ios') {
    return 'h-[844px] w-[390px] overflow-auto rounded-[34px] bg-white p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100';
  }

  return 'h-[760px] w-[390px] overflow-auto rounded-[24px] bg-white p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100';
});

function setPreviewMode(mode: PreviewMode) {
  previewMode.value = mode;
}

watch(
  [isAppPreviewMode, qrCodeValue],
  async ([appPreviewMode, value]) => {
    qrCodeDataUrl.value = '';
    qrCodeError.value = '';

    if (!appPreviewMode || !value) {
      qrCodeLoading.value = false;
      return;
    }

    qrCodeLoading.value = true;

    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(value, {
        margin: 1,
        width: 220
      });
    } catch {
      qrCodeError.value = t('preview.qrCodeFailed');
    } finally {
      qrCodeLoading.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <section
    data-testid="preview-panel"
    :class="panelClass"
  >
    <div v-if="showToolbar" :class="toolbarClass">
      <div class="flex min-w-0 items-center gap-3">
        <slot name="toolbarLeading"></slot>
        <h2 v-if="showTitle" class="text-base font-semibold text-slate-950 dark:text-white">{{ t('preview.title') }}</h2>
      </div>
      <div data-testid="preview-mode-switcher" class="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
        <button
          v-for="mode in previewModes"
          :key="mode"
          type="button"
          :data-testid="`preview-mode-${mode}`"
          :aria-pressed="previewMode === mode"
          class="rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          :class="previewMode === mode ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'"
          @click="setPreviewMode(mode)"
        >
          {{ t(`preview.modes.${mode}`) }}
        </button>
      </div>
    </div>

    <div :class="bodyClass">
      <p v-if="loading" data-testid="preview-loading-state" class="rounded border border-sky-300 bg-sky-50 p-3 text-sky-800 dark:border-sky-500/60 dark:bg-sky-900/30 dark:text-sky-100">
        {{ t('page.loading') }}
      </p>
      <p v-else-if="error" data-testid="preview-error-state" class="rounded border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-500/60 dark:bg-red-900/30 dark:text-red-100">
        {{ error }}
      </p>
      <p v-else-if="!blocks.length && !layout" data-testid="preview-empty-state" class="rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-100">
        {{ t('preview.emptyState') }}
      </p>

      <div
        v-else-if="isAppPreviewMode"
        data-testid="preview-app-qrcode"
        class="flex min-h-full items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950"
      >
        <div class="w-full max-w-sm text-center">
          <h3 data-testid="preview-qrcode-platform" class="text-lg font-semibold text-slate-950 dark:text-white">
            {{ qrCodeTitle }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {{ qrCodeDescription }}
          </p>
          <div class="mt-6 inline-flex min-h-[244px] min-w-[244px] items-center justify-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p v-if="qrCodeLoading" data-testid="preview-qrcode-loading" class="text-sm text-slate-500 dark:text-slate-400">
              {{ t('preview.qrCodeLoading') }}
            </p>
            <p v-else-if="qrCodeError" data-testid="preview-qrcode-error" class="text-sm text-red-600 dark:text-red-300">
              {{ qrCodeError }}
            </p>
            <img
              v-else-if="qrCodeDataUrl"
              data-testid="preview-qrcode-image"
              :src="qrCodeDataUrl"
              :alt="t('preview.qrCodeAlt')"
              :data-qr-value="qrCodeValue"
              class="h-[220px] w-[220px]"
            />
          </div>
        </div>
      </div>

      <div v-else-if="previewMode === 'pc'" data-testid="preview-pc-canvas" class="min-h-full">
        <LayoutRenderer v-if="layout" :layout="layout" :page="previewPage" :page-runtime-context="runtimeContext" :on-navigate="onNavigate" />
        <MPage v-else :edit="false" :value="blocks" :page-id="pageUuid ?? undefined" :data-sources="dataSources" :runtime-context="runtimeContext" />
      </div>

      <div v-else :data-testid="mobileCanvasTestId" class="flex min-h-full justify-center overflow-auto bg-slate-100 px-4 py-6 dark:bg-slate-950">
        <div data-testid="preview-phone-shell" :class="phoneShellClass">
          <div v-if="previewMode === 'ios'" class="absolute left-1/2 top-3 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-950 dark:bg-slate-800"></div>
          <div data-testid="preview-phone-screen" :class="phoneScreenClass">
            <LayoutRenderer v-if="layout" :layout="layout" :page="previewPage" :page-runtime-context="runtimeContext" :on-navigate="onNavigate" />
            <MPage v-else :edit="false" :value="blocks" :page-id="pageUuid ?? undefined" :data-sources="dataSources" :runtime-context="runtimeContext" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
