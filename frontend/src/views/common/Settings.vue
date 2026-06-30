<template>
  <div class="settings-page">
    <h2>个人设置</h2>

    <el-row :gutter="24">
      <!-- 左侧：个人信息 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">个人信息</span>
          </template>
          <el-form
            :model="profileForm"
            :rules="profileRules"
            ref="profileFormRef"
            label-width="80px"
          >
            <el-form-item label="用户名">
              <el-input :model-value="userStore.userInfo?.username" disabled />
              <span class="form-hint">用户名不可修改</span>
            </el-form-item>
            <el-form-item label="角色">
              <el-tag
                :type="userStore.userRole === ROLES.TEACHER ? 'warning' : 'success'"
                size="small"
              >
                {{ ROLE_LABELS[userStore.userRole] }}
              </el-tag>
              <span class="form-hint">角色不可修改</span>
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="profileForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱（选填）" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="profileLoading" @click="handleSaveProfile">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：修改密码 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">修改密码</span>
          </template>
          <el-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            label-width="100px"
          >
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入旧密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码（至少6位）"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateProfile, changePassword } from '@/api/user'
import { ROLES, ROLE_LABELS } from '@/constants'

const userStore = useUserStore()

// ---- 个人信息表单 ----
const profileFormRef = ref(null)
const profileForm = reactive({
  realName: userStore.userInfo?.realName || '',
  email: userStore.userInfo?.email || ''
})
const profileRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
}
const profileLoading = ref(false)

async function handleSaveProfile() {
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) return

  profileLoading.value = true
  try {
    const res = await updateProfile({
      realName: profileForm.realName,
      email: profileForm.email
    })
    // 更新 store 中的用户信息，顶部栏会即时刷新
    userStore.setLoginData(userStore.token, res.user)
  } catch {
    // 拦截器已弹错误提示
  } finally {
    profileLoading.value = false
  }
}

// ---- 修改密码表单 ----
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
const passwordLoading = ref(false)

async function handleChangePassword() {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  passwordLoading.value = true
  try {
    const res = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch {
    // 拦截器已弹错误提示
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 900px;
}
.settings-page h2 {
  margin-bottom: 24px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
}

.form-hint {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}
</style>
