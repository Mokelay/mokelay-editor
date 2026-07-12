import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  defaultPageUuid,
  resetEditor,
  seedSavedConfig,
  type SavedBlock
} from './helpers/editor';

test('updates page state through block methods and refreshes dependent templates', async ({ page }) => {
  await seedPageStatePreview(page, [
    actionButton('set-phase', 'setValue', {
      path: 'phase',
      value: 'generating'
    }),
    readAndStorePhaseButton(),
    actionButton('append-turn', 'append', {
      path: 'turns',
      value: {
        role: 'user',
        content: 'Build a CRM'
      }
    }),
    actionButton('merge-state', 'merge', {
      value: {
        isGenerating: true,
        error: ''
      }
    }),
    actionButton('clear-state', 'clear')
  ]);

  await openPreview(page);

  const stateViewer = page.getByTestId('m-page-state-json');
  await expect(page.getByText('Phase: idle')).toBeVisible();
  await expect(stateViewer).toContainText('"turns": []');

  await page.getByTestId('set-phase').click();
  await expect(page.getByText('Phase: generating')).toBeVisible();
  await expect(stateViewer).toContainText('"phase": "generating"');

  await page.getByTestId('read-phase').click();
  await expect(stateViewer).toContainText('"phaseCopy": "generating"');

  await page.getByTestId('append-turn').click();
  await expect(stateViewer).toContainText('"content": "Build a CRM"');

  await page.getByTestId('merge-state').click();
  await expect(stateViewer).toContainText('"isGenerating": true');

  await page.getByTestId('clear-state').click();
  await expect(page.getByText('Phase: idle')).toBeVisible();
  await expect(stateViewer).toContainText('"turns": []');
  await expect(stateViewer).not.toContainText('"isGenerating"');
});

test('keeps readonly page state unchanged', async ({ page }) => {
  await seedPageStatePreview(page, [
    actionButton('readonly-set-phase', 'setValue', {
      path: 'phase',
      value: 'changed'
    })
  ], true);

  await openPreview(page);
  await page.getByTestId('readonly-set-phase').click();

  await expect(page.getByText('Phase: idle')).toBeVisible();
  await expect(page.getByTestId('m-page-state-json')).toContainText('"phase": "idle"');
  await expect(page.getByTestId('m-page-state-readonly')).toBeVisible();
});

function actionButton(id: string, method: string, args?: Record<string, unknown>): SavedBlock {
  return {
    id,
    type: 'MButton',
    data: {
      label: id,
      variant: 'secondary',
      align: 'left'
    },
    events: [
      {
        event: 'click',
        actions: [
          {
            uuid: `${id}-action`,
            action: 'call_block_method',
            inputs: {
              blockId: 'page-state',
              method,
              ...(args === undefined ? {} : { args })
            },
            outputs: ['returnData'],
            nextAction: null
          }
        ]
      }
    ]
  };
}

function readAndStorePhaseButton(): SavedBlock {
  return {
    id: 'read-phase',
    type: 'MButton',
    data: {
      label: 'read-phase',
      variant: 'secondary',
      align: 'left'
    },
    events: [
      {
        event: 'click',
        actions: [
          {
            uuid: 'read-phase-action',
            action: 'call_block_method',
            inputs: {
              blockId: 'page-state',
              method: 'getValue',
              args: {
                path: 'phase'
              }
            },
            outputs: ['returnData'],
            nextAction: 'store-phase-action'
          },
          {
            uuid: 'store-phase-action',
            action: 'call_block_method',
            inputs: {
              blockId: 'page-state',
              method: 'setValue',
              args: {
                path: 'phaseCopy',
                value: {
                  template: "{{actions['read-phase-action'].outputs.returnData}}"
                }
              }
            },
            outputs: ['returnData'],
            nextAction: null
          }
        ]
      }
    ]
  };
}

async function seedPageStatePreview(page: Page, buttons: SavedBlock[], readonly = false) {
  await resetEditor(page);
  await seedSavedConfig(page, {
    time: 1783814400000,
    version: '2.31.6',
    blocks: [
      {
        id: 'page-state',
        type: 'MPageState',
        data: {
          initialState: {
            phase: 'idle',
            turns: []
          },
          visibleInPreview: true,
          readonly,
          debugLabel: 'AI Chat State'
        }
      },
      {
        id: 'phase-output',
        type: 'paragraph',
        data: {
          text: "Phase: {{blocks['page-state'].phase}}"
        }
      },
      ...buttons
    ]
  });
}

async function openPreview(page: Page) {
  await page.getByTestId('preview-button').click();
  await expect(page.getByTestId('preview-panel')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#\\/pages\\/${defaultPageUuid}\\/preview$`));
  await expect(page.getByTestId('m-page-state')).toBeVisible();
}
