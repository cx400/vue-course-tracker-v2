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
