export * from '../../editor-core/src/index';

export type VueAdapterOptions = {
  locale?: string;
};

export function createVueAdapter(options: VueAdapterOptions = {}) {
  return {
    name: 'mokelay-vue-adapter',
    locale: options.locale || 'zh-CN'
  };
}
