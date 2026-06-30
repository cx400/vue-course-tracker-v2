<template>
  <div class="knowledge-manage">
    <h2>知识点管理</h2>

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

    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>

    <el-empty v-else-if="!selectedCourseId" description="请先选择课程" />

    <el-empty v-else-if="!loading && knowledgeList.length === 0" description="暂无知识点，点击上方按钮添加">
      <el-button type="primary" @click="openCreate">添加知识点</el-button>
    </el-empty>

    <template v-else>
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="openCreate">+ 添加知识点</el-button>
      </div>

      <el-table :data="knowledgeList" stripe border v-loading="loading">
        <el-table-column prop="orderNum" label="序号" width="60" align="center" />
        <el-table-column prop="title" label="知识点标题" min-width="200" />
        <el-table-column label="模块" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="difficultyTag(row.difficulty)">{{ DIFFICULTY_LABELS[row.difficulty] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="typeTag(row.type)">{{ TYPE_LABELS[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-popover placement="left" :width="380" trigger="click">
              <template #reference>
                <el-button type="info" size="small" link>预览</el-button>
              </template>
              <div class="preview-pop">
                <h4>{{ row.title }}</h4>
                <div class="preview-meta">
                  <el-tag size="small" type="info">{{ row.module }}</el-tag>
                  <el-tag size="small" :type="difficultyTag(row.difficulty)">{{ DIFFICULTY_LABELS[row.difficulty] }}</el-tag>
                  <el-tag size="small" :type="typeTag(row.type)">{{ TYPE_LABELS[row.type] }}</el-tag>
                </div>
                <div class="preview-content">{{ row.content || '暂无详细内容' }}</div>
              </div>
            </el-popover>
            <el-button type="primary" size="small" link @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该知识点？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" size="small" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑知识点' : '添加知识点'" width="600px" top="6vh">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属模块" prop="module">
          <el-input v-model="form.module" placeholder="如：Vue基础、进阶、实战" />
        </el-form-item>
        <el-form-item label="知识点标题" prop="title">
          <el-input v-model="form.title" placeholder="如：响应式原理" />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-radio-group v-model="form.difficulty">
            <el-radio-button v-for="(label, val) in DIFFICULTY_LABELS" :key="val" :value="val">
              {{ label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button v-for="(label, val) in TYPE_LABELS" :key="val" :value="val">
              {{ label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序序号" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="详细内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入知识点的详细讲解内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ editingId ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCourseList } from '@/api/course'
import { getKnowledgeList, createKnowledge, updateKnowledge, deleteKnowledge } from '@/api/knowledge'

const DIFFICULTY_LABELS = { easy: '简单', medium: '中等', hard: '困难' }
const TYPE_LABELS = { theory: '理论', practice: '实操', extend: '拓展' }

function difficultyTag(val) {
  return { easy: 'success', medium: 'warning', hard: 'danger' }[val]
}
function typeTag(val) {
  return { theory: '', practice: 'success', extend: 'warning' }[val]
}

const courseList = ref([])
const selectedCourseId = ref('')
const knowledgeList = ref([])
const loading = ref(false)
const loadError = ref(false)

async function fetchCourses() {
  try {
    const res = await getCourseList()
    courseList.value = res.list
  } catch {
    // 拦截器已弹错误提示
  }
}

async function onCourseChange(courseId) {
  if (!courseId) return
  loading.value = true
  loadError.value = false
  try {
    const res = await getKnowledgeList(courseId)
    knowledgeList.value = res.list
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function refetch() {
  onCourseChange(selectedCourseId.value)
}

const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formRef = ref(null)
const form = ref({
  title: '',
  content: '',
  module: '',
  difficulty: 'easy',
  type: 'theory',
  orderNum: 0
})
const rules = {
  title: [{ required: true, message: '请输入知识点标题', trigger: 'blur' }],
  module: [{ required: true, message: '请输入所属模块', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

function openCreate() {
  editingId.value = null
  form.value = { title: '', content: '', module: '', difficulty: 'easy', type: 'theory', orderNum: knowledgeList.value.length + 1 }
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.value = {
    title: row.title,
    content: row.content || '',
    module: row.module,
    difficulty: row.difficulty,
    type: row.type,
    orderNum: row.orderNum
  }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (editingId.value) {
      await updateKnowledge(editingId.value, form.value)
    } else {
      await createKnowledge({ ...form.value, courseId: selectedCourseId.value })
    }
    dialogVisible.value = false
    onCourseChange(selectedCourseId.value)
  } catch {
    // 拦截器已弹错误提示
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  try {
    await deleteKnowledge(id)
    onCourseChange(selectedCourseId.value)
  } catch {
    // 拦截器已弹错误提示
  }
}

onMounted(fetchCourses)
</script>

<style scoped>
.knowledge-manage { padding: 20px; }
.knowledge-manage h2 { margin-bottom: 20px; }

.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.toolbar .label {
  margin-right: 8px;
  color: #606266;
}

.preview-pop h4 {
  margin: 0 0 10px;
  font-size: 15px;
  color: var(--text-primary);
}
.preview-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}
.preview-content {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
  max-height: 260px;
  overflow-y: auto;
  padding: 10px 12px;
  background: var(--bg-page);
  border-radius: 6px;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}
.error-state p {
  margin-bottom: 16px;
  font-size: 14px;
}
</style>
