<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import {
  serializeMActionToolbarProps,
  type MActionToolbarAlign,
  type MActionToolbarMode,
  type MActionToolbarSize,
  type ToolbarButton
} from 'mokelay-components/blocks/MActionToolbar.vue';

export type MActionToolBarEditorData = {
  align?: MActionToolbarAlign | string;
  size?: MActionToolbarSize | string;
  mode?: MActionToolbarMode | string;
  buttons?: ToolbarButton[];
};

export type ActionToolBarEditorPayload = {
  value?: MActionToolBarEditorData;
  patch?: MActionToolBarEditorData;
};

export interface MActionToolBarEditorProps extends EditorToolComponentProps {
  value?: MActionToolBarEditorData;
  allowEmpty?: boolean;
  outputMode?: 'value' | 'patch';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeActionToolbarEditorValue(value: unknown): MActionToolBarEditorData {
  const source = isRecord(value) ? value : {};
  return serializeMActionToolbarProps({
    ...source,
    edit: false,
    buttons: Array.isArray(source.buttons) ? source.buttons : []
  });
}

export function normalizeMActionToolBarEditorProps(
  props: Partial<MActionToolBarEditorProps>
): MActionToolBarEditorProps {
  return {
    edit: props.edit ?? false,
    currentBlockId: props.currentBlockId,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    previewRuntime: props.previewRuntime,
    pageEditor: props.pageEditor,
    value: normalizeActionToolbarEditorValue(props.value),
    allowEmpty: props.allowEmpty === true,
    outputMode: props.outputMode === 'patch' ? 'patch' : 'value'
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MActionToolBarEditor",
 *   "displayName": "动作工具栏配置编辑器",
 *   "category": "action",
 *   "description": "动作工具栏配置编辑器，用于维护动作工具栏的对齐、尺寸、展示模式和按钮事件配置。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MActionToolBarEditor",
 *     "toolSymbol": "mActionToolBarEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 172
 *   },
 *   "toolbox": {
 *     "title": "动作工具栏配置编辑器",
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 10h3M14 10h2M8 14h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "value": {
 *       "align": "left",
 *       "size": "md",
 *       "mode": "inline",
 *       "buttons": []
 *     },
 *     "allowEmpty": false,
 *     "outputMode": "value"
 *   },
 *   "properties": [
 *     {
 *       "key": "value",
 *       "optional": true,
 *       "tsType": "MActionToolBarEditorData",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "工具栏配置"
 *     },
 *     {
 *       "key": "allowEmpty",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "允许空工具栏"
 *     },
 *     {
 *       "key": "outputMode",
 *       "optional": true,
 *       "tsType": "'value' | 'patch'",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "输出模式"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "toolChange",
 *       "payload": "{ value?: MActionToolBarEditorData; patch?: MActionToolBarEditorData }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "label": "工具变更",
 *       "description": "工具栏配置保存时通知宿主同步配置；通过 event.value 或 event.patch 读取配置。"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "{ value?: MActionToolBarEditorData; patch?: MActionToolBarEditorData }",
 *       "trigger": "属性编辑器保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MActionToolBarEditor.vue",
 *       "label": "变更",
 *       "description": "工具栏配置保存时触发；通过 event.value 或 event.patch 读取配置。"
 *     }
 *   ],
 *   "methods": [],
 *   "dataFields": [],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时输出 value、allowEmpty 和 outputMode；作为属性编辑器时由 payload 决定回写 value 或 patch。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MActionToolBarEditor-example",
 *       "type": "MActionToolBarEditor",
 *       "data": {
 *         "value": {
 *           "align": "left",
 *           "size": "md",
 *           "mode": "inline",
 *           "buttons": []
 *         }
 *       }
 *     }
 *   ]
 * }
 */
export const mActionToolBarEditorTool = defineEditorTool<MActionToolBarEditorProps>({
  normalizeProps: normalizeMActionToolBarEditorProps,
  serialize: (props) => {
    const normalized = normalizeMActionToolBarEditorProps(props);
    return {
      value: normalized.value,
      allowEmpty: normalized.allowEmpty,
      outputMode: normalized.outputMode
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MActionEditor from '@/editors/blocks/MActionEditor.vue';
import { cloneActions, type ActionConfig } from 'mokelay-components/actions';
import { cloneBlockEvents } from 'mokelay-components/blocks';
import { useI18n } from '@/i18n';

const props = defineProps<MActionToolBarEditorProps & {
  onChange?: (payload: ActionToolBarEditorPayload) => void;
  onToolChange?: (payload: ActionToolBarEditorPayload) => void;
}>();

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);
const committedToolbar = ref<MActionToolBarEditorData>(cloneToolbar(props.value));
const draftToolbar = ref<MActionToolBarEditorData>(cloneToolbar(props.value));
const savedButtonCount = computed(() => committedToolbar.value.buttons?.length ?? 0);
const draftButtons = computed(() => draftToolbar.value.buttons ?? []);
const isReadOnly = computed(() => !props.edit);

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeToolbar(value: unknown): MActionToolBarEditorData {
  return normalizeActionToolbarEditorValue(value);
}

function cloneToolbar(value: unknown): MActionToolBarEditorData {
  return cloneValue(normalizeToolbar(value));
}

function outputToolbar(value: MActionToolBarEditorData): MActionToolBarEditorData | undefined {
  const normalized = normalizeToolbar(value);
  return props.allowEmpty || normalized.buttons?.length ? normalized : undefined;
}

function openDialog() {
  draftToolbar.value = cloneToolbar(committedToolbar.value);
  isOpen.value = true;
  if (!dialogRef.value?.open) {
    dialogRef.value?.showModal();
  }
}

function closeDialog() {
  isOpen.value = false;
  if (dialogRef.value?.open) {
    dialogRef.value.close();
  }
}

function updateRootField(field: 'align' | 'size' | 'mode', value: string) {
  if (isReadOnly.value) return;
  draftToolbar.value = {
    ...draftToolbar.value,
    [field]: value
  };
}

function createButton(): ToolbarButton {
  const nextIndex = draftButtons.value.length + 1;
  return {
    id: `button_${nextIndex}`,
    label: `按钮${nextIndex}`,
    variant: 'primary',
    align: 'left',
    events: []
  };
}

function addButton() {
  if (isReadOnly.value) return;
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: [...draftButtons.value, createButton()]
  };
}

function updateButton(index: number, patch: Partial<ToolbarButton>) {
  if (isReadOnly.value) return;
  const nextButtons = draftButtons.value.map((button, buttonIndex) => (
    buttonIndex === index ? { ...button, ...patch } : button
  ));
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: nextButtons
  };
}

function removeButton(index: number) {
  if (isReadOnly.value) return;
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: draftButtons.value.filter((_, buttonIndex) => buttonIndex !== index)
  };
}

function moveButton(index: number, direction: -1 | 1) {
  if (isReadOnly.value) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= draftButtons.value.length) return;

  const nextButtons = [...draftButtons.value];
  const [button] = nextButtons.splice(index, 1);
  if (!button) return;
  nextButtons.splice(nextIndex, 0, button);
  draftToolbar.value = {
    ...draftToolbar.value,
    buttons: nextButtons
  };
}

function getClickActions(button: ToolbarButton) {
  return cloneBlockEvents(button.events)
    .find((eventConfig) => eventConfig.event === 'click')
    ?.actions ?? [];
}

function updateButtonActions(index: number, actions: ActionConfig[]) {
  if (isReadOnly.value) return;
  const button = draftButtons.value[index];
  if (!button) return;
  const otherEvents = cloneBlockEvents(button.events).filter((eventConfig) => eventConfig.event !== 'click');
  updateButton(index, {
    events: actions.length
      ? [{ event: 'click', actions: cloneActions(actions) }, ...otherEvents]
      : otherEvents
  });
}

function saveToolbar() {
  if (isReadOnly.value) return;
  const normalized = cloneToolbar(draftToolbar.value);
  committedToolbar.value = normalized;
  const output = outputToolbar(normalized);
  const payload = props.outputMode === 'patch'
    ? { patch: output }
    : { value: output };
  props.onToolChange?.(payload);
  props.onChange?.(payload);
  closeDialog();
}

watch(
  () => props.value,
  (value) => {
    committedToolbar.value = cloneToolbar(value);
    if (!isOpen.value) {
      draftToolbar.value = cloneToolbar(value);
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="ce-form-action-bar-editor" data-testid="form-action-bar-editor">
    <div class="ce-form-action-bar-editor__trigger-row">
      <button
        class="ce-form-action-bar-editor__primary-button mk-form-button mk-form-button--primary"
        type="button"
        data-testid="form-action-bar-settings-open"
        @click="openDialog"
      >
        {{ t('form.actionBarEditor.actions.settings') }}
      </button>
      <div class="ce-form-action-bar-editor__summary" data-testid="form-action-bar-summary">
        {{ t('form.actionBarEditor.summary.savedCount').replace('{count}', String(savedButtonCount)) }}
      </div>
    </div>

    <dialog
      ref="dialogRef"
      class="ce-form-action-bar-editor__dialog mk-form-dialog"
      data-testid="form-action-bar-dialog"
      :aria-hidden="!isOpen"
      aria-labelledby="form-action-bar-dialog-title"
      @close="isOpen = false"
    >
      <div class="ce-form-action-bar-editor__dialog-panel mk-form-dialog-panel">
        <div class="ce-form-action-bar-editor__dialog-header mk-form-dialog-header">
          <h3
            id="form-action-bar-dialog-title"
            class="ce-form-action-bar-editor__dialog-title"
            data-testid="form-action-bar-dialog-title"
          >
            {{ t('form.actionBarEditor.settingsDialogTitle') }}
          </h3>
          <button
            class="ce-form-action-bar-editor__secondary-button mk-form-button"
            type="button"
            data-testid="form-action-bar-close"
            @click="closeDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="ce-form-action-bar-editor__dialog-body mk-form-dialog-body mk-form-scope">
          <section class="ce-form-action-bar-editor__section">
            <div class="ce-form-action-bar-editor__section-header">
              <div>
                <div class="ce-form-action-bar-editor__section-title">
                  {{ t('form.actionBarEditor.sections.layout') }}
                </div>
                <p class="ce-form-action-bar-editor__section-copy">
                  {{ t('form.actionBarEditor.help.layout') }}
                </p>
              </div>
            </div>
            <div class="ce-form-action-bar-editor__form-grid">
              <label class="mk-form-field">
                <span>{{ t('form.actionBarEditor.fields.align') }}</span>
                <select
                  class="ce-form-action-bar-editor__input mk-form-control"
                  data-testid="form-action-bar-align"
                  :disabled="isReadOnly"
                  :value="draftToolbar.align"
                  @change="updateRootField('align', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="left">{{ t('form.actionBarEditor.align.left') }}</option>
                  <option value="right">{{ t('form.actionBarEditor.align.right') }}</option>
                  <option value="stretch">{{ t('form.actionBarEditor.align.stretch') }}</option>
                  <option value="space-between">{{ t('form.actionBarEditor.align.spaceBetween') }}</option>
                </select>
              </label>
              <label class="mk-form-field">
                <span>{{ t('form.actionBarEditor.fields.size') }}</span>
                <select
                  class="ce-form-action-bar-editor__input mk-form-control"
                  data-testid="form-action-bar-size"
                  :disabled="isReadOnly"
                  :value="draftToolbar.size"
                  @change="updateRootField('size', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="small">{{ t('form.actionBarEditor.size.small') }}</option>
                  <option value="medium">{{ t('form.actionBarEditor.size.medium') }}</option>
                  <option value="large">{{ t('form.actionBarEditor.size.large') }}</option>
                </select>
              </label>
              <label class="mk-form-field">
                <span>{{ t('form.actionBarEditor.fields.mode') }}</span>
                <select
                  class="ce-form-action-bar-editor__input mk-form-control"
                  data-testid="form-action-bar-mode"
                  :disabled="isReadOnly"
                  :value="draftToolbar.mode"
                  @change="updateRootField('mode', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="inline">{{ t('form.actionBarEditor.mode.inline') }}</option>
                  <option value="grouped">{{ t('form.actionBarEditor.mode.grouped') }}</option>
                  <option value="dropdown">{{ t('form.actionBarEditor.mode.dropdown') }}</option>
                </select>
              </label>
            </div>
          </section>

          <section class="ce-form-action-bar-editor__section">
            <div class="ce-form-action-bar-editor__section-header">
              <div>
                <div class="ce-form-action-bar-editor__section-title">
                  {{ t('form.actionBarEditor.sections.buttons') }}
                </div>
                <p class="ce-form-action-bar-editor__section-copy">
                  {{ t('form.actionBarEditor.summary.draftCount').replace('{count}', String(draftButtons.length)) }}
                </p>
              </div>
              <button
                v-if="edit"
                class="ce-form-action-bar-editor__primary-button mk-form-button mk-form-button--primary"
                type="button"
                data-testid="form-action-bar-add-button"
                @click="addButton"
              >
                {{ t('form.actionBarEditor.actions.add') }}
              </button>
            </div>

            <div class="ce-form-action-bar-editor__button-list">
              <p
                v-if="!draftButtons.length"
                class="ce-form-action-bar-editor__empty"
                data-testid="form-action-bar-empty"
              >
                {{ t('form.actionBarEditor.empty') }}
              </p>

              <template v-else>
                <article
                  v-for="(button, index) in draftButtons"
                  :key="`${button.id}-${index}`"
                  class="ce-form-action-bar-editor__button-card"
                  :data-testid="`form-action-bar-button-${index}`"
                >
                  <div class="ce-form-action-bar-editor__button-grid">
                    <label class="mk-form-field">
                      <span>{{ t('form.actionBarEditor.fields.id') }}</span>
                      <input
                        class="ce-form-action-bar-editor__input mk-form-control"
                        :data-testid="`form-action-bar-button-id-${index}`"
                        type="text"
                        :readonly="isReadOnly"
                        :value="button.id"
                        @input="updateButton(index, { id: ($event.target as HTMLInputElement).value })"
                        @keydown.stop
                      />
                    </label>
                    <label class="mk-form-field">
                      <span>{{ t('form.actionBarEditor.fields.label') }}</span>
                      <input
                        class="ce-form-action-bar-editor__input mk-form-control"
                        :data-testid="`form-action-bar-button-label-${index}`"
                        type="text"
                        :readonly="isReadOnly"
                        :value="button.label"
                        @input="updateButton(index, { label: ($event.target as HTMLInputElement).value })"
                        @keydown.stop
                      />
                    </label>
                    <label class="mk-form-field">
                      <span>{{ t('form.actionBarEditor.fields.loadingLabel') }}</span>
                      <input
                        class="ce-form-action-bar-editor__input mk-form-control"
                        :data-testid="`form-action-bar-button-loading-label-${index}`"
                        type="text"
                        :readonly="isReadOnly"
                        :value="button.loadingLabel"
                        @input="updateButton(index, { loadingLabel: ($event.target as HTMLInputElement).value })"
                      >
                    </label>
                    <label class="mk-form-field">
                      <span>{{ t('form.actionBarEditor.fields.variant') }}</span>
                      <select
                        class="ce-form-action-bar-editor__input mk-form-control"
                        :data-testid="`form-action-bar-button-variant-${index}`"
                        :disabled="isReadOnly"
                        :value="button.variant"
                        @change="updateButton(index, { variant: ($event.target as HTMLSelectElement).value })"
                      >
                        <option value="primary">{{ t('form.actionBarEditor.variant.primary') }}</option>
                        <option value="secondary">{{ t('form.actionBarEditor.variant.secondary') }}</option>
                        <option value="ghost">{{ t('form.actionBarEditor.variant.ghost') }}</option>
                        <option value="danger">{{ t('form.actionBarEditor.variant.danger') }}</option>
                        <option value="warning">{{ t('form.actionBarEditor.variant.warning') }}</option>
                        <option value="text">{{ t('form.actionBarEditor.variant.text') }}</option>
                      </select>
                    </label>
                    <label class="mk-form-check-row">
                      <span>{{ t('form.actionBarEditor.fields.disabled') }}</span>
                      <input
                        class="ce-form-action-bar-editor__checkbox mk-form-check"
                        :data-testid="`form-action-bar-button-disabled-${index}`"
                        type="checkbox"
                        :disabled="isReadOnly"
                        :checked="button.disabled === true"
                        @change="updateButton(index, { disabled: ($event.target as HTMLInputElement).checked })"
                      />
                    </label>
                  </div>

                  <div class="ce-form-action-bar-editor__card-footer">
                    <MActionEditor
                      :edit="edit"
                      :model-value="getClickActions(button)"
                      :current-block-id="currentBlockId"
                      :page-editor="pageEditor"
                      @update:model-value="updateButtonActions(index, $event)"
                      @change="updateButtonActions(index, $event)"
                    />
                    <div class="ce-form-action-bar-editor__row-actions">
                      <button
                        class="ce-form-action-bar-editor__icon-button mk-form-button"
                        type="button"
                        :data-testid="`form-action-bar-button-up-${index}`"
                        :disabled="isReadOnly || index === 0"
                        @click="moveButton(index, -1)"
                      >
                        {{ t('form.actionBarEditor.actions.moveUp') }}
                      </button>
                      <button
                        class="ce-form-action-bar-editor__icon-button mk-form-button"
                        type="button"
                        :data-testid="`form-action-bar-button-down-${index}`"
                        :disabled="isReadOnly || index === draftButtons.length - 1"
                        @click="moveButton(index, 1)"
                      >
                        {{ t('form.actionBarEditor.actions.moveDown') }}
                      </button>
                      <button
                        class="ce-form-action-bar-editor__danger-button mk-form-button mk-form-button--danger"
                        type="button"
                        :data-testid="`form-action-bar-button-remove-${index}`"
                        :disabled="isReadOnly"
                        @click="removeButton(index)"
                      >
                        {{ t('form.actionBarEditor.actions.remove') }}
                      </button>
                    </div>
                  </div>
                </article>
              </template>
            </div>
          </section>
        </div>

        <div class="ce-form-action-bar-editor__dialog-actions mk-form-dialog-footer">
          <button
            class="ce-form-action-bar-editor__secondary-button mk-form-button"
            type="button"
            data-testid="form-action-bar-cancel"
            @click="closeDialog"
          >
            {{ edit ? t('form.actionBarEditor.actions.cancel') : t('editor.close') }}
          </button>
          <button
            v-if="edit"
            class="ce-form-action-bar-editor__primary-button mk-form-button mk-form-button--primary"
            type="button"
            data-testid="form-action-bar-save"
            @click="saveToolbar"
          >
            {{ t('form.actionBarEditor.actions.save') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.ce-form-action-bar-editor {
  width: 100%;
  color: rgb(15 23 42);
  font-size: 14px;
  line-height: 20px;
}

.ce-form-action-bar-editor__trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ce-form-action-bar-editor__summary {
  min-width: 0;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 5px 8px;
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 650;
  line-height: 18px;
}

.ce-form-action-bar-editor__primary-button,
.ce-form-action-bar-editor__secondary-button,
.ce-form-action-bar-editor__icon-button,
.ce-form-action-bar-editor__danger-button {
  flex: 0 0 auto;
  cursor: pointer;
}

.ce-form-action-bar-editor__primary-button:disabled,
.ce-form-action-bar-editor__secondary-button:disabled,
.ce-form-action-bar-editor__icon-button:disabled,
.ce-form-action-bar-editor__danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ce-form-action-bar-editor__dialog-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ce-form-action-bar-editor__dialog-header,
.ce-form-action-bar-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ce-form-action-bar-editor__dialog-actions {
  justify-content: flex-end;
}

.ce-form-action-bar-editor__dialog-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 16px;
  font-weight: 750;
  line-height: 24px;
}

.ce-form-action-bar-editor__dialog-body {
  display: grid;
  grid-template-columns: minmax(240px, 0.55fr) minmax(0, 1.45fr);
  gap: var(--mk-form-field-gap);
  overflow: auto;
}

.ce-form-action-bar-editor__section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(255 255 255);
}

.ce-form-action-bar-editor__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 12px;
  background: rgb(248 250 252);
}

.ce-form-action-bar-editor__section-title {
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 750;
  line-height: 20px;
}

.ce-form-action-bar-editor__section-copy {
  margin: 2px 0 0;
  color: rgb(100 116 139);
  font-size: 12px;
  line-height: 18px;
}

.ce-form-action-bar-editor__form-grid,
.ce-form-action-bar-editor__button-list {
  padding: 12px;
}

.ce-form-action-bar-editor__form-grid {
  display: grid;
  gap: var(--mk-form-field-gap);
}

.ce-form-action-bar-editor__button-list {
  display: grid;
  gap: 10px;
  overflow: auto;
}

.ce-form-action-bar-editor__button-card {
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  padding: 10px;
  background: rgb(255 255 255);
}

.ce-form-action-bar-editor__button-grid {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(140px, 1fr) minmax(120px, 0.7fr) 82px;
  gap: 8px;
}

.ce-form-action-bar-editor__input:read-only,
.ce-form-action-bar-editor__input:disabled {
  cursor: not-allowed;
}

.ce-form-action-bar-editor__checkbox {
  width: 18px;
  height: 18px;
}

.ce-form-action-bar-editor__card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.ce-form-action-bar-editor__row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ce-form-action-bar-editor__empty {
  margin: 0;
  color: rgb(100 116 139);
  font-size: 13px;
}

.dark .ce-form-action-bar-editor {
  color: rgb(226 232 240);
}

.dark .ce-form-action-bar-editor__summary,
.dark .ce-form-action-bar-editor__section-header {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(203 213 225);
}

.dark .ce-form-action-bar-editor__dialog-panel,
.dark .ce-form-action-bar-editor__section,
.dark .ce-form-action-bar-editor__button-card {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59);
}

.dark .ce-form-action-bar-editor__dialog-title,
.dark .ce-form-action-bar-editor__section-title {
  color: rgb(248 250 252);
}

.dark .ce-form-action-bar-editor__section-copy,
.dark .ce-form-action-bar-editor__empty,
.dark .ce-form-action-bar-editor label {
  color: rgb(148 163 184);
}

.dark .ce-form-action-bar-editor__input,
.dark .ce-form-action-bar-editor__secondary-button,
.dark .ce-form-action-bar-editor__icon-button,
.dark .ce-form-action-bar-editor__danger-button {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

@container (max-width: 960px) {
  .ce-form-action-bar-editor__dialog-body,
  .ce-form-action-bar-editor__button-grid {
    grid-template-columns: 1fr;
  }
}
</style>
