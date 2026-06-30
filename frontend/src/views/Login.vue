<template>
  <div class="login-container">
    <!-- 背景装饰层 -->
    <div class="bg-layer">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>

    <!-- 主内容 -->
    <div class="login-content">
      <!-- 左侧：品牌区 -->
      <div class="brand-panel">
        <div class="brand-inner">
          <h1 class="brand-heading">
            {{ isRegister ? '加入我们' : '课程追踪' }}
            <span class="brand-accent">{{ isRegister ? '开始学习' : '系统' }}</span>
          </h1>
          <p class="brand-desc">
            {{
              isRegister
                ? '创建账号，追踪你的每一门课程学习进度'
                : '企业级角色权限管理，教师发布课程，学生追踪进度'
            }}
          </p>
          <div class="brand-features" v-if="!isRegister">
            <div class="feature-item">
              <span class="feature-dot"></span>
              教师发布课程与作业
            </div>
            <div class="feature-item">
              <span class="feature-dot"></span>
              学生追踪学习进度
            </div>
            <div class="feature-item">
              <span class="feature-dot"></span>
              学期分类管理
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：表单区 -->
      <div class="form-panel">
        <div class="form-card">
          <LoginForm
            v-if="!isRegister"
            :form="loginForm"
            :loading="loading"
            @submit="handleLogin"
            @toggle="isRegister = true"
          />
          <RegisterForm
            v-else
            :form="registerForm"
            :loading="loading"
            @submit="handleRegister"
            @toggle="isRegister = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login, register } from '@/api/user'
import { addRoleRoutes } from '@/router'
import { PATHS } from '@/constants'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()
const userStore = useUserStore()

// 登录页始终使用浅色主题，切换回主页时恢复用户偏好
let wasDark = false
onMounted(() => {
  wasDark = document.documentElement.classList.contains('dark')
  document.documentElement.classList.remove('dark')
})
onUnmounted(() => {
  if (wasDark) {
    document.documentElement.classList.add('dark')
  }
})
// 登录注册状态切换
const isRegister = ref(false)

const loading = ref(false)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({
  username: '',
  password: '',
  realName: '',
  role: ''
})

async function handleLogin() {
  if (!loginForm.username || !loginForm.password) {
    return ElMessage.warning('请输入用户名和密码')
  }
  loading.value = true
  try {
    const res = await login(loginForm)
    userStore.setLoginData(res.token, res.user)
    addRoleRoutes() // 登录后动态注册角色路由
    router.push(PATHS.DASHBOARD)
  } catch (error) {
    // 拦截器统一处理
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  try {
    await register(registerForm)
    Object.assign(registerForm, {
      username: '',
      password: '',
      realName: '',
      role: ''
    })
    isRegister.value = false
  } catch (error) {
    // 拦截器统一处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
// ======================== 整体布局 ========================
.login-container {
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
}

// ======================== 背景层 ========================
.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  // 深蓝到藏蓝的渐变，沉稳且专业
  background: linear-gradient(135deg, #0a1628 0%, #0f2440 40%, #162d50 70%, #0a1628 100%);
}

.bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  // 几何圆点纹理，增加层次感
  background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
  background-size: 30px 30px;
}

// ======================== 主内容区 ========================
.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 60px;
}

// ======================== 左侧品牌面板 ========================
.brand-panel {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 80px;
}

.brand-inner {
  color: #fff;
  max-width: 480px;
}

.brand-heading {
  font-size: 56px;
  font-weight: 300;
  line-height: 1.15;
  margin: 0 0 20px;
  letter-spacing: -1px;

  .brand-accent {
    display: block;
    font-weight: 700;
    // 温暖的金琥珀色点缀，在深蓝背景上跳出来
    background: linear-gradient(135deg, #f0b90b 0%, #f7931a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.brand-desc {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 40px;
  max-width: 380px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.feature-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f0b90b;
  flex-shrink: 0;
}

// ======================== 右侧表单面板 ========================
.form-panel {
  width: 440px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.form-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 40px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  // 卡片入场动画
  animation: card-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes card-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
