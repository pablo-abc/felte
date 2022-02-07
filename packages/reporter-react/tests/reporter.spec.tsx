import React from 'react';
import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom from 'chai-jsdom';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useForm } from '@felte/react';
import userEvent from '@testing-library/user-event';
import { ValidationMessage, reporter } from '../src';
use(chaiDom);

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
  const { form } = useForm<Data>({
    onSubmit: sinon.fake(),
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
        <ValidationMessage for="password" level="warning">
          {(message) => <span data-testid="password-warning">{message}</span>}
        </ValidationMessage>
      </div>
    </form>
  );
}

const Reporter = suite('reporter');

Reporter('reports validation message', async () => {
  render(<Wrapper />);

  const formElement = screen.getByTestId('test-form') as HTMLFormElement;
  const emailInput = screen.getByRole('textbox', { name: 'Email' });
  const passwordInput = screen.getByRole('textbox', { name: 'Password' });
  let emailMessage = screen.getByTestId('email-message');
  let passwordMessage = screen.getByTestId('password-message');
  let passwordWarning = screen.getByTestId('password-warning');

  expect(emailInput).to.not.be.invalid;
  expect(emailMessage).to.be.empty;
  expect(passwordMessage).to.be.empty;

  act(() => formElement.submit());

  await waitFor(() => {
    expect(emailInput).to.be.invalid;
    expect(passwordInput).to.to.be.invalid;
    emailMessage = screen.getByTestId('email-message');
    passwordMessage = screen.getByTestId('password-message');
    passwordWarning = screen.getByTestId('password-warning');
    expect(emailMessage).to.have.text.that.contains('Must not be empty');
    expect(passwordMessage).to.have.text.that.contains('Must not be empty');
    expect(passwordMessage).to.have.text.that.contains(
      'Must be at least 8 chars'
    );
    expect(passwordWarning).to.have.text.that.does.not.contain(
      'Not secure enough'
    );
  });

  act(() => {
    userEvent.type(emailInput, 'zaphod@beeblebrox.com');
    userEvent.type(passwordInput, '1234');
  });

  await waitFor(() => {
    expect(emailInput).to.not.to.be.invalid;
    expect(passwordInput).to.to.be.invalid;
    emailMessage = screen.getByTestId('email-message');
    passwordMessage = screen.getByTestId('password-message');
    passwordWarning = screen.getByTestId('password-warning');
    expect(emailMessage).to.be.empty;
    expect(passwordMessage).to.have.text.that.does.not.contain(
      'Must not be empty'
    );
    expect(passwordMessage).to.have.text.that.contains(
      'Must be at least 8 chars'
    );
    expect(passwordWarning).to.have.text.that.contains('Not secure enough');
  });
});

Reporter.run();
