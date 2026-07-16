import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
function normalizeModuleId(id) {
    return id.replace(/\\/g, '/');
}
export default defineConfig(function () { return ({
    base: './',
    define: {
        __APP_VERSION__: JSON.stringify(new Date().toISOString())
    },
    plugins: [vue()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    var moduleId = normalizeModuleId(id);
                    var isMokelayComponentsCode = (moduleId.includes('/node_modules/mokelay-components/') ||
                        moduleId.includes('/submodule/mokelay-components/dist/')) && !moduleId.includes('/mokelay-components/node_modules/');
                    if (isMokelayComponentsCode) {
                        return 'mokelay-components';
                    }
                    if (!moduleId.includes('node_modules')) {
                        return;
                    }
                    if (moduleId.includes('/@vue-flow/')) {
                        return 'vue-flow';
                    }
                    if (moduleId.includes('@editorjs/editorjs') ||
                        moduleId.includes('@editorjs/table') ||
                        moduleId.includes('@calumk/editorjs-columns')) {
                        return 'editorjs';
                    }
                    if (moduleId.includes('/qrcode/')) {
                        return 'qrcode';
                    }
                    if (moduleId.includes('/json-editor-vue/') ||
                        moduleId.includes('/vanilla-jsoneditor/')) {
                        return 'json-editor';
                    }
                    if (moduleId.includes('/zrender/')) {
                        return 'zrender';
                    }
                    if (moduleId.includes('/echarts/')) {
                        return 'echarts';
                    }
                    if (moduleId.includes('/element-ui/') ||
                        moduleId.includes('/element-plus/') ||
                        moduleId.includes('/@popperjs/')) {
                        return 'element-plus';
                    }
                    if (moduleId.includes('/vue/') ||
                        moduleId.includes('/@vue/') ||
                        moduleId.includes('/reka-ui/') ||
                        moduleId.includes('/@tanstack/vue-query/')) {
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
}); });
