import { markRaw, type Component } from 'vue';
import MButton, { mButtonEditorTool } from '@/blocks/MButton.vue';
import MInput, { mInputEditorTool } from '@/blocks/MInput.vue';
import MLink, { mLinkEditorTool } from '@/blocks/MLink.vue';
import MTag, { mTagEditorTool } from '@/blocks/MTag.vue';
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
