// router/index.js —— 路由入口，组装模块、守卫、动态注册
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { STORAGE_KEYS, ROLES, PATHS } from '@/constants'
import commonRoutes from './modules/common.routes'
import teacherRoutes from './modules/teacher.routes'
import studentRoutes from './modules/student.routes'

NProgress.configure({ showSpinner: false })

// 静态路由
const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  }
]

// 动态路由：登录后根据角色注册
const dynamicRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    redirect: PATHS.DASHBOARD,
    meta: { title: '首页', roles: [ROLES.TEACHER, ROLES.STUDENT] },
    children: [...commonRoutes, ...teacherRoutes, ...studentRoutes]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes]
})

// 刷新时恢复路由
if (localStorage.getItem(STORAGE_KEYS.TOKEN)) {
  dynamicRoutes.forEach((route) => router.addRoute(route))
}

// 全局守卫
router.beforeEach((to, from, next) => {
  NProgress.start()

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  const userInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || 'null')
  const role = userInfo?.role || ''

  if (token && to.path === PATHS.LOGIN) {
    NProgress.done()
    return next('/')
  }

  if (!token && to.path !== PATHS.LOGIN) {
    NProgress.done()
    return next(PATHS.LOGIN)
  }

  if (token && to.meta.roles && !to.meta.roles.includes(role)) {
    NProgress.done()
    return next(PATHS.DASHBOARD)
  }

  next()
})

router.afterEach(() => NProgress.done())

// 登录后调用
export function addRoleRoutes() {
  dynamicRoutes.forEach((route) => router.addRoute(route))
}

export default router
