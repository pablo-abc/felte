<script>
  import * as sinon from 'sinon';
  import { createForm } from 'felte';
  import { reporter } from '../src/index.js';
  import ValidationMessage from '../src/ValidationMessage.svelte';

  const { form } = createForm({
    onSubmit: sinon.fake(),
    extend: reporter,
    validate: sinon.fake(() => ({})),
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
