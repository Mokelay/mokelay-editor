import type { OutputData } from '@editorjs/editorjs';
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

// MPage 工具在编辑器中的数据结构定义：
// - edit: 是否为编辑态
// - value: 页面内嵌 blocks 数据
export type MPageToolProps = {
  edit: boolean;
  value?: OutputData['blocks'];
};

// 为 MPage 注册 EditorJS 工具能力，统一处理默认值、归一化和序列化。
export const mPageEditorTool = defineEditorTool<MPageToolProps>({
  toolbox: {
    get title() {
      return i18n.t('page.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="16" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  createInitialProps: () => ({
    edit: false,
    value: []
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    value: Array.isArray(props.value) ? props.value : []
  }),
  serialize: (props) => ({
    value: props.value
  })
});
