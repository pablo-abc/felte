import { html, render } from 'uhtml';

export class SearchResult extends HTMLElement {
  [key: string]: unknown;
  item: any = undefined;
  role: any;
  framework = '';

  #bodyLength = 60;
  set bodyLength(value: number) {
    this.#bodyLength = value;
    this.item && this.update();
  }

  get bodyLength() {
    return this.#bodyLength;
  }

  #active = false;
  set active(value: boolean) {
    this.#active = value;
    this.updateActive();
  }
  get active() {
    return this.#active;
  }

  get strong() {
    return this.shadowRoot!.querySelector('strong');
  }

  get liContent() {
    return this.shadowRoot!.querySelector('.content') as HTMLDivElement;
  }

  get link() {
    return this.shadowRoot!.querySelector('a');
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  activate() {
    this.dispatchEvent(
      new CustomEvent('activate', {
        bubbles: true,
        composed: true,
      })
    );
  }

  connectedCallback() {
    this.setAttribute('id', `result-${this.item.attributes.section}`);
    this.setAttribute('role', this.role || 'listitem');
    this.setAttribute('data-combobox-option', '');
    this.addEventListener('mouseenter', this.activate.bind(this));
    this.update();
  }

  disconnectedCallback() {
    this.removeEventListener('mouseenter', this.activate);
  }

  update() {
    render(
      this.shadowRoot!,
      html`
        <style>
          strong {
            font-size: 1.2rem;
            font-weight: 700;
          }

          a {
            display: block;
            padding: 0.5rem;
            border-radius: 10px;
            color: var(--primary-font-color);
            text-decoration: none;
          }

          a:hover {
            color: var(--primary-font-color-hover);
          }

          :host {
            margin-bottom: 1rem;
            color: var(--primary-font-color);
            display: block;
          }

          .content {
            margin-left: 0.5rem;
            font-weight: 300;
          }

          :host(.active) {
            background: var(--header-background-hover);
          }
        </style>
        <a href=${`/docs/${this.framework}/${this.item.attributes.id}`}>
          <div>
            <strong>${this.item.attributes.section}</strong>
            <div class="content">
              ${this.item.body.substr(0, this.bodyLength) + '...'}
            </div>
          </div>
        </a>
      `
    );
  }

  updateActive() {
    if (this.active) {
      this.classList.add('active');
      if (this.role === 'option') this.setAttribute('aria-selected', 'true');
    } else {
      this.classList.remove('active');
      if (this.role === 'option') this.setAttribute('aria-selected', 'false');
    }
  }

  static get observedAttributes() {
    return ['role', 'bodylength', 'framework', 'active'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'bodylength') {
      this.bodyLength = Number(newValue);
      return;
    }
    if (name === 'active') {
      if (!this.hasAttribute('active')) return (this.active = false);
      this.active = newValue !== 'false';
      return;
    }
    this[name] = newValue;
  }
}

customElements.define('search-result', SearchResult);
