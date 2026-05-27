<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs';
import QRCode from 'qrcode';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from '@/i18n';
import MPage from '@/blocks/MPage.vue';

const previewModes = ['pc', 'h5', 'ios', 'android'] as const;

type PreviewMode = typeof previewModes[number];
type QrPreviewMode = Extract<PreviewMode, 'ios' | 'android'>;

type PreviewPanelProps = {
  blocks?: OutputData['blocks'];
  loading?: boolean;
  error?: string;
};

withDefaults(defineProps<PreviewPanelProps>(), {
  blocks: () => [],
  loading: false,
  error: ''
});

const { t } = useI18n();
const previewMode = ref<PreviewMode>('pc');
const qrCodeError = ref('');
const qrCodeUrls = ref<Record<QrPreviewMode, string>>({
  ios: '',
  android: ''
});

const temporaryPreviewLinks: Record<QrPreviewMode, string> = {
  ios: `mokelay://preview/ios?ticket=${createTemporaryTicket()}`,
  android: `mokelay://preview/android?ticket=${createTemporaryTicket()}`
};

const activeQrCodeUrl = computed(() => {
  if (previewMode.value !== 'ios' && previewMode.value !== 'android') {
    return '';
  }

  return qrCodeUrls.value[previewMode.value];
});

function createTemporaryTicket() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function setPreviewMode(mode: PreviewMode) {
  previewMode.value = mode;
}

async function generateTemporaryQrCodes() {
  qrCodeError.value = '';

  try {
    const [iosQrCodeUrl, androidQrCodeUrl] = await Promise.all([
      QRCode.toDataURL(temporaryPreviewLinks.ios, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 8
      }),
      QRCode.toDataURL(temporaryPreviewLinks.android, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 8
      })
    ]);

    qrCodeUrls.value = {
      ios: iosQrCodeUrl,
      android: androidQrCodeUrl
    };
  } catch {
    qrCodeError.value = t('preview.qrCodeFailed');
  }
}

onMounted(() => {
  void generateTemporaryQrCodes();
});
</script>

<template>
  <section
    data-testid="preview-panel"
    class="flex min-h-[520px] flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-base font-semibold text-slate-950 dark:text-white">{{ t('preview.title') }}</h2>
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

    <div class="flex-1 overflow-auto">
      <p v-if="loading" data-testid="preview-loading-state" class="rounded border border-sky-300 bg-sky-50 p-3 text-sky-800 dark:border-sky-500/60 dark:bg-sky-900/30 dark:text-sky-100">
        {{ t('page.loading') }}
      </p>
      <p v-else-if="error" data-testid="preview-error-state" class="rounded border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-500/60 dark:bg-red-900/30 dark:text-red-100">
        {{ error }}
      </p>
      <p v-else-if="!blocks.length" data-testid="preview-empty-state" class="rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-100">
        {{ t('preview.emptyState') }}
      </p>

      <div v-else-if="previewMode === 'pc'" data-testid="preview-pc-canvas" class="min-h-full">
        <MPage :edit="false" :value="blocks" />
      </div>

      <div v-else-if="previewMode === 'h5'" data-testid="preview-h5-canvas" class="flex min-h-full justify-center overflow-auto bg-slate-100 px-4 py-6 dark:bg-slate-950">
        <div data-testid="preview-phone-shell" class="relative shrink-0 rounded-[52px] border-[10px] border-slate-950 bg-slate-950 p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-800">
          <div class="absolute left-1/2 top-3 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-950 dark:bg-slate-800"></div>
          <div data-testid="preview-phone-screen" class="h-[844px] w-[390px] overflow-auto rounded-[34px] bg-white p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <MPage :edit="false" :value="blocks" />
          </div>
        </div>
      </div>

      <div v-else data-testid="preview-app-qrcode" class="flex min-h-full items-center justify-center bg-slate-100 px-4 py-8 dark:bg-slate-950">
        <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="mx-auto flex h-64 w-64 items-center justify-center rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700">
            <img
              v-if="activeQrCodeUrl"
              data-testid="preview-qrcode-image"
              :src="activeQrCodeUrl"
              :alt="t('preview.qrCodeAlt')"
              class="h-full w-full"
            >
            <span v-else class="text-sm text-slate-500 dark:text-slate-400">{{ qrCodeError || t('preview.qrCodeLoading') }}</span>
          </div>
          <p data-testid="preview-qrcode-platform" class="mt-4 text-base font-semibold text-slate-950 dark:text-white">
            {{ previewMode === 'ios' ? t('preview.iosQrCode') : t('preview.androidQrCode') }}
          </p>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('preview.qrCodePlaceholder') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
