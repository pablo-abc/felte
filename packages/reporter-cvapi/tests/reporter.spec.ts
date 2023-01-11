import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import {
  createDOM,
  cleanupDOM,
  createInputElement,
  createForm,
} from './common';
import reporter from '../src';

expect.extend(matchers);

describe('Reporter CVAPI', () => {
  beforeEach(createDOM);
  afterEach(() => {
    cleanupDOM();
    vi.restoreAllMocks();
  });

  test('sets input to invalid', async () => {
    const mockErrors = { test: 'An error' };
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
    formElement.appendChild(inputElement);

    const { destroy } = form(formElement);

    await validate();

    await waitFor(() => {
      expect(inputElement.checkValidity()).to.be.false;
      expect(inputElement.validationMessage).to.equal(mockErrors.test);
    });

    mockValidate.mockReturnValue({});

    await validate();

    await waitFor(() => {
      expect(inputElement.checkValidity()).to.be.true;
    });

    destroy();
  });

  test('focuses first invalid input and sets validity', async () => {
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
    });
    const submitElement = createInputElement({ type: 'submit' });
    formElement.appendChild(inputElement);
    formElement.appendChild(submitElement);

    form(formElement);

    userEvent.click(submitElement);

    await waitFor(() => {
      expect(inputElement).toHaveFocus();
      expect(inputElement.validationMessage).to.equal(mockErrors.test);
    });
  });

  test('does not focus first invalid input and sets validity', async () => {
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
    });
    const submitElement = createInputElement({ type: 'submit' });
    formElement.appendChild(inputElement);
    formElement.appendChild(submitElement);

    form(formElement);

    userEvent.click(submitElement);

    await waitFor(() => {
      expect(inputElement).not.toHaveFocus();
      expect(inputElement.validationMessage).to.equal(mockErrors.test);
    });
  });
});
