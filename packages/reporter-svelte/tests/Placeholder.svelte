<script>
  import { createForm } from 'felte';
  import { svelteReporter, ValidationMessage } from '../src';

  const { form } = createForm({
    onSubmit: jest.fn(),
    extend: svelteReporter,
    validate: jest.fn(() => ({})),
  });
</script>

<form use:form name="test-form">
  <label for="test">test</label>
  <input type="text" name="test" id="test">
  <ValidationMessage for="test">
    <span></span>
    <span data-testid="placeholder" slot="placeholder">Placeholder text</span>
  </ValidationMessage>
</form>
