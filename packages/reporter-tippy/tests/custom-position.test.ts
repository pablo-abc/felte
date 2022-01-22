import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type { Instance, Props } from 'tippy.js';
import { createForm } from 'felte';
import { createDOM, cleanupDOM, createInputElement } from './common';
import reporter from '../src';

jest.mock('svelte', () => ({ onDestroy: jest.fn() }));

function getTippy(element: any): Instance<Props> | undefined {
  return element?._tippy;
}

describe('Reporter Tippy Custom Position', () => {
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
    });
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    form(formElement);

    await validate();

    await waitFor(() => {
      expect(inputElement).toHaveAttribute('aria-invalid');
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(inputElement).not.toHaveAttribute('aria-invalid');
    });
  });

  test('show tippy on hover and hide on unhover', async () => {
    const mockErrors = { test: 'A test error' };
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    const { destroy } = form(formElement);

    await validate();

    expect(getTippy(labelElement)).toBeTruthy();

    userEvent.hover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });

    userEvent.unhover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeFalsy();
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).toBeFalsy();
      expect(tippyInstance?.state.isVisible).toBeFalsy();
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).toHaveFocus();
      const tippyInstance = getTippy(labelElement);
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
    });

    userEvent.click(formElement);
    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    form(formElement);

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance).toBeFalsy();
    });
  });

  test('shows custom position properly on nested forms', async () => {
    const { form } = createForm({
      onSubmit: jest.fn(),
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'group.test',
      type: 'text',
      id: 'group-test',
    });
    const fieldsetElement = document.createElement('fieldset');
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'group.test';
    labelElement.htmlFor = 'group-test';
    fieldsetElement.appendChild(labelElement);
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);

    form(formElement);

    await waitFor(() => {
      expect(getTippy(labelElement)).toBeTruthy();
      expect(getTippy(inputElement)).toBeFalsy();
    });
  });
});
