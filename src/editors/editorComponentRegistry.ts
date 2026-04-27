import { defineAsyncComponent, markRaw } from 'vue';
import MInput, { mInputEditorTool } from '@/blocks/MInput.vue';
import MAdvanceInput, { mAdvanceInputEditorTool } from '@/blocks/MAdvanceInput.vue';
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
  [getEditorComponentName(MInput)]: {
    component: markRaw(MInput),
    ...mInputEditorTool
  },
  [getEditorComponentName(MAdvanceInput)]: {
    component: markRaw(MAdvanceInput),
    ...mAdvanceInputEditorTool
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
