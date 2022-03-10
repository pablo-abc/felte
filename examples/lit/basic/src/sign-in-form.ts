import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { reporter } from '@felte/reporter-element';
import { prepareForm } from '@felte/element';
import styles from './sign-in-form.styles';

type Data = {
  email: string;
  password: string;
};

@customElement('sign-in-form')
export class SignInForm extends LitElement {
  static styles = styles;

  @state()
  submitted?: Data;

  handleReset() {
    this.submitted = undefined;
  }

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

  render() {
    return html`
      <h1>Basic Example - Lit</h1>

      <template id="validation-message">
        <ul aria-live="polite" part="container">
          <li part="item"></li>
        </ul>
      </template>
      <felte-form id="signin" @reset=${this.handleReset}>
        <form>
          <fieldset>
            <legend>Sign In</legend>
            <label for="email">Email:</label>
            <input type="email" name="email" id="email" />
            <felte-validation-message
              for="email"
              templateid="validation-message"
            ></felte-validation-message>
            <label for="password">Password:</label>
            <input type="password" name="password" id="password" />
            <felte-validation-message
              for="password"
              templateid="validation-message"
            ></felte-validation-message>
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
