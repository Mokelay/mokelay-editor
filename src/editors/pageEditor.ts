import type { MokelayPage, PageSource } from '@/services/pagesApi';

export type PageReference = {
  uuid: string;
  source: PageSource;
};

export type PageReferenceOrigin =
  | {
      kind: 'tabs';
      blockId?: string;
      itemId: string;
    }
  | {
      kind: 'open_dialog';
      blockId?: string;
      actionUuid: string;
    };

export type PageEditorResult =
  | {
      status: 'saved';
      created: boolean;
      page: MokelayPage;
    }
  | {
      status: 'cancelled';
    }
  | {
      status: 'closed';
    };

export type PageEditorCapabilities = {
  canPersist: boolean;
  canCreateSubPage: boolean;
  appUuid?: string;
};

export type PageEditorOpenRequest =
  | {
      intent: 'open';
      target: PageReference;
      origin: PageReferenceOrigin;
      ancestors: PageReference[];
      capabilities?: PageEditorCapabilities;
    }
  | {
      intent: 'create';
      origin: PageReferenceOrigin;
      ancestors: PageReference[];
      suggestedName?: string;
      capabilities?: PageEditorCapabilities;
    };

export type PageEditorOpenHandler = (request: PageEditorOpenRequest) => Promise<PageEditorResult>;

export type PageEditorBridge = {
  /** Whether pages opened from this editing session may be persisted. */
  readonly canPersist: boolean;
  /** Whether this editing session may create and persist a new child page. */
  readonly canCreateSubPage: boolean;
  /** Application that owns pages created from this editing session. */
  readonly appUuid?: string;
  canReference: (target: PageReference) => { allowed: boolean; message?: string };
  openExisting: (target: PageReference, origin: PageReferenceOrigin) => Promise<PageEditorResult>;
  createUserSubPage: (
    origin: PageReferenceOrigin,
    initial?: { name?: string }
  ) => Promise<PageEditorResult>;
};

export function createPageEditorBridge(
  open: PageEditorOpenHandler,
  getAncestors: () => PageReference[],
  getCapabilities?: () => Partial<PageEditorCapabilities> | undefined
): PageEditorBridge {
  return {
    get canPersist() {
      return resolveCapabilities(getCapabilities).canPersist;
    },
    get canCreateSubPage() {
      return resolveCapabilities(getCapabilities).canCreateSubPage;
    },
    get appUuid() {
      return resolveCapabilities(getCapabilities).appUuid;
    },
    canReference(target) {
      const normalized = normalizePageReference(target);
      const blocked = normalizePageReferences(getAncestors())
        .some((reference) => pageReferenceKey(reference) === pageReferenceKey(normalized));
      return blocked
        ? {
            allowed: false,
            message: `页面 ${normalized.uuid} 已在当前编排路径中，不能形成循环引用。`
          }
        : { allowed: true };
    },
    openExisting(target, origin) {
      const normalizedTarget = normalizePageReference(target);
      const inheritedCapabilities = resolveCapabilities(getCapabilities);
      const capabilities = normalizedTarget.source === 'system'
        ? { canPersist: false, canCreateSubPage: false }
        : inheritedCapabilities;
      return open({
        intent: 'open',
        target: normalizedTarget,
        origin,
        ancestors: normalizePageReferences(getAncestors()),
        capabilities
      });
    },
    createUserSubPage(origin, initial) {
      const capabilities = resolveCapabilities(getCapabilities);
      if (!capabilities.canCreateSubPage) {
        return Promise.reject(new Error('当前为临时编排会话，不能创建子页面。'));
      }
      return open({
        intent: 'create',
        origin,
        ancestors: normalizePageReferences(getAncestors()),
        suggestedName: typeof initial?.name === 'string' ? initial.name.trim() : undefined,
        capabilities
      });
    }
  };
}

export function normalizePageEditorCapabilities(
  capabilities?: Partial<PageEditorCapabilities>
): PageEditorCapabilities {
  const canPersist = capabilities?.canPersist !== false;
  return {
    canPersist,
    canCreateSubPage: canPersist && capabilities?.canCreateSubPage !== false,
    ...(typeof capabilities?.appUuid === 'string' && capabilities.appUuid.trim()
      ? { appUuid: capabilities.appUuid.trim() }
      : {})
  };
}

function resolveCapabilities(
  getCapabilities?: () => Partial<PageEditorCapabilities> | undefined
) {
  return normalizePageEditorCapabilities(getCapabilities?.());
}

export function pageReferenceKey(reference: PageReference) {
  return `${reference.source}:${reference.uuid}`;
}

export function normalizePageReference(reference: PageReference): PageReference {
  return {
    uuid: reference.uuid.trim(),
    source: reference.source === 'system' ? 'system' : 'user'
  };
}

function normalizePageReferences(references: PageReference[]) {
  const result: PageReference[] = [];
  const seen = new Set<string>();
  references.forEach((reference) => {
    const normalized = normalizePageReference(reference);
    if (!normalized.uuid) return;
    const key = pageReferenceKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(normalized);
  });
  return result;
}
