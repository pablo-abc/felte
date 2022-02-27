import { useState } from 'react';
import { useForm } from '@felte/react';
import { ValidationMessage, reporter } from '@felte/reporter-react';

type Data = {
  email: string;
  password: string;
};

function App() {
  const [submitted, setSubmitted] = useState<Data>();
  const { form } = useForm<Data>({
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
      <h1>Basic Example - React</h1>
      <form ref={form}>
        <fieldset>
          <legend>Sign In</legend>
          <label htmlFor="email">Email:</label>
          <input type="email" name="email" id="email" />
          <ValidationMessage for="email" as="ul" aria-live="polite">
            {(messages) => messages?.map((message) => <li>* {message}</li>)}
          </ValidationMessage>
          <label htmlFor="password">Password:</label>
          <input type="password" name="password" id="password" />
          <ValidationMessage for="password" as="ul" aria-live="polite">
            {(messages) => messages?.map((message) => <li>* {message}</li>)}
          </ValidationMessage>
        </fieldset>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
      {submitted && (
        <section>
          <h2>Submitted values</h2>
          <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}

export default App;
