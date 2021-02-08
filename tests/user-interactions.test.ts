import { screen, waitFor } from '@testing-library/dom';
import { removeAllChildren, createInputElement, createDOM } from './common';
import { createForm } from '../src';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';

function createLoginForm() {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const emailInput = createInputElement({ name: 'email', type: 'email' });
  const passwordInput = createInputElement({
    name: 'password',
    type: 'password',
  });
  const submitInput = createInputElement({ type: 'submit' });
  const userFieldset = document.createElement('fieldset');
  userFieldset.name = 'user';
  userFieldset.append(emailInput, passwordInput);
  formElement.append(userFieldset, submitInput);
  return { formElement, emailInput, passwordInput, submitInput };
}

describe('User interactions with form', () => {
  beforeAll(() => {
    createDOM();
  });

  afterEach(() => {
    const formElement = screen.getByRole('form');
    removeAllChildren(formElement);
  });

  test('Input and data object get same value', () => {
    const { form, data } = createForm({
      onSubmit: jest.fn(),
    });
    const { formElement, emailInput, passwordInput } = createLoginForm();
    form(formElement);
    userEvent.type(emailInput, 'test@email.com');
    userEvent.type(passwordInput, 'password');
    const $data = get(data);
    expect($data).toEqual(
      expect.objectContaining({
        user: {
          email: 'test@email.com',
          password: 'password',
        },
      })
    );
  });

  test('Calls validation function on submit', () => {
    const validate = jest.fn();
    const { form } = createForm({
      onSubmit: jest.fn(),
      validate,
    });
    const { formElement, submitInput } = createLoginForm();
    form(formElement);
    userEvent.click(submitInput);
    expect(validate).toHaveBeenCalled();
  });

  test('Calls validation function on submit', async () => {
    const validate = jest.fn(() => ({ user: { email: 'Not email' } }));
    const { form } = createForm({
      onSubmit: jest.fn(),
      validate,
    });
    const { formElement, emailInput } = createLoginForm();
    form(formElement);
    userEvent.type(emailInput, 'test@email.com');
    formElement.submit();
    expect(validate).toHaveBeenCalled();
  });
});
