import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/svelte';
import NoPlaceholder from './NoPlaceholder.svelte';
import Placeholder from './Placeholder.svelte';
import Multiple from './Multiple.svelte';

describe('Reporter Svelte', () => {
  test('sets aria-invalid to input', async () => {
    render(NoPlaceholder);
    const inputElement = screen.getByRole('textbox', { name: 'test' });
    const formElement = screen.getByRole('form');
    formElement.submit();
    await waitFor(() => {
      expect(inputElement).toHaveAttribute('aria-invalid');
    });
  });

  test('renders error message', async () => {
    render(NoPlaceholder);
    const formElement = screen.getByRole('form');
    const validationMessageElement = screen.getByTestId('validation-message');
    const warningMessageElement = screen.getByTestId('warning-message');
    formElement.submit();
    await waitFor(() => {
      expect(validationMessageElement).toHaveTextContent('An error message');
      expect(warningMessageElement).toHaveTextContent('A warning message');
    });
  });

  test('renders placeholder', async () => {
    render(Placeholder);
    const formElement = screen.getByRole('form');
    const placeholderElement = screen.getByTestId('placeholder');
    formElement.submit();
    await waitFor(() => {
      expect(placeholderElement).toBeInTheDocument();
      expect(placeholderElement).toHaveTextContent('Placeholder text');
    });
  });

  test('renders multiple errors', async () => {
    render(Multiple);
    const formElement = screen.getByRole('form');
    formElement.submit();
    for (const index of [0, 1, 2]) {
      const validationMessageElement = screen.getByTestId(
        `validation-message-${index}`
      );
      await waitFor(() => {
        expect(validationMessageElement).toHaveTextContent('An error message');
      });
    }
  });
});
