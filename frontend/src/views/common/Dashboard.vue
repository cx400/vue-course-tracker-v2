<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>工作台</h2>
      <p class="subtitle">{{ currentDate }}，{{ greeting }}</p>
    </div>

    <!-- 加载 / 错误状态 -->
    <div v-if="loading" class="dashboard-status"><el-icon class="is-loading" size="24"><Loading /></el-icon><span>加载中...</span></div>
    <div v-else-if="loadError" class="dashboard-status error">
      <p>数据加载失败</p>
      <el-button size="small" @click="retry">重新加载</el-button>
    </div>

    <template v-else>
    <!-- ==================== 教师端 ==================== -->
    <template v-if="userStore.userRole === ROLES.TEACHER">
      <div class="stats-grid">
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.COURSES)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #e6f7ff;"><el-icon size="28" color="#1890ff"><Reading /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.courseCount ?? '-' }}</div>
              <div class="stat-label">已发布课程</div>
              <span v-if="stats.courseCount > 0" class="click-hint">点击管理 →</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.ASSIGNMENTS)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #fff7e6;"><el-icon size="28" color="#faad14"><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingCount ?? '-' }}</div>
              <div class="stat-label">待批改作业</div>
              <span v-if="stats.pendingCount > 0" class="click-hint">点击批改 →</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.STUDENTS)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #f6ffed;"><el-icon size="28" color="#52c41a"><UserFilled /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studentCount ?? '-' }}</div>
              <div class="stat-label">学生总数</div>
              <span v-if="stats.studentCount > 0" class="click-hint">点击查看 →</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.ASSIGNMENTS)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #f0f5ff;"><el-icon size="28" color="#2f54eb"><Upload /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.submittedCount ?? '-' }}</div>
              <div class="stat-label">已提交作业</div>
              <span v-if="stats.submittedCount > 0" class="click-hint">点击查看 →</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.ASSIGNMENTS)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #f6ffed;"><el-icon size="28" color="#52c41a"><Checked /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.gradedCount ?? '-' }}</div>
              <div class="stat-label">已批改作业</div>
              <span v-if="stats.gradedCount > 0" class="click-hint">点击查看 →</span>
            </div>
          </div>
        </el-card>
        <!-- 快捷操作 -->
        <el-card shadow="never" class="stat-card quick-actions-card">
          <div class="quick-actions">
            <div class="quick-title">快捷操作</div>
            <div class="quick-btns">
              <el-button type="primary" size="small" @click="$router.push(PATHS.COURSES)">发布课程</el-button>
              <el-button size="small" @click="$router.push(PATHS.ASSIGNMENTS)">布置作业</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 图表行 -->
      <el-row :gutter="16" class="charts-row">
        <el-col :span="12">
          <el-card shadow="never">
            <DonutChart :data="teacherChartData" title="作业状态分布" :colors="['#1890ff', '#faad14', '#52c41a']" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <BarChart :data="teacherBarData" title="作业提交/批改进度" :colors="['#2f54eb', '#52c41a']" />
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- ==================== 学生端 ==================== -->
    <template v-else>
      <div class="stats-grid">
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.MY_COURSES)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #e6f7ff;"><el-icon size="28" color="#1890ff"><Reading /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.courseCount ?? '-' }}</div>
              <div class="stat-label">已选课程</div>
              <span v-if="stats.courseCount > 0" class="click-hint">点击查看 →</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.MY_ASSIGNMENTS)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #fff7e6;"><el-icon size="28" color="#faad14"><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.submittedCount ?? '-' }}</div>
              <div class="stat-label">已提交作业</div>
              <span v-if="stats.submittedCount > 0" class="click-hint">点击查看 →</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.MY_GRADES)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #f6ffed;"><el-icon size="28" color="#52c41a"><TrendCharts /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgScore ?? '-' }}{{ stats.avgScore !== undefined ? '分' : '' }}</div>
              <div class="stat-label">平均成绩</div>
              <span v-if="stats.avgScore > 0" class="click-hint">点击查看 →</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="stat-card clickable" @click="$router.push(PATHS.MY_ASSIGNMENTS)">
          <div class="stat-body">
            <div class="stat-icon" style="background: #fff1f0;"><el-icon size="28" color="#ff4d4f"><Clock /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingCount ?? '-' }}</div>
              <div class="stat-label">待提交作业</div>
              <span v-if="stats.pendingCount > 0" class="click-hint">点击提交 →</span>
            </div>
          </div>
        </el-card>
        <!-- 快捷操作 -->
        <el-card shadow="never" class="stat-card quick-actions-card">
          <div class="quick-actions">
            <div class="quick-title">快捷操作</div>
            <div class="quick-btns">
              <el-button type="primary" size="small" @click="$router.push(PATHS.MY_COURSES)">查看课程</el-button>
              <el-button size="small" @click="$router.push(PATHS.MY_ASSIGNMENTS)">我的作业</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 图表行 -->
      <el-row :gutter="16" class="charts-row">
        <el-col :span="12">
          <el-card shadow="never">
            <DonutChart :data="studentChartData" title="作业完成情况" :colors="['#52c41a', '#ff4d4f']" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <DonutChart :data="studentGradeData" :title="avgScoreTitle" :colors="['#1890ff', '#faad14', '#52c41a', '#ff4d4f']" />
          </el-card>
        </el-col>
      </el-row>
    </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getDashboardStats } from '@/api/course'
import { ROLES, PATHS } from '@/constants'
import { Reading, Document, UserFilled, Upload, Checked, TrendCharts, Clock, Loading } from '@element-plus/icons-vue'
// DonutChart、BarChart 已通过 plugins/global-components.js 全局注册，无需 import

const userStore = useUserStore()
const stats = ref({})
const loading = ref(true)
const loadError = ref(false)

const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const now = new Date()
const currentDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`

const greeting = computed(() => {
  const h = now.getHours()
  if (h < 12) return '上午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

// 教师端图表数据
const teacherChartData = computed(() => {
  const s = stats.value
  return [
    { name: '已提交', value: s.submittedCount || 0 },
    { name: '待批改', value: s.pendingCount || 0 },
    { name: '已批改', value: s.gradedCount || 0 }
  ]
})

const teacherBarData = computed(() => {
  const s = stats.value
  return [
    { name: '已提交', value: s.submittedCount || 0 },
    { name: '已批改', value: s.gradedCount || 0 }
  ]
})

// 学生端图表数据
const studentChartData = computed(() => {
  const s = stats.value
  return [
    { name: '已提交', value: s.submittedCount || 0 },
    { name: '待提交', value: s.pendingCount || 0 }
  ]
})

const studentGradeData = computed(() => {
  const s = stats.value
  const avg = s.avgScore || 0
  if (avg === 0) return []
  return [
    { name: '90-100分', value: s.gradeDistribution?.['90-100'] || 0 },
    { name: '80-89分', value: s.gradeDistribution?.['80-89'] || 0 },
    { name: '70-79分', value: s.gradeDistribution?.['70-79'] || 0 },
    { name: '70分以下', value: s.gradeDistribution?.['below-70'] || 0 }
  ]
})

const avgScoreTitle = computed(() => {
  const avg = stats.value.avgScore
  if (!avg || avg === 0) return '暂无成绩'
  return `均分 ${avg}`
})

async function fetchStats() {
  loading.value = true
  loadError.value = false
  try {
    stats.value = await getDashboardStats()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function retry() { fetchStats() }

onMounted(() => { fetchStats() })
</script>

<style scoped lang="scss">
.dashboard {
  max-width: 1200px;
}

.dashboard-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 15px;
  &.error { flex-direction: column; gap: 12px; color: var(--danger); }
}

.page-header {
  margin-bottom: 24px;
  h2 { font-size: 20px; font-weight: 600; color: var(--text-primary); }
  .subtitle { margin-top: 6px; color: var(--text-muted); font-size: 14px; }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  .stat-body {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .stat-icon {
    width: 56px; height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stat-info {
    flex: 1;
    .stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
    .stat-label { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
  }
}

.stat-card.clickable {
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12); }
}
.click-hint { display: block; font-size: 12px; color: var(--primary); margin-top: 4px; }

.quick-actions-card {
  .quick-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 88px;
    gap: 12px;
  }
  .quick-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); }
  .quick-btns { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
}

.charts-row {
  .el-card { :deep(.el-card__body) { padding: 16px; } }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row .el-col { flex: 0 0 100%; max-width: 100%; margin-bottom: 16px; }
}
</style>
