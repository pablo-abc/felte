import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/dom';
import { createForm } from '../src';
import { removeAllChildren, createInputElement, createDOM } from './common';

describe('Form action DOM mutations', () => {
  beforeAll(() => {
    createDOM();
  });

  afterEach(() => {
    const formElement = screen.getByRole('form');
    removeAllChildren(formElement);
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

  test('Propagates felte-unset-on-remove attribute respecting specificity', () => {
    const { form } = createForm({ onSubmit: jest.fn() });
    const outerFieldset = document.createElement('fieldset');
    outerFieldset.dataset.felteUnsetOnRemove = 'true';
    const outerTextInput = createInputElement({ name: 'outerText' });
    const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
    outerSecondaryInput.dataset.felteUnsetOnRemove = 'false';
    const innerFieldset = document.createElement('fieldset');
    const innerTextInput = createInputElement({ name: 'innerText' });
    const innerSecondaryinput = createInputElement({ name: 'innerSecondary' });
    innerSecondaryinput.dataset.felteUnsetOnRemove = 'false';
    innerFieldset.append(innerTextInput, innerSecondaryinput);
    outerFieldset.append(outerTextInput, outerSecondaryInput, innerFieldset);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(outerFieldset);
    form(formElement);
    [outerFieldset, outerTextInput, innerFieldset, innerTextInput].forEach(
      (el) => {
        expect(el).toHaveAttribute('data-felte-unset-on-remove', 'true');
      }
    );
    [outerSecondaryInput, innerSecondaryinput].forEach((el) => {
      expect(el).toHaveAttribute('data-felte-unset-on-remove', 'false');
    });
  });
});
