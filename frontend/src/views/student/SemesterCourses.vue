<template>
  <div v-if="loadError" class="error-state">
    <p>加载失败，请稍后重试</p>
    <el-button size="small" @click="refetch">重试</el-button>
  </div>
  <DataTable
    v-else
    ref="tableRef"
    :columns="columns"
    :fetch-data="fetchCourses"
    search-placeholder="搜索课程名称"
  >
    <template #col-teacher="{ row }">
      {{ row.teacher?.realName || '-' }}
    </template>
  </DataTable>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCourseList } from '@/api/course'

const route = useRoute()
const tableRef = ref(null)
const loadError = ref(false)

const columns = [
  { prop: 'title', label: '课程名称', minWidth: 200 },
  { prop: 'description', label: '课程描述', minWidth: 300, showOverflowTooltip: true },
  { label: '授课老师', width: 120, slotName: 'teacher' }
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

// 切换学期 Tab 时刷新
watch(() => route.path, () => tableRef.value?.refresh())
</script>

<style scoped>
</style>
