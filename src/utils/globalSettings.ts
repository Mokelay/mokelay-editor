import { computed, ref, watch, type App as VueApp } from 'vue';
import { i18n, type Locale } from '@/i18n';

export type ThemeMode = 'light' | 'dark';
export type GlobalSettingKey = 'theme' | 'language';

export type MokelaySettings = {
  getTheme: () => ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  getLanguage: () => Locale;
  setLanguage: (language: Locale) => void;
};

const THEME_MODE_COOKIE_KEY = 'mokelay-editor-theme-mode';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const entries = document.cookie ? document.cookie.split('; ') : [];
  const entry = entries.find((item) => item.startsWith(`${name}=`));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice(name.length + 1));
}

function setCookieValue(name: string, value: string) {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function normalizeThemeMode(theme: unknown): ThemeMode {
  return theme === 'dark' ? 'dark' : 'light';
}

function normalizeLanguage(language: unknown): Locale {
  return language === 'en' ? 'en' : 'zh';
}

function getInitialThemeMode(): ThemeMode {
  return normalizeThemeMode(getCookieValue(THEME_MODE_COOKIE_KEY));
}

const currentTheme = ref<ThemeMode>(getInitialThemeMode());

export const themeValue = computed(() => currentTheme.value);
export const languageValue = computed(() => i18n.locale);

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function setTheme(theme: ThemeMode) {
  currentTheme.value = normalizeThemeMode(theme);
}

function setLanguage(language: Locale) {
  i18n.setLocale(normalizeLanguage(language));
}

export const mokelaySettings: MokelaySettings = {
  getTheme: () => currentTheme.value,
  setTheme,
  getLanguage: () => i18n.locale,
  setLanguage
};

export function getGlobalSettingValue(key: string | undefined) {
  if (key === 'theme') return themeValue.value;
  if (key === 'language') return languageValue.value;
  return '';
}

export function setGlobalSettingValue(key: string | undefined, value: string) {
  if (key === 'theme') {
    setTheme(normalizeThemeMode(value));
    return true;
  }

  if (key === 'language') {
    setLanguage(normalizeLanguage(value));
    return true;
  }

  return false;
}

export function useGlobalSettings() {
  return {
    themeValue,
    languageValue,
    settings: mokelaySettings,
    setTheme,
    setLanguage
  };
}

export function registerWindowGlobalSettings() {
  if (typeof window === 'undefined') {
    return;
  }

  window.$mokelaySettings = mokelaySettings;
}

export function installGlobalSettings(app: VueApp) {
  app.config.globalProperties.$mokelaySettings = mokelaySettings;
  registerWindowGlobalSettings();
  applyTheme(currentTheme.value);
}

export const globalSettingsPlugin = {
  install: installGlobalSettings
};

applyTheme(currentTheme.value);

watch(currentTheme, (theme) => {
  applyTheme(theme);
  setCookieValue(THEME_MODE_COOKIE_KEY, theme);
});
