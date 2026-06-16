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
    datasources: '数据源',
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
    settingsDialogTitle: '数据源设置',
    empty: '暂无配置项',
    emptySchema: '还没有字段配置，请先选择一条响应数据的 Schema。',
    emptySelectedFields: '暂无已选择字段。',
    noSelectableFields: '当前 Schema 中没有可选择的字段。',
    noFieldsMatchingPath: '没有匹配该路径的字段。',
    summary: {
      domain: '域名',
      path: 'Path',
      method: '方法',
      emptyDomain: '未选择域名',
      emptyPath: '未设置 Path',
      emptyMethod: '未设置方法'
    },
    fields: {
      domain: 'API 域名',
      path: 'API Path',
      method: '调用方法',
      importSource: '导入来源',
      apiSource: '接口来源',
      mokelayApi: 'Mokelay API',
      apifoxProject: 'APIFox 项目',
      apifoxApiId: 'API ID',
      key: 'Key',
      value: '值',
      mock: 'Mock 数据',
      jsonSchema: 'JSON Schema',
      responseExample: '响应示例数据',
      responseExampleInput: 'JSON 输入',
      responseExamplePreview: '树形预览',
      responseExamplePreviewEmpty: '输入有效 JSON 后将在这里展示树形结构',
      responseExamplePlaceholder: '请输入有效的 JSON 响应示例数据',
      generatedFields: '字段数',
      dataType: '数据类型',
      allDataTypes: '全部数据类型',
      pathDepth: '路径深度',
      fieldPath: '字段路径',
      searchFieldsByPath: '按字段路径搜索',
      selectedFields: '已选择字段',
      availableFields: '可选择字段',
      required: '必填'
    },
    sections: {
      headers: 'Header',
      queries: 'Query',
      body: 'Body',
      importApi: '导入 API 信息',
      requestConfig: '请求配置',
      responseConfig: '响应配置',
      fieldSelection: '字段选择'
    },
    actions: {
      add: '添加',
      added: '已添加',
      remove: '删除',
      refresh: '刷新',
      refreshing: '刷新中...',
      settings: '数据源设置',
      importApi: '导入',
      importingApi: '导入中...',
      addResponseExample: '添加响应数据',
      cancel: '取消',
      capture: '抓取',
      captureResponseExample: 'Mock抓取响应示例数据',
      capturingResponseExample: '正在抓取响应示例数据...',
      selectSchema: '选择该 Schema',
      translateFields: '翻译为中文',
      translatingFields: '翻译中...',
      previewField: '预览',
      fullSchema: '完整 Schema'
    },
    responseMock: {
      title: '配置请求 Mock 数据',
      help: '填写本次抓取使用的临时 Mock 数据。这些数据只用于请求，不会覆盖请求配置中的值。'
    },
    help: {
      responseConfig: '抓取或编写响应示例数据，并选择其中一条生成字段配置。',
      fieldSelection: '从可选择字段中添加需要给组件使用的字段。'
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
    processors: {
      dialogTitle: '字段处理器',
      add: '添加处理器',
      apply: '应用',
      configure: '配置处理器',
      view: '查看处理器',
      count: '{count} 个处理器',
      empty: '暂未配置处理器。',
      up: '上移',
      down: '下移',
      unsupported: '该处理器当前无法识别，配置会被保留，也可以删除。',
      incompatible: '该处理器与当前字段类型不兼容，配置会被保留，也可以删除。',
      preview: {
        title: '字段数据预览',
        example: '响应示例数据',
        unavailable: '不可用',
        noExamples: '暂无有效的响应示例数据，请先添加或修正响应数据。',
        finalValue: '最终呈现数据',
        finalValueHelp: '按字段路径提取并执行 Processor 后，组件将获得的数据。',
        extractedValue: 'Processor 处理前数据',
        extractedValueHelp: '仅按字段路径从响应示例中提取的数据。',
        pathNotFound: '当前响应示例中不存在该字段路径。',
        invalidPath: '字段路径格式无效，无法预览。',
        invalidResult: 'Processor 返回了无法展示的非 JSON 数据。',
        unsupportedProcessor: '字段包含无法识别的 Processor，暂时无法生成预览。',
        invalidProcessor: 'Processor 配置无效，暂时无法生成预览。',
        failed: '字段数据预览失败。'
      },
      trim: {
        title: '去除首尾空格',
        description: '字符串会去除首尾空格，其他数据类型保持原值。'
      },
      mergeData: {
        title: '合并数据',
        description: '为对象或列表项浅合并字段。',
        fields: { data: '合并字段（JSON 对象）' }
      },
      filter: {
        title: '列表过滤',
        description: '按条件过滤列表数据。',
        addCondition: '添加条件',
        empty: '没有过滤条件时将保留所有列表项。',
        fields: {
          type: '条件关系',
          variable: '字段路径',
          condition: '判断条件',
          value: '比较值（JSON）'
        },
        conditions: {
          eq: '等于',
          gt: '大于',
          lt: '小于',
          is_empty: '为空',
          is_not_empty: '不为空'
        }
      },
      dateTimeFormat: {
        title: '日期时间格式化',
        description: '按浏览器本地时区格式化日期时间。',
        custom: '自定义',
        fields: { preset: '预设格式', format: '格式' }
      },
      validation: {
        required: '此项不能为空。',
        jsonObject: '请输入有效的 JSON 对象。'
      }
    },
    validation: {
      invalidJsonSchema: '请输入符合数据格式的 JSON Schema。',
      invalidNumber: '请输入有效数字。',
      invalidObject: '请输入标准 JSON 对象。',
      invalidArray: '请输入标准 JSON 数组。',
      invalidResponseExample: '请输入有效的 JSON 响应示例数据。',
      missingResponseExample: '请先填写响应示例数据。',
      missingFile: '请选择 Body 中的文件。',
      fixBodyBeforeSchema: '请先修正 Body 中的 Mock 数据。',
      fixMockBeforeCapture: '请先修正请求 Mock 数据。',
      nonJsonResponse: 'API 响应不是 JSON 数据。',
      invalidJsonResponse: 'API 响应不是有效 JSON 数据。',
      apiRequestFailed: 'API 请求失败：',
      missingApiDomain: '请选择 API 域名。',
      apiDomainNotFound: '没有找到对应的 API 域名。',
      invalidApiDomainList: 'API 域名列表无效。',
      emptyArraySchema: '空数组无法推断 JSON Schema。',
      mixedArraySchema: '数组中包含无法合并的类型，无法推断 JSON Schema。',
      translateFieldsFailed: '字段翻译失败，请稍后重试。'
    },
    import: {
      apiSources: {
        user: '用户创建接口',
        system: '系统接口'
      },
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
  fieldsEditor: {
    toolboxTitle: '字段编辑器',
    settingsDialogTitle: '字段设置',
    empty: '暂无字段，可以手动添加或从接口导入。',
    summary: {
      savedCount: '已设置 {count} 个字段',
      selectedCount: '已选择 {count} 个字段'
    },
    sections: {
      importApi: '导入字段',
      fields: '字段列表'
    },
    columns: {
      selected: '选择',
      label: '字段名称',
      variable: '变量',
      dataType: '数据类型',
      actions: '操作'
    },
    placeholders: {
      label: '请输入字段名称',
      variable: '请输入变量名'
    },
    actions: {
      settings: '设置字段',
      add: '添加字段',
      remove: '删除',
      save: '保存',
      cancel: '取消',
      captureResponseFields: 'Mock抓取响应字段',
      capturingResponseFields: '正在抓取响应字段...'
    },
    help: {
      importApi: '从接口参数导入字段，或在导入接口后抓取响应字段。'
    },
    validation: {
      required: '已选择字段的字段名称和变量不能为空。',
      duplicateVariable: '已选择字段的变量不能重复。',
      missingImportedApi: '请先导入接口信息。'
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
    updateFailed: 'App 修改失败，请稍后重试。',
    updateSuccess: 'App 已修改。',
    createDialogTitle: '创建 App',
    editDialogTitle: '编辑 App',
    appUuid: 'UUID',
    uuidHint: '必填，最多 8 个字符。',
    appAlias: 'App 名称',
    appDescription: '描述',
    saving: '保存中...',
    save: '保存',
    edit: '编辑',
    pageRange: '第 {start}-{end} 条，共 {total} 条',
    pageRangeEmpty: '暂无分页数据',
    currentPage: '第 {page} / {totalPages} 页',
    previousPage: '上一页',
    nextPage: '下一页',
    unnamedApp: '未命名 App',
    aliasRequired: 'App 名称不能为空。',
    aliasTooLong: 'App 名称不能超过 120 个字符。',
    uuidRequired: 'UUID 不能为空。',
    uuidTooLong: 'UUID 不能超过 8 个字符。',
    columns: {
      id: 'ID',
      uuid: 'UUID',
      alias: '名称',
      description: '描述',
      actions: '操作'
    }
  },
  datasourceList: {
    title: '数据源列表',
    total: '共 {count} 个数据源',
    createDatasource: '创建数据源',
    loading: '正在加载数据源列表...',
    empty: '暂无数据源，可以先创建一个数据源。',
    loadFailed: '数据源列表加载失败，请稍后重试。',
    createFailed: '数据源创建失败，请稍后重试。',
    createSuccess: '数据源已创建。',
    updateFailed: '数据源修改失败，请稍后重试。',
    updateSuccess: '数据源已修改。',
    syncFailed: 'Schema 同步失败，请检查数据库连接配置。',
    syncSuccess: 'Schema 已同步。',
    createDialogTitle: '创建数据源',
    editDialogTitle: '编辑数据源',
    datasourceUuid: 'UUID',
    uuidHint: '必填，最多 8 位；字母或下划线开头，只能包含字母、数字和下划线。',
    datasourceAlias: '数据源名称',
    datasourceDescription: '描述',
    saving: '保存中...',
    save: '保存',
    edit: '编辑',
    syncSchema: '同步 Schema',
    syncing: '同步中...',
    schemaNotSynced: '未同步',
    schemaTables: '{count} 张表',
    pageRange: '第 {start}-{end} 条，共 {total} 条',
    pageRangeEmpty: '暂无分页数据',
    currentPage: '第 {page} / {totalPages} 页',
    previousPage: '上一页',
    nextPage: '下一页',
    aliasRequired: '数据源名称不能为空。',
    aliasTooLong: '数据源名称不能超过 120 个字符。',
    uuidRequired: 'UUID 不能为空。',
    uuidTooLong: 'UUID 不能超过 8 个字符。',
    uuidInvalid: 'UUID 必须以字母或下划线开头，且只能包含字母、数字和下划线。',
    columns: {
      id: 'ID',
      uuid: 'UUID',
      alias: '名称',
      description: '描述',
      schema: 'Schema',
      actions: '操作'
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
