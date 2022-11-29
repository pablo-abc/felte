import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import { AssertionError } from 'node:assert';
import {
  createDOM,
  cleanupDOM,
  createInputElement,
  createMultipleInputElements,
  createForm,
} from './common';
import '../src/felte-validation-message';
import { reporter } from '../src';

expect.extend(matchers);

const template = `
<template>
  <ul>
    <li data-part="item"></li>
  </ul>
</template>
`;

describe('Reporter DOM', () => {
  beforeEach(createDOM);
  afterEach(() => {
    cleanupDOM();
    vi.restoreAllMocks();
  });

  test('sets aria-invalid to input and removes if valid', async () => {
    const mockErrors = {
      test: 'An error',
      multiple: new Array(3).fill({ value: 'An error' }),
    };
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form, validate } = createForm({
      onSubmit: vi.fn(),
      validate: mockValidate,
      extend: reporter,
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
      const mes = document.createElement('felte-validation-message');
      mes.innerHTML = template;
      mes.setAttribute('for', el.name);
      return mes;
    });
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.innerHTML = template;
    validationMessageElement.setAttribute('for', 'test');
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
        multiple: new Array(3).fill({ value: 'An error' }),
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
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'container.test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.innerHTML = template;
    validationMessageElement.setAttribute('for', 'container.test');
    const warningMessageElement = document.createElement(
      'felte-validation-message'
    );
    warningMessageElement.innerHTML = template;
    warningMessageElement.setAttribute('for', 'container.test');
    warningMessageElement.setAttribute('level', 'warning');
    const multipleInputs = createMultipleInputElements({
      name: 'container.multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('felte-validation-message');
      mes.innerHTML = template;
      mes.setAttribute('for', el.name);
      return mes;
    });
    const fieldsetElement = document.createElement('fieldset');

    const validElement = createInputElement({
      name: 'container.valid',
      type: 'text',
      id: 'test',
    });
    const validMessageElement = document.createElement(
      'felte-validation-message'
    );
    validMessageElement.innerHTML = template;
    validMessageElement.setAttribute('for', 'container.valid');
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
        '<li data-part="item">An error</li>'
      );
      expect(warningMessageElement).toContainHTML(
        '<li data-part="item">A warning</li>'
      );
      multipleMessages.forEach((mes) =>
        expect(mes).toContainHTML('<li data-part="item">An error</li>')
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

  const spanTemplate = `
<template>
  <span data-part="item"></span>
</template>`;

  test('sets error message in span if invalid and removes it if valid', async () => {
    const mockErrors = {
      test: 'An error',
      multiple: new Array(3).fill({ value: 'An error' }),
    };
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form, validate } = createForm({
      onSubmit: vi.fn(),
      validate: mockValidate,
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.innerHTML = spanTemplate;
    validationMessageElement.setAttribute('for', 'test');
    const multipleInputs = createMultipleInputElements({
      name: 'multiple',
      type: 'text',
    });
    const templateElement = document.createElement('template');
    templateElement.id = 'validation-message';
    templateElement.innerHTML = '<span data-part="item"></span>';
    formElement.appendChild(templateElement);
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('felte-validation-message');
      mes.templateId = templateElement.id;
      mes.setAttribute('for', el.name);
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
        '<span data-part="item">An error</span>'
      );
      multipleMessages.forEach((mes) => {
        expect(mes).toContainHTML('<span data-part="item">An error</span>');
      });
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
      onSubmit: vi.fn(),
      validate: mockValidate,
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.setAttribute('for', 'test');
    validationMessageElement.setAttribute('max', '1');
    validationMessageElement.innerHTML = spanTemplate;
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
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.setAttribute('for', 'test');
    validationMessageElement.setAttribute('max', '1');
    validationMessageElement.innerHTML = spanTemplate;
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).not.toHaveFocus();
      expect(validationMessageElement).toHaveTextContent('A test error');
    });
  });

  test('throws error when no `for` attribute is given', async () => {
    const element = document.createElement('felte-validation-message');
    try {
      (element as any)._start('test-id');
      throw new AssertionError({ message: 'Unreachable' });
    } catch (err: any) {
      expect(err.message).to.equal(
        '<felte-validation-message> requires a `for` attribute'
      );
    }
  });

  test('throws error when not a child of a form', () => {
    const element = document.createElement('felte-validation-message');
    element.setAttribute('for', 'email');
    const template = document.createElement('template');
    element.appendChild(template);
    const span = document.createElement('span');
    span.setAttribute('part', 'item');
    template.content.appendChild(span);
    try {
      element.connectedCallback();
      throw new AssertionError({ message: 'Unreachable' });
    } catch (err) {
      expect(err)
        .to.have.property('message')
        .that.equals(
          '<felte-validation-message> must be a child of a <form> element'
        );
    }
  });

  test('calls start on load event', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const element = document.createElement('felte-validation-message');
    const spy = vi.spyOn(element as any, '_start').mockReturnValue(true);

    (element as any)._handleLoad({
      currentTarget: formElement,
    });

    expect(spy).not.toHaveBeenCalled();

    formElement.dataset.felteReporterElementId = 'test-id';
    (element as any)._handleLoad({
      currentTarget: formElement,
    });
    await waitFor(() => {
      expect(spy).toHaveBeenCalledOnce();
    });

    spy.mockClear();

    (element as any).formElement = formElement;
    (element as any)._handleLoad({
      currentTarget: formElement,
    });
    await waitFor(() => {
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  test('does not fail without a template', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const element = document.createElement('felte-validation-message');
    formElement.appendChild(element);
    element.setAttribute('for', 'email');

    expect(element.connectedCallback()).to.be.undefined;
  });

  test('does not fail without an item', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const element = document.createElement('felte-validation-message');
    const template = document.createElement('template');
    element.appendChild(template);
    formElement.appendChild(element);
    element.setAttribute('for', 'email');

    expect(element.connectedCallback()).to.be.undefined;
  });

  test('does not fail with a template on a parent shadow root', () => {
    const div = document.createElement('div');
    div.attachShadow({ mode: 'open' });
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const element = document.createElement('felte-validation-message');
    element.setAttribute('templateid', 'template');
    const template = document.createElement('template');
    template.id = 'template';
    div.shadowRoot?.append(formElement, template);
    formElement.appendChild(element);
    element.setAttribute('for', 'email');

    expect(element.connectedCallback()).to.be.undefined;
  });
});
