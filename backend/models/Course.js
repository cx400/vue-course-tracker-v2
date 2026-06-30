const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// 课程模型
const Course = sequelize.define('Course', {
  // 课程名称
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // 课程描述/简介
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 所属学期：大一/大二/大三
  semester: {
    type: DataTypes.ENUM('大一', '大二', '大三'),
    allowNull: false,
    defaultValue: '大一'
  }
}, {
  timestamps: true
});

// 关联关系：每个课程属于一个老师（User表中 role=teacher 的用户）
Course.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

module.exports = Course;
