import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('search-results')
export class SearchResults extends LitElement {
  [key: string]: unknown;

  static styles = css`
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

    li {
      margin-bottom: 1rem;
      color: var(--primary-font-color);
      display: block;
    }

    .content {
      margin-left: 0.5rem;
      font-weight: 300;
    }

    li.active {
      background: var(--header-background-hover);
    }
  `;

  @property({ type: Boolean })
  isListbox = false;

  @property()
  framework = '';

  @property({ type: Number })
  bodyLength = 60;

  @property({ type: Object })
  foundItems: any[] = [];

  @property()
  activeDescendant = '';

  deactivate() {
    this.dispatchEvent(new CustomEvent('deactivate'));
  }

  activate(e: Event) {
    e.target.dispatchEvent(
      new CustomEvent('activate', {
        bubbles: true,
        composed: true,
      })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', this.isListbox ? 'listbox' : 'list');
    this.addEventListener('mouseleave', this.deactivate.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mouseleave', this.deactivate);
  }

  render() {
    return html`
      ${this.foundItems.length >= 1
        ? this.foundItems.map((item) => {
            const isActive =
              this.activeDescendant === `result-${item.attributes.section}`;
            return html`
              <li
                class=${isActive ? 'active' : ''}
                aria-selected=${this.isListbox ? String(isActive) : null}
                data-combobox-option
                role=${this.isListbox ? 'option' : undefined}
                part="option"
                id=${`result-${item.attributes.section}`}
                @mouseenter=${this.activate}
              >
                <a
                  part="option__link"
                  href=${`/docs/${this.framework}/${item.attributes.id}`}
                >
                  <div>
                    <strong>${item.attributes.section}</strong>
                    <div class="content">
                      ${item.body.substr(0, this.bodyLength) + '...'}
                    </div>
                  </div>
                </a>
              </li>
            `;
          })
        : nothing}
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
        : nothing}
    `;
  }
}
