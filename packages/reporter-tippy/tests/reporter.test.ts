import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type { Instance, Props } from 'tippy.js';
import { createForm } from 'felte';
import {
  createDOM,
  cleanupDOM,
  createInputElement,
  createMultipleInputElements,
} from './common';
import reporter from '../src';

jest.mock('svelte', () => ({ onDestroy: jest.fn() }));

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
    formElement.appendChild(inputElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    form(formElement);

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
  });

  test('show tippy on hover and hide on unhover', async () => {
    const mockErrors = {
      test: 'A test error',
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
    formElement.appendChild(inputElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    const { destroy } = form(formElement);

    await validate();

    expect(getTippy(inputElement)).toBeTruthy();

    userEvent.hover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });

    userEvent.unhover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeFalsy();
    });

    for (const input of multipleInputs) {
      expect(getTippy(input)).toBeTruthy();

      userEvent.hover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).toBeTruthy();
        expect(tippyInstance?.state.isVisible).toBeTruthy();
        expect(tippyInstance?.popper).toHaveTextContent(mockErrors.multiple[0]);
      });

      userEvent.unhover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).toBeTruthy();
        expect(tippyInstance?.state.isVisible).toBeFalsy();
      });
    }

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeFalsy();
      expect(tippyInstance?.state.isVisible).toBeFalsy();
    });

    await waitFor(() => {
      for (const input of multipleInputs) {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).toBeFalsy();
        expect(tippyInstance?.state.isVisible).toBeFalsy();
      }
    });

    destroy();
  });

  test('shows tippy if active element is input', async () => {
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
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });
  });

  test('focuses first invalid input and shows tippy on submit', async () => {
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
    });
    formElement.appendChild(inputElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).toHaveFocus();
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });
  });

  test('sets custom content', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm({
      onSubmit: jest.fn(),
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
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(
        `<p>${mockErrors.test}</p>`
      );
    });
  });

  test('sets custom props per field', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = jest.fn(() => mockErrors);
    type TestData = {
      test: string;
    };
    const { form, validate } = createForm<TestData>({
      onSubmit: jest.fn(),
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
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
    });

    userEvent.click(formElement);
    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
    });
  });

  test('ignores tippy', async () => {
    const { form } = createForm({
      onSubmit: jest.fn(),
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
      expect(tippyInstance).toBeFalsy();
    });
  });

  test('show warning tippy on hover and hide on unhover', async () => {
    const mockWarnings = {
      test: 'A test warning',
      multiple: new Array(3).fill('A warning'),
    };
    const mockWarn = jest.fn(() => mockWarnings);
    const { form, validate } = createForm({
      onSubmit: jest.fn(),
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
    const multipleMessages = multipleInputs.map((el, index) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
      mes.setAttribute('data-felte-index', String(index));
      return mes;
    });
    formElement.appendChild(inputElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    const { destroy } = form(formElement);

    await validate();

    expect(getTippy(inputElement)).toBeTruthy();

    userEvent.hover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(mockWarnings.test);
    });

    userEvent.unhover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeFalsy();
    });

    for (const input of multipleInputs) {
      expect(getTippy(input)).toBeTruthy();

      userEvent.hover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).toBeTruthy();
        expect(tippyInstance?.state.isVisible).toBeTruthy();
        expect(tippyInstance?.popper).toHaveTextContent(
          mockWarnings.multiple[0]
        );
      });

      userEvent.unhover(input);

      await waitFor(() => {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).toBeTruthy();
        expect(tippyInstance?.state.isVisible).toBeFalsy();
      });
    }

    mockWarn.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeFalsy();
      expect(tippyInstance?.state.isVisible).toBeFalsy();
    });

    await waitFor(() => {
      for (const input of multipleInputs) {
        const tippyInstance = getTippy(input);
        expect(tippyInstance?.state.isEnabled).toBeFalsy();
        expect(tippyInstance?.state.isVisible).toBeFalsy();
      }
    });

    destroy();
  });
});
