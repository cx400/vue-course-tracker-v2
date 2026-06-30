<template>
  <div class="course-manage-layout">
    <div class="page-header">
      <h2>课程管理</h2>
    </div>
    <!-- 由侧边栏子菜单切换到哪个学期，这里就渲染对应学期课程管理 -->
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.page-header {
  margin-bottom: 16px;
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }
}
</style>
