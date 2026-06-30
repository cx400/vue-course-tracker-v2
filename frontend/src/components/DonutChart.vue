<template>
  <div ref="chartRef" class="donut-chart"></div>
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
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { color: getCssVar('--text-secondary', '#666') }
    },
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: 'transparent', borderWidth: 3 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: props.data
    }],
    graphic: props.title ? {
      type: 'text',
      left: 'center',
      top: '38%',
      style: {
        text: props.title,
        textAlign: 'center',
        fill: getCssVar('--text-primary', '#333'),
        fontSize: 16,
        fontWeight: 600
      }
    } : null
  }

  if (props.colors.length) option.color = props.colors
  return option
}

function updateTheme() {
  if (!chart) return
  const textSecondary = getCssVar('--text-secondary', '#666')
  const textPrimary = getCssVar('--text-primary', '#333')
  chart.setOption({
    legend: { textStyle: { color: textSecondary } },
    graphic: props.title ? { style: { fill: textPrimary } } : null
  })
}

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption(buildOption())

  // 监听 <html> class 变化（Element Plus 官方暗黑模式切换）
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
.donut-chart { width: 100%; height: 280px; }
</style>
