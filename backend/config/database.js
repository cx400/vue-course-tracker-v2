// 引入 Sequelize——一个 ORM 工具，让你用 JS 对象操作数据库，不用手写 SQL
const { Sequelize } = require('sequelize');

// 创建 Sequelize 实例并配置数据库连接信息
// 四个参数分别是：数据库名、用户名、密码、可选配置
const sequelize = new Sequelize(
  process.env.DB_NAME,       // 数据库名，从 .env 读取
  process.env.DB_USER,       // 用户名
  process.env.DB_PASSWORD,   // 密码
  {
    host: process.env.DB_HOST,   // 数据库地址
    dialect: 'mysql',             // 数据库类型
    logging: false                // 设为 true 可以看到每次执行的 SQL
  }
);

// 测试数据库是否连通
// async/await 是异步操作的写法，连接数据库需要时间，所以用 await 等待结果
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
})();

module.exports = sequelize;
