<script>
  import { createForm } from 'felte';
  import { svelteReporter as reporter, ValidationMessage } from '@felte/reporter-svelte';
  import { checkPerKey, string, not, emptyString, email, enUS, object } from 'bueno';

  const { form } = createForm({
    onSubmit: () => {
      throw {
        password: 'This password already exists',
      };
    },
    onError: error => error,
    extend: reporter,
    validate: (values) => {
      return checkPerKey(
        values,
        object({
          email: string(email),
          password: string(not(emptyString)),
        }),
        enUS,
      );
    },
  });
</script>

<form use:form>
  <label>
    <span>Email:</span>
    <input id="email-svelte" name="email" type="email" aria-describedby="email-validation-svelte">
  </label>
  <ValidationMessage for="email-svelte" let:messages={message}>
    <span id="email-validation-svelte" class="validation-message" aria-live="polite">
      {message}
    </span>
    <span slot="placeholder" id="email-validation-svelte" class="validation-message" />
  </ValidationMessage>
  <label>
    <span>Password:</span>
    <input id="password-svelte" name="password" type="password" aria-describedby="password-validation-svelte">
  </label>
  <ValidationMessage for="password-svelte" let:messages={message}>
    <span id="password-validation-svelte" class="validation-message" aria-live="polite">
      {message || ''}
    </span>
  </ValidationMessage>
  <button type="submit">Fail to sign in</button>
</form>

<style>
  form {
    display: inline-block;
    font-size: 1.2em;
    background: rgba(255, 62, 0, 0.2);
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

  .validation-message {
    display: block;
    min-height: 1.5rem;
    font-size: 1rem;
    color: red;
  }
</style>
