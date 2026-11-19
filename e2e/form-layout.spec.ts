import { expect, test, type Locator } from '@playwright/test';
import { getSavedBlocks, openToolEventsPanel, resetEditor, seedSavedConfig, switchLocaleToChinese } from './helpers/editor';

const initialActions = [{ uuid: 'confirm_seed', action: 'confirm', inputs: { title: '确认', content: '继续' }, outputs: ['result'], nextAction: null }];

async function noHorizontalOverflow(locator: Locator) {
  expect(await locator.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
}

for (const width of [1440, 768, 390]) {
  test(`event cards align and scroll within the dialog at ${width}px`, async ({ page }) => {
    await resetEditor(page);
    await seedSavedConfig(page, { blocks: [{ id: 'text', type: 'MRichText', data: { content: '事件排版' }, events: [
      { event: 'init', actions: initialActions }, { event: 'change', actions: initialActions, execution: { debounceMs: 400, concurrency: 'serialLatest' } }
    ] }] });
    await switchLocaleToChinese(page);
    if (width === 768) await page.getByRole('combobox', { name: '语言', exact: true }).selectOption('en');
    const dialog = await openToolEventsPanel(page, 'editor-tool-MRichText');
    await page.setViewportSize({ width, height: 844 });
    if (width === 768) await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(dialog.getByTestId('m-action-editor-open')).toHaveCount(6);
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(15);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - 15);
    await noHorizontalOverflow(dialog);
    const buttons = await dialog.getByTestId('tool-event-row-0').getByTestId('m-action-editor-open').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
    expect(Math.max(...buttons.map(b => b.width)) - Math.min(...buttons.map(b => b.width))).toBeLessThan(1);
    for (const b of buttons) expect(b.height).toBe(width < 640 ? 44 : 40);
    if (width === 1440) expect(buttons[0].y).toBe(buttons[2].y);
    else if (width === 390) expect(buttons[0].y + buttons[0].height).toBeLessThan(buttons[1].y);
    await page.screenshot({ path: `/tmp/mokelay-events-${width}.png` });
    await dialog.locator('summary').first().click();
    await dialog.locator('[data-policy-field="debounceMs"]').first().fill('550');
    await dialog.locator('[data-policy-field="debounceMs"]').first().blur();
    await dialog.getByTestId('tool-events-add').click();
    await expect(dialog.locator('details').first()).toHaveAttribute('open', '');
    await expect(dialog.getByTestId('tool-event-input-2-event')).toBeFocused();
    await dialog.getByTestId('tool-event-input-2-event').fill('a_very_long_custom_event_name_for_layout_validation');
    await noHorizontalOverflow(dialog.getByTestId('tool-events-body'));
    await expect(dialog.getByTestId('tool-events-add')).toBeInViewport();
    await expect(dialog.getByTestId('tool-events-close')).toBeInViewport();
    await dialog.getByTestId('tool-event-remove-2').click();
    await expect(dialog.locator('details').first()).toHaveAttribute('open', '');
    // Container queries must also work in a narrow panel on a wide desktop.
    await page.setViewportSize({ width: 1440, height: 844 });
    await dialog.evaluate(el => (el as HTMLElement).style.width = '420px');
    await expect(dialog.getByTestId('tool-event-row-0').getByTestId('m-action-editor-open')).toHaveCount(3);
    const stacked = await dialog.getByTestId('tool-event-row-0').getByTestId('m-action-editor-open').evaluateAll(els => els.map(el => el.getBoundingClientRect().y));
    expect(stacked[0]).toBeLessThan(stacked[1]);
    await dialog.getByTestId('tool-events-close').click();
    await page.getByTestId('save-button').click();
    const saved = await getSavedBlocks(page);
    expect(saved[0]?.events).toHaveLength(2);
    expect(saved[0]?.events?.[0]).toMatchObject({ event: 'init', execution: { debounceMs: 550 } });
  });
}

test('nested action forms keep all three chains editable and update counts without losing event focus', async ({ page }) => {
  await resetEditor(page);
  await seedSavedConfig(page, { blocks: [{ id: 'text', type: 'MRichText', data: { content: 'Events' }, events: [{ event: 'init', actions: initialActions }] }] });
  const events = await openToolEventsPanel(page, 'editor-tool-MRichText');
  for (const chain of ['actions', 'onError', 'onFinally']) {
    await events.getByTestId(`tool-event-${chain}-0`).getByTestId('m-action-editor-open').click();
    const actionDialog = page.getByTestId('m-action-editor-dialog');
    if (chain !== 'actions') await page.getByTestId('m-action-add-confirm').click();
    await page.getByTestId('m-action-uuid').fill(`confirm_${chain}`);
    await page.getByTestId('m-action-uuid').blur();
    await page.setViewportSize({ width: 390, height: 844 });
    await noHorizontalOverflow(actionDialog.locator('[role="dialog"]'));
    await page.getByTestId('m-action-uuid').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('m-action-uuid')).toBeInViewport();
    if (chain === 'actions') await page.screenshot({ path: '/tmp/mokelay-nested-action-390.png' });
    await page.getByTestId('m-action-editor-close').click();
    await expect(events.locator(`[data-event-count="0-${chain}"]`)).toContainText('1');
    await page.setViewportSize({ width: 1440, height: 844 });
  }
  const input = events.getByTestId('tool-event-input-0-event');
  await input.fill('custom_event');
  await expect(input).toBeFocused();
  await events.getByTestId('tool-events-close').click();
  await page.getByTestId('save-button').click();
  const [block] = await getSavedBlocks(page);
  expect(block?.events?.[0]).toMatchObject({ event: 'custom_event', actions: [{ uuid: 'confirm_actions' }], onError: [{ uuid: 'confirm_onError' }], onFinally: [{ uuid: 'confirm_onFinally' }] });
});

// Mount existing form surfaces directly; their host route is outside this layout test.
for (const surface of ['ApiBuilderShell', 'MFormItemRulesEditor']) {
  test(`${surface} follows shared control and dialog sizing at narrow widths`, async ({ page }) => {
    await resetEditor(page);
    await page.evaluate(async name => {
      const vuePath = '/@id/vue';
      const componentPath = name === 'ApiBuilderShell' ? '/src/api-builder/ApiBuilderShell.vue' : '/src/editors/blocks/MFormItemRulesEditor.vue';
      const { createApp } = await import(vuePath);
      const { default: component } = await import(componentPath);
      const host = document.createElement('div');
      host.id = 'form-layout-harness';
      host.style.cssText = 'position:fixed;inset:0;z-index:10000;overflow:auto;background:white;padding:16px';
      document.body.appendChild(host);
      createApp(component, name === 'ApiBuilderShell' ? {} : { edit: true, variableName: 'description', value: { hint: '这是较长的填写提示，用于检查窄屏下的自动换行。' } }).mount(host);
    }, surface);
    if (surface === 'ApiBuilderShell') await page.getByTestId('api-builder-new').click();
    else await page.getByTestId('form-item-rules-open').click();
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = surface === 'ApiBuilderShell' ? page.getByRole('dialog', { name: '新建 API' }) : page.getByTestId('form-item-rules-dialog');
    await noHorizontalOverflow(dialog);
    for (const input of await dialog.locator('input:not([type="checkbox"]), select').all()) {
      expect((await input.boundingBox())!.height).toBe(44);
    }
    const submit = dialog.locator('button[type="submit"]');
    await expect(submit).toBeInViewport();
    if (surface === 'MFormItemRulesEditor') {
      await dialog.locator('[name="pattern"]').fill('[');
      await submit.click();
      await expect(dialog.getByRole('alert')).toBeVisible();
      await expect(submit).toBeInViewport();
      await noHorizontalOverflow(dialog);
      await dialog.locator('[name="pattern"]').fill('^.{1,100}$');
    }
    await page.screenshot({ path: `/tmp/mokelay-${surface}-390.png` });
  });
}

test('API orchestration uses its container width for the inspector layout', async ({ page }) => {
  await resetEditor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(async () => {
    const vuePath = '/@id/vue';
    const componentPath = '/src/api-builder/MApiOrchestrationEditorBlock.vue';
    const storePath = '/src/api-builder/store.ts';
    const { createApp } = await import(vuePath);
    const { default: component } = await import(componentPath);
    const { createDraft } = await import(storePath);
    const host = document.createElement('div');
    host.id = 'orchestration-layout-harness';
    host.style.cssText = 'position:absolute;top:0;left:0;width:390px;z-index:10000;background:white';
    document.body.appendChild(host);
    createApp(component, { draft: createDraft() }).mount(host);
  });
  const editor = page.getByTestId('orchestration-editor-block');
  await expect(editor).toBeVisible();
  await noHorizontalOverflow(editor);
  const columns = await editor.locator('.api-orchestration-layout').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(1);
  await page.locator('#orchestration-layout-harness').evaluate(el => (el as HTMLElement).style.width = '1200px');
  await expect.poll(() => editor.locator('.api-orchestration-layout').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(3);
});
