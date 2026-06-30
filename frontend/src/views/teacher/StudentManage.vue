<template>
  <div class="student-manage">
    <h2>学生管理</h2>

    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>

    <DataTable
      v-else
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchStudents"
      search-placeholder="搜索学生姓名或用户名"
    >
      <template #col-email="{ row }">{{ row.email || '-' }}</template>
      <template #col-avgScore="{ row }">
        <span v-if="row.avgScore !== null" :style="{ color: row.avgScore >= 60 ? '#67c23a' : '#f56c6c' }">
          {{ row.avgScore }}分
        </span>
        <span v-else class="text-muted">-</span>
      </template>
      <template #col-createdAt="{ row }">
        {{ new Date(row.createdAt).toLocaleDateString() }}
      </template>
      <template #col-operation="{ row }">
        <el-button type="primary" size="small" link @click="openDetail(row)">详情</el-button>
      </template>
    </DataTable>

    <el-dialog v-model="detailVisible" :title="`${detail.student?.realName} 的学习详情`" width="750px" top="6vh">
      <div class="student-profile" v-if="detail.student">
        <span><b>用户名：</b>{{ detail.student.username }}</span>
        <span><b>邮箱：</b>{{ detail.student.email || '-' }}</span>
        <span><b>注册时间：</b>{{ new Date(detail.student.createdAt).toLocaleDateString() }}</span>
      </div>

      <el-empty v-if="!detail.courses || detail.courses.length === 0" description="暂无学习记录" />

      <div v-else v-for="course in detail.courses" :key="course.courseId" class="course-section">
        <div class="course-header">
          <span class="course-title">{{ course.courseTitle }}</span>
          <el-tag size="small" type="info">{{ course.semester }}</el-tag>
        </div>
        <el-table :data="course.assignments" size="small" stripe>
          <el-table-column prop="assignmentTitle" label="作业" min-width="160" />
          <el-table-column label="满分" width="70" align="center">
            <template #default="{ row }">{{ row.maxScore }}</template>
          </el-table-column>
          <el-table-column label="得分" width="80" align="center">
            <template #default="{ row }">
              <span v-if="row.score !== null" :style="{ color: row.score >= row.maxScore * 0.6 ? '#67c23a' : '#f56c6c' }">
                {{ row.score }}
              </span>
              <el-tag v-else-if="row.status === 'submitted'" type="warning" size="small">待批</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="评语" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ row.comment || '-' }}</template>
          </el-table-column>
          <el-table-column label="提交时间" width="120" align="center">
            <template #default="{ row }">
              {{ new Date(row.submittedAt).toLocaleDateString() }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getStudentList, getStudentDetail } from '@/api/user'

const tableRef = ref(null)
const loadError = ref(false)
const columns = [
  { prop: 'realName', label: '姓名', width: 100 },
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180, slotName: 'email', showOverflowTooltip: true },
  { prop: 'courseCount', label: '参与课程', width: 90, align: 'center' },
  { prop: 'submittedCount', label: '提交作业', width: 90, align: 'center' },
  { prop: 'gradedCount', label: '已批改', width: 80, align: 'center' },
  { prop: 'avgScore', label: '平均成绩', width: 100, align: 'center', slotName: 'avgScore' },
  { prop: 'createdAt', label: '注册时间', width: 120, align: 'center', slotName: 'createdAt' },
  { label: '操作', width: 80, align: 'center', slotName: 'operation' }
]

async function fetchStudents({ page, pageSize, keyword }) {
  try {
    const res = await getStudentList({ page, pageSize, keyword })
    return { list: res.list, total: res.total }
  } catch {
    loadError.value = true
    return { list: [], total: 0 }
  }
}

function refetch() {
  loadError.value = false
  tableRef.value?.refresh()
}

const detailVisible = ref(false)
const detail = ref({})

async function openDetail(row) {
  detailVisible.value = true
  try {
    detail.value = await getStudentDetail(row.id)
  } catch {
    detailVisible.value = false
  }
}
</script>

<style scoped>
.student-manage { padding: 20px; }
.student-manage h2 { margin-bottom: 20px; }
.text-muted { color: #ccc; }

.student-profile {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.course-section { margin-bottom: 20px; }
.course-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.course-title { font-weight: 600; font-size: 15px; }

</style>
