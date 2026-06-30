// 全局常量 —— 消除魔法字符串，统一管理项目中的角色/学期/存储key等不变值

// 角色
export const ROLES = { TEACHER: 'teacher', STUDENT: 'student' }

// 角色中文名
export const ROLE_LABELS = { [ROLES.TEACHER]: '教师', [ROLES.STUDENT]: '学生' }

// 学期
export const SEMESTERS = { FRESHMAN: '大一', SOPHOMORE: '大二', JUNIOR: '大三' }

// 学期值数组（用于下拉选项）
export const SEMESTER_LIST = [SEMESTERS.FRESHMAN, SEMESTERS.SOPHOMORE, SEMESTERS.JUNIOR]

// 学期对应路由 path
export const SEMESTER_PATHS = {
  [SEMESTERS.FRESHMAN]: 'freshman',
  [SEMESTERS.SOPHOMORE]: 'sophomore',
  [SEMESTERS.JUNIOR]: 'junior'
}

// localStorage key
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  USER_ROLE: 'userRole',
  THEME: 'theme'
}

// 路由路径
export const PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  COURSES: '/courses',
  ASSIGNMENTS: '/assignments',
  GRADES: '/grades',
  STUDENTS: '/students',
  MY_COURSES: '/my-courses',
  MY_ASSIGNMENTS: '/my-assignments',
  MY_GRADES: '/my-grades',
  KNOWLEDGE: '/knowledge',
  MY_KNOWLEDGE: '/my-knowledge'
}

// 课程前缀（用于 defaultOpeneds 判断）
export const COURSE_PREFIXES = { TEACHER: '/courses', STUDENT: '/my-courses' }
