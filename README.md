# Mokelay Editor

前端初始化模板：`Vue 3 + Vite + TypeScript`

## 技术栈

- 核心：Editor.js、Tailwind CSS、Headless UI、Reka UI
- 数据：Axios / Fetch、Vue Query（已接入，可按需使用）
- 图表：ECharts

## 本地开发

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run typecheck
npm run build
npm run preview
```

## 目录说明

- `src/components/EditorPanel.vue`：Editor.js 编辑器示例
- `src/components/ChartPanel.vue`：ECharts 图表示例
- `src/composables/useApi.ts`：Axios + Fetch API 封装
