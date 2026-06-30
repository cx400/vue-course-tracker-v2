// 教师端路由
import { ROLES, SEMESTERS, SEMESTER_PATHS } from '@/constants'

const { FRESHMAN, SOPHOMORE, JUNIOR } = SEMESTERS
const { TEACHER } = ROLES

function semesterRoute(semester) {
  return {
    path: SEMESTER_PATHS[semester],
    component: () => import('@/views/teacher/SemesterCourseManage.vue'),
    meta: { title: `${semester}课程`, semester, roles: [TEACHER] }
  }
}

export default [
  {
    path: 'courses',
    component: () => import('@/views/teacher/CourseManage.vue'),
    redirect: `/courses/${SEMESTER_PATHS[FRESHMAN]}`,
    meta: { title: '课程管理', roles: [TEACHER] },
    children: [FRESHMAN, SOPHOMORE, JUNIOR].map(semesterRoute)
  },
  {
    path: 'assignments',
    name: 'TeacherAssignments',
    component: () => import('@/views/teacher/AssignmentManage.vue'),
    meta: { title: '作业管理', roles: [TEACHER] }
  },
  {
    path: 'grades',
    name: 'TeacherGrades',
    component: () => import('@/views/teacher/GradeManage.vue'),
    meta: { title: '成绩管理', roles: [TEACHER] }
  },
  {
    path: 'students',
    name: 'TeacherStudents',
    component: () => import('@/views/teacher/StudentManage.vue'),
    meta: { title: '学生管理', roles: [TEACHER] }
  },
  {
    path: 'knowledge',
    name: 'TeacherKnowledge',
    component: () => import('@/views/teacher/KnowledgeManage.vue'),
    meta: { title: '知识点管理', roles: [TEACHER] }
  }
]
