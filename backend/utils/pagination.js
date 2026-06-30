// 分页工具函数：所有需要分页的接口统一使用
// req.query 中的 page（默认1）、pageSize（默认10）

function paginate(query) {
  const pageSize = Math.max(1, parseInt(query.pageSize) || 10)
  const page = Math.max(1, parseInt(query.page) || 1)
  const offset = (page - 1) * pageSize
  return { limit: pageSize, offset, page, pageSize }
}

function paginatedResponse(list, total, page, pageSize) {
  return { list, total, page, pageSize }
}

module.exports = { paginate, paginatedResponse }
