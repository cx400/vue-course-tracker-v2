import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')  // @ 代表 src 目录，写 @/views/Login 等同于 src/views/Login
    }
  },

  // SCSS 全局变量自动注入到每个组件的 <style> 中，无需手动 @import
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/variables.scss" as *;`
      }
    }
  }

})
