<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue';
import {
  createPreviewBlockRuntime,
  PreviewBlockRuntimeKey
} from '@/utils/previewBlockRuntime';
import {
  createEmptyAuthState,
  getCurrentLayoutRoute,
  resolveLayoutAuth,
  resolveLayoutResources,
  type LayoutAuthState,
  type LayoutRuntimeContext
} from '@/utils/layoutRuntime';
import type { MokelayLayout, RenderBundlePage } from '@/utils/layoutsApi';
import LayoutBlockRenderer from '@/layouts/LayoutBlockRenderer.vue';

const props = defineProps<{
  layout: MokelayLayout;
  page: RenderBundlePage;
}>();

const previewRuntime = createPreviewBlockRuntime();
const resources = ref<LayoutRuntimeContext['resources']>({});
const auth = ref<LayoutAuthState>(createEmptyAuthState());
const runtimeError = ref('');
let loadRequestId = 0;

provide(PreviewBlockRuntimeKey, previewRuntime);

const runtimeContext = computed<LayoutRuntimeContext>(() => ({
  page: props.page,
  layout: props.layout,
  resources: resources.value,
  auth: auth.value,
  route: getCurrentLayoutRoute()
}));

async function loadRuntimeContext() {
  const requestId = loadRequestId + 1;
  loadRequestId = requestId;
  runtimeError.value = '';
  auth.value = {
    ...createEmptyAuthState(),
    pending: props.layout.auth?.enabled === true
  };

  try {
    const [nextResources, nextAuth] = await Promise.all([
      resolveLayoutResources(props.layout),
      resolveLayoutAuth(props.layout)
    ]);

    if (requestId !== loadRequestId) return;
    resources.value = nextResources;
    auth.value = nextAuth;
  } catch (error) {
    if (requestId !== loadRequestId) return;
    resources.value = {};
    auth.value = createEmptyAuthState();
    runtimeError.value = error instanceof Error ? error.message : 'Layout runtime failed.';
  }
}

watch(
  () => [props.layout.uuid, props.layout.updatedAt, props.page.uuid],
  () => {
    void loadRuntimeContext();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  loadRequestId += 1;
});
</script>

<template>
  <section data-testid="layout-renderer" class="layout-renderer">
    <p v-if="runtimeError" data-testid="layout-runtime-error" class="layout-renderer__error">{{ runtimeError }}</p>

    <LayoutBlockRenderer
      v-for="(block, index) in layout.blocks"
      :key="block.id || `${block.type}-${index}`"
      :block="block"
      :context="runtimeContext"
    />
  </section>
</template>

<style scoped>
.layout-renderer {
  min-height: 100%;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
}

.layout-renderer__error {
  border: 1px solid rgb(252 165 165);
  background: rgb(254 242 242);
  color: rgb(153 27 27);
  margin: 0;
  padding: 10px 16px;
  font-size: 13px;
}

:global(.dark) .layout-renderer {
  background: rgb(15 23 42);
  color: rgb(241 245 249);
}

:global(.dark) .layout-renderer__error {
  border-color: rgb(127 29 29);
  background: rgb(127 29 29 / 0.24);
  color: rgb(254 202 202);
}
</style>
