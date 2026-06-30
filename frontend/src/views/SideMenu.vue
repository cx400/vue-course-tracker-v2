<template>
  <div class="logo">
    <span class="logo-icon">📚</span>
    <span v-show="!collapsed" class="logo-text">课程追踪系统</span>
  </div>

  <el-menu
    :default-active="$route.path"
    :default-openeds="defaultOpeneds"
    background-color="var(--bg-sidebar)"
    text-color="#ffffff99"
    active-text-color="#fff"
    :collapse="collapsed"
    router
  >
    <el-menu-item :index="PATHS.DASHBOARD">
      <el-icon><HomeFilled /></el-icon>
      <span>工作台</span>
    </el-menu-item>

    <template v-if="userStore.userRole === ROLES.TEACHER">
      <el-sub-menu index="courses-sub">
        <template #title>
          <el-icon><Reading /></el-icon>
          <span>课程管理</span>
        </template>
        <el-menu-item :index="`/courses/${SEMESTER_PATHS[SEMESTERS.FRESHMAN]}`">
          <span>大一课程</span>
        </el-menu-item>
        <el-menu-item :index="`/courses/${SEMESTER_PATHS[SEMESTERS.SOPHOMORE]}`">
          <span>大二课程</span>
        </el-menu-item>
        <el-menu-item :index="`/courses/${SEMESTER_PATHS[SEMESTERS.JUNIOR]}`">
          <span>大三课程</span>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item :index="PATHS.ASSIGNMENTS">
        <el-icon><Document /></el-icon>
        <span>作业管理</span>
      </el-menu-item>
      <el-menu-item :index="PATHS.GRADES">
        <el-icon><TrophyBase /></el-icon>
        <span>成绩管理</span>
      </el-menu-item>
      <el-menu-item :index="PATHS.STUDENTS">
        <el-icon><UserFilled /></el-icon>
        <span>学生管理</span>
      </el-menu-item>
      <el-menu-item :index="PATHS.KNOWLEDGE">
        <el-icon><Memo /></el-icon>
        <span>知识点管理</span>
      </el-menu-item>
    </template>

    <template v-else>
      <el-sub-menu index="my-courses-sub">
        <template #title>
          <el-icon><Reading /></el-icon>
          <span>我的课程</span>
        </template>
        <el-menu-item :index="`/my-courses/${SEMESTER_PATHS[SEMESTERS.FRESHMAN]}`">
          <span>大一课程</span>
        </el-menu-item>
        <el-menu-item :index="`/my-courses/${SEMESTER_PATHS[SEMESTERS.SOPHOMORE]}`">
          <span>大二课程</span>
        </el-menu-item>
        <el-menu-item :index="`/my-courses/${SEMESTER_PATHS[SEMESTERS.JUNIOR]}`">
          <span>大三课程</span>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item :index="PATHS.MY_ASSIGNMENTS">
        <el-icon><Document /></el-icon>
        <span>我的作业</span>
      </el-menu-item>
      <el-menu-item :index="PATHS.MY_GRADES">
        <el-icon><TrophyBase /></el-icon>
        <span>成绩查看</span>
      </el-menu-item>
      <el-menu-item :index="PATHS.MY_KNOWLEDGE">
        <el-icon><Memo /></el-icon>
        <span>知识点学习</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ROLES, COURSE_PREFIXES, PATHS, SEMESTERS, SEMESTER_PATHS } from '@/constants'
import { HomeFilled, Reading, Document, TrophyBase, UserFilled, Memo } from '@element-plus/icons-vue'

defineProps({
  collapsed: { type: Boolean, default: false }
})

const route = useRoute()
const userStore = useUserStore()

const defaultOpeneds = computed(() => {
  if (route.path.startsWith(COURSE_PREFIXES.TEACHER)) return ['courses-sub']
  if (route.path.startsWith(COURSE_PREFIXES.STUDENT)) return ['my-courses-sub']
  return []
})
</script>

<style scoped lang="scss">
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding-left: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .logo-icon { font-size: 22px; margin-right: 10px; flex-shrink: 0; }
  .logo-text { color: #fff; font-size: 16px; font-weight: 600; letter-spacing: 1px; white-space: nowrap; }
}

.el-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;

  .el-menu-item.is-active {
    background-color: var(--primary) !important;
  }
}
</style>
