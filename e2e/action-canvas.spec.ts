import { expect, test, type Page } from '@playwright/test';
import {
  getSavedBlocks, openToolEventsPanel, resetEditor, seedSavedConfig, switchLocaleToChinese
} from './helpers/editor';

test.use({ locale: 'zh-CN' });

function actions(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    uuid: `step_${index}`, action: 'call_block_method', alias: `步骤 ${index + 1}`,
    inputs: { blockId: 'state', method: 'setValue', args: { path: 'status', value: '完成' } },
    nextAction: index + 1 < count ? `step_${index + 1}` : null
  }));
}

async function seedActions(page: Page, value: object[]) {
  await resetEditor(page);
  await seedSavedConfig(page, { blocks: [{ id: 'actions', type: 'MActionEditor', data: { value } }] });
  await page.getByTestId('m-action-editor-open').click();
}

async function readViewport(page: Page) {
  return page.getByTestId('m-action-flow').locator('.vue-flow__transformationpane').evaluate(element => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

async function expectAllContentInside(page: Page, count: number) {
  const flow = page.getByTestId('m-action-flow');
  await expect(flow.locator('.vue-flow__node')).toHaveCount(count);
  await expect.poll(() => flow.evaluate(element => {
    const canvas = element.getBoundingClientRect();
    const contents = Array.from(element.querySelectorAll(
      '.vue-flow__node, .vue-flow__edge-path, .vue-flow__edge-textwrapper, .m-action-editor__branch-handle'
    ));
    return contents.every(content => {
      const rect = content.getBoundingClientRect();
      return rect.left >= canvas.left + 10 && rect.right <= canvas.right - 10
        && rect.top >= canvas.top + 10 && rect.bottom <= canvas.bottom - 10;
    });
  })).toBe(true);
}

for (const width of [1440, 768, 390]) {
  test(`fits a long action chain and all controller branches at ${width}px`, async ({ page }) => {
    const value: object[] = actions(20);
    value[10] = {
      uuid: 'step_10', action: 'switch_controller', type: 'controller', alias: '多分支',
      inputs: { value: 1 }, nextAction: null,
      nodes: Array.from({ length: 12 }, (_, index) => ({
        uuid: `branch_${index}`, value: index, nextAction: index % 2 ? 'step_0' : 'step_19'
      }))
    };
    await page.setViewportSize({ width, height: 844 });
    await seedActions(page, value);
    if (width === 768) await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expectAllContentInside(page, 20);
    expect((await readViewport(page)).zoom).toBeLessThan(0.35);
    const toolbar = page.locator('.m-action-editor__zoom-toolbar');
    expect(await toolbar.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    const controller = page.locator('.m-action-editor__flow-node--controller');
    expect(await controller.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return Array.from(element.querySelectorAll('.m-action-editor__branch-handle'))
        .every(branch => branch.getBoundingClientRect().bottom <= bounds.bottom);
    })).toBe(true);
    await page.screenshot({ path: `/tmp/mokelay-action-canvas-${width}.png` });
    await page.getByTestId('m-action-zoom-in').click();
    await page.getByTestId('m-action-zoom-out').click();
    await expectAllContentInside(page, 20);
  });
}

test('supports buttons, wheel, pinch and pan while keeping the percentage in sync', async ({ page }) => {
  await seedActions(page, actions(1));
  await expectAllContentInside(page, 1);
  await expect(page.getByTestId('m-action-zoom-percent')).toHaveText('100%');
  await page.getByRole('button', { name: '放大', exact: true }).click();
  await expect(page.getByTestId('m-action-zoom-percent')).toHaveText('120%');
  await expect(page.getByTestId('m-action-zoom-in')).toBeDisabled();
  await page.getByRole('button', { name: '缩小', exact: true }).click();
  await expect(page.getByTestId('m-action-zoom-percent')).toHaveText('100%');

  const canvas = (await page.getByTestId('m-action-flow').boundingBox())!;
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + 30);
  await page.mouse.wheel(0, 180);
  await expect.poll(async () => (await readViewport(page)).zoom).toBeLessThan(1);
  const afterWheel = await readViewport(page);
  // Chromium represents a trackpad pinch as a wheel event with ctrlKey.
  await page.getByTestId('m-action-flow').locator('.vue-flow__pane').dispatchEvent('wheel', {
    deltaY: -20, deltaMode: 0, ctrlKey: true, bubbles: true, cancelable: true,
    clientX: canvas.x + canvas.width / 2, clientY: canvas.y + 30
  });
  await expect.poll(async () => (await readViewport(page)).zoom).toBeGreaterThan(afterWheel.zoom);
  const beforePan = await readViewport(page);
  await expect(page.getByTestId('m-action-zoom-percent')).toHaveText(`${Math.round(beforePan.zoom * 1000) / 10}%`);
  await page.mouse.move(canvas.x + 30, canvas.y + 30);
  await page.mouse.down();
  await page.mouse.move(canvas.x + 100, canvas.y + 70, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => (await readViewport(page)).x).not.toBe(beforePan.x);
  expect((await readViewport(page)).zoom).toBeCloseTo(beforePan.zoom);
  await page.getByTestId('m-action-fit-view').click();
  await expectAllContentInside(page, 1);
  await expect(page.getByTestId('m-action-zoom-percent')).toHaveText('100%');
});

test('preserves the viewport during edits and refits each time the dialog opens', async ({ page }) => {
  await seedActions(page, actions(6));
  await expectAllContentInside(page, 6);
  await page.getByTestId('m-action-zoom-in').click();
  const viewport = await readViewport(page);
  await page.getByTestId('m-action-alias').fill('已编辑');
  await page.getByTestId('m-action-add-confirm').click();
  await expect(page.locator('.vue-flow__node')).toHaveCount(7);
  expect(await readViewport(page)).toEqual(viewport);
  await page.getByRole('button', { name: '删除', exact: true }).click();
  await expect(page.locator('.vue-flow__node')).toHaveCount(6);
  await page.setViewportSize({ width: 900, height: 844 });
  expect(await readViewport(page)).toEqual(viewport);
  await page.getByTestId('m-action-editor-close').click();
  await page.getByTestId('m-action-editor-open').click();
  await expectAllContentInside(page, 6);
  expect(await readViewport(page)).not.toEqual(viewport);
  await expect(page.getByTestId('m-action-alias')).toHaveValue('已编辑');
});

test('does not discard an unfinished inspector edit when zooming the canvas', async ({ page }) => {
  await seedActions(page, actions(1));
  await expectAllContentInside(page, 1);
  const inputs = page.getByTestId('m-action-inputs');
  const pending = '{\n  "blockId": "new_target",\n  "method": "getData"\n}';
  await inputs.fill(pending);
  const canvas = (await page.getByTestId('m-action-flow').boundingBox())!;
  await page.mouse.move(canvas.x + 30, canvas.y + 30);
  await page.mouse.wheel(0, 180);
  await expect.poll(async () => (await readViewport(page)).zoom).toBeLessThan(1);
  await expect(inputs).toHaveValue(pending);
  await inputs.blur();
  await page.getByTestId('m-action-editor-close').click();
  await page.getByTestId('save-button').click();
  const saved = (await getSavedBlocks(page))[0].data?.value as Array<{ inputs: unknown }>;
  expect(saved[0].inputs).toEqual(JSON.parse(pending));
});

test('starts an empty canvas at 100% and keeps adding actions under manual control', async ({ page }) => {
  await seedActions(page, []);
  await expect(page.getByTestId('m-action-zoom-percent')).toHaveText('100%');
  await expect(page.getByTestId('m-action-fit-view')).toBeDisabled();
  for (let index = 0; index < 5; index++) await page.getByTestId('m-action-add-confirm').click();
  await expect(page.getByTestId('m-action-fit-view')).toBeEnabled();
  await expect(page.getByTestId('m-action-zoom-percent')).toHaveText('100%');
  await page.getByTestId('m-action-fit-view').click();
  await expectAllContentInside(page, 5);
  await page.getByTestId('m-action-editor-close').click();
  await page.getByTestId('m-action-editor-open').click();
  await expectAllContentInside(page, 5);
});

test('isolates event chains and preserves the DSL through save, reload and preview', async ({ page }) => {
  await resetEditor(page);
  const value = {
    id: 'run', type: 'MButton', data: { label: '运行流程', action: { type: 'submit' } }, events: [
      { event: 'click', actions: actions(8), onError: actions(2), onFinally: actions(1) }
    ]
  };
  await seedSavedConfig(page, { blocks: [value,
    { id: 'state', type: 'MPageState', data: { initialState: { status: '等待' } } }, {
    id: 'status', type: 'MRichText',
    data: { content: { mode: 'variable', source: 'Block', blockId: 'state', variable: 'status' } }
  }] });
  await switchLocaleToChinese(page);
  const events = await openToolEventsPanel(page, 'editor-tool-MButton');
  const ids = new Set<string>();
  for (const [chain, count] of [['actions', 8], ['onError', 2], ['onFinally', 1], ['actions', 8]] as const) {
    await events.getByTestId(`tool-event-${chain}-0`).getByTestId('m-action-editor-open').click();
    await expectAllContentInside(page, count);
    const id = (await page.getByTestId('m-action-flow').locator('.vue-flow__handle').first().getAttribute('data-id'))!;
    expect(ids.has(id)).toBe(false);
    ids.add(id);
    await page.getByTestId('m-action-zoom-in').click();
    await page.getByTestId('m-action-editor-close').click();
  }
  await events.getByTestId('tool-events-close').click();
  await page.getByTestId('save-button').click();
  expect((await getSavedBlocks(page))[0].events).toEqual(value.events);
  await page.reload();
  const reopened = await openToolEventsPanel(page, 'editor-tool-MButton');
  await reopened.getByTestId('tool-event-actions-0').getByTestId('m-action-editor-open').click();
  await expectAllContentInside(page, 8);
  await page.getByTestId('m-action-editor-close').click();
  await reopened.getByTestId('tool-events-close').click();
  await page.getByTestId('preview-button').click();
  await page.getByRole('button', { name: '运行流程', exact: true }).click();
  await expect(page.getByTestId('page-dsl-block-MRichText')).toHaveText('完成');
});
