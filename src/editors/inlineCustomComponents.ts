import { markRaw, type Component } from 'vue';
import MInput, { mInputEditorTool } from '@/blocks/MInput.vue';
import MLink, { mLinkEditorTool } from '@/blocks/MLink.vue';
import MTag, { mTagEditorTool } from '@/blocks/MTag.vue';
import type { EditorToolDefinition } from '@/editors/editorToolDefinition';

export type InlineCustomComponentDefinition = Pick<
  EditorToolDefinition,
  'toolbox' | 'createInitialProps' | 'propertyPanel' | 'normalizeProps' | 'serialize'
> & {
  component: Component;
};

const inlineCustomComponents = {
  MInput: {
    component: markRaw(MInput),
    ...mInputEditorTool
  },
  MLink: {
    component: markRaw(MLink),
    ...mLinkEditorTool
  },
  MTag: {
    component: markRaw(MTag),
    ...mTagEditorTool
  }
} satisfies Record<string, InlineCustomComponentDefinition>;

export function getInlineCustomComponentEntries() {
  return Object.entries(inlineCustomComponents);
}

export function getInlineCustomComponentDefinition(type: string) {
  return inlineCustomComponents[type as keyof typeof inlineCustomComponents];
}

export function isInlineCustomComponent(type: string) {
  return type in inlineCustomComponents;
}
