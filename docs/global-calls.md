# 全局调用函数使用文档

本文档说明 `$alert`、`$confirm`、`$message` 的调用方式。三个函数已在应用启动时自动安装，可在 Vue、TypeScript 模块和浏览器全局环境中直接使用。

## 调用入口

### TypeScript / 组合式 API

```ts
import { $alert, $confirm, $message } from '@/utils/globalCalls';

await $alert('提示', '保存成功');

const confirmed = await $confirm('确认删除', '删除后不可恢复，是否继续？');
if (confirmed) {
  await $message('success', '已删除');
}
```

### Vue Options API / 模板方法

```ts
export default {
  methods: {
    async handleSave() {
      await this.$message('success', '保存成功');
    }
  }
};
```

### H5 / 浏览器全局

```ts
await window.$alert('提示', '操作完成');

const ok = await window.$confirm({
  title: '确认提交',
  content: '提交后将进入审核流程，是否继续？'
});

if (ok) {
  await window.$message({
    type: 'info',
    content: '已提交'
  });
}
```

## API

### `$alert`

展示一个提示弹窗。背景页面不可操作，点击“确定”后关闭。

```ts
$alert(title: string, content: GlobalCallContent): Promise<void>;
$alert(options: { title: string; content: GlobalCallContent }): Promise<void>;
```

示例：

```ts
await $alert('提示', '请先选择一条数据');

await $alert({
  title: '保存成功',
  content: '配置已写入本地缓存'
});
```

### `$confirm`

展示一个确认弹窗。点击“确定”返回 `true`，点击“取消”或按 `Escape` 返回 `false`。

```ts
$confirm(title: string, content: GlobalCallContent): Promise<boolean>;
$confirm(options: { title: string; content: GlobalCallContent }): Promise<boolean>;
```

示例：

```ts
const confirmed = await $confirm('确认删除', '删除后不可恢复，是否继续？');

if (!confirmed) {
  return;
}

await deleteItem();
```

### `$message`

从页面顶部展示消息提示，默认 3000ms 后自动关闭。Promise 会在消息关闭后 resolve。

```ts
type MessageType = 'success' | 'warning' | 'info' | 'error';

$message(type: MessageType, content: GlobalCallContent): Promise<void>;
$message(options: { type: MessageType; content: GlobalCallContent }): Promise<void>;
```

示例：

```ts
await $message('success', '保存成功');
await $message('warning', '请检查必填项');
await $message('info', '正在同步数据');
await $message('error', '保存失败，请稍后重试');
```

## 内容格式

`content` 支持两种格式：

```ts
type GlobalCallContent = string | StoredBlock[];

type StoredBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};
```

### 字符串内容

字符串会按纯文本渲染，不会执行 HTML。

```ts
await $alert('提示', '<strong>这段内容不会作为 HTML 执行</strong>');
```

### StoredBlock 内容

`StoredBlock[]` 与 `MAdvanceInput` 的 `value` 格式一致，可混排普通文本和内联组件。

```ts
import type { StoredBlock } from '@/utils/globalCalls';

const content: StoredBlock[] = [
  {
    id: 'text-1',
    type: 'paragraph',
    data: {
      text: '当前状态：'
    }
  },
  {
    id: 'tag-1',
    type: 'MTag',
    data: {
      tagName: '启用',
      type: 'success',
      size: 'small',
      color: '',
      closable: false
    }
  }
];

await $alert('详情', content);
await $message('info', content);
```

当前 `StoredBlock[]` 会复用项目内联组件注册表进行渲染。已注册组件包括 `MInput`、`MLink`、`MTag`。

## 行为说明

- `$alert` 和 `$confirm` 会创建固定遮罩层，弹窗打开期间背景页面不可操作。
- 多个 `$alert` / `$confirm` 连续调用时会按调用顺序排队展示。
- `$message` 支持多个消息同时展示，位置固定在页面顶部。
- `$message` 的非法 `type` 会回退为 `info`。
- 在非浏览器环境调用会返回 rejected Promise。

## 推荐用法

业务流程里建议使用 `async/await`，让确认、提交和反馈顺序更清楚：

```ts
const confirmed = await $confirm('发布页面', '发布后访问者将看到最新内容，是否继续？');

if (!confirmed) {
  await $message('info', '已取消发布');
  return;
}

try {
  await publishPage();
  await $message('success', '发布成功');
} catch {
  await $message('error', '发布失败，请稍后重试');
}
```
