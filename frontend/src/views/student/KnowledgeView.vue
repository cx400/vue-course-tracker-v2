<template>
  <div class="knowledge-view">
    <h2>知识点学习</h2>

    <div class="toolbar">
      <span class="label">选择课程：</span>
      <el-select v-model="selectedCourseId" placeholder="请选择课程" @change="onCourseChange" style="width: 260px">
        <el-option
          v-for="c in enrolledCourses"
          :key="c.id"
          :label="`${c.title}（${c.semester}）`"
          :value="c.id"
        />
      </el-select>

      <template v-if="selectedCourseId">
        <el-divider direction="vertical" />
        <el-radio-group v-model="filterDifficulty" size="small" @change="onFilterChange">
          <el-radio-button value="">全部难度</el-radio-button>
          <el-radio-button v-for="(label, val) in DIFFICULTY_LABELS" :key="val" :value="val">{{ label }}</el-radio-button>
        </el-radio-group>

        <el-radio-group v-model="filterType" size="small" @change="onFilterChange" style="margin-left: 8px">
          <el-radio-button value="">全部类型</el-radio-button>
          <el-radio-button v-for="(label, val) in TYPE_LABELS" :key="val" :value="val">{{ label }}</el-radio-button>
        </el-radio-group>
      </template>
    </div>

    <div v-if="loadError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <el-button size="small" @click="refetch">重试</el-button>
    </div>

    <el-empty v-else-if="!selectedCourseId" description="请先选择课程查看知识点" />

    <el-empty v-else-if="!loading && groupedModules.length === 0" description="该课程暂无知识点" />

    <div v-else v-loading="loading" class="knowledge-body">
      <section v-for="mod in groupedModules" :key="mod.name" class="module-section">
        <div class="module-header">
          <span class="module-dot"></span>
          <h3 class="module-title">{{ mod.name }}</h3>
          <span class="module-count">{{ mod.points.length }} 个知识点</span>
        </div>

        <div class="kp-cards">
          <div
            v-for="kp in mod.points"
            :key="kp.id"
            class="kp-card"
            :class="{ expanded: expandedMap[kp.id] }"
          >
            <div class="kp-card-header" @click="toggleExpand(kp.id)">
              <div class="kp-card-left">
                <span class="kp-index">{{ kp.orderNum || '-' }}</span>
                <span class="kp-card-title">{{ kp.title }}</span>
              </div>
              <div class="kp-card-right">
                <el-tag size="small" :type="difficultyTag(kp.difficulty)">{{ DIFFICULTY_LABELS[kp.difficulty] }}</el-tag>
                <el-tag size="small" :type="typeTag(kp.type)">{{ TYPE_LABELS[kp.type] }}</el-tag>
                <el-icon class="expand-icon" :class="{ rotated: expandedMap[kp.id] }"><ArrowDown /></el-icon>
              </div>
            </div>
            <transition name="slide">
              <div v-show="expandedMap[kp.id]" class="kp-card-body">
                <div class="kp-card-content">{{ kp.content || '暂无详细内容' }}</div>
              </div>
            </transition>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { getCourseList } from '@/api/course'
import { getKnowledgeList } from '@/api/knowledge'

const DIFFICULTY_LABELS = { easy: '简单', medium: '中等', hard: '困难' }
const TYPE_LABELS = { theory: '理论', practice: '实操', extend: '拓展' }

function difficultyTag(val) {
  return { easy: 'success', medium: 'warning', hard: 'danger' }[val]
}
function typeTag(val) {
  return { theory: '', practice: 'success', extend: 'warning' }[val]
}

const enrolledCourses = ref([])
const selectedCourseId = ref('')
const knowledgeList = ref([])
const loading = ref(false)
const loadError = ref(false)
const filterDifficulty = ref('')
const filterType = ref('')
const expandedMap = reactive({})

function toggleExpand(id) {
  expandedMap[id] = !expandedMap[id]
}

function onFilterChange() {
  // 切换筛选时重置展开状态
  Object.keys(expandedMap).forEach(k => delete expandedMap[k])
}

const groupedModules = computed(() => {
  let list = knowledgeList.value
  if (filterDifficulty.value) {
    list = list.filter(k => k.difficulty === filterDifficulty.value)
  }
  if (filterType.value) {
    list = list.filter(k => k.type === filterType.value)
  }
  const map = new Map()
  list.forEach(k => {
    const mod = k.module || '默认模块'
    if (!map.has(mod)) map.set(mod, [])
    map.get(mod).push(k)
  })
  return Array.from(map.entries()).map(([name, points]) => ({ name, points }))
})

async function fetchEnrolledCourses() {
  try {
    const res = await getCourseList()
    enrolledCourses.value = res.list || []
  } catch {
    // 拦截器已弹错误提示
  }
}

async function onCourseChange(courseId) {
  if (!courseId) return
  Object.keys(expandedMap).forEach(k => delete expandedMap[k])
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

fetchEnrolledCourses()
</script>

<style scoped>
.knowledge-view {
  padding: 20px;
  max-width: 960px;
}
.knowledge-view h2 {
  margin-bottom: 20px;
}

/* ---- 工具栏 ---- */
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 0;
}
.toolbar .label {
  color: #606266;
  white-space: nowrap;
  margin-right: 8px;
}

/* ---- 模块分组 ---- */
.module-section {
  margin-bottom: 32px;
}
.module-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.module-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}
.module-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.module-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-page);
  padding: 2px 10px;
  border-radius: 10px;
}

/* ---- 知识点卡片 ---- */
.kp-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.kp-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
}
.kp-card:hover {
  border-color: var(--primary-light);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
}
.kp-card.expanded {
  border-color: var(--primary);
  box-shadow: 0 2px 12px rgba(24, 144, 255, 0.1);
}

.kp-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
  user-select: none;
}
.kp-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.kp-index {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  flex-shrink: 0;
}
.kp-card-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kp-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}
.expand-icon {
  color: var(--text-muted);
  font-size: 14px;
  transition: transform 0.25s;
}
.expand-icon.rotated {
  transform: rotate(180deg);
}

/* 卡片展开内容 */
.kp-card-body {
  padding: 0 18px 18px;
}
.kp-card-content {
  font-size: 14px;
  line-height: 1.9;
  color: var(--text-secondary);
  white-space: pre-wrap;
  padding: 14px 16px;
  background: var(--bg-page);
  border-radius: 6px;
  border-left: 3px solid var(--primary);
}

/* 展开动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 600px;
}

/* ---- 错误状态 ---- */
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
