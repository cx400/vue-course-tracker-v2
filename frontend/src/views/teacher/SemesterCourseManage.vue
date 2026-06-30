<template>
  <div class="semester-course-manage">
    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>
    <DataTable
      v-else
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchCourses"
      :search-placeholder="'搜索课程名称'"
    >
      <template #toolbar-extra>
        <span class="semester-label">{{ route.meta.semester }}课程</span>
        <el-button type="primary" @click="openCreate">发布课程</el-button>
      </template>
      <template #col-operation="{ row }">
        <el-button type="primary" size="small" link @click="openEdit(row)">编辑</el-button>
        <el-popconfirm
          title="删除课程会同时删除关联的作业、提交记录和知识点，确定删除？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          @confirm="handleDelete(row.id)"
        >
          <template #reference>
            <el-button type="danger" size="small" link>删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <template #col-createdAt="{ row }">
        {{ new Date(row.createdAt).toLocaleDateString() }}
      </template>
    </DataTable>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑课程' : '发布课程'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="所属学期" prop="semester">
          <el-select v-model="form.semester" placeholder="请选择学期" style="width: 100%">
            <el-option v-for="s in SEMESTER_LIST" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入课程描述（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">{{ editingId ? '保存' : '发布' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { createCourse, getCourseList, updateCourse, deleteCourse } from '@/api/course'
import { SEMESTERS, SEMESTER_LIST } from '@/constants'
// DataTable 已通过 plugins/global-components.js 全局注册

const route = useRoute()
const tableRef = ref(null)
const dialogVisible = ref(false)
const editingId = ref(null)
const loadError = ref(false)
const formRef = ref(null)
const form = reactive({ title: '', description: '', semester: SEMESTERS.FRESHMAN })
const rules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

const columns = [
  { prop: 'title', label: '课程名称', minWidth: 160 },
  { prop: 'description', label: '课程描述', minWidth: 220, showOverflowTooltip: true },
  { prop: 'semester', label: '学期', width: 80 },
  { prop: 'createdAt', label: '创建时间', width: 150, slotName: 'createdAt' },
  { label: '操作', width: 140, align: 'center', slotName: 'operation' }
]

async function fetchCourses({ page, pageSize, keyword }) {
  try {
    const res = await getCourseList({
      semester: route.meta.semester,
      page,
      pageSize,
      keyword
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

function openCreate() {
  editingId.value = null
  Object.assign(form, { title: '', description: '', semester: route.meta.semester || SEMESTERS.FRESHMAN })
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, { title: row.title, description: row.description || '', semester: row.semester })
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (editingId.value) {
      await updateCourse(editingId.value, form)
    } else {
      await createCourse(form)
    }
    dialogVisible.value = false
    tableRef.value.refresh()
  } catch {
    // 拦截器已弹错误提示
  }
}

async function handleDelete(id) {
  try {
    await deleteCourse(id)
    tableRef.value.refresh()
  } catch {
    // 拦截器已弹错误提示
  }
}

watch(() => route.path, () => tableRef.value?.refresh())
</script>

<style scoped lang="scss">
.semester-label {
  font-size: 15px;
  color: var(--text-secondary);
}

</style>
