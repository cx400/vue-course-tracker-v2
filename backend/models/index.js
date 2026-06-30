const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const KnowledgePoint = require('./KnowledgePoint');
const Assignment = require('./Assignment');
const Submission = require('./Submission');

// 把所有模型集中在这里，后续新增模型也要加进来
const models = { User, Course, KnowledgePoint, Assignment, Submission };

// 补充关联：需要等所有模型加载完之后才能定义（避免循环依赖）
Assignment.hasMany(Submission, { foreignKey: 'assignmentId' });

// 同步所有模型到数据库——如果表不存在就自动创建
// force: false 表示不删除已有数据（true 的话会先删表再重建）
(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ 数据表同步成功！');
  } catch (error) {
    console.error('❌ 数据表同步失败:', error.message);
  }
})();

module.exports = models;
