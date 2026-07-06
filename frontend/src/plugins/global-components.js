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
