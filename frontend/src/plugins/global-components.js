// 全局组件注册 —— 高频使用的组件无需在每个页面手动 import
import DataTable from '@/components/DataTable.vue'
import DonutChart from '@/components/DonutChart.vue'
import BarChart from '@/components/BarChart.vue'

export default {
  install(app) {
    app.component('DataTable', DataTable)
    app.component('DonutChart', DonutChart)
    app.component('BarChart', BarChart)
  }
}
