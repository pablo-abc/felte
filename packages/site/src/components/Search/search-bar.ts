import type { PropertyValues } from 'lit';
import { LitElement, html, css } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import type { Instance as TippyInstance } from 'tippy.js';
import tippy from 'tippy.js';
import * as FlexSearch from 'flexsearch';

import './search-results.ts';

export const tagName = 'search-bar';

@customElement(tagName)
export class SearchBar extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    :host(.focus-visible) *:focus {
      outline: 3px solid var(--primary-color);
      outline-offset: 2px;
    }

    input:focus {
      outline: 3px solid var(--primary-color);
      outline-offset: 2px;
    }

    *:focus {
      outline: none;
    }

    .sr-only {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }

    #tippy-content {
      visibility: hidden;
    }

    #tippy-content search-results::part(option) {
      padding: 0.5rem 1rem;
      margin-bottom: 0;
    }

    #tippy-content *:focus {
      outline: none;
    }

    #tippy-content.mounted {
      visibility: visible;
    }

    form {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1em;
      border: 1px solid #aaa;
      border-radius: 10px;
      background: var(--on-primary-color);
      height: 3rem;
      width: 100%;
    }

    form .tippy-box {
      background: var(--primary-background);
      border: 2px solid var(--primary-color);
    }

    form .tippy-content {
      padding: 0;
    }

    input {
      background: transparent;
      border: none;
      width: 100%;
      font-size: 1em;
    }

    button[type='submit'] {
      color: #555;
      height: 100%;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      border-radius: 0 9px 9px 0;
      transition: background 0.1s;
      cursor: pointer;
      border: none;
      background: transparent;
    }

    button[type='submit'][aria-disabled='true'] {
      cursor: not-allowed;
    }

    button.clear {
      display: none;
      height: 100%;
      padding: 0.2rem;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    button.clear svg {
      height: 1rem;
      width: 1rem;
    }

    button.clear.visible {
      display: flex;
      align-items: center;
      color: #555;
    }

    button:hover {
      background: #ddd;
    }

    svg {
      height: 2rem;
      width: 2rem;
    }

    #search-bar {
      padding-left: 0.5rem;
      height: 100%;
      border-radius: 10px 0 0 10px;
      cursor: text;
    }

    .search-input {
      flex: 1;
      height: 100%;
      border-radius: 10px 0 0 10px;
    }

    input::-webkit-search-cancel-button {
      -webkit-appearance: none;
      display: none;
    }

    input::-webkit-search-decoration {
      -webkit-appearance: none;
    }
  `;

  @property({ type: Object })
  items: any[] = [];

  @property()
  framework = '';

  activeIndex: number | undefined = undefined;
  descendants: any[] = [];
  tippyInstance!: TippyInstance;

  @state()
  a11yStatus = '';

  @state()
  expanded = false;

  @state()
  searchValue = '';

  @state()
  activeDescendant = '';

  @state()
  foundItems: any[] = [];

  @query('form')
  formElement!: HTMLFormElement;

  @query('input')
  searchInput!: HTMLInputElement;

  @query('#search-results')
  searchResult!: HTMLElement;

  @query('#tippy-content')
  tippyContent!: HTMLElement;

  willUpdate(changed: PropertyValues<this>) {
    if (changed.has('searchValue') && this.searchInput) {
      this.searchInput.value = this.searchValue || '';
      this.search();
    }
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('expanded')) {
      if (this.expanded) {
        this.tippyInstance.show();
        setTimeout(() => {
          const options =
            this.searchResult?.shadowRoot.querySelectorAll(
              '[data-combobox-option]'
            ) || [];
          this.descendants = Array.from(options);
        });
      } else this.tippyInstance.hide();
    }
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

  clear() {
    this.searchValue = '';
  }

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

    if (this.searchValue.length < 3) {
      this.expanded = false;
    } else {
      this.expanded = true;
    }
  }

  handleInput() {
    this.activeIndex = undefined;
    this.activeDescendant = undefined;
    this.searchValue = this.searchInput.value;
  }

  blurTimeout?: NodeJS.Timeout;

  handleBlur() {
    if (this.blurTimeout) clearTimeout(this.blurTimeout);
    this.blurTimeout = setTimeout(() => {
      this.tippyInstance.hide();
    }, 1000);
  }

  handleArrowKeys(event: KeyboardEvent) {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    if (this.searchValue.length < 3) return;
    event.preventDefault();
    if (!this.expanded) this.expanded = true;
    if (event.key === 'ArrowDown') {
      if (this.activeIndex == null) this.activeIndex = 0;
      else if (this.activeIndex >= this.descendants.length - 1)
        this.activeIndex = 0;
      else this.activeIndex += 1;
      if (this.activeIndex == null) this.activeDescendant = undefined;
      else this.activeDescendant = this.descendants[this.activeIndex].id;
    }
    if (event.key === 'ArrowUp') {
      if (this.activeIndex == null)
        this.activeIndex = this.descendants.length - 1;
      else if (this.activeIndex <= 0)
        this.activeIndex = this.descendants.length - 1;
      else this.activeIndex -= 1;
      if (this.activeIndex == null) this.activeDescendant = undefined;
      else this.activeDescendant = this.descendants[this.activeIndex].id;
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key !== '/' && event.key !== 'Escape') return;
    if (event.key === 'Escape' && this.expanded) {
      this.expanded = false;
      this.activeIndex = undefined;
      this.activeDescendant = undefined;
      this.clear();
      return;
    }
    if (document.activeElement === this.searchInput) return;
    event.preventDefault();
    this.searchInput.focus();
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    if (this.searchValue.length === 0) return;
    if (this.activeDescendant) {
      const target = this.descendants[this.activeIndex];
      const href = target.querySelector('a').href;
      window.location = href;
    } else {
      window.location =
        `/docs/${this.framework}/search?q=${this.searchValue}` as any;
    }
    this.clear();
  }

  handleActivate(e: Event) {
    const target = e.composedPath()[0] as HTMLElement;
    this.activeDescendant = target.id;
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = undefined;
    }
  }

  handleDeactivate() {
    this.activeDescendant = undefined;
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

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  firstUpdated() {
    this.tippyInstance = tippy(this.searchInput, {
      content: this.tippyContent,
      onClickOutside: () => {
        this.expanded = false;
        this.activeIndex = undefined;
        this.activeDescendant = undefined;
      },
      onHide: () => {
        this.expanded = false;
        this.activeIndex = undefined;
        this.activeDescendant = undefined;
      },
      role: null,
      trigger: 'manual',
      interactive: true,
      arrow: false,
      placement: 'bottom',
      appendTo: this.formElement,
      animation: false,
      aria: {
        expanded: null,
      },
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  render() {
    return html`
      <span class="sr-only" aria-live="polite" role="status" aria-atomic="true">
        ${this.a11yStatus}
      </span>
      <form
        role="search"
        aria-haspopup="listbox"
        aria-expanded=${this.expanded}
        aria-owns="search-results"
        aria-controls="search-results"
        action=${`/docs/${this.framework}/search`}
        @submit=${this.handleSubmit}
      >
        <span class="search-input">
          <label class="sr-only" for="search-bar">Search documentation </label>
          <input
            name="q"
            autocomplete="off"
            aria-autocomplete="list"
            aria-activedescendant=${this.activeDescendant || ''}
            @input=${this.handleInput}
            @keydown=${this.handleArrowKeys}
            @blur=${this.handleBlur}
            id="search-bar"
            type="search"
            placeholder="Search docs ( / )"
          />
        </span>
        <button
          type="button"
          @click=${this.clear}
          class=${this.searchValue ? 'visible clear' : 'clear'}
        >
          <span class="sr-only">Clear search</span>
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <button type="submit" aria-disabled=${this.searchValue.length === 0}>
          <span class="sr-only">Search</span>
          <svg
            role="img"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            height="24"
            width="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </button>
      </form>
      <div
        id="tippy-content"
        class="search-result"
        class=${this.tippyInstance ? 'mounted' : ''}
      >
        <search-results
          tabindex="-1"
          id="search-results"
          isListbox
          framework=${this.framework}
          .foundItems=${this.foundItems}
          .activeDescendant=${this.activeDescendant}
          @deactivate=${this.handleDeactivate}
          @activate=${this.handleActivate}
        ></search-results>
      </div>
    `;
  }
}
