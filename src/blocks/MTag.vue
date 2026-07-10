<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MTagProps {
  edit: boolean;
  tagName?: string;
  closable?: boolean;
  size?: '' | 'large' | 'default' | 'small';
  color?: string;
  type?: '' | 'primary' | 'success' | 'info' | 'warning' | 'danger';
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MTag",
 *   "displayName": "标签",
 *   "category": "content",
 *   "description": "标签 Block，支持标签文本、颜色、尺寸和展示样式。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MTag",
 *     "toolSymbol": "mTagEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 190
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "标签",
 *       "en": "Tag"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"5\" ry=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"8\" cy=\"12\" r=\"1.4\" fill=\"currentColor\"/></svg>"
 *   },
 *   "defaultData": {
 *     "tagName": {
 *       "zh": "标签",
 *       "en": "Tag"
 *     },
 *     "closable": false,
 *     "size": "",
 *     "color": "",
 *     "type": "success"
 *   },
 *   "properties": [
 *     {
 *       "key": "tagName",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MTag.vue",
 *       "line": 27,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": {
 *         "zh": "标签内容",
 *         "en": "Tag name"
 *       },
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "标签",
 *         "en": "Tag"
 *       }
 *     },
 *     {
 *       "key": "type",
 *       "optional": true,
 *       "tsType": "'' | 'primary' | 'success' | 'info' | 'warning' | 'danger'",
 *       "source": "submodule/mokelay-editor/src/blocks/MTag.vue",
 *       "line": 32,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": {
 *         "zh": "标签类型",
 *         "en": "Type"
 *       },
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "",
 *           "label": {
 *             "zh": "默认",
 *             "en": "Default"
 *           }
 *         },
 *         {
 *           "value": "primary",
 *           "label": {
 *             "zh": "主要",
 *             "en": "Primary"
 *           }
 *         },
 *         {
 *           "value": "success",
 *           "label": {
 *             "zh": "成功",
 *             "en": "Success"
 *           }
 *         },
 *         {
 *           "value": "info",
 *           "label": {
 *             "zh": "信息",
 *             "en": "Info"
 *           }
 *         },
 *         {
 *           "value": "warning",
 *           "label": {
 *             "zh": "警告",
 *             "en": "Warning"
 *           }
 *         },
 *         {
 *           "value": "danger",
 *           "label": {
 *             "zh": "危险",
 *             "en": "Danger"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "'' | 'large' | 'default' | 'small'",
 *       "source": "submodule/mokelay-editor/src/blocks/MTag.vue",
 *       "line": 45,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": {
 *         "zh": "标签尺寸",
 *         "en": "Size"
 *       },
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "",
 *           "label": {
 *             "zh": "默认",
 *             "en": "Default"
 *           }
 *         },
 *         {
 *           "value": "large",
 *           "label": {
 *             "zh": "大",
 *             "en": "Large"
 *           }
 *         },
 *         {
 *           "value": "default",
 *           "label": {
 *             "zh": "中",
 *             "en": "Medium"
 *           }
 *         },
 *         {
 *           "value": "small",
 *           "label": {
 *             "zh": "小",
 *             "en": "Small"
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "key": "color",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MTag.vue",
 *       "line": 56,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": {
 *         "zh": "自定义颜色",
 *         "en": "Custom color"
 *       },
 *       "type": "text",
 *       "placeholder": {
 *         "zh": "例如：#409EFF",
 *         "en": "e.g. #409EFF"
 *       }
 *     },
 *     {
 *       "key": "closable",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MTag.vue",
 *       "line": 61,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": {
 *         "zh": "可关闭",
 *         "en": "Closable"
 *       },
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MTag-example",
 *       "type": "MTag",
 *       "data": {
 *         "tagName": {
 *           "zh": "标签",
 *           "en": "Tag"
 *         },
 *         "closable": false,
 *         "size": "",
 *         "color": "",
 *         "type": "success"
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MTag.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MTag.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mTagEditorTool = defineEditorTool<MTagProps>({
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    tagName: props.tagName?.trim() || i18n.t('tag.defaultTagName'),
    closable: props.closable === true,
    size: props.size ?? '',
    color: props.color ?? '',
    type: props.type ?? 'success'
  }),
  serialize: (props) => ({
    tagName: props.tagName?.trim() || i18n.t('tag.defaultTagName'),
    closable: props.closable ?? false,
    size: props.size ?? '',
    color: props.color ?? '',
    type: props.type ?? ''
  })
});
</script>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue';
import { ElTag } from 'element-ui/es/components/tag/index.mjs';
import 'element-ui/es/components/tag/style/css';

const props = defineProps<MTagProps & {
  onChange?: (payload: MTagProps) => void;
  onToolChange?: (payload: MTagProps) => void;
}>();
const rootRef = ref<HTMLElement | null>(null);
let toolbarAlignTimer: number | null = null;

function emitChange(payload: Partial<MTagProps>) {
  const nextPayload = {
    edit: props.edit,
    tagName: props.tagName ?? '',
    closable: props.closable ?? false,
    size: props.size ?? '',
    color: props.color ?? '',
    type: props.type ?? '',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function handleClose() {
  emitChange({
    closable: props.closable ?? false
  });
}

function clearToolbarAlignTimer() {
  if (toolbarAlignTimer === null) return;
  window.clearTimeout(toolbarAlignTimer);
  toolbarAlignTimer = null;
}

function alignToolbarToTag() {
  const root = rootRef.value;
  if (!root) return;

  const block = root.closest('.ce-block') as HTMLElement | null;
  const toolbar = root.closest('.codex-editor')?.querySelector('.ce-toolbar') as HTMLElement | null;
  const plusButton = toolbar?.querySelector('.ce-toolbar__plus') as HTMLElement | null;

  if (!block || !toolbar || !plusButton) return;

  const blockRect = block.getBoundingClientRect();
  const tagRect = root.getBoundingClientRect();
  const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
  const top = block.offsetTop + (tagRect.top - blockRect.top) + (tagRect.height - toolbarButtonHeight) / 2;

  toolbar.style.top = `${Math.round(top)}px`;
}

function scheduleToolbarAlignment() {
  clearToolbarAlignTimer();
  toolbarAlignTimer = window.setTimeout(() => {
    alignToolbarToTag();
  }, 0);
}

onMounted(() => {
  nextTick(() => {
    rootRef.value?.addEventListener('mouseenter', scheduleToolbarAlignment);
    rootRef.value?.addEventListener('mousemove', scheduleToolbarAlignment);
  });
});

onBeforeUnmount(() => {
  clearToolbarAlignTimer();
  rootRef.value?.removeEventListener('mouseenter', scheduleToolbarAlignment);
  rootRef.value?.removeEventListener('mousemove', scheduleToolbarAlignment);
});
</script>

<template>
  <div ref="rootRef" class="ce-tag-tool" data-testid="editor-tag-tool">
    <ElTag
      data-testid="editor-tag-value"
      :closable="closable"
      :size="size || undefined"
      :color="color || undefined"
      :type="type || undefined"
      @close="handleClose"
    >
      {{ tagName }}
    </ElTag>
  </div>
</template>

<style scoped>
.ce-tag-tool {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  max-width: 100%;
}

.ce-tag-tool :deep(.el-tag) {
  max-width: 100%;
  line-height: 20px;
}

.ce-tag-tool :deep(.el-tag__content) {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}
</style>
