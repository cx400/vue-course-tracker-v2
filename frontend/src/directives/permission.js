// 用法：v-permission="'teacher'"  或  v-permission="['teacher', 'student']"

import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  updated(el, binding) {
    checkPermission(el, binding)
  }
}

function checkPermission(el, binding) {
  const userStore = useUserStore()
  const userRole = userStore.userRole

  // binding.value 可以是字符串 'teacher' 或数组 ['teacher', 'student']
  const allowed = Array.isArray(binding.value)
    ? binding.value
    : [binding.value]

  if (!allowed.includes(userRole)) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}
