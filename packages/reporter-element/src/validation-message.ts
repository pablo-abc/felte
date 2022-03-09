import { LitElement, html, PropertyValues, nothing } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { warningStores, errorStores } from './stores';
import { _get, isEqual } from '@felte/common';

@customElement('felte-validation-message')
export class FelteValidationMessage extends LitElement {
  @property()
  level?: string = 'error';

  @property()
  for?: string;

  @property({ type: Number })
  max?: number;

  @property()
  templateId?: string;

  messages: string[] | null = null;

  private container?: HTMLElement | ShadowRoot | null;

  private item?: HTMLElement | null;

  @state({
    hasChanged(value, oldValue) {
      return !isEqual(value, oldValue);
    },
  })
  items: HTMLElement[] = [];

  private content: DocumentFragment | typeof nothing = nothing;

  private _prevSiblings: Node[] = [];

  private _nextSiblings: Node[] = [];

  private _handleLoad = (e: Event) => {
    const target = e.currentTarget as HTMLFormElement;
    const reporterId = target.dataset.felteReporterElementId;
    if (!reporterId) return;
    this._start(reporterId);
    this.formElement?.removeEventListener(
      'feltereporterelement:load',
      this._handleLoad
    );
  };

  private cleanup?: () => void;

  private formElement?: HTMLFormElement;

  private _setup() {
    const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement;
    const rootNode = this.getRootNode() as ShadowRoot | null;
    const hostNode = rootNode?.host?.shadowRoot;
    const template = this.templateId
      ? ((hostNode?.getElementById(this.templateId) ||
          document.getElementById(
            this.templateId
          )) as HTMLTemplateElement | null)
      : (slot
          .assignedNodes({ flatten: true })
          .find(
            (node) => node instanceof HTMLTemplateElement
          ) as HTMLTemplateElement | null);
    if (!template) return;
    this.content = document.importNode(template.content, true);
    const item = this.content.querySelector('[part="item"]');
    if (!item) return;
    this.item = item.cloneNode(true) as HTMLElement | null;
    this.container = item.parentElement;
    const elements = Array.from((this.container || this.content).childNodes);
    const itemIndex = elements.findIndex((el) => el === item);
    this._prevSiblings = elements.slice(0, itemIndex);
    this._nextSiblings = elements.slice(itemIndex + 1);
    (this.container || this.content).removeChild(item);
  }

  private _start(reporterId: string) {
    if (this.cleanup || !reporterId) return;
    const path = this.for;
    if (!path)
      throw new Error('<felte-validation-message> requires a `for` attribute');
    const store =
      this.level === 'error'
        ? errorStores[reporterId]
        : warningStores[reporterId];
    this.cleanup = store.subscribe(($messages) => {
      const itemTemplate = this.item;
      if (!$messages || !itemTemplate) return;
      const messages = _get($messages, path) as string[];
      this.messages = messages;
      if (!messages || messages.length === 0) {
        this.items = [];
        return;
      }
      if (this.max != null) messages.splice(this.max);
      const newItems = [...this.items];
      messages.forEach((message: string, index) => {
        const item = this.items[index] ?? itemTemplate.cloneNode(true);
        const messageElement = item.querySelector('[part="message"]') ?? item;
        messageElement.textContent = message;
        newItems[index] = item;
      });
      this.items = newItems.slice(0, messages.length);
    });
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('items') && this.container) {
      for (const child of Array.from(this.container.childNodes)) {
        if (this.items.includes(child as HTMLElement)) continue;
        this.container.removeChild(child);
      }
      this.container.append(
        ...this._prevSiblings,
        ...this.items,
        ...this._nextSiblings
      );
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  connectedCallback() {
    super.connectedCallback();
    const formElement = this.closest('form');
    if (!formElement)
      throw new Error(
        '<felte-validation-message> must be a child of a <form> element'
      );
    this.formElement = formElement;
  }

  firstUpdated() {
    const reporterId = this.formElement?.dataset.felteReporterElementId;
    if (!reporterId)
      this.formElement?.addEventListener(
        'feltereporterelement:load',
        this._handleLoad
      );
    this._setup();
    if (reporterId) this._start(reporterId);
  }

  render() {
    return html`
      <slot @slotchange=${this._setup}></slot>
      ${this.content} ${this.container ? nothing : this._prevSiblings}
      ${this.container ? nothing : this.items}
      ${this.container ? nothing : this._nextSiblings}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'felte-validation-message': FelteValidationMessage;
  }

  type HTMLFelteValidationMessageElement = FelteValidationMessage;
}
