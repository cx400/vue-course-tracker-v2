require('dotenv').config();
const db = require('./config/database');
const models = require('./models');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 路由
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

// 生产环境托管前端静态文件，非 /api 路由返回 index.html（支持 history 模式）
const path = require('path');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
