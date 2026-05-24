<script lang="ts">
export type PageDslBlockType =
  | 'MHeading'
  | 'MRichText'
  | 'MImage'
  | 'MEmbed'
  | 'MTextField'
  | 'MEmailField'
  | 'MPhoneField'
  | 'MLinkField'
  | 'MTextareaField'
  | 'MFileUploadField'
  | 'MSelectField'
  | 'MRadioGroupField'
  | 'MCheckboxGroupField'
  | 'MImageChoiceField'
  | 'MRatingField'
  | 'MLinearScaleField'
  | 'MMatrixField'
  | 'MPageBreak'
  | 'MThankYouPage'
  | 'MResultPage'
  | 'MButton';

export type PageDslOption = {
  label: string;
  value: string;
  description?: string;
  imageUrl?: string;
};

export type PageDslMatrixRow = {
  label: string;
  value: string;
};

export interface PageDslBlockProps {
  edit: boolean;
  blockType: PageDslBlockType;
  id?: string;
  text?: string;
  content?: string;
  title?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  value?: unknown;
  src?: string;
  alt?: string;
  caption?: string;
  url?: string;
  level?: string;
  align?: string;
  options?: PageDslOption[];
  rows?: number | PageDslMatrixRow[];
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  variant?: string;
  action?: Record<string, unknown>;
  resultField?: string;
}

let nextPageDslFieldId = 0;
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

const props = defineProps<PageDslBlockProps & {
  onChange?: (payload: PageDslBlockProps) => void;
  onToolChange?: (payload: PageDslBlockProps) => void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const localFieldId = `page-dsl-field-${++nextPageDslFieldId}`;
const fieldId = computed(() => props.id || localFieldId);
const fieldPlaceholder = computed(() => props.placeholder || '');
const options = computed(() => Array.isArray(props.options) ? props.options : []);
const matrixRows = computed(() => Array.isArray(props.rows) ? props.rows : []);
const textareaRows = computed(() => {
  const rows = Number(props.rows);
  return Number.isFinite(rows) && rows > 0 ? rows : 4;
});
const ratingMax = computed(() => Math.max(2, Number(props.max || 5)));
const scaleMin = computed(() => Number.isFinite(Number(props.min)) ? Number(props.min) : 0);
const scaleMax = computed(() => Math.max(scaleMin.value + 1, Number(props.max || 10)));
const stringInputValue = computed(() => {
  if (typeof props.value === 'string' || typeof props.value === 'number') {
    return String(props.value);
  }
  return '';
});
const selectedValues = computed(() => Array.isArray(props.value) ? props.value.map(String) : []);
const matrixValue = computed<Record<string, unknown>>(() => (
  typeof props.value === 'object' && props.value !== null && !Array.isArray(props.value)
    ? props.value as Record<string, unknown>
    : {}
));

const scaleValues = computed(() => {
  const values: number[] = [];
  for (let value = scaleMin.value; value <= scaleMax.value; value += 1) {
    values.push(value);
  }
  return values;
});

const headingTag = computed(() => {
  if (props.level === '2') return 'h2';
  if (props.level === '3') return 'h3';
  return 'h1';
});

const headingClass = computed(() => {
  const alignClass = props.align === 'center' ? 'page-dsl-block--center' : props.align === 'right' ? 'page-dsl-block--right' : '';
  return ['page-dsl-heading', `page-dsl-heading--${props.level || '1'}`, alignClass].filter(Boolean).join(' ');
});

const buttonClass = computed(() => {
  const variant = props.variant === 'secondary' ? 'secondary' : props.variant === 'ghost' ? 'ghost' : 'primary';
  return `page-dsl-button page-dsl-button--${variant}`;
});

const buttonWrapClass = computed(() => {
  if (props.align === 'center') return 'page-dsl-button-wrap page-dsl-button-wrap--center';
  if (props.align === 'right') return 'page-dsl-button-wrap page-dsl-button-wrap--right';
  return 'page-dsl-button-wrap';
});

let toolbarAlignTimer: number | null = null;

function optionValue(index: number) {
  return options.value[index]?.value || `option_${index + 1}`;
}

function isSelected(value: string) {
  if (Array.isArray(props.value)) {
    return selectedValues.value.includes(value);
  }
  return stringInputValue.value === value;
}

function emitChange(payload: Partial<PageDslBlockProps>) {
  const { onChange, onToolChange, ...currentPayload } = props;
  const nextPayload = {
    ...currentPayload,
    ...payload
  } as PageDslBlockProps;
  onToolChange?.(nextPayload);
  onChange?.(nextPayload);
}

function toggleArrayValue(value: string, checked: boolean) {
  const nextValues = new Set(selectedValues.value);
  if (checked) {
    nextValues.add(value);
  } else {
    nextValues.delete(value);
  }
  emitChange({ value: Array.from(nextValues) });
}

function updateMatrixValue(rowValue: string, optionValue: string) {
  emitChange({
    value: {
      ...matrixValue.value,
      [rowValue]: optionValue
    }
  });
}

function isMatrixSelected(rowValue: string, optionValue: string) {
  return String(matrixValue.value[rowValue] ?? '') === optionValue;
}

function emitFileValue(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type
  }));
  emitChange({ value: files });
}

function clearToolbarAlignTimer() {
  if (toolbarAlignTimer === null) return;
  window.clearTimeout(toolbarAlignTimer);
  toolbarAlignTimer = null;
}

function alignToolbarToPageBlock() {
  toolbarAlignTimer = null;
  if (!props.edit) return;

  const root = rootRef.value;
  if (!root) return;

  const block = root.closest('.ce-block') as HTMLElement | null;
  const editorRoot = root.closest('.codex-editor') as HTMLElement | null;
  const toolbar = editorRoot?.querySelector<HTMLElement>(':scope > .ce-toolbar')
    ?? editorRoot?.querySelector<HTMLElement>('.ce-toolbar');
  const plusButton = toolbar?.querySelector<HTMLElement>('.ce-toolbar__plus');

  if (!block || !toolbar || !plusButton) return;

  const blockRect = block.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const toolbarButtonHeight = plusButton.getBoundingClientRect().height || 26;
  const top = block.offsetTop + (rootRect.top - blockRect.top) + (rootRect.height - toolbarButtonHeight) / 2;

  toolbar.style.top = `${Math.max(0, Math.round(top))}px`;
}

function scheduleToolbarAlignment() {
  clearToolbarAlignTimer();
  toolbarAlignTimer = window.setTimeout(() => {
    alignToolbarToPageBlock();
  }, 0);
}

onBeforeUnmount(() => {
  clearToolbarAlignTimer();
});
</script>

<template>
  <div
    ref="rootRef"
    class="page-dsl-block"
    :data-testid="`page-dsl-block-${blockType}`"
    @focusin="scheduleToolbarAlignment"
    @mouseenter="scheduleToolbarAlignment"
    @mousemove="scheduleToolbarAlignment"
  >
    <component :is="headingTag" v-if="blockType === 'MHeading'" :class="headingClass">
      {{ text || '页面标题' }}
    </component>

    <div v-else-if="blockType === 'MRichText'" class="page-dsl-rich-text">
      {{ content || '这里填写说明内容。' }}
    </div>

    <figure v-else-if="blockType === 'MImage'" class="page-dsl-image">
      <img v-if="src" :src="src" :alt="alt || '图片'" />
      <div v-else class="page-dsl-image__empty">图片</div>
      <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>

    <a
      v-else-if="blockType === 'MEmbed'"
      class="page-dsl-embed"
      :href="url || 'https://www.mokelay.com/'"
      target="_blank"
      rel="noreferrer"
    >
      <span>{{ title || '外部资料' }}</span>
      <small>{{ url || 'https://www.mokelay.com/' }}</small>
    </a>

    <div v-else-if="blockType === 'MPageBreak'" class="page-dsl-flow page-dsl-flow--break">
      <span>分页</span>
      <strong>{{ title || '下一页' }}</strong>
      <p v-if="description">{{ description }}</p>
    </div>

    <div v-else-if="blockType === 'MThankYouPage'" class="page-dsl-flow page-dsl-flow--thanks">
      <span>感谢页</span>
      <strong>{{ title || '提交成功' }}</strong>
      <p>{{ description || '谢谢你的提交，我们已经收到。' }}</p>
    </div>

    <div v-else-if="blockType === 'MResultPage'" class="page-dsl-flow page-dsl-flow--result">
      <span>结果页</span>
      <strong>{{ title || '你的结果' }}</strong>
      <p>{{ description || '这里展示测验或问卷结果。' }}</p>
    </div>

    <div v-else-if="blockType === 'MButton'" :class="buttonWrapClass">
      <button type="button" :class="buttonClass">
        {{ label || '提交' }}
      </button>
    </div>

    <div v-else class="page-dsl-field">
      <input
        v-if="blockType === 'MTextField' || blockType === 'MEmailField' || blockType === 'MPhoneField' || blockType === 'MLinkField'"
        :id="fieldId"
        class="page-dsl-control"
        :type="blockType === 'MEmailField' ? 'email' : blockType === 'MPhoneField' ? 'tel' : blockType === 'MLinkField' ? 'url' : 'text'"
        :placeholder="fieldPlaceholder"
        :value="stringInputValue"
        @input="emitChange({ value: ($event.target as HTMLInputElement).value })"
      />

      <textarea
        v-else-if="blockType === 'MTextareaField'"
        :id="fieldId"
        class="page-dsl-control"
        :rows="textareaRows"
        :placeholder="fieldPlaceholder"
        :value="stringInputValue"
        @input="emitChange({ value: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>

      <input
        v-else-if="blockType === 'MFileUploadField'"
        :id="fieldId"
        class="page-dsl-control"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="emitFileValue"
      />

      <select
        v-else-if="blockType === 'MSelectField'"
        :id="fieldId"
        class="page-dsl-control"
        :value="stringInputValue"
        @change="emitChange({ value: ($event.target as HTMLSelectElement).value })"
      >
        <option value="">请选择</option>
        <option v-for="(option, index) in options" :key="optionValue(index)" :value="optionValue(index)">
          {{ option.label }}
        </option>
      </select>

      <div v-else-if="blockType === 'MRadioGroupField'" class="page-dsl-options">
        <label v-for="(option, index) in options" :key="optionValue(index)" class="page-dsl-option">
          <input
            type="radio"
            :name="fieldId"
            :value="optionValue(index)"
            :checked="isSelected(optionValue(index))"
            @change="emitChange({ value: optionValue(index) })"
          />
          <span>
            <strong>{{ option.label }}</strong>
            <small v-if="option.description">{{ option.description }}</small>
          </span>
        </label>
      </div>

      <div v-else-if="blockType === 'MCheckboxGroupField'" class="page-dsl-options">
        <label v-for="(option, index) in options" :key="optionValue(index)" class="page-dsl-option">
          <input
            type="checkbox"
            :name="fieldId"
            :value="optionValue(index)"
            :checked="isSelected(optionValue(index))"
            @change="toggleArrayValue(optionValue(index), ($event.target as HTMLInputElement).checked)"
          />
          <span>
            <strong>{{ option.label }}</strong>
            <small v-if="option.description">{{ option.description }}</small>
          </span>
        </label>
      </div>

      <div v-else-if="blockType === 'MImageChoiceField'" class="page-dsl-image-options">
        <label v-for="(option, index) in options" :key="optionValue(index)" class="page-dsl-image-option">
          <input
            :type="multiple ? 'checkbox' : 'radio'"
            :name="fieldId"
            :value="optionValue(index)"
            :checked="isSelected(optionValue(index))"
            @change="multiple ? toggleArrayValue(optionValue(index), ($event.target as HTMLInputElement).checked) : emitChange({ value: optionValue(index) })"
          />
          <img v-if="option.imageUrl" :src="option.imageUrl" :alt="option.label" />
          <span v-else class="page-dsl-image-option__placeholder">图片</span>
          <strong>{{ option.label }}</strong>
        </label>
      </div>

      <div v-else-if="blockType === 'MRatingField'" class="page-dsl-rating">
        <small>{{ lowLabel }}</small>
        <button
          v-for="item in ratingMax"
          :key="item"
          type="button"
          :class="{ 'page-dsl-choice-button--active': Number(stringInputValue) === item }"
          @click="emitChange({ value: String(item) })"
        >
          {{ item }}
        </button>
        <small>{{ highLabel }}</small>
      </div>

      <div v-else-if="blockType === 'MLinearScaleField'" class="page-dsl-scale">
        <div>
          <button
            v-for="item in scaleValues"
            :key="item"
            type="button"
            :class="{ 'page-dsl-choice-button--active': Number(stringInputValue) === item }"
            @click="emitChange({ value: String(item) })"
          >
            {{ item }}
          </button>
        </div>
        <p>
          <span>{{ lowLabel }}</span>
          <span>{{ highLabel }}</span>
        </p>
      </div>

      <div v-else-if="blockType === 'MMatrixField'" class="page-dsl-matrix-wrap">
        <table class="page-dsl-matrix">
          <thead>
            <tr>
              <th></th>
              <th v-for="(option, index) in options" :key="optionValue(index)">{{ option.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in matrixRows" :key="row.value">
              <th>{{ row.label }}</th>
              <td v-for="(option, index) in options" :key="`${row.value}-${optionValue(index)}`">
                <input
                  type="radio"
                  :name="`${fieldId}-${row.value}`"
                  :value="optionValue(index)"
                  :checked="isMatrixSelected(row.value, optionValue(index))"
                  @change="updateMatrixValue(row.value, optionValue(index))"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-dsl-block {
  width: 100%;
  color: rgb(15 23 42);
}

.page-dsl-heading {
  margin: 0;
  color: rgb(15 23 42);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.18;
}

.page-dsl-heading--1 {
  font-size: 30px;
}

.page-dsl-heading--2 {
  font-size: 24px;
}

.page-dsl-heading--3 {
  font-size: 18px;
}

.page-dsl-block--center {
  text-align: center;
}

.page-dsl-block--right {
  text-align: right;
}

.page-dsl-rich-text {
  white-space: pre-line;
  color: rgb(71 85 105);
  font-size: 14px;
  line-height: 1.75;
}

.page-dsl-image {
  margin: 0;
}

.page-dsl-image img {
  display: block;
  width: 100%;
  max-height: 360px;
  border-radius: 8px;
  object-fit: cover;
}

.page-dsl-image__empty,
.page-dsl-image-option__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 1px dashed rgb(148 163 184);
  border-radius: 8px;
  background: rgb(248 250 252);
  color: rgb(100 116 139);
  font-size: 13px;
}

.page-dsl-image figcaption {
  margin-top: 6px;
  color: rgb(100 116 139);
  font-size: 12px;
  text-align: center;
}

.page-dsl-embed {
  display: block;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 14px;
  color: rgb(15 23 42);
  text-decoration: none;
}

.page-dsl-embed span,
.page-dsl-embed small {
  display: block;
}

.page-dsl-embed span {
  font-weight: 700;
}

.page-dsl-embed small {
  margin-top: 4px;
  color: rgb(100 116 139);
  word-break: break-all;
}

.page-dsl-field {
  display: grid;
  gap: 8px;
}

.page-dsl-control {
  width: 100%;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 9px 11px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.page-dsl-control:focus {
  outline: none;
  border-color: rgb(99 102 241);
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.14);
}

.page-dsl-options {
  display: grid;
  gap: 8px;
}

.page-dsl-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 9px 11px;
  font-size: 14px;
}

.page-dsl-option input {
  margin-top: 3px;
}

.page-dsl-option strong,
.page-dsl-option small {
  display: block;
}

.page-dsl-option small {
  margin-top: 2px;
  color: rgb(100 116 139);
  font-size: 12px;
}

.page-dsl-image-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.page-dsl-image-option {
  display: grid;
  gap: 8px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
}

.page-dsl-image-option input {
  justify-self: start;
}

.page-dsl-image-option img {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  object-fit: cover;
}

.page-dsl-rating,
.page-dsl-scale div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.page-dsl-rating button,
.page-dsl-scale button {
  min-width: 36px;
  height: 36px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font-weight: 700;
}

.page-dsl-rating .page-dsl-choice-button--active,
.page-dsl-scale .page-dsl-choice-button--active {
  border-color: rgb(79 70 229);
  background: rgb(238 242 255);
  color: rgb(67 56 202);
}

.page-dsl-rating small,
.page-dsl-scale p {
  color: rgb(100 116 139);
  font-size: 12px;
}

.page-dsl-scale p {
  display: flex;
  justify-content: space-between;
  margin: 4px 0 0;
}

.page-dsl-matrix-wrap {
  overflow-x: auto;
}

.page-dsl-matrix {
  min-width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.page-dsl-matrix th,
.page-dsl-matrix td {
  border-bottom: 1px solid rgb(226 232 240);
  padding: 8px;
  text-align: center;
}

.page-dsl-matrix th:first-child {
  text-align: left;
}

.page-dsl-flow {
  display: grid;
  gap: 6px;
  border: 1px dashed rgb(148 163 184);
  border-radius: 8px;
  padding: 14px;
  background: rgb(248 250 252);
}

.page-dsl-flow span {
  color: rgb(100 116 139);
  font-size: 12px;
  font-weight: 700;
}

.page-dsl-flow strong {
  color: rgb(15 23 42);
  font-size: 18px;
}

.page-dsl-flow p {
  margin: 0;
  color: rgb(71 85 105);
  font-size: 13px;
}

.page-dsl-flow--thanks {
  border-color: rgb(110 231 183);
  background: rgb(236 253 245);
}

.page-dsl-flow--result {
  border-color: rgb(165 180 252);
  background: rgb(238 242 255);
}

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

:global(.dark) .page-dsl-block,
:global(.dark) .page-dsl-heading,
:global(.dark) .page-dsl-flow strong {
  color: rgb(241 245 249);
}

:global(.dark) .page-dsl-rich-text,
:global(.dark) .page-dsl-flow p {
  color: rgb(203 213 225);
}

:global(.dark) .page-dsl-control,
:global(.dark) .page-dsl-rating button,
:global(.dark) .page-dsl-scale button,
:global(.dark) .page-dsl-button--secondary {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.dark) .page-dsl-option,
:global(.dark) .page-dsl-image-option,
:global(.dark) .page-dsl-embed,
:global(.dark) .page-dsl-matrix th,
:global(.dark) .page-dsl-matrix td {
  border-color: rgb(51 65 85);
}

:global(.dark) .page-dsl-image__empty,
:global(.dark) .page-dsl-image-option__placeholder,
:global(.dark) .page-dsl-flow {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}
</style>
