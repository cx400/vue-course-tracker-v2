const { Sequelize } = require('sequelize');

// 优先使用 Railway 注入的环境变量，本地开发回退到 .env 配置
const sequelize = new Sequelize(
  process.env.MYSQLDATABASE || process.env.DB_NAME,
  process.env.MYSQLUSER || process.env.DB_USER,
  process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
})();

module.exports = sequelize;
