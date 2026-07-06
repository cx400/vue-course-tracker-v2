import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import './assets/global.scss'
import permission from './directives/permission'
import globalComponents from './plugins/global-components'
import { STORAGE_KEYS } from './constants'

// 挂载前恢复主题，避免暗色模式下的页面闪烁
const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(ElementPlus, { locale: zhCn })
app.use(globalComponents)
app.directive('permission', permission)
app.mount('#app')
