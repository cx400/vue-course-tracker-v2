// 1. 加载 .env 文件里的配置到环境变量
require('dotenv').config();
// 连接数据库是否成功
const db = require('./config/database');
// 加载所有数据模型并同步到数据库
const models = require('./models');
// 2. 引入需要用到的第三方包
const express = require('express');     // Web 框架
const cors = require('cors');            // 跨域处理

// 3. 创建一个 Express 应用实例，可以理解为"服务器本体"
const app = express();

// 4. 注册中间件（中间件 = 请求到达后、进入业务逻辑前的"安检关卡"）

// cors() 允许前端（不同端口）访问后端，不然后端会拒绝前端的请求
app.use(cors());

// express.json() 把请求里的 JSON 数据自动解析成 JS 对象，req.body 就能直接拿到
app.use(express.json());

// 5. 路由
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const knowledgeRoutes = require('./routes/knowledge');
const assignmentRoutes = require('./routes/assignment');
const submissionRoutes = require('./routes/submission');
const gradeRoutes = require('./routes/grade');
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/user', userRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/grade', gradeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 生产环境：托管前端打包后的静态文件
const path = require('path');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
// 所有非 /api 路由返回前端入口（支持 Vue Router history 模式）
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// 6. 启动服务器，监听指定端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
