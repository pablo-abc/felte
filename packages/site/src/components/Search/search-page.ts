import { html, render } from 'uhtml';
import * as FlexSearch from 'flexsearch';

import './search-results.ts';

export class SearchPage extends HTMLElement {
  [key: string]: unknown;

  items: any[] = [];
  framework = '';

  #searchValue = '';
  set searchValue(value: string) {
    if (value === this.#searchValue) return;
    this.#searchValue = value || '';
    this.search();
  }

  get searchValue() {
    return this.#searchValue;
  }

  #foundItems: any[] = [];
  set foundItems(value: any[]) {
    this.#foundItems = value;
  }

  get foundItems() {
    return this.#foundItems;
  }

  get searchResult() {
    return this.shadowRoot!.querySelector('#search-results');
  }

  get searchable() {
    return this.items.map((item, index) => {
      const body = item.body
        .split('\n')
        .slice(1)
        .join('\n')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/```.*/g, '')
        .replace(/> /g, '')
        .replace(/#+ /g, '')
        .replace(/__?([^_]+)__?/g, '$1')
        .replace(/\*\*?([^*]+)\*\*?/g, '$1');
      return {
        ...item,
        id: index,
        body,
      };
    });
  }

  doc!: FlexSearch.Document<any>;

  search() {
    const found = this.doc.search(this.searchValue, { limit: 4 });
    if (found.length > 0) {
      const foundSet = new Set();
      for (const f of found) {
        f.result.forEach((r) => foundSet.add(r));
      }
      this.foundItems = Array.from(foundSet).map((f) => {
        return this.searchable[f as any];
      });
    } else this.foundItems = [];

    this.update();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const qs = document.location.search;
    const query = new URLSearchParams(qs);
    this.update();
    this.doc = new FlexSearch.Document({
      tokenize: 'forward',
      document: {
        index: ['attributes:section', 'body'],
      } as any,
    });
    this.searchable.forEach((item) => {
      this.doc.add(item);
    });
    this.searchValue = query.get('q');
  }

  static get observedAttributes() {
    return ['framework', 'items'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'items') {
      this.items = newValue ? JSON.parse(newValue) : [];
      return;
    }
    this[name] = newValue;
  }

  update() {
    render(
      this.shadowRoot!,
      html`
        <style>
          search-results::part(option__link):focus-visible {
            outline: 3px solid var(--primary-color);
            outline-offset: 2px;
          }
          :host(.focus-visible) search-results::part(option__link):focus {
            outline: 3px solid var(--primary-color);
            outline-offset: 2px;
          }
        </style>
        ${this.searchValue
          ? html`
      <h1>Search for: <em>${this.searchValue}</em></h2>
        <search-results
      id="search-results"
      framework=${this.framework}
        .foundItems=${this.foundItems}
        .bodyLength=${200}
        ></search-results>
           `
          : html` <p>Go on, search something!</p> `}
      `
    );
  }
}

customElements.define('search-page', SearchPage);
