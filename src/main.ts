import { createApp } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import './style.css';
import { globalCallsPlugin } from './utils/globalCalls';

const app = createApp(App);
const queryClient = new QueryClient();

app.use(VueQueryPlugin, { queryClient });
app.use(globalCallsPlugin);
app.mount('#app');

function setupPwaAutoUpdate() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (!import.meta.env.PROD) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
    return;
  }

  const swUrl = `/sw.js?v=${encodeURIComponent(__APP_VERSION__)}`;
  let hasReloadedForUpdate = false;

  const requestImmediateActivation = (registration: ServiceWorkerRegistration) => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedForUpdate) {
      return;
    }
    hasReloadedForUpdate = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(swUrl);

      requestImmediateActivation(registration);

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            requestImmediateActivation(registration);
          }
        });
      });

      window.setInterval(() => {
        registration.update().catch(() => {
          // ignore background update failures
        });
      }, 60 * 1000);
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}

setupPwaAutoUpdate();
