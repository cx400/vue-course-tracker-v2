// api/request.js —— axios 封装，统一管理后端请求的配置
import axios from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import { STORAGE_KEYS, PATHS } from '@/constants'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000
})

// 请求拦截器：自动附加 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理成功/错误反馈
request.interceptors.response.use(
  (response) => {
    const { config, data } = response
    const method = config.method?.toLowerCase()
    if (!config.silent && ['post', 'put', 'delete'].includes(method) && data?.message) {
      ElMessage.success(data.message)
    }
    return data
  },
  (error) => {
    const { response, config } = error

    if (config?.silent) {
      return Promise.reject(error)
    }

    if (!response) {
      ElNotification({
        title: '网络错误',
        message: '无法连接到服务器，请检查网络或后端是否启动',
        type: 'error',
        duration: 5000
      })
      return Promise.reject(error)
    }

    const { status, data } = response
    const msg = data?.message || '请求失败'

    switch (status) {
      case 400:
        ElMessage.warning(msg)
        break
      case 401:
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER_INFO)
        localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
        window.location.href = PATHS.LOGIN
        break
      case 403:
        ElMessage.error('没有权限执行此操作')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器内部错误，请稍后再试')
        break
      default:
        ElMessage.error(msg)
    }

    return Promise.reject(error)
  }
)

export default request
