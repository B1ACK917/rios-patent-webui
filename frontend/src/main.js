import * as Vue from 'vue'
import App from './App.vue'
import VueClipboard from 'vue3-clipboard'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@tato30/vue-pdf/style.css'

const app = Vue.createApp(App);
app.use(VueClipboard);
app.use(ElementPlus);
app.mount('#app')
