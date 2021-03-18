import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/svelte';
import NoPlaceholder from './NoPlaceholder.svelte';
import Placeholder from './Placeholder.svelte';

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
    formElement.submit();
    await waitFor(() => {
      expect(validationMessageElement.innerHTML).toContain('An error message');
    });
  });

  test('renders placeholder', async () => {
    render(Placeholder);
    const formElement = screen.getByRole('form');
    const placeholderElement = screen.getByTestId('placeholder');
    formElement.submit();
    await waitFor(() => {
      expect(placeholderElement).toBeInTheDocument();
      expect(placeholderElement.innerHTML).toContain('Placeholder text');
    });
  });
});
