import { apiClient } from '@/composables/useApi';

type TranslateResponse = {
  translations?: unknown;
};

type MokelaySuccessResponse<T> = {
  ok: true;
  data: T;
};

type MokelayErrorResponse = {
  ok: false;
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

type MokelayApiResponse<T> = MokelaySuccessResponse<T> | MokelayErrorResponse;

export async function translateTextsToChinese(texts: string[]) {
  const uniqueTexts = [...new Set(texts.map((text) => text.trim()).filter(Boolean))];
  if (!uniqueTexts.length) {
    return {};
  }

  const response = await apiClient.post<MokelayApiResponse<TranslateResponse>>('/api/mokelay/ai-translate', {
    texts: uniqueTexts,
    sourceLanguage: 'English',
    targetLanguage: '中文'
  });
  const data = unwrapApiResponse(response.data);
  if (!isRecord(data.translations)) {
    throw new Error('Invalid translation response.');
  }

  const translations: Record<string, string> = {};
  Object.entries(data.translations).forEach(([source, translation]) => {
    if (typeof translation === 'string' && translation.trim()) {
      translations[source] = translation.trim();
    }
  });
  return translations;
}

function unwrapApiResponse<T>(value: MokelayApiResponse<T>): T {
  if (!isRecord(value)) {
    throw new Error('Invalid API response.');
  }

  if (value.ok === true) {
    return value.data as T;
  }

  if (value.ok === false) {
    const error = isRecord(value.error) ? value.error : {};
    const code = typeof error.code === 'string' ? error.code : '';
    const message = typeof error.message === 'string' ? error.message : '';
    throw new Error(message || code || 'Translation request failed.');
  }

  throw new Error('Invalid API response.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
