<script>
  import { createForm } from 'felte';
  import { reporter, ValidationMessage } from '../src';

  const { form } = createForm({
    onSubmit: jest.fn(),
    extend: reporter,
    validate: jest.fn(() => ({
      multiple: {
        test: new Array(3).fill('An error message'),
      },
    })),
  });
</script>

<form use:form name="test-form">
  <fieldset name="multiple">
    {#each [0, 1, 2] as index}
      <label>
        test
        <input type="text" name="multiple.test.{index}">
      </label>
      <ValidationMessage for="multiple.test.{index}" let:messages={message}>
        <span data-testid="validation-message-{index}">{message || ''}</span>
      </ValidationMessage>
    {/each}
  </fieldset>
</form>
