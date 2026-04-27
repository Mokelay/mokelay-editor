<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type AdvanceInputSuggestionItem = {
  label: string;
  value: string;
  type?: 'text' | 'component';
};

export interface MAdvanceInputProps {
  edit: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
  triggerConfig?: string;
  componentOptions?: string;
}

export const mAdvanceInputEditorTool = defineEditorTool<MAdvanceInputProps>({
  toolbox: {
    get title() {
      return i18n.t('advanceInput.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="12" r="1.5" fill="currentColor"/></svg>'
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
          placeholder: i18n.t('advanceInput.defaultLabel')
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
          key: 'triggerConfig',
          label: i18n.t('advanceInput.properties.triggerConfig'),
          placeholder: i18n.t('advanceInput.defaultTriggerConfig')
        },
        {
          key: 'componentOptions',
          label: i18n.t('advanceInput.properties.componentOptions'),
          placeholder: i18n.t('advanceInput.defaultComponentOptions')
        }
      ];
    }
  },
  createInitialProps: () => ({
    label: i18n.t('advanceInput.defaultLabel'),
    placeholder: i18n.t('advanceInput.defaultPlaceholder'),
    value: '',
    triggerConfig: '{"@":["张三","李四"],"#":["bug","需求"]}',
    componentOptions: '["MInput","MPage"]'
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    triggerConfig: props.triggerConfig ?? '',
    componentOptions: props.componentOptions ?? ''
  }),
  serialize: (props) => ({
    label: props.label?.trim() ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    triggerConfig: props.triggerConfig ?? '',
    componentOptions: props.componentOptions ?? ''
  })
});
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/i18n';

defineOptions({
  name: 'MAdvanceInput'
});

const props = defineProps<MAdvanceInputProps & {
  onChange?: (payload: MAdvanceInputProps) => void;
  onToolChange?: (payload: MAdvanceInputProps) => void;
}>();

const { t } = useI18n();

type TriggerKey = '@' | '#' | '/';
type TriggerConfigMap = Record<TriggerKey, AdvanceInputSuggestionItem[]>;

type SuggestionMatch = {
  trigger: TriggerKey;
  query: string;
  start: number;
  end: number;
};

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const menuVisible = ref(false);
const activeMatch = ref<SuggestionMatch | null>(null);

const defaultTriggerConfig: TriggerConfigMap = {
  '@': [
    { label: '@张三', value: '@张三', type: 'text' },
    { label: '@李四', value: '@李四', type: 'text' }
  ],
  '#': [
    { label: '#bug', value: '#bug', type: 'text' },
    { label: '#需求', value: '#需求', type: 'text' }
  ],
  '/': []
};

const parsedComponentOptions = computed<AdvanceInputSuggestionItem[]>(() => {
  const fallback = ['MInput', 'MPage'];
  const fromProps = parseJsonArray(props.componentOptions, fallback);
  return fromProps.map((item) => ({
    label: `${item}`,
    value: `{{component:${item}}}`,
    type: 'component' as const
  }));
});

const mergedTriggerConfig = computed<TriggerConfigMap>(() => {
  const parsed = parseTriggerConfig(props.triggerConfig);
  return {
    '@': parsed['@'],
    '#': parsed['#'],
    '/': [...parsed['/'], ...parsedComponentOptions.value]
  };
});

const filteredSuggestions = computed(() => {
  if (!activeMatch.value) return [];
  const source = mergedTriggerConfig.value[activeMatch.value.trigger] ?? [];
  const query = activeMatch.value.query.toLowerCase();

  return source.filter((item) => {
    if (!query) return true;
    return item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query);
  });
});

const renderedTokens = computed(() => tokenizeValue(props.value ?? ''));

function parseJsonArray(input: string | undefined, fallback: string[]) {
  if (!input) return fallback;
  try {
    const parsed = JSON.parse(input) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return fallback;
  }
}

function parseTriggerConfig(raw: string | undefined): TriggerConfigMap {
  const normalized: TriggerConfigMap = {
    '@': [...defaultTriggerConfig['@']],
    '#': [...defaultTriggerConfig['#']],
    '/': [...defaultTriggerConfig['/']]
  };

  if (!raw) return normalized;

  try {
    const parsed = JSON.parse(raw) as Partial<Record<TriggerKey, unknown>>;
    (['@', '#', '/'] as const).forEach((key) => {
      const list = parsed[key];
      if (!Array.isArray(list)) return;
      const normalizedList = list
        .map((item) => normalizeSuggestionItem(item, key))
        .filter((item): item is AdvanceInputSuggestionItem => item !== null);
      normalized[key] = normalizedList;
    });
  } catch {
    return normalized;
  }

  return normalized;
}

function normalizeSuggestionItem(item: unknown, trigger: TriggerKey): AdvanceInputSuggestionItem | null {
  if (typeof item === 'string') {
    const prefixed = item.startsWith(trigger) ? item : `${trigger}${item}`;
    return {
      label: prefixed,
      value: prefixed,
      type: 'text' as const
    };
  }

  if (typeof item === 'object' && item !== null) {
    const candidate = item as Partial<AdvanceInputSuggestionItem>;
    if (typeof candidate.label === 'string' && typeof candidate.value === 'string') {
      return {
        label: candidate.label,
        value: candidate.value,
        type: candidate.type === 'component' ? 'component' : 'text'
      };
    }
  }

  return null;
}

function tokenizeValue(value: string) {
  const regex = /\{\{component:([^}]+)\}\}/g;
  const tokens: Array<{ type: 'text' | 'component'; text: string }> = [];
  let lastIndex = 0;

  for (const match of value.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: 'text', text: value.slice(lastIndex, index) });
    }

    tokens.push({ type: 'component', text: match[1] ?? '' });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < value.length) {
    tokens.push({ type: 'text', text: value.slice(lastIndex) });
  }

  return tokens;
}

function emitChange(payload: Partial<MAdvanceInputProps>) {
  const nextPayload: MAdvanceInputProps = {
    edit: props.edit,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    triggerConfig: props.triggerConfig ?? '',
    componentOptions: props.componentOptions ?? '',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emitChange({ value: target.value });
  updateSuggestionState(target.value, target.selectionStart ?? target.value.length);
}

function handleCursorChange(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  updateSuggestionState(target.value, target.selectionStart ?? target.value.length);
}

function updateSuggestionState(value: string, cursorIndex: number) {
  const head = value.slice(0, cursorIndex);
  const match = head.match(/(^|\s)([@/#])([^\s@/#]*)$/);

  if (!match) {
    menuVisible.value = false;
    activeMatch.value = null;
    return;
  }

  const trigger = match[2] as TriggerKey;
  const query = match[3] ?? '';
  const start = cursorIndex - (`${trigger}${query}`).length;

  activeMatch.value = {
    trigger,
    query,
    start,
    end: cursorIndex
  };

  menuVisible.value = true;
}

function applySuggestion(item: AdvanceInputSuggestionItem) {
  if (!activeMatch.value) return;
  const currentValue = props.value ?? '';
  const before = currentValue.slice(0, activeMatch.value.start);
  const after = currentValue.slice(activeMatch.value.end);
  const inserted = item.type === 'component' ? `${item.value} ` : `${item.value} `;
  const nextValue = `${before}${inserted}${after}`;

  emitChange({ value: nextValue });
  menuVisible.value = false;
  activeMatch.value = null;

  requestAnimationFrame(() => {
    if (!textareaRef.value) return;
    const nextCursor = before.length + inserted.length;
    textareaRef.value.focus();
    textareaRef.value.setSelectionRange(nextCursor, nextCursor);
  });
}
</script>

<template>
  <div class="ce-advance-input">
    <input
      v-if="edit"
      class="ce-advance-input__label"
      type="text"
      :placeholder="t('advanceInput.editLabelPlaceholder')"
      :value="label"
      @input="emitChange({ label: ($event.target as HTMLInputElement).value })"
    />
    <div v-else class="ce-advance-input__label">
      {{ label }}
    </div>

    <div class="ce-advance-input__body">
      <textarea
        v-if="edit"
        ref="textareaRef"
        class="ce-advance-input__control"
        :placeholder="placeholder"
        :value="value"
        rows="4"
        @input="handleInput"
        @click="handleCursorChange"
        @keyup="handleCursorChange"
      ></textarea>

      <div v-else class="ce-advance-input__preview">
        <template v-for="(token, index) in renderedTokens" :key="`token-${index}`">
          <span v-if="token.type === 'text'">{{ token.text }}</span>
          <span v-else class="ce-advance-input__component-tag">{{ token.text }}</span>
        </template>
      </div>

      <ul v-if="edit && menuVisible && filteredSuggestions.length" class="ce-advance-input__menu">
        <li
          v-for="item in filteredSuggestions"
          :key="`${item.type}-${item.value}`"
          class="ce-advance-input__menu-item"
          @mousedown.prevent="applySuggestion(item)"
        >
          <span>{{ item.label }}</span>
          <small v-if="item.type === 'component'">{{ t('advanceInput.componentTag') }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.ce-advance-input {
  position: relative;
  display: grid;
  gap: 8px;
}

.ce-advance-input__label {
  width: 100%;
  border: none;
  border-bottom: 1px dashed #d4d4d8;
  background: transparent;
  font-size: 14px;
  line-height: 20px;
  color: #334155;
}

.ce-advance-input__label:focus {
  outline: none;
  border-bottom-color: #6366f1;
}

.ce-advance-input__body {
  position: relative;
}

.ce-advance-input__control,
.ce-advance-input__preview {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #d4d4d8;
  background-color: #fff;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 20px;
  min-height: 92px;
  box-sizing: border-box;
}

.ce-advance-input__control:focus {
  outline: 2px solid #818cf8;
  outline-offset: 1px;
}

.ce-advance-input__preview {
  white-space: pre-wrap;
  color: #334155;
}

.ce-advance-input__component-tag {
  display: inline-flex;
  align-items: center;
  margin: 0 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid #c4b5fd;
  background: #ede9fe;
  color: #5b21b6;
  font-size: 12px;
}

.ce-advance-input__menu {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 20;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #fff;
  box-shadow: 0 8px 30px rgb(15 23 42 / 12%);
  max-height: 180px;
  overflow: auto;
}

.ce-advance-input__menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: #0f172a;
  cursor: pointer;
}

.ce-advance-input__menu-item:hover {
  background: #e2e8f0;
}

.ce-advance-input__menu-item small {
  color: #64748b;
}
</style>
