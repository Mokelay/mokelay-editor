import { markRaw, type Component } from 'vue';
import MButton from 'mokelay-components/blocks/MButton.vue';
import MInput from 'mokelay-components/blocks/MInput.vue';
import MLink from 'mokelay-components/blocks/MLink.vue';
import MTag from 'mokelay-components/blocks/MTag.vue';
import { mButtonEditorTool } from '@/editors/tools/mButtonEditorTool';
import { mInputEditorTool } from '@/editors/tools/mInputEditorTool';
import { mLinkEditorTool } from '@/editors/tools/mLinkEditorTool';
import { mTagEditorTool } from '@/editors/tools/mTagEditorTool';
import { resolveEditorToolDefinition } from '@/editors/clientBlockToolMetadata';
import type {
  EditorToolDefinition,
  ResolvedEditorToolDefinition
} from '@/editors/editorToolDefinition';

export type InlineCustomComponentDefinition = ResolvedEditorToolDefinition & {
  component: Component;
};

const inlineCustomComponents = {
  MButton: {
    component: markRaw(MButton),
    ...mButtonEditorTool
  },
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
} satisfies Record<string, EditorToolDefinition>;

export function getInlineCustomComponentEntries() {
  return Object.entries(inlineCustomComponents).map(([type, definition]) => [
    type,
    resolveEditorToolDefinition(type, definition)
  ] as const);
}

export function getInlineCustomComponentDefinition(type: string) {
  const definition = inlineCustomComponents[type as keyof typeof inlineCustomComponents];
  return definition ? resolveEditorToolDefinition(type, definition) : undefined;
}

export function isInlineCustomComponent(type: string) {
  return type in inlineCustomComponents;
}
