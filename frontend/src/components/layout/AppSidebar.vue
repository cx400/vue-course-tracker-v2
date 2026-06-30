<template>
  <!-- 桌面端侧边栏 -->
  <aside class="sidebar" :class="{ collapsed }">
    <SideMenu :collapsed="collapsed" />
  </aside>

  <!-- 移动端抽屉菜单 -->
  <el-drawer
    v-model="drawerOpen"
    direction="ltr"
    size="240px"
    :with-header="false"
    :close-on-press-escape="true"
    :modal="true"
    class="mobile-drawer"
  >
    <SideMenu :collapsed="false" />
  </el-drawer>
</template>

<script setup>
import { ref } from 'vue'
import SideMenu from '@/views/SideMenu.vue'

defineProps({
  collapsed: { type: Boolean, default: false }
})

const drawerOpen = ref(false)

function toggleMobile() {
  drawerOpen.value = true
}

defineExpose({ toggleMobile })
</script>

<style scoped lang="scss">
$sidebar-width: 220px;

.sidebar {
  width: $sidebar-width;
  background: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s, background 0.3s;
  &.collapsed { width: 64px; }
}

@media (max-width: 768px) {
  .sidebar { display: none !important; }
}
</style>
