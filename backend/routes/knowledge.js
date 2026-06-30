const express = require('express');
const { KnowledgePoint, Course } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// 获取某课程的所有知识点
router.get('/list/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const list = await KnowledgePoint.findAll({
      where: { courseId },
      order: [['orderNum', 'ASC']]
    });
    res.json({ list });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 老师添加知识点
router.post('/create', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, content, module, difficulty, type, orderNum, courseId } = req.body;
    const point = await KnowledgePoint.create({
      title, content, module, difficulty, type, orderNum, courseId
    });
    res.status(201).json({ message: '知识点添加成功', point });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 老师更新知识点
router.put('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const point = await KnowledgePoint.findByPk(req.params.id);
    if (!point) {
      return res.status(404).json({ message: '知识点不存在' });
    }
    const { title, content, module, difficulty, type, orderNum } = req.body;
    await point.update({ title, content, module, difficulty, type, orderNum });
    res.json({ message: '知识点更新成功', point });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 老师删除知识点
router.delete('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const point = await KnowledgePoint.findByPk(req.params.id);
    if (!point) {
      return res.status(404).json({ message: '知识点不存在' });
    }
    await point.destroy();
    res.json({ message: '知识点已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
