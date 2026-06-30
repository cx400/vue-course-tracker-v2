const express = require('express');
const { Submission, Assignment, Course, User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

const router = express.Router();

// 学生查看——自己所有课程的成绩汇总
router.get('/my', auth, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    // 第一步：查出这个学生的所有提交记录，带上作业和课程信息
    const submissions = await Submission.findAll({
      where: { studentId },
      include: [
        {
          model: Assignment,
          include: [{ model: Course, attributes: ['id', 'title', 'semester'] }]
        }
      ]
    });

    if (submissions.length === 0) {
      return res.json({ grades: [] });
    }

    // 按课程分组汇总
    const courseMap = {};
    submissions.forEach(sub => {
      const assignment = sub.Assignment;
      // 作业可能没有关联课程，用 "未分类" 兜底
      const course = assignment.Course || { id: 0, title: '未分类课程', semester: '-' };
      const cid = course.id;

      if (!courseMap[cid]) {
        courseMap[cid] = {
          courseId: course.id,
          courseTitle: course.title,
          semester: course.semester,
          assignments: [],
          totalScore: 0,
          totalMaxScore: 0,
          gradedCount: 0,
          totalCount: 0
        };
      }

      const group = courseMap[cid];
      group.assignments.push({
        assignmentId: assignment.id,
        title: assignment.title,
        maxScore: assignment.maxScore,
        score: sub.score,
        comment: sub.comment,
        status: sub.status
      });
      group.totalMaxScore += assignment.maxScore;
      if (sub.score !== null) {
        group.totalScore += sub.score;
        group.gradedCount++;
      }
      group.totalCount++;
    });

    res.json({ grades: Object.values(courseMap) });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 教师查看——某门课程所有学生的成绩汇总
router.get('/course/:courseId', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { courseId } = req.params;

    // 查课程信息
    const course = await Course.findByPk(courseId, {
      attributes: ['id', 'title', 'semester']
    });
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }

    // 查出该课程下的所有作业
    const assignments = await Assignment.findAll({
      where: { courseId },
      attributes: ['id', 'title', 'maxScore']
    });

    // 查这些作业的所有提交记录（带学生信息）
    const assignmentIds = assignments.map(a => a.id);
    const submissions = await Submission.findAll({
      where: { assignmentId: assignmentIds },
      include: [
        { model: User, as: 'student', attributes: ['id', 'username', 'realName'] },
        { model: Assignment, attributes: ['id', 'title', 'maxScore'] }
      ]
    });

    // 按学生分组汇总
    const studentMap = {};
    submissions.forEach(sub => {
      const sid = sub.student.id;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          studentId: sid,
          studentName: sub.student.realName,
          username: sub.student.username,
          scores: [],
          totalScore: 0,
          totalMaxScore: 0,
          gradedCount: 0
        };
      }
      const group = studentMap[sid];
      group.scores.push({
        assignmentId: sub.assignmentId,
        assignmentTitle: sub.Assignment.title,
        maxScore: sub.Assignment.maxScore,
        score: sub.score,
        status: sub.status
      });
      group.totalMaxScore += sub.Assignment.maxScore;
      if (sub.score !== null) {
        group.totalScore += sub.score;
        group.gradedCount++;
      }
    });

    // 按百分比从高到低排序
    const sorted = Object.values(studentMap).sort((a, b) => {
      const pctA = a.totalMaxScore > 0 ? a.totalScore / a.totalMaxScore : 0;
      const pctB = b.totalMaxScore > 0 ? b.totalScore / b.totalMaxScore : 0;
      return pctB - pctA;
    });

    // 分页：在排序后再切片
    const { limit, offset, page, pageSize } = paginate(req.query);
    const total = sorted.length;
    const paginatedStudents = sorted.slice(offset, offset + limit);

    res.json({
      course,
      assignments,
      ...paginatedResponse(paginatedStudents, total, page, pageSize)
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
