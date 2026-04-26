import { enEditorJsMessages, enMessages } from '@/langs/en';
import { zhEditorJsMessages, zhMessages } from '@/langs/zh';

export const localeMessages = {
  zh: zhMessages,
  en: enMessages
} as const;

export const editorJsLocaleMessages = {
  zh: zhEditorJsMessages,
  en: enEditorJsMessages
} as const;
