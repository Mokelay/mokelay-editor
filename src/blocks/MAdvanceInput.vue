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
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from '@/i18n';

const props = defineProps<MAdvanceInputProps & {
  onChange?: (payload: MAdvanceInputProps) => void;
  onToolChange?: (payload: MAdvanceInputProps) => void;
}>();

const { t } = useI18n();
const editorRef = ref<HTMLDivElement | null>(null);
const showSuggestions = ref(false);
const activeTrigger = ref<TriggerChar | null>(null);
const activeQuery = ref('');
const replaceRange = ref<{ node: Text; start: number; end: number } | null>(null);
const localValue = ref(props.value ?? '');

const labelText = computed(() => props.label ?? '');

function emitChange(payload: Partial<MAdvanceInputProps>) {
  const nextPayload = {
    edit: props.edit,
    label: props.label ?? '',
    placeholder: props.placeholder ?? '',
    value: props.value ?? '',
    componentOptions: props.componentOptions ?? DEFAULT_COMPONENT_OPTIONS.join(','),
    triggerOptions: props.triggerOptions ?? JSON.stringify(DEFAULT_TRIGGER_OPTIONS),
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

function parseTriggerOptions(raw: string | undefined): Record<TriggerChar, TriggerOption[]> {
  try {
    const parsed = JSON.parse(raw ?? '{}') as Partial<Record<TriggerChar, TriggerOption[]>>;
    return {
      '@': Array.isArray(parsed['@']) ? parsed['@'] : DEFAULT_TRIGGER_OPTIONS['@'],
      '#': Array.isArray(parsed['#']) ? parsed['#'] : DEFAULT_TRIGGER_OPTIONS['#'],
      '/': Array.isArray(parsed['/']) ? parsed['/'] : DEFAULT_TRIGGER_OPTIONS['/']
    };
  } catch {
    return DEFAULT_TRIGGER_OPTIONS;
  }
}

const componentOptions = computed(() => {
  return (props.componentOptions ?? DEFAULT_COMPONENT_OPTIONS.join(','))
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

type RenderToken = {
  type: 'text' | 'tag' | 'component';
  value: string;
};

const renderedTokens = computed<RenderToken[]>(() => parseTokens(localValue.value));

function parseTokens(raw: string) {
  const tokens: RenderToken[] = [];
  const pattern = /(\{\{component:([a-zA-Z0-9_-]+)\}\}|[@#][^\s]+)/g;
  let lastIndex = 0;

  for (const matched of raw.matchAll(pattern)) {
    const fullText = matched[0];
    const matchedIndex = matched.index ?? 0;
    if (matchedIndex > lastIndex) {
      tokens.push({ type: 'text', value: raw.slice(lastIndex, matchedIndex) });
    }
    if (fullText.startsWith('{{component:')) {
      const componentName = matched[2] ?? '';
      tokens.push({ type: 'component', value: componentName });
    } else {
      tokens.push({ type: 'tag', value: fullText });
    }
    lastIndex = matchedIndex + fullText.length;
  }

  if (lastIndex < raw.length) {
    tokens.push({ type: 'text', value: raw.slice(lastIndex) });
  }
  if (!tokens.length) {
    tokens.push({ type: 'text', value: '' });
  }
  return tokens;
}

function serializeEditorContent() {
  const root = editorRef.value;
  if (!root) return localValue.value;

  let serialized = '';
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      serialized += node.textContent ?? '';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const token = element.dataset.token;
    const component = element.dataset.component;
    if (token) {
      serialized += `${token} `;
      return;
    }
    if (component) {
      serialized += `{{component:${component}}} `;
      return;
    }
    serialized += element.textContent ?? '';
  });
  return serialized.replace(/\u00a0/g, ' ');
}

function createTagNode(tagValue: string) {
  const tagNode = document.createElement('span');
  tagNode.className = 'ce-advance-input-tool__tag';
  tagNode.contentEditable = 'false';
  tagNode.dataset.token = tagValue;
  tagNode.textContent = tagValue;
  return tagNode;
}

function createComponentNode(componentName: string) {
  const componentNode = document.createElement('span');
  componentNode.className = 'ce-advance-input-tool__component';
  componentNode.contentEditable = 'false';
  componentNode.dataset.component = componentName;

  if (componentName === 'MInput') {
    const previewNode = document.createElement('div');
    previewNode.className = 'ce-advance-input-tool__component-preview ce-advance-input-tool__component-preview--input';

    const inputNode = document.createElement('input');
    inputNode.type = 'text';
    inputNode.disabled = true;
    inputNode.placeholder = t('input.defaultPlaceholder');
    inputNode.className = 'ce-advance-input-tool__component-input';
    previewNode.appendChild(inputNode);
    componentNode.appendChild(previewNode);
    return componentNode;
  }

  if (componentName === 'MPage') {
    const previewNode = document.createElement('div');
    previewNode.className = 'ce-advance-input-tool__component-preview ce-advance-input-tool__component-preview--page';
    previewNode.innerHTML = '<span></span><span></span><span></span>';
    componentNode.appendChild(previewNode);
    return componentNode;
  }

  const descNode = document.createElement('small');
  descNode.textContent = t('advanceInput.componentTag');
  componentNode.appendChild(descNode);
  return componentNode;
}

function isInputComponent(componentName: string) {
  return componentName === 'MInput';
}

function isPageComponent(componentName: string) {
  return componentName === 'MPage';
}

function renderEditorContent(value: string) {
  const root = editorRef.value;
  if (!root) return;

  const previousSerialized = serializeEditorContent();
  if (previousSerialized === value) return;

  root.innerHTML = '';
  const fragment = document.createDocumentFragment();
  parseTokens(value).forEach((token) => {
    if (token.type === 'text') {
      fragment.appendChild(document.createTextNode(token.value));
      return;
    }
    if (token.type === 'tag') {
      fragment.appendChild(createTagNode(token.value));
      fragment.appendChild(document.createTextNode(' '));
      return;
    }
    fragment.appendChild(createComponentNode(token.value));
    fragment.appendChild(document.createTextNode(' '));
  });
  root.appendChild(fragment);
}

watch(
  () => props.value,
  (nextValue) => {
    if (typeof nextValue !== 'string') return;
    if (nextValue !== localValue.value) {
      localValue.value = nextValue;
      renderEditorContent(nextValue);
    }
  },
  { immediate: true }
);

onMounted(() => {
  renderEditorContent(localValue.value);
});

function updateSuggestionState() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount || !selection.isCollapsed) {
    closeSuggestion();
    return;
  }

  const anchorNode = selection.anchorNode;
  if (!anchorNode || anchorNode.nodeType !== Node.TEXT_NODE) {
    closeSuggestion();
    return;
  }

  const textNode = anchorNode as Text;
  const cursor = selection.anchorOffset;
  const text = textNode.textContent?.slice(0, cursor) ?? '';
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
  replaceRange.value = { node: textNode, start, end: cursor };
  showSuggestions.value = true;
}

function handleInput(event: InputEvent) {
  const value = serializeEditorContent();
  localValue.value = value;
  emitChange({ value });
  updateSuggestionState();

  const shouldNormalizeNow = event.inputType === 'insertParagraph' || event.data === ' ' || event.data === '\n';
  if (shouldNormalizeNow && /(^|\s)[@#][^\s]+(?=\s|$)/.test(value)) {
    normalizeTokenRender();
    requestAnimationFrame(() => {
      moveCaretToEditorEnd();
    });
  }
}

function moveCaretToEditorEnd() {
  const root = editorRef.value;
  if (!root) return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function normalizeTokenRender() {
  const value = serializeEditorContent();
  localValue.value = value;
  renderEditorContent(value);
  emitChange({ value });
}

function handleEditorKeyup(event: KeyboardEvent) {
  updateSuggestionState();
  if (event.key === ' ' || event.key === 'Enter' || event.key === 'Tab') {
    normalizeTokenRender();
    requestAnimationFrame(() => {
      moveCaretToEditorEnd();
    });
  }
}

function insertOption(option: TriggerOption) {
  const root = editorRef.value;
  const range = replaceRange.value;
  if (!root || !range) return;

  const targetNode = range.node;
  const parent = targetNode.parentNode;
  if (!parent) return;

  const originText = targetNode.textContent ?? '';
  const beforeText = originText.slice(0, range.start);
  const afterText = originText.slice(range.end);
  const beforeNode = document.createTextNode(beforeText);
  const afterNode = document.createTextNode(afterText);
  const spacerNode = document.createTextNode(' ');

  const fragment = document.createDocumentFragment();
  fragment.appendChild(beforeNode);

  if (activeTrigger.value === '/') {
    const componentName = option.value.match(/\{\{component:([a-zA-Z0-9_-]+)\}\}/)?.[1] ?? option.label;
    fragment.appendChild(createComponentNode(componentName));
  } else {
    fragment.appendChild(createTagNode(option.value));
  }

  fragment.appendChild(spacerNode);
  fragment.appendChild(afterNode);
  parent.replaceChild(fragment, targetNode);

  const selection = window.getSelection();
  if (selection) {
    const caretRange = document.createRange();
    caretRange.setStart(spacerNode, spacerNode.textContent?.length ?? 1);
    caretRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caretRange);
  }

  const nextValue = serializeEditorContent();
  localValue.value = nextValue;
  emitChange({ value: nextValue });
  closeSuggestion();
  requestAnimationFrame(() => root.focus());
}

function handleBlur() {
  normalizeTokenRender();
  window.setTimeout(closeSuggestion, 100);
}

function handleFocus() {
  normalizeTokenRender();
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
      <div
        v-if="edit"
        ref="editorRef"
        class="ce-advance-input-tool__editor ce-advance-input-tool__editor--rich"
        contenteditable="true"
        :data-placeholder="placeholder"
        @input="handleInput"
        @keyup="handleEditorKeyup"
        @click="updateSuggestionState"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div v-else class="ce-advance-input-tool__editor ce-advance-input-tool__preview">
        <template v-for="(token, index) in renderedTokens" :key="`${token.type}-${index}-${token.value}`">
          <span v-if="token.type === 'text'">{{ token.value }}</span>
          <span v-else-if="token.type === 'tag'" class="ce-advance-input-tool__tag">{{ token.value }}</span>
          <span v-else class="ce-advance-input-tool__component">
            <template v-if="isInputComponent(token.value)">
              <div class="ce-advance-input-tool__component-preview ce-advance-input-tool__component-preview--input">
                <input class="ce-advance-input-tool__component-input" type="text" disabled :placeholder="t('input.defaultPlaceholder')" />
              </div>
            </template>
            <template v-else-if="isPageComponent(token.value)">
              <div class="ce-advance-input-tool__component-preview ce-advance-input-tool__component-preview--page">
                <span />
                <span />
                <span />
              </div>
            </template>
            <small v-else>{{ t('advanceInput.componentTag') }}</small>
          </span>
        </template>
      </div>

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
  white-space: pre-wrap;
  word-break: break-word;
}

.ce-advance-input-tool__editor--rich {
  cursor: text;
}

.ce-advance-input-tool__editor--rich:empty::before {
  content: attr(data-placeholder);
  color: rgb(148 163 184);
}

.ce-advance-input-tool__preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
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

.ce-advance-input-tool__tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  margin: 0 2px;
  border-radius: 999px;
  background: rgb(224 231 255);
  color: rgb(55 48 163);
  font-size: 12px;
  line-height: 18px;
}

.ce-advance-input-tool__component {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
  margin: 2px;
  padding: 8px 10px;
  border: 1px solid rgb(165 180 252);
  border-radius: 8px;
  background: rgb(238 242 255);
  color: rgb(49 46 129);
}

.ce-advance-input-tool__component small {
  color: rgb(79 70 229);
  font-size: 11px;
  line-height: 14px;
}

.ce-advance-input-tool__component-preview {
  border-radius: 6px;
  background: rgb(255 255 255 / 0.9);
  border: 1px dashed rgb(129 140 248);
  padding: 6px;
}

.ce-advance-input-tool__component-input {
  width: 100%;
  min-width: 120px;
  border: 1px solid rgb(199 210 254);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 12px;
  background: rgb(238 242 255);
  color: rgb(79 70 229);
}

.ce-advance-input-tool__component-preview--page {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ce-advance-input-tool__component-preview--page span {
  height: 5px;
  border-radius: 4px;
  background: rgb(165 180 252);
}
</style>
