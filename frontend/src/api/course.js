import request from './request'

// 创建课程
export function createCourse(data) {
  return request.post('/course/create', data)
}

// 获取课程列表，支持学期、分页、关键词筛选
export function getCourseList(params) {
  return request.get('/course/list', { params })
}

// 编辑课程
export function updateCourse(id, data) {
  return request.put(`/course/${id}`, data)
}

// 删除课程
export function deleteCourse(id) {
  return request.delete(`/course/${id}`)
}

// 工作台统计数据
export function getDashboardStats() {
  return request.get('/dashboard')
}

// 教师发布作业
export function createAssignment(data) {
  return request.post('/assignment/create', data)
}

// 教师获取所有作业（支持筛选和分页）
export function getAllAssignments(params) {
  return request.get('/assignment/all', { params })
}

// 获取某个课程的作业列表
export function getAssignmentList(courseId) {
  return request.get(`/assignment/list/${courseId}`)
}

// 教师获取某个作业的所有提交
export function getSubmissions(assignmentId, params) {
  return request.get(`/submission/assignment/${assignmentId}`, { params })
}

// 教师批改作业
export function gradeSubmission(id, data) {
  return request.put(`/submission/grade/${id}`, data)
}

// 学生获取所有课程的作业列表（含自己的提交状态）
export function getMyAssignments() {
  return request.get('/assignment/my')
}

// 提交作业
export function submitAssignment(data) {
  return request.post('/submission/submit', data)
}
