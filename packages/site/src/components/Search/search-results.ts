import { html, render } from 'uhtml';

export class SearchResults extends HTMLElement {
  [key: string]: unknown;
  isListbox = false;
  framework = '';
  #bodyLength = 60;

  set bodyLength(value: number) {
    this.#bodyLength = value;
    this.update();
  }

  get bodyLength() {
    return this.#bodyLength;
  }

  #foundItems: any[] = [];
  set foundItems(value: any[]) {
    this.#foundItems = value;
    this.update();
  }

  get foundItems() {
    return this.#foundItems;
  }

  #activeDescendant = '';
  set activeDescendant(value: string) {
    this.#activeDescendant = value;
    this.update();
  }

  get activeDescendant() {
    return this.#activeDescendant;
  }

  static get observedAttributes() {
    return ['islistbox', 'bodylength', 'framework'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'islistbox') {
      if (!this.hasAttribute('islistbox')) this.isListbox = false;
      else this.isListbox = newValue !== 'false';
    } else {
      this[name] = newValue;
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.foundItems = [];
  }

  deactivate() {
    this.dispatchEvent(new CustomEvent('deactivate'));
  }

  connectedCallback() {
    this.setAttribute('role', this.isListbox ? 'listbox' : 'list');
    this.addEventListener('mouseleave', this.deactivate.bind(this));
    this.update();
  }

  disconnectedCallback() {
    this.removeEventListener('mouseleave', this.deactivate);
  }

  update() {
    render(
      this.shadowRoot!,
      html`
        <style>
          :host {
            list-style: none;
            color: var(--primary-font-color);
          }

          strong {
            font-size: 1.2rem;
            padding: 1rem;
          }

          .active {
            background: var(--header-background-hover);
          }
        </style>
        ${this.foundItems.length >= 1
          ? this.foundItems.map((item) => {
              return html.for(item)/* HTML */ `
                <search-result
                  part="option"
                  role=${this.isListbox ? 'option' : undefined}
                  framework=${this.framework}
                  .bodyLength=${this.bodyLength}
                  .item=${item}
                  .active=${this.activeDescendant ===
                  `result-${item.attributes.section}`}
                ></search-result>
              `;
            })
          : ''}
        ${this.foundItems.length === 0
          ? html`
              <li
                class=${this.activeDescendant === 'nothing-found-search'
                  ? 'active'
                  : ''}
                id="nothing-found-search"
                part="option"
                data-combobox-option
                role=${this.isListbox ? 'option' : undefined}
                aria-selected=${this.isListbox
                  ? this.activeDescendant === 'nothing-found-search'
                  : undefined}
              >
                <strong>Nothing found :(</strong>
              </li>
            `
          : ''}
      `
    );
  }
}

customElements.define('search-results', SearchResults);
