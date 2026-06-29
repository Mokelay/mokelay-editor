import { expect, test } from '@playwright/test';
import { defaultPageUuid, resetEditor } from './helpers/editor';

test('renders object array fields as nested records without raw JSON', async ({ page }) => {
  await resetEditor(page, {
    initialRoute: `/#/pages/${defaultPageUuid}/preview`,
    pages: [
      {
        uuid: defaultPageUuid,
        name: 'Record list preview',
        blocks: [
          {
            id: 'schema-record-list',
            type: 'MRecordList',
            data: {
              items: [
                {
                  name: 'jobs',
                  columns: [
                    { name: 'id', type: 'bigint', dataType: 'bigint' },
                    { name: 'created_at', type: 'timestamp(6)', dataType: 'datetime' }
                  ],
                  tags: ['system', 'scheduled'],
                  emptyColumns: []
                }
              ],
              fieldOrder: ['name', 'columns', 'tags', 'emptyColumns'],
              fieldLabels: {
                name: '表名',
                columns: '字段',
                tags: '标签',
                emptyColumns: '空字段'
              },
              titleFields: ['name']
            }
          }
        ]
      }
    ]
  });

  const recordList = page.getByTestId('record-list');
  await expect(recordList).toBeVisible();
  await expect(recordList).toContainText('1. jobs');
  await expect(recordList).toContainText('字段');
  await expect(recordList).toContainText('id');
  await expect(recordList).toContainText('bigint');
  await expect(recordList).toContainText('created_at');
  await expect(recordList).toContainText('timestamp(6)');
  await expect(recordList).toContainText('datetime');
  await expect(recordList).toContainText('system, scheduled');
  await expect(recordList).not.toContainText('[{"name"');
  await expect(recordList).not.toContainText('"columns"');
  await expect(recordList).not.toContainText('空字段');
});
