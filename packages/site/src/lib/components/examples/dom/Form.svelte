<script>
  import { createForm } from 'felte';
  import reporter from '@felte/reporter-dom';
  import { validator } from '@felte/validator-yup';
  import * as yup from 'yup';

  const schema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  });

  const { form } = createForm({
    onSubmit: () => {
      throw {
        password: 'This password already exists',
      };
    },
    onError: error => error,
    extend: [validator, reporter({ single: true })],
    validateSchema: schema,
  });
</script>

<form use:form>
  <label>
    <span>Email:</span>
    <input name="email" type="email" aria-describedby="email-validation-dom">
  </label>
  <div id="email-validation-dom" data-felte-reporter-dom-for="email" />
  <label>
    <span>Password:</span>
    <input name="password" type="password" aria-describedby="password-validation-dom">
  </label>
  <div id="password-validation-dom" data-felte-reporter-dom-for="password" />
  <button type="submit">Fail to sign in</button>
</form>

<style>
  form {
    display: inline-block;
    font-size: 1.2em;
    background: var(--example-background);
    padding: 2rem;
    border-radius: 10px 30px;
  }

  label, input {
    display: block;
  }

  label span {
    font-weight: 700;
    margin-top: 0.7em;
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

  button:hover {
    background: var(--primary-color-hover);
  }

  button:active {
    transform: scale(0.9);
  }

  [data-felte-reporter-dom-for] {
    min-height: 1.5rem;
    font-size: 1rem;
    color: var(--error-color);
  }
</style>
