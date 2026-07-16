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
    const module = await import('@/editors/blocks/MActionEditor.vue');
    return { component: markRaw(module.default), ...module.mActionEditorTool };
  },
  MActionToolBarEditor: async () => {
    const module = await import('@/editors/blocks/MActionToolBarEditor.vue');
    return { component: markRaw(module.default), ...module.mActionToolBarEditorTool };
  },
  MActionCardList: async () => {
    const [module, { mActionCardListEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MActionCardList.vue'),
      import('@/editors/tools/mActionCardListEditorTool')
    ]);
    return { component: markRaw(module.default), ...mActionCardListEditorTool };
  },
  MActionToolbar: async () => {
    const [module, { mActionToolbarEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MActionToolbar.vue'),
      import('@/editors/tools/mActionToolbarEditorTool')
    ]);
    return { component: markRaw(module.default), ...mActionToolbarEditorTool };
  },
  MAdvanceInput: async () => {
    const [module, { mAdvanceInputEditorTool }] = await Promise.all([
      import('@/editors/blocks/MAdvanceInputEditor.vue'),
      import('@/editors/tools/mAdvanceInputEditorTool')
    ]);
    return { component: markRaw(module.default), ...mAdvanceInputEditorTool };
  },
  MAdvanceTable: async () => {
    const [module, { mAdvanceTableEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MAdvanceTable.vue'),
      import('@/editors/tools/mAdvanceTableEditorTool')
    ]);
    return { component: markRaw(module.default), ...mAdvanceTableEditorTool };
  },
  MAdvanceTableColumnsEditor: async () => {
    const module = await import('@/editors/blocks/MAdvanceTableColumnsEditor.vue');
    return { component: markRaw(module.default), ...module.mAdvanceTableColumnsEditorTool };
  },
  MBlockPlayground: async () => {
    const module = await import('@/editors/blocks/MBlockPlaygroundEditor.vue');
    return { component: markRaw(module.default), ...module.mBlockPlaygroundTool };
  },
  MChart: async () => {
    const [module, { mChartEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MChart.vue'),
      import('@/editors/tools/mChartEditorTool')
    ]);
    return { component: markRaw(module.default), ...mChartEditorTool };
  },
  MChartDataEditor: async () => {
    const module = await import('@/editors/blocks/MChartDataEditor.vue');
    return { component: markRaw(module.default), ...module.mChartDataEditorTool };
  },
  MDateRangeField: async () => {
    const [module, { mDateRangeFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MDateRangeField.vue'),
      import('@/editors/tools/mDateRangeFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mDateRangeFieldEditorTool };
  },
  MDatasourceEditor: async () => {
    const module = await import('@/editors/blocks/MDatasourceEditor.vue');
    return { component: markRaw(module.default), ...module.mDatasourceEditorTool };
  },
  MDividerLine: async () => {
    const [module, { mDividerLineEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MDividerLine.vue'),
      import('@/editors/tools/mDividerLineEditorTool')
    ]);
    return { component: markRaw(module.default), ...mDividerLineEditorTool };
  },
  MForm: async () => {
    const [{ default: component }, { mFormEditorTool }] = await Promise.all([
      import('@/editors/blocks/MFormEditor.vue'),
      import('@/editors/tools/mFormEditorTool')
    ]);
    return { component: markRaw(component), ...mFormEditorTool };
  },
  MFormItem: async () => {
    const [{ default: component }, { mFormItemEditorTool }] = await Promise.all([
      import('@/editors/blocks/MFormItemEditor.vue'),
      import('@/editors/tools/mFormItemEditorTool')
    ]);
    return { component: markRaw(component), ...mFormItemEditorTool };
  },
  MButton: async () => {
    const [module, { mButtonEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MButton.vue'),
      import('@/editors/tools/mButtonEditorTool')
    ]);
    return { component: markRaw(module.default), ...mButtonEditorTool };
  },
  MCheckboxGroupField: async () => {
    const [module, { mCheckboxGroupFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MCheckboxGroupField.vue'),
      import('@/editors/tools/mCheckboxGroupFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mCheckboxGroupFieldEditorTool };
  },
  MEmailField: async () => {
    const [module, { mEmailFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MEmailField.vue'),
      import('@/editors/tools/mEmailFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mEmailFieldEditorTool };
  },
  MEmbed: async () => {
    const [module, { mEmbedEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MEmbed.vue'),
      import('@/editors/tools/mEmbedEditorTool')
    ]);
    return { component: markRaw(module.default), ...mEmbedEditorTool };
  },
  MFileUploadField: async () => {
    const [module, { mFileUploadFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MFileUploadField.vue'),
      import('@/editors/tools/mFileUploadFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mFileUploadFieldEditorTool };
  },
  MFieldsEditor: async () => {
    const module = await import('@/editors/blocks/MFieldsEditor.vue');
    return { component: markRaw(module.default), ...module.mFieldsEditorTool };
  },
  MFormItemsEditor: async () => {
    const module = await import('@/editors/blocks/MFormItemsEditor.vue');
    return { component: markRaw(module.default), ...module.mFormItemsEditorTool };
  },
  MHeading: async () => {
    const [module, { mHeadingEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MHeading.vue'),
      import('@/editors/tools/mHeadingEditorTool')
    ]);
    return { component: markRaw(module.default), ...mHeadingEditorTool };
  },
  MImage: async () => {
    const [module, { mImageEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MImage.vue'),
      import('@/editors/tools/mImageEditorTool')
    ]);
    return { component: markRaw(module.default), ...mImageEditorTool };
  },
  MImageChoiceField: async () => {
    const [module, { mImageChoiceFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MImageChoiceField.vue'),
      import('@/editors/tools/mImageChoiceFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mImageChoiceFieldEditorTool };
  },
  MInput: async () => {
    const [module, { mInputEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MInput.vue'),
      import('@/editors/tools/mInputEditorTool')
    ]);
    return { component: markRaw(module.default), ...mInputEditorTool };
  },
  MJson: async () => {
    const [module, { mJsonTool }] = await Promise.all([
      import('mokelay-components/blocks/MJson.vue'),
      import('@/editors/tools/mJsonTool')
    ]);
    return { component: markRaw(module.default), ...mJsonTool };
  },
  MJsonEditor: async () => {
    const [module, { mJsonEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MJsonEditor.vue'),
      import('@/editors/tools/mJsonEditorTool')
    ]);
    return { component: markRaw(module.default), ...mJsonEditorTool };
  },
  MPageState: async () => {
    const [module, { mPageStateTool }] = await Promise.all([
      import('mokelay-components/blocks/MPageState.vue'),
      import('@/editors/tools/mPageStateTool')
    ]);
    return { component: markRaw(module.default), ...mPageStateTool };
  },
  MLayoutGrid: async () => {
    const [module, { mLayoutGridEditorTool }] = await Promise.all([
      import('@/editors/blocks/MLayoutGridEditor.vue'),
      import('@/editors/tools/mLayoutGridEditorTool')
    ]);
    return { component: markRaw(module.default), ...mLayoutGridEditorTool };
  },
  MLayoutPreview: async () => {
    const [module, { mLayoutPreviewTool }] = await Promise.all([
      import('mokelay-components/blocks/MLayoutPreview.vue'),
      import('@/editors/tools/mLayoutPreviewTool')
    ]);
    return { component: markRaw(module.default), ...mLayoutPreviewTool };
  },
  MLink: async () => {
    const [module, { mLinkEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MLink.vue'),
      import('@/editors/tools/mLinkEditorTool')
    ]);
    return { component: markRaw(module.default), ...mLinkEditorTool };
  },
  MLinearScaleField: async () => {
    const [module, { mLinearScaleFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MLinearScaleField.vue'),
      import('@/editors/tools/mLinearScaleFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mLinearScaleFieldEditorTool };
  },
  MLinkField: async () => {
    const [module, { mLinkFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MLinkField.vue'),
      import('@/editors/tools/mLinkFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mLinkFieldEditorTool };
  },
  MMatrixField: async () => {
    const [module, { mMatrixFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MMatrixField.vue'),
      import('@/editors/tools/mMatrixFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mMatrixFieldEditorTool };
  },
  MPage: async () => {
    const [{ default: component }, { mPageEditorTool }] = await Promise.all([
      import('@/editors/page/MPageEditor.vue'),
      import('@/editors/tools/mPageEditorTool')
    ]);
    return { component: markRaw(component), ...mPageEditorTool };
  },
  MEditorSelector: async () => {
    const [{ default: component }, { mEditorSelectorEditorTool }] = await Promise.all([
      import('@/editors/blocks/MEditorSelector.vue'),
      import('@/editors/blocks/mEditorSelectorEditorTool')
    ]);
    return { component: markRaw(component), ...mEditorSelectorEditorTool };
  },
  MPhoneField: async () => {
    const [module, { mPhoneFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MPhoneField.vue'),
      import('@/editors/tools/mPhoneFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mPhoneFieldEditorTool };
  },
  MRadioGroupField: async () => {
    const [module, { mRadioGroupFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MRadioGroupField.vue'),
      import('@/editors/tools/mRadioGroupFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mRadioGroupFieldEditorTool };
  },
  MRecordList: async () => {
    const [module, { mRecordListEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MRecordList.vue'),
      import('@/editors/tools/mRecordListEditorTool')
    ]);
    return { component: markRaw(module.default), ...mRecordListEditorTool };
  },
  MRatingField: async () => {
    const [module, { mRatingFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MRatingField.vue'),
      import('@/editors/tools/mRatingFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mRatingFieldEditorTool };
  },
  MResultPage: async () => {
    const [module, { mResultPageEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MResultPage.vue'),
      import('@/editors/tools/mResultPageEditorTool')
    ]);
    return { component: markRaw(module.default), ...mResultPageEditorTool };
  },
  MRichText: async () => {
    const [module, { mRichTextEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MRichText.vue'),
      import('@/editors/tools/mRichTextEditorTool')
    ]);
    return { component: markRaw(module.default), ...mRichTextEditorTool };
  },
  MSelectField: async () => {
    const [module, { mSelectFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MSelectField.vue'),
      import('@/editors/tools/mSelectFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mSelectFieldEditorTool };
  },
  MTag: async () => {
    const [module, { mTagEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MTag.vue'),
      import('@/editors/tools/mTagEditorTool')
    ]);
    return { component: markRaw(module.default), ...mTagEditorTool };
  },
  MTextField: async () => {
    const [module, { mTextFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MTextField.vue'),
      import('@/editors/tools/mTextFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mTextFieldEditorTool };
  },
  MTextareaField: async () => {
    const [module, { mTextareaFieldEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MTextareaField.vue'),
      import('@/editors/tools/mTextareaFieldEditorTool')
    ]);
    return { component: markRaw(module.default), ...mTextareaFieldEditorTool };
  },
  MThankYouPage: async () => {
    const [module, { mThankYouPageEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MThankYouPage.vue'),
      import('@/editors/tools/mThankYouPageEditorTool')
    ]);
    return { component: markRaw(module.default), ...mThankYouPageEditorTool };
  },
  MTabs: async () => {
    const [module, { mTabsEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MTabs.vue'),
      import('@/editors/tools/mTabsEditorTool')
    ]);
    return { component: markRaw(module.default), ...mTabsEditorTool };
  },
  MTabsConfigEditor: async () => {
    const module = await import('@/editors/blocks/MTabsConfigEditor.vue');
    return { component: markRaw(module.default), ...module.mTabsConfigEditorTool };
  },
  MUploadImport: async () => {
    const [module, { mUploadImportEditorTool }] = await Promise.all([
      import('mokelay-components/blocks/MUploadImport.vue'),
      import('@/editors/tools/mUploadImportEditorTool')
    ]);
    return { component: markRaw(module.default), ...mUploadImportEditorTool };
  },
  MVariableValueEditor: async () => {
    const module = await import('@/editors/blocks/MVariableValueEditor.vue');
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
