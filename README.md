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
npm run publish:npm
npm run preview
npm run e2e
```

对应 Yarn 命令：

```bash
yarn typecheck
yarn build
yarn preview
```

## 发布到 npm

发布包名和版本来自根目录 `package.json`。`npm run build` 会先生成 `dist/`，再自动写入 `dist/package.json`，其中 `private` 会被设置为 `false`，避免发布根项目。

发布前先确认已登录 npm：

```bash
npm login
npm whoami
```

执行发布：

```bash
npm run publish:npm
```

该命令会依次执行构建、`npm pack --dry-run ./dist` 和 `npm publish ./dist`。如果 npm 要求浏览器认证，请按终端提示打开链接并完成授权。

发布成功后可以检查线上版本：

```bash
npm view mokelay-editor version
```

再次发布前需要先修改根目录 `package.json` 的 `version`，因为 npm 不允许重复发布同一个版本。

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
