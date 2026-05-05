# Mokelay Editor

前端初始化模板：`Vue 3 + Vite + TypeScript`

## 技术栈

- 核心：Editor.js、Tailwind CSS、Headless UI、Reka UI
- 数据：Axios / Fetch、Vue Query（已接入，可按需使用）

## 本地开发

```bash
npm install
npm run dev
```

或使用 Yarn：

```bash
yarn install
yarn dev
```

## 常用命令

```bash
npm run typecheck
npm run build
npm run preview
npm run e2e
```

对应 Yarn 命令：

```bash
yarn typecheck
yarn build
yarn preview
```

## E2E 测试

首次执行请先安装 Playwright 浏览器：

```bash
npm run e2e:install
```

运行端到端测试：

```bash
npm run e2e
```

如需可视化调试：

```bash
npm run e2e:headed
```

## 目录说明

- `src/components/EditorPanel.vue`：Editor.js 编辑器示例
- `src/composables/useApi.ts`：Axios + Fetch API 封装
- `docs/global-calls.md`：`$alert`、`$confirm`、`$message` 全局调用函数使用文档

## SDK Monorepo（进行中）

已新增基础 SDK 包结构：

- `packages/editor-core`：跨框架核心类型、工具定义与注册能力。
- `packages/editor-vue`：Vue 3 适配层（当前先提供基础适配器入口）。

构建 SDK：

```bash
npm run build:sdk
```

类型检查：

```bash
npm run typecheck:sdk
```
