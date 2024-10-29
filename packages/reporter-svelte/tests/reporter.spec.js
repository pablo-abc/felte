import '@testing-library/jest-dom/vitest';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/svelte';
import NoPlaceholder from './NoPlaceholder.svelte';
import Placeholder from './Placeholder.svelte';
import Multiple from './Multiple.svelte';

describe('Reporter Svelte', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  test('sets aria-invalid to input', async () => {
    render(NoPlaceholder, {});
    const inputElement = screen.getByRole('textbox', { name: 'test' });
    const formElement = screen.getByRole('form');
    vi.runAllTicks();
    formElement.requestSubmit();
    vi.runAllTicks();
    await waitFor(() => {
      expect(inputElement).toBeInvalid();
    });
  });

  test('renders error message', async () => {
    render(NoPlaceholder);
    const formElement = screen.getByRole('form');
    formElement.requestSubmit();
    vi.runAllTimers();
    await waitFor(() => {
      const validationMessageElement = screen.getByTestId('validation-message');
      const warningMessageElement = screen.getByTestId('warning-message');
      expect(validationMessageElement).toHaveTextContent('An error message');
      expect(warningMessageElement).toHaveTextContent('A warning message');
    });
  });

  test('renders placeholder', async () => {
    render(Placeholder);
    const formElement = screen.getByRole('form');
    const placeholderElement = screen.getByTestId('placeholder');
    formElement.submit();
    vi.runAllTimers();
    await waitFor(() => {
      expect(placeholderElement).to.not.be.null;
      expect(placeholderElement).toHaveTextContent('Placeholder text');
    });
  });

  test('renders multiple errors', async () => {
    render(Multiple);
    const formElement = screen.getByRole('form');
    formElement.requestSubmit();
    vi.runAllTimers();
    for (const index of [0, 1, 2]) {
      const validationMessageElement = screen.getByTestId(
        `validation-message-${index}`,
      );
      await waitFor(() => {
        expect(validationMessageElement).toHaveTextContent('An error message');
      });
    }
  });
});
