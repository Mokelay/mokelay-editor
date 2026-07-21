import type { LocaleCode } from 'mokelay-components/runtime';

export interface ContentLocaleOption {
  code: LocaleCode;
  nativeName: string;
  preset: boolean;
}

export const COMMON_CONTENT_LOCALES = [
  { code: 'zh-CN', nativeName: '简体中文', preset: true },
  { code: 'zh-TW', nativeName: '繁體中文', preset: true },
  { code: 'en-US', nativeName: 'English', preset: true },
  { code: 'es-ES', nativeName: 'Español', preset: true },
  { code: 'fr-FR', nativeName: 'Français', preset: true },
  { code: 'de-DE', nativeName: 'Deutsch', preset: true },
  { code: 'pt-BR', nativeName: 'Português', preset: true },
  { code: 'ja-JP', nativeName: '日本語', preset: true },
  { code: 'ko-KR', nativeName: '한국어', preset: true },
  { code: 'ru-RU', nativeName: 'Русский', preset: true },
  { code: 'ar-SA', nativeName: 'العربية', preset: true },
  { code: 'hi-IN', nativeName: 'हिन्दी', preset: true },
  { code: 'id-ID', nativeName: 'Bahasa Indonesia', preset: true },
  { code: 'th-TH', nativeName: 'ไทย', preset: true },
  { code: 'vi-VN', nativeName: 'Tiếng Việt', preset: true },
  { code: 'tr-TR', nativeName: 'Türkçe', preset: true },
  { code: 'it-IT', nativeName: 'Italiano', preset: true },
  { code: 'nl-NL', nativeName: 'Nederlands', preset: true },
  { code: 'pl-PL', nativeName: 'Polski', preset: true },
  { code: 'uk-UA', nativeName: 'Українська', preset: true }
] as const satisfies readonly ContentLocaleOption[];

const commonLocalesByCode = new Map<string, ContentLocaleOption>(
  COMMON_CONTENT_LOCALES.map((locale) => [locale.code, locale])
);

export function canonicalizeContentLocale(code: string): LocaleCode {
  const trimmed = code.trim();
  if (!trimmed) return '';
  try {
    return Intl.getCanonicalLocales(trimmed)[0] ?? '';
  } catch {
    return '';
  }
}

export function isValidLocaleCode(code: string) {
  return Boolean(canonicalizeContentLocale(code));
}

export function getContentLocaleOption(code: LocaleCode): ContentLocaleOption {
  const canonical = canonicalizeContentLocale(code) || code.trim();
  return commonLocalesByCode.get(canonical) ?? {
    code: canonical,
    nativeName: canonical,
    preset: false
  };
}

export function formatContentLocale(code: LocaleCode) {
  const option = getContentLocaleOption(code);
  return option.nativeName === option.code
    ? option.code
    : `${option.nativeName}（${option.code}）`;
}
