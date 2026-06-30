<template>
  <el-form :model="form" class="auth-form" ref="formRef" :rules="rules">
    <h2>注册新账号</h2>

    <el-form-item prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名">
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
      >
        <template #prefix>
          <el-icon><Lock /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item prop="realName">
      <el-input v-model="form.realName" placeholder="请输入真实姓名">
        <template #prefix>
          <el-icon><Edit /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item prop="role">
      <el-select
        v-model="form.role"
        placeholder="请选择角色"
        style="width: 100%"
      >
        <el-option :label="ROLE_LABELS[ROLES.STUDENT]" :value="ROLES.STUDENT" />
        <el-option :label="ROLE_LABELS[ROLES.TEACHER]" :value="ROLES.TEACHER" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
        style="width: 100%"
      >
        {{ loading ? "注册中..." : "注册" }}
      </el-button>
    </el-form-item>

    <div class="link-row">
      已有账号？<span class="toggle-link" @click="$emit('toggle')">去登录</span>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { User, Lock, Edit } from "@element-plus/icons-vue";
import { ROLES, ROLE_LABELS } from "@/constants";

const props = defineProps({
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["submit", "toggle"]);

// 验证规则
const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少6位", trigger: "blur" }
  ],
  realName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
};

const formRef = ref(null);

// 注册提交前先验证表单，通过后再向父组件发出 submit 事件
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
