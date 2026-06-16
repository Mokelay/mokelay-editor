# Editor Block Development Guidelines

自定义 Editor.js block 的可见内容、根布局和 hover 行为会影响左侧 `+` / 配置 toolbar 的定位。新增或重构 block 时必须遵守以下规范，避免 toolbar 漂移到页面顶部或其他 block 旁边。

## Toolbar 对齐

- block 根节点必须是稳定的可见布局盒子：不要让可见内容脱离文档流后导致根节点高度塌陷。
- 如果 block 使用紧凑入口、弹窗触发器、绝对定位内容、动态高度内容，或显著改变根节点 padding/border/display，必须接入 `useEditorBlockToolbarAlignment(rootRef)`。
- `rootRef` 应指向用户 hover 的最外层可见 block 根元素。需要按内部某个子区域居中时，使用 `target` 选项传入对应元素。
- 打开二级浮层或弹窗时，避免让 Editor.js toolbar 与浮层处在互相遮挡的 top layer 中；必要时先关闭外层设置弹窗，关闭子弹窗后再恢复。

## 测试要求

- 每个新增的自定义 block e2e 至少覆盖一次 toolbar 定位：
  `await expectToolToolbarBeside(page, '<block-testid>')`
- 对会切换紧凑态/展开态的 block，要在默认态或最容易塌陷的状态下断言 toolbar 位置。
- 如果测试新增了配置弹窗，保存、预览、打开 Editor.js 设置菜单前要先关闭阻塞交互的 modal。

## 代码示例

```ts
import { ref } from 'vue';
import { useEditorBlockToolbarAlignment } from '@/composables/useEditorBlockToolbarAlignment';

const rootRef = ref<HTMLElement | null>(null);
useEditorBlockToolbarAlignment(rootRef);
```

```vue
<template>
  <div ref="rootRef" data-testid="editor-my-block">
    <!-- block content -->
  </div>
</template>
```
