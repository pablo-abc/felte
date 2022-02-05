import chaiDom from 'chai-dom';
import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import { render, screen, waitFor, cleanup } from '@testing-library/svelte';
import NoPlaceholder from './NoPlaceholder.svelte';
import Placeholder from './Placeholder.svelte';
import Multiple from './Multiple.svelte';
use(chaiDom);

const Reporter = suite('Reporter Svelte');

let clock;
Reporter.before.each(() => {
  clock = sinon.useFakeTimers({ toFake: ['setTimeout'] });
});

Reporter.after.each(() => {
  clock.runAll();
  clock.restore();
  cleanup();
});

Reporter('sets aria-invalid to input', async () => {
  render(NoPlaceholder);
  const inputElement = screen.getByRole('textbox', { name: 'test' });
  const formElement = screen.getByRole('form');
  formElement.submit();
  clock.runAllAsync();
  await waitFor(() => {
    expect(inputElement).to.have.attribute('aria-invalid');
  });
});

Reporter('renders error message', async () => {
  render(NoPlaceholder);
  const formElement = screen.getByRole('form');
  const validationMessageElement = screen.getByTestId('validation-message');
  const warningMessageElement = screen.getByTestId('warning-message');
  formElement.requestSubmit();
  clock.runAllAsync();
  await waitFor(() => {
    expect(validationMessageElement).to.contain.text('An error message');
    expect(warningMessageElement).to.contain.text('A warning message');
  });
});

Reporter('renders placeholder', async () => {
  render(Placeholder);
  const formElement = screen.getByRole('form');
  const placeholderElement = screen.getByTestId('placeholder');
  formElement.submit();
  clock.runAll();
  await waitFor(() => {
    expect(placeholderElement).to.not.be.null;
    expect(placeholderElement).to.contain.text('Placeholder text');
  });
});

Reporter('renders multiple errors', async () => {
  render(Multiple);
  const formElement = screen.getByRole('form');
  formElement.submit();
  clock.runAll();
  for (const index of [0, 1, 2]) {
    const validationMessageElement = screen.getByTestId(
      `validation-message-${index}`
    );
    await waitFor(() => {
      expect(validationMessageElement).to.contain.text('An error message');
    });
  }
});

Reporter.run();
