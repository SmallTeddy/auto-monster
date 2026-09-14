import { createApp } from 'vue'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import '@/styles/main.css'
import App from './App.vue'
import { router } from '@/router'
import { i18n } from '@/locales'

createApp(App).use(router).use(i18n).mount('#app')
