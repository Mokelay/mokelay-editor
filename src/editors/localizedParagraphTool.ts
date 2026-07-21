import type { ToolSettings } from '@editorjs/editorjs';
import {
  isLocalizedValue,
  normalizeLocalizedValue,
  resolveLocalizedValue,
  type LocalizedTextValue,
  type LocalizedValue,
  type PageLocaleConfig
} from 'mokelay-components/runtime';
import {
  getContentEditingLocale,
  getContentLocaleConfig
} from '@/composables/useContentLocalization';

type ParagraphToolConfig = {
  placeholder?: string;
  settingsLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
};

type ParagraphToolConstructorArgs = {
  data?: { text?: unknown };
  config?: ParagraphToolConfig;
  readOnly?: boolean;
  api?: {
    sanitizer?: {
      clean?: (value: string, config: Record<string, unknown>) => string;
    };
  };
};

const INLINE_HTML_RULES = {
  b: true,
  strong: true,
  i: true,
  em: true,
  u: true,
  s: true,
  mark: true,
  code: true,
  br: true,
  a: { href: true, target: '_blank', rel: 'nofollow noopener noreferrer' }
};

function cloneTextValue(value: unknown): LocalizedTextValue {
  if (typeof value === 'string') return value;
  if (isLocalizedValue(value)) return JSON.parse(JSON.stringify(value)) as LocalizedValue;
  return '';
}

function editValueForLocale(
  value: LocalizedTextValue,
  locale: string,
  config: PageLocaleConfig,
  text: string
): LocalizedTextValue {
  if (typeof value === 'string' && locale === config.defaultLocale) return text;
  const localized = normalizeLocalizedValue(
    typeof value === 'string' ? { $i18n: { [config.defaultLocale]: value } } : value,
    config
  );
  localized.$i18n[locale] = text;
  return localized;
}

export class LocalizedParagraphTool {
  private value: LocalizedTextValue;
  private readonly config: ParagraphToolConfig;
  private readonly readOnly: boolean;
  private readonly cleanHtml: (value: string) => string;
  private element: HTMLDivElement | null = null;
  private dialog: HTMLDialogElement | null = null;
  private renderedLocale = '';

  static get toolbox() {
    return {
      title: 'Text',
      icon: '<svg width="17" height="17" viewBox="0 0 17 17"><path d="M3 4h11M8.5 4v9M5.5 13h6" stroke="currentColor" fill="none" stroke-linecap="round"/></svg>'
    };
  }

  static get inlineToolbar() {
    return true;
  }

  static get sanitize() {
    // Values are sanitized per locale before save. Keeping this field intact
    // prevents EditorJS from treating locale codes as HTML tag rules.
    return { text: true };
  }

  constructor({ data, config, readOnly, api }: ParagraphToolConstructorArgs) {
    this.value = cloneTextValue(data?.text);
    this.config = config ?? {};
    this.readOnly = readOnly === true;
    this.cleanHtml = (value) => api?.sanitizer?.clean?.(value, INLINE_HTML_RULES) ?? value;
  }

  render() {
    this.renderedLocale = getContentEditingLocale();
    const element = document.createElement('div');
    element.className = 'ce-paragraph cdx-block';
    element.contentEditable = this.readOnly ? 'false' : 'true';
    element.dataset.placeholderActive = this.config.placeholder ?? '';
    element.dataset.empty = 'true';
    element.innerHTML = resolveLocalizedValue(
      this.value,
      this.renderedLocale,
      getContentLocaleConfig()
    );
    element.addEventListener('input', () => {
      element.dataset.empty = element.innerHTML ? 'false' : 'true';
    });
    this.element = element;
    return element;
  }

  save(element: HTMLElement) {
    const localeConfig = getContentLocaleConfig();
    this.value = editValueForLocale(
      this.value,
      this.renderedLocale || getContentEditingLocale(),
      localeConfig,
      this.cleanHtml(element.innerHTML)
    );
    return { text: cloneTextValue(this.value) };
  }

  renderSettings() {
    const config = getContentLocaleConfig();
    const value = this.value;
    const completed = isLocalizedValue(value)
      ? config.supportedLocales.filter((locale) => value.$i18n[locale]?.trim()).length
      : (typeof value === 'string' && value.trim() ? 1 : 0);
    return [{
      icon: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" fill="none"/></svg>',
      label: `${this.config.settingsLabel ?? 'Translations'} ${completed}/${config.supportedLocales.length}`,
      closeOnActivate: true,
      onActivate: () => this.openTranslationsDialog()
    }];
  }

  destroy() {
    this.dialog?.remove();
    this.dialog = null;
    this.element = null;
  }

  private openTranslationsDialog() {
    if (this.readOnly) return;
    this.dialog?.remove();
    const localeConfig = getContentLocaleConfig();
    const normalized = normalizeLocalizedValue(
      typeof this.value === 'string'
        ? { $i18n: { [localeConfig.defaultLocale]: this.value } }
        : this.value,
      localeConfig
    );
    const draft = JSON.parse(JSON.stringify(normalized)) as LocalizedValue;
    const dialog = document.createElement('dialog');
    dialog.className = 'localized-paragraph-dialog';
    dialog.style.cssText = 'width:min(620px,calc(100vw - 32px));border:0;border-radius:12px;padding:0;color:inherit;background:transparent;';
    const panel = document.createElement('div');
    panel.style.cssText = 'display:grid;gap:12px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:16px;box-shadow:0 24px 60px rgb(15 23 42 / .25);';
    const title = document.createElement('strong');
    title.textContent = this.config.settingsLabel ?? 'Translations';
    panel.appendChild(title);
    localeConfig.supportedLocales.forEach((locale) => {
      const label = document.createElement('label');
      label.style.cssText = 'display:grid;gap:5px;font-size:12px;';
      const caption = document.createElement('span');
      caption.textContent = locale;
      const input = document.createElement('div');
      input.contentEditable = 'true';
      input.dataset.testid = `paragraph-translation-${locale}`;
      input.style.cssText = 'min-height:70px;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:14px;line-height:1.5;';
      input.innerHTML = draft.$i18n[locale] ?? '';
      input.addEventListener('input', () => { draft.$i18n[locale] = input.innerHTML; });
      label.append(caption, input);
      panel.appendChild(label);
    });
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = this.config.cancelLabel ?? 'Cancel';
    cancel.addEventListener('click', () => dialog.close());
    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = this.config.saveLabel ?? 'Save';
    save.dataset.testid = 'paragraph-translations-save';
    save.addEventListener('click', () => {
      localeConfig.supportedLocales.forEach((locale) => {
        draft.$i18n[locale] = this.cleanHtml(draft.$i18n[locale] ?? '');
      });
      this.value = draft;
      if (this.element) {
        this.element.innerHTML = resolveLocalizedValue(
          draft,
          getContentEditingLocale(),
          localeConfig
        );
        this.element.dispatchEvent(new InputEvent('input', { bubbles: true }));
      }
      dialog.close();
    });
    actions.append(cancel, save);
    panel.appendChild(actions);
    dialog.appendChild(panel);
    dialog.addEventListener('close', () => {
      dialog.remove();
      if (this.dialog === dialog) this.dialog = null;
    });
    document.body.appendChild(dialog);
    this.dialog = dialog;
    dialog.showModal();
  }
}

export function createLocalizedParagraphToolSettings(config: ParagraphToolConfig = {}): ToolSettings {
  return {
    class: LocalizedParagraphTool as unknown as ToolSettings['class'],
    inlineToolbar: true,
    config
  };
}
