<template>
  <header class="topbar">
    <div class="topbar-left">
      <span class="collapse-btn" @click="$emit('toggle-sidebar')">
        <el-icon size="18">
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </span>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="$route.meta.title !== '工作台'">{{ $route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="topbar-right">
      <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
        <span class="header-icon" @click="toggleFullscreen">
          <el-icon size="18"><FullScreen v-if="!isFullscreen" /><Aim v-else /></el-icon>
        </span>
      </el-tooltip>

      <el-tooltip content="刷新页面" placement="bottom">
        <span class="header-icon" @click="$emit('refresh')">
          <el-icon size="18"><Refresh /></el-icon>
        </span>
      </el-tooltip>

      <el-tooltip :content="themeStore.isDark ? '切换浅色' : '切换暗色'" placement="bottom">
        <span class="header-icon" @click="themeStore.toggleTheme()">
          <el-icon size="18"><Sunny v-if="themeStore.isDark" /><Moon v-else /></el-icon>
        </span>
      </el-tooltip>

      <el-tag :type="userStore.userRole === ROLES.TEACHER ? 'warning' : 'success'" size="small" effect="plain">
        {{ ROLE_LABELS[userStore.userRole] }}
      </el-tag>

      <el-dropdown trigger="click">
        <span class="user-avatar">
          <el-icon size="18"><UserFilled /></el-icon>
          {{ userStore.userInfo?.realName }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>角色：{{ ROLE_LABELS[userStore.userRole] }}</el-dropdown-item>
            <el-dropdown-item @click="$router.push(PATHS.SETTINGS)"><el-icon><Setting /></el-icon>个人设置</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useFullscreen } from '@/composables/useFullscreen'
import { PATHS, ROLES, ROLE_LABELS } from '@/constants'
import {
  Fold, Expand, FullScreen, Aim, Refresh,
  Sunny, Moon, UserFilled, ArrowDown, Setting
} from '@element-plus/icons-vue'

defineProps({
  collapsed: { type: Boolean, default: false }
})

defineEmits(['toggle-sidebar', 'refresh'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { isFullscreen, toggleFullscreen } = useFullscreen()

function handleLogout() {
  userStore.logout()
  router.push(PATHS.LOGIN)
}
</script>

<style scoped lang="scss">
$topbar-height: 56px;

.topbar {
  height: $topbar-height;
  background: var(--bg-topbar);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: var(--shadow-topbar);
  z-index: 10;
  flex-shrink: 0;
  transition: background 0.3s;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  margin-right: 16px;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  transition: all 0.2s;
  &:hover { color: var(--primary); background: rgba(24, 144, 255, 0.06); }
}

.header-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  transition: all 0.2s;
  &:hover { color: var(--primary); background: rgba(24, 144, 255, 0.06); }
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 14px;
  &:hover { color: var(--primary); }
}

@media (max-width: 768px) {
  .topbar { padding: 0 16px; }
  .topbar-right { gap: 8px; }
  .user-avatar span:last-child { display: none; }
}
</style>
