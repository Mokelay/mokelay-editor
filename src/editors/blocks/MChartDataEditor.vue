<script lang="ts">
import { defineEditorTool, type EditorToolComponentProps } from '@/editors/editorToolDefinition';
import { i18n } from '@/i18n';

export type MChartDataEditorChartType = 'line' | 'bar' | 'pie';

export type MChartDataEditorSeriesItem = {
  name: string;
  data: number[];
};

export type MChartDataEditorData = {
  xAxis: string[];
  series: MChartDataEditorSeriesItem[];
  chartType?: MChartDataEditorChartType;
  readonly?: boolean;
};

export interface MChartDataEditorProps extends EditorToolComponentProps {
  value?: unknown;
  xAxis?: unknown;
  series?: unknown;
  chartType?: MChartDataEditorChartType | string;
  readonly?: boolean;
  outputMode?: 'value' | 'patch';
  testid?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseJsonIfString(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function localizedString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value.trim() || fallback;
  if (isRecord(value)) {
    const localeValue = i18n.locale === 'en' ? value.en : value.zh;
    if (typeof localeValue === 'string' && localeValue.trim()) return localeValue.trim();
    if (typeof value.raw === 'string' && value.raw.trim()) return value.raw.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes'].includes(normalized)) return true;
    if (['0', 'false', 'no'].includes(normalized)) return false;
  }
  return fallback;
}

function getDefaultXAxis() {
  return i18n.locale === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    : ['周一', '周二', '周三', '周四', '周五'];
}

function getDefaultSeries(length = getDefaultXAxis().length): MChartDataEditorSeriesItem[] {
  return [{
    name: i18n.t('chart.defaultSeriesName'),
    data: [120, 200, 150, 80, 70].slice(0, length).concat(Array.from({ length: Math.max(0, length - 5) }, () => 0))
  }];
}

function normalizeChartType(value: unknown): MChartDataEditorChartType {
  return value === 'bar' || value === 'pie' ? value : 'line';
}

function normalizeXAxis(value: unknown): string[] {
  const source = parseJsonIfString(value);
  if (!Array.isArray(source)) return getDefaultXAxis();

  const normalized = source
    .map((item) => localizedString(item))
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length ? normalized : getDefaultXAxis();
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function alignSeriesData(data: unknown[], length: number) {
  return Array.from({ length }, (_, index) => normalizeNumber(data[index]));
}

function normalizeSeries(value: unknown, xAxisLength: number): MChartDataEditorSeriesItem[] {
  const source = parseJsonIfString(value);
  if (!Array.isArray(source)) return getDefaultSeries(xAxisLength);

  const normalized = source
    .flatMap((item, index): MChartDataEditorSeriesItem[] => {
      if (!isRecord(item)) return [];
      const data = Array.isArray(item.data) ? item.data : [];
      return [{
        name: localizedString(item.name, `${i18n.t('chart.defaultSeriesName')}${index + 1}`),
        data: alignSeriesData(data, xAxisLength)
      }];
    })
    .filter((item) => item.name.trim());

  return normalized.length ? normalized : getDefaultSeries(xAxisLength);
}

function readValueRecord(value: unknown) {
  const parsed = parseJsonIfString(value);
  return isRecord(parsed) ? parsed : {};
}

export function normalizeMChartDataEditorData(value: unknown): MChartDataEditorData {
  const record = readValueRecord(value);
  const xAxis = normalizeXAxis(record.xAxis);
  return {
    xAxis,
    series: normalizeSeries(record.series, xAxis.length),
    chartType: normalizeChartType(record.chartType ?? record.type),
    readonly: booleanValue(record.readonly)
  };
}

export function normalizeMChartDataEditorProps(props: Partial<MChartDataEditorProps>): MChartDataEditorProps {
  const valueRecord = readValueRecord(props.value);
  const xAxis = normalizeXAxis(props.xAxis ?? valueRecord.xAxis);
  const chartType = normalizeChartType(props.chartType ?? valueRecord.chartType ?? valueRecord.type);
  return {
    edit: props.edit ?? false,
    currentBlockId: typeof props.currentBlockId === 'string' ? props.currentBlockId : undefined,
    getAvailableBlockDataSources: props.getAvailableBlockDataSources,
    getAvailablePageVariableSources: props.getAvailablePageVariableSources,
    value: {
      xAxis,
      series: normalizeSeries(props.series ?? valueRecord.series, xAxis.length),
      chartType,
      readonly: booleanValue(props.readonly ?? valueRecord.readonly)
    },
    xAxis,
    series: normalizeSeries(props.series ?? valueRecord.series, xAxis.length),
    chartType,
    readonly: booleanValue(props.readonly ?? valueRecord.readonly),
    outputMode: props.outputMode === 'patch' ? 'patch' : 'value',
    testid: typeof props.testid === 'string' ? props.testid : ''
  };
}

/**
 * @clientBlockDoc
 * {
 *   "version": 1,
 *   "editorBlock": true,
 *   "blockType": "MChartDataEditor",
 *   "displayName": "图表数据编辑器",
 *   "category": "data",
 *   "description": "图表数据编辑器，用类表格方式维护 MChart 的横坐标和多组 series 数据，并保证分类和数据长度一致。",
 *   "status": "active",
 *   "registration": {
 *     "sourceKind": "mokelay-editor",
 *     "sourcePackage": "mokelay-editor",
 *     "componentName": "MChartDataEditor",
 *     "toolSymbol": "mChartDataEditorTool",
 *     "editorEnabled": false,
 *     "toolboxVisible": false,
 *     "sortOrder": 171
 *   },
 *   "toolbox": {
 *     "title": {
 *       "zh": "图表数据编辑器",
 *       "en": "Chart Data Editor"
 *     },
 *     "icon": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 16V11M12 16V8M16 16v-6\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
 *   },
 *   "defaultData": {
 *     "xAxis": [
 *       { "zh": "周一", "en": "Mon" },
 *       { "zh": "周二", "en": "Tue" },
 *       { "zh": "周三", "en": "Wed" },
 *       { "zh": "周四", "en": "Thu" },
 *       { "zh": "周五", "en": "Fri" }
 *     ],
 *     "series": [
 *       {
 *         "name": { "zh": "数据", "en": "Data" },
 *         "data": [120, 200, 150, 80, 70]
 *       }
 *     ],
 *     "chartType": "line",
 *     "readonly": false
 *   },
 *   "properties": [
 *     {
 *       "key": "xAxis",
 *       "optional": true,
 *       "tsType": "string[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "line": 18,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "横坐标数据"
 *     },
 *     {
 *       "key": "series",
 *       "optional": true,
 *       "tsType": "MChartDataEditorSeriesItem[]",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "line": 19,
 *       "declaredInProps": true,
 *       "configurable": false,
 *       "label": "图表数据"
 *     },
 *     {
 *       "key": "chartType",
 *       "optional": true,
 *       "tsType": "MChartDataEditorChartType | string",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "line": 20,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "预览图表类型",
 *       "type": "select",
 *       "options": [
 *         { "value": "line", "label": { "zh": "折线图", "en": "Line chart" } },
 *         { "value": "bar", "label": { "zh": "柱状图", "en": "Bar chart" } },
 *         { "value": "pie", "label": { "zh": "饼图", "en": "Pie chart" } }
 *       ]
 *     },
 *     {
 *       "key": "readonly",
 *       "optional": true,
 *       "tsType": "boolean",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "line": 21,
 *       "declaredInProps": true,
 *       "configurable": true,
 *       "label": "只读",
 *       "type": "checkbox"
 *     }
 *   ],
 *   "events": [
 *     {
 *       "event": "update:modelValue",
 *       "payload": "value: MChartDataEditorData",
 *       "trigger": "图表数据保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "label": "更新绑定值"
 *     },
 *     {
 *       "event": "change",
 *       "payload": "{ value?: MChartDataEditorData; patch?: Pick<MChartDataEditorData, 'xAxis' | 'series'> }",
 *       "trigger": "图表数据保存时",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "label": "变更"
 *     }
 *   ],
 *   "methods": [
 *     {
 *       "name": "setValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "value: unknown",
 *       "returns": "void",
 *       "label": "设置图表数据"
 *     },
 *     {
 *       "name": "getValue",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "MChartDataEditorData",
 *       "label": "获取图表数据"
 *     },
 *     {
 *       "name": "clear",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "void",
 *       "label": "恢复默认数据"
 *     },
 *     {
 *       "name": "validate",
 *       "exposed": true,
 *       "async": false,
 *       "params": "none",
 *       "returns": "{ valid: boolean; message?: string }",
 *       "label": "校验"
 *     }
 *   ],
 *   "dataFields": [
 *     {
 *       "label": "横坐标",
 *       "variable": "xAxis",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue"
 *     },
 *     {
 *       "label": "系列数据",
 *       "variable": "series",
 *       "dataType": "array",
 *       "source": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue"
 *     }
 *   ],
 *   "saveRules": [
 *     {
 *       "key": "serialize",
 *       "type": "function",
 *       "description": "保存时调用该 block 的 serialize(props)，输出 xAxis、series、chartType 和 readonly。作为 MChart 属性编辑器时通过 patch 回写 xAxis 和 series。"
 *     }
 *   ],
 *   "examples": [
 *     {
 *       "id": "MChartDataEditor-example",
 *       "type": "MChartDataEditor",
 *       "data": {
 *         "xAxis": ["周一", "周二", "周三"],
 *         "series": [
 *           { "name": "数据", "data": [120, 200, 150] }
 *         ],
 *         "chartType": "line",
 *         "readonly": false
 *       }
 *     }
 *   ],
 *   "sourceRefs": [
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "reason": "Vue component implementation"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/blocks/MChartDataEditor.vue",
 *       "reason": "Editor tool definition"
 *     },
 *     {
 *       "file": "submodule/mokelay-editor/src/editors/editorComponentRegistry.ts",
 *       "reason": "registered editor component"
 *     }
 *   ]
 * }
 */
export const mChartDataEditorTool = defineEditorTool<MChartDataEditorProps>({
  normalizeProps: normalizeMChartDataEditorProps,
  serialize: (props) => {
    const normalized = normalizeMChartDataEditorProps(props);
    return {
      xAxis: cloneValue(normalized.xAxis ?? []),
      series: cloneValue(normalized.series ?? []),
      chartType: normalizeChartType(normalized.chartType),
      readonly: normalized.readonly === true
    };
  }
});
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '@/i18n';

type DraftChartSeriesItem = {
  name: string;
  data: string[];
};

type DraftChartData = {
  xAxis: string[];
  series: DraftChartSeriesItem[];
};

type ChartDataPayload = {
  value?: MChartDataEditorData;
  patch?: Pick<MChartDataEditorData, 'xAxis' | 'series'>;
};

const props = withDefaults(defineProps<MChartDataEditorProps>(), {
  edit: false,
  readonly: false,
  outputMode: 'value',
  testid: ''
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: MChartDataEditorData): void;
  (event: 'toolChange', payload: ChartDataPayload): void;
  (event: 'change', payload: ChartDataPayload): void;
}>();

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);
const committedData = ref<MChartDataEditorData>(normalizeDataFromProps());
const draftData = ref<DraftChartData>(toDraftData(committedData.value));

const isReadOnly = computed(() => props.readonly === true || !props.edit);
const chartType = computed(() => normalizeChartType(props.chartType ?? committedData.value.chartType));
const savedSummary = computed(() => t('chart.dataEditor.summary')
  .replace('{categories}', String(committedData.value.xAxis.length))
  .replace('{series}', String(committedData.value.series.length)));
const validationMessage = computed(() => validateDraftData(draftData.value).message ?? '');
const previewData = computed(() => {
  const validation = validateDraftData(draftData.value);
  return validation.valid ? draftToData(draftData.value) : committedData.value;
});
const maxPreviewValue = computed(() => Math.max(
  1,
  ...previewData.value.series.flatMap((item) => item.data.map((value) => Math.abs(value)))
));
const previewColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

function normalizeDataFromProps(): MChartDataEditorData {
  const normalized = normalizeMChartDataEditorProps(props);
  return {
    xAxis: cloneValue(normalized.xAxis ?? []) as string[],
    series: cloneValue(normalized.series ?? []) as MChartDataEditorSeriesItem[],
    chartType: normalizeChartType(normalized.chartType),
    readonly: normalized.readonly === true
  };
}

function toDraftData(value: MChartDataEditorData): DraftChartData {
  return {
    xAxis: value.xAxis.map((item) => String(item)),
    series: value.series.map((item) => ({
      name: item.name,
      data: value.xAxis.map((_, index) => String(item.data[index] ?? 0))
    }))
  };
}

function draftToData(value: DraftChartData): MChartDataEditorData {
  const xAxis = value.xAxis.map((item) => item.trim());
  return {
    xAxis,
    series: value.series.map((item, index) => ({
      name: item.name.trim() || `${t('chart.defaultSeriesName')}${index + 1}`,
      data: xAxis.map((_, dataIndex) => Number(item.data[dataIndex] ?? 0))
    })),
    chartType: chartType.value,
    readonly: props.readonly === true
  };
}

function validateDraftData(value: DraftChartData): { valid: boolean; message?: string } {
  if (!value.xAxis.length) {
    return { valid: false, message: t('chart.dataEditor.validation.emptyCategory') };
  }

  if (value.xAxis.some((item) => !item.trim())) {
    return { valid: false, message: t('chart.dataEditor.validation.emptyCategory') };
  }

  if (!value.series.length) {
    return { valid: false, message: t('chart.dataEditor.validation.emptySeries') };
  }

  if (value.series.some((item) => !item.name.trim())) {
    return { valid: false, message: t('chart.dataEditor.validation.emptySeriesName') };
  }

  const hasInvalidNumber = value.series.some((item) => (
    item.data.length !== value.xAxis.length ||
    item.data.some((cell) => !cell.trim() || !Number.isFinite(Number(cell)))
  ));
  if (hasInvalidNumber) {
    return { valid: false, message: t('chart.dataEditor.validation.invalidNumber') };
  }

  return { valid: true };
}

function openDialog() {
  draftData.value = toDraftData(committedData.value);
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

function emitData(value: MChartDataEditorData) {
  const output = {
    xAxis: cloneValue(value.xAxis),
    series: cloneValue(value.series)
  };
  const payload: ChartDataPayload = props.outputMode === 'patch'
    ? { patch: output }
    : { value: { ...output, chartType: value.chartType, readonly: value.readonly } };
  emit('update:modelValue', { ...output, chartType: value.chartType, readonly: value.readonly });
  emit('toolChange', payload);
  emit('change', payload);
}

function saveDraft() {
  if (isReadOnly.value) return;
  const validation = validateDraftData(draftData.value);
  if (!validation.valid) return;

  const normalized = draftToData(draftData.value);
  committedData.value = normalized;
  emitData(normalized);
  closeDialog();
}

function setCategory(index: number, value: string) {
  if (isReadOnly.value) return;
  draftData.value.xAxis[index] = value;
}

function addCategory() {
  if (isReadOnly.value) return;
  const nextIndex = draftData.value.xAxis.length + 1;
  draftData.value.xAxis.push(`${t('chart.dataEditor.categoryPrefix')}${nextIndex}`);
  draftData.value.series.forEach((item) => item.data.push('0'));
}

function removeCategory(index: number) {
  if (isReadOnly.value || draftData.value.xAxis.length <= 1) return;
  draftData.value.xAxis.splice(index, 1);
  draftData.value.series.forEach((item) => item.data.splice(index, 1));
}

function addSeries() {
  if (isReadOnly.value) return;
  const nextIndex = draftData.value.series.length + 1;
  draftData.value.series.push({
    name: `${t('chart.defaultSeriesName')}${nextIndex}`,
    data: draftData.value.xAxis.map(() => '0')
  });
}

function removeSeries(index: number) {
  if (isReadOnly.value || draftData.value.series.length <= 1) return;
  draftData.value.series.splice(index, 1);
}

function setSeriesName(index: number, value: string) {
  if (isReadOnly.value) return;
  const series = draftData.value.series[index];
  if (!series) return;
  series.name = value;
}

function setSeriesValue(seriesIndex: number, dataIndex: number, value: string) {
  if (isReadOnly.value) return;
  const series = draftData.value.series[seriesIndex];
  if (!series) return;
  series.data[dataIndex] = value;
}

function barHeight(value: number) {
  return Math.max(2, Math.round((Math.abs(value) / maxPreviewValue.value) * 76));
}

function barX(seriesIndex: number, dataIndex: number) {
  const categoryWidth = 320 / Math.max(1, previewData.value.xAxis.length);
  const seriesWidth = Math.max(4, Math.min(16, categoryWidth / Math.max(1, previewData.value.series.length) - 2));
  return 18 + dataIndex * categoryWidth + seriesIndex * (seriesWidth + 2);
}

function barWidth() {
  const categoryWidth = 320 / Math.max(1, previewData.value.xAxis.length);
  return Math.max(4, Math.min(16, categoryWidth / Math.max(1, previewData.value.series.length) - 2));
}

function linePoints(series: MChartDataEditorSeriesItem) {
  const width = 320;
  const step = previewData.value.xAxis.length > 1 ? width / (previewData.value.xAxis.length - 1) : 0;
  return series.data.map((value, index) => {
    const x = 18 + index * step;
    const y = 96 - (Math.abs(value) / maxPreviewValue.value) * 76;
    return `${x},${y}`;
  }).join(' ');
}

function setValue(value: unknown) {
  const normalized = normalizeMChartDataEditorData(value);
  committedData.value = normalized;
  draftData.value = toDraftData(normalized);
  emitData(normalized);
}

function getValue() {
  return cloneValue(committedData.value);
}

function clear() {
  const normalized = normalizeMChartDataEditorData({});
  committedData.value = normalized;
  draftData.value = toDraftData(normalized);
  emitData(normalized);
}

function validate() {
  return validateDraftData(draftData.value);
}

defineExpose({
  setValue,
  getValue,
  clear,
  validate
});

watch(
  () => [props.value, props.xAxis, props.series, props.chartType, props.readonly],
  () => {
    committedData.value = normalizeDataFromProps();
    if (!isOpen.value) {
      draftData.value = toDraftData(committedData.value);
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="chart-data-editor" :data-testid="testid || 'chart-data-editor'">
    <div class="chart-data-editor__trigger-row">
      <button
        class="chart-data-editor__primary-button"
        type="button"
        data-testid="chart-data-settings-open"
        @click="openDialog"
      >
        {{ t('chart.dataEditor.actions.settings') }}
      </button>
      <span class="chart-data-editor__summary" data-testid="chart-data-summary">
        {{ savedSummary }}
      </span>
    </div>

    <dialog
      ref="dialogRef"
      class="chart-data-editor__dialog"
      data-testid="chart-data-dialog"
      :aria-hidden="!isOpen"
      aria-labelledby="chart-data-dialog-title"
      @close="isOpen = false"
    >
      <div class="chart-data-editor__dialog-panel">
        <div class="chart-data-editor__dialog-header">
          <h3 id="chart-data-dialog-title" class="chart-data-editor__dialog-title">
            {{ t('chart.dataEditor.title') }}
          </h3>
          <button
            class="chart-data-editor__secondary-button"
            type="button"
            data-testid="chart-data-close"
            @click="closeDialog"
          >
            {{ t('editor.close') }}
          </button>
        </div>

        <div class="chart-data-editor__dialog-body">
          <section class="chart-data-editor__section">
            <div class="chart-data-editor__section-header">
              <div>
                <div class="chart-data-editor__section-title">{{ t('chart.dataEditor.sections.grid') }}</div>
                <p class="chart-data-editor__section-copy">{{ t('chart.dataEditor.help.grid') }}</p>
              </div>
              <div class="chart-data-editor__section-actions">
                <button
                  v-if="edit"
                  class="chart-data-editor__secondary-button"
                  type="button"
                  data-testid="chart-data-add-category"
                  :disabled="isReadOnly"
                  @click="addCategory"
                >
                  {{ t('chart.dataEditor.actions.addCategory') }}
                </button>
                <button
                  v-if="edit"
                  class="chart-data-editor__secondary-button"
                  type="button"
                  data-testid="chart-data-add-series"
                  :disabled="isReadOnly"
                  @click="addSeries"
                >
                  {{ t('chart.dataEditor.actions.addSeries') }}
                </button>
              </div>
            </div>

            <div class="chart-data-editor__table-wrap">
              <table class="chart-data-editor__table" data-testid="chart-data-table">
                <thead>
                  <tr>
                    <th>{{ t('chart.dataEditor.columns.series') }}</th>
                    <th v-for="(category, index) in draftData.xAxis" :key="`category-head-${index}`">
                      <div class="chart-data-editor__category-head">
                        <input
                          class="chart-data-editor__input chart-data-editor__category-input"
                          :data-testid="`chart-data-category-${index}`"
                          type="text"
                          :readonly="isReadOnly"
                          :value="category"
                          @input="setCategory(index, ($event.target as HTMLInputElement).value)"
                          @keydown.stop
                        />
                        <button
                          v-if="edit"
                          class="chart-data-editor__icon-button"
                          type="button"
                          :data-testid="`chart-data-category-remove-${index}`"
                          :disabled="isReadOnly || draftData.xAxis.length <= 1"
                          @click="removeCategory(index)"
                        >
                          {{ t('chart.dataEditor.actions.removeShort') }}
                        </button>
                      </div>
                    </th>
                    <th>{{ t('chart.dataEditor.columns.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(series, seriesIndex) in draftData.series" :key="`series-${seriesIndex}`">
                    <th>
                      <input
                        class="chart-data-editor__input chart-data-editor__series-input"
                        :data-testid="`chart-data-series-name-${seriesIndex}`"
                        type="text"
                        :readonly="isReadOnly"
                        :value="series.name"
                        @input="setSeriesName(seriesIndex, ($event.target as HTMLInputElement).value)"
                        @keydown.stop
                      />
                    </th>
                    <td v-for="(_, dataIndex) in draftData.xAxis" :key="`series-${seriesIndex}-data-${dataIndex}`">
                      <input
                        class="chart-data-editor__input chart-data-editor__number-input"
                        :data-testid="`chart-data-value-${seriesIndex}-${dataIndex}`"
                        type="number"
                        step="any"
                        :readonly="isReadOnly"
                        :value="series.data[dataIndex] ?? '0'"
                        @input="setSeriesValue(seriesIndex, dataIndex, ($event.target as HTMLInputElement).value)"
                        @keydown.stop
                      />
                    </td>
                    <td>
                      <button
                        v-if="edit"
                        class="chart-data-editor__danger-button"
                        type="button"
                        :data-testid="`chart-data-series-remove-${seriesIndex}`"
                        :disabled="isReadOnly || draftData.series.length <= 1"
                        @click="removeSeries(seriesIndex)"
                      >
                        {{ t('chart.dataEditor.actions.remove') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="validationMessage" class="chart-data-editor__error" data-testid="chart-data-error">
              {{ validationMessage }}
            </p>
          </section>

          <section class="chart-data-editor__section">
            <div class="chart-data-editor__section-header">
              <div>
                <div class="chart-data-editor__section-title">{{ t('chart.dataEditor.sections.preview') }}</div>
                <p class="chart-data-editor__section-copy">{{ t(`chart.types.${chartType}`) }}</p>
              </div>
            </div>
            <div class="chart-data-editor__preview" data-testid="chart-data-preview">
              <svg v-if="chartType !== 'pie'" viewBox="0 0 360 118" role="img" class="chart-data-editor__svg-preview">
                <line x1="18" y1="96" x2="342" y2="96" class="chart-data-editor__axis" />
                <line x1="18" y1="18" x2="18" y2="96" class="chart-data-editor__axis" />
                <template v-if="chartType === 'bar'">
                  <template v-for="(series, seriesIndex) in previewData.series" :key="`bar-series-${seriesIndex}`">
                    <rect
                      v-for="(value, dataIndex) in series.data"
                      :key="`bar-${seriesIndex}-${dataIndex}`"
                      :x="barX(seriesIndex, dataIndex)"
                      :y="96 - barHeight(value)"
                      :width="barWidth()"
                      :height="barHeight(value)"
                      :fill="previewColors[seriesIndex % previewColors.length]"
                      rx="2"
                    />
                  </template>
                </template>
                <template v-else>
                  <polyline
                    v-for="(series, seriesIndex) in previewData.series"
                    :key="`line-${seriesIndex}`"
                    :points="linePoints(series)"
                    fill="none"
                    :stroke="previewColors[seriesIndex % previewColors.length]"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </template>
              </svg>
              <div v-else class="chart-data-editor__pie-preview">
                <div
                  v-for="(category, index) in previewData.xAxis"
                  :key="`pie-${category}-${index}`"
                  class="chart-data-editor__pie-row"
                >
                  <span
                    class="chart-data-editor__pie-swatch"
                    :style="{ backgroundColor: previewColors[index % previewColors.length] }"
                  ></span>
                  <span>{{ category }}</span>
                  <strong>{{ previewData.series[0]?.data[index] ?? 0 }}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="chart-data-editor__dialog-actions">
          <button
            class="chart-data-editor__secondary-button"
            type="button"
            data-testid="chart-data-cancel"
            @click="closeDialog"
          >
            {{ t('globalCalls.cancel') }}
          </button>
          <button
            v-if="edit"
            class="chart-data-editor__primary-button"
            type="button"
            data-testid="chart-data-save"
            :disabled="isReadOnly || Boolean(validationMessage)"
            @click="saveDraft"
          >
            {{ t('editor.saveContent') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.chart-data-editor {
  width: 100%;
  min-width: 0;
}

.chart-data-editor__trigger-row,
.chart-data-editor__section-header,
.chart-data-editor__dialog-header,
.chart-data-editor__dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chart-data-editor__summary,
.chart-data-editor__section-copy {
  color: rgb(100 116 139);
  font-size: 12px;
  line-height: 18px;
}

.chart-data-editor__primary-button,
.chart-data-editor__secondary-button,
.chart-data-editor__danger-button,
.chart-data-editor__icon-button {
  min-height: 32px;
  border: 1px solid rgb(191 219 254);
  border-radius: 8px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
}

.chart-data-editor__primary-button {
  border-color: rgb(37 99 235);
  background: rgb(37 99 235);
  color: white;
}

.chart-data-editor__danger-button {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

.chart-data-editor__icon-button {
  min-height: 26px;
  padding: 3px 7px;
}

.chart-data-editor__primary-button:disabled,
.chart-data-editor__secondary-button:disabled,
.chart-data-editor__danger-button:disabled,
.chart-data-editor__icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.chart-data-editor__dialog {
  width: min(960px, calc(100vw - 32px));
  max-height: min(760px, calc(100vh - 32px));
  padding: 0;
  overflow: hidden;
  border: 1px solid rgb(203 213 225);
  border-radius: 12px;
  background: white;
  color: rgb(15 23 42);
}

.chart-data-editor__dialog::backdrop {
  background: rgb(15 23 42 / 0.36);
}

.chart-data-editor__dialog-panel {
  display: flex;
  max-height: min(760px, calc(100vh - 32px));
  flex-direction: column;
}

.chart-data-editor__dialog-header,
.chart-data-editor__dialog-actions {
  flex: 0 0 auto;
  border-bottom: 1px solid rgb(226 232 240);
  padding: 14px 16px;
}

.chart-data-editor__dialog-actions {
  border-top: 1px solid rgb(226 232 240);
  border-bottom: 0;
}

.chart-data-editor__dialog-title,
.chart-data-editor__section-title {
  margin: 0;
  color: rgb(15 23 42);
  font-size: 14px;
  font-weight: 800;
  line-height: 20px;
}

.chart-data-editor__dialog-body {
  display: grid;
  min-height: 0;
  gap: 14px;
  overflow: auto;
  padding: 14px 16px;
}

.chart-data-editor__section {
  display: grid;
  gap: 10px;
}

.chart-data-editor__section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-data-editor__table-wrap {
  overflow: auto;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
}

.chart-data-editor__table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
}

.chart-data-editor__table th,
.chart-data-editor__table td {
  border-bottom: 1px solid rgb(226 232 240);
  border-right: 1px solid rgb(226 232 240);
  padding: 8px;
  vertical-align: top;
}

.chart-data-editor__table th {
  background: rgb(248 250 252);
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 800;
  text-align: left;
}

.chart-data-editor__table tr:last-child td,
.chart-data-editor__table tr:last-child th {
  border-bottom: 0;
}

.chart-data-editor__table th:last-child,
.chart-data-editor__table td:last-child {
  border-right: 0;
}

.chart-data-editor__category-head {
  display: grid;
  gap: 6px;
}

.chart-data-editor__input {
  width: 100%;
  min-height: 32px;
  min-width: 0;
  border: 1px solid rgb(203 213 225);
  border-radius: 8px;
  background: white;
  color: rgb(15 23 42);
  font: inherit;
  font-size: 12px;
  padding: 6px 8px;
}

.chart-data-editor__series-input {
  min-width: 120px;
}

.chart-data-editor__number-input,
.chart-data-editor__category-input {
  min-width: 96px;
}

.chart-data-editor__error {
  margin: 0;
  color: rgb(220 38 38);
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
}

.chart-data-editor__preview {
  min-height: 136px;
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  background: rgb(248 250 252);
  padding: 10px;
}

.chart-data-editor__svg-preview {
  display: block;
  width: 100%;
  height: 136px;
}

.chart-data-editor__axis {
  stroke: rgb(148 163 184);
  stroke-width: 1.5;
}

.chart-data-editor__pie-preview {
  display: grid;
  gap: 6px;
}

.chart-data-editor__pie-row {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  align-items: center;
  gap: 8px;
  color: rgb(51 65 85);
  font-size: 12px;
}

.chart-data-editor__pie-swatch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.dark .chart-data-editor__dialog {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .chart-data-editor__dialog-header,
.dark .chart-data-editor__dialog-actions,
.dark .chart-data-editor__table th,
.dark .chart-data-editor__table td,
.dark .chart-data-editor__table-wrap,
.dark .chart-data-editor__preview {
  border-color: rgb(51 65 85);
}

.dark .chart-data-editor__table th,
.dark .chart-data-editor__preview {
  background: rgb(30 41 59);
}

.dark .chart-data-editor__dialog-title,
.dark .chart-data-editor__section-title,
.dark .chart-data-editor__table th,
.dark .chart-data-editor__pie-row {
  color: rgb(226 232 240);
}

.dark .chart-data-editor__summary,
.dark .chart-data-editor__section-copy {
  color: rgb(148 163 184);
}

.dark .chart-data-editor__input {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}
</style>
