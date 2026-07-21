import { apiClient } from '@/composables/useApi';
import { getLocalClientBlockDocs } from '@/editors/localClientBlockDocs';

export type ClientBlockRegistration = {
  sourceKind?: string;
  sourcePackage?: string;
  componentName?: string;
  toolSymbol?: string;
  editorEnabled?: boolean;
  toolboxVisible?: boolean;
  sortOrder?: number;
};

export type LocalizedText = string | {
  zh?: string;
  en?: string;
  raw?: string;
  value?: unknown;
};

export type ClientBlockToolbox = {
  title?: LocalizedText;
  icon?: string;
  iconSource?: string;
  hasIcon?: boolean;
};

export type ClientBlockPropertyField = {
  key: string;
  label?: LocalizedText;
  placeholder?: LocalizedText;
  type?: string;
  valueType?: string;
  validationMessage?: LocalizedText;
  options?: Array<{
    label: LocalizedText;
    value: string;
  }> | unknown;
  component?: string;
  configurable?: boolean;
  localizable?: boolean;
  localizablePaths?: string[];
  [key: string]: unknown;
};

export type ClientBlockSaveRule = {
  key?: string;
  type?: string;
  description?: string;
  [key: string]: unknown;
};

export type ClientBlockDoc = {
  uuid: string;
  block_type?: string;
  blockType?: string;
  display_name?: string;
  displayName?: string;
  category?: string;
  source_kind?: string;
  sourceKind?: string;
  source_package?: string;
  sourcePackage?: string;
  source_file?: string;
  sourceFile?: string;
  component_name?: string;
  componentName?: string;
  tool_symbol?: string;
  toolSymbol?: string;
  description?: string;
  status?: string;
  editor_enabled?: boolean | number | string;
  editorEnabled?: boolean;
  toolbox_visible?: boolean | number | string;
  toolboxVisible?: boolean;
  editor_block?: boolean | number | string;
  editorBlock?: boolean;
  sort_order?: number | string;
  sortOrder?: number;
  registration?: ClientBlockRegistration;
  toolbox?: ClientBlockToolbox;
  initial_props?: Record<string, unknown>;
  initialProps?: Record<string, unknown>;
  default_data?: Record<string, unknown>;
  defaultData?: Record<string, unknown>;
  property_schema?: ClientBlockPropertyField[];
  properties?: ClientBlockPropertyField[];
  event_schema?: unknown[];
  events?: unknown[];
  method_schema?: unknown[];
  methods?: unknown[];
  data_fields_schema?: unknown[];
  dataFields?: unknown[];
  save_schema?: ClientBlockSaveRule[];
  saveRules?: ClientBlockSaveRule[];
  examples?: unknown[];
  source_refs?: unknown[];
  sourceRefs?: unknown[];
  raw_meta?: Record<string, unknown>;
  rawMeta?: Record<string, unknown>;
};

export type NormalizedClientBlockDoc = Required<Pick<ClientBlockDoc,
  'uuid' | 'category' | 'description' | 'status' | 'registration' | 'toolbox' | 'examples'
>> & {
  blockType: string;
  displayName: string;
  sourceKind: string;
  sourcePackage: string;
  sourceFile: string;
  componentName: string;
  toolSymbol: string;
  editorEnabled: boolean;
  toolboxVisible: boolean;
  editorBlock: boolean;
  sortOrder: number;
  defaultData: Record<string, unknown>;
  properties: ClientBlockPropertyField[];
  events: unknown[];
  methods: unknown[];
  dataFields: unknown[];
  saveRules: ClientBlockSaveRule[];
};

type ListClientBlockDocsResponse = {
  data?: {
    docs?: ClientBlockDoc[];
  };
  docs?: ClientBlockDoc[];
};

// Editor 本地 tool modules 是内置编辑器工具 metadata 的唯一所有者。
// 服务端文档只补充本地不存在的动态 block，避免旧版组件包文档覆盖本地序列化契约。
const localDocs = normalizeClientBlockDocs(getLocalClientBlockDocs());
const localBlockTypes = new Set(localDocs.map((doc) => doc.blockType));
let activeDocs: NormalizedClientBlockDoc[] = localDocs;
let loadingPromise: Promise<NormalizedClientBlockDoc[]> | null = null;

function booleanValue(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes'].includes(normalized)) return true;
    if (['0', 'false', 'no'].includes(normalized)) return false;
  }
  return fallback;
}

function numberValue(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function arrayValue<T>(value: unknown): T[] {
  return Array.isArray(value) ? [...value] as T[] : [];
}

export function normalizeClientBlockDoc(doc: ClientBlockDoc, index = 0): NormalizedClientBlockDoc | null {
  const blockType = (doc.blockType || doc.block_type || '').trim();
  if (!blockType) return null;

  const registration = recordValue(doc.registration) as ClientBlockRegistration;
  const editorEnabled = booleanValue(doc.editorEnabled ?? doc.editor_enabled ?? registration.editorEnabled, true);
  const toolboxVisible = booleanValue(doc.toolboxVisible ?? doc.toolbox_visible ?? registration.toolboxVisible, editorEnabled);
  const editorBlock = booleanValue(doc.editorBlock ?? doc.editor_block, false);
  const sortOrder = numberValue(doc.sortOrder ?? doc.sort_order ?? registration.sortOrder, index * 10);
  const defaultData = recordValue(doc.defaultData ?? doc.default_data ?? doc.initialProps ?? doc.initial_props);

  return {
    uuid: doc.uuid,
    blockType,
    displayName: doc.displayName || doc.display_name || blockType,
    category: doc.category || 'custom',
    sourceKind: doc.sourceKind || doc.source_kind || registration.sourceKind || 'mokelay-editor',
    sourcePackage: doc.sourcePackage || doc.source_package || registration.sourcePackage || '',
    sourceFile: doc.sourceFile || doc.source_file || '',
    componentName: doc.componentName || doc.component_name || registration.componentName || blockType,
    toolSymbol: doc.toolSymbol || doc.tool_symbol || registration.toolSymbol || '',
    description: doc.description || '',
    status: doc.status || 'active',
    editorEnabled,
    toolboxVisible,
    editorBlock,
    sortOrder,
    registration: {
      ...registration,
      editorEnabled,
      toolboxVisible,
      sortOrder
    },
    toolbox: doc.toolbox || {},
    defaultData,
    properties: arrayValue<ClientBlockPropertyField>(doc.properties ?? doc.property_schema),
    events: arrayValue(doc.events ?? doc.event_schema),
    methods: arrayValue(doc.methods ?? doc.method_schema),
    dataFields: arrayValue(doc.dataFields ?? doc.data_fields_schema),
    saveRules: arrayValue<ClientBlockSaveRule>(doc.saveRules ?? doc.save_schema),
    examples: arrayValue(doc.examples)
  };
}

export function normalizeClientBlockDocs(docs: readonly ClientBlockDoc[]) {
  return docs
    .map((doc, index) => normalizeClientBlockDoc(doc, index))
    .filter((doc): doc is NormalizedClientBlockDoc => Boolean(doc))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.blockType.localeCompare(right.blockType));
}

function mergeRemoteClientBlockDocs(remoteDocs: NormalizedClientBlockDoc[]) {
  return [
    ...localDocs,
    ...remoteDocs.filter((doc) => !localBlockTypes.has(doc.blockType))
  ].sort((left, right) => left.sortOrder - right.sortOrder || left.blockType.localeCompare(right.blockType));
}

function responseDocs(response: ListClientBlockDocsResponse) {
  return response.data?.docs ?? response.docs ?? [];
}

export function getClientBlockDocsSnapshot() {
  return activeDocs;
}

export function getClientBlockDocSnapshot(blockType: string) {
  return activeDocs.find((doc) => doc.blockType === blockType);
}

export function filterClientBlockDocumentData(blockType: string, data: Record<string, unknown>) {
  const doc = getClientBlockDocSnapshot(blockType);
  if (!doc) return data;

  const allowedKeys = new Set([
    ...Object.keys(doc.defaultData),
    ...doc.properties
      .filter((field) => field.configurable !== false)
      .map((field) => field.key)
  ]);
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => allowedKeys.has(key) && value !== undefined)
  );
}

export function getEditorEnabledClientBlockDocs(docs: NormalizedClientBlockDoc[] = activeDocs) {
  return docs.filter((doc) => doc.status === 'active' && doc.editorEnabled);
}

export function getToolboxVisibleClientBlockDocs(docs: NormalizedClientBlockDoc[] = activeDocs) {
  return getEditorEnabledClientBlockDocs(docs).filter((doc) => doc.toolboxVisible);
}

export async function loadClientBlockDocs() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = apiClient.get<ListClientBlockDocsResponse>('/api/mokelay/list_client_block_docs', {
    timeout: 1200,
    params: {
      page: 1,
      pageSize: 1000,
      status: 'active'
    }
  }).then((response) => {
    const docs = normalizeClientBlockDocs(responseDocs(response.data));
    activeDocs = mergeRemoteClientBlockDocs(docs);
    return activeDocs;
  }).catch((error) => {
    if (import.meta.env.DEV) {
      console.warn('[Mokelay editor] Failed to load client block docs; no client blocks are available.', error);
    }
    return activeDocs;
  }).finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}
