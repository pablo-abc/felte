import { LitElement, html, css, svg } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import type { Instance as TippyInstance } from 'tippy.js';
import tippy from 'tippy.js';

@customElement('copy-button')
export class CopyButton extends LitElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: 1rem;
      right: 1rem;
      border-radius: 10px;
    }

    button {
      background: transparent;
      border: none;
      font-size: 1rem;
      height: 42px;
      width: 42px;
      border-radius: 10px;
      padding: 6px;
      color: #fffff0;
      cursor: pointer;
    }

    button:focus {
      outline: none;
    }

    button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    button:active {
      background: rgba(255, 255, 255, 0.5);
    }
  `;

  @property()
  text = '';

  @state()
  copied = false;

  @query('button')
  button!: HTMLButtonElement;

  instance?: TippyInstance;

  handleClick() {
    // eslint-disable-next-line compat/compat
    navigator.clipboard.writeText(this.text).then(() => {
      this.copied = true;
      this.instance.setContent('Copied!');
      this.instance.show();
      setTimeout(() => {
        this.copied = false;
        this.instance?.setContent('Copy to clipboard');
      }, 500);
    });
  }

  firstUpdated() {
    this.instance = tippy(this.button, {
      content: 'Copy to clipboard',
      placement: 'left',
    });
  }

  renderSvg() {
    if (this.copied)
      return svg/* HTML */ `
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        ></path>
      `;
    return svg/* HTML */ `
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
      ></path>
    `;
  }

  render() {
    return html`
      <button
        @click=${this.handleClick}
        type="button"
        aria-label="Copy to clipboard"
      >
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          ${this.renderSvg()}
        </svg>
      </button>
    `;
  }
}
