import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { resetEditor } from './helpers/editor';

test('provides complete local event catalogs and normalizes legacy extension metadata', async ({ page }) => {
  await resetEditor(page);
  const result = await page.evaluate(async () => {
    const docs = await import('/src/utils/clientBlockDocs.ts');
    return {
      all: docs.getClientBlockDocsSnapshot().map(doc => ({ type: doc.blockType, events: doc.events })),
      input: docs.getClientBlockEvents('MInput'),
      missing: docs.getClientBlockEvents('MissingBlock'),
      legacy: docs.normalizeClientBlockDoc({ uuid: 'legacy', block_type: 'DynamicBlock', event_schema: [
        { event: ' select ', label: '选择', trigger: '选择时触发', payload: '{ value }' },
        { event: 'select', label: '重复' }, null, { event: '' }, { event: 'custom' }
      ] })?.events
    };
  });
  for (const doc of result.all) {
    expect(new Set(doc.events.map(event => event.event)).size).toBe(doc.events.length);
    for (const event of doc.events) {
      expect(event.event.trim(), doc.type).not.toBe('');
      expect(event.label.trim(), `${doc.type}.${event.event}`).not.toBe('');
      expect(event.description.trim(), `${doc.type}.${event.event}`).not.toBe('');
    }
  }
  expect(result.input).toEqual([expect.objectContaining({ event: 'change', label: '输入变化' })]);
  expect(result.missing).toEqual([]);
  expect(result.legacy).toEqual([
    expect.objectContaining({ event: 'select', label: '选择', description: '选择时触发', payload: '{ value }' }),
    { event: 'custom', label: 'custom', description: '' }
  ]);
});

test('renders event code, label and description in the existing component documentation table', async ({ page }) => {
  const document = JSON.parse(readFileSync(resolve(process.cwd(), '../mokelay-server/server/assets/mokelay/pages/block_component_doc_detail.json'), 'utf8'));
  const table = document.blocks.find((block: { id: string }) => block.id === 'block-doc-detail-events-table');
  await resetEditor(page);
  const events = await page.evaluate(async () => {
    const docs = await import('/src/utils/clientBlockDocs.ts');
    return docs.getClientBlockEvents('MButton');
  });
  table.data.rows = events;
  await resetEditor(page, {
    initialRoute: '/#/pages/event-docs/preview?source=system',
    seedDefaultPage: false,
    systemPages: [{ uuid: 'event-docs', name: 'Event documentation', layoutUuid: null, blocks: [table] }]
  });
  const rendered = page.getByTestId('advance-table');
  await expect(rendered).toContainText('click');
  await expect(rendered).toContainText('点击按钮');
  await expect(rendered).toContainText(events[0].description);
});
