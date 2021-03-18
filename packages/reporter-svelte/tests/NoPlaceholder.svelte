<script>
  import { createForm } from 'felte';
  import { svelteReporter, ValidationMessage } from '../src';

  const { form } = createForm({
    onSubmit: jest.fn(),
    extend: svelteReporter,
    validate: jest.fn(() => ({
      test: 'An error message',
    })),
  });
</script>

<form use:form name="test-form">
  <label for="test">test</label>
  <input type="text" name="test" id="test">
  <ValidationMessage for="test" let:messages={message}>
    <span data-testid="validation-message">{message || ''}</span>
  </ValidationMessage>
</form>
