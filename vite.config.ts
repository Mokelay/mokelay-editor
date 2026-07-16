import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

function normalizeModuleId(id: string) {
  return id.replace(/\\/g, '/');
}

export default defineConfig(() => ({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(new Date().toISOString())
  },
  plugins: [vue()],
  build: {
    // JSON Editor 和本地 Block metadata 是已独立拆分的大型功能块，高于 Vite 的默认 500 kB 提示线。
    chunkSizeWarningLimit: 1050,
    rollupOptions: {
      onwarn(warning, warn) {
        // @vueuse/core 发布产物中两个 PURE 标记位置不被 Rollup 识别，Rollup 会自动移除且不影响代码。
        if (
          warning.code === 'INVALID_ANNOTATION'
          && warning.id?.includes('/@vueuse/core/dist/index.js')
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          const moduleId = normalizeModuleId(id);
          if (!moduleId.includes('node_modules')) {
            return;
          }

          if (moduleId.includes('/@vue-flow/')) {
            return 'vue-flow';
          }

          if (
            moduleId.includes('@editorjs/editorjs') ||
            moduleId.includes('@editorjs/table') ||
            moduleId.includes('@calumk/editorjs-columns')
          ) {
            return 'editorjs';
          }

          if (moduleId.includes('/qrcode/')) {
            return 'qrcode';
          }

          if (
            moduleId.includes('/json-editor-vue/') ||
            moduleId.includes('/vanilla-jsoneditor/')
          ) {
            return 'json-editor';
          }

          if (moduleId.includes('/zrender/')) {
            return 'zrender';
          }

          if (moduleId.includes('/echarts/')) {
            return 'echarts';
          }

          if (
            moduleId.includes('/element-ui/') ||
            moduleId.includes('/element-plus/') ||
            moduleId.includes('/@popperjs/')
          ) {
            return 'element-plus';
          }

        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
      clientPort: 5173
    }
  },
  optimizeDeps: {
    // Element Plus imports the CommonJS dayjs distribution from lazy editor modules.
    // Pre-bundling it guarantees a stable ESM default export after cache rebuilds.
    include: ['dayjs']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}));
