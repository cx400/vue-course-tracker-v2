// stores/user.js —— 用户状态管理（Pinia Store）
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(STORAGE_KEYS.TOKEN) || '')
  const userInfo = ref(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => userInfo.value?.role || '')

  function setLoginData(newToken, newUser) {
    token.value = newToken
    userInfo.value = newUser
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(newUser))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  }

  return { token, userInfo, isLoggedIn, userRole, setLoginData, logout }
})
