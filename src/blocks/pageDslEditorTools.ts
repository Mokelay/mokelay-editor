import { i18n } from '@/i18n';
import { defineEditorTool, type EditorToolDefinition, type EditorToolPropertyField } from '@/editors/editorToolDefinition';
import type { PageDslBlockProps, PageDslBlockType, PageDslMatrixRow, PageDslOption } from '@/blocks/PageDslBlock.vue';

type PageDslToolConfig = {
  type: PageDslBlockType;
  title: string;
  icon: string;
  defaults: Omit<PageDslBlockProps, 'edit' | 'blockType'>;
  fields: EditorToolPropertyField[];
};

const textIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 6h14M5 12h10M5 18h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const fieldIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const choiceIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7h7M12 17h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const flowIcon = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 6h14v5H5zM5 16h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
];

const placeholderField: EditorToolPropertyField = { key: 'placeholder', label: '占位提示' };
const valueField: EditorToolPropertyField = { key: 'value', label: '值' };
const jsonValueField: EditorToolPropertyField = {
  key: 'value',
  label: '值 JSON',
  type: 'textarea',
  valueType: 'json',
  validationMessage: '请输入有效值 JSON。'
};

const inputFields: EditorToolPropertyField[] = [placeholderField, valueField];

const optionField: EditorToolPropertyField = {
  key: 'options',
  label: '选项 JSON',
  type: 'textarea',
  valueType: 'json',
  validationMessage: '请输入有效选项 JSON。'
};

const configs: PageDslToolConfig[] = [
  {
    type: 'MHeading',
    title: '页面标题',
    icon: textIcon,
    defaults: { text: '页面标题', level: '1', align: 'left' },
    fields: [
      { key: 'text', label: '标题文本' },
      {
        key: 'level',
        label: '级别',
        type: 'select',
        options: [
          { label: '一级标题', value: '1' },
          { label: '二级标题', value: '2' },
          { label: '三级标题', value: '3' }
        ]
      },
      { key: 'align', label: '对齐', type: 'select', options: alignOptions }
    ]
  },
  {
    type: 'MRichText',
    title: '富文本',
    icon: textIcon,
    defaults: { content: '这里填写说明内容。' },
    fields: [{ key: 'content', label: '正文', type: 'textarea' }]
  },
  {
    type: 'MImage',
    title: '图片',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m7 16 4-4 3 3 2-2 3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    defaults: { src: '', alt: '图片', caption: '' },
    fields: [
      { key: 'src', label: '图片地址' },
      { key: 'alt', label: '替代文本' },
      { key: 'caption', label: '图片说明' }
    ]
  },
  {
    type: 'MEmbed',
    title: '嵌入',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 7H7a5 5 0 0 0 0 10h3M14 7h3a5 5 0 0 1 0 10h-3M8 12h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    defaults: { title: '外部资料', url: 'https://www.mokelay.com/' },
    fields: [
      { key: 'title', label: '标题' },
      { key: 'url', label: '链接' }
    ]
  },
  {
    type: 'MTextField',
    title: '单行文本',
    icon: fieldIcon,
    defaults: { placeholder: '请输入文本', value: '' },
    fields: inputFields
  },
  {
    type: 'MEmailField',
    title: '邮箱字段',
    icon: fieldIcon,
    defaults: { placeholder: 'you@example.com', value: '' },
    fields: inputFields
  },
  {
    type: 'MPhoneField',
    title: '电话字段',
    icon: fieldIcon,
    defaults: { placeholder: '+1 555 000 0000', value: '' },
    fields: inputFields
  },
  {
    type: 'MLinkField',
    title: '网址字段',
    icon: fieldIcon,
    defaults: { placeholder: 'https://example.com', value: '' },
    fields: inputFields
  },
  {
    type: 'MTextareaField',
    title: '多行文本',
    icon: fieldIcon,
    defaults: { placeholder: '请输入详细说明', value: '', rows: 4 },
    fields: [...inputFields, { key: 'rows', label: '行数' }]
  },
  {
    type: 'MFileUploadField',
    title: '文件上传',
    icon: fieldIcon,
    defaults: { value: [], accept: '.pdf,.doc,.docx', multiple: false, maxFiles: 1 },
    fields: [
      jsonValueField,
      { key: 'accept', label: '文件类型', placeholder: '.pdf,.doc,.docx' },
      { key: 'multiple', label: '允许多文件', type: 'checkbox' },
      { key: 'maxFiles', label: '最多文件数' }
    ]
  },
  {
    type: 'MSelectField',
    title: '下拉选择',
    icon: choiceIcon,
    defaults: {
      value: '',
      options: [
        { label: '选项 A', value: 'a' },
        { label: '选项 B', value: 'b' }
      ]
    },
    fields: [valueField, optionField]
  },
  {
    type: 'MRadioGroupField',
    title: '单选题',
    icon: choiceIcon,
    defaults: {
      value: '',
      options: [
        { label: '非常符合', value: 'high' },
        { label: '一般', value: 'medium' },
        { label: '不符合', value: 'low' }
      ]
    },
    fields: [valueField, optionField]
  },
  {
    type: 'MCheckboxGroupField',
    title: '多选题',
    icon: choiceIcon,
    defaults: {
      value: [],
      options: [
        { label: '产品演示', value: 'demo' },
        { label: '价格咨询', value: 'pricing' },
        { label: '技术支持', value: 'support' }
      ]
    },
    fields: [jsonValueField, optionField]
  },
  {
    type: 'MImageChoiceField',
    title: '图片选择',
    icon: choiceIcon,
    defaults: {
      value: [],
      multiple: false,
      options: [
        { label: '简洁', value: 'clean', imageUrl: '' },
        { label: '活泼', value: 'playful', imageUrl: '' }
      ]
    },
    fields: [jsonValueField, { key: 'multiple', label: '允许多选', type: 'checkbox' }, optionField]
  },
  {
    type: 'MRatingField',
    title: '评分',
    icon: choiceIcon,
    defaults: { value: '', max: 5, lowLabel: '不满意', highLabel: '非常满意' },
    fields: [valueField, { key: 'max', label: '最高分' }, { key: 'lowLabel', label: '低分文案' }, { key: 'highLabel', label: '高分文案' }]
  },
  {
    type: 'MLinearScaleField',
    title: '线性量表',
    icon: choiceIcon,
    defaults: { value: '', min: 0, max: 10, lowLabel: '完全不会', highLabel: '非常愿意' },
    fields: [valueField, { key: 'min', label: '最低分' }, { key: 'max', label: '最高分' }, { key: 'lowLabel', label: '低分文案' }, { key: 'highLabel', label: '高分文案' }]
  },
  {
    type: 'MMatrixField',
    title: '矩阵题',
    icon: choiceIcon,
    defaults: {
      value: {},
      rows: [
        { label: '产品体验', value: 'product' },
        { label: '服务响应', value: 'service' }
      ],
      options: [
        { label: '不满意', value: 'bad' },
        { label: '一般', value: 'neutral' },
        { label: '满意', value: 'good' }
      ]
    },
    fields: [jsonValueField, { key: 'rows', label: '行 JSON', type: 'textarea', valueType: 'json' }, optionField]
  },
  {
    type: 'MPageBreak',
    title: '分页',
    icon: flowIcon,
    defaults: { title: '下一页', description: '' },
    fields: [
      { key: 'title', label: '页面标题' },
      { key: 'description', label: '页面说明', type: 'textarea' }
    ]
  },
  {
    type: 'MThankYouPage',
    title: '感谢页',
    icon: flowIcon,
    defaults: { title: '提交成功', description: '谢谢你的提交，我们已经收到。' },
    fields: [
      { key: 'title', label: '标题' },
      { key: 'description', label: '说明', type: 'textarea' }
    ]
  },
  {
    type: 'MResultPage',
    title: '结果页',
    icon: flowIcon,
    defaults: { title: '你的结果', description: '这里展示测验或问卷结果。', resultField: 'score' },
    fields: [
      { key: 'title', label: '标题' },
      { key: 'description', label: '说明', type: 'textarea' },
      { key: 'resultField', label: '结果字段' }
    ]
  },
  {
    type: 'MButton',
    title: '按钮',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="16" height="10" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    defaults: { label: '提交', variant: 'primary', align: 'left', action: { type: 'submit' } },
    fields: [
      { key: 'label', label: '按钮文案' },
      {
        key: 'variant',
        label: '样式',
        type: 'select',
        options: [
          { label: '主要', value: 'primary' },
          { label: '次要', value: 'secondary' },
          { label: '朴素', value: 'ghost' }
        ]
      },
      { key: 'align', label: '对齐', type: 'select', options: alignOptions },
      { key: 'action', label: '动作 JSON（本阶段仅保存，不执行）', type: 'textarea', valueType: 'json' }
    ]
  }
];

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : fallback;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeOptions(value: unknown, fallback: PageDslOption[]) {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .map((item, index) => ({
      label: stringValue(item.label, `选项 ${index + 1}`),
      value: stringValue(item.value, `option_${index + 1}`),
      description: stringValue(item.description),
      imageUrl: stringValue(item.imageUrl)
    }));
}

function normalizeMatrixRows(value: unknown, fallback: PageDslMatrixRow[]) {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .map((item, index) => ({
      label: stringValue(item.label, `问题 ${index + 1}`),
      value: stringValue(item.value, `row_${index + 1}`)
    }));
}

function normalizeAction(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? JSON.parse(JSON.stringify(value)) as Record<string, unknown>
    : { type: 'submit' };
}

function normalizeValue(value: unknown, fallback: unknown) {
  const source = value === undefined ? fallback : value;
  if (
    typeof source === 'string' ||
    typeof source === 'number' ||
    typeof source === 'boolean' ||
    source === null
  ) {
    return source;
  }

  if (typeof source === 'object' && source !== null) {
    return JSON.parse(JSON.stringify(source)) as unknown;
  }

  return fallback;
}

function normalizeProps(config: PageDslToolConfig, props: Partial<PageDslBlockProps>): PageDslBlockProps {
  const merged = {
    ...config.defaults,
    ...props
  };

  return {
    edit: props.edit ?? false,
    blockType: config.type,
    id: stringValue(merged.id),
    text: stringValue(merged.text),
    content: stringValue(merged.content),
    title: stringValue(merged.title),
    label: stringValue(merged.label),
    description: stringValue(merged.description),
    placeholder: stringValue(merged.placeholder),
    value: normalizeValue(merged.value, config.defaults.value ?? ''),
    src: stringValue(merged.src),
    alt: stringValue(merged.alt),
    caption: stringValue(merged.caption),
    url: stringValue(merged.url),
    level: ['1', '2', '3'].includes(stringValue(merged.level)) ? stringValue(merged.level) : '1',
    align: ['left', 'center', 'right'].includes(stringValue(merged.align)) ? stringValue(merged.align) : 'left',
    options: normalizeOptions(merged.options, Array.isArray(config.defaults.options) ? config.defaults.options : []),
    rows: config.type === 'MMatrixField'
      ? normalizeMatrixRows(merged.rows, Array.isArray(config.defaults.rows) ? config.defaults.rows as PageDslMatrixRow[] : [])
      : numberValue(merged.rows, numberValue(config.defaults.rows, 4)),
    min: numberValue(merged.min, numberValue(config.defaults.min, 0)),
    max: numberValue(merged.max, numberValue(config.defaults.max, config.type === 'MRatingField' ? 5 : 10)),
    lowLabel: stringValue(merged.lowLabel),
    highLabel: stringValue(merged.highLabel),
    accept: stringValue(merged.accept),
    multiple: booleanValue(merged.multiple),
    maxFiles: numberValue(merged.maxFiles, 1),
    variant: ['primary', 'secondary', 'ghost'].includes(stringValue(merged.variant)) ? stringValue(merged.variant) : 'primary',
    action: normalizeAction(merged.action),
    resultField: stringValue(merged.resultField, 'score')
  };
}

function serializeProps(config: PageDslToolConfig, props: PageDslBlockProps) {
  const normalizedProps = normalizeProps(config, props);
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(config.defaults) as Array<keyof Omit<PageDslBlockProps, 'edit' | 'blockType'>>) {
    data[key] = normalizedProps[key];
  }
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

function createDefinition(config: PageDslToolConfig) {
  return defineEditorTool<PageDslBlockProps>({
    toolbox: {
      get title() {
        return config.title;
      },
      icon: config.icon
    },
    propertyPanel: {
      get title() {
        return `${config.title}${i18n.t('editor.propertyDialogTitle')}`;
      },
      fields: config.fields
    },
    createInitialProps: () => ({
      blockType: config.type,
      ...config.defaults
    }),
    normalizeProps: (props) => normalizeProps(config, props),
    serialize: (props) => serializeProps(config, props)
  });
}

export const pageDslEditorToolEntries = Object.fromEntries(
  configs.map((config) => [config.type, createDefinition(config)])
) as unknown as Record<PageDslBlockType, Omit<EditorToolDefinition, 'component'>>;
