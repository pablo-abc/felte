import React from 'react';
import '@testing-library/jest-dom';
import { useForm } from '@felte/react';
import { screen, render, waitFor, act } from '@testing-library/react';
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

function getArrayError(message: string, errorValue?: string[]) {
  if (errorValue) return [...errorValue, message];
  return [message];
}

function Wrapper() {
  const { form } = useForm<Data>({
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
  });

  return (
    <form ref={form} data-testid="test-form">
      <div>
        <label htmlFor="email">Email</label>
        <input name="email" id="email" />
        <ValidationMessage for="email">
          {(message) => <span data-testid="email-message">{message}</span>}
        </ValidationMessage>
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input name="password" id="password" />
        <ValidationMessage for="password">
          {(messages) => (
            <ul data-testid="password-message">
              {Array.isArray(messages) &&
                messages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          )}
        </ValidationMessage>
      </div>
    </form>
  );
}

describe('reporter', () => {
  test('reports validation message', async () => {
    render(<Wrapper />);

    const formElement = screen.getByTestId('test-form') as HTMLFormElement;
    const emailInput = screen.getByRole('textbox', { name: 'Email' });
    const passwordInput = screen.getByRole('textbox', { name: 'Password' });
    let emailMessage = screen.getByTestId('email-message');
    let passwordMessage = screen.getByTestId('password-message');

    expect(emailInput).toBeValid();
    expect(emailMessage).toBeEmptyDOMElement();
    expect(passwordMessage).toBeEmptyDOMElement();

    act(() => formElement.submit());

    await waitFor(() => {
      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
      emailMessage = screen.getByTestId('email-message');
      passwordMessage = screen.getByTestId('password-message');
      expect(emailMessage).toHaveTextContent('Must not be empty');
      expect(passwordMessage).toHaveTextContent('Must not be empty');
      expect(passwordMessage).toHaveTextContent('Must be at least 8 chars');
    });

    act(() => {
      userEvent.type(emailInput, 'zaphod@beeblebrox.com');
      userEvent.type(passwordInput, '1234');
    });

    await waitFor(() => {
      expect(emailInput).toBeValid();
      expect(passwordInput).toBeInvalid();
      emailMessage = screen.getByTestId('email-message');
      passwordMessage = screen.getByTestId('password-message');
      expect(emailMessage).toBeEmptyDOMElement();
      expect(passwordMessage).not.toHaveTextContent('Must not be empty');
      expect(passwordMessage).toHaveTextContent('Must be at least 8 chars');
    });
  });
});
