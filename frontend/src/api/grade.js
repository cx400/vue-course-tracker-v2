// api/grade.js —— 成绩相关的后端接口调用
import request from './request'

// 学生获取自己的成绩汇总（按课程分组）
export function getMyGrades() {
  return request.get('/grade/my')
}

// 教师获取某门课程的所有学生成绩（支持分页）
export function getCourseGrades(courseId, params = {}) {
  return request.get(`/grade/course/${courseId}`, { params })
}
