import { computed, readonly, ref } from 'vue';
import { editorJsLocaleMessages, localeMessages } from '@/langs';

type Locale = 'zh' | 'en';

const LOCALE_COOKIE_KEY = 'mokelay-editor-locale';

function getCookieValue(name: string): string | null {
  const entries = document.cookie ? document.cookie.split('; ') : [];
  const entry = entries.find((item) => item.startsWith(`${name}=`));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice(name.length + 1));
}

function setCookieValue(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function getDefaultLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

function getInitialLocale(): Locale {
  const cookieLocale = getCookieValue(LOCALE_COOKIE_KEY);

  if (cookieLocale === 'zh' || cookieLocale === 'en') {
    return cookieLocale;
  }

  return getDefaultLocale();
}

const currentLocale = ref<Locale>(getInitialLocale());

function getMessage(path: string): string {
  const parts = path.split('.');
  let value: unknown = localeMessages[currentLocale.value];

  for (const part of parts) {
    if (typeof value === 'object' && value !== null && part in value) {
      value = (value as Record<string, unknown>)[part];
      continue;
    }

    value = undefined;
    break;
  }

  if (typeof value === 'string') {
    return value;
  }

  return path;
}

function updateLocale(locale: Locale) {
  currentLocale.value = locale;
  setCookieValue(LOCALE_COOKIE_KEY, locale);
}

export function useI18n() {
  return {
    locale: readonly(currentLocale),
    t: getMessage,
    setLocale: updateLocale,
    localeValue: computed(() => currentLocale.value)
  };
}

export function getEditorJsI18nMessages(locale: Locale) {
  return editorJsLocaleMessages[locale];
}

export const i18n = {
  t: getMessage,
  get locale() {
    return currentLocale.value;
  },
  setLocale: updateLocale
};
