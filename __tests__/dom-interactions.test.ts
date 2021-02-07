import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/dom';
import { createForm } from '../src';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';

function createDOM() {
  const formElement = document.createElement('form');
  formElement.name = 'test-form';
  document.body.appendChild(formElement);
}

type InputAttributes = {
  type?: string;
  required?: boolean;
  name?: string;
};

function createInputElement(attrs: InputAttributes) {
  const inputElement = document.createElement('input');
  if (attrs.name) inputElement.name = attrs.name;
  if (attrs.type) inputElement.type = attrs.type;
  inputElement.required = !!attrs.required;
  return inputElement;
}

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

describe('Form action DOM mutations', () => {
  beforeAll(() => {
    createDOM();
  });

  afterEach(() => {
    const formElement = screen.getByRole('form');
    formElement.innerHTML = '';
  });

  test('Adds novalidate to form when using a validate function', () => {
    const { form } = createForm({
      validate: jest.fn(),
      onSubmit: jest.fn(),
    });
    const formElement = screen.getByRole('form') as HTMLFormElement;
    expect(formElement).not.toHaveAttribute('novalidate');

    form(formElement);

    expect(formElement).toHaveAttribute('novalidate');
  });

  test('Adds data-fieldset to children of fieldset', () => {
    const { form } = createForm({
      onSubmit: jest.fn(),
    });
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'user';
    const inputElement = document.createElement('input');
    inputElement.name = 'email';
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);
    form(formElement);
    expect(inputElement).toHaveAttribute('data-fieldset');
  });

  test('Fieldsets can be nested', () => {
    const { form } = createForm({ onSubmit: jest.fn() });
    const userFieldset = document.createElement('fieldset');
    userFieldset.name = 'user';
    const profileFieldset = document.createElement('fieldset');
    profileFieldset.name = 'profile';
    const emailInput = createInputElement({ type: 'email', name: 'email' });
    const passwordInput = createInputElement({
      type: 'password',
      name: 'password',
    });
    const nameInput = createInputElement({ name: 'name' });
    const bioInput = createInputElement({ name: 'bio' });
    profileFieldset.append(nameInput, bioInput);
    userFieldset.append(emailInput, passwordInput, profileFieldset);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(userFieldset);
    form(formElement);
    [emailInput, passwordInput, profileFieldset].forEach((el) => {
      expect(el).toHaveAttribute('data-fieldset', 'user');
    });
    [nameInput, bioInput].forEach((el) => {
      expect(el).toHaveAttribute('data-fieldset', 'user.profile');
    });
  });

  test('Propagates unset-on-remove attribute respecting specificity', () => {
    const { form } = createForm({ onSubmit: jest.fn() });
    const outerFieldset = document.createElement('fieldset');
    outerFieldset.dataset.unsetOnRemove = 'true';
    const outerTextInput = createInputElement({ name: 'outerText' });
    const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
    outerSecondaryInput.dataset.unsetOnRemove = 'false';
    const innerFieldset = document.createElement('fieldset');
    const innerTextInput = createInputElement({ name: 'innerText' });
    const innerSecondaryinput = createInputElement({ name: 'innerSecondary' });
    innerSecondaryinput.dataset.unsetOnRemove = 'false';
    innerFieldset.append(innerTextInput, innerSecondaryinput);
    outerFieldset.append(outerTextInput, outerSecondaryInput, innerFieldset);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(outerFieldset);
    form(formElement);
    [outerFieldset, outerTextInput, innerFieldset, innerTextInput].forEach(
      (el) => {
        expect(el).toHaveAttribute('data-unset-on-remove', 'true');
      }
    );
    [outerSecondaryInput, innerSecondaryinput].forEach((el) => {
      expect(el).toHaveAttribute('data-unset-on-remove', 'false');
    });
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
});
