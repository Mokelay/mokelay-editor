<script lang="ts">
import { computed, defineComponent, h } from 'vue';
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { getEditorComponentDefinition, getEditorComponentRegistry } from '@/editors/editorComponentRegistry';
import { i18n } from '@/i18n';

type TriggerOptions = Record<string, string[]>;

const defaultTriggerOptions: TriggerOptions = {
  '@': ['张三', '李四', '王五'],
  '#': ['高优先级', '普通', '低优先级'],
  '/': ['审批', '通知', '抄送']
};

// 高级输入框组件在编辑器中的属性定义。
export interface MAdvanceInputProps {
  edit: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
  triggerOptionsJson?: string;
}

export const mAdvanceInputEditorTool = defineEditorTool<MAdvanceInputProps>({
  toolbox: {
    get title() {
      return i18n.t('advanceInput.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9h10M7 14h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('advanceInput.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'label',
          label: i18n.t('advanceInput.properties.label'),
          placeholder: i18n.t('advanceInput.editLabelPlaceholder')
        },
        {
          key: 'placeholder',
          label: i18n.t('advanceInput.properties.placeholder'),
          placeholder: i18n.t('advanceInput.defaultPlaceholder')
        },
        {
          key: 'value',
          label: i18n.t('advanceInput.properties.value'),
          placeholder: i18n.t('advanceInput.properties.valuePlaceholder')
        },
        {
          key: 'triggerOptionsJson',
          label: i18n.t('advanceInput.properties.triggerOptionsJson'),
          placeholder: '{"@": ["张三"], "#": ["标签"]}'
        }
      ];
    }
  },
  createInitialProps: () => ({
    label: i18n.t('advanceInput.defaultLabel'),
    placeholder: i18n.t('advanceInput.defaultPlaceholder'),
    value: '',
    triggerOptionsJson: JSON.stringify(defaultTriggerOptions)
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    triggerOptionsJson: props.triggerOptionsJson ?? JSON.stringify(defaultTriggerOptions)
  }),
  serialize: (props) => ({
    label: props.label?.trim() ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    triggerOptionsJson: props.triggerOptionsJson ?? JSON.stringify(defaultTriggerOptions)
  })
});

function safeParseTriggerOptions(raw: string | undefined): TriggerOptions {
  if (!raw?.trim()) {
    return defaultTriggerOptions;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([key, value]) => typeof key === 'string' && Array.isArray(value))
        .map(([key, value]) => [key, value.filter((item): item is string => typeof item === 'string')])
    );
  } catch {
    return defaultTriggerOptions;
  }
}

function getInsertableCustomTools() {
  const registry = getEditorComponentRegistry();
  return Object.keys(registry).filter((toolName) => toolName !== 'MPage' && toolName !== 'MAdvanceInput');
}

function parseInsertedComponents(content: string) {
  const result: string[] = [];
  const regex = /\[\[component:([A-Za-z0-9_\-]+)\]\]/g;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(content)) !== null) {
    result.push(match[1]);
  }

  return result;
}

export const InsertedCustomComponent = defineComponent({
  name: 'InsertedCustomComponent',
  props: {
    toolName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const definition = computed(() => getEditorComponentDefinition(props.toolName));

    const renderProps = computed(() => {
      const toolDefinition = definition.value;
      if (!toolDefinition) {
        return null;
      }

      return toolDefinition.normalizeProps({
        ...(toolDefinition.createInitialProps?.() ?? {}),
        edit: false
      });
    });

    return () => {
      if (!definition.value || !renderProps.value) {
        return h('div', { class: 'text-xs text-amber-600' }, `未知组件：${props.toolName}`);
      }

      return h(definition.value.component, {
        ...renderProps.value,
        edit: false
      });
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();

const props = defineProps<MAdvanceInputProps & {
  onChange?: (payload: MAdvanceInputProps) => void;
  onToolChange?: (payload: MAdvanceInputProps) => void;
}>();

const activeStart = ref<number | null>(null);
const activeEnd = ref<number | null>(null);
const activeTrigger = ref<string | null>(null);
const activeKeyword = ref('');

const triggerOptions = computed(() => safeParseTriggerOptions(props.triggerOptionsJson));
const customComponents = computed(() => getInsertableCustomTools());

const parsedSuggestions = computed(() => {
  const trigger = activeTrigger.value;
  if (!trigger) return [];

  const keyword = activeKeyword.value.toLowerCase();
  const baseOptions = triggerOptions.value[trigger] ?? [];

  const normalItems = baseOptions
    .filter((item) => item.toLowerCase().includes(keyword))
    .map((item) => ({
      label: item,
      value: `${trigger}${item}`,
      type: 'normal' as const
    }));

  if (trigger !== '/') {
    return normalItems;
  }

  const componentItems = customComponents.value
    .filter((name) => name.toLowerCase().includes(keyword))
    .map((name) => ({
      label: `组件: ${name}`,
      value: `[[component:${name}]]`,
      type: 'component' as const
    }));

  return [...normalItems, ...componentItems];
});

const shouldShowSuggestions = computed(() => parsedSuggestions.value.length > 0 && activeStart.value !== null && activeEnd.value !== null);
const insertedComponents = computed(() => parseInsertedComponents(props.value ?? ''));

function emitChange(payload: Partial<MAdvanceInputProps>) {
  const nextPayload = {
    edit: props.edit,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    triggerOptionsJson: props.triggerOptionsJson ?? '',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function closeSuggestion() {
  activeStart.value = null;
  activeEnd.value = null;
  activeTrigger.value = null;
  activeKeyword.value = '';
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emitChange({ value: target.value });
  detectTrigger(target);
}

function detectTrigger(target: HTMLTextAreaElement) {
  const value = target.value;
  const cursor = target.selectionStart ?? value.length;
  const beforeCursor = value.slice(0, cursor);
  const triggerMatch = beforeCursor.match(/(?:^|\s)([@/#])([^\s@/#]*)$/);

  if (!triggerMatch) {
    closeSuggestion();
    return;
  }

  const fullToken = triggerMatch[0];
  const trigger = triggerMatch[1];
  const keyword = triggerMatch[2] ?? '';
  const start = cursor - fullToken.length + (fullToken.startsWith(' ') ? 1 : 0);

  activeStart.value = start;
  activeEnd.value = cursor;
  activeTrigger.value = trigger;
  activeKeyword.value = keyword;
}

function replaceRange(source: string, start: number, end: number, replacement: string) {
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function applySuggestion(value: string) {
  if (activeStart.value === null || activeEnd.value === null) return;
  const source = props.value ?? '';
  const next = replaceRange(source, activeStart.value, activeEnd.value, `${value} `);
  emitChange({ value: next });
  closeSuggestion();
}
</script>

<template>
  <div class="ce-advance-input-tool">
    <input
      v-if="edit"
      class="ce-advance-input-tool__label"
      type="text"
      :placeholder="t('advanceInput.editLabelPlaceholder')"
      :value="label"
      @input="emitChange({ label: ($event.target as HTMLInputElement).value })"
    />
    <div v-else class="ce-advance-input-tool__label">{{ label }}</div>

    <div class="ce-advance-input-tool__editor-wrapper">
      <textarea
        class="ce-advance-input-tool__control"
        rows="4"
        :placeholder="placeholder"
        :value="value"
        @input="handleInput"
        @click="detectTrigger($event.target as HTMLTextAreaElement)"
        @keyup="detectTrigger($event.target as HTMLTextAreaElement)"
        @blur="closeSuggestion"
      ></textarea>

      <ul v-if="shouldShowSuggestions" class="ce-advance-input-tool__suggestions">
        <li
          v-for="item in parsedSuggestions"
          :key="`${item.type}-${item.value}`"
          class="ce-advance-input-tool__suggestion-item"
          @mousedown.prevent="applySuggestion(item.value)"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>

    <div v-if="insertedComponents.length" class="ce-advance-input-tool__inserted-components">
      <div class="ce-advance-input-tool__inserted-title">{{ t('advanceInput.insertedTitle') }}</div>
      <div class="space-y-2">
        <InsertedCustomComponent
          v-for="(toolName, index) in insertedComponents"
          :key="`${toolName}-${index}`"
          :tool-name="toolName"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ce-advance-input-tool { display: flex; flex-direction: column; gap: 0.5rem; }
.ce-advance-input-tool__label { font-size: 0.875rem; color: rgb(51 65 85); }
.ce-advance-input-tool__control {
  width: 100%; border: 1px solid rgb(203 213 225); border-radius: 0.5rem;
  padding: 0.5rem 0.75rem; background: white; min-height: 4.5rem;
}
.ce-advance-input-tool__editor-wrapper { position: relative; }
.ce-advance-input-tool__suggestions {
  position: absolute; top: calc(100% + 0.25rem); left: 0; width: 100%; max-height: 10rem; overflow: auto;
  border: 1px solid rgb(203 213 225); border-radius: 0.5rem; background: white; z-index: 10;
}
.ce-advance-input-tool__suggestion-item { padding: 0.4rem 0.65rem; cursor: pointer; font-size: 0.875rem; }
.ce-advance-input-tool__suggestion-item:hover { background: rgb(241 245 249); }
.ce-advance-input-tool__inserted-components {
  border: 1px dashed rgb(203 213 225); border-radius: 0.5rem; padding: 0.5rem;
}
.ce-advance-input-tool__inserted-title { font-size: 0.75rem; color: rgb(100 116 139); margin-bottom: 0.5rem; }
</style>
