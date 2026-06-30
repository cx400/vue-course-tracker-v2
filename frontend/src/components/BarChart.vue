<template>
  <div ref="chartRef" class="bar-chart"></div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getCssVar } from '@/utils'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  colors: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chart = null
let observer = null

function buildOption() {
  const names = props.data.map(d => d.name)
  const values = props.data.map(d => d.value)

  return {
    title: props.title ? {
      text: props.title,
      left: 'center',
      top: 0,
      textStyle: { color: getCssVar('--text-primary', '#333'), fontSize: 15, fontWeight: 600 }
    } : null,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '10%', top: props.title ? 40 : 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: getCssVar('--text-secondary', '#666') },
      axisLine: { lineStyle: { color: getCssVar('--border-color', '#e0e0e0') } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: getCssVar('--text-secondary', '#666') },
      splitLine: { lineStyle: { color: getCssVar('--border-color', '#f0f0f0') } }
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({
        value: v,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: props.colors[i] || undefined }
      })),
      barWidth: '50%',
      label: { show: true, position: 'top', color: getCssVar('--text-primary', '#333'), fontWeight: 600 }
    }],
    color: props.colors.length ? props.colors : undefined
  }
}

function updateTheme() {
  if (!chart) return
  const textSecondary = getCssVar('--text-secondary', '#666')
  const textPrimary = getCssVar('--text-primary', '#333')
  const borderColor = getCssVar('--border-color', '#e0e0e0')

  chart.setOption({
    title: props.title ? { textStyle: { color: textPrimary } } : null,
    xAxis: {
      axisLabel: { color: textSecondary },
      axisLine: { lineStyle: { color: borderColor } }
    },
    yAxis: {
      axisLabel: { color: textSecondary },
      splitLine: { lineStyle: { color: borderColor } }
    },
    series: [{ label: { color: textPrimary } }]
  })
}

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption(buildOption())

  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'class') {
        updateTheme()
        break
      }
    }
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

function onResize() {
  chart?.resize()
}

watch(() => props.data, () => {
  if (chart && props.data.length) {
    chart.setOption(buildOption())
  }
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  observer?.disconnect()
  chart?.dispose()
})
</script>

<style scoped>
.bar-chart { width: 100%; height: 280px; }
</style>
