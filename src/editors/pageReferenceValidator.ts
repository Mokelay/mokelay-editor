import type { OutputData } from '@editorjs/editorjs';
import {
  pageReferenceKey,
  type PageReference
} from '@/editors/pageEditor';

export type PageReferenceKind = 'tabs' | 'open_dialog';

export type ExtractedPageReference = PageReference & {
  kind: PageReferenceKind;
  path: string;
  blockId?: string;
  actionUuid?: string;
};

export type PageReferenceIssue = {
  code:
    | 'MISSING_PAGE_TARGET'
    | 'DYNAMIC_PAGE_TARGET'
    | 'AMBIGUOUS_PAGE_TARGET'
    | 'INVALID_PAGE_SOURCE'
    | 'ANCESTOR_PAGE_REFERENCE';
  kind: PageReferenceKind;
  path: string;
  message: string;
  target?: PageReference;
  blockId?: string;
  actionUuid?: string;
};

export type PageReferenceValidation = {
  valid: boolean;
  references: ExtractedPageReference[];
  issues: PageReferenceIssue[];
};

export function validatePageReferences(
  blocks: OutputData['blocks'],
  ancestors: PageReference[] = []
): PageReferenceValidation {
  const references: ExtractedPageReference[] = [];
  const issues: PageReferenceIssue[] = [];
  const ancestorKeys = new Set(ancestors.map(pageReferenceKey));

  walkValue(blocks, 'blocks', (record, path, blockId) => {
    if (record.type === 'MTabs') {
      const data = asRecord(record.data);
      const tabs = data?.tabs;
      if (Array.isArray(tabs)) {
        tabs.forEach((tab, index) => {
          const tabRecord = asRecord(tab);
          if (!tabRecord) return;
          const tabPath = `${path}.data.tabs[${index}]`;
          const hasCanonical = Object.prototype.hasOwnProperty.call(tabRecord, 'pageUUID');
          const hasLegacy = Object.prototype.hasOwnProperty.call(tabRecord, 'pageUuid');
          if (hasCanonical && hasLegacy) {
            issues.push({
              code: 'AMBIGUOUS_PAGE_TARGET',
              kind: 'tabs',
              path: tabPath,
              ...(blockId ? { blockId } : {}),
              message: '页签页面目标不能同时配置 pageUUID 和 pageUuid，请保留一个固定页面目标。'
            });
          } else {
            readReference(
              hasCanonical ? tabRecord.pageUUID : tabRecord.pageUuid,
              tabRecord.pageSource,
              'tabs',
              tabPath,
              { blockId }
            );
          }
        });
      }
    }

    if (record.action === 'open_dialog') {
      const inputs = asRecord(record.inputs) ?? {};
      const actionUuid = typeof record.uuid === 'string' ? record.uuid.trim() : '';
      const hasCanonical = Object.prototype.hasOwnProperty.call(inputs, 'pageUUID');
      const hasLegacy = Object.prototype.hasOwnProperty.call(inputs, 'pageUuid');
      if (hasCanonical && hasLegacy) {
        issues.push({
          code: 'AMBIGUOUS_PAGE_TARGET',
          kind: 'open_dialog',
          path: `${path}.inputs`,
          ...(blockId ? { blockId } : {}),
          ...(actionUuid ? { actionUuid } : {}),
          message: '页面目标不能同时配置 pageUUID 和 pageUuid，请保留一个固定页面目标。'
        });
      } else {
        readReference(
          hasCanonical ? inputs.pageUUID : inputs.pageUuid,
          inputs.pageSource,
          'open_dialog',
          `${path}.inputs.${hasCanonical ? 'pageUUID' : 'pageUuid'}`,
          { blockId, actionUuid }
        );
      }
    }
  });

  return {
    valid: issues.length === 0,
    references,
    issues
  };

  function readReference(
    rawUuid: unknown,
    rawSource: unknown,
    kind: PageReferenceKind,
    path: string,
    location: { blockId?: string; actionUuid?: string } = {}
  ) {
    const locationFields = {
      ...(location.blockId ? { blockId: location.blockId } : {}),
      ...(location.actionUuid ? { actionUuid: location.actionUuid } : {})
    };
    if (typeof rawUuid !== 'string' || !rawUuid.trim()) {
      issues.push({
        code: rawUuid && typeof rawUuid === 'object'
          ? 'DYNAMIC_PAGE_TARGET'
          : 'MISSING_PAGE_TARGET',
        kind,
        path,
        ...locationFields,
        message: rawUuid && typeof rawUuid === 'object'
          ? '子页面目标必须是固定页面，不能使用动态表达式。'
          : '请选择要引用的页面。'
      });
      return;
    }

    const uuid = rawUuid.trim();
    if (uuid.includes('{{') || uuid.includes('}}')) {
      issues.push({
        code: 'DYNAMIC_PAGE_TARGET',
        kind,
        path,
        ...locationFields,
        message: '子页面目标必须是固定页面，不能使用动态表达式。'
      });
      return;
    }

    if (rawSource !== undefined && rawSource !== 'user' && rawSource !== 'system') {
      issues.push({
        code: 'INVALID_PAGE_SOURCE',
        kind,
        path,
        ...locationFields,
        message: '页面来源必须是用户页面或系统页面。'
      });
      return;
    }

    const target: ExtractedPageReference = {
      uuid,
      source: rawSource === 'system' ? 'system' : 'user',
      kind,
      path,
      ...locationFields
    };
    references.push(target);

    if (ancestorKeys.has(pageReferenceKey(target))) {
      issues.push({
        code: 'ANCESTOR_PAGE_REFERENCE',
        kind,
        path,
        target,
        ...locationFields,
        message: `页面 ${uuid} 已在当前编排路径中，不能形成循环引用。`
      });
    }
  }
}

export function formatPageReferenceIssue(issue: PageReferenceIssue) {
  const location = [
    issue.blockId ? `Block: ${issue.blockId}` : '',
    issue.actionUuid ? `Action: ${issue.actionUuid}` : '',
    issue.path ? `路径: ${issue.path}` : '',
    issue.target?.uuid ? `页面 UUID: ${issue.target.uuid}` : ''
  ].filter(Boolean);
  return location.length ? `${issue.message}（${location.join('；')}）` : issue.message;
}

function walkValue(
  value: unknown,
  path: string,
  visit: (record: Record<string, unknown>, path: string, blockId?: string) => void,
  seen = new WeakSet<object>(),
  blockId?: string
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const itemRecord = asRecord(item);
      const itemBlockId = path === 'blocks' && typeof itemRecord?.id === 'string'
        ? itemRecord.id.trim() || blockId
        : blockId;
      walkValue(item, `${path}[${index}]`, visit, seen, itemBlockId);
    });
    return;
  }

  const record = asRecord(value);
  if (!record || seen.has(record)) return;
  seen.add(record);
  visit(record, path, blockId);
  Object.entries(record).forEach(([key, child]) => {
    walkValue(child, `${path}.${key}`, visit, seen, blockId);
  });
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}
