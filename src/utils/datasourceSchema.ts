export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type JSONSchema =
  | {
      type: 'object';
      properties: Record<string, JSONSchema>;
      required?: string[];
      description?: string;
    }
  | {
      type: 'array';
      items: JSONSchema;
      description?: string;
    }
  | {
      type: 'string';
      enum?: string[];
      description?: string;
    }
  | {
      type: 'number';
      minimum?: number;
      maximum?: number;
      description?: string;
    }
  | {
      type: 'boolean';
      description?: string;
    }
  | {
      type: 'null';
    };

export type JSONSchemaType = JSONSchema['type'];
export type SchemaComponentHint = 'text' | 'number' | 'switch' | 'object' | 'array';

export interface SchemaSelectionField {
  path: string;
  label: string;
  type: JSONSchemaType;
  required: boolean;
  enabled: boolean;
  componentHint: SchemaComponentHint;
}

export interface DatasourceListSchemaSelection {
  recordPath: string;
  fields: SchemaSelectionField[];
}

export interface DatasourceFormSchemaSelection {
  fields: SchemaSelectionField[];
}

export interface DatasourceSchemaSelections {
  list?: DatasourceListSchemaSelection;
  form?: DatasourceFormSchemaSelection;
}

export interface SchemaTreeNode {
  path: string;
  displayPath: string;
  name: string;
  type: JSONSchemaType;
  required: boolean;
  selectable: boolean;
  componentHint: SchemaComponentHint;
  depth: number;
  children: SchemaTreeNode[];
}

export interface ArrayRecordPathOption {
  path: string;
  label: string;
}

export type JSONSchemaInferenceResult = {
  ok: true;
  schema: JSONSchema;
} | {
  ok: false;
  reason: 'emptyArray' | 'mixedArray';
};

type UnknownJSONSchema = {
  type: 'unknown';
};

type InferredJSONSchema =
  | UnknownJSONSchema
  | {
      type: 'object';
      properties: Record<string, InferredJSONSchema>;
      required?: string[];
      description?: string;
    }
  | {
      type: 'array';
      items: InferredJSONSchema;
      description?: string;
    }
  | Exclude<JSONSchema, { type: 'object' } | { type: 'array' }>;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item));
  }

  if (isRecord(value)) {
    return Object.values(value).every((item) => isJsonValue(item));
  }

  return false;
}

export function isJsonObjectValue(value: unknown): value is { [key: string]: JsonValue } {
  return isRecord(value) && isJsonValue(value);
}

export function cloneJsonValue<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function cloneJsonSchema<T extends JSONSchema>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function clonePlainValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: string[]) {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function assignDescription<T extends JSONSchema>(schema: T, description: unknown): T | undefined {
  if (description === undefined) {
    return schema;
  }

  if (typeof description !== 'string') {
    return undefined;
  }

  return {
    ...schema,
    description
  };
}

export function normalizeJSONSchema(value: unknown): JSONSchema | undefined {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return undefined;
  }

  if (value.type === 'object') {
    if (!hasOnlyKeys(value, ['type', 'properties', 'required', 'description']) || !isRecord(value.properties)) {
      return undefined;
    }

    const properties: Record<string, JSONSchema> = {};
    for (const [key, propertyValue] of Object.entries(value.properties)) {
      const normalizedProperty = normalizeJSONSchema(propertyValue);
      if (!normalizedProperty) {
        return undefined;
      }

      properties[key] = normalizedProperty;
    }

    const schema: Extract<JSONSchema, { type: 'object' }> = {
      type: 'object',
      properties
    };

    if (value.required !== undefined) {
      if (!Array.isArray(value.required) || !value.required.every((item) => typeof item === 'string')) {
        return undefined;
      }

      schema.required = [...value.required];
    }

    return assignDescription(schema, value.description);
  }

  if (value.type === 'array') {
    if (!hasOnlyKeys(value, ['type', 'items', 'description'])) {
      return undefined;
    }

    const items = normalizeJSONSchema(value.items);
    if (!items) {
      return undefined;
    }

    return assignDescription({
      type: 'array',
      items
    }, value.description);
  }

  if (value.type === 'string') {
    if (!hasOnlyKeys(value, ['type', 'enum', 'description'])) {
      return undefined;
    }

    const schema: Extract<JSONSchema, { type: 'string' }> = {
      type: 'string'
    };

    if (value.enum !== undefined) {
      if (!Array.isArray(value.enum) || !value.enum.every((item) => typeof item === 'string')) {
        return undefined;
      }

      schema.enum = [...value.enum];
    }

    return assignDescription(schema, value.description);
  }

  if (value.type === 'number') {
    if (!hasOnlyKeys(value, ['type', 'minimum', 'maximum', 'description'])) {
      return undefined;
    }

    const schema: Extract<JSONSchema, { type: 'number' }> = {
      type: 'number'
    };

    if (value.minimum !== undefined) {
      if (typeof value.minimum !== 'number' || !Number.isFinite(value.minimum)) {
        return undefined;
      }

      schema.minimum = value.minimum;
    }

    if (value.maximum !== undefined) {
      if (typeof value.maximum !== 'number' || !Number.isFinite(value.maximum)) {
        return undefined;
      }

      schema.maximum = value.maximum;
    }

    return assignDescription(schema, value.description);
  }

  if (value.type === 'boolean') {
    if (!hasOnlyKeys(value, ['type', 'description'])) {
      return undefined;
    }

    return assignDescription({
      type: 'boolean'
    }, value.description);
  }

  if (value.type === 'null' && hasOnlyKeys(value, ['type'])) {
    return {
      type: 'null'
    };
  }

  return undefined;
}

function isUnknownJSONSchema(value: InferredJSONSchema): value is UnknownJSONSchema {
  return value.type === 'unknown';
}

function cloneInferredJSONSchema(value: InferredJSONSchema): InferredJSONSchema {
  return clonePlainValue(value);
}

function createUnknownArrayItemSchema(): UnknownJSONSchema {
  return {
    type: 'unknown'
  };
}

function createEmptyObjectSchema(): Extract<JSONSchema, { type: 'object' }> {
  return {
    type: 'object',
    properties: {}
  };
}

function toConcreteJSONSchema(value: InferredJSONSchema): JSONSchema {
  if (isUnknownJSONSchema(value)) {
    return createEmptyObjectSchema();
  }

  if (value.type === 'array') {
    return {
      ...value,
      items: toConcreteJSONSchema(value.items)
    };
  }

  if (value.type === 'object') {
    const properties: Record<string, JSONSchema> = {};
    Object.entries(value.properties).forEach(([key, property]) => {
      properties[key] = toConcreteJSONSchema(property);
    });

    return {
      ...value,
      properties
    };
  }

  return cloneJsonSchema(value);
}

function mergeInferredJSONSchemas(left: InferredJSONSchema, right: InferredJSONSchema): InferredJSONSchema | undefined {
  if (isUnknownJSONSchema(left)) {
    return cloneInferredJSONSchema(right);
  }

  if (isUnknownJSONSchema(right)) {
    return cloneInferredJSONSchema(left);
  }

  if (left.type !== right.type) {
    return undefined;
  }

  if (left.type === 'object' && right.type === 'object') {
    const properties: Record<string, InferredJSONSchema> = {};
    const propertyKeys = new Set([
      ...Object.keys(left.properties),
      ...Object.keys(right.properties)
    ]);

    for (const key of propertyKeys) {
      const leftProperty = left.properties[key];
      const rightProperty = right.properties[key];

      if (leftProperty && rightProperty) {
        const mergedProperty = mergeInferredJSONSchemas(leftProperty, rightProperty);
        if (!mergedProperty) {
          return undefined;
        }

        properties[key] = mergedProperty;
        continue;
      }

      properties[key] = cloneInferredJSONSchema((leftProperty ?? rightProperty)!);
    }

    return {
      type: 'object',
      properties
    };
  }

  if (left.type === 'array' && right.type === 'array') {
    const items = mergeInferredJSONSchemas(left.items, right.items);
    if (!items) {
      return undefined;
    }

    return {
      type: 'array',
      items
    };
  }

  return cloneInferredJSONSchema(left);
}

function inferJSONSchemaValue(value: JsonValue): {
  ok: true;
  schema: InferredJSONSchema;
} | {
  ok: false;
  reason: 'mixedArray';
} {
  if (value === null) {
    return {
      ok: true,
      schema: {
        type: 'null'
      }
    };
  }

  if (typeof value === 'string') {
    return {
      ok: true,
      schema: {
        type: 'string'
      }
    };
  }

  if (typeof value === 'number') {
    return {
      ok: true,
      schema: {
        type: 'number'
      }
    };
  }

  if (typeof value === 'boolean') {
    return {
      ok: true,
      schema: {
        type: 'boolean'
      }
    };
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return {
        ok: true,
        schema: {
          type: 'array',
          items: createUnknownArrayItemSchema()
        }
      };
    }

    let items: InferredJSONSchema | undefined;
    for (const item of value) {
      const inferredItem = inferJSONSchemaValue(item);
      if (!inferredItem.ok) {
        return inferredItem;
      }

      if (!items) {
        items = inferredItem.schema;
        continue;
      }

      const mergedItems = mergeInferredJSONSchemas(items, inferredItem.schema);
      if (!mergedItems) {
        return {
          ok: false,
          reason: 'mixedArray'
        };
      }

      items = mergedItems;
    }

    return {
      ok: true,
      schema: {
        type: 'array',
        items: items!
      }
    };
  }

  const properties: Record<string, InferredJSONSchema> = {};
  for (const [key, propertyValue] of Object.entries(value)) {
    const inferredProperty = inferJSONSchemaValue(propertyValue);
    if (!inferredProperty.ok) {
      return inferredProperty;
    }

    properties[key] = inferredProperty.schema;
  }

  return {
    ok: true,
    schema: {
      type: 'object',
      properties
    }
  };
}

export function inferJSONSchema(value: JsonValue): JSONSchemaInferenceResult {
  if (Array.isArray(value) && !value.length) {
    return {
      ok: false,
      reason: 'emptyArray'
    };
  }

  const inferredSchema = inferJSONSchemaValue(value);
  if (!inferredSchema.ok) {
    return inferredSchema;
  }

  return {
    ok: true,
    schema: toConcreteJSONSchema(inferredSchema.schema)
  };
}

function getPathWithSegment(parentPath: string, segment: string) {
  return parentPath ? `${parentPath}.${segment}` : segment;
}

function getArrayItemPath(arrayPath: string) {
  return arrayPath ? `${arrayPath}[]` : '[]';
}

export function getSchemaFieldLabel(path: string) {
  const normalizedPath = path.replace(/\[\]/g, '');
  const lastSegment = normalizedPath.split('.').filter(Boolean).pop();
  return lastSegment || path || 'root';
}

function getComponentHint(type: JSONSchemaType): SchemaComponentHint {
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'switch';
  if (type === 'object') return 'object';
  if (type === 'array') return 'array';
  return 'text';
}

function isSelectableSchemaType(type: JSONSchemaType) {
  return type === 'string' || type === 'number' || type === 'boolean' || type === 'null';
}

function createSelectionField(node: SchemaTreeNode, enabled: boolean, label = getSchemaFieldLabel(node.path)): SchemaSelectionField {
  return {
    path: node.path,
    label,
    type: node.type,
    required: node.required,
    enabled,
    componentHint: node.componentHint
  };
}

export function getSchemaTreeNodes(schema?: JSONSchema, rootPath = '', depth = 0, required = false): SchemaTreeNode[] {
  if (!schema) {
    return [];
  }

  const name = rootPath ? getSchemaFieldLabel(rootPath) : 'root';
  const node: SchemaTreeNode = {
    path: rootPath,
    displayPath: rootPath || 'root',
    name,
    type: schema.type,
    required,
    selectable: isSelectableSchemaType(schema.type),
    componentHint: getComponentHint(schema.type),
    depth,
    children: []
  };

  if (schema.type === 'object') {
    const requiredFields = new Set(schema.required ?? []);
    node.children = Object.entries(schema.properties).flatMap(([key, value]) =>
      getSchemaTreeNodes(value, getPathWithSegment(rootPath, key), depth + 1, requiredFields.has(key))
    );
  }

  if (schema.type === 'array') {
    const itemPath = getArrayItemPath(rootPath);
    node.children = getSchemaTreeNodes(schema.items, itemPath, depth + 1, required);
  }

  return [node];
}

export function flattenSchemaTree(nodes: SchemaTreeNode[]): SchemaTreeNode[] {
  return nodes.flatMap((node) => [
    node,
    ...flattenSchemaTree(node.children)
  ]);
}

export function getArrayRecordOptions(schema?: JSONSchema): ArrayRecordPathOption[] {
  if (!schema) {
    return [];
  }

  const options: ArrayRecordPathOption[] = [];

  function walk(value: JSONSchema, path: string) {
    if (value.type === 'array') {
      options.push({
        path,
        label: path ? `${path}[]` : 'root[]'
      });
      walk(value.items, getArrayItemPath(path));
      return;
    }

    if (value.type !== 'object') {
      return;
    }

    Object.entries(value.properties).forEach(([key, property]) => {
      walk(property, getPathWithSegment(path, key));
    });
  }

  walk(schema, '');
  return options;
}

function readSchemaAtRecordPath(schema: JSONSchema | undefined, recordPath: string): JSONSchema | undefined {
  if (!schema) {
    return undefined;
  }

  if (!recordPath) {
    return schema.type === 'array' ? schema.items : undefined;
  }

  const segments = recordPath.split('.').filter(Boolean);
  let current: JSONSchema | undefined = schema;

  for (const segment of segments) {
    if (!current || current.type !== 'object') {
      return undefined;
    }

    current = current.properties[segment];
  }

  return current?.type === 'array' ? current.items : undefined;
}

function getLeafNodes(schema: JSONSchema | undefined, pathPrefix = '', includeRoot = false) {
  return flattenSchemaTree(getSchemaTreeNodes(schema, pathPrefix))
    .filter((node) => (includeRoot || node.path !== pathPrefix) && node.selectable);
}

export function getSchemaSelectionFieldsForList(schema: JSONSchema | undefined, recordPath: string): SchemaSelectionField[] {
  const recordSchema = readSchemaAtRecordPath(schema, recordPath);
  const pathPrefix = recordPath ? `${recordPath}[]` : '[]';

  return getLeafNodes(recordSchema, pathPrefix, true).map((node) => createSelectionField(node, true));
}

export function getSchemaSelectionFieldsForForm(schema: JSONSchema | undefined): SchemaSelectionField[] {
  const sourceSchema = schema?.type === 'array' ? schema.items : schema;
  if (sourceSchema?.type !== 'object') {
    return [];
  }

  const fields: SchemaSelectionField[] = [];

  function walk(value: JSONSchema, path: string, required: boolean) {
    if (isSelectableSchemaType(value.type)) {
      fields.push(createSelectionField({
        path,
        displayPath: path,
        name: getSchemaFieldLabel(path),
        type: value.type,
        required,
        selectable: true,
        componentHint: getComponentHint(value.type),
        depth: 0,
        children: []
      }, true));
      return;
    }

    if (value.type !== 'object') {
      return;
    }

    const requiredFields = new Set(value.required ?? []);
    Object.entries(value.properties).forEach(([key, property]) => {
      walk(property, getPathWithSegment(path, key), requiredFields.has(key));
    });
  }

  Object.entries(sourceSchema.properties).forEach(([key, property]) => {
    walk(property, key, (sourceSchema.required ?? []).includes(key));
  });

  return fields;
}

function normalizeSelectionField(value: unknown, fallback?: SchemaSelectionField): SchemaSelectionField | undefined {
  if (!isRecord(value)) {
    return fallback ? clonePlainValue(fallback) : undefined;
  }

  const path = typeof value.path === 'string' && value.path ? value.path : fallback?.path;
  if (!path) {
    return undefined;
  }

  const type = (
    value.type === 'object' ||
    value.type === 'array' ||
    value.type === 'string' ||
    value.type === 'number' ||
    value.type === 'boolean' ||
    value.type === 'null'
  )
    ? value.type
    : fallback?.type ?? 'string';

  const label = typeof value.label === 'string' && value.label.trim()
    ? value.label.trim()
    : fallback?.label ?? getSchemaFieldLabel(path);
  const required = typeof value.required === 'boolean' ? value.required : fallback?.required ?? false;
  const enabled = typeof value.enabled === 'boolean' ? value.enabled : fallback?.enabled ?? true;
  const componentHint = (
    value.componentHint === 'text' ||
    value.componentHint === 'number' ||
    value.componentHint === 'switch' ||
    value.componentHint === 'object' ||
    value.componentHint === 'array'
  )
    ? value.componentHint
    : fallback?.componentHint ?? getComponentHint(type);

  return {
    path,
    label,
    type,
    required,
    enabled,
    componentHint
  };
}

function reconcileSelectionFields(generatedFields: SchemaSelectionField[], previousFields: unknown): SchemaSelectionField[] {
  const previousMap = new Map<string, SchemaSelectionField>();

  if (Array.isArray(previousFields)) {
    previousFields.forEach((item) => {
      const field = normalizeSelectionField(item);
      if (field) {
        previousMap.set(field.path, field);
      }
    });
  }

  return generatedFields.map((field) => {
    const previous = previousMap.get(field.path);
    if (!previous) {
      return clonePlainValue(field);
    }

    return {
      ...field,
      label: previous.label || field.label,
      enabled: previous.enabled
    };
  });
}

function getDefaultRecordPath(schema?: JSONSchema) {
  const options = getArrayRecordOptions(schema);
  const firstOptionWithFields = options.find((option) =>
    getSchemaSelectionFieldsForList(schema, option.path).length > 0
  );

  return firstOptionWithFields?.path ?? options[0]?.path ?? '';
}

export function reconcileSchemaSelections(
  schema: JSONSchema | undefined,
  previous?: DatasourceSchemaSelections
): DatasourceSchemaSelections | undefined {
  if (!schema) {
    return undefined;
  }

  const recordOptions = getArrayRecordOptions(schema);
  const previousRecordPath = previous?.list?.recordPath ?? '';
  const recordPath = recordOptions.some((option) => option.path === previousRecordPath)
    ? previousRecordPath
    : getDefaultRecordPath(schema);
  const listFields = recordOptions.length
    ? reconcileSelectionFields(getSchemaSelectionFieldsForList(schema, recordPath), previous?.list?.fields)
    : [];
  const formFields = reconcileSelectionFields(getSchemaSelectionFieldsForForm(schema), previous?.form?.fields);
  const selections: DatasourceSchemaSelections = {};

  if (recordOptions.length) {
    selections.list = {
      recordPath,
      fields: listFields
    };
  }

  if (formFields.length) {
    selections.form = {
      fields: formFields
    };
  }

  return selections.list || selections.form ? selections : undefined;
}

export function normalizeSchemaSelections(
  value: unknown,
  schema?: JSONSchema
): DatasourceSchemaSelections | undefined {
  if (!isRecord(value)) {
    return schema ? reconcileSchemaSelections(schema) : undefined;
  }

  const previous: DatasourceSchemaSelections = {};

  if (isRecord(value.list)) {
    previous.list = {
      recordPath: typeof value.list.recordPath === 'string' ? value.list.recordPath : '',
      fields: Array.isArray(value.list.fields)
        ? value.list.fields
            .map((item) => normalizeSelectionField(item))
            .filter((item): item is SchemaSelectionField => item !== undefined)
        : []
    };
  }

  if (isRecord(value.form)) {
    previous.form = {
      fields: Array.isArray(value.form.fields)
        ? value.form.fields
            .map((item) => normalizeSelectionField(item))
            .filter((item): item is SchemaSelectionField => item !== undefined)
        : []
    };
  }

  if (schema) {
    return reconcileSchemaSelections(schema, previous);
  }

  return previous.list || previous.form ? previous : undefined;
}
