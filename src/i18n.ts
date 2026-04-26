import { computed, readonly, ref } from 'vue';

type Locale = 'zh' | 'en';

const messages = {
  zh: {
    app: {
      title: 'Mokelay Editor',
      subtitle: 'Mokelay页面配置器',
      darkMode: '深色模式',
      language: '语言',
      chinese: '中文',
      english: 'English'
    },
    editor: {
      placeholder: '开始输入你的内容...',
      defaultParagraph: '欢迎使用 Mokelay 编辑器初始化模板。',
      fullscreenEdit: '全屏编辑',
      saveContent: '保存内容',
      previewPage: '预览页面',
      configJson: '配置 JSON',
      close: '关闭'
    },
    preview: {
      title: '配置预览',
      backToEditor: '返回编辑器',
      emptyState: '未找到已保存配置，请先在编辑器点击“保存内容”。'
    },
    input: {
      toolboxTitle: '输入框',
      defaultLabel: '字段名称',
      defaultPlaceholder: '请输入.....',
      editLabelPlaceholder: '字段标签（示例：用户名）'
    }
  },
  en: {
    app: {
      title: 'Mokelay Editor',
      subtitle: 'Mokelay page configurator',
      darkMode: 'Dark mode',
      language: 'Language',
      chinese: '中文',
      english: 'English'
    },
    editor: {
      placeholder: 'Start typing your content...',
      defaultParagraph: 'Welcome to the Mokelay editor starter template.',
      fullscreenEdit: 'Fullscreen',
      saveContent: 'Save content',
      previewPage: 'Preview',
      configJson: 'Config JSON',
      close: 'Close'
    },
    preview: {
      title: 'Config Preview',
      backToEditor: 'Back to editor',
      emptyState: 'No saved config found. Please click "Save content" in the editor first.'
    },
    input: {
      toolboxTitle: 'Input',
      defaultLabel: 'Field name',
      defaultPlaceholder: 'Please enter...',
      editLabelPlaceholder: 'Field label (e.g. Username)'
    }
  }
} as const;

const currentLocale = ref<Locale>(navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

function getMessage(path: string): string {
  const parts = path.split('.');
  let value: unknown = messages[currentLocale.value];

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
  if (locale === 'zh') {
    return {
      ui: {
        blockTunes: {
          toggler: {
            'Click to tune': '点击设置',
            'or drag to move': '或拖拽移动'
          }
        },
        inlineToolbar: {
          converter: {
            'Convert to': '转换为'
          }
        },
        toolbar: {
          toolbox: {
            Add: '添加'
          }
        },
        popover: {
          Filter: '筛选',
          'Nothing found': '未找到结果'
        }
      },
      blockTunes: {
        delete: {
          Delete: '删除'
        },
        moveUp: {
          'Move up': '上移'
        },
        moveDown: {
          'Move down': '下移'
        }
      },
      toolNames: {
        Text: '文本',
        Heading: '标题',
        List: '列表',
        Warning: '提示',
        Checklist: '清单',
        Quote: '引用',
        Delimiter: '分割线',
        Table: '表格',
        Link: '链接'
      }
    };
  }

  return {};
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
