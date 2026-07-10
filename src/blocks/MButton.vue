<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { normalizeAction, normalizeAlign, normalizeButtonVariant, stringValue, booleanValue, type PageDslAlign, type PageDslButtonVariant } from '@/blocks/pageDslEditorTools';

export interface MButtonProps {
  edit: boolean;
  currentBlockId?: string;
  label?: string;
  variant?: PageDslButtonVariant | string;
  align?: PageDslAlign | string;
  action?: Record<string, unknown>;
  disabled?: boolean;
  bare?: boolean;
  visible?: boolean;
  hidden?: boolean;
}

const buttonDefaults = {
  label: '提交',
  variant: 'primary',
  align: 'left',
  action: { type: 'submit' },
  disabled: false,
  visible: true,
  hidden: false
} as const;

export function normalizeButtonProps(props: Partial<MButtonProps>): MButtonProps {
  const merged = {
    ...buttonDefaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(merged.currentBlockId),
    label: stringValue(merged.label),
    variant: normalizeButtonVariant(merged.variant),
    align: normalizeAlign(merged.align),
    action: normalizeAction(merged.action),
    disabled: booleanValue(merged.disabled),
    bare: booleanValue(merged.bare),
    visible: booleanValue(merged.visible, true),
    hidden: booleanValue(merged.hidden)
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MButton",
 *   "displayName": "按钮",
 *   "category": "action",
 *   "description": "按钮，支持样式、动作、禁用状态以及页面 DSL 的 visible/hidden 条件渲染。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MButton",
 *     "toolSymbol": "mButtonEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 420
 *   },
 *   "toolbox": {
 *     "title": "按钮",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M9 12h6\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "label": "提交",
 *     "variant": "primary",
 *     "align": "left",
 *     "action": {
 *       "type": "submit"
 *     },
 *     "disabled": false,
 *     "visible": true,
 *     "hidden": false
 *   },
 *   "properties": [
 *     {
 *       "key": "label",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 64,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "按钮文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "variant",
 *       "optional": true,
 *       "tsType": "PageDslButtonVariant | string",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 65,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "样式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "primary",
 *           "label": "主要"
 *         },
 *         {
 *           "value": "secondary",
 *           "label": "次要"
 *         },
 *         {
 *           "value": "ghost",
 *           "label": "朴素"
 *         },
 *         {
 *           "value": "danger",
 *           "label": "危险"
 *         },
 *         {
 *           "value": "warning",
 *           "label": "警告"
 *         },
 *         {
 *           "value": "text",
 *           "label": "文本"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "align",
 *       "optional": true,
 *       "tsType": "PageDslAlign | string",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 78,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "对齐",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "left",
 *           "label": "左对齐"
 *         },
 *         {
 *           "value": "center",
 *           "label": "居中"
 *         },
 *         {
 *           "value": "right",
 *           "label": "右对齐"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 79,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "action",
 *       "optional": true,
 *       "tsType": "Record<string, unknown>",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 80,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "动作 JSON（本阶段仅保存，不执行）",
 *       "type": "textarea",
 *       "valueType": "json"
 *     },
 *     {
 *       "key": "bare",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 24,
 *       "declaredInProps": true,
 *       "configurable": false
 *     },
 *     {
 *       "key": "visible",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 14,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "显示条件",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "hidden",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 15,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "隐藏条件",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "click",
 *       "payload": "payload: MouseEvent",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "line": 107
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     },
 *     {
 *       "key": "disabled",
 *       "type": "omitWhenFalse",
 *       "description": "disabled 仅在 true 时写入；默认 false 不保存。"
 *     },
 *     {
 *       "key": "action",
 *       "type": "json",
 *       "description": "动作配置作为 JSON 对象原样保留。"
 *     },
 *     {
 *       "key": "visible",
 *       "type": "omitWhenTrue",
 *       "description": "visible 默认 true；仅在 false 时写入，用于页面 DSL 的条件展示。"
 *     },
 *     {
 *       "key": "hidden",
 *       "type": "omitWhenFalse",
 *       "description": "hidden 默认 false；仅在 true 时写入，用于页面 DSL 的条件隐藏。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MButton-example",
 *       "type": "MButton",
 *       "data": {
 *         "label": "提交",
 *         "variant": "primary",
 *         "align": "left",
 *         "action": {
 *           "type": "submit"
 *         },
 *         "disabled": false,
 *         "visible": true,
 *         "hidden": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MButton.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mButtonEditorTool = defineEditorTool<MButtonProps>({
  normalizeProps: normalizeButtonProps,
  serialize: (props) => {
    const normalized = normalizeButtonProps(props);
    return {
      label: normalized.label,
      variant: normalized.variant,
      align: normalized.align,
      action: normalized.action,
      ...(normalized.disabled ? { disabled: true } : {}),
      ...(normalized.visible ? {} : { visible: false }),
      ...(normalized.hidden ? { hidden: true } : {})
    };
  }
});
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';

const props = withDefaults(defineProps<MButtonProps & PageDslCallbacks<MButtonProps>>(), {
  visible: true,
  hidden: false
});
const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

const normalizedButton = computed(() => normalizeButtonProps(props));

const buttonClass = computed(() => {
  const variant = normalizedButton.value.variant;
  return `page-dsl-button page-dsl-button--${variant}`;
});

const buttonWrapClass = computed(() => {
  if (normalizedButton.value.align === 'center') return 'page-dsl-button-wrap page-dsl-button-wrap--center';
  if (normalizedButton.value.align === 'right') return 'page-dsl-button-wrap page-dsl-button-wrap--right';
  return 'page-dsl-button-wrap';
});

const buttonTestId = computed(() => props.currentBlockId || undefined);

function handleClick(event: MouseEvent) {
  if (!normalizedButton.value.edit && !normalizedButton.value.disabled) {
    emit('click', event);
  }
}
</script>

<template>
  <template v-if="normalizedButton.visible && !normalizedButton.hidden">
    <PageDslBlock v-if="!normalizedButton.bare" block-type="MButton">
      <div :class="buttonWrapClass">
        <button type="button" :class="buttonClass" :disabled="normalizedButton.disabled" :data-testid="buttonTestId" @click="handleClick">
          {{ normalizedButton.label || '提交' }}
        </button>
      </div>
    </PageDslBlock>
    <div v-else :class="buttonWrapClass">
      <button type="button" :class="buttonClass" :disabled="normalizedButton.disabled" :data-testid="buttonTestId" @click="handleClick">
        {{ normalizedButton.label || '提交' }}
      </button>
    </div>
  </template>
</template>

<style scoped>
.page-dsl-button-wrap {
  display: flex;
  justify-content: flex-start;
}

.page-dsl-button-wrap--center {
  justify-content: center;
}

.page-dsl-button-wrap--right {
  justify-content: flex-end;
}

.page-dsl-button {
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: default;
}

.page-dsl-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.page-dsl-button--primary {
  border: 1px solid rgb(79 70 229);
  background: rgb(79 70 229);
  color: white;
}

.page-dsl-button--secondary {
  border: 1px solid rgb(203 213 225);
  background: rgb(255 255 255);
  color: rgb(15 23 42);
}

.page-dsl-button--ghost {
  border: 1px solid transparent;
  background: transparent;
  color: rgb(51 65 85);
}

.page-dsl-button--danger {
  border: 1px solid rgb(254 202 202);
  background: rgb(254 226 226);
  color: rgb(185 28 28);
}

.page-dsl-button--warning {
  border: 1px solid rgb(253 186 116);
  background: rgb(255 247 237);
  color: rgb(194 65 12);
}

.page-dsl-button--text {
  border: 1px solid transparent;
  background: transparent;
  color: rgb(37 99 235);
}

.dark .page-dsl-button--secondary {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .page-dsl-button--danger {
  border-color: rgb(127 29 29);
  background: rgb(127 29 29 / 0.34);
  color: rgb(254 202 202);
}

.dark .page-dsl-button--warning {
  border-color: rgb(154 52 18);
  background: rgb(154 52 18 / 0.24);
  color: rgb(254 215 170);
}

.dark .page-dsl-button--text {
  border-color: transparent;
  background: transparent;
  color: rgb(147 197 253);
}
</style>
