export const zhMessages = {
  app: {
    title: 'Mokelay Editor',
    subtitle: 'Mokelay页面配置器',
    darkMode: '深色模式',
    dark: '深色',
    light: '浅色',
    language: '语言',
    home: '首页',
    apps: 'Apps',
    pageList: '页面列表',
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
    invalidJson: '请输入有效 JSON。',
    events: {
      menu: '事件',
      title: '事件设置',
      add: '添加事件',
      remove: '删除事件',
      empty: '暂无事件。',
      fields: {
        event: '触发事件 event',
        block: '触发组件 block',
        method: '触发方法 method'
      }
    }
  },
  preview: {
    title: '配置预览',
    backToEditor: '返回',
    emptyState: '暂无页面内容。',
    modes: {
      pc: 'PC',
      h5: 'H5',
      ios: 'IOS',
      android: 'Android'
    },
    qrCodeAlt: '预览二维码',
    qrCodeLoading: '二维码生成中...',
    qrCodeFailed: '二维码生成失败，请稍后重试。',
    qrCodeUnavailable: '请先保存页面，再生成 iOS 预览二维码。',
    qrCodePlaceholder: '当前为临时二维码，移动端上线后将替换为真实入口。',
    iosQrCode: 'IOS 预览二维码',
    androidQrCode: 'Android 预览二维码',
    iosQrCodeDescription: '使用 Mokelay iOS App 扫码打开当前预览页。',
    androidQrCodeDescription: '当前为临时二维码，Android 端上线后将替换为真实入口。'
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
      importSource: '导入来源',
      mokelayApi: 'Mokelay API',
      apifoxProject: 'APIFox 项目',
      apifoxApiId: 'API ID',
      key: 'Key',
      mock: 'Mock 数据',
      jsonSchema: 'JSON Schema',
      responseExample: '响应示例数据',
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
      importApi: '导入 API 信息',
      generateFields: '生成字段配置',
      fieldSelection: '字段选择'
    },
    actions: {
      add: '添加',
      remove: '删除',
      refresh: '刷新',
      refreshing: '刷新中...',
      importApi: '导入',
      importingApi: '导入中...',
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
      missingFile: '请选择 Body 中的文件。',
      fixJsonBeforeSchema: '请先修正 JSON 数据。',
      fixBodyBeforeSchema: '请先修正 Body 中的 Mock 数据。',
      nonJsonResponse: 'API 响应不是 JSON 数据。',
      invalidJsonResponse: 'API 响应不是有效 JSON 数据。',
      apiRequestFailed: 'API 请求失败：',
      missingApiDomain: '请选择 API 域名。',
      apiDomainNotFound: '没有找到对应的 API 域名。',
      invalidApiDomainList: 'API 域名列表无效。',
      emptyArraySchema: '空数组无法推断 JSON Schema。',
      mixedArraySchema: '数组中包含无法合并的类型，无法推断 JSON Schema。'
    },
    import: {
      sources: {
        mokelay: 'Mokelay 编排接口',
        apifox: 'APIFox 接口'
      },
      placeholders: {
        apifoxApiId: '请输入 API ID'
      },
      emptyMokelayApis: '暂无 Mokelay API',
      emptyApifoxProjects: '暂无 APIFox 项目',
      emptyApiDomains: '暂无 API 域名',
      loadingApiDomains: '加载 API 域名中...',
      selectApiDomain: '请选择 API 域名',
      errors: {
        loadOptions: '加载导入选项失败。',
        missingApiJson: 'API 详情缺少 apiJson，无法导入。',
        unsupportedMethod: '当前数据源只支持 GET/POST，无法导入方法：',
        apifoxApiNotFound: '没有找到对应的 APIFox API。',
        apiDomainNotFound: '没有找到匹配的 API 域名，请先维护域名列表。'
      }
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
  appList: {
    title: 'App 列表',
    total: '共 {count} 个 App',
    createApp: '创建 App',
    loading: '正在加载 App 列表...',
    empty: '暂无 App，可以先创建一个 App。',
    loadFailed: 'App 列表加载失败，请稍后重试。',
    createFailed: 'App 创建失败，请稍后重试。',
    createSuccess: 'App 已创建。',
    createDialogTitle: '创建 App',
    appAlias: 'App 名称',
    appDescription: '描述',
    creating: '创建中...',
    save: '保存',
    pageRange: '第 {start}-{end} 条，共 {total} 条',
    pageRangeEmpty: '暂无分页数据',
    currentPage: '第 {page} / {totalPages} 页',
    previousPage: '上一页',
    nextPage: '下一页',
    unnamedApp: '未命名 App',
    aliasRequired: 'App 名称不能为空。',
    aliasTooLong: 'App 名称不能超过 120 个字符。',
    columns: {
      id: 'ID',
      uuid: 'UUID',
      alias: '名称',
      description: '描述'
    }
  },
  pageList: {
    title: '页面列表',
    total: '共 {count} 个页面',
    createPage: '创建页面',
    loading: '正在加载页面列表...',
    empty: '暂无页面，可以先创建一个页面。',
    loadFailed: '页面列表加载失败，请稍后重试。',
    createFailed: '页面创建失败，请稍后重试。',
    createDialogTitle: '创建页面',
    pageName: '页面名称',
    creating: '创建中...',
    saveAndOpen: '保存并打开',
    open: '打开',
    delete: '删除',
    deleting: '删除中...',
    deleteDialogTitle: '删除页面',
    deleteDialogContent: '确定删除页面「{name}」？此操作不可恢复。',
    deleteSuccess: '页面已删除。',
    deleteFailed: '页面删除失败，请稍后重试。',
    deleteNotFound: '页面不存在或已被删除。',
    pageRange: '第 {start}-{end} 条，共 {total} 条',
    pageRangeEmpty: '暂无分页数据',
    currentPage: '第 {page} / {totalPages} 页',
    previousPage: '上一页',
    nextPage: '下一页',
    backToList: '返回页面列表',
    unnamedPage: '未命名页面',
    nameRequired: '页面名称不能为空。',
    nameTooLong: '页面名称不能超过 120 个字符。',
    columns: {
      name: '名称',
      uuid: 'UUID',
      blocks: 'Block 数',
      createdAt: '创建时间',
      updatedAt: '最近编辑',
      actions: '操作'
    }
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
