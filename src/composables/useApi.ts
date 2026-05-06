import axios from 'axios';

const DEVELOPMENT_MOKELAY_API_BASE_URL = 'http://127.0.0.1:8787';
const PRODUCTION_MOKELAY_API_BASE_URL = 'https://api.mokelay.com';

function normalizeApiBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function getDefaultApiBaseUrl() {
  return import.meta.env.PROD ? PRODUCTION_MOKELAY_API_BASE_URL : DEVELOPMENT_MOKELAY_API_BASE_URL;
}

export const apiClient = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_MOKELAY_API_BASE_URL || getDefaultApiBaseUrl()),
  timeout: 10000
});

export async function fetchWithNative(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
