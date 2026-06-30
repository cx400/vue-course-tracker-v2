const express = require('express');
const { Course, Assignment, Submission, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'teacher') {
      // 全系统课程数
      const courseCount = await Course.count();

      // 全系统的作业提交统计
      const submittedCount = await Submission.count();
      const pendingCount = await Submission.count({ where: { status: 'submitted' } });
      const gradedCount = await Submission.count({ where: { status: 'graded' } });

      // 学生总数
      const studentCount = await User.count({ where: { role: 'student' } });

      return res.json({ courseCount, submittedCount, pendingCount, gradedCount, studentCount });
    }

    // 学生角色
    const mySubs = await Submission.findAll({
      where: { studentId: id },
      include: [{ model: Assignment, attributes: ['courseId', 'maxScore'] }]
    });
    const courseIds = [...new Set(mySubs.map(s => s.Assignment?.courseId).filter(Boolean))];

    const courseCount = courseIds.length;
    const submittedCount = mySubs.length;
    const gradedSubs = mySubs.filter(s => s.status === 'graded' && s.score !== null);
    const gradedCount = gradedSubs.length;

    // 待提交 = 全部作业 - 已提交
    const totalAssignments = await Assignment.count();
    const pendingCount = Math.max(0, totalAssignments - submittedCount);

    // 平均成绩
    let avgScore = 0;
    if (gradedSubs.length > 0) {
      const totalPct = gradedSubs.reduce((sum, s) => {
        return sum + (s.score / (s.Assignment?.maxScore || 100)) * 100;
      }, 0);
      avgScore = Math.round(totalPct / gradedSubs.length);
    }

    res.json({ courseCount, submittedCount, pendingCount, gradedCount, avgScore });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
