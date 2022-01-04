import { createForm } from '@felte/solid';
import { screen, render, waitFor } from 'solid-testing-library';
import { Index } from 'solid-js';
import userEvent from '@testing-library/user-event';
import { ValidationMessage, reporter } from '../src';

type Data = {
  email: string;
  password: string;
};

type DataErrors = {
  email?: string;
  password?: string[];
};

type DataWarnings = {
  password?: string;
};

function getArrayError(message: string, errorValue?: string[]) {
  if (errorValue) return [...errorValue, message];
  return [message];
}

function Wrapper() {
  const { form } = createForm<Data>({
    onSubmit: jest.fn(),
    extend: reporter,
    validate(values) {
      const errors: DataErrors = {};
      if (!values.email) errors.email = 'Must not be empty';
      if (!values.password)
        errors.password = getArrayError('Must not be empty', errors.password);
      if (values.password?.length < 8)
        errors.password = getArrayError(
          'Must be at least 8 chars',
          errors.password
        );
      return errors;
    },
    warn(values) {
      const warnings: DataWarnings = {};
      if (values.password && values.password.length < 8)
        warnings.password = 'Not secure enough';
      return warnings;
    },
  });

  return (
    <form ref={form} data-testid="test-form">
      <div>
        <label for="email">Email</label>
        <input name="email" id="email" />
        <ValidationMessage for="email">
          {(message) => <span data-testid="email-message">{message}</span>}
        </ValidationMessage>
      </div>
      <div>
        <label for="password">Password</label>
        <input name="password" id="password" />
        <ValidationMessage for="password">
          {(messages) => (
            <ul data-testid="password-message">
              <Index each={(messages as string[] | undefined) ?? []}>
                {(message) => <li>{message()}</li>}
              </Index>
            </ul>
          )}
        </ValidationMessage>
        <ValidationMessage for="password" level="warning">
          {(message) => <span data-testid="password-warning">{message}</span>}
        </ValidationMessage>
      </div>
    </form>
  );
}

describe('reporter', () => {
  test('reports validation message', async () => {
    render(Wrapper);

    const formElement = screen.getByTestId('test-form') as HTMLFormElement;
    const emailInput = screen.getByRole('textbox', { name: 'Email' });
    const passwordInput = screen.getByRole('textbox', { name: 'Password' });
    let emailMessage = screen.getByTestId('email-message');
    let passwordMessage = screen.getByTestId('password-message');
    let passwordWarning = screen.getByTestId('password-warning');

    expect(emailInput).toBeValid();
    expect(emailMessage).toBeEmptyDOMElement();
    expect(passwordMessage).toBeEmptyDOMElement();
    expect(passwordWarning).toBeEmptyDOMElement();

    formElement.submit();

    await waitFor(() => {
      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
      emailMessage = screen.getByTestId('email-message');
      passwordMessage = screen.getByTestId('password-message');
      passwordWarning = screen.getByTestId('password-warning');
      expect(emailMessage).toHaveTextContent('Must not be empty');
      expect(passwordMessage).toHaveTextContent('Must not be empty');
      expect(passwordMessage).toHaveTextContent('Must be at least 8 chars');
      expect(passwordWarning).toBeEmptyDOMElement();
    });

    userEvent.type(emailInput, 'zaphod@beeblebrox.com');
    userEvent.type(passwordInput, '1234');

    await waitFor(() => {
      expect(emailInput).toBeValid();
      expect(passwordInput).toBeInvalid();
      emailMessage = screen.getByTestId('email-message');
      passwordMessage = screen.getByTestId('password-message');
      passwordWarning = screen.getByTestId('password-warning');
      expect(emailMessage).toBeEmptyDOMElement();
      expect(passwordMessage).not.toHaveTextContent('Must not be empty');
      expect(passwordMessage).toHaveTextContent('Must be at least 8 chars');
      expect(passwordWarning).toHaveTextContent('Not secure enough');
    });
  });
});
