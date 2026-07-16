<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, triggerRef, watch } from 'vue';
import { useI18n } from '@/i18n';
import {
  getDefaultBodyValue,
  normalizeBodyFileValue,
  normalizeBodyValue,
  type DatasourceRequestOptions,
  type JsonValue,
  type MDatasourceApiMethod,
  type MDatasourceBodyDataType,
  type MDatasourceBodyFileValue,
  type MDatasourceBodyItem,
  type MDatasourceKeyValueItem
} from 'mokelay-components/datasource';
import {
  cloneJsonValue,
  isJsonObjectValue,
  isJsonValue
} from 'mokelay-components/datasource';
import type { ApiDomainRecord } from 'mokelay-components/datasource';

type BodyValueParseResult = {
  ok: true;
  value: JsonValue;
} | {
  ok: false;
  error: string;
};

type ResponseMockBodyItem = {
  key: string;
  dataType: MDatasourceBodyDataType;
  value: JsonValue;
  input: string;
  error: string;
  file?: File;
};

export type DatasourceResponseMockCapturePayload = {
  domain?: string;
  headerData: MDatasourceKeyValueItem[];
  queryData: MDatasourceKeyValueItem[];
  bodyData: MDatasourceBodyItem[];
  options?: DatasourceRequestOptions;
};

const props = withDefaults(defineProps<{
  open: boolean;
  domain?: string;
  apiDomains?: ApiDomainRecord[];
  domainLoading?: boolean;
  domainError?: string;
  method?: MDatasourceApiMethod;
  headerData?: MDatasourceKeyValueItem[];
  queryData?: MDatasourceKeyValueItem[];
  bodyData?: MDatasourceBodyItem[];
  bodyFiles?: Array<File | undefined>;
  loading?: boolean;
  error?: string;
}>(), {
  domain: '',
  apiDomains: () => [],
  domainLoading: false,
  domainError: '',
  method: 'GET',
  headerData: () => [],
  queryData: () => [],
  bodyData: () => [],
  bodyFiles: () => [],
  loading: false,
  error: ''
});

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'capture', payload: DatasourceResponseMockCapturePayload): void;
}>();

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const responseMockDomain = ref('');
const responseMockHeaderData = ref<MDatasourceKeyValueItem[]>([]);
const responseMockQueryData = ref<MDatasourceKeyValueItem[]>([]);
const responseMockBodyData = shallowRef<ResponseMockBodyItem[]>([]);
const localError = ref('');
const shouldShowResponseMockDomain = computed(() =>
  props.apiDomains.length > 0 || props.domainLoading || Boolean(props.domainError)
);
const responseMockDomainEmptyOptionText = computed(() => {
  if (props.domainLoading) {
    return t('datasource.import.loadingApiDomains');
  }

  return props.domainError || t('datasource.import.emptyApiDomains');
});

function formatJsonValue(value: JsonValue) {
  return JSON.stringify(value, null, 2);
}

function getBodyFileValue(file: File): MDatasourceBodyFileValue {
  return {
    name: file.name,
    size: file.size,
    type: file.type
  };
}

function normalizeMockBodyValue(dataType: MDatasourceBodyDataType, value: unknown): JsonValue {
  const normalizedValue = normalizeBodyValue(dataType, value);
  return isJsonValue(normalizedValue)
    ? cloneJsonValue(normalizedValue)
    : getDefaultBodyValue(dataType);
}

function getBodyValueInput(item: Pick<ResponseMockBodyItem, 'dataType' | 'value'>) {
  const normalizedValue = normalizeMockBodyValue(item.dataType, item.value);
  if (item.dataType === 'file') {
    return normalizeBodyFileValue(normalizedValue).name;
  }

  if (item.dataType === 'object' || item.dataType === 'array') {
    return formatJsonValue(normalizedValue);
  }

  if (item.dataType === 'null') {
    return 'null';
  }

  return String(normalizedValue);
}

function parseBodyValue(dataType: MDatasourceBodyDataType, inputValue: string): BodyValueParseResult {
  if (dataType === 'string') {
    return {
      ok: true,
      value: inputValue
    };
  }

  if (dataType === 'number') {
    const trimmedValue = inputValue.trim();
    const numberValue = Number(trimmedValue);
    if (!trimmedValue || !Number.isFinite(numberValue)) {
      return {
        ok: false,
        error: t('datasource.validation.invalidNumber')
      };
    }

    return {
      ok: true,
      value: numberValue
    };
  }

  if (dataType === 'boolean') {
    return {
      ok: true,
      value: inputValue === 'true'
    };
  }

  if (dataType === 'null') {
    return {
      ok: true,
      value: null
    };
  }

  if (dataType === 'file') {
    return {
      ok: true,
      value: normalizeBodyFileValue({
        name: inputValue,
        size: 0,
        type: ''
      })
    };
  }

  try {
    const parsed = JSON.parse(inputValue) as unknown;
    if (dataType === 'object') {
      if (!isJsonObjectValue(parsed)) {
        return {
          ok: false,
          error: t('datasource.validation.invalidObject')
        };
      }

      return {
        ok: true,
        value: cloneJsonValue(parsed)
      };
    }

    if (!Array.isArray(parsed) || !isJsonValue(parsed)) {
      return {
        ok: false,
        error: t('datasource.validation.invalidArray')
      };
    }

    return {
      ok: true,
      value: cloneJsonValue(parsed)
    };
  } catch {
    return {
      ok: false,
      error: dataType === 'object'
        ? t('datasource.validation.invalidObject')
        : t('datasource.validation.invalidArray')
    };
  }
}

function initializeMockState() {
  responseMockDomain.value = props.domain;
  responseMockHeaderData.value = props.headerData
    .filter((item) => item.key.trim())
    .map((item) => ({ ...item }));
  responseMockQueryData.value = props.queryData
    .filter((item) => item.key.trim())
    .map((item) => ({ ...item }));
  responseMockBodyData.value = props.bodyData
    .map((item, index) => ({
      item,
      file: props.bodyFiles[index]
    }))
    .filter(({ item }) => item.key.trim())
    .map(({ item, file }) => {
      const normalizedValue = normalizeMockBodyValue(item.dataType, item.value);
      return {
        key: item.key,
        dataType: item.dataType,
        value: normalizedValue,
        input: getBodyValueInput({ dataType: item.dataType, value: normalizedValue }),
        error: '',
        file
      };
    });
  localError.value = '';
}

function updateResponseMockBodyValue(index: number, inputValue: string) {
  const item = responseMockBodyData.value[index];
  if (!item) return;

  item.input = inputValue;
  const parsed = parseBodyValue(item.dataType, inputValue);
  if (!parsed.ok) {
    item.error = parsed.error;
    triggerRef(responseMockBodyData);
    return;
  }

  item.value = parsed.value;
  item.error = '';
  triggerRef(responseMockBodyData);
}

function updateResponseMockBodyFile(index: number, file?: File) {
  const item = responseMockBodyData.value[index];
  if (!item || item.dataType !== 'file') return;

  item.file = file;
  item.value = file ? getBodyFileValue(file) : getDefaultBodyValue('file');
  item.input = getBodyValueInput(item);
  item.error = '';
  triggerRef(responseMockBodyData);
}

function getResponseMockRequestOptions(): DatasourceRequestOptions | undefined {
  const bodyFiles: Record<number, File> = {};
  responseMockBodyData.value.forEach((item, index) => {
    const file = item.file;
    if (!file) return;
    bodyFiles[index] = file;
  });

  return Object.keys(bodyFiles).length ? { bodyFiles } : undefined;
}

function captureResponseExampleWithMock() {
  if (props.loading) return;

  if (shouldShowResponseMockDomain.value && !responseMockDomain.value.trim()) {
    localError.value = t('datasource.validation.missingApiDomain');
    return;
  }

  const invalidBodyItem = responseMockBodyData.value.find((item) => Boolean(item.error));
  if (invalidBodyItem) {
    localError.value = t('datasource.validation.fixMockBeforeCapture');
    return;
  }

  if (props.method === 'POST') {
    const missingFileItem = responseMockBodyData.value.find((item) => item.dataType === 'file' && !item.file);
    if (missingFileItem) {
      missingFileItem.error = t('datasource.validation.missingFile');
      triggerRef(responseMockBodyData);
      localError.value = t('datasource.validation.fixMockBeforeCapture');
      return;
    }
  }

  localError.value = '';
  emit('capture', {
    domain: responseMockDomain.value.trim() || undefined,
    headerData: responseMockHeaderData.value,
    queryData: responseMockQueryData.value,
    bodyData: responseMockBodyData.value.map((item) => ({
      key: item.key,
      dataType: item.dataType,
      value: item.value
    })),
    options: getResponseMockRequestOptions()
  });
}

function closeDialog() {
  emit('close');
}

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      if (dialogRef.value?.open) {
        dialogRef.value.close();
      }
      return;
    }

    initializeMockState();
    await nextTick();
    if (!dialogRef.value?.open) {
      dialogRef.value?.showModal();
    }
  },
  { immediate: true }
);
</script>

<template>
  <dialog
    ref="dialogRef"
    class="ce-datasource-tool__import-dialog ce-datasource-tool__response-mock-dialog"
    data-testid="datasource-response-mock-dialog"
    :aria-hidden="!open"
    aria-labelledby="datasource-response-mock-dialog-title"
    @close="emit('close')"
  >
    <div class="ce-datasource-tool__import-dialog-panel">
      <div class="ce-datasource-tool__import-dialog-header">
        <h3 id="datasource-response-mock-dialog-title" class="ce-datasource-tool__import-dialog-title">
          {{ t('datasource.responseMock.title') }}
        </h3>
        <button
          class="ce-datasource-tool__import-dialog-close"
          type="button"
          data-testid="datasource-response-mock-close"
          :disabled="loading"
          @click="closeDialog"
        >
          {{ t('editor.close') }}
        </button>
      </div>

      <div class="ce-datasource-tool__import-dialog-body ce-datasource-tool__response-mock-body">
        <p class="ce-datasource-tool__section-copy">{{ t('datasource.responseMock.help') }}</p>

        <section v-if="shouldShowResponseMockDomain" class="ce-datasource-tool__response-mock-section">
          <label class="ce-datasource-tool__field">
            <span class="ce-datasource-tool__label">{{ t('datasource.fields.domain') }}</span>
            <select
              class="ce-datasource-tool__input"
              data-testid="datasource-response-mock-domain"
              :disabled="loading || domainLoading || !apiDomains.length"
              :value="responseMockDomain"
              @change="responseMockDomain = ($event.target as HTMLSelectElement).value"
            >
              <option v-if="!apiDomains.length" value="">
                {{ responseMockDomainEmptyOptionText }}
              </option>
              <option v-else-if="!responseMockDomain" value="">
                {{ t('datasource.import.selectApiDomain') }}
              </option>
              <option v-for="domainOption in apiDomains" :key="domainOption.uuid" :value="domainOption.uuid">
                {{ domainOption.alias }} ({{ domainOption.host }})
              </option>
            </select>
          </label>
          <p v-if="domainError" class="ce-datasource-tool__error" data-testid="datasource-response-mock-domain-error">
            {{ domainError }}
          </p>
        </section>

        <section v-if="responseMockHeaderData.length" class="ce-datasource-tool__response-mock-section">
          <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.headers') }}</div>
          <div
            v-for="(item, index) in responseMockHeaderData"
            :key="`response-mock-header-${index}`"
            class="ce-datasource-tool__response-mock-row"
          >
            <input class="ce-datasource-tool__input" type="text" readonly :value="item.key" />
            <input
              class="ce-datasource-tool__input"
              :data-testid="`datasource-response-mock-header-${index}`"
              type="text"
              :placeholder="t('datasource.fields.mock')"
              :value="item.value"
              @input="item.value = ($event.target as HTMLInputElement).value"
              @keydown.stop
            />
          </div>
        </section>

        <section v-if="responseMockQueryData.length" class="ce-datasource-tool__response-mock-section">
          <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.queries') }}</div>
          <div
            v-for="(item, index) in responseMockQueryData"
            :key="`response-mock-query-${index}`"
            class="ce-datasource-tool__response-mock-row"
          >
            <input class="ce-datasource-tool__input" type="text" readonly :value="item.key" />
            <input
              class="ce-datasource-tool__input"
              :data-testid="`datasource-response-mock-query-${index}`"
              type="text"
              :placeholder="t('datasource.fields.mock')"
              :value="item.value"
              @input="item.value = ($event.target as HTMLInputElement).value"
              @keydown.stop
            />
          </div>
        </section>

        <section v-if="responseMockBodyData.length" class="ce-datasource-tool__response-mock-section">
          <div class="ce-datasource-tool__section-title">{{ t('datasource.sections.body') }}</div>
          <div
            v-for="(item, index) in responseMockBodyData"
            :key="`response-mock-body-${index}`"
            class="ce-datasource-tool__response-mock-body-row"
          >
            <input class="ce-datasource-tool__input" type="text" readonly :value="item.key" />
            <input class="ce-datasource-tool__input" type="text" readonly :value="item.dataType" />
            <select
              v-if="item.dataType === 'boolean'"
              class="ce-datasource-tool__input"
              :data-testid="`datasource-response-mock-body-${index}`"
              :value="String(item.value === true)"
              @change="updateResponseMockBodyValue(index, ($event.target as HTMLSelectElement).value)"
            >
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
            <input
              v-else-if="item.dataType === 'null'"
              class="ce-datasource-tool__input"
              :data-testid="`datasource-response-mock-body-${index}`"
              type="text"
              readonly
              value="null"
            />
            <input
              v-else-if="item.dataType === 'file'"
              class="ce-datasource-tool__input"
              :data-testid="`datasource-response-mock-body-${index}`"
              type="file"
              @change="updateResponseMockBodyFile(index, ($event.target as HTMLInputElement).files?.[0])"
              @keydown.stop
            />
            <textarea
              v-else-if="item.dataType === 'object' || item.dataType === 'array'"
              class="ce-datasource-tool__textarea ce-datasource-tool__textarea--value"
              :data-testid="`datasource-response-mock-body-${index}`"
              spellcheck="false"
              :value="item.input"
              @input="updateResponseMockBodyValue(index, ($event.target as HTMLTextAreaElement).value)"
              @keydown.stop
            ></textarea>
            <input
              v-else
              class="ce-datasource-tool__input"
              :data-testid="`datasource-response-mock-body-${index}`"
              :type="item.dataType === 'number' ? 'number' : 'text'"
              :placeholder="t('datasource.fields.mock')"
              :value="item.input"
              @input="updateResponseMockBodyValue(index, ($event.target as HTMLInputElement).value)"
              @keydown.stop
            />
            <p v-if="item.error" class="ce-datasource-tool__body-error ce-datasource-tool__response-mock-body-error">
              {{ item.error }}
            </p>
          </div>
        </section>

        <p v-if="localError || error" class="ce-datasource-tool__error" data-testid="datasource-response-mock-error">
          {{ localError || error }}
        </p>
      </div>

      <div class="ce-datasource-tool__import-dialog-actions">
        <button
          class="ce-datasource-tool__action"
          type="button"
          :disabled="loading"
          @click="closeDialog"
        >
          {{ t('datasource.actions.cancel') }}
        </button>
        <button
          class="ce-datasource-tool__schema-button"
          type="button"
          data-testid="datasource-response-mock-submit"
          :disabled="loading"
          @click="captureResponseExampleWithMock"
        >
          {{ loading ? t('datasource.actions.capturingResponseExample') : t('datasource.actions.capture') }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.ce-datasource-tool__import-dialog {
  width: min(calc(100vw - 32px), 560px);
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgb(15 23 42 / 0.32);
  color: rgb(15 23 42);
}

.ce-datasource-tool__response-mock-dialog {
  width: min(calc(100vw - 32px), 720px);
}

.ce-datasource-tool__import-dialog::backdrop {
  background: rgb(15 23 42 / 0.45);
}

.ce-datasource-tool__import-dialog-panel {
  overflow: hidden;
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-datasource-tool__import-dialog-header,
.ce-datasource-tool__import-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px 14px;
}

.ce-datasource-tool__import-dialog-actions {
  justify-content: flex-end;
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.ce-datasource-tool__import-dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 700;
}

.ce-datasource-tool__import-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.ce-datasource-tool__response-mock-body {
  max-height: min(70vh, 620px);
  overflow: auto;
}

.ce-datasource-tool__response-mock-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ce-datasource-tool__response-mock-row,
.ce-datasource-tool__response-mock-body-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.ce-datasource-tool__response-mock-body-row {
  grid-template-columns: minmax(0, 0.9fr) minmax(100px, 0.35fr) minmax(0, 1fr);
}

.ce-datasource-tool__section-title {
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 700;
}

.ce-datasource-tool__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.ce-datasource-tool__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.ce-datasource-tool__label {
  color: rgb(51 65 85);
  font-size: 13px;
  font-weight: 650;
}

.ce-datasource-tool__input,
.ce-datasource-tool__textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid rgb(148 163 184 / 0.65);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgb(255 255 255);
  color: rgb(15 23 42);
  font: inherit;
}

.ce-datasource-tool__textarea {
  min-height: 80px;
  resize: vertical;
}

.ce-datasource-tool__textarea--value {
  min-height: 36px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 18px;
}

.ce-datasource-tool__input:focus,
.ce-datasource-tool__textarea:focus {
  outline: none;
  border-color: rgb(20 184 166);
  box-shadow: 0 0 0 2px rgb(20 184 166 / 0.15);
}

.ce-datasource-tool__input:read-only,
.ce-datasource-tool__textarea:read-only,
.ce-datasource-tool__input:disabled {
  background: rgb(241 245 249);
  color: rgb(100 116 139);
}

.ce-datasource-tool__import-dialog-close,
.ce-datasource-tool__action,
.ce-datasource-tool__schema-button {
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  padding: 6px 10px;
  background: rgb(255 255 255);
  color: rgb(51 65 85);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.ce-datasource-tool__schema-button {
  border-color: rgb(20 184 166 / 0.55);
  background: rgb(20 184 166);
  color: rgb(255 255 255);
}

.ce-datasource-tool__import-dialog-close:hover,
.ce-datasource-tool__action:hover {
  background: rgb(248 250 252);
}

.ce-datasource-tool__schema-button:hover {
  background: rgb(13 148 136);
}

.ce-datasource-tool__action:disabled,
.ce-datasource-tool__schema-button:disabled,
.ce-datasource-tool__import-dialog-close:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ce-datasource-tool__error,
.ce-datasource-tool__body-error {
  margin: 0;
  color: rgb(185 28 28);
  font-size: 12px;
  font-weight: 650;
}

.ce-datasource-tool__response-mock-body-error {
  grid-column: 1 / -1;
}

@media (max-width: 720px) {
  .ce-datasource-tool__import-dialog-header,
  .ce-datasource-tool__import-dialog-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ce-datasource-tool__response-mock-row,
  .ce-datasource-tool__response-mock-body-row {
    grid-template-columns: 1fr;
  }

  .ce-datasource-tool__response-mock-body-error {
    grid-column: auto;
  }
}

.dark .ce-datasource-tool__import-dialog-panel {
  background: rgb(15 23 42);
}

.dark .ce-datasource-tool__import-dialog-header,
.dark .ce-datasource-tool__import-dialog-actions {
  border-color: rgb(51 65 85);
}

.dark .ce-datasource-tool__import-dialog-title,
.dark .ce-datasource-tool__section-title {
  color: rgb(226 232 240);
}

.dark .ce-datasource-tool__label,
.dark .ce-datasource-tool__section-copy {
  color: rgb(148 163 184);
}

.dark .ce-datasource-tool__input,
.dark .ce-datasource-tool__textarea {
  border-color: rgb(71 85 105);
  background: rgb(2 6 23);
  color: rgb(226 232 240);
}

.dark .ce-datasource-tool__input:read-only,
.dark .ce-datasource-tool__textarea:read-only,
.dark .ce-datasource-tool__input:disabled {
  background: rgb(30 41 59);
  color: rgb(148 163 184);
}

.dark .ce-datasource-tool__import-dialog-close,
.dark .ce-datasource-tool__action {
  border-color: rgb(71 85 105);
  background: rgb(30 41 59);
  color: rgb(226 232 240);
}

.dark .ce-datasource-tool__import-dialog-close:hover,
.dark .ce-datasource-tool__action:hover {
  background: rgb(51 65 85);
}
</style>
