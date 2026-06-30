<template>
  <div class="not-found">
    <div class="nf-content">
      <div class="nf-code">404</div>
      <h2>页面不存在</h2>
      <p>请检查 URL 是否正确，或返回工作台</p>
      <el-button type="primary" @click="$router.push(PATHS.DASHBOARD)">返回工作台</el-button>
    </div>
  </div>
</template>

<script setup>
import { PATHS } from '@/constants'
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.nf-content {
  text-align: center;

  .nf-code {
    font-size: 100px;
    font-weight: 700;
    color: var(--primary);
    line-height: 1;
    margin-bottom: 16px;
    opacity: 0.4;
  }

  h2 {
    font-size: 22px;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  p {
    color: var(--text-muted);
    margin-bottom: 24px;
  }
}
</style>
