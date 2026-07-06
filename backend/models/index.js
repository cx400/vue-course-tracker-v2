const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const KnowledgePoint = require('./KnowledgePoint');
const Assignment = require('./Assignment');
const Submission = require('./Submission');

const models = { User, Course, KnowledgePoint, Assignment, Submission };

// 等所有模型加载完后定义关联
Assignment.hasMany(Submission, { foreignKey: 'assignmentId' });

// 自动建表（已有表不重建）
(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('数据表同步成功');
  } catch (error) {
    console.error('数据表同步失败:', error.message);
  }
})();

module.exports = models;
