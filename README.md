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
