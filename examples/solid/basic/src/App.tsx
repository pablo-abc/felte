import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { Index, Show } from 'solid-js/web';
import { createForm } from '@felte/solid';
import { ValidationMessage, reporter } from '@felte/reporter-solid';

type Data = {
  email: string;
  password: string;
};

const App: Component = () => {
  const [submitted, setSubmitted] = createSignal<Data>();

  const { form } = createForm<Data>({
    onSubmit(values) {
      setSubmitted(values);
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
  return (
    <main>
      <h1>Basic Example - Solid</h1>
      <form ref={form}>
        <fieldset>
          <legend>Sign In</legend>
          <label for="email">Email:</label>
          <input type="email" name="email" id="email" />
          <ValidationMessage for="email">
            {(messages) => (
              <ul aria-live="polite">
                <Index each={messages ?? []}>
                  {(message) => <li>* {message}</li>}
                </Index>
              </ul>
            )}
          </ValidationMessage>
          <label for="password">Password:</label>
          <input type="password" name="password" id="password" />
          <ValidationMessage for="password">
            {(messages) => (
              <ul aria-live="polite">
                <Index each={messages ?? []}>
                  {(message) => <li>* {message}</li>}
                </Index>
              </ul>
            )}
          </ValidationMessage>
        </fieldset>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
      <Show when={submitted()}>
        <section>
          <h2>Submitted values</h2>
          <pre>{JSON.stringify(submitted(), null, 2)}</pre>
        </section>
      </Show>
    </main>
  );
};

export default App;
