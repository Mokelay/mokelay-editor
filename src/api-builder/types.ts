export type HttpMethod = 'GET' | 'POST';

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

export type RequestLocation = 'header' | 'query' | 'body';

export type RequestSchema = {
  header?: ProcessableKey[];
  query?: ProcessableKey[];
  body?: ProcessableKey[];
};

export type CalculateTemplate = {
  template: string;
  processors?: ProcessorConfig[];
};

export type ConditionType = 'GE' | 'GT' | 'LE' | 'LT' | 'NEQ' | 'EQ' | 'NOTIN' | 'IN';
export type GroupType = 'AND' | 'OR';

export type LeafCondition = {
  group: false;
  fieldName: string;
  fieldValue: unknown;
  conditionType: ConditionType;
};

export type GroupCondition = {
  group: true;
  groupType: GroupType;
  groups: Condition[];
};

export type Condition = LeafCondition | GroupCondition;

export type OrderBy = {
  fieldName: string;
  direction?: 'ASC' | 'DESC';
};

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
  method: HttpMethod | string;
  request?: RequestSchema;
  blocks?: ApiBlock[];
  response?: Record<string, unknown> | null;
};

export type ApiBuilderStatus = 'draft' | 'published';

export type ApiBuilderVersion = {
  id: string;
  label: string;
  apiJson: ApiJson;
  disabledBlockIds: string[];
  createdAt: string;
};

export type ApiBuilderTestCase = {
  id: string;
  name: string;
  request: RequestSnapshot;
  result: DryRunResult;
  createdAt: string;
};

export type ApiBuilderDraft = {
  id: string;
  apiJson: ApiJson;
  status: ApiBuilderStatus;
  disabledBlockIds: string[];
  versions: ApiBuilderVersion[];
  testCases: ApiBuilderTestCase[];
  createdAt: string;
  updatedAt: string;
};

export type VariableOption = {
  id: string;
  label: string;
  path: string;
  source: 'request' | 'block' | 'system';
};

export type ValidationSeverity = 'error' | 'warning';

export type ValidationIssue = {
  id: string;
  severity: ValidationSeverity;
  message: string;
  target: 'api' | 'request' | 'response' | `block:${string}`;
};

export type RequestSnapshot = Record<RequestLocation, Record<string, unknown>>;

export type DryRunBlockLog = {
  uuid: string;
  alias: string;
  functionName: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  status: 'success' | 'error' | 'skipped';
  message: string;
};

export type DryRunResult = {
  ok: boolean;
  data: unknown;
  errors: string[];
  request: RequestSnapshot;
  logs: DryRunBlockLog[];
  apiJson: ApiJson;
};

export type BuilderSelection =
  | { type: 'api' }
  | { type: 'request' }
  | { type: 'response' }
  | { type: 'block'; uuid: string };
