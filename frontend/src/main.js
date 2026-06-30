import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 路由：管理页面跳转
import { createPinia } from 'pinia' // 状态管理：全局共享数据
import ElementPlus from 'element-plus' // UI 组件库
import zhCn from 'element-plus/dist/locale/zh-cn.mjs' // 中文化
import 'element-plus/dist/index.css' // Element Plus 的样式
import './assets/global.scss' // 全局样式（暗色主题等）
import permission from './directives/permission' // 自定义指令：v-permission
import globalComponents from './plugins/global-components' // 全局组件注册
import { STORAGE_KEYS } from './constants' // 常量

// 在 Vue 挂载前从 localStorage 恢复主题，避免暗色模式下的页面闪烁
const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
}

const app = createApp(App) // 创建一个 Vue 应用实例
app.use(router) // 装上路由，这样 URL 变了页面就会切换
app.use(createPinia()) // 装上 Pinia，组件里用 useXxxStore() 读写全局数据
app.use(ElementPlus, { locale: zhCn }) // 装 Element Plus，设置中文
app.use(globalComponents) // 注册全局组件（DataTable、图表等）
app.directive('permission', permission) // 注册 v-permission 指令
app.mount('#app') // 把 Vue 应用渲染到 index.html 里的 <div id="app"> 上
