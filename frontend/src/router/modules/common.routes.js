// 通用路由 —— 所有角色可访问
import { ROLES } from '@/constants'

export default [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('@/views/common/Dashboard.vue'),
    meta: { title: '工作台', roles: [ROLES.TEACHER, ROLES.STUDENT] }
  },
  {
    path: 'settings',
    name: 'Settings',
    component: () => import('@/views/common/Settings.vue'),
    meta: { title: '个人设置', roles: [ROLES.TEACHER, ROLES.STUDENT] }
  },
  {
    path: ':pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/NotFound.vue'),
    meta: { title: '404', roles: [ROLES.TEACHER, ROLES.STUDENT] }
  }
]
