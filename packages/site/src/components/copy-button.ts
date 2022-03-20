import type { Instance as TippyInstance } from 'tippy.js';
import tippy from 'tippy.js';

const template = document.createElement('template');

template.innerHTML = /* HTML */ `
  <style>
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
  </style>
  <button type="button" aria-label="Copy to clipboard"></button>
`;

const copySvg = /* HTML */ `
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
    ></path>
  </svg>
`;

const copiedSvg = /* HTML */ `
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
`;

export class CopyButton extends HTMLElement {
  text = '';

  button!: HTMLButtonElement;

  copied = false;

  instance?: TippyInstance;

  handleClick() {
    navigator.clipboard.writeText(this.text).then(() => {
      this.copied = true;
      this.button.innerHTML = copiedSvg;
      this.instance.setContent('Copied!');
      this.instance.show();
      setTimeout(() => {
        this.copied = false;
        this.button.innerHTML = copySvg;
        this.instance?.setContent('Copy to clipboard');
      }, 500);
    });
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    const content = template.content.cloneNode(true);
    this.shadowRoot!.appendChild(content);
    this.button = this.shadowRoot!.querySelector('button');
    this.button.innerHTML = copySvg;
    this.instance = tippy(this.button, {
      content: 'Copy to clipboard',
      placement: 'left',
    });
    this.button.addEventListener('click', this.handleClick.bind(this));
  }

  disconnectedCallback() {
    this.button.addEventListener('click', this.handleClick.bind(this));
  }

  static get observedAttributes() {
    return ['text'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'text') this.text = newValue;
  }
}

customElements.define('copy-button', CopyButton);
