export const enMessages = {
  app: {
    title: 'Mokelay Editor',
    subtitle: 'Mokelay page configurator',
    darkMode: 'Dark mode',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
    home: 'Home',
    apps: 'Apps',
    datasources: 'Datasources',
    pageList: 'Pages',
    chinese: '中文',
    english: 'English'
  },
  editor: {
    placeholder: 'Start typing your content...',
    defaultParagraph: 'Welcome to the Mokelay editor starter template.',
    fullscreenEdit: 'Fullscreen',
    saveContent: 'Save',
    saving: 'Saving...',
    saveSuccess: 'Saved',
    saveFailed: 'Save failed. Please try again.',
    previewPage: 'Preview',
    properties: 'Properties',
    propertyDialogTitle: 'Property Settings',
    configJson: 'Config JSON',
    close: 'Close',
    invalidJson: 'Enter valid JSON.',
    events: {
      menu: 'Events',
      title: 'Event Settings',
      add: 'Add event',
      remove: 'Remove event',
      empty: 'No events yet.',
      fields: {
        event: 'Trigger event',
        block: 'Trigger block',
        method: 'Trigger method'
      }
    }
  },
  preview: {
    title: 'Config Preview',
    backToEditor: 'Back',
    emptyState: 'No page content yet.',
    modes: {
      pc: 'PC',
      h5: 'H5',
      ios: 'IOS',
      android: 'Android'
    },
    qrCodeAlt: 'Preview QR code',
    qrCodeLoading: 'Generating QR code...',
    qrCodeFailed: 'Failed to generate QR code. Please try again later.',
    qrCodeUnavailable: 'Save the page before generating an iOS preview QR code.',
    qrCodePlaceholder: 'This is a temporary QR code and will be replaced when mobile preview is live.',
    iosQrCode: 'IOS preview QR code',
    androidQrCode: 'Android preview QR code',
    iosQrCodeDescription: 'Scan with the Mokelay iOS app to open the current preview page.',
    androidQrCodeDescription: 'This is a temporary QR code and will be replaced when Android preview is live.'
  },
  globalCalls: {
    ok: 'OK',
    cancel: 'Cancel',
    alertRoleLabel: 'Alert',
    confirmRoleLabel: 'Confirm',
    messageRoleLabel: 'Message'
  },
  input: {
    toolboxTitle: 'Input',
    defaultPlaceholder: 'Please enter...',
    propertyPanelTitle: 'Input Properties',
    properties: {
      placeholder: 'Placeholder',
      value: 'Default value',
      valuePlaceholder: 'Please enter a default value'
    }
  },
  link: {
    toolboxTitle: 'Link',
    defaultText: 'Link',
    defaultUrl: 'https://mokelay.com',
    propertyPanelTitle: 'Link Properties',
    properties: {
      text: 'Link text',
      url: 'Link URL',
      open: 'Open in new page'
    }
  },
  advanceInput: {
    toolboxTitle: 'Advanced Input'
  },
  dividerLine: {
    toolboxTitle: 'Divider'
  },
  chart: {
    toolboxTitle: 'Chart',
    propertyPanelTitle: 'Chart Properties',
    defaultSeriesName: 'Data',
    types: {
      line: 'Line chart',
      bar: 'Bar chart',
      pie: 'Pie chart'
    },
    properties: {
      type: 'Chart type',
      xAxis: 'X-axis data',
      series: 'Series data'
    },
    validation: {
      invalidJson: 'Enter valid JSON.'
    }
  },
  editorSelector: {
    toolboxTitle: 'Component Selector',
    placeholder: 'Select a component'
  },
  form: {
    toolboxTitle: 'Form',
    placeholder: 'Add a form item'
  },
  advanceTable: {
    toolboxTitle: 'Advanced Table',
    propertyPanelTitle: 'Advanced Table Properties',
    defaultColumnName: 'Column',
    empty: 'No data',
    selectAll: 'Select all',
    selectRow: 'Select row',
    properties: {
      index: 'Show index column',
      selection: 'Show selection column'
    },
    defaultColumns: {
      name: 'Name',
      status: 'Status',
      tag: 'Tag',
      owner: 'Owner',
      link: 'Link'
    },
    defaultRows: {
      first: {
        name: 'Mokelay Page',
        status: 'Designing',
        tag: 'Design',
        owner: 'Product Team',
        linkText: 'Website',
        linkUrl: 'https://mokelay.com'
      },
      second: {
        name: 'Advanced Table',
        status: 'Previewable',
        tag: 'Preview',
        owner: 'Editor Team',
        linkText: 'Docs',
        linkUrl: 'https://editor.mokelay.com'
      }
    }
  },
  datasource: {
    toolboxTitle: 'Datasource Editor',
    title: 'Datasource',
    empty: 'No items',
    emptySchema: 'No field config yet. Click "Generate field config" first.',
    noSelectableFields: 'This schema does not contain selectable fields.',
    noFieldsMatchingPath: 'No fields match this path.',
    fields: {
      domain: 'API domain',
      path: 'API path',
      method: 'Method',
      importSource: 'Import source',
      apiSource: 'API source',
      mokelayApi: 'Mokelay API',
      apifoxProject: 'APIFox project',
      apifoxApiId: 'API ID',
      key: 'Key',
      mock: 'Mock data',
      jsonSchema: 'JSON Schema',
      responseExample: 'Response example',
      responseExampleInput: 'JSON input',
      responseExamplePreview: 'Tree preview',
      responseExamplePreviewEmpty: 'Enter valid JSON to preview its tree structure',
      responseExamplePlaceholder: 'Enter a valid JSON response example',
      generatedFields: 'Fields',
      dataType: 'Data type',
      allDataTypes: 'All data types',
      pathDepth: 'Path depth',
      fieldPath: 'Field path',
      searchFieldsByPath: 'Search by field path',
      selectedFields: 'Selected fields',
      required: 'Required'
    },
    sections: {
      headers: 'Header',
      queries: 'Query',
      body: 'Body',
      importApi: 'Import API info',
      requestConfig: 'Request configuration',
      responseConfig: 'Response configuration',
      fieldSelection: 'Field selection'
    },
    actions: {
      add: 'Add',
      remove: 'Remove',
      refresh: 'Refresh',
      refreshing: 'Refreshing...',
      importApi: 'Import',
      importingApi: 'Importing...',
      captureResponseExample: 'Mock response example',
      capturingResponseExample: 'Capturing response example...',
      updateSchema: 'Update Schema',
      fullSchema: 'Full Schema'
    },
    help: {
      responseConfig: 'Capture or edit a response example, then manually update the response Schema.',
      fieldSelection: 'Choose the fields components should use.'
    },
    schemaTypes: {
      object: 'Object',
      array: 'List',
      string: 'Text',
      number: 'Number',
      boolean: 'Switch',
      null: 'Empty',
      union: 'Union'
    },
    componentHints: {
      text: 'Text',
      number: 'Number',
      switch: 'Switch',
      object: 'Object',
      array: 'List'
    },
    validation: {
      invalidJsonSchema: 'Enter a JSON Schema that matches the supported format.',
      invalidNumber: 'Enter a valid number.',
      invalidObject: 'Enter a valid JSON object.',
      invalidArray: 'Enter a valid JSON array.',
      invalidResponseExample: 'Enter a valid JSON response example.',
      missingResponseExample: 'Enter a response example first.',
      missingFile: 'Choose a file in Body.',
      fixBodyBeforeSchema: 'Fix Body mock data before parsing JSON Schema.',
      nonJsonResponse: 'The API response is not JSON.',
      invalidJsonResponse: 'The API response is not valid JSON.',
      apiRequestFailed: 'API request failed:',
      missingApiDomain: 'Choose an API domain.',
      apiDomainNotFound: 'Could not find the API domain.',
      invalidApiDomainList: 'The API domain list is invalid.',
      emptyArraySchema: 'Cannot infer JSON Schema from an empty array.',
      mixedArraySchema: 'The array contains incompatible types, so JSON Schema cannot be inferred.'
    },
    import: {
      apiSources: {
        user: 'User-created APIs',
        system: 'System APIs'
      },
      sources: {
        mokelay: 'Mokelay orchestration API',
        apifox: 'APIFox API'
      },
      placeholders: {
        apifoxApiId: 'Enter API ID'
      },
      emptyMokelayApis: 'No Mokelay APIs',
      emptyApifoxProjects: 'No APIFox projects',
      emptyApiDomains: 'No API domains',
      loadingApiDomains: 'Loading API domains...',
      selectApiDomain: 'Choose API domain',
      errors: {
        loadOptions: 'Failed to load import options.',
        missingApiJson: 'The API detail is missing apiJson and cannot be imported.',
        unsupportedMethod: 'The datasource only supports GET/POST. Cannot import method:',
        apifoxApiNotFound: 'Could not find the APIFox API.',
        apiDomainNotFound: 'No matching API domain was found. Add it to the domain list first.'
      }
    }
  },
  formItem: {
    toolboxTitle: 'Form Item',
    defaultLabelName: 'Field',
    propertyPanelTitle: 'Form Item Properties',
    emptyEditor: 'No editor selected',
    properties: {
      labelName: 'Field label',
      variableName: 'Variable name',
      editor: 'Editor',
      layout: 'Layout'
    },
    placeholders: {
      labelName: 'Enter field label',
      variableName: 'Enter variable name'
    },
    layouts: {
      vertical: 'Vertical',
      horizontal: 'Horizontal'
    }
  },
  tag: {
    toolboxTitle: 'Tag',
    defaultTagName: 'Tag',
    propertyPanelTitle: 'Tag Properties',
    properties: {
      tagName: 'Tag name',
      type: 'Type',
      size: 'Size',
      color: 'Custom color',
      colorPlaceholder: 'e.g. #409EFF',
      closable: 'Closable'
    },
    types: {
      default: 'Default',
      primary: 'Primary',
      success: 'Success',
      info: 'Info',
      warning: 'Warning',
      danger: 'Danger'
    },
    sizes: {
      default: 'Default',
      large: 'Large',
      medium: 'Medium',
      small: 'Small'
    }
  },
  page: {
    toolboxTitle: 'Page',
    loading: 'Loading page...',
    loadFailed: 'Failed to load page. Please try again.'
  },
  appList: {
    title: 'Apps',
    total: '{count} apps',
    createApp: 'Create app',
    loading: 'Loading apps...',
    empty: 'No apps yet. Create one to get started.',
    loadFailed: 'Failed to load apps. Please try again.',
    createFailed: 'Failed to create app. Please try again.',
    createSuccess: 'App created.',
    updateFailed: 'Failed to update app. Please try again.',
    updateSuccess: 'App updated.',
    createDialogTitle: 'Create app',
    editDialogTitle: 'Edit app',
    appUuid: 'UUID',
    uuidHint: 'Required, up to 8 characters.',
    appAlias: 'App name',
    appDescription: 'Description',
    saving: 'Saving...',
    save: 'Save',
    edit: 'Edit',
    pageRange: '{start}-{end} of {total}',
    pageRangeEmpty: 'No paginated data',
    currentPage: 'Page {page} / {totalPages}',
    previousPage: 'Previous',
    nextPage: 'Next',
    unnamedApp: 'Untitled app',
    aliasRequired: 'App name is required.',
    aliasTooLong: 'App name cannot exceed 120 characters.',
    uuidRequired: 'UUID is required.',
    uuidTooLong: 'UUID cannot exceed 8 characters.',
    columns: {
      id: 'ID',
      uuid: 'UUID',
      alias: 'Name',
      description: 'Description',
      actions: 'Actions'
    }
  },
  datasourceList: {
    title: 'Datasources',
    total: '{count} datasources',
    createDatasource: 'Create datasource',
    loading: 'Loading datasources...',
    empty: 'No datasources yet. Create one to get started.',
    loadFailed: 'Failed to load datasources. Please try again.',
    createFailed: 'Failed to create datasource. Please try again.',
    createSuccess: 'Datasource created.',
    updateFailed: 'Failed to update datasource. Please try again.',
    updateSuccess: 'Datasource updated.',
    syncFailed: 'Failed to sync schema. Check the database connection configuration.',
    syncSuccess: 'Schema synced.',
    createDialogTitle: 'Create datasource',
    editDialogTitle: 'Edit datasource',
    datasourceUuid: 'UUID',
    uuidHint: 'Required, up to 8 characters. Start with a letter or underscore; use letters, numbers, and underscores only.',
    datasourceAlias: 'Datasource name',
    datasourceDescription: 'Description',
    saving: 'Saving...',
    save: 'Save',
    edit: 'Edit',
    syncSchema: 'Sync schema',
    syncing: 'Syncing...',
    schemaNotSynced: 'Not synced',
    schemaTables: '{count} tables',
    pageRange: '{start}-{end} of {total}',
    pageRangeEmpty: 'No paginated data',
    currentPage: 'Page {page} / {totalPages}',
    previousPage: 'Previous',
    nextPage: 'Next',
    aliasRequired: 'Datasource name is required.',
    aliasTooLong: 'Datasource name cannot exceed 120 characters.',
    uuidRequired: 'UUID is required.',
    uuidTooLong: 'UUID cannot exceed 8 characters.',
    uuidInvalid: 'UUID must start with a letter or underscore and contain only letters, numbers, and underscores.',
    columns: {
      id: 'ID',
      uuid: 'UUID',
      alias: 'Name',
      description: 'Description',
      schema: 'Schema',
      actions: 'Actions'
    }
  },
  pageList: {
    title: 'Pages',
    total: '{count} pages',
    createPage: 'Create page',
    loading: 'Loading pages...',
    empty: 'No pages yet. Create one to get started.',
    loadFailed: 'Failed to load pages. Please try again.',
    createFailed: 'Failed to create page. Please try again.',
    createDialogTitle: 'Create page',
    pageName: 'Page name',
    creating: 'Creating...',
    saveAndOpen: 'Save and open',
    open: 'Open',
    delete: 'Delete',
    deleting: 'Deleting...',
    deleteDialogTitle: 'Delete page',
    deleteDialogContent: 'Delete "{name}"? This action cannot be undone.',
    deleteSuccess: 'Page deleted.',
    deleteFailed: 'Failed to delete page. Please try again.',
    deleteNotFound: 'Page not found or already deleted.',
    pageRange: '{start}-{end} of {total}',
    pageRangeEmpty: 'No paginated data',
    currentPage: 'Page {page} / {totalPages}',
    previousPage: 'Previous',
    nextPage: 'Next',
    backToList: 'Back to page list',
    unnamedPage: 'Untitled page',
    nameRequired: 'Page name is required.',
    nameTooLong: 'Page name cannot exceed 120 characters.',
    columns: {
      name: 'Name',
      uuid: 'UUID',
      blocks: 'Blocks',
      createdAt: 'Created',
      updatedAt: 'Updated',
      actions: 'Actions'
    }
  },
} as const;

export const enEditorJsMessages = {} as const;
