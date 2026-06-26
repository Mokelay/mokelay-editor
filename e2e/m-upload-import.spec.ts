import { Buffer } from 'node:buffer';
import { expect, test } from '@playwright/test';
import {
  addEditorTool,
  getSavedBlocks,
  openToolPropertyPanel,
  resetEditor,
  seedSavedConfig,
  switchLocaleToChinese
} from './helpers/editor';

test.beforeEach(async ({ page }) => {
  await resetEditor(page);
});

test('adds upload import, edits properties, and saves DSL data', async ({ page }) => {
  await switchLocaleToChinese(page);
  await addEditorTool(page, '上传导入');

  await expect(page.getByTestId('editor-tool-MUploadImport')).toBeVisible();
  await expect(page.getByTestId('editor-upload-import-tool')).toBeVisible();

  const propertyDialog = await openToolPropertyPanel(page, 'editor-tool-MUploadImport');
  await expect(propertyDialog.getByTestId('tool-property-title')).toContainText('上传导入属性');
  await propertyDialog.getByTestId('tool-property-input-mode').selectOption('csv');
  await propertyDialog.getByTestId('tool-property-input-accept').fill('.csv');
  await propertyDialog.getByTestId('tool-property-input-multiple').check();
  await propertyDialog.getByTestId('tool-property-input-maxCount').fill('2');
  await propertyDialog.getByTestId('tool-property-input-maxSizeMB').fill('1');
  await propertyDialog.getByTestId('tool-property-input-parsePreview').check();
  await propertyDialog.getByTestId('tool-property-input-template').fill(JSON.stringify({
    label: '下载导入模板',
    url: '/templates/users.csv'
  }, null, 2));
  await propertyDialog.getByTestId('tool-property-close').click();

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const uploadBlock = blocks.find((block) => block.type === 'MUploadImport');

  expect(uploadBlock?.data).toMatchObject({
    mode: 'csv',
    accept: '.csv',
    multiple: true,
    maxCount: 2,
    maxSizeMB: 1,
    parsePreview: true,
    template: {
      label: '下载导入模板',
      url: '/templates/users.csv'
    },
    value: []
  });
});

test('validates CSV files, previews rows, uploads multipart data, and stores metadata only', async ({ page }) => {
  await seedSavedConfig(page, {
    time: 1777614863777,
    version: '2.31.6',
    blocks: [
      {
        id: 'upload-import',
        type: 'MUploadImport',
        data: {
          mode: 'csv',
          accept: '.csv',
          maxSizeMB: 1,
          parsePreview: true,
          uploadAction: [
            {
              uuid: 'upload_csv',
              action: 'upload_file',
              inputs: {
                file: { template: '{{event.file}}' },
                endpoint: '/upload-import',
                fileField: 'asset'
              },
              outputs: ['files', 'urls', 'success', 'rawResponse']
            }
          ]
        }
      }
    ]
  });

  await expect(page.getByTestId('editor-upload-import-tool')).toBeVisible();
  await page.getByTestId('upload-import-file-input').setInputFiles({
    name: 'users.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not,csv')
  });
  await expect(page.getByTestId('upload-import-error')).toContainText('文件类型不符合要求');

  await page.route('**/upload-import', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        successCount: 1,
        failedCount: 0,
        data: {
          url: '/uploads/users.csv'
        }
      })
    });
  });

  await page.getByTestId('upload-import-file-input').setInputFiles({
    name: 'users.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('uid,name\n1,Alice\n2,Bob\n')
  });
  await expect(page.getByTestId('upload-import-preview')).toContainText('Alice');

  const requestPromise = page.waitForRequest((request) =>
    request.url().includes('/upload-import') && request.method() === 'POST'
  );
  await page.getByTestId('upload-import-upload').click();
  const request = await requestPromise;
  const contentType = request.headers()['content-type'] ?? '';
  const postData = request.postData() ?? '';

  expect(contentType).toContain('multipart/form-data');
  expect(postData).toContain('name="asset"');
  expect(postData).toContain('filename="users.csv"');
  expect(postData).toContain('1,Alice');
  await expect(page.getByTestId('upload-import-result')).toContainText('success 1, failed 0');

  await page.getByTestId('save-button').click();
  const blocks = await getSavedBlocks(page);
  const uploadBlock = blocks.find((block) => block.type === 'MUploadImport');
  const value = uploadBlock?.data?.value as Array<Record<string, unknown>>;

  expect(value).toHaveLength(1);
  expect(value[0]).toMatchObject({
    name: 'users.csv',
    size: 23,
    type: 'text/csv',
    status: 'success',
    url: '/uploads/users.csv'
  });
  expect(value[0]).not.toHaveProperty('id');
  expect(value[0]).not.toHaveProperty('lastModified');
});
