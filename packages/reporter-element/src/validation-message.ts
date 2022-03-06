import { LitElement, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { warningStores, errorStores } from './stores';
import { _get } from '@felte/common';

@customElement('felte-validation-message')
export class FelteValidationMessage extends LitElement {
  @property()
  level?: string = 'error';

  @property()
  for?: string;

  @property({ type: Number })
  max?: number;

  @state()
  container?: HTMLElement | ShadowRoot | null;

  @state()
  item?: HTMLElement | null;

  @state()
  items: HTMLElement[] = [];

  cleanup?: () => void;

  private _setup() {
    const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement;
    const template = slot
      .assignedNodes({ flatten: true })
      .find(
        (node) => node instanceof HTMLTemplateElement
      ) as HTMLTemplateElement | null;
    if (!template)
      throw new Error(
        '<felte-validation-message> requires one <template> element as a direct child'
      );
    const node = document.importNode(template.content, true);
    const item = node.querySelector('[part="item"]');
    if (!item)
      throw new Error(
        'An element with an attribute [part="item"] must be within the template on <felte-validation-message>'
      );
    this.item = item?.cloneNode(true) as HTMLElement | null;
    this.container = item?.parentElement ?? this.renderRoot;
    if (item) (item.parentElement ?? node)?.removeChild(item);
    this.renderRoot.appendChild(node);
  }

  private _start() {
    const formElement = this.closest('form');
    const path = this.for;
    if (!path)
      throw new Error('<felte-validation-message> requires a `for` attribute');
    const reporterId = formElement?.dataset.felteReporterElementId;
    if (!reporterId)
      throw new Error(
        'No form has been set. Maybe you forgot to extend Felte with the reporter?'
      );
    const store =
      this.level === 'error'
        ? errorStores[reporterId]
        : warningStores[reporterId];
    this.cleanup = store.subscribe(($messages) => {
      const itemTemplate = this.item;
      if (!$messages || !itemTemplate) return;
      const messages = _get($messages, path) as string[];
      if (!messages || messages.length === 0) {
        this.items = [];
        return;
      }
      if (this.max != null) messages.splice(this.max);
      messages.forEach((message: string, index) => {
        const item = this.items[index] ?? itemTemplate.cloneNode(true);
        const messageElement = item.querySelector('[part="message"]') ?? item;
        messageElement.textContent = message;
        this.items[index] = item;
      });
      this.items = this.items.slice(0, messages.length);
    });
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('items') && this.container) {
      for (const child of Array.from(this.container.childNodes)) {
        if (this.items.includes(child as HTMLElement)) continue;
        this.container.removeChild(child);
      }
      this.container.append(...this.items);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      this._setup();
      this._start();
    });
  }

  render() {
    return html`<slot></slot>`;
  }
}
