// 标签页状态管理：记录已打开的标签页列表，支持关闭、切换等操作

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export const useTabsStore = defineStore('tabs', () => {
  const router = useRouter()
  const route = useRoute()

  // 已打开的标签页：{ path, title }
  const openedTabs = ref([
    { path: '/dashboard', title: '工作台' }
  ])

  // 当前激活的标签页路径
  const activePath = computed(() => route.path)

  // 添加标签页（路由切换时自动调用）
  function addTab(tab) {
    const exists = openedTabs.value.find(t => t.path === tab.path)
    if (!exists) {
      openedTabs.value.push({ path: tab.path, title: tab.title || tab.path })
    }
  }

  // 关闭一个标签页
  function removeTab(path) {
    const idx = openedTabs.value.findIndex(t => t.path === path)
    if (idx === -1 || openedTabs.value.length <= 1) return

    openedTabs.value.splice(idx, 1)

    // 如果关闭的是当前页，跳转到相邻标签
    if (path === activePath.value) {
      const next = openedTabs.value[Math.min(idx, openedTabs.value.length - 1)]
      if (next) router.push(next.path)
    }
  }

  // 关闭其他标签页
  function closeOtherTabs() {
    openedTabs.value = openedTabs.value.filter(
      t => t.path === '/dashboard' || t.path === activePath.value
    )
  }

  // 关闭所有标签页（回到工作台）
  function closeAllTabs() {
    openedTabs.value = [{ path: '/dashboard', title: '工作台' }]
    router.push('/dashboard')
  }

  // 关闭左侧标签页
  function closeLeftTabs(path) {
    const idx = openedTabs.value.findIndex(t => t.path === path)
    if (idx > 0) {
      openedTabs.value.splice(0, idx)
    }
  }

  // 关闭右侧标签页
  function closeRightTabs(path) {
    const idx = openedTabs.value.findIndex(t => t.path === path)
    if (idx < openedTabs.value.length - 1) {
      openedTabs.value.splice(idx + 1)
    }
  }

  return {
    openedTabs,
    activePath,
    addTab,
    removeTab,
    closeOtherTabs,
    closeAllTabs,
    closeLeftTabs,
    closeRightTabs
  }
})
