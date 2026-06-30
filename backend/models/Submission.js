const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Assignment = require('./Assignment');

// 学生提交记录模型——记录每个学生提交的作业和老师打的分数
const Submission = sequelize.define('Submission', {
  // 学生提交的内容/答案
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 老师给的分数（null 表示还没批改）
  score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // 老师评语
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 状态：submitted=已提交, graded=已批改
  status: {
    type: DataTypes.ENUM('submitted', 'graded'),
    defaultValue: 'submitted'
  }
}, {
  timestamps: true
});

// 每条提交记录关联一个学生和一个作业
Submission.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId' });

module.exports = Submission;
