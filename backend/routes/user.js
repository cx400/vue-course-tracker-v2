// 引入依赖包
const express = require('express');
const bcrypt = require('bcryptjs');           // 密码加密和比对
const jwt = require('jsonwebtoken');          // 生成和验证登录令牌
const { User, Submission, Assignment, Course } = require('../models');
const sequelize = require('../config/database');        // 用户模型（数据库表）

const router = express.Router();              // 创建一个路由实例

// ==================== 注册接口 ====================
router.post('/register', async (req, res) => {
  try {
    // 从请求体中取出前端传来的字段
    const { username, password, realName, role, email } = req.body;

    // 查一下数据库，看用户名是否已经被注册
    const existUser = await User.findOne({ where: { username } });
    if (existUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 把明文密码加密，10 是加密强度（越高越安全，但也越慢）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 把用户数据写入数据库
    const user = await User.create({
      username,
      password: hashedPassword,   // 存加密后的密码，绝不存明文
      realName,
      role,
      email
    });

    // 返回注册成功，但不返回密码字段
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// ==================== 登录接口 ====================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 根据用户名查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 把用户输入的密码和数据库中加密的密码做比对
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 密码正确，生成 JWT 令牌。令牌里存了用户 id 和角色
    // expiresIn: '7d' 表示令牌 7 天后过期
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回令牌和用户信息给前端
    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// ==================== 学生管理（教师端） ====================
const { auth, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');
const { paginate, paginatedResponse } = require('../utils/pagination');

// 获取所有学生列表（含学习统计，支持分页和搜索）
router.get('/students', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { limit, offset, page, pageSize } = paginate(req.query);

    const where = { role: 'student' };
    // 关键词搜索：按用户名或真实姓名模糊匹配
    if (req.query.keyword) {
      const kw = req.query.keyword.trim();
      where[Op.or] = [
        { username: { [Op.like]: `%${kw}%` } },
        { realName: { [Op.like]: `%${kw}%` } }
      ];
    }

    const { count: total, rows: students } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'realName', 'email', 'createdAt'],
      limit,
      offset
    });

    // 仅为当前页的学生计算统计数据
    const list = await Promise.all(students.map(async (s) => {
      const subs = await Submission.findAll({
        where: { studentId: s.id },
        include: [{ model: Assignment, attributes: ['courseId', 'maxScore'] }]
      });
      const courseIds = [...new Set(subs.map(sub => sub.Assignment?.courseId).filter(Boolean))];
      const gradedSubs = subs.filter(sub => sub.status === 'graded' && sub.score !== null);
      const avgScore = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((sum, sub) =>
            sum + sub.score / (sub.Assignment?.maxScore || 100) * 100, 0) / gradedSubs.length)
        : null;

      return {
        id: s.id,
        username: s.username,
        realName: s.realName,
        email: s.email,
        createdAt: s.createdAt,
        courseCount: courseIds.length,
        submittedCount: subs.length,
        gradedCount: gradedSubs.length,
        avgScore
      };
    }));

    res.json(paginatedResponse(list, total, page, pageSize));
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 查看单个学生学习详情
router.get('/students/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const student = await User.findOne({
      where: { id: req.params.id, role: 'student' },
      attributes: ['id', 'username', 'realName', 'email', 'createdAt']
    });
    if (!student) {
      return res.status(404).json({ message: '学生不存在' });
    }

    // 所有提交记录（含作业和课程信息）
    const subs = await Submission.findAll({
      where: { studentId: student.id },
      include: [{
        model: Assignment,
        attributes: ['id', 'title', 'maxScore', 'courseId'],
        include: [{ model: Course, attributes: ['id', 'title', 'semester'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    // 按课程分组
    const courseMap = {};
    subs.forEach(sub => {
      const asgn = sub.Assignment;
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
      courseMap[cid].assignments.push({
        assignmentTitle: asgn.title,
        maxScore: asgn.maxScore,
        score: sub.score,
        status: sub.status,
        comment: sub.comment,
        submittedAt: sub.createdAt
      });
    });

    res.json({
      student,
      courses: Object.values(courseMap)
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// ==================== 个人设置 - 修改个人信息 ====================
// 任何登录用户都可以修改自己的 realName 和 email
router.put('/profile', auth, async (req, res) => {
  try {
    const { realName, email } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (realName !== undefined) user.realName = realName;
    if (email !== undefined) user.email = email;
    await user.save();

    res.json({
      message: '个人信息更新成功',
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// ==================== 个人设置 - 修改密码 ====================
// 需要验证旧密码，新密码至少 6 位
router.put('/password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '请输入旧密码和新密码' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度不能少于6位' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '旧密码不正确' });
    }

    // 加密并保存新密码
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;   // 导出路由，给 app.js 使用
