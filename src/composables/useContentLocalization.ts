import { computed, ref } from 'vue';
import {
  normalizePageLocaleConfig,
  type LocaleCode,
  type PageLocaleConfig
} from 'mokelay-components/runtime';

const localeConfigState = ref<PageLocaleConfig>(normalizePageLocaleConfig(undefined));
const editingLocaleState = ref<LocaleCode>(localeConfigState.value.defaultLocale);

export function setContentLocaleConfig(value: unknown) {
  localeConfigState.value = normalizePageLocaleConfig(value);
  if (!localeConfigState.value.supportedLocales.includes(editingLocaleState.value)) {
    editingLocaleState.value = localeConfigState.value.defaultLocale;
  }
}

export function setContentEditingLocale(locale: LocaleCode) {
  if (localeConfigState.value.supportedLocales.includes(locale)) editingLocaleState.value = locale;
}

export function useContentLocalization() {
  return {
    localeConfig: computed(() => localeConfigState.value),
    editingLocale: computed(() => editingLocaleState.value),
    setLocaleConfig: setContentLocaleConfig,
    setEditingLocale: setContentEditingLocale
  };
}

export function getContentLocaleConfig() {
  return localeConfigState.value;
}

export function getContentEditingLocale() {
  return editingLocaleState.value;
}
