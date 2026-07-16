import { registerMokelayBlock } from 'mokelay-components/blocks';

export function registerEditorRuntimeExtensions() {
  registerMokelayBlock('MBlockPlayground', async () => {
    const module = await import('@/editors/blocks/MBlockPlaygroundEditor.vue');
    return {
      component: module.default,
      normalizeProps: (props) => ({
        ...module.normalizeMBlockPlaygroundProps(
          props as Parameters<typeof module.normalizeMBlockPlaygroundProps>[0]
        )
      })
    };
  });
}
