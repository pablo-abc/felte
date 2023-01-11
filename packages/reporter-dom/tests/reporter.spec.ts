import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import {
  createDOM,
  cleanupDOM,
  createInputElement,
  createMultipleInputElements,
  createForm,
} from './common';
import reporter from '../src';

expect.extend(matchers);

describe('Reporter DOM', () => {
  beforeEach(createDOM);
  afterEach(() => {
    cleanupDOM();
    vi.restoreAllMocks();
  });

  test('sets aria-invalid to input and removes if valid', async () => {
    const mockErrors = {
      test: 'An error',
      multiple: new Array(3).fill('An error'),
    };
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form, validate } = createForm({
      onSubmit: vi.fn(),
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
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
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
      expect(inputElement).toBeInvalid();
      multipleInputs.forEach((input) => expect(input).toBeInvalid());
    });

    mockValidate.mockReturnValue({} as any);

    await validate();

    await waitFor(() => {
      expect(inputElement).toBeValid();
      multipleInputs.forEach((input) => expect(input).toBeValid());
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
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const mockWarn = vi.fn().mockReturnValue(mockWarnings);
    const { form, validate } = createForm<Data>({
      onSubmit: vi.fn(),
      validate: mockValidate,
      warn: mockWarn,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'container.test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'container.test'
    );
    const warningMessageElement = document.createElement('div');
    warningMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'container.test'
    );
    warningMessageElement.setAttribute(
      'data-felte-reporter-dom-level',
      'warning'
    );
    const multipleInputs = createMultipleInputElements({
      name: 'container.multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
      return mes;
    });
    const fieldsetElement = document.createElement('fieldset');

    const validElement = createInputElement({
      name: 'container.valid',
      type: 'text',
      id: 'test',
    });
    const validMessageElement = document.createElement('div');
    validMessageElement.setAttribute('data-felte-reporter-dom-for', '');
    fieldsetElement.appendChild(inputElement);
    fieldsetElement.appendChild(validationMessageElement);
    fieldsetElement.appendChild(warningMessageElement);
    fieldsetElement.append(...multipleInputs, ...multipleMessages);
    fieldsetElement.append(validElement, validMessageElement);
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

    mockValidate.mockReturnValue({} as any);

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
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form, validate } = createForm({
      onSubmit: vi.fn(),
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
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
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

    mockValidate.mockReturnValue({} as any);

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
    const mockValidate = vi.fn(() => mockErrors);
    const { form } = createForm({
      onSubmit: () => undefined,
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

  test('does not focus first invalid input and shows validation message on submit', async () => {
    const mockErrors = { test: 'A test error' };
    const mockValidate = vi.fn(() => mockErrors);
    const { form } = createForm({
      onSubmit: () => undefined,
      validate: mockValidate,
      extend: reporter({ preventFocusOnError: true }),
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
      expect(inputElement).not.toHaveFocus();
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
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form, validate } = createForm<Data>({
      onSubmit: vi.fn(),
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
      name: 'container.test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'container.test'
    );
    const fieldsetElement = document.createElement('fieldset');
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

    mockValidate.mockReturnValue({});

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
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form, validate } = createForm<Data>({
      onSubmit: vi.fn(),
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
      name: 'container.test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'container.test'
    );
    const fieldsetElement = document.createElement('fieldset');
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

    mockValidate.mockReturnValue({});

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.toHaveTextContent('An error');
    });
  });
});
