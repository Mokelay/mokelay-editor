<script setup lang="ts">
import * as echarts from 'echarts';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

onMounted(() => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption({
    backgroundColor: 'transparent',
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [12, 20, 15, 8, 7],
        type: 'line',
        smooth: true
      }
    ]
  });
});

onBeforeUnmount(() => {
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <section class="rounded-xl border border-slate-700 bg-slate-900 p-4">
    <h2 class="mb-3 text-lg font-semibold">ECharts 示例</h2>
    <div ref="chartRef" class="h-64 w-full"></div>
  </section>
</template>
