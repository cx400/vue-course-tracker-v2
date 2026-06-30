// api/user.js —— 用户相关的后端接口调用
import request from './request'

// 注册新用户
export function register(data) {
  return request.post('/user/register', data)
}

// 登录——获取 JWT Token
export function login(data) {
  return request.post('/user/login', data)
}

// 更新个人资料
export function updateProfile(data) {
  return request.put('/user/profile', data)
}

// 修改密码
export function changePassword(data) {
  return request.put('/user/password', data)
}

// 教师获取学生列表（含学习统计）
export function getStudentList(params) {
  return request.get('/user/students', { params })
}

// 教师查看单个学生学习详情
export function getStudentDetail(id) {
  return request.get(`/user/students/${id}`)
}
