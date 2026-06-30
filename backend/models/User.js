const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  // 用户名：登录时用，不能为空，不能和别人重复
  username: {
    type: DataTypes.STRING(50),   // 最长50个字符的字符串
    allowNull: false,              // 不允许为空
    unique: true                   // 唯一，不能有重复用户名
  },
  // 密码：存的是加密后的密码，不是明文
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  // 真实姓名：显示用
  realName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  // 角色：只能是 student 或 teacher
  role: {
    type: DataTypes.ENUM('student', 'teacher'),  // ENUM = 枚举，只能取这两个值之一
    allowNull: false
  },
  // 邮箱：可选
  email: {
    type: DataTypes.STRING(100),
    allowNull: true               // allowNull: true 表示可以不填
  }
}, {
  // 自动添加 createdAt（创建时间）和 updatedAt（更新时间）字段
  timestamps: true
});

module.exports = User;
