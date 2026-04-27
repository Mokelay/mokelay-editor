<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MAdvanceInputProps {
  edit: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
  atOptions?: string;
  slashOptions?: string;
  hashOptions?: string;
}

function serializeOptions(raw: string[] = []) {
  return JSON.stringify(raw, null, 2);
}

export const mAdvanceInputEditorTool = defineEditorTool<MAdvanceInputProps>({
  toolbox: {
    get title() {
      return i18n.t('advanceInput.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h12M4 18h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="18" r="2" fill="currentColor"/></svg>'
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
          key: 'atOptions',
          label: i18n.t('advanceInput.properties.atOptions'),
          placeholder: '["alice", "bob"]'
        },
        {
          key: 'slashOptions',
          label: i18n.t('advanceInput.properties.slashOptions'),
          placeholder: '["help", "todo"]'
        },
        {
          key: 'hashOptions',
          label: i18n.t('advanceInput.properties.hashOptions'),
          placeholder: '["urgent", "feature"]'
        }
      ];
    }
  },
  createInitialProps: () => ({
    label: i18n.t('advanceInput.defaultLabel'),
    placeholder: i18n.t('advanceInput.defaultPlaceholder'),
    value: '',
    atOptions: serializeOptions(['alice', 'bob', 'charlie']),
    slashOptions: serializeOptions(['help', 'todo', 'date']),
    hashOptions: serializeOptions(['urgent', 'frontend', 'backend'])
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    atOptions: props.atOptions ?? '[]',
    slashOptions: props.slashOptions ?? '[]',
    hashOptions: props.hashOptions ?? '[]'
  }),
  serialize: (props) => ({
    label: props.label?.trim() ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    atOptions: props.atOptions ?? '[]',
    slashOptions: props.slashOptions ?? '[]',
    hashOptions: props.hashOptions ?? '[]'
  })
});

</script>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useI18n } from '@/i18n';
import {
  getEditorComponentDefinition,
  getEditorComponentRegistry
} from '@/editors/editorComponentRegistry';

const props = defineProps<MAdvanceInputProps & {
  onChange?: (payload: MAdvanceInputProps) => void;
  onToolChange?: (payload: MAdvanceInputProps) => void;
}>();

const { t } = useI18n();
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const dropdownVisible = ref(false);
const activeTrigger = ref<'@' | '/' | '#' | null>(null);
const activeKeyword = ref('');
const triggerStartIndex = ref(-1);

type AdvanceSuggestion = {
  type: 'text' | 'component';
  trigger: '@' | '/' | '#';
  label: string;
  value: string;
};

function parseOptions(raw: string | undefined) {
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function resolveComponentSuggestions() {
  return Object.keys(getEditorComponentRegistry())
    .filter((name) => name !== 'MAdvanceInput')
    .map((name) => ({
      type: 'component' as const,
      trigger: '/' as const,
      label: name,
      value: `{{component:${name}}}`
    }));
}

function searchableSuggestions(
  trigger: '@' | '/' | '#',
  keyword: string,
  atValues: string[],
  slashValues: string[],
  hashValues: string[]
): AdvanceSuggestion[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const matches = (value: string) =>
    value.toLowerCase().includes(normalizedKeyword);

  if (trigger === '@') {
    return atValues.filter(matches).map((item) => ({
      type: 'text',
      trigger,
      label: `${trigger}${item}`,
      value: `${trigger}${item}`
    }));
  }

  if (trigger === '#') {
    return hashValues.filter(matches).map((item) => ({
      type: 'text',
      trigger,
      label: `${trigger}${item}`,
      value: `${trigger}${item}`
    }));
  }

  const slashText = slashValues.filter(matches).map((item) => ({
    type: 'text' as const,
    trigger,
    label: `${trigger}${item}`,
    value: `${trigger}${item}`
  }));
  const componentOptions = resolveComponentSuggestions().filter((item) =>
    matches(item.label.toLowerCase())
  );

  return [...slashText, ...componentOptions];
}

function extractComponentTokens(value: string) {
  const result: string[] = [];
  const regExp = /\{\{component:([^}]+)\}\}/g;
  let match = regExp.exec(value);
  while (match) {
    if (match[1]) result.push(match[1]);
    match = regExp.exec(value);
  }
  return result;
}

function buildComponentProps(componentName: string) {
  const definition = getEditorComponentDefinition(componentName);
  if (!definition) return null;
  return {
    component: definition.component,
    props: definition.normalizeProps({
      ...(definition.createInitialProps?.() ?? {}),
      edit: false
    })
  };
}

const labelText = computed(() => props.label ?? '');
const atOptions = computed(() => parseOptions(props.atOptions));
const slashOptions = computed(() => parseOptions(props.slashOptions));
const hashOptions = computed(() => parseOptions(props.hashOptions));

const suggestions = computed(() => {
  if (!activeTrigger.value) return [];
  return searchableSuggestions(
    activeTrigger.value,
    activeKeyword.value,
    atOptions.value,
    slashOptions.value,
    hashOptions.value
  );
});

const customComponents = computed(() =>
  extractComponentTokens(props.value ?? '')
    .map((name) => ({ name, detail: buildComponentProps(name) }))
    .filter((item) => Boolean(item.detail))
);

function emitChange(payload: Partial<MAdvanceInputProps>) {
  const nextPayload = {
    edit: props.edit,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    atOptions: props.atOptions ?? '[]',
    slashOptions: props.slashOptions ?? '[]',
    hashOptions: props.hashOptions ?? '[]',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function analyzeTrigger(input: string, cursorPosition: number) {
  const text = input.slice(0, cursorPosition);
  const match = text.match(/(^|\s)([@/#])([^\s@/#]*)$/);

  if (!match || !match[2]) {
    dropdownVisible.value = false;
    activeTrigger.value = null;
    activeKeyword.value = '';
    triggerStartIndex.value = -1;
    return;
  }

  activeTrigger.value = match[2] as '@' | '/' | '#';
  activeKeyword.value = match[3] ?? '';
  triggerStartIndex.value = cursorPosition - activeKeyword.value.length - 1;
  dropdownVisible.value = true;
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  const nextValue = target.value;
  emitChange({ value: nextValue });
  analyzeTrigger(nextValue, target.selectionStart ?? nextValue.length);
}

function handleCursorChange() {
  const textarea = textareaRef.value;
  if (!textarea) return;
  const currentValue = textarea.value;
  analyzeTrigger(currentValue, textarea.selectionStart ?? currentValue.length);
}

function applySuggestion(item: AdvanceSuggestion) {
  const textarea = textareaRef.value;
  const currentValue = props.value ?? '';
  if (!textarea || triggerStartIndex.value < 0) return;

  const cursorPos = textarea.selectionStart ?? currentValue.length;
  const startIndex = triggerStartIndex.value;
  const nextValue = `${currentValue.slice(0, startIndex)}${item.value} ${currentValue.slice(cursorPos)}`;
  emitChange({ value: nextValue });

  dropdownVisible.value = false;
  activeTrigger.value = null;
  activeKeyword.value = '';
  triggerStartIndex.value = -1;

  nextTick(() => {
    const nextCursor = startIndex + item.value.length + 1;
    textarea.focus();
    textarea.setSelectionRange(nextCursor, nextCursor);
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
    <div v-else class="ce-advance-input__label">{{ labelText }}</div>

    <div class="ce-advance-input__editor">
      <textarea
        ref="textareaRef"
        class="ce-advance-input__control"
        :placeholder="placeholder"
        :value="value"
        @input="handleInput"
        @click="handleCursorChange"
        @keyup="handleCursorChange"
      />

      <ul v-if="dropdownVisible && suggestions.length" class="ce-advance-input__dropdown">
        <li
          v-for="item in suggestions"
          :key="`${item.type}-${item.value}`"
          class="ce-advance-input__dropdown-item"
          @mousedown.prevent="applySuggestion(item)"
        >
          <span>{{ item.label }}</span>
          <small v-if="item.type === 'component'">{{ t('advanceInput.componentTag') }}</small>
        </li>
      </ul>
    </div>

    <div v-if="!edit && customComponents.length" class="ce-advance-input__preview">
      <div class="ce-advance-input__preview-title">{{ t('advanceInput.customPreviewTitle') }}</div>
      <div v-for="(item, index) in customComponents" :key="`${item.name}-${index}`" class="ce-advance-input__preview-item">
        <component :is="item.detail?.component" v-if="item.detail" v-bind="item.detail.props" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ce-advance-input {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-advance-input__label {
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.ce-advance-input__editor {
  position: relative;
}

.ce-advance-input__control {
  width: 100%;
  min-height: 88px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
}

.ce-advance-input__control:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
}

.ce-advance-input__dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 20;
  max-height: 220px;
  overflow: auto;
  margin: 0;
  padding: 4px;
  list-style: none;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
}

.ce-advance-input__dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
}

.ce-advance-input__dropdown-item:hover {
  background: #eef2ff;
}

.ce-advance-input__preview {
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 8px;
}

.ce-advance-input__preview-title {
  margin-bottom: 8px;
  font-size: 12px;
  color: #64748b;
}

.ce-advance-input__preview-item {
  margin-bottom: 8px;
}
</style>
