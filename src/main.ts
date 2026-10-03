import { createApp } from 'vue'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import '@/styles/main.css'
import App from './App.vue'
import { router } from '@/router'
import { i18n } from '@/locales'

// 禁止移动端双击放大与手势缩放（兼容 iOS Safari）
document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false })
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false })

createApp(App).use(router).use(i18n).mount('#app')
