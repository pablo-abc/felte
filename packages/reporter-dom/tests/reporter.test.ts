import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createForm } from 'felte';
import {
  createDOM,
  cleanupDOM,
  createInputElement,
  createMultipleInputElements,
} from './common';
import reporter from '../src';

jest.mock('svelte', () => ({ onDestroy: jest.fn() }));

describe('Reporter DOM', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('sets aria-invalid to input and removes if valid', async () => {
    const mockErrors = {
      test: 'An error',
      multiple: new Array(3).fill('An error'),
    };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm({
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
    });
    const multipleInputs = createMultipleInputElements({
      name: 'multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el, index) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
      mes.setAttribute('data-felte-index', String(index));
      return mes;
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    const { destroy } = form(formElement);

    await validate();

    await waitFor(() => {
      expect(inputElement).toHaveAttribute('aria-invalid');
      multipleInputs.forEach((input) =>
        expect(input).toHaveAttribute('aria-invalid')
      );
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(inputElement).not.toHaveAttribute('aria-invalid');
      multipleInputs.forEach((input) =>
        expect(input).not.toHaveAttribute('aria-invalid')
      );
    });

    destroy();
  });

  test('sets error message in list if invalid and removes it if valid', async () => {
    type Data = {
      container: {
        test: string;
        multiple: string[];
      };
    };
    const mockErrors = {
      container: {
        test: 'An error',
        multiple: new Array(3).fill('An error'),
      },
    };
    const mockWarnings = {
      container: {
        test: 'A warning',
      },
    };
    const mockValidate = jest.fn(() => mockErrors);
    const mockWarn = jest.fn(() => mockWarnings);
    const { form, validate } = createForm<Data>({
      onSubmit: jest.fn(),
      validate: mockValidate,
      warn: mockWarn,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    const warningMessageElement = document.createElement('div');
    warningMessageElement.setAttribute('data-felte-reporter-dom-for', 'test');
    warningMessageElement.setAttribute(
      'data-felte-reporter-dom-level',
      'warning'
    );
    const multipleInputs = createMultipleInputElements({
      name: 'multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el, index) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
      mes.setAttribute('data-felte-index', String(index));
      return mes;
    });
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'container';
    fieldsetElement.appendChild(inputElement);
    fieldsetElement.appendChild(validationMessageElement);
    fieldsetElement.appendChild(warningMessageElement);
    fieldsetElement.append(...multipleInputs, ...multipleMessages);
    formElement.appendChild(fieldsetElement);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    multipleInputs.forEach((input) => userEvent.click(input));
    userEvent.click(formElement);

    await waitFor(() => {
      expect(validationMessageElement).toContainHTML(
        '<li data-felte-reporter-dom-list-message="">An error</li>'
      );
      expect(warningMessageElement).toContainHTML(
        '<li data-felte-reporter-dom-list-message="">A warning</li>'
      );
      multipleMessages.forEach((mes) =>
        expect(mes).toContainHTML(
          '<li data-felte-reporter-dom-list-message="">An error</li>'
        )
      );
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.toHaveTextContent('An error');
      multipleMessages.forEach((mes) =>
        expect(mes).not.toContainHTML(
          '<li data-felte-reporter-dom-list-message="">An error</li>'
        )
      );
    });
  });

  test('sets error message in span if invalid and removes it if valid', async () => {
    const mockErrors = {
      test: 'An error',
      multiple: new Array(3).fill('An error'),
    };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm({
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter({ single: true }),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    const multipleInputs = createMultipleInputElements({
      name: 'multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el, index) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
      mes.setAttribute('data-felte-index', String(index));
      return mes;
    });
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    multipleInputs.forEach((input) => userEvent.click(input));
    userEvent.click(formElement);

    await waitFor(() => {
      expect(validationMessageElement).toContainHTML(
        '<span aria-live="polite" data-felte-reporter-dom-single-message="">An error</span>'
      );
      multipleMessages.forEach((mes) =>
        expect(mes).toContainHTML(
          '<span aria-live="polite" data-felte-reporter-dom-single-message="">An error</span>'
        )
      );
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.toHaveTextContent('An error');
      multipleMessages.forEach((mes) =>
        expect(mes).not.toContainHTML(
          '<span aria-live="polite" data-felte-reporter-dom-single-message="">An error</span>'
        )
      );
    });
  });

  test('focuses first invalid input and shows validation message on submit', async () => {
    const mockErrors = { test: 'A test error' };
    const mockValidate = jest.fn(() => mockErrors);
    const { form } = createForm({
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).toHaveFocus();
      expect(validationMessageElement).toHaveTextContent('A test error');
    });
  });

  test('sets classes for reporter list elements', async () => {
    type Data = {
      container: {
        test: string;
      };
    };
    const mockErrors = { container: { test: 'An error' } };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm<Data>({
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter({
        listItemAttributes: {
          class: 'li-class',
        },
        listAttributes: {
          class: 'ul-class',
        },
      }),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'container';
    fieldsetElement.appendChild(inputElement);
    fieldsetElement.appendChild(validationMessageElement);
    formElement.appendChild(fieldsetElement);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    userEvent.click(formElement);

    await waitFor(() => {
      const listElement = validationMessageElement.querySelector('ul');
      const messageElement = validationMessageElement.querySelector('li');
      expect(listElement).toHaveClass('ul-class');
      expect(messageElement).toHaveClass('li-class');
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.toHaveTextContent('An error');
    });
  });

  test('sets classes for reporter single elements', async () => {
    type Data = {
      container: {
        test: string;
      };
    };
    const mockErrors = { container: { test: 'An error' } };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm<Data>({
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter({
        single: true,
        singleAttributes: {
          class: 'span-class',
        },
      }),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'container';
    fieldsetElement.appendChild(inputElement);
    fieldsetElement.appendChild(validationMessageElement);
    formElement.appendChild(fieldsetElement);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    userEvent.click(formElement);

    await waitFor(() => {
      const messageElement = validationMessageElement.querySelector('span');
      expect(messageElement).toHaveClass('span-class');
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.toHaveTextContent('An error');
    });
  });
});
