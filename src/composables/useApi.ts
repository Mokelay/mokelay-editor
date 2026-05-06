import axios from 'axios';

const DEFAULT_MOKELAY_API_BASE_URL = 'http://127.0.0.1:8787';

function normalizeApiBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

export const apiClient = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_MOKELAY_API_BASE_URL || DEFAULT_MOKELAY_API_BASE_URL),
  timeout: 10000
});

export async function fetchWithNative(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
