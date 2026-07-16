import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import VConsole from 'vconsole'

// Enable vConsole
new VConsole()

createApp(App).mount('#app')