<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import { booleanValue, normalizeSelectValue, normalizeValue, stringValue } from '@/blocks/pageDslEditorTools';
import type { BlockDataField } from '@/utils/variableValue';

export type MActionCardListVariant = 'card' | 'compact';
export type MActionCardListSize = 'sm' | 'md';
export type MActionCardListKey = string | number;

export type MActionCardListEventPayload = {
  item: unknown;
  itemKey: MActionCardListKey;
  index: number;
};

export interface MActionCardListProps extends EditorToolComponentProps {
  items?: unknown;
  itemKey?: string;
  titlePath?: string;
  descriptionPath?: string;
  activeKey?: MActionCardListKey | null;
  variant?: MActionCardListVariant | string;
  size?: MActionCardListSize | string;
  emptyText?: string;
  disabled?: boolean;
}

type NormalizedActionCardItem = {
  key: MActionCardListKey;
  title: string;
  description: string;
  disabled: boolean;
  raw: unknown;
  index: number;
};

const defaultActionCardItems: unknown[] = [
  {
    key: 'login',
    title: '登录接口',
    description: '读取用户、校验密码、写入 Session。'
  },
  {
    key: 'register',
    title: '注册接口',
    description: '校验重复邮箱、创建用户、写入 Session。'
  }
];

const actionCardListDefaults = {
  itemKey: 'key',
  titlePath: 'title',
  descriptionPath: 'description',
  variant: 'card',
  size: 'md',
  emptyText: '暂无数据',
  disabled: false
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeActiveKey(value: unknown): MActionCardListKey | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function normalizeItemsConfig(value: unknown, fallback: unknown[] = []) {
  if (Array.isArray(value)) return cloneValue(value);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? cloneValue(parsed) : value;
    } catch {
      return value;
    }
  }

  return value === undefined ? cloneValue(fallback) : normalizeValue(value, fallback);
}

export function normalizeActionCardListProps(props: Partial<MActionCardListProps>): MActionCardListProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: stringValue(props.currentBlockId),
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    items: normalizeItemsConfig(props.items, []),
    itemKey: stringValue(props.itemKey, actionCardListDefaults.itemKey),
    titlePath: stringValue(props.titlePath, actionCardListDefaults.titlePath),
    descriptionPath: stringValue(props.descriptionPath, actionCardListDefaults.descriptionPath),
    activeKey: normalizeActiveKey(props.activeKey),
    variant: normalizeSelectValue(props.variant, ['card', 'compact'] as const, actionCardListDefaults.variant),
    size: normalizeSelectValue(props.size, ['sm', 'md'] as const, actionCardListDefaults.size),
    emptyText: stringValue(props.emptyText, actionCardListDefaults.emptyText),
    disabled: booleanValue(props.disabled, actionCardListDefaults.disabled)
  };
}

function getActionCardListDataFields(): BlockDataField[] {
  return [
    {
      label: '选中项',
      variable: 'selectedItem',
      dataType: 'object'
    },
    {
      label: '选中标识',
      variable: 'activeKey',
      dataType: 'string'
    },
    {
      label: '列表数据',
      variable: 'items',
      dataType: 'array'
    }
  ];
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "blockType": "MActionCardList",
 *   "displayName": "动作卡片列表",
 *   "category": "action",
 *   "description": "动作卡片列表，以卡片或紧凑列表展示数据项，支持字段路径、禁用状态、加载状态和卡片级事件。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MActionCardList",
 *     "toolSymbol": "mActionCardListEditorTool",
 *     "editorEnabled": true,
 *     "toolboxVisible": true,
 *     "sortOrder": 50
 *   },
 *   "toolbox": {
 *     "title": "动作卡片列表",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 5.5h14M5 12h14M5 18.5h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"5\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"3\" y=\"9.5\" width=\"18\" height=\"5\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"18\" height=\"5\" rx=\"1.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>"
 *   },
 *   "defaultData": {
 *     "items": [
 *       {
 *         "key": "login",
 *         "title": "登录接口",
 *         "description": "读取用户、校验密码、写入 Session。"
 *       },
 *       {
 *         "key": "register",
 *         "title": "注册接口",
 *         "description": "校验重复邮箱、创建用户、写入 Session。"
 *       }
 *     ],
 *     "itemKey": "key",
 *     "titlePath": "title",
 *     "descriptionPath": "description",
 *     "variant": "card",
 *     "size": "md",
 *     "emptyText": "暂无数据",
 *     "disabled": false
 *   },
 *   "properties": [
 *     {
 *       "key": "items",
 *       "optional": true,
 *       "tsType": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 154,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "列表数据 JSON / 变量",
 *       "type": "textarea",
 *       "valueType": "json",
 *       "validationMessage": "请输入有效数组 JSON，或使用变量值。"
 *     },
 *     {
 *       "key": "itemKey",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 161,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "唯一标识路径",
 *       "type": "text",
 *       "placeholder": "key / uuid / id"
 *     },
 *     {
 *       "key": "titlePath",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 162,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "标题路径",
 *       "type": "text",
 *       "placeholder": "title / name"
 *     },
 *     {
 *       "key": "descriptionPath",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 163,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "描述路径",
 *       "type": "text",
 *       "placeholder": "description"
 *     },
 *     {
 *       "key": "variant",
 *       "optional": true,
 *       "tsType": "MActionCardListVariant | string",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 164,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "样式",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "card",
 *           "label": "卡片"
 *         },
 *         {
 *           "value": "compact",
 *           "label": "紧凑"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "size",
 *       "optional": true,
 *       "tsType": "MActionCardListSize | string",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 173,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "尺寸",
 *       "type": "select",
 *       "options": [
 *         {
 *           "value": "sm",
 *           "label": "小"
 *         },
 *         {
 *           "value": "md",
 *           "label": "默认"
 *         }
 *       ]
 *     },
 *     {
 *       "key": "emptyText",
 *       "optional": true,
 *       "tsType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 182,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "空状态文案",
 *       "type": "text"
 *     },
 *     {
 *       "key": "disabled",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 183,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "禁用",
 *       "type": "checkbox"
 *     },
 *     {
 *       "key": "activeKey",
 *       "optional": true,
 *       "tsType": "MActionCardListKey | null",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 27,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "激活项标识"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "select",
 *       "payload": "payload: MActionCardListEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 217,
 *       "label": "选择卡片"
 *     },
 *     {
 *       "event": "click",
 *       "payload": "payload: MActionCardListEventPayload",
 *       "trigger": "Vue component emit",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 217,
 *       "label": "点击卡片"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "getData",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 393,
 *       "label": "获取数据"
 *     },
 *     {
 *       "name": "setItems",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 394,
 *       "label": "设置列表数据"
 *     },
 *     {
 *       "name": "setActive",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 395,
 *       "label": "设置激活项"
 *     },
 *     {
 *       "name": "clearActive",
 *       "exposed": true,
 *       "async": false,
 *       "params": "not declared in defineExpose object",
 *       "returns": "unknown",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 396,
 *       "label": "清除激活项"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": {
 *         "raw": "'选中项'",
 *         "zh": "选中项",
 *         "en": "选中项"
 *       },
 *       "variable": "selectedItem",
 *       "dataType": "object",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 126
 *     },
 *     {
 *       "label": {
 *         "raw": "'选中标识'",
 *         "zh": "选中标识",
 *         "en": "选中标识"
 *       },
 *       "variable": "activeKey",
 *       "dataType": "string",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 131
 *     },
 *     {
 *       "label": {
 *         "raw": "'列表数据'",
 *         "zh": "列表数据",
 *         "en": "列表数据"
 *       },
 *       "variable": "items",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "line": 136
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，只返回可写入 EditorJS block.data 的字段。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MActionCardList-example",
 *       "type": "MActionCardList",
 *       "data": {
 *         "items": [
 *           {
 *             "key": "login",
 *             "title": "登录接口",
 *             "description": "读取用户、校验密码、写入 Session。"
 *           },
 *           {
 *             "key": "register",
 *             "title": "注册接口",
 *             "description": "校验重复邮箱、创建用户、写入 Session。"
 *           }
 *         ],
 *         "itemKey": "key",
 *         "titlePath": "title",
 *         "descriptionPath": "description",
 *         "variant": "card",
 *         "size": "md",
 *         "emptyText": "暂无数据",
 *         "disabled": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/blocks/MActionCardList.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mActionCardListEditorTool = defineEditorTool<MActionCardListProps>({
  getDataFields: getActionCardListDataFields,
  normalizeProps: normalizeActionCardListProps,
  serialize: (props) => {
    const normalized = normalizeActionCardListProps(props);
    return {
      items: normalizeItemsConfig(normalized.items),
      itemKey: normalized.itemKey,
      titlePath: normalized.titlePath,
      descriptionPath: normalized.descriptionPath,
      ...(normalized.activeKey !== null ? { activeKey: normalized.activeKey } : {}),
      variant: normalized.variant,
      size: normalized.size,
      emptyText: normalized.emptyText,
      ...(normalized.disabled ? { disabled: true } : {})
    };
  }
});
</script>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import PageDslBlock from '@/blocks/PageDslBlock.vue';
import type { PageDslCallbacks } from '@/blocks/pageDslEditorTools';
import { PageRuntimeVariableContextKey } from '@/utils/pageRuntimeContext';
import { resolveRuntimeValue, type VariableValueResolveContext } from '@/utils/variableValue';

const props = defineProps<MActionCardListProps & PageDslCallbacks<MActionCardListProps>>();
const emit = defineEmits<{
  (event: 'select', payload: MActionCardListEventPayload): void;
  (event: 'click', payload: MActionCardListEventPayload): void;
}>();

const pageVariableContext = inject(PageRuntimeVariableContextKey, computed<VariableValueResolveContext>(() => ({})));
const runtimeItems = ref<unknown[] | null>(null);
const runtimeActiveKey = ref<MActionCardListKey | null>(normalizeActiveKey(props.activeKey));

const normalizedProps = computed(() => normalizeActionCardListProps(props));

watch(
  () => props.activeKey,
  (value) => {
    runtimeActiveKey.value = normalizeActiveKey(value);
  }
);

watch(
  () => props.items,
  () => {
    runtimeItems.value = null;
  },
  { deep: true }
);

const sourceItems = computed(() => {
  if (runtimeItems.value) return runtimeItems.value;

  const resolved = resolveRuntimeValue(normalizedProps.value.items, pageVariableContext.value);
  return normalizeRuntimeItems(resolved);
});

const actionItems = computed<NormalizedActionCardItem[]>(() =>
  sourceItems.value.map((item, index) => normalizeActionItem(item, index, normalizedProps.value))
);

const selectedItem = computed(() => {
  const key = runtimeActiveKey.value;
  return actionItems.value.find((item) => item.key === key) ?? null;
});

const rootClass = computed(() => [
  'm-action-card-list',
  `m-action-card-list--${normalizedProps.value.variant}`,
  `m-action-card-list--${normalizedProps.value.size}`,
  {
    'm-action-card-list--disabled': normalizedProps.value.disabled
  }
]);

function normalizeRuntimeItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function readPath(value: unknown, path: string): unknown {
  if (!path.trim()) return undefined;
  return path
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<unknown>((current, part) => {
      if (isRecord(current)) return current[part];
      if (Array.isArray(current) && /^\d+$/.test(part)) return current[Number(part)];
      return undefined;
    }, value);
}

function valueToText(value: unknown, fallback = '') {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function valueToKey(value: unknown, fallback: MActionCardListKey): MActionCardListKey {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
}

function normalizeActionItem(
  item: unknown,
  index: number,
  config: MActionCardListProps
): NormalizedActionCardItem {
  const key = valueToKey(
    readPath(item, config.itemKey ?? actionCardListDefaults.itemKey),
    isRecord(item)
      ? valueToKey(item.uuid ?? item.id ?? item.key, index)
      : index
  );
  const title = valueToText(readPath(item, config.titlePath ?? actionCardListDefaults.titlePath), `项目 ${index + 1}`);
  const description = valueToText(readPath(item, config.descriptionPath ?? actionCardListDefaults.descriptionPath));
  const disabled = isRecord(item) ? booleanValue(item.disabled) : false;

  return {
    key,
    title,
    description,
    disabled,
    raw: item,
    index
  };
}

function emitStateChange() {
  const payload = {
    ...normalizedProps.value,
    activeKey: runtimeActiveKey.value
  };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
}

function buildEventPayload(item: NormalizedActionCardItem): MActionCardListEventPayload {
  return {
    item: item.raw,
    itemKey: item.key,
    index: item.index
  };
}

function handleItemClick(item: NormalizedActionCardItem) {
  if (normalizedProps.value.disabled || item.disabled) return;

  runtimeActiveKey.value = item.key;
  emitStateChange();

  if (normalizedProps.value.edit) return;

  const payload = buildEventPayload(item);
  emit('select', payload);
  emit('click', payload);
}

function getData() {
  return {
    items: sourceItems.value,
    activeKey: runtimeActiveKey.value,
    selectedItem: selectedItem.value?.raw ?? null
  };
}

function setItems(items: unknown) {
  runtimeItems.value = normalizeRuntimeItems(items);
  emitStateChange();
  return getData();
}

function setActive(key: unknown) {
  runtimeActiveKey.value = normalizeActiveKey(key);
  emitStateChange();
  return getData();
}

function clearActive() {
  runtimeActiveKey.value = null;
  emitStateChange();
  return getData();
}

defineExpose({
  getData,
  setItems,
  setActive,
  clearActive
});
</script>

<template>
  <PageDslBlock block-type="MActionCardList">
    <div :class="rootClass" data-testid="m-action-card-list" :data-block-id="currentBlockId || undefined">
      <p v-if="!actionItems.length" class="m-action-card-list__empty">
        {{ normalizedProps.emptyText }}
      </p>

      <button
        v-for="item in actionItems"
        :key="String(item.key)"
        type="button"
        class="m-action-card-list__item"
        :class="{ 'm-action-card-list__item--active': runtimeActiveKey === item.key }"
        :disabled="normalizedProps.disabled || item.disabled"
        :aria-pressed="runtimeActiveKey === item.key"
        data-testid="m-action-card-list-item"
        @click="handleItemClick(item)"
      >
        <span class="m-action-card-list__title">{{ item.title }}</span>
        <span v-if="item.description" class="m-action-card-list__description">{{ item.description }}</span>
      </button>
    </div>
  </PageDslBlock>
</template>

<style scoped>
.m-action-card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.m-action-card-list__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-height: 64px;
  padding: 12px 14px;
  color: #0f172a;
  text-align: left;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.m-action-card-list__item:hover:not(:disabled),
.m-action-card-list__item:focus-visible {
  border-color: #35d0b6;
  box-shadow: 0 0 0 3px rgb(45 212 191 / 16%);
  outline: none;
}

.m-action-card-list__item--active {
  background: #effdf8;
  border-color: #2dd4bf;
}

.m-action-card-list__item:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.m-action-card-list__title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}

.m-action-card-list__description {
  display: block;
  color: #53657f;
  font-size: 13px;
  line-height: 1.45;
}

.m-action-card-list--compact {
  gap: 6px;
}

.m-action-card-list--compact .m-action-card-list__item {
  min-height: 48px;
  padding: 9px 12px;
}

.m-action-card-list--sm .m-action-card-list__item {
  min-height: 52px;
  padding: 10px 12px;
}

.m-action-card-list--sm .m-action-card-list__title {
  font-size: 13px;
}

.m-action-card-list--sm .m-action-card-list__description {
  font-size: 12px;
}

.m-action-card-list--disabled {
  opacity: 0.8;
}

.m-action-card-list__empty {
  margin: 0;
  padding: 16px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
  border: 1px dashed #d9e2ef;
  border-radius: 8px;
}

:global(.dark) .m-action-card-list__item {
  color: #e5e7eb;
  background: #0f172a;
  border-color: #253247;
}

:global(.dark) .m-action-card-list__item--active {
  background: rgb(20 184 166 / 12%);
  border-color: #2dd4bf;
}

:global(.dark) .m-action-card-list__description,
:global(.dark) .m-action-card-list__empty {
  color: #94a3b8;
}
</style>
