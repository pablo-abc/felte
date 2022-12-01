import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { Instance, Props } from 'tippy.js';
import {
  createForm,
  createDOM,
  cleanupDOM,
  createInputElement,
} from './common';
import { screen, waitFor } from '@testing-library/dom';
import reporter from '../src';

expect.extend(matchers);

function getTippy(element: any): Instance<Props> | undefined {
  return element?._tippy;
}

describe('Reporter Tippy Custom Position', () => {
  beforeEach(createDOM);
  afterEach(cleanupDOM);

  test('sets aria-invalid to input and removes if valid', async () => {
    const mockErrors = { test: 'An error' };
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    form(formElement);

    await validate();

    await waitFor(() => {
      expect(inputElement).toBeInvalid();
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(inputElement).not.toBeInvalid();
    });
  });

  test('show tippy on hover and hide on unhover', async () => {
    const mockErrors = { test: 'A test error' };
    const mockValidate = vi.fn().mockImplementation(() => mockErrors);
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    const { destroy } = form(formElement);

    await validate();

    expect(getTippy(labelElement)).to.be.ok;

    userEvent.hover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).to.be.ok;
      expect(tippyInstance?.state.isVisible).to.be.ok;
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });

    userEvent.unhover(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).to.be.ok;
      expect(tippyInstance?.state.isVisible).to.not.be.ok;
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).to.not.be.ok;
      expect(tippyInstance?.state.isVisible).to.not.be.ok;
    });

    destroy();
  });

  test('shows tippy if active element is input', async () => {
    const mockErrors = { test: 'An error' };
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
      expect(tippyInstance?.state.isEnabled).to.be.ok;
      expect(tippyInstance?.state.isVisible).to.be.ok;
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });
  });

  test('focuses first invalid input and shows tippy on submit', async () => {
    const mockErrors = { test: 'A test error' };
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form } = createForm({
      onSubmit: vi.fn(),
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
      expect(tippyInstance?.state.isEnabled).to.be.ok;
      expect(tippyInstance?.state.isVisible).to.be.ok;
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });
  });

  test('sets custom content', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { form, validate } = createForm({
      onSubmit: vi.fn(),
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
      expect(tippyInstance?.state.isEnabled).to.be.ok;
      expect(tippyInstance?.state.isVisible).to.be.ok;
      expect(tippyInstance?.popper).toHaveTextContent(
        `<p>${mockErrors.test}</p>`
      );
    });
  });

  test('sets custom props per field', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
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
    const labelElement = document.createElement('label');
    labelElement.dataset.felteReporterTippyPositionFor = 'test';
    formElement.appendChild(labelElement);
    formElement.appendChild(inputElement);

    inputElement.focus();

    form(formElement);

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).to.be.ok;
      expect(tippyInstance?.state.isVisible).to.be.ok;
    });

    userEvent.click(formElement);
    await waitFor(() => {
      const tippyInstance = getTippy(labelElement);
      expect(tippyInstance?.state.isEnabled).to.be.ok;
      expect(tippyInstance?.state.isVisible).to.be.ok;
    });
  });

  test('ignores tippy', async () => {
    const { form } = createForm({
      onSubmit: vi.fn(),
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
      expect(tippyInstance).to.not.be.ok;
    });
  });

  test('shows custom position properly on nested forms', async () => {
    const { form } = createForm({
      onSubmit: vi.fn(),
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
      expect(getTippy(labelElement)).to.be.ok;
      expect(getTippy(inputElement)).to.not.be.ok;
    });
  });
});
