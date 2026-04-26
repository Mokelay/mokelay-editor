import { MOKELAY_CONFIG_STORAGE_KEY } from '@/constants/storage';

export function getInitialEditorBlocks(t: (key: string) => string) {
  const cache = localStorage.getItem(MOKELAY_CONFIG_STORAGE_KEY);
  if (!cache) {
    return [
      {
        type: 'paragraph',
        data: {
          text: t('editor.defaultParagraph')
        }
      }
    ];
  }

  try {
    const parsed = JSON.parse(cache) as { blocks?: Array<Record<string, unknown>> };
    return Array.isArray(parsed.blocks) ? parsed.blocks : [];
  } catch {
    return [
      {
        type: 'paragraph',
        data: {
          text: t('editor.defaultParagraph')
        }
      }
    ];
  }
}
