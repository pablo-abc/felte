<script>
  import { createForm } from 'felte';
  import { reporter, ValidationMessage } from '../src';

  const { form } = createForm({
    onSubmit: jest.fn(),
    extend: reporter,
    validate: jest.fn(() => ({
      test: 'An error message',
    })),
    warn: jest.fn(() => ({
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
