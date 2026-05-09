// ═══════════════════════════════════════════════════════════════
// btoa polyfill：修复 Vue Router transition key 含中文时崩溃
// 必须在 router 初始化之前执行
// ═══════════════════════════════════════════════════════════════
const _originalBtoa = window.btoa.bind(window)
window.btoa = (str) => {
  try {
    return _originalBtoa(str)
  } catch (e) {
    return _originalBtoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
  }
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
