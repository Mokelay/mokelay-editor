export const enMessages = {
  app: {
    title: 'Mokelay Editor',
    subtitle: 'Mokelay page configurator',
    darkMode: 'Dark mode',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
    home: 'Home',
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
    noListRecord: 'This schema does not contain an array field for list data.',
    noFormFields: 'This schema does not contain simple fields for a form.',
    fields: {
      type: 'Datasource type',
      rawData: 'JSON data',
      domain: 'API domain',
      path: 'API path',
      method: 'Method',
      key: 'Key',
      mock: 'Mock data',
      jsonSchema: 'JSON Schema',
      generatedFields: 'Fields',
      searchFields: 'Search fields or paths',
      recordPath: 'List data path',
      rootRecordPath: 'Root data',
      selectedFields: 'Selected fields',
      required: 'Required'
    },
    sections: {
      headers: 'Header',
      queries: 'Query',
      body: 'Body',
      generateFields: 'Generate field config',
      fieldSelection: 'Field selection'
    },
    actions: {
      add: 'Add',
      remove: 'Remove',
      parseJsonSchema: 'Parse JSON Schema',
      parsingJsonSchema: 'Parsing...',
      generateFields: 'Generate field config',
      generatingFields: 'Generating...'
    },
    tabs: {
      list: 'List fields',
      form: 'Form fields',
      advanced: 'Advanced Schema'
    },
    help: {
      generateFields: 'Detect fields from JSON data or an API response, then prepare them for list and form components.',
      fieldSelection: 'Choose the fields components should use, and rename them with business-friendly labels.'
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
      invalidJson: 'Enter valid JSON.',
      invalidJsonSchema: 'Enter a JSON Schema that matches the supported format.',
      invalidNumber: 'Enter a valid number.',
      invalidObject: 'Enter a valid JSON object.',
      invalidArray: 'Enter a valid JSON array.',
      missingFile: 'Choose a file in Body.',
      fixJsonBeforeSchema: 'Fix JSON data before parsing JSON Schema.',
      fixBodyBeforeSchema: 'Fix Body mock data before parsing JSON Schema.',
      nonJsonResponse: 'The API response is not JSON.',
      invalidJsonResponse: 'The API response is not valid JSON.',
      apiRequestFailed: 'API request failed:',
      emptyArraySchema: 'Cannot infer JSON Schema from an empty array.',
      mixedArraySchema: 'The array contains incompatible types, so JSON Schema cannot be inferred.'
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
