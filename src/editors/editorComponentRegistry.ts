import { markRaw, type Component } from 'vue';
import {
  resolveEditorToolDefinition
} from '@/editors/clientBlockToolMetadata';
import type {
  EditorToolDefinition,
  ResolvedEditorToolDefinition
} from '@/editors/editorToolDefinition';
import type { NormalizedClientBlockDoc } from '@/utils/clientBlockDocs';

type LoadedDefinition = EditorToolDefinition;
type EditorToolLoader = () => Promise<LoadedDefinition>;

const editorComponentLoaders: Record<string, EditorToolLoader> = {
  MActionEditor: async () => {
    const module = await import('@/blocks/MActionEditor.vue');
    return { component: markRaw(module.default), ...module.mActionEditorTool };
  },
  MActionCardList: async () => {
    const module = await import('@/blocks/MActionCardList.vue');
    return { component: markRaw(module.default), ...module.mActionCardListEditorTool };
  },
  MActionToolbar: async () => {
    const module = await import('@/blocks/MActionToolbar.vue');
    return { component: markRaw(module.default), ...module.mActionToolbarEditorTool };
  },
  MAdvanceInput: async () => {
    const module = await import('@/blocks/MAdvanceInput.vue');
    return { component: markRaw(module.default), ...module.mAdvanceInputEditorTool };
  },
  MAdvanceTable: async () => {
    const module = await import('@/blocks/MAdvanceTable.vue');
    return { component: markRaw(module.default), ...module.mAdvanceTableEditorTool };
  },
  MBlockPlayground: async () => {
    const module = await import('@/blocks/MBlockPlayground.vue');
    return { component: markRaw(module.default), ...module.mBlockPlaygroundTool };
  },
  MChart: async () => {
    const module = await import('@/blocks/MChart.vue');
    return { component: markRaw(module.default), ...module.mChartEditorTool };
  },
  MChartDataEditor: async () => {
    const module = await import('@/blocks/MChartDataEditor.vue');
    return { component: markRaw(module.default), ...module.mChartDataEditorTool };
  },
  MDateRangeField: async () => {
    const module = await import('@/blocks/MDateRangeField.vue');
    return { component: markRaw(module.default), ...module.mDateRangeFieldEditorTool };
  },
  MDatasourceEditor: async () => {
    const module = await import('@/blocks/MDatasourceEditor.vue');
    return { component: markRaw(module.default), ...module.mDatasourceEditorTool };
  },
  MDividerLine: async () => {
    const module = await import('@/blocks/MDividerLine.vue');
    return { component: markRaw(module.default), ...module.mDividerLineEditorTool };
  },
  MForm: async () => {
    const [{ default: component }, { mFormEditorTool }] = await Promise.all([
      import('@/blocks/MForm.vue'),
      import('@/blocks/mFormEditorTool')
    ]);
    return { component: markRaw(component), ...mFormEditorTool };
  },
  MFormItem: async () => {
    const [{ default: component }, { mFormItemEditorTool }] = await Promise.all([
      import('@/blocks/MFormItem.vue'),
      import('@/blocks/mFormItemEditorTool')
    ]);
    return { component: markRaw(component), ...mFormItemEditorTool };
  },
  MButton: async () => {
    const module = await import('@/blocks/MButton.vue');
    return { component: markRaw(module.default), ...module.mButtonEditorTool };
  },
  MCheckboxGroupField: async () => {
    const module = await import('@/blocks/MCheckboxGroupField.vue');
    return { component: markRaw(module.default), ...module.mCheckboxGroupFieldEditorTool };
  },
  MEmailField: async () => {
    const module = await import('@/blocks/MEmailField.vue');
    return { component: markRaw(module.default), ...module.mEmailFieldEditorTool };
  },
  MEmbed: async () => {
    const module = await import('@/blocks/MEmbed.vue');
    return { component: markRaw(module.default), ...module.mEmbedEditorTool };
  },
  MFileUploadField: async () => {
    const module = await import('@/blocks/MFileUploadField.vue');
    return { component: markRaw(module.default), ...module.mFileUploadFieldEditorTool };
  },
  MFieldsEditor: async () => {
    const module = await import('@/blocks/MFieldsEditor.vue');
    return { component: markRaw(module.default), ...module.mFieldsEditorTool };
  },
  MHeading: async () => {
    const module = await import('@/blocks/MHeading.vue');
    return { component: markRaw(module.default), ...module.mHeadingEditorTool };
  },
  MImage: async () => {
    const module = await import('@/blocks/MImage.vue');
    return { component: markRaw(module.default), ...module.mImageEditorTool };
  },
  MImageChoiceField: async () => {
    const module = await import('@/blocks/MImageChoiceField.vue');
    return { component: markRaw(module.default), ...module.mImageChoiceFieldEditorTool };
  },
  MInput: async () => {
    const module = await import('@/blocks/MInput.vue');
    return { component: markRaw(module.default), ...module.mInputEditorTool };
  },
  MJson: async () => {
    const module = await import('@/blocks/MJson.vue');
    return { component: markRaw(module.default), ...module.mJsonTool };
  },
  MJsonEditor: async () => {
    const module = await import('@/blocks/MJsonEditor.vue');
    return { component: markRaw(module.default), ...module.mJsonEditorTool };
  },
  MLayoutGrid: async () => {
    const module = await import('@/blocks/MLayoutGrid.vue');
    return { component: markRaw(module.default), ...module.mLayoutGridEditorTool };
  },
  MLayoutPreview: async () => {
    const module = await import('@/blocks/MLayoutPreview.vue');
    return { component: markRaw(module.default), ...module.mLayoutPreviewTool };
  },
  MLink: async () => {
    const module = await import('@/blocks/MLink.vue');
    return { component: markRaw(module.default), ...module.mLinkEditorTool };
  },
  MLinearScaleField: async () => {
    const module = await import('@/blocks/MLinearScaleField.vue');
    return { component: markRaw(module.default), ...module.mLinearScaleFieldEditorTool };
  },
  MLinkField: async () => {
    const module = await import('@/blocks/MLinkField.vue');
    return { component: markRaw(module.default), ...module.mLinkFieldEditorTool };
  },
  MMatrixField: async () => {
    const module = await import('@/blocks/MMatrixField.vue');
    return { component: markRaw(module.default), ...module.mMatrixFieldEditorTool };
  },
  MPage: async () => {
    const [{ default: component }, { mPageEditorTool }] = await Promise.all([
      import('@/blocks/MPage.vue'),
      import('@/blocks/mPageEditorTool')
    ]);
    return { component: markRaw(component), ...mPageEditorTool };
  },
  MEditorSelector: async () => {
    const [{ default: component }, { mEditorSelectorEditorTool }] = await Promise.all([
      import('@/blocks/MEditorSelector.vue'),
      import('@/blocks/mEditorSelectorEditorTool')
    ]);
    return { component: markRaw(component), ...mEditorSelectorEditorTool };
  },
  MPhoneField: async () => {
    const module = await import('@/blocks/MPhoneField.vue');
    return { component: markRaw(module.default), ...module.mPhoneFieldEditorTool };
  },
  MRadioGroupField: async () => {
    const module = await import('@/blocks/MRadioGroupField.vue');
    return { component: markRaw(module.default), ...module.mRadioGroupFieldEditorTool };
  },
  MRecordList: async () => {
    const module = await import('@/blocks/MRecordList.vue');
    return { component: markRaw(module.default), ...module.mRecordListEditorTool };
  },
  MRatingField: async () => {
    const module = await import('@/blocks/MRatingField.vue');
    return { component: markRaw(module.default), ...module.mRatingFieldEditorTool };
  },
  MResultPage: async () => {
    const module = await import('@/blocks/MResultPage.vue');
    return { component: markRaw(module.default), ...module.mResultPageEditorTool };
  },
  MRichText: async () => {
    const module = await import('@/blocks/MRichText.vue');
    return { component: markRaw(module.default), ...module.mRichTextEditorTool };
  },
  MSelectField: async () => {
    const module = await import('@/blocks/MSelectField.vue');
    return { component: markRaw(module.default), ...module.mSelectFieldEditorTool };
  },
  MTag: async () => {
    const module = await import('@/blocks/MTag.vue');
    return { component: markRaw(module.default), ...module.mTagEditorTool };
  },
  MTextField: async () => {
    const module = await import('@/blocks/MTextField.vue');
    return { component: markRaw(module.default), ...module.mTextFieldEditorTool };
  },
  MTextareaField: async () => {
    const module = await import('@/blocks/MTextareaField.vue');
    return { component: markRaw(module.default), ...module.mTextareaFieldEditorTool };
  },
  MThankYouPage: async () => {
    const module = await import('@/blocks/MThankYouPage.vue');
    return { component: markRaw(module.default), ...module.mThankYouPageEditorTool };
  },
  MTabs: async () => {
    const module = await import('@/blocks/MTabs.vue');
    return { component: markRaw(module.default), ...module.mTabsEditorTool };
  },
  MUploadImport: async () => {
    const module = await import('@/blocks/MUploadImport.vue');
    return { component: markRaw(module.default), ...module.mUploadImportEditorTool };
  },
  MVariableValueEditor: async () => {
    const module = await import('@/blocks/MVariableValueEditor.vue');
    return { component: markRaw(module.default), ...module.mVariableValueEditorTool };
  }
};

const loadedDefinitions = new Map<string, LoadedDefinition>();
const loadingDefinitions = new Map<string, Promise<LoadedDefinition | undefined>>();

export type {
  EditorComponentToolbox,
  EditorToolComponentProps,
  EditorToolDefinition,
  ResolvedEditorToolDefinition
} from '@/editors/editorToolDefinition';

export function getEditorComponentDefinition(toolName: string, doc?: NormalizedClientBlockDoc) {
  const definition = loadedDefinitions.get(toolName);
  return definition ? resolveEditorToolDefinition(toolName, definition, doc) : undefined;
}

export async function loadEditorComponentDefinition(toolName: string, doc?: NormalizedClientBlockDoc) {
  const loaded = loadedDefinitions.get(toolName);
  if (loaded) return resolveEditorToolDefinition(toolName, loaded, doc);

  const loader = editorComponentLoaders[toolName];
  if (!loader) return undefined;

  let pending = loadingDefinitions.get(toolName);
  if (!pending) {
    pending = loader()
      .then((definition) => {
        loadedDefinitions.set(toolName, definition);
        return definition;
      })
      .finally(() => {
        loadingDefinitions.delete(toolName);
      });
    loadingDefinitions.set(toolName, pending);
  }

  const definition = await pending;
  return definition ? resolveEditorToolDefinition(toolName, definition, doc) : undefined;
}

export async function loadEditorComponentDefinitions(
  toolNames: Iterable<string>,
  documents?: ReadonlyMap<string, NormalizedClientBlockDoc>
) {
  const entries = await Promise.all(
    [...new Set(toolNames)].map(async (toolName) => {
      const definition = await loadEditorComponentDefinition(toolName, documents?.get(toolName));
      return definition ? [toolName, definition] as const : undefined;
    })
  );

  return Object.fromEntries(entries.filter((entry): entry is readonly [string, ResolvedEditorToolDefinition] => Boolean(entry)));
}

export function isRegisteredEditorComponent(toolName: string) {
  return Object.prototype.hasOwnProperty.call(editorComponentLoaders, toolName);
}

export function getRegisteredEditorComponentNames() {
  return Object.keys(editorComponentLoaders);
}

export const getRegisteredEditorToolNames = getRegisteredEditorComponentNames;

export function getEditorComponentRegistry(documents?: ReadonlyMap<string, NormalizedClientBlockDoc>) {
  return Object.fromEntries(
    [...loadedDefinitions.keys()].flatMap((toolName) => {
      const definition = getEditorComponentDefinition(toolName, documents?.get(toolName));
      return definition ? [[toolName, definition] as const] : [];
    })
  ) as Record<string, ResolvedEditorToolDefinition>;
}

export function getEditorComponentBehaviorRegistry() {
  return Object.fromEntries(loadedDefinitions.entries());
}
