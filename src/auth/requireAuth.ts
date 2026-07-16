import { apiClient } from '@/composables/useApi';

const DEVELOPMENT_WEBSITE_BASE_URL = 'http://localhost:3000';
const PRODUCTION_WEBSITE_BASE_URL = 'https://www.mokelay.com';

type AuthSessionResponse = {
  ok?: boolean;
  data?: {
    loggedIn?: boolean;
    user?: unknown;
  };
};

function websiteBaseUrl() {
  const configured = import.meta.env.VITE_MOKELAY_WEBSITE_BASE_URL;
  return (configured || (import.meta.env.PROD ? PRODUCTION_WEBSITE_BASE_URL : DEVELOPMENT_WEBSITE_BASE_URL)).replace(/\/+$/, '');
}

export function editorLoginUrl(location: Pick<Location, 'origin' | 'pathname' | 'search' | 'hash'> = window.location) {
  const loginUrl = new URL('/login', websiteBaseUrl());
  loginUrl.searchParams.set('redirect', `${location.pathname}${location.search}${location.hash}` || '/');
  loginUrl.searchParams.set('redirect_origin', location.origin);
  return loginUrl.toString();
}

function hasAuthenticatedUser(value: unknown) {
  if (!value || typeof value !== 'object') return false;
  const response = value as AuthSessionResponse;
  return response.ok === true
    && response.data?.loggedIn === true
    && Boolean(response.data.user && typeof response.data.user === 'object');
}

export async function requireAuthenticatedUser() {
  try {
    const response = await apiClient.get<AuthSessionResponse>('/api/mokelay/me', {
      params: { purpose: 'editor-auth' }
    });
    if (hasAuthenticatedUser(response.data)) return true;
  } catch {
    // Authentication and network failures both keep the protected editor hidden.
  }

  window.location.replace(editorLoginUrl());
  return false;
}
