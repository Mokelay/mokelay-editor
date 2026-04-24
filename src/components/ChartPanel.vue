<script setup lang="ts">
import * as echarts from 'echarts';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const chartRef = ref<HTMLDivElement | null>(null);
const props = defineProps<{
  dark: boolean;
}>();
let chart: echarts.ECharts | null = null;

function renderChart() {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  chart.setOption({
    backgroundColor: 'transparent',
    xAxis: {
      type: 'category',
      axisLine: {
        lineStyle: {
          color: props.dark ? '#94a3b8' : '#64748b'
        }
      },
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: props.dark ? '#94a3b8' : '#64748b'
        }
      },
      splitLine: {
        lineStyle: {
          color: props.dark ? '#334155' : '#cbd5e1'
        }
      }
    },
    series: [
      {
        data: [12, 20, 15, 8, 7],
        type: 'line',
        lineStyle: {
          color: '#6366f1'
        },
        itemStyle: {
          color: '#6366f1'
        },
        smooth: true
      }
    ]
  });
}

onMounted(() => {
  renderChart();
});

watch(
  () => props.dark,
  () => {
    renderChart();
  }
);

onBeforeUnmount(() => {
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <h2 class="mb-3 text-lg font-semibold">ECharts 示例</h2>
    <div ref="chartRef" class="h-64 w-full"></div>
  </section>
</template>
