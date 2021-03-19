import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createForm } from 'felte';
import { createDOM, cleanupDOM, createInputElement } from './common';
import reporter from '../src';

describe('Reporter DOM', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('sets aria-invalid to input and removes if valid', async () => {
    const mockErrors = { test: 'An error' };
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
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);

    const { destroy } = form(formElement);

    await validate();

    await waitFor(() => {
      expect(inputElement).toHaveAttribute('aria-invalid');
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(inputElement).not.toHaveAttribute('aria-invalid');
    });

    destroy();
  });

  test('sets error message in list if invalid and removes it if valid', async () => {
    const mockErrors = { test: 'An error' };
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

    await validate();
    userEvent.click(inputElement);
    userEvent.click(formElement);

    await waitFor(() => {
      expect(validationMessageElement).toContainHTML(
        '<li data-felte-reporter-dom-list-message="">An error</li>'
      );
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.toHaveTextContent('An error');
    });
  });

  test('sets error message in span if invalid and removes it if valid', async () => {
    const mockErrors = { test: 'An error' };
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
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    userEvent.click(formElement);

    await waitFor(() => {
      expect(validationMessageElement).toContainHTML(
        '<span aria-live="polite" data-felte-reporter-dom-single-message="">An error</span>'
      );
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.toHaveTextContent('An error');
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
});
