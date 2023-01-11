import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { Instance, Props } from 'tippy.js';
import {
  createForm,
  createDOM,
  cleanupDOM,
  createInputElement,
  createMultipleInputElements,
} from './common';
import { screen, waitFor } from '@testing-library/dom';
import reporter from '../src';

expect.extend(matchers);

function getTippy(element: any): Instance<Props> | undefined {
  return element?._tippy;
}

describe('Reporter Tippy', () => {
  beforeEach(createDOM);
  afterEach(cleanupDOM);

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
    formElement.appendChild(inputElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    form(formElement);

    await validate();

    await waitFor(() => {
      expect(inputElement).toBeInvalid();
      multipleInputs.forEach((input) => expect(input).toBeInvalid());
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(inputElement).not.toBeInvalid();
      multipleInputs.forEach((input) => expect(input).not.toBeInvalid());
    });
  });

  test('show tippy on hover and hide on unhover', async () => {
    const mockErrors = {
      test: 'A test error',
      multiple: new Array(3).fill('An error'),
    };
    const mockValidate = vi.fn(() => mockErrors);
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
    formElement.appendChild(inputElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    const { destroy } = form(formElement);

    await validate();

    expect(getTippy(inputElement)).to.be.ok;

    userEvent.hover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.true;
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });

    userEvent.unhover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.false;
    });

    for (const input of multipleInputs) {
      expect(getTippy(input)).to.be.ok;

      userEvent.hover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).to.be.true;
        expect(tippyInstance?.state.isVisible).to.be.true;
        expect(tippyInstance?.popper).toHaveTextContent(mockErrors.multiple[0]);
      });

      userEvent.unhover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).to.be.true;
        expect(tippyInstance?.state.isVisible).to.be.false;
      });
    }

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.false;
      expect(tippyInstance?.state.isVisible).to.be.false;
    });

    await waitFor(() => {
      for (const input of multipleInputs) {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).to.be.false;
        expect(tippyInstance?.state.isVisible).to.be.false;
      }
    });

    destroy();
  });

  test('shows tippy if active element is input', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = vi.fn(() => mockErrors);
    const { form, validate } = createForm({
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
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.true;
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });
  });

  test('focuses first invalid input and shows tippy on submit', async () => {
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
    });
    formElement.appendChild(inputElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).toHaveFocus();
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.true;
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });
  });

  test('does not focus first invalid input and shows tippy on submit', async () => {
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
    formElement.appendChild(inputElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).not.toHaveFocus();
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.false;
    });
  });

  test('sets custom content', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = vi.fn(() => mockErrors);
    const { form, validate } = createForm({
      onSubmit: () => undefined,
      validate: mockValidate,
      extend: reporter({
        setContent: (messages) => {
          return messages?.map((message) => `<p>${message}</p>`).join('');
        },
      }),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.true;
      expect(tippyInstance?.popper).toHaveTextContent(
        `<p>${mockErrors.test}</p>`
      );
    });
  });

  test('sets custom props per field', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = vi.fn(() => mockErrors);
    type TestData = {
      test: string;
    };
    const { form, validate } = createForm<TestData>({
      onSubmit: vi.fn(),
      validate: mockValidate,
      extend: reporter<TestData>({
        tippyPropsMap: {
          test: {
            hideOnClick: false,
          },
        },
      }),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.true;
    });

    userEvent.click(formElement);
    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.true;
    });
  });

  test('ignores tippy', async () => {
    const { form } = createForm({
      onSubmit: () => undefined,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
    });
    inputElement.dataset.felteReporterTippyIgnore = '';
    formElement.appendChild(inputElement);

    form(formElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance).to.not.be.ok;
    });
  });

  test('show warning tippy on hover and hide on unhover', async () => {
    const mockWarnings = {
      test: 'A test warning',
      multiple: new Array(3).fill('A warning'),
    };
    const mockWarn = vi.fn(() => mockWarnings);
    const { form, validate } = createForm({
      onSubmit: vi.fn(),
      warn: mockWarn,
      extend: reporter({ level: 'warning' }),
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
    formElement.appendChild(inputElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    const { destroy } = form(formElement);

    await validate();

    expect(getTippy(inputElement)).to.be.ok;

    userEvent.hover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.true;
      expect(tippyInstance?.popper).toHaveTextContent(mockWarnings.test);
    });

    userEvent.unhover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.be.true;
      expect(tippyInstance?.state.isVisible).to.be.false;
    });

    for (const input of multipleInputs) {
      expect(getTippy(input)).to.be.ok;

      userEvent.hover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).to.be.true;
        expect(tippyInstance?.state.isVisible).to.be.true;
        expect(tippyInstance?.popper).toHaveTextContent(
          mockWarnings.multiple[0]
        );
      });

      userEvent.unhover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).to.be.true;
        expect(tippyInstance?.state.isVisible).to.be.false;
      });
    }

    mockWarn.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).to.not.be.ok;
      expect(tippyInstance?.state.isVisible).to.not.be.ok;
    });

    await waitFor(() => {
      for (const input of multipleInputs) {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).to.not.be.ok;
        expect(tippyInstance?.state.isVisible).to.not.be.ok;
      }
    });

    destroy();
  });
});
