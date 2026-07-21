<script setup lang="ts">
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from '@headlessui/vue';
import { computed, ref } from 'vue';
import { $message } from 'mokelay-components/global-calls';
import { useI18n } from '@/i18n';
import {
  COMMON_CONTENT_LOCALES,
  canonicalizeContentLocale,
  formatContentLocale,
  getContentLocaleOption
} from '@/i18n/contentLocales';

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[], intent?: 'add' | 'remove'];
}>();

const { t } = useI18n();
const query = ref('');
const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase());
const options = computed(() => {
  const existingCustom = props.modelValue
    .filter((code) => !COMMON_CONTENT_LOCALES.some((option) => option.code === code))
    .map(getContentLocaleOption);
  const all = [...COMMON_CONTENT_LOCALES, ...existingCustom];
  if (!normalizedQuery.value) return all;
  return all.filter((option) =>
    option.code.toLocaleLowerCase().includes(normalizedQuery.value)
    || option.nativeName.toLocaleLowerCase().includes(normalizedQuery.value));
});
const customLocale = computed(() => canonicalizeContentLocale(query.value));
const canAddCustomLocale = computed(() => Boolean(
  customLocale.value
  && !COMMON_CONTENT_LOCALES.some((option) => option.code === customLocale.value)
  && !props.modelValue.includes(customLocale.value)
));

function updateSelection(value: string[]) {
  const unique = [...new Set(value)];
  if (!unique.length) {
    query.value = '';
    void $message('warning', t('contentLocalization.atLeastOneLocale'));
    return;
  }
  const removed = props.modelValue.filter((locale) => !unique.includes(locale));
  if (removed.length && !window.confirm(t('contentLocalization.removeConfirm'))) {
    query.value = '';
    return;
  }
  query.value = '';
  emit('update:modelValue', unique, removed.length ? 'remove' : 'add');
}

function handleQuery(value: string) {
  query.value = value;
}

function displaySelection() {
  return props.modelValue.map(formatContentLocale).join(', ');
}

function handleBlur() {
  query.value = '';
}

</script>

<template>
  <Combobox :model-value="modelValue" multiple @update:model-value="updateSelection">
    <div class="locale-multiselect" data-testid="supported-locales-select">
      <div class="locale-multiselect__input-row">
        <ComboboxInput
          class="locale-multiselect__input"
          :display-value="displaySelection"
          :placeholder="t('contentLocalization.searchLocales')"
          :title="displaySelection()"
          data-testid="supported-locales-search"
          @change="handleQuery(($event.target as HTMLInputElement).value)"
          @blur="handleBlur"
        />
        <ComboboxButton class="locale-multiselect__button" :aria-label="t('contentLocalization.openLocales')">⌄</ComboboxButton>
      </div>
      <ComboboxOptions class="locale-multiselect__options">
        <ComboboxOption
          v-for="option in options"
          :key="option.code"
          v-slot="{ active, selected }"
          :value="option.code"
          as="template"
        >
          <li :class="['locale-multiselect__option', { 'locale-multiselect__option--active': active }]">
            <span class="locale-multiselect__check">{{ selected ? '✓' : '' }}</span>
            <span>{{ formatContentLocale(option.code) }}</span>
          </li>
        </ComboboxOption>
        <ComboboxOption v-if="canAddCustomLocale" v-slot="{ active }" :value="customLocale" as="template">
          <li :class="['locale-multiselect__option', { 'locale-multiselect__option--active': active }]" data-testid="add-custom-locale">
            <span class="locale-multiselect__check">＋</span>
            <span>{{ t('contentLocalization.addCustomLocale') }} {{ customLocale }}</span>
          </li>
        </ComboboxOption>
        <li v-if="!options.length && !canAddCustomLocale" class="locale-multiselect__empty">
          {{ query.trim() ? t('contentLocalization.invalidOrMissingLocale') : t('contentLocalization.noLocales') }}
        </li>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>

<style scoped>
.locale-multiselect { position: relative; display: grid; }
.locale-multiselect__input-row { display: flex; overflow: hidden; border: 1px solid rgb(203 213 225); border-radius: 6px; }
.locale-multiselect__input { min-width: 0; flex: 1; border: 0; background: transparent; outline: none; padding: 6px 8px; }
.locale-multiselect__button { width: 34px; border: 0; border-left: 1px solid rgb(203 213 225); background: transparent; cursor: pointer; }
.locale-multiselect__options { position: absolute; z-index: 50; top: calc(100% + 4px); width: 100%; max-height: 280px; overflow-y: auto; border: 1px solid rgb(203 213 225); border-radius: 8px; background: white; box-shadow: 0 12px 30px rgb(15 23 42 / 0.18); list-style: none; margin: 0; padding: 4px; }
.locale-multiselect__option { display: flex; align-items: center; gap: 8px; border-radius: 6px; cursor: pointer; padding: 7px 8px; }
.locale-multiselect__option--active { background: rgb(241 245 249); }
.locale-multiselect__check { width: 16px; color: rgb(5 150 105); font-weight: 700; }
.locale-multiselect__empty { color: rgb(100 116 139); padding: 10px; }
.dark .locale-multiselect__options { border-color: rgb(51 65 85); background: rgb(15 23 42); }
.dark .locale-multiselect__option--active { background: rgb(30 41 59); }
</style>
