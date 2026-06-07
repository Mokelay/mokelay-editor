import { i18n } from '@/i18n';
import {
  cloneBlockEvents,
  createEmptyBlockEvent,
  normalizeBlockEvents,
  type BlockEvent
} from '@/utils/blockEvents';

type BlockEventsDialogOptions = {
  owner: HTMLElement;
  toolName: string;
  getEvents: () => BlockEvent[];
  setEvents: (events: BlockEvent[]) => void;
};

const eventFieldNames = ['event', 'block', 'method'] as const;

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

function renderEventRow(event: BlockEvent, index: number) {
  const fieldHtml = eventFieldNames.map((field) => `
    <label class="mokelay-editor-tool__event-field">
      <span class="mokelay-editor-tool__property-label">${escapeHtml(i18n.t(`editor.events.fields.${field}`))}</span>
      <input
        class="mokelay-editor-tool__property-input"
        data-testid="tool-event-input-${index}-${field}"
        data-event-index="${index}"
        data-event-field="${field}"
        type="text"
        value="${escapeHtml(fieldValue(event[field]))}"
      />
    </label>
  `).join('');

  return `
    <div class="mokelay-editor-tool__event-row" data-testid="tool-event-row-${index}">
      <div class="mokelay-editor-tool__event-fields">
        ${fieldHtml}
      </div>
      <button
        type="button"
        class="mokelay-editor-tool__event-remove"
        data-testid="tool-event-remove-${index}"
        data-event-remove-index="${index}"
      >${escapeHtml(i18n.t('editor.events.remove'))}</button>
    </div>
  `;
}

export class BlockEventsDialogController {
  private readonly options: BlockEventsDialogOptions;
  private dialog: HTMLDialogElement | null = null;
  private draftEvents: BlockEvent[] = [];

  constructor(options: BlockEventsDialogOptions) {
    this.options = options;
  }

  mount() {
    const dialog = document.createElement('dialog');
    dialog.className = 'mokelay-editor-tool__property-dialog mokelay-editor-tool__events-dialog';
    dialog.dataset.testid = 'tool-events-dialog';
    dialog.dataset.toolName = this.options.toolName;

    this.options.owner.appendChild(dialog);
    this.dialog = dialog;
  }

  destroy() {
    this.dialog?.remove();
    this.dialog = null;
  }

  open() {
    if (!this.dialog) return;

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

    const eventsHtml = this.draftEvents.length
      ? this.draftEvents.map((event, index) => renderEventRow(event, index)).join('')
      : `<p class="mokelay-editor-tool__events-empty" data-testid="tool-events-empty">${escapeHtml(i18n.t('editor.events.empty'))}</p>`;

    this.dialog.innerHTML = `
      <form method="dialog" class="mokelay-editor-tool__property-panel" data-testid="tool-events-panel">
        <div class="mokelay-editor-tool__property-header">
          <h3 class="mokelay-editor-tool__property-title" data-testid="tool-events-title">${escapeHtml(i18n.t('editor.events.title'))}</h3>
          <button type="submit" class="mokelay-editor-tool__property-close" data-testid="tool-events-close">${escapeHtml(i18n.t('editor.close'))}</button>
        </div>
        <div class="mokelay-editor-tool__property-body mokelay-editor-tool__events-body" data-testid="tool-events-body">
          ${eventsHtml}
          <button type="button" class="mokelay-editor-tool__event-add" data-testid="tool-events-add">${escapeHtml(i18n.t('editor.events.add'))}</button>
        </div>
      </form>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    if (!this.dialog) return;

    this.dialog.querySelectorAll<HTMLInputElement>('[data-event-field]').forEach((input) => {
      input.addEventListener('input', () => {
        const index = Number(input.dataset.eventIndex);
        const field = input.dataset.eventField as keyof BlockEvent | undefined;
        if (!Number.isInteger(index) || !field || !eventFieldNames.includes(field)) return;

        this.draftEvents[index] = {
          ...(this.draftEvents[index] ?? createEmptyBlockEvent()),
          [field]: input.value
        };
        this.saveDraftEvents();
      });
    });

    this.dialog.querySelectorAll<HTMLButtonElement>('[data-event-remove-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.eventRemoveIndex);
        if (!Number.isInteger(index)) return;
        this.draftEvents.splice(index, 1);
        this.saveDraftEvents();
        this.render();
      });
    });

    this.dialog.querySelector<HTMLButtonElement>('[data-testid="tool-events-add"]')?.addEventListener('click', () => {
      this.draftEvents.push(createEmptyBlockEvent());
      this.render();
    });
  }
}
