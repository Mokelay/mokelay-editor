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
    saving: '保存中...',
    saveSuccess: '保存成功',
    saveFailed: '保存失败，请稍后重试',
    previewPage: '预览',
    properties: '属性',
    propertyDialogTitle: '属性设置',
    configJson: '配置 JSON',
    close: '关闭',
    invalidJson: '请输入有效 JSON。'
  },
  preview: {
    title: '配置预览',
    backToEditor: '返回',
    emptyState: '暂无页面内容。'
  },
  globalCalls: {
    ok: '确定',
    cancel: '取消',
    alertRoleLabel: '提示',
    confirmRoleLabel: '确认',
    messageRoleLabel: '消息'
  },
  input: {
    toolboxTitle: '输入框',
    defaultPlaceholder: '请输入.....',
    propertyPanelTitle: '输入框属性',
    properties: {
      placeholder: '占位提示',
      value: '默认值',
      valuePlaceholder: '请输入默认值'
    }
  },
  link: {
    toolboxTitle: '链接',
    defaultText: '链接',
    defaultUrl: 'https://mokelay.com',
    propertyPanelTitle: '链接属性',
    properties: {
      text: '链接文本',
      url: '链接地址',
      open: '新页面打开'
    }
  },
  advanceInput: {
    toolboxTitle: '高级输入框'
  },
  dividerLine: {
    toolboxTitle: '分割线'
  },
  chart: {
    toolboxTitle: '图表',
    propertyPanelTitle: '图表属性',
    defaultSeriesName: '数据',
    types: {
      line: '折线图',
      bar: '柱状图',
      pie: '饼图'
    },
    properties: {
      type: '图表类型',
      xAxis: '横坐标数据',
      series: '图表数据'
    },
    validation: {
      invalidJson: '请输入有效 JSON。'
    }
  },
  editorSelector: {
    toolboxTitle: '组件选择器',
    placeholder: '选择组件'
  },
  form: {
    toolboxTitle: '表单',
    placeholder: '添加表单项'
  },
  advanceTable: {
    toolboxTitle: '高级表格',
    propertyPanelTitle: '高级表格属性',
    defaultColumnName: '列',
    empty: '暂无数据',
    selectAll: '全选',
    selectRow: '选择行',
    properties: {
      index: '显示序号列',
      selection: '显示多选列'
    },
    defaultColumns: {
      name: '名称',
      status: '状态',
      tag: '标签',
      owner: '负责人',
      link: '链接'
    },
    defaultRows: {
      first: {
        name: 'Mokelay 页面',
        status: '设计中',
        tag: '设计',
        owner: '产品团队',
        linkText: '官网',
        linkUrl: 'https://mokelay.com'
      },
      second: {
        name: '高级表格',
        status: '可预览',
        tag: '预览',
        owner: '编辑器团队',
        linkText: '文档',
        linkUrl: 'https://editor.mokelay.com'
      }
    }
  },
  datasource: {
    toolboxTitle: '数据源编辑器',
    title: '数据源',
    empty: '暂无配置项',
    emptySchema: '还没有字段配置，请先点击“生成字段配置”。',
    noListRecord: '当前 Schema 中没有可作为列表数据的数组字段。',
    noFormFields: '当前 Schema 中没有可用于表单的普通字段。',
    fields: {
      type: '数据源类型',
      rawData: 'JSON 数据',
      domain: 'API 域名',
      path: 'API Path',
      method: '调用方法',
      key: 'Key',
      mock: 'Mock 数据',
      jsonSchema: 'JSON Schema',
      generatedFields: '字段数',
      searchFields: '搜索字段名称或路径',
      recordPath: '列表数据位置',
      rootRecordPath: '根数据',
      selectedFields: '已选择字段',
      required: '必填'
    },
    sections: {
      headers: 'Header',
      queries: 'Query',
      body: 'Body',
      generateFields: '生成字段配置',
      fieldSelection: '字段选择'
    },
    actions: {
      add: '添加',
      remove: '删除',
      parseJsonSchema: '解析JSON Schema',
      parsingJsonSchema: '解析中...',
      generateFields: '生成字段配置',
      generatingFields: '生成中...'
    },
    tabs: {
      list: '列表字段',
      form: '表单字段',
      advanced: '高级 Schema'
    },
    help: {
      generateFields: '从 JSON 数据或 API 响应中识别字段，生成给列表和表单使用的配置。',
      fieldSelection: '勾选需要给组件使用的字段，可以直接改成业务同学看得懂的名称。'
    },
    schemaTypes: {
      object: '对象',
      array: '列表',
      string: '文本',
      number: '数字',
      boolean: '开关',
      null: '空值',
      union: '联合'
    },
    componentHints: {
      text: '文本',
      number: '数字',
      switch: '开关',
      object: '对象',
      array: '列表'
    },
    validation: {
      invalidJson: '请输入标准 JSON 结构。',
      invalidJsonSchema: '请输入符合数据格式的 JSON Schema。',
      invalidNumber: '请输入有效数字。',
      invalidObject: '请输入标准 JSON 对象。',
      invalidArray: '请输入标准 JSON 数组。',
      fixJsonBeforeSchema: '请先修正 JSON 数据。',
      fixBodyBeforeSchema: '请先修正 Body 中的 Mock 数据。',
      nonJsonResponse: 'API 响应不是 JSON 数据。',
      invalidJsonResponse: 'API 响应不是有效 JSON 数据。',
      apiRequestFailed: 'API 请求失败：',
      emptyArraySchema: '空数组无法推断 JSON Schema。',
      mixedArraySchema: '数组中包含无法合并的类型，无法推断 JSON Schema。'
    }
  },
  formItem: {
    toolboxTitle: '表单项',
    defaultLabelName: '字段',
    propertyPanelTitle: '表单项属性',
    emptyEditor: '未选择编辑器',
    properties: {
      labelName: '字段文本',
      variableName: '变量名',
      editor: '编辑器',
      layout: '布局方式'
    },
    placeholders: {
      labelName: '请输入字段文本',
      variableName: '请输入变量名'
    },
    layouts: {
      vertical: '垂直',
      horizontal: '水平'
    }
  },
  tag: {
    toolboxTitle: '标签',
    defaultTagName: '标签',
    propertyPanelTitle: '标签属性',
    properties: {
      tagName: '标签内容',
      type: '标签类型',
      size: '标签尺寸',
      color: '自定义颜色',
      colorPlaceholder: '例如：#409EFF',
      closable: '可关闭'
    },
    types: {
      default: '默认',
      primary: '主要',
      success: '成功',
      info: '信息',
      warning: '警告',
      danger: '危险'
    },
    sizes: {
      default: '默认',
      large: '大',
      medium: '中',
      small: '小'
    }
  },
  page: {
    toolboxTitle: '页面',
    loading: '正在读取页面...',
    loadFailed: '页面读取失败，请稍后重试。'
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
