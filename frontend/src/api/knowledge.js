import request from './request'

// 获取某课程的所有知识点
export function getKnowledgeList(courseId) {
  return request.get(`/knowledge/list/${courseId}`)
}

// 教师添加知识点
export function createKnowledge(data) {
  return request.post('/knowledge/create', data)
}

// 教师更新知识点
export function updateKnowledge(id, data) {
  return request.put(`/knowledge/${id}`, data)
}

// 教师删除知识点
export function deleteKnowledge(id) {
  return request.delete(`/knowledge/${id}`)
}
