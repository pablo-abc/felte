import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createForm } from 'felte';
import { createDOM, cleanupDOM, createInputElement } from './common';
import reporter from '../src';

describe('Reporter CVAPI', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('sets input to invalid', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm({
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    formElement.appendChild(inputElement);

    const { destroy } = form(formElement);

    await validate();

    await waitFor(() => {
      expect(inputElement.checkValidity()).toBeFalsy();
      expect(inputElement.validationMessage).toBe(mockErrors.test);
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(inputElement.checkValidity()).toBeTruthy();
    });

    destroy();
  });

  test('focuses first invalid input and sets validity', async () => {
    const mockErrors = { test: 'A test error' };
    const mockValidate = jest.fn(() => mockErrors);
    const { form } = createForm({
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
    });
    const submitElement = createInputElement({ type: 'submit' });
    formElement.appendChild(inputElement);
    formElement.appendChild(submitElement);

    form(formElement);

    userEvent.click(submitElement);

    await waitFor(() => {
      expect(inputElement).toHaveFocus();
      expect(inputElement.validationMessage).toBe(mockErrors.test);
    });
  });
});
