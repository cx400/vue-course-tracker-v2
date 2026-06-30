const jwt = require('jsonwebtoken');

// 认证中间件：验证用户是否已登录（是否带有效令牌）
const auth = (req, res, next) => {
  // 从请求头里获取 token，格式通常是 "Bearer xxx"
  const authHeader = req.headers.authorization;

  // 没有带 authorization 头，说明未登录
  if (!authHeader) {
    return res.status(401).json({ message: '未登录，请先登录' });
  }

  // Bearer 后面是真正的 token，用空格分割取第二部分
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '令牌格式错误' });
  }

  try {
    // 验证令牌是否有效（是否被篡改、是否过期）
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 把解析出来的用户信息挂到 req 上，后面的路由处理函数可以直接用
    req.user = decoded;
    next();   // 验证通过，放行，继续执行下一个中间件或路由
  } catch (error) {
    return res.status(401).json({ message: '令牌无效或已过期，请重新登录' });
  }
};

// 角色限制中间件：只允许指定角色访问，比如只有老师才能发布课程
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足，无法访问' });
    }
    next();
  };
};

module.exports = { auth, requireRole };
