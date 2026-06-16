import { defineAsyncComponent, markRaw } from 'vue';
import MAdvanceInput, { mAdvanceInputEditorTool } from '@/blocks/MAdvanceInput.vue';
import MAdvanceTable, { mAdvanceTableEditorTool } from '@/blocks/MAdvanceTable.vue';
import MChart, { mChartEditorTool } from '@/blocks/MChart.vue';
import MDatasourceEditor, { mDatasourceEditorTool } from '@/blocks/MDatasourceEditor.vue';
import MDividerLine, { mDividerLineEditorTool } from '@/blocks/MDividerLine.vue';
import { mFormEditorTool } from '@/blocks/mFormEditorTool';
import MFormItem, { mFormItemEditorTool } from '@/blocks/MFormItem.vue';
import MButton, { mButtonEditorTool } from '@/blocks/MButton.vue';
import MCheckboxGroupField, { mCheckboxGroupFieldEditorTool } from '@/blocks/MCheckboxGroupField.vue';
import MEmailField, { mEmailFieldEditorTool } from '@/blocks/MEmailField.vue';
import MEmbed, { mEmbedEditorTool } from '@/blocks/MEmbed.vue';
import MFileUploadField, { mFileUploadFieldEditorTool } from '@/blocks/MFileUploadField.vue';
import MFieldsEditor, { mFieldsEditorTool } from '@/blocks/MFieldsEditor.vue';
import MHeading, { mHeadingEditorTool } from '@/blocks/MHeading.vue';
import MImage, { mImageEditorTool } from '@/blocks/MImage.vue';
import MImageChoiceField, { mImageChoiceFieldEditorTool } from '@/blocks/MImageChoiceField.vue';
import MInput, { mInputEditorTool } from '@/blocks/MInput.vue';
import MLink, { mLinkEditorTool } from '@/blocks/MLink.vue';
import MLinearScaleField, { mLinearScaleFieldEditorTool } from '@/blocks/MLinearScaleField.vue';
import MLinkField, { mLinkFieldEditorTool } from '@/blocks/MLinkField.vue';
import MMatrixField, { mMatrixFieldEditorTool } from '@/blocks/MMatrixField.vue';
import MPageBreak, { mPageBreakEditorTool } from '@/blocks/MPageBreak.vue';
import MPhoneField, { mPhoneFieldEditorTool } from '@/blocks/MPhoneField.vue';
import MRadioGroupField, { mRadioGroupFieldEditorTool } from '@/blocks/MRadioGroupField.vue';
import MRatingField, { mRatingFieldEditorTool } from '@/blocks/MRatingField.vue';
import MResultPage, { mResultPageEditorTool } from '@/blocks/MResultPage.vue';
import MRichText, { mRichTextEditorTool } from '@/blocks/MRichText.vue';
import MSelectField, { mSelectFieldEditorTool } from '@/blocks/MSelectField.vue';
import MTag, { mTagEditorTool } from '@/blocks/MTag.vue';
import MTextField, { mTextFieldEditorTool } from '@/blocks/MTextField.vue';
import MTextareaField, { mTextareaFieldEditorTool } from '@/blocks/MTextareaField.vue';
import MThankYouPage, { mThankYouPageEditorTool } from '@/blocks/MThankYouPage.vue';
import { mEditorSelectorEditorTool } from '@/blocks/mEditorSelectorEditorTool';
import { mPageEditorTool } from '@/blocks/mPageEditorTool';
import type { EditorToolDefinition } from '@/editors/editorToolDefinition';

export type { EditorComponentToolbox, EditorToolComponentProps, EditorToolDefinition } from '@/editors/editorToolDefinition';

type NamedComponent = {
  name?: string;
  __name?: string;
};

// 统一获取 Vue 组件名称，作为 EditorJS 工具名。
function getEditorComponentName(component: NamedComponent) {
  const componentName = component.name || component.__name;
  if (!componentName) {
    throw new Error('Editor component is missing both name and __name.');
  }
  return componentName;
}

// 编辑器组件注册表：
// key = 工具名（即 block.type），value = 工具定义（组件 + 工具元信息）。
const editorComponentRegistry: Record<string, EditorToolDefinition> = {
  MPage: {
    component: markRaw(defineAsyncComponent(() => import('@/blocks/MPage.vue'))),
    ...mPageEditorTool
  },
  MEditorSelector: {
    component: markRaw(defineAsyncComponent(() => import('@/blocks/MEditorSelector.vue'))),
    ...mEditorSelectorEditorTool
  },
  MForm: {
    component: markRaw(defineAsyncComponent(() => import('@/blocks/MForm.vue'))),
    ...mFormEditorTool
  },
  [getEditorComponentName(MInput)]: {
    component: markRaw(MInput),
    ...mInputEditorTool
  },
  [getEditorComponentName(MLink)]: {
    component: markRaw(MLink),
    ...mLinkEditorTool
  },
  [getEditorComponentName(MAdvanceInput)]: {
    component: markRaw(MAdvanceInput),
    ...mAdvanceInputEditorTool
  },
  [getEditorComponentName(MAdvanceTable)]: {
    component: markRaw(MAdvanceTable),
    ...mAdvanceTableEditorTool
  },
  [getEditorComponentName(MChart)]: {
    component: markRaw(MChart),
    ...mChartEditorTool
  },
  [getEditorComponentName(MDatasourceEditor)]: {
    component: markRaw(MDatasourceEditor),
    ...mDatasourceEditorTool
  },
  [getEditorComponentName(MFieldsEditor)]: {
    component: markRaw(MFieldsEditor),
    ...mFieldsEditorTool
  },
  [getEditorComponentName(MDividerLine)]: {
    component: markRaw(MDividerLine),
    ...mDividerLineEditorTool
  },
  [getEditorComponentName(MFormItem)]: {
    component: markRaw(MFormItem),
    ...mFormItemEditorTool
  },
  [getEditorComponentName(MTag)]: {
    component: markRaw(MTag),
    ...mTagEditorTool
  },
  [getEditorComponentName(MHeading)]: {
    component: markRaw(MHeading),
    ...mHeadingEditorTool
  },
  [getEditorComponentName(MRichText)]: {
    component: markRaw(MRichText),
    ...mRichTextEditorTool
  },
  [getEditorComponentName(MImage)]: {
    component: markRaw(MImage),
    ...mImageEditorTool
  },
  [getEditorComponentName(MEmbed)]: {
    component: markRaw(MEmbed),
    ...mEmbedEditorTool
  },
  [getEditorComponentName(MTextField)]: {
    component: markRaw(MTextField),
    ...mTextFieldEditorTool
  },
  [getEditorComponentName(MEmailField)]: {
    component: markRaw(MEmailField),
    ...mEmailFieldEditorTool
  },
  [getEditorComponentName(MPhoneField)]: {
    component: markRaw(MPhoneField),
    ...mPhoneFieldEditorTool
  },
  [getEditorComponentName(MLinkField)]: {
    component: markRaw(MLinkField),
    ...mLinkFieldEditorTool
  },
  [getEditorComponentName(MTextareaField)]: {
    component: markRaw(MTextareaField),
    ...mTextareaFieldEditorTool
  },
  [getEditorComponentName(MFileUploadField)]: {
    component: markRaw(MFileUploadField),
    ...mFileUploadFieldEditorTool
  },
  [getEditorComponentName(MSelectField)]: {
    component: markRaw(MSelectField),
    ...mSelectFieldEditorTool
  },
  [getEditorComponentName(MRadioGroupField)]: {
    component: markRaw(MRadioGroupField),
    ...mRadioGroupFieldEditorTool
  },
  [getEditorComponentName(MCheckboxGroupField)]: {
    component: markRaw(MCheckboxGroupField),
    ...mCheckboxGroupFieldEditorTool
  },
  [getEditorComponentName(MImageChoiceField)]: {
    component: markRaw(MImageChoiceField),
    ...mImageChoiceFieldEditorTool
  },
  [getEditorComponentName(MRatingField)]: {
    component: markRaw(MRatingField),
    ...mRatingFieldEditorTool
  },
  [getEditorComponentName(MLinearScaleField)]: {
    component: markRaw(MLinearScaleField),
    ...mLinearScaleFieldEditorTool
  },
  [getEditorComponentName(MMatrixField)]: {
    component: markRaw(MMatrixField),
    ...mMatrixFieldEditorTool
  },
  [getEditorComponentName(MPageBreak)]: {
    component: markRaw(MPageBreak),
    ...mPageBreakEditorTool
  },
  [getEditorComponentName(MThankYouPage)]: {
    component: markRaw(MThankYouPage),
    ...mThankYouPageEditorTool
  },
  [getEditorComponentName(MResultPage)]: {
    component: markRaw(MResultPage),
    ...mResultPageEditorTool
  },
  [getEditorComponentName(MButton)]: {
    component: markRaw(MButton),
    ...mButtonEditorTool
  }
};

// 根据工具名读取工具定义。
export function getEditorComponentDefinition(toolName: string) {
  return editorComponentRegistry[toolName];
}

// 判断某个 block.type 是否为已注册的自定义组件。
export function isRegisteredEditorComponent(toolName: string) {
  return toolName in editorComponentRegistry;
}

// 暴露完整注册表，用于工厂层批量生成工具配置。
export function getEditorComponentRegistry() {
  return editorComponentRegistry;
}
