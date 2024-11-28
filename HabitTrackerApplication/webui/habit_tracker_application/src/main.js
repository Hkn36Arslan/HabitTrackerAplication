import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './routes';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

// Use plugin with optional defaults


import jQuery from 'jquery';

// jQuery'i global olarak tanımlayın
window.$ = window.jQuery = jQuery;

const pinia = createPinia();
createApp(App)
    .use(pinia)
    .use(router)
    .use(VCalendar, {})
    .mount('#app');
