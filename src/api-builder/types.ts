export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type HttpMethod = 'GET' | 'POST';
export type RequestLocation = 'header' | 'query' | 'body';
export type BlockFunctionName =
  | 'list'
  | 'page'
  | 'count'
  | 'read'
  | 'delete'
  | 'create'
  | 'update'
  | 'addSession'
  | 'removeSession'
  | 'readSession';

export type ProcessorConfig =
  | string
  | {
      processor: string;
      param?: unknown;
    };

export type ProcessableKey =
  | string
  | {
      key: string;
      processors?: ProcessorConfig[];
    };

export type CalculateTemplate = {
  template: string;
  processors?: ProcessorConfig[];
};

export type Condition =
  | {
      group: false;
      fieldName: string;
      fieldValue: unknown;
      conditionType: 'GE' | 'GT' | 'LE' | 'LT' | 'NEQ' | 'EQ' | 'NOTIN' | 'IN';
    }
  | {
      group: true;
      groupType: 'AND' | 'OR';
      groups: Condition[];
    };

export type OrderBy = {
  fieldName: string;
  direction?: 'ASC' | 'DESC';
};

export type ApiBlock = {
  uuid: string;
  alias?: string;
  functionName: BlockFunctionName | string;
  inputs?: Record<string, unknown>;
  outputs?: ProcessableKey[] | null;
};

export type ApiJson = {
  uuid: string;
  alias?: string;
  method: string;
  request?: {
    header?: ProcessableKey[];
    query?: ProcessableKey[];
    body?: ProcessableKey[];
  };
  blocks?: ApiBlock[];
  response?: Record<string, unknown> | null;
};

export type ApiSummary = {
  uuid: string;
  alias: string;
  method: string;
  source: 'database' | 'asset';
  status: 'draft' | 'published' | 'asset';
  latestVersion: number | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

export type ApiVersionSummary = {
  id: string;
  version: number;
  changeNote: string;
  createdAt: string;
};

export type ApiDetail = ApiSummary & {
  draftState: Record<string, unknown>;
  draftJson: ApiJson;
  publishedJson: ApiJson | null;
  versions: ApiVersionSummary[];
};

export type DatabaseColumnSchema = {
  name: string;
  type: string;
  dataType: string;
};

export type DatabaseTableSchema = {
  name: string;
  columns: DatabaseColumnSchema[];
};

export type BuilderValidationIssue = {
  path: string;
  message: string;
  level: 'error' | 'warning';
};

export type RequestParameterDraft = {
  id: string;
  location: RequestLocation;
  key: string;
  required: boolean;
  processors: ProcessorConfig[];
  example: string;
  description: string;
};

export type VariableOption = {
  id: string;
  label: string;
  template: string;
  source: 'request' | 'block' | 'system';
};

export type TestRequestDraft = {
  header: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
};
