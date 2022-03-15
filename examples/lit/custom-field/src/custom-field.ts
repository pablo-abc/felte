/**
 * Tabbing to the `contenteditable` element puts the caret
 * at the beginning of the container. This function moves
 * it to the end.
 */
function moveCaretToEnd(element: CustomField) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function handleFocus(e: Event) {
  const target = e.target as CustomField;
  target.setAttribute('contenteditable', '');
  moveCaretToEnd(target);
}

function handleBlur(e: Event) {
  const target = e.target as CustomField;
  target.removeAttribute('contenteditable');
}

/**
 * Firefox does not handle focus well on contenteditable divs
 * that are within a shadow root. This fixes the issue by using
 * a custom element that adds the `contenteditable` attribute
 * on focus and removes it on blur.
 */
export class CustomField extends HTMLElement {
  constructor() {
    super();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'textbox');
    this.style.display = 'block';
    this.style.cursor = 'text';
  }

  get value() {
    return this.innerText;
  }

  set value(value: string) {
    this.innerText = value || '';
  }

  connectedCallback() {
    this.addEventListener('focusin', handleFocus);
    this.addEventListener('focusout', handleBlur);
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', handleFocus);
    this.removeEventListener('focusout', handleBlur);
  }
}

customElements.define('custom-field', CustomField);
