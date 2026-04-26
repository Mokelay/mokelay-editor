import { computed, readonly, ref } from 'vue';
import { editorJsLocaleMessages, localeMessages } from '@/langs';

type Locale = 'zh' | 'en';

const currentLocale = ref<Locale>(navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

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

export function useI18n() {
  return {
    locale: readonly(currentLocale),
    t: getMessage,
    setLocale: (locale: Locale) => {
      currentLocale.value = locale;
    },
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
  setLocale(locale: Locale) {
    currentLocale.value = locale;
  }
};
