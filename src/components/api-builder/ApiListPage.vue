<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { listOrchestrationApis } from '@/api-builder/api';

const search = ref('');
const methodFilter = ref('all');
const statusFilter = ref('all');
const { data: apis, isLoading, error, refetch } = useQuery({
  queryKey: ['orchestration-apis'],
  queryFn: listOrchestrationApis
});

const filteredApis = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return (apis.value ?? []).filter((api) => {
    const matchesKeyword = !keyword || `${api.uuid} ${api.alias}`.toLowerCase().includes(keyword);
    const matchesMethod = methodFilter.value === 'all' || api.method === methodFilter.value;
    const matchesStatus = statusFilter.value === 'all' || api.status === statusFilter.value;
    return matchesKeyword && matchesMethod && matchesStatus;
  });
});

function openApi(uuid: string) {
  window.location.hash = `#/apis/${encodeURIComponent(uuid)}`;
}

function newApi() {
  window.location.hash = '#/apis/new';
}

function refreshApis() {
  void refetch();
}
</script>

<template>
  <section data-testid="api-list-page" class="flex min-h-[calc(100vh-6rem)] flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h2 class="text-lg font-semibold">API Builder</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">管理、测试和发布 Mokelay 编排 API。</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button class="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600" type="button" @click="refreshApis">
          刷新
        </button>
        <button data-testid="api-new-button" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500" type="button" @click="newApi">
          新建 API
        </button>
      </div>
    </div>

    <div class="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[1fr_160px_180px]">
      <input v-model="search" class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950" placeholder="搜索 uuid 或名称" />
      <select v-model="methodFilter" class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950">
        <option value="all">全部方法</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </select>
      <select v-model="statusFilter" class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950">
        <option value="all">全部状态</option>
        <option value="draft">草稿</option>
        <option value="published">已发布</option>
        <option value="asset">内置资产</option>
      </select>
    </div>

    <div v-if="isLoading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
      正在读取 API...
    </div>
    <div v-else-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
      {{ error instanceof Error ? error.message : 'API 列表读取失败。' }}
    </div>
    <div v-else class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th class="px-4 py-3">API</th>
            <th class="px-4 py-3">方法</th>
            <th class="px-4 py-3">状态</th>
            <th class="px-4 py-3">版本</th>
            <th class="px-4 py-3">更新时间</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="api in filteredApis" :key="api.uuid" class="hover:bg-slate-50 dark:hover:bg-slate-800/70">
            <td class="px-4 py-3">
              <div class="font-medium">{{ api.alias || api.uuid }}</div>
              <div class="mt-1 font-mono text-xs text-slate-500">{{ api.uuid }}</div>
            </td>
            <td class="px-4 py-3">
              <span class="rounded bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800">{{ api.method }}</span>
            </td>
            <td class="px-4 py-3">{{ api.status === 'asset' ? '内置资产' : api.status === 'published' ? '已发布' : '草稿' }}</td>
            <td class="px-4 py-3">{{ api.latestVersion ?? '-' }}</td>
            <td class="px-4 py-3 text-slate-500">{{ api.updatedAt || api.publishedAt || '-' }}</td>
            <td class="px-4 py-3 text-right">
              <button class="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900" type="button" @click="openApi(api.uuid)">
                编辑
              </button>
            </td>
          </tr>
          <tr v-if="!filteredApis.length">
            <td colspan="6" class="px-4 py-10 text-center text-slate-500">暂无 API。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
