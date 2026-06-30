const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');

const KnowledgePoint = sequelize.define('KnowledgePoint', {
  // 知识点标题，比如"响应式原理"、"v-model指令"
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // 详细内容 / 讲解
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 所属模块，比如"基础"、"进阶"、"实战"
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  // 难度：简单/中等/困难
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'easy'
  },
  // 类型：理论/实操/拓展
  type: {
    type: DataTypes.ENUM('theory', 'practice', 'extend'),
    allowNull: false,
    defaultValue: 'theory'
  },
  // 在学习路径中的排序位置
  orderNum: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

// 知识点属于某个课程
KnowledgePoint.belongsTo(Course, { foreignKey: 'courseId' });

module.exports = KnowledgePoint;
