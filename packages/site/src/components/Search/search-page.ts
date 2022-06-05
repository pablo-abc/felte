import type { PropertyValues } from 'lit';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import * as FlexSearch from 'flexsearch';

import './search-results.ts';

@customElement('search-page')
export class SearchPage extends LitElement {
  static styles = css`
    search-results::part(option__link):focus-visible {
      outline: 3px solid var(--primary-color);
      outline-offset: 2px;
    }
    :host(.focus-visible) search-results::part(option__link):focus {
      outline: 3px solid var(--primary-color);
      outline-offset: 2px;
    }
  `;

  @property({ type: Object })
  items: any[] = [];

  @property()
  framework = '';

  @state()
  searchValue = '';

  @state()
  foundItems: any[] = [];

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
  }

  connectedCallback() {
    super.connectedCallback();
    this.doc = new FlexSearch.Document({
      tokenize: 'forward',
      document: {
        index: ['attributes:section', 'body'],
      } as any,
    });
    this.searchable.forEach((item) => {
      this.doc.add(item);
    });
  }

  willUpdate(changed: PropertyValues<this>) {
    const qs = document.location.search;
    const query = new URLSearchParams(qs);
    this.searchValue = query.get('q');
    if (changed.has('searchValue')) {
      this.search();
    }
  }

  render() {
    return html`
      ${this.searchValue
        ? html`
      <h1>Search for: <em>${this.searchValue}</em></h2>
      <search-results
        id="search-results"
        framework=${this.framework}
        .foundItems=${this.foundItems}
        bodylength=${200}
        ></search-results>
           `
        : html` <p>Go on, search something!</p> `}
    `;
  }
}
