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
  input: {
    toolboxTitle: 'Input',
    defaultLabel: 'Field name',
    defaultPlaceholder: 'Please enter...',
    editLabelPlaceholder: 'Field label (e.g. Username)',
    propertyPanelTitle: 'Input Properties',
    properties: {
      label: 'Label',
      placeholder: 'Placeholder',
      value: 'Default value',
      valuePlaceholder: 'Please enter a default value'
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
