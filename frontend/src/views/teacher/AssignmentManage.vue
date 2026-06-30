<template>
  <div class="assignment-manage">
    <h2>作业管理</h2>

    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>

    <template v-else>
      <DataTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchAssignments"
        search-placeholder="搜索作业名称"
      >
        <template #toolbar-extra>
          <span class="label">课程筛选：</span>
          <el-select
            v-model="filterCourseId"
            placeholder="全部课程"
            clearable
            style="width: 240px"
            @change="onFilterChange"
          >
            <el-option label="全部课程" :value="null" />
            <el-option
              v-for="c in courseList"
              :key="c.id"
              :label="`${c.title}（${c.semester}）`"
              :value="c.id"
            />
          </el-select>
          <el-button type="primary" @click="openCreate">+ 发布作业</el-button>
        </template>

        <template #col-course="{ row }">
          <span v-if="row.Course">{{ row.Course.title }}</span>
          <span v-else class="text-muted">未分类</span>
        </template>
        <template #col-deadline="{ row }">
          <span v-if="row.deadline">{{ formatDate(row.deadline) }}</span>
          <span v-else class="text-muted">不限</span>
        </template>
        <template #col-submissions="{ row }">
          <el-button type="primary" link @click="openSubmissions(row)">查看提交</el-button>
        </template>
        <template #col-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
      </DataTable>
    </template>

    <!-- ========== 发布作业弹窗 ========== -->
    <el-dialog v-model="createVisible" title="发布作业" width="550px" top="8vh" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 100%">
            <el-option v-for="c in courseList" :key="c.id" :label="`${c.title}（${c.semester}）`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作业标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="作业描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="选填" />
        </el-form-item>
        <el-form-item label="满分" prop="maxScore">
          <el-input-number v-model="form.maxScore" :min="1" :max="200" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.deadline" type="datetime" placeholder="选填" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">确认发布</el-button>
      </template>
    </el-dialog>

    <!-- ========== 查看提交弹窗 ========== -->
    <el-dialog v-model="subVisible" :title="`提交列表 - ${currentAssign.title}`" width="800px" top="5vh">
      <el-table :data="submissions" v-loading="subLoading" stripe border empty-text="暂无学生提交">
        <el-table-column label="学生" width="110">
          <template #default="{ row }">{{ row.student?.realName || '-' }}</template>
        </el-table-column>
        <el-table-column label="提交内容" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.content || '-' }}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="160" align="center">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'graded'" type="success" size="small">已批改</el-tag>
            <el-tag v-else type="warning" size="small">待批改</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="得分" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.score !== null" :style="{ color: row.score >= (currentAssign.maxScore * 0.6) ? '#67c23a' : '#f56c6c' }">
              {{ row.score }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openGrade(row)">
              {{ row.status === 'graded' ? '修改' : '批改' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="subCurrentPage"
          v-model:page-size="subPageSize"
          :total="subTotal"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          background
          size="small"
          @size-change="fetchSubmissions"
          @current-change="fetchSubmissions"
        />
      </div>
    </el-dialog>

    <!-- ========== 批改弹窗 ========== -->
    <el-dialog v-model="gradeVisible" title="批改作业" width="550px" top="8vh" :close-on-click-modal="false">
      <div class="submission-preview">
        <p class="preview-label">学生：{{ grading.student?.realName || '-' }}</p>
        <p class="preview-label">提交内容：</p>
        <div class="content-box">{{ grading.content || '-' }}</div>
      </div>
      <el-form :model="gradeForm" label-width="60px" style="margin-top: 16px">
        <el-form-item label="分数">
          <el-input-number v-model="gradeForm.score" :min="0" :max="currentAssign.maxScore" />
          <span class="score-hint">满分 {{ currentAssign.maxScore }}</span>
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="gradeForm.comment" type="textarea" :rows="3" placeholder="选填评语" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gradeVisible = false">取消</el-button>
        <el-button type="primary" :loading="gradingLoading" @click="handleGrade">确认批改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCourseList, createAssignment, getAllAssignments, getSubmissions, gradeSubmission } from '@/api/course'
import { formatDate } from '@/utils'

const tableRef = ref(null)
const courseList = ref([])
const filterCourseId = ref(null)
const loadError = ref(false)

const columns = [
  { prop: 'title', label: '作业名称', minWidth: 160 },
  { label: '所属课程', width: 140, slotName: 'course' },
  { prop: 'maxScore', label: '满分', width: 70, align: 'center' },
  { label: '截止日期', width: 150, align: 'center', slotName: 'deadline' },
  { label: '提交情况', width: 130, align: 'center', slotName: 'submissions' },
  { label: '发布时间', width: 160, align: 'center', slotName: 'createdAt' }
]

async function fetchAssignments({ page, pageSize, keyword }) {
  try {
    const res = await getAllAssignments({
      page,
      pageSize,
      keyword,
      courseId: filterCourseId.value || undefined
    })
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

function onFilterChange() {
  tableRef.value.refresh()
}

const createVisible = ref(false)
const creating = ref(false)
const formRef = ref(null)
const form = ref({ title: '', description: '', maxScore: 100, deadline: null, courseId: null })
const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  courseId: [{ required: true, message: '请选择所属课程', trigger: 'change' }],
  maxScore: [{ required: true, message: '请设置满分值', trigger: 'blur' }]
}

function openCreate() {
  form.value = { title: '', description: '', maxScore: 100, deadline: null, courseId: null }
  createVisible.value = true
}

async function handleCreate() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  creating.value = true
  try {
    await createAssignment({
      ...form.value,
      deadline: form.value.deadline ? form.value.deadline.toISOString() : null
    })
    createVisible.value = false
    tableRef.value.refresh()
  } catch {
    // 拦截器已弹错误提示
  } finally {
    creating.value = false
  }
}

const subVisible = ref(false)
const subLoading = ref(false)
const submissions = ref([])
const subTotal = ref(0)
const subCurrentPage = ref(1)
const subPageSize = ref(10)
const currentAssign = ref({})

async function openSubmissions(row) {
  currentAssign.value = row
  subCurrentPage.value = 1
  subVisible.value = true
  fetchSubmissions()
}

async function fetchSubmissions() {
  subLoading.value = true
  try {
    const res = await getSubmissions(currentAssign.value.id, {
      page: subCurrentPage.value,
      pageSize: subPageSize.value
    })
    submissions.value = res.list
    subTotal.value = res.total
  } catch {
    ElMessage.error('加载提交列表失败')
  } finally {
    subLoading.value = false
  }
}

const gradeVisible = ref(false)
const gradingLoading = ref(false)
const grading = ref({})
const gradeForm = ref({ score: 0, comment: '' })

function openGrade(row) {
  grading.value = row
  gradeForm.value = {
    score: row.score ?? Math.floor(currentAssign.value.maxScore * 0.7),
    comment: row.comment || ''
  }
  gradeVisible.value = true
}

async function handleGrade() {
  gradingLoading.value = true
  try {
    await gradeSubmission(grading.value.id, gradeForm.value)
    gradeVisible.value = false
    fetchSubmissions()
  } catch {
    // 拦截器已弹错误提示
  } finally {
    gradingLoading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getCourseList()
    courseList.value = res.list
  } catch {
    // 拦截器已弹错误提示
  }
})
</script>

<style scoped>
.assignment-manage { padding: 20px; }
.assignment-manage h2 { margin-bottom: 20px; }

.label { color: #606266; white-space: nowrap; }
.text-muted { color: #999; }

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.submission-preview {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 6px;
}
.preview-label { font-weight: 500; margin-bottom: 6px; color: #303133; }
.content-box {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
}
.score-hint { margin-left: 10px; color: #999; font-size: 12px; }

</style>
