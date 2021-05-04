<script>
  import { createForm } from 'felte';
  import { svelteReporter, ValidationMessage } from '../src';

  const { form } = createForm({
    onSubmit: jest.fn(),
    extend: svelteReporter,
    validate: jest.fn(() => ({
      test: new Array(3).fill('An error message'),
    })),
  });
</script>

<form use:form name="test-form">
  {#each [0, 1, 2] as index}
    <label>
      test
      <input data-felte-index="{index}" type="text" name="test">
    </label>
    <ValidationMessage index="{index}" for="test" let:messages={message}>
      <span data-testid="validation-message-{index}">{message || ''}</span>
    </ValidationMessage>
  {/each}
</form>
