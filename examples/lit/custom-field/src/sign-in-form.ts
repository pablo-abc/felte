import { html, LitElement, nothing } from 'lit';
import { customElement, state, queryAll } from 'lit/decorators.js';
import { reporter } from '@felte/reporter-element';
import { prepareForm } from '@felte/element';
import styles from './sign-in-form.styles';

type Data = {
  email: string;
  password: string;
};

/**
 * Firefox does not handle focus well on contenteditable divs
 * that are within a shadow root. This fixes the issue by
 * adding/removing the `contenteditable` attribute depending
 * on if the field is focused or not.
 *
 * It's probably better to delegate this event higher up the tree,
 * but this works for the purpose of this example.
 */
function handleFocus(e: Event) {
  const target = e.target as HTMLDivElement;
  target.setAttribute('contenteditable', '');
}

function handleBlur(e: Event) {
  const target = e.target as HTMLDivElement;
  target.removeAttribute('contenteditable');
}

@customElement('sign-in-form')
export class SignInForm extends LitElement {
  static styles = styles;

  @state()
  submitted?: Data;

  handleReset() {
    this.submitted = undefined;
  }

  @queryAll('div[role="textbox"]')
  fields!: NodeListOf<HTMLDivElement>;

  /**
   * Running `prepareForm` on `connectedCallback` allows us to guarantee
   * we set the configuration before the form loads.
   * `prepareForm` does nothing if the form has already loadad.
   *
   * If you need to change the form's configuration after load,
   * use `HTMLFelteFormElement.setConfiguration`.
   */
  connectedCallback() {
    super.connectedCallback();
    prepareForm<Data>('signin', {
      onSubmit: (values) => {
        this.submitted = values;
      },
      validate(values) {
        const errors: { email: string[]; password: string[] } = {
          email: [],
          password: [],
        };
        if (!values.email) errors.email.push('Must not be empty');
        if (!/[a-zA-Z][^@]*@[a-zA-Z][^@.]*\.[a-z]{2,}/.test(values.email))
          errors.email.push('Must be a valid email');
        if (!values.password) errors.password.push('Must not be empty');
        return errors;
      },
      extend: [reporter],
    });
  }

  firstUpdated() {
    this.fields.forEach((field) => {
      field.addEventListener('focusin', handleFocus);
      field.addEventListener('focusout', handleBlur);
    });
  }

  disconnectedCallback() {
    this.fields.forEach((field) => {
      field.removeEventListener('focusin', handleFocus);
      field.removeEventListener('focusout', handleBlur);
    });
  }

  handleEnter(e: KeyboardEvent) {
    const target = e.target as HTMLDivElement;
    if (e.key !== 'Enter' || !target.contentEditable) return;
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFelteFormElement;
    currentTarget.submit();
  }

  render() {
    return html`
      <h1>Custom Field Example - Lit</h1>

      <template id="validation-message">
        <ul aria-live="polite">
          <li data-part="item"></li>
        </ul>
      </template>
      <felte-form
        id="signin"
        @reset=${this.handleReset}
        @keydown=${this.handleEnter}
      >
        <form>
          <fieldset>
            <legend>Sign In</legend>
            <div id="email-label">Email:</div>
            <felte-field name="email" valueprop="textContent">
              <div
                aria-labelledby="email-label"
                id="email"
                tabindex="0"
                role="textbox"
              ></div>
            </felte-field>
            <felte-validation-message
              for="email"
              templateid="validation-message"
            >
            </felte-validation-message>
            <div id="password-label">Password:</div>
            <felte-field name="password" valueprop="textContent">
              <div
                aria-labelledby="password-label"
                id="password"
                tabindex="0"
                role="textbox"
              ></div>
            </felte-field>
            <felte-validation-message
              for="password"
              templateid="validation-message"
            ></felte-validation-message>
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      </felte-form>
      ${this.submitted
        ? html`
            <section>
              <h2>Submitted:</h2>
              <pre>${JSON.stringify(this.submitted, null, 2)}</pre>
            </section>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sign-in-form': SignInForm;
  }
}
