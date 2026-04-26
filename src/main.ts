import { createApp } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import './style.css';

const app = createApp(App);
const queryClient = new QueryClient();

app.use(VueQueryPlugin, { queryClient });
app.mount('#app');


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}
