<template>
  <div class="data-table">
    <!-- 工具栏：搜索框 + 额外操作插槽 -->
    <div v-if="searchable || $slots['toolbar-extra']" class="table-toolbar">
      <el-input
        v-if="searchable"
        v-model="keyword"
        :placeholder="searchPlaceholder"
        clearable
        class="search-input"
        @input="onSearchInput"
        @clear="onSearchClear"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div v-if="$slots['toolbar-extra']" class="toolbar-extra">
        <slot name="toolbar-extra" />
      </div>
    </div>

    <!-- 表格区域：支持列配置模式或完全自定义模式 -->
    <slot v-if="$slots.default" name="default" />
    <el-table v-else :data="dataList" v-loading="loading" v-bind="tableProps">
      <el-table-column
        v-for="col in columns"
        :key="col.prop || col.slotName"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
        :show-overflow-tooltip="col.showOverflowTooltip"
      >
        <!-- 列有 slotName 时，通过具名插槽让父组件自定义内容 -->
        <template v-if="col.slotName" #default="scope">
          <slot :name="`col-${col.slotName}`" v-bind="scope" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div v-if="total > 0" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  // 列配置：[{ prop, label, width?, minWidth?, align?, slotName?, showOverflowTooltip? }]
  columns: { type: Array, default: () => [] },
  // 数据获取函数：({ page, pageSize, keyword }) => Promise<{ list, total }>
  fetchData: { type: Function, required: true },
  // 搜索框占位文字
  searchPlaceholder: { type: String, default: '请输入关键词搜索' },
  // 是否显示搜索框
  searchable: { type: Boolean, default: true },
  // 每页条数选项
  pageSizes: { type: Array, default: () => [5, 10, 20, 50] },
  // 透传给 el-table 的属性
  tableProps: { type: Object, default: () => ({ stripe: true, border: true }) }
})

const dataList = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const keyword = ref('')

// 用 VueUse 的 useDebounceFn 替代手写 setTimeout 防抖
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadData()
}, 300)

async function loadData() {
  loading.value = true
  try {
    const res = await props.fetchData({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined
    })
    dataList.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  debouncedSearch()
}

function onSearchClear() {
  keyword.value = ''
  currentPage.value = 1
  loadData()
}

// 暴露 refresh 方法，父组件可在增删改后手动刷新表格
defineExpose({ refresh: loadData })

onMounted(loadData)
</script>

<style scoped>
.data-table {
  width: 100%;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
  flex-shrink: 0;
}

.toolbar-extra {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

.table-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
