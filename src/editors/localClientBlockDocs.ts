import type { ClientBlockDoc } from '@/utils/clientBlockDocs';

const localDocSources = import.meta.glob(
  [
    './tools/*.ts',
    './blocks/*.{ts,vue}'
  ],
  {
    eager: true,
    import: 'default',
    query: '?raw'
  }
) as Record<string, string>;

function parseClientBlockDocs(source: string, sourceFile: string): ClientBlockDoc[] {
  const docs: ClientBlockDoc[] = [];
  const annotationPattern = /@clientBlockDoc([\s\S]*?)\*\//g;

  for (const match of source.matchAll(annotationPattern)) {
    const rawJson = match[1]
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim();

    if (!rawJson.startsWith('{')) continue;

    try {
      const parsed = JSON.parse(rawJson) as ClientBlockDoc;
      const blockType = parsed.blockType || parsed.block_type || '';
      if (!blockType) continue;
      docs.push({
        ...parsed,
        uuid: parsed.uuid || `local:${blockType}`,
        sourceFile: parsed.sourceFile || parsed.source_file || sourceFile
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[Mokelay editor] Invalid @clientBlockDoc in ${sourceFile}.`, error);
      }
    }
  }

  return docs;
}

const localClientBlockDocs = Object.entries(localDocSources)
  .flatMap(([sourceFile, source]) => parseClientBlockDocs(source, sourceFile));

export function getLocalClientBlockDocs(): ClientBlockDoc[] {
  return localClientBlockDocs.map((doc) => ({ ...doc }));
}
