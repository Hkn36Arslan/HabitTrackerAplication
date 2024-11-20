import HabitDetail from '@/views/HabitDetail.vue';
import Home from '@/views/Home.vue';
import Stats from '@/views/Stats.vue';
import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/stats',
        name: 'Stats',
        component: Stats,
    },
    {
        path: '/habitDetail/:habitId', // habitId parametresini ekledik
        name: 'HabitDetail',
        component: HabitDetail,
        props: true, // parametreyi bileşene prop olarak geçer
    }

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
