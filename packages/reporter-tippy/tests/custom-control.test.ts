import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type { Instance, Props } from 'tippy.js';
import { createForm } from 'felte';
import { createDOM, cleanupDOM } from './common';
import reporter from '../src';

jest.mock('svelte', () => ({ onDestroy: jest.fn() }));

function getTippy(element: any): Instance<Props> | undefined {
  return element?._tippy;
}

type ContentEditableProps = {
  name?: string;
  id?: string;
};

function createContentEditableInput(props: ContentEditableProps = {}) {
  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.setAttribute('tabindex', '0');
  if (props.name) div.dataset.felteReporterTippyFor = props.name;
  if (props.id) div.id = props.id;
  return div;
}

describe('Reporter Tippy Custom Control', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('sets aria-invalid to input and removes if valid', async () => {
    type Data = {
      test: string;
      deep: {
        value: string;
      };
    };
    const mockErrors = { test: 'An error', deep: { value: 'Deep error' } };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm<Data>({
      initialValues: {
        test: '',
        deep: {
          value: '',
        },
      },
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditableInput({
      name: 'test',
    });
    const valueElement = createContentEditableInput({
      name: 'deep.value',
    });
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.appendChild(valueElement);
    formElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);

    form(formElement);

    await validate();

    await waitFor(() => {
      const inputInstance = getTippy(inputElement);
      expect(inputInstance?.popper).toHaveTextContent(mockErrors.test);
      expect(inputElement).toHaveAttribute('aria-invalid');
      const valueInstance = getTippy(valueElement);
      expect(valueInstance).toBeTruthy();
      expect(valueInstance?.popper).toHaveTextContent(mockErrors.deep.value);
      expect(valueElement).toHaveAttribute('aria-invalid');
    });

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      expect(inputElement).not.toHaveAttribute('aria-invalid');
      expect(valueElement).not.toHaveAttribute('aria-invalid');
    });
  });

  test('show tippy on hover and hide on unhover', async () => {
    const mockErrors = { test: 'A test error' };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm({
      initialValues: {
        test: '',
      },
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditableInput({
      name: 'test',
    });
    formElement.appendChild(inputElement);

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

    mockValidate.mockImplementation(() => ({} as any));

    await validate();

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeFalsy();
      expect(tippyInstance?.state.isVisible).toBeFalsy();
    });

    destroy();
  });

  test('shows tippy if active element is input', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm({
      initialValues: {
        test: '',
      },
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditableInput({
      name: 'test',
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
    type Data = {
      test: string;
      deep: {
        value: string;
      };
    };
    const mockErrors = { test: 'An error', deep: { value: 'Deep error' } };
    const mockValidate = jest.fn(() => mockErrors);
    const { form } = createForm<Data>({
      initialValues: {
        test: '',
        deep: {
          value: '',
        },
      },
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditableInput({
      name: 'test',
    });
    const valueElement = createContentEditableInput({
      name: 'deep.value',
    });
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.appendChild(valueElement);
    formElement.appendChild(fieldsetElement);
    formElement.appendChild(inputElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(valueElement).toHaveFocus();
      let tippyInstance = getTippy(valueElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.state.isVisible).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.deep.value);
      tippyInstance = getTippy(inputElement);
      expect(tippyInstance?.state.isEnabled).toBeTruthy();
      expect(tippyInstance?.popper).toHaveTextContent(mockErrors.test);
    });
  });

  test('sets custom content', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = jest.fn(() => mockErrors);
    const { form, validate } = createForm({
      initialValues: {
        test: '',
      },
      onSubmit: jest.fn(),
      validate: mockValidate,
      extend: reporter({
        setContent: (messages) => {
          return messages?.map((message) => `<p>${message}</p>`).join('');
        },
      }),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditableInput({
      name: 'test',
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
      initialValues: {
        test: '',
      },
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
    const inputElement = createContentEditableInput({
      name: 'test',
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

  test('handles mutation of DOM', async () => {
    const mockErrors = { test: 'An error' };
    const mockValidate = jest.fn(() => mockErrors);
    type TestData = {
      test: string;
    };
    const { form } = createForm<TestData>({
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
    const inputElement = createContentEditableInput({
      name: 'test',
      id: 'test',
    });

    expect(getTippy(inputElement)).toBeFalsy();

    form(formElement);

    formElement.appendChild(inputElement);

    await waitFor(() => {
      const tippyInstance = getTippy(inputElement);
      expect(tippyInstance).toBeTruthy();
    });
  });
});
