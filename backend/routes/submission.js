const express = require('express');
const { Submission, User, Assignment } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

const router = express.Router();

// 学生提交作业
router.post('/submit', auth, requireRole('student'), async (req, res) => {
  try {
    const { content, assignmentId } = req.body;
    const studentId = req.user.id;

    // 检查是否已经提交过
    const exist = await Submission.findOne({ where: { studentId, assignmentId } });
    if (exist) {
      return res.status(400).json({ message: '你已提交过该作业，不能重复提交' });
    }

    const sub = await Submission.create({ content, assignmentId, studentId });
    res.status(201).json({ message: '作业提交成功', sub });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 老师批改作业（打分 + 评语）
router.put('/grade/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comment } = req.body;
    const sub = await Submission.findByPk(id);
    if (!sub) {
      return res.status(404).json({ message: '提交记录不存在' });
    }
    sub.score = score;
    sub.comment = comment;
    sub.status = 'graded';
    await sub.save();
    res.json({ message: '批改完成', sub });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 学生查看自己的提交记录和成绩
router.get('/my', auth, requireRole('student'), async (req, res) => {
  try {
    const list = await Submission.findAll({
      where: { studentId: req.user.id },
      include: [
        { model: Assignment, attributes: ['id', 'title', 'maxScore'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ list });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 老师查看某个作业的所有提交（支持分页）
router.get('/assignment/:assignmentId', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { limit, offset, page, pageSize } = paginate(req.query);

    const { count: total, rows } = await Submission.findAndCountAll({
      where: { assignmentId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'username', 'realName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    res.json(paginatedResponse(rows, total, page, pageSize));
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
