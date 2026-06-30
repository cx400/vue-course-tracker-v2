<template>
  <div class="my-grades">
    <h2>我的成绩</h2>

    <!-- 加载失败时显示错误状态 -->
    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>

    <!-- 没有成绩时显示空状态提示 -->
    <el-empty v-else-if="!loading && grades.length === 0" description="暂无成绩数据" />

    <!-- 每门课一张卡片 -->
    <el-card v-for="course in grades" :key="course.courseId" class="grade-card">
      <!-- 卡片头部：课程名 + 学期标签 + 成绩汇总 -->
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <span class="course-title">{{ course.courseTitle }}</span>
            <el-tag size="small" type="info">{{ course.semester }}</el-tag>
          </div>
          <div class="card-header-right">
            <!-- 总分 / 满分 -->
            <span class="score-text">
              {{ course.totalScore }} / {{ course.totalMaxScore }}
            </span>
            <!-- 百分比（只有批改过的作业才算） -->
            <el-tag
              :type="getPercentTag(course.totalScore, course.totalMaxScore)"
              size="small"
            >
              {{ getPercent(course.totalScore, course.totalMaxScore) }}%
            </el-tag>
            <span class="graded-info">
              已批 {{ course.gradedCount }}/{{ course.totalCount }}
            </span>
          </div>
        </div>
      </template>

      <!-- 该课程下每个作业的得分明细 -->
      <el-table :data="course.assignments" size="small" stripe>
        <el-table-column prop="title" label="作业名称" min-width="200" />
        <el-table-column label="满分" width="80" align="center">
          <template #default="{ row }">{{ row.maxScore }}</template>
        </el-table-column>
        <el-table-column label="得分" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 'graded'" :style="{ color: getScoreColor(row.score, row.maxScore) }">
              {{ row.score }}
            </span>
            <el-tag v-else size="small" type="warning">未批改</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="教师评语" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.comment">{{ row.comment }}</span>
            <span v-else class="no-comment">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyGrades } from '@/api/grade'
import { getPercent, getPercentTag, getRatioColor as getScoreColor } from '@/utils'

const grades = ref([])    // 所有课程的成绩数据
const loading = ref(false)
const loadError = ref(false)

async function fetchGrades() {
  loading.value = true
  loadError.value = false
  try {
    const res = await getMyGrades()
    grades.value = res.grades
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function refetch() {
  fetchGrades()
}

onMounted(fetchGrades)
</script>

<style scoped>
.my-grades {
  padding: 20px;
}
.my-grades h2 {
  margin-bottom: 20px;
}
.grade-card {
  margin-bottom: 20px;
}

/* 卡片头部：左右分布 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.course-title {
  font-weight: bold;
  font-size: 16px;
}
.card-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.score-text {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}
.graded-info {
  color: #999;
  font-size: 13px;
}
.no-comment {
  color: #ccc;
}

</style>
