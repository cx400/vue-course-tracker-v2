// 通用工具函数 —— 避免在多个组件中重复定义

/**
 * 格式化日期为 YYYY-MM-DD HH:mm
 * @param {string|Date} date - 日期字符串或 Date 对象
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 读取 CSS 变量值（用于 ECharts 图表配色）
 * @param {string} name - CSS 变量名，如 '--text-primary'
 * @param {string} fallback - 后备值
 * @returns {string}
 */
export function getCssVar(name, fallback = '') {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

/**
 * 计算百分比并保留1位小数
 * @param {number} value - 当前值
 * @param {number} total - 总数
 * @returns {number}
 */
export function getPercent(value, total) {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 1000) / 10
}

/**
 * 根据分数返回 Element Plus tag 类型
 * @param {number} score - 分数
 * @returns {'success'|'warning'|'danger'}
 */
export function getScoreTagType(score) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

/**
 * 根据得分/满分比例返回 Element Plus tag 类型（用于 MyGrades / GradeManage）
 * @param {number} score - 得分
 * @param {number} max - 满分
 * @returns {'success'|'warning'|'danger'}
 */
export function getPercentTag(score, max) {
  const pct = getPercent(score, max)
  if (pct >= 80) return 'success'
  if (pct >= 60) return 'warning'
  return 'danger'
}

/**
 * 根据得分/满分比例返回颜色值（用于 MyGrades / GradeManage）
 * @param {number} score - 得分
 * @param {number} max - 满分
 * @returns {string}
 */
export function getRatioColor(score, max) {
  if (!max || max === 0) return '#909399'
  const pct = score / max
  if (pct >= 0.8) return '#67c23a'
  if (pct >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

/**
 * 根据整数分数返回颜色值
 * @param {number} score - 百分制分数
 * @returns {string}
 */
export function getScoreColor(score) {
  if (score >= 80) return '#52c41a'
  if (score >= 60) return '#faad14'
  return '#ff4d4f'
}
