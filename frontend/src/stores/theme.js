// 主题状态管理：使用 Element Plus 官方 class="dark" API 切换暗色模式
// 相比手动覆盖 --el-* 变量，代码量减少 80%，且自动跟随 Element Plus 版本更新

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { STORAGE_KEYS } from '@/constants'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem(STORAGE_KEYS.THEME) === 'dark')

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark)
  }

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  watch(isDark, (val) => {
    localStorage.setItem(STORAGE_KEYS.THEME, val ? 'dark' : 'light')
    applyTheme(val)
  }, { immediate: true })

  return { isDark, toggleTheme }
})
