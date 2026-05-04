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
    previewPage: 'Preview',
    properties: 'Properties',
    propertyDialogTitle: 'Property Settings',
    configJson: 'Config JSON',
    close: 'Close'
  },
  preview: {
    title: 'Config Preview',
    backToEditor: 'Back',
    emptyState: 'No saved config found. Please click "Save" in the editor first.'
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
    fields: {
      type: 'Datasource type',
      rawData: 'JSON data',
      domain: 'API domain',
      path: 'API path',
      method: 'Method',
      key: 'Key',
      mock: 'Mock data'
    },
    sections: {
      headers: 'Header',
      queries: 'Query',
      body: 'Body'
    },
    actions: {
      add: 'Add',
      remove: 'Remove'
    },
    validation: {
      invalidJson: 'Enter valid JSON.',
      invalidNumber: 'Enter a valid number.',
      invalidObject: 'Enter a valid JSON object.',
      invalidArray: 'Enter a valid JSON array.'
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
    toolboxTitle: 'Page'
  },
} as const;

export const enEditorJsMessages = {} as const;
