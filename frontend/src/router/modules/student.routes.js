// 学生端路由
import { ROLES, SEMESTERS, SEMESTER_PATHS } from '@/constants'

const { FRESHMAN, SOPHOMORE, JUNIOR } = SEMESTERS
const { STUDENT } = ROLES

function semesterRoute(semester) {
  return {
    path: SEMESTER_PATHS[semester],
    component: () => import('@/views/student/SemesterCourses.vue'),
    meta: { title: `${semester}课程`, semester, roles: [STUDENT] }
  }
}

export default [
  {
    path: 'my-courses',
    component: () => import('@/views/student/MyCourses.vue'),
    redirect: `/my-courses/${SEMESTER_PATHS[FRESHMAN]}`,
    meta: { title: '我的课程', roles: [STUDENT] },
    children: [FRESHMAN, SOPHOMORE, JUNIOR].map(semesterRoute)
  },
  {
    path: 'my-grades',
    name: 'StudentGrades',
    component: () => import('@/views/student/MyGrades.vue'),
    meta: { title: '成绩查看', roles: [STUDENT] }
  },
  {
    path: 'my-assignments',
    name: 'StudentAssignments',
    component: () => import('@/views/student/MyAssignments.vue'),
    meta: { title: '我的作业', roles: [STUDENT] }
  },
  {
    path: 'my-knowledge',
    name: 'StudentKnowledge',
    component: () => import('@/views/student/KnowledgeView.vue'),
    meta: { title: '知识点学习', roles: [STUDENT] }
  }
]
