<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  isLocalizedValue,
  migrateLegacyLocalizedValue,
  normalizeLocalizedValue,
  type LocalizedValue
} from 'mokelay-components/runtime';
import { useContentLocalization } from '@/composables/useContentLocalization';
import { useI18n } from '@/i18n';
import { formatContentLocale } from '@/i18n/contentLocales';

const props = withDefaults(defineProps<{
  value?: unknown;
  placeholder?: string;
  multiline?: boolean;
  dataTestid?: string;
  readonly?: boolean;
  compact?: boolean;
  onChange?: (value: LocalizedValue) => void;
  onToolChange?: (value: LocalizedValue) => void;
}>(), { placeholder: '', multiline: false });

const { localeConfig, editingLocale, setEditingLocale } = useContentLocalization();
const { t } = useI18n();
const showAll = ref(false);
const normalizedValue = computed(() => {
  const migrated = migrateLegacyLocalizedValue(props.value);
  if (migrated) return normalizeLocalizedValue(migrated, localeConfig.value);
  if (typeof props.value === 'string') {
    return normalizeLocalizedValue({ $i18n: { [localeConfig.value.defaultLocale]: props.value } }, localeConfig.value);
  }
  return normalizeLocalizedValue(isLocalizedValue(props.value) ? props.value : undefined, localeConfig.value);
});
const visibleLocales = computed(() => showAll.value ? localeConfig.value.supportedLocales : [editingLocale.value]);
const completed = computed(() => localeConfig.value.supportedLocales.filter((locale) => normalizedValue.value.$i18n[locale]?.trim()).length);

function update(locale: string, text: string) {
  const next = normalizeLocalizedValue(normalizedValue.value, localeConfig.value);
  next.$i18n[locale] = text;
  props.onToolChange?.(next);
  props.onChange?.(next);
}
</script>

<template>
  <div class="localized-editor" :class="{ 'localized-editor--compact': compact }" data-testid="localized-text-editor">
    <div v-if="compact" class="localized-editor__compact-row">
      <select class="mk-form-control" :value="editingLocale" :disabled="readonly" data-testid="localized-editing-locale" @change="setEditingLocale(($event.target as HTMLSelectElement).value)">
        <option v-for="locale in localeConfig.supportedLocales" :key="locale" :value="locale">{{ formatContentLocale(locale) }}</option>
      </select>
      <input class="mk-form-control" type="text" :value="normalizedValue.$i18n[editingLocale]" :readonly="readonly" :placeholder="placeholder" :data-testid="dataTestid || `localized-input-${editingLocale}`" @input="update(editingLocale, ($event.target as HTMLInputElement).value)">
      <span class="localized-editor__completion">{{ completed }}/{{ localeConfig.supportedLocales.length }}</span>
      <button class="mk-form-button" type="button" :disabled="readonly" @click="showAll = !showAll">{{ showAll ? t('contentLocalization.collapse') : t('contentLocalization.editAll') }}</button>
      <div v-if="showAll" class="localized-editor__popover">
        <label v-for="locale in localeConfig.supportedLocales" :key="locale" class="localized-editor__field mk-form-field">
          <span>{{ formatContentLocale(locale) }}</span>
          <input class="mk-form-control" type="text" :value="normalizedValue.$i18n[locale]" :readonly="readonly" :placeholder="placeholder" @input="update(locale, ($event.target as HTMLInputElement).value)">
        </label>
      </div>
    </div>
    <template v-else>
    <div class="localized-editor__toolbar">
      <select class="mk-form-control" :value="editingLocale" :disabled="readonly" data-testid="localized-editing-locale" @change="setEditingLocale(($event.target as HTMLSelectElement).value)">
        <option v-for="locale in localeConfig.supportedLocales" :key="locale" :value="locale">{{ formatContentLocale(locale) }}</option>
      </select>
      <span>{{ completed }}/{{ localeConfig.supportedLocales.length }}</span>
      <button class="mk-form-button" type="button" :disabled="readonly" @click="showAll = !showAll">{{ showAll ? t('contentLocalization.collapse') : t('contentLocalization.editAll') }}</button>
    </div>
    <label v-for="locale in visibleLocales" :key="locale" class="localized-editor__field mk-form-field">
      <span>{{ formatContentLocale(locale) }}</span>
      <textarea class="mk-form-control" v-if="multiline" :value="normalizedValue.$i18n[locale]" :readonly="readonly" :placeholder="placeholder" :data-testid="dataTestid" @input="update(locale, ($event.target as HTMLTextAreaElement).value)" />
      <input class="mk-form-control" v-else type="text" :value="normalizedValue.$i18n[locale]" :readonly="readonly" :placeholder="placeholder" :data-testid="dataTestid || `localized-input-${locale}`" @input="update(locale, ($event.target as HTMLInputElement).value)" />
    </label>
    </template>
  </div>
</template>

<style scoped>
.localized-editor { display: grid; gap: 8px; }
.localized-editor__toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 12px; }
.localized-editor__toolbar button { margin-left: auto; cursor: pointer; }
.localized-editor--compact { min-width: 0; }
.localized-editor__compact-row { position: relative; display: grid; grid-template-columns: minmax(72px, .6fr) minmax(0, 1fr) auto 40px; align-items: center; gap: 4px; }
.localized-editor__compact-row button { overflow: hidden; cursor: pointer; }
.localized-editor__compact-row button::before { content: '\2026'; }
.localized-editor__completion { color: rgb(100 116 139); white-space: nowrap; font-size: 11px; }
.localized-editor__popover { position: absolute; z-index: 20; top: calc(100% + 6px); left: 0; width: min(360px, 80vw); display: grid; gap: 8px; border: 1px solid rgb(203 213 225); border-radius: 8px; background: rgb(255 255 255); box-shadow: 0 12px 32px rgb(15 23 42 / 0.2); padding: 10px; }
.dark .localized-editor__popover { background: rgb(15 23 42); }
.localized-editor__toolbar select { flex: 1 1 160px; width: auto; }
</style>
