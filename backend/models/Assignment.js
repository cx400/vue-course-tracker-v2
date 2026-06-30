const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');

// 作业模型
const Assignment = sequelize.define('Assignment', {
  title: {                    // 作业标题
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {              // 作业描述/要求
    type: DataTypes.TEXT,
    allowNull: true
  },
  deadline: {                 // 截止日期
    type: DataTypes.DATE,
    allowNull: true
  },
  maxScore: {                 // 满分分值
    type: DataTypes.INTEGER,
    defaultValue: 100
  }
}, {
  timestamps: true
});

// 作业属于某个课程
Assignment.belongsTo(Course, { foreignKey: 'courseId' });

module.exports = Assignment;
