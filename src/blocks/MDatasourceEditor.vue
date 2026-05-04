<script lang="ts">
import { defineEditorTool } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export interface MDatasourceEditorProps {
  edit: boolean;
  datasourceName?: string;
  datasourceConfig?: string;
}

export const mDatasourceEditorTool = defineEditorTool<MDatasourceEditorProps>({
  toolbox: {
    get title() {
      return i18n.t('datasourceEditor.toolboxTitle');
    },
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4H4V5Zm0 6h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8Zm4 3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Z" fill="currentColor"/></svg>'
  },
  propertyPanel: {
    get title() {
      return i18n.t('datasourceEditor.propertyPanelTitle');
    },
    get fields() {
      return [
        {
          key: 'datasourceName',
          label: i18n.t('datasourceEditor.properties.datasourceName'),
          placeholder: i18n.t('datasourceEditor.placeholders.datasourceName')
        },
        {
          key: 'datasourceConfig',
          label: i18n.t('datasourceEditor.properties.datasourceConfig'),
          placeholder: i18n.t('datasourceEditor.placeholders.datasourceConfig')
        }
      ];
    }
  },
  createInitialProps: () => ({
    datasourceName: i18n.t('datasourceEditor.defaultDatasourceName'),
    datasourceConfig: '{\n  "url": "https://api.example.com/data",\n  "method": "GET"\n}'
  }),
  normalizeProps: (props) => ({
    edit: props.edit ?? false,
    datasourceName: props.datasourceName ?? '',
    datasourceConfig: props.datasourceConfig ?? ''
  }),
  serialize: (props) => ({
    datasourceName: props.datasourceName ?? '',
    datasourceConfig: props.datasourceConfig ?? ''
  })
});
</script>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<MDatasourceEditorProps & {
  onChange?: (payload: MDatasourceEditorProps) => void;
  onToolChange?: (payload: MDatasourceEditorProps) => void;
}>();

function emitChange(payload: Partial<MDatasourceEditorProps>) {
  const nextPayload = {
    edit: props.edit,
    datasourceName: props.datasourceName ?? '',
    datasourceConfig: props.datasourceConfig ?? '',
    ...payload
  };
  props.onToolChange?.(nextPayload);
  props.onChange?.(nextPayload);
}

const parsedConfigError = computed(() => {
  const raw = props.datasourceConfig?.trim();
  if (!raw) return '';

  try {
    JSON.parse(raw);
    return '';
  } catch {
    return 'JSON 格式错误';
  }
});
</script>

<template>
  <div class="ce-datasource-editor-tool" data-testid="editor-datasource-editor-tool">
    <label class="ce-datasource-editor-tool__label">
      <span>{{ datasourceName || '-' }}</span>
    </label>
    <textarea
      class="ce-datasource-editor-tool__textarea"
      :value="datasourceConfig"
      rows="8"
      @input="emitChange({ datasourceConfig: ($event.target as HTMLTextAreaElement).value })"
    />
    <p v-if="parsedConfigError" class="ce-datasource-editor-tool__error">{{ parsedConfigError }}</p>
  </div>
</template>

<style scoped>
.ce-datasource-editor-tool { display:flex; flex-direction:column; gap:8px; }
.ce-datasource-editor-tool__label { font-size:13px; color: rgb(71 85 105); }
.ce-datasource-editor-tool__textarea { width:100%; border:1px solid rgb(148 163 184 / .6); border-radius:8px; padding:8px 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:12px; }
.ce-datasource-editor-tool__error { margin:0; color: rgb(220 38 38); font-size:12px; }
</style>
