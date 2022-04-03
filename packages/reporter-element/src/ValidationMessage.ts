import { warningStores, errorStores } from './stores';
import { _get, isEqual } from '@felte/common';

export class FelteValidationMessage extends HTMLElement {
  [key: string]: unknown;
  static get observedAttributes() {
    return ['level', 'for', 'max', 'templateid'];
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'templateid':
        this.templateId = newValue;
        break;
      case 'max':
        this.max = Number(newValue);
        break;
      default:
        this[name] = newValue;
        break;
    }
  }

  templateId?: string;
  max?: number;
  level = 'error';
  for?: string;

  messages: string[] | null = null;

  private _container?: HTMLElement | null;

  private _item?: HTMLElement | null;

  private _items: HTMLElement[] = [];
  set items(value: HTMLElement[]) {
    if (isEqual(value, this._items)) return;
    this._items = value;
    this._updatedItems();
  }
  get items() {
    return this._items;
  }

  private _content: DocumentFragment | null = null;

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
    const rootNode = this.getRootNode() as ShadowRoot | null;
    const hostNode = rootNode?.host?.shadowRoot;
    const template = this.templateId
      ? ((hostNode?.getElementById(this.templateId) ||
          document.getElementById(
            this.templateId
          )) as HTMLTemplateElement | null)
      : (this.querySelector('template') as HTMLTemplateElement | null);
    if (!template) return;
    this._content = document.importNode(template.content, true);
    const item = this._content.querySelector('[data-part="item"]');
    if (!item) return;
    this._item = item.cloneNode(true) as HTMLElement | null;
    this._container = item.parentElement;
    const elements = Array.from((this._container || this._content).childNodes);
    const itemIndex = elements.findIndex((el) => el === item);
    this._prevSiblings = elements.slice(0, itemIndex);
    this._nextSiblings = elements.slice(itemIndex + 1);
    (this._container || this._content).removeChild(item);
    if (this._container && this._container !== this)
      this.appendChild(this._container);
    if (!this._container) this._container = this;
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
      const itemTemplate = this._item;
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
        const messageElement =
          item.querySelector('[data-part="message"]') ?? item;
        messageElement.textContent = message;
        newItems[index] = item;
      });
      this.items = newItems.slice(0, messages.length);
    });
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  connectedCallback() {
    const formElement = this.closest('form');
    if (!formElement)
      throw new Error(
        '<felte-validation-message> must be a child of a <form> element'
      );
    this.formElement = formElement;
    setTimeout(() => {
      const reporterId = this.formElement?.dataset.felteReporterElementId;
      if (!reporterId)
        this.formElement?.addEventListener(
          'feltereporterelement:load',
          this._handleLoad
        );
      this._setup();
      if (reporterId) this._start(reporterId);
    });
  }

  private _updatedItems() {
    if (this._container) {
      for (const child of Array.from(this._container.childNodes)) {
        if (this.items.includes(child as HTMLElement)) continue;
        this._container.removeChild(child);
      }
      this._container.append(
        ...this._prevSiblings,
        ...this.items,
        ...this._nextSiblings
      );
    }
  }
}
