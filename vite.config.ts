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
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = normalizeModuleId(id);

          if (!moduleId.includes('node_modules')) {
            if (
              moduleId.includes('/src/blocks/MForm.vue') ||
              moduleId.includes('/src/blocks/MFormItem.vue') ||
              moduleId.includes('/src/blocks/mFormEditorTool.ts')
            ) {
              return 'block-form';
            }

            if (moduleId.includes('/src/blocks/MEditorSelector.vue')) {
              return 'block-editor-selector';
            }

            if (moduleId.includes('/src/blocks/MChart.vue')) {
              return 'block-chart';
            }

            if (
              moduleId.includes('/src/blocks/MDatasourceEditor.vue') ||
              moduleId.includes('/src/utils/datasource') ||
              moduleId.includes('/src/utils/datasourceSchema')
            ) {
              return 'block-datasource';
            }

            if (
              moduleId.includes('/src/blocks/MAdvanceInput.vue') ||
              moduleId.includes('/src/blocks/MAdvanceTable.vue') ||
              moduleId.includes('/src/editors/inlineCustomComponents.ts')
            ) {
              return 'block-advanced';
            }

            return;
          }

          if (
            moduleId.includes('@editorjs/editorjs') ||
            moduleId.includes('@editorjs/table') ||
            moduleId.includes('@calumk/editorjs-columns')
          ) {
            return 'editorjs';
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

          if (
            moduleId.includes('/vue/') ||
            moduleId.includes('/@vue/') ||
            moduleId.includes('/reka-ui/') ||
            moduleId.includes('/@tanstack/vue-query/')
          ) {
            return 'vue-vendor';
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}));
