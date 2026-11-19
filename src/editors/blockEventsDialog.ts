import { createApp, type App } from 'vue';
import { i18n } from '@/i18n';
import {
  cloneBlockEvents,
  createEmptyBlockEvent,
  normalizeBlockEvents,
  type BlockEvent
} from 'mokelay-components/blocks';
import type { PageEditorBridge } from '@/editors/pageEditor';

type BlockEventsDialogOptions = {
  owner: HTMLElement;
  toolName: string;
  getEvents: () => BlockEvent[];
  setEvents: (events: BlockEvent[]) => void;
  pageEditor?: PageEditorBridge;
};

const eventFieldNames = ['event'] as const;
type EventFieldName = typeof eventFieldNames[number];

export const blockEventsIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5h4v4H5V5Zm10 0h4v4h-4V5ZM5 15h4v4H5v-4Zm10.5-.5 3.5 3.5m0-3.5-3.5 3.5M9 7h6M7 9v6M17 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fieldValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function isEventFieldName(value: unknown): value is EventFieldName {
  return typeof value === 'string' && (eventFieldNames as readonly string[]).includes(value);
}

const eventLabel = (zh: string, en: string) => i18n.locale === 'en' ? en : zh;
function renderExecution(event: BlockEvent, index: number) {
  const policy = event.execution ?? {};
  const select = (field: string, current: string, options: [string, string][]) => `<select class="mk-form-control" data-policy-index="${index}" data-policy-field="${field}">${options.map(([value, label]) => `<option value="${value}" ${value === current ? 'selected' : ''}>${label}</option>`).join('')}</select>`;
  return `<details class="mokelay-editor-tool__event-policy" data-event-policy-index="${index}">
    <summary>${eventLabel('执行策略', 'Execution policy')}</summary>
    <div class="mk-form-grid mokelay-editor-tool__event-policy-fields">
      <label class="mk-form-field">${eventLabel('防抖（毫秒）', 'Debounce (ms)')}<input type="number" min="0" max="60000" class="mk-form-control" data-policy-index="${index}" data-policy-field="debounceMs" value="${policy.debounceMs ?? 0}"></label>
      <label class="mk-form-field">${eventLabel('并发策略', 'Concurrency')}${select('concurrency', policy.concurrency ?? 'parallel', [['parallel', eventLabel('并行', 'Parallel')], ['serialLatest', eventLabel('串行，保留最新变更', 'Serial, keep latest')], ['drop', eventLabel('执行期间忽略重复触发', 'Ignore duplicate triggers')]])}</label>
      <label class="mk-form-field mk-form-full">${eventLabel('请求重放', 'Request replay')}${select('retry', policy.retry ?? 'none', [['none', eventLabel('不自动重放', 'No automatic replay')], ['resumeUnconfirmed', eventLabel('确认未收到响应的请求（仅幂等接口）', 'Resume unconfirmed requests (idempotent APIs only)')]])}</label>
      <div class="mk-form-full mokelay-editor-tool__event-lifecycle">
        ${(['hidden', 'unmount'] as const).map(trigger => `<label class="mk-form-check-row"><input class="mk-form-check" type="checkbox" data-policy-index="${index}" data-policy-field="${trigger}" ${policy.flushOn?.includes(trigger) ? 'checked' : ''}>${trigger === 'hidden' ? eventLabel('页面隐藏时尽力保存', 'Flush when hidden') : eventLabel('离开页面时尽力保存', 'Flush on unmount')}</label>`).join('')}
      </div>
    </div>
  </details>`;
}

function actionCountLabel(count: number) {
  return eventLabel(`${count} 个动作`, `${count} ${count === 1 ? 'action' : 'actions'}`);
}

function renderEventRow(event: BlockEvent, index: number) {
  return `
    <section class="mokelay-editor-tool__event-row" data-testid="tool-event-row-${index}">
      <div class="mokelay-editor-tool__event-header">
        <h4>${eventLabel('事件', 'Event')} <span>${String(index + 1).padStart(2, '0')}</span></h4>
        <button type="button" class="mk-form-button mk-form-button--danger" data-testid="tool-event-remove-${index}" data-event-remove-index="${index}">${escapeHtml(i18n.t('editor.events.remove'))}</button>
      </div>
      <label class="mk-form-field">
        <span>${escapeHtml(i18n.t('editor.events.fields.event'))}</span>
        <input class="mk-form-control" data-testid="tool-event-input-${index}-event" data-event-index="${index}" data-event-field="event" type="text" value="${escapeHtml(fieldValue(event.event))}">
      </label>
      <div class="mokelay-editor-tool__event-actions-grid">
        ${(['actions', 'onError', 'onFinally'] as const).map(chain => `
        <div class="mk-form-field mokelay-editor-tool__event-action-field">
          <div class="mokelay-editor-tool__event-action-label">
            <span>${chain === 'actions' ? escapeHtml(i18n.t('editor.events.fields.actions')) : chain === 'onError' ? eventLabel('失败时', 'On error') : eventLabel('结束时', 'Finally')}</span>
            <span class="mk-form-help" data-event-count="${index}-${chain}">${actionCountLabel(event[chain]?.length ?? 0)}</span>
          </div>
          <div class="mokelay-editor-tool__event-actions" data-testid="tool-event-${chain}-${index}" data-event-chain="${chain}" data-event-actions-index="${index}"></div>
        </div>`).join('')}
      </div>
      ${renderExecution(event, index)}
    </section>
  `;
}

export class BlockEventsDialogController {
  private readonly options: BlockEventsDialogOptions;
  private dialog: HTMLDialogElement | null = null;
  private draftEvents: BlockEvent[] = [];
  private actionEditorApps: App<Element>[] = [];
  private expandedPolicies = new Set<BlockEvent>();
  private renderVersion = 0;

  constructor(options: BlockEventsDialogOptions) {
    this.options = options;
  }

  mount() {
    const dialog = document.createElement('dialog');
    dialog.className = 'mk-form-dialog mk-form-dialog--wide mokelay-editor-tool__property-dialog mokelay-editor-tool__events-dialog';
    dialog.dataset.testid = 'tool-events-dialog';
    dialog.dataset.toolName = this.options.toolName;

    this.options.owner.appendChild(dialog);
    this.dialog = dialog;
  }

  destroy() {
    this.unmountActionEditors();
    this.dialog?.remove();
    this.dialog = null;
  }

  open() {
    if (!this.dialog) return;

    this.expandedPolicies.clear();
    this.draftEvents = cloneBlockEvents(this.options.getEvents());
    this.render();

    if (!this.dialog.open) {
      this.dialog.showModal();
    }
  }

  private saveDraftEvents() {
    this.options.setEvents(normalizeBlockEvents(this.draftEvents));
  }

  private render() {
    if (!this.dialog) return;
    this.unmountActionEditors();
    this.renderVersion += 1;

    const eventsHtml = this.draftEvents.length
      ? this.draftEvents.map((event, index) => renderEventRow(event, index)).join('')
      : `<p class="mokelay-editor-tool__events-empty" data-testid="tool-events-empty">${escapeHtml(i18n.t('editor.events.empty'))}</p>`;

    this.dialog.innerHTML = `
      <form method="dialog" class="mk-form-dialog-panel" data-testid="tool-events-panel">
        <div class="mk-form-dialog-header">
          <h3 class="mokelay-editor-tool__property-title" data-testid="tool-events-title">${escapeHtml(i18n.t('editor.events.title'))}</h3>
          <button type="submit" class="mk-form-button" data-testid="tool-events-close">${escapeHtml(i18n.t('editor.close'))}</button>
        </div>
        <div class="mk-form-dialog-body mk-form-stack mk-form-scope mokelay-editor-tool__events-body" data-testid="tool-events-body">
          ${eventsHtml}
        </div>
        <div class="mk-form-dialog-footer mokelay-editor-tool__events-footer">
          <button type="button" class="mk-form-button mk-form-button--primary" data-testid="tool-events-add">${escapeHtml(i18n.t('editor.events.add'))}</button>
        </div>
      </form>
    `;

    this.dialog.querySelectorAll<HTMLDetailsElement>('[data-event-policy-index]').forEach(details => {
      const event = this.draftEvents[Number(details.dataset.eventPolicyIndex)];
      details.open = this.expandedPolicies.has(event);
      details.addEventListener('toggle', () => {
        if (details.open) this.expandedPolicies.add(event); else this.expandedPolicies.delete(event);
      });
    });
    this.bindEvents();
    this.mountActionEditors();
  }

  private bindEvents() {
    if (!this.dialog) return;

    this.dialog.querySelectorAll<HTMLInputElement>('[data-event-field]').forEach((input) => {
      input.addEventListener('input', () => {
        const index = Number(input.dataset.eventIndex);
        const field = input.dataset.eventField;
        if (!Number.isInteger(index) || !isEventFieldName(field)) return;

        this.draftEvents[index][field] = input.value;
        this.saveDraftEvents();
      });
    });

    this.dialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-policy-field]').forEach(input => {
      input.addEventListener('change', () => {
        const index = Number(input.dataset.policyIndex);
        const field = input.dataset.policyField;
        const event = this.draftEvents[index];
        if (!event) return;
        const execution = { ...event.execution };
        if (field === 'debounceMs') execution.debounceMs = Number(input.value);
        if (field === 'concurrency') execution.concurrency = input.value as 'parallel' | 'serialLatest' | 'drop';
        if (field === 'retry') execution.retry = input.value as 'none' | 'resumeUnconfirmed';
        if (field === 'hidden' || field === 'unmount') {
          const triggers = new Set(execution.flushOn);
          if ((input as HTMLInputElement).checked) triggers.add(field); else triggers.delete(field);
          execution.flushOn = [...triggers];
        }
        event.execution = execution;
        this.saveDraftEvents();
      });
    });

    this.dialog.querySelectorAll<HTMLButtonElement>('[data-event-remove-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.eventRemoveIndex);
        if (!Number.isInteger(index)) return;
        this.expandedPolicies.delete(this.draftEvents[index]);
        this.draftEvents.splice(index, 1);
        this.saveDraftEvents();
        this.render();
      });
    });

    this.dialog.querySelector<HTMLButtonElement>('[data-testid="tool-events-add"]')?.addEventListener('click', () => {
      this.draftEvents.push(createEmptyBlockEvent());
      this.render();
      this.dialog?.querySelector<HTMLInputElement>(`[data-testid="tool-event-input-${this.draftEvents.length - 1}-event"]`)?.focus();
    });
  }

  private async mountActionEditors() {
    if (!this.dialog) return;

    const version = this.renderVersion;
    const { default: MActionEditor } = await import('@/editors/blocks/MActionEditor.vue');
    if (!this.dialog || version !== this.renderVersion) return;

    this.dialog.querySelectorAll<HTMLElement>('[data-event-actions-index]').forEach((container) => {
      const index = Number(container.dataset.eventActionsIndex);
      if (!Number.isInteger(index)) return;

      const chain = container.dataset.eventChain as 'actions' | 'onError' | 'onFinally';
      const app = createApp(MActionEditor, {
        edit: true,
        pageEditor: this.options.pageEditor,
        modelValue: this.draftEvents[index]?.[chain] ?? [],
        'onUpdate:modelValue': (actions: BlockEvent['actions']) => {
          this.draftEvents[index][chain] = actions;
          const count = this.dialog?.querySelector(`[data-event-count="${index}-${chain}"]`);
          if (count) count.textContent = actionCountLabel(actions.length);
          this.saveDraftEvents();
        },
        onChange: (actions: BlockEvent['actions']) => {
          this.draftEvents[index][chain] = actions;
          const count = this.dialog?.querySelector(`[data-event-count="${index}-${chain}"]`);
          if (count) count.textContent = actionCountLabel(actions.length);
          this.saveDraftEvents();
        }
      });

      app.mount(container);
      this.actionEditorApps.push(app);
    });
  }

  private unmountActionEditors() {
    this.actionEditorApps.forEach((app) => app.unmount());
    this.actionEditorApps = [];
  }
}
