import { createApp } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import './style.css';

const app = createApp(App);
const queryClient = new QueryClient();

app.use(VueQueryPlugin, { queryClient });
app.mount('#app');
