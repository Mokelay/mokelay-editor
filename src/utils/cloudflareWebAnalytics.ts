const CLOUDFLARE_BEACON_ID = 'cloudflare-web-analytics';
const CLOUDFLARE_BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';

export function setupCloudflareWebAnalytics() {
  if (!import.meta.env.PROD) return;

  const token = import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();
  if (!token || document.getElementById(CLOUDFLARE_BEACON_ID)) return;

  const script = document.createElement('script');
  script.id = CLOUDFLARE_BEACON_ID;
  script.type = 'module';
  script.src = CLOUDFLARE_BEACON_SRC;
  script.dataset.cfBeacon = JSON.stringify({ token });
  document.head.appendChild(script);
}
