<template>
  <div class="grade-manage">
    <h2>成绩管理</h2>

    <div class="toolbar">
      <span class="label">选择课程：</span>
      <el-select v-model="selectedCourseId" placeholder="请先选择一门课程" @change="onCourseChange" style="width: 280px">
        <el-option
          v-for="c in courseList"
          :key="c.id"
          :label="`${c.title}（${c.semester}）`"
          :value="c.id"
        />
      </el-select>
    </div>

    <!-- 加载失败时显示错误状态 -->
    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>

    <el-empty v-else-if="!selectedCourseId" description="请先选择一门课程查看成绩" />

    <div v-else-if="loading" v-loading="loading" style="min-height: 200px"></div>

    <el-empty v-else-if="students.length === 0" description="该课程暂无学生成绩数据" />

    <template v-else>
      <div class="stats-row">
        <el-statistic title="学生人数" :value="students.length" />
        <el-statistic title="平均分" :value="overallAvg" :precision="1" />
        <el-statistic title="最高分" :value="overallMax" />
        <el-statistic title="最低分" :value="overallMin" />
      </div>

      <el-table :data="sortedStudents" stripe border style="margin-top: 20px">
        <el-table-column label="排名" type="index" width="60" align="center" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column
          v-for="asgn in assignments"
          :key="asgn.id"
          :label="asgn.title"
          align="center"
          min-width="100"
        >
          <template #default="{ row }">
            <span :style="{ color: getCellColor(row, asgn.id) }">
              {{ getCellScore(row, asgn.id) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="总分" width="80" align="center">
          <template #default="{ row }">
            <b>{{ row.totalScore }}</b>
          </template>
        </el-table-column>
        <el-table-column label="百分比" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getPercentTag(row.totalScore, row.totalMaxScore)" size="small">
              {{ getPercent(row.totalScore, row.totalMaxScore) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="批改进度" width="100" align="center">
          <template #default="{ row }">
            {{ row.gradedCount }}/{{ assignments.length }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="onCourseChange(selectedCourseId)"
          @current-change="onCourseChange(selectedCourseId)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCourseList } from '@/api/course'
import { getCourseGrades } from '@/api/grade'
import { getPercent, getPercentTag } from '@/utils'

const courseList = ref([])
const selectedCourseId = ref('')
const assignments = ref([])
const students = ref([])
const loading = ref(false)
const loadError = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const sortedStudents = computed(() => {
  return [...students.value].sort((a, b) => {
    const pctA = a.totalMaxScore > 0 ? a.totalScore / a.totalMaxScore : 0
    const pctB = b.totalMaxScore > 0 ? b.totalScore / b.totalMaxScore : 0
    return pctB - pctA
  })
})

const overallAvg = computed(() => {
  if (students.value.length === 0) return 0
  let sum = 0
  let count = 0
  students.value.forEach(s => {
    if (s.totalMaxScore > 0) {
      sum += s.totalScore / s.totalMaxScore * 100
      count++
    }
  })
  return count > 0 ? Math.round(sum / count * 10) / 10 : 0
})

const overallMax = computed(() => {
  if (students.value.length === 0) return 0
  const pcts = students.value.map(s =>
    s.totalMaxScore > 0 ? Math.round(s.totalScore / s.totalMaxScore * 1000) / 10 : 0
  )
  return Math.max(...pcts)
})

const overallMin = computed(() => {
  if (students.value.length === 0) return 0
  const pcts = students.value.map(s =>
    s.totalMaxScore > 0 ? Math.round(s.totalScore / s.totalMaxScore * 1000) / 10 : 0
  )
  return Math.min(...pcts)
})

function getCellScore(student, assignmentId) {
  const found = student.scores.find(s => s.assignmentId === assignmentId)
  if (!found) return '-'
  if (found.score === null) return '未批'
  return found.score
}

function getCellColor(student, assignmentId) {
  const found = student.scores.find(s => s.assignmentId === assignmentId)
  if (!found || found.score === null) return '#999'
  const pct = found.score / found.maxScore
  if (pct >= 0.8) return '#67c23a'
  if (pct >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

async function onCourseChange(courseId) {
  if (!courseId) return
  loading.value = true
  loadError.value = false
  try {
    const res = await getCourseGrades(courseId, {
      page: currentPage.value,
      pageSize: pageSize.value
    })
    assignments.value = res.assignments
    students.value = res.list
    total.value = res.total
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function refetch() {
  onCourseChange(selectedCourseId.value)
}

async function fetchCourses() {
  try {
    const res = await getCourseList()
    courseList.value = res.list || res.courses
  } catch {
    // 拦截器已弹错误提示
  }
}

onMounted(fetchCourses)
</script>

<style scoped>
.grade-manage {
  padding: 20px;
}
.grade-manage h2 {
  margin-bottom: 20px;
}
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.toolbar .label {
  margin-right: 8px;
  color: #606266;
}
.stats-row {
  display: flex;
  gap: 40px;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 6px;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

</style>
