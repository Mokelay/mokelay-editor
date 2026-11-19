<script setup lang="ts">
import { ref, watch } from 'vue';
import { cloneFormItemRules, createPageDslFieldId, type MFormItemData, type MFormItemRules } from 'mokelay-components/blocks';
import { resolveLocalizedValue } from 'mokelay-components/runtime';
import { useContentLocalization } from '@/composables/useContentLocalization';
import { useI18n } from '@/i18n';

const props = defineProps<{
  edit: boolean;
  value?: MFormItemRules;
  variableName?: string;
  items?: MFormItemData[];
}>();
const emit = defineEmits<{ toolChange: [rules: MFormItemRules | undefined] }>();
const { t } = useI18n();
const { editingLocale, localeConfig } = useContentLocalization();
const label = (key: string) => t('form.itemRules.' + key);
const id = createPageDslFieldId();
const dialog = ref<HTMLDialogElement>();
const patternInput = ref<HTMLInputElement>();
const saved = ref(props.value);
watch(() => props.value, value => { saved.value = value; });
const rule = ref<MFormItemRules>({});
const error = ref('');

function open() {
  rule.value = cloneFormItemRules(saved.value) ?? {};
  error.value = '';
  dialog.value?.showModal();
}

function setDependency(field: string) {
  if (field) rule.value.visibleWhen = { ...rule.value.visibleWhen, field };
  else delete rule.value.visibleWhen;
}

function setComparison(mode: string) {
  const condition = rule.value.visibleWhen;
  if (!condition) return;
  if (mode === 'equals') condition.equals = '';
  else delete condition.equals;
}

function save() {
  if (!props.edit) return;
  if (rule.value.pattern) {
    try {
      new RegExp(rule.value.pattern);
    } catch {
      error.value = label('invalidPattern').replace('{field}', props.variableName ?? '');
      patternInput.value?.focus();
      return;
    }
  }
  const next = { ...rule.value };
  for (const key of ['description', 'hint', 'pattern', 'invalidMessage'] as const) {
    if (next[key] === '') delete next[key];
  }
  if (!next.readOnly) delete next.readOnly;
  saved.value = cloneFormItemRules(next);
  dialog.value?.close();
  emit('toolChange', saved.value);
}
</script>

<template>
  <button type="button" class="border mk-form-button" data-testid="form-item-rules-open" @click="open">{{ label('rules') }}</button>
  <Teleport to="body">
    <dialog ref="dialog" :aria-labelledby="id + '-title'" data-testid="form-item-rules-dialog"
      class="form-settings-dialog rounded-xl bg-white text-slate-900 shadow-2xl backdrop:bg-slate-900/45 dark:bg-slate-900 dark:text-slate-100 mk-form-dialog">
      <form class="mk-form-dialog-panel" @submit.prevent="save">
        <h3 :id="id + '-title'" class="mk-form-dialog-header">
          {{ label('rules') }} <small class="font-normal">{{ variableName }}</small>
        </h3>
        <div class="mk-form-dialog-body mk-form-scope">
          <fieldset class="mk-form-stack" :disabled="!edit">
            <label class="check mk-form-check-row"><input class="mk-form-check" v-model="rule.readOnly" type="checkbox" name="readOnly"> {{ label('readOnly') }}</label>
            <label class="mk-form-field" v-for="key in (['description', 'hint'] as const)" :key="key">{{ label(key) }}
              <textarea class="mk-form-control" v-model="rule[key]" :name="key" rows="2" />
            </label>
            <div class="mk-form-grid">
              <label class="mk-form-field">{{ label('visibleWhen') }}
                <input class="mk-form-control" name="visibleField" :list="id + '-fields'" :placeholder="label('alwaysVisible')" :value="rule.visibleWhen?.field"
                  @input="setDependency(($event.target as HTMLInputElement).value.trim())">
                <datalist :id="id + '-fields'">
                  <option v-for="item in items" :key="item.variableName" :value="item.variableName">
                    {{ resolveLocalizedValue(item.labelName, editingLocale, localeConfig) }}
                  </option>
                </datalist>
              </label>
              <label class="mk-form-field" v-if="rule.visibleWhen">{{ label('operator') }}
                <select class="mk-form-control" name="visibleMode" :value="rule.visibleWhen.equals === undefined ? 'truthy' : 'equals'"
                  @change="setComparison(($event.target as HTMLSelectElement).value)">
                  <option value="truthy">{{ label('truthy') }}</option>
                  <option value="equals">{{ label('equals') }}</option>
                </select>
              </label>
              <label class="mk-form-field" v-if="rule.visibleWhen && rule.visibleWhen.equals !== undefined">{{ label('value') }}
                <input class="mk-form-control" v-model="rule.visibleWhen.equals" name="visibleEquals">
              </label>
            </div>
            <label class="mk-form-field">{{ label('pattern') }}
              <input class="mk-form-control" ref="patternInput" v-model="rule.pattern" name="pattern" @input="error = ''">
            </label>
            <label class="mk-form-field">{{ label('invalidMessage') }}<input class="mk-form-control" v-model="rule.invalidMessage" name="invalidMessage"></label>
          </fieldset>
        </div>
        <div class="mk-form-dialog-footer">
          <p v-if="error" role="alert" class="mr-auto text-sm text-red-600">{{ error }}</p>
          <button type="button" class="border mk-form-button" @click="dialog?.close()">{{ t('globalCalls.cancel') }}</button>
          <button v-if="edit" type="submit" class="primary mk-form-button mk-form-button--primary" data-testid="form-item-rules-save">{{ t('form.itemsEditor.actions.save') }}</button>
        </div>
      </form>
    </dialog>
  </Teleport>
</template>

