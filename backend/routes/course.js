const express = require('express');
const { Op } = require('sequelize');
const { Course, User, Assignment, Submission, KnowledgePoint } = require('../models');
const sequelize = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

const router = express.Router();

// 发布课程（只有老师才能操作）
router.post('/create', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, description, semester } = req.body;
    const teacherId = req.user.id;

    const course = await Course.create({
      title,
      description,
      semester,
      teacherId
    });

    res.status(201).json({ message: '课程发布成功', course });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取课程列表，支持按学期筛选、分页、关键词搜索
router.get('/list', auth, async (req, res) => {
  try {
    const { limit, offset, page, pageSize } = paginate(req.query);
    const where = {};
    if (req.query.semester) {
      where.semester = req.query.semester;
    }
    if (req.query.keyword) {
      const kw = req.query.keyword.trim();
      where[Op.or] = [
        { title: { [Op.like]: `%${kw}%` } },
        { description: { [Op.like]: `%${kw}%` } }
      ];
    }

    const { count: total, rows } = await Course.findAndCountAll({
      where,
      include: [{ model: User, as: 'teacher', attributes: ['id', 'realName'] }],
      limit,
      offset
    });
    res.json(paginatedResponse(rows, total, page, pageSize));
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 编辑课程（只有该课程的授课教师才能编辑）
router.put('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '课程不存在' });
    }
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: '无权编辑他人课程' });
    }

    const { title, description, semester } = req.body;
    await course.update({ title, description, semester });
    res.json({ message: '课程更新成功', course });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除课程（只有该课程的授课教师才能删除）
router.delete('/:id', auth, requireRole('teacher'), async (req, res) => {
  const t = await sequelize.transaction();  // 数据库事务，保证要么全删要么全不删
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      await t.rollback();
      return res.status(404).json({ message: '课程不存在' });
    }
    // 只能删除自己的课程
    if (course.teacherId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: '无权删除他人课程' });
    }

    // 1. 查出该课程下所有作业的 ID
    const assignments = await Assignment.findAll({
      where: { courseId: course.id },
      attributes: ['id']
    });
    const assignmentIds = assignments.map(a => a.id);

    // 2. 删除这些作业的所有提交记录
    if (assignmentIds.length > 0) {
      await Submission.destroy({ where: { assignmentId: assignmentIds }, transaction: t });
    }

    // 3. 删除这些作业
    await Assignment.destroy({ where: { courseId: course.id }, transaction: t });

    // 4. 删除该课程的知识点
    await KnowledgePoint.destroy({ where: { courseId: course.id }, transaction: t });

    // 5. 删除课程本身
    await course.destroy({ transaction: t });

    await t.commit();
    res.json({ message: '课程及关联数据已删除' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
