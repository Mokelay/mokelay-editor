import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export async function fetchWithNative(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
