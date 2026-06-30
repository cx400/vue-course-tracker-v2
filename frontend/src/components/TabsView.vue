<template>
  <div class="tabs-view">
    <div class="tabs-scroll">
      <span
        v-for="tab in tabsStore.openedTabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: tab.path === tabsStore.activePath }"
        @click="handleClick(tab)"
        @contextmenu.prevent="openContextMenu($event, tab)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <el-icon
          v-if="tab.path !== PATHS.DASHBOARD"
          class="tab-close"
          @click.stop="tabsStore.removeTab(tab.path)"
        >
          <Close />
        </el-icon>
      </span>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="tab-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <div class="menu-item" @click="closeCurrent">关闭当前标签</div>
        <div class="menu-item" @click="tabsStore.closeOtherTabs()">关闭其他标签</div>
        <div class="menu-item" @click="tabsStore.closeLeftTabs(contextMenu.tab.path)">关闭左侧标签</div>
        <div class="menu-item" @click="tabsStore.closeRightTabs(contextMenu.tab.path)">关闭右侧标签</div>
        <div class="menu-item" @click="tabsStore.closeAllTabs()">关闭全部标签</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { onClickOutside } from '@vueuse/core'
import { PATHS } from '@/constants'
import { Close } from '@element-plus/icons-vue'

const router = useRouter()
const tabsStore = useTabsStore()

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tab: null
})

function handleClick(tab) {
  if (tab.path !== tabsStore.activePath) {
    router.push(tab.path)
  }
}

function openContextMenu(e, tab) {
  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.tab = tab
}

function closeCurrent() {
  tabsStore.removeTab(contextMenu.tab.path)
}

// 点击页面其他区域关闭右键菜单
onClickOutside(
  () => document.querySelector('.tab-context-menu'),
  () => { contextMenu.visible = false },
  { ignore: ['.tab-item'] }
)
</script>

<style scoped lang="scss">
.tabs-view {
  height: 36px;
  background: var(--bg-topbar);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 8px;
  transition: background 0.3s;
}

.tabs-scroll {
  display: flex;
  align-items: center;
  overflow-x: auto;
  white-space: nowrap;
  height: 100%;
  &::-webkit-scrollbar { height: 2px; }
  &::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 1px; }
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  margin-right: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.2s;
  user-select: none;
  border: 1px solid transparent;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-page);
  }

  &.active {
    color: var(--primary);
    background: rgba(24, 144, 255, 0.08);
    border-color: var(--primary);
  }

  .tab-close {
    font-size: 12px;
    border-radius: 2px;
    padding: 1px;

    &:hover {
      color: #fff;
      background: var(--danger);
    }
  }
}
</style>

<style>
/* 右键菜单 - 全局样式，不能 scoped */
.tab-context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 140px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.tab-context-menu .menu-item {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  color: var(--el-text-color-regular);

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
}
</style>
