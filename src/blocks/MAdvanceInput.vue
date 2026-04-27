<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type TriggerChar = '@' | '/' | '#';

export type TriggerOption = {
  label: string;
  value: string;
  trigger?: TriggerChar;
};

export interface MAdvanceInputProps {
  edit: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
  triggerOptions?: string;
  componentOptions?: string;
}

const DEFAULT_TRIGGER_OPTIONS: Record<TriggerChar, TriggerOption[]> = {
  '@': [
    { label: '当前用户', value: '@currentUser' },
    { label: '负责人', value: '@owner' }
  ],
  '#': [
    { label: '#状态', value: '#status' },
    { label: '#优先级', value: '#priority' }
  ],
  '/': []
};

const DEFAULT_COMPONENT_OPTIONS = ['MInput', 'MPage'];

export const mAdvanceInputEditorTool = defineEditorTool<MAdvanceInputProps>({
  toolbox: {
    get title() {
      return i18n.t('advanceInput.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/></svg>'
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
          key: 'componentOptions',
          label: i18n.t('advanceInput.properties.componentOptions'),
          placeholder: i18n.t('advanceInput.properties.componentOptionsPlaceholder')
        },
        {
          key: 'triggerOptions',
          label: i18n.t('advanceInput.properties.triggerOptions'),
          placeholder: i18n.t('advanceInput.properties.triggerOptionsPlaceholder')
        }
      ];
    }
  },
  createInitialProps: () => ({
    label: i18n.t('advanceInput.defaultLabel'),
    placeholder: i18n.t('advanceInput.defaultPlaceholder'),
    value: '',
    componentOptions: DEFAULT_COMPONENT_OPTIONS.join(','),
    triggerOptions: JSON.stringify(DEFAULT_TRIGGER_OPTIONS)
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    componentOptions: props.componentOptions ?? DEFAULT_COMPONENT_OPTIONS.join(','),
    triggerOptions: props.triggerOptions ?? JSON.stringify(DEFAULT_TRIGGER_OPTIONS)
  }),
  serialize: (props) => ({
    label: props.label?.trim() ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    componentOptions: props.componentOptions ?? '',
    triggerOptions: props.triggerOptions ?? ''
  })
});
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/i18n';

const props = defineProps<MAdvanceInputProps & {
  onChange?: (payload: MAdvanceInputProps) => void;
  onToolChange?: (payload: MAdvanceInputProps) => void;
}>();

const { t } = useI18n();
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showSuggestions = ref(false);
const activeTrigger = ref<TriggerChar | null>(null);
const activeQuery = ref('');
const replaceRange = ref<{ start: number; end: number } | null>(null);

const labelText = computed(() => props.label ?? '');

function emitChange(payload: Partial<MAdvanceInputProps>) {
  const nextPayload = {
    edit: props.edit,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    componentOptions: props.componentOptions ?? '',
    triggerOptions: props.triggerOptions ?? '',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function parseTriggerOptions(raw: string | undefined): Record<TriggerChar, TriggerOption[]> {
  try {
    const parsed = JSON.parse(raw ?? '{}') as Partial<Record<TriggerChar, TriggerOption[]>>;
    return {
      '@': Array.isArray(parsed['@']) ? parsed['@'] : [],
      '#': Array.isArray(parsed['#']) ? parsed['#'] : [],
      '/': Array.isArray(parsed['/']) ? parsed['/'] : []
    };
  } catch {
    return { '@': [], '#': [], '/': [] };
  }
}

const componentOptions = computed(() => {
  return (props.componentOptions ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({
      label: `${name} (${t('advanceInput.componentTag')})`,
      value: `{{component:${name}}}`,
      trigger: '/' as const
    }));
});

const candidateOptions = computed(() => {
  if (!activeTrigger.value) return [];
  const optionsByTrigger = parseTriggerOptions(props.triggerOptions);
  const options = [
    ...optionsByTrigger[activeTrigger.value],
    ...(activeTrigger.value === '/' ? componentOptions.value : [])
  ];
  const query = activeQuery.value.trim().toLowerCase();
  if (!query) return options;
  return options.filter((item) => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query));
});

function closeSuggestion() {
  showSuggestions.value = false;
  activeTrigger.value = null;
  activeQuery.value = '';
  replaceRange.value = null;
}

function updateSuggestionState() {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const cursor = textarea.selectionStart;
  const text = textarea.value.slice(0, cursor);
  const matched = text.match(/(^|\s)([@/#])([^\s@/#]*)$/);
  if (!matched) {
    closeSuggestion();
    return;
  }

  const trigger = matched[2] as TriggerChar;
  const query = matched[3] ?? '';
  const matchedText = matched[0].trimStart();
  const start = cursor - matchedText.length;

  activeTrigger.value = trigger;
  activeQuery.value = query;
  replaceRange.value = { start, end: cursor };
  showSuggestions.value = true;
}

function handleInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value;
  emitChange({ value });
  updateSuggestionState();
}

function insertOption(option: TriggerOption) {
  const textarea = textareaRef.value;
  const currentValue = props.value ?? '';
  const range = replaceRange.value;
  if (!textarea || !range) return;

  const nextValue = `${currentValue.slice(0, range.start)}${option.value} ${currentValue.slice(range.end)}`;
  emitChange({ value: nextValue });
  closeSuggestion();

  requestAnimationFrame(() => {
    textarea.focus();
    const caret = range.start + option.value.length + 1;
    textarea.setSelectionRange(caret, caret);
  });
}

function handleBlur() {
  window.setTimeout(closeSuggestion, 100);
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
    <div v-else class="ce-advance-input-tool__label">
      {{ labelText }}
    </div>

    <div class="ce-advance-input-tool__editor-wrap">
      <textarea
        ref="textareaRef"
        class="ce-advance-input-tool__editor"
        :placeholder="placeholder"
        :readonly="!edit"
        :value="value"
        @input="handleInput"
        @keyup="updateSuggestionState"
        @click="updateSuggestionState"
        @blur="handleBlur"
      />

      <div v-if="edit && showSuggestions && candidateOptions.length" class="ce-advance-input-tool__suggestion">
        <button
          v-for="item in candidateOptions"
          :key="`${item.value}-${item.label}`"
          type="button"
          class="ce-advance-input-tool__suggestion-item"
          @mousedown.prevent="insertOption(item)"
        >
          <span>{{ item.label }}</span>
          <small>{{ item.value }}</small>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ce-advance-input-tool {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-advance-input-tool__label,
.ce-advance-input-tool__editor {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.6);
  border-radius: 8px;
  padding: 8px 10px;
  background-color: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-advance-input-tool__editor {
  min-height: 112px;
  resize: vertical;
}

.ce-advance-input-tool__label:focus,
.ce-advance-input-tool__editor:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.15);
}

.ce-advance-input-tool__editor-wrap {
  position: relative;
}

.ce-advance-input-tool__suggestion {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 10px;
  background: rgb(255 255 255);
  box-shadow: 0 16px 30px rgb(15 23 42 / 0.16);
  max-height: 220px;
  overflow: auto;
}

.ce-advance-input-tool__suggestion-item {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}

.ce-advance-input-tool__suggestion-item:hover {
  background: rgb(238 242 255);
}

.ce-advance-input-tool__suggestion-item small {
  color: rgb(100 116 139);
}
</style>
