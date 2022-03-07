import { html, css, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { reporter } from '@felte/reporter-element';

import { prepareForm } from './felte-form';

type Data = {
  email: string;
  password: string;
};

@customElement('sign-in-form')
export class SignInForm extends LitElement {
  static styles = css`
    :host {
      --primary-color: rgb(255, 62, 0);
      --on-primary-color: #fffff9;
      --primary-color-hover: rgb(255, 113, 51);
      --error-color: #ff3a43;
      --primary-font-color: #fffff0;
      --header-background: #222222;
      --example-background: var(--header-background);
    }

    * {
      box-sizing: border-box;
    }

    h1,
    h2 {
      font-family: 'Cabin', sans-serif;
      margin: 1rem;
      font-weight: 700;
      line-height: 1.2;
    }

    p {
      margin: 1.5rem 0;
    }

    h1 {
      font-size: 2.1rem;
    }

    h2 {
      font-size: 1.8rem;
    }

    section {
      margin: 1rem;
      margin-top: 2rem;
    }

    input[type='email'],
    input[type='password'] {
      font-size: 1em;
      border: 1px solid #aaa;
      border-radius: 10px;
      padding: 0.3rem 1rem;
      background: var(--on-primary-color);
      height: 3rem;
      width: 18rem;
      color: black;
    }

    input[aria-invalid='true'] {
      border: 2px solid var(--error-color);
    }

    fieldset {
      width: 400px;
      border: 2px solid var(--primary-color);
      display: block;
      font-size: 1.2em;
      background: var(--example-background);
      padding: 2rem;
      border-radius: 10px 30px;
    }

    button {
      margin-top: 0.7em;
      font-size: 0.8em;
      font-weight: 700;
      padding: 0.7em;
      background: var(--primary-color);
      border-radius: 10px;
      border: none;
      color: var(--on-primary-color);
      transition: transform 0.1s;
    }

    button:not([aria-disabled='true']):hover {
      cursor: pointer;
      background: var(--primary-color-hover);
    }

    button:not([aria-disabled='true']):active {
      transform: scale(0.9);
    }

    button[aria-disabled='true'] {
      background: var(--primary-color-hover);
      cursor: not-allowed;
    }

    felte-validation-message::part(container) {
      color: var(--error-color);
      margin: 0;
      padding: 0;
    }

    label {
      display: block;
    }

    felte-validation-message::part(item) {
      list-style: disc inside;
    }
  `;

  @state()
  submitted?: Record<string, any>;

  // private destroy?: () => void;

  // connectedCallback() {
  //   super.connectedCallback();
  //   const { form } = createForm<Data>({
  //     onSubmit: (values) => {
  //       this.submitted = values;
  //     },
  //     validate(values) {
  //       const errors: { email: string[]; password: string[] } = {
  //         email: [],
  //         password: [],
  //       };
  //       if (!values.email) errors.email.push('Must not be empty');
  //       if (!/[a-zA-Z][^@]*@[a-zA-Z][^@.]*\.[a-z]{2,}/.test(values.email))
  //         errors.email.push('Must be a valid email');
  //       if (!values.password) errors.password.push('Must not be empty');
  //       return errors;
  //     },
  //     extend: [reporter],
  //   });

  //   setTimeout(() => {
  //     const formElement = this.renderRoot.querySelector(
  //       'form'
  //     ) as HTMLFormElement;
  //     const { destroy } = form(formElement);
  //     this.destroy = destroy;
  //   });
  // }

  // disconnectedCallback() {
  //   super.disconnectedCallback();
  //   this.destroy?.();
  // }

  connectedCallback() {
    super.connectedCallback();
    const config = {
      onSubmit: (values: Data) => {
        this.submitted = values;
      },
      validate(values: Data) {
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
    };
    prepareForm('signin', config);
  }

  render() {
    return html`
      <h1>Basic Example - Lit</h1>

      <template id="validation-message">
        <ul aria-live="polite" part="container">
          <li part="item" />
        </ul>
      </template>
      <felte-form id="signin">
        <form>
          <fieldset>
            <legend>Sign In</legend>
            <label for="email">Email:</label>
            <input type="email" name="email" id="email" />
            <felte-validation-message
              for="email"
              templateid="validation-message"
            >
            </felte-validation-message>
            <label for="password">Password:</label>
            <input type="password" name="password" id="password" />
            <felte-validation-message
              for="password"
              templateid="validation-message"
            >
            </felte-validation-message>
          </fieldset>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
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
