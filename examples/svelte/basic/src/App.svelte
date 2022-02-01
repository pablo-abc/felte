<script lang="ts">
  import { createForm } from 'felte';
  import { ValidationMessage, reporter } from '@felte/reporter-svelte';

  type Data = {
    email: string;
    password: string;
  }

  let submitted: Data | undefined;

  const { form } = createForm<Data>({
    onSubmit(values) {
      submitted = values;
    },
    validate(values) {
      const errors: { email: string[], password: string[] } = { email: [], password: [] };
      if (!values.email) errors.email.push('Must not be empty');
      if (!/[a-zA-Z][^@]*@[a-zA-Z][^@.]*\.[a-z]{2,}/.test(values.email) ) errors.email.push('Must be a valid email');
      if (!values.password) errors.password.push('Must not be empty');
      return errors;
    },
    extend: [reporter],
  });
</script>

<main>
  <h1>Basic Example - Svelte</h1>
  <form use:form>
    <fieldset>
      <legend>Sign In</legend>
      <label for="email">Email:</label>
      <input type="email" name="email" id="email" />
      <ValidationMessage for="email" let:messages={messages}>
        <ul aria-live="polite">
          {#each messages ?? [] as message}
            <li>* {message}</li>
          {/each}
        </ul>
      </ValidationMessage>
      <label for="password">Password:</label>
      <input type="password" name="password" id="password" />
      <ValidationMessage for="password" let:messages={messages}>
        <ul aria-live="polite">
          {#each messages ?? [] as message}
            <li>* {message}</li>
          {/each}
        </ul>
      </ValidationMessage>
    </fieldset>
    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
  </form>
  {#if submitted}
    <section>
      <h2>Submitted values</h2>
      <pre>{JSON.stringify(submitted, null, 2)}</pre>
    </section>
  {/if}
</main>
