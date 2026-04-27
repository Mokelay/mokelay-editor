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
  advanceInput: {
    toolboxTitle: 'Advanced Input',
    defaultLabel: 'Advanced field',
    defaultPlaceholder: 'Type @ / # / to trigger suggestions...',
    editLabelPlaceholder: 'Advanced field label',
    propertyPanelTitle: 'Advanced Input Properties',
    componentTag: 'component',
    properties: {
      label: 'Label',
      placeholder: 'Placeholder',
      value: 'Default value',
      valuePlaceholder: 'Please enter a default value',
      componentOptions: 'Insertable components',
      componentOptionsPlaceholder: 'Comma separated, e.g. MInput,MPage',
      triggerOptions: 'Trigger config',
      triggerOptionsPlaceholder: 'JSON, e.g. {\"@\":[{\"label\":\"Current User\",\"value\":\"@currentUser\"}]}'
    }
  },
  page: {
    toolboxTitle: 'Page'
  },
} as const;

export const enEditorJsMessages = {} as const;
