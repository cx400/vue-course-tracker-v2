<template>
  <div class="my-assignments">
    <h2>我的作业</h2>

    <!-- 加载失败时显示错误状态 -->
    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>

    <el-empty v-else-if="!loading && courses.length === 0" description="暂无作业" />

    <!-- 每门课一个卡片 -->
    <el-card v-for="course in courses" :key="course.courseId" class="course-card">
      <template #header>
        <div class="card-header">
          <span class="course-title">{{ course.courseTitle }}</span>
          <el-tag size="small" type="info">{{ course.semester }}</el-tag>
        </div>
      </template>

      <el-table :data="course.assignments" size="small" stripe>
        <el-table-column prop="title" label="作业名称" min-width="180" />
        <el-table-column label="满分" width="70" align="center">
          <template #default="{ row }">{{ row.maxScore }}</template>
        </el-table-column>
        <el-table-column label="截止日期" width="160" align="center">
          <template #default="{ row }">
            <span v-if="row.deadline">{{ formatDate(row.deadline) }}</span>
            <span v-else class="no-deadline">不限</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="!row.submission" type="danger" size="small">未提交</el-tag>
            <el-tag v-else-if="row.submission.status === 'submitted'" type="warning" size="small">待批改</el-tag>
            <el-tag v-else type="success" size="small">
              已批改 {{ row.submission.score }}/{{ row.maxScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <!-- 未提交：显示提交按钮 -->
            <el-button v-if="!row.submission" type="primary" size="small" @click="openSubmit(row)">
              提交作业
            </el-button>
            <!-- 已提交：显示查看详情按钮 -->
            <el-button v-else size="small" @click="openDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ========== 提交作业弹窗 ========== -->
    <el-dialog v-model="submitVisible" title="提交作业" width="650px" top="8vh" :close-on-click-modal="false">
      <div class="dialog-info">
        <p><b>作业：</b>{{ current.title }}</p>
        <p v-if="current.description"><b>要求：</b>{{ current.description }}</p>
      </div>
      <p class="editor-label">作业内容（文本编辑）：</p>
      <textarea
        v-model="answer"
        class="answer-editor"
        placeholder="在此编写你的作业内容..."
        rows="12"
      ></textarea>
      <template #footer>
        <el-button @click="submitVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- ========== 查看详情弹窗（已提交/已批改） ========== -->
    <el-dialog v-model="detailVisible" title="作业详情" width="650px" top="8vh">
      <div class="dialog-info">
        <p><b>作业：</b>{{ current.title }}</p>
        <p><b>状态：</b>
          <el-tag v-if="current.submission?.status === 'graded'" type="success" size="small">已批改</el-tag>
          <el-tag v-else type="warning" size="small">待批改</el-tag>
        </p>
      </div>
      <div class="section">
        <p class="section-title">你的提交内容：</p>
        <div class="content-box">{{ current.submission?.content || '-' }}</div>
      </div>
      <div v-if="current.submission?.status === 'graded'" class="section">
        <p class="section-title">教师批改：</p>
        <p>得分：<b :style="{ color: scoreColor }">{{ current.submission.score }} / {{ current.maxScore }}</b></p>
        <p>评语：{{ current.submission.comment || '无' }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyAssignments, submitAssignment } from '@/api/course'
import { formatDate } from '@/utils'

const courses = ref([])       // 按课程分组的作业列表
const loading = ref(false)
const loadError = ref(false)

// 提交弹窗
const submitVisible = ref(false)
const submitting = ref(false)
const answer = ref('')
const current = ref({})       // 当前操作的作业

// 查看详情弹窗
const detailVisible = ref(false)

const scoreColor = computed(() => {
  if (!current.value.submission) return '#333'
  const pct = current.value.submission.score / current.value.maxScore
  if (pct >= 0.8) return '#67c23a'
  if (pct >= 0.6) return '#e6a23c'
  return '#f56c6c'
})

// 打开提交弹窗
function openSubmit(row) {
  current.value = row
  answer.value = ''
  submitVisible.value = true
}

// 打开详情弹窗
function openDetail(row) {
  current.value = row
  detailVisible.value = true
}

// 确认提交
async function handleSubmit() {
  if (!answer.value.trim()) {
    return ElMessage.warning('作业内容不能为空')
  }
  submitting.value = true
  try {
    await submitAssignment({
      assignmentId: current.value.assignmentId,
      content: answer.value
    })
    submitVisible.value = false
    fetchAssignments()  // 刷新列表
  } catch {
    // request.js 拦截器已弹错误提示
  } finally {
    submitting.value = false
  }
}

async function fetchAssignments() {
  loading.value = true
  loadError.value = false
  try {
    const res = await getMyAssignments()
    courses.value = res.courses
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function refetch() {
  fetchAssignments()
}

onMounted(fetchAssignments)
</script>

<style scoped>
.my-assignments { padding: 20px; }
.my-assignments h2 { margin-bottom: 20px; }

.course-card { margin-bottom: 20px; }
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.course-title {
  font-weight: bold;
  font-size: 16px;
}

.no-deadline { color: #999; }

/* 提交弹窗 */
.dialog-info {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}
.dialog-info p {
  margin: 4px 0;
  color: #606266;
}
.editor-label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}
/* 文本编辑器 —— 等宽字体，舒适的编辑区域 */
.answer-editor {
  width: 100%;
  padding: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}
.answer-editor:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 详情弹窗 */
.section {
  margin-top: 16px;
}
.section-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
}
.content-box {
  background: #f5f7fa;
  padding: 14px;
  border-radius: 6px;
  white-space: pre-wrap;
  font-family: 'JetBrains Mono', 'Fira Code', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.6;
}

</style>
