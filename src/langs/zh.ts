export const zhMessages = {
  app: {
    title: 'Mokelay Editor',
    subtitle: 'Mokelay页面配置器',
    darkMode: '深色模式',
    dark: '深色',
    light: '浅色',
    language: '语言',
    chinese: '中文',
    english: 'English'
  },
  editor: {
    placeholder: '开始输入你的内容...',
    defaultParagraph: '欢迎使用 Mokelay 编辑器初始化模板。',
    fullscreenEdit: '全屏编辑',
    saveContent: '保存',
    previewPage: '预览',
    properties: '属性',
    propertyDialogTitle: '属性设置',
    configJson: '配置 JSON',
    close: '关闭'
  },
  preview: {
    title: '配置预览',
    backToEditor: '返回',
    emptyState: '未找到已保存配置，请先在编辑器点击“保存”。'
  },
  input: {
    toolboxTitle: '输入框',
    defaultLabel: '字段名称',
    defaultPlaceholder: '请输入.....',
    editLabelPlaceholder: '字段标签（示例：用户名）',
    propertyPanelTitle: '输入框属性',
    properties: {
      label: '字段标签',
      placeholder: '占位提示',
      value: '默认值',
      valuePlaceholder: '请输入默认值'
    }
  },
  advanceInput: {
    toolboxTitle: '高级输入框',
    defaultLabel: '高级字段',
    defaultPlaceholder: '输入 @、/、# 触发建议...',
    editLabelPlaceholder: '字段标签（示例：审批意见）',
    propertyPanelTitle: '高级输入框属性',
    componentTag: '组件',
    customPreviewTitle: '内嵌组件预览',
    properties: {
      label: '字段标签',
      placeholder: '占位提示',
      atOptions: '@ 触发列表(JSON数组)',
      slashOptions: '/ 触发列表(JSON数组)',
      hashOptions: '# 触发列表(JSON数组)'
    }
  },
  page: {
    toolboxTitle: '页面'
  },
} as const;

export const zhEditorJsMessages = {
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
    Link: '链接',
    Columns: '分栏'
  },
} as const;
