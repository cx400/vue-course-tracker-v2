const express = require('express');
const { Op } = require('sequelize');
const { Assignment, Submission, Course } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

const router = express.Router();

// 老师发布作业
router.post('/create', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, description, deadline, maxScore, courseId } = req.body;
    const assignment = await Assignment.create({
      title, description, deadline, maxScore, courseId
    });
    res.status(201).json({ message: '作业发布成功', assignment });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 学生查看——所有课程的作业列表（含自己的提交状态）
router.get('/my', auth, requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    // 查出所有作业，带课程信息和学生的提交记录
    const assignments = await Assignment.findAll({
      include: [
        { model: Course, attributes: ['id', 'title', 'semester'] },
        {
          model: Submission,
          where: { studentId },
          required: false,  // LEFT JOIN：没有提交记录的作业也返回
          attributes: ['id', 'content', 'score', 'comment', 'status', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 按课程分组
    const courseMap = {};
    assignments.forEach(asgn => {
      const course = asgn.Course || { id: 0, title: '未分类', semester: '-' };
      const cid = course.id;
      if (!courseMap[cid]) {
        courseMap[cid] = {
          courseId: course.id,
          courseTitle: course.title,
          semester: course.semester,
          assignments: []
        };
      }
      // Submission 是数组（一对多），取第一条（一个学生对一个作业只有一条提交）
      const submission = asgn.Submissions?.[0] || null;
      courseMap[cid].assignments.push({
        assignmentId: asgn.id,
        title: asgn.title,
        description: asgn.description,
        deadline: asgn.deadline,
        maxScore: asgn.maxScore,
        createdAt: asgn.createdAt,
        submission: submission ? {
          id: submission.id,
          content: submission.content,
          score: submission.score,
          comment: submission.comment,
          status: submission.status,
          submittedAt: submission.createdAt
        } : null
      });
    });

    res.json({ courses: Object.values(courseMap) });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 教师查看——所有作业（含课程信息，支持分页、搜索、按课程筛选）
router.get('/all', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { limit, offset, page, pageSize } = paginate(req.query);
    const where = {};

    // 按课程筛选
    if (req.query.courseId) {
      where.courseId = req.query.courseId;
    }
    // 按作业标题搜索
    if (req.query.keyword) {
      const kw = req.query.keyword.trim();
      where.title = { [Op.like]: `%${kw}%` };
    }

    const { count: total, rows } = await Assignment.findAndCountAll({
      where,
      include: [{ model: Course, attributes: ['id', 'title', 'semester'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    res.json(paginatedResponse(rows, total, page, pageSize));
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 查看某个课程的所有作业
router.get('/list/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const list = await Assignment.findAll({
      where: { courseId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ list });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
