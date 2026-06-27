<script setup lang="ts">
import { useI18n } from '@/i18n';

const { t } = useI18n();
</script>

<template>
  <section
    data-testid="not-found-page"
    class="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
  >
    <div class="w-full max-w-xl text-center">
      <p class="text-sm font-semibold text-teal-600 dark:text-teal-300">
        404
      </p>
      <h1 class="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
        {{ t('notFound.title') }}
      </h1>
      <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
        {{ t('notFound.description') }}
      </p>
      <a
        data-testid="not-found-home-link"
        href="/#/"
        class="mt-8 inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
      >
        {{ t('notFound.home') }}
      </a>
    </div>
  </section>
</template>
