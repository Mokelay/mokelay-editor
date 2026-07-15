export type HttpMethod = 'GET' | 'POST';

export type { ProcessorConfig } from '@/processors/types';
import type { ProcessorConfig } from '@/processors/types';

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

export type ResponseConfig = Record<string, unknown> | null;

export type ConditionType = 'GE' | 'GT' | 'LE' | 'LT' | 'NEQ' | 'EQ' | 'NOTIN' | 'IN' | 'LIKE';
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

export type CascadeDeleteRoot = {
  id: string;
  table: string;
  keyField: string;
  conditions: Condition[];
};

export type CascadeDeleteRelation = {
  id: string;
  table: string;
  keyField: string;
  parent: string;
  foreignKey: string;
  conditions?: Condition[];
};

export type CascadeDeleteCollect = {
  key: string;
  node: string;
  mode: 'values' | 'rows';
  fields: ProcessableKey[];
  distinct?: boolean;
  orderBy?: OrderBy[];
};

export type CascadeDeleteLimits = {
  maxRootRows?: number;
  maxAffectedRows?: number;
  maxCollectedRows?: number;
};

export type BlockFunctionName =
  | 'list'
  | 'page'
  | 'count'
  | 'read'
  | 'delete'
  | 'create'
  | 'upsert'
  | 'update'
  | 'randomId'
  | 'assertUnique'
  | 'createSchema'
  | 'cascadeDelete'
  | 'dropSchemas'
  | 'addSession'
  | 'removeSession'
  | 'readSession'
  | 'executeFragment';

export type ControllerFunctionName = 'if_controller' | 'switch_controller';

export type NextBlockUuid = string | null;

export type StarterBlock = {
  uuid: 'starter';
  nextBlock?: NextBlockUuid;
};

export type ApiStandardBlock = {
  uuid: string;
  alias?: string;
  functionName: BlockFunctionName | string;
  type?: string;
  inputs?: Record<string, unknown>;
  outputs?: ProcessableKey[] | null;
  nextBlock?: NextBlockUuid;
  /**
   * Optional error control flow. Missing means rethrow, null means this block is
   * an error terminal, and a UUID routes the caught error to that block.
   */
  errorNextBlock?: NextBlockUuid;
};

export type ControllerNode = {
  uuid: string;
  alias?: string;
  type?: 'DEFAULT';
  value?: string | number | boolean;
  nextBlock?: NextBlockUuid;
};

export type ApiController = {
  uuid: string;
  alias?: string;
  functionName: ControllerFunctionName | string;
  type: 'controller';
  inputs?: Record<string, unknown>;
  nodes: ControllerNode[];
  nextBlock?: NextBlockUuid;
};

export type ExecutableApiBlock = ApiStandardBlock | ApiController;

export type ApiBlock = StarterBlock | ExecutableApiBlock;

export type ApiJsonCommon = {
  uuid: string;
  alias?: string;
  blocks?: ApiBlock[];
  response?: ResponseConfig;
  responses?: Record<string, ResponseConfig>;
};

export type EndpointApiJson = ApiJsonCommon & {
  fragment?: false;
  method: HttpMethod | string;
  request?: RequestSchema;
  params?: never;
};

export type FragmentApiJson = ApiJsonCommon & {
  fragment: true;
  params?: ProcessableKey[];
  method?: never;
  request?: never;
};

/**
 * The persisted API DSL is deliberately discriminated by `fragment`.
 * Fragment JSON never carries HTTP request metadata; the database record uses
 * the `FRAGMENT` method sentinel separately.
 */
export type ApiJson = EndpointApiJson | FragmentApiJson;

export type ResponseTerminal = {
  uuid: string;
  label: string;
};

export type ApiBuilderStatus = 'draft' | 'published';
export type ApiBuilderSource = 'user' | 'system';

export type ApiBuilderNodePosition = {
  x: number;
  y: number;
};

export type ApiBuilderLayout = {
  version: 1;
  nodes: Record<string, ApiBuilderNodePosition>;
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
  layout: ApiBuilderLayout;
  status: ApiBuilderStatus;
  source: ApiBuilderSource;
  disabledBlockIds: string[];
  testCases: ApiBuilderTestCase[];
  createdAt: string;
  updatedAt: string;
};

export type OrchestrationEditorDraft = Pick<
  ApiBuilderDraft,
  'apiJson' | 'layout' | 'disabledBlockIds' | 'testCases'
>;

export type VariableOption = {
  id: string;
  label: string;
  path: string;
  source: 'request' | 'params' | 'block' | 'system';
};

export type ValidationSeverity = 'error' | 'warning';

export type ValidationIssue = {
  id: string;
  severity: ValidationSeverity;
  message: string;
  target: 'api' | 'request' | 'response' | `block:${string}`;
};

export type RequestSnapshot = Record<RequestLocation, Record<string, unknown>> & {
  params: Record<string, unknown>;
};

export type FragmentResolver = (uuid: string) => ApiJson | Promise<ApiJson>;

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
  | { type: 'starter' }
  | { type: 'request' }
  | { type: 'response' }
  | { type: 'block'; uuid: string };
