<script>
  import * as sinon from 'sinon';
  import { createForm } from 'felte';
  import { reporter } from '../src/index.js';
  import ValidationMessage from '../src/ValidationMessage.svelte';

  const { form } = createForm({
    onSubmit: sinon.fake(),
    extend: reporter,
    validate: sinon.fake(() => ({
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
