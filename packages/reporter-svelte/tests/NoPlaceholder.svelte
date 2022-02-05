<script>
  import * as sinon from 'sinon';
  import { createForm } from 'felte';
  import { reporter } from '../src/index.js';
  import ValidationMessage from '../src/ValidationMessage.svelte';

  const { form } = createForm({
    onSubmit: sinon.fake(),
    extend: reporter,
    validate: sinon.fake(() => ({
      test: 'An error message',
    })),
    warn: sinon.fake(() => ({
      test: 'A warning message',
    })),
  });
</script>

<form use:form name="test-form">
  <label for="test">test</label>
  <input type="text" name="test" id="test">
  <ValidationMessage for="test" let:messages={message}>
    <span data-testid="validation-message">{message || ''}</span>
  </ValidationMessage>
  <ValidationMessage level="warning" for="test" let:messages={message}>
    <span data-testid="warning-message">{message || ''}</span>
  </ValidationMessage>
</form>
