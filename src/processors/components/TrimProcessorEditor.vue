<script setup lang="ts">
import { useI18n } from '@/i18n';

defineProps<{
  readonly?: boolean;
}>();

defineEmits<{
  (event: 'validity-change', valid: boolean): void;
}>();

const { t } = useI18n();
</script>

<template>
  <p class="processor-editor-copy" data-testid="processor-trim-description">
    {{ t('datasource.processors.trim.description') }}
  </p>
</template>

<style scoped>
.processor-editor-copy {
  margin: 0;
  color: rgb(71 85 105);
  font-size: 13px;
}

:global(.dark) .processor-editor-copy {
  color: rgb(148 163 184);
}
</style>
