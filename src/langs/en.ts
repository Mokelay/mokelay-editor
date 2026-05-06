export const enMessages = {
  app: {
    title: 'Mokelay Editor',
    subtitle: 'Mokelay page configurator',
    darkMode: 'Dark mode',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
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
    close: 'Close'
  },
  preview: {
    title: 'Config Preview',
    backToEditor: 'Back',
    emptyState: 'No page content yet.'
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
} as const;

export const enEditorJsMessages = {} as const;
