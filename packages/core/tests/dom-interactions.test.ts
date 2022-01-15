import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import {
  cleanupDOM,
  createInputElement,
  createDOM,
  createMultipleInputElements,
  createForm,
} from './common';
import { get } from 'svelte/store';

describe('Form action DOM mutations', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

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

  test('Adds data-felte-fieldset to children of fieldset', () => {
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
    expect(inputElement).toHaveAttribute('data-felte-fieldset');
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
      expect(el).toHaveAttribute('data-felte-fieldset', 'user');
    });
    [nameInput, bioInput].forEach((el) => {
      expect(el).toHaveAttribute('data-felte-fieldset', 'user.profile');
    });
  });

  test('Propagates felte-keep-on-remove attribute respecting specificity', () => {
    const { form } = createForm({ onSubmit: jest.fn() });
    const outerFieldset = document.createElement('fieldset');
    outerFieldset.dataset.felteKeepOnRemove = 'false';
    const outerTextInput = createInputElement({ name: 'outerText' });
    const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
    outerSecondaryInput.dataset.felteKeepOnRemove = 'true';
    const innerFieldset = document.createElement('fieldset');
    const innerTextInput = createInputElement({ name: 'innerText' });
    const innerSecondaryinput = createInputElement({ name: 'innerSecondary' });
    innerSecondaryinput.dataset.felteKeepOnRemove = 'true';
    innerFieldset.append(innerTextInput, innerSecondaryinput);
    outerFieldset.append(outerTextInput, outerSecondaryInput, innerFieldset);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(outerFieldset);
    form(formElement);
    [outerFieldset, outerTextInput, innerFieldset, innerTextInput].forEach(
      (el) => {
        expect(el).toHaveAttribute('data-felte-keep-on-remove', 'false');
      }
    );
    [outerSecondaryInput, innerSecondaryinput].forEach((el) => {
      expect(el).toHaveAttribute('data-felte-keep-on-remove', 'true');
    });
  });

  test('Keeps fields tagged with felte-keep-on-remove', async () => {
    const { form, data } = createForm({ onSubmit: jest.fn() });
    const outerFieldset = document.createElement('fieldset');
    outerFieldset.dataset.felteKeepOnRemove = 'false';
    const outerTextInput = createInputElement({ name: 'outerText' });
    const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
    outerSecondaryInput.dataset.felteKeepOnRemove = '';
    const multipleOuterInputs = createMultipleInputElements({
      name: 'multiple',
    });
    multipleOuterInputs[1].dataset.felteKeepOnRemove = 'true';
    const innerFieldset = document.createElement('fieldset');
    innerFieldset.name = 'inner';
    const innerTextInput = createInputElement({ name: 'innerText' });
    const innerSecondaryinput = createInputElement({ name: 'innerSecondary' });
    innerSecondaryinput.dataset.felteKeepOnRemove = 'true';
    innerFieldset.append(innerTextInput, innerSecondaryinput);
    outerFieldset.append(
      ...multipleOuterInputs,
      outerTextInput,
      outerSecondaryInput,
      innerFieldset
    );
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(outerFieldset);
    form(formElement);
    expect(get(data)).toEqual({
      outerText: '',
      outerSecondary: '',
      multiple: ['', '', ''],
      inner: {
        innerText: '',
        innerSecondary: '',
      },
    });
    formElement.removeChild(outerFieldset);
    await waitFor(() => {
      expect(get(data)).toEqual({
        outerSecondary: '',
        multiple: [''],
        inner: {
          innerSecondary: '',
        },
      });
    });
  });

  test('Handles fields added after form load', async () => {
    const { form, data } = createForm({ onSubmit: jest.fn() });
    const outerFieldset = document.createElement('fieldset');
    outerFieldset.dataset.felteKeepOnRemove = 'false';
    const outerTextInput = createInputElement({ name: 'outerText' });
    const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
    outerSecondaryInput.dataset.felteKeepOnRemove = 'true';
    const innerFieldset = document.createElement('fieldset');
    innerFieldset.name = 'inner';
    const innerTextInput = createInputElement({ name: 'innerText' });
    const innerSecondaryinput = createInputElement({ name: 'innerSecondary' });
    innerSecondaryinput.dataset.felteKeepOnRemove = 'true';
    innerFieldset.append(innerTextInput, innerSecondaryinput);
    outerFieldset.append(outerTextInput, outerSecondaryInput);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(outerFieldset);
    form(formElement);
    expect(get(data)).toEqual({
      outerText: '',
      outerSecondary: '',
    });

    formElement.appendChild(innerFieldset);

    await waitFor(() => {
      expect(get(data)).toEqual({
        outerText: '',
        outerSecondary: '',
        inner: {
          innerText: '',
          innerSecondary: '',
        },
      });
    });
  });

  test('Adds and removes event listeners', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const { form } = createForm({ onSubmit: jest.fn() });
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    formElement.addEventListener = addEventListener;
    formElement.removeEventListener = removeEventListener;
    expect(addEventListener).not.toHaveBeenCalled();
    expect(removeEventListener).not.toHaveBeenCalled();
    const { destroy } = form(formElement);
    expect(addEventListener).toHaveBeenCalledTimes(4);
    expect(removeEventListener).not.toHaveBeenCalled();
    destroy();
    expect(removeEventListener).toHaveBeenCalledTimes(4);
  });

  test('Listens to programmatic changes of inputs', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const textInput = createInputElement({ type: 'text', name: 'text' });
    const checkboxInput = createInputElement({
      type: 'checkbox',
      name: 'checkbox',
    });
    const fileInput = createInputElement({
      type: 'file',
      name: 'file',
    });
    formElement.append(textInput, checkboxInput, fileInput);
    const { form, data } = createForm({ onSubmit: jest.fn() });
    form(formElement);

    expect(get(data)).toEqual({
      text: '',
      checkbox: false,
      file: undefined,
    });

    textInput.value = 'test';
    checkboxInput.checked = true;
    fileInput.files = null;

    await waitFor(() => {
      expect(get(data)).toEqual({
        text: 'test',
        checkbox: true,
        file: undefined,
      });
    });
  });
});
