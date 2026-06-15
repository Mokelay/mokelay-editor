# 数据源字段 Processor 与数据预览

本文档说明 `MDatasourceEditor` 已选择字段的 Processor 配置、执行接口和字段数据预览行为。

## 数据结构

每个已选择字段使用 `DatasourceSchemaSelection` 保存。`processors` 按数组顺序执行，为空时不序列化。

```ts
type ProcessorConfig =
  | string
  | {
      processor: string;
      param?: unknown;
    };

interface DatasourceSchemaSelection {
  path: string;
  label: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  processors?: ProcessorConfig[];
}
```

保存示例：

```json
{
  "schemaSelections": [
    {
      "path": "data.users[].name",
      "label": "用户名称",
      "type": "string",
      "processors": [
        "trim",
        {
          "processor": "date_time_format",
          "param": "yyyy-MM-dd"
        }
      ]
    }
  ]
}
```

旧数据不包含 `processors` 时仍可正常读取。规范化会移除无效配置、合并重复字段路径，并保留合法 Processor 的顺序。

## 配置界面

在“已选择字段”卡片中可以：

1. 查看字段类型、Processor 标签和数量。
2. 点击“配置处理器”添加、删除或调整执行顺序。
3. 点击“预览”选择响应示例，核对字段的最终呈现数据。

可添加的 Processor 由字段类型决定：

| 字段类型 | 可添加 Processor |
| --- | --- |
| `string` | `trim`、`date_time_format` |
| `number` | `date_time_format` |
| `object` | `merge_data` |
| `array` | `merge_data`、`filter` |

已保存但与字段类型不兼容或当前版本无法识别的配置不会被静默删除。配置界面会显示警告，并允许用户删除；预览执行到未知 Processor 时会展示错误。

## Processor 行为

### `trim`

使用字符串简写：

```json
"trim"
```

- 字符串：删除首尾空白。
- 其他类型：返回原值。

### `merge_data`

UI 按单元素对象数组保存参数：

```json
{
  "processor": "merge_data",
  "param": [{ "source": "api", "enabled": true }]
}
```

- 对象：执行浅合并，参数中的同名字段覆盖原字段。
- 数组：仅对其中的对象元素逐项浅合并，其他元素保持原值。
- 其他类型：返回原值。
- 执行器同时兼容直接传入对象参数。

### `filter`

```json
{
  "processor": "filter",
  "param": {
    "type": "and",
    "conditions": [
      { "variable": "profile.age", "condition": "gt", "value": 18 },
      { "variable": "name", "condition": "is_not_empty" }
    ]
  }
}
```

- 仅处理数组，其他类型返回原值。
- `type` 支持 `and`、`or`。
- `variable` 支持对象嵌套路径，例如 `profile.age`。
- 条件支持 `eq`、`gt`、`lt`、`is_empty`、`is_not_empty`。
- `eq` 使用 JSON 深度严格相等。
- `gt`、`lt` 仅在双方均为有限数字时成立。
- 空值定义为 `undefined`、`null` 或空字符串。
- 空值条件不保存 `value`；没有条件时保留全部数组项。

### `date_time_format`

```json
{
  "processor": "date_time_format",
  "param": "yyyy-MM-dd HH:mm:SS"
}
```

- 支持日期字符串、`Date` 和 JavaScript 毫秒时间戳。
- 使用浏览器本地时区格式化。
- 支持 `yyyy`、`MM`、`dd`、`HH`、`mm`、`SS` 标记。
- 内置预设为 `yyyy-MM-dd HH:mm:SS`、`yyyy-MM-dd`、`HH:mm:SS`。
- 无法转换的值及不支持的数据类型返回原值。

## 字段路径与数组

字段预览使用响应示例和字段 `path` 提取真实数据：

| 路径 | 行为 |
| --- | --- |
| `data.user.name` | 读取单个字段，并对该值执行 Processor。 |
| `data.users[].name` | 保留数组结构，对每个 `name` 分别执行 Processor。 |
| `data.users[]` | 读取整个 `users` 数组，并对数组整体执行 Processor。 |
| `data.groups[].members[].name` | 保留多层嵌套数组，不执行扁平化。 |

数组中的某个元素缺少后续字段时，该位置使用 `null` 占位；所有分支都无法找到字段时抛出 `FIELD_PREVIEW_PATH_NOT_FOUND`。空数组保留为空数组。

示例：

```ts
const response = {
  users: [
    { name: ' Ada ' },
    { id: 2 }
  ]
};

previewSchemaSelection(response, {
  path: 'users[].name',
  processors: ['trim']
});

// {
//   extractedValue: [' Ada ', null],
//   finalValue: ['Ada', null]
// }
```

## 执行 API

统一从 `@/processors` 导入：

```ts
import {
  applyProcessor,
  applyProcessors,
  extractSchemaSelectionValue,
  normalizeProcessors,
  previewSchemaSelection,
  validateProcessorConfig,
  validateProcessors
} from '@/processors';
```

主要接口：

```ts
normalizeProcessors(value: unknown): ProcessorConfig[];
validateProcessorConfig(config: ProcessorConfig): void;
validateProcessors(processors: ProcessorConfig[]): void;
applyProcessor(value: unknown, config: ProcessorConfig): unknown;
applyProcessors(value: unknown, processors: ProcessorConfig[]): unknown;

extractSchemaSelectionValue(value: JsonValue, path: string): JsonValue;
previewSchemaSelection(
  value: JsonValue,
  selection: Pick<DatasourceSchemaSelection, 'path' | 'processors'>
): {
  extractedValue: JsonValue;
  finalValue: JsonValue;
};
```

`applyProcessors` 同步按顺序执行，并由各执行器复制需要修改的数据，不修改输入对象。调用方应使用返回值，不应假定输入被原地更新。

## 错误码

Processor 配置和执行错误使用 `ProcessorError`：

| 错误码 | 含义 |
| --- | --- |
| `PROCESSOR_INVALID_CONFIG` | Processor 配置或参数无效。 |
| `PROCESSOR_UNSUPPORTED` | Processor 名称未注册。 |

字段提取和预览错误使用 `SchemaSelectionPreviewError`：

| 错误码 | 含义 |
| --- | --- |
| `FIELD_PREVIEW_INVALID_PATH` | 字段路径为空或格式无效。 |
| `FIELD_PREVIEW_PATH_NOT_FOUND` | 响应示例中不存在该字段路径。 |
| `FIELD_PREVIEW_INVALID_RESULT` | Processor 返回了无法展示的非 JSON 值。 |

## 数据边界

- `schemaSelections` 及其 `processors` 会随数据源配置保存、导入和重新打开。
- 响应示例、字段预览选择和预览结果仅用于编辑器配置过程，不写入数据源保存结果。
- Schema 切换时，仅保留新 Schema 中仍存在的字段及其 Processor 顺序。
- 当前实现不会自动处理 API 原始响应，也不改变 Schema 抓取结果。
- 实际运行时需要显式调用 `applyProcessor`、`applyProcessors` 或后续接入字段处理流程。

## 测试

```bash
npm run typecheck
npm run build
npx playwright test e2e/processors.spec.ts --project=chromium
npx playwright test e2e/m-datasource-editor.spec.ts --project=chromium
```

`e2e/processors.spec.ts` 覆盖执行器、路径提取、数组结构和错误码；`e2e/m-datasource-editor.spec.ts` 覆盖配置、排序、保存、Schema 切换、字段预览和只读状态。
