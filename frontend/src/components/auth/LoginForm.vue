<template>
  <el-form :model="form" class="auth-form" ref="formRef" :rules="rules">
    <h2>课程学习系统登录</h2>

    <el-form-item prop="username">
      <el-input
        v-model="form.username"
        placeholder="请输入用户名"
        @keyup.enter="handleSubmit"
      >
        <template #prefix>
          <el-icon><User /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        show-password
        @keyup.enter="handleSubmit"
      >
        <template #prefix>
          <el-icon><Lock /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
        style="width: 100%"
      >
        {{ loading ? "登录中..." : "登录" }}
      </el-button>
    </el-form-item>

    <div class="link-row">
      没有账号？<span class="toggle-link" @click="$emit('toggle')">去注册</span>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { User, Lock } from "@element-plus/icons-vue";

defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["submit", "toggle"]);

// 登录表单校验规则，跟主流网站一致
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 2,
      max: 20,
      message: "用户名长度在 2 到 20 个字符",
      trigger: "change",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      min: 6,
      max: 20,
      message: "密码长度在 6 到 20 个字符",
      trigger: "change",
    },
  ],
};

const formRef = ref(null);

// 点击登录时先验证，通过后再通知父组件
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  emit("submit");
}
</script>

<style scoped lang="scss">
.auth-form {
  width: 380px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  h2 {
    text-align: center;
    margin-bottom: 25px;
  }
  .el-form-item {
    width: 100%;
  }
  .el-input {
    height: 44px;
  }

  .el-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
}

.link-row {
  text-align: center;
  margin-top: 5px;
  color: #666;
}

.toggle-link {
  color: var(--primary-color);
  cursor: pointer;
  &:hover {
    color: #66b1ff;
  }
}
</style>
