<script>
  import { createForm } from 'felte';
  import reporter from '@felte/reporter-tippy';
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
    extend: [validator, reporter()],
    validateSchema: schema,
  });
</script>

<form use:form>
  <label>
    <span>Email:</span>
    <input name="email" type="email">
  </label>
  <label>
    <span>Password:</span>
    <input name="password" type="password">
  </label>
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

  label {
    margin-bottom: 1.5rem;
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
</style>
