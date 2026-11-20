import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { getSavedBlocks, openToolPropertyPanel, openToolEventsPanel, resetEditor, seedSavedConfig, switchLocaleToChinese } from './helpers/editor';
// Exercise form behavior independently of the application's shell/layout selection.
const reimbursement = { ...JSON.parse(readFileSync(resolve(process.cwd(), '../mokelay-server/server/assets/lark/pages/reimbursement.json'), 'utf8')), layoutUuid: null };
const reimbursementTitle = reimbursement.blocks.find((block: { type: string }) => block.type === 'MHeading').data.text;
test.use({ locale: 'zh-CN' });

for (const showHelp of ['no', 'yes']) {
  test(`restores hints ${showHelp} and reuses the field event without extra autosaves`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const writes: Record<string, unknown>[] = [];
    const record = { id: 'hint-doc', version: 0, status: 'draft', show_help: showHelp, category: 'travel', fiat: '', crypto: '', loan: '', settlement: '0.00', note: '' };
    await page.route('**/api/lark/**', async route => {
      const request = route.request();
      const headers = { 'access-control-allow-origin': 'http://127.0.0.1:4173', 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      if (request.method() === 'POST') {
        const body = request.postDataJSON(); writes.push(body);
        Object.assign(record, body, { version: Number(body.version) + 1 });
      }
      await route.fulfill({ headers, body: JSON.stringify({ ok: true, data: { record, options: { category: [{ value: 'travel', label: '差旅费' }] } } }) });
    });
    await resetEditor(page, { initialRoute: '/#/pages/reimbursement/preview?source=system', systemPages: [reimbursement], seedDefaultPage: false });
    const control = page.getByTestId('editor-form-tool').locator('select').first();
    await expect(control).toBeEnabled();
    await expect(control).toHaveValue(showHelp);
    await expect(page.getByTestId('page-dsl-block-MHeading')).toHaveText(typeof reimbursementTitle === 'string' ? reimbursementTitle : reimbursementTitle.$i18n['zh-CN']);
    await expect(page.getByTestId('page-dsl-block-MRichText')).toHaveText('将自动保存填写内容');
    await expect(page.getByTestId('editor-form-tool').locator('header, h1')).toHaveCount(0);
    if (showHelp === 'yes') {
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('.ce-form-tool__required')).toBeVisible();
      const form = page.getByTestId('editor-form-tool');
      expect(await form.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      await page.screenshot({ path: '/tmp/mokelay-form-without-draft-mobile.png', fullPage: true });
    }
    await expect(page.locator('.ce-form-tool__hint')).toHaveCount(showHelp === 'yes' ? 5 : 0);
    // Exceed the configured save debounce so a programmatic feedback loop is observable.
    await page.waitForTimeout(600);
    expect(writes).toHaveLength(0);
    await control.selectOption('yes');
    await expect(page.locator('.ce-form-tool__hint')).toHaveCount(5);
    await control.selectOption('no');
    await control.selectOption('yes');
    await control.selectOption('no');
    await expect(page.locator('.ce-form-tool__hint')).toHaveCount(0);
    await expect(page.locator('.ce-form-tool__description')).toHaveCount(2);
    await expect(page.getByText('草稿已保存', { exact: true })).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0].show_help).toBe('no');
    expect(errors).toEqual([]);
  });
}

test('edits and persists independent heading and bound status blocks', async ({ page }) => {
  await resetEditor(page);
  await seedSavedConfig(page, { blocks: [
    { id: 'state', type: 'MPageState', data: { initialState: { statusMessage: '已就绪', alternate: '备用文案' } } },
    { id: 'title', type: 'MHeading', data: { text: '原始标题', level: '1' } },
    { id: 'status', type: 'MRichText', data: { content: { mode: 'variable', source: 'Block', blockId: 'state', variable: 'statusMessage' } } },
    { id: 'form', type: 'MForm', data: { items: [] } }
  ] });
  await switchLocaleToChinese(page);
  const heading = await openToolPropertyPanel(page, 'editor-tool-MHeading');
  await heading.getByTestId('tool-property-input-text').fill('独立标题');
  await heading.getByTestId('tool-property-close').click();
  const status = await openToolPropertyPanel(page, 'editor-tool-MRichText');
  await expect(status.getByTestId('variable-block-select')).toHaveValue('state');
  await expect(status.getByTestId('variable-single-select')).toHaveValue('statusMessage');
  await status.getByTestId('variable-single-select').selectOption('alternate');
  await status.getByTestId('tool-property-close').click();
  await page.getByTestId('save-button').click();
  const saved = await getSavedBlocks(page);
  expect(JSON.stringify(saved.find(block => block.id === 'title')?.data?.text)).toContain('独立标题');
  expect(saved.find(block => block.id === 'status')?.data?.content).toMatchObject({ mode: 'variable', blockId: 'state', variable: 'alternate' });
  expect(saved.find(block => block.id === 'form')?.data).not.toHaveProperty('draft');
  await page.reload();
  const reopened = await openToolPropertyPanel(page, 'editor-tool-MRichText');
  await expect(reopened.getByTestId('variable-single-select')).toHaveValue('alternate');
  await reopened.getByTestId('tool-property-close').click();
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('page-dsl-block-MHeading')).toHaveText('独立标题');
  await expect(page.getByTestId('page-dsl-block-MRichText')).toHaveText('备用文案');
  await seedSavedConfig(page, { blocks: saved.filter(block => block.id !== 'title') });
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('page-dsl-block-MHeading')).toHaveCount(0);
  await expect(page.getByTestId('editor-form-tool').locator('h1, header')).toHaveCount(0);
});

test('edits the nested field event and trigger action without moving them to item events', async ({ page }) => {
  await resetEditor(page);
  const form = structuredClone(reimbursement.blocks.find((block: { type: string }) => block.type === 'MForm'));
  form.data.items = [form.data.items[0]];
  await seedSavedConfig(page, { blocks: [form] });
  await switchLocaleToChinese(page);
  const events = await openToolEventsPanel(page, 'editor-tool-MSelectField');
  await expect(events.getByTestId('tool-event-input-0-event')).toHaveValue('change');
  await events.getByTestId('tool-event-actions-0').getByTestId('m-action-editor-open').click();
  const inputs = page.getByTestId('m-action-inputs');
  await inputs.fill(JSON.stringify({ dataType: 'string', value: { template: '{{event.value}}' } }));
  await inputs.blur();
  await page.getByTestId('m-action-editor-close').click();
  await events.getByTestId('tool-events-close').click();

  const formEvents = await openFormPanel(page, 'events');
  await formEvents.getByTestId('tool-event-actions-0').getByTestId('m-action-editor-open').click();
  const triggerNode = page.locator('.vue-flow__node').filter({ hasText: 'trigger_event' });
  await expect.poll(async () => {
    const canvas = (await page.getByTestId('m-action-flow').boundingBox())!;
    const node = (await triggerNode.boundingBox())!;
    return node.x >= canvas.x && node.x + node.width <= canvas.x + canvas.width
      && node.y >= canvas.y && node.y + node.height <= canvas.y + canvas.height;
  }).toBe(true);
  await triggerNode.click();
  await expect(page.getByTestId('m-action-event-block')).toHaveValue('expense-show_help');
  await expect(page.getByTestId('m-action-event-name')).toHaveValue('change');
  const payload = { value: { template: '{{actions.restore_fields.outputs.returnData.values.show_help}}' } };
  await page.getByTestId('m-action-event-payload').fill(JSON.stringify(payload));
  await page.getByTestId('m-action-event-payload').blur();
  await page.getByTestId('m-action-editor-close').click();
  await formEvents.getByTestId('tool-events-close').click();
  await page.getByTestId('save-button').click();
  const [saved] = await getSavedBlocks(page);
  const item = (saved.data?.items as Array<{ editor: { events: unknown }; events?: unknown }>)[0];
  expect(item.events ?? []).toEqual([]);
  expect(item.editor.events).toEqual(form.data.items[0].editor.events);
  expect(saved.data).not.toHaveProperty('draft');
  expect(saved.events?.[0].actions.find(action => action.action === 'trigger_event')?.inputs?.payload).toEqual(payload);
  await page.reload();
  const reopened = await openToolEventsPanel(page, 'editor-tool-MSelectField');
  await expect(reopened.getByTestId('tool-event-input-0-event')).toHaveValue('change');
});

async function openFormPanel(page: Page, kind: 'events' | 'property') {
  const form = page.getByTestId('editor-form-tool');
  await form.hover({ position: { x: 8, y: 8 } });
  const settings = page.getByTestId('editor-surface')
    .locator(':scope > .codex-editor > .ce-toolbar .ce-toolbar__settings-btn');
  await expect(settings).toBeVisible();
  await settings.click();
  await page.locator('.ce-popover--opened .ce-popover-item')
    .filter({ hasText: kind === 'events' ? /事件|Events/ : /属性|Properties/ }).click();
  const dialog = page.locator(`[data-testid="tool-${kind}-dialog"][open]`);
  await expect(dialog).toBeVisible();
  return dialog;
}

test('loads and saves the reimbursement page using event actions, including exact request replay', async ({ page }) => {
  const writes: { api: string; body: Record<string, unknown> }[] = [];
  let loads = 0;
  const record = { id: 'test-doc', version: 0, status: 'draft', show_help: 'no', category: 'travel', fiat: '0.00', crypto: '0.00', loan: '0.00', settlement: '0.00', note: 'restored' };
  await page.route('**/api/lark/**', async route => {
    const request = route.request();
    const headers = { 'access-control-allow-origin': 'http://127.0.0.1:4173', 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (request.method() === 'GET') loads++;
    else {
      const body = request.postDataJSON(); writes.push({ api: new URL(request.url()).pathname, body });
      if (writes.length === 1) return route.abort('failed');
      Object.assign(record, body, { version: Number(body.version) + 1 });
    }
    return route.fulfill({ headers, body: JSON.stringify({ ok: true, data: { record, options: { category: [{ value: 'travel', label: '差旅费' }] } } }) });
  });
  await resetEditor(page, { initialRoute: '/#/pages/reimbursement/preview?source=system', systemPages: [reimbursement], seedDefaultPage: false });
  const note = page.locator('textarea');
  await expect(note).toHaveValue('restored');
  await expect(note).toBeEnabled();
  await expect(page.locator('output#expense-approval_amount')).toHaveText('0');
  const beforeEdit = loads;
  expect(writes).toEqual([]);
  await note.fill('first');
  await expect(page.getByTestId('reimbursement-form-retry')).toBeVisible();
  await page.getByTestId('reimbursement-form-retry').click();
  await expect(page.getByText('草稿已保存', { exact: true })).toBeVisible();
  expect(writes[0].body).toEqual(writes[1].body);
  await note.fill('latest');
  await page.getByTestId('reimbursement-submit').click();
  await expect(page.getByText('已提交 · 申请单号 test-doc', { exact: true })).toBeVisible();
  await expect(note).toBeDisabled();
  await expect(page.locator('output#expense-approval_amount')).toHaveText('0');
  await expect(page.getByTestId('reimbursement-submit')).toHaveCount(0);
  expect(loads).toBe(beforeEdit);
  expect(writes.map(write => [write.api.split('/').pop(), write.body.version, write.body.note])).toEqual([
    ['reimbursement_save_draft', 0, 'first'], ['reimbursement_save_draft', 0, 'first'],
    ['reimbursement_save_draft', 1, 'latest'], ['reimbursement_submit', 2, 'latest']
  ]);
});

test('edits event execution visually and preserves error/finally actions without presentation configuration', async ({ page }) => {
  await resetEditor(page);
  await seedSavedConfig(page, { blocks: [{ id: 'form', type: 'MForm', data: { items: [] }, events: [{
    event: 'init', actions: [{ uuid: 'status', action: 'call_block_method', inputs: { blockId: 'form', method: 'setStatus', loading: true } }],
    onError: [{ uuid: 'error', action: 'call_block_method', inputs: { blockId: 'form', method: 'setStatus', errors: [{ message: 'error' }] } }],
    onFinally: [{ uuid: 'finished', action: 'call_block_method', inputs: { blockId: 'form', method: 'setStatus', loading: false } }]
  }] }] });
  await switchLocaleToChinese(page);
  const dialog = await openFormPanel(page, 'events');
  await dialog.locator('summary').click();
  await dialog.locator('[data-policy-field="debounceMs"]').fill('400');
  await dialog.locator('[data-policy-field="debounceMs"]').blur();
  await dialog.locator('[data-policy-field="concurrency"]').selectOption('serialLatest');
  await dialog.locator('[data-policy-field="retry"]').selectOption('resumeUnconfirmed');
  await dialog.locator('[data-policy-field="hidden"]').check();
  await dialog.locator('[data-policy-field="unmount"]').check();
  await expect(dialog.getByTestId('tool-event-onError-0').getByTestId('m-action-editor-open')).toBeVisible();
  await dialog.getByTestId('tool-events-close').click();
  await page.getByTestId('save-button').click();
  const [form] = await getSavedBlocks(page);
  expect(form.events?.[0]).toMatchObject({ execution: { debounceMs: 400, concurrency: 'serialLatest', retry: 'resumeUnconfirmed', flushOn: ['hidden', 'unmount'] }, onError: [{ uuid: 'error' }], onFinally: [{ uuid: 'finished' }] });
  expect(form.data).not.toHaveProperty('draft');
  const property = await openFormPanel(page, 'property');
  await expect(property.getByTestId('form-draft-open')).toHaveCount(0);
  await expect(property).not.toContainText('草稿配置');
  await property.getByTestId('tool-property-close').click();
  await page.reload();
  const reopened = await openFormPanel(page, 'events');
  await reopened.locator('summary').click();
  await expect(reopened.locator('[data-policy-field="debounceMs"]')).toHaveValue('400');
});

test('keeps a failed initialization locked, allows retry, and stops invalid submissions before the API', async ({ page }) => {
  let loads = 0;
  let submissions = 0;
  const record = { id: 'test-validation', version: 0, status: 'draft', show_help: 'yes', category: '', fiat: '0.00', crypto: '0.00', loan: '0.00', settlement: '0.00', note: '' };
  await page.route('**/api/lark/**', async route => {
    const request = route.request();
    const headers = { 'access-control-allow-origin': 'http://127.0.0.1:4173', 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (request.method() === 'GET' && ++loads === 1) return route.fulfill({ headers, body: JSON.stringify({ ok: false, error: { message: '初始化暂时失败' } }) });
    if (request.url().endsWith('_submit')) {
      submissions++;
      return route.fulfill({ headers, body: JSON.stringify({ ok: false, error: { message: '提交被拒绝' } }) });
    }
    if (request.method() === 'POST') Object.assign(record, request.postDataJSON(), { version: record.version + 1 });
    return route.fulfill({ headers, body: JSON.stringify({ ok: true, data: { record, options: { category: [{ value: 'travel', label: '差旅费' }] } } }) });
  });
  await resetEditor(page, { initialRoute: '/#/reimbursement', systemPages: [reimbursement], seedDefaultPage: false });
  const submit = page.getByTestId('reimbursement-submit');
  const note = page.locator('textarea');
  await expect(page.getByText('初始化暂时失败', { exact: true })).toBeVisible();
  await expect(note).toBeDisabled();
  await expect(submit).toBeDisabled();
  await page.getByTestId('reimbursement-form-retry').click();
  await expect(note).toBeEnabled();
  await expect(page.getByText('选择本次报销的费用类别。', { exact: true })).toBeVisible();
  await submit.click();
  await expect(page.getByText('请填写申请报销类别。', { exact: true })).toBeVisible();
  expect(submissions).toBe(0);
  await page.locator('select').nth(1).selectOption('travel');
  await submit.click();
  await expect(page.getByText('提交被拒绝', { exact: true })).toBeVisible();
  await expect(note).toBeEnabled();
  await expect(submit).toBeEnabled();
  expect(submissions).toBe(1);
  expect(loads).toBe(2);
});
